'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ingestSelected, skipAllWithExistingSku } from '../actions'

export default function BulkActions({
  jobId,
  selectedCount,
  jobReady,
}: {
  jobId: string
  selectedCount: number
  jobReady: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [skipPending, startSkipTransition] = useTransition()
  const [result, setResult] = useState<
    | { kind: 'idle' }
    | { kind: 'done'; ingested: number; failed: number; errors: string[] }
    | { kind: 'skipped'; count: number }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })

  function onClick() {
    setResult({ kind: 'idle' })
    startTransition(async () => {
      const r = await ingestSelected(jobId)
      if (!r.success) {
        setResult({ kind: 'error', message: r.message })
        return
      }
      setResult({ kind: 'done', ingested: r.data.ingested, failed: r.data.failed, errors: r.data.errors })
      router.refresh()
    })
  }

  function onSkipDupes() {
    setResult({ kind: 'idle' })
    startSkipTransition(async () => {
      const r = await skipAllWithExistingSku(jobId)
      if (!r.success) {
        setResult({ kind: 'error', message: r.message })
        return
      }
      setResult({ kind: 'skipped', count: r.data.skipped })
      router.refresh()
    })
  }

  if (!jobReady) return null

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={onClick}
        disabled={pending || selectedCount === 0}
        className="h-9 px-4 bg-ih-accent text-white font-mono text-[12px] uppercase tracking-wider disabled:opacity-50"
      >
        {pending
          ? `Ingesting ${selectedCount}…`
          : selectedCount === 0
          ? 'Ingest all selected'
          : `Ingest all selected (${selectedCount})`}
      </button>

      <button
        type="button"
        onClick={onSkipDupes}
        disabled={skipPending}
        className="h-9 px-4 border border-ih-border text-ih-ink-2 font-mono text-[12px] uppercase tracking-wider hover:bg-ih-surface-2 disabled:opacity-50"
        title="Mark every row whose SKU already exists on indushydraulics.com as 'skipped'"
      >
        {skipPending ? 'Skipping…' : 'Skip duplicates'}
      </button>

      {result.kind === 'done' && (
        <div
          role="status"
          className="border border-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)] text-[oklch(0.3_0.14_145)] px-3 py-1.5 text-[12px]"
        >
          {result.ingested} ingested
          {result.failed > 0 ? `, ${result.failed} failed` : ''}.
          {result.errors.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-[11px] underline">View errors</summary>
              <ul className="mt-1 text-[11px] list-disc list-inside">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {result.kind === 'skipped' && (
        <div
          role="status"
          className="border border-ih-border bg-ih-surface-2 text-ih-ink-2 px-3 py-1.5 text-[12px]"
        >
          {result.count === 0
            ? 'No duplicate SKUs found — nothing to skip.'
            : `Skipped ${result.count} row${result.count === 1 ? '' : 's'} whose SKU already exists.`}
        </div>
      )}

      {result.kind === 'error' && (
        <div
          role="alert"
          className="border border-[oklch(0.4_0.18_25)] bg-[oklch(0.94_0.06_25)] text-[oklch(0.3_0.18_25)] px-3 py-1.5 text-[12px]"
        >
          {result.message}
        </div>
      )}
    </div>
  )
}
