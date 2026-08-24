'use server'

import { z } from 'zod'
import { db, nextRfqCode } from '@indus/db'
import { MANUFACTURING_ENQUIRY, signQuoteAccessToken, splitContactName } from '@indus/domain'
import {
  allowedChoice,
  attachmentMediaKind,
  readAttachments,
  rejectAsBot,
} from '../../../lib/designed-enquiry'
import { resolveOrCreateAnonymousContact, sendRfqEmails } from '../../../lib/rfq-intake'
import { STORAGE_BUCKETS } from '../../../lib/supabase-admin'

/**
 * Lead capture on `/manufacturing`.
 *
 * WHY THIS IS ITS OWN ACTION rather than a widened `submitIndustryEnquiry`.
 * The two forms ask different questions of different people: an industry
 * enquiry names an APPLICATION — which part of a cooling system the parts are
 * for — and a manufacturing enquiry names a PROCESS ROUTE — how the part should
 * be made. Merging them would mean one schema with two mutually-exclusive
 * optional fields and a context block that branches on which one arrived, which
 * is more coupling than the ~40 lines it would save. What the two genuinely
 * share — the bot floor, the attachment manifest, the media-kind mapping — is
 * in `lib/designed-enquiry.ts` and imported by both.
 *
 * As with the other enquiry forms, the RFQ lands with ZERO lines. `RfqLine`
 * requires a `productId`, and this buyer is sending a drawing, not SKUs, so the
 * description goes in `customerMessage`. Everything downstream — the admin
 * queue, the signed customer tracking link, both emails — already handles
 * `lineCount: 0` because that is a real state a made-to-order enquiry is in.
 */

type SubmitResult =
  | { success: true; code: string; token: string }
  | { success: false; error: string }

const EnquirySchema = z.object({
  company: z.string().trim().min(1, 'a company name').max(200),
  contactName: z.string().trim().min(1, 'a contact name').max(200),
  email: z.string().trim().toLowerCase().email('a valid work email').max(254),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  route: z.string().trim().max(120).optional().or(z.literal('')),
  description: z.string().trim().max(8000).optional().or(z.literal('')),
})

export async function submitManufacturingEnquiry(formData: FormData): Promise<SubmitResult> {
  const botRejection = rejectAsBot(formData)
  if (botRejection) return { success: false, error: botRejection }

  const parsed = EnquirySchema.safeParse({
    company: formData.get('company'),
    contactName: formData.get('contactName'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    route: formData.get('route') ?? '',
    description: formData.get('description') ?? '',
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { success: false, error: `Please check the form — we need ${issue?.message ?? 'the missing details'}.` }
  }

  const input = parsed.data
  const enquiry = MANUFACTURING_ENQUIRY
  const route = allowedChoice(input.route, enquiry.choices)

  if (formData.get('attachmentsPending') === '1') {
    return { success: false, error: 'An attachment is still uploading. Give it a moment and try again.' }
  }

  const attachments = readAttachments(formData.get('attachments'))

  /*
    Something has to describe the part. This page's whole argument is "send the
    drawing", so an enquiry carrying neither a description nor a file is one the
    desk cannot quote — and the round trip to ask for it is one the form could
    have saved.
  */
  if (!input.description && attachments.length === 0) {
    return {
      success: false,
      error:
        'Tell us what to make — material grade, size, thread form and quantity — or attach a drawing or sample photo.',
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

  const subject = `${enquiry.pageName} enquiry`
  /*
    The page and the process route are written into `applicationContext` rather
    than appended to the message body, so a manufacturing enquiry is separable
    from a catalogue RFQ and from a data-centre one without a schema change.
  */
  const applicationContext = [
    `Page: ${enquiry.pageName} (${enquiry.path})`,
    `${enquiry.choiceLabel}: ${route || 'not stated'}`,
    'Source: manufacturing page enquiry form',
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
        // No urgency question on this page — a made-to-drawing enquiry is a
        // considered one, not a breakdown. `routine` is the column default and
        // is what the desk sorts the queue by.
        urgency: 'routine',
        // The page quotes in AED or USD and does not ask which. AED is the
        // store default; the desk confirms the currency when it replies.
        currency: 'AED',
        customerMessage: input.description || null,
        internalNotes: enquiry.internalNote,
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
          page: enquiry.key,
          processRoute: route || null,
          source: 'manufacturing_page_enquiry',
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
      urgency: 'routine',
      lineCount: 0,
      subject,
      customerMessage: input.description || null,
      contactId,
      accountId,
      shipToAddressId: null,
    })
  } catch (err) {
    console.error('[submitManufacturingEnquiry] email send error', err)
  }

  /*
    No redirect. The reader is thousands of pixels down a page they scrolled
    through to get here; navigating away and asking them to come back is how a
    conversion becomes a bounce. The card replaces itself with a confirmation
    carrying the signed tracking link.
  */
  return { success: true, code: rfq.code, token: signQuoteAccessToken(rfq.code) }
}
