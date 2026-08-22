import { mediaUrl } from '../../../../lib/media'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../../lib/seo'
import { getStoreSettings } from '../../../../lib/store-settings'
import type { Metadata } from 'next'
import type React from 'react'
import { cache } from 'react'
import { notFound, permanentRedirect } from 'next/navigation'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import {
  buildBreadcrumbLd,
  buildFaqLd,
  buildProductLd,
} from '@indus/domain'
import { Badge, Breadcrumb, Button, JsonLd } from '@indus/ui'
import ProductGallery from '../../../../components/ProductGallery'
import AddToQuoteButton from '../../../../components/AddToQuoteButton'
import AddToCompareButton from '../../../../components/AddToCompareButton'
import ProductTabs from '../../../../components/ProductTabs'
import RelatedReading from '../../../../components/blog/RelatedReading'
import { getArticlesForProduct } from '../../../../lib/related-reading'
import ProductStickyBar from '../../../../components/ProductStickyBar'
import AnalyticsEvent from '../../../../components/AnalyticsEvent'

type Props = {
  params: Promise<{ slug: string }>
}

/**
 * Optional minimum content-depth score below which a PDP is emitted
 * with `noindex,follow`. Set via the `PRODUCT_CONTENT_NOINDEX_BELOW`
 * env var (a number 0–100). Unset / 0 / non-numeric = enforcement
 * disabled, which is the safe default for the live catalogue.
 *
 * Useful once the team starts enriching content: flip to 40 to stop
 * Google indexing thin stub pages while the editor team fills them
 * in. Crawl budget then concentrates on PDPs that are good enough to
 * earn citations.
 */
function readContentNoindexThreshold(): number | null {
  const raw = process.env.PRODUCT_CONTENT_NOINDEX_BELOW
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.max(1, Math.min(100, parsed))
}

/**
 * Per-request product fetch. React `cache()` dedupes calls within a
 * single request so generateMetadata + the page render share one
 * Prisma round-trip instead of running two parallel queries.
 */
const getProduct = cache(async (decoded: string) => {
  return db.product.findFirst({
    where: { OR: [{ slug: decoded }, { sku: decoded }] },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: 'asc' }, include: { media: true } },
      specs: { orderBy: { position: 'asc' } },
      documents: { orderBy: { position: 'asc' }, include: { media: true } },
      // Ordered so the Compatibility tab and the equivalence line above the
      // size table list the same references in the same order every render.
      crossReferences: { take: 12, orderBy: { competitorMpn: 'asc' } },
      variants: { orderBy: { position: 'asc' } },
      faqs: { orderBy: { position: 'asc' } },
      supersededBy: { select: { sku: true, title: true, slug: true } },
      specTemplate: {
        include: { fields: { orderBy: { position: 'asc' } } },
      },
    },
  })
})

/**
 * Refresh interval for the PDP. One hour for a catalogue that changes daily
 * but not minutely; admin mutations punch through with
 * `revalidatePath('/p/<slug>')` after an edit.
 *
 * This is live again. It was inert for as long as the page rendered
 * dynamically — three per-request reads did that, and all three are gone:
 *
 *   `searchParams` (`?preview=`)     -> draft mode, via /api/preview
 *   `customerSessionOrNull()`        -> /api/documents/<id> decides access
 *   the header's own session read    -> /api/me, after hydration
 *
 * Nothing in this file may read cookies, headers or searchParams without
 * putting the route back to `ƒ` and undoing all of it. `draftMode()` is the
 * one exception: Next prerenders with it false and serves the cached page,
 * and only requests carrying its bypass cookie render fresh.
 */
export const revalidate = 3600

/**
 * Serve slugs that are not in the list below on demand rather than 404ing
 * them, so a product added after the last deploy is reachable immediately.
 */
export const dynamicParams = true

