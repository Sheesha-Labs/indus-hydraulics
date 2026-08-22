'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Button, Field, Input, Textarea } from '@indus/ui'
import { submitMarketEnquiry } from '../../app/(storefront)/markets/actions'
import { MarketEnquiryError } from './MarketEnquiryError'
import { MarketEnquiryResult } from './MarketEnquiryResult'

/**
 * The short enquiry card in the closing navy band.
 *
 * Five fields against the mid-page form's nine, because it is catching a
 * different reader: someone who has scrolled the whole page without deciding
 * what to ask for. Anything that makes them think — an Incoterm they have not
 * chosen, a delivery city they have not settled — costs the enquiry. The desk
 * can ask for the rest in the reply.
 *
 * Same action, `source: 'market_quick_enquiry'`, so the two are countable
 * against each other.
 */
export default function MarketQuickEnquiry({
  marketSlug,
  marketName,
  countryCode,
  dialCode,
  contactEmail,
}: {
  marketSlug: string
  marketName: string
  countryCode: string
  dialCode: string
  contactEmail: string | null
}) {
  const [result, setResult] = useState<{ code: string; token: string } | null>(null)
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
    startTransition(async () => {
      const outcome = await submitMarketEnquiry(data)
      if (outcome.success) setResult({ code: outcome.code, token: outcome.token })
      else setError(outcome.error)
    })
  }

  return (
    <div className="rounded-lg border border-ih-border bg-ih-surface p-6 sm:px-7 sm:pb-7 sm:pt-[26px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[18px] font-medium tracking-[-0.01em]">Quick enquiry</h3>
        <span className="mono text-[10px] uppercase tracking-[0.1em] text-ih-muted-2">
          RFQ · {countryCode}
        </span>
      </div>

      {result ? (
        <div className="mt-5">
          <MarketEnquiryResult code={result.code} token={result.token} marketName={marketName} />
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="marketSlug" value={marketSlug} />
          <input type="hidden" name="source" value="market_quick_enquiry" />
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="sr-only"
          />

          <div className="mt-[18px] grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Name">
              <Input name="contactName" required autoComplete="name" placeholder="Your name" className="h-11 sm:h-9" />
            </Field>
            <Field label="Company">
              <Input name="company" required autoComplete="organization" placeholder="Company" className="h-11 sm:h-9" />
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
              <Input name="phone" type="tel" autoComplete="tel" placeholder={`${dialCode} …`} className="h-11 sm:h-9" />
            </Field>
          </div>

          <Field className="mt-3" label={`What do you need in ${marketName}?`}>
            <Textarea
              name="partList"
              rows={3}
              placeholder="Part numbers, or bore, thread and pressure — plus the delivery city."
            />
          </Field>

          {error && <MarketEnquiryError error={error} contactEmail={contactEmail} className="mt-4" />}

          <Button type="submit" kind="primary" size="lg" disabled={isPending} className="mt-4 w-full">
            {isPending ? 'Sending…' : 'Send the enquiry'}
            <span aria-hidden="true">{isPending ? '' : '→'}</span>
          </Button>

          <p className="mt-3 text-[11.5px] leading-[1.55] text-ih-muted">
            No account needed. We reply from the Dubai export desk.
          </p>
        </form>
      )}
    </div>
  )
}
