import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

/**
 * The one email every storefront enquiry form sends.
 *
 * Addressed to sales@ and purchase@, with the submitter in CC, so a single
 * message is both the desk's alert and the buyer's instant record of what they
 * sent. The copy is therefore written to the buyer: the desk reads the same
 * table, and works the enquiry from /admin/enquiries.
 *
 * Nothing internal goes in here — no admin links, no UTM, referrer or device
 * data. The buyer sees every line.
 *
 * Everything the visitor typed is escaped. Because the mail goes to an address
 * the visitor typed, the sender caps how many copies one address can receive
 * (see apps/web/src/lib/enquiry-email.ts).
 */

type Branding = Pick<LayoutInput, 'legalName' | 'vatTrn' | 'registeredAddressLines'>

export type EnquiryReceivedProps = {
  /** RFQ code, e.g. "RFQ-2611-0042". Null where the form has none (call-back). */
  reference: string | null
  /** Which form sent it, e.g. "Contact form · Quotation request". */
  formLabel: string
  senderName: string
  senderEmail: string
  company?: string | null
  /** Label/value pairs in display order. Empty values are dropped. */
  details: ReadonlyArray<readonly [label: string, value: string | null | undefined]>
  /** Free text the visitor wrote — part list, description, message. */
  message?: string | null
  attachmentCount?: number
  /** Files received but too large to attach to this email — named so nobody thinks they were lost. */
  notAttached?: readonly string[]
  /** The page the form was on. */
  pageUrl?: string | null
  /** What happens next, e.g. "An engineer will reply to this email, usually within 4 business hours." */
  nextStep: string
  branding: Branding
}

export function renderEnquiryReceived(props: EnquiryReceivedProps): {
  subject: string
  html: string
  text: string
} {
  const who = props.company?.trim() || props.senderName
  const subject = [
    props.reference ? `Enquiry ${props.reference}` : 'Enquiry received',
    who,
    props.formLabel,
  ].join(' — ')
  const first = props.senderName.trim().split(/\s+/)[0] || props.senderName
  const ref = props.reference ? ` Your reference is ${props.reference}.` : ''
  const lead = `Thank you, ${first}. We have received your enquiry.${ref}`
  const copyNote =
    'This email goes to our sales and purchase teams, with a copy to you as your record of what you sent. To add anything, reply to it.'

  const rows: Array<readonly [string, string]> = [
    ['Name', props.senderName],
    ['Email', props.senderEmail],
    ...(props.company ? [['Company', props.company] as const] : []),
    ...props.details.filter(
      (d): d is readonly [string, string] => typeof d[1] === 'string' && d[1].trim() !== ''
    ),
    ...(props.attachmentCount
      ? [
          [
            'Attachments',
            `${props.attachmentCount} file${props.attachmentCount === 1 ? '' : 's'}`,
          ] as const,
        ]
      : []),
    ...(props.pageUrl ? [['Sent from', props.pageUrl] as const] : []),
  ]

  const body = `
<p style="margin:0 0 12px 0;font-size:15px;line-height:1.55;color:${BRAND.ink};">${escapeHtml(lead)}</p>
<p style="margin:0 0 12px 0;font-size:14px;line-height:1.55;color:${BRAND.ink2};">${escapeHtml(props.nextStep)}</p>
<p style="margin:0 0 20px 0;font-size:13px;line-height:1.55;color:${BRAND.muted};">${escapeHtml(copyNote)}</p>

<p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">${escapeHtml(props.formLabel)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px 0;border:1px solid ${BRAND.border};">
  ${rows.map(([label, value]) => row(label, escapeHtml(value))).join('\n  ')}
</table>
${
  props.message
    ? `<p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Message</p>
<div style="margin:0 0 20px 0;padding:12px 16px;border-left:3px solid ${BRAND.border};white-space:pre-wrap;font-size:14px;line-height:1.55;color:${BRAND.ink};">${escapeHtml(props.message)}</div>`
    : ''
}
${
  props.notAttached && props.notAttached.length > 0
    ? `<p style="margin:0 0 16px 0;font-size:13px;line-height:1.55;color:${BRAND.ink2};">${escapeHtml(notAttachedNote(props.notAttached))}</p>`
    : ''
}
<p style="margin:0;font-size:12px;color:${BRAND.muted};">If you did not send this enquiry on indushydraulics.com, ignore this email.</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: `${lead} ${props.nextStep}`,
    bodyHtml: body,
    ...props.branding,
  })

  const text = [
    lead,
    props.nextStep,
    '',
    copyNote,
    '',
    props.formLabel.toUpperCase(),
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(props.message ? ['', 'MESSAGE', props.message] : []),
    ...(props.notAttached && props.notAttached.length > 0
      ? ['', notAttachedNote(props.notAttached)]
      : []),
    '',
    'If you did not send this enquiry on indushydraulics.com, ignore this email.',
  ].join('\n')

  return { subject, html, text }
}

function notAttachedNote(names: readonly string[]): string {
  return `Too large to attach to this email, but received and kept on file with your enquiry: ${names.join(', ')}.`
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;width:140px;background-color:${BRAND.surface2};border-bottom:1px solid ${BRAND.surface2};font-size:11px;letter-spacing:0.06em;color:${BRAND.muted};text-transform:uppercase;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 16px;border-bottom:1px solid ${BRAND.surface2};font-size:14px;color:${BRAND.ink};white-space:pre-wrap;">${value}</td>
  </tr>`
}
