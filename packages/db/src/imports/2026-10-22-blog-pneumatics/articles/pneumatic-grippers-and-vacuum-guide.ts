import { stockList } from '../products'
import type { BlogArticleSeed } from '../shared'

/**
 * Pneumatic grippers and vacuum handling. Gripping-force rule F = mg/(2μ) × a, a = 4, giving 10–20 × workpiece
 * weight at μ 0.2–0.1, plus "greater margin for high acceleration or impact", and gripping-force-vs-gripping-point
 * graphs by pressure (SMC MHC2/MHCA2/MHCM2 catalogue, Model Selection, p. 662 and p. 679); three-finger guidance of
 * 7–13 × weight (SMC MHS3 catalogue, as published); condensation in small-bore high-cycle actuators (SMC MHC2 p. 666);
 * friction vs encompassing grip, μ 0.2–0.4, as much as 4× force for friction grip, safety factor 4 friction / 1.25
 * encompassing, weight + acceleration worked example, finger deflection and gripping close to the body, spring-open /
 * spring-closed variants, 30° and 180° angular and three-jaw types (Parker Catalog 1900-2/US, Pneumatic Grippers,
 * Design Guidelines); Destaco product data pages (RPS-11M, RPS-12M, DPG-10M-3/-4, RDH-8M): optional spring assist,
 * higher spring-assisted grip force and 50–100 psi range with springs on RDH, maximum finger length per model, DPG for
 * chip-laden environments; Schunk AS/IS gripping-force maintenance keeping a minimum grip force on pressure drop
 * (Schunk PGN-plus-P / PGH product pages). Vacuum: SMC Vacuum Overview (SMC Europe) — S = 40W/P quick formula with
 * safety factor built in and −80 kPa assumption, D formula with n pads and t, pad-area table, pad forms (flat, flat
 * with ribs, deep, bellows, oval) and uses, ejector choice by suction flow vs air use, ZF filter / AMJ separator when
 * liquid can be drawn in, ZK2 energy-saving switch/check-valve function, ZQ-A max −80 kPa, ZH-A S-type −90 kPa vs
 * L-type −48 kPa with about twice the suction flow; SMC ZPT/ZPX application data: lifting force W, stable vacuum P,
 * pad area S, factor of safety ≥4 horizontal and ≥8 vertical; SMC worked example 20 kg / 5 pads / −60 kPa = 39.2 N
 * per pad; SMC vacuum selection guide topics on leakage from workpiece conductance and adsorption tests.
 * inHg conversion: 1 inHg = 3.386 kPa.
 * Left out as unsourced: friction coefficients for specific pad/jaw materials, any Destaco safety-factor figure (none
 * published on the pages read), maximum vacuum of a vacuum pump, release-time figures, and how the Destaco toggle-lock
 * angular gripper behaves on air loss (only third-party descriptions found).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pneumatic-grippers-and-vacuum-guide',
  title: 'Pneumatic grippers and vacuum cups: choosing the jaw style, sizing the grip force and the pad',
  excerpt:
    'Parallel, angular or three-jaw; friction grip or encompassing grip; spring assist for loss of air; and on the vacuum side, ejector or pump, flat, bellows or deep pad, and how to size the pad from the load with the safety factor the maker publishes. Worked through with SMC, Parker, Destaco and Schunk data.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pneumatic Grippers & Vacuum Pads: Sizing and Selection',
  seoDescription:
    'How to choose parallel, angular or 3-jaw pneumatic grippers, size grip force with maker safety factors, add spring assist, and size vacuum pads and ejectors.',
  focusKeyword: 'pneumatic gripper sizing',
  publishedAt: '2026-10-22T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'SMC sizes a two-jaw friction grip at 10 to 20 times the workpiece weight: F = mg ÷ (2μ) × 4, with μ between 0.2 and 0.1. Parker suggests a safety factor of 4 on friction grip and 1.25 on an encompassing grip.',
        'Rated grip force falls as the gripping point moves away from the jaw and rises with supply pressure. Read the force at your real finger length and your lowest working pressure.',
        'Spring assist (Destaco), spring-closed models (Parker) or gripping-force maintenance (Schunk) keep a grip when the air drops. A plain double-acting gripper does not.',
        'SMC sizes vacuum pads as W = P × S × 0.1 ÷ t, with a safety factor t of at least 4 for a horizontal lift and at least 8 for a vertical one.',
        'On porous loads, suction flow matters more than ultimate vacuum: SMC’s ZH high-flow type pulls about twice the flow of its high-vacuum type, but only −48 kPa against −90 kPa.',
      ],
    },
    {
      type: 'lead',
      html: 'A pick-and-place station holds a part with jaws or with a vacuum cup. Both fail by dropping the part when the robot accelerates, and both are sized the same way: from the worst case, with the maker’s safety factor, at the conditions you will actually run. This guide uses the rules SMC, Parker, Destaco and Schunk publish.',
    },

    { type: 'section_head', number: '/01', title: 'Parallel, angular or three-jaw.', anchor: 'jaw-styles' },
    {
      type: 'prose',
      html: '<p><strong>Parallel grippers</strong> move both jaws in a straight line, towards or away from each other, so the fingers stay parallel through the whole stroke. They are the general-purpose choice, and Parker shows the friction grip, flat faces squeezing the part, on a parallel gripper. Most Destaco ranges on our shelf are parallel, and the titles name the variant: <em>sealed</em> (RPS, RP-5-10, RP-11-19), <em>long stroke</em> (RPR, DPL), <em>long finger</em> (DPW, DPP) or <em>wide body</em> (RPW). Destaco designs its DPG series for CNC machining and harsh, chip-laden environments.</p><p><strong>Angular grippers</strong> pivot each jaw about a pin, so the fingertips travel in an arc. Parker illustrates the encompassing grip, where the fingers cradle the part, on an angular gripper. Parker builds 30° and 180° wide-angle types; SMC’s MHC2 is a compact angular gripper, double acting or single acting (normally open).</p><p><strong>Three-jaw grippers</strong> close three fingers at 120° on a common centre, so a round part is centred on the gripper axis as it is gripped. With three fingers the friction arithmetic changes: SMC’s guidance for its three-finger MHS3 is a grip force of roughly 7 to 13 times the workpiece weight, against 10 to 20 times for two fingers.</p><p>The shelf also carries special-purpose Destaco families: 84-series and GR84 pressroom and sheet-metal grippers, DBG bag grippers, ARV vacuum grippers, and RR and other rotary actuators.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Gripper styles at a glance (descriptions from Parker, SMC and Destaco literature)',
      columns: ['Style', 'Jaw motion', 'Typical grip', 'Good for', 'Examples on our shelf'],
      rows: [
        { cells: ['Parallel, 2-jaw', 'Straight line, fingers stay parallel', 'Friction (flat faces) or shaped fingers', 'General pick-and-place, varied widths, machine tending', 'Destaco RPS, RDH, DPG, DPDS, RPW, RPR, 2P'], highlight: true },
        { cells: ['Angular, 2-jaw', 'Jaws pivot through an arc', 'Encompassing (fingers cradle the part)', 'Compact, light tasks; wide-angle types swing clear of the part', 'Destaco RUA, CT/DCT, FUA, RA, toggle-locking angular'] },
        { cells: ['Three-jaw', 'Three fingers close on one centre', 'Centring grip on round parts', 'Shafts, discs, turned parts', 'Destaco 3P, RPC, RTH 3-jaw'] },
        { cells: ['Vacuum pad', 'None; atmospheric pressure holds the part', 'Suction on one face', 'Sheet, cartons, glass, flat or gently curved faces', 'SMC ZP and pad ranges, Value Line pads'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Sizing the grip force.', anchor: 'grip-force' },
    {
      type: 'prose',
      html: '<h3>Friction grip versus encompassing grip</h3><p>Parker separates the two cases. In a <strong>friction grip</strong> only friction between finger faces and part holds it. Parker gives a typical coefficient of friction of 0.2 to 0.4 and says a friction grip can need as much as four times the force of an encompassing grip doing the same job. In an <strong>encompassing grip</strong> the fingers cradle the part, which cannot move unless they are forced open; Parker calls this more stable and safer.</p><h3>The makers’ formulas</h3><p>SMC states the condition for a two-jaw friction grip as 2 × μ × F &gt; mg, then multiplies by a safety margin <em>a</em>:</p><p><strong>F = mg ÷ (2 × μ) × a</strong></p><p>where F is the gripping force (N), μ the coefficient of friction between the attachments and the workpiece, m the workpiece mass (kg) and g = 9.8 m/s². SMC sets a = 4, which it says allows for the impacts of normal transport. That gives <strong>10 × mg at μ = 0.2 and 20 × mg at μ = 0.1</strong>. SMC recommends staying at 10 to 20 times the weight even when friction is higher than 0.2, and adding more margin for high acceleration or impact.</p><p>Parker works in pounds and adds the acceleration force first. Its example is a 20 lb part accelerated at 0.5 g, giving 20 + (20 × 0.5) = 30 lbf. Parker then applies a factor of safety of <strong>4 for a friction grip</strong> (120 lbf) or <strong>1.25 for an encompassing grip</strong> (37.5 lbf). The Destaco product pages we read give grip force, pressure range and maximum finger length per model, but no safety factor.</p><h3>Grip force depends on finger length and pressure</h3><p>A gripper’s rated force is measured at a stated gripping point and pressure. SMC’s effective-gripping-force graphs plot force against the gripping-point distance L, one curve per supply pressure. Force falls as L grows and rises with pressure. In SMC’s example an MHC2-6D gives 1.25 N at L = 25 mm and 0.4 MPa, 12.7 times the weight of a 0.01 kg part, so it passes. The gripping point must stay inside the range on the graph.</p><p>Parker gives the reason: longer tooling deflects more and loses grip force, and the load acts on a longer lever arm, so grip as close to the gripper body as possible. Destaco publishes a maximum finger length for every model: 3 in on the RPS-11M, 4 in on the RPS-12M, and 5 in on the DPG-10M-4. Read the grip force at your real finger length and <em>lowest</em> line pressure.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Holding on when the air goes.', anchor: 'spring-assist' },
    {
      type: 'prose',
      html: '<p>A double-acting gripper holds its part only while air pressure holds the jaws closed. If the supply fails, a hose is cut or an emergency stop dumps the air, the grip goes too. There are three ways to keep it:</p><ul><li><strong>Spring assist.</strong> Destaco lists spring assist as an option on ranges including RPS and DPG. On RDH it publishes a higher grip force with spring assist than without. Springs also change the operating range: Destaco gives 50–100 psi for RDH with springs, so check the minimum pressure as well as the force.</li><li><strong>Spring-closed (single-acting) grippers.</strong> Parker builds both spring-open and spring-closed versions. SMC’s MHC2 comes in a single-acting, normally open version. Choose the spring direction that holds the part: spring-closed for an external grip, spring-open for an internal grip, where the jaws expand inside a bore.</li><li><strong>Gripping-force maintenance.</strong> Schunk’s AS/IS option is a mechanical device that keeps a minimum gripping force if the pressure drops. AS works in the closing direction and IS in the opening direction.</li></ul><p>A spring holds the part. It does not make the machine safe to enter. Treat it as protection against dropping the part, and keep your guarding and lockout as they are.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Size for the worst case, not the average.',
      body: 'SMC’s safety margin of 4 covers normal transport only. High acceleration, emergency stops and impacts need more. Size at the lowest supply pressure, and where a dropped part could hurt someone, add spring assist or a spring-closed gripper.',
    },

    { type: 'section_head', number: '/04', title: 'Vacuum: ejector or pump, and which pad.', anchor: 'vacuum' },
    {
      type: 'prose',
      html: '<h3>Generating the vacuum</h3><p>A <strong>vacuum ejector</strong> (venturi or vacuum generator) blows compressed air through a nozzle and the jet draws vacuum at a side port. It has no moving parts, but uses compressed air for as long as it runs. A <strong>vacuum pump</strong> makes vacuum with its own motor and uses no compressed air; SMC’s pump circuit adds a vacuum regulator.</p><p>SMC says two questions decide which ejector to use. First, is a simple ejector enough (its ZU or ZH types, which are smaller and lighter), or do you need one with built-in valves and a vacuum switch? Second, how much suction flow do you need? More flow evacuates the system faster, but the ejector is larger and uses more air. On our shelf:</p><ul><li><strong>SMC ZH</strong> is SMC’s single-stage, body-ported ejector. Its S (high-vacuum) type reaches −90 kPa. Its L (high-flow) type reaches −48 kPa but gives roughly twice the suction flow from the same nozzle.</li><li><strong>SMC ZQ</strong> is a compact unit with a supply valve, release valve, vacuum switch and suction filter built in, rated to −80 kPa.</li></ul><p>SMC’s integrated units with an energy-saving function close the supply valve once the switch sees the set vacuum. A check valve then holds the vacuum, and the unit restarts only when vacuum decays. SMC claims up to 93% less air use on its ZK2 units.</p><p>Units: 1 inHg = 3.386 kPa, so −80 kPa is about 23.6 inHg and −90 kPa about 26.6 inHg.</p><h3>Choosing the pad</h3><p>SMC’s selection table matches the pad form to the workpiece:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Vacuum pad forms (SMC selection table)',
      columns: ['Pad form', 'SMC: use when…', 'On our shelf'],
      rows: [
        { cells: ['Flat', 'The suction surface is flat and the workpiece will not deform', 'SMC Vacuum Pad Flat 6, 8, 32 and 50 mm; SMC Vacuum Pad, Flat'], highlight: true },
        { cells: ['Flat with ribs', 'The workpiece is likely to deform, or must release cleanly', 'SMC Vacuum Pad, Flat With Ribbons'] },
        { cells: ['Deep', 'The workpiece is curved', 'SMC Vacuum Pad Deep 10 and 25 mm'] },
        { cells: ['Bellows', 'There is no room for a buffer, or the suction surface is slanted', 'SMC Vacuum Pad Bellows'] },
        { cells: ['Oval', 'The suction area is narrow or long, or the part must be located precisely', 'Within the SMC ZP and pad ranges'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>SMC adds that bellows also take up height differences, and that ribs stop the pad deforming under heavy or flexible parts. Pick the pad rubber (NBR, silicone, urethane, FKM, conductive grades) for the part and the environment, not only for grip.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Sizing a vacuum pad.', anchor: 'pad-sizing' },
    {
      type: 'prose',
      html: '<p>SMC’s lifting-force equation is:</p><p><strong>W = P × S × 0.1 ÷ t</strong></p><p>where W is the lifting force (N), P the stable vacuum pressure (kPa, as a positive number), S the pad area (cm²) and t the safety factor. SMC sets <strong>t at 4 or more for a horizontal lift</strong>, with the pad on top of the part and the load hanging below it, and <strong>8 or more for a vertical lift</strong>, where the pad holds a vertical face and the load acts along the face of the pad. The theoretical force is static, so the factor must cover real operating conditions. Rearranged for a horizontal lift with t = 4, this becomes SMC’s quick formula <strong>S = 40W ÷ P</strong>. SMC assumes −80 kPa for most applications, but use the vacuum your generator actually holds with the part on the pad.</p><h3>Worked example</h3><p>SMC’s own example lifts a 20 kg workpiece (196 N) on five pads at −60 kPa, which is 39.2 N per pad. For a horizontal lift at t = 4, each pad needs S = 39.2 × 4 ÷ (0.1 × 60) ≈ 26.1 cm². That is a diameter of about 58 mm, so the next standard size up in SMC’s table is Ø63 (31.2 cm²). Lift the same part from a vertical face and t doubles to 8, so you need twice the pad area.</p><p>Smaller sizes from SMC’s table: Ø10 mm 0.79 cm², Ø32 8 cm², Ø50 19.6 cm². At −60 kPa and t = 4, one Ø32 pad lifts 12 N, about 1.2 kg, horizontally.</p><h3>Leak-tight versus porous loads</h3><p>The equation assumes a sealed contact, as with glass, sheet metal or plastic mouldings. Cardboard, timber, fabric and perforated sheet leak air through or around the pad, and vacuum settles wherever the generator’s suction flow can hold it against the leak. SMC’s guidance covers leakage from the workpiece and an adsorption test with the real part. In practice:</p><ul><li>Choose by <strong>suction flow</strong>, not ultimate vacuum. A high-flow ejector such as SMC’s ZH L-type holds a porous part better than a high-vacuum type of the same nozzle size, even though its rated maximum vacuum is lower.</li><li>Size the pad on the vacuum <strong>measured with the part on</strong>, which will be well below the data-sheet maximum.</li><li>Use a <strong>vacuum pressure switch</strong> to confirm the part is held before the robot moves.</li><li>If dust or liquid can be drawn in, SMC fits a <strong>filter or water separator</strong> to protect the ejector, which matters on a humid site.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Jaws or vacuum?',
      branches: [
        { condition: 'Flat, smooth, non-porous face, and the part is too thin or fragile to grip by the edges?', outcome: 'Vacuum pad: flat, or ribbed if the part flexes.', sku: 'IH-SMC-VACUUM-PAD-FLAT' },
        { condition: 'Curved surface, or heights vary between parts?', outcome: 'Deep pad for curves; bellows pad for slants and height differences.', sku: 'IH-SMC-VACUUM-PAD-BELLOWS' },
        { condition: 'Porous or perforated part?', outcome: 'Vacuum with a high-flow ejector, sized from an adsorption test, or a gripper if the part has gripping faces.' },
        { condition: 'Round part that must end up centred?', outcome: 'Three-jaw gripper.', sku: 'IH-DST-RTH-SERIES-3-JAW-PARALLEL-GRIPPERS' },
        { condition: 'Heavy part, high acceleration, or must not drop on loss of air?', outcome: 'Parallel gripper with encompassing fingers and spring assist.', sku: 'IH-DST-RDH-SERIES-RUGGED-MULTI-PURPOSE-PARALLEL-GRIPPERS' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'stock' },
    {
      type: 'prose',
      html: `<p>Our grippers and actuators shelf is Destaco: parallel, angular and three-jaw grippers, pressroom and sheet-metal grippers, bag grippers and rotary actuators. Every range is listed by maker part number:</p>${stockList(['pneumatic-grippers-actuators'])}`,
    },
    {
      type: 'prose',
      html: `<p>Our vacuum shelf is mostly SMC ejectors, pads, switches, regulators and separators, with other makers’ vacuum generators, pads and adapters, regulators, and filters and liquid separators for vacuum pump lines:</p>${stockList(['vacuum-components'])}`,
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a parallel and an angular gripper?', answer: 'A parallel gripper moves its jaws in a straight line, so the fingers stay parallel. An angular gripper pivots its jaws through an arc and suits fingers shaped to cradle the part.' },
        { question: 'How do you calculate gripper force?', answer: 'SMC uses F = mg ÷ (2μ) × a for a two-jaw friction grip, with a safety margin a of 4. That works out at 10 to 20 times the workpiece weight. Parker adds acceleration force to the weight, then multiplies by 4 for a friction grip or 1.25 for an encompassing grip.' },
        { question: 'Will a pneumatic gripper hold its part if air pressure is lost?', answer: 'A plain double-acting gripper will not. Spring-assist options (Destaco), spring-closed grippers (Parker) and gripping-force maintenance (Schunk AS/IS) keep a grip force when pressure drops.' },
        { question: 'How do you size a vacuum suction cup?', answer: 'SMC uses W = P × S × 0.1 ÷ t: lifting force in N, vacuum in kPa, pad area in cm², and a safety factor t of at least 4 for a horizontal lift and 8 for a vertical one.' },
        { question: 'Should I use a vacuum ejector or a vacuum pump?', answer: 'An ejector runs on compressed air with no moving parts, but uses air while it runs; energy-saving units shut off once vacuum is reached. A pump has its own motor and uses no compressed air.' },
        { question: 'What vacuum level do suction cups need?', answer: 'SMC’s quick formula assumes −80 kPa (about 23.6 inHg). Its ZH high-vacuum ejectors reach −90 kPa and its high-flow types −48 kPa. Size on the vacuum your system actually holds with the part on the pad, which is lower on porous parts.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Grippers, ejectors and pads',
      skus: [
        'IH-DST-RPS-SERIES-PARALLEL-GRIPPERS-SEALED',
        'IH-DST-DPG-SERIES-GENERAL-PURPOSE-PARALLEL-GRIPPERS-MODU',
        'IH-DST-RUA-SERIES-ANGULAR-GRIPPERS-2-JAWS',
        'IH-DST-RTH-SERIES-3-JAW-PARALLEL-GRIPPERS',
        'IH-SMC-ZH-SERIES-VACUUM-EJECTOR',
        'IH-SMC-ZQ-SERIES-VACUUM-EJECTOR',
        'IH-SMC-VACUUM-PAD-BELLOWS',
        'IH-SMC-ZP-SERIES-VACUUM-PAD',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-grippers-actuators', label: 'Pneumatic grippers & actuators', blurb: 'Destaco parallel, angular and three-jaw grippers, pressroom grippers and rotary actuators.' },
    { type: 'category_link', slug: 'vacuum-components', label: 'Vacuum components', blurb: 'SMC ZH and ZQ ejectors, flat, ribbed, deep and bellows pads, switches, regulators and separators.' },
    {
      type: 'related_articles',
      slugs: [
        'frl-filter-regulator-lubricator-guide',
        'compressed-air-quality-iso-8573-1',
        'solenoid-valve-functions-3-2-5-2-5-3',
        'pneumatic-cylinder-types-guide',
        'air-motors-guide',
        'push-to-connect-fittings-and-silencers',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Grip-force rules from SMC (MHC2 catalogue) and Parker (Catalog 1900-2/US), spring options from Destaco and Schunk product data, vacuum sizing and pad forms from SMC vacuum literature. Factors are quoted per maker because they differ.',
    },
    {
      type: 'cta_block',
      heading: 'Sizing a gripper or a vacuum cup?',
      body: 'Send us the part’s weight, size, material and surface, how fast it moves and in which direction, and your supply pressure. We will quote the gripper or the ejector and pads to hold it, by maker part number.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
