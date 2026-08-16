import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type QuoteSentProps = {
  customerName: string
  /** Document number, e.g. "INDUS/Q26387" */
  quoteCode: string
  /** Optional revision suffix, e.g. "R2" */
  revisionLabel?: string
  /** Total in formatted currency, e.g. "AED 35,250.00" */
  totalDisplay: string
  /** Quote validity end date, formatted (e.g. "24 May 2026") */
  expiresOnDisplay: string
  paymentTerms: string
  /** Optional engineer-written intro that prepends the body */
  engineerMessage?: string | null
  /** Optional view link to /quote/[code] */
  viewUrl?: string
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

export function renderQuoteSent(props: QuoteSentProps): { subject: string; html: string } {
  const codeDisplay = props.revisionLabel ? `${props.quoteCode} ${props.revisionLabel}` : props.quoteCode
  const subject = `Quotation ${codeDisplay} — ${props.branding.legalName}`

  const body = `
<p style="margin:0 0 16px 0;">Dear ${escapeHtml(props.customerName)},</p>

${
  props.engineerMessage
    ? `<div style="margin:0 0 16px 0;white-space:pre-wrap;">${escapeHtml(props.engineerMessage)}</div>`
    : '<p style="margin:0 0 16px 0;">Please find attached our formal quotation against your enquiry. The full breakdown — line items, pricing, lead time, terms — is in the PDF.</p>'
}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border:1px solid ${BRAND.border};background-color:${BRAND.surface2};">
  ${row('Quotation #', `<span style="font-family:Menlo,Consolas,monospace;font-size:14px;color:${BRAND.ink};">${escapeHtml(codeDisplay)}</span>`)}
  ${row('Total', `<strong style="font-size:14px;color:${BRAND.ink};">${escapeHtml(props.totalDisplay)}</strong>`)}
  ${row('Valid until', escapeHtml(props.expiresOnDisplay))}
  ${row('Payment terms', escapeHtml(props.paymentTerms))}
</table>

<p style="margin:0 0 16px 0;">To accept, simply reply to this email confirming the order — we'll process it from there. If you'd like adjustments, reply with your changes and we'll issue a revision.</p>

${
  props.viewUrl
    ? `<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(props.viewUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500;letter-spacing:0.02em;">View quotation online</a>
</p>`
    : ''
}

<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">For any questions, please reply to this email or call us directly.</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: `Quotation ${codeDisplay} — Total ${props.totalDisplay}, valid until ${props.expiresOnDisplay}`,
    bodyHtml: body,
    ...props.branding,
  })

  return { subject, html }
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;width:140px;background-color:${BRAND.surface2};border-bottom:1px solid ${BRAND.surface2};font-size:11px;letter-spacing:0.06em;color:${BRAND.muted};text-transform:uppercase;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 16px;border-bottom:1px solid ${BRAND.surface2};font-size:14px;color:${BRAND.ink};">${value}</td>
  </tr>`
}
