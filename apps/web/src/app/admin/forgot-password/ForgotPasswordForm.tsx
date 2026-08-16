'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { NEUTRAL, requestStaffPasswordReset, type ForgotState } from './actions'

const inputCls =
  'h-10 w-full border border-[#2a2e35] bg-[#0e1013] px-3 text-sm text-[#f0ece3] placeholder:text-[#3a3f47] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent transition-colors'

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ForgotState, FormData>(
    requestStaffPasswordReset,
    null,
  )

  // Swap the form for confirmation rather than showing both. Leaving the form
  // up invites a second submission, which would invalidate the link just sent.
  if (state && 'done' in state) {
    return (
      <div>
        <h1 className="mb-2 text-[22px] font-semibold text-white">Check your email</h1>
        <p className="mb-2 text-[13px] leading-relaxed text-[#9aa0a8]">{NEUTRAL}</p>
        <p className="mb-7 text-[13px] leading-relaxed text-[#6b7079]">
          The link is valid for 60 minutes and can be used once. Your current password keeps
          working until you set a new one.
        </p>
        <Link
          href="/admin/sign-in"
          className="inline-flex h-11 w-full items-center justify-center border border-[#2a2e35] text-sm font-medium text-[#f0ece3] transition-colors hover:bg-[#0e1013]"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-1 text-[22px] font-semibold text-white">Reset your password</h1>
      <p className="mb-7 text-[13px] text-[#6b7079]">
        We&apos;ll email you a single-use link to choose a new one.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        {state?.error && (
          <div
            role="alert"
            className="border border-[oklch(0.4_0.18_25)] bg-[oklch(0.15_0.04_25)] px-4 py-3 text-sm text-[oklch(0.65_0.18_25)]"
          >
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#9aa0a8]" htmlFor="email">
            Work email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-1 h-11 bg-ih-accent text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Sending…' : 'Email me a link'}
        </button>
      </form>

      <Link
        href="/admin/sign-in"
        className="mt-5 block text-center text-[13px] text-[#6b7079] transition-colors hover:text-[#9aa0a8]"
      >
        Back to sign in
      </Link>
    </>
  )
}
