import type { BlogArticleSeed } from '../shared'

/**
 * Deliberately contains NO pressure ratings and NO dimensional tables.
 *
 * Everything asserted here is thread geometry and sealing mechanism —
 * checkable against the standards cited, and stable across manufacturers.
 * Working-pressure figures vary by size, series and maker, and publishing one
 * from memory in an article an engineer may act on is the failure mode the
 * content guardrails exist to prevent. Those tables come later, from the
 * manufacturer data, with a named reviewer.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'identify-any-hydraulic-fitting',
  title: 'How to identify any hydraulic fitting in four steps',
  excerpt:
    'Four thread families cover almost everything on a machine in the Gulf. Here is how to tell them apart with a caliper and a thread gauge — and why two of them will thread together and still leak.',
  categorySlug: 'fitting-identification',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'How to identify a hydraulic fitting — thread, taper and seat',
  seoDescription:
    'Identify JIC, ORFS, BSP and metric DIN hydraulic fittings by thread diameter, pitch, taper and seat angle. What interchanges, what does not, and the pairing that leaks.',
  focusKeyword: 'how to identify a hydraulic fitting',
  publishedAt: '2026-08-17T06:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Four families cover almost every hydraulic fitting on a machine in the Gulf: JIC 37°, ORFS, BSP and metric DIN 24° cone.',
        'Thread size alone never identifies a fitting. You need diameter, pitch, whether the thread is parallel or tapered, and the seat angle.',
        'BSP and NPT are the pairing that catches people out — different thread angles, close enough in size to start by hand, and the joint will leak.',
        'The seal is almost never made by the threads. On JIC it is the flare, on ORFS the O-ring, on BSP female a 60° cone or a bonded washer.',
        'A thread pitch gauge and a caliper answer this in under a minute. Guessing from the hex size does not.',
      ],
    },
    {
      type: 'lead',
      html: 'A fitting with no markings, on a machine whose manuals went missing three owners ago, is the most common identification job in any hydraulic workshop. The part is in your hand and the machine is down. Four measurements will tell you what it is.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Start with the seat, not the thread.',
      anchor: 'start-with-the-seat',
    },
    {
      type: 'paragraph',
      html: 'The instinct is to measure the thread first. The seat is faster and narrows the field further. Almost all hydraulic connections seal on a machined surface — a cone, a flare, or an O-ring — and <strong>not on the threads themselves</strong>. The threads only supply clamping force. Once you know how a fitting seals, you have usually eliminated two of the four families.',
    },
    {
      type: 'comparison_table',
      caption: 'The four families you will actually meet',
      columns: ['Family', 'Thread form', 'Parallel or tapered', 'Where it seals'],
      rows: [
        { cells: ['JIC 37°', 'UN/UNF, 60° thread angle', 'Parallel', '37° flare face'] },
        { cells: ['ORFS', 'UN/UNF, 60° thread angle', 'Parallel', 'O-ring in a flat face groove'] },
        { cells: ['BSP parallel (BSPP)', 'Whitworth, 55° thread angle', 'Parallel', '60° cone, or a bonded seal under the head'] },
        { cells: ['BSP tapered (BSPT)', 'Whitworth, 55° thread angle', 'Tapered', 'Thread interference, with sealant'] },
        { cells: ['Metric DIN 24° cone', 'Metric, 60° thread angle', 'Parallel', '24° cone, optionally with an O-ring'] },
        { cells: ['NPT / NPTF', 'UN, 60° thread angle', 'Tapered 1:16', 'Thread interference, with sealant'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Then take four measurements.',
      anchor: 'four-measurements',
    },
    {
      type: 'sop_block',
      header: 'FITTING IDENTIFICATION · BENCH PROCEDURE',
      completion: '4 steps',
      phases: [
        {
          name: 'Measure and gauge',
          rows: [
            {
              task: 'Thread diameter',
              detail: 'Caliper across the crests of a male thread, or across the roots of a female. Record in both mm and inches — the answer may be either.',
              who: 'Fitter',
              tool: 'Caliper',
            },
            {
              task: 'Thread pitch',
              detail: 'Thread pitch gauge. Imperial families are counted in threads per inch; metric in millimetres between crests.',
              who: 'Fitter',
              tool: 'Pitch gauge',
            },
            {
              task: 'Parallel or tapered',
              detail: 'Measure the crest diameter at the first thread and at the last. If it changes, the thread is tapered and you are looking at BSPT or NPT.',
              who: 'Fitter',
              tool: 'Caliper',
            },
            {
              task: 'Seat angle',
              detail: 'A seat gauge, or compare against a known fitting. 37° and 24° are distinguishable by eye once you have seen both; 30° Komatsu and 37° JIC are not.',
              who: 'Fitter',
              tool: 'Seat gauge',
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two of these four are the ones people skip, and they are the two that matter most. <strong>Taper</strong> separates BSPP from BSPT and NPT from everything parallel. <strong>Thread angle</strong> — 55° for BSP, 60° for everything else — is what a pitch gauge tells you and a tape measure never will.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The pairing that leaks.',
      anchor: 'the-pairing-that-leaks',
    },
    {
      type: 'direct_answer',
      question: 'Will a BSP fitting thread into an NPT port?',
      answer:
        'It will start, and on some sizes it will run several turns by hand. It will not seal. BSP is a 55° Whitworth thread and NPT is 60°, so the flanks never make full contact — the joint weeps under pressure and the threads on both parts are damaged.',
    },
    {
      type: 'paragraph',
      html: 'This is the single most common cross-threading error in the field, and it happens because the nominal sizes are close enough to be plausible. The damage is not always obvious at assembly: a joint that took sealant and torqued up normally can still weep once the system sees working pressure, by which point the port thread may need re-cutting.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A fitting that threads on is not a fitting that fits.',
      body: 'Hand engagement proves almost nothing. If you cannot confirm the thread form with a gauge, do not commit the joint — particularly on a port you cannot easily re-machine, such as a cast manifold or a pump housing.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Which family is it?',
      anchor: 'which-family',
    },
    {
      type: 'decision_tree',
      heading: 'Narrowing it down from the bench',
      intro: 'Work in this order. Each step eliminates at least one family.',
      branches: [
        {
          condition: 'The crest diameter changes along the thread',
          outcome: 'Tapered — BSPT or NPT.',
          detail: 'Separate the two on thread angle: 55° is BSPT, 60° is NPT. Both rely on thread interference and sealant, not a seat.',
        },
        {
          condition: 'Parallel thread, flat face with an O-ring sitting in a groove',
          outcome: 'ORFS.',
          detail: 'The O-ring makes the seal. A missing or perished O-ring will leak however hard the nut is torqued.',
          sku: 'IH-ORFS-FEM-45',
        },
        {
          condition: 'Parallel thread, cone seat at roughly 37°',
          outcome: 'JIC 37° flare.',
          detail: 'The most widely stocked family in the region. Seals metal-to-metal on the flare.',
          sku: 'IH-JIC-FEM-37-45',
        },
        {
          condition: 'Parallel thread, 55° thread angle, female cone seat at 60°',
          outcome: 'BSP parallel with a 60° cone.',
          detail: 'Common on British and Indian-built equipment and on a great deal of what is in service across the Gulf.',
          sku: 'IH-BSP-FEM-60-45',
        },
        {
          condition: 'Parallel metric thread, cone seat at roughly 24°',
          outcome: 'Metric DIN 24° cone — light or heavy series.',
          detail: 'Light (L) and heavy (S) series share seat angles but not thread sizes. Confirm the series before ordering; the wrong one will not thread on.',
          sku: 'IH-DF-FEM-24-OR-LS-45',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'One from each family, for comparison',
      skus: ['IH-JIC-FEM-37-45', 'IH-ORFS-FEM-45', 'IH-BSP-FEM-60-45', 'IH-DF-FEM-24-OR-LS-45'],
      note: 'Keeping one known-good fitting from each family on the bench is the cheapest identification tool there is — comparison beats measurement when the part in your hand is damaged.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'What the standards actually cover.',
      anchor: 'the-standards',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 8434-1',
      publisher: 'ISO',
      title:
        'Metallic tube connections for fluid power and general use — Part 1: 24° cone connectors',
      summary:
        'Defines the metric 24° cone connector, including the light and heavy series distinction. This is the reference when a fitting is described as "DIN 2353" — the DIN designation is widely used in the trade, and ISO 8434-1 is the standard that now governs the geometry.',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 228-1',
      publisher: 'ISO',
      title:
        'Pipe threads where pressure-tight joints are not made on the threads — Part 1: Dimensions, tolerances and designation',
      summary:
        'Covers BSP parallel threads. The title is the useful part: the standard states outright that the joint is not sealed by the threads, which is exactly why a BSPP male needs a cone seat or a bonded washer to do anything.',
    },
    {
      type: 'standard_citation',
      standard: 'ASME B1.20.1',
      publisher: 'ASME',
      title: 'Pipe Threads, General Purpose (Inch)',
      summary:
        'Covers NPT. A 60° thread angle on a 1:16 taper, sealing on thread interference and requiring a sealant. The contrast with ISO 228-1 is the whole reason BSP and NPT cannot be mixed.',
    },
    {
      type: 'paragraph',
      html: 'Note what is deliberately absent from the tables above: pressure ratings. Working pressure varies with size, series and manufacturer, and a figure quoted from memory is worth nothing on a machine. Take those from the datasheet for the part you are actually fitting.',
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I tell a fitting apart by its hex size?',
          answer:
            'No. Hex size follows the manufacturer and the wall thickness, not the thread. Two fittings with identical hexes can carry entirely different threads, and the same thread appears under several hex sizes across brands.',
        },
        {
          question: 'What is the difference between JIC 37° and Komatsu 30°?',
          answer:
            'Only the seat angle, and it is not reliably visible by eye. They will thread together on some sizes and seal poorly, because the flare and the seat make line contact instead of face contact. If the machine is Japanese-built, check the angle rather than assuming JIC.',
        },
        {
          question: 'Is BSPP the same as BSPT?',
          answer:
            'They share a thread form — 55° Whitworth — but not a taper. BSPP is parallel and seals on a cone or a bonded washer; BSPT is tapered and seals on thread interference with a sealant. A parallel male in a tapered female will not seal.',
        },
        {
          question: 'Do I need the O-ring on an ORFS fitting?',
          answer:
            'Yes. The face seal is the entire sealing mechanism on an ORFS joint. Without the O-ring, or with a perished one, the joint leaks no matter how much torque is applied — and over-torquing to chase the leak damages the face.',
        },
        {
          question: 'The thread is metric but the seat is 60°. What is it?',
          answer:
            'Most likely a metric BSP-seat fitting, which some manufacturers use. Measure the thread pitch and the thread angle before ordering — a 60° seat on a metric thread is not the same part as the 24° cone that "metric fitting" usually implies.',
        },
      ],
    },

    {
      type: 'category_link',
      slug: 'hoses-fittings',
      label: 'Browse hose fittings and adapters',
      blurb:
        'JIC, ORFS, BSP, metric DIN and SAE flange, in stock in Dubai across all four families.',
    },

    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-17',
      note: 'Thread geometry checked against the standards cited above. Pressure ratings are deliberately not published here — take those from the part datasheet.',
    },

    {
      type: 'cta_block',
      heading: 'Send us a photo of the fitting.',
      body: 'If it is still not obvious, photograph the thread against a rule and send it over. Our applications engineers identify fittings from photographs every day and will come back with the part number and what we hold.',
      quoteLabel: 'Identify my fitting',
    },
  ],
}

export default ARTICLE
