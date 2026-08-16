'use client'

import { useRef, useState, useTransition } from 'react'
import { sendQuote } from '../../app/admin/(shell)/rfqs/[code]/actions'
import { Input, Textarea } from '@indus/ui'

type Props = {
  rfqId: string
  rfqCode: string
  /** Default validity days from settings */
  defaultValidityDays: number
  /** Default payment terms text from settings */
  defaultPaymentTerms: string
  /** Default Notes from settings */
  defaultNotes: string
  /** Computed default VAT rate (5 for UAE ship-to, 0 for export) */
  defaultVatRatePct: number
  /** Subtotal preview from current engineer prices */
  currentSubtotal: number
  /** Pre-fill subject from RFQ */
  rfqSubject: string | null
  /** Whether a quote already exists (prior revision) */
  hasExistingQuote: boolean
}

function formatAed(n: number): string {
  const fixed = n.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  return `AED ${intPart!.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decPart}`
}

// Composer field names that map 1:1 to preview-pdf URL params. Keep in sync
// with `parseOverridesFromQuery` in the route handler.
const PREVIEW_PARAM_FIELDS = [
  'discountTotal',
  'shipping',
  'vatRatePctOverride',
  'validityDays',
  'subjectOverride',
  'notesOverride',
  'referenceLine',
] as const

const PREVIEW_PARAM_REMAP: Record<string, string> = {
  vatRatePctOverride: 'vatRatePct',
}

