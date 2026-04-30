'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'
import { Button } from '@indus/ui'
import { forgotPasswordAction } from '../../../../actions/auth'

type State = { step: 'request' } | { step: 'sent'; email: string } | { step: 'request'; error: string }

export default function ForgotPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations('auth')

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
        <h1 className="text-[32px] font-semibold tracking-tight mb-2">{t('checkYourInbox')}</h1>
        <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-6">
          {t('resetEmailSent', { email: state.email })}
        </p>

        <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 text-[13px] text-[var(--color-muted)] leading-[1.7] mb-8">
          <b className="text-[var(--color-primary)] text-[12px] uppercase tracking-[0.1em] font-mono block mb-1">
            {t('didntGetIt')}
          </b>
          {t('checkSpamFolder')}
          <br />
          {t('whitelistDomain')}
          <br />
          {t('waitAndRetry')}{' '}
          <a href={`/${locale}/forgot-password`} className="text-[var(--color-accent)] hover:underline">
            {t('tryAgain')}
          </a>
        </div>

        <a
          href={`/${locale}/sign-in`}
          className="text-[13px] text-[var(--color-accent)] font-medium hover:underline"
        >
          ← {t('backToSignIn')}
        </a>
      </div>
    )
  }

  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-1.5">
        {t('customerPortal')}
      </p>
      <h1 className="text-[36px] font-semibold tracking-tight mb-2">{t('resetPassword')}</h1>
      <p className="text-[var(--color-muted)] text-sm leading-relaxed mb-7 max-w-[400px]">
        {t('resetPasswordSubtitle')}
      </p>

      {'error' in state && state.error && (
        <div role="alert" className="mb-4 px-4 py-3 text-sm text-[var(--color-danger)] border border-[var(--color-danger)] bg-[oklch(0.97_0.02_25)]">
          {state.error}
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-email" className="text-xs font-medium text-[var(--color-body)]">
            {t('workEmail')}
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
          {t('sendResetLink')} →
        </Button>
      </form>

      <div className="flex justify-between items-center mt-8 text-[13px]">
        <a href={`/${locale}/sign-in`} className="text-[var(--color-accent)] font-medium hover:underline">
          ← {t('backToSignIn')}
        </a>
        <a href={`/${locale}/contact`} className="text-[var(--color-muted)] hover:underline">
          {t('needHelp')}
        </a>
      </div>

      <div className="mt-12 p-4 border border-[var(--color-border)] bg-[var(--color-elevated)]">
        <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--color-caption)] uppercase mb-2">
          {t('security')}
        </p>
        <p className="text-[12px] text-[var(--color-muted)] leading-relaxed">
          {t('securityNote')}
        </p>
      </div>
    </div>
  )
}
