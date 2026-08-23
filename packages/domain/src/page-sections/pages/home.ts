import {
  area,
  body,
  cardList,
  ctaPair,
  eyebrow,
  heading,
  image,
  statList,
  text,
} from '../fields'
import type { MasterPageDef } from '../types'

/**
 * The home page, section by section.
 *
 * Every default here is the copy the page shipped with, verbatim. `{skus}`,
 * `{brands}`, `{years}` and `{categories}` are live-figure tokens — see
 * `../tokens.ts`.
 */
export const HOME_PAGE: MasterPageDef = {
  key: 'home',
  label: 'Home',
  path: '/',
  description: 'The front page.',
  sections: [
    {
      key: 'hero',
      label: 'Hero',
      description: 'Headline, standfirst, search bar and the four figures beneath it.',
      locked: true,
      dataNote:
        'The first headline line is chosen from the visitor’s country and the rotating term below it comes from the catalogue’s six lead categories. The SKU and brand figures are live counts.',
      fields: [
        eyebrow(),
        text('lead_override', 'Headline override', {
          max: 120,
          optional: true,
          help: 'Blank keeps the country-aware headline ("The Gulf’s premier…").',
        }),
        body({ max: 400, help: 'Use {skusFloor} and {brands} for the live figures.' }),
        text('search_placeholder', 'Search box placeholder', { max: 80 }),
        text('search_button', 'Search button label', { max: 30 }),
        statList(4, 'Figures under the search bar'),
      ],
      defaults: {
        eyebrow: 'EST. 2003 — DUBAI · UNITED ARAB EMIRATES',
        lead_override: null,
        body: '{skusFloor}+ SKUs across pumps, cylinders, valves and consumables — from {brands} specialist brands. ISO-certified, datasheet-backed, shipped from our Dubai HQ across the GCC.',
        search_placeholder: 'Search by SKU, spec or part number…',
        search_button: 'Search',
        stats: [
          { value: '{skus}', label: 'SKUS IN STOCK' },
          { value: '{brands}', label: 'PARTNER BRANDS' },
          { value: '47', label: 'COUNTRIES SERVED' },
          { value: '{years} yrs', label: 'IN BUSINESS' },
        ],
      },
    },
    {
      key: 'usp',
      label: 'Promise strip',
      description: 'The navy band of four promises directly under the hero.',
      fields: [
        cardList('items', 'Promises', { itemLabel: 'promise', max: 6, descMax: 200 }),
      ],
      defaults: {
        items: [
          { enabled: true, name: 'Same-day dispatch', desc: 'Stock orders before 14:00 GST ship same day from our Dubai HQ.' },
          { enabled: true, name: 'Engineering support', desc: 'Speak to a real applications engineer — not a call centre.' },
          { enabled: true, name: 'Datasheets & CAD', desc: 'Every SKU ships with a PDF datasheet and downloadable 3D model.' },
          { enabled: true, name: 'Backed by warranty', desc: '24-month manufacturer warranty across the entire catalogue.' },
        ],
      },
    },
    {
      key: 'categories',
      label: 'Category grid',
      description: 'The six top-level catalogue groups, lead card first.',
      dataNote:
        'The cards themselves are the published top-level categories, in the order set under Catalogue · Categories. Their names, blurbs and images are edited there.',
      fields: [
        eyebrow({ help: 'Use {categories} for the live group count.' }),
        heading(),
        text('featured_label', 'Lead card eyebrow', { max: 60, optional: true }),
        ...ctaPair('', 'Link label'),
      ],
      defaults: {
        eyebrow: 'SHOP BY CATEGORY · {categories} GROUPS',
        heading: 'The full catalogue, organised the way engineers think.',
        featured_label: 'FEATURED CATEGORY',
        cta_label: 'Browse all categories →',
        cta_href: '/c',
      },
    },
    {
      key: 'brands',
      label: 'Brand rail',
      description: 'The grid of partner brand names.',
      dataNote: 'The tiles are the published brands, alphabetically, first twelve.',
      fields: [
        eyebrow({ help: 'Use {brands} for the live count.' }),
        heading(),
        ...ctaPair('', 'Link label'),
      ],
      defaults: {
        eyebrow: 'PARTNER BRANDS · {brands}',
        heading: 'Authorised distributor for the names engineers trust.',
        cta_label: 'View brand index →',
        cta_href: '/brands',
      },
    },
    {
      key: 'featured_products',
      label: 'Featured products',
      description: 'Four recently added products.',
      dataNote: 'The four cards are the most recently created active products.',
      fields: [eyebrow(), heading(), ...ctaPair('', 'Link label')],
      defaults: {
        eyebrow: 'FEATURED · UPDATED WEEKLY',
        heading: 'New & in-stock this week.',
        cta_label: 'View all products →',
        cta_href: '/c',
      },
    },
    {
      key: 'industries',
      label: 'Industries strip',
      description: 'The row of industries served.',
      dataNote: 'The tiles are the published industries, in the order set under Catalogue · Industries.',
      fields: [eyebrow(), heading()],
      defaults: {
        eyebrow: 'INDUSTRIES SERVED',
        heading: 'Built for the world’s most demanding workshops.',
      },
    },
    {
      key: 'why',
      label: 'Why Indus',
      description: 'Four reasons, and the customer quote panel beside them.',
      fields: [
        eyebrow(),
        heading(),
        cardList('items', 'Reasons', { itemLabel: 'reason', max: 6, descMax: 240 }),
        text('quote_eyebrow', 'Quote eyebrow', { max: 60, optional: true }),
        area('quote', 'Quote', { max: 400, optional: false }),
        text('quote_name', 'Attributed to', { max: 80, optional: true }),
        text('quote_title', 'Their role', { max: 80, optional: true }),
        image('quote_image', 'Quote panel image', 'Sits behind the quote. Blank keeps the plain navy panel.'),
      ],
      defaults: {
        eyebrow: 'WHY INDUS · A FEW REASONS',
        heading: 'We’re a parts supplier that thinks like an engineering desk.',
        items: [
          { enabled: true, name: 'Specialists, not generalists', desc: 'We carry only hydraulic components — no PPE, no fasteners. Depth over breadth.' },
          { enabled: true, name: 'Genuine parts, traceable', desc: 'Every SKU comes with origin certificate and batch traceability. No counterfeits.' },
          { enabled: true, name: 'Stock you can count on', desc: 'Live inventory on the site is real. If it says "in stock", it ships today.' },
          { enabled: true, name: 'Application help, free', desc: 'Send us a circuit, a failure photo or a bare SKU — our engineers respond same business day.' },
        ],
        quote_eyebrow: 'CUSTOMER · MARINE',
        quote: 'Indus delivered a 6-week-lead Atos servo valve in 4 days. We didn’t lose a single shift.',
        quote_name: 'Captain V. Subramaniam',
        quote_title: 'CHIEF ENGINEER · MARITIME OPS',
        quote_image: { mediaId: null, alt: null },
      },
    },
    {
      key: 'blog',
      label: 'Blog teaser',
      description: 'Three recent articles, or the empty state when nothing is published.',
      dataNote: 'The cards are the three most recently published articles.',
      fields: [
        eyebrow(),
        heading(),
        ...ctaPair('', 'Link label'),
        text('empty_message', 'Empty-state message', { max: 160, optional: true }),
        text('empty_cta_label', 'Empty-state button', { max: 60, optional: true }),
      ],
      defaults: {
        eyebrow: 'FROM THE WORKSHOP · BLOG',
        heading: 'Field notes, sizing guides and component teardowns.',
        cta_label: 'Read the blog →',
        cta_href: '/blog',
        empty_message: 'Field notes and sizing guides are on the way.',
        empty_cta_label: 'Visit the blog →',
      },
    },
    {
      key: 'newsletter',
      label: 'Newsletter band',
      description: 'The blue sign-up band at the foot of the page.',
      fields: [eyebrow(), heading(), body({ max: 320 })],
      defaults: {
        eyebrow: 'NEWSLETTER · 2× A MONTH',
        heading: 'Catalog drops, sizing notes, and stock alerts — straight to your inbox.',
        body: '4,200+ engineers, plant managers and procurement leads read it. No marketing fluff, no spam.',
      },
    },
  ],
}
