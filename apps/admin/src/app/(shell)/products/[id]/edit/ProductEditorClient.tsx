'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SeoEntityDrawer, { type SeoDrawerEntity } from '../../../../../components/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../components/seo/OgImagePicker'
import {
  updateProductCore,
  updateProductCommerce,
  updateProductDescription,
  updateProductSeo,
  uploadProductOgImage,
  addProductSpec,
  updateProductSpec,
  deleteProductSpec,
  addProductCrossReference,
  updateProductCrossReference,
  deleteProductCrossReference,
  uploadProductImage,
  deleteProductImage,
  reorderProductImage,
  uploadProductDocument,
  deleteProductDocument,
  addProductFaq,
  updateProductFaq,
  deleteProductFaq,
  reorderProductFaq,
  deleteProduct,
} from '../../actions'
import {
  setProductSpecTemplate,
  saveProductSpecValues,
} from '../../../spec-templates/actions'

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
  listPrice: string | null
  listPriceCurrency: string
  unitOfMeasure: string
  weightKg: string | null
  dimensionLengthMm: number | null
  dimensionWidthMm: number | null
  dimensionHeightMm: number | null
  leadTimeDays: number | null
  warrantyMonths: number | null
  stockQty: number
  stockWarehouse: string | null
  countryOfOrigin: string | null
  hsCode: string | null
  seoTitle: string | null
  seoDescription: string | null
  // SEO OS — full set of overrides edited from the SEO drawer.
  canonicalUrl: string | null
  focusKeyword: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  ogImageMediaId: string | null
  ogImageStoragePath: string | null
  sitemapPriority: number | null
  sitemapChangeFreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
    | null
  excludeFromSitemap: boolean
  jsonLdOverride: string | null
  publicUrl: string
  brandName: string | null
  categoryName: string | null
  categorySlug: string | null
  imageUrls: string[]
  updatedAt: string
}

type Spec = {
  id: string
  group: string
  label: string
  value: string
  unit: string | null
  isFilterable: boolean
  templateFieldId: string | null
}

type TemplateField = {
  id: string
  key: string
  label: string
  unit: string | null
  dataType: 'text' | 'number' | 'boolean' | 'select'
  options: string[] | null
  helpText: string | null
  isRequired: boolean
  isKeyFeature: boolean
  isQuickSpec: boolean
  group: string | null
  position: number
}

type AttachedTemplate = {
  id: string
  name: string
  slug: string
  fields: TemplateField[]
}

type TemplateOption = { id: string; name: string; slug: string }

type CrossRef = {
  id: string
  competitorBrand: string
  competitorMpn: string
  compatibility: string
}

type Image = { id: string; url: string; alt: string | null }
type Document = {
  id: string
  kind: string
  title: string
  language: string
  isGated: boolean
  url: string
}
type Faq = {
  id: string
  question: string
  answer: string
  position: number
}

type Option = { id: string; name: string }

interface Props {
  previewUrl: string | null
  product: Product
  specs: Spec[]
  specTemplate: AttachedTemplate | null
  availableTemplates: TemplateOption[]
  crossRefs: CrossRef[]
  images: Image[]
  documents: Document[]
  faqs: Faq[]
  brands: Option[]
  categories: Option[]
  /** Recent images for the SEO drawer's OG picker. */
  recentImages: RecentMedia[]
}

const TABS = [
  { id: 'core', label: 'Core' },
  { id: 'description', label: 'Description' },
  { id: 'commerce', label: 'Pricing & Shipping' },
  { id: 'specs', label: 'Specifications' },
  { id: 'images', label: 'Images' },
  { id: 'documents', label: 'Documents' },
  { id: 'crossref', label: 'Compatibility' },
  { id: 'faq', label: 'FAQ' },
  { id: 'seo', label: 'SEO' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function ProductEditorClient({
  previewUrl,
  product,
  specs,
  specTemplate,
  availableTemplates,
  crossRefs,
  images,
  documents,
  faqs,
  brands,
  categories,
  recentImages,
}: Props) {
  const searchParams = useSearchParams()
  const initialTab = (() => {
    const t = searchParams?.get('tab')
    return TABS.some((x) => x.id === t) ? (t as TabId) : 'core'
  })()
  const [tab, setTab] = useState<TabId>(initialTab)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // Keep the local tab in sync if the URL changes via Inspector deep-link.
  useEffect(() => {
    const t = searchParams?.get('tab')
    if (t && TABS.some((x) => x.id === t) && t !== tab) setTab(t as TabId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function bumpSaved() {
    setSavedAt(new Date().toLocaleTimeString())
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
            <span className="text-[12px] text-[oklch(0.55_0.12_150)]">Saved at {savedAt}</span>
          )}
          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 inline-flex items-center border border-[var(--color-border)] text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
            >
              Preview ↗
            </a>
          ) : (
            <span
              title="Set PREVIEW_TOKEN_SECRET in admin env to enable preview"
              className="h-9 px-3 inline-flex items-center border border-[var(--color-border)] text-[12px] text-[var(--color-caption)] cursor-not-allowed"
            >
              Preview ↗
            </span>
          )}
          <DeleteButton id={product.id} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[var(--color-border)] mt-5 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
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
        <CoreTab product={product} brands={brands} categories={categories} onSaved={bumpSaved} />
      )}
      {tab === 'description' && <DescriptionTab product={product} onSaved={bumpSaved} />}
      {tab === 'commerce' && <CommerceTab product={product} onSaved={bumpSaved} />}
      {tab === 'specs' && (
        <SpecsTab
          productId={product.id}
         
          specs={specs}
          specTemplate={specTemplate}
          availableTemplates={availableTemplates}
          onSaved={bumpSaved}
        />
      )}
      {tab === 'images' && <ImagesTab productId={product.id} images={images} onSaved={bumpSaved} />}
      {tab === 'documents' && <DocumentsTab productId={product.id} documents={documents} onSaved={bumpSaved} />}
      {tab === 'crossref' && <CrossRefsTab productId={product.id} crossRefs={crossRefs} onSaved={bumpSaved} />}
      {tab === 'faq' && <FaqsTab productId={product.id} faqs={faqs} onSaved={bumpSaved} />}
      {tab === 'seo' && (
        <SeoEntityDrawer
          entityType="product"
          entity={toSeoEntity(product)}
          extra={{
            kind: 'product',
            sku: product.sku,
            mpn: product.mpn,
            brandName: product.brandName,
            categoryName: product.categoryName,
            imageUrls: product.imageUrls,
          }}
          recentImages={recentImages}
          saveAction={updateProductSeo}
          uploadAction={uploadProductOgImage}
          onSaved={bumpSaved}
        />
      )}
    </div>
  )
}

