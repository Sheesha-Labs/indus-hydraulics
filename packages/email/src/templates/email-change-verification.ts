import { escapeHtml, renderLayout, type LayoutInput } from './_layout'

export type EmailChangeVerificationProps = {
  customerName: string
  /** Current email on file — shown so the recipient can confirm intent. */
  currentEmail: string
  /** New email being verified. */
  newEmail: string
  /** Tokenised confirmation link, e.g. /account/email-change/confirm?token=... */
  confirmUrl: string
  /** When the link stops working, formatted (e.g. "12:30 on 4 May 2026"). */
  expiresOnDisplay: string
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

export function renderEmailChangeVerification(
  props: EmailChangeVerificationProps,
): { subject: string; html: string } {
  const subject = `Confirm your new ${props.branding.legalName} sign-in email`

  const body = `
<p style="margin:0 0 16px 0;">Dear ${escapeHtml(props.customerName)},</p>

<p style="margin:0 0 16px 0;">Someone (most likely you) requested to change the sign-in email for your ${escapeHtml(
    props.branding.legalName,
  )} account from <b>${escapeHtml(props.currentEmail)}</b> to <b>${escapeHtml(
    props.newEmail,
  )}</b>.</p>

<p style="margin:0 0 24px 0;">If you made this change, click the button below to confirm:</p>

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(
    props.confirmUrl,
  )}" style="display:inline-block;background:#1a4dbe;color:#ffffff;padding:10px 18px;text-decoration:none;font-weight:500;">
    Confirm new email address
  </a>
</p>

<p style="margin:0 0 16px 0;font-size:12px;color:#6b6b6b;">
  This link expires at <b>${escapeHtml(props.expiresOnDisplay)}</b>. After that you&rsquo;ll need to start the change again from your account settings.
</p>

<p style="margin:0 0 16px 0;font-size:12px;color:#6b6b6b;">
  If you didn&rsquo;t request this, just ignore this email. Your sign-in email won&rsquo;t change unless you click the link.
</p>
`

  return {
    subject,
    html: renderLayout({
      title: subject,
      preheader: `Confirm changing your sign-in email to ${props.newEmail}`,
      bodyHtml: body,
      ...props.branding,
    }),
  }
}
