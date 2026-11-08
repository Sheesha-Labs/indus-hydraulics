import { BRAND } from '@indus/domain'
import { escapeHtml, renderLayout, renderLegalFooterText, type LayoutInput } from './_layout'

export type NewsletterBranding = Pick<LayoutInput, 'legalName' | 'registeredAddressLines'>

export type NewsletterConfirmationProps = {
  /** Full URL of /newsletter/confirm/<token>. */
  confirmUrl: string
  /** Formatted, e.g. "14 days". */
  validityWindow: string
  branding: NewsletterBranding
}

/**
 * The double opt-in email. Its link opens a page with a button; the page
 * itself confirms nothing, so a mail scanner that fetches every link cannot
 * subscribe anyone (plan §2, Bazar bug 1).
 *
 * No unsubscribe link: there is no subscription yet, and ignoring the email
 * is the way out — the footer says so.
 */
export function renderNewsletterConfirmation(props: NewsletterConfirmationProps): {
  subject: string
  html: string
  text: string
} {
  const subject = 'Confirm your Indus Hydraulics newsletter subscription'
  const reason =
    'You received this because this address was entered in the newsletter sign-up at indushydraulics.com. If that was not you, ignore this email — you will not be subscribed.'

  const body = `
<p style="margin:0 0 16px 0;">Thanks for signing up to the Indus Hydraulics newsletter — product news, new stock and technical articles for engineers and buyers.</p>

<p style="margin:0 0 24px 0;">Please confirm that this is your address. The link works for <strong>${escapeHtml(props.validityWindow)}</strong>.</p>

<p style="margin:0 0 24px 0;">
  <a href="${escapeHtml(props.confirmUrl)}" style="display:inline-block;background-color:${BRAND.accent};color:${BRAND.white};text-decoration:none;padding:12px 24px;font-size:14px;font-weight:500;border-radius:6px;">Confirm subscription</a>
</p>

<p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.ink2};">If the button doesn't work, paste this link into your browser:</p>
<p style="margin:0;font-size:12px;font-family:Menlo,Consolas,monospace;color:${BRAND.ink2};word-break:break-all;">${escapeHtml(props.confirmUrl)}</p>
`.trim()

  const footer = { reason }
  const html = renderLayout({
    title: subject,
    preheader: `One click to confirm — the link works for ${props.validityWindow}.`,
    bodyHtml: body,
    ...props.branding,
    footer,
  })

  const text = [
    'Thanks for signing up to the Indus Hydraulics newsletter — product news, new stock and technical articles for engineers and buyers.',
    '',
    `Please confirm that this is your address. The link works for ${props.validityWindow}:`,
    '',
    props.confirmUrl,
    '',
    renderLegalFooterText({ ...props.branding, footer }),
  ].join('\n')

  return { subject, html, text }
}
