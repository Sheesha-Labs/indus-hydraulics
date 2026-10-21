import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Stainless 37° JIC fittings and SAE 4-bolt flange adapters. Sources read 2026-10-21: Parker Catalog 4300 (2017
 * edition; current 9/2023): Triple-Lok meets SAE J514 and ISO 8434-2, 37° flare / 74° included, metal-to-metal seal
 * between nose and flare; dash/thread table; F5OX steel vs 316 ratings, C5OX elbow lower, GTX (NPTF) equal; stainless
 * nuts pre-applied anti-seize / coated; torque table S19 applies to "unlubricated carbon steel components and
 * properly lubricated stainless steel components", FFWR preferred for stainless (Table S18), FFWR values; tube Table
 * T7 304/316 A213/A269 seamless fully annealed max HRB 90; harder tube may crack on flaring; Triple-Lok 2 O-ring nose
 * for stainless; SAE J518 / ISO 6162 flanges, Code 62 to 6,000 psi through 2". Hydroscand SAE flange table citing SAE
 * J518c (Code 61 / 62 pressure by size to 2½" / 3").
 * NOT used: Code 61 figures for 3" and above (conflicting sources); any "use the low end of the torque range" rule.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-jic-fittings',
  title: 'Stainless steel JIC fittings: 37° flare ratings, torque, tube and galling — and SAE flange adapters',
  excerpt:
    'A stainless 37° flare fitting can be rated higher than its steel twin, or lower, depending on whether it is a straight or an elbow. And it can be made up to the same torque as steel — provided the nut still carries its anti-galling coating. Parker’s published ratings, thread sizes, torque and flats, the HRB 90 limit on 316 tube for flaring, and stainless SAE Code 61 and 62 flange adapters.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless JIC Fittings: 37° Flare Ratings, Torque & Galling',
  seoDescription:
    'Stainless steel 37° JIC fittings (SAE J514): pressure ratings vs steel by dash size, thread sizes, assembly torque and flats from wrench resistance, 316 tube hardness for flaring, galling, and SAE Code 61 / 62 flange adapters.',
  focusKeyword: 'stainless steel jic fittings',
  publishedAt: '2026-10-21T17:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        '37° JIC (SAE J514 / ISO 8434-2) seals metal to metal between the fitting nose and the inside of a 37° tube flare — 74° included.',
        'In Parker’s 2017 tables, stainless straight connectors are rated about 20% above steel (-4: 9,000 vs 7,500 psi), but stainless elbows below it (-16: 3,000 vs 4,000 psi). Rate each shape from the maker’s stainless column.',
        'Parker applies the same torque to properly lubricated stainless as to dry steel — -8 is 42 ft-lb — and prefers the flats-from-wrench-resistance method for stainless.',
        'Flare only seamless, fully annealed 304 or 316 tube no harder than HRB 90; harder tube can crack at the flare.',
        'SAE J518 flange adapters: Code 61 is 5,000 psi to 1" and falls with size; Code 62 is 6,000 psi through 2".',
      ],
    },
    {
      type: 'lead',
      html: 'The 37° flare is the most common tube and hose end in North American hydraulics, and the one most often carried over into stainless when a system has to survive salt air. It is simple — a flared tube, a sleeve, a nut and a cone — but in stainless two details decide whether it seals: the rating of the particular shape, and the state of the nut thread.',
    },

    { type: 'section_head', number: '/01', title: 'How a 37° joint seals.', anchor: 'seal' },
    {
      type: 'prose',
      html: '<p>The tube is flared to 37° from its centreline — 74° included — and a sleeve and nut press that flare onto the matching cone of the fitting. Sealing is metal to metal, between the fitting nose and the inside of the flare; there is no elastomer. For stainless systems where that metal seat struggles, Parker offers a stainless-only variant with an O-ring in the 37° nose for improved seal reliability. Dash sizes and threads are the SAE J514 set:</p>',
    },
    {
      type: 'comparison_table',
      caption: '37° flare dash size, tube OD and nut thread',
      columns: ['Dash', 'Tube OD', 'Thread', 'Dash', 'Tube OD', 'Thread'],
      rows: [
        { cells: ['-2', '1/8"', '5/16-24', '-12', '3/4"', '1 1/16-12'] },
        { cells: ['-4', '1/4"', '7/16-20', '-16', '1"', '1 5/16-12'], highlight: true },
        { cells: ['-6', '3/8"', '9/16-18', '-20', '1 1/4"', '1 5/8-12'] },
        { cells: ['-8', '1/2"', '3/4-16', '-24', '1 1/2"', '1 7/8-12'] },
        { cells: ['-10', '5/8"', '7/8-14', '-32', '2"', '2 1/2-12'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Ratings: shape matters more than material.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Parker 37° flare × SAE straight-thread connector, dynamic working pressure, psi (Catalog 4300, 2017)',
      columns: ['Dash', 'Tube OD', 'Steel', '316 stainless'],
      rows: [
        { cells: ['-4', '1/4"', '7,500', '9,000'], highlight: true },
        { cells: ['-6', '3/8"', '6,000', '7,200'] },
        { cells: ['-8', '1/2"', '6,000', '7,200'] },
        { cells: ['-10', '5/8"', '5,000', '6,000'] },
        { cells: ['-12', '3/4"', '5,000', '6,000'] },
        { cells: ['-16', '1"', '4,500', '5,400'] },
        { cells: ['-20', '1 1/4"', '4,000', '4,800'] },
        { cells: ['-24', '1 1/2"', '3,000', '3,600'] },
        { cells: ['-32', '2"', '2,000', '2,400'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The same pattern holds for Parker’s 37° unions — -8 is 6,000 psi in steel and 7,200 in stainless. But it reverses on its elbows: a -8 elbow is 6,000 psi in steel and 5,400 in stainless, a -16 elbow 4,000 and 3,000. And with an NPTF end, steel and stainless carry the same rating (-16 at 3,000 psi), because the pipe thread limits both. These are 2017 catalogue figures for one maker; the current edition and other makers may differ, and our own stainless listings carry the manufacturer’s SAE J514 ratings for each size. A hose or tube assembly is rated to its weakest part.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Tube for flaring.', anchor: 'tube' },
    {
      type: 'prose',
      html: '<p>Parker’s tube table for 37° flare specifies stainless 304 or 316 to ASTM A213 or A269, seamless and fully annealed, with a maximum hardness of HRB 90 (welded-and-drawn tube to A249/A269 is the alternative). It warns that harder tube that is not fully annealed may crack at the flare, immediately or later, and its troubleshooting table gives "work-hardened tube; tube not annealed" as the cause of a cracked flare. Ask for the hardness on the tube certificate.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Making up stainless JIC.', anchor: 'assembly' },
    {
      type: 'prose',
      html: '<p>Parker’s stainless 37° nuts carry a pre-applied anti-seize lubricant to prevent galling. With it in place, Parker’s torque table applies to "unlubricated carbon steel components and properly lubricated stainless steel components" — the same figures — and only brass and aluminium are reduced, to about 65%. For stainless and brass, Parker’s preferred method is <strong>flats from wrench resistance (FFWR)</strong>: tighten until resistance rises, then turn the nut the stated number of hex flats.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Parker 37° flare assembly torque (+10 % −0) and flats from wrench resistance',
      columns: ['Dash', 'Thread', 'Torque', 'FFWR, tube', 'FFWR, swivel/hose'],
      rows: [
        { cells: ['-4', '7/16-20', '13 ft-lb (155 in-lb)', '2½', '2'] },
        { cells: ['-6', '9/16-18', '22 ft-lb', '2', '1½'] },
        { cells: ['-8', '3/4-16', '42 ft-lb', '2', '1½'], highlight: true },
        { cells: ['-10', '7/8-14', '60 ft-lb', '1½', '1½'] },
        { cells: ['-12', '1 1/16-12', '84 ft-lb', '1½', '1¼'] },
        { cells: ['-16', '1 5/16-12', '118 ft-lb', '1½', '1'] },
        { cells: ['-20', '1 5/8-12', '168 ft-lb', '1', '1'] },
        { cells: ['-32', '2 1/2-12', '265 ft-lb', '1', '1'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A bare stainless nut is a galling risk.',
      body: 'The torque above assumes a properly lubricated stainless nut. A nut whose coating has been cleaned off, or a bare nut from another source, can gall before it reaches torque — and a galled nut must be replaced, not forced. Keep nuts, sleeves and bodies from one maker.',
    },

    { type: 'section_head', number: '/05', title: 'SAE flange adapters, Code 61 and 62.', anchor: 'flanges' },
    {
      type: 'prose',
      html: '<p>Above 1" or so, and on pump and valve ports, the four-bolt SAE flange (SAE J518 / ISO 6162-1 and -2) takes over from threads. A flange head on the adapter is clamped to the port by split flange halves and sealed by an O-ring. Parker describes the system as especially suited to larger sizes and higher pressures, with up to 6,000 psi through 2" in Code 62. A table citing SAE J518 gives:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'SAE J518 four-bolt flange working pressure',
      columns: ['Size', 'Code 61', 'Code 62'],
      rows: [
        { cells: ['½", ¾", 1"', '5,000 psi (345 bar)', '6,000 psi (414 bar)'] },
        { cells: ['1¼"', '4,000 psi (276 bar)', '6,000 psi (414 bar)'] },
        { cells: ['1½", 2"', '3,000 psi (207 bar)', '6,000 psi (414 bar)'], highlight: true },
        { cells: ['2½"', '2,500 psi (172 bar)', '—'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Code 61 and Code 62 heads of the same nominal size are different dimensions and do not interchange. Our stainless JIC × Code 61 and Code 62 flange heads, and Code 61 split flange halves and kits, are listed below.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure are stainless JIC fittings rated for?', answer: 'It depends on size and shape. In Parker’s 2017 tables a -4 stainless straight connector is 9,000 psi and a -16 is 5,400; stainless elbows are lower (-16 at 3,000 psi). Use the maker’s stainless rating for the exact part.' },
        { question: 'What torque for a stainless JIC fitting?', answer: 'Parker uses the same torque as for steel, on a properly lubricated stainless nut: -4 13 ft-lb, -8 42 ft-lb, -16 118 ft-lb. It prefers the flats-from-wrench-resistance method for stainless.' },
        { question: 'Why do stainless JIC nuts gall?', answer: 'Stainless threads forced together dry can locally weld. Makers coat or pre-lubricate stainless nuts to prevent it; keep that coating and do not mix in bare nuts.' },
        { question: 'Can any 316 tube be flared to 37°?', answer: 'Use seamless, fully annealed 304 or 316 tube no harder than HRB 90. Harder, work-hardened tube can crack at the flare.' },
        { question: 'What is the difference between SAE Code 61 and Code 62 flanges?', answer: 'Code 62 is the high-pressure series — 6,000 psi through 2" — with a thicker, larger flange head. Code 61 is rated 5,000 psi to 1", falling to 3,000 psi at 1½–2". They do not interchange.' },
        { question: 'Is JIC the same as 37° flare?', answer: 'Yes. JIC, SAE 37° flare and SAE J514 37° refer to the same 37° flare, 74° included, metal-to-metal connection.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>316L stainless 37° JIC fittings and stainless SAE flange adapters:</p>' + stockList(['stainless-steel-jic-adapters', 'stainless-steel-sae-flange-adapters']),
    },
    {
      type: 'product_embed',
      heading: 'Stainless JIC fittings',
      skus: ['IH-SS-2403', 'IH-SS-2404', 'IH-SS-2500', 'IH-SS-2603', 'IH-SS-2700', 'IH-SS-6500', 'IH-SS-6504', 'IH-SS-1800'],
    },
    { type: 'category_link', slug: 'stainless-steel-jic-adapters', label: 'Stainless JIC adapters', blurb: '316L 37° unions, elbows, tees, bulkheads, swivels, nuts and sleeves.' },
    { type: 'category_link', slug: 'stainless-steel-sae-flange-adapters', label: 'Stainless SAE flange adapters', blurb: 'JIC × Code 61 and Code 62 flange heads and split flanges.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Offshore and wellhead control hydraulics.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-4300', text: 'Parker Hannifin Tube Fittings Division. Catalog 4300 (2017 edition; current edition 9/2023).', url: 'https://parker.com/literature/Tube%20Fittings%20Division/4300_Catalog_Cover.pdf' },
        { id: 'hydroscand-sae', text: 'Hydroscand. SAE flange dimensions (citing SAE J518c).', url: 'https://hydroscand.se/en-us/fakta-guider/sae-flansar-dimensioner' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-hydraulic-adapters-guide', 'stainless-orfs-and-orb-fittings', 'stainless-din-2353-and-flareless-bite-fittings', 'ss316l-hydraulic-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings, torque, FFWR and tube limits from Parker Catalog 4300 (2017 edition — check the current edition before quoting a figure); SAE flange ratings from a table citing SAE J518.',
    },
    {
      type: 'cta_block',
      heading: 'Need stainless JIC fittings?',
      body: 'Send the dash sizes, shapes and working pressure. We will quote 316 fittings with the manufacturer’s rating for each, and flange adapters in Code 61 or 62.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
