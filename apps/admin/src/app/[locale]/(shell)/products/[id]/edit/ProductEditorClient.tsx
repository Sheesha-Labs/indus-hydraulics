'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  updateProductCore,
  updateProductSeo,
  addProductSpec,
  deleteProductSpec,
  addProductCrossReference,
  deleteProductCrossReference,
  deleteProduct,
} from '../../actions'

type Product = {
  id: string
  sku: string
  mpn: string | null
  slug: string
  title: string
  descriptionShort: string | null
  descriptionLong: string | null
  status: string
  brandId: string | null
  categoryId: string | null
  seoTitle: string | null
  seoDescription: string | null
  updatedAt: string
}

type Spec = {
  id: string
  group: string
  label: string
  value: string
  unit: string | null
  isFilterable: boolean
}

type CrossRef = {
  id: string
  competitorBrand: string
  competitorMpn: string
  compatibility: string
}

type Option = { id: string; name: string }

interface Props {
  locale: string
  product: Product
  specs: Spec[]
  crossRefs: CrossRef[]
  brands: Option[]
  categories: Option[]
}

const TABS = [
  { id: 'core', label: 'Core' },
  { id: 'specs', label: 'Specifications' },
  { id: 'crossref', label: 'Cross-references' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function ProductEditorClient({
  locale,
  product,
  specs,
  crossRefs,
  brands,
  categories,
}: Props) {
  const [tab, setTab] = useState<TabId>('core')
  const [pending, startTransition] = useTransition()
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [coreError, setCoreError] = useState<string | null>(null)
  const [coreFieldErrors, setCoreFieldErrors] = useState<Record<string, string[]>>({})
  const [seoError, setSeoError] = useState<string | null>(null)

  function handleCoreSave(formData: FormData) {
    setCoreError(null)
    setCoreFieldErrors({})
    startTransition(async () => {
      const res = await updateProductCore(formData)
      if (!res.success) {
        setCoreError(res.message)
        setCoreFieldErrors(res.fieldErrors ?? {})
        return
      }
      setSavedAt(new Date().toLocaleTimeString())
    })
  }

  function handleSeoSave(formData: FormData) {
    setSeoError(null)
    startTransition(async () => {
      const res = await updateProductSeo(formData)
      if (!res.success) {
        setSeoError(res.message)
        return
      }
      setSavedAt(new Date().toLocaleTimeString())
    })
  }

  return (
    <div className="px-8 py-6 pb-16">
      <div className="flex items-end justify-between mb-1 gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">{product.title}</h1>
          <p className="font-mono text-[12px] text-[var(--color-muted)] mt-1">{product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          {savedAt && (
            <span className="text-[12px] text-[var(--color-good,oklch(0.55_0.12_150))]">
              Saved at {savedAt}
            </span>
          )}
          <DeleteButton id={product.id} locale={locale} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--color-border)] mt-5 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-primary)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'core' && (
        <form
          action={handleCoreSave}
          className="flex flex-col gap-5 bg-white border border-[var(--color-border)] p-6 max-w-3xl"
        >
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="locale" value={locale} />

          {coreError && (
            <div className="px-4 py-3 border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] text-[13px] text-[oklch(0.5_0.18_25)]" role="alert">
              {coreError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="SKU *" error={coreFieldErrors.sku?.[0]}>
              <input
                required
                name="sku"
                defaultValue={product.sku}
                className="h-9 w-full px-3 border border-[var(--color-border)] bg-white font-mono text-[13px]"
              />
            </Field>
            <Field label="MPN">
              <input
                name="mpn"
                defaultValue={product.mpn ?? ''}
                className="h-9 w-full px-3 border border-[var(--color-border)] bg-white font-mono text-[13px]"
              />
            </Field>
          </div>

          <Field label="Title *" error={coreFieldErrors.title?.[0]}>
            <input
              required
              name="title"
              defaultValue={product.title}
              className="h-9 w-full px-3 border border-[var(--color-border)] bg-white text-[13px]"
            />
          </Field>

          <Field label="Slug" hint="Auto-generated from title if left blank">
            <input
              name="slug"
              defaultValue={product.slug}
              className="h-9 w-full px-3 border border-[var(--color-border)] bg-white font-mono text-[13px]"
            />
          </Field>

          <Field label="Short description">
            <textarea
              name="descriptionShort"
              defaultValue={product.descriptionShort ?? ''}
              rows={2}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] resize-y"
            />
          </Field>

          <Field label="Long description" hint="Markdown supported">
            <textarea
              name="descriptionLong"
              defaultValue={product.descriptionLong ?? ''}
              rows={6}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] font-mono resize-y"
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Brand">
              <select
                name="brandId"
                defaultValue={product.brandId ?? ''}
                className="h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px]"
              >
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select
                name="categoryId"
                defaultValue={product.categoryId ?? ''}
                className="h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px]"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                name="status"
                defaultValue={product.status}
                className="h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px]"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </Field>
          </div>

          {/* SEO fields are saved via the SEO tab's own action — no hidden
              passthrough here. This avoids overwriting unsaved core edits. */}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save changes'}
            </button>
            <Link
              href={`/${locale}/products`}
              className="h-10 px-5 flex items-center text-[13px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              Back to list
            </Link>
          </div>
        </form>
      )}

      {tab === 'specs' && (
        <SpecsTab productId={product.id} locale={locale} specs={specs} />
      )}

      {tab === 'crossref' && (
        <CrossRefsTab productId={product.id} locale={locale} crossRefs={crossRefs} />
      )}

      {tab === 'seo' && (
        <form
          action={handleSeoSave}
          className="flex flex-col gap-5 bg-white border border-[var(--color-border)] p-6 max-w-3xl"
        >
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="locale" value={locale} />

          {seoError && (
            <div className="px-4 py-3 border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] text-[13px] text-[oklch(0.5_0.18_25)]" role="alert">
              {seoError}
            </div>
          )}

          <Field label="SEO title" hint="Overrides default page title in search results">
            <input
              name="seoTitle"
              defaultValue={product.seoTitle ?? ''}
              className="h-9 w-full px-3 border border-[var(--color-border)] bg-white text-[13px]"
            />
          </Field>

          <Field label="SEO description" hint="155 characters recommended">
            <textarea
              name="seoDescription"
              defaultValue={product.seoDescription ?? ''}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] resize-y"
            />
          </Field>

          <button
            type="submit"
            disabled={pending}
            className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50 self-start"
          >
            {pending ? 'Saving…' : 'Save SEO'}
          </button>
        </form>
      )}
    </div>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-[var(--color-body)]">{label}</span>
      {children}
      {error ? (
        <span className="text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">{error}</span>
      ) : (
        hint && <span className="text-[11px] text-[var(--color-caption)]">{hint}</span>
      )}
    </label>
  )
}

