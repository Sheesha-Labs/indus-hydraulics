'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Select } from '@indus/ui'
import { signUpAction } from '../../../../actions/auth'

type State = { error?: string; success?: boolean } | null

const INDUSTRIES = ['Oil & Gas', 'Marine', 'Mining', 'Steel', 'Construction', 'Power', 'Other']
const SPEND_RANGES = ['Under $25k', '$25k – $100k', '$100k – $500k', 'Over $500k']
const COUNTRIES = ['UAE', 'Saudi Arabia', 'Oman', 'Qatar', 'Bahrain', 'Kuwait', 'Other']

const inputCls =
  'h-10 w-full border border-ih-border bg-ih-surface px-3 text-sm text-ih-ink placeholder:text-ih-muted-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent transition-colors'

const selectCls =
  'h-10 w-full border border-ih-border bg-ih-surface px-3 text-sm text-ih-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent transition-colors'

export default function SignUpForm() {
  const router = useRouter()

  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await signUpAction(formData)
      if (!result.success) return { error: result.error }
      router.push(`/sign-in?registered=1`)
      return { success: true }
    },
    null
  )

  return (
    <form action={formAction}>
      {state?.error && (
        <div role="alert" className="mb-4 px-4 py-3 text-sm text-ih-danger border border-ih-danger bg-[oklch(0.97_0.02_25)]">
          {state.error}
        </div>
      )}

      <div className="border border-ih-border bg-ih-surface overflow-hidden">
        {/* Step 1 — You */}
        <div className="px-7 py-6 border-b border-ih-border">
          <p className="font-mono text-[11px] tracking-[0.1em] text-ih-muted uppercase mb-3.5">
            Step 1 · You
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-fullName" className="text-xs font-medium text-ih-ink-2">Full name *</label>
              <Input
                id="signup-fullName" name="fullName" type="text" required className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-jobTitle" className="text-xs font-medium text-ih-ink-2">Job title</label>
              <Input
                id="signup-jobTitle" name="jobTitle" type="text" placeholder="e.g. Procurement Manager" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-email" className="text-xs font-medium text-ih-ink-2">Work email *</label>
              <Input
                id="signup-email" name="email" type="email" required placeholder="you@company.com" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-phone" className="text-xs font-medium text-ih-ink-2">Phone *</label>
              <Input
                id="signup-phone" name="phone" type="tel" required placeholder="+971 …" className={`${inputCls} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="signup-password" className="text-xs font-medium text-ih-ink-2">Password *</label>
              <Input
                id="signup-password" name="password" type="password" required placeholder="Min 10 characters" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Step 2 — Company */}
        <div className="px-7 py-6 border-b border-ih-border">
          <p className="font-mono text-[11px] tracking-[0.1em] text-ih-muted uppercase mb-3.5">
            Step 2 · Your Company
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="signup-companyName" className="text-xs font-medium text-ih-ink-2">Company name *</label>
              <Input
                id="signup-companyName" name="companyName" type="text" required className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-industry" className="text-xs font-medium text-ih-ink-2">Industry *</label>
              <Select
                id="signup-industry" name="industry" required className={selectCls}>
                <option value="">Select…</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-annualSpend" className="text-xs font-medium text-ih-ink-2">Annual hydraulics spend (est.)</label>
              <Select
                id="signup-annualSpend" name="annualSpend" className={selectCls}>
                {SPEND_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-taxId" className="text-xs font-medium text-ih-ink-2">VAT / TRN</label>
              <Input
                id="signup-taxId" name="taxId" type="text" className={`${inputCls} font-mono`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-country" className="text-xs font-medium text-ih-ink-2">Country *</label>
              <Select
                id="signup-country" name="country" required className={selectCls}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Step 3 — Needs */}
        <div className="px-7 py-6">
          <p className="font-mono text-[11px] tracking-[0.1em] text-ih-muted uppercase mb-3.5">
            Step 3 · What You Need From Us
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3.5">
            {[
              { value: 'rfq', label: 'Procurement / RFQs' },
              { value: 'engineering', label: 'System design / engineering support' },
              { value: 'mro', label: 'Spare parts / MRO' },
              { value: 'fieldservice', label: 'Field service / commissioning' },
            ].map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-2.5 px-3 py-3 border border-ih-border bg-ih-bg cursor-pointer text-[13px] hover:bg-ih-surface-2 transition-colors"
              >
                <input type="checkbox" name="needs" value={value} className="w-4 h-4 accent-ih-accent" />
                {label}
              </label>
            ))}
          </div>

          <label className="flex items-start gap-2 text-[13px] text-ih-muted font-normal cursor-pointer leading-relaxed">
            <input
              type="checkbox"
              name="agreedToTerms"
              required
              className="w-4 h-4 mt-0.5 accent-ih-accent flex-shrink-0"
            />
            <span>
              I agree to the{' '}
              <a href={`/terms`} className="text-ih-accent">Terms</a>{' '}
              and{' '}
              <a href={`/privacy`} className="text-ih-accent">Privacy Policy</a>.{' '}
              Indus may contact me about my account.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-7 py-4 bg-ih-bg border-t border-ih-border">
          <span className="font-mono text-[11px] text-ih-muted">
            Verification typically completes within 2 working hours.
          </span>
          <Button type="submit" kind="primary" size="lg" loading={pending}>
            Create your B2B account →
          </Button>
        </div>
      </div>
    </form>
  )
}
