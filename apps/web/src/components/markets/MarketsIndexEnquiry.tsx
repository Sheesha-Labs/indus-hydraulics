'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Button, Field, Input, Textarea } from '@indus/ui'
import { submitMarketEnquiry } from '../../app/(storefront)/markets/actions'
import { MarketEnquiryResult } from './MarketEnquiryResult'

/**
 * The closing enquiry card on `/markets`.
 *
 * THE DESTINATION FIELD IS FREE TEXT, AND THAT IS THE WHOLE POINT. This form
 * exists for the destinations that are not already on the page, so validating
 * the input against the 126 would reject exactly the enquiries it was built to
 * catch. The `<datalist>` is a typing aid and nothing else — a buyer can
 * ignore it and type anything.
 *
 * Posts to the same action as the two market-page forms with
 * `source: 'markets_index_enquiry'`, so the three are countable against each
 * other. See the docblock on `MarketEnquirySource`.
 *
 * ONE FIELD THE DESIGN DID NOT DRAW: a contact name. The design's four-field
 * grid dropped it to cut friction on a cold surface, but an anonymous RFQ
 * creates a real `AccountContact` and both the confirmation email and the
 * desk's reply address a person. An unnamed contact row is a worse trade than
 * one more input.
 */
export default function MarketsIndexEnquiry({
  destinations,
  contactEmail,
}: {
  /** Typing aid for the destination field. Never used for validation. */
  destinations: readonly string[]
  contactEmail: string | null
}) {
  const [result, setResult] = useState<{ code: string; token: string; destination: string } | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const startedAt = useRef(0)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const data = new FormData(event.currentTarget)
    data.set('formStartedAt', String(startedAt.current))
    const destination = String(data.get('destinationCountry') ?? '').trim()
    startTransition(async () => {
      const outcome = await submitMarketEnquiry(data)
      if (outcome.success) setResult({ code: outcome.code, token: outcome.token, destination })
      else setError(outcome.error)
    })
  }

  return (
    <div className="rounded-lg border border-ih-border bg-ih-surface p-6 sm:px-7 sm:pb-7 sm:pt-[26px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[18px] font-medium tracking-[-0.01em]">Ask about a destination</h3>
        <span className="mono text-[10px] uppercase tracking-[0.1em] text-ih-muted-2">RFQ</span>
      </div>

      {result ? (
        <div className="mt-5">
          {/*
            The confirmation names the destination the buyer typed, not a
            market we picked for them — this form's whole premise is that we
            may not run the lane yet.
          */}
          <MarketEnquiryResult
            code={result.code}
            token={result.token}
            marketName={result.destination}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="source" value="markets_index_enquiry" />
          {/* Honeypot — a real browser never fills an off-screen unlabelled
              field. Matches the market-page forms exactly. */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="sr-only"
          />

          <Field className="mt-[18px]" label="Destination country">
            <Input
              name="destinationCountry"
              required
              list="mk-destinations"
              autoComplete="country-name"
              placeholder="Where it ships to"
            />
          </Field>
          <datalist id="mk-destinations">
            {destinations.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name">
              <Input name="contactName" required autoComplete="name" placeholder="Your name" />
            </Field>
            <Field label="Company">
              <Input name="company" required autoComplete="organization" placeholder="Registered name" />
            </Field>
            <Field label="Work email">
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="name@company.com"
              />
            </Field>
            <Field label="Phone / WhatsApp">
              <Input name="phone" type="tel" autoComplete="tel" placeholder="+971 …" />
            </Field>
          </div>

          <Field className="mt-3" label="What do you need?">
            <Textarea
              name="partList"
              rows={3}
              required
              placeholder="Part numbers, or bore, thread and pressure — plus the delivery city."
            />
          </Field>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-ih-danger bg-ih-danger-soft px-3.5 py-2.5 text-[13px] leading-[1.55] text-ih-danger-ink"
            >
              {error}
              {/* Only offer the fallback when the message has not already
                  named it. The honeypot's reply carries the address itself,
                  and appending it unconditionally printed it twice. */}
              {contactEmail && !error.includes(contactEmail) && (
                <>
                  {' '}
                  Or email{' '}
                  <a className="underline underline-offset-2" href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                  .
                </>
              )}
            </p>
          )}

          <Button type="submit" kind="primary" size="lg" disabled={isPending} className="mt-4 w-full">
            {isPending ? 'Sending…' : 'Send the enquiry'}
            <span aria-hidden="true">{isPending ? '' : '→'}</span>
          </Button>

          <p className="mt-3 text-[11.5px] leading-[1.55] text-ih-muted">
            No account needed. We reply from the Dubai export desk, Mon–Fri 09:00–18:00 GST.
          </p>
        </form>
      )}
    </div>
  )
}
