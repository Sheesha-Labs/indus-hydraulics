import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

/**
 * Call-back request emails, from the storefront retention prompt.
 *
 *  - `renderCallbackSalesAlert` — to the sales desk, immediately. The subject
 *    carries the category, name and number so the desk can triage from the
 *    inbox list; the body gives one-tap tel / WhatsApp / mailto links.
 *  - `renderCallbackConfirmation` — to the visitor. Plain, no marketing. It
 *    deliberately does NOT repeat the name or description the visitor typed:
 *    those are free text from an unauthenticated form, and echoing them into a
 *    mail we send to any address typed would make the form a relay for
 *    somebody else's message. The phone number is digits only, so it is safe
 *    to read back.
 */

type Branding = Pick<LayoutInput, 'legalName' | 'vatTrn' | 'registeredAddressLines'>

export type CallbackSalesAlertProps = {
  name: string
  email: string
  phoneE164: string
  /** "Hoses & fittings", or null when the surface did not ask. */
  categoryLabel: string | null
  description: string | null
  surfaceLabel: string
  triggerLabel: string
  pageUrl: string | null
  pageTitle: string | null
  market: string | null
  referrer: string | null
  utm: string | null
  deskOpen: boolean
  branding: Branding
}

export function renderCallbackSalesAlert(props: CallbackSalesAlertProps): { subject: string; html: string; text: string } {
  const subject = `Call-back · ${props.categoryLabel ?? 'General'} · ${props.name} · ${props.phoneE164}`
  const digits = props.phoneE164.replace(/\D/g, '')

  const body = `
<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.muted};">A visitor asked for a call-back from the website${props.deskOpen ? '' : ' <strong>outside desk hours</strong>'}. The promise on screen is a call within one working hour.</p>

<p style="margin:16px 0;">
  <a href="tel:${escapeHtml(props.phoneE164)}" style="display:inline-block;background-color:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 20px;font-size:14px;font-weight:500;margin:0 8px 8px 0;">Call ${escapeHtml(props.phoneE164)}</a>
  <a href="https://wa.me/${digits}" style="display:inline-block;border:1px solid ${BRAND.accent};color:${BRAND.accent};text-decoration:none;padding:11px 20px;font-size:14px;font-weight:500;margin:0 8px 8px 0;">WhatsApp</a>
  <a href="mailto:${escapeHtml(props.email)}" style="display:inline-block;border:1px solid ${BRAND.accent};color:${BRAND.accent};text-decoration:none;padding:11px 20px;font-size:14px;font-weight:500;margin:0 0 8px 0;">Email</a>
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px 0;border:1px solid ${BRAND.border};">
  ${row('Name', escapeHtml(props.name))}
  ${row('Email', escapeHtml(props.email))}
  ${row('Phone', `<span style="font-family:Menlo,Consolas,monospace;">${escapeHtml(props.phoneE164)}</span>`)}
  ${row('Looking for', escapeHtml(props.categoryLabel ?? '—'))}
  ${props.description ? row('Part / description', escapeHtml(props.description)) : ''}
  ${row('Page', props.pageUrl ? `<a href="${escapeHtml(props.pageUrl)}" style="color:${BRAND.accent};">${escapeHtml(props.pageTitle || props.pageUrl)}</a>` : '—')}
  ${props.market ? row('Market page', escapeHtml(props.market)) : ''}
  ${row('Prompt', `${escapeHtml(props.surfaceLabel)} · ${escapeHtml(props.triggerLabel)}`)}
  ${props.referrer ? row('Referrer', escapeHtml(props.referrer)) : ''}
  ${props.utm ? row('Campaign', escapeHtml(props.utm)) : ''}
</table>

<p style="margin:0;font-size:12px;color:${BRAND.muted};">Reply to this email to write to ${escapeHtml(props.name)} directly.</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: `${props.name} · ${props.phoneE164}${props.categoryLabel ? ` · ${props.categoryLabel}` : ''}`,
    bodyHtml: body,
    ...props.branding,
  })

  const text = [
    `Call-back request from the website${props.deskOpen ? '' : ' (outside desk hours)'}.`,
    '',
    `Name: ${props.name}`,
    `Email: ${props.email}`,
    `Phone: ${props.phoneE164}`,
    `WhatsApp: https://wa.me/${digits}`,
    `Looking for: ${props.categoryLabel ?? '—'}`,
    props.description ? `Part / description: ${props.description}` : null,
    `Page: ${props.pageUrl ?? '—'}`,
    props.market ? `Market page: ${props.market}` : null,
    `Prompt: ${props.surfaceLabel} · ${props.triggerLabel}`,
    props.referrer ? `Referrer: ${props.referrer}` : null,
    props.utm ? `Campaign: ${props.utm}` : null,
  ]
    .filter((l): l is string => l !== null)
    .join('\n')

  return { subject, html, text }
}

export type CallbackConfirmationProps = {
  /** Read-back form, e.g. "+971 52 123 4567". */
  phoneDisplay: string
  categoryLabel: string | null
  deskOpen: boolean
  /** "tomorrow at 09:00 GST" — set when the desk is closed. */
  nextOpen: string | null
  deskPhone: string
  deskEmail: string
  branding: Branding
}

export function renderCallbackConfirmation(props: CallbackConfirmationProps): { subject: string; html: string; text: string } {
  const subject = 'Your call-back request — Indus Hydraulics'
  const when = props.deskOpen
    ? 'within one working hour'
    : props.nextOpen
      ? `when the desk opens ${props.nextOpen}`
      : 'as soon as the desk opens'
  const about = props.categoryLabel ? ` about ${props.categoryLabel.toLowerCase()}` : ''
  const lead = `Thanks for your request. A hydraulic engineer from our export desk will call ${props.phoneDisplay}${about} ${when}.`
  const tail = `If that is not the right number, or you would rather not wait, call ${props.deskPhone} or reply to this email.`

  const body = `
<p style="margin:0 0 16px 0;font-size:15px;line-height:1.55;color:${BRAND.ink};">${escapeHtml(lead)}</p>
<p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:${BRAND.ink2};">${escapeHtml(tail)}</p>
<p style="margin:0;font-size:14px;line-height:1.55;color:${BRAND.ink2};">
  <a href="tel:${escapeHtml(props.deskPhone.replace(/\s/g, ''))}" style="color:${BRAND.accent};">${escapeHtml(props.deskPhone)}</a><br>
  <a href="mailto:${escapeHtml(props.deskEmail)}" style="color:${BRAND.accent};">${escapeHtml(props.deskEmail)}</a>
</p>
<p style="margin:24px 0 0 0;font-size:12px;color:${BRAND.muted};">You are getting this email because this address was entered in a call-back request on indushydraulics.com. If that was not you, ignore it — nothing else will be sent.</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: props.deskOpen ? 'An engineer will call you within one working hour.' : 'We will call you when the desk opens.',
    bodyHtml: body,
    ...props.branding,
  })

  const text = [
    lead,
    '',
    tail,
    '',
    props.deskPhone,
    props.deskEmail,
    '',
    'You are getting this email because this address was entered in a call-back request on indushydraulics.com. If that was not you, ignore it — nothing else will be sent.',
  ].join('\n')

  return { subject, html, text }
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;width:140px;background-color:${BRAND.surface2};border-bottom:1px solid ${BRAND.surface2};font-size:11px;letter-spacing:0.06em;color:${BRAND.muted};text-transform:uppercase;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 16px;border-bottom:1px solid ${BRAND.surface2};font-size:14px;color:${BRAND.ink};">${value}</td>
  </tr>`
}
