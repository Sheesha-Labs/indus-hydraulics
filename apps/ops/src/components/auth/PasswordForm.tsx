'use client'

import { Button } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import Link from 'next/link'
import { useActionState } from 'react'
import { passwordSignIn } from '../../app/(auth)/sign-in/actions'
import AuthField from './AuthField'
import { keepFields } from './keep-fields'
import { passwordNotice, type PasswordFormState } from './states'

/**
 * Email + password (board 77 main card). The password only opens the second step: a success
 * redirects to /sign-in/two-factor. Every failure reads the same, except the lock, which the board
 * states with the minutes left and a reset link. Client only for useActionState, so the email stays
 * in the field after a failure (it is never put in a URL).
 */
export default function PasswordForm({ next }: { next?: string | undefined }) {
  const [state, action, pending] = useActionState<PasswordFormState, FormData>(passwordSignIn, null)
  const notice = passwordNotice(state)
  return (
    <form
      action={action}
      onSubmit={keepFields(action)}
      className="flex flex-col gap-3.5"
      aria-busy={pending || undefined}
    >
      <input type="hidden" name="next" value={next ?? ''} />
      {notice ? (
        <Banner tone={notice.tone} className="px-3 py-2.5 text-[12.5px]">
          {notice.text}
        </Banner>
      ) : null}
      <AuthField
        id="signin-email"
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        required
        spellCheck={false}
      />
      <AuthField
        id="signin-password"
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <Button type="submit" size="lg" busy={pending} className="w-full text-[14px]">
        Sign in
      </Button>
      <Link
        href="/sign-in/forgot"
        className="io-focus rounded-io-tag text-io-accent hover:text-io-accent-hover self-center text-[12.5px]"
      >
        {notice?.resetLink ? 'Reset password' : 'Forgot password'}
      </Link>
    </form>
  )
}
