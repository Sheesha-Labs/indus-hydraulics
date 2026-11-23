import { area, cardList, choice, eyebrow, faqList, image, select, text } from './fields'
import type { ListFieldDef, MasterPageDef, SectionDef, SimpleFieldDef } from './types'

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
export type SubPageKind = 'market' | 'brand' | 'category' | 'location'

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
    kind: 'location',
    label: 'Service areas',
    publicPath: '/locations',
    adminPath: '/admin/pages/sub/location',
    description:
      'One page per UAE area we service on site, built from a shared template. The area’s facts — its map position, zones, related ranges and articles — are in code; everything a reader reads can be overridden here, and the services, zone notes, recent work and FAQ bands stay hidden until someone writes them. Never describe an area as a branch or office: there is one premises, in Dubai.',
    itemLabel: 'area page',
  },
  {
    kind: 'category',
    label: 'Catalogue categories',
    publicPath: '/c',
    adminPath: '/admin/pages/sub/category',
    description:
      'One shelf page per catalogue category. The product grid, the filters and the sub-category chips build themselves; these bands are the words around them — what the range covers, how to choose, the standards it is built to, and where it ships. Bands placed above the product listing show as one row of compact cards (opening lines plus “Read more”) so the products start on the first screen; bands placed below it show in full.',
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
  extra: Partial<SimpleFieldDef> = {}
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

/**
 * Market copy lists. Each is an OVERRIDE of the matching array in the market
 * record (`market-page-records*.ts`), and like every sub-page override it is
 * read only when complete: a list with the wrong number of rows, or any row
 * missing a field, is ignored and the record's own list renders. That is what
 * lets the admin hold a half-edited list without breaking a live page — and it
 * is why the counts are stated in each help line. See `applyMarketCopy`.
 */
const marketList = (
  key: string,
  label: string,
  itemLabel: string,
  max: number,
  help: string,
  fields: ListFieldDef['fields']
): ListFieldDef => ({ key, label, kind: 'list', itemLabel, max, help, fields })

/** The six sector slugs a market card can link to — each is an `Industry.slug`. */
export const MARKET_SECTOR_OPTIONS = [
  { value: 'oil-gas', label: 'Oil & gas' },
  { value: 'marine', label: 'Marine' },
  { value: 'power', label: 'Power' },
  { value: 'construction', label: 'Construction' },
  { value: 'steel', label: 'Steel' },
  { value: 'mining', label: 'Mining' },
] as const

export const MARKET_SECTIONS: readonly SectionDef[] = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'Headline, lede, the four facts and the lane map.',
    locked: true,
    dataNote:
      'Blank fields keep the market record. The map geometry always comes from the record. Use {market} in a heading for the country name. The meta title and description are what Google and AI answer engines show for this country page.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Headline'),
      overrideBody('lede', 'Lede'),
      marketList(
        'facts',
        'The four facts',
        'fact',
        4,
        'Exactly four rows — Typical transit, Freight, Incoterms 2020, Documentation — or the record\u2019s four render.',
        [text('label', 'Label', { max: 40 }), text('value', 'Value', { max: 300 })]
      ),
      override('primary_cta_label', 'Quote button label', { max: 60 }),
      override('whatsapp_cta_label', 'WhatsApp button label', { max: 60 }),
      override('meta_title', 'Meta title', { max: 70 }),
      text('meta_description', 'Meta description', {
        max: 170,
        optional: true,
        help: 'Blank keeps the market summary. Aim for 140–160 characters naming the country and what we supply.',
      }),
    ],
    defaults: {
      eyebrow: null,
      heading: null,
      lede: null,
      primary_cta_label: null,
      whatsapp_cta_label: null,
      meta_title: null,
      meta_description: null,
    },
  },
  {
    key: 'manifest',
    label: 'Manifest strip',
    description: 'The navy band of six facts under the hero.',
    dataNote: 'Blank keeps the six pairs in the market record.',
    fields: [
      marketList(
        'items',
        'Six facts',
        'fact',
        6,
        'Exactly six rows, or the record\u2019s six render.',
        [text('label', 'Label', { max: 40 }), text('value', 'Value', { max: 80 })]
      ),
    ],
    defaults: {},
  },
  structural(
    'operations',
    'Operations band',
    'The four captioned photographs of the Dubai facility.',
    'The captions are shared by every market; only the fourth names the destination.'
  ),
  structural(
    'catalogue',
    'Catalogue index',
    'What we supply, by cluster.',
    'The clusters are the live catalogue.'
  ),
  structural(
    'quote_form',
    'Quote form (mid page)',
    'The lead form in the middle of the page.',
    'Its fields, currency and delivery cities come from the market record. Switching it off moves the hero button to the closing form.'
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
    dataNote:
      'Blank keeps the market record. Keep transit as \u201cN\u2013M days\u201d or \u201cN days\u201d: the comparison bars read the last number in it.',
    fields: [
      overrideEyebrow('eyebrow', 'Left eyebrow'),
      override('heading', 'Left heading'),
      marketList(
        'modes',
        'Freight modes',
        'mode',
        3,
        'Exactly three, fastest realistic first, or the record\u2019s three render.',
        [
          text('name', 'Mode', { max: 60 }),
          text('transit', 'Transit', { max: 30 }),
          text('route', 'Route', { max: 120 }),
          text('useCase', 'Use case', { max: 200 }),
        ]
      ),
      overrideEyebrow('sequence_eyebrow', 'Right eyebrow'),
      override('sequence_heading', 'Right heading'),
      override('order_step_3', 'Order step 3', { max: 300 }),
      override('order_step_4', 'Order step 4', { max: 300 }),
    ],
    defaults: {
      eyebrow: null,
      heading: null,
      sequence_eyebrow: null,
      sequence_heading: null,
      order_step_3: null,
      order_step_4: null,
    },
  },
  {
    key: 'sectors',
    label: 'Industries and brands',
    description: 'The six sectors this market buys for, and the brands we stock.',
    dataNote:
      'Blank keeps the six sectors in the market record; the brands are the live catalogue.',
    fields: [
      marketList(
        'items',
        'Six sectors',
        'sector',
        6,
        'Exactly six, most relevant to this market first, each a different industry — or the record\u2019s six render.',
        [
          choice('slug', 'Industry', MARKET_SECTOR_OPTIONS),
          text('name', 'Name', { max: 40 }),
          text('description', 'What it buys here', { max: 400 }),
        ]
      ),
    ],
    defaults: {},
  },
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
      'Blank keeps the market record\u2019s questions. Published to Google as FAQ structured data, so the schema follows this section being switched on or off. Write real questions a buyer in this country asks; at least six.',
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading'), faqList(16)],
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
    'Each cell renders only when the brand record carries that figure, so a brand with none shows no strip at all.'
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
    'The cases come from the brand record. The band hides itself when a brand has none.'
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
    key: 'faq',
    label: 'FAQ',
    description: 'Questions buyers ask about this brand.',
    dataNote:
      'Published to Google as FAQ structured data, so the markup follows this section being switched on or off. An empty list hides the band. Answer what a buyer of this make actually asks — interchange, documentation, lead time — never marketing phrased as a question.',
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading'), faqList(8)],
    defaults: { eyebrow: null, heading: null },
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
    'The chips are this category’s published children.'
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
    'Read live from the product size tables. The band hides itself where no product on the shelf has one.'
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
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading'), faqList(8)],
    defaults: { eyebrow: null, heading: null, items: [] },
  },
  structural(
    'reading',
    'Written about this range',
    'Links to the articles that cover this shelf.',
    'The articles are chosen by the blog’s own linking. The band hides itself when there are none.'
  ),
]

