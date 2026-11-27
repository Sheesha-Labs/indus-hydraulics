import type { BlogArticleSeed } from '../shared'

/**
 * DEMCO gate valve or butterfly valve. Sources: DEMCO gate valve catalogue pp.4-5 (DM uses, classes and
 * pressures, seat designs, testing, elastomer limits), pp.6, 8, 10, 12, 14, 16, 18, 20 (handle turns, weights,
 * lengths), pp.30-43 (DMA automation); DEMCO butterfly valve brochure pp.5-7 (features, ratings, sizes,
 * temperature, standards), p.9 (handles, gear operators), p.13 (weights), p.23 (gear operators),
 * p.25 (maintenance, vacuum) and p.26 (elastomers). Weights are as printed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-gate-valve-vs-butterfly-valve',
  title: 'DEMCO gate valve or butterfly valve? Pressure, size, sealing and where each goes',
  excerpt:
    'DEMCO makes two very different valve families. The DM gate valve is a multi-turn slab gate for drilling mud at ASME Class 600 to 1500 and 5,000 or 7,500 psi. The NE and NF butterfly valve is a quarter-turn resilient-seated valve in an ASME Class 150 body for utilities, water, bulk and marine duty.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DEMCO Gate Valve vs Butterfly Valve: Which to Choose',
  seoDescription:
    'DEMCO gate valve vs butterfly valve: DM gate valves for mud at 5,000 to 7,500 psi, NE and NF butterfly valves for 150 to 285 psi utilities. Compare them.',
  focusKeyword: 'demco gate valve vs butterfly valve',
  publishedAt: '2026-11-27T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Should I use a DEMCO gate valve or a butterfly valve?',
      answer:
        'Use a DEMCO DM gate valve for abrasive drilling mud and high pressure: ASME Class 600, 900 or 1500, or 5,000 and 7,500 psi. Use an NE or NF butterfly valve for shut-off in utilities, water, bulk handling and marine lines at 200, 285 or 150 psi. They are not interchangeable: the butterfly body is rated ASME Class 150 and the gate valve is not.',
    },
    {
      type: 'key_takeaways',
      items: [
        'DM gate valves are made in ASME Classes 600, 900 and 1500 and at 5,000 and 7,500 psi. The 5,000 and 7,500 psi valves are hydrotested to API Spec 6A testing requirements but are not API monogrammed.',
        'NE and NF butterfly valves have an ASME Class 150 body (285 psi non-shock) and are sold with drop-tight shut-off ratings of 200 psi as standard for 2 to 12 in, 150 psi as standard for 14 to 36 in, and 285 psi as an option.',
        'Seat port sizes for the DM gate valve run from 2 in to 5-1/8 in at 5,000 and 7,500 psi. Butterfly valves run from 2 in to 36 in.',
        'The gate valve is multi-turn and is repaired in line by lifting the bonnet. The butterfly valve is quarter-turn and its seat slips out of the body without special tools.',
        'On a rig the gate valve goes in the standpipe manifold, the pump manifold and the high-pressure mud mixing lines. The butterfly valve belongs on water, cooling, bulk and marine lines.',
      ],
    },
    {
      type: 'lead',
      html: 'Both families carry the DEMCO name and both come from the same maker, Cameron, an SLB company, so a quotation request for “a DEMCO valve” can mean either. They are built for different jobs. This article sets the two side by side on pressure, size, sealing, operation and maintenance, and says where each belongs on a rig and in a plant. The part-number detail for each is in <a href="/blog/demco-dm-gate-valve-part-numbers">reading a DM gate valve assembly number</a> and <a href="/blog/demco-butterfly-valve-part-numbers">the butterfly valve part number guide</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Pressure: the biggest difference.', anchor: 'pressure' },
    {
      type: 'paragraph',
      html: 'The Series DM gate valve is offered in ASME Classes 600, 900 and 1500, and at 5,000 and 7,500 psi gauge pressure. The catalogue states that the 5,000 and 7,500 psi valves are not API monogrammed. Every gate-style DEMCO valve is hydrostatically tested, with stem seal, body and seat inspected for zero leakage under pressure before shipment, and the hydrotest specifications are based on the latest edition of the API Spec 6A testing requirements. A DM 7500 Group 1 valve has a hydrostatic shell test at 11,250 psi and a seat test at 7,500 psi on each side.',
    },
    {
      type: 'paragraph',
      html: 'The butterfly valve sits in a different range. Its body is rated ASME Class 150, which the brochure gives as 285 psi non-shock. Inside that body the drop-tight shut-off rating depends on the disc and size. For 2 to 12 in the standard is 200 psi, with 285 psi and 50 psi as options and a 0 psi throttling disc where drop-tight closure is not needed. For 14 to 36 in the standard is 150 psi, with 285 psi as the option. If the line pressure is above those figures, the butterfly valve is the wrong valve, whatever the size.',
    },

    { type: 'section_head', number: '/02', title: 'Size range and weight.', anchor: 'size' },
    {
      type: 'paragraph',
      html: 'DM gate valves are specified by seat port. At 7,500 and 5,000 psi the full-port sizes are 2, 3, 4 and 5-1/8 in, and the pressure matrix also lists reduced-port patterns such as 4 × 3 in and 6 × 5 in. The ASME Class 600 and 900 valves reach 6 in. Butterfly valves cover 2 to 36 in, with NE-C, NE-I and NE-D in the 2 to 12 in range and NF-C from 14 to 36 in.',
    },
    {
      type: 'paragraph',
      html: 'Weight shows the difference in construction. A 4 in DM 7500 flanged gate valve weighs 456 lbm [207 kg], and the weld-end version 281 lbm [127 kg]. A 4 in NE-C butterfly valve weighs 11.4 lbm as a wafer and 17.0 lbm as a lug, bare stem. The gate valve has a flanged, welded, threaded or hammer union connection to the line, and the butterfly valve is a one-piece body clamped between flanges.',
    },

    { type: 'section_head', number: '/03', title: 'Sealing: slab gate and seat against disc and liner.', anchor: 'sealing' },
    {
      type: 'paragraph',
      html: 'The DM 7500 seat is two identical metal wear rings encapsulated in elastomer to make a cylinder with a gate slot and two round ports. The closed gate bears on the downstream wear ring, and the elastomer gives a pressure-responsive seal around the port. The DM 5000 and the Class 600, 900 and 1500 valves use a one-piece seat assembly that is expanded outward toward the ports by the bonnet and a spread ring. The catalogue says that design still seals if the gate and seat ring become scored or abraded in service, which is the condition abrasive mud produces. Both designs are covered in <a href="/blog/demco-dm-5000-vs-dm-7500-gate-valve">DM 5000 vs DM 7500</a>.',
    },
    {
      type: 'paragraph',
      html: 'The butterfly valve seals with a cartridge seat: a resilient elastomer permanently bonded to a rigid backing ring, slip-fitted into the body. It seals in both directions at full rated pressure, and a moulded flange seal on the seat edge takes ASME weld-neck, slip-on, threaded, socket and stub-end type C flanges. A continuous raised band on the disc presses flat into the seat and two O-ring ribs in the seat stem bore make a triple stem seal, so the stem journal stays dry.',
    },
    {
      type: 'paragraph',
      html: 'Elastomer limits differ too. The gate valve seat options are Buna-N (−10 to 200 °F), HNBR (−20 to 250 °F, for synthetic and oil-based mud) and FKM (−10 to 400 °F, not for steam). On the butterfly valve the whole valve is limited to −30 to 300 °F by seat choice: Buna-N 0 to 180 °F, EPDM 20 to 275 °F, FKM 20 to 300 °F and natural rubber −30 to 150 °F.',
    },

    { type: 'section_head', number: '/04', title: 'Operation and maintenance.', anchor: 'operation' },
    {
      type: 'paragraph',
      html: 'A gate valve is multi-turn. The handle turns from open to closed range from 8.6 turns on the 2 in DM 7500 to 27.8 turns on the 5-1/8 in, and from 10.2 to 29.6 turns on the DM 5000. For remote or fast operation the DMA series is the same gate valve with a hydraulic Ledeen actuator, available at 5,000 and 7,500 psi. The bonnet comes off without taking the valve out of the line, which is why the catalogue calls the DM series field-repairable inline.',
    },
    {
      type: 'paragraph',
      html: 'A butterfly valve is quarter-turn. Handles are available for 2 to 12 in (ten-position locking, two-position locking and memory-stop throttling), worm gear operators for 2 to 36 in, and the top flange is dimensioned for power actuation. The brochure says no regular maintenance or lubrication is required, and a worn seat is replaced by pushing the disc and seat out of the body, as set out in <a href="/blog/demco-butterfly-valve-seat-replacement">seat replacement and maintenance</a>. Sizing the operator is covered in <a href="/blog/demco-butterfly-valve-torque-actuator-sizing">torque and actuator sizing</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Side by side.', anchor: 'comparison' },
    {
      type: 'comparison_table',
      caption: 'DEMCO DM gate valve and NE / NF butterfly valve, from the maker’s catalogues',
      columns: ['Point', 'DM gate valve', 'NE / NF butterfly valve'],
      rows: [
        { cells: ['Pressure', 'ASME 600, 900, 1500; 5,000 and 7,500 psi', 'ASME Class 150 body (285 psi non-shock); shut-off 200 / 285 / 50 psi, 2 to 12 in; 150 / 285 psi, 14 to 36 in'] },
        { cells: ['Size', 'Seat port 2 to 6 in; 2, 3, 4, 5-1/8 in at 5,000 and 7,500 psi', '2 to 36 in'] },
        { cells: ['Seal', 'Elastomer seat with metal wear rings; spread-ring seat on DM 5000', 'Hard-backed cartridge seat; seals both directions at full rating'] },
        { cells: ['Operation', 'Multi-turn handwheel (8.6 to 29.6 turns); DMA hydraulic actuator', 'Quarter-turn; handle to 12 in, worm gear 2 to 36 in, actuators'] },
        { cells: ['Maintenance', 'Bonnet removed in line; seat, gate and seals replaced', 'No regular lubrication; seat slips out of the body'] },
        { cells: ['Seat temperature', 'Buna-N −10 to 200 °F; HNBR −20 to 250 °F; FKM −10 to 400 °F', '−30 to 300 °F, by seat'] },
        { cells: ['4 in weight', 'DM 7500: 281 lbm weld, 456 lbm flanged', 'NE-C: 11.4 lbm wafer, 17.0 lbm lug'] },
        { cells: ['Standards', 'Hydrotest to API Spec 6A requirements, not monogrammed; ABS, DNV, NACE MR0175', 'MSS SP-67, MSS SP-25; ABS, CE/PED, CRN, DNV, EAC and API 607 4th Ed fire test on selected sizes and ratings'], highlight: true },
      ],
    },

    { type: 'section_head', number: '/06', title: 'Where each one goes.', anchor: 'where' },
    {
      type: 'paragraph',
      html: 'The gate valve catalogue lists the DM uses plainly: the drilling standpipe manifold, pump manifold block valves, high-pressure mud mixing lines and high-pressure drilling system block valves. Those are abrasive, high-pressure services where a full-bore, drop-tight, repairable valve earns its weight. For the wider rig picture, including the Model 72 many crews already know, see <a href="/blog/model-72-vs-dm-gate-valve">Model 72 vs DM gate valve</a>.',
    },
    {
      type: 'paragraph',
      html: 'The butterfly brochure lists chemical and petrochemical, agriculture, oil and gas drilling and production, food and beverage, water and wastewater, cooling towers, power, mining and materials, dry bulk handling, and marine and government. On a rig that means the water, utility and low-pressure service lines rather than the mud manifold. In a plant it means isolation and throttling on water, cooling and bulk lines, where a light valve that can be actuated is worth more than a high pressure class. A general guide to the butterfly range is in <a href="/blog/butterfly-valves-wafer-lug-and-grooved">wafer, lug and grooved butterfly valves</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not substitute one for the other.',
      body: 'A butterfly valve is not a lower-cost replacement for a DM gate valve in a mud line. Its body is rated Class 150, well below the 5,000 and 7,500 psi duty of the standpipe or pump manifold. Match the valve to the pressure class and service first, then to the size.',
    },

    { type: 'section_head', number: '/07', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'paragraph',
      html: 'Indus Hydraulics quotes DEMCO gate valves, butterfly valves and spares from Dubai, UAE. To choose between the two families, send the working pressure, the fluid, the line size and end connection, the temperature, and whether the valve will be hand-operated or automated. For a gate valve, add the pressure class or psi rating and the pipe schedule for weld ends. For a butterfly valve, add the flange class and whether the line needs a lug body for end-of-line service. Browse the <a href="/c/oilfield-gate-valves">oilfield gate valves</a> and <a href="/c/butterfly-valves">butterfly valves</a> shelves.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can a DEMCO butterfly valve replace a DEMCO gate valve?',
          answer:
            'Not in a mud line. The butterfly valve body is rated ASME Class 150 (285 psi non-shock) and its drop-tight shut-off ratings are 200, 285, 150 or 50 psi. The DM gate valve is built for ASME Class 600 to 1500 and for 5,000 and 7,500 psi.',
        },
        {
          question: 'Are DEMCO DM gate valves API monogrammed?',
          answer:
            'No. The catalogue states that the 5,000 and 7,500 psi valves are not API monogrammed. They are hydrotested to API Spec 6A testing requirements and conform to ABS, DNV and NACE MR0175.',
        },
        {
          question: 'What sizes do DEMCO butterfly valves come in?',
          answer:
            'From 2 to 36 in. NE-C, NE-I and NE-D cover 2 to 12 in, NF-C covers 14 to 36 in, and the marine series covers 2 to 36 in. Wafer and lug bodies are both offered on most series.',
        },
        {
          question: 'Which DEMCO valve is repaired in line?',
          answer:
            'The DM gate valve. The bonnet is removed to inspect or replace internal parts without taking the valve out of the line. The butterfly valve is serviced by removing the handle or actuator, the tangential pins and the stems, and pushing the disc and seat out of the body.',
        },
        {
          question: 'Do DEMCO butterfly valves have a fire-safe version?',
          answer:
            'Yes, on selected sizes and ratings. The resilient-seat design has been fire tested to API Spec 607 4th Edition, and fire-safe part numbers start with F0 where non-fire-safe ones start with J0.',
        },
        {
          question: 'Which valve is lighter?',
          answer:
            'The butterfly valve by a wide margin. A 4 in NE-C weighs 11.4 lbm as a wafer and 17.0 lbm as a lug, against 281 lbm weld-end and 456 lbm flanged for a 4 in DM 7500 gate valve.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'DEMCO gate and butterfly valves',
      skus: ['IH-VAL-DM7500-4', 'IH-VAL-DM5000-4', 'IH-VAL-BFLY-NEC-W-4', 'IH-VAL-BFLY-NFC'],
    },
    {
      type: 'category_link',
      slug: 'oilfield-gate-valves',
      label: 'Oilfield gate valves',
      blurb: 'DEMCO Series DM and DMA gate valves for drilling mud, ASME Class 600 to 1500 and 5,000 and 7,500 psi.',
    },
    {
      type: 'category_link',
      slug: 'butterfly-valves',
      label: 'Butterfly valves',
      blurb: 'DEMCO NE-C, NE-I, NE-D, NF-C and marine butterfly valves, 2 to 36 in, with handles, gear operators and actuators.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-dm-5000-vs-dm-7500-gate-valve', 'demco-butterfly-valve-part-numbers', 'model-72-vs-dm-gate-valve', 'butterfly-valves-wafer-lug-and-grooved'],
    },
    {
      type: 'cta_block',
      heading: 'Choosing between a gate and a butterfly valve?',
      body: 'Send the pressure, fluid, size and end connection. We will recommend the DEMCO family and quote it from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
