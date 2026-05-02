'use client'

import { useMemo, useState, useTransition } from 'react'
import {
  buildArticleLd,
  buildBreadcrumbLd,
  buildCollectionLd,
  buildOrgLd,
  buildProductLd,
  TITLE_RANGE,
  DESCRIPTION_RANGE,
  type SeoEntityType,
  type ChangeFreq,
} from '@indus/domain'
import {
  CharCounter,
  JsonLdPreview,
  OgPreview,
  SerpPreview,
  SeoHealthBadge,
} from '@indus/ui'
import type { Result } from '../../lib/result'
import OgImagePicker, { type RecentMedia } from './OgImagePicker'
import FocusKeywordChecklist from './FocusKeywordChecklist'
import AiSuggestButton from './AiSuggestButton'

/**
 * Reusable SEO drawer mounted as a tab inside an entity's edit page.
 * Carries every override that lives on the entity row + sets up live
 * SERP / OG / JSON-LD previews bound to current form state.
 *
 * The drawer is intentionally entity-agnostic. Wiring per-entity:
 *   - `entityType` chooses which JSON-LD builder runs in the Schema preview.
 *   - `saveAction` and `uploadAction` are server actions the parent passes in.
 *   - `extra` provides the entity-specific bits the previews need (image
 *     URL list, breadcrumb labels, etc.).
 */

export type SeoDrawerEntity = {
  id: string
  /** Visible page title (Product.title, Category.name, …). */
  displayName: string
  /** URL slug. */
  slug: string
  /** Public storefront URL (full https://… form, used by previews). */
  publicUrl: string
  /** Optional category context for breadcrumbs (Product → Category). */
  parentBreadcrumb?: { name: string; url: string } | null

  // SEO fields
  seoTitle: string | null
  seoDescription: string | null
  canonicalUrl: string | null
  focusKeyword: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  ogImageMediaId: string | null
  /** Storage path of the currently-attached OG image (for preview). */
  ogImageStoragePath: string | null
  sitemapPriority: number | null
  sitemapChangeFreq: ChangeFreq | null
  excludeFromSitemap: boolean
  /** Stringified JSON, or null. */
  jsonLdOverride: string | null
}

export type SeoDrawerExtra =
  | {
      kind: 'product'
      sku: string
      mpn: string | null
      brandName: string | null
      categoryName: string | null
      imageUrls: string[]
    }
  | {
      kind: 'category'
      shortDescription: string | null
    }
  | {
      kind: 'brand'
      /** Logo URL (resolved via mediaUrl) for Organization JSON-LD. */
      logoUrl: string | null
    }
  | {
      kind: 'industry'
      description: string | null
    }
  | {
      kind: 'blog_post'
      /** Hero image URL (resolved via mediaUrl) for Article JSON-LD. */
      heroImageUrl: string | null
      authorName: string | null
      /** ISO timestamp string. */
      publishedAt: string | null
    }
  | {
      kind: 'cms_page'
      // CmsPages don't emit JSON-LD on the storefront today, so no extras.
    }

interface Props {
  entityType: SeoEntityType
  entity: SeoDrawerEntity
  extra: SeoDrawerExtra
  recentImages: RecentMedia[]
  /** Server action that saves the SEO fields. */
  saveAction: (formData: FormData) => Promise<Result<void>>
  /** Server action that uploads a new OG image candidate. */
  uploadAction: (
    formData: FormData,
  ) => Promise<Result<{ mediaId: string; storagePath: string; alt: string | null; originalFilename: string }>>
  onSaved?: () => void
}

const SUB_TABS = [
  { id: 'general', label: 'General' },
  { id: 'social', label: 'Social' },
  { id: 'schema', label: 'Schema' },
  { id: 'sitemap', label: 'Sitemap' },
  { id: 'advanced', label: 'Advanced' },
] as const

