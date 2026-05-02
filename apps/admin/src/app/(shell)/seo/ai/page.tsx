import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'AI Generation — Indus Admin' }

/**
 * AI Suggest layer. Per-entity Suggest drawer + bulk Anthropic Batch
 * generation + cost telemetry. Schema tables `AiPromptTemplate`,
 * `AiSuggestion`, `AiUsageQuota` ship in this PR; the streaming Sonnet
 * drawer + Inngest fan-out land in the next commit pair.
 */
export default function SeoAiPage() {
  return (
    <div className="max-w-[640px] border border-dashed border-[var(--color-border)] p-8 text-[13px] text-[var(--color-muted)]">
      <h2 className="text-[18px] font-semibold text-[var(--color-primary)] mb-2">
        AI generation
      </h2>
      <p className="mb-2">
        Per-entity &quot;Suggest&quot; drawer (Sonnet streaming) lands first; bulk catalogue
        generation via Anthropic Batches + Inngest follows in Phase 2.
      </p>
      <p className="font-mono text-[11px]">
        Default models: <code>claude-haiku-4-5</code> for bulk, <code>claude-sonnet-4-6</code>{' '}
        for per-entity quality. Cost capped per staff user via <code>AiUsageQuota</code>.
      </p>
    </div>
  )
}
