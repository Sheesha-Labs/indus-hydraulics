import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Brass air brake fittings: compression (copper and nylon tube) and DOT push-in. Sources read 2026-10-21: Parker
 * Catalog 3501E (Brass, Composite and Thermoplastic Fittings, rev 05/22): SAE standard summaries (J246 spherical and
 * flanged sleeve compression; J844 nonmetallic air brake tubing types A and B; J1131 performance of J844 tube and
 * fitting assemblies; J2494 brass-body push-to-connect); NTA compression for nylon (ribbed sleeve, 150 psi, −40 to
 * +200 °F, meets FMVSS 571.106 performance, J246 and J1131; insert tube until it bottoms; make-up turns); AB
 * compression for copper (400 psi, −65 to +250 °F, 2 / 3 turns); PTC brass push-to-connect (brass collet, Buna-N
 * O-ring, stainless tube support, 250 psi, J2494 / J2494-3, FMVSS 106; cut square, mark insertion depth, insert to
 * bottom, pull to check; insertion depths). Parker 1120 nylon air brake tubing (J844 and FMVSS 106, 150 psi, −40 to
 * +200 °F, burst figures, 1/8, 3/16, 5/16 "not DOT sizes"). 49 CFR 571.106 (FMVSS 106): marking of plastic air brake
 * tubing and end fittings (DOT, manufacturer, "A", nominal OD), S11 tests. SAE J844 scope (not for below −40 °C, above
 * +93 °C, above 150 psi, or battery-acid areas). ISO 14743 excludes air brakes.
 * NOT used: a blanket "always use a tube insert" rule (not in Parker's NTA text); other makers' data.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'brass-air-brake-fittings-guide',
  title: 'Brass air brake fittings: compression for copper and nylon, DOT push-in, and the standards behind them',
  excerpt:
    'A truck air brake line is built to a 150 psi tube, and the fittings on it are rated from 150 to 400 psi depending on type — so the tube, not the brass, sets the system. Compression fittings for copper and for nylon, DOT push-in fittings, what SAE J246, J844, J1131 and J2494 each cover, what the DOT marking on a fitting means under FMVSS 106, and how to make each joint up so it does not leak air at the next inspection.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Brass Air Brake Fittings: Compression, DOT Push-In & SAE Standards',
  seoDescription:
    'A guide to brass air brake fittings for trucks and buses: compression fittings for copper and nylon tube, DOT push-in fittings, SAE J246, J844, J1131 and J2494, FMVSS 106 DOT marking, pressure ratings and make-up.',
  focusKeyword: 'brass air brake fittings',
  publishedAt: '2026-10-21T20:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Air brake systems run nylon tube to SAE J844, which is not intended for service above 150 psi, below −40 °C, above +93 °C or where battery acid can reach it.',
        'Three fitting types: compression for copper (Parker AB, 400 psi), compression for nylon (Parker NTA, 150 psi, ribbed sleeve) and brass push-to-connect (Parker PTC, 250 psi). The tube sets the system limit.',
        'SAE J246 covers sleeve compression fittings, J2494 brass push-to-connect fittings, and J1131 the performance of J844 tube-and-fitting assemblies.',
        'Under FMVSS 106, air brake tubing end fittings are marked DOT, with the maker, the letter "A" and the nominal tube OD.',
        'Push-in fittings fail when the tube is not fully home: cut it square, mark the insertion depth, push to the bottom and pull to check.',
      ],
    },
    {
      type: 'lead',
      html: 'Air brakes on trucks, trailers and buses are plumbed in nylon tube, with brass fittings at every valve, tank and chamber. The fittings are small and cheap and every one of them is a safety part. This guide covers the fitting types, the SAE and DOT requirements behind them, and how to make up each joint.',
    },

    { type: 'section_head', number: '/01', title: 'The tube sets the limit.', anchor: 'tube' },
    {
      type: 'prose',
      html: '<p>Nylon air brake tube is made to <strong>SAE J844</strong>, in non-reinforced Type A and reinforced Type B. J844 is not intended for any part of a system that runs below −40 °C (−40 °F), above +93 °C (+200 °F), above a maximum working pressure of 1,030 kPa (150 psi), or where battery acid can attack it. Parker’s 1120 nylon air brake tubing, made to J844 and FMVSS 106, is rated 150 psi working from −40 to +200 °F, with burst figures such as 1,200 psi for ¼" Type A and 1,400 psi for ⅜" Type B — and Parker notes that ⅛", 3/16" and 5/16" are not DOT sizes.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Parker air brake fitting families',
      columns: ['Family', 'Type', 'Tube', 'Rating', 'Temperature'],
      rows: [
        { cells: ['AB', 'Compression, brass sleeve', 'Copper', '400 psi (27.5 bar)', '−65 to +250 °F'] },
        { cells: ['NTA', 'Compression, ribbed sleeve', 'J844 nylon, types A and B', '150 psi (10.3 bar)', '−40 to +200 °F'], highlight: true },
        { cells: ['PTC brass', 'Push-to-connect: brass collet, nitrile O-ring, stainless tube support', 'J844 nylon, 5/32"–3/4"', '250 psi (17.2 bar)', '−40 to +200 °F'] },
        { cells: ['Air brake hose ends', 'Compression', 'Hose, 3/8"–1/2"', '225 psi (15 bar)', '−50 to +212 °F'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'The standards.', anchor: 'standards' },
    {
      type: 'comparison_table',
      caption: 'Air brake standards (as summarised by Parker, and FMVSS 106)',
      columns: ['Standard', 'Covers'],
      rows: [
        { cells: ['SAE J246', 'Spherical and flanged sleeve (compression) tube fittings'] },
        { cells: ['SAE J844', 'Nonmetallic air brake system tubing, types A and B'] },
        { cells: ['SAE J1131', 'Performance of J844 tubing and fitting assemblies in air brake systems — compression and push-to-connect alike'], highlight: true },
        { cells: ['SAE J2494', 'Brass-body push-to-connect fittings'] },
        { cells: ['FMVSS 106 (49 CFR 571.106)', 'US federal brake hose standard: marking and tests for air brake hose, plastic tubing and end fittings'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>FMVSS 106 requires plastic air brake tubing to be marked at least every 6 inches with "DOT", the manufacturer, the date, the nominal OD followed by "OD", and the letter "A", and its end fittings to be marked "DOT", the manufacturer, "A" and the nominal tube OD. Its tests include burst (for example 1,200 psi for ¼" tube), vibration at 120 psig for a million cycles, end-fitting retention, and a serviceability test that allows no more than 25 cm³/min leakage at 120 psi after five assembly cycles. A "DOT" fitting is one its maker has certified to those requirements. Note that the general pneumatic push-in standard, ISO 14743, explicitly does not apply to air braking systems — a workshop air push-in fitting is not an air brake fitting.</p>',
    },
    {
      type: 'standard_citation',
      standard: 'FMVSS 106',
      publisher: 'US NHTSA (49 CFR 571.106)',
      title: 'Brake hoses',
      summary:
        'Sets performance, labelling and test requirements for hydraulic, air and vacuum brake hose, plastic air brake tubing and their end fittings on motor vehicles in the United States — including the DOT, maker, date, size and "A" marking and burst, vibration, retention and leakage tests.',
    },

    { type: 'section_head', number: '/03', title: 'Making up each joint.', anchor: 'assembly' },
    {
      type: 'prose',
      html: '<ul><li><strong>Compression on copper (AB).</strong> Put the nut and sleeve on the tube, bottom the tube on the seat, then tighten — Parker gives 2 turns from hand-tight for ¼"–½" and 3 turns for ⅝"–¾".</li><li><strong>Compression on nylon (NTA).</strong> Insert the tube until it bottoms on the seat, then tighten until one thread remains visible, or by turns from hand-tight — Parker: 3/16" 2½, ¼" 3, ⅜" and ½" 4, ⅝" and ¾" 3½. A brass tube insert supports soft tube where the fitting calls for one.</li><li><strong>Push-to-connect (PTC).</strong> Cut the tube squarely (Parker allows at most 15° off square), mark the insertion depth, push the tube in until it bottoms, and pull on it to check it is held. Parker gives full insertion of 0.78" for ⅜" and 0.85" for ½" tube; a tube that passes the grab ring but not the O-ring will hold and still leak. Parker says its brass PTC cuts assembly time against compression by 90%.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Brake lines are safety parts.',
      body: 'Use only fittings rated for air brake service and certified to FMVSS 106 where it applies, matched to the tube type and OD. Do not substitute workshop pneumatic push-in fittings, and test the system for leaks before the vehicle returns to service.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What does DOT mean on an air brake fitting?', answer: 'That its maker certifies it to US FMVSS 106. End fittings for plastic air brake tubing are marked DOT, the maker, the letter A and the nominal tube OD.' },
        { question: 'What pressure are air brake fittings rated for?', answer: 'It varies by type: Parker’s nylon-tube compression fittings 150 psi, brass push-to-connect 250 psi, copper-tube compression 400 psi. The J844 nylon tube is limited to 150 psi.' },
        { question: 'What is the difference between compression and push-in air brake fittings?', answer: 'A compression fitting grips the tube with a sleeve squeezed by a nut; a push-in fitting grips it with a collet and seals with an O-ring, with no tools. Both are made for J844 tube.' },
        { question: 'Is SAE J1131 the push-in standard?', answer: 'No. J1131 sets performance requirements for J844 tube and fitting assemblies of any type; brass push-to-connect fittings are covered by SAE J2494.' },
        { question: 'Can I use ordinary pneumatic push-in fittings on air brakes?', answer: 'No. The general pneumatic push-in standard, ISO 14743, explicitly excludes air braking systems. Use DOT air brake fittings.' },
        { question: 'Why does a push-in air brake fitting leak?', answer: 'Usually the tube is not fully inserted, was cut at an angle or is scored. Re-cut square, mark the depth and push it fully home.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Brass air brake compression fittings for copper and nylon tube, sleeves, nuts and inserts, and DOT push-in air brake fittings:</p>' + stockList(['brass-air-brake-fittings', 'brass-dot-push-in-air-brake-fittings']),
    },
    {
      type: 'product_embed',
      heading: 'Air brake fittings',
      skus: ['IH-BR-31468', 'IH-BR-31469', 'IH-BR-31462', 'IH-BR-31460', 'IH-BR-31484', 'IH-BR-DOT68', 'IH-BR-DOT69', 'IH-BR-DOT62'],
    },
    { type: 'category_link', slug: 'brass-air-brake-fittings', label: 'Brass air brake fittings', blurb: 'Compression fittings for copper and nylon air brake tube.' },
    { type: 'category_link', slug: 'brass-dot-push-in-air-brake-fittings', label: 'DOT push-in air brake fittings', blurb: 'Brass push-in fittings for nylon air brake tube.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'parker-3501e', text: 'Parker Hannifin. Catalog 3501E — Brass, Composite and Thermoplastic Fittings and Valves (rev. 05/22).', url: 'https://www.parker.com/content/dam/parker/lam/catalogs/pdf/4---conectores---mangueiras---v%C3%A1lvulas---instrumentos-para-flu%C3%ADdos/1---baixa-press%C3%A3o/Brass,%20Composite%20and.pdf' },
        { id: 'parker-1120', text: 'Parker Parflex. 1120 Series Nylon Air Brake Tubing datasheet.', url: 'https://www.parker.com/content/dam/Parker-com/Literature/India/2019-Excon-Exhibition/Air-Brake-Tubing.pdf' },
        { id: 'fmvss-106', text: '49 CFR 571.106 — FMVSS No. 106, Brake hoses.', url: 'https://www.law.cornell.edu/cfr/text/49/571.106' },
        { id: 'iso-14743', text: 'ISO 14743:2020 — Pneumatic fluid power, push-in connectors for thermoplastic tubes.', url: 'https://www.iso.org/standard/73164.html' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['brass-pipe-fittings-nptf-and-bsp', 'push-to-connect-air-fittings', 'brass-flare-and-compression-fittings', 'port-and-terminal-fittings'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Fitting families, ratings and make-up from Parker Catalog 3501E; tube limits from SAE J844 and Parker; marking and tests from FMVSS 106.',
    },
    {
      type: 'cta_block',
      heading: 'Stocking a truck workshop?',
      body: 'Send the tube type and OD, the fitting shapes and the thread at the valve. We will quote DOT air brake fittings, sleeves and inserts to match.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
