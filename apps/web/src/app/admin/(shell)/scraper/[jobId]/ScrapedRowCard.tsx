'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AttachToExistingPicker from './AttachToExistingPicker'
import type { AttachSearchHit } from '../actions'
import { setRowSelection, setRowIngestMode, updateRowMapping, ingestRow } from '../actions'

type CandidateImage = {
  url: string
  position: number
  alt?: string
  contentType?: string
  bytes?: number
}

export type ScrapedRowData = {
  id: string
  sourceUrl: string
  sourceTitle: string
  sourceSku: string | null
  sourceBrandText: string | null
  sourceCategoryText: string | null
  candidateImages: CandidateImage[]
  deselectedImageUrls: string[]
  selectionStatus: 'pending' | 'selected' | 'skipped' | 'ingested' | 'ingest_failed'
  ingestMode: 'create_new' | 'attach_to_existing'
  targetProduct: AttachSearchHit | null
  editedTitle: string | null
  editedSku: string | null
  mappedBrandId: string | null
  mappedCategoryId: string | null
  ingestedProductId: string | null
  ingestError: string | null
  defaultSku: string
  hasSkuClash: boolean
  /** Fuzzy-matched brand from scraped text (null when user has set a mapping or no match). */
  suggestedBrand: { id: string; name: string } | null
  /** Fuzzy-matched category from scraped text. */
  suggestedCategory: { id: string; name: string } | null
}

export type BrandOption = { id: string; name: string }
export type CategoryOption = { id: string; name: string; depth: number }

type Props = {
  row: ScrapedRowData
  brands: BrandOption[]
  categories: CategoryOption[]
  jobReady: boolean
}

const SELECTION_LABEL: Record<ScrapedRowData['selectionStatus'], string> = {
  pending: 'Pending',
  selected: 'Selected',
  skipped: 'Skipped',
  ingested: 'Ingested',
  ingest_failed: 'Failed',
}

const SELECTION_STYLE: Record<ScrapedRowData['selectionStatus'], string> = {
  pending: 'text-ih-muted bg-ih-surface-2',
  selected: 'text-[oklch(0.4_0.14_85)] bg-[oklch(0.94_0.06_85)]',
  skipped: 'text-ih-muted bg-ih-surface-2 line-through',
  ingested: 'text-ih-success-ink bg-ih-success-soft',
  ingest_failed: 'text-ih-danger-ink bg-ih-danger-soft',
}

