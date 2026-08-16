import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type QuoteExpiryReminderProps = {
  customerName: string
  /** Document number, e.g. "INDUS/Q26387". */
  quoteCode: string
  /** Optional revision suffix, e.g. "R2". */
  revisionLabel?: string
  /** Expiry date, formatted (e.g. "24 May 2026"). */
  expiresOnDisplay: string
  /** Whole days from "now" to expiry, clamped at 0 (= today). */
  daysLeft: number
  /** Signed link back to /quote/[code]?token=... so the recipient can view + download. */
  viewUrl: string
  branding: Pick<
    LayoutInput,
    | 'legalName'
    | 'vatTrn'
    | 'registeredAddressLines'
    | 'signatureName'
    | 'signatureTitle'
    | 'signaturePhone'
    | 'signatureEmail'
  >
}

export function renderQuoteExpiryReminder(
  props: QuoteExpiryReminderProps,
): { subject: string; html: string } {
  const codeDisplay = props.revisionLabel
    ? `${props.quoteCode} ${props.revisionLabel}`
    : props.quoteCode

  const expiryPhrase =
    props.daysLeft === 0
      ? 'today'
      : `in ${props.daysLeft} day${props.daysLeft !== 1 ? 's' : ''}`

  const subject = `Reminder: Quotation ${codeDisplay} expires ${expiryPhrase}`

  const body = `
<p style="margin:0 0 16px 0;">Dear ${escapeHtml(props.customerName)},</p>

<p style="margin:0 0 16px 0;">A quick reminder that quotation <b>${escapeHtml(
    codeDisplay,
  )}</b> is set to expire on <b>${escapeHtml(
    props.expiresOnDisplay,
  )}</b>${
    props.daysLeft === 0
      ? ' &mdash; that&rsquo;s today.'
      : ` &mdash; that&rsquo;s ${escapeHtml(expiryPhrase)}.`
  }</p>

<p style="margin:0 0 16px 0;">If you&rsquo;d like to proceed, just reply to this email. We can also extend the validity if you need more time, or revise the quote if anything in your requirement has changed.</p>

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(
    props.viewUrl,
  )}" style="display:inline-block;background:${BRAND.accent};color:${BRAND.white};padding:10px 18px;text-decoration:none;font-weight:500;">
    View the quotation online
  </a>
</p>
`

  return {
    subject,
    html: renderLayout({
      title: subject,
      preheader: `Quotation ${codeDisplay} expires ${props.expiresOnDisplay}`,
      bodyHtml: body,
      ...props.branding,
    }),
  }
}
