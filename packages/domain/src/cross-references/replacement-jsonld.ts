import { mergeJsonLd, type JsonLd } from '../seo/jsonld'

/**
 * JSON-LD for a `/replacement/<brand>/<mpn>` page. We emit a
 * `CollectionPage` whose `mainEntity` is an `ItemList` of `Product`
 * stub references back to the canonical PDP URLs — we deliberately
 * do NOT duplicate the full Product schema here, because
 *   1. the PDP itself emits the full Product JSON-LD, and
 *   2. duplicating it on the replacement page would invite Google to
 *      pick the wrong canonical and split authority.
 *
 * The ItemList items are Schema.org `ListItem`s with `item.url`
 * pointing back to the PDP and `item.name` set to the product title.
 */

export type ReplacementMatchInput = {
  /** Canonical PDP URL of the matching product (slug-based, absolute). */
  productUrl: string
  productName: string
  /** Optional image URL for the matching product (first image). */
  imageUrl?: string | null
  /**
   * The `CrossRefCompatibility` value, surfaced as a description token
   * (e.g. "direct replacement", "compatible alternative") to give
   * crawlers a human-readable signal alongside the structured data.
   */
  compatibility: 'direct' | 'compatible' | 'superseded_by_us'
}

export type ReplacementCollectionLdInput = {
  /** Display name of the competitor brand (un-slugged), e.g. "Parker". */
  competitorBrand: string
  /** Display MPN (un-slugged), e.g. "PV16-T-1-2". */
  competitorMpn: string
  /** Absolute URL of the replacement page itself. */
  pageUrl: string
  matches: ReplacementMatchInput[]
  /** @id of the seller Organization (typically ORG_ID). */
  sellerId?: string
  override?: unknown
}

const COMPATIBILITY_LABEL: Record<ReplacementMatchInput['compatibility'], string> = {
  direct: 'Direct replacement',
  compatible: 'Compatible alternative',
  superseded_by_us: 'Indus replacement (supersedes original)',
}

export function buildReplacementCollectionLd(input: ReplacementCollectionLdInput): JsonLd {
  const headline = `Indus Hydraulics replacement for ${input.competitorBrand} ${input.competitorMpn}`
  const base: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: headline,
    url: input.pageUrl,
    description:
      input.matches.length === 1
        ? `Indus Hydraulics offers a verified equivalent for ${input.competitorBrand} ${input.competitorMpn}.`
        : `Indus Hydraulics offers ${input.matches.length} verified equivalents for ${input.competitorBrand} ${input.competitorMpn}.`,
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: input.matches.length,
      itemListElement: input.matches.map((m, i) => {
        const item: JsonLd = {
          '@type': 'Product',
          name: m.productName,
          url: m.productUrl,
          description: `${COMPATIBILITY_LABEL[m.compatibility]} for ${input.competitorBrand} ${input.competitorMpn}.`,
        }
        if (m.imageUrl) item.image = m.imageUrl
        if (input.sellerId) {
          item.offers = {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', '@id': input.sellerId },
            url: m.productUrl,
          }
        }
        return {
          '@type': 'ListItem',
          position: i + 1,
          item,
        }
      }),
    },
  }
  return mergeJsonLd(base, input.override)
}
