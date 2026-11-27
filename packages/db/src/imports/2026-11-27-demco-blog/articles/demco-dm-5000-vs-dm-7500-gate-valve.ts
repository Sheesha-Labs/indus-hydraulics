import type { BlogArticleSeed } from '../shared'

/**
 * DM 5000 vs DM 7500 and the ASME classes. Sources: DEMCO gate valve catalogue p.4 (uses, seat designs,
 * conformance, not API monogrammed), p.5 (pressure class and size matrix, testing Groups 1-3, elastomer
 * limits, ordering), pp.6-13 (DM 7500 dimensions and parts), pp.14-21 (DM 5000 dimensions and parts),
 * pp.22-29 (ASME Class 600, 900, 1500) and pp.30-43 (DMA automated). Lengths and weights are as printed,
 * inches [mm] and lbm [kg]. The statement that parts do not interchange is drawn from the different seat
 * designs, part numbers and repair-kit series (J025177 for DM 7500, J025216 for DM 5000).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-dm-5000-vs-dm-7500-gate-valve',
  title: 'DEMCO DM 5000 vs DM 7500 gate valve: seats, materials, test groups and the ASME classes',
  excerpt:
    'The DM 7500 uses an encapsulated twin wear-ring seat and a 10,000 psi RTJ flange. The DM 5000 uses a one-piece seat assembly with a spread ring and a 5,000 psi RTJ flange. They share a name and a handwheel, but their seats, parts and repair kits are different, and neither is API monogrammed.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DEMCO DM 5000 vs DM 7500 Gate Valve Differences',
  seoDescription:
    'DEMCO DM 5000 vs DM 7500 gate valve: seat design, materials, Group 1 to 3 testing, end connections, sizes, weights and why parts never interchange.',
  focusKeyword: 'demco dm 5000 vs dm 7500',
  publishedAt: '2026-11-27T15:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between a DEMCO DM 5000 and a DM 7500 gate valve?',
      answer:
        'The DM 7500 is rated 7,500 psi and has a seat of two metal wear rings encapsulated in elastomer, with a 10,000 psi RTJ flange. The DM 5000 is rated 5,000 psi and has a one-piece seat assembly expanded by a spread ring, with a 5,000 psi RTJ flange. Their parts and repair kits do not interchange.',
    },
    {
      type: 'key_takeaways',
      items: [
        'DM 7500 seats are two identical metal wear rings in elastomer. DM 5000 seats, and the ASME Class 600, 900 and 1500 seats, are a single cylindrical assembly expanded outward by the bonnet and a spread ring.',
        'Testing Groups 1, 2 and 3 are listed with the DM 7500 and add charted tests, impact tests at or below −50 °F and then volumetric NDE. The base number changes with the group.',
        'Seat port sizes at both ratings are 2, 3, 4 and 5-1/8 in. DM 7500 flanges are 10,000 psi RTJ with BX rings; DM 5000 flanges are 5,000 psi RTJ with R rings.',
        'Neither valve is API monogrammed. Both are hydrotested to API Spec 6A testing requirements, and both conform to ABS, DNV and NACE MR0175.',
        'Seat, wear rings, stem seals and repair kits are different part numbers in the two families, and the repair-kit series differ (J025177 and J025216). Read the family off the valve before ordering.',
      ],
    },
    {
      type: 'lead',
      html: 'Drilling crews often talk about “a DEMCO DM” as if it were one valve. The catalogue lists five pressure ratings under that name: ASME Class 600, 900 and 1500, and the 5,000 and 7,500 psi valves that sit in standpipe and pump manifolds. The two higher ratings look alike from the handwheel, but inside they are different valves. This article covers what changes and what to quote. The earlier comparison with the Model 72 is in <a href="/blog/model-72-vs-dm-gate-valve">Model 72 vs DM gate valve</a>, and the gate-or-butterfly question is in <a href="/blog/demco-gate-valve-vs-butterfly-valve">DEMCO gate valve or butterfly valve</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Two seat designs.', anchor: 'seats' },
    {
      type: 'paragraph',
      html: 'In the DM 7500 the seat consists of two identical metal wear rings encapsulated in elastomer to form a cylinder with a gate slot and two round ports. The closed gate bears on the downstream wear ring, and the elastomer gives a drop-tight, pressure-responsive seal around the port. The seat assembly is 410 stainless steel with QPQ nitriding, bonded to HNBR or FKM, and the wear rings are listed in 41XX with QPQ nitriding or 410 stainless steel.',
    },
    {
      type: 'paragraph',
      html: 'In the DM 5000, and in the Class 600, 900 and 1500 valves, the cylindrical seat assembly fits into the machined body cavity and is expanded outward toward the ports by the bonnet and the spread ring at the bottom of the seat. The expansion happens as the bonnet is tightened onto the body and engages the seat pin extensions on both wear rings, which presses the elastomer evenly against the body bore. The catalogue says the design keeps its seal even if the gate and seat ring are scored or abraded, and that the single-piece seat is easy to reach for replacement. The DM 5000 seat insert is 1045 steel or ASTM A351 CF8M, with Buna-N or FKM.',
    },
    {
      type: 'paragraph',
      html: 'The practical effect is that the seat is a different part in each valve, with different seat, wear ring and stem seal part numbers. The DM 7500 2 in seat assembly is 2139742-01 (HNBR) or 2139741-02 (FKM); the DM 5000 2 in seat assembly is J001876-011 (1045 and Buna-N) or J001876-012 (1045 and FKM). They cannot be swapped.',
    },

    { type: 'section_head', number: '/02', title: 'Materials and Groups 1, 2 and 3.', anchor: 'materials' },
    {
      type: 'paragraph',
      html: 'The DM 7500 body is ASTM A487 Gr. 4 Class D and the bonnet is 4130. The housing is ASTM A350 Gr. LF2 Class 1, the gate is 41XX or 410 stainless with QPQ nitriding, and the stem is 410 stainless. The DM 5000 body depends on size: the 2 in is ASTM A105 in the threaded, weld and hammer union patterns and ASTM A487 Gr. 4 Class A in the flanged pattern, and the 3 in and larger bodies and bonnets are ASTM A487 Gr. 4 Class D. DM 5000 stems are 316 stainless, and 17-4PH on the 5-1/8 in. DM 5000 gates are 41XX with electroless nickel plating or ASTM A351 CF8M.',
    },
    {
      type: 'paragraph',
      html: 'The testing groups are printed with the DM 7500 and decide which base number you order. <strong>Group 1</strong> is the basic valve: shell test at 11,250 psi for 3 minutes, seat test at 7,500 psi for 3 minutes on each side, and material traceability on body and bonnet. <strong>Group 2</strong> repeats those tests with a hold, a drop to zero and a second 15-minute hold, adds a 300 psi, 5-minute low-pressure seat test on each side, charts the tests, adds traceability on stem and bolting, requires impact tests at or below −50 °F [−46 °C], and adds surface NDE on body, bonnet and stem. <strong>Group 3</strong> is Group 2 plus volumetric NDE on body and bonnet. For a 2 in DM 7500 the bases are J025088 (Group 1), J025103 (Group 2) and J025104 (Group 3). The catalogue says the 7,500 psi Groups 2 and 3 valves undergo additional test cycles, including low-pressure seat tests.',
    },

    { type: 'section_head', number: '/03', title: 'End connections, lengths and weights.', anchor: 'dimensions' },
    {
      type: 'paragraph',
      html: 'DM 7500 valves have weld, hammer union (Fig 1502) and flanged ends, with a 10,000 psi RTJ flange using a BX ring: BX-152 on the 2 in, BX-154 on the 3 in, BX-155 on the 4 in and BX-169 on the 5-1/8 in. DM 5000 valves add threaded ends and use a 5,000 psi RTJ flange with R rings: R-24, R-35, R-39 and R-44. The 5-1/8 in size has no hammer union end in either series. Each size’s end-connection codes are used in the assembly number, covered in <a href="/blog/demco-dm-gate-valve-part-numbers">reading a DM assembly number</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'DM 7500 by seat port: length A, weight and handle turns, as printed',
      columns: ['Seat port', 'Weld length A, in [mm]', 'Flanged length A, in [mm]', 'Weight weld, lbm [kg]', 'Weight flanged, lbm [kg]', 'Handle turns', 'Flange ring'],
      rows: [
        { cells: ['2 in', '9.00 [229]', '20.50 [521]', '83 [38]', '144 [65]', '8.6', 'BX-152'] },
        { cells: ['3 in', '13.00 [330]', '24.38 [619]', '185 [84]', '299 [136]', '16.0', 'BX-154'] },
        { cells: ['4 in', '16.00 [406]', '26.38 [670]', '281 [127]', '456 [207]', '21.3', 'BX-155'] },
        { cells: ['5-1/8 in', '17.88 [454]', '29.00 [737]', '532 [241]', '772 [350]', '27.8', 'BX-169'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'DM 5000 by seat port: length A, weight and handle turns, as printed',
      columns: ['Seat port', 'Weld length A, in [mm]', 'Flanged length A, in [mm]', 'Weight weld, lbm [kg]', 'Weight flanged, lbm [kg]', 'Handle turns', 'Flange ring'],
      rows: [
        { cells: ['2 in', '9.00 [229]', '12.12 [308]', '58 [26]', '103 [47]', '10.2', 'R-24'] },
        { cells: ['3 in', '11.00 [279]', '15.63 [397]', '158 [72]', '239 [109]', '11.0', 'R-35'] },
        { cells: ['4 in', '13.00 [330]', '18.00 [457]', '236 [107]', '373 [169]', '22.9', 'R-39'] },
        { cells: ['5-1/8 in', '16.00 [406]', '28.62 [727]', '329 [149]', '611 [277]', '29.6', 'R-44'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Lengths matter for swap-outs. A 2 in flanged DM 7500 is 20.50 in end to end and a 2 in flanged DM 5000 is 12.12 in, so one cannot be fitted in the place of the other without changing the spool. The 5,000 psi flange is also a different ring and bolt pattern.',
    },

    { type: 'section_head', number: '/04', title: 'Reduced port and automation.', anchor: 'reduced-port' },
    {
      type: 'paragraph',
      html: 'The size and pressure matrix lists reduced-port valves as well as the full-port seats above. At both 5,000 and 7,500 psi it shows 4 × 3 in, 5 × 4 in and 6 × 5 in. At 5,000 psi alone it lists 2-1/2 × 2 in, 3 × 2 in and 6 × 4 in, and in Class 600 it lists 2 × 1-1/2 in and 8 × 6 in. The dimension pages cover the full-port seats, so for a reduced port send both sizes and the pressure rating and we will confirm the numbers.',
    },
    {
      type: 'paragraph',
      html: 'The DMA series is the DM gate valve with a hydraulic Ledeen actuator, in 7,500 psi (2, 3, 4 and 5-1/8 in) and 5,000 psi (2, 4 and 5-1/8 in) ratings. The actuator models run from LHL 70-60 DA on the 2 in DMA 7500 to LHL 120-143 DA on the 5-1/8 in, with 4 × 3/8 NPT or 1/2 NPT cylinder connections. A 2 in weld-end DMA 7500 is listed at 108 lbm [49 kg] with its actuator, against 83 lbm for the manual valve. DMA valves use a different gate (17-4 PH stainless with QPQ nitriding) and a different repair kit; see <a href="/blog/mud-gate-valve-repair-kits">mud gate valve repair kits</a>.',
    },

    { type: 'section_head', number: '/05', title: 'The ASME Class 600, 900 and 1500 valves.', anchor: 'asme' },
    {
      type: 'paragraph',
      html: 'The same Series DM name covers the lower-pressure ASME classes. They share the one-piece spread-ring seat with the DM 5000. Ends are threaded, weld, grooved or flanged, and flanges are raised-face or ring-type joint, so the ordering information has to state which.',
    },
    {
      type: 'comparison_table',
      caption: 'DM gate valves, ASME classes, from the catalogue',
      columns: ['Class', 'Seat port sizes', 'Body and bonnet', '2 in base numbers'],
      rows: [
        { cells: ['600', '1.62 (1-1/2 in threaded), 2, 2-1/2, 3, 4, 6 and 6 in with 8 in flanges', 'ASTM A216 Gr. WCB', 'Threaded J001072; weld J001092; grooved J001082; flanged J001062'] },
        { cells: ['900', '2, 2-1/2, 3, 4, 6', 'ASTM A487 Gr. 4 Class A', 'J003947'] },
        { cells: ['1500', '2, 2-1/2, 3, 4', 'ASTM A487 Gr. 4 Class A', 'J003948'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Gates in these valves are 1045 with electroless nickel plating or ASTM A351 CF8M (41XX with ENP in the 4 in Class 1500), and stems are 303 or 316 stainless. A 2 in Class 900 flanged valve with raised-face ends is 14.50 in long [368 mm] and weighs 100 lbm [45 kg].',
    },

    { type: 'section_head', number: '/06', title: 'Not API monogrammed.', anchor: 'monogram' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not write “API 6A monogrammed” on a purchase order for these valves.',
      body: 'The catalogue states that the 5,000 and 7,500 psi DM valves are not API monogrammed. They are hydrostatically tested to the latest-edition API Spec 6A testing requirements and conform to ABS, DNV and NACE MR0175, and Cameron’s quality system is based on ISO 9000 and API Spec Q1 requirements. If your specification needs a monogrammed valve, that is a different product.',
    },

    { type: 'section_head', number: '/07', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'paragraph',
      html: 'Indus Hydraulics quotes DEMCO gate valves and spares from Dubai, UAE. Send the pressure rating (5,000 or 7,500 psi, or the ASME class), seat port, end connection with the pipe schedule or flange class, testing group for a 7,500 psi valve, the seat elastomer and the stem and gate material you need, or the part number from the nameplate. See the <a href="/c/oilfield-gate-valves">oilfield gate valves</a> and <a href="/c/gate-valve-repair-kits">gate valve repair kits</a> shelves.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Are the DM 5000 and DM 7500 parts interchangeable?',
          answer:
            'No. The seat designs differ, the seat, wear ring and stem seal part numbers differ, and the repair-kit series are different (J025177 for DM 7500, J025216 for DM 5000). Identify the family on the valve before ordering any part.',
        },
        {
          question: 'What do Group 1, 2 and 3 mean on a DM 7500?',
          answer:
            'Group 1 is the basic hydrotested valve. Group 2 adds charted shell and seat tests, a low-pressure seat test, impact tests at or below −50 °F and surface NDE. Group 3 is Group 2 plus volumetric NDE on body and bonnet. Each has its own base number.',
        },
        {
          question: 'What seat sizes do the DM 5000 and DM 7500 come in?',
          answer:
            'Full-port seats of 2, 3, 4 and 5-1/8 in at both ratings. The matrix also lists reduced-port patterns such as 4 × 3 in, 5 × 4 in and 6 × 5 in at both ratings.',
        },
        {
          question: 'Is the DM 7500 API 6A monogrammed?',
          answer:
            'No. The DM 5000 and DM 7500 are hydrotested to API Spec 6A testing requirements but are not API monogrammed. They conform to ABS, DNV and NACE MR0175.',
        },
        {
          question: 'What are the seat elastomer options?',
          answer:
            'Buna-N (−10 to 200 °F), HNBR (−20 to 250 °F, for synthetic and oil-based drilling mud) and FKM (−10 to 400 °F, not suitable for steam).',
        },
        {
          question: 'Can the DM 5000 or DM 7500 be automated?',
          answer:
            'Yes. The DMA series fits a hydraulic Ledeen actuator to the DM gate valve at 7,500 psi (2, 3, 4 and 5-1/8 in) and 5,000 psi (2, 4 and 5-1/8 in).',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'DM 5000 and DM 7500 gate valves',
      skus: ['IH-VAL-DM7500-3', 'IH-VAL-DM5000-3', 'IH-VAL-DM-ASME900', 'IH-VAL-DMA7500'],
    },
    {
      type: 'category_link',
      slug: 'oilfield-gate-valves',
      label: 'Oilfield gate valves',
      blurb: 'DEMCO DM 5000, DM 7500, ASME Class 600, 900 and 1500, and DMA automated gate valves.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-gate-valve-vs-butterfly-valve', 'demco-dm-gate-valve-part-numbers', 'mud-gate-valve-repair-kits', 'model-72-vs-dm-gate-valve'],
    },
    {
      type: 'cta_block',
      heading: 'Not sure which DM you have?',
      body: 'Send the nameplate or the assembly number. We will identify the family, the testing group and the repair kit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
