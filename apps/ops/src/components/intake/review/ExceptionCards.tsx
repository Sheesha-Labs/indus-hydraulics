'use client'

import { Button } from '@indus/ops-ui/controls'
import { Chip } from '@indus/ops-ui/status'
import { useState } from 'react'

/**
 * Board 17 · Intake exceptions (S08-T04): the four states that sit inside boards 14 and 15. Presentational: the
 * review wires the verbs; the states sheet draws them from neutral fixtures. Buttons are secondary — the page's
 * one primary is "Continue to match".
 */
const CARD = 'rounded-io-card border-io-line bg-io-card flex gap-4 border p-5'
const TITLE = 'm-0 text-[16px] leading-[1.35] font-medium'
const TEXT = 'text-io-ink-2 m-0 text-[12.5px] leading-[1.55]'

function Hatch({ label }: { label: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 190"
      className="rounded-io-tag border-io-line block h-[190px] w-[150px] flex-none border"
    >
      <defs>
        <pattern
          id="io-hatch"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" className="fill-io-fill" />
          <rect width="3" height="8" className="fill-io-fill-2" />
        </pattern>
      </defs>
      <rect width="150" height="190" fill="url(#io-hatch)" />
      <rect x="40" y="164" width="70" height="16" rx="2" className="fill-io-card" />
      <text x="75" y="175" textAnchor="middle" fontSize="9" className="fill-io-ink-2">
        {label}
      </text>
    </svg>
  )
}

export function UnreadableCard({
  fileName,
  meta,
  dpi,
  canAsk,
  askWhy,
  onAsk,
  onManual,
}: {
  fileName: string
  meta: string
  dpi: string | null
  canAsk: boolean
  askWhy?: string
  onAsk?: () => void
  onManual?: () => void
}) {
  return (
    <section
      aria-label={`${fileName} could not be read`}
      data-part="exception-unreadable"
      className={CARD}
    >
      <Hatch label={meta} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <span>
          <Chip tone="bad" label="Unreadable" />
        </span>
        <h3 className={TITLE}>Image too low resolution</h3>
        <p className={TEXT}>
          {fileName} is {dpi ?? 'too low in resolution'}. Part numbers could not be read with any
          confidence, so no lines were created.
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
          <Button
            variant="navy"
            size="sm"
            onClick={onAsk}
            disabled={!canAsk}
            title={canAsk ? undefined : askWhy}
          >
            Ask client for original
          </Button>
          <Button variant="secondary" size="sm" onClick={onManual}>
            Enter lines manually
          </Button>
          {!canAsk && askWhy ? <span className="text-io-ink-3 text-[12px]">{askWhy}</span> : null}
        </div>
      </div>
    </section>
  )
}

