import type { BlogArticleSeed } from '../shared'

/**
 * Where DEMCO valves are used in the Middle East. Sources: DEMCO gate valve catalogue p.4 (DM uses,
 * conformance to ABS, DNV and NACE MR0175), p.5 (testing groups, elastomer limits) and parts-list
 * headings ("Assembly Base Number, NACE Compliant"); DEMCO butterfly valve brochure p.5 (industries),
 * p.8 (NE-D bulk material handling), p.9 and p.14 (marine series, 46 CFR 56, ABS, DNV, certification
 * suffix), p.26 (seat elastomers and temperatures) and p.27 (ZPEX coating). No climate, project or customer
 * figures are used: the article links duty to the catalogue's own limits.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-valves-middle-east-applications',
  title: 'Where DEMCO valves are used in the Middle East: rigs, water plants, bulk handling and marine',
  excerpt:
    'DEMCO gate valves go on rig standpipe and pump manifolds and mud lines. DEMCO butterfly valves go on water, cooling, bulk and marine lines. This guide matches each duty to the right family and elastomer from the maker’s catalogues, and covers NACE MR0175, heat limits and the ZPEX coating.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DEMCO Valves in the Middle East: Rig, Water and Marine',
  seoDescription:
    'Where DEMCO gate and butterfly valves are used in the Middle East: rig manifolds, mud mixing, sour service, heat limits, water, bulk, marine, ZPEX.',
  focusKeyword: 'demco valves middle east',
  publishedAt: '2026-11-27T17:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Where are DEMCO valves used in the Middle East?',
      answer:
        'DEMCO DM gate valves go in rig standpipe and pump manifolds, mud mixing lines and drilling block valves. NE and NF butterfly valves go on water, desalination, cooling tower, dry bulk and marine lines. The seat elastomer and, for corrosive or sour duty, the NACE MR0175 conformance and ZPEX coating decide the exact valve.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The DM gate valve catalogue names four uses: the drilling standpipe manifold, pump manifold block valves, high-pressure mud mixing lines and high-pressure drilling system block valves.',
        'DM gate valves conform to NACE MR0175, ABS and DNV, and the catalogue parts lists carry NACE-compliant assembly base numbers. They are not API monogrammed.',
        'For heat, the seat elastomer sets the limit: HNBR to 250 °F and FKM to 400 °F on the gate valve; Buna-N to 180 °F, EPDM to 275 °F and FKM to 300 °F on the butterfly valve.',
        'The butterfly valve is listed for water and wastewater, cooling towers, dry bulk handling, mining and materials, and marine and government duty. The marine series meets 46 CFR Part 56 and ABS requirements.',
        'The ZPEX coating is offered as a disc option for salt water and hydrogen sulfide, in the sizes and ratings the brochure qualifies.',
      ],
    },
    {
      type: 'lead',
      html: 'A valve selected for a brochure and a valve selected for a rig, a desalination train or a cooling tower are rarely the same decision. The catalogue says what each DEMCO family is for and what its seats can stand, and that is enough to place most Middle East duties. This article does that, and it leaves out the figures the catalogue does not give: it cites no climate data, no project and no customer. For the gate-or-butterfly decision in general, see <a href="/blog/demco-gate-valve-vs-butterfly-valve">DEMCO gate valve or butterfly valve</a>.',
    },

    { type: 'section_head', number: '/01', title: 'On the rig: standpipe, pump manifold and mud mixing.', anchor: 'rig' },
    {
      type: 'paragraph',
      html: 'The Series DM gate valve is, in the catalogue’s words, designed for dependable, heavy-duty performance in abrasive service. The uses it lists are the drilling standpipe manifold, pump manifold block valves, high-pressure mud mixing lines and high-pressure drilling system block valves. In each the valve sits in a mud line that is abrasive and under pressure, and in each the property that matters is positive, drop-tight shut-off that can be repaired in line. The bonnet comes off without removing the valve from the line, so a worn seat can be changed without cutting out the pipe.',
    },
    {
      type: 'paragraph',
      html: 'The pressure rating you need decides the model: the DM 7500 for 7,500 psi service, the DM 5000 for 5,000 psi, and the ASME Class 600, 900 and 1500 valves for the classes in between. The differences are laid out in <a href="/blog/demco-dm-5000-vs-dm-7500-gate-valve">DM 5000 vs DM 7500</a>. Keep spares for the family you run: the kits for each are different, as shown in <a href="/blog/mud-gate-valve-repair-kits">mud gate valve repair kits</a>. The pumps these manifolds serve are covered in <a href="/blog/mud-pump-valves-and-dampener-diaphragms">mud pump valves and dampener diaphragms</a>.',
    },
    {
      type: 'paragraph',
      html: 'Mud mixing has two sides. The high-pressure mixing line, fed from the pumps, is gate valve duty. Where a mud plant has lower-pressure water and dry additive lines, the butterfly valve’s own duty list (water, dry bulk handling) applies, as covered below. The butterfly valve is not a substitute on the high-pressure line.',
    },

    { type: 'section_head', number: '/02', title: 'Sour service and NACE MR0175.', anchor: 'sour' },
    {
      type: 'paragraph',
      html: 'The gate valve catalogue states that the valves conform to NACE MR0175, and the DM parts lists are headed “Assembly Base Number, NACE Compliant”. For a sour well that is the starting point: specify the DM base number and trim from the catalogue, state the sour-service requirement on the order, and ask for the material certificates. The catalogue also describes the higher testing groups on the 7,500 psi valve, with impact tests at or below −50 °F [−46 °C] and non-destructive examination, which some specifications call for. It does not print an H2S partial-pressure limit, and none should be assumed.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The butterfly valve makes no NACE claim.',
      body: 'The butterfly brochure does not state NACE MR0175 conformance. If a specification calls for sour-service materials on a butterfly valve, ask the maker through us before quoting. The coating route in section 7 is the brochure’s statement for hydrogen sulfide environments.',
    },

    { type: 'section_head', number: '/03', title: 'Heat: choosing the elastomer.', anchor: 'heat' },
    {
      type: 'paragraph',
      html: 'For hot service the metal is rarely the limit. The seat is. The catalogues give the ranges below, and the table lines the two families up so you can see which seat reaches what.',
    },
    {
      type: 'comparison_table',
      caption: 'Seat elastomers and their limits, from the gate valve catalogue and the butterfly valve brochure',
      columns: ['Valve', 'Elastomer', 'Range', 'Suits', 'Not for'],
      rows: [
        { cells: ['DM gate', 'Buna-N', '−10 to 200 °F [−23 to 93 °C]', 'Petroleum oil and gases, fuel oils, alcohols', 'Not stated'] },
        { cells: ['DM gate', 'HNBR', '−20 to 250 °F [−29 to 121 °C]', 'Synthetic and oil-based drilling mud', 'Not stated'] },
        { cells: ['DM gate', 'FKM', '−10 to 400 °F [−23 to 204 °C]', 'Mineral acids and hydrocarbons', 'Steam'] },
        { cells: ['Butterfly', 'Buna-N', '0 to 180 °F [−18 to 82 °C]', 'Hydrocarbon and petroleum', 'Not stated'] },
        { cells: ['Butterfly', 'EPDM (peroxide-cured)', '20 to 275 °F [−6 to 135 °C]', 'Water, saturated steam to 275 °F, alkalis', 'Oil and hydrocarbons'] },
        { cells: ['Butterfly', 'FKM', '20 to 300 °F [−6 to 149 °C]', 'Elevated temperature, harsh chemicals', 'Hot water and steam'] },
        { cells: ['Butterfly', 'Natural rubber', '−30 to 150 °F [−34 to 65 °C]', 'Abrasion, dry material handling', 'Oils and solvents'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'In practice this gives a simple rule. For hot drilling mud on synthetic or oil-based systems, HNBR is the catalogue’s seat to 250 °F, and FKM is the choice when temperature goes beyond that, up to 400 °F, with the steam restriction. For a butterfly valve the whole range stops at 300 °F, with the seat deciding where. The seat-change procedure is in <a href="/blog/demco-butterfly-valve-seat-replacement">seat replacement and maintenance</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Desalination, water and cooling towers.', anchor: 'water' },
    {
      type: 'paragraph',
      html: 'The butterfly brochure lists water and wastewater and cooling towers (HVAC) among its industries, and it recommends general-service EPDM for water service, with resistance to saturated steam up to 275 °F and suitability for alkaline solutions. EPDM is not suitable for oil or hydrocarbons, so a lubricated or oily water line needs another seat. A desalination or water-treatment plant is water-and-wastewater duty in this reading. The NE-C general-purpose valve in wafer or lug body, and the NE-I short-neck valve with its choice of body materials (ductile iron, aluminium bronze, carbon steel, stainless steel), are the bodies to look at, and 200 psi shut-off is the standard for 2 to 12 in.',
    },
    {
      type: 'paragraph',
      html: 'For water on larger lines the NF-C covers 14 to 36 in at 150 psi, with 285 psi as the option. Lug bodies are recommended where a pump or control device has to be taken out for repair, and for end-of-line service with downstream piping removed, with weld-neck or socket flanges only. For choosing between wafer and lug bodies, see <a href="/blog/butterfly-valves-wafer-lug-and-grooved">wafer, lug and grooved butterfly valves</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Bulk handling.', anchor: 'bulk' },
    {
      type: 'paragraph',
      html: 'Dry bulk handling and mining and materials are on the brochure’s industry list. The NE-D, a short-neck valve with body notches for lightweight flange patterns, is described as ideal for bulk material handling and the transportation industry. Natural rubber is the seat the brochure recommends for abrasion and dry material handling, with a limit of −30 to 150 °F and no use in oils and solvents. A dry line raises opening torque, and the brochure recommends 50 psi discs for dry service, which is covered in <a href="/blog/demco-butterfly-valve-torque-actuator-sizing">torque and actuator sizing</a>.',
    },

    { type: 'section_head', number: '/06', title: 'Marine and offshore.', anchor: 'marine' },
    {
      type: 'paragraph',
      html: 'The marine series is built to Title 46 of the Code of Federal Regulations, Part 56, of the US Coast Guard’s Marine Engineering Regulations, with US Coast Guard Category (A) acceptance on API Spec 607 qualified valves, and to the American Bureau of Shipping standard, including MSS SP-25 tagging and MSS SP-67 testing. Every marine valve is shell tested at one and a half times rated working pressure and seat tested at rated working pressure. Certification suffix codes 01 to 04 name ABS, DNV, PED and CRN. The series covers 2 to 36 in in NE-C lug, NE-I lug and wafer, NE-D wafer and NF-C lug styles, with the 30 and 36 in sizes only in ductile iron lug. Part numbers are in <a href="/blog/demco-butterfly-valve-part-numbers">DEMCO butterfly valve part numbers</a>.',
    },
    {
      type: 'paragraph',
      html: 'On the gate valve side, the DM valves conform to ABS and DNV. That is the catalogue’s statement and the whole of it: it is not a class approval for any particular vessel or rig, so state the class society and the rules on the enquiry.',
    },

    { type: 'section_head', number: '/07', title: 'ZPEX for salt water and hydrogen sulfide.', anchor: 'zpex' },
    {
      type: 'paragraph',
      html: 'ZPEX is a two-part coating: an electrodeposited epoxy e-coat primer, then a fluoropolymer topcoat. The brochure names oil and gas, salt water, water treatment and chemical processing as uses, and says the system can replace stainless steel in most corrosive environments, including salt water and hydrogen sulfide. It is applied at 2.0 to 2.8 mil dry film, and has a 500 °F maximum operating temperature. In a butterfly part number, disc code A is ZPEX coated ductile iron.',
    },
    {
      type: 'paragraph',
      html: 'The sizes the brochure lists as qualified are 2 to 6 in in lug bodies, and 8 to 36 in in wafer and lug bodies, all ductile iron with FKM seats, at 285 psi for the 2 to 6 in and 200 and 285 psi for the 8 to 36 in. Because those are the qualified combinations, state your size, body and seat when you ask for ZPEX, so we can confirm the valve falls inside them.',
    },

    { type: 'section_head', number: '/08', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'paragraph',
      html: 'Indus Hydraulics supplies DEMCO valves and spares from Dubai, UAE. Send the duty (rig manifold, mud line, water, bulk or marine), the fluid, the pressure and temperature, the size and end connection, any sour-service or class-society requirement, and whether the line is wet or dry. See the <a href="/c/oilfield-gate-valves">oilfield gate valves</a>, <a href="/c/butterfly-valves">butterfly valves</a> and <a href="/c/mud-manifold-fittings">mud manifold fittings</a> shelves.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Which DEMCO valve goes on a rig standpipe manifold?',
          answer:
            'The Series DM gate valve. The catalogue lists the drilling standpipe manifold, pump manifold block valves, high-pressure mud mixing lines and high-pressure drilling system block valves as its uses.',
        },
        {
          question: 'Are DEMCO DM gate valves suitable for sour service?',
          answer:
            'The catalogue states that they conform to NACE MR0175, and the parts lists give NACE-compliant assembly base numbers. State the sour-service conditions on the order; the catalogue prints no H2S partial-pressure limit.',
        },
        {
          question: 'What seat should I use for hot drilling mud?',
          answer:
            'HNBR is formulated for synthetic and oil-based mud from −20 to 250 °F [−29 to 121 °C]. FKM reaches 400 °F [204 °C] and is serviceable from −10 °F, but is not suitable for steam.',
        },
        {
          question: 'Which butterfly seat suits water and desalination service?',
          answer:
            'Peroxide-cured EPDM, 20 to 275 °F [−6 to 135 °C], which the brochure recommends for water, saturated steam to 275 °F and alkaline solutions. It is not suitable for oil or hydrocarbons.',
        },
        {
          question: 'Do DEMCO butterfly valves have marine approvals?',
          answer:
            'The marine series is built to 46 CFR Part 56 and the ABS standard, with certification codes for ABS, DNV, PED and CRN. Approvals apply to selected sizes and pressure ratings, so state the class society and rules with your enquiry.',
        },
        {
          question: 'What is ZPEX and when is it used?',
          answer:
            'A two-part epoxy and fluoropolymer coating for severe service, offered as a ductile iron disc option (code A). The brochure says it can replace stainless steel in most corrosive environments, including salt water and hydrogen sulfide.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'DEMCO valves for these duties',
      skus: ['IH-VAL-DM7500-4', 'IH-VAL-BFLY-NEI-W-6', 'IH-VAL-BFLY-NED', 'IH-VAL-BFLY-MARINE'],
    },
    {
      type: 'category_link',
      slug: 'oilfield-gate-valves',
      label: 'Oilfield gate valves',
      blurb: 'DEMCO DM and DMA gate valves for standpipe, pump manifold and mud lines.',
    },
    {
      type: 'category_link',
      slug: 'butterfly-valves',
      label: 'Butterfly valves',
      blurb: 'DEMCO NE, NF and marine butterfly valves for water, bulk and marine service.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-gate-valve-vs-butterfly-valve', 'demco-dm-5000-vs-dm-7500-gate-valve', 'demco-butterfly-valve-seat-replacement', 'model-72-vs-dm-gate-valve'],
    },
    {
      type: 'cta_block',
      heading: 'Specifying DEMCO valves for a rig, plant or vessel?',
      body: 'Send the duty, fluid, pressure and temperature, and any NACE or class requirement. We will propose the valve and elastomer and quote from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
