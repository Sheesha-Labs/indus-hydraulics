'use server'

import { z } from 'zod'
import { db, nextRfqCode } from '@indus/db'
import { QUALITY_CONTROL_ENQUIRY, signQuoteAccessToken, splitContactName } from '@indus/domain'
import {
  allowedChoice,
  attachmentMediaKind,
  readAttachments,
  rejectAsBot,
} from '../../../lib/designed-enquiry'
import { resolveOrCreateAnonymousContact, sendRfqEmails } from '../../../lib/rfq-intake'
import { STORAGE_BUCKETS } from '../../../lib/supabase-admin'

/**
 * Lead capture on `/quality-control`.
 *
 * The third of the designed-page enquiry actions, and separate from the other
 * two for the same reason they are separate from each other: the question each
 * page asks is different. The industry page asks for an APPLICATION, the
 * manufacturing page for a PROCESS ROUTE, this one for the DOCUMENTS the
 * buyer's specification demands. One merged schema would carry three
 * mutually-exclusive optional fields and a context block branching on which
 * arrived.
 *
 * Everything genuinely common — the bot floor, the attachment manifest
 * validator, the media-kind mapping, the allow-listed choice — is imported from
 * `lib/designed-enquiry`.
 *
 * As with its siblings the RFQ lands with ZERO lines: this buyer is sending a
 * specification, not SKUs, so the scope goes in `customerMessage`.
 */

type SubmitResult =
  | { success: true; code: string; token: string }
  | { success: false; error: string }

const EnquirySchema = z.object({
  company: z.string().trim().min(1, 'a company name').max(200),
  contactName: z.string().trim().min(1, 'a contact name').max(200),
  email: z.string().trim().toLowerCase().email('a valid work email').max(254),
  phone: z.string().trim().max(32).optional().or(z.literal('')),
  documents: z.string().trim().max(120).optional().or(z.literal('')),
  scope: z.string().trim().max(8000).optional().or(z.literal('')),
})

export async function submitQualityControlEnquiry(formData: FormData): Promise<SubmitResult> {
  const botRejection = rejectAsBot(formData)
  if (botRejection) return { success: false, error: botRejection }

  const parsed = EnquirySchema.safeParse({
    company: formData.get('company'),
    contactName: formData.get('contactName'),
    email: formData.get('email'),
    phone: formData.get('phone') ?? '',
    documents: formData.get('documents') ?? '',
    scope: formData.get('scope') ?? '',
  })

  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return { success: false, error: `Please check the form — we need ${issue?.message ?? 'the missing details'}.` }
  }

  const input = parsed.data
  const enquiry = QUALITY_CONTROL_ENQUIRY
  const documents = allowedChoice(input.documents, enquiry.choices)

  if (formData.get('attachmentsPending') === '1') {
    return { success: false, error: 'An attachment is still uploading. Give it a moment and try again.' }
  }

  const attachments = readAttachments(formData.get('attachments'))

  /*
    Something has to state what must be proven. An inspection enquiry with
    neither a written scope nor an attached specification is one the desk
    cannot answer — it would have to write back asking the question the form
    was there to ask.
  */
  if (!input.scope && attachments.length === 0) {
    return {
      success: false,
      error:
        'Tell us what has to be proven — standard, material grade and the tests required — or attach the specification.',
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
  const applicationContext = [
    `Page: ${enquiry.pageName} (${enquiry.path})`,
    `${enquiry.choiceLabel}: ${documents || 'not stated'}`,
    'Source: quality-control page enquiry form',
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
        // No urgency question on this page — agreeing an inspection scope is
        // planning work, not a breakdown. `routine` is the column default.
        urgency: 'routine',
        currency: 'AED',
        customerMessage: input.scope || null,
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
          documents: documents || null,
          source: 'quality_control_page_enquiry',
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
      customerMessage: input.scope || null,
      contactId,
      accountId,
      shipToAddressId: null,
    })
  } catch (err) {
    console.error('[submitQualityControlEnquiry] email send error', err)
  }

  return { success: true, code: rfq.code, token: signQuoteAccessToken(rfq.code) }
}
