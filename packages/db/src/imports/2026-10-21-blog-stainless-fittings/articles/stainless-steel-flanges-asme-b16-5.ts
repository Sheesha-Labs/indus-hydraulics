import type { BlogArticleSeed } from '../shared'
import { FLANGE_PT } from '../diagrams'
import { stockList } from '../products'

/**
 * Stainless ASME B16.5 flanges. Sources read 2026-10-21: ASME/ANSI webstore scope of B16.5-2025 (classes 150–1500 to
 * NPS 24, 2500 to NPS 12); Fike Technical Bulletin TB8106 (2019), which reproduces the B16.5-2017 pressure–
 * temperature tables for A182 316 (Group 2.2) and 304 (Group 2.1) and A105 carbon steel — figures in the chart and
 * table come from it; Wermac flange-face and finish pages (raised face 1/16" on Class 150/300 and 1/4" above; RF
 * serrated finish 125–500 µin AARH, 125–250 common for spiral-wound gaskets; FF against cast flanges, never FF to
 * RF; RTJ typical from Class 600); MSS SP-43 summary (stub ends for 5S/10S/40S).
 * NOT used: Group 2.3 (304L/316L) figures — no readable table; stated only that the L grades rate lower.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-steel-flanges-asme-b16-5',
  title: 'Stainless steel flanges to ASME B16.5: types, faces, classes and pressure ratings for 304 and 316',
  excerpt:
    'A Class 150 stainless flange is good for 19 bar at room temperature and barely 10 bar at 300 °C — and that falling curve, not the class number, is what a flange is really rated to. Weld neck, slip-on, socket weld, threaded, blind and lap joint flanges; raised, flat and ring-joint faces; and the B16.5 pressure–temperature ratings for 304 and 316.',
  categorySlug: 'stainless-steel-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Steel Flanges ASME B16.5: Types & 316 Pressure Ratings',
  seoDescription:
    'Stainless steel flanges to ASME B16.5: weld neck, slip-on, socket weld, threaded, blind and lap joint types, RF/FF/RTJ faces and finishes, and Class 150 and 300 pressure–temperature ratings for 304 and 316.',
  focusKeyword: 'stainless steel flanges',
  publishedAt: '2026-10-21T16:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'ASME B16.5 covers pipe flanges and flanged fittings from NPS ½ to 24 in Classes 150 to 1500, and to NPS 12 in Class 2500.',
        'The class is not a pressure: a Class 150 flange in 316 is rated 19.0 bar (275 psi) at up to 38 °C, 13.7 bar at 200 °C and 10.2 bar at 300 °C. Class 300 is 49.6 bar at ambient.',
        'B16.5 groups 304 as material Group 2.1 and 316 as Group 2.2; their ratings are almost identical, and at high temperature Class 150 is the same for stainless and carbon steel.',
        'Raised faces are 1/16" high on Class 150 and 300; the serrated finish may be 125–500 µin AARH, and 125–250 is the usual call for spiral-wound gaskets.',
        'Never bolt a flat-face flange to a raised-face one; use flat-face flanges against cast or non-metallic flanges.',
      ],
    },
    {
      type: 'lead',
      html: 'A flange is the one joint in a welded stainless line that is meant to come apart — at a valve, a pump, a vessel nozzle or a spool that has to be removed. That makes it the joint most often specified by habit: "150# RF, 316" and nothing else. This guide covers the flange types, the faces and finishes, and the pressure–temperature ratings that decide whether a Class 150 flange is actually enough.',
    },

    { type: 'section_head', number: '/01', title: 'The flange types.', anchor: 'types' },
    {
      type: 'comparison_table',
      caption: 'Common ASME B16.5 flange types',
      columns: ['Type', 'How it joins the pipe', 'Where it fits'],
      rows: [
        { cells: ['Weld neck', 'Tapered hub butt-welded to the pipe', 'High pressure and temperature, cyclic loads; the strongest and best-aligned'], highlight: true },
        { cells: ['Slip-on', 'Pipe slides in; fillet welds inside and out', 'Lower-pressure service; easier fit-up'] },
        { cells: ['Socket weld', 'Pipe in a socket, one fillet weld', 'Small-bore, higher-pressure lines'] },
        { cells: ['Threaded', 'NPT thread, no welding', 'Small bore where welding is not allowed'] },
        { cells: ['Lap joint + stub end', 'Loose flange behind a welded stub end', 'Frequent dismantling; the flange is not wetted, so it can be a cheaper grade'] },
        { cells: ['Blind', 'No bore — closes the end', 'Pipe ends, vessel nozzles, test points'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The lap joint is worth knowing in stainless. The stub end — to MSS SP-43 for Sch 5S and 10S pipe, with short patterns for 40S — is welded to the pipe and carries the gasket face; the flange behind it only clamps. Only the stub end touches the process, and the flange rotates, so bolt holes line up without twisting the spool.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Faces and finishes.', anchor: 'faces' },
    {
      type: 'prose',
      html: '<ul><li><strong>Raised face (RF)</strong> — the gasket sits on a raised ring, 1/16" (1.6 mm) high on Class 150 and 300 and 1/4" (6.4 mm) from Class 400 up. The default for process flanges.</li><li><strong>Flat face (FF)</strong> — used where the mating flange is cast iron or non-metallic, so the bolt load does not bend a brittle flange. Never bolt an FF flange to an RF one.</li><li><strong>Ring-type joint (RTJ)</strong> — a metal ring in a groove, typical from Class 600 or in hot service.</li></ul><p>B16.5 calls for a serrated face, concentric or spiral, and allows a roughness of 125 to 500 µin AARH. Within that, 125–250 µin is the usual "smooth" call for spiral-wound gaskets and 250–500 the "stock" finish for soft gaskets. Specify it with the gasket, not by habit.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Pressure–temperature ratings.', anchor: 'ratings' },
    {
      type: 'prose',
      html: '<p>A flange class is a family of pressure–temperature ratings, set by the material group. B16.5 places 304 in Group 2.1 and 316 in Group 2.2. The tables below are B16.5-2017 as reproduced in a maker’s technical bulletin:</p>',
    },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'ASME B16.5 rating of 304 (Group 2.1) and 316 (Group 2.2) flanges in Class 150 and 300, from ambient to 400 °C. The rating at operating temperature, not at ambient, is what the flange must meet.',
      alt: 'Line chart of flange pressure rating in bar against temperature from 38 to 400 °C. 316 Class 300 falls from 49.6 bar to 29.4 bar; 304 Class 300 from 49.6 to 28.4 bar. 316 and 304 Class 150 both fall from 19.0 bar to 6.5 bar and are equal at 300 °C at 10.2 bar. A note says Class 150 at 300 °C is 10.2 bar for 304, 316 and carbon steel alike.',
      svg: FLANGE_PT,
    },
    {
      type: 'comparison_table',
      caption: 'ASME B16.5 ratings, bar (psi at −29 to 38 °C in brackets)',
      columns: ['Temperature', '304 Class 150', '316 Class 150', '304 Class 300', '316 Class 300'],
      rows: [
        { cells: ['−29 to 38 °C', '19.0 (275)', '19.0 (275)', '49.6 (720)', '49.6 (720)'], highlight: true },
        { cells: ['100 °C', '15.7', '16.2', '40.9', '42.2'] },
        { cells: ['150 °C', '14.2', '14.8', '37.0', '38.5'] },
        { cells: ['200 °C', '13.2', '13.7', '34.5', '35.7'] },
        { cells: ['300 °C', '10.2', '10.2', '30.9', '31.6'] },
        { cells: ['400 °C', '6.5', '6.5', '28.4', '29.4'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Three things follow. Stainless rates slightly lower than carbon steel at ambient — A105 is 19.6 bar (285 psi) in Class 150 and 51.1 bar in Class 300 — but holds its Class 300 rating far better at high temperature: at 500 °C, 316 is 28.2 bar against 11.8 bar for carbon steel. At high temperature the Class 150 ceiling is set by the class rather than the alloy: at 300 °C it is 10.2 bar for 304, 316 and carbon steel alike. And the low-carbon L grades fall in a separate group with lower ratings, so check which grade and group the mill certificate states, especially on dual-certified 316/316L.</p><p>For higher pressures, 304 and 316 flanges at ambient rate 99.3 bar (1,440 psi) in Class 600, 148.9 bar (2,160 psi) in Class 900, 248.2 bar (3,600 psi) in Class 1500 and 413.7 bar (6,000 psi) in Class 2500.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Rate the flange at the design temperature.',
      body: 'A hot-water or thermal-oil line at 200 °C and 15 bar is beyond a Class 150 316 flange (13.7 bar at 200 °C), even though 15 bar sounds well inside "150#". Take the design pressure and temperature to the table, not the class name.',
    },
    {
      type: 'standard_citation',
      standard: 'ASME B16.5',
      publisher: 'ASME',
      title: 'Pipe Flanges and Flanged Fittings: NPS 1/2 Through NPS 24 Metric/Inch Standard',
      summary:
        'Covers pressure–temperature ratings, materials, dimensions, tolerances, marking and testing of pipe flanges and flanged fittings in Classes 150, 300, 400, 600, 900 and 1500 (NPS ½–24) and Class 2500 (NPS ½–12), with guidance on bolting and gaskets. The latest edition is B16.5-2025.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What pressure is a 150# stainless flange rated for?', answer: 'Under ASME B16.5, a Class 150 316 flange is rated 19.0 bar (275 psi) from −29 to 38 °C, falling to 13.7 bar at 200 °C and 10.2 bar at 300 °C.' },
        { question: 'Is a 304 flange rated the same as a 316 flange?', answer: 'Very nearly. 304 is Group 2.1 and 316 Group 2.2; both are 19.0 bar in Class 150 and 49.6 bar in Class 300 at ambient, with 316 slightly higher at moderate temperatures.' },
        { question: 'Weld neck or slip-on?', answer: 'Weld neck for high pressure, high temperature or cyclic loads — it is the strongest and best aligned. Slip-on is easier to fit and suits lower-pressure service.' },
        { question: 'What is the raised face height on a Class 150 flange?', answer: '1/16" (1.6 mm) for Class 150 and 300; 1/4" (6.4 mm) from Class 400.' },
        { question: 'What flange face finish do I need?', answer: 'B16.5 allows a serrated 125–500 µin AARH finish. 125–250 µin is usual for spiral-wound gaskets; 250–500 suits soft gaskets.' },
        { question: 'Why use a lap joint flange?', answer: 'The stub end carries the gasket face and touches the process; the flange only clamps and can rotate to line up the bolt holes, which helps where spools are dismantled often.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>304 and 316 flanges and stub ends, with class, schedule and size on every listing:</p>' + stockList(['stainless-steel-flanges']),
    },
    {
      type: 'product_embed',
      heading: 'Stainless flanges',
      skus: ['IH-PF-WNRF-316', 'IH-PF-SORF-316', 'IH-PF-SWRF-316', 'IH-PF-THRF-316', 'IH-PF-LJ-316', 'IH-PF-SEA-316', 'IH-PF-WNRF-304', 'IH-PF-SORF-304'],
    },
    { type: 'category_link', slug: 'stainless-steel-flanges', label: 'Stainless steel flanges', blurb: 'Weld neck, slip-on, socket weld, threaded and lap joint flanges and stub ends.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Process and utility piping on plant and platform.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'fike-tb8106', text: 'Fike. Technical Bulletin TB8106 — Temperature/Pressure Ratings for Bolted Type Bursting Disc Holders (reproducing ASME B16.5-2017 tables), 2019.', url: 'https://my.fike.com/phoenix/api/files/download/?did=6411' },
        { id: 'asme-b16-5', text: 'ASME B16.5-2025, Pipe Flanges and Flanged Fittings — scope.', url: 'https://webstore.ansi.org/standards/asme/asmeb162025' },
        { id: 'wermac-faces', text: 'Wermac. Flange faces: raised face, flat face, ring-type joint.', url: 'https://www.wermac.org/flanges/flanges_raised-face_flat-face_ring-type-joint.html' },
        { id: 'wermac-finish', text: 'Wermac. Flange face finish: stock and smooth finish.', url: 'https://www.wermac.org/flanges/flanges_stock-finish_smooth-finish.html' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['stainless-steel-butt-weld-fittings', 'stainless-steel-pipe-fittings-guide', '304-vs-316-stainless-steel-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ratings from ASME B16.5-2017 tables as reproduced in a maker bulletin; faces and finishes from engineering references. Confirm against the edition your project specifies.',
    },
    {
      type: 'cta_block',
      heading: 'Need flanges for a stainless line?',
      body: 'Send the size, class, type, face, schedule, grade and design pressure and temperature. We will confirm the class holds at temperature and quote with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
