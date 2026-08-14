import Link from 'next/link'
import { MetaCellsSchema, type MetaCell } from '@indus/domain'

type Props = {
  metaCellsRaw: unknown
  /** Optional CTA href override; defaults to /quote. */
  quoteHref?: string
}

/**
 * Hero meta strip — N customisable key/value cells + a hard-coded
 * "Quote a similar job" CTA cell. Drops the leading 2px-thick top border
 * for a strong divider above the strip.
 */
export default function CaseMetaStrip({ metaCellsRaw, quoteHref = '/quote' }: Props) {
  const parsed = MetaCellsSchema.safeParse(metaCellsRaw)
  const cells: MetaCell[] = parsed.success ? parsed.data : []
  const cellCount = cells.length
  const cols = Math.min(cellCount, 5)
  return (
    <div
      className={`mt-8 grid border-y border-[var(--color-border-2)] border-t-2 border-t-[var(--color-primary)]`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr) auto` }}
    >
      {cells.slice(0, 5).map((cell, i) => (
        <div
          key={i}
          className="border-r border-[var(--color-border-2)] px-5 pb-5.5 pt-5 last:border-r-0 max-md:col-span-1"
        >
          <div className="mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
            {cell.label}
          </div>
          <div
            className={`mt-1 text-[22px] font-semibold leading-tight tracking-[-0.01em] ${
              cell.style === 'accent'
                ? 'text-[var(--color-accent)]'
                : cell.style === 'good'
                  ? 'text-[var(--color-good)]'
                  : ''
            }`}
          >
            {cell.value}
            {cell.valueSmall ? (
              <small className="ml-1 text-[13px] font-medium text-[var(--color-muted)]">
                {cell.valueSmall}
              </small>
            ) : null}
          </div>
        </div>
      ))}
      <div className="flex items-center bg-[var(--color-elevated)] px-5 py-4">
        <Link
          href={quoteHref}
          className="inline-flex items-center justify-center rounded-sm bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-elevated)] hover:bg-[color-mix(in_oklab,var(--color-primary)_88%,white)]"
        >
          Quote a similar job
        </Link>
      </div>
    </div>
  )
}
