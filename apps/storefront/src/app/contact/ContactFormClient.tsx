'use client'

import { useActionState, useState } from 'react'
import { submitContactForm, type ContactFormState } from './actions'

const TABS = [
  { id: 'quotation', label: 'Quotation request' },
  { id: 'application', label: 'Application help' },
  { id: 'general', label: 'General enquiry' },
] as const

const INDUSTRIES = [
  'Oil & Gas',
  'Marine',
  'Mining',
  'Steel & Metals',
  'Construction',
  'Power & Energy',
  'Other',
]

const initialState: ContactFormState = { status: 'idle' }

export default function ContactFormClient() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const [inquiryType, setInquiryType] = useState<typeof TABS[number]['id']>('quotation')

  const fieldErrors = state.status === 'error' ? state.fieldErrors ?? {} : {}

  if (state.status === 'success') {
    return (
      <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-9">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-accent)] mb-3">
          Message sent
        </div>
        <h2 className="text-[22px] font-semibold tracking-[-0.01em] mb-2">Thanks — we&apos;ll be in touch.</h2>
        <p className="text-[14px] text-[var(--color-muted)] leading-[1.6] mb-4">
          Our team has been notified and will respond within 4 business hours. For plant-down or urgent
          requests, please use WhatsApp or call us directly — those channels are staffed 24/7.
        </p>
        <p className="font-mono text-[11px] text-[var(--color-caption)]">
          Reference: {state.ref}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-9">
      <h2 className="text-[22px] font-semibold tracking-[-0.01em] mb-1">Send us a message</h2>
      <p className="text-[14px] text-[var(--color-muted)] mb-6">Or pick a faster channel on the right →</p>

      <div className="flex gap-1 mb-6 p-1 bg-[var(--color-surface)] border border-[var(--color-border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setInquiryType(tab.id)}
            className={`flex-1 py-2.5 px-3.5 text-[13px] font-medium transition-colors ${
              inquiryType === tab.id
                ? 'bg-[var(--color-primary)] text-[var(--color-elevated)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-body)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="inquiryType" value={inquiryType} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="First name *" name="firstName" placeholder="e.g. Rohit" required error={fieldErrors.firstName} />
          <Field label="Last name *" name="lastName" placeholder="e.g. Kapoor" required error={fieldErrors.lastName} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Work email *" name="email" type="email" placeholder="rohit@company.com" required error={fieldErrors.email} />
          <Field label="Phone / WhatsApp" name="phone" type="tel" placeholder="+971 5X XXX XXXX" mono error={fieldErrors.phone} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Company *" name="company" placeholder="Your company" required error={fieldErrors.company} />
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Industry</label>
            <select
              name="industry"
              defaultValue=""
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="">Select…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
        <Field
          label="SKUs or part numbers"
          name="skus"
          placeholder="e.g. IH-AP71-D-R-V, A10VSO 71cc"
          mono
          hint="Separate multiple SKUs with commas"
          error={fieldErrors.skus}
        />
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">Message / application details</label>
          <textarea
            name="message"
            rows={4}
            placeholder="Describe the equipment, failure mode, application, or question…"
            className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
          {fieldErrors.message && <ErrorText>{fieldErrors.message}</ErrorText>}
        </div>

        {state.status === 'error' && !Object.keys(fieldErrors).length && (
          <p className="text-[13px] text-[var(--color-danger)] py-2">{state.message}</p>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-2)]">
          <p className="text-[12px] text-[var(--color-muted)] max-w-[280px] leading-[1.4]">
            By submitting, you agree to our privacy policy. We don&apos;t share your data.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="h-10 px-6 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            {isPending ? 'Sending…' : 'Send message →'}
          </button>
        </div>
      </form>
    </div>
  )
}

type FieldProps = {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  mono?: boolean
  hint?: string
  error?: string
}

function Field({ label, name, type = 'text', placeholder, required, mono, hint, error }: FieldProps) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[var(--color-body)] mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className={`w-full h-10 px-3 border bg-[var(--color-surface)] text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] ${
          mono ? 'font-mono' : ''
        } ${error ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'}`}
      />
      {hint && !error && <p className="font-mono text-[11px] text-[var(--color-muted)] mt-1">{hint}</p>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-[var(--color-danger)] mt-1">{children}</p>
}
