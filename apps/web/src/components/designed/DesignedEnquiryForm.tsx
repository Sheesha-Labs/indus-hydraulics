'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Button, Card, Field, Input, Select, SpecList, Textarea } from '@indus/ui'
import RfqAttachments from '../RfqAttachments'
import { MarketEnquiryError } from '../markets/MarketEnquiryError'

/**
 * The enquiry card every designed page converts through.
 *
 * WHY THIS IS ONE COMPONENT AND NOT THREE. The three pages ask different
 * questions — an application, a process route, the documents a specification
 * demands — and each posts to its own server action with its own schema. But
 * the CARD is the same object every time: four contact fields, one select, one
 * description, the direct-to-storage dropzone, the anti-bot stamp, an inline
 * error that offers the sales inbox, and a confirmation that swaps in place
 * carrying the RFQ reference and a signed tracking link.
 *
 * Three copies of that had already started to drift — the spec list's
 * max-width fix landed in two of them and not the third — and the parts most
 * worth not drifting are the ones a reviewer skims: the honeypot, the
 * `formStartedAt` stamp, and the `attachmentsPending` guard. So the shape is
 * here and the differences are props.
 *
 * `action` is a server action passed down from the page's server component.
 * That is what keeps this component ignorant of which page it is on: it never
 * imports an action, so adding a fourth page adds no branch here.
 *
 * Client-side validation stays deliberately thin — `required` and
 * `type="email"`, nothing more. The server re-checks everything, and a form
 * that argues with an engineer about their own phone number format loses the
 * enquiry.
 */

export type DesignedEnquiryResult =
  | { success: true; code: string; token: string }
  | { success: false; error: string }

export default function DesignedEnquiryForm({
  action,
  hiddenFields,
  anchorId,
  fileInputId,
  title,
  body,
  choice,
  description,
  attachments,
  submitLabel,
  confirmation,
  spec,
  contactEmail,
}: {
  action: (formData: FormData) => Promise<DesignedEnquiryResult>
  /**
   * Extra values posted with the form — the industry page identifies itself by
   * slug this way. Hidden inputs rather than a bound argument, so the action
   * keeps a single `(formData)` signature and re-resolves the value
   * server-side instead of trusting a closure.
   */
  hiddenFields?: Record<string, string>
  /** The id every CTA on the page scrolls to. Owned here so the card is the target. */
  anchorId: string
  /** Given to the dropzone's file input so a CTA can move focus onto it. */
  fileInputId: string
  title: string
  body: string
  /**
   * The single select. `defaultValue: ''` renders a "Select…" placeholder —
   * use it where no option is a safe default. Where one is (the manufacturing
   * and quality pages both lead with "Not sure — advise"), pass it instead:
   * most senders genuinely do not know, and a required choice they cannot make
   * is a lost lead.
   */
  choice: {
    name: string
    label: string
    options: readonly string[]
    defaultValue: string
  }
  description: { name: string; label: string; placeholder: string; hint: string }
  attachments: { label: string; hint: string }
  submitLabel: string
  /** What the confirmation says happens next. Page-specific; the rest is not. */
  confirmation: ReactNode
  spec: readonly (readonly [string, string])[]
  contactEmail: string | null
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
      const outcome = await action(data)
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
          <p className="text-[13.5px] leading-[1.6] text-ih-ink-2">{confirmation}</p>
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
            {hiddenFields
              ? Object.entries(hiddenFields).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))
              : null}

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
              <Field label={choice.label} className="sm:col-span-2">
                <Select name={choice.name} defaultValue={choice.defaultValue} className="h-11 sm:h-10">
                  {choice.defaultValue === '' ? <option value="">Select…</option> : null}
                  {choice.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={description.label} className="sm:col-span-2" hint={description.hint}>
                <Textarea name={description.name} rows={3} placeholder={description.placeholder} />
              </Field>
            </div>

            <div className="mt-3">
              <RfqAttachments
                inputId={fileInputId}
                label={attachments.label}
                hint={attachments.hint}
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
              {isPending ? 'Sending…' : submitLabel}
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
