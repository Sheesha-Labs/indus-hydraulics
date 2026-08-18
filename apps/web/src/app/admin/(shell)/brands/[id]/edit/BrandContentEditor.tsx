'use client'

import { useState, useTransition } from 'react'
import {
  updateBrandContent,
  createBrandCaseStudy,
  updateBrandCaseStudy,
  deleteBrandCaseStudy,
} from './content-actions'

type CaseStudy = {
  id: string
  tag: string
  title: string
  description: string
  year: string | null
  imageId: string | null
  position: number
  isPublished: boolean
  stats: string
}

type Props = {
  brand: {
    id: string
    position: number
    accountManagerName: string | null
    accountManagerTitle: string | null
    accountManagerYearsExp: string | null
    accountManagerInitials: string | null
    fastestLeadTime: string | null
    largestInstallValue: string | null
    largestInstallContext: string | null
    partnerSince: number | null
  }
  caseStudies: CaseStudy[]
}

export default function BrandContentEditor({ brand, caseStudies }: Props) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <ContentForm brand={brand} />
      <CaseStudiesSection brandId={brand.id} caseStudies={caseStudies} />
    </div>
  )
}

function ContentForm({ brand }: { brand: Props['brand'] }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData): void {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await updateBrandContent(formData)
      if (result.success) setMessage('Saved')
      else setError(result.message)
    })
  }

  return (
    <section className="rounded-lg border border-ih-border bg-ih-surface">
      <header className="px-5 py-4 border-b border-ih-border">
        <h2 className="text-[15px] font-medium">Brand page content</h2>
        <p className="text-[12px] text-ih-muted mt-1">
          Specialist card + stats row shown on the storefront brand page. Leave fields empty to hide
          their cells — partially-filled brands degrade gracefully.
        </p>
      </header>
      <form action={onSubmit} className="p-5 flex flex-col gap-4">
        <input type="hidden" name="id" value={brand.id} />

        <Field label="Display position" hint="Sort order on lists (lower = first).">
          <input
            name="position"
            type="number"
            defaultValue={brand.position}
            className="w-full h-9 px-3 border border-ih-border text-[13px]"
          />
        </Field>

        <fieldset className="border border-ih-border p-4 flex flex-col gap-3">
          <legend className="text-[11px] font-mono uppercase tracking-[0.1em] text-ih-muted px-2">
            Specialist card
          </legend>
          <p className="text-[11px] text-ih-muted">
            Whole card hides on the storefront when name is empty.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account manager name">
              <input
                name="accountManagerName"
                defaultValue={brand.accountManagerName ?? ''}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
            <Field label="Title" hint='e.g. "Senior Applications Engineer"'>
              <input
                name="accountManagerTitle"
                defaultValue={brand.accountManagerTitle ?? ''}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
            <Field label="Years exp." hint='e.g. "12 yrs · certified"'>
              <input
                name="accountManagerYearsExp"
                defaultValue={brand.accountManagerYearsExp ?? ''}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
            <Field label="Initials" hint="Auto-derived from name when empty.">
              <input
                name="accountManagerInitials"
                defaultValue={brand.accountManagerInitials ?? ''}
                maxLength={4}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="border border-ih-border p-4 flex flex-col gap-3">
          <legend className="text-[11px] font-mono uppercase tracking-[0.1em] text-ih-muted px-2">
            Stats row
          </legend>
          <p className="text-[11px] text-ih-muted">
            Each cell hides when empty. &ldquo;SKUs in stock&rdquo; is computed automatically from
            live inventory.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fastest lead time" hint='e.g. "24h" or "next day"'>
              <input
                name="fastestLeadTime"
                defaultValue={brand.fastestLeadTime ?? ''}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
            <Field label="Partner since (year)">
              <input
                name="partnerSince"
                type="number"
                defaultValue={brand.partnerSince ?? ''}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
            <Field label="Largest install value" hint='e.g. "740 kW"'>
              <input
                name="largestInstallValue"
                defaultValue={brand.largestInstallValue ?? ''}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
            <Field label="Largest install context" hint="Caption shown below the value.">
              <input
                name="largestInstallContext"
                defaultValue={brand.largestInstallContext ?? ''}
                className="w-full h-9 px-3 border border-ih-border text-[13px]"
              />
            </Field>
          </div>
        </fieldset>

        <div className="flex items-center gap-4 pt-2 border-t border-ih-border">
          <button
            type="submit"
            disabled={pending}
            className="flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save brand content'}
          </button>
          {message && (
            <span className="text-[12px] text-ih-success-ink font-medium">{message}</span>
          )}
          {error && (
            <span className="text-[12px] text-ih-danger-ink font-medium">{error}</span>
          )}
        </div>
      </form>
    </section>
  )
}

function CaseStudiesSection({
  brandId,
  caseStudies,
}: {
  brandId: string
  caseStudies: CaseStudy[]
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <section className="rounded-lg border border-ih-border bg-ih-surface">
      <header className="px-5 py-4 border-b border-ih-border flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-medium">Case studies</h2>
          <p className="text-[12px] text-ih-muted mt-1">
            Customer install stories surfaced on the storefront brand page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="h-8 px-3 bg-ih-accent text-ih-accent-fg text-[12px] font-medium hover:bg-ih-accent-hover"
        >
          {adding ? '× Cancel' : '+ Add case study'}
        </button>
      </header>

      <div className="p-5 flex flex-col gap-4">
        {adding && (
          <CaseStudyForm brandId={brandId} onDone={() => setAdding(false)} mode="create" />
        )}

        {caseStudies.length === 0 && !adding ? (
          <p className="text-[13px] text-ih-muted">
            No case studies yet. Click &ldquo;Add case study&rdquo; above.
          </p>
        ) : (
          caseStudies.map((cs) =>
            editingId === cs.id ? (
              <CaseStudyForm
                key={cs.id}
                brandId={brandId}
                existing={cs}
                onDone={() => setEditingId(null)}
                mode="edit"
              />
            ) : (
              <CaseStudyRow
                key={cs.id}
                caseStudy={cs}
                brandId={brandId}
                onEdit={() => setEditingId(cs.id)}
              />
            ),
          )
        )}
      </div>
    </section>
  )
}

