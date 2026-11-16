import type { BlogArticleSeed } from '../shared'

/**
 * Boiler pressure parts. Sources: approved enquiry-page facts for IH-TF-BP-MWW, -SHR, -HDR, -CFN, -PVH
 * (codes ASME I / VIII, EN 12952 / 12953 / 13445; materials; services) and the "how we build" copy.
 * No TEMA or code paragraph numbers beyond the listings' standards field.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'boiler-pressure-parts-headers-superheaters',
  title: 'Boiler pressure parts: headers, superheater coils and membrane walls',
  excerpt:
    'The tubes and headers that carry water and steam through a boiler or HRSG are made to drawing and to a pressure code. What each part does, which grades step up through the boiler, which codes apply, and what to send for a quotation.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Boiler Pressure Parts: Headers and Coils',
  seoDescription:
    'Boiler pressure parts explained: membrane water walls, superheater and reheater coils, headers, furnaces and heads, codes, grades and what to send.',
  focusKeyword: 'boiler pressure parts',
  publishedAt: '2026-11-16T10:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Membrane walls form gas-tight furnace walls from tubes joined by welded bars.',
        'Superheater and reheater grades step up with metal temperature: carbon steel, then T11, T22, T91, then stainless.',
        'Headers are heavy-wall A106 or A335 pipe with stubs, nozzles and handholes, heat treated and examined to code.',
        'Codes: ASME Section I for power boilers, Section VIII for vessels, or EN 12952, 12953 and 13445 under PED.',
        'Send the drawing, code, design conditions, grades, NDE and inspection requirements.',
      ],
    },
    {
      type: 'lead',
      html: 'A boiler or HRSG is, at heart, a large assembly of tubes and headers that carry water and steam past the hot gas. Those pressure parts wear out — through creep, erosion, corrosion or overheating — and are replaced as panels, coils and headers built to the original drawing and code.',
    },
    {
      type: 'direct_answer',
      question: 'What are boiler pressure parts?',
      answer:
        'The pressure-retaining parts of a boiler: membrane water-wall panels, economiser, evaporator, superheater and reheater coils, headers, drums, furnaces and heads. They are made to drawing under a pressure code — ASME Section I for power boilers, or EN 12952 and 12953 — from certified tube, pipe and plate, with code welding, NDE, heat treatment and hydrotest.',
    },

    { type: 'section_head', number: '/01', title: 'Membrane water walls.', anchor: 'walls' },
    {
      type: 'paragraph',
      html: '<a href="/p/membrane-water-walls">Membrane panels</a> carry water or steam in the tubes, with flat membrane bars welded between them to close the gaps, so the furnace is gas-tight without a separate casing. Tubes are A210, A192 or A213; bars are SA-36 or A387 to match. Panels are shop-built in sections with bends and openings for burners, sootblowers and doors, then hydrotested.',
    },

    { type: 'section_head', number: '/02', title: 'Superheaters and reheaters.', anchor: 'superheaters' },
    {
      type: 'paragraph',
      html: '<a href="/p/superheaters-and-reheaters">Superheaters and reheaters</a> run at the highest metal temperatures in the boiler, so the tube grade steps up along the coil: carbon steel at the cool end, then chrome-moly T11, T22 and T91, and stainless where the metal is hottest. The grades are compared in <a href="/blog/a179-vs-a192-vs-a210-vs-a213">A179 vs A192 vs A210 vs A213</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Headers.', anchor: 'headers' },
    {
      type: 'paragraph',
      html: '<a href="/p/boiler-headers">Headers</a> collect and distribute water and steam between panels, coils and drums. They are heavy-wall A106 or A335 (P22 and others) pipe with stub tubes, nozzles, end caps and handholes welded on, then heat treated and examined to code — so the welding and NDE plan matters as much as the material.',
    },

    { type: 'section_head', number: '/04', title: 'Furnaces and heads.', anchor: 'furnaces' },
    {
      type: 'paragraph',
      html: 'Fire-tube (shell) boilers use <a href="/p/corrugated-furnaces">corrugated furnaces</a> to ASME Section I or EN 12953-3, and vessels and exchanger channels use <a href="/p/pressure-vessel-heads">formed heads</a> to ASME VIII, DIN 28011/28013 or EN 13445-3.',
    },

    { type: 'section_head', number: '/05', title: 'What to send.', anchor: 'send' },
    {
      type: 'prose',
      html: '<ul><li>Drawing, or the dimensions and arrangement.</li><li>Design code (ASME Section I or VIII, EN 12952, EN 12953, EN 13445).</li><li>Design pressure and temperature.</li><li>Material grades for tubes, plates, forgings and fittings.</li><li>NDE, heat treatment and hydrotest requirements.</li><li>Third-party inspection and the certificate the authority needs.</li><li>Quantity and delivery point.</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which code covers boiler pressure parts?', answer: 'ASME Section I for power boilers, or EN 12952 (water-tube) and EN 12953 (shell boilers) under PED.' },
        { question: 'Why do superheater tubes change grade along the coil?', answer: 'Metal temperature rises along the coil, so higher-alloy grades are used where creep and oxidation demand them.' },
        { question: 'Are replacement panels hydrotested?', answer: 'Yes, to the code and the inspection and test plan, before shipping.' },
        { question: 'Can you build to an old drawing?', answer: 'Yes, with the original grades translated to current standards where needed and the substitution confirmed with the owner.' },
        { question: 'Is third-party inspection available?', answer: 'Yes, arranged with the order, with the documents the inspecting authority needs.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Pressure parts in the catalogue',
      skus: ['IH-TF-BP-MWW', 'IH-TF-BP-SHR', 'IH-TF-BP-HDR', 'IH-TF-BP-CFN', 'IH-TF-BP-PVH'],
    },
    { type: 'category_link', slug: 'boiler-pressure-parts', label: 'Boiler pressure parts', blurb: 'Panels, coils, headers, furnaces and heads made to drawing and code.' },
    {
      type: 'related_articles',
      slugs: ['a179-vs-a192-vs-a210-vs-a213', 'din-17175-din-1629-en-10216-equivalents', 'en-10204-3-1-mill-test-certificate'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Codes and materials from our listings; the design code and drawing govern each part.',
    },
    {
      type: 'cta_block',
      heading: 'Boiler outage coming up?',
      body: 'Send the drawing and code. We quote pressure parts with the inspection and documents you need.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
