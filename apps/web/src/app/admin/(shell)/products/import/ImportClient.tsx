'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Stepper } from '@indus/ui'
import { PRODUCT_IMPORT_COLUMNS } from './columns'
import {
  cancelImportPreview,
  commitProductImport,
  getImportTemplateCsv,
  uploadAndPreviewImport,
} from './actions'

const STEPS = [
  { label: 'Upload', description: 'CSV or XLSX' },
  { label: 'Preview', description: 'Check rows' },
  { label: 'Commit', description: 'Apply' },
  { label: 'Done', description: 'Results' },
]

type Phase =
  | { kind: 'upload' }
  | {
      kind: 'preview'
      jobId: string
      totalRows: number
      rowsToCreate: number
      rowsToUpdate: number
      rowsWithErrors: number
      sample: SampleRow[]
    }
  | { kind: 'committing' }
  | { kind: 'done'; created: number; updated: number; failed: number }

type SampleRow = {
  rowNumber: number
  sku: string
  title: string
  outcome: string
  messages: string[]
}

export default function ImportClient() {
  const [phase, setPhase] = useState<Phase>({ kind: 'upload' })
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const stepNumber =
    phase.kind === 'upload' ? 1 : phase.kind === 'preview' ? 2 : phase.kind === 'committing' ? 3 : 4

  function handleUpload(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await uploadAndPreviewImport(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      setPhase({ kind: 'preview', ...r.data })
    })
  }

  function handleCommit(jobId: string) {
    setError(null)
    setPhase({ kind: 'committing' })
    startTransition(async () => {
      const r = await commitProductImport(jobId)
      if (!r.success) {
        setError(r.message)
        setPhase({ kind: 'upload' })
        return
      }
      setPhase({ kind: 'done', ...r.data })
    })
  }

  function handleCancel(jobId: string) {
    setError(null)
    startTransition(async () => {
      await cancelImportPreview(jobId)
      formRef.current?.reset()
      setPhase({ kind: 'upload' })
    })
  }

  function handleDownloadTemplate() {
    startTransition(async () => {
      const csv = await getImportTemplateCsv()
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'indus-product-import-template.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="border-ih-border bg-ih-surface rounded-lg border p-6">
        <Stepper steps={STEPS} currentStep={stepNumber} />
      </div>

      {error && (
        <div className="text-ih-danger-ink rounded-lg border border-[oklch(0.7_0.18_25)] bg-[oklch(0.97_0.05_25)] px-4 py-3 text-[13px]">
          {error}
        </div>
      )}

      {phase.kind === 'upload' && (
        <UploadStep
          onSubmit={handleUpload}
          pending={pending}
          formRef={formRef}
          onTemplate={handleDownloadTemplate}
        />
      )}
      {phase.kind === 'preview' && (
        <PreviewStep
          phase={phase}
          pending={pending}
          onCommit={() => handleCommit(phase.jobId)}
          onCancel={() => handleCancel(phase.jobId)}
        />
      )}
      {phase.kind === 'committing' && <CommittingStep />}
      {phase.kind === 'done' && (
        <DoneStep phase={phase} onAnother={() => setPhase({ kind: 'upload' })} />
      )}
    </div>
  )
}

// ── Step 1: Upload ─────────────────────────────────────────────────────────

function UploadStep({
  onSubmit,
  pending,
  formRef,
  onTemplate,
}: {
  onSubmit: (fd: FormData) => void
  pending: boolean
  formRef: React.RefObject<HTMLFormElement | null>
  onTemplate: () => void
}) {
  return (
    <form
      ref={formRef}
      action={onSubmit}
      encType="multipart/form-data"
      className="border-ih-border bg-ih-surface rounded-lg border p-8"
    >
      <h2 className="mb-2 text-[15px] font-medium">Step 1 — Upload your file</h2>
      <p className="text-ih-muted mb-2 text-[13px]">
        CSV or XLSX, up to 10 MB and 5,000 rows. Required columns:{' '}
        <span className="tabular-nums">sku</span>, <span className="tabular-nums">title</span>.
        Brand and category must reference existing slugs.
      </p>
      <p className="text-ih-muted mb-5 text-[12px]">
        To set typed specs in bulk, add <span className="tabular-nums">spec_template_slug</span>{' '}
        plus one <span className="tabular-nums">attr_&lt;field_key&gt;</span> column per template
        field. The downloaded template includes a real example using the first template you have
        defined.
      </p>

      <div className="mb-5 flex items-center gap-3">
        <input
          required
          type="file"
          name="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="file:border-ih-border file:bg-ih-bg file:hover:bg-ih-surface-2 text-[13px] file:mr-3 file:h-9 file:cursor-pointer file:border file:px-3 file:text-[12px] file:font-medium"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-9 px-4 text-[12px] font-medium disabled:opacity-50"
        >
          {pending ? 'Parsing…' : '→ Parse file'}
        </button>
        <button
          type="button"
          onClick={onTemplate}
          className="border-ih-border bg-ih-surface hover:bg-ih-surface-2 h-9 rounded-lg border px-4 text-[12px] font-medium"
        >
          ↓ Download template CSV
        </button>
      </div>

      <details className="text-[13px]">
        <summary className="text-ih-muted hover:text-ih-ink cursor-pointer font-medium">
          Show all supported columns ({PRODUCT_IMPORT_COLUMNS.length})
        </summary>
        <div className="border-ih-border mt-3 overflow-hidden rounded-lg border">
          <table className="w-full text-[12px]">
            <thead className="bg-ih-bg">
              <tr>
                <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                  Column
                </th>
                <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                  Required
                </th>
                <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                  Description
                </th>
                <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                  Example
                </th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_IMPORT_COLUMNS.map((c) => (
                <tr key={c.key} className="border-ih-border border-t">
                  <td className="px-3 py-2 text-[12px] tabular-nums">{c.key}</td>
                  <td className="px-3 py-2 text-[12px]">{c.required ? 'yes' : ''}</td>
                  <td className="text-ih-ink-2 px-3 py-2 text-[12px]">{c.description}</td>
                  <td className="text-ih-muted px-3 py-2 text-[11px] tabular-nums">
                    {c.example ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </form>
  )
}

// ── Step 2: Preview ────────────────────────────────────────────────────────

function PreviewStep({
  phase,
  pending,
  onCommit,
  onCancel,
}: {
  phase: Extract<Phase, { kind: 'preview' }>
  pending: boolean
  onCommit: () => void
  onCancel: () => void
}) {
  const canCommit = phase.rowsToCreate + phase.rowsToUpdate > 0
  return (
    <div className="border-ih-border bg-ih-surface rounded-lg border p-8">
      <h2 className="mb-4 text-[15px] font-medium">Step 2 — Review preview</h2>

      <div className="mb-6 grid grid-cols-4 gap-3">
        <Stat label="Total rows" value={phase.totalRows} />
        <Stat label="Will create" value={phase.rowsToCreate} tone="success" />
        <Stat label="Will update" value={phase.rowsToUpdate} tone="info" />
        <Stat
          label="Errors"
          value={phase.rowsWithErrors}
          tone={phase.rowsWithErrors > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="border-ih-border mb-5 max-h-[440px] overflow-auto rounded-lg border">
        <table className="w-full text-[12px]">
          <thead className="bg-ih-bg sticky top-0">
            <tr>
              <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                Row
              </th>
              <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                SKU
              </th>
              <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                Title
              </th>
              <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                Outcome
              </th>
              <th className="text-ih-muted px-3 py-2 text-left text-[11px] tracking-[0.04em] uppercase tabular-nums">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {phase.sample.map((r) => (
              <tr key={r.rowNumber} className="border-ih-border border-t">
                <td className="text-ih-muted px-3 py-2 tabular-nums">{r.rowNumber}</td>
                <td className="px-3 py-2 tabular-nums">{r.sku}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">
                  <OutcomePill outcome={r.outcome} />
                </td>
                <td className="text-ih-muted px-3 py-2">
                  {r.messages.length === 0 ? '—' : r.messages.join('; ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {phase.totalRows > phase.sample.length && (
        <p className="text-ih-muted mb-4 text-[12px]">
          Showing first {phase.sample.length} of {phase.totalRows} rows. The full set will be
          processed on commit.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCommit}
          disabled={!canCommit || pending}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-10 px-5 text-[13px] font-medium disabled:opacity-50"
        >
          {pending
            ? 'Working…'
            : `Commit ${phase.rowsToCreate + phase.rowsToUpdate} product${phase.rowsToCreate + phase.rowsToUpdate === 1 ? '' : 's'}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="border-ih-border bg-ih-surface hover:bg-ih-surface-2 h-10 rounded-lg border px-5 text-[13px] font-medium disabled:opacity-50"
        >
          Cancel & start over
        </button>
        {!canCommit && (
          <span className="text-ih-danger-ink text-[12px]">
            All rows have errors — fix them in the file and re-upload.
          </span>
        )}
      </div>
    </div>
  )
}

// ── Step 3: Committing ────────────────────────────────────────────────────

function CommittingStep() {
  return (
    <div className="border-ih-border bg-ih-surface rounded-lg border p-12 text-center">
      <h2 className="mb-2 text-[15px] font-medium">Committing…</h2>
      <p className="text-ih-muted text-[13px]">
        Creating and updating products in batches of 50. This may take a minute for large files —
        please don&apos;t close the tab.
      </p>
    </div>
  )
}

// ── Step 4: Done ──────────────────────────────────────────────────────────

function DoneStep({
  phase,
  onAnother,
}: {
  phase: Extract<Phase, { kind: 'done' }>
  onAnother: () => void
}) {
  return (
    <div className="border-ih-border bg-ih-surface rounded-lg border p-8">
      <h2 className="mb-4 text-[15px] font-medium">Done.</h2>
      <div className="mb-6 grid max-w-lg grid-cols-3 gap-3">
        <Stat label="Created" value={phase.created} tone="success" />
        <Stat label="Updated" value={phase.updated} tone="info" />
        <Stat label="Failed" value={phase.failed} tone={phase.failed > 0 ? 'warning' : 'success'} />
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/products`}
          className="bg-ih-navy text-ih-bg hover:bg-ih-ink inline-flex h-10 items-center px-5 text-[13px] font-medium"
        >
          View products
        </Link>
        <button
          type="button"
          onClick={onAnother}
          className="border-ih-border bg-ih-surface hover:bg-ih-surface-2 h-10 rounded-lg border px-5 text-[13px] font-medium"
        >
          Import another file
        </button>
      </div>
    </div>
  )
}

// ── Bits ──────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string
  value: number
  tone?: 'success' | 'warning' | 'info' | 'neutral'
}) {
  const toneCls =
    tone === 'success'
      ? 'text-[oklch(0.45_0.15_150)]'
      : tone === 'warning'
        ? 'text-ih-danger-ink'
        : tone === 'info'
          ? 'text-ih-accent'
          : 'text-ih-ink'
  return (
    <div className="border-ih-border rounded-lg border p-3">
      <p className="text-ih-muted text-[10.5px] tracking-[0.1em] uppercase tabular-nums">{label}</p>
      <p className={`text-[22px] font-medium tabular-nums ${toneCls}`}>{value}</p>
    </div>
  )
}

function OutcomePill({ outcome }: { outcome: string }) {
  const cls =
    outcome === 'will create'
      ? 'bg-[oklch(0.95_0.05_150)] text-[oklch(0.4_0.15_150)]'
      : outcome === 'will update'
        ? 'bg-[oklch(0.95_0.05_240)] text-[oklch(0.4_0.15_240)]'
        : 'bg-[oklch(0.95_0.05_25)] text-[oklch(0.45_0.18_25)]'
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10.5px] tracking-[0.04em] uppercase tabular-nums ${cls}`}
    >
      {outcome}
    </span>
  )
}
