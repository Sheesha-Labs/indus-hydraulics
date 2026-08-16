import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type StaffInvitationProps = {
  recipientName: string
  /** Drives the copy only. Both kinds land on the same set-your-password screen. */
  purpose: 'invite' | 'reset'
  /** Full URL: ${baseUrl}/admin/activate?token=... */
  activateUrl: string
  /** How long the link stays valid, formatted (e.g. "14 days"). */
  validityWindow: string
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

export function renderStaffInvitation(props: StaffInvitationProps): {
  subject: string
  html: string
} {
  const isInvite = props.purpose === 'invite'

  const subject = isInvite
    ? `You've been invited to the ${props.branding.legalName} admin`
    : `Set a new password for your ${props.branding.legalName} admin account`

  const lead = isInvite
    ? `You've been invited to the Indus Hydraulics staff admin. Choose a password below to finish setting up your account — the link is valid for <strong>${escapeHtml(props.validityWindow)}</strong>.`
    : `We received a request to set a new password for your Indus Hydraulics staff account. Choose one below — the link is valid for <strong>${escapeHtml(props.validityWindow)}</strong>.`

  const closing = isInvite
    ? `If you weren't expecting this invitation, you can ignore this email — the link expires on its own and no account is created until it is used.`
    : `If you didn't request this, you can safely ignore this email — your current password will keep working.`

  const body = `
<p style="margin:0 0 16px 0;">Hello ${escapeHtml(props.recipientName)},</p>

<p style="margin:0 0 16px 0;">${lead}</p>

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(props.activateUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500;letter-spacing:0.02em;">${isInvite ? 'Set up your account' : 'Set a new password'}</a>
</p>

<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">If the button doesn't work, paste this link into your browser:</p>
<p style="margin:0 0 24px 0;font-size:12px;font-family:Menlo,Consolas,monospace;color:${BRAND.ink2};word-break:break-all;">${escapeHtml(props.activateUrl)}</p>

<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">This link can only be used once.</p>
<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">${closing}</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: isInvite
      ? `Set up your Indus Hydraulics staff account — link valid for ${props.validityWindow}.`
      : `Set a new password — link valid for ${props.validityWindow}.`,
    bodyHtml: body,
    ...props.branding,
  })

  return { subject, html }
}