export default function SendQuoteComposer(props: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ ok: true; code: string } | { ok: false; message: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handlePreview() {
    if (!formRef.current) return
    const fd = new FormData(formRef.current)
    const params = new URLSearchParams()
    for (const field of PREVIEW_PARAM_FIELDS) {
      const raw = fd.get(field)
      if (raw === null) continue
      const value = String(raw).trim()
      if (!value) continue
      const paramName = PREVIEW_PARAM_REMAP[field] ?? field
      params.set(paramName, value)
    }
    const qs = params.toString()
    const url = `/api/rfqs/${encodeURIComponent(props.rfqCode)}/preview-pdf${qs ? `?${qs}` : ''}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Live composer state for total preview
  const [vatPct, setVatPct] = useState<string>(props.defaultVatRatePct.toString())
  const [discount, setDiscount] = useState<string>('0')
  const [shipping, setShipping] = useState<string>('0')

  const vatNum = Number(vatPct) || 0
  const discountNum = Number(discount) || 0
  const shippingNum = Number(shipping) || 0
  const vatAmount = props.currentSubtotal * (vatNum / 100)
  const previewTotal = props.currentSubtotal - discountNum + vatAmount + shippingNum

  function handleSubmit(formData: FormData) {
    setResult(null)
    startTransition(async () => {
      const r = await sendQuote(formData)
      if (r.success) {
        setResult({ ok: true, code: r.data.quoteCode })
      } else {
        setResult({ ok: false, message: r.message })
      }
    })
  }

  if (!open && !result) {
    return (
      <div className="border border-ih-border bg-ih-surface p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold mb-1">
              {props.hasExistingQuote ? 'Send a revised quote' : 'Send quote to customer'}
            </h2>
            <p className="text-[13px] text-ih-muted">
              {props.hasExistingQuote
                ? 'A previous revision has been sent. Sending again will create a new revision and email the customer with the updated PDF.'
                : 'Generates the PDF, uploads it, and emails the customer with the quote attached. Will move this RFQ to “Quote Sent.”'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-9 px-4 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 whitespace-nowrap"
          >
            {props.hasExistingQuote ? 'Compose revision →' : 'Compose quote →'}
          </button>
        </div>
      </div>
    )
  }

  if (result?.ok) {
    return (
      <div className="border border-[oklch(0.85_0.13_145)] bg-[oklch(0.97_0.04_145)] p-5 mb-6">
        <div className="text-[14px] font-semibold text-[oklch(0.35_0.12_145)] mb-1">
          ✓ Quote {result.code} sent
        </div>
        <p className="text-[13px] text-[oklch(0.4_0.08_145)] mb-3">
          Customer received the email with the PDF attachment. The RFQ is now in “Quote Sent” status — when they reply with confirmation, click <strong>Mark Accepted</strong> on the status row above.
        </p>
        <button
          type="button"
          onClick={() => {
            setResult(null)
            setOpen(false)
          }}
          className="h-8 px-3 border border-[oklch(0.85_0.13_145)] bg-white text-[oklch(0.35_0.12_145)] font-mono text-[11px] hover:bg-[oklch(0.97_0.04_145)]"
        >
          Done
        </button>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="border border-ih-accent bg-ih-surface p-5 mb-6 space-y-4"
    >
      <input type="hidden" name="rfqId" value={props.rfqId} />

      <div className="flex items-start justify-between gap-4 pb-3 border-b border-ih-border">
        <h2 className="text-[15px] font-semibold">
          {props.hasExistingQuote ? 'Compose revised quote' : 'Compose quote'}
        </h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[11px] text-ih-muted hover:text-ih-ink"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sendquote-subjectOverride" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Subject (optional)
          </label>
          <Input
            id="sendquote-subjectOverride"
            type="text"
            name="subjectOverride"
            defaultValue={props.rfqSubject ?? ''}
            placeholder="OFFER FOR …" />
        </div>
        <div>
          <label htmlFor="sendquote-referenceLine" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Reference# (optional)
          </label>
          <Input
            id="sendquote-referenceLine"
            type="text"
            name="referenceLine"
            placeholder="e.g. REVISED OFFER FOR PROJECT X" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="sendquote-discountTotal" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Discount (AED)
          </label>
          <Input
            id="sendquote-discountTotal"
            type="number"
            name="discountTotal"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            min="0"
            step="0.01"
            className="text-right font-mono"
          />
        </div>
        <div>
          <label htmlFor="sendquote-shipping" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Shipping (AED)
          </label>
          <Input
            id="sendquote-shipping"
            type="number"
            name="shipping"
            value={shipping}
            onChange={(e) => setShipping(e.target.value)}
            min="0"
            step="0.01"
            className="text-right font-mono"
          />
        </div>
        <div>
          <label htmlFor="sendquote-vatRatePctOverride" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            VAT (%) — auto from ship-to
          </label>
          <Input
            id="sendquote-vatRatePctOverride"
            type="number"
            name="vatRatePctOverride"
            value={vatPct}
            onChange={(e) => setVatPct(e.target.value)}
            min="0"
            max="100"
            step="0.01"
            className="text-right font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="sendquote-validityDays" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Validity (days)
          </label>
          <Input
            id="sendquote-validityDays"
            type="number"
            name="validityDays"
            defaultValue={props.defaultValidityDays}
            min="1"
            max="365" />
        </div>
        <div>
          <label htmlFor="sendquote-paymentTerms" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
            Payment terms
          </label>
          <Input
            id="sendquote-paymentTerms"
            type="text"
            name="paymentTerms"
            defaultValue={props.defaultPaymentTerms} />
        </div>
      </div>

      <div>
        <label htmlFor="sendquote-notesOverride" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Notes on the quote PDF (optional)
        </label>
        <Textarea
          id="sendquote-notesOverride"
          name="notesOverride"
          rows={3}
          defaultValue={props.defaultNotes}
          placeholder="Application-specific notes that should appear on this quote." className="resize-none" />
      </div>

      <div>
        <label htmlFor="sendquote-customerEmailMessage" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Personal note in the email (optional)
        </label>
        <Textarea
          id="sendquote-customerEmailMessage"
          name="customerEmailMessage"
          rows={3}
          placeholder="A custom intro for the customer. Replaces the default email body if set." className="resize-none" />
      </div>

      {/* Live total preview */}
      <div className="border-t border-ih-border pt-4">
        <div className="bg-ih-surface-2 p-3 font-mono text-[12px] grid grid-cols-2 gap-y-1">
          <div className="text-ih-muted">Subtotal (from line prices)</div>
          <div className="text-right text-ih-ink-2">{formatAed(props.currentSubtotal)}</div>
          {discountNum > 0 ? (
            <>
              <div className="text-ih-muted">Discount</div>
              <div className="text-right text-ih-ink-2">−{formatAed(discountNum)}</div>
            </>
          ) : null}
          {vatNum > 0 ? (
            <>
              <div className="text-ih-muted">VAT @ {vatNum}%</div>
              <div className="text-right text-ih-ink-2">{formatAed(vatAmount)}</div>
            </>
          ) : (
            <>
              <div className="text-ih-muted">VAT</div>
              <div className="text-right text-ih-ink-2">— (zero-rated export)</div>
            </>
          )}
          {shippingNum > 0 ? (
            <>
              <div className="text-ih-muted">Shipping</div>
              <div className="text-right text-ih-ink-2">{formatAed(shippingNum)}</div>
            </>
          ) : null}
          <div className="text-ih-ink font-semibold pt-1 border-t border-ih-border mt-1">Total</div>
          <div className="text-right text-ih-ink font-semibold pt-1 border-t border-ih-border mt-1">
            {formatAed(previewTotal)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || props.currentSubtotal <= 0}
          className="h-10 px-5 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? 'Sending…' : `Send quote → customer`}
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={props.currentSubtotal <= 0}
          title="Render the PDF with the current composer values in a new tab — does not send anything."
          className="h-10 px-4 border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Preview PDF →
        </button>
        <span className="font-mono text-[11px] text-ih-muted">
          {props.currentSubtotal <= 0 ? 'Set engineer unit prices first.' : 'Sends email + PDF, marks RFQ as Quote Sent.'}
        </span>
        {result && !result.ok ? (
          <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)] ml-auto" role="alert">
            {result.message}
          </span>
        ) : null}
      </div>
    </form>
  )
}