function CaseStudyRow({
  caseStudy,
  brandId,
  onEdit,
}: {
  caseStudy: CaseStudy
  brandId: string
  onEdit: () => void
}) {
  const [pending, startTransition] = useTransition()

  function onDelete() {
    if (!confirm(`Delete case study "${caseStudy.title}"?`)) return
    const fd = new FormData()
    fd.set('id', caseStudy.id)
    fd.set('brandId', brandId)
    startTransition(() => {
      void deleteBrandCaseStudy(fd)
    })
  }

  return (
    <div className="rounded-lg border border-ih-border bg-ih-surface-2 p-4 flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-ih-muted">
            {caseStudy.tag}
          </span>
          {!caseStudy.isPublished && (
            <span className="font-mono text-[10.5px] px-1.5 py-0.5 bg-ih-bg text-ih-muted">
              DRAFT
            </span>
          )}
          <span className="font-mono text-[11px] text-ih-muted">
            #{caseStudy.position}
          </span>
        </div>
        <div className="text-[13px] font-medium">{caseStudy.title}</div>
        <p className="text-[12px] text-ih-muted mt-1 line-clamp-2">
          {caseStudy.description}
        </p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="h-7 px-3 text-[11px] rounded-lg border border-ih-border bg-ih-surface hover:border-ih-accent"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="h-7 px-3 text-[11px] rounded-lg border border-ih-border bg-ih-surface text-ih-danger-ink hover:border-[oklch(0.55_0.16_25)] disabled:opacity-50"
        >
          {pending ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

function CaseStudyForm({
  brandId,
  existing,
  onDone,
  mode,
}: {
  brandId: string
  existing?: CaseStudy
  onDone: () => void
  mode: 'create' | 'edit'
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData): void {
    setError(null)
    startTransition(async () => {
      const action = mode === 'edit' ? updateBrandCaseStudy : createBrandCaseStudy
      const result = await action(formData)
      if (result.success) onDone()
      else setError(result.message)
    })
  }

  return (
    <form
      action={onSubmit}
      className="border border-ih-accent bg-ih-surface-2 p-4 flex flex-col gap-3"
    >
      <input type="hidden" name="brandId" value={brandId} />
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-[1fr_140px_80px] gap-3">
        <Field label="Tag" hint='e.g. "RELIANCE · 2024"'>
          <input
            name="tag"
            required
            defaultValue={existing?.tag ?? ''}
            className="w-full h-9 px-3 border border-ih-border text-[13px]"
          />
        </Field>
        <Field label="Year">
          <input
            name="year"
            defaultValue={existing?.year ?? ''}
            className="w-full h-9 px-3 border border-ih-border text-[13px]"
          />
        </Field>
        <Field label="Position">
          <input
            name="position"
            type="number"
            defaultValue={existing?.position ?? 0}
            className="w-full h-9 px-3 border border-ih-border text-[13px]"
          />
        </Field>
      </div>

      <Field label="Title">
        <input
          name="title"
          required
          defaultValue={existing?.title ?? ''}
          className="w-full h-9 px-3 border border-ih-border text-[13px]"
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          required
          defaultValue={existing?.description ?? ''}
          rows={3}
          className="w-full px-3 py-2 border border-ih-border text-[13px] resize-vertical"
        />
      </Field>
      <Field
        label="Inline stats (JSON array of { value, label })"
        hint='e.g. [{"value":"36h","label":"end-to-end"},{"value":"$148k","label":"avoided downtime"}]'
      >
        <textarea
          name="stats"
          defaultValue={existing?.stats ?? '[]'}
          rows={3}
          spellCheck={false}
          className="w-full px-3 py-2 border border-ih-border text-[12px] font-mono resize-vertical"
        />
      </Field>
      <Field label="Image media ID" hint="Optional UUID from the media library.">
        <input
          name="imageId"
          defaultValue={existing?.imageId ?? ''}
          placeholder="leave empty for no image"
          className="w-full h-9 px-3 border border-ih-border text-[13px] font-mono"
        />
      </Field>

      <label className="flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={existing?.isPublished ?? true}
        />
        Published (visible on storefront)
      </label>

      <div className="flex items-center gap-3 pt-2 border-t border-ih-border">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-ih-accent text-ih-accent-fg text-[12px] font-medium hover:bg-ih-accent-hover disabled:opacity-50"
        >
          {pending ? 'Saving…' : mode === 'create' ? 'Add case study' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-9 px-4 border border-ih-border text-[12px] font-medium hover:bg-ih-surface"
        >
          Cancel
        </button>
        {error && (
          <span className="text-[12px] text-ih-danger-ink font-medium">{error}</span>
        )}
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-ih-ink">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ih-muted">{hint}</span>}
    </label>
  )
}
