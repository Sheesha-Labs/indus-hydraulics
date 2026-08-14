'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AttachToExistingPicker from './AttachToExistingPicker'
import type { AttachSearchHit } from '../actions'
import {
  setRowSelection,
  setRowIngestMode,
  updateRowMapping,
  ingestRow,
} from '../actions'

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
  pending: 'text-[var(--color-muted)] bg-[var(--color-deep)]',
  selected: 'text-[oklch(0.4_0.14_85)] bg-[oklch(0.94_0.06_85)]',
  skipped: 'text-[var(--color-muted)] bg-[var(--color-deep)] line-through',
  ingested: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)]',
  ingest_failed: 'text-[oklch(0.4_0.18_25)] bg-[oklch(0.94_0.06_25)]',
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
  const [categoryId, setCategoryId] = useState(row.mappedCategoryId ?? row.suggestedCategory?.id ?? '')
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
          : await setRowIngestMode(row.id, { mode: 'attach_to_existing', targetProductId: target!.id })
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
      const r = await setRowIngestMode(row.id, { mode: 'attach_to_existing', targetProductId: hit.id })
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
      className={`border ${row.selectionStatus === 'ingest_failed' ? 'border-[oklch(0.5_0.18_25)]' : 'border-[var(--color-border-default)]'} bg-[var(--color-surface)]`}
      aria-label={`Scraped product ${row.sourceTitle}`}
    >
      {/* Row header */}
      <header className="px-4 py-3 border-b border-[var(--color-border-default)] flex items-center gap-3 flex-wrap">
        <span
          className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${SELECTION_STYLE[row.selectionStatus]}`}
        >
          {SELECTION_LABEL[row.selectionStatus]}
        </span>
        {row.hasSkuClash && row.selectionStatus !== 'ingested' && (
          <span
            className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[oklch(0.4_0.14_85)] bg-[oklch(0.94_0.06_85)]"
            title="A product with this SKU already exists on indushydraulics.com — consider attach-mode or skipping this row."
          >
            Existing SKU
          </span>
        )}
        <a
          href={row.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-[var(--color-muted)] hover:text-[var(--color-primary)] truncate flex-1"
        >
          {row.sourceUrl} ↗
        </a>
        {row.ingestedProductId && (
          <Link
            href={`/admin/products/${row.ingestedProductId}/edit`}
            className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-accent)] hover:underline"
          >
            Open product →
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-0">
        {/* LEFT: image carousel */}
        <section className="p-4 border-b lg:border-b-0 lg:border-r border-[var(--color-border-default)]">
          <h3 className="font-mono uppercase tracking-wider text-[10px] text-[var(--color-muted)] mb-2">
            Candidate images ({kept.length} of {row.candidateImages.length} selected)
          </h3>
          {row.candidateImages.length === 0 ? (
            <p className="text-[12px] text-[var(--color-muted)] italic">No images discovered on this page.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                    className={`relative aspect-square border bg-[var(--color-deep)] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
                      isDeselected
                        ? 'border-[var(--color-border-default)] opacity-40'
                        : 'border-[var(--color-accent)]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? ''}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <span className="absolute bottom-1 left-1 font-mono text-[10px] bg-black/60 text-white px-1">
                      #{img.position + 1}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* RIGHT: mapping form */}
        <section className="p-4 flex flex-col gap-3">
          <div>
            <h3 className="font-mono uppercase tracking-wider text-[10px] text-[var(--color-muted)] mb-2">
              Source signals
            </h3>
            <p className="text-[13px] text-[var(--color-primary)] font-medium">{row.sourceTitle}</p>
            <div className="text-[11px] text-[var(--color-muted)] mt-1 flex gap-2 flex-wrap">
              {row.sourceSku && <span>SKU: <span className="font-mono">{row.sourceSku}</span></span>}
              {row.sourceBrandText && <span>Brand: {row.sourceBrandText}</span>}
              {row.sourceCategoryText && <span>Category: {row.sourceCategoryText}</span>}
            </div>
          </div>

          <fieldset className="border border-[var(--color-border-default)] p-3 flex flex-col gap-2">
            <legend className="font-mono uppercase tracking-wider text-[10px] text-[var(--color-muted)] px-1">
              Ingest mode
            </legend>
            <label className="flex items-start gap-2 text-[12px] text-[var(--color-body)]">
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
                <strong>Create a new product</strong> on indushydraulics.com and attach the selected images to it.
              </span>
            </label>
            <label className="flex items-start gap-2 text-[12px] text-[var(--color-body)]">
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
                <strong>Attach to an existing product</strong> — for when you already have the product but no images.
              </span>
            </label>
          </fieldset>

          {mode === 'attach_to_existing' ? (
            <AttachToExistingPicker selected={target} onSelect={onAttachPick} disabled={locked} />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                  Title
                </span>
                <input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder={row.sourceTitle}
                  disabled={locked}
                  className="h-8 px-2 border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[12px]"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)]">
                  SKU
                </span>
                <input
                  value={editedSku}
                  onChange={(e) => setEditedSku(e.target.value)}
                  placeholder={row.sourceSku ?? row.defaultSku}
                  disabled={locked}
                  className="h-8 px-2 border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[12px] font-mono"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] flex items-baseline gap-1.5">
                  Brand
                  {row.suggestedBrand && brandId === row.suggestedBrand.id && row.mappedBrandId === null && (
                    <span className="text-[9px] text-[var(--color-accent)] normal-case">auto-matched</span>
                  )}
                </span>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  disabled={locked}
                  className="h-8 px-2 border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[12px]"
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-muted)] flex items-baseline gap-1.5">
                  Category
                  {row.suggestedCategory && categoryId === row.suggestedCategory.id && row.mappedCategoryId === null && (
                    <span className="text-[9px] text-[var(--color-accent)] normal-case">auto-matched</span>
                  )}
                </span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={locked}
                  className="h-8 px-2 border border-[var(--color-border-default)] bg-[var(--color-surface)] text-[12px]"
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
            <p className="text-[11px] text-[var(--color-muted)]">
              On ingest, we&rsquo;ll create <code className="font-mono">{effectiveSku}</code> — <span>{effectiveTitle}</span>
            </p>
          )}

          {row.ingestError && (
            <p
              role="alert"
              className="text-[11px] text-[oklch(0.5_0.18_25)] bg-[oklch(0.97_0.04_25)] border border-[oklch(0.4_0.18_25)] px-2 py-1.5"
            >
              {row.ingestError}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="text-[11px] text-[oklch(0.5_0.18_25)] bg-[oklch(0.97_0.04_25)] border border-[oklch(0.4_0.18_25)] px-2 py-1.5"
            >
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {!locked && row.selectionStatus !== 'selected' && (
              <button
                type="button"
                onClick={onSelect}
                disabled={pending}
                className="h-8 px-3 border border-[var(--color-accent)] text-[var(--color-accent)] font-mono text-[11px] uppercase tracking-wider hover:bg-[var(--color-accent-soft)] disabled:opacity-50"
              >
                Mark selected
              </button>
            )}
            {!locked && row.selectionStatus !== 'skipped' && (
              <button
                type="button"
                onClick={onSkip}
                disabled={pending}
                className="h-8 px-3 border border-[var(--color-border-default)] text-[var(--color-muted)] font-mono text-[11px] uppercase tracking-wider hover:bg-[var(--color-deep)] disabled:opacity-50"
              >
                Skip
              </button>
            )}
            {!locked && row.selectionStatus !== 'pending' && row.selectionStatus !== 'ingest_failed' && (
              <button
                type="button"
                onClick={onReset}
                disabled={pending}
                className="h-8 px-3 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)] disabled:opacity-50"
              >
                Reset
              </button>
            )}
            {!locked && jobReady && (mode === 'create_new' || (mode === 'attach_to_existing' && target)) && (
              <button
                type="button"
                onClick={onIngest}
                disabled={pending || kept.length === 0}
                className="h-8 px-3 bg-[var(--color-accent)] text-white font-mono text-[11px] uppercase tracking-wider ml-auto disabled:opacity-50"
                title={kept.length === 0 ? 'Toggle at least one image back on' : undefined}
              >
                {pending ? 'Ingesting…' : row.selectionStatus === 'ingest_failed' ? 'Retry ingest' : 'Ingest now'}
              </button>
            )}
          </div>
        </section>
      </div>
    </article>
  )
}
