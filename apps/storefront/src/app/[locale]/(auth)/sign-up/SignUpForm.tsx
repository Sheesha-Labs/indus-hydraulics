'use client'

import { useTranslations } from 'next-intl'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@indus/ui'
import { signUpAction } from '../../../../actions/auth'

type State = { error?: string; success?: boolean } | null

const INDUSTRIES = ['Oil & Gas', 'Marine', 'Mining', 'Steel', 'Construction', 'Power', 'Other']
const SPEND_RANGES = ['Under $25k', '$25k – $100k', '$100k – $500k', 'Over $500k']
const COUNTRIES = ['India', 'UAE', 'Singapore', 'Other']

const inputCls =
  'h-10 w-full border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 text-sm text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors'

const selectCls =
  'h-10 w-full border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 text-sm text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] transition-colors'

export default function SignUpForm({ locale }: { locale: string }) {
  const t = useTranslations('auth')
  const router = useRouter()

  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await signUpAction(formData)
      if (!result.success) return { error: result.error }
      router.push(`/${locale}/sign-in?registered=1`)
      return { success: true }
    },
    null
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="locale" value={locale} />

      {state?.error && (
        <div role="alert" className="mb-4 px-4 py-3 text-sm text-[var(--color-danger)] border border-[var(--color-danger)] bg-[oklch(0.97_0.02_25)]">
          {state.error}
        </div>
      )}

      <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden">
        {/* Step 1 — You */}
        <div className="px-7 py-6 border-b border-[var(--color-border)]">
          <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase mb-3.5">
            {t('step1You')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('fullName')} *</label>
              <input name="fullName" type="text" required className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('jobTitle')}</label>
              <input name="jobTitle" type="text" placeholder="e.g. Procurement Manager" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('workEmail')} *</label>
              <input name="email" type="email" required placeholder="you@company.com" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('phone')} *</label>
              <input name="phone" type="tel" required placeholder="+91 …" className={`${inputCls} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('password')} *</label>
              <input name="password" type="password" required placeholder={t('passwordHint')} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Step 2 — Company */}
        <div className="px-7 py-6 border-b border-[var(--color-border)]">
          <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase mb-3.5">
            {t('step2Company')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('companyName')} *</label>
              <input name="companyName" type="text" required className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('industry')} *</label>
              <select name="industry" required className={selectCls}>
                <option value="">{t('selectIndustry')}</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('annualSpend')}</label>
              <select name="annualSpend" className={selectCls}>
                {SPEND_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('taxId')}</label>
              <input name="taxId" type="text" className={`${inputCls} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-body)]">{t('country')} *</label>
              <select name="country" required className={selectCls}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3 — Needs */}
        <div className="px-7 py-6">
          <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase mb-3.5">
            {t('step3Needs')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3.5">
            {[
              { value: 'rfq', label: t('needRfq') },
              { value: 'engineering', label: t('needEngineering') },
              { value: 'mro', label: t('needMro') },
              { value: 'fieldservice', label: t('needFieldService') },
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 px-3 py-3 border border-[var(--color-border)] bg-[var(--color-surface)] cursor-pointer text-[13px] hover:bg-[var(--color-deep)] transition-colors"
              >
                <input type="checkbox" name="needs" value={value} className="w-4 h-4 accent-[var(--color-accent)]" />
                {label}
              </label>
            ))}
          </div>

          <label className="flex items-start gap-2 text-[13px] text-[var(--color-muted)] font-normal cursor-pointer leading-relaxed">
            <input
              type="checkbox"
              name="agreedToTerms"
              required
              className="w-4 h-4 mt-0.5 accent-[var(--color-accent)] flex-shrink-0"
            />
            <span>
              {t('agreeToTerms')}{' '}
              <a href={`/${locale}/terms`} className="text-[var(--color-accent)]">{t('terms')}</a>{' '}
              {t('and')}{' '}
              <a href={`/${locale}/privacy`} className="text-[var(--color-accent)]">{t('privacyPolicy')}</a>.{' '}
              {t('agreeNotice')}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-7 py-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <span className="font-mono text-[11px] text-[var(--color-muted)]">
            {t('verificationNote')}
          </span>
          <Button type="submit" variant="accent" size="lg" loading={pending}>
            {t('createAccount')} →
          </Button>
        </div>
      </div>
    </form>
  )
}
