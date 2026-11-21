'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { controlClassName, controlHeightClassName, DeleteButton } from '@indus/ui'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import SeoEntityDrawer, {
  type SeoDrawerEntity,
} from '../../../../../../components/admin/seo/SeoEntityDrawer'
import type { RecentMedia } from '../../../../../../components/admin/seo/OgImagePicker'

/**
 * The long description is the only tab that needs a rich-text engine, and
 * TipTap plus prosemirror-tables is the single heaviest thing this page could
 * pull in. Loading it on demand keeps it out of the bundle for the eight tabs
 * that never open it. `ssr: false` because ProseMirror wants a real document.
 */
const RichTextEditor = dynamic(
  () => import('../../../../../../components/admin/rich-text/RichTextEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="border-ih-border bg-ih-surface-2 h-[480px] animate-pulse rounded-lg border" />
    ),
  }
)

/** Matches the `max()` on `descriptionLong` in the server action. */
const DESCRIPTION_MAX_LENGTH = 20000
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
import { setProductSpecTemplate, saveProductSpecValues } from '../../../spec-templates/actions'
import BlueprintImagePanel, { type BlueprintSuggestionRow } from './BlueprintImagePanel'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'

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
  compareAtPrice: string | null
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
    'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' | null
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
  /** Rendered at the top of the body — the server page owns the content score. */
  contentPanel?: React.ReactNode
  previewUrl: string | null
  product: Product
  specs: Spec[]
  specTemplate: AttachedTemplate | null
  availableTemplates: TemplateOption[]
  crossRefs: CrossRef[]
  images: Image[]
  blueprintGenerationAvailable: boolean
  blueprintReferenceUrl: string
  blueprintSuggestions: BlueprintSuggestionRow[]
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
  contentPanel,
  previewUrl,
  product,
  specs,
  specTemplate,
  availableTemplates,
  crossRefs,
  images,
  blueprintGenerationAvailable,
  blueprintReferenceUrl,
  blueprintSuggestions,
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
  // The setState-in-effect rule fires here but this is the standard
  // URL-sync pattern.
  useEffect(() => {
    const t = searchParams?.get('tab')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t && TABS.some((x) => x.id === t) && t !== tab) setTab(t as TabId)
    // tab is intentionally excluded — the effect runs on URL changes only;
    // including tab would cause an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function bumpSaved() {
    setSavedAt(new Date().toLocaleTimeString())
  }

  return (
    <AdminPageShell
      title={product.title}
      sub={<span className="tabular-nums">{product.sku}</span>}
      actions={
        <>
          {/*
            All three keep their existing wiring. `savedAt` is bumped by NINE
            sibling tabs through bumpSaved(), so the header has to stay in this
            client component — from the server page it would have no writer.

            The disabled Preview fallback is preserved deliberately: previewUrl
            is null when PREVIEW_TOKEN_SECRET is unset, and rendering nothing
            instead would silently remove the control with no hint as to why.
          */}
          {savedAt && <span className="text-ih-success-ink text-[12px]">Saved at {savedAt}</span>}
          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="border-ih-border text-ih-muted hover:border-ih-accent hover:text-ih-accent inline-flex h-9 items-center rounded-md border px-3 text-[12px] transition-colors"
            >
              Preview ↗
            </a>
          ) : (
            <span
              title="Set PREVIEW_TOKEN_SECRET in admin env to enable preview"
              className="border-ih-border text-ih-muted-2 inline-flex h-9 cursor-not-allowed items-center rounded-md border px-3 text-[12px]"
            >
              Preview ↗
            </span>
          )}
          <DeleteProductButton id={product.id} />
        </>
      }
    >
      {contentPanel}

      {/* Tabs */}
      <div className="border-ih-border mt-5 mb-6 flex gap-0 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'border-ih-accent text-ih-ink'
                : 'text-ih-muted hover:text-ih-ink border-transparent'
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
      {tab === 'images' && (
        <ImagesTab
          productId={product.id}
          productTitle={product.title}
          images={images}
          blueprintGenerationAvailable={blueprintGenerationAvailable}
          blueprintReferenceUrl={blueprintReferenceUrl}
          blueprintSuggestions={blueprintSuggestions}
          onSaved={bumpSaved}
        />
      )}
      {tab === 'documents' && (
        <DocumentsTab productId={product.id} documents={documents} onSaved={bumpSaved} />
      )}
      {tab === 'crossref' && (
        <CrossRefsTab productId={product.id} crossRefs={crossRefs} onSaved={bumpSaved} />
      )}
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
    </AdminPageShell>
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
    <form
      action={onSubmit}
      className="border-ih-border bg-ih-surface flex max-w-3xl flex-col gap-5 rounded-lg border p-6"
    >
      <input type="hidden" name="id" value={product.id} />

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 gap-4">
        <Field label="SKU *" error={fieldErrors.sku?.[0]}>
          <input
            required
            name="sku"
            defaultValue={product.sku}
            className={inputCls + ' tabular-nums'}
          />
        </Field>
        <Field label="MPN">
          <input
            name="mpn"
            defaultValue={product.mpn ?? ''}
            className={inputCls + ' tabular-nums'}
          />
        </Field>
      </div>

      <Field label="Title *" error={fieldErrors.title?.[0]}>
        <input required name="title" defaultValue={product.title} className={inputCls} />
      </Field>

      <Field label="Slug" hint="Auto-generated from title if left blank">
        <input name="slug" defaultValue={product.slug} className={inputCls + ' tabular-nums'} />
      </Field>

      <Field
        label="Short description"
        hint="Used as the bullet-point list under the hero. Each line becomes a key feature."
      >
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

