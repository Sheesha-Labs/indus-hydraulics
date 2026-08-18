import type { SeoHealthScore } from '@indus/domain'
import ContentScoreBadge from './ContentScoreBadge'

type ContentDepthPanelProps = {
  result: SeoHealthScore
}

/**
 * Server-rendered panel surfaced above the product editor. Lists each
 * content-depth check from `scoreProductContent` with pass/fail icons
 * so the editor sees exactly which fields to fill in. Expanding the
 * checks into a sortable table is a UI follow-up — for now the
 * one-row-per-check list is enough to drive enrichment work.
 */
export default function ContentDepthPanel({ result }: ContentDepthPanelProps) {
  const failing = result.breakdown.filter((c) => !c.pass).length
  return (
    <section
      className="border border-ih-border bg-ih-surface p-5 mb-6"
      aria-label="Product content depth"
    >
      <header className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h2 className="font-medium text-[15px] tracking-tight">Content depth</h2>
          <p className="text-[12px] text-ih-muted mt-0.5">
            How richly this product page is described — drives organic search and AI citation eligibility.
          </p>
        </div>
        <ContentScoreBadge score={result.score} />
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {result.breakdown.map((check) => (
          <li
            key={check.id}
            className="grid grid-cols-[20px_1fr] gap-2 items-start text-[12px] leading-snug"
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 font-mono text-[12px] ${check.pass ? 'text-[oklch(0.45_0.12_150)]' : 'text-ih-danger-ink'}`}
            >
              {check.pass ? '✓' : '✕'}
            </span>
            <span className={check.pass ? 'text-ih-ink-2' : 'text-ih-ink'}>
              {check.message}
            </span>
          </li>
        ))}
      </ul>

      {failing > 0 && (
        <p className="mt-4 pt-3 border-t border-ih-border font-mono text-[11px] text-ih-muted">
          {failing} check{failing === 1 ? '' : 's'} failing — fill in the missing fields below to raise the score.
        </p>
      )}
    </section>
  )
}
