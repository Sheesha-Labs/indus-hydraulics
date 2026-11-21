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
      setResult({
        kind: 'done',
        ingested: r.data.ingested,
        failed: r.data.failed,
        errors: r.data.errors,
      })
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
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending || selectedCount === 0}
        className="bg-ih-accent text-ih-accent-fg h-9 px-4 text-[12px] tracking-wider uppercase tabular-nums disabled:opacity-50"
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
        className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 h-9 rounded-md border px-4 text-[12px] tracking-wider uppercase tabular-nums disabled:opacity-50"
        title="Mark every row whose SKU already exists on indushydraulics.com as 'skipped'"
      >
        {skipPending ? 'Skipping…' : 'Skip duplicates'}
      </button>

      {result.kind === 'done' && (
        <div
          role="status"
          className="bg-ih-success-soft rounded-lg border border-[oklch(0.4_0.14_145)] px-3 py-1.5 text-[12px] text-[oklch(0.3_0.14_145)]"
        >
          {result.ingested} ingested
          {result.failed > 0 ? `, ${result.failed} failed` : ''}.
          {result.errors.length > 0 && (
            <details className="mt-1">
              <summary className="cursor-pointer text-[11px] underline">View errors</summary>
              <ul className="mt-1 list-inside list-disc text-[11px]">
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
          className="border-ih-border bg-ih-surface-2 text-ih-ink-2 rounded-lg border px-3 py-1.5 text-[12px]"
        >
          {result.count === 0
            ? 'No duplicate SKUs found — nothing to skip.'
            : `Skipped ${result.count} row${result.count === 1 ? '' : 's'} whose SKU already exists.`}
        </div>
      )}

      {result.kind === 'error' && (
        <div
          role="alert"
          className="bg-ih-danger-soft rounded-lg border border-[oklch(0.4_0.18_25)] px-3 py-1.5 text-[12px] text-[oklch(0.3_0.18_25)]"
        >
          {result.message}
        </div>
      )}
    </div>
  )
}