// ── the service-area (location) template ─────────────────────────────────

/**
 * A `/locations/<slug>` page — a UAE area we service on site.
 *
 * Same override discipline as the other sub-pages, with one addition: the
 * bands that make a location page worth reading (services, zone notes, the
 * equipment here, recent work, the FAQ) are WRITTEN per area, and until they
 * are written they either render the area record's own facts or nothing at
 * all. A generated paragraph with the emirate's name swapped in is the doorway
 * pattern; an unwritten band is invisible instead.
 *
 * Two claims are policed by tests on the copy (`service-areas.test.ts`,
 * `location-sections.test.ts`): no branch or office anywhere but Dubai, and no
 * response or arrival time anywhere at all.
 */
export const LOCATION_INDUSTRY_OPTIONS = [
  { value: 'oil-gas', label: 'Oil & gas' },
  { value: 'marine', label: 'Marine & offshore' },
  { value: 'power', label: 'Power & energy' },
  { value: 'construction', label: 'Construction' },
  { value: 'steel', label: 'Steel & metals' },
  { value: 'mining', label: 'Mining & quarrying' },
  { value: 'lng-future-fuels', label: 'LNG & future fuels' },
] as const

export const LOCATION_SECTIONS: readonly SectionDef[] = [
  {
    key: 'hero',
    label: 'Hero',
    description: 'Headline, opening paragraph, the area facts, the photograph and the UAE map.',
    locked: true,
    dataNote:
      'Blank fields keep the area record. The map, the distance from the hose bay and the zone count always come from the record. Use {area} for the area name. The meta title is shown with " | Indus Hydraulics" appended, so keep it to about 42 characters.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Headline'),
      overrideBody('intro', 'Opening paragraph'),
      image(
        'image',
        'Photograph',
        'A real photograph of work in this area if we have one; otherwise a representative scene, captioned as such. Alt text describes what the picture shows.'
      ),
      override('image_caption', 'Photograph caption', {
        max: 160,
        help: 'Why the picture is there, for the reader. Never provenance.',
      }),
      override('meta_title', 'Meta title', { max: 70 }),
      text('meta_description', 'Meta description', {
        max: 170,
        optional: true,
        help: 'Blank keeps the area summary. Aim for 140–160 characters naming the area, its zones and what we do on site.',
      }),
    ],
    defaults: {
      eyebrow: null,
      heading: null,
      intro: null,
      // No `image` key: an absent image default resolves to the empty picker,
      // and a stored `{ mediaId: null }` would read as a shipped value.
      image_caption: null,
      meta_title: null,
      meta_description: null,
    },
  },
  {
    key: 'options',
    label: 'Bay or on site',
    description: 'The three ways to get an assembly made, and when each makes sense here.',
    dataNote:
      'Blank keeps the built-in three. Write exactly three cards to replace them; fewer and the built-in three render.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
      cardList('items', 'The three options', { itemLabel: 'option', max: 3, descMax: 420 }),
    ],
    defaults: { eyebrow: null, heading: null, body: null, items: [] },
  },
  {
    key: 'services',
    label: 'Services in this area',
    description: 'What we actually do on site here, each linked to the page that explains it.',
    dataNote:
      'Blank keeps the three core services every area gets (assembly at the machine, replacement assemblies built in the bay, whole-machine refit and tagging). Add a card ONLY for a service we genuinely deliver in this area.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
      cardList('items', 'Services', { itemLabel: 'service', max: 8, descMax: 420, withLink: true }),
    ],
    defaults: { eyebrow: null, heading: null, body: null, items: [] },
  },
  {
    key: 'zones',
    label: 'Zones we cover',
    description: 'The industrial zones in this area, with a note on what runs in each.',
    dataNote:
      'Blank keeps the zone names from the area record as a row of chips. Write one card per zone to replace them with notes — what is there and what equipment runs — 60 to 90 words each.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
      cardList('items', 'Zones', { itemLabel: 'zone', max: 12, descMax: 600 }),
    ],
    defaults: { eyebrow: null, heading: null, body: null, items: [] },
  },
  {
    key: 'industries',
    label: 'Industries and equipment',
    description: 'The fleets and plant that dominate this area, and the hose they run.',
    dataNote:
      'Blank keeps the area record: its demand list beside photo cards for its industries. Write cards to describe the equipment and the hose grades and fittings it usually needs; each card can link to an industry page.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
      {
        key: 'items',
        label: 'Equipment cards',
        kind: 'list',
        itemLabel: 'card',
        max: 8,
        fields: [
          text('name', 'Title', { max: 120 }),
          area('desc', 'Description', { max: 600, optional: false }),
          choice('industry', 'Industry page', LOCATION_INDUSTRY_OPTIONS, {
            placeholder: 'No industry link',
          }),
        ],
      },
    ],
    defaults: { eyebrow: null, heading: null, body: null, items: [] },
  },
  {
    key: 'access',
    label: 'Access and permits',
    description: 'What governs a visit here — the honest constraint — and a checklist.',
    dataNote:
      'Blank keeps the constraint from the area record. The checklist is one item per line. Never write an arrival or response time.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
      area('checklist', 'Checklist (one per line)', { max: 900, optional: true, help: BLANK }),
    ],
    defaults: { eyebrow: null, heading: null, body: null, checklist: null },
  },
  {
    key: 'prepare',
    label: 'What to have ready',
    description: 'What to tell us before anyone travels, and how to measure an assembly.',
    dataNote: 'Blank keeps the built-in four items. One item per line.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      overrideBody('body', 'Body'),
      area('checklist', 'Items (one per line)', { max: 900, optional: true, help: BLANK }),
    ],
    defaults: { eyebrow: null, heading: null, body: null, checklist: null },
  },
  {
    key: 'ranges',
    label: 'Stocked ranges',
    description: 'Catalogue ranges most often needed here, with live product counts.',
    dataNote:
      'Blank keeps the ranges listed on the area record. Pick categories to replace them; the cards, images and counts come from the catalogue.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      {
        key: 'items',
        label: 'Ranges',
        kind: 'list',
        itemLabel: 'range',
        max: 10,
        fields: [select('category', 'Category', 'categories')],
      },
    ],
    defaults: { eyebrow: null, heading: null, items: [] },
  },
  {
    key: 'work',
    label: 'Recent work here',
    description: 'Real jobs in this area, linked to their write-ups.',
    dataNote:
      'Hidden until someone writes it. Only real jobs — a service case, a delivered project. Never a composite or an illustration presented as a job.',
    fields: [
      overrideEyebrow('eyebrow', 'Eyebrow'),
      override('heading', 'Heading'),
      cardList('items', 'Jobs', {
        itemLabel: 'job',
        max: 6,
        descMax: 420,
        withLink: true,
        withTag: 'Date or site',
      }),
    ],
    defaults: { eyebrow: null, heading: null, items: [] },
  },
  {
    key: 'faq',
    label: 'FAQ',
    description: 'Questions buyers in this area actually ask.',
    dataNote:
      'Published to Google as FAQ structured data, so the markup follows this section being switched on or off. An empty list hides the band. Facts only: no arrival times, no approvals or certifications we do not hold.',
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading'), faqList(12)],
    defaults: { eyebrow: null, heading: null, items: [] },
  },
  {
    key: 'reading',
    label: 'Guides',
    description: 'Articles worth reading before you call.',
    dataNote: 'The articles are the ones listed on the area record.',
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading')],
    defaults: { eyebrow: null, heading: null },
  },
  {
    key: 'lead',
    label: 'Closing call to action',
    description: 'The lead-capture panel at the foot of the page.',
    dataNote:
      'The WhatsApp and email links build from System · Settings, and each opener is pre-framed with the area name.',
    fields: [override('heading', 'Heading'), overrideBody('body', 'Body')],
    defaults: { heading: null, body: null },
  },
  {
    key: 'nearby',
    label: 'Other areas',
    description: 'Links to the nearest areas, then to every other.',
    fields: [overrideEyebrow('eyebrow', 'Eyebrow'), override('heading', 'Heading')],
    defaults: { eyebrow: null, heading: null },
  },
]

/** The definition for one service area's page. */
export function locationPageDef(record: { name: string; slug: string }): MasterPageDef {
  return {
    key: record.slug,
    label: record.name,
    path: `/locations/${record.slug}`,
    description: `The on-site service page for ${record.name}.`,
    sections: [...LOCATION_SECTIONS],
  }
}

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
  record: { name: string; slug: string }
): MasterPageDef {
  switch (kind) {
    case 'market':
      return marketPageDef(record)
    case 'brand':
      return brandPageDef(record)
    case 'category':
      return categoryPageDef(record)
    case 'location':
      return locationPageDef(record)
    // Every kind in SUBPAGE_KINDS has a case; the switch is exhaustive and the
    // type checker enforces it as kinds are added.
    default: {
      const exhaustive: never = kind
      throw new Error(`Unknown sub-page kind: ${String(exhaustive)}`)
    }
  }
}
