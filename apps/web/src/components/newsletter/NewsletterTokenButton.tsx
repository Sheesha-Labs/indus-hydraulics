'use client'

import { useActionState } from 'react'
import { Button } from '@indus/ui'
import type { NewsletterTokenState } from '../../actions/newsletter'
import NewsletterNotice from './NewsletterNotice'

type Copy = { title: string; body: React.ReactNode }

type Props = {
  token: string
  action: (prev: NewsletterTokenState, formData: FormData) => Promise<NewsletterTokenState>
  buttonLabel: string
  /** Before the button is pressed. */
  ready: Copy
  /** After it succeeded. */
  done: Copy
}

/**
 * The one button on the confirm and unsubscribe pages. The change happens
 * here — a POST — and never as the page renders: mail scanners and link
 * previewers fetch every URL in an email, and a page that acted on GET would
 * subscribe (or remove) people who never asked. A plain form, so it works
 * before JavaScript has loaded too.
 */
export default function NewsletterTokenButton({ token, action, buttonLabel, ready, done }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: 'idle' } as NewsletterTokenState)

  if (state.status === 'done') return <NewsletterNotice title={done.title}>{done.body}</NewsletterNotice>
  if (state.status === 'expired') {
    return (
      <NewsletterNotice title="This link has expired">
        <p>Confirmation links work for 14 days. Sign up again from the form at the bottom of the home page and we will send a fresh one.</p>
      </NewsletterNotice>
    )
  }
  if (state.status === 'not_found') {
    return (
      <NewsletterNotice title="This link is no longer valid">
        <p>It may already have been used. If you are still getting emails you did not ask for, write to sales@indushydraulics.me.</p>
      </NewsletterNotice>
    )
  }

  return (
    <NewsletterNotice
      title={ready.title}
      action={
        <form action={formAction}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" kind="primary" size="lg" loading={pending} disabled={pending}>
            {buttonLabel}
          </Button>
        </form>
      }
    >
      {state.status === 'error' ? (
        <p role="alert">Something went wrong on our side. Try the button again in a moment.</p>
      ) : (
        ready.body
      )}
    </NewsletterNotice>
  )
}
