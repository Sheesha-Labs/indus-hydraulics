'use client'

import { useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Stepper } from '@indus/ui'
import { PRODUCT_IMPORT_COLUMNS } from './columns'
import { cancelImportPreview, commitProductImport, getImportTemplateCsv, uploadAndPreviewImport } from './actions'

const STEPS = [
  { label: 'Upload', description: 'CSV or XLSX' },
  { label: 'Preview', description: 'Check rows' },
  { label: 'Commit', description: 'Apply' },
  { label: 'Done', description: 'Results' },
]

type Phase =
  | { kind: 'upload' }
  | { kind: 'preview'; jobId: string; totalRows: number; rowsToCreate: number; rowsToUpdate: number; rowsWithErrors: number; sample: SampleRow[] }
  | { kind: 'committing' }
  | { kind: 'done'; created: number; updated: number; failed: number }

type SampleRow = {
  rowNumber: number
  sku: string
  title: string
  outcome: string
  messages: string[]
}

export default function ImportClient({ locale }: { locale: string }) {
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
      const r = await commitProductImport(jobId, locale)
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
      await cancelImportPreview(jobId, locale)
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
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="bg-white border border-[var(--color-border)] p-6">
        <Stepper steps={STEPS} currentStep={stepNumber} />
      </div>

      {error && (
        <div className="border border-[oklch(0.7_0.18_25)] bg-[oklch(0.97_0.05_25)] px-4 py-3 text-[13px] text-[oklch(0.4_0.18_25)]">
          {error}
        </div>
      )}

      {phase.kind === 'upload' && <UploadStep onSubmit={handleUpload} pending={pending} formRef={formRef} onTemplate={handleDownloadTemplate} />}
      {phase.kind === 'preview' && <PreviewStep phase={phase} pending={pending} onCommit={() => handleCommit(phase.jobId)} onCancel={() => handleCancel(phase.jobId)} />}
      {phase.kind === 'committing' && <CommittingStep />}
      {phase.kind === 'done' && <DoneStep phase={phase} locale={locale} onAnother={() => setPhase({ kind: 'upload' })} />}
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
      className="bg-white border border-[var(--color-border)] p-8"
    >
      <h2 className="text-[16px] font-semibold mb-2">Step 1 — Upload your file</h2>
      <p className="text-[13px] text-[var(--color-muted)] mb-2">
        CSV or XLSX, up to 10 MB and 5,000 rows. Required columns: <span className="font-mono">sku</span>,{' '}
        <span className="font-mono">title</span>. Brand and category must reference existing slugs.
      </p>
      <p className="text-[12px] text-[var(--color-muted)] mb-5">
        To set typed specs in bulk, add <span className="font-mono">spec_template_slug</span> plus one{' '}
        <span className="font-mono">attr_&lt;field_key&gt;</span> column per template field. The downloaded
        template includes a real example using the first template you have defined.
      </p>

      <div className="flex items-center gap-3 mb-5">
        <input
          required
          type="file"
          name="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="text-[13px] file:mr-3 file:h-9 file:px-3 file:border file:border-[var(--color-border)] file:bg-[var(--color-surface)] file:text-[12px] file:font-medium file:cursor-pointer file:hover:bg-[var(--color-deep)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Parsing…' : '→ Parse file'}
        </button>
        <button
          type="button"
          onClick={onTemplate}
          className="h-9 px-4 border border-[var(--color-border)] bg-white text-[12px] font-medium hover:bg-[var(--color-deep)]"
        >
          ↓ Download template CSV
        </button>
      </div>

      <details className="text-[13px]">
        <summary className="cursor-pointer text-[var(--color-muted)] font-medium hover:text-[var(--color-primary)]">
          Show all supported columns ({PRODUCT_IMPORT_COLUMNS.length})
        </summary>
        <div className="mt-3 border border-[var(--color-border)]">
          <table className="w-full text-[12px]">
            <thead className="bg-[var(--color-surface)]">
              <tr>
                <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] text-[var(--color-muted)] uppercase">Column</th>
                <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] text-[var(--color-muted)] uppercase">Required</th>
                <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] text-[var(--color-muted)] uppercase">Description</th>
                <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] text-[var(--color-muted)] uppercase">Example</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCT_IMPORT_COLUMNS.map((c) => (
                <tr key={c.key} className="border-t border-[var(--color-border-2)]">
                  <td className="px-3 py-2 font-mono text-[12px]">{c.key}</td>
                  <td className="px-3 py-2 text-[12px]">{c.required ? 'yes' : ''}</td>
                  <td className="px-3 py-2 text-[12px] text-[var(--color-body)]">{c.description}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-[var(--color-muted)]">{c.example ?? ''}</td>
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
    <div className="bg-white border border-[var(--color-border)] p-8">
      <h2 className="text-[16px] font-semibold mb-4">Step 2 — Review preview</h2>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Stat label="Total rows" value={phase.totalRows} />
        <Stat label="Will create" value={phase.rowsToCreate} tone="ok" />
        <Stat label="Will update" value={phase.rowsToUpdate} tone="info" />
        <Stat label="Errors" value={phase.rowsWithErrors} tone={phase.rowsWithErrors > 0 ? 'warn' : 'ok'} />
      </div>

      <div className="border border-[var(--color-border)] mb-5 overflow-auto" style={{ maxHeight: 440 }}>
        <table className="w-full text-[12px]">
          <thead className="bg-[var(--color-surface)] sticky top-0">
            <tr>
              <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] uppercase text-[var(--color-muted)]">Row</th>
              <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] uppercase text-[var(--color-muted)]">SKU</th>
              <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] uppercase text-[var(--color-muted)]">Title</th>
              <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] uppercase text-[var(--color-muted)]">Outcome</th>
              <th className="text-left px-3 py-2 font-mono text-[11px] tracking-[0.04em] uppercase text-[var(--color-muted)]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {phase.sample.map((r) => (
              <tr key={r.rowNumber} className="border-t border-[var(--color-border-2)]">
                <td className="px-3 py-2 font-mono text-[var(--color-muted)]">{r.rowNumber}</td>
                <td className="px-3 py-2 font-mono">{r.sku}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">
                  <OutcomePill outcome={r.outcome} />
                </td>
                <td className="px-3 py-2 text-[var(--color-muted)]">
                  {r.messages.length === 0 ? '—' : r.messages.join('; ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {phase.totalRows > phase.sample.length && (
        <p className="text-[12px] text-[var(--color-muted)] mb-4">
          Showing first {phase.sample.length} of {phase.totalRows} rows. The full set will be processed on commit.
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCommit}
          disabled={!canCommit || pending}
          className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Working…' : `Commit ${phase.rowsToCreate + phase.rowsToUpdate} product${phase.rowsToCreate + phase.rowsToUpdate === 1 ? '' : 's'}`}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="h-10 px-5 border border-[var(--color-border)] bg-white text-[13px] font-medium hover:bg-[var(--color-deep)] disabled:opacity-50"
        >
          Cancel & start over
        </button>
        {!canCommit && (
          <span className="text-[12px] text-[oklch(0.5_0.18_25)]">
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
    <div className="bg-white border border-[var(--color-border)] p-12 text-center">
      <h2 className="text-[16px] font-semibold mb-2">Committing…</h2>
      <p className="text-[13px] text-[var(--color-muted)]">
        Creating and updating products in batches of 50. This may take a minute for large files — please don't close the tab.
      </p>
    </div>
  )
}

// ── Step 4: Done ──────────────────────────────────────────────────────────

function DoneStep({
  phase,
  locale,
  onAnother,
}: {
  phase: Extract<Phase, { kind: 'done' }>
  locale: string
  onAnother: () => void
}) {
  return (
    <div className="bg-white border border-[var(--color-border)] p-8">
      <h2 className="text-[16px] font-semibold mb-4">Done.</h2>
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-lg">
        <Stat label="Created" value={phase.created} tone="ok" />
        <Stat label="Updated" value={phase.updated} tone="info" />
        <Stat label="Failed" value={phase.failed} tone={phase.failed > 0 ? 'warn' : 'ok'} />
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/${locale}/products`}
          className="h-10 px-5 inline-flex items-center bg-[var(--color-primary)] text-white text-[13px] font-medium hover:opacity-90"
        >
          View products
        </Link>
        <button
          type="button"
          onClick={onAnother}
          className="h-10 px-5 border border-[var(--color-border)] bg-white text-[13px] font-medium hover:bg-[var(--color-deep)]"
        >
          Import another file
        </button>
      </div>
    </div>
  )
}

// ── Bits ──────────────────────────────────────────────────────────────────

function Stat({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'ok' | 'warn' | 'info' | 'neutral' }) {
  const toneCls =
    tone === 'ok'
      ? 'text-[oklch(0.45_0.15_150)]'
      : tone === 'warn'
        ? 'text-[oklch(0.5_0.18_25)]'
        : tone === 'info'
          ? 'text-[var(--color-accent)]'
          : 'text-[var(--color-primary)]'
  return (
    <div className="border border-[var(--color-border)] p-3">
      <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">{label}</p>
      <p className={`font-mono text-[24px] font-semibold ${toneCls}`}>{value}</p>
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
    <span className={`inline-block px-2 py-0.5 font-mono text-[10px] tracking-[0.04em] uppercase ${cls}`}>
      {outcome}
    </span>
  )
}
