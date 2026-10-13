import type { AsOfStampBlock } from '@indus/domain'
import { CheckIcon } from '../../designed/icons'

/**
 * Freshness marker for spec and price content, separate from publishedAt
 * because a 2024 article can legitimately carry a 2026-verified chart.
 * Uses `<time datetime>` so the date is machine-readable rather than prose.
 *
 * On an article page the first stamp sits inside the "At a glance" panel
 * (`tone="navy"`); any other renders where it was written, on paper.
 */
export function AsOfStampLine({ block, tone = 'paper' }: { block: AsOfStampBlock; tone?: 'paper' | 'navy' }) {
  const label = new Date(`${block.verifiedOn}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const navy = tone === 'navy'
  return (
    <p
      className={`mt-3.5 flex items-start gap-2.5 border-t border-dashed pt-3.5 text-[13px] leading-[1.55] ${
        navy ? 'border-white/20 text-ih-on-navy-dim' : 'border-ih-border-strong text-ih-muted'
      }`}
    >
      <CheckIcon size={15} className={`mt-0.5 shrink-0 ${navy ? 'text-ih-steel' : 'text-ih-accent'}`} />
      <span>
        <b className={`font-semibold ${navy ? 'text-white' : 'text-ih-ink-2'}`}>
          Figures verified <time dateTime={block.verifiedOn}>{label}</time>
        </b>
        {block.note ? ` · ${block.note}` : ''}
      </span>
    </p>
  )
}

export default function AsOfStampBlockView({ block }: { block: AsOfStampBlock }) {
  return <AsOfStampLine block={block} />
}