export function HandwritingCard({
  ord,
  printed,
  handwritten,
  onChoose,
}: {
  ord: number
  printed: string
  handwritten: string
  onChoose?: (choice: 'printed' | 'handwritten', value: string) => void
}) {
  const [picked, setPicked] = useState<'printed' | 'handwritten' | null>(null)
  return (
    <section
      aria-label={`Line ${ord}: handwritten change`}
      data-part="exception-handwriting"
      className={CARD}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 150 190"
        className="rounded-io-tag border-io-line bg-io-card block h-[190px] w-[150px] flex-none border"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={i}
            x1="0"
            x2="150"
            y1={18 + i * 18}
            y2={18 + i * 18}
            className="stroke-io-line"
            strokeWidth="1"
          />
        ))}
        <rect
          x="14"
          y="70"
          width="104"
          height="20"
          rx="2"
          className="stroke-io-warn fill-none"
          strokeWidth="1.2"
        />
        <text x="16" y="176" fontSize="9" className="fill-io-ink-2">
          handwritten qty
        </text>
      </svg>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <span>
          <Chip tone="warn" label="Handwriting" />
        </span>
        <h3 className={TITLE}>Handwritten changes on a printed list</h3>
        <p className={TEXT}>
          Line {ord} quantity was crossed out and rewritten. Printed value {printed}, handwritten
          value read as {handwritten}.
        </p>
        <div role="radiogroup" aria-label={`Line ${ord} quantity`} className="flex gap-2">
          {(
            [
              ['printed', `Printed · ${printed}`, printed],
              ['handwritten', `Handwritten · ${handwritten}`, handwritten],
            ] as const
          ).map(([key, label, value]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={picked === key}
              onClick={() => {
                setPicked(key)
                onChoose?.(key, value)
              }}
              className={
                picked === key || (picked === null && key === 'handwritten')
                  ? 'rounded-io-ctl border-io-accent bg-io-accent-tint io-focus h-[30px] border px-2.5 text-[12.5px]'
                  : 'rounded-io-ctl border-io-stroke bg-io-card io-focus h-[30px] border px-2.5 text-[12.5px]'
              }
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-io-ink-3 mt-auto pt-3 text-[12px]">
          Choice is logged on the line with the page crop attached.
        </p>
      </div>
    </section>
  )
}

export interface DupSide {
  ord: number
  page: number | null
  description: string
  partNo: string | null
  qty: string | null
  uom: string | null
}

export function DuplicateCard({
  a,
  b,
  onMerge,
}: {
  a: DupSide
  b: DupSide
  onMerge?: (mode: 'keep' | 'sum' | 'both') => void
}) {
  const sum = a.qty && b.qty ? Number(a.qty) + Number(b.qty) : null
  const side = (s: DupSide) => (
    <div className="rounded-io-card border-io-line flex-1 border p-3 text-[12.5px] leading-[1.55]">
      <span className="text-io-ink-3 block">
        Line {s.ord}
        {s.page ? ` · page ${s.page}` : ''}
      </span>
      <span className="block">{s.description}</span>
      <span className="block">
        {[s.partNo, [s.qty, s.uom].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}
      </span>
    </div>
  )
  return (
    <section
      aria-label={`Lines ${a.ord} and ${b.ord} look the same`}
      data-part="exception-duplicate"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border p-5"
    >
      <span>
        <Chip tone="acc" label="Duplicates" />
      </span>
      <h3 className={TITLE}>Same item appears twice</h3>
      <div className="flex gap-2.5">
        {side(a)}
        {side(b)}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="navy" size="sm" onClick={() => onMerge?.('keep')}>
          Merge · keep {a.qty ?? 'one'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onMerge?.('sum')}
          disabled={sum === null}
        >
          Merge · sum to {sum ?? '—'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onMerge?.('both')}>
          Keep both
        </Button>
      </div>
    </section>
  )
}

export function RevisionCard({
  enquiryRef,
  clientName,
  clientRef,
  matched,
  total,
  added,
  changes,
  intent,
  onApply,
  onNew,
}: {
  enquiryRef: string
  clientName: string | null
  clientRef: string | null
  matched: number
  total: number
  added: number
  changes: Array<{ ord: number; description: string; from: string; to: string }>
  intent?: 'revision' | 'new' | null
  onApply?: () => void
  onNew?: () => void
}) {
  const facts = [
    clientName,
    clientRef ? `same reference ${clientRef}` : null,
    `${matched} of ${total} lines match`,
    `${changes.length} quantit${changes.length === 1 ? 'y' : 'ies'} changed, ${added ? `${added} line${added === 1 ? '' : 's'} added` : 'no lines added'}`,
  ].filter(Boolean)
  return (
    <section
      aria-label={`Looks like a revision of ${enquiryRef}`}
      data-part="exception-revision"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border p-5"
    >
      <span>
        <Chip tone="warn" label="Revision detected" />
      </span>
      <h3 className={TITLE}>This looks like a revision of {enquiryRef}</h3>
      <p className={TEXT}>{facts.join(' · ')}.</p>
      {changes.length ? (
        <table className="rounded-io-card border-io-line w-full border-separate border-spacing-0 overflow-hidden border text-[12.5px]">
          <tbody>
            {changes.map((c) => (
              <tr key={c.ord}>
                <td className="border-io-line w-[56px] border-b px-3 py-2">#{c.ord}</td>
                <td className="border-io-line border-b px-3 py-2">{c.description}</td>
                <td className="border-io-line text-io-ink-3 w-[80px] border-b px-3 py-2 text-right line-through">
                  {c.from}
                </td>
                <td className="border-io-line text-io-accent w-[80px] border-b px-3 py-2">
                  {c.to}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="navy" size="sm" onClick={onApply} disabled={intent === 'revision'}>
          Apply as revision to {enquiryRef}
        </Button>
        <Button variant="secondary" size="sm" onClick={onNew} disabled={intent === 'new'}>
          Treat as new enquiry
        </Button>
        {intent === 'revision' ? (
          <span className="text-io-ink-3 text-[12px]">
            Recorded on this intake. Revision handling arrives with S23; continue to create it as an
            enquiry for now.
          </span>
        ) : null}
      </div>
    </section>
  )
}
