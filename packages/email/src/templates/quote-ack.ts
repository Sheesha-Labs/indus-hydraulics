import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type QuoteAckProps = {
  customerName: string
  quoteCode: string
  revisionLabel?: string
  outcome: 'accepted' | 'declined'
  totalDisplay: string
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

const COPY = {
  accepted: {
    subject: (code: string) => `Order acknowledged — ${code}`,
    intro:
      'Thank you for confirming the order. We have received your acceptance and will move forward with processing.',
    next: 'Our team will follow up shortly with order tracking and shipping details. If you need anything in the meantime, simply reply to this email.',
  },
  declined: {
    subject: (code: string) => `Quotation ${code} closed`,
    intro:
      'Thank you for letting us know. We have marked this quotation as closed on our end.',
    next: 'If your requirements change or you would like a revised offer, just reply and we will reopen the conversation.',
  },
} as const

export function renderQuoteAck(props: QuoteAckProps): { subject: string; html: string } {
  const codeDisplay = props.revisionLabel ? `${props.quoteCode} ${props.revisionLabel}` : props.quoteCode
  const copy = COPY[props.outcome]
  const subject = copy.subject(codeDisplay)

  const body = `
<p style="margin:0 0 16px 0;">Dear ${escapeHtml(props.customerName)},</p>

<p style="margin:0 0 16px 0;">${escapeHtml(copy.intro)}</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border:1px solid ${BRAND.border};background-color:${BRAND.surface2};">
  <tr>
    <td style="padding:14px 18px;width:140px;font-size:11px;letter-spacing:0.06em;color:${BRAND.muted};text-transform:uppercase;background-color:${BRAND.surface2};border-right:1px solid ${BRAND.border};vertical-align:top;">Quotation</td>
    <td style="padding:14px 18px;font-size:14px;color:${BRAND.ink};font-family:Menlo,Consolas,monospace;">${escapeHtml(codeDisplay)}</td>
  </tr>
  <tr>
    <td style="padding:14px 18px;width:140px;font-size:11px;letter-spacing:0.06em;color:${BRAND.muted};text-transform:uppercase;background-color:${BRAND.surface2};border-right:1px solid ${BRAND.border};vertical-align:top;border-top:1px solid ${BRAND.surface2};">Total</td>
    <td style="padding:14px 18px;font-size:14px;color:${BRAND.ink};font-weight:700;border-top:1px solid ${BRAND.surface2};">${escapeHtml(props.totalDisplay)}</td>
  </tr>
</table>

<p style="margin:0 0 8px 0;">${escapeHtml(copy.next)}</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: subject,
    bodyHtml: body,
    ...props.branding,
  })

  return { subject, html }
}
