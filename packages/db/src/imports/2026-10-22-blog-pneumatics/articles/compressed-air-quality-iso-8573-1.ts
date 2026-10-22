import type { BlogArticleSeed } from '../shared'
import { stockListBy } from '../products'

/**
 * ISO 8573-1 air quality. Class table: ISO 8573-1:2010 as reproduced in MAC Valves' "Compressed Air Quality
 * Recommendations" sheet (particle counts per m³ by size band, mass classes 6–7, pressure dew point classes 1–6,
 * liquid water 7–9, total oil classes 1–4; class 0 "as specified by the equipment user or supplier"), cross-checked
 * against Atlas Copco's "Understanding ISO classes" page and EXAIR's ISO 8573-1 posts. MAC's own minimum for its
 * products: [7:4:3]. Typical classes: Atlas Copco (food and beverage 1:2:1, pharmaceuticals 1:2:1, textile 4:4:3,
 * general pneumatic tools 3:4:4); BCAS/BRC food-grade guideline BPG 102 as reported by Atlas Copco and EXAIR (direct
 * contact 2:2:1, indirect 2:4:2; Process Engineering's 2006 report of the first edition gives non-contact 2:4:1);
 * EXAIR's clean-room example 1:1:1. Condensate and dew point: Compressed Air Challenge, "How's the weather in your
 * pipes?" (R. Marshall, Compressed Air Best Practices, Nov 2012) — no condensation inside the compression element,
 * condensation in the aftercooler, aftercooler outlet ~100% saturated, more drop-out as air cools to ambient, moisture
 * roughly doubles per 20 °F, dryer dew points (refrigerated 35/50 °F, desiccant −40 °F or lower, deliquescent
 * 64–80 °F, all at 100 °F saturated inlet), dry at the highest pressure, moisture washes away lubrication.
 * Sullair, "The Adversarial Relationship Between Compressed Air and Water" (2020): capacity inversely proportional to
 * pressure; at 100 psig air holds about 1/8 of its ambient moisture at the same temperature; discharge commonly
 * 190 °F or more. Atlas Copco "What is a pressure dew point?": PDP higher than atmospheric dew point.
 * Left out as unsourced: any Gulf ambient temperature or humidity figure, litres-of-condensate-per-day figures,
 * the class X limits, and a single "right" class for any application.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'compressed-air-quality-iso-8573-1',
  title: 'Compressed air quality and ISO 8573-1: purity classes, pressure dew point and where to fix the water',
  excerpt:
    'ISO 8573-1 writes air quality as three numbers — particles, water, oil. What [2:4:2] or [7:4:3] actually means, which classes food, paint, tools and valves are commonly specified at, why hot, humid air drops so much water once it is compressed and cooled, and why drains, coalescing filters and dryers — not the FRL at the machine — are where water is removed.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'ISO 8573-1 Air Quality Classes Explained',
  seoDescription:
    'ISO 8573-1 purity classes [particles:water:oil] explained: typical classes for food, tools and valves, pressure dew point, condensate, and dryers vs filters.',
  focusKeyword: 'ISO 8573-1 air quality classes',
  publishedAt: '2026-10-22T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'ISO 8573-1:2010 grades compressed air with three class numbers, written [particles:water:oil]. Lower is cleaner; class 0 is a limit the user or supplier specifies, stricter than class 1.',
        'Water classes 1–6 are pressure dew points, from −70 °C (class 1) to +10 °C (class 6); classes 7–9 are liquid water content. Oil classes 1–4 run from 0.01 to 5 mg/m³ total oil.',
        'Air is compressed hot and then cooled, and cooled air cannot hold the water it carried in. The Compressed Air Challenge notes air leaving an aftercooler is normally saturated.',
        'Water is removed centrally — drains, a dryer to set the pressure dew point, and coalescing filters for oil. A point-of-use FRL catches what is left; it cannot dry a wet system.',
        'There is no single correct class for an application. Specify the class the equipment maker or your industry guideline asks for, and size the treatment to that.',
      ],
    },
    {
      type: 'lead',
      html: 'Specify “clean, dry air” and every supplier will agree to it. Specify <strong>ISO 8573-1:2010 [2:4:2]</strong> and you have said exactly how many particles, how dry and how much oil — something a dryer and filter train can be designed to, and a test can confirm. This guide explains how to read the classes, what typical uses ask for, and where in a system each contaminant should actually be removed.',
    },

    { type: 'section_head', number: '/01', title: 'How to read a purity class.', anchor: 'notation' },
    {
      type: 'prose',
      html: '<p>ISO 8573-1 is part 1 of the ISO 8573 series on compressed air: it defines the purity classes, and the other parts describe how each contaminant is measured. The current edition is 2010. It deals with three contaminants, and each gets its own class number:</p><ul><li><strong>Particles</strong> — solid particles, counted per cubic metre in three size bands (classes 1–5), or by mass concentration (classes 6–7).</li><li><strong>Water</strong> — as a <em>pressure dew point</em> for classes 1–6, or as liquid water content for classes 7–9.</li><li><strong>Oil</strong> — total oil: aerosol, liquid and vapour together, in mg/m³ (classes 1–4).</li></ul><p>A specification is written as the standard plus the three numbers in that order: <strong>ISO 8573-1:2010 [A:B:C]</strong>, where A is the particle class, B the water class and C the oil class. MAC Valves, for example, gives its minimum air quality recommendation for its valves as <strong>[7:4:3]</strong>: particle class 7, a pressure dew point of +3 °C (+37 °F), and no more than 1 mg/m³ of oil.</p><p>Lower numbers are cleaner. <strong>Class 0</strong> does not mean zero contamination: it means a limit specified by the equipment user or supplier that is stricter than class 1. A class 0 claim is only meaningful with that agreed limit stated next to it.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'ISO 8573-1:2010 purity classes (maximum values; as reproduced by MAC Valves and checked against Atlas Copco and EXAIR)',
      columns: ['Class', 'Particles 0.1–0.5 µm per m³', 'Particles 0.5–1 µm per m³', 'Particles 1–5 µm per m³', 'Water', 'Total oil'],
      rows: [
        { cells: ['0', 'As specified by the user or supplier, stricter than class 1', '—', '—', 'As specified, stricter than class 1', 'As specified, stricter than class 1'] },
        { cells: ['1', '≤ 20,000', '≤ 400', '≤ 10', 'Pressure dew point ≤ −70 °C (−94 °F)', '≤ 0.01 mg/m³'], highlight: true },
        { cells: ['2', '≤ 400,000', '≤ 6,000', '≤ 100', 'PDP ≤ −40 °C (−40 °F)', '≤ 0.1 mg/m³'] },
        { cells: ['3', 'Not specified', '≤ 90,000', '≤ 1,000', 'PDP ≤ −20 °C (−4 °F)', '≤ 1 mg/m³'] },
        { cells: ['4', 'Not specified', 'Not specified', '≤ 10,000', 'PDP ≤ +3 °C (+37 °F)', '≤ 5 mg/m³'] },
        { cells: ['5', 'Not specified', 'Not specified', '≤ 100,000', 'PDP ≤ +7 °C (+45 °F)', '—'] },
        { cells: ['6', 'By mass: ≤ 5 mg/m³', '—', '—', 'PDP ≤ +10 °C (+50 °F)', '—'] },
        { cells: ['7', 'By mass: 5–10 mg/m³', '—', '—', 'Liquid water ≤ 0.5 g/m³', '—'] },
        { cells: ['8', '—', '—', '—', 'Liquid water 0.5–5 g/m³', '—'] },
        { cells: ['9', '—', '—', '—', 'Liquid water 5–10 g/m³', '—'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'What typical uses ask for.', anchor: 'typical-classes' },
    {
      type: 'prose',
      html: '<p>The standard sets the scale; it does not say which class an application needs. That comes from the equipment maker, an industry guideline, or your own process risk. Published examples give a sense of the range — but they are examples, and the sources do not always agree, so treat them as a starting point for a conversation rather than a specification.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Published examples of specified classes — check the current guideline or maker requirement for your case',
      columns: ['Use', 'Class [particles:water:oil]', 'Source'],
      rows: [
        { cells: ['Food and beverage, air in direct contact with product', '[2:2:1]', 'BCAS/BRC guideline BPG 102, as reported by Atlas Copco and EXAIR'], highlight: true },
        { cells: ['Food and beverage, indirect contact (packaging, containers)', '[2:4:2]', 'BPG 102, as reported by Atlas Copco and EXAIR; a 2006 report of the first edition gives [2:4:1]'] },
        { cells: ['Food and beverage; pharmaceuticals', '[1:2:1]', 'Atlas Copco application examples'] },
        { cells: ['Clean-room assembly', '[1:1:1]', 'EXAIR example'] },
        { cells: ['Textile machinery', '[4:4:3]', 'Atlas Copco application examples'] },
        { cells: ['General pneumatic tools', '[3:4:4]', 'Atlas Copco application examples'] },
        { cells: ['Pneumatic valves (minimum)', '[7:4:3]', 'MAC Valves recommendation for its products'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Two things stand out. First, the water class does most of the work: the difference between a factory air supply and a food-contact supply is mainly how dry it is and how little oil it carries. Second, these are classes at the <em>point of use</em>. A dryer outlet can meet a class that the air no longer meets after fifty metres of carbon-steel pipe, so the class is specified, and tested, where the air is used.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Pressure dew point, and why compressed air makes water.', anchor: 'dew-point' },
    {
      type: 'prose',
      html: '<p>All atmospheric air carries water vapour, and how much it can carry depends on two things: temperature and pressure.</p><ul><li><strong>Temperature.</strong> Warm air holds more water vapour than cool air. The Compressed Air Challenge gives the rule of thumb that the moisture content of saturated air roughly doubles for every 20 °F (about 11 °C) rise — saturated air at 100 °F holds almost twice the moisture of saturated air at 80 °F.</li><li><strong>Pressure.</strong> Compressed air holds less vapour per unit volume. Sullair puts it this way: compressing air from atmospheric pressure to 100 psig raises the pressure nearly eightfold, so at the same temperature the compressed air can hold only about one-eighth of the moisture it held at ambient conditions.</li></ul><p>Compression squeezes all the water the intake air carried into a fraction of its volume. It does not condense immediately, because compression also heats the air — Sullair notes discharge air is commonly 190 °F or more — and hot air holds more vapour. The Compressed Air Challenge describes what happens next: condensation generally does not occur inside the compression element, but begins as the air is cooled in the aftercooler, and the air leaving the aftercooler is normally 100% saturated at the aftercooler’s outlet temperature. As that saturated air cools further towards ambient in the receiver and pipes, more water drops out.</p><p>That is the meaning of <strong>pressure dew point</strong> (PDP): the temperature, at line pressure, to which the compressed air can be cooled before its water vapour starts to condense. It is the number that matters for compressed air. Atlas Copco points out that it is higher than the atmospheric dew point of the same air, because compression has concentrated the moisture — so a dew point quoted at atmospheric pressure cannot be compared with one quoted at line pressure. The rule for any system is simple: <strong>if any part of the pipework is colder than the air’s pressure dew point, water will condense there.</strong></p><h3>What this means on a hot, humid site</h3><p>In the Gulf the intake air is often both hot and humid, and an air-cooled aftercooler can only cool the air to somewhere above the ambient temperature. The Compressed Air Challenge notes the air entering a dryer is usually close to the temperature at which it left the aftercooler. Hot, saturated air at the dryer inlet therefore carries far more water — by the doubling rule above — than the same compressor delivers on a cool day, and a dryer selected on standard inlet conditions can be overloaded. Air that leaves a hot compressor house and then runs through an air-conditioned building, or cools overnight, keeps dropping water in the pipework for the same reason.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A filter does not dry air.',
      body: 'Particulate and coalescing filters remove liquid water and aerosols that are already there. They do not lower the pressure dew point, so water vapour that passes through a filter will still condense downstream if the line cools below the dew point. Only a dryer sets the dew point.',
    },

    { type: 'section_head', number: '/04', title: 'Where to fix the water: drains, filters and dryers.', anchor: 'treatment' },
    {
      type: 'prose',
      html: '<p>The cheapest place to remove water is where it first appears, in bulk, near the compressor. Treatment works from the compressor outwards:</p><ol><li><strong>Separate and drain at the aftercooler and receiver.</strong> The Compressed Air Challenge stresses that condensed moisture must be removed by an efficient separator and trap. Receivers, separators and drip legs need drains that open reliably — timed electric or zero-loss level-sensing drains rather than a manual valve someone has to remember.</li><li><strong>Dry the air to the dew point you need.</strong> The dryer sets the water class. The Compressed Air Challenge gives typical dew points, at operating pressure and a saturated inlet of 100 °F: refrigerated dryers <strong>35 °F or 50 °F</strong> (about +2 °C or +10 °C — water class 4 or 6), regenerative desiccant dryers <strong>−40 °F or lower</strong> (−40 °C, class 2), and deliquescent dryers 64 to 80 °F. It also advises drying air only to the level the plant equipment or ambient conditions require, and drying at the highest pressure the design allows, because saturated air at higher pressure holds less water per standard cubic foot.</li><li><strong>Filter for particles and oil.</strong> Main-line coalescing filters take out oil aerosols and fine particles and set the oil class; activated-carbon filters remove oil vapour. Filters ahead of a dryer protect it, and a filter after a desiccant dryer catches desiccant dust.</li><li><strong>Drain the low points.</strong> Take branch lines off the top of the header so that any water in the main runs past rather than down into the branch, and drain the low points.</li></ol><h3>The point-of-use FRL: the last line</h3><p>The FRL at the machine is the final guard, not the treatment plant. Its filter catches the water that condensed in the pipe after the dryer, plus rust and scale from the pipe itself; a coalescing element at the machine gives the final oil class for a sensitive load. If the bowl at the machine is filling with water every shift, the cure is upstream — a dryer that is undersized, bypassed or failed, or a drain that is not draining. Our <a href="/blog/frl-filter-regulator-lubricator-guide">FRL guide</a> covers point-of-use filters, drains and bowls in detail.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'What each stage controls',
      columns: ['Stage', 'Controls', 'Typical location', 'What it cannot do'],
      rows: [
        { cells: ['Separator and condensate drain', 'Bulk liquid water', 'Aftercooler, receiver, drip legs', 'Remove vapour; lower the dew point'] },
        { cells: ['Refrigerated dryer', 'Water class 4–6 (PDP about +2 to +10 °C)', 'After the receiver', 'Reach a sub-zero dew point'], highlight: true },
        { cells: ['Desiccant dryer', 'Water class 2 or better (PDP −40 °C or lower)', 'After the receiver, with filters either side', 'Remove oil vapour'] },
        { cells: ['Coalescing filter', 'Oil aerosol and fine particles (oil and particle class)', 'Main line and point of use', 'Dry the air'] },
        { cells: ['Activated-carbon filter', 'Oil vapour and odour', 'After a coalescing filter', 'Handle liquid water or bulk oil'] },
        { cells: ['Point-of-use FRL', 'Residual liquid water, pipe scale, pressure', 'At each machine', 'Fix a wet or oily supply'] },
      ],
    },

    { type: 'section_head', number: '/05', title: 'Writing the specification.', anchor: 'specifying' },
    {
      type: 'prose',
      html: '<p>A good air-quality specification is short:</p><ul><li>the standard and edition — <strong>ISO 8573-1:2010</strong>;</li><li>the class as three numbers, <strong>[particles:water:oil]</strong>, taken from the equipment maker or the guideline that governs the process;</li><li>where the class applies — at the dryer outlet, in the header, or at the point of use;</li><li>for water, the line pressure at which the dew point is stated.</li></ul><p>Then size each stage for the worst case it will see: the highest inlet temperature, the highest humidity and the peak flow, not the nameplate conditions.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Where is the water (or oil) coming from?',
      branches: [
        { condition: 'Water in every FRL bowl across the plant?', outcome: 'Supply problem. Check the dryer is running, not bypassed and sized for hot-season inlet temperature; check receiver and separator drains.' },
        { condition: 'Water only at machines far from the compressor or in cooler areas?', outcome: 'The pipe is colder than the pressure dew point. Lower the dew point or drain the low points; branch off the top of the header.' },
        { condition: 'Oil film or smell at the point of use?', outcome: 'Main-line coalescing filter, then activated carbon for vapour; check elements are not saturated.' },
        { condition: 'Food, pharmaceutical or paint air?', outcome: 'Specify the class from the governing guideline or maker; usually a desiccant or refrigerated dryer plus coalescing and carbon filtration, with point-of-use coalescing.' },
        { condition: 'General automation valves and cylinders?', outcome: 'Check the valve maker’s minimum — MAC asks for [7:4:3] — and a point-of-use 40 µm or 5 µm filter-regulator.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What does ISO 8573-1 class 1.4.1 mean?', answer: 'Particle class 1 (no more than 20,000, 400 and 10 particles per m³ in the 0.1–0.5, 0.5–1 and 1–5 µm bands), water class 4 (pressure dew point +3 °C or lower), and oil class 1 (no more than 0.01 mg/m³ total oil).' },
        { question: 'What is class 0 in ISO 8573-1?', answer: 'A limit agreed by the equipment user or supplier that is stricter than class 1. It is not a fixed number and not “zero”, so a class 0 claim should always state the agreed limit.' },
        { question: 'What is the difference between pressure dew point and atmospheric dew point?', answer: 'Pressure dew point is the temperature, at line pressure, at which water starts to condense from the compressed air. It is higher than the atmospheric dew point of the same air because compression concentrates the moisture. Always state the pressure with a dew point.' },
        { question: 'Why is there so much water in compressed air?', answer: 'Compression packs the water vapour from a large volume of intake air into a small one. Hot air from the compressor holds it as vapour, but once the air is cooled in the aftercooler and pipes it cannot, and the excess condenses. Hot, humid intake air makes more of it.' },
        { question: 'What class of compressed air is required for food?', answer: 'The BCAS/BRC food-grade guideline (BPG 102) is reported as specifying [2:2:1] for air in direct contact with food and [2:4:2] for indirect contact. Check the current edition and your own food-safety plan.' },
        { question: 'Will a coalescing filter remove water from compressed air?', answer: 'It removes liquid water and water aerosol that are already in the air, but it does not lower the dew point. Vapour that passes through will condense further downstream if the line cools. Use a dryer to control water.' },
        { question: 'What dew point does a refrigerated dryer give?', answer: 'The Compressed Air Challenge gives 35 °F or 50 °F (about +2 °C or +10 °C) at operating pressure with a saturated inlet at 100 °F — roughly water class 4 to 6. For a sub-zero dew point you need a desiccant dryer, typically −40 °F (−40 °C) or lower.' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'what-we-list' },
    {
      type: 'prose',
      html: '<p>Main-line and point-of-use filters, coalescing elements, condensate drains and filter-regulators from the makers on our air preparation shelf that build them — Parker, Wilkerson, Norgren, Hankison, Ingersoll Rand, Metal Work, Nitra, SMC, Texas Pneumatic Tools, Dynaquip and Conrader — each by maker part number:</p>' +
        stockListBy('air-preparation-frl', [
          'Parker Hannifin',
          'Wilkerson',
          'Norgren',
          'Hankison',
          'Ingersoll Rand',
          'Metal Work',
          'Nitra',
          'SMC',
          'Texas Pneumatic Tools',
          'Dynaquip',
          'Conrader',
        ]),
    },
    {
      type: 'product_embed',
      heading: 'Filters and drains',
      skus: [
        'IH-PAR-MAIN-LINE-COMPRESSED-AIR-FILTERS',
        'IH-HKS-MAIN-LINE-COMPRESSED-AIR-FILTERS',
        'IH-IRD-MAIN-LINE-COMPRESSED-AIR-FILTERS',
        'IH-NOR-PLUS-84-SERIES-AIR-FILTERS-COALESCING-OIL-REMOVAL',
        'IH-NOR-PLUS-84-SERIES-AIR-FILTERS-VAPOR-REMOVAL',
        'IH-WLK-M28-COALESCING-FILTERS',
        'IH-IRD-ZERO-LOSS-CONDENSATE-DRAIN-ELECTRIC',
        'IH-DYQ-TIMED-ELECTRIC-AUTO-DRAIN-VALVE',
      ],
    },
    { type: 'category_link', slug: 'air-preparation-frl', label: 'Filters, regulators & lubricators', blurb: 'Main-line and point-of-use filters, coalescing and vapour-removal elements, drains and FRL units.' },
    { type: 'category_link', slug: 'pneumatics', label: 'All pneumatics', blurb: 'Cylinders, valves, tubing, fittings, safety valves, grippers, vacuum and air motors.' },
    {
      type: 'related_articles',
      slugs: [
        'frl-filter-regulator-lubricator-guide',
        'air-safety-relief-soft-start-and-lockout-valves',
        'pneumatic-tubing-materials-guide',
        'solenoid-valve-functions-3-2-5-2-5-3',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Classes from ISO 8573-1:2010 as reproduced by MAC Valves, Atlas Copco and EXAIR; dew point and dryer figures from the Compressed Air Challenge and Sullair. Application classes are published examples, not requirements.',
    },
    {
      type: 'cta_block',
      heading: 'Chasing water or oil in your air lines?',
      body: 'Tell us the flow, line pressure, the class you need at the point of use and what you are seeing in the bowls. We will quote main-line filters, elements, drains and point-of-use FRLs by maker part number.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