function SpecsTab({
  productId,
  locale,
  specs,
}: {
  productId: string
  locale: string
  specs: Spec[]
}) {
  const groups: Record<string, Spec[]> = {}
  for (const s of specs) {
    if (!groups[s.group]) groups[s.group] = []
    groups[s.group]!.push(s)
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {specs.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted)]">No specs yet — add the first one below.</p>
      ) : (
        Object.entries(groups).map(([group, items]) => (
          <div key={group} className="bg-white border border-[var(--color-border)]">
            <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
              {group}
            </div>
            {items.map((s, i) => (
              <div
                key={s.id}
                className={`grid grid-cols-[1fr_1fr_80px_60px_60px] gap-3 px-4 py-2.5 items-center text-[13px] ${
                  i > 0 ? 'border-t border-[var(--color-border)]' : ''
                }`}
              >
                <div className="text-[var(--color-body)]">{s.label}</div>
                <div className="font-mono text-[var(--color-primary)]">{s.value}</div>
                <div className="font-mono text-[11px] text-[var(--color-muted)]">{s.unit ?? ''}</div>
                <div className="font-mono text-[10px] text-[var(--color-caption)]">
                  {s.isFilterable ? 'filter' : ''}
                </div>
                <DeleteSpecButton specId={s.id} productId={productId} locale={locale} />
              </div>
            ))}
          </div>
        ))
      )}

      <AddSpecForm productId={productId} locale={locale} />
    </div>
  )
}

