import { area, eyebrow, faqList, text } from './fields'
import type { MasterPageDef, SectionDef, SimpleFieldDef } from './types'

/**
 * Sub-pages: templated pages that exist once per record rather than once per
 * route — an export-market landing, a brand page.
 *
 * They reuse the master-page machinery wholesale — same section documents,
 * same resolve/validate, same `page_content` storage — with one difference in
 * how the fields behave:
 *
 * **Copy fields on a sub-page are OVERRIDES, not defaults.** Left blank, the
 * section renders whatever the template builds from the record (usually the
 * country's own name, its lane, its figures). That is what keeps a hundred
 * market pages from each carrying a copy of the same boilerplate, and it is
 * why every default below is `null` rather than a string.
 */

/**
 * One member per kind that is actually wired. Widening this union is what
 * makes `subPageDef`'s switch fail to compile until the new kind has a
 * template — which is the point of writing it exhaustively.
 */
export type SubPageKind = 'market' | 'brand' | 'category'

export type SubPageKindDef = {
  kind: SubPageKind
  label: string
  /** Public route the pages of this kind live under. */
  publicPath: string
  /** Admin index for this kind. */
  adminPath: string
  description: string
  /** Noun for counts — "market page". */
  itemLabel: string
}

/**
 * The kinds the admin lists. A kind appears here once its storefront template
 * actually reads its content — the same rule the master-page registry follows.
 */
export const SUBPAGE_KINDS: readonly SubPageKindDef[] = [
  {
    kind: 'market',
    label: 'Export markets',
    publicPath: '/markets',
    adminPath: '/admin/pages/sub/market',
    description:
      'One landing per export market, built from a shared template. Reorder its bands, hide the ones a market does not need, and override any heading.',
    itemLabel: 'market page',
  },
  {
    kind: 'category',
    label: 'Catalogue categories',
    publicPath: '/c',
    adminPath: '/admin/pages/sub/category',
    description:
      'One shelf page per catalogue category. The product grid, the filters and the sub-category chips build themselves; these bands are the words around them — what the range covers, how to choose, the standards it is built to, and where it ships.',
    itemLabel: 'category page',
  },
  {
    kind: 'brand',
    label: 'Brands',
    publicPath: '/brands',
    adminPath: '/admin/pages/sub/brand',
    description:
      'One page per partner brand, built from a shared template. Reorder its bands, hide the ones a brand has nothing to fill, and override any heading. The brand’s own facts — description, specialist, figures, case studies — are edited under Catalogue · Brands.',
    itemLabel: 'brand page',
  },
]

export function getSubPageKind(kind: string): SubPageKindDef | null {
  return SUBPAGE_KINDS.find((k) => k.kind === kind) ?? null
}

export function isSubPageKind(kind: string): kind is SubPageKind {
  return SUBPAGE_KINDS.some((k) => k.kind === kind)
}

/** `market/nigeria`. Shares the `page_content` table with `master/home`. */
export function subPageContentKey(kind: SubPageKind, slug: string): string {
  return `${kind}/${slug}`
}

// ── field builders for override copy ─────────────────────────────────────

const BLANK = 'Blank keeps the built-in wording.'

const override = (
  key: string,
  label: string,
  extra: Partial<SimpleFieldDef> = {},
): SimpleFieldDef => text(key, label, { max: 200, optional: true, help: BLANK, ...extra })

const overrideBody = (key: string, label: string): SimpleFieldDef =>
  area(key, label, { max: 700, optional: true, help: BLANK })

const overrideEyebrow = (key: string, label: string): SimpleFieldDef =>
  text(key, label, { max: 80, optional: true, help: BLANK })

/**
 * A band that renders inside a child component and takes no copy here. It is
 * still a section: it can be reordered and switched off, which is most of what
 * a market page needs.
 */
function structural(key: string, label: string, description: string, dataNote: string): SectionDef {
  return { key, label, description, dataNote, fields: [], defaults: {} }
}

// ── the export-market template ───────────────────────────────────────────

