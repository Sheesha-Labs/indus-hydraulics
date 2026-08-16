'use client'

import { MIN_STAFF_PASSWORD_LENGTH, type InvitationPurpose } from '@indus/domain'
import Link from 'next/link'
import { useActionState } from 'react'
import { activateStaffAccount, type ActivateState } from './actions'

const inputCls =
  'h-10 w-full border border-[#2a2e35] bg-[#0e1013] px-3 text-sm text-[#f0ece3] placeholder:text-[#3a3f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent transition-colors'

export default function ActivateForm({
  token,
  purpose,
  submitLabel,
}: {
  token: string
  purpose: InvitationPurpose
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<ActivateState, FormData>(
    activateStaffAccount,
    null,
  )

  // Success dialog rather than a redirect: the person has just set a password
  // they may not have committed to memory, and bouncing them straight into a
  // form is where they lose it. Confirm first, then let them choose to go.
  if (state && 'ok' in state) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activate-done-title"
        className="border border-[#2a2e35] bg-[#15181d] p-8 text-center"
      >
        <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-full bg-[oklch(0.55_0.12_150)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 10.5l4 4 8-9"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 id="activate-done-title" className="text-[20px] font-semibold text-white">
          {purpose === 'invite' ? 'Account ready' : 'Password updated'}
        </h2>

        <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-[#9aa0a8]">
          {purpose === 'invite'
            ? 'Your staff account is set up. Sign in to open the admin.'
            : 'Your password has been changed. Sign in with your new password.'}
        </p>

        <p className="mt-4 font-mono text-[11px] text-[#6b7079]">{state.email}</p>

        <Link
          href={`/admin/sign-in?email=${encodeURIComponent(state.email)}`}
          className="mt-6 inline-flex h-11 w-full items-center justify-center bg-ih-accent text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Go to sign in →
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <div
          role="alert"
          className="border border-[oklch(0.4_0.18_25)] bg-[oklch(0.15_0.04_25)] px-4 py-3 text-sm text-[oklch(0.65_0.18_25)]"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-[#9aa0a8]" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_STAFF_PASSWORD_LENGTH}
          className={inputCls}
        />
        <p className="text-[11px] text-[#6b7079]">
          At least {MIN_STAFF_PASSWORD_LENGTH} characters.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-[#9aa0a8]" htmlFor="confirm">
          Repeat password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_STAFF_PASSWORD_LENGTH}
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 bg-ih-accent text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
