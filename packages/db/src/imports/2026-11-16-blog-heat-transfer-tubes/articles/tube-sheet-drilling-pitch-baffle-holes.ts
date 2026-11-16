import type { BlogArticleSeed } from '../shared'

import { BAFFLE_HOLES, TS_PITCH } from '../tables'

/**
 * Tube sheets and baffles. Sources: the standard geometry tables on the live reference listings
 * IH-TF-SH-STL and IH-TF-BS-BAF (minimum pitch 1.25 × OD, square pitch with a 6.4 mm cleaning lane,
 * TEMA baffle hole sizes and over-tolerance), parsed into ./tables.ts; materials and services from the
 * tube-sheet listings. No TEMA paragraph numbers (rule D7).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'tube-sheet-drilling-pitch-baffle-holes',
  title: 'Tube sheets and baffles: drilling, pitch and hole clearances',
  excerpt:
    'Tube sheets and baffles are made to drawing, but the drawing has to respect a few TEMA limits: minimum tube pitch, cleaning lanes, baffle hole clearances and tolerances. The numbers, the materials and what to send for a replacement.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Tube Sheet Drilling, Pitch and Baffles',
  seoDescription:
    'Tube sheet and baffle drilling for shell-and-tube exchangers: minimum pitch 1.25 × OD, cleaning lanes, TEMA baffle hole sizes and materials.',
  focusKeyword: 'tube sheet drilling',
  publishedAt: '2026-11-16T10:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Minimum tube pitch is 1.25 times the tube OD.',
        'Square pitch for mechanical cleaning needs a cleaning lane of at least 6.4 mm (1/4 in) between tubes.',
        'Baffle holes are OD + 0.4 mm for long unsupported spans on tubes up to 31.8 mm, otherwise OD + 0.8 mm.',
        'Baffles and support plates are stack-drilled so holes line up through the bundle.',
        'Tube-sheet material follows the shell or channel: carbon steel or clad plate, duplex, titanium or copper alloys.',
      ],
    },
    {
      type: 'lead',
      html: 'Every shell-and-tube exchanger has a tube sheet at one or both ends and a set of baffles or support plates along the bundle. They carry no catalogue size because each is drilled to its own layout, but the layout itself is bounded by TEMA, and getting those limits right is what lets tubes go in, expand tightly and be cleaned later.',
    },
    {
      type: 'direct_answer',
      question: 'What is the minimum tube pitch in a tube sheet?',
      answer:
        '1.25 times the tube outside diameter under TEMA — for example 23.81 mm for 3/4 inch (19.05 mm) tube. Where the bundle must be cleaned mechanically on a square pitch, a cleaning lane of at least 6.4 mm (1/4 inch) between tubes is kept, which raises the minimum pitch for small tubes — 25.40 mm for 3/4 inch tube.',
    },

    { type: 'section_head', number: '/01', title: 'Tube pitch.', anchor: 'pitch' },
    {
      type: 'comparison_table',
      caption: 'Minimum pitch (mm) — from our tube-sheet listings',
      columns: ['Tube OD (in)', 'Tube OD (mm)', 'Min pitch 1.25 × OD', 'Min square pitch with 6.4 mm lane'],
      rows: TS_PITCH,
    },
    {
      type: 'paragraph',
      html: 'Triangular pitch packs more tubes into the shell and suits clean shell-side fluids; square pitch, with the cleaning lane, allows the outside of the tubes to be cleaned mechanically. The choice is made in the thermal design.',
    },

    { type: 'section_head', number: '/02', title: 'Baffle holes.', anchor: 'baffles' },
    {
      type: 'comparison_table',
      caption: 'TEMA baffle hole diameters (mm) — from our baffle listing',
      columns: ['Tube OD (in)', 'Tube OD (mm)', 'Span > 914 mm, OD ≤ 31.8 mm', 'Span ≤ 914 mm or OD > 31.8 mm'],
      rows: BAFFLE_HOLES,
    },
    {
      type: 'paragraph',
      html: 'The tighter hole applies where the unsupported tube span exceeds 914 mm on tubes up to 31.8 mm OD, to limit vibration. Over-tolerance is +0.25 mm on 96 % of holes and up to +0.38 mm on the rest. We stack-drill baffles and support plates so their holes line up through the bundle.',
    },

    { type: 'section_head', number: '/03', title: 'Materials.', anchor: 'materials' },
    {
      type: 'paragraph',
      html: '<a href="/p/carbon-steel-and-clad-tube-sheets">Carbon steel and clad tube sheets</a> are made from plate (A516) or forgings (A266, A105, A350), with stainless or other cladding where the tube side is corrosive. <a href="/p/duplex-stainless-tube-sheets">Duplex tube sheets</a> (A182 F51, F53; A240) serve seawater and produced-water exchangers, <a href="/p/titanium-tube-sheets">titanium</a> (B265, B381) seawater condensers, and <a href="/p/naval-brass-and-copper-alloy-tube-sheets">naval brass and copper alloys</a> (B171) condensers with copper-alloy tubes.',
    },

    { type: 'section_head', number: '/04', title: 'Ordering a replacement.', anchor: 'ordering' },
    {
      type: 'paragraph',
      html: 'Send the drawing, or the material, outside diameter, thickness, tube size, pitch and layout, pass-partition grooves and bolt holes. We cut, machine, drill, ream and groove from certified plate or forgings, and check hole size, pitch and ligaments against the drawing before dispatch.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the minimum pitch for 1 inch tube?', answer: '31.75 mm (1.25 in), which already gives the 6.4 mm cleaning lane.' },
        { question: 'How big are baffle holes?', answer: 'Tube OD plus 0.4 mm for long unsupported spans on tubes up to 31.8 mm, otherwise OD plus 0.8 mm.' },
        { question: 'Why stack-drill baffles?', answer: 'So the holes line up through every baffle and the tubes slide through without binding.' },
        { question: 'Can you make clad tube sheets?', answer: 'Yes, with stainless, duplex, titanium or copper-nickel cladding as the drawing requires.' },
        { question: 'Do tube sheets have part numbers?', answer: 'No. Each is made to the drawing; the listings give the standard limits.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Tube sheets and baffles in the catalogue',
      skus: ['IH-TF-SH-STL', 'IH-TF-SH-DPX', 'IH-TF-SH-TIT', 'IH-TF-SH-CUA', 'IH-TF-BS-BAF'],
    },
    { type: 'category_link', slug: 'tube-sheets', label: 'Tube sheets', blurb: 'Carbon, clad, duplex, titanium and copper-alloy tube sheets made to drawing.' },
    {
      type: 'related_articles',
      slugs: ['heat-transfer-tube-buyers-guide', 'u-bend-tubes-bend-radius-wall-thinning'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Pitch and baffle-hole limits from TEMA as listed on our reference listings; the current TEMA edition governs.',
    },
    {
      type: 'cta_block',
      heading: 'Need a tube sheet or baffle set?',
      body: 'Send the drawing or the layout and material. We quote with mill certificates and dimensional checks.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
