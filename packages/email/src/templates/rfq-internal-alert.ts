import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type RfqInternalAlertProps = {
  rfqCode: string
  accountLegalName: string
  submittedByName: string
  submittedByEmail: string
  urgency: 'routine' | 'priority' | 'plant_down'
  lineCount: number
  subject?: string | null
  customerMessage?: string | null
  shipToCity?: string | null
  shipToCountry?: string | null
  adminUrl: string
  branding: Pick<
    LayoutInput,
    'legalName' | 'vatTrn' | 'registeredAddressLines'
  >
}

const URGENCY_LABEL: Record<RfqInternalAlertProps['urgency'], string> = {
  routine: 'Routine',
  priority: '🟡 Priority — reply within 4 working hours',
  plant_down: '🔴 Plant Down — reply within 30 minutes',
}

export function renderRfqInternalAlert(props: RfqInternalAlertProps): { subject: string; html: string } {
  const urgencyPrefix = props.urgency === 'plant_down' ? '🔴 PLANT DOWN — ' : props.urgency === 'priority' ? '🟡 ' : ''
  const subjectLine = `${urgencyPrefix}New RFQ ${props.rfqCode} — ${props.accountLegalName}`

  const shipTo = [props.shipToCity, props.shipToCountry].filter(Boolean).join(', ')

  const body = `
<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.muted};">A new request for quote was submitted on the website.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 24px 0;border:1px solid ${BRAND.border};">
  ${row('Reference', `<span style="font-family:Menlo,Consolas,monospace;">${escapeHtml(props.rfqCode)}</span>`)}
  ${row('Account', escapeHtml(props.accountLegalName))}
  ${row('Submitted by', `${escapeHtml(props.submittedByName)} &lt;${escapeHtml(props.submittedByEmail)}&gt;`)}
  ${row('Urgency', escapeHtml(URGENCY_LABEL[props.urgency]))}
  ${row('Line items', `${props.lineCount}`)}
  ${shipTo ? row('Ship to', escapeHtml(shipTo)) : ''}
  ${props.subject ? row('Subject', escapeHtml(props.subject)) : ''}
</table>

${
  props.customerMessage
    ? `<div style="margin:16px 0 24px 0;padding:14px 16px;background-color:${BRAND.surface2};border-left:3px solid ${BRAND.accent};font-size:13px;line-height:1.5;color:${BRAND.ink2};white-space:pre-wrap;">${escapeHtml(props.customerMessage)}</div>`
    : ''
}

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(props.adminUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500;">Open in Admin</a>
</p>
`.trim()

  const html = renderLayout({
    title: subjectLine,
    preheader: `${URGENCY_LABEL[props.urgency]} — ${props.lineCount} line item${props.lineCount === 1 ? '' : 's'} from ${props.accountLegalName}`,
    bodyHtml: body,
    ...props.branding,
  })

  return { subject: subjectLine, html }
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;width:140px;background-color:${BRAND.surface2};border-bottom:1px solid ${BRAND.surface2};font-size:11px;letter-spacing:0.06em;color:${BRAND.muted};text-transform:uppercase;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 16px;border-bottom:1px solid ${BRAND.surface2};font-size:14px;color:${BRAND.ink};">${value}</td>
  </tr>`
}
