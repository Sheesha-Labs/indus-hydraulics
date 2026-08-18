'use client'

import { useState, useTransition } from 'react'
import {
  updateIndustryContent,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} from './content-actions'
import MediaPicker from '../../../../../../components/admin/MediaPicker'
import {
  ChipsEditor,
  DeliveryAreasEditor,
  StatsEditor,
  SupportBlockEditor,
} from '../../../../../../components/admin/StructuredJsonEditors'

type CaseStudy = {
  id: string
  tag: string
  title: string
  description: string
  year: string | null
  imageId: string | null
  position: number
  isPublished: boolean
}

type MediaItem = {
  id: string
  storagePath: string
  alt: string | null
  originalFilename: string
}

type Props = {
  industry: {
    id: string
    tagline: string | null
    headline: string | null
    breadcrumb: string | null
    gradient: string | null
    position: number
    chips: string
    stats: string
    deliveryAreas: string
    supportBlock: string
    featuredProductSkus: string
    featuredCategorySlugs: string
    heroId: string | null
  }
  caseStudies: CaseStudy[]
  recentImages: MediaItem[]
  publicUrlBase: string
}

export default function IndustryContentEditor({
  industry,
  caseStudies,
  recentImages,
  publicUrlBase,
}: Props) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <ContentForm industry={industry} recentImages={recentImages} publicUrlBase={publicUrlBase} />
      <CaseStudiesSection
        industryId={industry.id}
        caseStudies={caseStudies}
        recentImages={recentImages}
        publicUrlBase={publicUrlBase}
      />
    </div>
  )
}

// ── Industry content form ────────────────────────────────────────────────

