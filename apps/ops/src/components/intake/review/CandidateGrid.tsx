'use client'

import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import type { Tone } from '@indus/ops-ui/types'
import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type KeyboardEvent } from 'react'
import {
  confirmCandidateAction,
  removeCandidateAction,
  updateCandidateAction,
} from '../../../app/(console)/enquiries/intake/[batchId]/actions/review'
import type { ReviewLine } from '../../../data/intake-review'

/**
 * Board 15's lines (S08-T04): # · Description · Part no. · Qty · UoM · Material / spec · Confidence. Part no. and
 * Qty are edited in place (Enter or leaving the field saves, Escape puts the value back); a Check line is confirmed
 * from its chip; each line's note sits under it in its tone with a Why? link to the span it was read from. Hovering a
 * row marks its box on the page.
 */
const CHIP: Record<ReviewLine['label'], Tone> = {
  High: 'ok',
  Check: 'warn',
  Low: 'bad',
  Duplicate: 'acc',
}
const NOTE: Record<ReviewLine['tone'], string> = {
  ok: 'text-io-ok',
  warn: 'text-io-warn',
  bad: 'text-io-bad',
  info: 'text-io-info',
}

function Cell({
  line,
  field,
  value,
  label,
  className,
}: {
  line: ReviewLine
  field: 'partNo' | 'qty' | 'description'
  value: string
  label: string
  className: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [v, setV] = useState(value)
  const [busy, setBusy] = useState(false)
  async function save() {
    if (v.trim() === value.trim()) return
    setBusy(true)
    const r = await updateCandidateAction({ id: line.id, version: line.version, [field]: v })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      setV(value)
    }
    router.refresh()
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      void save()
    } else if (e.key === 'Escape') {
      setV(value)
      e.currentTarget.blur()
    }
  }
  return (
    <input
      aria-label={`${label}, line ${line.ord}`}
      value={v}
      disabled={busy}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => void save()}
      onKeyDown={onKey}
      className={`rounded-io-ctl border-io-stroke bg-io-card io-focus-field h-6 border px-2 text-[12.5px] ${className}`}
    />
  )
}

export default function CandidateGrid({
  lines,
  hover,
  onHover,
  locked,
}: {
  lines: readonly ReviewLine[]
  hover: number | null
  onHover: (ord: number | null) => void
  locked: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()
  async function confirm(l: ReviewLine) {
    const r = await confirmCandidateAction({ id: l.id, version: l.version })
    if (!r.success) toast({ kind: 'error', title: r.error })
    router.refresh()
  }
  async function remove(l: ReviewLine) {
    const r = await removeCandidateAction({ id: l.id, version: l.version })
    if (!r.success) toast({ kind: 'error', title: r.error })
    router.refresh()
  }
  return (
    <table data-part="candidate-grid" className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="border-io-line text-io-ink-3 border-b text-left text-[10.5px] tracking-[0.12em] uppercase">
          <th scope="col" className="w-[42px] py-3 pl-5 font-medium">
            #
          </th>
          <th scope="col" className="py-3 font-medium">
            Description
          </th>
          <th scope="col" className="w-[150px] py-3 pl-2 font-medium">
            Part no.
          </th>
          <th scope="col" className="w-[60px] py-3 pr-2 text-right font-medium">
            Qty
          </th>
          <th scope="col" className="w-[52px] py-3 pl-2 font-medium">
            UoM
          </th>
          <th scope="col" className="w-[120px] py-3 font-medium">
            Material / spec
          </th>
          <th scope="col" className="w-[96px] py-3 pr-5 font-medium">
            Confidence
          </th>
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => {
          const span = l.spans.description ?? l.spans.qty ?? Object.values(l.spans)[0]
          const editable = !locked && l.decision !== 'merged'
          return (
            <tr
              key={l.id}
              id={`line-${l.ord}`}
              data-ord={l.ord}
              data-state={l.ord === hover ? 'hover' : undefined}
              onMouseEnter={() => onHover(l.ord)}
              onMouseLeave={() => onHover(null)}
              className={`border-io-line border-b align-top ${l.ord === hover ? 'bg-io-row-hover' : ''}`}
            >
              <td className="text-io-ink-3 py-3.5 pl-5">{l.ord}</td>
              <td className="max-w-0 py-3.5 pr-3">
                {editable && l.sourceKind === 'manual' ? (
                  <Cell
                    line={l}
                    field="description"
                    value={l.description}
                    label="Description"
                    className="w-full"
                  />
                ) : (
                  <span className="block truncate" title={l.description}>
                    {l.description}
                  </span>
                )}
                {l.note || l.decidedBy ? (
                  <span
                    className={`mt-2 block text-[12px] whitespace-nowrap ${l.note ? NOTE[l.tone] : 'text-io-ink-3'}`}
                  >
                    {l.note ?? l.decidedBy}
                    {span ? (
                      <>
                        {' · '}
                        <Link
                          href={`/why/sp_${span}` as Route}
                          scroll={false}
                          className="text-io-accent io-focus rounded-io-tag underline underline-offset-2"
                        >
                          Why?
                        </Link>
                      </>
                    ) : null}
                  </span>
                ) : null}
              </td>
              <td className="py-2.5 pl-2">
                {editable ? (
                  <Cell
                    line={l}
                    field="partNo"
                    value={l.partNo ?? ''}
                    label="Part no."
                    className="w-[140px]"
                  />
                ) : (
                  <span>{l.partNo}</span>
                )}
              </td>
              <td className="py-2.5 pr-2 text-right">
                {editable ? (
                  <Cell
                    line={l}
                    field="qty"
                    value={l.qty ?? ''}
                    label="Quantity"
                    className="w-[52px] text-right"
                  />
                ) : (
                  <span>{l.qty}</span>
                )}
              </td>
              <td className="text-io-ink-3 py-3.5 pl-2">{l.uom}</td>
              <td className="max-w-0 py-3.5 pr-2">
                <span className="block truncate" title={l.spec ?? ''}>
                  {l.spec}
                </span>
              </td>
              <td className="py-3 pr-5">
                <span className="flex items-center gap-1.5">
                  {l.decision === 'pending' && l.label === 'Check' && !locked ? (
                    <button
                      type="button"
                      onClick={() => void confirm(l)}
                      aria-label={`Check, confirm line ${l.ord} as read`}
                      title="Confirm as read"
                      className="io-focus rounded-io-pill"
                    >
                      <Chip tone="warn" label="Check" />
                    </button>
                  ) : l.decision !== 'pending' && l.label !== 'Duplicate' ? (
                    <Chip tone="ok" label={l.label === 'High' ? 'High' : 'Confirmed'} />
                  ) : (
                    <Chip tone={CHIP[l.label]} label={l.label} />
                  )}
                  {!locked && l.sourceKind === 'manual' ? (
                    <button
                      type="button"
                      onClick={() => void remove(l)}
                      aria-label={`Remove line ${l.ord}`}
                      className="text-io-ink-3 io-focus rounded-io-tag text-[12px]"
                    >
                      ×
                    </button>
                  ) : null}
                </span>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
