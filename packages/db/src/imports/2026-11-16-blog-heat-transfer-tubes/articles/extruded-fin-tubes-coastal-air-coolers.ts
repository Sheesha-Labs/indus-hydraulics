import type { BlogArticleSeed } from '../shared'

import { EX_ROWS } from '../tables'

/**
 * Extruded fins for coastal air coolers. Sources: approved data for IH-TF-EX-ALU (liner grades, fin
 * alloys, 285 °C typical maker limit, services incl. coastal/offshore preference, bond resistance
 * finding) and IH-TF-WF-LL / IH-TF-GF-GFN for comparison; live rows (./tables.ts). No maker names.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'extruded-fin-tubes-coastal-air-coolers',
  title: 'Extruded fin tube for coastal and offshore air coolers',
  excerpt:
    'Extruded aluminium fins cover the liner tube completely, which is why they are the usual choice for air coolers near the sea, offshore and in LNG and gas plants. How extruded tube is made, its limits, liner choices and sizes.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Extruded Fin Tubes for Air Coolers',
  seoDescription:
    'Extruded aluminium fin tubes for coastal and offshore air coolers: how they are made, liner materials, 285 °C typical limit, sizes and part numbers.',
  focusKeyword: 'extruded fin tube',
  publishedAt: '2026-11-16T08:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An extruded fin is rolled out of an aluminium sleeve pressed over the liner tube, so the liner is fully covered.',
        'Full cover keeps salt air off the liner, which is why extruded tube is preferred on the coast and offshore.',
        'The typical maker limit is about 285 °C; above that, use embedded G-fins.',
        'The liner can be almost any tube: carbon steel A179 or SA-334 Gr 6, stainless, duplex, titanium or copper alloys.',
        'A common size is 1 in OD, 14 BWG, with 10 fins per inch.',
      ],
    },
    {
      type: 'lead',
      html: 'Air coolers in the Gulf sit in salt-laden, humid air for most of the year, and a wound fin that leaves the tube exposed between its feet lets that air reach the steel. Extruded fin tube solves the problem by making the fin and its sleeve one piece of aluminium that encloses the liner. It costs more than a wound fin, and in coastal service it usually earns it.',
    },
    {
      type: 'direct_answer',
      question: 'What is an extruded fin tube?',
      answer:
        'A bimetallic tube: an inner liner tube that carries the process fluid, and an outer aluminium sleeve from which the fins are rolled out under pressure. The fins and sleeve are one piece and cover the liner completely, giving a tight bond and protection from the atmosphere. The typical maker temperature limit is about 285 °C.',
    },

    { type: 'section_head', number: '/01', title: 'How it is made.', anchor: 'made' },
    {
      type: 'paragraph',
      html: 'A thick-walled aluminium tube is slid over the liner and the assembly is passed through rolling discs that squeeze the aluminium down onto the liner and raise it into helical fins in one operation. The rolling pressure bonds sleeve to liner. Even so, the bond is a mechanical contact, and a contact resistance exists even on new tube — one reason the thermal design should use the maker’s data for extruded tube, not bare-metal values.',
    },

    { type: 'section_head', number: '/02', title: 'Why it suits the coast.', anchor: 'coast' },
    {
      type: 'paragraph',
      html: 'With an <a href="/p/l-foot-tension-wound-fin-tubes">L-foot fin</a>, air can reach the tube between the feet, and corrosion there pushes the fin off the tube. The <a href="/p/ll-overlapped-wound-fin-tubes">LL fin</a> overlaps the feet to close that gap; the extruded fin removes it entirely, because the sleeve is continuous. That is why extruded tube is preferred for coastal and offshore air coolers, and is widely used in gas processing, LNG mixed-refrigerant and propane coolers, gas compression stations and refineries.',
    },

    { type: 'section_head', number: '/03', title: 'Limits and alternatives.', anchor: 'limits' },
    {
      type: 'comparison_table',
      caption: 'Coastal-duty fin options (typical maker limits)',
      columns: ['Fin', 'Liner cover', 'Typical limit'],
      rows: [
        { cells: ['LL overlapped wound', 'Complete, by overlapping feet', 'About 155 °C'] },
        { cells: ['Extruded aluminium', 'Complete, one-piece sleeve', 'About 285 °C'] },
        { cells: ['Embedded G-fin', 'Tube exposed between fins', 'About 400 °C'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'For inlet passes hotter than an extruded fin allows, the usual answer is an <a href="/p/embedded-g-fin-tubes">embedded G-fin</a>, with the exposed tube protected by the choice of liner or a coating. The comparison of all fin types is in <a href="/blog/types-of-finned-tubes">types of finned tubes</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Liner and fin materials.', anchor: 'materials' },
    {
      type: 'paragraph',
      html: 'The liner can be almost any tube that can take the rolling load: carbon steel SA-179 for general service and SA-334 Grade 6 for low temperature, stainless and duplex for corrosive process fluids, titanium, and copper alloys. The fin sleeve is aluminium 1100, or 1050/1060.',
    },

    { type: 'section_head', number: '/05', title: 'Sizes.', anchor: 'sizes' },
    {
      type: 'comparison_table',
      caption: 'Extruded aluminium fin tube (live listing, mm)',
      columns: ['OD', 'OD in', 'Wall', 'Fin OD', 'Fin height', 'Fin thickness', 'FPI', 'Part number'],
      rows: EX_ROWS.map((r) => ({ cells: [...r.cells.slice(0, 7), r.cells[8] ?? ''] })),
    },
    {
      type: 'paragraph',
      html: 'Fin density from 5 to 12 fins per inch is available; 10 is typical. Single lengths run to 15–18 m.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What temperature can extruded fin tube take?', answer: 'About 285 °C as a typical maker limit; published values run from 280 to 315 °C. Confirm it for your duty with the quotation.' },
        { question: 'Is extruded better than embedded fin?', answer: 'For corrosion near the sea, yes, because the liner is fully covered. For temperature, no: embedded G-fins run to about 400 °C.' },
        { question: 'What liner materials are available?', answer: 'Carbon steel SA-179 and SA-334 Gr 6, stainless, duplex, titanium and copper alloys.' },
        { question: 'What is the standard extruded fin tube size?', answer: '1 inch (25.4 mm) OD, 14 BWG (2.11 mm) wall, with fins of 57.15 or 50.8 mm OD at 10 fins per inch.' },
        { question: 'Can extruded tube be used offshore?', answer: 'Yes. It is the preferred fin for coastal and offshore air coolers.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'In the catalogue',
      skus: ['IH-TF-EX-ALU', 'IH-TF-WF-LL', 'IH-TF-GF-GFN', 'IH-TF-FT-FIN'],
    },
    { type: 'category_link', slug: 'extruded-fin-tubes', label: 'Extruded fin tubes', blurb: 'Aluminium fins rolled from a sleeve over the liner tube.' },
    {
      type: 'related_articles',
      slugs: ['types-of-finned-tubes', 'heat-transfer-tube-buyers-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Temperatures are typical maker limits. Sizes from our live listing.',
    },
    {
      type: 'cta_block',
      heading: 'Air cooler on the coast?',
      body: 'Send the liner grade, OD, wall, fin geometry and length. We quote extruded fin tube with mill certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