function ContentForm({
  industry,
  recentImages,
  publicUrlBase,
}: {
  industry: Props['industry']
  recentImages: MediaItem[]
  publicUrlBase: string
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData): void {
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await updateIndustryContent(formData)
      if (result.success) {
        setMessage('Saved')
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <section className="rounded-lg border border-ih-border bg-ih-surface">
      <header className="px-5 py-4 border-b border-ih-border">
        <h2 className="text-[15px] font-medium">Content & layout</h2>
        <p className="text-[12px] text-ih-muted mt-1">
          Display copy and structured marketing data for the storefront industry page. JSON fields
          (chips, stats, delivery areas, support block) edit in place — invalid JSON blocks the save
          rather than silently dropping data.
        </p>
      </header>
      <form action={onSubmit} className="p-5 flex flex-col gap-4">
        <input type="hidden" name="id" value={industry.id} />

        <Field label="Tagline / eyebrow" hint='Short uppercase eyebrow ("UPSTREAM · MIDSTREAM · DOWNSTREAM")'>
          <input
            name="tagline"
            defaultValue={industry.tagline ?? ''}
            className="w-full h-9 px-3 border border-ih-border text-[13px]"
          />
        </Field>

        <Field label="Headline (H1)" hint="The big sentence shown above the description.">
          <textarea
            name="headline"
            defaultValue={industry.headline ?? ''}
            rows={2}
            className="w-full px-3 py-2 border border-ih-border text-[13px] resize-vertical"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Breadcrumb (all-caps)" hint="OIL & GAS">
            <input
              name="breadcrumb"
              defaultValue={industry.breadcrumb ?? ''}
              className="w-full h-9 px-3 border border-ih-border text-[13px]"
            />
          </Field>
          <Field label="Position" hint="Sort order (lower = first).">
            <input
              name="position"
              type="number"
              defaultValue={industry.position}
              className="w-full h-9 px-3 border border-ih-border text-[13px]"
            />
          </Field>
        </div>

        <Field label="Gradient CSS" hint="Used as the dark hero band on the detail page.">
          <input
            name="gradient"
            defaultValue={industry.gradient ?? ''}
            className="w-full h-9 px-3 border border-ih-border text-[13px] font-mono"
          />
        </Field>

        <Field label="Hero image" hint="Image shown behind the dark hero band on the storefront industry page.">
          <MediaPicker
            name="heroId"
            defaultValue={industry.heroId}
            recent={recentImages}
            publicUrlBase={publicUrlBase}
          />
        </Field>

        <Field label="Chips" hint="Small badges shown in the hero (one per chip).">
          <ChipsEditor name="chips" defaultValue={industry.chips} />
        </Field>

        <Field label="Stats" hint="Number + label pairs shown in the hero stat row.">
          <StatsEditor name="stats" defaultValue={industry.stats} />
        </Field>

        <Field label="Delivery areas" hint="Where-we-deliver tiles below the hero.">
          <DeliveryAreasEditor name="deliveryAreas" defaultValue={industry.deliveryAreas} />
        </Field>

        <Field label="Support block" hint="Closing CTA section. Leave blank to hide.">
          <SupportBlockEditor name="supportBlock" defaultValue={industry.supportBlock} />
        </Field>

        <Field label="Featured product SKUs" hint="Comma-separated. When empty the page falls back to featured categories.">
          <input
            name="featuredProductSkus"
            defaultValue={industry.featuredProductSkus}
            className="w-full h-9 px-3 border border-ih-border text-[13px] font-mono"
          />
        </Field>
        <Field label="Featured category slugs" hint="Comma-separated category slugs used when SKUs are not curated.">
          <input
            name="featuredCategorySlugs"
            defaultValue={industry.featuredCategorySlugs}
            className="w-full h-9 px-3 border border-ih-border text-[13px] font-mono"
          />
        </Field>

        <div className="flex items-center gap-4 pt-2 border-t border-ih-border">
          <button
            type="submit"
            disabled={pending}
            className="flex h-8 items-center rounded-lg bg-ih-accent px-2.5 text-[14px] font-medium text-ih-accent-fg transition-colors hover:bg-ih-accent-hover disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save content'}
          </button>
          {message && <span className="text-[12px] text-ih-success-ink font-medium">{message}</span>}
          {error && <span className="text-[12px] text-ih-danger-ink font-medium">{error}</span>}
        </div>
      </form>
    </section>
  )
}

// ── Case studies ──────────────────────────────────────────────────────────

function CaseStudiesSection({
  industryId,
  caseStudies,
  recentImages,
  publicUrlBase,
}: {
  industryId: string
  caseStudies: CaseStudy[]
  recentImages: MediaItem[]
  publicUrlBase: string
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <section className="rounded-lg border border-ih-border bg-ih-surface">
      <header className="px-5 py-4 border-b border-ih-border flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-medium">Case studies</h2>
          <p className="text-[12px] text-ih-muted mt-1">
            Customer install stories surfaced on the storefront industry page.
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
          <CaseStudyForm
            industryId={industryId}
            onDone={() => setAdding(false)}
            mode="create"
            recentImages={recentImages}
            publicUrlBase={publicUrlBase}
          />
        )}

        {caseStudies.length === 0 && !adding ? (
          <p className="text-[13px] text-ih-muted">No case studies yet.</p>
        ) : (
          caseStudies.map((cs) =>
            editingId === cs.id ? (
              <CaseStudyForm
                key={cs.id}
                industryId={industryId}
                existing={cs}
                onDone={() => setEditingId(null)}
                mode="edit"
                recentImages={recentImages}
                publicUrlBase={publicUrlBase}
              />
            ) : (
              <CaseStudyRow
                key={cs.id}
                caseStudy={cs}
                industryId={industryId}
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
  industryId,
  onEdit,
}: {
  caseStudy: CaseStudy
  industryId: string
  onEdit: () => void
}) {
  const [pending, startTransition] = useTransition()

  function onDelete() {
    if (!confirm(`Delete case study "${caseStudy.title}"?`)) return
    const fd = new FormData()
    fd.set('id', caseStudy.id)
    fd.set('industryId', industryId)
    startTransition(() => {
      void deleteCaseStudy(fd)
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
  industryId,
  existing,
  onDone,
  mode,
  recentImages,
  publicUrlBase,
}: {
  industryId: string
  existing?: CaseStudy
  onDone: () => void
  mode: 'create' | 'edit'
  recentImages: MediaItem[]
  publicUrlBase: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData): void {
    setError(null)
    startTransition(async () => {
      const action = mode === 'edit' ? updateCaseStudy : createCaseStudy
      const result = await action(formData)
      if (result.success) {
        onDone()
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <form
      action={onSubmit}
      className="border border-ih-accent bg-ih-surface-2 p-4 flex flex-col gap-3"
    >
      <input type="hidden" name="industryId" value={industryId} />
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-[1fr_140px_80px] gap-3">
        <Field label="Tag" hint='e.g. "HPCL · 2024"'>
          <input
            name="tag"
            required
            defaultValue={existing?.tag ?? ''}
            className="w-full h-9 px-3 border border-ih-border text-[13px]"
          />
        </Field>
        <Field label="Year" hint="Optional, e.g. 2024">
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
      <Field label="Image" hint="Optional — picks from the media library or accepts a UUID.">
        <MediaPicker
          name="imageId"
          defaultValue={existing?.imageId}
          recent={recentImages}
          publicUrlBase={publicUrlBase}
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
        {error && <span className="text-[12px] text-ih-danger-ink font-medium">{error}</span>}
      </div>
    </form>
  )
}

// ── Shared form pieces ────────────────────────────────────────────────────

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

