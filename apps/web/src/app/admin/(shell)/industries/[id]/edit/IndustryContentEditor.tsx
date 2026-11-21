'use client'

import { DeleteButton } from '@indus/ui'
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
    <div className="flex max-w-4xl flex-col gap-8">
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
    <section className="border-ih-border bg-ih-surface rounded-lg border">
      <header className="border-ih-border border-b px-5 py-4">
        <h2 className="text-[15px] font-medium">Content & layout</h2>
        <p className="text-ih-muted mt-1 text-[12px]">
          Display copy and structured marketing data for the storefront industry page. JSON fields
          (chips, stats, delivery areas, support block) edit in place — invalid JSON blocks the save
          rather than silently dropping data.
        </p>
      </header>
      <form action={onSubmit} className="flex flex-col gap-4 p-5">
        <input type="hidden" name="id" value={industry.id} />

        <Field
          label="Tagline / eyebrow"
          hint='Short uppercase eyebrow ("UPSTREAM · MIDSTREAM · DOWNSTREAM")'
        >
          <input
            name="tagline"
            defaultValue={industry.tagline ?? ''}
            className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px]"
          />
        </Field>

        <Field label="Headline (H1)" hint="The big sentence shown above the description.">
          <textarea
            name="headline"
            defaultValue={industry.headline ?? ''}
            rows={2}
            className="border-ih-border resize-vertical w-full rounded-md border px-3 py-2 text-[13px]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Breadcrumb (all-caps)" hint="OIL & GAS">
            <input
              name="breadcrumb"
              defaultValue={industry.breadcrumb ?? ''}
              className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px]"
            />
          </Field>
          <Field label="Position" hint="Sort order (lower = first).">
            <input
              name="position"
              type="number"
              defaultValue={industry.position}
              className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px]"
            />
          </Field>
        </div>

        <Field label="Gradient CSS" hint="Used as the dark hero band on the detail page.">
          <input
            name="gradient"
            defaultValue={industry.gradient ?? ''}
            className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px] tabular-nums"
          />
        </Field>

        <Field
          label="Hero image"
          hint="Image shown behind the dark hero band on the storefront industry page."
        >
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

        <Field
          label="Featured product SKUs"
          hint="Comma-separated. When empty the page falls back to featured categories."
        >
          <input
            name="featuredProductSkus"
            defaultValue={industry.featuredProductSkus}
            className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px] tabular-nums"
          />
        </Field>
        <Field
          label="Featured category slugs"
          hint="Comma-separated category slugs used when SKUs are not curated."
        >
          <input
            name="featuredCategorySlugs"
            defaultValue={industry.featuredCategorySlugs}
            className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px] tabular-nums"
          />
        </Field>

        <div className="border-ih-border flex items-center gap-4 border-t pt-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover flex h-8 items-center rounded-lg px-2.5 text-[14px] font-medium transition-colors disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save content'}
          </button>
          {message && (
            <span className="text-ih-success-ink text-[12px] font-medium">{message}</span>
          )}
          {error && <span className="text-ih-danger-ink text-[12px] font-medium">{error}</span>}
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
    <section className="border-ih-border bg-ih-surface rounded-lg border">
      <header className="border-ih-border flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-[15px] font-medium">Case studies</h2>
          <p className="text-ih-muted mt-1 text-[12px]">
            Customer install stories surfaced on the storefront industry page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-8 px-3 text-[12px] font-medium"
        >
          {adding ? '× Cancel' : '+ Add case study'}
        </button>
      </header>

      <div className="flex flex-col gap-4 p-5">
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
          <p className="text-ih-muted text-[13px]">No case studies yet.</p>
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
            )
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
    <div className="border-ih-border bg-ih-surface-2 flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-ih-muted text-[10.5px] tracking-[0.08em] uppercase tabular-nums">
            {caseStudy.tag}
          </span>
          {!caseStudy.isPublished && (
            <span className="bg-ih-bg text-ih-muted px-1.5 py-0.5 text-[10.5px] tabular-nums">
              DRAFT
            </span>
          )}
          <span className="text-ih-muted text-[11px] tabular-nums">#{caseStudy.position}</span>
        </div>
        <div className="text-[13px] font-medium">{caseStudy.title}</div>
        <p className="text-ih-muted mt-1 line-clamp-2 text-[12px]">{caseStudy.description}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="border-ih-border bg-ih-surface hover:border-ih-accent h-7 rounded-lg border px-3 text-[11px]"
        >
          Edit
        </button>
        <DeleteButton
          label={`Delete case study ${caseStudy.title}`}
          size="sm"
          pending={pending}
          onClick={onDelete}
        />
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
      className="border-ih-accent bg-ih-surface-2 flex flex-col gap-3 rounded-lg border p-4"
    >
      <input type="hidden" name="industryId" value={industryId} />
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid grid-cols-[1fr_140px_80px] gap-3">
        <Field label="Tag" hint='e.g. "HPCL · 2024"'>
          <input
            name="tag"
            required
            defaultValue={existing?.tag ?? ''}
            className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px]"
          />
        </Field>
        <Field label="Year" hint="Optional, e.g. 2024">
          <input
            name="year"
            defaultValue={existing?.year ?? ''}
            className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px]"
          />
        </Field>
        <Field label="Position">
          <input
            name="position"
            type="number"
            defaultValue={existing?.position ?? 0}
            className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px]"
          />
        </Field>
      </div>

      <Field label="Title">
        <input
          name="title"
          required
          defaultValue={existing?.title ?? ''}
          className="border-ih-border h-9 w-full rounded-md border px-3 text-[13px]"
        />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          required
          defaultValue={existing?.description ?? ''}
          rows={3}
          className="border-ih-border resize-vertical w-full rounded-md border px-3 py-2 text-[13px]"
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
        <input type="checkbox" name="isPublished" defaultChecked={existing?.isPublished ?? true} />
        Published (visible on storefront)
      </label>

      <div className="border-ih-border flex items-center gap-3 border-t pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 px-4 text-[12px] font-medium disabled:opacity-50"
        >
          {pending ? 'Saving…' : mode === 'create' ? 'Add case study' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="border-ih-border hover:bg-ih-surface h-9 rounded-md border px-4 text-[12px] font-medium"
        >
          Cancel
        </button>
        {error && <span className="text-ih-danger-ink text-[12px] font-medium">{error}</span>}
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
      <span className="text-ih-ink text-[12px] font-medium">{label}</span>
      {children}
      {hint && <span className="text-ih-muted text-[11px]">{hint}</span>}
    </label>
  )
}
