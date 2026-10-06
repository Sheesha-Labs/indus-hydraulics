/**
 * JSON-LD builders. Pure functions, deep-merging optional `jsonLdOverride`.
 *
 * Each builder returns a plain object that the caller serialises with
 * `JSON.stringify` inside a `<script type="application/ld+json">` element.
 *
 * Storefront pages call these from server components (see
 * `apps/web/src/components/JsonLd.tsx` and the per-route page.tsx).
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
  /**
   * Other names the product is genuinely known by — trade designations in
   * the languages buyers use, not translations of `name`. schema.org allows
   * an array here. Omitted entirely when empty rather than emitted as `[]`.
   */
  alternateName?: string[] | null
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
  /** Country of origin — ISO-3166 alpha-2 ("DE") or full name ("Germany"). */
  countryOfOrigin?: string | null
  /**
   * Orderable sizes under this listing.
   *
   * Only the competitor equivalents are carried into the markup, as
   * `additionalProperty` entries on the listing itself — that identifier is the
   * query these pages are actually found by.
   *
   * The sizes used to be emitted as `hasVariant` children, and that was wrong
   * twice over: `hasVariant` is a ProductGroup property, not a Product one, and
   * Google validates every variant node as a product of its own. With no price
   * on an RFQ catalogue each child was an invalid item — a 40-size rigging
   * family put 40 errors in the Product snippets report for one page. The size
   * table itself is server-rendered HTML (see ProductTabs), which is where a
   * crawler reads it.
   */
  variants?: Array<{
    sku: string
    name: string
    equivalentBrand?: string | null
    equivalentMpn?: string | null
  }> | null
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
  /**
   * What the collection is a collection OF — e.g. a Brand node on a brand
   * page. Emitted as `about`.
   */
  about?: JsonLd | null
  override?: unknown
}

export type BrandLdInput = {
  name: string
  logoUrl?: string | null
}

/** A person named on an article — its author or its technical reviewer. */
export type ArticlePersonLd = {
  name: string
  /** Profile page on this site — the E-E-A-T anchor for the name. */
  url?: string | null
  jobTitle?: string | null
  /** Off-site profiles that are the same person, e.g. LinkedIn. */
  sameAs?: string[] | null
}

export type VideoLdInput = {
  name: string
  description?: string | null
  /** Required by Google for a video rich result. */
  thumbnailUrl: string
  /** Required by Google. ISO date or Date. */
  uploadDate: Date | string
  /** The player URL, e.g. https://www.youtube.com/embed/<id>. */
  embedUrl?: string | null
  /** The watch page or media file URL. */
  contentUrl?: string | null
  /** ISO 8601 duration, e.g. "PT2M30S". */
  duration?: string | null
}

export type ItemListLdInput = {
  name?: string | null
  /**
   * In the order the page renders them. `position` is assigned from the array
   * index, so the schema and the visible sequence cannot drift.
   */
  items: { name: string; url?: string | null }[]
  override?: unknown
}

