import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type QuoteExpiredProps = {
  customerName: string
  /** Document number, e.g. "INDUS/Q26387". */
  quoteCode: string
  /** Optional revision suffix, e.g. "R2". */
  revisionLabel?: string
  /** Expiry date, formatted (e.g. "24 May 2026"). */
  expiredOnDisplay: string
  /** Signed link back to /quote/[code] so the recipient can request a re-quote. */
  rfqUrl: string
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

export function renderQuoteExpired(
  props: QuoteExpiredProps,
): { subject: string; html: string } {
  const codeDisplay = props.revisionLabel
    ? `${props.quoteCode} ${props.revisionLabel}`
    : props.quoteCode

  const subject = `Quotation ${codeDisplay} has expired`

  const body = `
<p style="margin:0 0 16px 0;">Dear ${escapeHtml(props.customerName)},</p>

<p style="margin:0 0 16px 0;">Quotation <b>${escapeHtml(
    codeDisplay,
  )}</b> reached its validity end date on <b>${escapeHtml(
    props.expiredOnDisplay,
  )}</b> and has now expired.</p>

<p style="margin:0 0 16px 0;">If you&rsquo;d still like to proceed, just reply to this email and we&rsquo;ll be glad to issue a fresh quotation. Lead times and pricing are re-checked against current stock and supplier rates, so a re-quote may differ slightly from the previous one.</p>

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(
    props.rfqUrl,
  )}" style="display:inline-block;background:${BRAND.accent};color:${BRAND.white};padding:10px 18px;text-decoration:none;font-weight:500;">
    View the original request
  </a>
</p>
`

  return {
    subject,
    html: renderLayout({
      title: subject,
      preheader: `Quotation ${codeDisplay} expired on ${props.expiredOnDisplay}`,
      bodyHtml: body,
      ...props.branding,
    }),
  }
}
