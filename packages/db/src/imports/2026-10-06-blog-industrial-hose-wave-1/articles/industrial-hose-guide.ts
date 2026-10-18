import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The industrial hose pillar: the hub the application articles hang from.
 * Every figure is from the listings each section links to.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'industrial-hose-guide',
  title: 'Industrial hose: a buyer’s guide by application, pressure, temperature and coupling',
  excerpt:
    'Water, air, oil, fuel, chemicals, food, steam and abrasives each want a different hose. A guide to choosing industrial hose by what it carries — with the pressures, temperatures and couplings from our range.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T13:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do I choose an industrial hose?',
      answer:
        'Start with what the hose carries, not the pressure. The medium decides the tube compound; then check temperature, pressure and vacuum, the environment outside the hose, static, and the couplings at each end. Our range covers water and air at 10–40 bar, oil and fuel, UHMWPE and composite chemical hose, food hose in NBR, EPDM, silicone and PVC, steam hose to 18 bar at 10:1, abrasive hose and metal hose to +650 °C.',
    },
    {
      type: 'key_takeaways',
      heading: 'The short version',
      items: [
        'Select on the medium first. A hose strong enough for the pressure can still be the wrong compound for the product.',
        'Suction needs a helix and a vacuum rating; a delivery hose on a pump inlet will flatten.',
        'Temperature narrows the field fast: PVC to +55 °C, rubber water and oil hose to +70–100 °C, steam hose to +170–210 °C, silicone to +200 °C, PTFE to +260 °C, metal to +650 °C.',
        'Safety factors differ by duty: 3:1 for water, air and oil S&D, 4:1 for chemical and composite, 10:1 for steam.',
        'The coupling and clamp often set the assembly rating, not the hose.',
        'Fuel, powders and solvents need an anti-static path, bonded and earthed.',
      ],
    },
    {
      type: 'lead',
      html: 'Industrial hose is the hose for everything that is not hydraulic power: water, air, oil, fuel, chemicals, food, steam, slurry and powder. On a hydraulic circuit, pressure is the hard constraint and everything else follows. On a transfer hose, <strong>the medium is the hard constraint</strong> — and a hose that is nominally strong enough can still be entirely unsuitable. This guide walks the decision in the order that avoids that mistake, and links to the detail on each part of it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Six questions, in this order.',
      anchor: 'six-questions',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing an industrial hose',
      intro: 'Answer these in order. Each one removes hoses from the list before the next is asked.',
      branches: [
        {
          condition: 'What does it carry?',
          outcome: 'The medium sets the tube: SBR or NR for water and air, NBR for oil and fuel, UHMWPE or composite films for chemicals, food-grade NBR, EPDM, silicone or PVC for food, EPDM for steam.',
        },
        {
          condition: 'How hot, and how cold?',
          outcome: 'PVC stops at +55 °C; rubber water and oil hose at +70 to +100 °C; steam hose to +210 °C; silicone to +200 °C; PTFE to +260 °C; metal hose to +650 °C.',
        },
        {
          condition: 'Pressure, vacuum, or both?',
          outcome: 'Suction needs a helix and a printed vacuum rating. Check the working pressure at your bore — PVC ratings fall as the size rises.',
        },
        {
          condition: 'What is outside the hose?',
          outcome: 'Sun, abrasion, being driven over, salt air or flame decide the cover — and whether a rubber hose is the right construction at all.',
        },
        {
          condition: 'Does static matter?',
          outcome: 'Fuel, solvents and dry powders need anti-static wires or a conductive tube, bonded to earthed couplings.',
        },
        {
          condition: 'What is at each end?',
          outcome: 'Match the coupling family to the equipment and rate the assembly at its weakest part — hose, coupling or clamp.',
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our article on <a href="/blog/industrial-hose-is-not-hydraulic-hose">why industrial hose is not hydraulic hose</a> explains the first question in more depth. The rest of this guide takes each in turn.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'By application.',
      anchor: 'by-application',
    },
    {
      type: 'comparison_table',
      caption: 'Industrial hose in our range, by duty',
      columns: ['Duty', 'Our hoses', 'Pressure', 'Temperature'],
      rows: [
        { cells: ['Water suction and delivery', 'A210, A216 rubber; IRRIBULK, DELVAC PVC', '10 / 16 bar rubber; 3–8 bar PVC', '−35 to +70 °C rubber; −10 to +55 °C PVC'] },
        { cells: ['Compressed air', 'A101HP, A102HP, A190, A116EU100', '20 bar; 40 bar hot air', 'to +80 °C; +100 °C hot air'] },
        { cells: ['Oil suction and delivery', 'A430, A460, A400EU', '10 / 20 bar', '−40 to +100 °C'] },
        { cells: ['Fuel and tanker', 'A420 reeling; A901GG, A901AG composite', '14 – 20 bar', '−30 to +80 °C'] },
        { cells: ['Chemical transfer', 'A410, A416 UHMWPE; A906PG, A911SG composite', '10 – 20 bar', 'to +100 °C; +120 °C PTFE composite'], highlight: true },
        { cells: ['Food and beverage', 'SANF, SANB NBR; SANSIL silicone; PREMVIN PVC', '2 – 12 bar', '−40 to +200 °C by material'] },
        { cells: ['Steam and hot water', 'A235BU, A235BK, A230', '7 / 10 / 18 bar at 10:1', 'to +170 °C; +210 °C on A230'] },
        { cells: ['Abrasive and bulk', 'A361; PREMFLEX', '10 bar; 3–5 bar', '−40 to +70 °C; −10 to +55 °C'] },
        { cells: ['Extreme temperature or media', 'Corrugated metal and PTFE hose', 'to 414 bar metal; 350 bar PTFE', '−200 to +650 °C metal; −73 to +260 °C PTFE'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Each duty has its own article. Water: <a href="/blog/pvc-or-rubber-suction-hose">PVC or rubber suction hose</a> and <a href="/blog/water-suction-and-dewatering-hose">dewatering hose</a>. Air: <a href="/blog/compressed-air-hose-selection">compressed air hose selection</a>. Oil and fuel: <a href="/blog/oil-suction-and-discharge-hose">oil suction and discharge hose</a> and <a href="/blog/tanker-loading-and-vapour-recovery-hose">tanker loading and vapour recovery hose</a>. Chemicals: <a href="/blog/uhmwpe-chemical-hose">UHMWPE chemical hose</a>, <a href="/blog/composite-hose-explained">composite hose</a> and <a href="/blog/chemical-transfer-hose-selection">reading a compatibility chart</a>. Food: <a href="/blog/food-hose-materials-compared">food hose materials</a> and <a href="/blog/food-grade-hose-compliance">food-grade compliance</a>. Steam: <a href="/blog/steam-hose-safety">steam hose safety</a>. Abrasives: <a href="/blog/bulk-material-and-sandblast-hose">bulk material and sandblast hose</a>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The tube follows the medium.',
      anchor: 'tube',
    },
    {
      type: 'paragraph',
      html: 'The tube is the only part of the hose that touches the product, and its compound is the decision. SBR and natural rubber suit water, air and abrasive solids — natural rubber in particular resists sliding abrasion, which is why our bulk material hose uses it. Nitrile (NBR) resists oil and fuel, and our oil suction and delivery hoses use NBR rated for 50% aromatic hydrocarbons. EPDM handles hot water and steam but swells in oil. UHMWPE linings and composite films resist a very wide range of chemicals. For food, the same chemistry applies inside food-quality compounds: NBR for fats, EPDM for hot cleaning, platinum-cured silicone for the widest temperature range.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check the gasket as well as the tube.',
      body: 'A compatible hose fitted with an incompatible coupling gasket fails at the gasket. Specify the hose, the coupling body and the gasket against the same medium, concentration and temperature.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Pressure, vacuum and the safety factor.',
      anchor: 'pressure',
    },
    {
      type: 'paragraph',
      html: 'Read three numbers off a listing or a layline: the working pressure, the vacuum rating if it is a suction hose, and the safety factor. Our water, air and oil suction and delivery hoses are built to 3:1; chemical, composite and silicone hoses to 4:1; steam hose to 10:1 — the reasons are in <a href="/blog/industrial-hose-safety-factors">industrial hose safety factors</a>. A suction hose prints its vacuum: 700 mmHg on A210, 0.93 bar on A430, 0.9 bar on A460. The print itself is decoded in <a href="/blog/reading-an-industrial-hose-layline">reading an industrial hose layline</a>.',
    },
    {
      type: 'paragraph',
      html: 'Watch for ratings that change with size. PVC suction hose is rated per bore, falling from up to 12 bar on the smallest food hose to 2–3 bar at 6". Rubber suction hose holds one rating across its range. Couplings derate too: our cam and groove halves step from 250 psi at 2" to 75 psi at 6".',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Temperature, inside and out.',
      anchor: 'temperature',
    },
    {
      type: 'paragraph',
      html: 'A hose\'s temperature rating describes the medium, but in this region the outside matters as much. A dark hose on a site in summer can pass 55 °C on its surface carrying nothing warm — the upper limit of every PVC hose we list. Rubber water and air hoses run to +70 or +80 °C, oil hose to +100 °C, steam hose to +170 °C and our high-pressure steam hose to +210 °C. Silicone reaches +200 °C, PTFE +260 °C and corrugated metal hose +650 °C. Where heat comes from outside — a furnace, a steam range, an exhaust — choose for that, not for the fluid.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Static and conductivity.',
      anchor: 'static',
    },
    {
      type: 'paragraph',
      html: 'Fuel, solvents and dry powders build electrostatic charge as they flow, and a discharge at a coupling can ignite vapour or dust. Hoses for those duties carry anti-static wires or a conductive tube: copper braids on our tanker reeling and UHMWPE hoses, anti-static wires on our oil and bulk material hoses, an anti-static tube on A361 and A101AS-T3. The path only works if the couplings are bonded to it and earthed. Test continuity coupling to coupling when the assembly is built and at every inspection; a broken bond looks exactly like a good hose.',
    },

    {
      type: 'section_head',
      number: '/07',
      title: 'Couplings and clamps.',
      anchor: 'couplings',
    },
    {
      type: 'paragraph',
      html: 'The coupling is chosen by the equipment at the other end and by the region the hose will work in. Cam and groove dominates tanker, pump and chemical transfer; Storz, Guillemin, Barcelona and GOST are the symmetrical fire and water couplings of different countries; Bauer and ring lock join irrigation and slurry lines; universal claw couplings run site air; ground joints and EN 14423 clamps carry steam; EN 14420 fittings and DIN 2817 safety clamps hold chemical hose. Our <a href="/blog/industrial-hose-couplings-guide">industrial hose couplings guide</a> covers every family we stock, and <a href="/blog/industrial-hose-clamps">industrial hose clamps</a> covers the part that most often decides the rating.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Rate the assembly at its weakest part.',
      body: 'A 20 bar hose on a 6" cam and groove coupling is a 5 bar assembly. A 16 bar suction hose on a nipple held by one band clamp is whatever that clamp holds. Mark every assembly at the rating of its weakest component and pressure-test it as an assembly.',
    },

    {
      type: 'section_head',
      number: '/08',
      title: 'When rubber is the wrong construction.',
      anchor: 'beyond-rubber',
    },
    {
      type: 'paragraph',
      html: 'Some duties rule out rubber altogether: sustained high temperature, cryogenic cold, fire exposure, permeation, or media that attack every elastomer. Those are the territory of <a href="/blog/metal-hose-guide">metal hose</a> — corrugated stainless and exotic alloy cores, braided for pressure — and of <a href="/blog/ptfe-hose-explained">PTFE hose</a>, the most chemically inert liner available.',
    },

    {
      type: 'section_head',
      number: '/09',
      title: 'Inspection and replacement.',
      anchor: 'inspection',
    },
    {
      type: 'paragraph',
      html: 'Industrial hose fails at the couplings and at the bends more often than in the middle. Inspect for cover damage that exposes reinforcement, kinks and flattened sections, softening or swelling near the ends, a helix that has deformed, and couplings that have moved on their shanks. Re-tighten bolted clamps after the first pressurisation. Retire any hose that has been kinked, crushed or overheated, and any whose layline and tag have gone so it can no longer be identified. Steam hose deserves a defined replacement programme, because it deteriorates from the inside where inspection cannot reach.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between industrial and hydraulic hose?',
          answer:
            'Hydraulic hose carries oil at high pressure to transmit power, and is selected on pressure first. Industrial hose transfers media — water, air, oil, chemicals, food, steam — and is selected on the medium first, at much lower pressures.',
        },
        {
          question: 'Which industrial hose is best for suction?',
          answer:
            'One with a helix and a printed vacuum rating: our rubber A210 (700 mmHg) and A216 for water, A430 (0.93 bar) and A460 (0.9 bar) for oil, A410 and A416 for chemicals.',
        },
        {
          question: 'What temperature can industrial hose handle?',
          answer:
            'It depends on the construction: PVC to +55 °C, rubber water and oil hose to +70–100 °C, steam hose to +210 °C, silicone to +200 °C, PTFE to +260 °C and metal hose to +650 °C on our listings.',
        },
        {
          question: 'Do I need an anti-static hose?',
          answer:
            'For fuel, solvents and dry powders, yes. Use a hose with anti-static wires or a conductive tube, bonded to earthed couplings, and test continuity.',
        },
        {
          question: 'Which coupling should an industrial hose have?',
          answer:
            'The one that matches the equipment and the region — cam and groove for most transfer work, Storz, Guillemin or another symmetrical coupling for fire and water, ground joints for steam. Our couplings guide covers each family.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'One hose from each duty',
      skus: ['IH-IH-A216', 'IH-IH-A101HP', 'IH-IH-A460', 'IH-IH-A420', 'IH-IH-A416', 'IH-IH-SANF', 'IH-IH-A230', 'IH-IH-A361'],
    },
    {
      type: 'category_link',
      slug: 'industrial-hose-suppliers-uae',
      label: 'Industrial hose',
      blurb: 'Every industrial hose shelf, couplings and clamps.',
    },
    {
      type: 'category_link',
      slug: 'oil-chemical-purpose-hoses',
      label: 'Oil, chemical and general-purpose hose',
      blurb: 'Oil S&D, UHMWPE chemical, tanker reeling and multipurpose hose.',
    },
    {
      type: 'category_link',
      slug: 'metallic-hose-suppliers-uae',
      label: 'Metal hose',
      blurb: 'Corrugated stainless and exotic alloy hose, PTFE hose and metal hose couplings.',
    },

    {
      type: 'cta_block',
      heading: 'Not sure which hose the job needs?',
      body: 'Tell us what it carries, the temperature, pressure or vacuum, the bore and length, and the connection at each end. We will recommend the hose and couplings and quote the tested assembly.',
      quoteLabel: 'Ask about a hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Pressures, temperatures, safety factors and constructions checked against our industrial hose listings.',
    },
  ],
}

export default ARTICLE
