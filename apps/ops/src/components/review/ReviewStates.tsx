import { ButtonLink } from '@indus/ops-ui/controls'
import { EmptyState } from '@indus/ops-ui/states'
import type { ReviewFamily } from '@indus/ops-core'
import type { ReviewCard, ReviewQueue } from '../../data/review'
import { ApproveFamily } from './ReviewSelection'

/**
 * Board 110's queue states, shared by Review and the /_kit/review-states sheet: All clear (with the next
 * thing a clock expects), "40+ waiting · summary first", and a superseded card collapsed above its new one.
 */
export function ReviewEmpty({
  done,
  next,
  bare = false,
}: {
  done: number
  next: string | null
  /** Drawn inside another frame (the parity sheet). */
  bare?: boolean
}) {
  return (
    <EmptyState
      align="center"
      bare={bare}
      mark="✓"
      title="Nothing waiting on you"
      text={`The Assistant did ${done} ${done === 1 ? 'thing' : 'things'} today.${
        next ? ` Next expected: ${next}.` : ''
      }`}
      actions={
        <ButtonLink href="/assistant/log?day=today" variant="secondary" size="sm">
          See what was done
        </ButtonLink>
      }
    />
  )
}

export function ReviewSummary({
  total,
  summary,
  openHref,
  bare = false,
}: {
  bare?: boolean
  total: number
  summary: NonNullable<ReviewQueue['summary']>
  openHref: (family: ReviewFamily) => string
}) {
  // Approve N is the view's one primary action: on the first family that can be approved together.
  const firstBatch = summary.rows.find((r) => r.batch)?.family
  return (
    <section
      aria-label="Waiting, by kind"
      data-part="summary-first"
      className={
        bare
          ? 'flex flex-col gap-2'
          : 'bg-io-card border-io-line rounded-io-card flex flex-col gap-2 border px-5 py-4'
      }
    >
      <h2 className="m-0 flex items-baseline gap-3">
        <span className="font-serif text-[30px] leading-[1.15] font-normal">{total} waiting</span>
        {summary.away ? <span className="text-io-ink-3 text-[12.5px]">{summary.away}</span> : null}
      </h2>
      <ul className="m-0 p-0">
        {summary.rows.map((r) => (
          <li
            key={r.family}
            className="border-io-line flex min-h-[61px] items-center gap-3 border-b text-[13px]"
          >
            <span className="min-w-0 flex-1">
              <span className="tabular-nums">{r.count}</span> {r.label.toLowerCase()}
            </span>
            {r.note ? <span className="text-io-ink-3 text-[12px]">{r.note}</span> : null}
            {r.batch ? (
              <ApproveFamily items={r.batch} primary={r.family === firstBatch} />
            ) : (
              <ButtonLink href={openHref(r.family)} size="sm" variant="secondary">
                Open
              </ButtonLink>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export function SupersededRow({
  supersedes,
  headline,
}: {
  supersedes: NonNullable<ReviewCard['supersedes']>
  /** The new card's headline: "so the Assistant drafted “…” instead". */
  headline: string
}) {
  return (
    <details
      data-part="superseded"
      className="group bg-io-card border-io-line rounded-io-card border px-4 py-3 text-[12.5px]"
    >
      <summary className="io-focus rounded-io-tag flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="border-io-stroke rounded-io-pill mt-0.5 size-4 flex-none border border-dashed"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-io-ink-3 line-through">{supersedes.headline}</span>
          <span className="text-io-ink-3">
            Superseded at {supersedes.at}: {supersedes.reason}, so the Assistant drafted “{headline}
            ” instead
          </span>
        </span>
        <span className="text-io-accent group-open:hidden">Show</span>
        <span className="text-io-accent hidden group-open:inline">Hide</span>
      </summary>
      {supersedes.why.length ? (
        <ul className="text-io-ink-2 mt-2 ml-7 list-disc pl-4">
          {supersedes.why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
    </details>
  )
}
