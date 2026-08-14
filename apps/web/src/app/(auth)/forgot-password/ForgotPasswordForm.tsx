'use client'

import { useActionState } from 'react'
import { Button } from '@indus/ui'
import { forgotPasswordAction } from '../../../actions/auth'

type State = { step: 'request' } | { step: 'sent'; email: string } | { step: 'request'; error: string }

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await forgotPasswordAction(formData)
      if (!result.success) return { step: 'request', error: result.error }
      return { step: 'sent', email: result.data.email }
    },
    { step: 'request' }
  )

  if (state.step === 'sent') {
    return (
      <div>
        <div className="w-12 h-12 border border-[var(--color-border)] rounded-full grid place-items-center text-[var(--color-good)] text-2xl mb-4">
          ✓
        </div>
        <h1 className="text-[32px] font-semibold tracking-tight mb-2">Check your inbox</h1>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-6">
          If {state.email} exists in our system, a reset link is on its way. The link expires in 60 minutes.
        </p>

        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 text-[13px] text-[var(--color-muted)] leading-[1.7] mb-8">
          <b className="text-[var(--color-primary)] text-[12px] uppercase tracking-[0.1em] font-mono block mb-1">
            Didn&apos;t get it?
          </b>
          Check your spam folder · the sender is noreply@indushydraulics.com
          <br />
          Whitelist the domain with your IT team for B2B accounts
          <br />
          Wait 2 minutes, then{' '}
          <a href={`/forgot-password`} className="text-[var(--color-accent)] hover:underline">
            try again
          </a>
        </div>

        <a
          href={`/sign-in`}
          className="text-[13px] text-[var(--color-accent)] font-medium hover:underline"
        >
          ← Back to sign in
        </a>
      </div>
    )
  }

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-1.5">
        Customer Portal
      </p>
      <h1 className="text-[36px] font-semibold tracking-tight mb-2">Reset your password</h1>
      <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-7 max-w-[400px]">
        Enter the email tied to your Indus account. We will send a reset link valid for 60 minutes.
      </p>

      {'error' in state && state.error && (
        <div role="alert" className="mb-4 px-4 py-3 text-sm text-[var(--color-danger)] border border-[var(--color-danger)] bg-[oklch(0.97_0.02_25)]">
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-email" className="text-xs font-medium text-[var(--color-body)]">
            Work email
          </label>
          <input
            id="reset-email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-10 w-full border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors"
          />
        </div>
        <Button type="submit" variant="accent" size="lg" block loading={pending} className="mt-1.5">
          Send reset link →
        </Button>
      </form>

      <div className="flex justify-between items-center mt-8 text-[13px]">
        <a href={`/sign-in`} className="text-[var(--color-accent)] font-medium hover:underline">
          ← Back to sign in
        </a>
        <a href={`/contact`} className="text-[var(--color-muted)] hover:underline">
          Need help? Contact us
        </a>
      </div>

      <div className="mt-12 p-4 border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-caption)] uppercase mb-2">
          Security
        </p>
        <p className="text-[12px] text-[var(--color-muted)] leading-relaxed">
          For B2B accounts on contract pricing, password resets are logged and your account manager is notified. After 5 failed sign-in attempts the account is locked for 15 minutes.
        </p>
      </div>
    </div>
  )
}
