'use client'

import { useRef, useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import RfqAttachments from './RfqAttachments'
import { submitRfq } from '../app/(storefront)/quote/actions'

type Address = {
  id: string
  label: string
  lines: string[]
  city: string
  countryCode: string
}

type Props = {
  addresses: Address[]
  isAuthenticated: boolean
}

type LineItem = {
  sku: string
  title: string
  qty: number
  targetPrice?: string
  brand?: string
}

export default function RfqSubmitForm({ addresses, isAuthenticated }: Props) {
  const [lines, setLines] = useState<LineItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [urgency, setUrgency] = useState<'routine' | 'priority' | 'plant_down'>('routine')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const formStartedAt = useRef<number>(0)

  useEffect(() => {
    // SSR-safe hydration: localStorage is only available client-side.
    // Read once on mount and flip the gate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    formStartedAt.current = Date.now()
    try {
      const raw = localStorage.getItem('quote_items')
      if (raw) setLines(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)
    const fd = new FormData(e.currentTarget)
    fd.set('lines', JSON.stringify(lines))
    fd.set('urgency', urgency)
    fd.set('formStartedAt', String(formStartedAt.current))

    startTransition(async () => {
      const result = await submitRfq(fd)
      if (result && !result.success) {
        setErrorMsg(result.error)
        return
      }
      localStorage.removeItem('quote_items')
      // On success the server action redirects, so this branch isn't reached.
    })
  }

  if (!mounted) return null

  if (lines.length === 0) {
    return (
      <div className="py-16 border border-dashed border-ih-border text-center">
        <p className="text-ih-muted">No items in your quote.</p>
        <Link href={`/quote`} className="mt-3 inline-block font-mono text-[12px] text-ih-accent hover:underline">
          ← Back to quote builder
        </Link>
      </div>
    )
  }

  const URGENCY_OPTIONS = [
    {
      value: 'plant_down' as const,
      label: '● Plant down',
      meta: 'Reply within 30 min · 24/7',
      activeStyle: { border: '1px solid oklch(0.85 0.13 25)', background: 'oklch(0.97 0.04 25)' },
    },
    {
      value: 'priority' as const,
      label: '● This week',
      meta: 'Reply within 4 working hrs',
      activeStyle: { border: '1px solid oklch(0.85 0.1 60)', background: 'oklch(0.98 0.03 60)' },
    },
    {
      value: 'routine' as const,
      label: '● Standard',
      meta: 'Reply within 24 hrs',
      activeStyle: { border: '1px solid var(--color-ih-border)', background: 'var(--color-ih-surface)' },
    },
  ]

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
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

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Main form ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Anonymous contact details — shown only for visitors without an account.
              Signed-in users skip this section and submit under their session. */}
          {!isAuthenticated && (
            <section className="border border-ih-border bg-ih-surface p-6">
              <h2 className="text-[18px] font-semibold mb-1">Your contact details</h2>
              <p className="text-[13px] text-ih-muted mb-5">
                We need a way to reach you with availability and pricing. Already have an account?{' '}
                <Link href={`/sign-in?next=/quote/submit`} className="text-ih-accent hover:underline">
                  Sign in instead
                </Link>
                .
              </p>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                      First name *
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      required
                      placeholder="e.g. Rohit"
                      className="w-full h-10 px-3 border border-ih-border bg-ih-surface text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                      Last name *
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      required
                      placeholder="e.g. Kapoor"
                      className="w-full h-10 px-3 border border-ih-border bg-ih-surface text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                      Work email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="rohit@company.com"
                      className="w-full h-10 px-3 border border-ih-border bg-ih-surface text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                      Phone / WhatsApp
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+971 5X XXX XXXX"
                      className="w-full h-10 px-3 border border-ih-border bg-ih-surface text-[13px] text-ih-ink font-mono placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                    Company *
                  </label>
                  <input
                    name="company"
                    type="text"
                    required
                    placeholder="Your company / refinery / EPC"
                    className="w-full h-10 px-3 border border-ih-border bg-ih-surface text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-accent"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Project details */}
          <section className="border border-ih-border bg-ih-surface p-6">
            <h2 className="text-[18px] font-semibold mb-1">Project details</h2>
            <p className="text-[13px] text-ih-muted mb-5">The more you tell us, the better we can match SKUs and lead times.</p>

            <div className="flex flex-col gap-4">
              {/* Urgency radio cards */}
              <div>
                <label className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">
                  Urgency *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {URGENCY_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="cursor-pointer flex flex-col gap-1 p-3.5"
                      style={urgency === opt.value ? opt.activeStyle : { border: '1px solid var(--color-ih-border)', background: 'var(--color-ih-surface)' }}
                    >
                      <span className="flex items-center gap-2 font-semibold text-[14px]">
                        <input
                          type="radio"
                          name="urgency_display"
                          value={opt.value}
                          checked={urgency === opt.value}
                          onChange={() => setUrgency(opt.value)}
                          className="accent-ih-accent"
                        />
                        {opt.label}
                      </span>
                      <span className="font-mono text-[11px] text-ih-muted">{opt.meta}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                  RFQ subject
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="e.g. Annual Maintenance Hydraulic Pumps Q2 2026"
                  className="w-full h-10 px-3 border border-ih-border bg-ih-surface text-[13px] text-ih-ink placeholder:text-ih-muted-2 focus:outline-none focus:border-ih-accent"
                />
              </div>

              {/* Use case */}
              <div>
                <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                  Use case / application
                </label>
                <textarea
                  name="applicationContext"
                  rows={3}
                  placeholder={`Describe the equipment, line, or system. E.g. 'Replacement on Refinery Line 4, hot-oil duty, 200 bar continuous, 12hr/day'`}
                  className="w-full rounded-md border border-ih-border bg-ih-surface px-3 py-2.5 text-[13.5px] text-ih-ink outline-none transition-colors placeholder:text-ih-muted focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft resize-none"
                />
              </div>

              {/* Date + incoterm */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                    Target delivery date
                  </label>
                  <input
                    name="requestedDelivery"
                    type="date"
                    className="w-full h-10 rounded-md border border-ih-border bg-ih-surface px-3 text-[13.5px] text-ih-ink outline-none transition-colors focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                    Incoterm preference
                  </label>
                  <select
                    name="incoterm"
                    className="w-full h-10 rounded-md border border-ih-border bg-ih-surface px-3 text-[13.5px] text-ih-ink outline-none transition-colors focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft"
                  >
                    <option value="exw">Ex-works (EXW)</option>
                    <option value="fob">FOB · Jebel Ali, Dubai</option>
                    <option value="cif">CIF · destination port</option>
                    <option value="dap">DAP · door delivery</option>
                    <option value="">Not sure — advise</option>
                  </select>
                </div>
              </div>

              {/* Ship-to address */}
              {addresses.length > 0 && (
                <div>
                  <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                    Delivery address
                  </label>
                  <select
                    name="shipToAddressId"
                    className="w-full h-10 rounded-md border border-ih-border bg-ih-surface px-3 text-[13.5px] text-ih-ink outline-none transition-colors focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft"
                  >
                    <option value="">— Select address —</option>
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} · {addr.city}, {addr.countryCode}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Attachments — a real upload; this used to be a dashed box
                  with no file input behind it. */}
              <RfqAttachments />

              {/* Additional notes */}
              <div>
                <label className="mb-1.5 block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                  Additional notes
                </label>
                <textarea
                  name="customerMessage"
                  rows={2}
                  placeholder="Any other information for our team"
                  className="w-full rounded-md border border-ih-border bg-ih-surface px-3 py-2.5 text-[13.5px] text-ih-ink outline-none transition-colors placeholder:text-ih-muted focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft resize-none"
                />
              </div>
            </div>
          </section>

          {errorMsg && (
            <div role="alert" className="border border-[oklch(0.85_0.13_25)] bg-[oklch(0.97_0.04_25)] text-[oklch(0.4_0.15_25)] p-4 text-[13px]">
              {errorMsg}
            </div>
          )}

          {/* Footer row */}
          <div className="flex justify-between items-center py-3.5">
            <Link href={`/quote`} className="font-mono text-[12px] text-ih-muted hover:text-ih-ink transition-colors">
              ← Back to shortlist
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 px-8 flex items-center bg-ih-accent text-white text-[14px] font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isPending ? 'Submitting…' : 'Submit RFQ →'}
            </button>
          </div>
        </div>

        {/* ── Sticky sidebar ────────────────────────────────────── */}
        <aside className="lg:sticky lg:top-[88px]">
          <div className="border border-ih-border bg-ih-surface overflow-hidden">
            <div className="px-[18px] py-4 border-b border-ih-border flex justify-between items-center">
              <h3 className="text-[14px] font-semibold">Quoting · {lines.length} line{lines.length !== 1 ? 's' : ''}</h3>
              <Link href={`/quote`} className="text-[12px] text-ih-accent hover:underline">Edit</Link>
            </div>

            {/* Line items */}
            {lines.map((item) => (
              <div key={item.sku} className="grid gap-2 px-[18px] py-2 border-b border-ih-border last:border-0 text-[12px]" style={{ gridTemplateColumns: '1fr auto' }}>
                <div>
                  <div className="font-medium leading-snug">{item.title}</div>
                  <div className="font-mono text-[10px] text-ih-muted">{item.sku}</div>
                </div>
                <div className="font-mono text-right shrink-0">× {item.qty}</div>
              </div>
            ))}

            <div className="px-[18px] py-3.5 border-t border-ih-border flex justify-between font-semibold text-[13px]">
              <span>Lines</span>
              <span className="font-mono">{lines.length}</span>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-3.5 px-4 py-4 bg-ih-surface border border-ih-border text-[12px] text-ih-muted leading-[1.6]">
            <b className="text-ih-ink">What happens next</b><br />
            1. Confirmation email + RFQ ref<br />
            2. Sales engineer reviews lines<br />
            3. Fixed-price quote PDF in inbox<br />
            4. Approve to convert to order
          </div>
        </aside>
      </div>
    </form>
  )
}
