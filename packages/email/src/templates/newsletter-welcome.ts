import { BRAND } from '@indus/domain'
import { escapeHtml, renderLayout, renderLegalFooterText } from './_layout'
import type { NewsletterBranding } from './newsletter-confirmation'

export type NewsletterWelcomeProps = {
  /** Full URL of /newsletter/unsubscribe/<permanent token>. */
  unsubscribeUrl: string
  /** Absolute site URL, no trailing slash — for the "while you wait" links. */
  siteUrl: string
  branding: NewsletterBranding
}

/**
 * Sent once, right after a subscription is confirmed.
 *
 * Carries the PERMANENT unsubscribe token, never the confirmation one — which
 * confirming clears. Bazar's first version linked the confirmation token and
 * every welcome email's unsubscribe link was dead.
 */
export function renderNewsletterWelcome(props: NewsletterWelcomeProps): {
  subject: string
  html: string
  text: string
} {
  const subject = "You're subscribed to the Indus Hydraulics newsletter"
  const reason = 'You are receiving this because you subscribed to the Indus Hydraulics newsletter at indushydraulics.com.'
  const blog = `${props.siteUrl}/blog`
  const catalogue = `${props.siteUrl}/c`

  const link = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" style="color:${BRAND.accent};text-decoration:underline;">${escapeHtml(label)}</a>`

  const body = `
<p style="margin:0 0 16px 0;">You're on the list — thank you for confirming.</p>

<p style="margin:0 0 16px 0;">We'll email you when there is something worth reading: new stock and product ranges, technical articles on hydraulics, hose and fittings, and company news. Nothing else.</p>

<p style="margin:0 0 16px 0;">In the meantime, our ${link(blog, 'technical articles')} and the ${link(catalogue, 'product catalogue')} are a good place to start. Reply to this email to reach our sales team.</p>

<p style="margin:0;font-size:13px;color:${BRAND.ink2};">Changed your mind? ${link(props.unsubscribeUrl, 'Unsubscribe')} at any time — it takes one click.</p>
`.trim()

  const footer = { reason, unsubscribeUrl: props.unsubscribeUrl }
  const html = renderLayout({
    title: subject,
    preheader: 'Thanks for confirming. Here is what to expect.',
    bodyHtml: body,
    ...props.branding,
    footer,
  })

  const text = [
    "You're on the list — thank you for confirming.",
    '',
    "We'll email you when there is something worth reading: new stock and product ranges, technical articles on hydraulics, hose and fittings, and company news. Nothing else.",
    '',
    `Technical articles: ${blog}`,
    `Product catalogue: ${catalogue}`,
    '',
    'Reply to this email to reach our sales team.',
    '',
    renderLegalFooterText({ ...props.branding, footer }),
  ].join('\n')

  return { subject, html, text }
}