function AddSpecForm({ productId, locale }: { productId: string; locale: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addProductSpec(formData)
      if (!res.success) setError(res.message)
    })
  }

  return (
    <form
      action={onSubmit}
      className="bg-white border border-[var(--color-border)] p-4 grid grid-cols-[1fr_1fr_1fr_80px_auto_auto] gap-3 items-end"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="locale" value={locale} />
      <Field label="Group">
        <input
          name="group"
          placeholder="Hydraulic"
          className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
        />
      </Field>
      <Field label="Label *">
        <input
          required
          name="label"
          placeholder="Max pressure"
          className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
        />
      </Field>
      <Field label="Value *">
        <input
          required
          name="value"
          placeholder="350"
          className="h-9 px-3 border border-[var(--color-border)] bg-white font-mono text-[13px]"
        />
      </Field>
      <Field label="Unit">
        <input
          name="unit"
          placeholder="bar"
          className="h-9 px-3 border border-[var(--color-border)] bg-white font-mono text-[13px]"
        />
      </Field>
      <label className="flex items-center gap-1.5 h-9 text-[12px] text-[var(--color-body)]">
        <input type="checkbox" name="isFilterable" />
        Filter
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? '…' : 'Add'}
      </button>
      {error && (
        <p className="col-span-full text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function DeleteSpecButton({
  specId,
  productId,
  locale,
}: {
  specId: string
  productId: string
  locale: string
}) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteProductSpec(specId, productId, locale)
        })
      }}
      className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-danger,oklch(0.5_0.18_25))] disabled:opacity-50"
    >
      {pending ? '...' : 'Remove'}
    </button>
  )
}

function CrossRefsTab({
  productId,
  locale,
  crossRefs,
}: {
  productId: string
  locale: string
  crossRefs: CrossRef[]
}) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {crossRefs.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted)]">No cross-references yet.</p>
      ) : (
        <div className="bg-white border border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_1fr_140px_60px] gap-3 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <div>Competitor brand</div>
            <div>MPN</div>
            <div>Compatibility</div>
            <div></div>
          </div>
          {crossRefs.map((c, i) => (
            <div
              key={c.id}
              className={`grid grid-cols-[1fr_1fr_140px_60px] gap-3 px-4 py-2.5 items-center text-[13px] ${
                i > 0 ? 'border-t border-[var(--color-border)]' : ''
              }`}
            >
              <div className="text-[var(--color-body)]">{c.competitorBrand}</div>
              <div className="font-mono text-[var(--color-primary)]">{c.competitorMpn}</div>
              <div className="font-mono text-[11px] text-[var(--color-muted)] capitalize">
                {c.compatibility.replace(/_/g, ' ')}
              </div>
              <DeleteCrossRefButton crId={c.id} productId={productId} locale={locale} />
            </div>
          ))}
        </div>
      )}

      <AddCrossRefForm productId={productId} locale={locale} />
    </div>
  )
}

function AddCrossRefForm({ productId, locale }: { productId: string; locale: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addProductCrossReference(formData)
      if (!res.success) setError(res.message)
    })
  }

  return (
    <form
      action={onSubmit}
      className="bg-white border border-[var(--color-border)] p-4 grid grid-cols-[1fr_1fr_140px_auto] gap-3 items-end"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="locale" value={locale} />
      <Field label="Competitor brand *">
        <input
          required
          name="competitorBrand"
          placeholder="Parker"
          className="h-9 px-3 border border-[var(--color-border)] bg-white text-[13px]"
        />
      </Field>
      <Field label="Competitor MPN *">
        <input
          required
          name="competitorMpn"
          placeholder="PV270L1"
          className="h-9 px-3 border border-[var(--color-border)] bg-white font-mono text-[13px]"
        />
      </Field>
      <Field label="Compatibility">
        <select
          name="compatibility"
          defaultValue="direct"
          className="h-9 px-2 border border-[var(--color-border)] bg-white text-[13px]"
        >
          <option value="direct">Direct</option>
          <option value="compatible">Compatible</option>
          <option value="superseded_by_us">Superseded by us</option>
        </select>
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? '…' : 'Add'}
      </button>
      {error && (
        <p className="col-span-full text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

function DeleteCrossRefButton({
  crId,
  productId,
  locale,
}: {
  crId: string
  productId: string
  locale: string
}) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteProductCrossReference(crId, productId, locale)
        })
      }}
      className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-danger,oklch(0.5_0.18_25))] disabled:opacity-50"
    >
      {pending ? '...' : 'Remove'}
    </button>
  )
}

function DeleteButton({ id, locale }: { id: string; locale: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm('Permanently delete this product? This cannot be undone.')) return
          setError(null)
          startTransition(async () => {
            const res = await deleteProduct(id, locale)
            // deleteProduct redirects on success — we only see Result on failure.
            if (res && !res.success) setError(res.message)
          })
        }}
        className="h-9 px-3 border border-[var(--color-border)] text-[12px] text-[var(--color-muted)] hover:border-[var(--color-danger,oklch(0.5_0.18_25))] hover:text-[var(--color-danger,oklch(0.5_0.18_25))] disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {error && <span className="text-[10px] text-[oklch(0.5_0.18_25)]">{error}</span>}
    </>
  )
}
