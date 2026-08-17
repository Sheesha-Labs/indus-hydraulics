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

  /*
    Literal class strings, not an inline gridTemplateColumns.

    An inline style beats every responsive utility, so five stat columns stayed
    five columns at 390px and pushed the page ~350px sideways on every case
    study. Tailwind also only emits classes it can see in the source, hence a
    map of complete literals rather than an interpolated name.

    Two columns on a phone, the full N + auto from md up.
  */
  const COLS_AT_MD: Record<number, string> = {
    1: 'md:grid-cols-[repeat(1,1fr)_auto]',
    2: 'md:grid-cols-[repeat(2,1fr)_auto]',
    3: 'md:grid-cols-[repeat(3,1fr)_auto]',
    4: 'md:grid-cols-[repeat(4,1fr)_auto]',
    5: 'md:grid-cols-[repeat(5,1fr)_auto]',
  }

  return (
    <div
      className={`mt-8 grid grid-cols-2 border-y border-ih-border border-t-2 border-t-ih-accent ${COLS_AT_MD[cols] ?? COLS_AT_MD[5]}`}
    >
      {cells.slice(0, 5).map((cell, i) => (
        <div
          key={i}
          className="border-b border-ih-border px-5 pb-5.5 pt-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
        >
          <div className="mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
            {cell.label}
          </div>
          <div
            className={`mt-1 text-[22px] font-semibold leading-tight tracking-[-0.01em] ${
              cell.style === 'accent'
                ? 'text-ih-accent'
                : cell.style === 'good'
                  ? 'text-ih-success'
                  : ''
            }`}
          >
            {cell.value}
            {cell.valueSmall ? (
              <small className="ml-1 text-[13px] font-medium text-ih-muted">
                {cell.valueSmall}
              </small>
            ) : null}
          </div>
        </div>
      ))}
      <div className="flex items-center bg-ih-surface px-5 py-4">
        <Link
          href={quoteHref}
          className="inline-flex items-center justify-center rounded-sm bg-ih-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-ih-ink"
        >
          Quote a similar job
        </Link>
      </div>
    </div>
  )
}
