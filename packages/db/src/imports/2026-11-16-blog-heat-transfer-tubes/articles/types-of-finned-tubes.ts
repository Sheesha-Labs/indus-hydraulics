import type { BlogArticleSeed } from '../shared'

import { FIN_TYPES, GFIN_ROWS, L_ROWS } from '../tables'

/**
 * Fin types. Sources: approved family data for the live finned listings (construction, bond, typical
 * maker temperature limits per D4 — never "per API 661"; API 560 tip limits only for welded and studded
 * fired-heater fins), live size rows (./tables.ts). No maker names.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'types-of-finned-tubes',
  title: 'Types of finned tubes: L, LL, KL, G-fin, extruded or welded?',
  excerpt:
    'Wound, embedded, extruded and welded fins differ in how the fin is held to the tube — and that bond sets the temperature, the corrosion protection and the price. How to choose a fin type for an air cooler, economiser or fired heater.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Types of Finned Tubes and How to Choose',
  seoDescription:
    'L, LL, KL, embedded G-fin, extruded and HF-welded finned tubes compared: bond, typical temperature limits, corrosion cover and where each is used.',
  focusKeyword: 'types of finned tubes',
  publishedAt: '2026-11-16T08:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The fin bond — contact pressure, mechanical lock, extrusion or weld — decides how hot a finned tube can run.',
        'L-foot fins are the cheapest and the coolest: about 120–150 °C as a typical maker limit.',
        'LL and KL improve cover and bond; extruded fins protect the tube from the atmosphere; embedded G-fins reach about 400 °C.',
        'Above that, and in flue gas, the fin is welded: HF-welded spiral fins or studs, limited by the fin material.',
        'Temperature limits here are typical maker limits. Confirm them for your duty with the quotation.',
      ],
    },
    {
      type: 'lead',
      html: 'A finned tube is two parts — a base tube that carries the pressure and a fin that carries the heat to the air or gas — and almost everything that matters about it depends on how the two are joined. A fin that loosens loses contact, and a loose fin is just a radiator for nothing. So the first choice is not the fin size but the bond, and the bond is chosen by the temperature of the tube wall and the air around it.',
    },
    {
      type: 'direct_answer',
      question: 'What are the main types of finned tubes?',
      answer:
        'Tension-wound L, LL and KL fins (held by contact pressure, or by a knurled tube), embedded G-fins (wound into a groove in the tube wall), extruded fins (rolled out of an aluminium sleeve over the tube), welded fins (high-frequency welded spiral fins and studs) and integral low fins rolled from the tube itself. Wound fins suit low temperatures; embedded and welded fins suit higher ones.',
    },

    { type: 'section_head', number: '/01', title: 'The fin types side by side.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'Bond, typical limit and service, from our listings',
      columns: ['Fin type', 'Bond', 'Typical limit', 'Typical service'],
      rows: FIN_TYPES.map((r) => ({ cells: r.cells.slice(0, 4) })),
    },

    { type: 'section_head', number: '/02', title: 'Tension-wound: L, LL and KL.', anchor: 'wound' },
    {
      type: 'paragraph',
      html: 'An <a href="/p/l-foot-tension-wound-fin-tubes">L-foot fin</a> is an aluminium or copper strip with a foot bent at its root, wound under tension so the foot sits on the tube. Nothing but contact pressure holds it, and that pressure falls as the tube heats and cools, so L fins are kept to low-temperature air coolers, lube-oil and jacket-water coolers — 120 °C is the conservative figure, 120–150 °C the typical maker limit — and the ends are banded so the fin cannot unwind. The <a href="/p/ll-overlapped-wound-fin-tubes">LL fin</a> overlaps each foot on the one before, covering the tube completely; that full cover protects the tube from the atmosphere and lifts the typical limit to about 155 °C. The <a href="/p/kl-knurled-wound-fin-tubes">KL fin</a> is wound onto a knurled tube so the foot is pressed into the knurl — a better bond, at about 260 °C typical.',
    },
    {
      type: 'comparison_table',
      caption: 'L-foot fin tube sizes (live listing; fin dimensions in mm)',
      columns: ['OD mm', 'OD in', 'Fin OD', 'Fin height', 'Fin thickness', 'FPI', 'Part number'],
      rows: L_ROWS,
    },

    { type: 'section_head', number: '/03', title: 'Embedded G-fin.', anchor: 'gfin' },
    {
      type: 'paragraph',
      html: 'An <a href="/p/embedded-g-fin-tubes">embedded G-fin</a> is wound into a helical groove machined in the tube, and the groove edges are rolled back to lock the fin root. The lock survives temperature cycling, so G-fins are used where the inlet passes of an air cooler run hot — typically about 400 °C as a maker limit. The groove removes wall, so the tube must be thicker than for a wrap-on fin; our listing calls for at least 2.11 mm.',
    },
    {
      type: 'comparison_table',
      caption: 'Embedded G-fin tube sizes (live listing; fin dimensions in mm)',
      columns: ['OD mm', 'OD in', 'Fin OD', 'Fin height', 'Fin thickness', 'FPI', 'Part number'],
      rows: GFIN_ROWS,
    },

    { type: 'section_head', number: '/04', title: 'Extruded fins.', anchor: 'extruded' },
    {
      type: 'paragraph',
      html: 'An <a href="/p/extruded-aluminium-fin-tubes">extruded fin</a> is formed by rolling the fins out of a thick aluminium sleeve pressed over the liner tube. The aluminium covers the liner completely and the bond is tight, which is why extruded tube is chosen for coastal and offshore air coolers — see <a href="/blog/extruded-fin-tubes-coastal-air-coolers">extruded fin tube for coastal air coolers</a>. The typical maker limit is about 285 °C.',
    },

    { type: 'section_head', number: '/05', title: 'Welded fins and studs.', anchor: 'welded' },
    {
      type: 'paragraph',
      html: 'In fired-heater convection sections, HRSGs and economisers the gas is hot and dirty and the fin must be steel, welded to the tube. <a href="/p/high-frequency-welded-spiral-fin-tubes-solid-and-serrated">HF-welded spiral fins</a> come solid or serrated (see <a href="/blog/serrated-vs-solid-spiral-fin-tubes">serrated vs solid</a>); <a href="/p/studded-tubes">studded tubes</a> carry individually welded studs for fuel-oil firing. Their limit is set by the fin material: for fired-heater fins API 560 gives tip limits of 454 °C for carbon steel, 549 °C for 2¼Cr and 5Cr, and 982 °C for 25Cr-20Ni.',
    },
    {
      type: 'paragraph',
      html: 'For dust-laden flue gas, <a href="/p/h-fin-and-rectangular-fin-tubes">H-fin tubes</a> leave straight gas lanes between flat plates that resist fouling, and <a href="/p/longitudinal-fin-tubes">longitudinal fins</a> serve double-pipe exchangers and tank heaters. <a href="/p/oval-and-elliptical-fin-tubes">Oval and elliptical fin tubes</a> carry rectangular plate fins for air-cooled steam condensers and dry coolers.',
    },
    {
      type: 'paragraph',
      html: 'Two variants of the wound fin change the strip rather than the bond: <a href="/p/crimped-fin-tubes">crimped fins</a>, ruffled at the root as they are wound, for economisers and air heaters, and <a href="/p/notched-and-root-serrated-fin-tubes">notched and root-serrated fins</a>, which bend round the tube without stretching. Their sizes are confirmed with the quotation.',
    },

    { type: 'section_head', number: '/06', title: 'Choosing.', anchor: 'choosing' },
    {
      type: 'prose',
      html: '<ol><li>Find the maximum tube wall temperature, including upsets and steam-out.</li><li>Pick the cheapest fin whose typical limit clears it with margin: L, then LL or KL, then extruded, then embedded G-fin.</li><li>On the coast or offshore, prefer full cover: LL or extruded.</li><li>In flue gas or fired heaters, use welded steel fins or studs, and pick the fin material for the tip temperature.</li><li>Then fix the fin height, thickness and density with the thermal design.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between L and LL fin tubes?', answer: 'An LL fin’s foot overlaps the previous one, so the tube is fully covered. That protects it from the atmosphere and raises the typical limit slightly, to about 155 °C against 120–150 °C for L.' },
        { question: 'Which finned tube is best for high temperature?', answer: 'Embedded G-fins (about 400 °C typical) for air coolers; welded spiral fins or studs, limited by the fin material, for fired heaters and flue gas.' },
        { question: 'Which fin is best near the sea?', answer: 'Extruded or LL fins, because they cover the base tube completely.' },
        { question: 'Are these temperatures from API 661?', answer: 'No. They are typical maker limits. API 560 tip limits apply only to welded and studded fired-heater fins.' },
        { question: 'What fin density is usual?', answer: 'Air-cooler fins are commonly 10 fins per inch; aluminium air-cooler fins in our listings run from 4 to 12 FPI, and welded fired-heater fins from 1 to 6.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Finned tube in the catalogue',
      skus: ['IH-TF-WF-L', 'IH-TF-WF-LL', 'IH-TF-WF-KL', 'IH-TF-GF-GFN', 'IH-TF-EX-ALU', 'IH-TF-HF-HFW'],
    },
    { type: 'category_link', slug: 'finned-tubes', label: 'Finned tubes', blurb: 'Every fin type we supply, with sizes and part numbers.' },
    {
      type: 'related_articles',
      slugs: ['heat-transfer-tube-buyers-guide', 'serrated-vs-solid-spiral-fin-tubes', 'extruded-fin-tubes-coastal-air-coolers'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Temperatures are typical maker limits from published maker data; API 560 tip limits are quoted only for welded and studded fired-heater fins.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure which fin?',
      body: 'Send the service, the tube wall temperature and the site. We will propose the fin type and quote it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
