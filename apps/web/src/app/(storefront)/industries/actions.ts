'use server'

import { z } from 'zod'
import { db, nextRfqCode } from '@indus/db'
import { designedIndustryPage, signQuoteAccessToken, splitContactName } from '@indus/domain'
import { resolveOrCreateAnonymousContact, sendRfqEmails } from '../../../lib/rfq-intake'
import { STORAGE_BUCKETS } from '../../../lib/supabase-admin'

/**
 * Lead capture on a designed industry page.
 *
 * WHY THIS IS NOT `submitMarketEnquiry`. That action's whole subject is a
 * destination: it resolves a market slug or takes a typed country, sets the
 * quoting currency from the market record and writes an Incoterm and a
 * delivery city. An industry enquiry has none of those. What it has instead is
 * an APPLICATION — which part of the cooling system the parts are for — and
 * that is the single field the desk needs to route the enquiry to the right
 * engineer. Bolting it onto the market action would mean two sets of
 * mutually-exclusive optional fields in one schema.
 *
 * WHY IT IS NOT `submitRfq` either: same reason the market action is not.
 * `RfqLine` requires a `productId`, and this buyer is sending a drawing, not
 * SKUs. The enquiry lands with zero lines and the description in
 * `customerMessage`, which is a state the admin queue, the signed customer
 * tracking link and both emails already handle.
 *
 * The industry slug is written into `applicationContext` so data-centre
 * enquiries are separable from general RFQs in the queue without a schema
 * change — the handoff asks for exactly that.
 */

type SubmitResult =
  | { success: true; code: string; token: string }
  | { success: false; error: string }

/**
 * Anti-spam floor, matching the market forms. A rejection cannot answer
 * "success" here: the form renders the returned reference, and a fabricated
 * one is worse for a real person who trips the check than a plain retry is for
 * a bot.
 */
const MIN_FORM_DURATION_MS = 1500

/** Matches only the paths /api/rfq/attachments/sign generates. */
const ATTACHMENT_PATH = /^rfq-attachments\/\d{4}-\d{2}-\d{2}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/

const EnquirySchema = z.object({
  industrySlug: z.string().trim().min(1).max(80),
  company: z.string().trim().min(1, 'a company name').max(200),
  contactName: z.string().trim().min(1, 'a contact name').max(200),
  email: z.string().trim().toLowerCase().email('a valid work email').max(254),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  application: z.string().trim().max(120).optional().or(z.literal('')),
  description: z.string().trim().max(8000).optional().or(z.literal('')),
})

