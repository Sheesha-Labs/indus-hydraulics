import type { BlogArticleSeed } from '../shared'

import { LOWFIN_ROWS } from '../tables'

/**
 * Integral low-fin tube. Sources: approved data for IH-TF-IL-ILF, IH-TF-EC-LOF and IH-TF-UF-LOF
 * (standards A498, A1012, B359; materials; tests: pressure test every tube, air test 250 psi after
 * finning, eddy current after finning, U-bends hydrotested after bending), live rows (./tables.ts).
 * Trade alloy names written as Alloy 400 etc. No performance multipliers: none were sourced.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'integral-low-fin-tubes-condenser-retubing',
  title: 'Integral low-fin tube for condenser and cooler retubing',
  excerpt:
    'Low-fin tube is rolled out of the tube wall itself, adding outside surface to a shell-and-tube bundle without changing the tube sheet. What it is, where it helps, the standards and materials, and how to order it — with the live size table.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Integral Low-Fin Tubes for Retubing',
  seoDescription:
    'Integral low-fin tubes for shell-and-tube condensers and coolers: how they are made, A498 and B359, materials, tests, sizes and part numbers.',
  focusKeyword: 'low fin tube',
  publishedAt: '2026-11-16T08:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Integral low fins are rolled out of the tube wall, so fin and tube are one piece with no bond to fail.',
        'The finned section is smaller in diameter than the plain ends, which keep the original OD to fit the tube sheet.',
        'Low fins help where the shell side limits heat transfer: condensing and clean liquid coolers.',
        'Steel tube is made to ASTM A498 (or A1012 for welded), copper alloys to B359.',
        'Order by plain-end OD and wall, fins per inch, fin height and wall under the fin.',
      ],
    },
    {
      type: 'lead',
      html: 'When a shell-and-tube condenser or cooler runs short of duty, the shell side is often the limit: the outside of the tube is too small for the film that forms on it. Integral low-fin tube adds outside surface inside the same bundle, because the fins are rolled out of the tube wall and the plain ends keep the original diameter to fit the existing tube sheet and baffles.',
    },
    {
      type: 'direct_answer',
      question: 'What is integral low-fin tube?',
      answer:
        'Tube whose outer wall is cold-rolled into short helical fins, typically 19 to 28 fins per inch and around 1 mm high, while the ends are left plain at the original outside diameter. Fin and tube are one piece. It adds shell-side surface to shell-and-tube condensers and coolers without changing the tube sheet, and is made to ASTM A498 or A1012 for steels and B359 for copper alloys.',
    },

    { type: 'section_head', number: '/01', title: 'How it is made.', anchor: 'made' },
    {
      type: 'paragraph',
      html: 'Rolling discs on arbors displace metal from the tube wall outward into fins along the finned length, leaving plain lands where the tube passes through baffles and plain ends for the tube sheet. Because the fins come from the wall, the wall under the fin is thinner than the plain wall, and the root diameter is below the plain OD. All three — plain wall, wall under fin and root diameter — appear in the size table and on the order.',
    },

    { type: 'section_head', number: '/02', title: 'Where it helps.', anchor: 'where' },
    {
      type: 'paragraph',
      html: 'Low fins pay off where the outside film is the larger resistance: shell-side condensing of refrigerants and hydrocarbons, and clean liquid coolers in gas plants and refineries. Copper-nickel low-fin tube is used in seawater-cooled condensers. They are less suited to heavily fouling shell-side fluids, which can fill the fin gaps. Tubes can also be bent after finning as <a href="/p/low-fin-u-bend-tubes">low-fin U-bends</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Materials and standards.', anchor: 'materials' },
    {
      type: 'paragraph',
      html: 'Steel low-fin tube is made to ASTM A498 (seamless and welded steel integral-fin tube) and A1012 for welded tube, on base tube such as SA-179, SA-214 and SA-334 Grade 1, 3 and 6. Stainless choices run from ferritic 405, 410, 430 and 439 through austenitic 304, 316, 317 and 321 to duplex 2205 and 2101 and 6Mo. Nickel alloys — Alloy 400, 600, 625, 800, 825 and C-276 — and titanium Grades 1, 2, 16 and 26 are available. Copper and copper alloys, including Cu-Ni, come under ASTM B359; see also <a href="/p/low-fin-copper-alloy-tubes">low-fin copper-alloy tube</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Testing.', anchor: 'testing' },
    {
      type: 'paragraph',
      html: 'Under A498 every tube is pressure tested. In our listing, straight tubes are air tested at 250 psi (1.72 MPa) after finning, hydro is optional, all tubes are eddy-current tested after finning, and U-bends are hydrotested after bending.',
    },

    { type: 'section_head', number: '/05', title: 'Sizes.', anchor: 'sizes' },
    {
      type: 'comparison_table',
      caption: 'Integral low-fin tube (live listing, mm unless stated)',
      columns: ['OD in', 'Wall', 'Wall under fin', 'Root dia', 'Fin height', 'FPI', 'Materials', 'Part number'],
      rows: LOWFIN_ROWS,
    },

    { type: 'section_head', number: '/06', title: 'Ordering a retube.', anchor: 'ordering' },
    {
      type: 'prose',
      html: '<ol><li>Plain-end OD and wall, matching the tube sheet and the design pressure.</li><li>Fins per inch and fin height (or the part number above).</li><li>Wall under fin, which sets the pressure rating of the finned section.</li><li>The lengths of plain ends and the positions of plain lands at each baffle.</li><li>Material grade and standard, quantity and certificate.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can low-fin tube replace plain tube in an existing bundle?', answer: 'Yes, that is its main use: the plain ends keep the original OD, so the tube sheet and baffles are unchanged — provided plain lands are placed at each baffle.' },
        { question: 'What standard covers low-fin steel tube?', answer: 'ASTM A498, with A1012 for welded tube. Copper alloys are covered by B359.' },
        { question: 'How many fins per inch?', answer: 'Our listing runs 19, 26 and 28 fins per inch, with fin heights from about 0.9 to 1.4 mm.' },
        { question: 'Is low-fin tube tested after finning?', answer: 'Yes: pressure testing of every tube, and eddy-current testing after finning.' },
        { question: 'Can low-fin tube be bent?', answer: 'Yes, as low-fin U-bends, hydrotested after bending.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Low-fin tube in the catalogue',
      skus: ['IH-TF-IL-ILF', 'IH-TF-EC-LOF', 'IH-TF-UF-LOF'],
    },
    { type: 'category_link', slug: 'integral-low-fin-tubes', label: 'Integral low-fin tubes', blurb: 'Steel, stainless, nickel-alloy and titanium low-fin tube.' },
    {
      type: 'related_articles',
      slugs: ['heat-transfer-tube-buyers-guide', 'u-bend-tubes-bend-radius-wall-thinning'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Sizes and tests from our live listing and ASTM A498 / B359 scope.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a retube?',
      body: 'Send the existing tube and tube-sheet details and the material. We quote low-fin tube to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