export type ArticleLdInput = {
  /**
   * `BlogPosting` for blog articles, `Article` (the default) for everything
   * else — service case studies are articles but not blog posts.
   */
  type?: 'Article' | 'BlogPosting'
  headline: string
  description?: string | null
  url: string
  /** Single image URL or an ordered list (Google prefers >=1 high-res image). */
  imageUrl?: string | string[] | null
  authorName?: string | null
  /** Optional author profile URL — adds E-E-A-T signal. */
  authorUrl?: string | null
  authorJobTitle?: string | null
  /** Off-site profiles of the author, e.g. LinkedIn. Emitted as `sameAs`. */
  authorSameAs?: string[] | null
  /**
   * The technical reviewer. Emitted on the WebPage node as `reviewedBy` —
   * schema.org has no reviewer property on Article itself.
   */
  reviewer?: ArticlePersonLd | null
  /** When the reviewer signed the article off. Emitted as `lastReviewed`. */
  reviewedAt?: Date | null
  /** The topic hub the article is filed under. */
  articleSection?: string | null
  keywords?: string[] | null
  publishedAt?: Date | null
  modifiedAt?: Date | null
  /**
   * Reference to the publishing Organization. When provided, emits a
   * `publisher: { @type: Organization, @id: ... }` so the Article links
   * back to the global Org node.
   */
  publisherId?: string
  publisherName?: string
  publisherLogoUrl?: string | null
  /** BCP-47 language tag, defaults to "en" when omitted. */
  inLanguage?: string
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
  /** Stable @id, e.g. `${baseUrl}#location-dubai-hq`. */
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
  if (input.alternateName && input.alternateName.length > 0) {
    base.alternateName = input.alternateName
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
  const equivalents = equivalentPartNumbers(input.variants)
  if (equivalents.length > 0) base.additionalProperty = equivalents
  // An Offer only when there is a price to put in it.
  //
  // Every builder used to emit one regardless, so an RFQ-only listing told
  // Google "here is an offer" with no `price` — a critical error in both the
  // Product snippets and the Merchant listings reports, on every product page
  // in the catalogue. Without an Offer the page is simply not considered for
  // merchant listings; the Product node still carries the entity (brand, mpn,
  // sku, images) that the markup is really for. Availability is not lost: the
  // page states it to the buyer, which is where a crawler reads it.
  const price = input.offers?.price
  if (input.offers && typeof price === 'number' && Number.isFinite(price) && price > 0) {
    const o: JsonLd = { '@type': 'Offer' }
    o.price = price.toFixed(2)
    o.priceCurrency = input.offers.currency ?? 'USD'
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
    base.offers = o
  }
  return mergeJsonLd(base, input.override)
}

/**
 * Competitor equivalents stated by a listing's sizes, as PropertyValue nodes.
 *
 * Deduplicated on brand + part number: a family whose 30 sizes all cross to
 * one series states that series once, and a size with no stated equivalent
 * contributes nothing rather than an invented one.
 */
function equivalentPartNumbers(variants: ProductLdInput['variants']): JsonLd[] {
  if (!variants || variants.length === 0) return []
  const seen = new Set<string>()
  const out: JsonLd[] = []
  for (const v of variants) {
    const brand = v.equivalentBrand?.trim()
    const mpn = v.equivalentMpn?.trim()
    if (!brand || !mpn) continue
    const key = `${brand.toLowerCase()}\u0000${mpn.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      '@type': 'PropertyValue',
      name: `${brand} equivalent part number`,
      value: mpn,
    })
  }
  return out
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
  if (input.about) base.about = input.about
  return mergeJsonLd(base, input.override)
}

/**
 * A Brand node, for nesting (no `@context`).
 *
 * A brand page on this site is a collection of the parts we stock under that
 * brand. It is not the brand's own entity — emitting `Organization` with our
 * URL as its `url` told crawlers that Parker is an organisation living at
 * indushydraulics.com/brands/parker.
 */
export function buildBrandLd(input: BrandLdInput): JsonLd {
  const node: JsonLd = { '@type': 'Brand', name: input.name }
  if (input.logoUrl) node.logo = input.logoUrl
  return node
}

function personLd(p: ArticlePersonLd): JsonLd {
  const node: JsonLd = { '@type': 'Person', name: p.name }
  if (p.url) node.url = p.url
  if (p.jobTitle) node.jobTitle = p.jobTitle
  const sameAs = (p.sameAs ?? []).filter((s) => /^https?:\/\//i.test(s))
  if (sameAs.length > 0) node.sameAs = sameAs
  return node
}

/**
 * VideoObject — what makes an embedded video eligible for video results.
 * `name`, `thumbnailUrl` and `uploadDate` are the three Google requires.
 */
export function buildVideoLd(input: VideoLdInput): JsonLd {
  const uploadDate =
    input.uploadDate instanceof Date ? input.uploadDate.toISOString() : input.uploadDate
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: input.name,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate,
  }
  if (input.description) base.description = input.description
  if (input.embedUrl) base.embedUrl = input.embedUrl
  if (input.contentUrl) base.contentUrl = input.contentUrl
  if (input.duration) base.duration = input.duration
  return base
}

/**
 * ItemList — what tells a crawler an index page is an index rather than a
 * link dump.
 *
 * Entries without a `url` are emitted with their name and position only. That
 * is a real state, not a fallback: an index may legitimately list something it
 * does not yet have a page for, and inventing a URL to fill the slot would put
 * a 404 in the structured data.
 */
export function buildItemListLd(input: ItemListLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { url: item.url } : {}),
    })),
  }
  if (input.name) base.name = input.name
  return mergeJsonLd(base, input.override)
}

export function buildArticleLd(input: ArticleLdInput): JsonLd {
  const webPage: JsonLd = { '@type': 'WebPage', '@id': input.url }
  if (input.reviewer?.name) {
    webPage.reviewedBy = personLd(input.reviewer)
    if (input.reviewedAt) webPage.lastReviewed = input.reviewedAt.toISOString()
  }
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'Article',
    headline: input.headline,
    url: input.url,
    mainEntityOfPage: webPage,
    inLanguage: input.inLanguage ?? 'en',
  }
  if (input.description) base.description = input.description
  if (input.imageUrl) base.image = input.imageUrl
  if (input.articleSection) base.articleSection = input.articleSection
  const keywords = (input.keywords ?? []).map((k) => k.trim()).filter(Boolean)
  if (keywords.length > 0) base.keywords = keywords.join(', ')
  if (input.authorName) {
    base.author = personLd({
      name: input.authorName,
      url: input.authorUrl ?? null,
      jobTitle: input.authorJobTitle ?? null,
      sameAs: input.authorSameAs ?? null,
    })
  }
  if (input.publisherId || input.publisherName) {
    const pub: JsonLd = { '@type': 'Organization' }
    if (input.publisherId) pub['@id'] = input.publisherId
    if (input.publisherName) pub.name = input.publisherName
    if (input.publisherLogoUrl) {
      pub.logo = { '@type': 'ImageObject', url: input.publisherLogoUrl }
    }
    base.publisher = pub
  }
  if (input.publishedAt) base.datePublished = input.publishedAt.toISOString()
  if (input.modifiedAt) base.dateModified = input.modifiedAt.toISOString()
  return mergeJsonLd(base, input.override)
}

/** A place a service covers, when the schema.org type is not the default. */
export type AreaServed = { name: string; type: 'AdministrativeArea' | 'Country' }

export type ServiceLdInput = {
  name: string
  description?: string | null
  url: string
  /**
   * Places the service covers.
   *
   * A plain string is emitted as `AdministrativeArea`, which is correct for
   * an emirate or a region and is what every existing caller passes. Pass
   * `{ name, type: 'Country' }` for a sovereign state — `AdministrativeArea`
   * is a subdivision, so using it for Saudi Arabia is simply the wrong type.
   */
  areaServed: (string | AreaServed)[]
  /** @id of the providing Organization, so the Service hangs off the real entity. */
  providerId: string
  providerName: string
  /** e.g. "Hydraulic hose assembly and repair". */
  serviceType?: string | null
  override?: unknown
}

/**
 * Service with areaServed.
 *
 * Deliberately NOT LocalBusiness. A coverage area is somewhere we send people,
 * not somewhere we have premises, and emitting LocalBusiness for an address
 * that does not exist risks the site being penalised for false business
 * presence — see the warning in apps/web/src/lib/site-locations.ts. The
 * provider reference points at the one real Organization node instead.
 */
export function buildServiceLd(input: ServiceLdInput): JsonLd {
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    url: input.url,
    ...(input.description ? { description: input.description } : {}),
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
    provider: {
      '@type': 'Organization',
      '@id': input.providerId,
      name: input.providerName,
    },
    areaServed: input.areaServed.map((a) =>
      typeof a === 'string'
        ? { '@type': 'AdministrativeArea', name: a }
        : { '@type': a.type, name: a.name },
    ),
  }
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