// ── Description tab (the product page's long description) ───────────────────

function DescriptionTab({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState(product.descriptionLong ?? '')

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
    <form
      action={onSubmit}
      className="border-ih-border bg-ih-surface flex max-w-4xl flex-col gap-4 rounded-lg border p-6"
    >
      <input type="hidden" name="id" value={product.id} />

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-col gap-1.5">
        <span className="text-ih-ink-2 text-[12px] font-medium">Long description</span>
        <RichTextEditor
          value={body}
          onChange={setBody}
          maxLength={DESCRIPTION_MAX_LENGTH}
          ariaLabel="Long description"
        />
      </div>

      <SaveButton pending={pending}>Save description</SaveButton>
    </form>
  )
}

// ── Pricing & shipping tab ─────────────────────────────────────────────────

function CommerceTab({ product, onSaved }: { product: Product; onSaved: () => void }) {
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
    <form
      action={onSubmit}
      className="border-ih-border bg-ih-surface flex max-w-3xl flex-col gap-5 rounded-lg border p-6"
    >
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
              className={inputCls + ' tabular-nums'}
            />
          </Field>
          <Field label="Compare-at price">
            <input
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.compareAtPrice ?? ''}
              placeholder="MSRP / strike-through"
              className={inputCls + ' tabular-nums'}
            />
          </Field>
          <Field label="Currency">
            <select
              name="listPriceCurrency"
              defaultValue={product.listPriceCurrency}
              className={selectCls}
            >
              <option value="AED">AED</option>
              <option value="USD">USD</option>
              <option value="SAR">SAR</option>
              <option value="EUR">EUR</option>
            </select>
          </Field>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <Field label="Unit of measure">
            <select name="unitOfMeasure" defaultValue={product.unitOfMeasure} className={selectCls}>
              <option value="each">Each</option>
              <option value="metre">Metre</option>
              <option value="kit">Kit</option>
              <option value="set">Set</option>
            </select>
          </Field>
          <div className="text-ih-muted col-span-2 flex items-end pb-2 text-[11px] leading-snug">
            <p>
              Compare-at price renders as strike-through MSRP on the storefront when set <i>and</i>{' '}
              strictly greater than List price. Leave blank for no strike-through. Leave List price
              blank to show &ldquo;Request quote&rdquo; instead of a number.
            </p>
          </div>
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
              className={inputCls + ' tabular-nums'}
            />
          </Field>
          <Field label="Length (mm)">
            <input
              name="dimensionLengthMm"
              type="number"
              min="0"
              defaultValue={product.dimensionLengthMm ?? ''}
              className={inputCls + ' tabular-nums'}
            />
          </Field>
          <Field label="Width (mm)">
            <input
              name="dimensionWidthMm"
              type="number"
              min="0"
              defaultValue={product.dimensionWidthMm ?? ''}
              className={inputCls + ' tabular-nums'}
            />
          </Field>
          <Field label="Height (mm)">
            <input
              name="dimensionHeightMm"
              type="number"
              min="0"
              defaultValue={product.dimensionHeightMm ?? ''}
              className={inputCls + ' tabular-nums'}
            />
          </Field>
        </div>
      </Section>

      <Section title="Stock">
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Stock quantity"
            hint="0 means out-of-stock — storefront falls back to lead time"
          >
            <input
              name="stockQty"
              type="number"
              min="0"
              defaultValue={product.stockQty ?? 0}
              className={inputCls + ' tabular-nums'}
            />
          </Field>
          <Field
            label="Warehouse label"
            hint="Free-text shown next to the stock pill (e.g. 'Dubai')"
          >
            <input
              name="stockWarehouse"
              defaultValue={product.stockWarehouse ?? ''}
              placeholder="Dubai"
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
              className={inputCls + ' tabular-nums'}
            />
          </Field>
          <Field label="Warranty (months)" hint="Storefront defaults to 24 when blank">
            <input
              name="warrantyMonths"
              type="number"
              min="0"
              defaultValue={product.warrantyMonths ?? ''}
              className={inputCls + ' tabular-nums'}
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
              className={inputCls + ' tabular-nums'}
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
  const freeFormSpecs = specs.filter(
    (s) => !s.templateFieldId || !currentTemplateFieldIds.has(s.templateFieldId)
  )

  return (
    <div className="flex max-w-4xl flex-col gap-8">
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
        'Switching templates: existing values for fields that don\'t exist in the new template move to "Additional specs". Continue?'
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
    <section className="border-ih-border bg-ih-surface flex flex-col gap-3 rounded-lg border p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-ih-ink text-[14px] font-medium">Spec template</h3>
        {currentTemplate && (
          <a
            href={`/admin/spec-templates/${currentTemplate.id}`}
            className="text-ih-muted hover:text-ih-accent text-[11px] tabular-nums"
          >
            Edit template fields →
          </a>
        )}
      </div>
      <p className="text-ih-muted -mt-1 text-[12px]">
        Picks the typed schema this product follows. Each field below comes from the template;
        values are saved into product specs automatically.
      </p>
      <div className="flex items-center gap-2">
        <select
          value={draftId}
          onChange={(e) => setDraftId(e.target.value)}
          className="border-ih-border bg-ih-surface h-9 max-w-[300px] flex-1 rounded-lg border px-2 text-[13px]"
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
          className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-9 px-4 text-[12px] font-medium disabled:opacity-50"
        >
          {pending ? 'Switching…' : 'Apply'}
        </button>
        {error && (
          <span className="text-ih-danger-ink text-[11px] tabular-nums" role="alert">
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
      className="border-ih-border bg-ih-surface flex flex-col rounded-lg border"
    >
      <input type="hidden" name="productId" value={productId} />

      <div className="border-ih-border flex items-center justify-between border-b px-5 py-3">
        <h3 className="text-ih-ink text-[14px] font-medium">{template.name} — fields</h3>
        <span className="text-ih-muted text-[11px] tabular-nums">
          {template.fields.length} field{template.fields.length === 1 ? '' : 's'}
        </span>
      </div>

      {template.fields.length === 0 ? (
        <div className="text-ih-muted px-5 py-6 text-[13px]">
          This template has no fields yet.{' '}
          <a
            href={`/admin/spec-templates/${template.id}`}
            className="text-ih-accent hover:underline"
          >
            Add fields here →
          </a>
        </div>
      ) : (
        Object.entries(grouped).map(([group, fields]) => (
          <div key={group} className="border-ih-border border-b last:border-b-0">
            <div className="bg-ih-bg text-ih-muted px-5 py-2.5 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
              {group}
            </div>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 px-5 py-4">
              {fields.map((f) => (
                <TemplateFieldInput key={f.id} field={f} initialValue={values.get(f.id) ?? ''} />
              ))}
            </div>
          </div>
        ))
      )}

      {template.fields.length > 0 && (
        <div className="bg-ih-bg border-ih-border flex items-center gap-3 border-t px-5 py-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 px-4 text-[12px] font-medium disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save spec values'}
          </button>
          {saved && <span className="text-ih-success-ink text-[11px] tabular-nums">✓ Saved</span>}
          {error && (
            <span className="text-ih-danger-ink text-[11px] tabular-nums" role="alert">
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
    'h-9 w-full px-3 rounded-lg border border-ih-border bg-ih-surface text-[13px] focus:outline-none focus:border-ih-ink'

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
        className={`${baseCls} tabular-nums`}
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
      <span className="text-ih-ink-2 flex items-center gap-1.5 text-[12px] font-medium">
        {field.label}
        {field.unit && (
          <span className="text-ih-muted text-[11px] tabular-nums">({field.unit})</span>
        )}
        {field.isRequired && <span className="text-ih-danger-ink">*</span>}
        {field.isKeyFeature && (
          <span className="text-ih-success-ink bg-ih-success-soft rounded-sm px-1 text-[10.5px] tabular-nums">
            KEY
          </span>
        )}
        {field.isQuickSpec && (
          <span className="text-ih-accent rounded-sm bg-[oklch(0.96_0.05_240)] px-1 text-[10.5px] tabular-nums">
            QUICK
          </span>
        )}
      </span>
      {control}
      {field.helpText && <span className="text-ih-muted-2 text-[11px]">{field.helpText}</span>}
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
        <h3 className="text-ih-ink mb-1 text-[14px] font-medium">
          {templateAttached ? 'Additional specs' : 'Specs'}
        </h3>
        <p className="text-ih-muted text-[12px]">
          {templateAttached
            ? "Free-form rows that aren't in the template above. Useful for one-offs or values orphaned from a previous template switch."
            : 'Add typed spec rows. Toggle "Filter" to show a row in the quick-spec table on the product page.'}
        </p>
      </div>

      {specs.length > 0 &&
        Object.entries(groups).map(([group, items]) => (
          <div
            key={group}
            className="border-ih-border bg-ih-surface overflow-hidden rounded-lg border"
          >
            <div className="border-ih-border bg-ih-bg text-ih-muted border-b px-4 py-2.5 text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
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
        className={`${SPEC_COLS_EDIT} border-ih-border bg-ih-bg items-end border-t px-4 py-2.5`}
      >
        <input type="hidden" name="id" value={spec.id} />
        <input type="hidden" name="productId" value={productId} />
        <input
          name="group"
          defaultValue={spec.group}
          placeholder="Group"
          className="border-ih-border bg-ih-surface h-8 rounded-lg border px-2 text-[12px]"
        />
        <input
          name="label"
          required
          defaultValue={spec.label}
          className="border-ih-border bg-ih-surface h-8 rounded-lg border px-2 text-[12px]"
        />
        <input
          name="value"
          required
          defaultValue={spec.value}
          className="border-ih-border bg-ih-surface h-8 rounded-lg border px-2 text-[12px] tabular-nums"
        />
        <input
          name="unit"
          defaultValue={spec.unit ?? ''}
          className="border-ih-border bg-ih-surface h-8 rounded-lg border px-2 text-[12px] tabular-nums"
        />
        <label className="flex items-center gap-1 text-[11px]">
          <input type="checkbox" name="isFilterable" defaultChecked={spec.isFilterable} />
          Filter
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-8 px-3 text-[11px] font-medium disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-ih-muted hover:text-ih-ink h-8 px-2 text-[11px]"
        >
          Cancel
        </button>
        {error && (
          <p className="text-ih-danger-ink col-span-full text-[11px]" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <div
      className={`${SPEC_COLS_DISPLAY} border-ih-border items-center border-t px-4 py-2.5 text-[14px]`}
    >
      <div className="text-ih-ink-2">{spec.label}</div>
      <div className="text-ih-ink tabular-nums">{spec.value}</div>
      <div className="text-ih-muted text-[11px] tabular-nums">{spec.unit ?? ''}</div>
      <div className="text-ih-muted-2 text-[11px] tabular-nums">
        {spec.isFilterable ? 'filter' : ''}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-ih-muted hover:text-ih-accent text-[11px] tabular-nums"
        >
          Edit
        </button>
        <DeleteButton label="Remove spec" size="sm" onClick={onDelete} disabled={pending} />
      </div>
    </div>
  )
}

function AddSpecForm({ productId, onSaved }: { productId: string; onSaved: () => void }) {
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
      className="border-ih-border bg-ih-surface grid grid-cols-[1fr_1fr_1fr_80px_auto_auto] items-end gap-3 rounded-lg border p-4"
    >
      <input type="hidden" name="productId" value={productId} />
      <Field label="Group">
        <input name="group" placeholder="Hydraulic" className={inputCls} />
      </Field>
      <Field label="Label *">
        <input required name="label" placeholder="Max pressure" className={inputCls} />
      </Field>
      <Field label="Value *">
        <input required name="value" placeholder="350" className={inputCls + ' tabular-nums'} />
      </Field>
      <Field label="Unit">
        <input name="unit" placeholder="bar" className={inputCls + ' tabular-nums'} />
      </Field>
      <label className="text-ih-ink-2 flex h-9 items-center gap-1.5 text-[12px]">
        <input type="checkbox" name="isFilterable" />
        Filter
      </label>
      <button
        type="submit"
        disabled={pending}
        className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-9 px-4 text-[12px] font-medium disabled:opacity-50"
      >
        {pending ? '…' : 'Add row'}
      </button>
      {error && (
        <p className="text-ih-danger-ink col-span-full text-[11px]" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

// ── Images tab ──────────────────────────────────────────────────────────────

function ImagesTab({
  productId,
  productTitle,
  images,
  blueprintGenerationAvailable,
  blueprintReferenceUrl,
  blueprintSuggestions,
  onSaved,
}: {
  productId: string
  productTitle: string
  images: Image[]
  blueprintGenerationAvailable: boolean
  blueprintReferenceUrl: string
  blueprintSuggestions: BlueprintSuggestionRow[]
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
    <div className="flex max-w-4xl flex-col gap-6">
      <BlueprintImagePanel
        productId={productId}
        productTitle={productTitle}
        generationAvailable={blueprintGenerationAvailable}
        referenceImageUrl={blueprintReferenceUrl}
        suggestions={blueprintSuggestions}
      />

      <p className="text-ih-muted text-[12px]">
        Upload images directly to Supabase Storage. Hero image (first in the list) appears
        full-size; the rest become thumbnails. JPEG / PNG / WebP / SVG, up to 10MB each.
      </p>

      {images.length === 0 ? (
        <p className="text-ih-muted text-[13px]">
          No images yet — paste a URL below to add the first one.
        </p>
      ) : (
        <div className="border-ih-border bg-ih-surface rounded-lg border">
          {images.map((img, i) => (
            <div
              key={img.id}
              className={`grid grid-cols-[80px_1fr_120px] items-center gap-4 px-4 py-3 text-[13px] ${
                i > 0 ? 'border-ih-border border-t' : ''
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ''}
                className="bg-ih-bg border-ih-border h-20 w-20 border object-cover"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-ih-muted truncate text-[11px] tabular-nums">{img.url}</span>
                <span className="text-ih-ink-2 text-[12px]">
                  {img.alt ?? <em className="text-ih-muted-2">no alt</em>}
                </span>
                <span className="text-ih-muted-2 text-[11px] tabular-nums">Position {i + 1}</span>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onReorder(img.id, 'up')}
                    disabled={pending || i === 0}
                    className="border-ih-border h-7 w-7 rounded-md border text-[12px] disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorder(img.id, 'down')}
                    disabled={pending || i === images.length - 1}
                    className="border-ih-border h-7 w-7 rounded-md border text-[12px] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
                <DeleteButton
                  label="Remove image"
                  size="sm"
                  onClick={() => onDelete(img.id)}
                  disabled={pending}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload form */}
      <form
        ref={formRef}
        action={onAdd}
        className="border-ih-border bg-ih-surface flex flex-col gap-3 rounded-lg border p-4"
        encType="multipart/form-data"
      >
        <input type="hidden" name="productId" value={productId} />
        <Field label="Image file *" hint="JPEG, PNG, WebP, GIF, or SVG · max 10MB">
          <input
            required
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="file:border-ih-border file:bg-ih-bg file:hover:bg-ih-surface-2 text-[13px] file:mr-3 file:h-9 file:cursor-pointer file:border file:px-3 file:text-[12px] file:font-medium"
          />
        </Field>
        <Field
          label="Alt text"
          hint="Describe the image for accessibility (e.g. '3/4 perspective view of the pump')"
        >
          <input name="alt" className={inputCls} />
        </Field>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-9 px-4 text-[12px] font-medium disabled:opacity-50"
          >
            {pending ? 'Uploading…' : '↑ Upload image'}
          </button>
          {error && <span className="text-ih-danger-ink text-[11px]">{error}</span>}
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
    <div className="flex max-w-4xl flex-col gap-6">
      <p className="text-ih-muted text-[12px]">
        Datasheets, STEP/IGES CAD, service manuals — anything customers download. Files go to the
        private <code>product-documents</code> bucket; gated documents are served via short-lived
        signed URLs. Up to 50MB per file.
      </p>

      {documents.length === 0 ? (
        <p className="text-ih-muted text-[13px]">No documents yet.</p>
      ) : (
        <div className="border-ih-border bg-ih-surface rounded-lg border">
          {documents.map((d, i) => (
            <div
              key={d.id}
              className={`grid grid-cols-[120px_1fr_80px_60px_80px] items-center gap-3 px-4 py-3 text-[13px] ${
                i > 0 ? 'border-ih-border border-t' : ''
              }`}
            >
              <span className="text-ih-muted bg-ih-bg inline-block w-fit px-2 py-1 text-[10.5px] tracking-[0.08em] uppercase tabular-nums">
                {DOC_KIND_LABELS[d.kind] ?? d.kind}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-ih-ink-2 truncate">{d.title}</span>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ih-accent truncate text-[11px] tabular-nums hover:underline"
                >
                  {d.url}
                </a>
              </div>
              <span className="text-ih-muted text-[11px] uppercase tabular-nums">{d.language}</span>
              <span className="text-ih-muted-2 text-[10.5px] tabular-nums">
                {d.isGated ? 'gated' : 'public'}
              </span>
              <DeleteButton
                label="Remove document"
                size="sm"
                className="justify-self-end"
                onClick={() => onDelete(d.id)}
                disabled={pending}
              />
            </div>
          ))}
        </div>
      )}

      <form
        ref={formRef}
        action={onAdd}
        className="border-ih-border bg-ih-surface grid grid-cols-2 gap-3 rounded-lg border p-4"
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
            className="file:border-ih-border file:bg-ih-bg file:hover:bg-ih-surface-2 text-[13px] file:mr-3 file:h-9 file:cursor-pointer file:border file:px-3 file:text-[12px] file:font-medium"
          />
        </Field>
        <Field label="Language">
          <input
            name="language"
            defaultValue="en"
            maxLength={8}
            className={inputCls + ' tabular-nums'}
          />
        </Field>
        <label className="text-ih-ink-2 col-span-2 flex items-center gap-1.5 text-[12px]">
          <input type="checkbox" name="isGated" />
          On request only (not downloadable — visitors are sent to Contact)
        </label>
        <div className="col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-9 px-4 text-[12px] font-medium disabled:opacity-50"
          >
            {pending ? 'Uploading…' : '↑ Upload document'}
          </button>
          {error && <span className="text-ih-danger-ink text-[11px]">{error}</span>}
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
    <div className="flex max-w-4xl flex-col gap-6">
      {crossRefs.length === 0 ? (
        <p className="text-ih-muted text-[13px]">No cross-references yet.</p>
      ) : (
        <div className="border-ih-border bg-ih-surface overflow-hidden rounded-lg border">
          <div
            className={`${XREF_COLS_DISPLAY} border-ih-border bg-ih-bg text-ih-muted-2 border-b px-4 py-2.5 text-[13px] font-medium`}
          >
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
        className={`${XREF_COLS_EDIT} border-ih-border bg-ih-bg items-end border-t px-4 py-2.5`}
      >
        <input type="hidden" name="id" value={cr.id} />
        <input type="hidden" name="productId" value={productId} />
        <input
          name="competitorBrand"
          required
          defaultValue={cr.competitorBrand}
          className="border-ih-border bg-ih-surface h-8 rounded-lg border px-2 text-[12px]"
        />
        <input
          name="competitorMpn"
          required
          defaultValue={cr.competitorMpn}
          className="border-ih-border bg-ih-surface h-8 rounded-lg border px-2 text-[12px] tabular-nums"
        />
        <select
          name="compatibility"
          defaultValue={cr.compatibility}
          className="border-ih-border bg-ih-surface h-8 rounded-lg border px-2 text-[12px]"
        >
          <option value="direct">Direct</option>
          <option value="compatible">Compatible</option>
          <option value="superseded_by_us">Superseded by us</option>
        </select>
        <div className="flex gap-1">
          <button
            type="submit"
            disabled={pending}
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-8 px-3 text-[11px] font-medium disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-ih-muted hover:text-ih-ink h-8 px-2 text-[11px]"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="text-ih-danger-ink col-span-full text-[11px]" role="alert">
            {error}
          </p>
        )}
      </form>
    )
  }

  return (
    <div
      className={`${XREF_COLS_DISPLAY} border-ih-border items-center border-t px-4 py-2.5 text-[14px]`}
    >
      <div className="text-ih-ink-2">{cr.competitorBrand}</div>
      <div className="text-ih-ink tabular-nums">{cr.competitorMpn}</div>
      <div className="text-ih-muted text-[11px] capitalize tabular-nums">
        {cr.compatibility.replace(/_/g, ' ')}
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-ih-muted hover:text-ih-accent text-[11px] tabular-nums"
        >
          Edit
        </button>
        <DeleteButton
          label="Remove cross-reference"
          size="sm"
          onClick={onDelete}
          disabled={pending}
        />
      </div>
    </div>
  )
}

function AddCrossRefForm({ productId, onSaved }: { productId: string; onSaved: () => void }) {
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
      className="border-ih-border bg-ih-surface grid grid-cols-[1fr_1fr_140px_auto] items-end gap-3 rounded-lg border p-4"
    >
      <input type="hidden" name="productId" value={productId} />
      <Field label="Competitor brand *">
        <input required name="competitorBrand" placeholder="Parker" className={inputCls} />
      </Field>
      <Field label="Competitor MPN *">
        <input
          required
          name="competitorMpn"
          placeholder="PV270L1"
          className={inputCls + ' tabular-nums'}
        />
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
        className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-9 px-4 text-[12px] font-medium disabled:opacity-50"
      >
        {pending ? '…' : 'Add'}
      </button>
      {error && (
        <p className="text-ih-danger-ink col-span-full text-[11px]" role="alert">
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
    <div className="flex max-w-4xl flex-col gap-6">
      <p className="text-ih-muted text-[12px]">
        Author frequently-asked questions for this product. They render in order on the
        storefront&apos;s FAQ tab as collapsible Q+A pairs.
      </p>
      {faqs.length === 0 ? (
        <p className="text-ih-muted text-[13px]">No FAQs yet — add the first one below.</p>
      ) : (
        <div className="border-ih-border bg-ih-surface flex flex-col rounded-lg border">
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
        className="border-ih-border bg-ih-bg flex flex-col gap-2 border-t px-4 py-3 first:border-t-0"
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
            className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-8 px-3 text-[11px] font-medium disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-ih-muted hover:text-ih-ink h-8 px-2 text-[11px]"
          >
            Cancel
          </button>
          {error && (
            <span className="text-ih-danger-ink text-[11px]" role="alert">
              {error}
            </span>
          )}
        </div>
      </form>
    )
  }

  return (
    <div className="border-ih-border flex items-start gap-3 border-t px-4 py-3 first:border-t-0">
      <div className="flex flex-col gap-0.5 pt-0.5">
        <button
          type="button"
          onClick={() => onReorder('up')}
          disabled={isFirst || pending}
          className="text-ih-muted hover:text-ih-ink text-[12px] tabular-nums disabled:cursor-not-allowed disabled:opacity-30"
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onReorder('down')}
          disabled={isLast || pending}
          className="text-ih-muted hover:text-ih-ink text-[12px] tabular-nums disabled:cursor-not-allowed disabled:opacity-30"
          title="Move down"
        >
          ↓
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="text-ih-ink text-[13px] font-medium">{faq.question}</div>
        <div className="text-ih-ink-2 text-[12px] leading-[1.5] whitespace-pre-wrap">
          {faq.answer}
        </div>
      </div>
      <div className="flex shrink-0 gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-ih-muted hover:text-ih-accent text-[11px] tabular-nums"
        >
          Edit
        </button>
        <DeleteButton label="Remove FAQ" size="sm" onClick={onDelete} disabled={pending} />
      </div>
    </div>
  )
}

function AddFaqForm({ productId, onSaved }: { productId: string; onSaved: () => void }) {
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
      className="border-ih-border bg-ih-surface flex flex-col gap-3 rounded-lg border p-4"
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
          className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-9 self-start px-4 text-[12px] font-medium disabled:opacity-50"
        >
          {pending ? 'Adding…' : '+ Add FAQ'}
        </button>
        {error && (
          <span className="text-ih-danger-ink text-[11px]" role="alert">
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

/*
  Sub-table column templates, named.

  These were inline strings repeated per row, and the display and edit
  templates for one table sat ~50 lines apart with no way to compare them:
  the spec table's display row declares five columns at gap-3 and its edit row
  seven at gap-2, so the layout shifts the instant you click Edit. The counts
  differ for a real reason — editing splits a combined cell into separate
  inputs — but the GAP difference was drift, and neither was visible before.

  Naming them is the interim fix. Moving these tables to DataTable is the
  correct one and belongs with whatever change next opens this file.
*/
const SPEC_COLS_DISPLAY = 'grid grid-cols-[1fr_1fr_80px_60px_120px] gap-3'
const SPEC_COLS_EDIT = 'grid grid-cols-[1fr_1fr_1fr_80px_60px_auto_auto] gap-3'
const XREF_COLS_DISPLAY = 'grid grid-cols-[1fr_1fr_140px_120px] gap-3'
const XREF_COLS_EDIT = 'grid grid-cols-[1fr_1fr_140px_140px] gap-3'

// ── Shared primitives ───────────────────────────────────────────────────────

/*
  One definition, in packages/ui. These used to be three private copies of a
  36px box with `focus:` instead of `focus-visible:` and no radius — so a click
  on a filled field drew a ring, and no control in the admin matched the design
  language. They dress ~258 raw controls between them, which is why they are
  re-pointed rather than each call site being rewritten.
*/
const inputCls = `${controlClassName} ${controlHeightClassName}`
const textareaCls = `${controlClassName} resize-y py-2`
const selectCls = `${controlClassName} ${controlHeightClassName}`

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
      <span className="text-ih-ink-2 text-[12px] font-medium">{label}</span>
      {children}
      {error ? (
        <span className="text-ih-danger-ink text-[11px]" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="text-ih-muted-2 text-[11px]">{hint}</span>
      )}
    </label>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-ih-muted text-[10.5px] tracking-[0.12em] uppercase tabular-nums">
        {title}
      </span>
      {children}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="bg-ih-danger-soft text-ih-danger-ink rounded-lg border border-[oklch(0.4_0.18_25)] px-4 py-3 text-[13px]"
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
        className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-10 px-5 text-[13px] font-medium disabled:opacity-50"
      >
        {pending ? 'Saving…' : children}
      </button>
    </div>
  )
}

function DeleteProductButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <>
      <DeleteButton
        label="Delete product"
        showLabel
        className="border-ih-border hover:border-ih-danger-line h-9 border"
        pending={pending}
        onClick={() => {
          if (!confirm('Permanently delete this product? This cannot be undone.')) return
          setError(null)
          startTransition(async () => {
            const res = await deleteProduct(id)
            if (res && !res.success) setError(res.message)
          })
        }}
      />
      {error && <span className="text-ih-danger-ink text-[11px]">{error}</span>}
    </>
  )
}
