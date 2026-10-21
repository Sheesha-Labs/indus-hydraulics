import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * SAE 100R14 PTFE hose ends and SAE 100R5 hose ends. Sources read 2026-10-21: Parker Parflex Catalog 4660 (919 / 919B
 * R14: natural FDA-compliant PTFE or black static-dissipative PTFE tube, 304 stainless braid, minimum .030" PTFE wall,
 * 100R14A / R14B, −100 to +450 °F, length change +2 / −4 %, min burst 4 × working; pressure and ID by dash; reduced ID;
 * 91N permanent fitting (-4 to -16; 91 for -20), 90 Series field attachable, 91N steel parts, "C" for stainless; use
 * 919B for non-conducting fluids such as oils, paints, fuels, steam). Parker Catalog 4400 (R5 201/206: one fibre braid
 * and one steel braid, fibre-braid cover; J517 100R5, J1402 AII, FMVSS 106; petroleum hydraulic fluids, lube oils,
 * diesel, antifreeze; −40 to +302 °F engine, 212 °F air brake; ID by dash; pressures; "SAE spec certification for 201
 * hose is for -4 through -12 only"; 26 Series crimp, 20 and 22 field attachable; dash sizing exception for R5, J1402 and
 * J2064 per Parker 4400/UK). Gates (shear-cut PTFE and deburr). Listing copy (316L and steel R14 ends by end form;
 * R5 ends JIC, inverted flare and NPTF; R14 and R5 ID beside dash).
 * NOT used: "inner support sleeve required" for PTFE ends (only the component list seen).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'ptfe-and-textile-hose-ends',
  title: 'PTFE (R14) and R5 textile hose ends: two hoses where the dash size is not the bore',
  excerpt:
    'A -4 R14 PTFE hose has a 3/16" bore, not 1/4" — and so does a -4 R5. Both hoses are sized to tube OD, both need their own hose ends, and both turn up where ordinary hydraulic hose will not do: PTFE for heat to 450 °F and aggressive fluids, R5 for engines, fuel and air brakes. Construction, ratings by size, the static-dissipative PTFE you need for fuels and oils, and the hose ends for each.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'PTFE R14 & R5 Hose Ends: Sizes, Ratings and Fittings',
  seoDescription:
    'A guide to SAE 100R14 PTFE hose and SAE 100R5 textile-covered hose and their hose ends: construction, temperature and pressure by size, dash size vs bore, static-dissipative PTFE, crimp and reusable fittings.',
  focusKeyword: 'ptfe hose fittings',
  publishedAt: '2026-10-21T21:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'R14 and R5 hoses are sized to the equivalent tube, not the bore: a -4 is 3/16" ID, a -8 is 13/32", a -16 is 7/8". Order the hose end by the hose type and dash, not by measuring the bore.',
        'SAE 100R14 is a PTFE tube in a 304 stainless braid; Parker’s 919 is rated −100 to +450 °F, 3,000 psi at -4 falling to 625 psi at -20.',
        'Use static-dissipative (black, R14B) PTFE when conveying non-conducting fluids such as oils, fuels, paints and steam.',
        'SAE 100R5 is one fibre braid and one steel braid under a fibre-braid cover, for petroleum fluids, lube oil, diesel, antifreeze and air brakes — 3,000 psi at -4 to 350 psi at -32.',
        'Each takes its own fitting series: Parker 91N crimp or 90 field-attachable on PTFE; 26 crimp or 20/22 reusable on R5.',
      ],
    },
    {
      type: 'lead',
      html: 'Most hydraulic hose is ordered by dash number, and the dash number is the bore in sixteenths of an inch. Two common hoses break that rule, and both need their own ends: PTFE hose for heat and chemicals, and R5 textile-covered hose for engines, fuel and air brakes. This guide covers both — what they are, how they are rated and which hose ends fit.',
    },

    { type: 'section_head', number: '/01', title: 'Dash size is not the bore.', anchor: 'sizing' },
    {
      type: 'comparison_table',
      caption: 'R14 PTFE (Parker 919) and R5 (Parker 201) — inside diameter and working pressure by dash',
      columns: ['Dash', 'Bore', 'R14 PTFE, psi', 'R5, psi'],
      rows: [
        { cells: ['-4', '3/16"', '3,000', '3,000'], highlight: true },
        { cells: ['-5', '1/4"', '3,000', '3,000'] },
        { cells: ['-6', '5/16"', '2,500', '2,250'] },
        { cells: ['-8', '13/32"', '2,000', '2,000'], highlight: true },
        { cells: ['-10', '1/2"', '1,500', '1,750'] },
        { cells: ['-12', '5/8"', '1,200', '1,500'] },
        { cells: ['-16', '7/8"', '1,000', '800'] },
        { cells: ['-20', '1-1/8"', '625', '625'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Parker’s handbook gives the exception directly: SAE 100R5 hydraulic hose, SAE J1402 air-brake hose and SAE J2064 air-conditioning hose use sizes equivalent to the corresponding metal tube. PTFE follows the same convention, and Parflex adds that PTFE smooth-bore hoses have a reduced inside diameter. A hose shop that measures the bore and orders the matching standard dash will get the wrong end.</p>',
    },

    { type: 'section_head', number: '/02', title: 'R14 PTFE hose.', anchor: 'ptfe' },
    {
      type: 'prose',
      html: '<p>Parflex describes its 919 hose as a natural FDA-compliant PTFE tube — 919B is black static-dissipative PTFE — inside a 304 stainless braid, with at least .030" of PTFE wall. 919 meets SAE 100R14A and 919B 100R14B. It is rated from −100 to +450 °F (−73 to +232 °C), changes length by +2% to −4% at maximum working pressure, and has a minimum burst of four times working pressure. PTFE resists almost every fluid and does not age on the shelf, which is why it is used on hot lines, chemical and paint service, steam and compressors.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Use static-dissipative PTFE on fuels and oils.',
      body: 'Parflex: use 919B, with its static-dissipative core, when conveying non-conducting fluids such as oils, paints, fuels or steam.',
    },
    {
      type: 'prose',
      html: '<p>PTFE needs its own hose ends: Parker’s 91N permanent fittings (91 at -20) and 90 Series field-attachable fittings, built with a tube component and offered in steel or stainless. Our R14 range is 316L stainless and plated steel, with BSPP, JIC 37° (straight, 45°, 90°), ORFS, DIN 24° light and heavy, NPT and tube-stub ends; our crimp ferrule range includes a specialty ferrule for PTFE hose. Cut PTFE with a shear and deburr the tube with a sharp knife, Gates advises.</p>',
    },

    { type: 'section_head', number: '/03', title: 'R5 textile-covered hose.', anchor: 'r5' },
    {
      type: 'prose',
      html: '<p>Parker’s 201 R5 hose has one fibre braid and one steel braid of reinforcement under a fibre-braid cover. It meets SAE J517 100R5, SAE J1402 AII and DOT FMVSS 106 for air brakes, and carries petroleum hydraulic fluids, lubricating oils, diesel and antifreeze, from −40 °F to +302 °F (150 °C) in engine service and 212 °F (100 °C) in air-brake service. Parker notes that SAE certification for 201 covers -4 to -12 only. Its fittings are the 26 Series crimp and the 20 and 22 Series field-attachable (reusable) ends; our R5 range carries JIC 37° female swivels (straight, 45°, 90°), inverted flare male swivels and NPTF male, and we list reusable R5 ends too (see <a href="/blog/crimped-reusable-or-ready-made-hose-assemblies">reusable hose ends</a>).</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What size is -4 PTFE hose?', answer: '3/16" inside diameter. R14 PTFE and R5 hose are sized to the equivalent tube, so the dash number is not the bore in sixteenths.' },
        { question: 'What temperature can PTFE hydraulic hose take?', answer: 'Parker’s 919 R14 hose is rated −100 °F to +450 °F (−73 °C to +232 °C).' },
        { question: 'When do I need static-dissipative PTFE hose?', answer: 'When conveying non-conducting fluids such as oils, fuels, paints or steam — Parker’s black 919B (R14B).' },
        { question: 'Can I use standard hose fittings on PTFE hose?', answer: 'No. PTFE hose takes fittings made for it — Parker’s 91N crimp or 90 Series field-attachable ends.' },
        { question: 'What is R5 hose used for?', answer: 'Engine and truck lines: petroleum hydraulic fluids, lube oil, diesel, antifreeze and air brakes (SAE J1402 AII, FMVSS 106).' },
        { question: 'What pressure is R5 hose rated for?', answer: 'Parker’s 201 is 3,000 psi at -4 and -5, 2,000 psi at -8, 800 psi at -16 and 350 psi at -32.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>R14 PTFE hose ends in stainless and steel, and R5 hose ends:</p>' + stockList(['r14-ptfe-hose-ends', 'r5-textile-hose-ends']),
    },
    {
      type: 'product_embed',
      heading: 'PTFE and R5 hose ends',
      skus: ['IH-SS-T91-FJX', 'IH-SS-T91-FJX90', 'IH-SS-T91-FBX', 'IH-SS-T91-FFX', 'IH-ST-T91-FJX', 'IH-CF-TEFLON', 'IH-ST-T5-FJX', 'IH-ST-T5-MIX'],
    },
    { type: 'category_link', slug: 'r14-ptfe-hose-ends', label: 'R14 PTFE hose ends', blurb: 'Stainless and steel hose ends for PTFE hose.' },
    { type: 'category_link', slug: 'r5-textile-hose-ends', label: 'R5 hose ends', blurb: 'JIC, inverted flare and NPTF ends for R5 hose.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parflex-4660', text: 'Parker Parflex. Catalog 4660 — Thermoplastic and PTFE Hose.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Parflex/CATALOG_4660-Thermoplastic_Hose.pdf' },
        { id: 'parker-4400', text: 'Parker Hannifin. Catalog 4400 — Hose Products (US).', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Hose-Products-Division/Catalog-4400-PDF-Files/HPD_4400_Catalog.pdf' },
        { id: 'parker-4400-uk', text: 'Parker Hannifin. Catalogue 4400/UK — Technical Handbook.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/Polymer-Hose-Division-Europe/Sales-and-Marketing-Bulletins/4400_Rubber-Hydraulic/Technical-Handbook-UK.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['sae-100r-hose-types', 'thermoplastic-hose-fittings-guide', 'braided-hose-crimp-fittings-guide', 'stainless-316l-hose-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'PTFE data from Parker Parflex Catalog 4660; R5 data and dash-size rule from Parker Catalog 4400 (US and UK).',
    },
    {
      type: 'cta_block',
      heading: 'PTFE or R5 assemblies?',
      body: 'Send the hose type and dash size (not the measured bore), the medium and temperature, and both ends. We will quote the hose and the matching ends.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
