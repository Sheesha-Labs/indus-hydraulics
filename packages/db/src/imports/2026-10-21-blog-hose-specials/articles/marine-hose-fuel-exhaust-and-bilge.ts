import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Marine hose: USCG/SAE J1527 fuel hose types, EPA low-permeation "-15", wet exhaust R1/R2, heater, bilge and water
 * hose, clamping. Sources read 2026-10-21: 33 CFR 183 Subpart J (183.540 types A1/A2/B1/B2 and permeation classes,
 * 183.590 fire test, 183.558 placement, 183.540 marking, 183.530/560 clamps and fitting beads, 183.501 scope: boats with
 * inboard gasoline engines, not outboards); 40 CFR 1060.102 (15 g/m²/day EPA Nonroad fuel lines, 10 low-emission);
 * ABYC article on hose clamps (two clamps on fuel fill hose per H-24/H-33 and on exhaust per P-1; extra clamps on a
 * barb designed for one can damage the hose); maker series data for exhaust, heater and bilge hose temperatures.
 * NOT used: SAE J2006 and J20 formal class wording (SAE not readable); NSF 61 scope.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'marine-hose-fuel-exhaust-and-bilge',
  title: 'Marine hose: fuel hose types A1 and A2, wet exhaust hose, bilge and water hose',
  excerpt:
    'A boat carries half a dozen hose types, each with its own rule: USCG fuel hose graded A1, A2, B1 or B2 by fire test and permeation, low-permeation “-15” hose for EPA rules, soft-wall and hard-wall wet exhaust hose, heater hose, and clear PVC for bilge, live-well and fresh water. What the letters and numbers mean, which hose may go where in a fuel system, how many clamps each joint needs, and which hoses must never go below the waterline.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Marine Hose Guide: A1/A2 Fuel, Wet Exhaust & Bilge Hose',
  seoDescription:
    'Marine hose explained: USCG Type A1, A2, B1 and B2 fuel hose (SAE J1527), EPA A1-15 and B1-15 low-permeation hose, wet exhaust hose soft-wall vs hard-wall, heater hose, bilge and fresh-water hose, clamping rules.',
  focusKeyword: 'marine fuel hose a1 vs a2',
  publishedAt: '2026-10-22T00:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'USCG fuel hose letters mean fire test (A = passed the 2½-minute fire test, B = not tested); the digit means permeation (1 = ≤100 g/m²/24 h, 2 = ≤300).',
        'A1 is required from tank to engine and pump to carburettor; A1 or A2 for fill and vent lines (B types only where the 5 oz spill test is met).',
        '“-15” — A1-15, B1-15 — marks EPA low-permeation fuel line, 15 g/m²/day or less.',
        'ABYC requires two clamps on fuel fill hose and two non-overlapping clamps at each end of exhaust hose.',
        'Soft-wall exhaust hose is for short straight runs; hard-wall hose with a wire helix is for bends.',
      ],
    },
    {
      type: 'lead',
      html: 'Marine hose fails differently from industrial hose: a fuel leak in an enclosed bilge, an exhaust hose that lets cooling water and fumes into the engine room, a clear PVC hose below the waterline that splits and sinks the boat. Most of the rules that prevent these come from three sources — the US Coast Guard’s fuel system regulations, EPA permeation limits and ABYC standards — and the hose layline tells you which ones a hose meets.',
    },

    { type: 'section_head', number: '/01', title: 'Fuel hose: A1, A2, B1, B2 and “-15”.', anchor: 'fuel' },
    {
      type: 'comparison_table',
      caption: 'USCG fuel hose types (33 CFR 183.540)',
      columns: ['Type', 'Permeation (SAE J1527)', 'Fire test (183.590)', 'Use'],
      rows: [
        { cells: ['A1', 'Class 1 — ≤100 g/m² in 24 h', 'Yes', 'Fuel feed: tank to engine, pump to carburettor'], highlight: true },
        { cells: ['A2', 'Class 2 — ≤300 g/m² in 24 h', 'Yes', 'Fill and vent lines'] },
        { cells: ['B1', 'Class 1', 'No', 'Feed or fill only where the 5 oz / 2½ min spill test is met'] },
        { cells: ['B2', 'Class 2', 'No', 'Fill or vent only where the spill test is met'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The fire test is a free-burning heptane fire for 2½ minutes, reaching at least 648 °C near the hose. The <strong>B</strong> types are allowed in a fill, vent or tank-to-engine line only if no more than five ounces of fuel escapes in 2½ minutes with the hose cut at its lowest point. Fuel hose must be marked “USCG TYPE A1” (or A2, B1, B2), with the year and maker, in capitals at least 1/8 in high, at intervals of 12 in or less.</p><p>The <strong>“-15”</strong> suffix is an EPA mark: 40 CFR 1060 limits nonroad fuel lines on marine spark-ignition engines, including outboards and portable tanks, to 15 g/m² per day. So A1-15 is a USCG A1 hose that also meets EPA’s low-permeation limit; B1-15 is the common outboard supply line.</p><p>Scope matters: the Coast Guard fuel-system rules apply to boats with inboard gasoline engines, not to outboard engines or diesel-only boats — though ABYC standards cover both gasoline (H-24) and diesel (H-33) systems.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never use A2 hose on a fuel feed line.',
      body: 'A2 is fire-tested but has the higher permeation class; the regulations allow it on fill and vent lines, not from tank to engine. Read the layline before replacing a feed hose.',
    },

    { type: 'section_head', number: '/02', title: 'Clamps and fittings.', anchor: 'clamps' },
    {
      type: 'prose',
      html: '<ul><li>Use hose designed for clamps, with clamps beyond the bead, flare or serrations of the fitting. The regulations require fittings with a bead, flare or annular serrations at least 0.015 in deep — a continuous thread or knurl does not count — and a clamp that does not rely only on spring tension.</li><li><strong>Fuel fill hose:</strong> ABYC requires at least two corrosion-resistant metal clamps at each connection, with bands at least ½ in (12.7 mm) wide.</li><li><strong>Exhaust hose:</strong> ABYC P-1 requires at least two non-overlapping clamps at each end.</li><li>Do not add a second clamp to a barb designed for one — ABYC warns it can damage the hose and weaken the joint. Match hose ID to the fitting OD and do not overtighten.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'Exhaust, heater, bilge and water hose.', anchor: 'other' },
    {
      type: 'comparison_table',
      caption: 'Other marine hose types',
      columns: ['Hose', 'Construction', 'Use'],
      rows: [
        { cells: ['Wet exhaust, soft wall (SAE J2006 R1)', 'Rubber with fabric plies, no helix', 'Short, straight exhaust and raw-water connections'], highlight: true },
        { cells: ['Wet exhaust, hard wall (SAE J2006 R2)', 'Wire helix between plies', 'Longer bent runs; resists collapse'] },
        { cells: ['Silicone wet exhaust', 'Silicone with polyester plies', 'Higher temperature — makers rate to about 350 °F'] },
        { cells: ['Heater hose (SAE J20R3)', 'Rubber with spiral polyester', 'Engine coolant and heater lines — typically 50 psi, 212 °F'] },
        { cells: ['Clear PVC bilge, live-well and water hose', 'PVC, often with a helix', 'Unpressurised water, drain and vent lines'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Wet exhaust hose is rated by temperature — makers rate common hard-wall rubber hose at 280 °F (138 °C) — because it relies on cooling water injected upstream. Clear PVC hose is light and cheap but makers mark many of them “not recommended for below-waterline through-hull connections”: use reinforced rubber hose on anything that can sink the boat if it fails. “FDA” on PVC water hose means the compound uses food-contact ingredients; it is not the same as NSF/ANSI 61 drinking-water certification.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between A1 and A2 fuel hose?', answer: 'Both pass the USCG fire test; A1 has the lower permeation class (≤100 g/m²/24 h) and is required for fuel feed lines, A2 (≤300) is allowed for fill and vent lines.' },
        { question: 'What does A1-15 mean?', answer: 'A USCG Type A1 hose that also meets EPA’s nonroad low-permeation limit of 15 g/m² per day.' },
        { question: 'How many clamps on a marine exhaust hose?', answer: 'ABYC P-1 requires at least two non-overlapping clamps at each end.' },
        { question: 'Can I use clear PVC hose below the waterline?', answer: 'Makers commonly say no for through-hull connections; use reinforced rubber hose rated for the duty.' },
        { question: 'Soft-wall or hard-wall exhaust hose?', answer: 'Soft-wall for short straight runs; hard-wall with a wire helix for bends and longer runs.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Marine fuel, exhaust, heater, bilge and water hose:</p>' + stockList(['marine-hoses']),
    },
    {
      type: 'product_embed',
      heading: 'Marine hose',
      skus: ['IH-MH-FUEL-365', 'IH-MH-FUEL-327', 'IH-MH-FUEL-305', 'IH-MH-EXHT-250', 'IH-MH-EXHT-202V', 'IH-MH-EXHT-130', 'IH-MH-BLG-147', 'IH-MH-BLG-120'],
    },
    { type: 'category_link', slug: 'marine-hoses', label: 'Marine hoses', blurb: 'Fuel, exhaust, heater, bilge and water hose.' },
    { type: 'page_link', kind: 'industry', slug: 'marine', label: 'Marine', blurb: 'Boatyards, workboats and marine services.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'cfr-183-j', text: 'US eCFR. 33 CFR Part 183, Subpart J — Fuel Systems.', url: 'https://www.ecfr.gov/current/title-33/chapter-I/subchapter-S/part-183/subpart-J' },
        { id: 'cfr-1060-102', text: 'US eCFR. 40 CFR 1060.102 — Permeation emission specifications for fuel lines.', url: 'https://www.ecfr.gov/current/title-40/chapter-I/subchapter-U/part-1060/subpart-B/section-1060.102' },
        { id: 'abyc-clamps', text: 'ABYC. Hose clamps: two clamps and installation.', url: 'https://abycinc.org/hose-clamps-two-clamps-and-installation/' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['industrial-hose-clamps', 'antistatic-fuel-transfer-hose-guide', 'reading-an-industrial-hose-layline', 'water-suction-and-dewatering-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Fuel hose rules from 33 CFR 183 and 40 CFR 1060; clamping from ABYC; exhaust and heater ratings from maker series data.',
    },
    {
      type: 'cta_block',
      heading: 'Re-hosing a boat?',
      body: 'Send each line — fuel feed, fill, vent, exhaust, raw water, bilge — with its inside diameter and length. We will quote hose to the right type and the clamps for each joint.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
