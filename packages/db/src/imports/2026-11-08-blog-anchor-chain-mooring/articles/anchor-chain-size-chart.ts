import type { BlogArticleSeed } from '../shared'
import { OFFSHORE_BREAK, OFFSHORE_PROOF_STUD, OFFSHORE_PROOF_STUDLESS, SHIP_STUD_LOADS } from '../charts'

/**
 * Anchor chain size chart. Every load is the live listing value (../charts.ts, generated 2026-11-08).
 * Those values are the IACS test loads — UR W18 for U1–U3 and UR W22 for ORQ–R5 — computed from
 * F = c·d²·(44 − 0.08d) kN; the constants below were checked against two makers' published tables.
 * Ship stud link rows stop at 137 mm because the listing carries no loads above it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'anchor-chain-size-chart',
  title: 'Anchor chain size chart: proof and breaking loads for every grade, in mm and inches',
  excerpt:
    'Proof and breaking loads for stud link anchor chain in grades U1, U2 and U3 from 12.5 to 137 mm, and for offshore mooring chain in grades ORQ, R3, R3S, R4, R4S and R5 from 36 to 205 mm, stud link and studless — with the inch size beside every metric one and the formula behind them.',
  categorySlug: 'anchor-chain-mooring',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Anchor Chain Size Chart, mm and Inch',
  seoDescription:
    'Anchor chain size chart: proof and breaking loads for grades U1–U3 and offshore ORQ–R5, stud link and studless, 12.5 to 205 mm with inch sizes.',
  focusKeyword: 'anchor chain size chart',
  publishedAt: '2026-11-08T09:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Anchor chain is sized by the nominal diameter of the common link — the bar it is made from — in mm, with an inch equivalent: 76 mm is 3″.',
        'Grade sets the strength: at 76 mm a U2 stud link chain breaks at 3,010 kN, U3 at 4,300 kN and offshore R4 at 6,001 kN.',
        'Proof load is applied to every length before delivery; breaking load is proven on samples. Proof is about 70% of break for U2 and U3.',
        'Stud link and studless chain of the same offshore grade have the same breaking load. From R3S up, studless chain is proof tested to a lower load.',
        'All of these loads come from one IACS formula, so any size can be checked: F = c × d² × (44 − 0.08d) kN.',
      ],
    },
    {
      type: 'lead',
      html: 'An anchor chain is ordered by three numbers: its diameter, its grade and its length. This chart gives the first two — the proof load every shot is tested to and the minimum breaking load it must reach — for every size and grade we list, ship anchor chain and offshore mooring chain alike. The metric size is the one the certificate carries; the inch size is the one many older drawings and windlass plates still use.',
    },
    {
      type: 'direct_answer',
      question: 'What is the breaking load of anchor chain by size?',
      answer:
        'For stud link anchor chain in grade U2: 32 mm breaks at 583 kN, 50 mm at 1,370 kN, 76 mm at 3,010 kN and 102 mm at 5,120 kN. Grade U3 is about 1.4 times stronger and U1 about 0.7 times. Offshore mooring chain is stronger again: 76 mm R3 breaks at 4,884 kN and R4 at 6,001 kN.',
    },

    { type: 'section_head', number: '/01', title: 'Reading the chart.', anchor: 'reading' },
    {
      type: 'prose',
      html: '<p>Four things to know before using the tables:</p><ul><li><strong>Size</strong> is the nominal diameter of the common link. Enlarged links, end links and shackles are bigger, but they are ordered by the chain size they fit.</li><li><strong>Proof load</strong> is the test load applied to the full length of every shot after heat treatment. The chain must carry it without cracks or permanent stretch beyond the class limits.</li><li><strong>Breaking load</strong> is a minimum, proven by pulling sample lengths to that load without failure. It is not a working load.</li><li><strong>kN to tonnes:</strong> divide by 9.81. 3,010 kN is about 307 tonnes-force.</li></ul>',
    },
    {
      type: 'standard_citation',
      standard: 'IACS UR W18 / W22',
      publisher: 'International Association of Classification Societies',
      title: 'Anchor chain cables and accessories including chafing chain for emergency towing arrangements (W18); Offshore mooring chain (W22)',
      clause: 'Test load tables',
      summary:
        'Both requirements give proof and breaking test loads as F = c × d² × (44 − 0.08d) kN, with d the nominal diameter in mm. The constant c is fixed per grade: for breaking load 0.0098 (U1), 0.0137 (U2), 0.0196 (U3), 0.0211 (ORQ), 0.0223 (R3), 0.0249 (R3S), 0.0274 (R4), 0.0304 (R4S) and 0.0320 (R5). Each classification society adopts these values in its own rules.',
    },

    { type: 'section_head', number: '/02', title: 'Ship anchor chain, grades U1 to U3.', anchor: 'u1-u3' },
    {
      type: 'paragraph',
      html: 'Stud link anchor chain from 12.5 to 137 mm, from our <a href="/p/stud-link-anchor-chain-grades-u1-u2-and-u3">stud link anchor chain</a> listing. U1 is mild steel and rarely specified now; U2 is the usual merchant-ship grade and U3 the special-quality grade for larger ships and where the rules let a smaller U3 replace a bigger U2. Above 137 mm, loads are quoted per order.',
    },
    {
      type: 'comparison_table',
      caption: 'Stud link anchor chain — proof and breaking loads (kN)',
      columns: ['mm', 'inch', 'Proof U1', 'Proof U2', 'Proof U3', 'Break U1', 'Break U2', 'Break U3'],
      rows: SHIP_STUD_LOADS,
    },
    {
      type: 'paragraph',
      html: 'Notice that U2’s proof load equals U1’s breaking load, and U3’s proof load equals U2’s breaking load, size for size. That is not a coincidence of rounding: the constants were set so each grade proves itself at the strength of the grade below. Studless ship chain in the same grades is listed separately, as <a href="/p/studless-anchor-chain-grades-u1-u2-and-u3">studless anchor chain</a>, with lower test loads.',
    },

    { type: 'section_head', number: '/03', title: 'Offshore mooring chain — breaking loads.', anchor: 'offshore-break' },
    {
      type: 'paragraph',
      html: 'Offshore mooring chain from 36 to 205 mm in the six grades of IACS W22. The breaking load is the same for stud link and studless chain of the same grade and size. Listings: <a href="/p/stud-link-offshore-mooring-chain-grades-orq-r3-r3s-r4-r4s-and-r5">stud link mooring chain</a> and <a href="/p/studless-offshore-mooring-chain-grades-orq-r3-r3s-r4-r4s-and-r5">studless mooring chain</a> (to 162 mm). Sizes above 162 mm are metric only.',
    },
    {
      type: 'comparison_table',
      caption: 'Offshore mooring chain — minimum breaking load (kN), stud link and studless',
      columns: ['mm', 'inch', 'ORQ', 'R3', 'R3S', 'R4', 'R4S', 'R5'],
      rows: OFFSHORE_BREAK,
    },

    { type: 'section_head', number: '/04', title: 'Offshore mooring chain — proof loads.', anchor: 'offshore-proof' },
    {
      type: 'paragraph',
      html: 'Proof loads differ between the two types from R3S upward, because a studless link deforms more under load than one held open by a stud. For ORQ and R3 the two are tested alike.',
    },
    {
      type: 'comparison_table',
      caption: 'Stud link offshore mooring chain — proof load (kN)',
      columns: ['mm', 'inch', 'ORQ', 'R3', 'R3S', 'R4', 'R4S', 'R5'],
      rows: OFFSHORE_PROOF_STUD,
    },
    {
      type: 'comparison_table',
      caption: 'Studless offshore mooring chain — proof load (kN)',
      columns: ['mm', 'inch', 'ORQ', 'R3', 'R3S', 'R4', 'R4S', 'R5'],
      rows: OFFSHORE_PROOF_STUDLESS,
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Checking a figure yourself.',
      body: 'Take 76 mm R4: 0.0274 × 76² × (44 − 0.08 × 76) = 0.0274 × 5,776 × 37.92 = 6,001 kN. The same formula with the grade’s proof constant — 0.0216 stud link, 0.0192 studless — gives 4,731 kN and 4,205 kN. If a certificate disagrees with the formula by more than rounding, ask why.',
    },

    { type: 'section_head', number: '/05', title: 'Choosing a size.', anchor: 'choosing' },
    {
      type: 'paragraph',
      html: 'For a ship, the chart is the last step, not the first: the rules give the chain diameter for each grade from the ship’s equipment number, and the chart then tells you what that chain is tested to. See <a href="/blog/equipment-number-anchor-chain-sizing">how the equipment number sizes a ship’s anchors and chain</a>. For an offshore mooring the diameter and grade come from the mooring analysis. For both, the shackles, swivels and links must match the chain’s grade — see <a href="/blog/anchor-chain-cable-arrangement">the arrangement of a chain cable</a> — and the weight of the cable decides what the windlass and locker must take: <a href="/blog/anchor-chain-weight-chart">anchor chain weight per metre and per shot</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What size is 3 inch anchor chain in mm?', answer: '76 mm. Chain is made and certified to metric sizes; the inch figure is the nearest traditional equivalent.' },
        { question: 'What is the proof load of 76 mm U3 anchor chain?', answer: '3,010 kN, and its minimum breaking load is 4,300 kN.' },
        { question: 'Is the breaking load the safe working load?', answer: 'No. It is the minimum load the chain must survive in a test. Working loads are set by the ship rules or the mooring design with large safety factors.' },
        { question: 'Do stud link and studless chain have the same strength?', answer: 'Offshore chain of the same grade has the same minimum breaking load either way. From R3S up, studless chain is proof tested to a lower load. Studless ship chain is listed with lower loads than stud link.' },
        { question: 'How do I convert kN to tonnes?', answer: 'Divide by 9.81 for tonnes-force. 1,000 kN is about 102 t.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Chain in this chart',
      skus: ['IH-LR-AC-SLACGU1U2', 'IH-LR-AC-SACGU1U2U', 'IH-MR-MC-SL', 'IH-MR-MC-SS'],
    },
    { type: 'category_link', slug: 'anchor-chain', label: 'Anchor chain', blurb: 'Stud link and studless ship anchor chain, grades U1 to U3.' },
    { type: 'category_link', slug: 'offshore-mooring-chain', label: 'Offshore mooring chain', blurb: 'Grades ORQ to R5, stud link and studless, with adaptors.' },
    {
      type: 'related_articles',
      slugs: ['anchor-chain-weight-chart', 'offshore-mooring-chain-grades-r3-r4-r5', 'stud-link-vs-studless-chain', 'anchor-chain-grades-u1-u2-u3', 'equipment-number-anchor-chain-sizing'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-08',
      note: 'Loads from our live listings, which follow the IACS UR W18 and W22 test-load formula; checked against two makers’ published tables. The classification society’s rules govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need chain to a certificate?',
      body: 'Send the size, grade, type and number of shots, and the class society. We will quote the chain with a certificate for every shot.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
