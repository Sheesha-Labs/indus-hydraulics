import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type RfqConfirmationProps = {
  rfqCode: string
  customerName: string
  lineCount: number
  urgency: 'routine' | 'priority' | 'plant_down'
  trackingUrl: string
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

const URGENCY_RESPONSE: Record<RfqConfirmationProps['urgency'], string> = {
  routine: 'within 4 working hours',
  priority: 'within 4 working hours',
  plant_down: 'within 30 minutes (24/7 plant-down support)',
}

export function renderRfqConfirmation(props: RfqConfirmationProps): { subject: string; html: string } {
  const subject = `We received your request — ${props.rfqCode}`

  const body = `
<p style="margin:0 0 16px 0;">Hello ${escapeHtml(props.customerName)},</p>

<p style="margin:0 0 16px 0;">Thank you for your enquiry. We've logged your request as <strong>${escapeHtml(props.rfqCode)}</strong> and our applications team will reply ${escapeHtml(URGENCY_RESPONSE[props.urgency])} with availability, lead times and a fixed-price quotation.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;border:1px solid ${BRAND.border};background-color:${BRAND.surface2};">
  <tr>
    <td style="padding:16px 20px;border-bottom:1px solid ${BRAND.border};">
      <div style="font-size:11px;letter-spacing:0.08em;color:${BRAND.muted};text-transform:uppercase;margin-bottom:4px;">Reference</div>
      <div style="font-family:Menlo,Consolas,monospace;font-size:15px;color:${BRAND.ink};">${escapeHtml(props.rfqCode)}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:16px 20px;">
      <div style="font-size:11px;letter-spacing:0.08em;color:${BRAND.muted};text-transform:uppercase;margin-bottom:4px;">Items requested</div>
      <div style="font-size:15px;color:${BRAND.ink};">${props.lineCount} line item${props.lineCount === 1 ? '' : 's'}</div>
    </td>
  </tr>
</table>

<p style="margin:0 0 16px 0;">You can track the status of this request in your portal at any time:</p>

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(props.trackingUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500;letter-spacing:0.02em;">View request status</a>
</p>

<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">If you need to add information or have urgent questions, just reply to this email — it goes straight to our sales desk.</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: `Your request ${props.rfqCode} is logged. Our team will reply ${URGENCY_RESPONSE[props.urgency]}.`,
    bodyHtml: body,
    ...props.branding,
  })

  return { subject, html }
}