export const MARKET_SECTIONS: readonly SectionDef[] = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'Headline, lede, the four facts and the lane map.',
    locked: true,
    dataNote:
      'The four facts, the lede and the map geometry come from the market record. Use {market} in a heading for the country name.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Headline'),
      overrideBody('lede', 'Lede'),
      override('primary_cta_label', 'Quote button label', { max: 60 }),
      override('whatsapp_cta_label', 'WhatsApp button label', { max: 60 }),
    ],
    defaults: {
      eyebrow: null,
      heading: null,
      lede: null,
      primary_cta_label: null,
      whatsapp_cta_label: null,
    },
  },
  structural(
    'manifest',
    'Manifest strip',
    'The navy band of six facts under the hero.',
    'The six pairs come from the market record.',
  ),
  structural(
    'operations',
    'Operations band',
    'The four captioned photographs of the Dubai facility.',
    'The captions are shared by every market; only the fourth names the destination.',
  ),
  structural(
    'catalogue',
    'Catalogue index',
    'What we supply, by cluster.',
    'The clusters are the live catalogue.',
  ),
  structural(
    'quote_form',
    'Quote form (mid page)',
    'The lead form in the middle of the page.',
    'Its fields, currency and delivery cities come from the market record. Switching it off moves the hero button to the closing form.',
  ),
  {
    key: 'standards',
    label: 'Standards and tariff',
    description: 'The two-column band of conformity standards and tariff lines.',
    dataNote: 'The standards table and the tariff lines are the same for every market.',
    fields: [
      overrideEyebrow('eyebrow', 'Left eyebrow'),
      override('heading', 'Left heading'),
      overrideEyebrow('tariff_eyebrow', 'Right eyebrow'),
      override('tariff_heading', 'Right heading'),
    ],
    defaults: { eyebrow: null, heading: null, tariff_eyebrow: null, tariff_heading: null },
  },
  {
    key: 'freight',
    label: 'Freight and order sequence',
    description: 'The three freight modes and the four-step order sequence.',
    dataNote: 'The modes, transit bands and gating document come from the market record.',
    fields: [
      overrideEyebrow('eyebrow', 'Left eyebrow'),
      override('heading', 'Left heading'),
      overrideEyebrow('sequence_eyebrow', 'Right eyebrow'),
      override('sequence_heading', 'Right heading'),
    ],
    defaults: { eyebrow: null, heading: null, sequence_eyebrow: null, sequence_heading: null },
  },
  structural(
    'sectors',
    'Industries and brands',
    'The six sectors this market buys for, and the brands we stock.',
    'The six sectors come from the market record; the brands are the live catalogue.',
  ),
  {
    key: 'gazetteer',
    label: 'City gazetteer',
    description: 'The delivery cities, with coordinates.',
    dataNote: 'The cities and their coordinates come from the market record.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('intro', 'Intro'),
    ],
    defaults: { eyebrow: null, heading: null, intro: null },
  },
  {
    key: 'faq',
    label: 'FAQ',
    description: 'The market-specific questions.',
    dataNote:
      'The questions and answers come from the market record, and they are published to Google as FAQ structured data — so the schema follows this section being switched on or off.',
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading')],
    defaults: { eyebrow: null, heading: null },
  },
  {
    key: 'closing_form',
    label: 'Closing call to action',
    description: 'The navy band and the enquiry form at the foot of the page.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
    ],
    defaults: { eyebrow: null, heading: null, body: null },
  },
  {
    key: 'sitemap',
    label: 'Other markets',
    description: 'The links out to every other market page.',
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading')],
    defaults: { eyebrow: null, heading: null },
  },
]

// ── the brand template ───────────────────────────────────────────────────

export const BRAND_SECTIONS: readonly SectionDef[] = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'The navy band: name, description, badges and the specialist card.',
    locked: true,
    dataNote:
      'The name, description, country, partner badge and specialist all come from the brand record under Catalogue · Brands. Use {brand} in a heading for the brand name.',
    fields: [
      override('heading', 'Headline'),
      overrideBody('description', 'Description'),
      override('specialist_label', 'Specialist card eyebrow'),
      override('specialist_cta_label', 'Specialist card button', { max: 60 }),
    ],
    defaults: {
      heading: null,
      description: null,
      specialist_label: null,
      specialist_cta_label: null,
    },
  },
  structural(
    'stats',
    'Figures strip',
    'Lead time, largest install, partner-since.',
    'Each cell renders only when the brand record carries that figure, so a brand with none shows no strip at all.',
  ),
  {
    key: 'series',
    label: 'Product series',
    description: 'The categories this brand’s catalogue falls under.',
    dataNote: 'The cards are the categories this brand has active products in.',
    fields: [override('heading', 'Heading')],
    defaults: { heading: null },
  },
  {
    key: 'top_skus',
    label: 'Top SKUs',
    description: 'Four products, and the link to the rest.',
    dataNote: 'The cards are this brand’s active products.',
    fields: [override('heading', 'Heading'), override('cta_label', 'Link text', { max: 60 })],
    defaults: { heading: null, cta_label: null },
  },
  structural(
    'case_studies',
    'Case studies',
    'The curated installs for this brand.',
    'The cases come from the brand record. The band hides itself when a brand has none.',
  ),
  {
    key: 'resources',
    label: 'Datasheets and resources',
    description: 'Downloadable documents attached to this brand’s products.',
    dataNote: 'The documents are the ones attached to this brand’s products.',
    fields: [override('heading', 'Heading')],
    defaults: { heading: null },
  },
  {
    key: 'lead',
    label: 'Closing call to action',
    description: 'The lead-capture panel at the foot of the page.',
    dataNote:
      'The WhatsApp and email links build from the values in System · Settings, and each opener is pre-framed with the brand name.',
    fields: [override('heading', 'Heading'), overrideBody('body', 'Body')],
    defaults: { heading: null, body: null },
  },
]

