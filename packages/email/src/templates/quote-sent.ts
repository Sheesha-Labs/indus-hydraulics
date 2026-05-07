import { escapeHtml, renderLayout, type LayoutInput } from './_layout'

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

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border:1px solid #e7e5e4;background-color:#fafaf9;">
  ${row('Quotation #', `<span style="font-family:Menlo,Consolas,monospace;font-size:14px;color:#1c1917;">${escapeHtml(codeDisplay)}</span>`)}
  ${row('Total', `<strong style="font-size:14px;color:#1c1917;">${escapeHtml(props.totalDisplay)}</strong>`)}
  ${row('Valid until', escapeHtml(props.expiresOnDisplay))}
  ${row('Payment terms', escapeHtml(props.paymentTerms))}
</table>

<p style="margin:0 0 16px 0;">To accept, simply reply to this email confirming the order — we'll process it from there. If you'd like adjustments, reply with your changes and we'll issue a revision.</p>

${
  props.viewUrl
    ? `<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(props.viewUrl)}" style="display:inline-block;background-color:#0c4a6e;color:#ffffff;text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500;letter-spacing:0.02em;">View quotation online</a>
</p>`
    : ''
}

<p style="margin:0 0 8px 0;font-size:13px;color:#57534e;">For any questions, please reply to this email or call us directly.</p>
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
    <td style="padding:10px 16px;width:140px;background-color:#fafaf9;border-bottom:1px solid #f5f5f4;font-size:11px;letter-spacing:0.06em;color:#78716c;text-transform:uppercase;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 16px;border-bottom:1px solid #f5f5f4;font-size:14px;color:#1c1917;">${value}</td>
  </tr>`
}
