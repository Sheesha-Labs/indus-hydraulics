'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Button, Card, Field, Input, Select, SpecList, Textarea } from '@indus/ui'
import RfqAttachments from '../RfqAttachments'
import { MarketEnquiryError } from '../markets/MarketEnquiryError'
import { submitIndustryEnquiry } from '../../app/(storefront)/industries/actions'

/**
 * The project-enquiry card — the single conversion on a designed industry page.
 *
 * Every CTA above it points here, which is why the card owns the `id` the
 * anchors target and why the "Submit drawing or BOM" buttons focus the file
 * input rather than merely scrolling: a reader who clicked that particular
 * button has already decided to attach something.
 *
 * Client-side validation is deliberately thin — `required` and `type="email"`,
 * nothing more. The server re-checks everything, and a form that argues with an
 * engineer about their own phone number format loses the enquiry. The one rule
 * worth stating in the UI is the server's real one: a description or a file,
 * because an enquiry with neither cannot be quoted.
 *
 * `MarketEnquiryError` is reused rather than copied. Its conditional email
 * fallback reads the message text, not the error's identity, so it behaves
 * correctly against this action's strings without knowing they exist.
 */
export default function IndustryEnquiryForm({
  industrySlug,
  title,
  body,
  applications,
  spec,
  contactEmail,
  anchorId,
  fileInputId,
}: {
  industrySlug: string
  title: string
  body: string
  applications: readonly string[]
  spec: readonly (readonly [string, string])[]
  contactEmail: string | null
  /** The id the page's CTAs scroll to. Owned here so the card is the target. */
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
      const outcome = await submitIndustryEnquiry(data)
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
            It is with the project desk. We review manufacturability, dimensions, end connections,
            material and the inspection scope before we quote, and come back within one business
            day. Anything you attached came through with it.
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
            <input type="hidden" name="industrySlug" value={industrySlug} />
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
              <Field label="Application" className="sm:col-span-2">
                {/* Empty by default so the choice is deliberate. A pre-selected
                    first option is the one nobody notices is wrong until the
                    enquiry has been routed to the wrong engineer. */}
                <Select name="application" defaultValue="" className="h-11 sm:h-10">
                  <option value="">Select…</option>
                  {applications.map((application) => (
                    <option key={application} value={application}>
                      {application}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Project description"
                className="sm:col-span-2"
                hint="A drawing or BOM attached below counts instead."
              >
                <Textarea
                  name="description"
                  rows={3}
                  placeholder="Material, sizes, end connections, quantity, inspection and documentation required"
                />
              </Field>
            </div>

            <div className="mt-3">
              <RfqAttachments
                inputId={fileInputId}
                label="Drop drawing, BOM or specification"
                hint="PDF · DWG · DXF · STEP · XLSX · ZIP — up to 25 MB each"
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

          {/*
            The value is capped so it wraps before the key does. Left
            unbounded, "CDU OEMs · manifold builders · EPC / MEP · integrators"
            squeezes the 13px key column until "Best fit" breaks across two
            lines, which reads as a layout accident rather than a long value.
          */}
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