// ── the catalogue-category template ──────────────────────────────────────

/**
 * A shelf page.
 *
 * Every band below the hero is OPTIONAL and hides itself when nobody has
 * written it — 195 categories inherit this template, and 86 of them hold four
 * products or fewer. A band that rendered an empty heading on those would be
 * padding, which is the doorway pattern this catalogue is deliberately not
 * following.
 *
 * The listing itself is locked. It is not a band around the page; it IS the
 * page, and a shelf with its products switched off is a 404 with a heading.
 */
export const CATEGORY_SECTIONS: readonly SectionDef[] = [
  {
    key: 'hero',
    label: 'Header',
    description: 'The category name, its opening paragraph and the SKU and brand counts.',
    locked: true,
    dataNote:
      'The name and the counts come from the catalogue. Blank copy keeps the category’s own short description, which is edited under Catalogue · Categories.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Headline'),
      overrideBody('intro', 'Opening paragraph'),
    ],
    defaults: { eyebrow: null, heading: null, intro: null },
  },
  structural(
    'children',
    'Sub-category chips',
    'The row of links to the shelves beneath this one.',
    'The chips are this category’s published children.',
  ),
  {
    key: 'guidance',
    label: 'How to choose',
    description: 'The selection question a buyer actually arrives with.',
    dataNote: 'Written per category. The band hides itself until someone writes it.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
    ],
    defaults: { eyebrow: null, heading: null, body: null },
  },
  {
    key: 'standards',
    label: 'Standards',
    description: 'The standards this range is built to, and what they require.',
    dataNote:
      'Written per category. Say only what the standard states — a specification nobody sourced is the error this catalogue has had to undo twice.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
    ],
    defaults: { eyebrow: null, heading: null, body: null },
  },
  structural(
    'sizes',
    'Size range',
    'The bore and thread range covered by the size tables on this shelf.',
    'Read live from the product size tables. The band hides itself where no product on the shelf has one.',
  ),
  {
    key: 'service',
    label: 'What we do to it',
    description: 'Cutting, crimping, testing, certifying — the work before despatch.',
    dataNote: 'Written per category. The band hides itself until someone writes it.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
    ],
    defaults: { eyebrow: null, heading: null, body: null },
  },
  {
    key: 'delivery',
    label: 'Delivery and markets',
    description: 'Stock position, and the links out to the export-market pages.',
    dataNote:
      'The stock line comes from the catalogue-wide stock position. The market links are the GCC states, and they are what makes the link between a shelf and a market page run both ways.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
    ],
    defaults: { eyebrow: null, heading: null, body: null },
  },
  {
    key: 'listing',
    label: 'Filters and products',
    description: 'The filter sidebar, the product grid and its pagination.',
    locked: true,
    dataNote: 'The live catalogue. This band is the page and cannot be switched off.',
    fields: [],
    defaults: {},
  },
  {
    key: 'faq',
    label: 'FAQ',
    description: 'Questions buyers ask about this range.',
    dataNote:
      'Published to Google as FAQ structured data, so the markup follows this section being switched on or off. Write real questions; an empty list hides the band.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      faqList(8),
    ],
    defaults: { eyebrow: null, heading: null, items: [] },
  },
  structural(
    'reading',
    'Written about this range',
    'Links to the articles that cover this shelf.',
    'The articles are chosen by the blog’s own linking. The band hides itself when there are none.',
  ),
]

/** The definition for one category's shelf page. */
export function categoryPageDef(record: { name: string; slug: string }): MasterPageDef {
  return {
    key: record.slug,
    label: record.name,
    path: `/c/${record.slug}`,
    description: `The catalogue shelf for ${record.name}.`,
    sections: [...CATEGORY_SECTIONS],
  }
}

/** The definition for one brand's page. */
export function brandPageDef(record: { name: string; slug: string }): MasterPageDef {
  return {
    key: record.slug,
    label: record.name,
    path: `/brands/${record.slug}`,
    description: `The brand page for ${record.name}.`,
    sections: [...BRAND_SECTIONS],
  }
}

/** The definition for one market's page. */
export function marketPageDef(record: { name: string; slug: string }): MasterPageDef {
  return {
    key: record.slug,
    label: record.name,
    path: `/markets/${record.slug}`,
    description: `The export-market landing for ${record.name}.`,
    sections: [...MARKET_SECTIONS],
  }
}

/** Definition for a sub-page of any kind. */
export function subPageDef(
  kind: SubPageKind,
  record: { name: string; slug: string },
): MasterPageDef {
  switch (kind) {
    case 'market':
      return marketPageDef(record)
    case 'brand':
      return brandPageDef(record)
    case 'category':
      return categoryPageDef(record)
    // Every kind in SUBPAGE_KINDS has a case; the switch is exhaustive and the
    // type checker enforces it as kinds are added.
    default: {
      const exhaustive: never = kind
      throw new Error(`Unknown sub-page kind: ${String(exhaustive)}`)
    }
  }
}
