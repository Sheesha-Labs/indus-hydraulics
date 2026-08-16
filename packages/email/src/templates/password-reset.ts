import { escapeHtml, renderLayout, type LayoutInput } from './_layout'
import { BRAND } from '@indus/domain'

export type PasswordResetProps = {
  customerName: string
  /** Full URL: ${baseUrl}/reset-password?token=... */
  resetUrl: string
  /** How long the link stays valid, formatted (e.g. "60 minutes"). */
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

export function renderPasswordReset(props: PasswordResetProps): { subject: string; html: string } {
  const subject = `Reset your password — ${props.branding.legalName}`

  const body = `
<p style="margin:0 0 16px 0;">Hello ${escapeHtml(props.customerName)},</p>

<p style="margin:0 0 16px 0;">We received a request to reset the password for your Indus Hydraulics account. Click the button below to choose a new one — the link is valid for <strong>${escapeHtml(props.validityWindow)}</strong>.</p>

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(props.resetUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500;letter-spacing:0.02em;">Reset password</a>
</p>

<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">If the button doesn't work, paste this link into your browser:</p>
<p style="margin:0 0 24px 0;font-size:12px;font-family:Menlo,Consolas,monospace;color:${BRAND.ink2};word-break:break-all;">${escapeHtml(props.resetUrl)}</p>

<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">If you didn't request a password reset, you can safely ignore this email — your password will stay the same.</p>
`.trim()

  const html = renderLayout({
    title: subject,
    preheader: `Use this link within ${props.validityWindow} to set a new password.`,
    bodyHtml: body,
    ...props.branding,
  })

  return { subject, html }
}
