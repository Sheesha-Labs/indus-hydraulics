'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Button, Checkbox, Field, Input, Select, Textarea } from '@indus/ui'
import RfqAttachments from '../RfqAttachments'
import { submitMarketEnquiry } from '../../app/(storefront)/markets/actions'
import { MarketEnquiryResult } from './MarketEnquiryResult'

/**
 * The primary conversion on a market page — the full quote form, placed
 * immediately after the catalogue index.
 *
 * Position is the design: a reader who has just scrolled 157 sub-range links
 * knows what they want and is at peak intent. The short card in the closing
 * band catches the other reader, the one who scrolled past this undecided.
 * Both post to `submitMarketEnquiry` with different `source` values so the
 * split between the two is measurable rather than guessed at.
 *
 * Client-side validation is deliberately thin — `required` and `type="email"`
 * and nothing else. The server re-checks everything, and a form that argues
 * with a buyer about their own phone number format loses the enquiry. Phone
 * accepts anything; the placeholder carries the market's dial code, which does
 * more for data quality than a mask would.
 */
export default function MarketQuoteForm({
  marketSlug,
  marketName,
  countryCode,
  currency,
  dialCode,
  cities,
  incoterms,
  urgencies,
  contactPhone,
  contactEmail,
  contactHours,
}: {
  marketSlug: string
  marketName: string
  countryCode: string
  currency: string
  dialCode: string
  cities: readonly string[]
  incoterms: readonly string[]
  urgencies: readonly string[]
  contactPhone: string | null
  contactEmail: string | null
  contactHours: string | null
}) {
  const [result, setResult] = useState<{ code: string; token: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const startedAt = useRef(0)

  useEffect(() => {
    // Stamped on mount and posted with the form. The action rejects anything
    // filled in faster than a human could — see MIN_FORM_DURATION_MS.
    startedAt.current = Date.now()
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const data = new FormData(event.currentTarget)
    data.set('formStartedAt', String(startedAt.current))
    startTransition(async () => {
      const outcome = await submitMarketEnquiry(data)
      if (outcome.success) setResult({ code: outcome.code, token: outcome.token })
      // On failure every entered value stays put — the form is never
      // re-rendered from scratch, only the message above the submit changes.
      else setError(outcome.error)
    })
  }

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-ih-border bg-ih-surface shadow-[var(--shadow-1)] lg:grid-cols-[minmax(0,1fr)_minmax(0,348px)]">
      <div className="px-6 py-8 sm:px-9 sm:pb-9 sm:pt-[34px]">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-muted">
          Export quote · {countryCode}
        </p>
        <h2 className="mt-3 font-serif text-[26px] leading-[1.12] sm:text-[32px]">
          Send the part list for {marketName}
        </h2>

        {result ? (
          <div className="mt-6">
            <MarketEnquiryResult code={result.code} token={result.token} marketName={marketName} />
          </div>
        ) : (
          <>
            <p className="mt-2.5 max-w-[620px] text-[13.5px] leading-[1.6] text-ih-muted">
              Part numbers if you have them; bore, thread and pressure if you do not. A photo of the
              failed part is usually enough.
            </p>

            <form onSubmit={handleSubmit} noValidate={false}>
              <input type="hidden" name="marketSlug" value={marketSlug} />
              <input type="hidden" name="source" value="market_quote_form" />
              {/* Honeypot. Off-screen rather than display:none — some bots skip
                  hidden fields but fill anything they can see in the DOM. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
              />

              <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Company">
                  <Input name="company" required autoComplete="organization" placeholder="Registered name" className="h-11 sm:h-9" />
                </Field>
                <Field label="Contact name">
                  <Input name="contactName" required autoComplete="name" placeholder="Who we reply to" className="h-11 sm:h-9" />
                </Field>
                <Field label="Delivery city">
                  {/* Defaults to empty so the choice is deliberate — a
                      pre-selected first city is the one nobody notices is
                      wrong until the freight is quoted to the wrong place. */}
                  <Select name="deliveryCity" defaultValue="" className="h-11 sm:h-9">
                    <option value="">Select…</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value={`Elsewhere in ${marketName}`}>Elsewhere in {marketName}</option>
                  </Select>
                </Field>
                <Field label="Work email">
                  <Input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@company.com"
                    className="h-11 sm:h-9"
                  />
                </Field>
                <Field label="Phone / WhatsApp">
                  <Input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={`${dialCode} …`}
                    className="h-11 sm:h-9"
                  />
                </Field>
                <Field label="Incoterm">
                  <Select name="incoterm" defaultValue="" className="h-11 sm:h-9">
                    <option value="">Advise us</option>
                    {incoterms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field
                className="mt-3.5"
                label="Part numbers, or bore, thread and pressure"
                hint="One line per item. Quantities and lengths help us quote from stock."
              >
                {/* Both placeholder lines earn their place: one shows a real
                    part number, one shows a spec-only line. Between them they
                    teach the format without a paragraph of instructions. */}
                <Textarea
                  name="partList"
                  rows={4}
                  placeholder={'IH-2SN-12-BSP · 40 m · crimped both ends\n3/4" bore, JIC 37° female, 275 bar · qty 12'}
                />
              </Field>

              <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_240px] lg:items-end">
                <RfqAttachments />
                <Field label="Needed by">
                  <Select name="neededBy" defaultValue={urgencies[0]} className="h-11 sm:h-9">
                    {urgencies.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-md border border-ih-danger bg-ih-danger-soft px-3.5 py-2.5 text-[13px] leading-[1.55] text-ih-danger-ink"
                >
                  {error}
                  {contactEmail && (
                    <>
                      {' '}
                      You can also send it straight to{' '}
                      <a className="underline underline-offset-2" href={`mailto:${contactEmail}`}>
                        {contactEmail}
                      </a>
                      .
                    </>
                  )}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3.5">
                <Button type="submit" kind="primary" size="lg" disabled={isPending}>
                  {isPending ? 'Sending…' : 'Request an export quote'}
                  <span aria-hidden="true">{isPending ? '' : '→'}</span>
                </Button>
                <Checkbox
                  name="wantsChecklist"
                  defaultChecked
                  label={`Send me the conformity checklist for ${marketName}`}
                />
              </div>
            </form>
          </>
        )}
      </div>

      <aside className="flex flex-col bg-ih-navy px-7 py-8 sm:py-[34px]">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-ih-steel">What comes back</p>
        <ul className="mt-[18px] flex list-none flex-col gap-3.5 p-0">
          {[
            `A quote in ${currency} against real stock, not an indication.`,
            'The Incoterm stated on the Estimate rather than assumed.',
            `The document set for ${marketName}, listed line by line.`,
            'Lead time split into picking, papers and freight.',
          ].map((promise) => (
            <li key={promise} className="flex gap-2.5">
              <CheckIcon />
              <span className="text-[13px] leading-[1.55] text-white/85">{promise}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-white/15 pt-6">
          <p className="mono text-[10px] uppercase tracking-[0.12em] text-ih-steel">
            Or reach the export desk
          </p>
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="mono mt-2.5 block text-[14px] text-white hover:text-ih-steel">
              {contactPhone}
            </a>
          )}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="mt-1.5 block text-[12.5px] text-white/80 hover:text-white">
              {contactEmail}
            </a>
          )}
          {contactHours && (
            <p className="mono mt-3 text-[10px] uppercase tracking-[0.08em] text-white/60">{contactHours}</p>
          )}
        </div>
      </aside>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-ih-steel)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-[3px] shrink-0"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