// ── Core tab ─────────────────────────────────────────────────────────────────

function CoreTab({
  product,
  brands,
  categories,
  onSaved,
}: {
  product: Product
  brands: Option[]
  categories: Option[]
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function onSubmit(formData: FormData) {
    setError(null)
    setFieldErrors({})
    startTransition(async () => {
      const r = await updateProductCore(formData)
      if (!r.success) {
        setError(r.message)
        setFieldErrors(r.fieldErrors ?? {})
        return
      }
      onSaved()
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5 bg-white border border-[var(--color-border)] p-6 max-w-3xl">
      <input type="hidden" name="id" value={product.id} />

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 gap-4">
        <Field label="SKU *" error={fieldErrors.sku?.[0]}>
          <input required name="sku" defaultValue={product.sku} className={inputCls + ' font-mono'} />
        </Field>
        <Field label="MPN">
          <input name="mpn" defaultValue={product.mpn ?? ''} className={inputCls + ' font-mono'} />
        </Field>
      </div>

      <Field label="Title *" error={fieldErrors.title?.[0]}>
        <input required name="title" defaultValue={product.title} className={inputCls} />
      </Field>

      <Field label="Slug" hint="Auto-generated from title if left blank">
        <input name="slug" defaultValue={product.slug} className={inputCls + ' font-mono'} />
      </Field>

      <Field label="Short description" hint="Used as the bullet-point list under the hero. Each line becomes a key feature.">
        <textarea
          name="descriptionShort"
          defaultValue={product.descriptionShort ?? ''}
          rows={4}
          className={textareaCls}
        />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Brand">
          <select name="brandId" defaultValue={product.brandId ?? ''} className={selectCls}>
            <option value="">— None —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={product.categoryId ?? ''} className={selectCls}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={product.status} className={selectCls}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </Field>
      </div>

      <SaveButton pending={pending}>Save core fields</SaveButton>
    </form>
  )
}

// ── Description tab (long description with markdown helpers) ────────────────

function DescriptionTab({
  product,
  onSaved,
}: {
  product: Product
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState(product.descriptionLong ?? '')
  const ref = useRef<HTMLTextAreaElement>(null)

  function wrap(prefix: string, suffix = '') {
    const ta = ref.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = body.slice(0, start)
    const selected = body.slice(start, end) || ''
    const after = body.slice(end)
    const next = `${before}${prefix}${selected}${suffix}${after}`
    setBody(next)
    setTimeout(() => {
      ta.focus()
      const cursor = before.length + prefix.length + selected.length + suffix.length
      ta.setSelectionRange(cursor, cursor)
    }, 0)
  }

  function insertImage() {
    const url = prompt('Image URL (https://...)')?.trim()
    if (!url) return
    const alt = prompt('Alt text (optional)')?.trim() ?? ''
    const md = `\n\n![${alt}](${url})\n\n`
    const ta = ref.current
    const cursor = ta?.selectionStart ?? body.length
    setBody(body.slice(0, cursor) + md + body.slice(cursor))
  }

  function onSubmit(formData: FormData) {
    setError(null)
    formData.set('descriptionLong', body)
    startTransition(async () => {
      const r = await updateProductDescription(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      onSaved()
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4 bg-white border border-[var(--color-border)] p-6 max-w-4xl">
      <input type="hidden" name="id" value={product.id} />

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[var(--color-body)]">Long description</span>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 px-2 py-1.5 border border-[var(--color-border)] border-b-0 bg-[var(--color-surface)]">
          <ToolbarBtn onClick={() => wrap('## ', '')}>H2</ToolbarBtn>
          <ToolbarBtn onClick={() => wrap('### ', '')}>H3</ToolbarBtn>
          <Sep />
          <ToolbarBtn onClick={() => wrap('**', '**')}>
            <b>B</b>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => wrap('*', '*')}>
            <i>I</i>
          </ToolbarBtn>
          <ToolbarBtn onClick={() => wrap('`', '`')}>
            <span className="font-mono">{`<>`}</span>
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn onClick={() => wrap('- ', '')}>• List</ToolbarBtn>
          <ToolbarBtn onClick={() => wrap('1. ', '')}>1. List</ToolbarBtn>
          <Sep />
          <ToolbarBtn onClick={() => wrap('[', '](https://)')}>Link</ToolbarBtn>
          <ToolbarBtn onClick={insertImage}>🖼 Image</ToolbarBtn>
        </div>

        <textarea
          ref={ref}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={20}
          className="w-full px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] font-mono leading-relaxed resize-y"
        />
        <span className="text-[11px] text-[var(--color-caption)]">
          Markdown supported · {body.length.toLocaleString()} / 20,000 chars · Use <code>![alt](url)</code> to embed images.
        </span>
      </div>

      <SaveButton pending={pending}>Save description</SaveButton>
    </form>
  )
}

// ── Pricing & shipping tab ─────────────────────────────────────────────────

function CommerceTab({
  product,
  onSaved,
}: {
  product: Product
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await updateProductCommerce(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      onSaved()
    })
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-5 bg-white border border-[var(--color-border)] p-6 max-w-3xl">
      <input type="hidden" name="id" value={product.id} />

      {error && <ErrorBanner message={error} />}

      <Section title="Pricing">
        <div className="grid grid-cols-3 gap-4">
          <Field label="List price">
            <input
              name="listPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.listPrice ?? ''}
              placeholder="0.00"
              className={inputCls + ' font-mono'}
            />
          </Field>
          <Field label="Currency">
            <select name="listPriceCurrency" defaultValue={product.listPriceCurrency} className={selectCls}>
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
            </select>
          </Field>
          <Field label="Unit of measure">
            <select name="unitOfMeasure" defaultValue={product.unitOfMeasure} className={selectCls}>
              <option value="each">Each</option>
              <option value="metre">Metre</option>
              <option value="kit">Kit</option>
              <option value="set">Set</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Shipping & dimensions">
        <div className="grid grid-cols-4 gap-4">
          <Field label="Weight (kg)">
            <input
              name="weightKg"
              type="number"
              step="0.001"
              min="0"
              defaultValue={product.weightKg ?? ''}
              className={inputCls + ' font-mono'}
            />
          </Field>
          <Field label="Length (mm)">
            <input
              name="dimensionLengthMm"
              type="number"
              min="0"
              defaultValue={product.dimensionLengthMm ?? ''}
              className={inputCls + ' font-mono'}
            />
          </Field>
          <Field label="Width (mm)">
            <input
              name="dimensionWidthMm"
              type="number"
              min="0"
              defaultValue={product.dimensionWidthMm ?? ''}
              className={inputCls + ' font-mono'}
            />
          </Field>
          <Field label="Height (mm)">
            <input
              name="dimensionHeightMm"
              type="number"
              min="0"
              defaultValue={product.dimensionHeightMm ?? ''}
              className={inputCls + ' font-mono'}
            />
          </Field>
        </div>
      </Section>

      <Section title="Stock">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Stock quantity" hint="0 means out-of-stock — storefront falls back to lead time">
            <input
              name="stockQty"
              type="number"
              min="0"
              defaultValue={product.stockQty ?? 0}
              className={inputCls + ' font-mono'}
            />
          </Field>
          <Field label="Warehouse label" hint="Free-text shown next to the stock pill (e.g. 'Mumbai')">
            <input
              name="stockWarehouse"
              defaultValue={product.stockWarehouse ?? ''}
              placeholder="Mumbai"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      <Section title="Lead time & origin">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Lead time (days)" hint="Storefront falls back to 'Contact us' when blank">
            <input
              name="leadTimeDays"
              type="number"
              min="0"
              defaultValue={product.leadTimeDays ?? ''}
              className={inputCls + ' font-mono'}
            />
          </Field>
          <Field label="Warranty (months)" hint="Storefront defaults to 24 when blank">
            <input
              name="warrantyMonths"
              type="number"
              min="0"
              defaultValue={product.warrantyMonths ?? ''}
              className={inputCls + ' font-mono'}
            />
          </Field>
          <Field label="Country of origin">
            <input
              name="countryOfOrigin"
              defaultValue={product.countryOfOrigin ?? ''}
              placeholder="Germany"
              className={inputCls}
            />
          </Field>
          <Field label="HS code" hint="For customs declarations">
            <input
              name="hsCode"
              defaultValue={product.hsCode ?? ''}
              placeholder="84132000"
              className={inputCls + ' font-mono'}
            />
          </Field>
        </div>
      </Section>

      <SaveButton pending={pending}>Save pricing &amp; shipping</SaveButton>
    </form>
  )
}

// ── Specs tab — template-driven typed form + free-form additional specs ───

function SpecsTab({
  productId,
  specs,
  specTemplate,
  availableTemplates,
  onSaved,
}: {
  productId: string
  specs: Spec[]
  specTemplate: AttachedTemplate | null
  availableTemplates: TemplateOption[]
  onSaved: () => void
}) {
  const templateValueByFieldId = new Map<string, string>()
  for (const s of specs) {
    if (s.templateFieldId) templateValueByFieldId.set(s.templateFieldId, s.value)
  }

  // Free-form specs are anything not linked to the current template's fields.
  // (Specs whose templateFieldId is null OR points at an old template's field
  // that no longer exists — both surface here so values aren't lost on switch.)
  const currentTemplateFieldIds = new Set(specTemplate?.fields.map((f) => f.id) ?? [])
  const freeFormSpecs = specs.filter((s) => !s.templateFieldId || !currentTemplateFieldIds.has(s.templateFieldId))

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <TemplateSelector
        productId={productId}
       
        availableTemplates={availableTemplates}
        currentTemplate={specTemplate}
        onSaved={onSaved}
      />

      {specTemplate && (
        <TemplateSpecForm
          productId={productId}
         
          template={specTemplate}
          values={templateValueByFieldId}
          onSaved={onSaved}
        />
      )}

      <FreeFormSpecsSection
        productId={productId}
       
        specs={freeFormSpecs}
        templateAttached={specTemplate !== null}
        onSaved={onSaved}
      />
    </div>
  )
}

// ── Template selector ──────────────────────────────────────────────────────

function TemplateSelector({
  productId,
  availableTemplates,
  currentTemplate,
  onSaved,
}: {
  productId: string
  availableTemplates: TemplateOption[]
  currentTemplate: AttachedTemplate | null
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string>(currentTemplate?.id ?? '')

  function handleApply() {
    if (draftId === (currentTemplate?.id ?? '')) return
    if (
      currentTemplate &&
      !confirm(
        'Switching templates: existing values for fields that don\'t exist in the new template move to "Additional specs". Continue?',
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await setProductSpecTemplate(productId, draftId || null)
      if (!res.success) {
        setError(res.message)
        return
      }
      onSaved()
    })
  }

  return (
    <section className="bg-white border border-[var(--color-border)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[var(--color-primary)]">Spec template</h3>
        {currentTemplate && (
          <a
            href={`/spec-templates/${currentTemplate.id}`}
            className="font-mono text-[11px] text-[var(--color-muted)] hover:text-[var(--color-accent)]"
          >
            Edit template fields →
          </a>
        )}
      </div>
      <p className="text-[12px] text-[var(--color-muted)] -mt-1">
        Picks the typed schema this product follows. Each field below comes from the template; values
        are saved into product specs automatically.
      </p>
      <div className="flex items-center gap-2">
        <select
          value={draftId}
          onChange={(e) => setDraftId(e.target.value)}
          className="h-9 px-2 border border-[var(--color-border)] bg-white text-[13px] flex-1 max-w-[300px]"
        >
          <option value="">— None (free-form specs only) —</option>
          {availableTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleApply}
          disabled={pending || draftId === (currentTemplate?.id ?? '')}
          className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Switching…' : 'Apply'}
        </button>
        {error && (
          <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </span>
        )}
      </div>
    </section>
  )
}

// ── Typed form for the attached template's fields ─────────────────────────

function TemplateSpecForm({
  productId,
  template,
  values,
  onSaved,
}: {
  productId: string
  template: AttachedTemplate
  values: Map<string, string>
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await saveProductSpecValues(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    })
  }

  // Group fields by `group` for the visual layout (mirrors the storefront tech-specs tab).
  const grouped: Record<string, TemplateField[]> = {}
  for (const f of template.fields) {
    const g = f.group ?? 'General'
    if (!grouped[g]) grouped[g] = []
    grouped[g]!.push(f)
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="bg-white border border-[var(--color-border)] flex flex-col"
    >
      <input type="hidden" name="productId" value={productId} />

      <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="text-[14px] font-semibold text-[var(--color-primary)]">
          {template.name} — fields
        </h3>
        <span className="font-mono text-[11px] text-[var(--color-muted)]">
          {template.fields.length} field{template.fields.length === 1 ? '' : 's'}
        </span>
      </div>

      {template.fields.length === 0 ? (
        <div className="px-5 py-6 text-[13px] text-[var(--color-muted)]">
          This template has no fields yet.{' '}
          <a
            href={`/spec-templates/${template.id}`}
            className="text-[var(--color-accent)] hover:underline"
          >
            Add fields here →
          </a>
        </div>
      ) : (
        Object.entries(grouped).map(([group, fields]) => (
          <div key={group} className="border-b border-[var(--color-border)] last:border-b-0">
            <div className="px-5 py-2.5 bg-[var(--color-surface)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
              {group}
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-x-5 gap-y-4">
              {fields.map((f) => (
                <TemplateFieldInput key={f.id} field={f} initialValue={values.get(f.id) ?? ''} />
              ))}
            </div>
          </div>
        ))
      )}

      {template.fields.length > 0 && (
        <div className="px-5 py-3 bg-[var(--color-surface)] flex items-center gap-3 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 bg-[var(--color-accent)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save spec values'}
          </button>
          {saved && <span className="font-mono text-[11px] text-[oklch(0.4_0.14_145)]">✓ Saved</span>}
          {error && (
            <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
              {error}
            </span>
          )}
        </div>
      )}
    </form>
  )
}

function TemplateFieldInput({
  field,
  initialValue,
}: {
  field: TemplateField
  initialValue: string
}) {
  const inputName = `field:${field.id}`
  const baseCls =
    'h-9 w-full px-3 border border-[var(--color-border)] bg-white text-[13px] focus:outline-none focus:border-[var(--color-primary)]'

  let control: React.ReactNode
  if (field.dataType === 'select') {
    control = (
      <select name={inputName} defaultValue={initialValue} className={baseCls}>
        <option value="">—</option>
        {(field.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    )
  } else if (field.dataType === 'boolean') {
    // Use a native select for tri-state (empty / yes / no) so we can
    // distinguish "not set" from "false".
    control = (
      <select name={inputName} defaultValue={initialValue} className={baseCls}>
        <option value="">—</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
    )
  } else if (field.dataType === 'number') {
    control = (
      <input
        type="number"
        step="any"
        name={inputName}
        defaultValue={initialValue}
        required={field.isRequired}
        className={`${baseCls} font-mono`}
      />
    )
  } else {
    control = (
      <input
        type="text"
        name={inputName}
        defaultValue={initialValue}
        required={field.isRequired}
        className={baseCls}
      />
    )
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-[var(--color-body)] flex items-center gap-1.5">
        {field.label}
        {field.unit && (
          <span className="font-mono text-[11px] text-[var(--color-muted)]">({field.unit})</span>
        )}
        {field.isRequired && <span className="text-[oklch(0.5_0.18_25)]">*</span>}
        {field.isKeyFeature && (
          <span className="px-1 font-mono text-[9px] text-[oklch(0.4_0.14_145)] bg-[oklch(0.94_0.06_145)] rounded-sm">
            KEY
          </span>
        )}
        {field.isQuickSpec && (
          <span className="px-1 font-mono text-[9px] text-[var(--color-accent)] bg-[oklch(0.96_0.05_240)] rounded-sm">
            QUICK
          </span>
        )}
      </span>
      {control}
      {field.helpText && <span className="text-[11px] text-[var(--color-caption)]">{field.helpText}</span>}
    </label>
  )
}

// ── Free-form specs section ───────────────────────────────────────────────

function FreeFormSpecsSection({
  productId,
  specs,
  templateAttached,
  onSaved,
}: {
  productId: string
  specs: Spec[]
  templateAttached: boolean
  onSaved: () => void
}) {
  const groups: Record<string, Spec[]> = {}
  for (const s of specs) {
    if (!groups[s.group]) groups[s.group] = []
    groups[s.group]!.push(s)
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-[14px] font-semibold text-[var(--color-primary)] mb-1">
          {templateAttached ? 'Additional specs' : 'Specs'}
        </h3>
        <p className="text-[12px] text-[var(--color-muted)]">
          {templateAttached
            ? 'Free-form rows that aren\'t in the template above. Useful for one-offs or values orphaned from a previous template switch.'
            : 'Add typed spec rows. Toggle "Filter" to show a row in the quick-spec table on the product page.'}
        </p>
      </div>

      {specs.length > 0 &&
        Object.entries(groups).map(([group, items]) => (
          <div key={group} className="bg-white border border-[var(--color-border)]">
            <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
              {group}
            </div>
            {items.map((s) => (
              <SpecRow key={s.id} spec={s} productId={productId} onSaved={onSaved} />
            ))}
          </div>
        ))}

      <AddSpecForm productId={productId} onSaved={onSaved} />
    </section>
  )
}

function SpecRow({
  spec,
  productId,
  onSaved,
}: {
  spec: Spec
  productId: string
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onUpdate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await updateProductSpec(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      setEditing(false)
      onSaved()
    })
  }

  function onDelete() {
    if (!confirm('Delete this spec?')) return
    startTransition(async () => {
      await deleteProductSpec(spec.id, productId)
      onSaved()
    })
  }

  if (editing) {
    return (
      <form
        action={onUpdate}
        className="grid grid-cols-[1fr_1fr_1fr_80px_60px_auto_auto] gap-2 px-4 py-2.5 items-end border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <input type="hidden" name="id" value={spec.id} />
        <input type="hidden" name="productId" value={productId} />
        <input
          name="group"
          defaultValue={spec.group}
          placeholder="Group"
          className="h-8 px-2 border border-[var(--color-border)] bg-white text-[12px]"
        />
        <input
          name="label"
          required
          defaultValue={spec.label}
          className="h-8 px-2 border border-[var(--color-border)] bg-white text-[12px]"
        />
        <input
          name="value"
          required
          defaultValue={spec.value}
          className="h-8 px-2 border border-[var(--color-border)] bg-white font-mono text-[12px]"
        />
        <input
          name="unit"
          defaultValue={spec.unit ?? ''}
          className="h-8 px-2 border border-[var(--color-border)] bg-white font-mono text-[12px]"
        />
        <label className="flex items-center gap-1 text-[11px]">
          <input type="checkbox" name="isFilterable" defaultChecked={spec.isFilterable} />
          Filter
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-8 px-3 bg-[var(--color-accent)] text-white text-[11px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="h-8 px-2 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
        >
          Cancel
        </button>
        {error && (
          <p className="col-span-full text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_80px_60px_120px] gap-3 px-4 py-2.5 items-center text-[13px] border-t border-[var(--color-border)]">
      <div className="text-[var(--color-body)]">{spec.label}</div>
      <div className="font-mono text-[var(--color-primary)]">{spec.value}</div>
      <div className="font-mono text-[11px] text-[var(--color-muted)]">{spec.unit ?? ''}</div>
      <div className="font-mono text-[10px] text-[var(--color-caption)]">{spec.isFilterable ? 'filter' : ''}</div>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function AddSpecForm({
  productId,
  onSaved,
}: {
  productId: string
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await addProductSpec(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      formRef.current?.reset()
      onSaved()
    })
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="bg-white border border-[var(--color-border)] p-4 grid grid-cols-[1fr_1fr_1fr_80px_auto_auto] gap-3 items-end"
    >
      <input type="hidden" name="productId" value={productId} />
      <Field label="Group">
        <input name="group" placeholder="Hydraulic" className={inputCls} />
      </Field>
      <Field label="Label *">
        <input required name="label" placeholder="Max pressure" className={inputCls} />
      </Field>
      <Field label="Value *">
        <input required name="value" placeholder="350" className={inputCls + ' font-mono'} />
      </Field>
      <Field label="Unit">
        <input name="unit" placeholder="bar" className={inputCls + ' font-mono'} />
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
        {pending ? '…' : 'Add row'}
      </button>
      {error && (
        <p className="col-span-full text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

// ── Images tab ──────────────────────────────────────────────────────────────

function ImagesTab({
  productId,
  images,
  onSaved,
}: {
  productId: string
  images: Image[]
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function onAdd(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await uploadProductImage(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      formRef.current?.reset()
      onSaved()
    })
  }

  function onDelete(id: string) {
    if (!confirm('Remove this image?')) return
    startTransition(async () => {
      await deleteProductImage(id, productId)
      onSaved()
    })
  }

  function onReorder(id: string, dir: 'up' | 'down') {
    startTransition(async () => {
      await reorderProductImage(id, dir, productId)
      onSaved()
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <p className="text-[12px] text-[var(--color-muted)]">
        Upload images directly to Supabase Storage. Hero image (first in the list) appears full-size; the rest become thumbnails. JPEG / PNG / WebP / SVG, up to 10MB each.
      </p>

      {images.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted)]">No images yet — paste a URL below to add the first one.</p>
      ) : (
        <div className="bg-white border border-[var(--color-border)]">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`grid grid-cols-[80px_1fr_120px] gap-4 px-4 py-3 items-center text-[13px] ${
                i > 0 ? 'border-t border-[var(--color-border)]' : ''
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ''}
                className="w-20 h-20 object-cover bg-[var(--color-surface)] border border-[var(--color-border)]"
              />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-mono text-[11px] text-[var(--color-muted)] truncate">{img.url}</span>
                <span className="text-[12px] text-[var(--color-body)]">{img.alt ?? <em className="text-[var(--color-caption)]">no alt</em>}</span>
                <span className="font-mono text-[10px] text-[var(--color-caption)]">Position {i + 1}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onReorder(img.id, 'up')}
                    disabled={pending || i === 0}
                    className="h-7 w-7 border border-[var(--color-border)] text-[12px] disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorder(img.id, 'down')}
                    disabled={pending || i === images.length - 1}
                    className="h-7 w-7 border border-[var(--color-border)] text-[12px] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(img.id)}
                  disabled={pending}
                  className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      <form
        ref={formRef}
        action={onAdd}
        className="bg-white border border-[var(--color-border)] p-4 flex flex-col gap-3"
        encType="multipart/form-data"
      >
        <input type="hidden" name="productId" value={productId} />
        <Field label="Image file *" hint="JPEG, PNG, WebP, GIF, or SVG · max 10MB">
          <input
            required
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="text-[13px] file:mr-3 file:h-9 file:px-3 file:border file:border-[var(--color-border)] file:bg-[var(--color-surface)] file:text-[12px] file:font-medium file:cursor-pointer file:hover:bg-[var(--color-deep)]"
          />
        </Field>
        <Field label="Alt text" hint="Describe the image for accessibility (e.g. '3/4 perspective view of the pump')">
          <input name="alt" className={inputCls} />
        </Field>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Uploading…' : '↑ Upload image'}
          </button>
          {error && <span className="text-[11px] text-[oklch(0.5_0.18_25)]">{error}</span>}
        </div>
      </form>
    </div>
  )
}

// ── Documents tab ───────────────────────────────────────────────────────────

const DOC_KIND_LABELS: Record<string, string> = {
  datasheet: 'Datasheet',
  step: 'STEP file',
  iges: 'IGES file',
  service_manual: 'Service manual',
  installation_guide: 'Installation guide',
}

function DocumentsTab({
  productId,
  documents,
  onSaved,
}: {
  productId: string
  documents: Document[]
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [kind, setKind] = useState<string>('datasheet')
  const formRef = useRef<HTMLFormElement>(null)

  const datasheetAccept = 'application/pdf,image/png,image/jpeg'
  const isDatasheet = kind === 'datasheet'
  const hasExistingDatasheet = documents.some((d) => d.kind === 'datasheet')

  function onAdd(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await uploadProductDocument(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      formRef.current?.reset()
      setKind('datasheet')
      onSaved()
    })
  }

  function onDelete(id: string) {
    if (!confirm('Remove this document?')) return
    startTransition(async () => {
      await deleteProductDocument(id, productId)
      onSaved()
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <p className="text-[12px] text-[var(--color-muted)]">
        Datasheets, STEP/IGES CAD, service manuals — anything customers download. Files go to the private <code>product-documents</code> bucket; gated documents are served via short-lived signed URLs. Up to 50MB per file.
      </p>

      {documents.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted)]">No documents yet.</p>
      ) : (
        <div className="bg-white border border-[var(--color-border)]">
          {documents.map((d, i) => (
            <div
              key={d.id}
              className={`grid grid-cols-[120px_1fr_80px_60px_80px] gap-3 px-4 py-3 items-center text-[13px] ${
                i > 0 ? 'border-t border-[var(--color-border)]' : ''
              }`}
            >
              <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-[var(--color-muted)] bg-[var(--color-surface)] px-2 py-1 inline-block w-fit">
                {DOC_KIND_LABELS[d.kind] ?? d.kind}
              </span>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[var(--color-body)] truncate">{d.title}</span>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-[var(--color-accent)] truncate hover:underline"
                >
                  {d.url}
                </a>
              </div>
              <span className="font-mono text-[11px] text-[var(--color-muted)] uppercase">{d.language}</span>
              <span className="font-mono text-[10px] text-[var(--color-caption)]">{d.isGated ? 'gated' : 'public'}</span>
              <button
                type="button"
                onClick={() => onDelete(d.id)}
                disabled={pending}
                className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-50 text-right"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        ref={formRef}
        action={onAdd}
        className="bg-white border border-[var(--color-border)] p-4 grid grid-cols-2 gap-3"
        encType="multipart/form-data"
      >
        <input type="hidden" name="productId" value={productId} />
        <Field label="Kind">
          <select
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className={selectCls}
          >
            <option value="datasheet">Datasheet</option>
            <option value="step">STEP file</option>
            <option value="iges">IGES file</option>
            <option value="service_manual">Service manual</option>
            <option value="installation_guide">Installation guide</option>
          </select>
        </Field>
        <Field label="Title *">
          <input required name="title" placeholder="A10VSO 71 Datasheet" className={inputCls} />
        </Field>
        <Field
          label="File *"
          hint={
            isDatasheet
              ? hasExistingDatasheet
                ? 'PDF / PNG / JPG / JPEG — max 50MB. Uploading will replace the existing datasheet.'
                : 'PDF / PNG / JPG / JPEG — max 50MB. One datasheet per product.'
              : 'STEP / IGES / PDF — max 50MB'
          }
        >
          <input
            required
            name="file"
            type="file"
            accept={isDatasheet ? datasheetAccept : undefined}
            className="text-[13px] file:mr-3 file:h-9 file:px-3 file:border file:border-[var(--color-border)] file:bg-[var(--color-surface)] file:text-[12px] file:font-medium file:cursor-pointer file:hover:bg-[var(--color-deep)]"
          />
        </Field>
        <Field label="Language">
          <input name="language" defaultValue="en" maxLength={8} className={inputCls + ' font-mono'} />
        </Field>
        <label className="col-span-2 flex items-center gap-1.5 text-[12px] text-[var(--color-body)]">
          <input type="checkbox" name="isGated" />
          Gate behind sign-in (only registered users can download)
        </label>
        <div className="col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Uploading…' : '↑ Upload document'}
          </button>
          {error && <span className="text-[11px] text-[oklch(0.5_0.18_25)]">{error}</span>}
        </div>
      </form>
    </div>
  )
}

// ── Cross-references / Compatibility tab ───────────────────────────────────

function CrossRefsTab({
  productId,
  crossRefs,
  onSaved,
}: {
  productId: string
  crossRefs: CrossRef[]
  onSaved: () => void
}) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {crossRefs.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted)]">No cross-references yet.</p>
      ) : (
        <div className="bg-white border border-[var(--color-border)]">
          <div className="grid grid-cols-[1fr_1fr_140px_120px] gap-3 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            <div>Competitor brand</div>
            <div>MPN</div>
            <div>Compatibility</div>
            <div></div>
          </div>
          {crossRefs.map((c) => (
            <CrossRefRow key={c.id} cr={c} productId={productId} onSaved={onSaved} />
          ))}
        </div>
      )}
      <AddCrossRefForm productId={productId} onSaved={onSaved} />
    </div>
  )
}

function CrossRefRow({
  cr,
  productId,
  onSaved,
}: {
  cr: CrossRef
  productId: string
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onUpdate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await updateProductCrossReference(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      setEditing(false)
      onSaved()
    })
  }

  function onDelete() {
    if (!confirm('Delete this cross-reference?')) return
    startTransition(async () => {
      await deleteProductCrossReference(cr.id, productId)
      onSaved()
    })
  }

  if (editing) {
    return (
      <form
        action={onUpdate}
        className="grid grid-cols-[1fr_1fr_140px_140px] gap-2 px-4 py-2.5 items-end border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <input type="hidden" name="id" value={cr.id} />
        <input type="hidden" name="productId" value={productId} />
        <input
          name="competitorBrand"
          required
          defaultValue={cr.competitorBrand}
          className="h-8 px-2 border border-[var(--color-border)] bg-white text-[12px]"
        />
        <input
          name="competitorMpn"
          required
          defaultValue={cr.competitorMpn}
          className="h-8 px-2 border border-[var(--color-border)] bg-white font-mono text-[12px]"
        />
        <select
          name="compatibility"
          defaultValue={cr.compatibility}
          className="h-8 px-2 border border-[var(--color-border)] bg-white text-[12px]"
        >
          <option value="direct">Direct</option>
          <option value="compatible">Compatible</option>
          <option value="superseded_by_us">Superseded by us</option>
        </select>
        <div className="flex gap-1">
          <button
            type="submit"
            disabled={pending}
            className="h-8 px-3 bg-[var(--color-accent)] text-white text-[11px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="h-8 px-2 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="col-span-full text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_140px_120px] gap-3 px-4 py-2.5 items-center text-[13px] border-t border-[var(--color-border)]">
      <div className="text-[var(--color-body)]">{cr.competitorBrand}</div>
      <div className="font-mono text-[var(--color-primary)]">{cr.competitorMpn}</div>
      <div className="font-mono text-[11px] text-[var(--color-muted)] capitalize">
        {cr.compatibility.replace(/_/g, ' ')}
      </div>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function AddCrossRefForm({
  productId,
  onSaved,
}: {
  productId: string
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await addProductCrossReference(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      formRef.current?.reset()
      onSaved()
    })
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="bg-white border border-[var(--color-border)] p-4 grid grid-cols-[1fr_1fr_140px_auto] gap-3 items-end"
    >
      <input type="hidden" name="productId" value={productId} />
      <Field label="Competitor brand *">
        <input required name="competitorBrand" placeholder="Parker" className={inputCls} />
      </Field>
      <Field label="Competitor MPN *">
        <input required name="competitorMpn" placeholder="PV270L1" className={inputCls + ' font-mono'} />
      </Field>
      <Field label="Compatibility">
        <select name="compatibility" defaultValue="direct" className={selectCls}>
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

// ── FAQ tab ──────────────────────────────────────────────────────────────────

function FaqsTab({
  productId,
  faqs,
  onSaved,
}: {
  productId: string
  faqs: Faq[]
  onSaved: () => void
}) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <p className="text-[12px] text-[var(--color-muted)]">
        Author frequently-asked questions for this product. They render in order on the storefront's FAQ tab as collapsible Q+A pairs.
      </p>
      {faqs.length === 0 ? (
        <p className="text-[13px] text-[var(--color-muted)]">No FAQs yet — add the first one below.</p>
      ) : (
        <div className="bg-white border border-[var(--color-border)] flex flex-col">
          {faqs.map((f, i) => (
            <FaqRow
              key={f.id}
              faq={f}
              productId={productId}
             
              isFirst={i === 0}
              isLast={i === faqs.length - 1}
              onSaved={onSaved}
            />
          ))}
        </div>
      )}
      <AddFaqForm productId={productId} onSaved={onSaved} />
    </div>
  )
}

function FaqRow({
  faq,
  productId,
  isFirst,
  isLast,
  onSaved,
}: {
  faq: Faq
  productId: string
  isFirst: boolean
  isLast: boolean
  onSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onUpdate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await updateProductFaq(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      setEditing(false)
      onSaved()
    })
  }

  function onDelete() {
    if (!confirm('Delete this FAQ?')) return
    startTransition(async () => {
      await deleteProductFaq(faq.id, productId)
      onSaved()
    })
  }

  function onReorder(direction: 'up' | 'down') {
    startTransition(async () => {
      await reorderProductFaq(faq.id, direction, productId)
      onSaved()
    })
  }

  if (editing) {
    return (
      <form
        action={onUpdate}
        className="px-4 py-3 flex flex-col gap-2 border-t border-[var(--color-border)] first:border-t-0 bg-[var(--color-surface)]"
      >
        <input type="hidden" name="id" value={faq.id} />
        <input type="hidden" name="productId" value={productId} />
        <Field label="Question *">
          <input required name="question" defaultValue={faq.question} className={inputCls} />
        </Field>
        <Field label="Answer *">
          <textarea
            required
            name="answer"
            defaultValue={faq.answer}
            rows={4}
            className={textareaCls}
          />
        </Field>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="h-8 px-3 bg-[var(--color-accent)] text-white text-[11px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="h-8 px-2 text-[11px] text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            Cancel
          </button>
          {error && (
            <span className="text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
              {error}
            </span>
          )}
        </div>
      </form>
    )
  }

  return (
    <div className="px-4 py-3 flex gap-3 items-start border-t border-[var(--color-border)] first:border-t-0">
      <div className="flex flex-col gap-0.5 pt-0.5">
        <button
          type="button"
          onClick={() => onReorder('up')}
          disabled={isFirst || pending}
          className="font-mono text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onReorder('down')}
          disabled={isLast || pending}
          className="font-mono text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          ↓
        </button>
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="text-[13px] font-medium text-[var(--color-primary)]">{faq.question}</div>
        <div className="text-[12px] text-[var(--color-body)] whitespace-pre-wrap leading-[1.5]">
          {faq.answer}
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="font-mono text-[10px] text-[var(--color-muted)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

function AddFaqForm({
  productId,
  onSaved,
}: {
  productId: string
  onSaved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const r = await addProductFaq(formData)
      if (!r.success) {
        setError(r.message)
        return
      }
      formRef.current?.reset()
      onSaved()
    })
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="bg-white border border-[var(--color-border)] p-4 flex flex-col gap-3"
    >
      <input type="hidden" name="productId" value={productId} />
      <Field label="Question *">
        <input
          required
          name="question"
          placeholder="What hose end fittings are compatible?"
          className={inputCls}
        />
      </Field>
      <Field label="Answer *">
        <textarea
          required
          name="answer"
          rows={4}
          placeholder="Compatible with all standard SAE J516 fittings — JIC 37°, ORFS, BSP, Metric DIN."
          className={textareaCls}
        />
      </Field>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-[var(--color-primary)] text-white text-[12px] font-medium hover:opacity-90 disabled:opacity-50 self-start"
        >
          {pending ? 'Adding…' : '+ Add FAQ'}
        </button>
        {error && (
          <span className="text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}

// ── SEO tab → reusable drawer ──────────────────────────────────────────────

/**
 * Project the editor's `Product` shape onto the entity shape the
 * `SeoEntityDrawer` consumes. Pulls out only SEO + identity fields; the
 * drawer doesn't need pricing/spec data.
 */
function toSeoEntity(product: Product): SeoDrawerEntity {
  return {
    id: product.id,
    displayName: product.title,
    slug: product.slug,
    publicUrl: product.publicUrl,
    parentBreadcrumb:
      product.categoryName && product.categorySlug
        ? {
            name: product.categoryName,
            url: rootOf(product.publicUrl) + '/c/' + product.categorySlug,
          }
        : null,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    canonicalUrl: product.canonicalUrl,
    focusKeyword: product.focusKeyword,
    robotsIndex: product.robotsIndex,
    robotsFollow: product.robotsFollow,
    ogImageMediaId: product.ogImageMediaId,
    ogImageStoragePath: product.ogImageStoragePath,
    sitemapPriority: product.sitemapPriority,
    sitemapChangeFreq: product.sitemapChangeFreq,
    excludeFromSitemap: product.excludeFromSitemap,
    jsonLdOverride: product.jsonLdOverride,
  }
}

function rootOf(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.host}`
  } catch {
    return ''
  }
}

// ── Shared primitives ───────────────────────────────────────────────────────

const inputCls =
  'h-9 w-full px-3 border border-[var(--color-border)] bg-white text-[13px] focus:outline-none focus:border-[var(--color-accent)]'
const textareaCls =
  'w-full px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] resize-y focus:outline-none focus:border-[var(--color-accent)]'
const selectCls =
  'h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px] focus:outline-none focus:border-[var(--color-accent)]'

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
        <span className="text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="text-[11px] text-[var(--color-caption)]">{hint}</span>
      )}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)]">{title}</span>
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="px-4 py-3 border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] text-[13px] text-[oklch(0.5_0.18_25)]"
      role="alert"
    >
      {message}
    </div>
  )
}

function SaveButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={pending}
        className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Saving…' : children}
      </button>
    </div>
  )
}

function ToolbarBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-7 px-2 text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] border border-transparent hover:border-[var(--color-border)] transition-colors"
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="w-px bg-[var(--color-border)] mx-1 h-5" />
}

function DeleteButton({ id }: { id: string }) {
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
            const res = await deleteProduct(id)
            if (res && !res.success) setError(res.message)
          })
        }}
        className="h-9 px-3 border border-[var(--color-border)] text-[12px] text-[var(--color-muted)] hover:border-[oklch(0.5_0.18_25)] hover:text-[oklch(0.5_0.18_25)] disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {error && <span className="text-[10px] text-[oklch(0.5_0.18_25)]">{error}</span>}
    </>
  )
}
