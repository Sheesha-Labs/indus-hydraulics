'use client'

import { useActionState, useState } from 'react'
import { submitContactForm, type ContactFormState } from './actions'
import { Input, Select, Textarea, Field as UiField } from '@indus/ui'
import PhoneInput from '../../../components/phone/PhoneInput'

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
  const [inquiryType, setInquiryType] = useState<(typeof TABS)[number]['id']>('quotation')
  // Captured once on mount so anti-spam can reject instant submissions.
  // Bots POST immediately; humans take seconds.
  const [formStartedAt] = useState<string>(() => String(Date.now()))

  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {}

  if (state.status === 'success') {
    return (
      <div className="border-ih-border bg-ih-surface min-w-0 rounded-lg border p-5 sm:p-9">
        <div className="text-ih-accent mb-3 font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
          Message sent
        </div>
        <h2 className="mb-2 text-[22px] font-semibold tracking-[-0.01em]">
          Thanks — we&apos;ll be in touch.
        </h2>
        <p className="text-ih-muted mb-4 text-[14px] leading-[1.6]">
          Your enquiry has gone to our sales and purchase teams, and a copy is on its way to your
          inbox. We respond within 4 business hours. For plant-down or urgent requests, please use
          WhatsApp or call us directly — those channels are staffed 24/7.
        </p>
        <p className="text-ih-muted-2 font-mono text-[11px]">Reference: {state.ref}</p>
      </div>
    )
  }

  return (
    <div className="border-ih-border bg-ih-surface min-w-0 rounded-lg border p-5 sm:p-9">
      <h2 className="mb-1 text-[22px] font-semibold tracking-[-0.01em]">Send us a message</h2>
      <p className="text-ih-muted mb-6 text-[14px]">
        Or use a faster channel — WhatsApp, phone or email, listed alongside.
      </p>

      <div className="bg-ih-bg border-ih-border mb-6 flex gap-1 rounded-md border p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setInquiryType(tab.id)}
            className={`flex-1 rounded-sm px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
              inquiryType === tab.id ? 'bg-ih-navy text-white' : 'text-ih-muted hover:text-ih-ink-2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-3">
        {/* Honeypot — must stay empty. Hidden from sighted users + screen readers. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
          defaultValue=""
        />
        <input type="hidden" name="formStartedAt" value={formStartedAt} />
        <input type="hidden" name="inquiryType" value={inquiryType} />

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="First name *"
            name="firstName"
            placeholder="e.g. Rohit"
            required
            error={fieldErrors.firstName}
          />
          <Field
            label="Last name *"
            name="lastName"
            placeholder="e.g. Kapoor"
            required
            error={fieldErrors.lastName}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Work email *"
            name="email"
            type="email"
            placeholder="rohit@company.com"
            required
            error={fieldErrors.email}
          />
          <UiField label="Phone / WhatsApp" error={fieldErrors.phone}>
            <PhoneInput />
          </UiField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Company *"
            name="company"
            placeholder="Your company"
            required
            error={fieldErrors.company}
          />
          <div>
            <label
              htmlFor="contact-industry"
              className="text-ih-ink-2 mb-1.5 block text-[12px] font-medium"
            >
              Industry
            </label>
            <Select id="contact-industry" name="industry" defaultValue="">
              <option value="">Select…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </Select>
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
          <label
            htmlFor="contact-message"
            className="text-ih-ink-2 mb-1.5 block text-[12px] font-medium"
          >
            Message / application details
          </label>
          <Textarea
            id="contact-message"
            name="message"
            rows={4}
            placeholder="Describe the equipment, failure mode, application, or question…"
            className="resize-none"
          />
          {fieldErrors.message && <ErrorText>{fieldErrors.message}</ErrorText>}
        </div>

        {state.status === 'error' && !Object.keys(fieldErrors).length && (
          <p className="text-ih-danger py-2 text-[13px]">{state.message}</p>
        )}

        <div className="border-ih-border flex items-center justify-between border-t pt-4">
          <p className="text-ih-muted max-w-[280px] text-[12px] leading-[1.4]">
            By submitting, you agree to our privacy policy. We don&apos;t share your data.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="bg-ih-accent hover:bg-ih-accent-hover h-10 rounded-md px-6 text-[13px] font-medium whitespace-nowrap text-white transition-colors disabled:opacity-50"
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

/**
 * Thin wrapper over the shared primitive. It used to reimplement the field
 * from scratch — its own border, its own focus treatment, and a <label> with
 * no htmlFor, so clicking the label focused nothing. UiField generates the id
 * and wires the label, the hint, and the error state.
 */
function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required,
  mono,
  hint,
  error,
}: FieldProps) {
  return (
    <UiField label={label} hint={hint} error={error}>
      <Input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        error={error}
        className={mono ? 'font-mono' : undefined}
      />
    </UiField>
  )
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-ih-danger mt-1 text-[12px]">{children}</p>
}
