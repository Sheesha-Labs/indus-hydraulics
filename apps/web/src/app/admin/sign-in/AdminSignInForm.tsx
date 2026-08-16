'use client'

import { useActionState } from 'react'
import { adminSignInAction } from './actions'

type State = { error?: string } | null

const inputCls =
  'h-10 w-full border border-[var(--color-ih-navy-2)] bg-[var(--color-ih-navy)] px-3 text-sm text-[#ffffff] placeholder:text-[oklch(0.62_0.03_250)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent transition-colors'

export default function AdminSignInForm({ next }: { next?: string }) {
  // Server action, not `signIn` from next-auth/react — that client helper
  // resolves its base path from NEXTAUTH_URL at build time and cannot address
  // this app's Auth.js instance once the two surfaces share an origin.
  // See ./actions.ts.
  const [state, formAction, pending] = useActionState<State, FormData>(adminSignInAction, null)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}

      {state?.error && (
        <div
          role="alert"
          className="px-4 py-3 text-sm text-[oklch(0.65_0.18_25)] border border-[oklch(0.4_0.18_25)] bg-[oklch(0.15_0.04_25)]"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-[oklch(0.75_0.02_250)]" htmlFor="email">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@indushydraulics.me"
          className={inputCls}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-[oklch(0.75_0.02_250)]" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputCls}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 bg-ih-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 mt-1"
      >
        {pending ? 'Signing in…' : 'Sign in →'}
      </button>
    </form>
  )
}