export default function SeoEntityDrawer({
  entityType,
  entity,
  extra,
  recentImages,
  saveAction,
  uploadAction,
  onSaved,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<typeof SUB_TABS[number]['id']>('general')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  // Form state — controlled so previews can update live.
  const [seoTitle, setSeoTitle] = useState(entity.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(entity.seoDescription ?? '')
  const [canonicalUrl, setCanonicalUrl] = useState(entity.canonicalUrl ?? '')
  const [focusKeyword, setFocusKeyword] = useState(entity.focusKeyword ?? '')
  const [robotsIndex, setRobotsIndex] = useState(entity.robotsIndex)
  const [robotsFollow, setRobotsFollow] = useState(entity.robotsFollow)
  const [ogImageMediaId, setOgImageMediaId] = useState<string | null>(entity.ogImageMediaId)
  const [ogImagePath, setOgImagePath] = useState<string | null>(entity.ogImageStoragePath)
  const [sitemapPriority, setSitemapPriority] = useState<number | null>(entity.sitemapPriority)
  const [sitemapChangeFreq, setSitemapChangeFreq] = useState<ChangeFreq | ''>(
    entity.sitemapChangeFreq ?? '',
  )
  const [excludeFromSitemap, setExcludeFromSitemap] = useState(entity.excludeFromSitemap)
  const [jsonLdOverride, setJsonLdOverride] = useState(entity.jsonLdOverride ?? '')

  // Effective values used by previews / scoring (fall back to displayName).
  const effectiveTitle = (seoTitle.trim() || entity.displayName).trim()
  const effectiveDescription = seoDescription.trim()
  const effectiveCanonical = canonicalUrl.trim() || entity.publicUrl

  // Live JSON-LD preview.
  const ldPreview = useMemo(() => {
    let parsedOverride: unknown = undefined
    if (jsonLdOverride.trim()) {
      try {
        parsedOverride = JSON.parse(jsonLdOverride)
      } catch {
        // Invalid JSON — render the unmerged base.
      }
    }
    if (entityType === 'product' && extra.kind === 'product') {
      return [
        buildProductLd({
          name: entity.displayName,
          description: effectiveDescription || null,
          sku: extra.sku,
          mpn: extra.mpn,
          url: effectiveCanonical,
          imageUrls: extra.imageUrls,
          brand: extra.brandName ? { name: extra.brandName } : null,
          category: extra.categoryName ? { name: extra.categoryName } : null,
          override: parsedOverride,
        }),
        buildBreadcrumbLd({
          items: [
            { name: 'Home', url: rootOf(entity.publicUrl) },
            ...(entity.parentBreadcrumb ? [entity.parentBreadcrumb] : []),
            { name: entity.displayName, url: effectiveCanonical },
          ],
        }),
      ]
    }
    if (entityType === 'category' && extra.kind === 'category') {
      return [
        buildCollectionLd({
          name: entity.displayName,
          description: effectiveDescription || extra.shortDescription || null,
          url: effectiveCanonical,
          override: parsedOverride,
        }),
        buildBreadcrumbLd({
          items: [
            { name: 'Home', url: rootOf(entity.publicUrl) },
            { name: entity.displayName, url: effectiveCanonical },
          ],
        }),
      ]
    }
    if (entityType === 'brand' && extra.kind === 'brand') {
      return [
        buildOrgLd({
          name: entity.displayName,
          url: effectiveCanonical,
          logoUrl: extra.logoUrl,
          override: parsedOverride,
        }),
        buildBreadcrumbLd({
          items: [
            { name: 'Home', url: rootOf(entity.publicUrl) },
            { name: 'Brands', url: rootOf(entity.publicUrl) + '/brands' },
            { name: entity.displayName, url: effectiveCanonical },
          ],
        }),
      ]
    }
    if (entityType === 'industry' && extra.kind === 'industry') {
      return [
        buildCollectionLd({
          name: entity.displayName,
          description: effectiveDescription || extra.description || null,
          url: effectiveCanonical,
          override: parsedOverride,
        }),
        buildBreadcrumbLd({
          items: [
            { name: 'Home', url: rootOf(entity.publicUrl) },
            { name: entity.displayName, url: effectiveCanonical },
          ],
        }),
      ]
    }
    if (entityType === 'blog_post' && extra.kind === 'blog_post') {
      return [
        buildArticleLd({
          headline: entity.displayName,
          description: effectiveDescription || null,
          url: effectiveCanonical,
          imageUrl: extra.heroImageUrl,
          authorName: extra.authorName,
          publishedAt: extra.publishedAt ? new Date(extra.publishedAt) : null,
          override: parsedOverride,
        }),
        buildBreadcrumbLd({
          items: [
            { name: 'Home', url: rootOf(entity.publicUrl) },
            { name: 'Blog', url: rootOf(entity.publicUrl) + '/blog' },
            { name: entity.displayName, url: effectiveCanonical },
          ],
        }),
      ]
    }
    // cms_page emits no JSON-LD on the storefront today; preview is empty.
    return []
  }, [
    entityType,
    extra,
    entity.displayName,
    entity.parentBreadcrumb,
    entity.publicUrl,
    effectiveDescription,
    effectiveCanonical,
    jsonLdOverride,
  ])

  function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('id', entity.id)
    formData.set('seoTitle', seoTitle)
    formData.set('seoDescription', seoDescription)
    formData.set('canonicalUrl', canonicalUrl)
    formData.set('focusKeyword', focusKeyword)
    formData.set('robotsIndex', robotsIndex ? 'true' : 'false')
    formData.set('robotsFollow', robotsFollow ? 'true' : 'false')
    formData.set('ogImageMediaId', ogImageMediaId ?? '')
    formData.set('sitemapPriority', sitemapPriority != null ? String(sitemapPriority) : '')
    formData.set('sitemapChangeFreq', sitemapChangeFreq ?? '')
    formData.set('excludeFromSitemap', excludeFromSitemap ? 'true' : 'false')
    formData.set('jsonLdOverride', jsonLdOverride)
    startTransition(async () => {
      const res = await saveAction(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSavedAt(new Date())
      onSaved?.()
    })
  }

  return (
    <form
      action={handleSubmit}
      className="bg-white border border-[var(--color-border)] max-w-5xl"
    >
      {/* Sub-tab nav */}
      <div className="flex border-b border-[var(--color-border)] px-4 overflow-x-auto">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-3 py-2.5 font-mono text-[11px] border-b-2 -mb-px whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-body)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="m-4 px-4 py-3 border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] text-[13px] text-[oklch(0.5_0.18_25)]"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 p-6">
        {/* LEFT — fields */}
        <div className="flex flex-col gap-5">
          {activeSubTab === 'general' && (
            <>
              <FieldBlock
                label="SEO title"
                hint="Override the default page title in search results."
                rightAdornment={
                  <div className="flex items-center gap-2">
                    <CharCounter value={seoTitle} min={TITLE_RANGE.min} max={TITLE_RANGE.max} />
                    <AiSuggestButton
                      entityType={entityType}
                      entityId={entity.id}
                      field="seoTitle"
                      currentValue={seoTitle}
                      onAccepted={(v) => setSeoTitle(v)}
                    />
                  </div>
                }
              >
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className={inputCls}
                  placeholder={entity.displayName}
                />
              </FieldBlock>

              <FieldBlock
                label="SEO description"
                hint="Aim for 120–160 characters."
                rightAdornment={
                  <div className="flex items-center gap-2">
                    <CharCounter
                      value={seoDescription}
                      min={DESCRIPTION_RANGE.min}
                      max={DESCRIPTION_RANGE.max}
                    />
                    <AiSuggestButton
                      entityType={entityType}
                      entityId={entity.id}
                      field="seoDescription"
                      currentValue={seoDescription}
                      onAccepted={(v) => setSeoDescription(v)}
                    />
                  </div>
                }
              >
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className={textareaCls}
                />
              </FieldBlock>

              <FieldBlock
                label="Focus keyword"
                hint="Primary phrase you want this page to rank for."
                rightAdornment={
                  <AiSuggestButton
                    entityType={entityType}
                    entityId={entity.id}
                    field="focusKeyword"
                    currentValue={focusKeyword}
                    onAccepted={(v) => setFocusKeyword(v)}
                  />
                }
              >
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  className={inputCls}
                />
                <FocusKeywordChecklist
                  focusKeyword={focusKeyword}
                  title={effectiveTitle}
                  description={effectiveDescription}
                  slug={entity.slug}
                />
              </FieldBlock>

              <FieldBlock
                label="Canonical URL"
                hint="Leave blank to canonicalise to the page's own URL."
              >
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder={entity.publicUrl}
                  className={inputCls}
                />
              </FieldBlock>
            </>
          )}

          {activeSubTab === 'social' && (
            <FieldBlock
              label="OG image"
              hint="Used by Facebook, LinkedIn, X (Twitter), and the main page metadata."
            >
              <OgImagePicker
                value={ogImageMediaId}
                recent={recentImages}
                uploadAction={uploadAction}
                onChange={(id, preview) => {
                  setOgImageMediaId(id)
                  setOgImagePath(preview?.storagePath ?? null)
                }}
              />
            </FieldBlock>
          )}

          {activeSubTab === 'schema' && (
            <>
              <p className="text-[12px] text-[var(--color-muted)]">
                The storefront emits JSON-LD on every page using the auto-generated builders.
                Paste a partial override below to deep-merge into the auto-emitted block. Leave
                blank to use defaults.
              </p>
              <FieldBlock label="jsonLdOverride (JSON)">
                <textarea
                  rows={10}
                  value={jsonLdOverride}
                  onChange={(e) => setJsonLdOverride(e.target.value)}
                  className={`${textareaCls} font-mono text-[11px]`}
                  placeholder={'{\n  "aggregateRating": { ... }\n}'}
                  spellCheck={false}
                />
              </FieldBlock>
            </>
          )}

          {activeSubTab === 'sitemap' && (
            <>
              <FieldBlock
                label="Sitemap priority"
                hint="0.0 (lowest) to 1.0 (highest). Leave blank to use the default for this entity type."
              >
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={sitemapPriority ?? ''}
                  onChange={(e) =>
                    setSitemapPriority(e.target.value === '' ? null : Number(e.target.value))
                  }
                  className={inputCls}
                />
              </FieldBlock>

              <FieldBlock label="Change frequency hint">
                <select
                  value={sitemapChangeFreq}
                  onChange={(e) => setSitemapChangeFreq(e.target.value as ChangeFreq | '')}
                  className={selectCls}
                >
                  <option value="">— default —</option>
                  <option value="always">always</option>
                  <option value="hourly">hourly</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                  <option value="never">never</option>
                </select>
              </FieldBlock>

              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={excludeFromSitemap}
                  onChange={(e) => setExcludeFromSitemap(e.target.checked)}
                />
                Exclude this URL from <code>/sitemap.xml</code>
              </label>
            </>
          )}

          {activeSubTab === 'advanced' && (
            <>
              <p className="text-[12px] text-[oklch(0.5_0.14_70)] bg-[oklch(0.96_0.05_70)]/50 border border-[oklch(0.75_0.12_70)]/40 px-3 py-2">
                Robots directives change indexability. Audited as infrastructure changes.
              </p>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={robotsIndex}
                  onChange={(e) => setRobotsIndex(e.target.checked)}
                />
                Allow search engines to <strong>index</strong> this page
              </label>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={robotsFollow}
                  onChange={(e) => setRobotsFollow(e.target.checked)}
                />
                Allow search engines to <strong>follow</strong> outgoing links
              </label>
            </>
          )}
        </div>

        {/* RIGHT — previews */}
        <div className="flex flex-col gap-4 sticky top-4 self-start">
          <div>
            <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-1.5">
              Google SERP preview
            </p>
            <SerpPreview
              title={effectiveTitle}
              description={effectiveDescription}
              url={effectiveCanonical}
            />
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-1.5">
              Open Graph preview
            </p>
            <OgPreview
              title={effectiveTitle}
              description={effectiveDescription}
              url={effectiveCanonical}
              imageUrl={ogImagePath ? resolveUrl(ogImagePath) : null}
            />
          </div>
          {activeSubTab === 'schema' && ldPreview.length > 0 && (
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-1.5">
                JSON-LD that will be emitted
              </p>
              <JsonLdPreview data={ldPreview} />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-deep)]">
        <button
          type="submit"
          disabled={pending}
          className="h-10 px-5 bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save SEO'}
        </button>
        {savedAt && (
          <span className="font-mono text-[11px] text-[oklch(0.4_0.14_145)]">
            Saved at {savedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            Health
          </span>
          <SeoHealthBadge score={estimateScore({ effectiveTitle, effectiveDescription, focusKeyword, robotsIndex, ogImagePath })} />
        </span>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Local helpers
// ─────────────────────────────────────────────────────────────────────────────

const inputCls =
  'h-9 w-full px-3 border border-[var(--color-border)] bg-white text-[13px] focus:outline-none focus:border-[var(--color-accent)]'
const textareaCls =
  'w-full px-3 py-2 border border-[var(--color-border)] bg-white text-[13px] resize-y focus:outline-none focus:border-[var(--color-accent)]'
const selectCls =
  'h-9 w-full px-2 border border-[var(--color-border)] bg-white text-[13px] focus:outline-none focus:border-[var(--color-accent)]'

function FieldBlock({
  label,
  hint,
  rightAdornment,
  children,
}: {
  label: string
  hint?: string
  rightAdornment?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[var(--color-body)]">{label}</span>
        {rightAdornment}
      </div>
      {children}
      {hint && <span className="text-[11px] text-[var(--color-caption)]">{hint}</span>}
    </div>
  )
}

function rootOf(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.host}`
  } catch {
    return url
  }
}

function resolveUrl(storagePath: string): string {
  if (!storagePath) return ''
  if (storagePath.startsWith('http')) return storagePath
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ''
  return base ? `${base}/${storagePath}` : storagePath
}

/**
 * Lightweight in-drawer score estimate. The Inspector grid runs the full
 * `scoreEntity` evaluator from `@indus/domain`, but instantiating that here
 * with the same shape would force this client component to import server
 * data. The drawer's score is informational only — Inspector is the source
 * of truth.
 */
function estimateScore(p: {
  effectiveTitle: string
  effectiveDescription: string
  focusKeyword: string
  robotsIndex: boolean
  ogImagePath: string | null
}): number {
  let score = 0
  let weight = 0
  function check(pass: boolean, w: number) {
    weight += w
    if (pass) score += w
  }
  const titleLen = p.effectiveTitle.length
  check(titleLen >= TITLE_RANGE.min && titleLen <= TITLE_RANGE.max, 10)
  const descLen = p.effectiveDescription.length
  check(descLen >= DESCRIPTION_RANGE.min && descLen <= DESCRIPTION_RANGE.max, 10)
  if (p.focusKeyword.trim()) {
    check(p.effectiveTitle.toLowerCase().includes(p.focusKeyword.toLowerCase()), 8)
    check(p.effectiveDescription.toLowerCase().includes(p.focusKeyword.toLowerCase()), 4)
  }
  check(p.robotsIndex, 15)
  check(!!p.ogImagePath, 5)
  return weight === 0 ? 0 : Math.round((score * 100) / weight)
}
