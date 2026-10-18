'use client'

import { useMemo, useState } from 'react'
import { Select } from '@indus/ui'
import {
  RATING_CONNECTIONS,
  RATING_ROWS,
  jointRating,
  psiToBar,
  ratingConnection,
  type RatingConnectionId,
} from '@indus/domain'

/**
 * "Rate a joint": two ends and a size in, the joint's working pressure out.
 *
 * The answer is the LOWER end, and the panel says which end that is — the point
 * of the tool is the sentence "the NPTF end limits this joint", not the number.
 * When either end has no published figure at that size the panel says so and
 * shows nothing else; it never borrows the other end's rating.
 *
 * Opens on a real, instructive example (a 1/2" JIC to NPTF adapter, where the
 * pipe thread governs) rather than an empty form.
 */

const fmt = (n: number) => n.toLocaleString('en-GB')

export default function JointRatingCalculator() {
  const [endA, setEndA] = useState<RatingConnectionId>('jic')
  const [endB, setEndB] = useState<RatingConnectionId>('nptf')
  const [dash, setDash] = useState<number>(8)

  const result = useMemo(() => jointRating(endA, endB, dash), [endA, endB, dash])
  const row = RATING_ROWS.find((r) => r.dash === dash)
  const sizes = RATING_ROWS.filter((r) => Object.keys(r.psi).length > 0)

  const endCard = (id: RatingConnectionId, label: string) => {
    const psi = row?.psi[id]
    const limiting = result.status === 'rated' && result.governedBy.includes(id)
    return (
      <div
        className={`flex flex-col gap-1.5 rounded-md border px-4 py-3.5 ${
          limiting ? 'border-ih-accent bg-ih-accent-soft' : 'border-ih-border bg-ih-surface'
        }`}
      >
        <span className="mono text-[9.5px] uppercase tracking-[0.12em] text-ih-muted">{label}</span>
        <span className="text-[13.5px] font-medium text-ih-ink">{ratingConnection(id).name}</span>
        <span className="font-mono text-[18px] tabular-nums tracking-[-0.02em] text-ih-ink">
          {psi === undefined ? (
            <span className="text-[13px] text-ih-muted">Not rated at this size</span>
          ) : (
            <>
              {fmt(psi)} <span className="text-[12px] text-ih-muted">psi</span>
              <span className="ml-3 text-[14px] text-ih-ink-2">{fmt(psiToBar(psi))}</span>{' '}
              <span className="text-[12px] text-ih-muted">bar</span>
            </>
          )}
        </span>
        {limiting ? (
          <span className="mono text-[10px] uppercase tracking-[0.1em] text-ih-accent">Limits the joint</span>
        ) : null}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
      <form
        aria-label="Rate a joint"
        onSubmit={(event) => event.preventDefault()}
        className="grid grid-cols-1 gap-3 border-b border-ih-border bg-ih-surface-2 p-4 sm:grid-cols-3"
      >
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">End A</span>
          <Select
            id="joint-end-a"
            className="h-10 text-[13.5px]"
            value={endA}
            onChange={(e) => setEndA(e.target.value as RatingConnectionId)}
          >
            {RATING_CONNECTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">End B</span>
          <Select
            id="joint-end-b"
            className="h-10 text-[13.5px]"
            value={endB}
            onChange={(e) => setEndB(e.target.value as RatingConnectionId)}
          >
            {RATING_CONNECTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">Size</span>
          <Select
            id="joint-size"
            className="h-10 text-[13.5px]"
            value={String(dash)}
            onChange={(e) => setDash(Number(e.target.value))}
          >
            {sizes.map((r) => (
              <option key={r.dash} value={r.dash}>
                -{r.dash} · {r.nominal}
              </option>
            ))}
          </Select>
        </label>
      </form>

      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {endCard(endA, 'End A')}
          {endCard(endB, 'End B')}
        </div>

        <div aria-live="polite" className="flex flex-col justify-center border-t border-ih-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {result.status === 'rated' ? (
            <>
              <p className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">Joint working pressure</p>
              <p className="mt-2 font-mono text-[40px] leading-none tracking-[-0.03em] text-ih-ink">
                {fmt(result.psi)}
                <span className="ml-1.5 text-[15px] tracking-normal text-ih-muted">psi</span>
              </p>
              <p className="mono mt-1.5 text-[15px] text-ih-ink-2">
                {fmt(psiToBar(result.psi))} <span className="text-ih-muted">bar</span>
              </p>
              <p className="mt-3 text-[13px] leading-[1.55] text-ih-muted">
                {result.governedBy.length > 1
                  ? 'Both ends share the limit at this size.'
                  : `The ${ratingConnection(result.governedBy[0] as RatingConnectionId).short} end sets the limit.`}
                {result.r2 !== null && result.r2 < result.psi
                  ? ` On SAE 100R2 hose of this size the hose, at ${fmt(result.r2)} psi, is lower still.`
                  : ''}
              </p>
            </>
          ) : (
            <>
              <p className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">Joint working pressure</p>
              <p className="mt-2 text-[15px] font-medium text-ih-ink">No published figure</p>
              <p className="mt-2 text-[13px] leading-[1.55] text-ih-muted">
                {result.missing.map((id) => ratingConnection(id).short).join(' and ')}{' '}
                {result.missing.length > 1 ? 'have' : 'has'} no published rating at -{dash}. That is not a high rating —
                ask us before using it.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
