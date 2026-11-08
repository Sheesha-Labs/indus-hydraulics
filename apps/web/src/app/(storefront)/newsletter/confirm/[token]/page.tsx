import type { Metadata } from 'next'
import NewsletterNotice from '../../../../../components/newsletter/NewsletterNotice'
import NewsletterTokenButton from '../../../../../components/newsletter/NewsletterTokenButton'
import { confirmNewsletterAction } from '../../../../../actions/newsletter'
import { lookupConfirmation } from '../../../../../lib/newsletter/service'

// Per-token, so never prerendered or cached. Kept out of the index three ways:
// this noindex, robots.txt (`/newsletter/`), and no sitemap entry.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Confirm your subscription',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ token: string }> }

/**
 * Where the confirmation email's link lands. READS ONLY: the subscription is
 * confirmed by the button, a POST (plan §2, Bazar bug 1 — Bazar confirmed on
 * GET, so mail scanners confirmed people).
 */
export default async function NewsletterConfirmPage({ params }: Props) {
  const { token } = await params
  const lookup = await lookupConfirmation(token)

  if (lookup.status === 'expired') {
    return (
      <NewsletterNotice title="This link has expired">
        <p>
          Confirmation links work for 14 days. Sign up again from the form at the bottom of the home page and we will
          send a fresh one.
        </p>
      </NewsletterNotice>
    )
  }
  if (lookup.status === 'not_found') {
    return (
      <NewsletterNotice title="This link is no longer valid">
        <p>It may already have been used — if you confirmed earlier, you are subscribed and there is nothing more to do.</p>
      </NewsletterNotice>
    )
  }

  return (
    <NewsletterTokenButton
      token={token}
      action={confirmNewsletterAction}
      buttonLabel="Confirm subscription"
      ready={{
        title: 'Confirm your subscription',
        body: (
          <p>
            Press the button to start receiving the Indus Hydraulics newsletter at{' '}
            <span className="font-medium text-ih-ink">{lookup.maskedEmail}</span>.
          </p>
        ),
      }}
      done={{
        title: "You're subscribed",
        body: <p>Thank you for confirming. A welcome email is on its way, and every email has a one-click unsubscribe link.</p>,
      }}
    />
  )
}