export async function submitIndustryEnquiry(formData: FormData): Promise<SubmitResult> {
  // Honeypot — a real browser never populates an off-screen field with no
  // label. The reply stays vague and offers the email fallback, so a person who
  // somehow trips it still has a way through.
  const honeypot = formData.get('website')
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return {
      success: false,
      error: 'Something went wrong. Email sales@indushydraulics.me and we will pick it up.',
    }
  }

  const startedAtRaw = formData.get('formStartedAt')
  const startedAt = typeof startedAtRaw === 'string' ? Number(startedAtRaw) : Number.NaN
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FORM_DURATION_MS) {
    return { success: false, error: 'That was quick — give the form a moment and try again.' }
  }

  const parsed = EnquirySchema.safeParse({
    industrySlug: formData.get('industrySlug'),
    company: formData.get('company'),
    contactName: formData.get('contactName'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    application: formData.get('application') ?? '',
    description: formData.get('description') ?? '',
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { success: false, error: `Please check the form — we need ${issue?.message ?? 'the missing details'}.` }
  }

  const input = parsed.data

  /*
    The slug must resolve against the designed-page registry. It came from a
    rendered page, so a miss means the page was retired mid-session — and an
    enquiry recorded against a page that no longer exists is one the desk
    cannot put in context.
  */
  const page = designedIndustryPage(input.industrySlug)
  if (!page) {
    return { success: false, error: 'That page is no longer listed. Email sales@indushydraulics.me.' }
  }

  // Only an option the page actually offered. A typed value is dropped rather
  // than recorded, so the desk never reads a routing hint the form did not
  // produce.
  const application = page.review.applications.includes(input.application ?? '')
    ? (input.application as string)
    : ''

  if (formData.get('attachmentsPending') === '1') {
    return { success: false, error: 'An attachment is still uploading. Give it a moment and try again.' }
  }

  const attachments = readAttachments(formData.get('attachments'))

  /*
    Something has to describe what is wanted. This page's entire argument is
    "send the drawing", so an enquiry with neither a description nor a file
    attached is one the desk cannot act on — and the round trip to ask is a
    round trip the form could have saved.
  */
  if (!input.description && attachments.length === 0) {
    return {
      success: false,
      error: 'Tell us what you need — material, sizes, end connections and quantity — or attach a drawing or BOM.',
    }
  }

  const { firstName, lastName } = splitContactName(input.contactName)
  const { accountId, contactId } = await resolveOrCreateAnonymousContact({
    firstName,
    lastName,
    email: input.email,
    ...(input.phone ? { phone: input.phone } : {}),
    company: input.company,
  })

  const subject = `${page.card.name} enquiry`
  const applicationContext = [
    `Industry page: ${page.card.name} (/industries/${page.slug})`,
    application ? `Application: ${application}` : 'Application: not stated',
    'Source: industry page enquiry form',
  ].join('\n')

  const rfq = await db.$transaction(async (tx) => {
    const code = await nextRfqCode(tx)
    const created = await tx.rfq.create({
      data: {
        code,
        accountId,
        submittedByContactId: contactId,
        subject,
        applicationContext,
        // The page quotes in AED or USD and does not ask which. AED is the
        // store default; the desk confirms the currency when it replies.
        currency: 'AED',
        customerMessage: input.description || null,
        internalNotes:
          'Submitted from the data-centre liquid-cooling page — drawing-based stainless scope, verify contact details before fulfilment.',
        status: 'submitted',
        submittedAt: new Date(),
      },
    })

    for (const file of attachments) {
      const media = await tx.media.create({
        data: {
          kind: file.contentType.startsWith('image/')
            ? 'image'
            : file.contentType === 'application/pdf'
              ? 'document'
              : 'cad',
          // Bucket-PREFIXED, matching uploadToStorage's convention for private
          // buckets — signedUrlFor() splits on the first slash to recover the
          // bucket. A bare object key makes the attachment unreadable.
          storagePath: `${STORAGE_BUCKETS.documents}/${file.path}`,
          originalFilename: file.label,
          mimeType: file.contentType,
          bytes: file.size,
        },
      })
      await tx.rfqAttachment.create({
        data: { rfqId: created.id, mediaId: media.id, uploaderType: 'contact', uploaderId: contactId },
      })
    }

    await tx.accountActivity.create({
      data: {
        accountId,
        actorType: 'contact',
        actorId: contactId,
        verb: 'submitted_rfq',
        payload: {
          rfqId: created.id,
          code: created.code,
          anonymous: true,
          attachmentCount: attachments.length,
          industry: page.slug,
          application: application || null,
          source: 'industry_page_enquiry',
        },
      },
    })

    return created
  })

  // The RFQ is committed. A mail failure must not undo it, or lose it.
  try {
    await sendRfqEmails({
      rfqId: rfq.id,
      rfqCode: rfq.code,
      // No urgency question on this page — a project enquiry that comes with a
      // drawing is a considered one, not a breakdown. `routine` is the column
      // default and is what the desk sorts the queue by.
      urgency: 'routine',
      lineCount: 0,
      subject,
      customerMessage: input.description || null,
      contactId,
      accountId,
      shipToAddressId: null,
    })
  } catch (err) {
    console.error('[submitIndustryEnquiry] email send error', err)
  }

  /*
    No redirect. The reader is thousands of pixels down a page they scrolled
    through to get here; navigating away and asking them to come back is how a
    conversion becomes a bounce. The card replaces itself with a confirmation
    carrying the signed tracking link.
  */
  return { success: true, code: rfq.code, token: signQuoteAccessToken(rfq.code) }
}

/**
 * Attachments arrive as a manifest of storage paths, never as bytes — the
 * browser uploaded them straight to the private documents bucket against a
 * single-use signed URL. Everything here is still untrusted: the path must
 * match the shape the server generates, so a caller cannot point an
 * RfqAttachment at an arbitrary object elsewhere in the bucket.
 */
function readAttachments(
  raw: FormDataEntryValue | null
): Array<{ path: string; label: string; size: number; contentType: string }> {
  if (typeof raw !== 'string' || !raw.trim() || raw === '[]') return []
  const out: Array<{ path: string; label: string; size: number; contentType: string }> = []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    for (const entry of parsed.slice(0, 6)) {
      if (!entry || typeof entry !== 'object') continue
      const { path, label, size, contentType } = entry as Record<string, unknown>
      if (typeof path !== 'string' || !ATTACHMENT_PATH.test(path)) continue
      out.push({
        path,
        label: typeof label === 'string' ? label.slice(0, 180) : 'attachment',
        size: typeof size === 'number' && Number.isFinite(size) ? size : 0,
        contentType: typeof contentType === 'string' ? contentType.slice(0, 120) : 'application/octet-stream',
      })
    }
  } catch {
    // A malformed manifest loses the attachments but must never lose the
    // enquiry — the enquiry is what matters commercially.
  }
  return out
}