export default function ScrapedRowCard({ row, brands, categories, jobReady }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Local state — the form mirrors edits until the user saves.
  // For brand/category, fall back to the fuzzy-matched suggestion when the
  // user hasn't picked one yet. The suggestion is shown next to the
  // dropdown label so they know it was auto-filled.
  const [editedTitle, setEditedTitle] = useState(row.editedTitle ?? '')
  const [editedSku, setEditedSku] = useState(row.editedSku ?? '')
  const [brandId, setBrandId] = useState(row.mappedBrandId ?? row.suggestedBrand?.id ?? '')
  const [categoryId, setCategoryId] = useState(
    row.mappedCategoryId ?? row.suggestedCategory?.id ?? ''
  )
  const [mode, setMode] = useState<ScrapedRowData['ingestMode']>(row.ingestMode)
  const [target, setTarget] = useState<AttachSearchHit | null>(row.targetProduct)
  const [deselected, setDeselected] = useState<Set<string>>(new Set(row.deselectedImageUrls))

  const locked = row.selectionStatus === 'ingested'
  const effectiveTitle = editedTitle.trim() || row.sourceTitle
  const effectiveSku = editedSku.trim() || row.sourceSku || row.defaultSku

  function toggleImage(url: string) {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  function call(fn: () => Promise<{ success: boolean; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const r = await fn()
      if (!r.success) {
        setError(r.message ?? 'Failed')
      } else {
        router.refresh()
      }
    })
  }

  function persistMapping() {
    return updateRowMapping(row.id, {
      editedTitle: editedTitle || null,
      editedSku: editedSku || null,
      mappedBrandId: brandId || null,
      mappedCategoryId: categoryId || null,
      deselectedImageUrls: Array.from(deselected),
    })
  }

  async function onSelect() {
    setError(null)
    startTransition(async () => {
      // Persist mapping first, then switch status.
      const mapRes = await persistMapping()
      if (!mapRes.success) {
        setError(mapRes.message)
        return
      }
      const r = await setRowSelection(row.id, 'selected')
      if (!r.success) setError(r.message)
      else router.refresh()
    })
  }

  async function onSkip() {
    call(() => setRowSelection(row.id, 'skipped'))
  }
  async function onReset() {
    call(() => setRowSelection(row.id, 'pending'))
  }

  async function onModeChange(next: ScrapedRowData['ingestMode']) {
    setMode(next)
    setError(null)
    if (next === 'attach_to_existing' && !target) {
      // Don't persist until they pick a target.
      return
    }
    startTransition(async () => {
      const r =
        next === 'create_new'
          ? await setRowIngestMode(row.id, { mode: 'create_new' })
          : await setRowIngestMode(row.id, {
              mode: 'attach_to_existing',
              targetProductId: target!.id,
            })
      if (!r.success) setError(r.message)
    })
  }

  async function onAttachPick(hit: AttachSearchHit | null) {
    setTarget(hit)
    setError(null)
    if (!hit) {
      // Switch back to create_new when the user clears the target.
      setMode('create_new')
      startTransition(async () => {
        await setRowIngestMode(row.id, { mode: 'create_new' })
      })
      return
    }
    startTransition(async () => {
      const r = await setRowIngestMode(row.id, {
        mode: 'attach_to_existing',
        targetProductId: hit.id,
      })
      if (!r.success) setError(r.message)
    })
  }

  async function onIngest() {
    setError(null)
    startTransition(async () => {
      const mapRes = await persistMapping()
      if (!mapRes.success) {
        setError(mapRes.message)
        return
      }
      // Ensure status=selected before ingesting.
      const selRes = await setRowSelection(row.id, 'selected')
      if (!selRes.success) {
        setError(selRes.message)
        return
      }
      const r = await ingestRow(row.id)
      if (!r.success) setError(r.message)
      else router.refresh()
    })
  }

  const kept = row.candidateImages.filter((c) => !deselected.has(c.url))

  return (
    <article
      className={`rounded-lg border ${row.selectionStatus === 'ingest_failed' ? 'border-[oklch(0.5_0.18_25)]' : 'border-ih-border'} bg-ih-bg`}
      aria-label={`Scraped product ${row.sourceTitle}`}
    >
      {/* Row header */}
      <header className="border-ih-border flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <span
          className={`px-2 py-0.5 text-[10.5px] tracking-wider uppercase tabular-nums ${SELECTION_STYLE[row.selectionStatus]}`}
        >
          {SELECTION_LABEL[row.selectionStatus]}
        </span>
        {row.hasSkuClash && row.selectionStatus !== 'ingested' && (
          <span
            className="bg-[oklch(0.94_0.06_85)] px-2 py-0.5 text-[10.5px] tracking-wider text-[oklch(0.4_0.14_85)] uppercase tabular-nums"
            title="A product with this SKU already exists on indushydraulics.com — consider attach-mode or skipping this row."
          >
            Existing SKU
          </span>
        )}
        <a
          href={row.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ih-muted hover:text-ih-ink flex-1 truncate text-[11px] tabular-nums"
        >
          {row.sourceUrl} ↗
        </a>
        {row.ingestedProductId && (
          <Link
            href={`/admin/products/${row.ingestedProductId}/edit`}
            className="text-ih-accent text-[11px] tracking-wider uppercase tabular-nums hover:underline"
          >
            Open product →
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_1fr]">
        {/* LEFT: image carousel */}
        <section className="border-ih-border border-b p-4 lg:border-r lg:border-b-0">
          <h3 className="text-ih-muted mb-2 text-[10.5px] tracking-wider uppercase tabular-nums">
            Candidate images ({kept.length} of {row.candidateImages.length} selected)
          </h3>
          {row.candidateImages.length === 0 ? (
            <p className="text-ih-muted text-[12px] italic">No images discovered on this page.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {row.candidateImages.map((img) => {
                const isDeselected = deselected.has(img.url)
                return (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => toggleImage(img.url)}
                    disabled={locked}
                    aria-pressed={!isDeselected}
                    aria-label={`Toggle image ${img.position + 1}`}
                    className={`bg-ih-surface-2 focus:ring-ih-accent relative aspect-square overflow-hidden rounded-md border focus:ring-2 focus:outline-none ${
                      isDeselected ? 'border-ih-border opacity-40' : 'border-ih-accent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? ''}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 px-1 text-[11px] text-white tabular-nums">
                      #{img.position + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* RIGHT: mapping form */}
        <section className="flex flex-col gap-3 p-4">
          <div>
            <h3 className="text-ih-muted mb-2 text-[10.5px] tracking-wider uppercase tabular-nums">
              Source signals
            </h3>
            <p className="text-ih-ink text-[13px] font-medium">{row.sourceTitle}</p>
            <div className="text-ih-muted mt-1 flex flex-wrap gap-2 text-[11px]">
              {row.sourceSku && (
                <span>
                  SKU: <span className="tabular-nums">{row.sourceSku}</span>
                </span>
              )}
              {row.sourceBrandText && <span>Brand: {row.sourceBrandText}</span>}
              {row.sourceCategoryText && <span>Category: {row.sourceCategoryText}</span>}
            </div>
          </div>

          <fieldset className="border-ih-border flex flex-col gap-2 rounded-lg border p-3">
            <legend className="text-ih-muted px-1 text-[10.5px] tracking-wider uppercase tabular-nums">
              Ingest mode
            </legend>
            <label className="text-ih-ink-2 flex items-start gap-2 text-[12px]">
              <input
                type="radio"
                name={`mode-${row.id}`}
                value="create_new"
                checked={mode === 'create_new'}
                onChange={() => onModeChange('create_new')}
                disabled={locked}
                className="mt-0.5"
              />
              <span>
                <strong>Create a new product</strong> on indushydraulics.com and attach the selected
                images to it.
              </span>
            </label>
            <label className="text-ih-ink-2 flex items-start gap-2 text-[12px]">
              <input
                type="radio"
                name={`mode-${row.id}`}
                value="attach_to_existing"
                checked={mode === 'attach_to_existing'}
                onChange={() => onModeChange('attach_to_existing')}
                disabled={locked}
                className="mt-0.5"
              />
              <span>
                <strong>Attach to an existing product</strong> — for when you already have the
                product but no images.
              </span>
            </label>
          </fieldset>

          {mode === 'attach_to_existing' ? (
            <AttachToExistingPicker selected={target} onSelect={onAttachPick} disabled={locked} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-ih-muted text-[10.5px] tracking-wider uppercase tabular-nums">
                  Title
                </span>
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder={row.sourceTitle}
                  disabled={locked}
                  className="border-ih-border bg-ih-bg h-8 rounded-md border px-2 text-[12px]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-ih-muted text-[10.5px] tracking-wider uppercase tabular-nums">
                  SKU
                </span>
                <input
                  value={editedSku}
                  onChange={(e) => setEditedSku(e.target.value)}
                  placeholder={row.sourceSku ?? row.defaultSku}
                  disabled={locked}
                  className="border-ih-border bg-ih-bg h-8 rounded-md border px-2 text-[12px] tabular-nums"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-ih-muted flex items-baseline gap-1.5 text-[10.5px] tracking-wider uppercase tabular-nums">
                  Brand
                  {row.suggestedBrand &&
                    brandId === row.suggestedBrand.id &&
                    row.mappedBrandId === null && (
                      <span className="text-ih-accent text-[10.5px] normal-case">auto-matched</span>
                    )}
                </span>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  disabled={locked}
                  className="border-ih-border bg-ih-bg h-8 rounded-md border px-2 text-[12px]"
                >
                  <option value="">— None —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-ih-muted flex items-baseline gap-1.5 text-[10.5px] tracking-wider uppercase tabular-nums">
                  Category
                  {row.suggestedCategory &&
                    categoryId === row.suggestedCategory.id &&
                    row.mappedCategoryId === null && (
                      <span className="text-ih-accent text-[10.5px] normal-case">auto-matched</span>
                    )}
                </span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={locked}
                  className="border-ih-border bg-ih-bg h-8 rounded-md border px-2 text-[12px]"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {'— '.repeat(c.depth)}
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {mode === 'create_new' && !locked && (
            <p className="text-ih-muted text-[11px]">
              On ingest, we&rsquo;ll create <code className="tabular-nums">{effectiveSku}</code> —{' '}
              <span>{effectiveTitle}</span>
            </p>
          )}

          {row.ingestError && (
            <p
              role="alert"
              className="text-ih-danger-ink bg-ih-danger-soft rounded-lg border border-[oklch(0.4_0.18_25)] px-2 py-1.5 text-[11px]"
            >
              {row.ingestError}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="text-ih-danger-ink bg-ih-danger-soft rounded-lg border border-[oklch(0.4_0.18_25)] px-2 py-1.5 text-[11px]"
            >
              {error}
            </p>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2">
            {!locked && row.selectionStatus !== 'selected' && (
              <button
                type="button"
                onClick={onSelect}
                disabled={pending}
                className="border-ih-accent text-ih-accent hover:bg-ih-accent-soft h-8 rounded-md border px-3 text-[11px] tracking-wider uppercase tabular-nums disabled:opacity-50"
              >
                Mark selected
              </button>
            )}
            {!locked && row.selectionStatus !== 'skipped' && (
              <button
                type="button"
                onClick={onSkip}
                disabled={pending}
                className="border-ih-border text-ih-muted hover:bg-ih-surface-2 h-8 rounded-md border px-3 text-[11px] tracking-wider uppercase tabular-nums disabled:opacity-50"
              >
                Skip
              </button>
            )}
            {!locked &&
              row.selectionStatus !== 'pending' &&
              row.selectionStatus !== 'ingest_failed' && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={pending}
                  className="text-ih-muted hover:text-ih-ink h-8 px-3 text-[11px] disabled:opacity-50"
                >
                  Reset
                </button>
              )}
            {!locked &&
              jobReady &&
              (mode === 'create_new' || (mode === 'attach_to_existing' && target)) && (
                <button
                  type="button"
                  onClick={onIngest}
                  disabled={pending || kept.length === 0}
                  className="bg-ih-accent text-ih-accent-fg ml-auto h-8 px-3 text-[11px] tracking-wider uppercase tabular-nums disabled:opacity-50"
                  title={kept.length === 0 ? 'Toggle at least one image back on' : undefined}
                >
                  {pending
                    ? 'Ingesting…'
                    : row.selectionStatus === 'ingest_failed'
                      ? 'Retry ingest'
                      : 'Ingest now'}
                </button>
              )}
          </div>
        </section>
      </div>
    </article>
  )
}
