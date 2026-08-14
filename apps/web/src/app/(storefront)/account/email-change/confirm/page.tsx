import type { Metadata } from 'next'
import Link from 'next/link'
import { confirmEmailChange } from '../../profile/actions'

export const metadata: Metadata = { title: 'Confirm new email' }

// This page is intentionally accessible without a sign-in: the recipient of
// the verification email may not be the currently-signed-in user (e.g. they
// forwarded the link to themselves on another device). Possession of the
// token is the authorisation.

type Props = {
  searchParams: Promise<{ token?: string }>
}

const REASON_MESSAGES: Record<string, { title: string; body: string }> = {
  invalid: {
    title: 'This link isn’t valid',
    body: 'Either it was already used, mis-typed, or there is no pending email change.',
  },
  expired: {
    title: 'This link has expired',
    body: 'Verification links are valid for 1 hour. Start the change again from your profile to get a fresh link.',
  },
  taken: {
    title: 'That email is already in use',
    body: 'Someone else may have claimed this address while your request was pending. Pick a different email and try again.',
  },
  unknown: {
    title: 'Something went wrong',
    body: 'We couldn’t complete the change. Please try again, or contact support if it keeps failing.',
  },
}

export default async function EmailChangeConfirmPage({ searchParams }: Props) {
  const sp = await searchParams
  const token = sp.token ?? ''
  const result = await confirmEmailChange(token)

  if (result.ok) {
    return (
      <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[oklch(0.95_0.1_150)] text-[oklch(0.4_0.15_150)] grid place-items-center mx-auto mb-6 text-[28px]">
          ✓
        </div>
        <h1 className="text-[32px] font-semibold tracking-tight mb-2">
          Email updated
        </h1>
        <p className="text-[15px] text-[var(--color-muted)] leading-[1.6] mb-6">
          Your sign-in email is now <b className="text-[var(--color-primary)]">{result.newEmail}</b>.
          Use it the next time you sign in.
        </p>
        <Link
          href="/account/profile"
          className="inline-block h-11 px-6 bg-[var(--color-accent)] text-white text-[14px] font-medium hover:opacity-90 transition-opacity"
        >
          Back to profile
        </Link>
      </div>
    )
  }

  const message = REASON_MESSAGES[result.reason] ?? REASON_MESSAGES.unknown!

  return (
    <div className="max-w-[560px] mx-auto px-6 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-[oklch(0.96_0.04_25)] text-[oklch(0.5_0.18_25)] grid place-items-center mx-auto mb-6 text-[28px]">
        !
      </div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-2">
        {message.title}
      </h1>
      <p className="text-[15px] text-[var(--color-muted)] leading-[1.6] mb-6">
        {message.body}
      </p>
      <Link
        href="/account/profile"
        className="inline-block h-11 px-6 border border-[var(--color-border)] text-[var(--color-body)] text-[14px] font-medium hover:bg-[var(--color-deep)] transition-colors"
      >
        Back to profile
      </Link>
    </div>
  )
}
