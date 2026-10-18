import { mergeJsonLd, type JsonLd } from '../seo/jsonld'

/**
 * JSON-LD for a `/replacement/<brand>/<mpn>` page. We emit a
 * `CollectionPage` whose `mainEntity` is an `ItemList` of plain `ListItem`
 * links back to the canonical PDP URLs — Google's "summary page" list shape.
 *
 * Deliberately NOT Product nodes. The PDP emits the full Product, and
 *   1. duplicating it here would invite Google to pick the wrong canonical
 *      and split authority, and
 *   2. a Product stub is validated as a product in its own right. These used
 *      to carry an Offer with no price and a hard-coded `InStock` — an invalid
 *      item in the Product snippets report for every match, and an
 *      availability claim that could contradict the PDP it pointed at.
 *
 * Each ListItem carries `url`, `name` and a human-readable compatibility note.
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
          '@type': 'ListItem',
          position: i + 1,
          url: m.productUrl,
          name: m.productName,
          description: `${COMPATIBILITY_LABEL[m.compatibility]} for ${input.competitorBrand} ${input.competitorMpn}.`,
        }
        if (m.imageUrl) item.image = m.imageUrl
        return item
      }),
    },
  }
  return mergeJsonLd(base, input.override)
}
