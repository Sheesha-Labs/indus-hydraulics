import type { BlogArticleSeed } from '../shared'

/**
 * Below-the-hook lifting devices: definition and inspection requirements. Standard figures are from
 * ASME B30.20 (initial, frequent and periodic inspection; frequency by service; 125% load test; nameplate
 * content), ASME BTH-1 (Design Category A design factor 2.00, Category B 3.00; Service Classes 0-4 by load
 * cycles) and 29 CFR 1926.251 (custom lifting accessories marked and proof tested to 125%). Product facts
 * are from the live below-the-hook-lifting shelf: every listing is built to EN 13155, with ASME B30.20 /
 * BTH-1 or DNV design on request; made-to-order items are load tested before dispatch and ship with a
 * declaration of conformity. Design Category C is not mentioned because the edition that adds it was not
 * checked. Local UAE intervals are left to the linked UAE inspection article.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'below-the-hook-lifting-device-inspection',
  title: 'Below-the-hook lifting devices: what they are, and how ASME B30.20 says to inspect them',
  excerpt:
    'A below-the-hook lifting device is anything between the hook and the load that is not a sling: beams, frames, clamps, C-hooks, grabs. ASME B30.20 sets three kinds of inspection, initial, frequent and periodic, and ASME BTH-1 sets the design category and service class marked on the nameplate.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Below-the-Hook Lifting Device Inspection Requirements',
  seoDescription:
    'Below-the-hook lifting device inspection requirements under ASME B30.20: initial, frequent and periodic inspection, load test, marking, records and BTH-1.',
  focusKeyword: 'below the hook lifting device inspection requirements',
  publishedAt: '2026-11-21T09:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the inspection requirements for a below-the-hook lifting device?',
      answer:
        'Under ASME B30.20, a below-the-hook lifting device gets an initial inspection before first use, a frequent visual inspection by the operator or a designated person, and a periodic inspection by a qualified person, from yearly to quarterly depending on service. New, altered or repaired devices are load tested, and periodic inspections are recorded, dated and kept.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A below-the-hook lifting device is equipment hung from the hook to hold the load: lifting and spreader beams, frames, C-hooks, clamps, grabs, magnets and vacuum lifters. Slings and rigging hardware are covered by other standards.',
        'ASME B30.20 covers how these devices are marked, inspected, tested, maintained and used. ASME BTH-1 covers how they are designed.',
        'There are three inspection types: initial (before first use and after repair), frequent (visual, by the operator or a designated person) and periodic (thorough, by a qualified person, with a dated record).',
        'The nameplate carries the rated load, the serial number, the weight when it is over 100 lb (45 kg), and the BTH-1 design category and service class.',
        'Local law can be stricter. In the UAE, thorough examination intervals are set by the emirate, so check them as well as the standard.',
      ],
    },
    {
      type: 'lead',
      html: 'Everyone on a site knows a sling needs inspecting. The beam or frame the slings hang from is easier to forget, because it looks like plain steel and rarely changes from one lift to the next. It is still a lifting device, it still carries the whole load, and the US standard for it sets out exactly who inspects it and how often. This article covers the definition, the inspection regime in ASME B30.20, the marking, and where ASME BTH-1 fits. For how the beams themselves work, read <a href="/blog/spreader-beam-vs-lifting-beam">spreader beam vs lifting beam</a>.',
    },

    { type: 'section_head', number: '/01', title: 'What counts as below the hook.', anchor: 'definition' },
    {
      type: 'paragraph',
      html: 'A below-the-hook lifting device is a device, other than a sling, that is hung from a crane or hoist hook to attach the load. ASME B30.20 groups them as structural and mechanical lifting devices, vacuum lifters, magnets, and scrap and material handling grapples. In practice that covers the steelwork on our <a href="/c/below-the-hook-lifting">below-the-hook lifting</a> shelf: lifting beams, spreader beams, spreader frames, container frames, C-hooks, scissor grabs, plate beams and bolt-on lifting tools.',
    },
    {
      type: 'paragraph',
      html: 'Slings, shackles, hooks and other rigging hardware are not below-the-hook devices in this sense. Slings sit under ASME B30.9 and rigging hardware under ASME B30.26, explained in <a href="/blog/asme-b30-26-rigging-hardware-explained">ASME B30.26 explained</a>. The top and bottom rigging on a spreader beam is therefore inspected under different rules from the beam it connects.',
    },

    { type: 'section_head', number: '/02', title: 'The three inspections in ASME B30.20.', anchor: 'inspections' },
    {
      type: 'prose',
      html: '<ul><li><strong>Initial inspection.</strong> Before a new device is first used, and after it has been altered, modified or repaired, it is inspected by, or under the direction of, a qualified person to confirm it meets the standard. A new, altered or repaired structural or mechanical lifter is also load tested, normally to 125% of its rated load unless the manufacturer specifies otherwise, and the test is recorded.</li><li><strong>Frequent inspection.</strong> A visual check by the operator or another designated person, with the device inspected before and during each lift. The standard sets the frequency by service: monthly for normal service, weekly to monthly for heavy service and daily to weekly for severe service. It looks for deformation, cracks and wear on structural members, loose or missing fasteners and guards, mechanisms that do not work properly, and markings that cannot be read.</li><li><strong>Periodic inspection.</strong> A complete inspection by a qualified person: yearly in normal service, every six months in heavy service and quarterly in severe service. It goes deeper than the visual check: pins, bearings, shafts and linkages for wear; welds for cracks and corrosion; bolts for looseness; and the marking. Dated records of periodic inspections are kept.</li></ul><p>Devices used only for special or infrequent lifts are inspected as a qualified person recommends, before the first such lift and as they direct afterwards. Any device found with damage that is a hazard is taken out of service until it is repaired or replaced.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'ASME B30.20 inspection types for structural and mechanical lifting devices',
      columns: ['Inspection', 'Who', 'When', 'Recorded'],
      rows: [
        { cells: ['Initial', 'Qualified person', 'Before first use; after alteration, modification or repair', 'Yes, with the load test'] },
        { cells: ['Frequent', 'Operator or designated person', 'Before and during each lift; monthly (normal), weekly to monthly (heavy), daily to weekly (severe)', 'Not required by the standard'] },
        { cells: ['Periodic', 'Qualified person', 'Yearly (normal), six-monthly (heavy), quarterly (severe)', 'Yes, dated'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Normal, heavy and severe service are judged by the person responsible for the equipment from how often it lifts, how close to its rating and in what conditions. A spreader beam in a hire fleet that goes to a different contractor every week is not in the same service as one that lifts the same pump twice a year.',
    },

    { type: 'section_head', number: '/03', title: 'Marking and the BTH-1 design category.', anchor: 'marking' },
    {
      type: 'paragraph',
      html: 'ASME B30.20 asks for the rated load to be marked on the main structure where the operator can see it, and for a nameplate carrying the manufacturer’s name and address, the serial number, the weight of the device if it is over 100 lb (45 kg), the rated load, and the ASME BTH-1 design category and service class. Modular beams add the configuration: the rating depends on span and sling angle, so the user instructions carry the load chart, as on our <a href="/p/modular-spreader-beam-8-tonne">8 t modular spreader beam</a>.',
    },
    {
      type: 'paragraph',
      html: 'ASME BTH-1 is the design standard. Its design category sets the design factor: Category A, with a nominal design factor of 2.00, is for devices where the loads and conditions are predictable and well defined; Category B, at 3.00, is for devices where they are not. That design factor is what search results call the below-the-hook safety factor. The service class sets the fatigue life the design must reach, counted in load cycles.',
    },
    {
      type: 'comparison_table',
      caption: 'ASME BTH-1 service classes',
      columns: ['Service class', 'Load cycles'],
      rows: [
        { cells: ['0', '0 to 20,000'] },
        { cells: ['1', '20,001 to 100,000'] },
        { cells: ['2', '100,001 to 500,000'] },
        { cells: ['3', '500,001 to 2,000,000'] },
        { cells: ['4', 'Over 2,000,000'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our listings are built to EN 13155, the European standard for non-fixed load lifting attachments. Made-to-order items such as <a href="/p/fixed-lifting-beams">fixed lifting beams</a>, <a href="/p/container-lifting-frames">container lifting frames</a> and <a href="/p/c-hooks">C-hooks</a> can be designed to ASME B30.20 and BTH-1 instead, or to DNV for offshore, on request. They are load tested before dispatch and ship with a test certificate, a declaration of conformity and user instructions.',
    },

    { type: 'section_head', number: '/04', title: 'OSHA, certification and local rules.', anchor: 'local-rules' },
    {
      type: 'paragraph',
      html: 'OSHA has no separate below-the-hook standard, and ASME B30.20 is the reference US inspectors use. OSHA’s construction rigging rule, 29 CFR 1926.251, does require custom-designed lifting accessories such as grabs, hooks and clamps to be marked with their safe working load and proof tested to 125% of their rated load before use. “Certification” usually means the manufacturer’s test certificate and declaration of conformity at supply, followed by periodic thorough examination reports from a competent or qualified person.',
    },
    {
      type: 'paragraph',
      html: 'Where a national or emirate rule applies, it sets the legal minimum, and it can be shorter than the ASME interval. In Abu Dhabi, lifting accessories are thoroughly examined every six months; the detail for each emirate is in <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>, and how to keep the records is in <a href="/blog/lifting-equipment-register-uae">the lifting equipment register</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Inspection does not cover misuse.',
      body: 'A beam that passes its periodic inspection can still fail if it is rigged wrongly: a spreader hung from one top point, slings below the minimum top sling length, or a load lifted off its centre of gravity. Rig it to the user instructions and the load chart, never above the rated load for the configuration, and have a qualified person decide whether a damaged device stays in service.',
    },
    {
      type: 'paragraph',
      html: 'The common rigging errors are in <a href="/blog/spreader-beam-misuse">spreader beam misuse</a>, why sling angle loads the beam is in <a href="/blog/sling-angle-compression-force">sling angle compression force</a>, and loads that hang off-level are covered in <a href="/blog/centre-of-gravity-in-lifting">centre of gravity in lifting</a>.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<p>Indus quotes and ships below-the-hook lifting devices from Dubai, UAE. For a quote, send:</p><ul><li>The load: weight, dimensions, and the position of its lifting points or centre of gravity.</li><li>The hook height and headroom you have.</li><li>The standard you need it designed to: EN 13155, ASME B30.20 / BTH-1 or DNV offshore.</li><li>For ASME design, the design category and service class, or how often and in what conditions it will lift.</li><li>Where it will be used, so we can confirm the finish and the paperwork the local authority expects.</li></ul><p>Browse the full range on the <a href="/c/below-the-hook-lifting">below-the-hook lifting</a> shelf.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What standard covers below-the-hook lifting devices?',
          answer:
            'In the US, ASME B30.20 covers marking, inspection, testing, maintenance and operation, and ASME BTH-1 covers design. In Europe and much of the Middle East, EN 13155 covers non-fixed load lifting attachments.',
        },
        {
          question: 'Is a spreader beam a below-the-hook lifting device?',
          answer:
            'Yes. Lifting beams, spreader beams and spreader frames are structural below-the-hook devices under ASME B30.20. The slings and shackles used with them are covered by ASME B30.9 and B30.26.',
        },
        {
          question: 'What is the safety factor for a below-the-hook lifting device?',
          answer:
            'ASME BTH-1 uses a design factor rather than a safety factor: a nominal 2.00 for Design Category A and 3.00 for Design Category B. The category is chosen by how predictable the loads and conditions are, and it is marked on the nameplate.',
        },
        {
          question: 'How often does a below-the-hook lifting device need a periodic inspection?',
          answer:
            'Under ASME B30.20, yearly in normal service, every six months in heavy service and quarterly in severe service, by a qualified person, with a dated record. Local rules can require shorter intervals.',
        },
        {
          question: 'Does OSHA require below-the-hook devices to be load tested?',
          answer:
            'OSHA 29 CFR 1926.251 requires custom-designed lifting accessories in construction to be marked with their safe working load and proof tested to 125% of rated load before use. ASME B30.20 also calls for a load test on new, altered or repaired devices.',
        },
        {
          question: 'What goes on a below-the-hook lifting device nameplate?',
          answer:
            'The manufacturer’s name and address, the serial number, the device weight if over 100 lb (45 kg), the rated load, and the ASME BTH-1 design category and service class.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Below-the-hook lifting devices',
      skus: ['IH-LR-BH-MSB-8', 'IH-LR-BH-TSB', 'IH-LR-BH-FLB', 'IH-LR-BH-MSF', 'IH-LR-BH-CLF', 'IH-LR-BH-CHK'],
    },
    {
      type: 'category_link',
      slug: 'below-the-hook-lifting',
      label: 'Below-the-hook lifting',
      blurb: 'Lifting and spreader beams, frames, C-hooks, grabs and bolt-on lifting tools, built to EN 13155 with ASME B30.20 / BTH-1 design on request.',
    },
    {
      type: 'related_articles',
      slugs: ['spreader-beam-vs-lifting-beam', 'spreader-beam-misuse', 'lifting-equipment-inspection-uae', 'asme-b30-26-rigging-hardware-explained'],
    },
    {
      type: 'cta_block',
      heading: 'Need a beam or frame inspected or replaced?',
      body: 'Send the load, the headroom and the standard you work to. We will propose the device, quote it from Dubai with its test certificate and user instructions, and include the top and bottom rigging if you need it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
