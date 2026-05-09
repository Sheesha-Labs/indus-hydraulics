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
  /** Global Trade Item Number, 13 digits — used by Google for product matching. */
  gtin13?: string | null
  /** Global Trade Item Number, 14 digits — preferred for industrial parts. */
  gtin14?: string | null
  url: string
  imageUrls: string[]
  brand?: { name: string } | null
  /**
   * Manufacturer (separate from `brand` — for distributors these can
   * differ; Indus is the seller, manufacturer is e.g. Bosch Rexroth).
   * When omitted, Schema.org consumers will treat `brand` as the
   * manufacturer.
   */
  manufacturer?: { name: string; url?: string | null } | null
  category?: { name: string } | null
  /** Product weight in kilograms. Renders as a QuantitativeValue. */
  weightKg?: number | null
  /** Country of origin — ISO-3166 alpha-2 ("IN") or full name ("India"). */
  countryOfOrigin?: string | null
  offers?: {
    price?: number | null
    currency?: string | null
    availability?: 'in_stock' | 'out_of_stock' | 'preorder' | 'lead_time'
    url?: string
    /** ISO date string after which the offer is no longer valid. */
    priceValidUntil?: string | null
    /**
     * Schema.org product condition. Industrial distributors almost always
     * sell new; the field is exposed so refurb / rebuilt-surplus listings
     * can override.
     */
    itemCondition?: 'new' | 'refurbished' | 'used' | 'damaged'
    /** @id reference to the seller Organization (e.g. ORG_ID). */
    sellerId?: string
    sellerName?: string
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

export type PostalAddressLd = {
  streetAddress?: string | null
  addressLocality?: string | null
  addressRegion?: string | null
  postalCode?: string | null
  addressCountry?: string | null
  poBox?: string | null
}

export type OrgLdInput = {
  /**
   * Stable @id so other entities (LocalBusiness, Article publisher,
   * Product manufacturer) can reference this Organization via @id.
   * Convention: `${url}#organization`.
   */
  id?: string
  name: string
  /** Trading / legal name. Renders as `legalName`. */
  legalName?: string | null
  url: string
  logoUrl?: string | null
  description?: string | null
  /** ISO date string, e.g. "2003". */
  foundingDate?: string | null
  sameAs?: string[]
  contact?: { email?: string | null; telephone?: string | null }
  address?: PostalAddressLd | null
  /** ISO 3166-1 alpha-2 country code(s) the business serves. */
  areaServed?: string[]
  override?: unknown
}

export type LocalBusinessLdInput = {
  /** Stable @id, e.g. `${baseUrl}#location-mumbai-hq`. */
  id?: string
  /** Schema.org subtype — defaults to LocalBusiness. */
  type?: 'LocalBusiness' | 'Store' | 'WholesaleStore' | 'AutomotiveBusiness'
  name: string
  url?: string
  telephone?: string | null
  email?: string | null
  address: PostalAddressLd
  /**
   * One entry per day-range, e.g. ["Mo-Sa 09:00-18:30"]. Schema.org expects
   * the `Mo|Tu|We|Th|Fr|Sa|Su` weekday format, so callers must pre-format.
   */
  openingHours?: string[]
  parentOrganization?: { id?: string; name?: string } | null
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

const SCHEMA_ITEM_CONDITION: Record<NonNullable<NonNullable<ProductLdInput['offers']>['itemCondition']>, string> = {
  new: 'https://schema.org/NewCondition',
  refurbished: 'https://schema.org/RefurbishedCondition',
  used: 'https://schema.org/UsedCondition',
  damaged: 'https://schema.org/DamagedCondition',
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
  if (input.gtin13) base.gtin13 = input.gtin13
  if (input.gtin14) base.gtin14 = input.gtin14
  if (input.imageUrls.length > 0) base.image = input.imageUrls
  if (input.brand) base.brand = { '@type': 'Brand', name: input.brand.name }
  if (input.manufacturer) {
    const m: JsonLd = { '@type': 'Organization', name: input.manufacturer.name }
    if (input.manufacturer.url) m.url = input.manufacturer.url
    base.manufacturer = m
  }
  if (input.category) base.category = input.category.name
  if (typeof input.weightKg === 'number' && Number.isFinite(input.weightKg)) {
    base.weight = {
      '@type': 'QuantitativeValue',
      value: input.weightKg,
      unitCode: 'KGM',
    }
  }
  if (input.countryOfOrigin) base.countryOfOrigin = input.countryOfOrigin
  if (input.offers) {
    const o: JsonLd = { '@type': 'Offer' }
    const price = input.offers.price
    if (typeof price === 'number') {
      o.price = price.toFixed(2)
      o.priceCurrency = input.offers.currency ?? 'USD'
    }
    if (input.offers.availability) {
      o.availability = SCHEMA_AVAILABILITY[input.offers.availability]
    }
    if (input.offers.url) o.url = input.offers.url
    if (input.offers.priceValidUntil) o.priceValidUntil = input.offers.priceValidUntil
    if (input.offers.itemCondition) {
      o.itemCondition = SCHEMA_ITEM_CONDITION[input.offers.itemCondition]
    }
    if (input.offers.sellerId || input.offers.sellerName) {
      const seller: JsonLd = { '@type': 'Organization' }
      if (input.offers.sellerId) seller['@id'] = input.offers.sellerId
      if (input.offers.sellerName) seller.name = input.offers.sellerName
      o.seller = seller
    }
    // Always emit the Offer when one was requested. Even RFQ-only
    // products without a public price benefit from communicating
    // availability + seller to crawlers and AI shopping agents.
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
  if (input.id) base['@id'] = input.id
  if (input.legalName) base.legalName = input.legalName
  if (input.description) base.description = input.description
  if (input.foundingDate) base.foundingDate = input.foundingDate
  if (input.logoUrl) base.logo = input.logoUrl
  if (input.sameAs && input.sameAs.length > 0) base.sameAs = input.sameAs
  if (input.contact?.email || input.contact?.telephone) {
    const cp: JsonLd = { '@type': 'ContactPoint', contactType: 'customer service' }
    if (input.contact.email) cp.email = input.contact.email
    if (input.contact.telephone) cp.telephone = input.contact.telephone
    if (input.areaServed && input.areaServed.length > 0) cp.areaServed = input.areaServed
    base.contactPoint = cp
  }
  if (input.address) {
    const addr = postalAddressLd(input.address)
    if (addr) base.address = addr
  }
  if (input.areaServed && input.areaServed.length > 0) base.areaServed = input.areaServed
  return mergeJsonLd(base, input.override)
}

export function buildLocalBusinessLd(input: LocalBusinessLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'LocalBusiness',
    name: input.name,
  }
  if (input.id) base['@id'] = input.id
  if (input.url) base.url = input.url
  if (input.telephone) base.telephone = input.telephone
  if (input.email) base.email = input.email
  const addr = postalAddressLd(input.address)
  if (addr) base.address = addr
  if (input.openingHours && input.openingHours.length > 0) {
    base.openingHours = input.openingHours
  }
  if (input.parentOrganization && (input.parentOrganization.id || input.parentOrganization.name)) {
    const parent: JsonLd = { '@type': 'Organization' }
    if (input.parentOrganization.id) parent['@id'] = input.parentOrganization.id
    if (input.parentOrganization.name) parent.name = input.parentOrganization.name
    base.parentOrganization = parent
  }
  return mergeJsonLd(base, input.override)
}

function postalAddressLd(input: PostalAddressLd): JsonLd | null {
  const out: JsonLd = { '@type': 'PostalAddress' }
  let any = false
  if (input.streetAddress) {
    out.streetAddress = input.streetAddress
    any = true
  }
  if (input.addressLocality) {
    out.addressLocality = input.addressLocality
    any = true
  }
  if (input.addressRegion) {
    out.addressRegion = input.addressRegion
    any = true
  }
  if (input.postalCode) {
    out.postalCode = input.postalCode
    any = true
  }
  if (input.addressCountry) {
    out.addressCountry = input.addressCountry
    any = true
  }
  if (input.poBox) {
    out.postOfficeBoxNumber = input.poBox
    any = true
  }
  return any ? out : null
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
