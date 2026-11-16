import type { BlogArticleSeed } from '../shared'

/**
 * Air-cooler bundle replacement. Sources: the approved enquiry checklists and "how we build" copy for
 * IH-TF-HX-ACH and IH-TF-BC-BUN (API 661 / ISO 13706 data sheet, header NDE, hydrotest, fit to existing
 * bays), fin facts from the finned listings (typical maker limits). No TEMA paragraph numbers.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'air-cooler-bundle-replacement-data-sheet',
  title: 'Replacing an air-cooler bundle: what goes on the data sheet',
  excerpt:
    'A replacement air-cooler bundle has to drop into an existing bay and do the same duty — or a better one. The data an enquiry needs, the choices worth revisiting while the old bundle is out, and how bundles are built and tested to API 661.',
  categorySlug: 'heat-transfer-tubes',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Air Cooler Bundle Replacement Guide',
  seoDescription:
    'What to send for a replacement air-cooled heat exchanger bundle: API 661 data sheet, bay dimensions, header type, tube and fin specification, tests.',
  focusKeyword: 'air cooled heat exchanger bundle replacement',
  publishedAt: '2026-11-16T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Start from the original API 661 / ISO 13706 data sheet, or the nameplate and a survey of the old bundle.',
        'The new bundle must fit the existing bay: width, length, nozzle positions, header type and supports.',
        'A replacement is the moment to fix what failed: tube material, fin type for the temperature, fin cover for the coast.',
        'Header welds are radiographed or ultrasonically tested and each bundle is hydrotested to the inspection and test plan.',
        'Order early: bundles are made to order and usually fall due in a turnaround window.',
      ],
    },
    {
      type: 'lead',
      html: 'Air coolers carry much of the cooling load in Gulf gas plants and refineries, and their bundles wear out: fins loosen and corrode in salt air, tubes pit or foul, headers leak. Because the structure, fans and drives stay in place, a replacement bundle is a precise fit-up job as well as a thermal one.',
    },
    {
      type: 'direct_answer',
      question: 'What do you need to order a replacement air-cooler bundle?',
      answer:
        'The API 661 data sheet (or the nameplate and a survey): service, fluid, flow and phase; inlet and outlet temperatures, pressure drop and fouling; design pressure, temperature, MDMT and test pressure; design ambient and site elevation; bay width, length and nozzle positions; draft type, header type and fan control; and the tube material, OD, wall and length with the fin type and material.',
    },

    { type: 'section_head', number: '/01', title: 'The checklist.', anchor: 'checklist' },
    {
      type: 'prose',
      html: '<ul><li>Service, fluid, total flow and phase.</li><li>Inlet and outlet temperatures, allowable pressure drop and fouling.</li><li>Design pressure, design temperature, MDMT and test pressure.</li><li>Design ambient dry-bulb temperature, minimum ambient and site elevation.</li><li>Plot limits: bay width and length, elevation and bundle orientation.</li><li>Forced or induced draft, header type and fan control.</li><li>Tube material, OD, wall and length; fin type and material.</li><li>Inspection and test plan, and any performance test.</li></ul>',
    },

    { type: 'section_head', number: '/02', title: 'Fit to the existing bay.', anchor: 'fit' },
    {
      type: 'paragraph',
      html: 'Measure what will not change: bay width and length, the side frames and supports, nozzle sizes, ratings and positions, the header type (plug, cover-plate or manifold) and the lifting arrangement. A replacement built from the original drawing should be checked against a site survey, because modifications over the years are common.',
    },

    { type: 'section_head', number: '/03', title: 'What to revisit.', anchor: 'revisit' },
    {
      type: 'paragraph',
      html: 'If fins failed, check the fin type against the tube wall temperature and the atmosphere: L fins are limited to about 120–150 °C, LL to about 155 °C, extruded to about 285 °C and embedded G-fins to about 400 °C, all as typical maker limits. On the coast, full-cover fins — <a href="/blog/extruded-fin-tubes-coastal-air-coolers">extruded</a> or LL — protect the tube from salt air. If tubes failed from the inside, revisit the tube grade. If the cooler was short of duty in summer, the thermal design can be rechecked against current conditions while the bundle is designed.',
    },

    { type: 'section_head', number: '/04', title: 'How bundles are built and tested.', anchor: 'build' },
    {
      type: 'paragraph',
      html: 'We work from the API 661 / ISO 13706 data sheet. The thermal design sets the tube rows and passes; the mechanical design covers the headers to ASME VIII Division 1 or EN 13445. Tubes are expanded or welded into the headers to a qualified procedure, header welds are fully radiographed or ultrasonically tested, and each bundle is hydrotested and documented to the inspection and test plan before it ships.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can a new bundle be built from the nameplate alone?', answer: 'Often, with a site survey of the bay, nozzles and headers. The original data sheet makes it faster and safer.' },
        { question: 'Which standard covers air-cooler bundles?', answer: 'API 661 / ISO 13706, with the headers designed to ASME VIII Division 1 or EN 13445.' },
        { question: 'Can we change the fin type on the replacement?', answer: 'Yes, if the thermal design is rechecked. A change from L to extruded or LL fins is common on coastal sites.' },
        { question: 'Are header welds inspected?', answer: 'Yes: fully radiographed or ultrasonically tested, and the bundle is hydrotested.' },
        { question: 'Do you supply tubes only for a retube?', answer: 'Yes. Finned tube can be supplied on its own for a shop that is retubing the bundle.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'In the catalogue',
      skus: ['IH-TF-HX-ACH', 'IH-TF-BC-BUN', 'IH-TF-FT-FIN', 'IH-TF-EX-ALU', 'IH-TF-GF-GFN'],
    },
    { type: 'category_link', slug: 'heat-exchangers', label: 'Heat exchangers', blurb: 'Shell-and-tube, air-cooled and other exchangers built to your data sheet.' },
    {
      type: 'related_articles',
      slugs: ['types-of-finned-tubes', 'extruded-fin-tubes-coastal-air-coolers', 'finned-tube-fouling-cleaning'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Fin temperatures are typical maker limits. API 661 / ISO 13706 governs the bundle design.',
    },
    {
      type: 'cta_block',
      heading: 'Bundle due at the next turnaround?',
      body: 'Send the data sheet or nameplate and photos. We quote a replacement bundle built to fit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
