'use server'

import { z } from 'zod'
import { db, nextRfqCode } from '@indus/db'
import { designedIndustryPage, signQuoteAccessToken, splitContactName } from '@indus/domain'
import {
  allowedChoice,
  attachmentMediaKind,
  readAttachments,
  rejectAsBot,
} from '../../../lib/designed-enquiry'
import { resolveOrCreateAnonymousContact } from '../../../lib/rfq-intake'
import { sendEnquiryEmail } from '../../../lib/enquiry-email'
import { urlFor } from '../../../lib/seo'
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
  const botRejection = rejectAsBot(formData)
  if (botRejection) return { success: false, error: botRejection }

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

  const application = allowedChoice(input.application, page.review.applications)

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
          kind: attachmentMediaKind(file.contentType),
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

  // The RFQ is committed. The email never throws, so it cannot undo it.
  await sendEnquiryEmail({
    rfqId: rfq.id,
    reference: rfq.code,
    formLabel: `${page.card.name} enquiry`,
    senderName: input.contactName,
    senderEmail: input.email,
    company: input.company,
    details: [
      ['Phone', input.phone],
      ['Application', application],
    ],
    message: input.description || null,
    attachmentCount: attachments.length,
    files: attachments,
    pageUrl: urlFor(`/industries/${page.slug}`),
  })

  /*
    No redirect. The reader is thousands of pixels down a page they scrolled
    through to get here; navigating away and asking them to come back is how a
    conversion becomes a bounce. The card replaces itself with a confirmation
    carrying the signed tracking link.
  */
  return { success: true, code: rfq.code, token: signQuoteAccessToken(rfq.code) }
}
