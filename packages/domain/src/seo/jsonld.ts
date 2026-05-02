/**
 * JSON-LD builders. Pure functions, deep-merging optional `jsonLdOverride`.
 *
 * Each builder returns a plain object that the caller serialises with
 * `JSON.stringify` inside a `<script type="application/ld+json">` element.
 *
 * Storefront pages call these from server components (see
 * `apps/storefront/src/components/JsonLd.tsx` and the per-route page.tsx).
 */

export type JsonLd = Record<string, unknown>

// ── Deep merge ────────────────────────────────────────────────────────────

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * Override values win. Arrays from the override REPLACE the base array (we
 * don't try to be clever — JSON-LD arrays mean "list of items" not "tags").
 */
export function mergeJsonLd<T extends JsonLd>(base: T, override?: unknown): T {
  if (!isPlainObject(override)) return base
  const out: JsonLd = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = mergeJsonLd(out[key] as JsonLd, value)
    } else {
      out[key] = value
    }
  }
  return out as T
}

// ── Inputs ────────────────────────────────────────────────────────────────

export type ProductLdInput = {
  name: string
  description?: string | null
  sku: string
  mpn?: string | null
  url: string
  imageUrls: string[]
  brand?: { name: string } | null
  category?: { name: string } | null
  offers?: {
    price?: number | null
    currency?: string | null
    availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'lead_time'
    url?: string
  } | null
  override?: unknown
}

export type BreadcrumbLdInput = {
  items: { name: string; url: string }[]
  override?: unknown
}

export type FaqLdInput = {
  faqs: { question: string; answer: string }[]
  override?: unknown
}

export type CollectionLdInput = {
  name: string
  description?: string | null
  url: string
  override?: unknown
}

export type ArticleLdInput = {
  headline: string
  description?: string | null
  url: string
  imageUrl?: string | null
  authorName?: string | null
  publishedAt?: Date | null
  modifiedAt?: Date | null
  override?: unknown
}

export type OrgLdInput = {
  name: string
  url: string
  logoUrl?: string | null
  sameAs?: string[]
  contact?: { email?: string | null; telephone?: string | null }
  override?: unknown
}

export type WebsiteLdInput = {
  name: string
  url: string
  searchUrlTemplate?: string | null
  override?: unknown
}

// ── Builders ──────────────────────────────────────────────────────────────

const SCHEMA_AVAILABILITY: Record<NonNullable<ProductLdInput['offers']>['availability'] & string, string> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
  lead_time: 'https://schema.org/BackOrder',
}

export function buildProductLd(input: ProductLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    sku: input.sku,
    url: input.url,
  }
  if (input.description) base.description = input.description
  if (input.mpn) base.mpn = input.mpn
  if (input.imageUrls.length > 0) base.image = input.imageUrls
  if (input.brand) base.brand = { '@type': 'Brand', name: input.brand.name }
  if (input.category) base.category = input.category.name
  if (input.offers) {
    const o: JsonLd = { '@type': 'Offer' }
    if (typeof input.offers.price === 'number') {
      o.price = input.offers.price.toFixed(2)
      o.priceCurrency = input.offers.currency ?? 'USD'
    }
    if (input.offers.availability) {
      o.availability = SCHEMA_AVAILABILITY[input.offers.availability]
    }
    if (input.offers.url) o.url = input.offers.url
    base.offers = o
  }
  return mergeJsonLd(base, input.override)
}

export function buildBreadcrumbLd(input: BreadcrumbLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: input.items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
  return mergeJsonLd(base, input.override)
}

export function buildFaqLd(input: FaqLdInput): JsonLd | null {
  if (input.faqs.length === 0) return null
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: input.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
  return mergeJsonLd(base, input.override)
}

export function buildCollectionLd(input: CollectionLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    url: input.url,
  }
  if (input.description) base.description = input.description
  return mergeJsonLd(base, input.override)
}

export function buildArticleLd(input: ArticleLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    url: input.url,
  }
  if (input.description) base.description = input.description
  if (input.imageUrl) base.image = input.imageUrl
  if (input.authorName) base.author = { '@type': 'Person', name: input.authorName }
  if (input.publishedAt) base.datePublished = input.publishedAt.toISOString()
  if (input.modifiedAt) base.dateModified = input.modifiedAt.toISOString()
  return mergeJsonLd(base, input.override)
}

export function buildOrgLd(input: OrgLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
  }
  if (input.logoUrl) base.logo = input.logoUrl
  if (input.sameAs && input.sameAs.length > 0) base.sameAs = input.sameAs
  if (input.contact?.email || input.contact?.telephone) {
    const cp: JsonLd = { '@type': 'ContactPoint' }
    if (input.contact.email) cp.email = input.contact.email
    if (input.contact.telephone) cp.telephone = input.contact.telephone
    base.contactPoint = cp
  }
  return mergeJsonLd(base, input.override)
}

export function buildWebsiteLd(input: WebsiteLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
  }
  if (input.searchUrlTemplate) {
    base.potentialAction = {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: input.searchUrlTemplate,
      },
      'query-input': 'required name=search_term_string',
    }
  }
  return mergeJsonLd(base, input.override)
}
