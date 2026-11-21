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
        <span className="mono text-ih-muted text-[9.5px] tracking-[0.12em] uppercase">{label}</span>
        <span className="text-ih-ink text-[13.5px] font-medium">{ratingConnection(id).name}</span>
        <span className="text-ih-ink font-mono text-[18px] tracking-[-0.02em] tabular-nums">
          {psi === undefined ? (
            <span className="text-ih-muted text-[13px]">Not rated at this size</span>
          ) : (
            <>
              {fmt(psi)} <span className="text-ih-muted text-[12px]">psi</span>
              <span className="text-ih-ink-2 ml-3 text-[14px]">{fmt(psiToBar(psi))}</span>{' '}
              <span className="text-ih-muted text-[12px]">bar</span>
            </>
          )}
        </span>
        {limiting ? (
          <span className="mono text-ih-accent text-[10px] tracking-[0.1em] uppercase">
            Limits the joint
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className="border-ih-border bg-ih-surface overflow-hidden rounded-lg border">
      <form
        aria-label="Rate a joint"
        onSubmit={(event) => event.preventDefault()}
        className="border-ih-border bg-ih-surface-2 grid grid-cols-1 gap-3 border-b p-4 sm:grid-cols-3"
      >
        <label className="flex flex-col gap-1.5">
          <span className="mono text-ih-muted text-[10px] tracking-[0.12em] uppercase">End A</span>
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
          <span className="mono text-ih-muted text-[10px] tracking-[0.12em] uppercase">End B</span>
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
          <span className="mono text-ih-muted text-[10px] tracking-[0.12em] uppercase">Size</span>
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

        <div
          aria-live="polite"
          className="border-ih-border flex flex-col justify-center border-t pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        >
          {result.status === 'rated' ? (
            <>
              <p className="mono text-ih-muted text-[10px] tracking-[0.12em] uppercase">
                Joint working pressure
              </p>
              <p className="text-ih-ink mt-2 font-mono text-[40px] leading-none tracking-[-0.03em]">
                {fmt(result.psi)}
                <span className="text-ih-muted ml-1.5 text-[15px] tracking-normal">psi</span>
              </p>
              <p className="mono text-ih-ink-2 mt-1.5 text-[15px]">
                {fmt(psiToBar(result.psi))} <span className="text-ih-muted">bar</span>
              </p>
              <p className="text-ih-muted mt-3 text-[13px] leading-[1.55]">
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
              <p className="mono text-ih-muted text-[10px] tracking-[0.12em] uppercase">
                Joint working pressure
              </p>
              <p className="text-ih-ink mt-2 text-[15px] font-medium">No published figure</p>
              <p className="text-ih-muted mt-2 text-[13px] leading-[1.55]">
                {result.missing.map((id) => ratingConnection(id).short).join(' and ')}{' '}
                {result.missing.length > 1 ? 'have' : 'has'} no published rating at -{dash}. That is
                not a high rating — ask us before using it.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
