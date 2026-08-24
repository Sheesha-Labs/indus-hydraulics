'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import type { DesignedEnquiry, ManufacturingSpecRow } from '@indus/domain'
import { Button, Card, Field, Input, Select, SpecList, Textarea } from '@indus/ui'
import RfqAttachments from '../RfqAttachments'
import { MarketEnquiryError } from '../markets/MarketEnquiryError'
import { submitManufacturingEnquiry } from '../../app/(storefront)/manufacturing/actions'

/**
 * The manufacturing enquiry card — the single conversion on `/manufacturing`.
 *
 * Sibling of `IndustryEnquiryForm` and deliberately not a shared component: the
 * two differ in their action, their one select, their confirmation copy and
 * their spec rows, which is most of what a form is. What they do share — the
 * dropzone, the error presentation, the anti-bot stamp — is shared as parts.
 *
 * `Process route` defaults to "Not sure — advise", and that default is the
 * point. Most people sending a drawing do not know whether it should be cast,
 * forged or machined from bar; that is what they are asking. A required choice
 * they cannot make is a lost lead, and "not sure" is a real answer the desk
 * acts on.
 *
 * Client-side validation is thin on purpose — `required` and `type="email"`.
 * The server re-checks everything, and a form that argues with an engineer
 * about their own phone number format loses the enquiry.
 */
export default function ManufacturingEnquiryForm({
  enquiry,
  title,
  body,
  spec,
  contactEmail,
  anchorId,
  fileInputId,
}: {
  enquiry: DesignedEnquiry
  title: string
  body: string
  spec: readonly ManufacturingSpecRow[]
  contactEmail: string | null
  /** The id every CTA on the page scrolls to. Owned here so the card is the target. */
  anchorId: string
  /** Given to the dropzone's file input so a CTA can move focus onto it. */
  fileInputId: string
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
      const outcome = await submitManufacturingEnquiry(data)
      if (outcome.success) setResult({ code: outcome.code, token: outcome.token })
      // On failure every entered value stays put — the form is never re-rendered
      // from scratch, only the message above the submit changes.
      else setError(outcome.error)
    })
  }

  return (
    <Card id={anchorId} className="scroll-mt-24 p-6 sm:p-7">
      <h3 className="text-[20px] font-medium tracking-[-0.02em]">{title}</h3>

      {result ? (
        <div className="mt-5 flex flex-col items-start gap-4" role="status" aria-live="polite">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ih-accent">
            Enquiry received · {result.code}
          </span>
          <p className="text-[13.5px] leading-[1.6] text-ih-ink-2">
            It is with the project desk. We confirm the process route, material, inspection scope
            and documentation before we price it, and come back within one business day. Anything
            you attached came through with it.
          </p>
          <Link
            href={`/quote/${result.code}?token=${encodeURIComponent(result.token)}`}
            className="text-[13.5px] text-ih-accent underline underline-offset-4 hover:text-ih-accent-hover"
          >
            Track this enquiry →
          </Link>
          <p className="text-[12.5px] leading-[1.55] text-ih-muted">
            A copy is on its way to the address you gave. If it does not arrive, check the spam
            folder before assuming the enquiry did not land.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[12.5px] leading-[1.55] text-ih-muted">{body}</p>

          <form onSubmit={handleSubmit}>
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

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Name">
                <Input
                  name="contactName"
                  required
                  autoComplete="name"
                  placeholder="Full name"
                  className="h-11 sm:h-10"
                />
              </Field>
              <Field label="Company">
                <Input
                  name="company"
                  required
                  autoComplete="organization"
                  placeholder="Company"
                  className="h-11 sm:h-10"
                />
              </Field>
              <Field label="Email">
                <Input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="h-11 sm:h-10"
                />
              </Field>
              <Field label="Phone / mobile">
                <Input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+971 …"
                  className="h-11 sm:h-10"
                />
              </Field>
              <Field label={enquiry.choiceLabel} className="sm:col-span-2">
                {/* Defaults to the first option — "Not sure — advise" — because
                    that is the honest answer for most senders and the one that
                    keeps the enquiry moving. */}
                <Select name="route" defaultValue={enquiry.choices[0]} className="h-11 sm:h-10">
                  {enquiry.choices.map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Part description"
                className="sm:col-span-2"
                hint="A drawing or sample photo attached below counts instead."
              >
                <Textarea
                  name="description"
                  rows={3}
                  placeholder="Material grade, size, thread form, standard, quantity and required documentation"
                />
              </Field>
            </div>

            <div className="mt-3">
              <RfqAttachments
                inputId={fileInputId}
                label="Drop drawing, 3D file or sample photo"
                hint="PDF · DWG · DXF · STEP · JPG · ZIP — up to 25 MB each"
              />
            </div>

            {error && (
              <MarketEnquiryError
                error={error}
                contactEmail={contactEmail}
                lead="You can also send it straight to"
                className="mt-4"
              />
            )}

            <Button type="submit" kind="primary" size="lg" block className="mt-4" disabled={isPending}>
              {isPending ? 'Sending…' : 'Get a quote'}
              <span aria-hidden="true">{isPending ? '' : '→'}</span>
            </Button>
          </form>

          {/* The value is capped so it wraps before the key does — an unbounded
              value squeezes the key column until a two-word key breaks across
              two lines, which reads as a layout accident. */}
          <SpecList
            className="mt-5"
            rows={spec.map(([key, value]) => [
              key,
              <span key={key} className="inline-block max-w-[240px]">
                {value}
              </span>,
            ])}
          />
        </>
      )}
    </Card>
  )
}
