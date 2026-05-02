import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'SEO Health — Indus Admin' }

/**
 * Site-wide health dashboard. Aggregates the per-URL scores from the
 * inspector into trend charts, worst-offender lists, and check-level
 * breakdowns. Phase 2 work — the inspector grid covers the per-URL view
 * for now.
 */
export default function SeoHealthPage() {
  return <PlaceholderCard title="Site-wide health dashboard" phase="Phase 2" />
}

function PlaceholderCard({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="max-w-[640px] border border-dashed border-[var(--color-border)] p-8 text-[13px] text-[var(--color-muted)]">
      <h2 className="text-[18px] font-semibold text-[var(--color-primary)] mb-2">{title}</h2>
      <p className="mb-3">
        Coming in <strong>{phase}</strong>. The Inspector tab covers the per-URL view today.
      </p>
      <p className="font-mono text-[11px]">
        Tracked: site-wide score trend, worst offenders by entity, check-level pass rate, &quot;orphans&quot; (no internal links in).
      </p>
    </div>
  )
}
