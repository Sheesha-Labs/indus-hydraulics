import type { Metadata } from 'next'
import NewsletterNotice from '../../../../../components/newsletter/NewsletterNotice'
import NewsletterTokenButton from '../../../../../components/newsletter/NewsletterTokenButton'
import { unsubscribeNewsletterAction } from '../../../../../actions/newsletter'
import { lookupUnsubscribe } from '../../../../../lib/newsletter/service'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
}

type Props = { params: Promise<{ token: string }> }

/**
 * The unsubscribe link in every newsletter email. READS ONLY — the button
 * does the unsubscribing — so a link scanner cannot remove anyone. Mail
 * clients' own one-click button skips this page and POSTs to
 * /api/newsletter/unsubscribe.
 */
export default async function NewsletterUnsubscribePage({ params }: Props) {
  const { token } = await params
  const lookup = await lookupUnsubscribe(token)

  if (lookup.status === 'not_found') {
    return (
      <NewsletterNotice title="This link is no longer valid">
        <p>
          The address may already have been removed. If you are still getting emails you did not ask for, write to
          sales@indushydraulics.me and we will take you off by hand.
        </p>
      </NewsletterNotice>
    )
  }
  if (lookup.status === 'unsubscribed') {
    return (
      <NewsletterNotice title="You're unsubscribed">
        <p>
          <span className="font-medium text-ih-ink">{lookup.maskedEmail}</span> no longer receives the Indus Hydraulics
          newsletter.
        </p>
      </NewsletterNotice>
    )
  }

  return (
    <NewsletterTokenButton
      token={token}
      action={unsubscribeNewsletterAction}
      buttonLabel="Unsubscribe"
      ready={{
        title: 'Unsubscribe from the newsletter?',
        body: (
          <p>
            Press the button and <span className="font-medium text-ih-ink">{lookup.maskedEmail}</span> will stop
            receiving the Indus Hydraulics newsletter. Quotes and replies to your enquiries are not affected.
          </p>
        ),
      }}
      done={{
        title: "You're unsubscribed",
        body: <p>You will not receive the newsletter again. Changed your mind? You can sign up again on the home page.</p>,
      }}
    />
  )
}
