'use client'

import { useActionState } from 'react'
import { Button } from '@indus/ui'
import { signInAction } from '../../../../actions/auth'

type State = { error?: string } | null

export default function SignInForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await signInAction(formData)
      if (!result.success) return { error: result.error }
      return null
    },
    null
  )

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      {state?.error && (
        <div
          role="alert"
          className="px-4 py-3 text-sm text-ih-danger border border-ih-danger bg-[oklch(0.97_0.02_25)]"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-ih-ink-2">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
          className="h-10 w-full border border-ih-border bg-ih-surface px-3 text-sm text-ih-ink placeholder:text-ih-muted-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="password" className="text-xs font-medium text-ih-ink-2">
            Password
          </label>
          <a
            href="forgot-password"
            className="text-[12px] text-ih-accent hover:underline"
          >
            Forgot?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 w-full border border-ih-border bg-ih-surface px-3 text-sm text-ih-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent transition-colors"
        />
      </div>

      <label className="flex items-center gap-2 text-[13px] text-ih-muted font-normal cursor-pointer select-none">
        <input
          type="checkbox"
          name="rememberMe"
          className="w-4 h-4 accent-ih-accent rounded-none"
        />
        Keep me signed in on this device
      </label>

      <Button
        type="submit"
        kind="primary"
        size="lg"
        block
        loading={pending}
        className="mt-1.5"
      >
        Sign in →
      </Button>
    </form>
  )
}
