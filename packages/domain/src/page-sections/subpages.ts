import { area, eyebrow, text } from './fields'
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
export type SubPageKind = 'market'

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
    // Every kind in SUBPAGE_KINDS has a case; the switch is exhaustive and the
    // type checker enforces it as kinds are added.
    default: {
      const exhaustive: never = kind
      throw new Error(`Unknown sub-page kind: ${String(exhaustive)}`)
    }
  }
}
