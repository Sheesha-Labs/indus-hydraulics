import 'server-only'

import { db } from '@indus/db'
import { ENQUIRY_EMAIL_TO, ENQUIRY_RECIPIENTS } from '@indus/domain'
import { renderEnquiryReceived, sendEmail, type EnquiryReceivedProps } from '@indus/email'
import { loadEmailBranding } from './email-branding'

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
 * Never throws. Callers record the enquiry first; a mail failure must not cost
 * them the record, and a failed send still leaves a SentEmail row the retry
 * cron picks up.
 */

export const CC_CAP_PER_DAY = 3

export const ENQUIRY_NEXT_STEP = 'An engineer on our export desk will reply to this email, usually within 4 business hours.'

export type EnquiryEmailInput = Omit<EnquiryReceivedProps, 'branding' | 'nextStep'> & {
  nextStep?: string
  rfqId?: string
}

export async function sendEnquiryEmail(input: EnquiryEmailInput): Promise<boolean> {
  try {
    const { rfqId, nextStep, ...props } = input
    const [branding, ccAllowed] = await Promise.all([loadEmailBranding(), ccUnderCap(props.senderEmail)])
    const mail = renderEnquiryReceived({
      ...props,
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
