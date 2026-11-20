import 'server-only'

import { db } from '@indus/db'
import { ENQUIRY_EMAIL_TO, ENQUIRY_RECIPIENTS, enquiryAttachmentFilename } from '@indus/domain'
import { renderEnquiryReceived, sendEmail, type EmailAttachment, type EnquiryReceivedProps } from '@indus/email'
import { loadEmailBranding } from './email-branding'
import { STORAGE_BUCKETS, supabaseAdmin } from './supabase-admin'

/**
 * Send the enquiry email every storefront form sends: to sales@ and purchase@,
 * the submitter in CC, so one message is the desk's alert and the buyer's
 * instant record.
 *
 * THE CC CAP. A form that mails a copy of free text to whatever address is
 * typed can be used to send mail to strangers in our name. Honeypot and timing
 * checks stop casual bots; this stops a person. An address that has already
 * been copied `CC_CAP_PER_DAY` times in 24 hours is left out of the CC — the
 * desk still gets the enquiry, and the buyer already has several records.
 *
 * ATTACHMENTS. Files the visitor uploaded with the form are fetched from the
 * private documents bucket and attached, in upload order, up to
 * ATTACHMENT_BUDGET_BYTES in total. Mail providers refuse a message much over
 * 40MB once base64 is added, and the forms allow six files of 25MB each, so a
 * file that would overflow the budget is left off and named in the email
 * instead. It is still on the RFQ in /admin/enquiries.
 *
 * Never throws. Callers record the enquiry first; a mail failure must not cost
 * them the record, and a failed send still leaves a SentEmail row the retry
 * cron picks up.
 */

export const CC_CAP_PER_DAY = 3

/** Raw bytes attached to one email. Base64 adds a third, which keeps it under the ~40MB provider limit. */
export const ATTACHMENT_BUDGET_BYTES = 25 * 1024 * 1024

/** A file the visitor uploaded: its key in the documents bucket, their filename, its type. */
export type EnquiryFile = { path: string; label: string; contentType: string }

export const ENQUIRY_NEXT_STEP = 'An engineer on our export desk will reply to this email, usually within 4 business hours.'

export type EnquiryEmailInput = Omit<EnquiryReceivedProps, 'branding' | 'nextStep' | 'notAttached'> & {
  nextStep?: string
  rfqId?: string
  /** Uploaded files to attach (see ATTACHMENTS above). */
  files?: readonly EnquiryFile[]
}

export async function sendEnquiryEmail(input: EnquiryEmailInput): Promise<boolean> {
  try {
    const { rfqId, nextStep, files, ...props } = input
    const [branding, ccAllowed, attached] = await Promise.all([
      loadEmailBranding(),
      ccUnderCap(props.senderEmail),
      loadAttachments(files ?? []),
    ])
    const mail = renderEnquiryReceived({
      ...props,
      notAttached: attached.left,
      nextStep: nextStep ?? ENQUIRY_NEXT_STEP,
      branding: {
        legalName: branding.legalName,
        vatTrn: branding.vatTrn,
        registeredAddressLines: branding.registeredAddressLines,
      },
    })
    const result = await sendEmail({
      kind: 'enquiry_received',
      to: [...ENQUIRY_RECIPIENTS],
      cc: ccAllowed ? [props.senderEmail] : [],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      fromEmail: branding.fromEmail,
      ...(branding.fromName ? { fromName: branding.fromName } : {}),
      // The buyer's "Reply" reaches sales; the desk uses "Reply all", which
      // includes the buyer from the CC line.
      replyTo: ENQUIRY_EMAIL_TO,
      ...(attached.files.length > 0 ? { attachments: attached.files } : {}),
      ...(rfqId ? { rfqId } : {}),
    })
    return result.ok
  } catch (err) {
    console.error('[sendEnquiryEmail] failed', err)
    return false
  }
}

/** True when this address has been copied fewer than CC_CAP_PER_DAY times in 24 hours. */
async function ccUnderCap(email: string): Promise<boolean> {
  try {
    const recent = await db.sentEmail.count({
      where: {
        kind: 'enquiry_received',
        attemptedAt: { gte: new Date(Date.now() - 86_400_000) },
        ccEmails: { array_contains: [email] },
      },
    })
    return recent < CC_CAP_PER_DAY
  } catch (err) {
    // A failed count must not cost the buyer their copy.
    console.error('[sendEnquiryEmail] cc cap count failed', err)
    return true
  }
}

/**
 * Download the uploaded files and pick those that fit the budget, in order.
 * A file that fails to download is named in `left` like an oversized one —
 * the email still goes, and the file is still on the RFQ.
 */
async function loadAttachments(files: readonly EnquiryFile[]): Promise<{ files: EmailAttachment[]; left: string[] }> {
  const out: EmailAttachment[] = []
  const left: string[] = []
  if (files.length === 0) return { files: out, left }

  const bucket = supabaseAdmin().storage.from(STORAGE_BUCKETS.documents)
  const downloaded = await Promise.all(
    files.map(async (file) => {
      try {
        const { data, error } = await bucket.download(file.path)
        if (error || !data) throw error ?? new Error('empty download')
        return { file, content: Buffer.from(await data.arrayBuffer()) }
      } catch (err) {
        console.error('[sendEnquiryEmail] attachment download failed', file.path, err)
        return { file, content: null }
      }
    }),
  )

  let used = 0
  for (const { file, content } of downloaded) {
    const filename = enquiryAttachmentFilename(file)
    if (!content || used + content.byteLength > ATTACHMENT_BUDGET_BYTES) {
      left.push(filename)
      continue
    }
    used += content.byteLength
    out.push({ filename, content, contentType: file.contentType })
  }
  return { files: out, left }
}
