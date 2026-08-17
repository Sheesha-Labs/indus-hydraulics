import type { AsOfStampBlock } from '@indus/domain'

/**
 * Freshness marker for spec and price content, separate from publishedAt
 * because a 2024 article can legitimately carry a 2026-verified chart.
 * Uses `<time datetime>` so the date is machine-readable rather than prose.
 */
export default function AsOfStampBlockView({ block }: { block: AsOfStampBlock }) {
  const label = new Date(`${block.verifiedOn}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return (
    <p className="mono my-5 border-t border-ih-border pt-3 text-[11px] uppercase tracking-[0.1em] text-ih-muted">
      Figures verified <time dateTime={block.verifiedOn}>{label}</time>
      {block.note ? ` · ${block.note}` : ''}
    </p>
  )
}