/**
 * A deliberately tiny prerender list — and the size is not the point.
 *
 * What matters is that this function EXISTS. A dynamic route with no
 * `generateStaticParams` is served fully dynamically, `no-store`, however
 * statically renderable its code is — measured, not assumed. Give it a list
 * and the route switches to the incremental cache: the listed slugs are built
 * ahead of time, and with `dynamicParams` every OTHER product renders on first
 * request and is cached from then on (`x-nextjs-cache: MISS` then `HIT`).
 *
 * So the list unlocks caching for all ~1.8k products; its length only decides
 * how many are already warm when a deploy lands. Length is expensive —
 * 200 products plus the market pages took the Vercel build from 2m to 9m,
 * each entry being a full render against Supabase from the build region on a
 * pool capped for the build (packages/db/src/datasource-url.ts).
 *
 * Hence: a handful, highest content score first. Deploy speed was the
 * explicit call here; raising this number is the one lever that trades it
 * back for fewer cold first-hits.
 */
const STATIC_PDP_LIMIT = 5

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const rows = await db.product.findMany({
    where: { status: 'active' },
    select: { slug: true },
    orderBy: [{ contentScore: 'desc' }, { updatedAt: 'desc' }],
    take: STATIC_PDP_LIMIT,
  })
  return rows.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const [product, seoSetting] = await Promise.all([
    getProduct(decoded),
    db.seoSetting.findFirst({
      select: { defaultMetaTitleTemplate: true, defaultMetaDescription: true },
    }),
  ])
  if (!product) return {}

  const ogPath = product.ogImageMediaId
    ? (await db.media.findUnique({
        where: { id: product.ogImageMediaId },
        select: { storagePath: true },
      }))?.storagePath ?? null
    : product.images[0]?.media.storagePath ?? null

  // Content-depth gate (#7-3). When PRODUCT_CONTENT_NOINDEX_BELOW is
  // set on Vercel, force noindex on PDPs that score below the
  // threshold so Google doesn't waste crawl budget on stub pages.
  // The admin's per-product robotsIndex flag still wins over this
  // (an admin actively setting "index" wins regardless of score).
  // Content score is now persisted on Product.contentScore (#7-3
  // persistence). The admin / Inngest job recompute it on every
  // mutation; we just read the column here.
  const threshold = readContentNoindexThreshold()
  const indexFlag =
    threshold != null && product.contentScore < threshold && product.robotsIndex
      ? false
      : product.robotsIndex

  return pageMetadata({
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.descriptionShort ?? null,
    path: `/p/${product.slug}`,
    canonicalUrl: product.canonicalUrl,
    robots: { index: indexFlag, follow: product.robotsFollow },
    ogImagePath: ogPath,
    titleTemplate: seoSetting?.defaultMetaTitleTemplate ?? null,
    defaultDescription: seoSetting?.defaultMetaDescription ?? null,
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  // Draft mode rather than a `?preview=` search param. Reading searchParams
  // here would make this route dynamic for every visitor; `draftMode()` does
  // not, and is false for everyone who did not come through /api/preview.
  const { isEnabled: isPreview } = await draftMode()

  const decoded = decodeURIComponent(slug)

  // Resolve product by slug first (canonical), fall back to SKU. The SKU
  // fallback supports legacy/inbound links (e.g. older sitemaps, customer
  // bookmarks, admin preview URLs that still embed the SKU). When we hit
  // via SKU and we're NOT in preview mode, 308 to the slug URL so search
  // engines collapse to a single canonical address.
  const [product, settings] = await Promise.all([getProduct(decoded), getStoreSettings()])

  if (!product) notFound()

  // Hit via SKU rather than slug → 308 permanent redirect to the
  // canonical slug URL so search engines collapse to a single address.
  // Skipped in preview mode, as before.
  if (decoded !== product.slug && !isPreview) {
    permanentRedirect(`/p/${product.slug}`)
  }

  if (product.status === 'draft' && !isPreview) notFound()

  const specGroups = product.specs.reduce<Record<string, typeof product.specs>>((acc, spec) => {
    const g = spec.group ?? 'General'
    if (!acc[g]) acc[g] = []
    acc[g].push(spec)
    return acc
  }, {})

  const quickSpecs = product.specs.filter((s) => s.isFilterable).slice(0, 6)

  // Template-driven key features. For every template field flagged
  // isKeyFeature with a value entered on the product, produce a bullet.
  // descriptionShort renders as its own paragraph elsewhere — it is no
  // longer used as a fallback bullet source.
  const specByFieldId = new Map(product.specs.filter((s) => s.templateFieldId).map((s) => [s.templateFieldId!, s]))
  const keyFeatures = (product.specTemplate?.fields ?? [])
    .filter((f) => f.isKeyFeature)
    .map((f) => {
      const spec = specByFieldId.get(f.id)
      if (!spec || !spec.value) return null
      // For boolean fields, only render bullets for affirmative values.
      if (f.dataType === 'boolean' && spec.value.toLowerCase() !== 'yes') return null
      const valuePart =
        f.dataType === 'boolean' ? f.label : f.unit ? `${spec.value} ${f.unit}` : spec.value
      const text = f.dataType === 'boolean' ? valuePart : `${f.label}: ${valuePart}`
      return { id: f.id, text }
    })
    .filter((x): x is { id: string; text: string } => x !== null)

  const related = product.categoryId
    ? await db.product.findMany({
        where: { categoryId: product.categoryId, status: 'active', sku: { not: product.sku } },
        take: 4,
        include: {
          brand: { select: { name: true } },
          images: { take: 1, orderBy: { position: 'asc' }, include: { media: true } },
        },
      })
    : []

  // The return leg of the internal-link loop: articles that embed this SKU.
  const relatedArticles = await getArticlesForProduct(product.id)

  // Every document is linkable by everyone; /api/documents/<id> decides at
  // request time whether this visitor gets a URL or a trip to sign-in. The
  // page therefore holds no session-dependent and no expiring value, which is
  // what lets it prerender.
  const firstDatasheet = product.documents[0]
  const datasheetUrl = firstDatasheet ? `/api/documents/${firstDatasheet.id}` : undefined

  const tabSpecGroups = Object.fromEntries(
    Object.entries(specGroups).map(([g, specs]) =>
      [g, specs.map((s) => ({ id: s.id, label: s.label, value: s.value, unit: s.unit, group: s.group, isFilterable: s.isFilterable }))]
    )
  )

  // Same for the documents tab: point at the route, not at a signed URL.
  // `isGated` still travels so the UI can mark which downloads will ask for
  // a sign-in first.
  const tabDocuments = product.documents.map((d) => ({
    id: d.id,
    title: d.title,
    kind: d.kind,
    language: d.language,
    isGated: d.isGated,
    mediaUrl: `/api/documents/${d.id}`,
  }))

  const tabCrossRefs = product.crossReferences.map((r) => ({
    id: r.id,
    competitorBrand: r.competitorBrand,
    competitorMpn: r.competitorMpn,
    compatibility: r.compatibility,
  }))

  // Size table. `dimensions` crosses the server/client boundary as plain JSON,
  // which it already is — the mapper exists to drop the columns the table does
  // not read rather than to reshape anything.
  const tabVariants = product.variants.map((v) => ({
    partNumber: v.partNumber,
    hoseDash: v.hoseDash,
    hoseInch: v.hoseInch,
    hoseDn: v.hoseDn,
    portLabel: v.portLabel,
    competitorBrand: v.competitorBrand,
    competitorMpn: v.competitorMpn,
    dimensions: v.dimensions,
  }))
  // One line above the table naming what this listing replaces. Built from the
  // cross-reference rows rather than restated in copy, so it cannot drift from
  // what the Compatibility tab shows.
  const equivalenceBrand = (() => {
    const first = product.crossReferences[0]?.competitorBrand
    if (!first) return null
    return product.crossReferences.every((r) => r.competitorBrand === first) ? first : null
  })()
  const equivalenceNote = equivalenceBrand
    ? `Replaces the ${equivalenceBrand} ${product.crossReferences
        .map((r) => r.competitorMpn)
        .join(' / ')} series. Quote the Indus part number, or send us the ${equivalenceBrand} number and we will cross it.`
    : null

  // JSON-LD assembly. Pages with FAQs additionally emit a FAQPage entity.
  const productUrl = urlFor(`/p/${product.slug}`)
  const availability =
    product.status === 'discontinued'
      ? 'out_of_stock'
      : product.stockQty > 0
        ? 'in_stock'
        : 'lead_time'
  const productLd = buildProductLd({
    name: product.title,
    description: product.descriptionShort,
    sku: product.sku,
    mpn: product.mpn,
    url: productUrl,
    imageUrls: product.images.map((img) => mediaUrl(img.media.storagePath)),
    brand: product.brand ? { name: product.brand.name } : null,
    // For a distributor, the manufacturer is the brand owner. We surface
    // it as a separate Organization so AI engines can disambiguate
    // "who made it" vs "who sells it" (Indus is the seller below).
    manufacturer: product.brand ? { name: product.brand.name } : null,
    category: product.category ? { name: product.category.name } : null,
    weightKg: product.weightKg ? Number(product.weightKg) : null,
    countryOfOrigin: product.countryOfOrigin,
    variants: product.variants.map((v) => ({
      sku: v.partNumber,
      name: [product.title, v.hoseInch ? `${v.hoseInch} hose` : null, v.portLabel]
        .filter(Boolean)
        .join(' · '),
      equivalentBrand: v.competitorBrand,
      equivalentMpn: v.competitorMpn,
    })),
    // Always emit an Offer for active SKUs — RFQ-only products get
    // availability + seller without a price, which AI shopping agents
    // and Google's Merchant Center treat as "request quote" rather than
    // discarding the product entirely.
    offers:
      product.status === 'draft'
        ? null
        : {
            price: product.listPrice != null ? Number(product.listPrice) : null,
            currency: product.listPriceCurrency,
            availability,
            url: productUrl,
            itemCondition: 'new',
            sellerId: ORG_ID,
            sellerName: SITE_NAME,
          },
    override: product.jsonLdOverride ?? undefined,
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      ...(product.category
        ? [{ name: product.category.name, url: urlFor(`/c/${product.category.slug}`) }]
        : []),
      { name: product.title, url: productUrl },
    ],
  })
  const faqLd = buildFaqLd({
    faqs: product.faqs.map((f) => ({ question: f.question, answer: f.answer })),
  })

  return (
    <>
      <JsonLd data={[productLd, breadcrumbLd, faqLd]} />
      {isPreview && (
        <div className="border-b border-[oklch(0.88_0.06_78)] bg-ih-warning-soft px-8 py-2.5 text-center font-mono text-[11px] tracking-[0.06em] text-[oklch(0.46_0.1_62)]">
          PREVIEW MODE · {product.status.toUpperCase()} · not visible to public
        </div>
      )}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
        {/* Breadcrumbs */}
        <div className="border-b border-ih-border py-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              ...(product.category
                ? [{ label: product.category.name, href: `/c/${product.category.slug}` }]
                : []),
              { label: product.sku },
            ]}
          />
        </div>

        {product.status === 'discontinued' && (
          <div className="mt-4 rounded-md border border-[oklch(0.88_0.05_28)] bg-ih-danger-soft px-4 py-3 text-[13.5px] font-medium text-[oklch(0.44_0.14_28)]">
            This product has been discontinued.
            {product.supersededBy && (
              <>
                {' · '}
                <Link href={`/p/${product.supersededBy.slug}`} className="underline">
                  See replacement: {product.supersededBy.sku}
                </Link>
              </>
            )}
          </div>
        )}

        {/*
          PDP grid — TITLE-FIRST.

          02-screen-index.md calls the PDP a restructure, and 03 §6 says the
          title-first order and the 4:3 hero "exist because of mobile" and must
          be preserved at every breakpoint. So the identity block is FIRST in
          the DOM and the gallery follows it; explicit grid placement puts the
          gallery back on the left at >=lg. Stacked, the product name is the
          first thing on the page — which is the entire point, and is exactly
          what a source-order layout with the gallery first cannot give you.
        */}
        <div className="grid grid-cols-1 items-start gap-10 py-10 pb-16 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Identity — row 1, right column on desktop, first on mobile */}
          <div className="lg:col-start-2 lg:row-start-1">
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              {product.brand && (
                <Link href={`/brands/${product.brand.slug}`}>
                  <Badge kind="navy" square>
                    {product.brand.name.toUpperCase()}
                  </Badge>
                </Link>
              )}
              <span className="font-mono text-[11.5px] text-ih-muted">{product.sku}</span>
              {product.countryOfOrigin && (
                <span className="font-mono text-[11.5px] text-ih-muted">
                  · MADE IN {product.countryOfOrigin.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-[clamp(26px,3vw,34px)] font-medium leading-[1.12] tracking-[-0.02em]">
              {product.title}
            </h1>

            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              {product.category && (
                <span className="text-[14px] text-ih-ink-2">{product.category.name}</span>
              )}
              {product.mpn && (
                <>
                  <span aria-hidden="true" className="text-ih-border-strong">
                    ·
                  </span>
                  <span className="font-mono text-[12.5px] text-ih-muted">MFR {product.mpn}</span>
                </>
              )}
              <StockPill stockQty={product.stockQty} warehouse={product.stockWarehouse} leadTimeDays={product.leadTimeDays} />
            </div>
          </div>

          {/* Gallery — row 1 on desktop, spans down; second in source order */}
          <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2">
            <ProductGallery
              images={product.images.map((img) => ({
                url: mediaUrl(img.media.storagePath),
                alt: img.alt ?? img.media.alt ?? product.title,
              }))}
              title={product.title}
            />
          </div>

          {/* Info column — row 2, right */}
          <div className="flex flex-col lg:col-start-2 lg:row-start-2">

            {/* Short description — prose blurb above the bullet list. */}
            {product.descriptionShort && (
              <p className="mb-5 whitespace-pre-line text-[16px] leading-[1.6] text-ih-ink-2">
                {product.descriptionShort}
              </p>
            )}

            {/* Key features — template-driven bullets. Empty when no template
                fields are flagged as Key feature, or no values have been entered. */}
            {keyFeatures.length > 0 && (
              <div className="pb-6">
                <h3 className="mb-3.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">Key features</h3>
                <ul className="flex flex-col gap-2.5">
                  {keyFeatures.map((feat) => (
                    <li
                      key={feat.id}
                      className="grid gap-2.5 text-[14px] leading-[1.5] text-ih-ink-2"
                      style={{ gridTemplateColumns: '16px 1fr' }}
                    >
                      <span aria-hidden="true" className="text-ih-steel">✓</span>
                      <span>{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick spec table */}
            {quickSpecs.length > 0 && (
              <div className="mb-6 overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
                <dl className="grid grid-cols-2">
                  {quickSpecs.map((spec, i) => (
                    <div
                      key={spec.id}
                      className={`flex flex-col border-ih-border px-4 py-3 ${i % 2 === 0 ? 'border-r' : ''} ${i < quickSpecs.length - 2 ? 'border-b' : ''}`}
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-ih-muted">{spec.label}</dt>
                      <dd className="mt-1 font-mono text-[13px] text-ih-ink">
                        {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/*
              CTA stack. "Add to quote" is the single primary action — the
              language allows exactly one per view and reserves the accent for
              it. The WhatsApp route was previously a full-width saturated
              green button sitting ABOVE it, which made the loudest thing on
              the page neither blue nor the action we want taken. It keeps its
              brand glyph (in WhatsApp green, so it stays recognisable) on an
              outline button, one rank down where it belongs.

              WhatsApp hides entirely when no number is configured rather than
              shipping a dead link.
            */}
            <div className="mb-4 flex flex-col gap-2.5 pt-2">
              <AddToQuoteButton sku={product.sku} title={product.title} />

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {whatsappHref(settings.contactPhone, product.sku) && (
                  <Button asChild kind="outline" size="lg">
                    <a
                      href={whatsappHref(settings.contactPhone, product.sku)!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppGlyph />
                      Enquire on WhatsApp
                    </a>
                  </Button>
                )}
                <Button asChild kind="outline" size="lg">
                  <a href={mailtoQuoteHref(settings.contactEmail, product.sku)}>Email for a quotation</a>
                </Button>
              </div>

              <AddToCompareButton
                sku={product.sku}
                categoryId={product.categoryId}
                specTemplateId={product.specTemplateId}
                title={product.title}
                imageUrl={product.images[0] ? mediaUrl(product.images[0].media.storagePath) : undefined}
              />
            </div>

            {/* Datasheet card */}
            {product.documents[0] && (
              <div className="mt-1 mb-6 flex items-center gap-3 rounded-lg border border-ih-border bg-ih-surface p-4">
                <div className="grid h-11 w-9 shrink-0 place-items-center rounded-sm border border-ih-border bg-ih-surface-2 font-mono text-[9px] font-medium text-ih-accent">
                  {product.documents[0].kind.toUpperCase().slice(0, 4)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{product.documents[0].title}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-ih-muted">
                    {product.documents[0].kind} · {product.documents[0].language.toUpperCase()}
                  </div>
                </div>
                <a
                  href={`/api/documents/${product.documents[0].id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 shrink-0 items-center rounded-sm border border-ih-border-strong px-3 font-mono text-[11px] text-ih-ink transition-colors hover:border-ih-accent hover:text-ih-accent"
                >
                  {product.documents[0].isGated ? '🔒 Download' : '↓ Download'}
                </a>
              </div>
            )}

            {/*
              Assurance row. The artboard runs three bordered cards with a
              steel icon rather than the old rule-separated columns — the
              language separates with a border, not a divider.
            */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: TruckIcon, title: 'Ships in 24h', sub: 'Order before 14:00 GST · Jebel Ali' },
                {
                  icon: ShieldIcon,
                  title: `${product.warrantyMonths ?? 24}-month warranty`,
                  sub: 'Manufacturer-backed · genuine parts',
                },
                { icon: WrenchIcon, title: 'Engineering support', sub: 'A real applications engineer' },
              ].map((trust) => (
                <div key={trust.title} className="flex gap-2.5 rounded-lg border border-ih-border bg-ih-surface p-3.5">
                  <trust.icon />
                  <div>
                    <div className="text-[12.5px] font-medium">{trust.title}</div>
                    <div className="mt-0.5 text-[11.5px] leading-[1.45] text-ih-muted">{trust.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs
          sku={product.sku}
          productId={product.id}
          descriptionShort={product.descriptionShort}
          descriptionLong={product.descriptionLong}
          specGroups={tabSpecGroups}
          documents={tabDocuments}
          crossReferences={tabCrossRefs}
          variants={tabVariants}
          variantEquivalenceNote={equivalenceNote}
          variantEquivalenceBrand={equivalenceBrand}
          faqs={product.faqs.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
          }))}
          leadTimeDays={product.leadTimeDays}
          warrantyMonths={product.warrantyMonths}
          countryOfOrigin={product.countryOfOrigin}
          hsCode={product.hsCode}
          weightKg={product.weightKg ? Number(product.weightKg) : null}
        />

        <RelatedReading
          articles={relatedArticles}
          heading="Written about this part"
          eyebrow="From the blog"
        />

        {/* Related products */}
        {related.length > 0 && (
          <section className="border-t border-ih-border pt-8 pb-20">
            <div className="mb-6">
              <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-2">RELATED · OFTEN PAIRED WITH</div>
              <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Engineers viewing this also looked at</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/p/${rel.slug}`}
                  className="group border border-ih-border bg-ih-surface overflow-hidden flex flex-col hover:border-ih-accent transition-colors"
                >
                  <div className="aspect-square border-b border-ih-border bg-ih-surface-2 relative">
                    {rel.images[0] ? (
                      <Image
                        src={mediaUrl(rel.images[0]!.media.storagePath)}
                        alt={rel.title}
                        fill
                        className="object-contain p-4"
                        sizes="25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-ih-muted">
                        {rel.sku}
                      </div>
                    )}
                  </div>
                  <div className="p-4 pb-5">
                    <div className="font-mono text-[11px] text-ih-muted-2 mb-1.5">{rel.sku}</div>
                    <h4 className="text-[14px] font-medium leading-[1.3] mb-2 group-hover:text-ih-accent transition-colors">
                      {rel.title}
                    </h4>
                    {rel.brand && (
                      <div className="font-mono text-[11px] text-ih-muted">{rel.brand.name}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky enquiry bar */}
      <ProductStickyBar
        title={product.title}
        sku={product.sku}
        datasheetUrl={datasheetUrl}
        whatsappUrl={whatsappHref(settings.contactPhone, product.sku)}
        emailUrl={mailtoQuoteHref(settings.contactEmail, product.sku)}
      />

      {/* Analytics: PDP view */}
      <AnalyticsEvent
        name="pdp_view"
        props={{
          sku: product.sku,
          slug: product.slug,
          brand: product.brand?.name ?? null,
          category: product.category?.name ?? null,
          hasListPrice: product.listPrice !== null,
        }}
      />
    </>
  )
}

// Strip everything that isn't a digit so the StoreSettings phone (which
// may include +, spaces, dashes) becomes a wa.me-compatible numeric ID.
// Returns null when no phone is configured so the CTA can be hidden
// rather than shipping a placeholder/dead-link.
/**
 * Assurance-row icons. 24x24 viewBox, currentColor stroke, 1.7 stroke-width,
 * round caps and joins — the icon spec from the handoff's §8. Kept local
 * because they are the only three the PDP needs; the shared Icon primitive
 * (WS-2.5) replaces them when it lands, and mixing two icon families before
 * then is explicitly banned.
 */
/**
 * WhatsApp brand glyph. Keeps WhatsApp green so the route stays recognisable,
 * but only as a 17px mark on an outline button — the accent stays the loudest
 * thing on the page, which is the one rule the colour system is built around.
 */
function WhatsAppGlyph() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true" className="shrink-0">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.3 1.2 4.7L2 22l5.4-1.4c1.4.8 2.9 1.2 4.6 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
    </svg>
  )
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-ih-steel"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function TruckIcon() {
  return (
    <IconBase>
      <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17.5" cy="18" r="1.6" />
    </IconBase>
  )
}

function ShieldIcon() {
  return (
    <IconBase>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  )
}

function WrenchIcon() {
  return (
    <IconBase>
      <path d="M15 3a5 5 0 0 0-4.6 7L3 17.4 6.6 21l7.4-7.4A5 5 0 0 0 21 9l-3 3-3-3 3-3a5 5 0 0 0-3-3Z" />
    </IconBase>
  )
}

function whatsappHref(phone: string | null, sku: string): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null
  const text = encodeURIComponent(`Enquiry on ${sku}`)
  return `https://wa.me/${digits}?text=${text}`
}

function mailtoQuoteHref(email: string | null, sku: string): string {
  const to = email ?? 'enquiries@indushydraulics.me'
  const subject = encodeURIComponent(`Quotation for ${sku}`)
  return `mailto:${to}?subject=${subject}`
}

// ── Stock pill — green when stocked, amber for build-to-order, grey when neither ─────────────
function StockPill({
  stockQty,
  warehouse,
  leadTimeDays,
}: {
  stockQty: number
  warehouse: string | null
  leadTimeDays: number | null
}) {
  if (stockQty > 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.04em]"
        style={{ background: 'oklch(0.95 0.05 150)', color: 'oklch(0.45 0.12 150)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.55 0.15 150)' }} />
        In stock · {stockQty} unit{stockQty === 1 ? '' : 's'}
        {warehouse ? ` · ${warehouse}` : ''}
      </span>
    )
  }
  if (leadTimeDays !== null && leadTimeDays > 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.04em]"
        style={{ background: 'oklch(0.95 0.05 80)', color: 'oklch(0.45 0.13 70)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.6 0.15 70)' }} />
        Lead time · {leadTimeDays} day{leadTimeDays === 1 ? '' : 's'}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.04em]"
      style={{ background: 'var(--color-ih-surface-2)', color: 'var(--color-ih-muted)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-ih-muted)' }} />
      Contact for availability
    </span>
  )
}
