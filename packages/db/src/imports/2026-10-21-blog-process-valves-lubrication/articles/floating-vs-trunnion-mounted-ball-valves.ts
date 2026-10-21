import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Floating vs trunnion-mounted ball valves, body styles, DBB/DIB, fire-safe, actuation and subsea.
 * Sources read 2026-10-21:
 * - Valve Magazine, "Ball Valves Basics" (2021): floating ball pushed onto the downstream seat; seat load and torque
 *   become unworkable at large size and pressure; floating valves made up to 24" and Class 300, practical limit about
 *   12"; trunnion seat energised by upstream pressure and moves onto the ball; lower torque, smaller actuators;
 *   trunnion suits DBB as both seats float independently; PTFE seats limited to around 232 °C (450 °F); metal seats;
 *   fire-safe seat pocket with a metal secondary seat; API 607 / 6FA testing; seat lubrication ports.
 * - SLB, "How It Works: Double Block-and-Bleed and Double Isolation-and-Bleed": API DBB and DIB definitions (paraphrased);
 *   DBB does not give positive double isolation with pressure on one side only; self-relieving seats; DIB needs external
 *   cavity relief; trunnion DIB-1 = two bidirectional seats, DIB-2 = one bidirectional + one unidirectional; DIB-2 only
 *   counts as DIB with the bidirectional seat downstream; floating ball valves cannot bleed from the body; OSHA DBB
 *   needs two valves and a bleed.
 * - SLB Grove BT1 top-entry ball valve page: top entry, bolted bonnet, in-line disassembly, DPE seats, cavity relief
 *   valve, DBB standard, fire-safe to API 6FA.
 * - EN ISO 17292:2015 scope (genorma.com): metal ball valves, DN 8–600 (NPS 1/4–24), Class 150/300/600/800 (800 only
 *   threaded and socket-weld), PN 16–100, full/reduced/double-reduced bore.
 * - ISO 14313:2025 scope (genorma.com): supplement to API 6D 25th edition (2021); axial, ball, check, gate, plug
 *   valves; Class 150–2500.
 * - Valve World Americas, "What is new with API 6D": 25th edition Nov 2021, title changed to "Specification for
 *   Valves" (24th: pipeline and piping valves); conformance by Nov 2022.
 * - Valve Magazine, "The past, present and future of fire testing" (2018): API 607 7th ed. scope quarter-turn and
 *   non-metallic seated valves; API 6FA covers API 6A and 6D valves; 30-minute burn; 1400–1800 °F flame;
 *   calorimeters to 1200 °F within 15 min; post-fire cycling and low-pressure leak test for soft-seated valves.
 * - API 6DSS listing (standards.globalspec / standard.no via search): ball, check, gate, plug and axial valves for
 *   subsea pipelines, Class 150–2500. API 17D listing: subsea wellheads and trees, incl. tree valves and actuators.
 * - World Pipelines, "Flow control in remote locations" (2019): gas-over-oil uses pipeline gas as motive power, oil
 *   separates gas from the cylinder; line break closes on rapid pressure fall; high/low pressure close.
 * - Wikipedia, "Valve actuator": spring gives defined fail position on loss of power; electric actuator stays put on
 *   power loss without backup; ISO 5210 multi-turn / ISO 5211 part-turn mounting.
 * - US Patent 4,016,621 (1977): pigging ball valve, ball with pig cavity, 90° turn between magazine and line, launch
 *   and retrieve orientation, flow past the pig.
 * - Assured Automation, "Actuated 3-way ball valve selection": L-port connects common port to one other port only;
 *   T-port can connect two or all three depending on drilling; port combinations vary by maker.
 * NOT used: exact floating/trunnion size cut-offs from blogs (they disagree); torque figures; API 6D test pressures;
 * jacketed-valve design detail (no independent source read); API 598 backseat test applicability.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'floating-vs-trunnion-mounted-ball-valves',
  title: 'Floating vs trunnion-mounted ball valves: how each seals, where one hands over to the other, and how to specify',
  excerpt:
    'A floating ball is pushed onto its downstream seat by line pressure; a trunnion-mounted ball is held still and the seats move onto it. That one difference sets the size and class limits, the operating torque and whether a single valve can give double block and bleed. How ISO 17292, API 6D and ISO 14313 divide the work, what DBB, DIB-1 and DIB-2 actually mean, side-entry, top-entry and fully welded bodies, fire testing to API 607 and 6FA, actuation and subsea valves.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Floating vs Trunnion Mounted Ball Valves: How to Choose',
  seoDescription:
    'Floating vs trunnion ball valves: how each seals, size and class limits, torque, ISO 17292 vs API 6D, DBB and DIB-1/DIB-2, body styles, API 607 fire-safe.',
  focusKeyword: 'floating vs trunnion ball valve',
  publishedAt: '2026-10-22T01:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A floating ball is pushed onto the downstream seat by line pressure; in a trunnion valve the ball is fixed and the upstream seat is pressed onto it.',
        'Floating valves are made up to about 24" Class 300 but are practical to about 12"; above that, seat load and torque favour trunnion mounting.',
        'ISO 17292 covers metal ball valves to NPS 24 and Class 800; API 6D (with ISO 14313 as its supplement) covers Class 150 to 2500.',
        'API DBB is one valve with two seats and a cavity bleed; DIB-1 has two bidirectional seats, DIB-2 one bidirectional and one self-relieving.',
        'A floating ball valve cannot bleed from its body; single-valve DBB needs a trunnion design or two balls in one body.',
        'API 607 fire-tests quarter-turn and soft-seated valves; API 6FA covers API 6A and 6D valves. Both use a 30-minute burn.',
      ],
    },
    {
      type: 'lead',
      html: 'Every ball valve closes with a quarter turn of a bored ball, and from the outside a floating valve and a trunnion valve can look alike. Inside they seal in opposite ways, and that decides which one a data sheet should call for: how large and how high-pressure the valve can be, how much torque the operator must deliver, and what isolation a single valve can prove. This guide covers both designs, the standards each is bought to, the body styles, and the extras — fire testing, actuation, special-purpose and subsea valves — that turn a plain ball valve into a specified one.',
    },

    { type: 'section_head', number: '/01', title: 'How each design seals.', anchor: 'sealing' },
    {
      type: 'comparison_table',
      caption: 'Floating against trunnion-mounted ball valves',
      columns: ['Feature', 'Floating ball', 'Trunnion-mounted ball'],
      rows: [
        { cells: ['Ball', 'Held only by the two seats; free to move a little downstream', 'Fixed on a stem above and a trunnion below'], highlight: true },
        { cells: ['What seals', 'Line pressure pushes the ball onto the downstream seat', 'Upstream pressure (plus springs) presses the seat onto the ball'] },
        { cells: ['Torque', 'Rises with size and pressure, as the whole bore load sits on one seat', 'Lower: the trunnions carry the line thrust, so smaller actuators suffice'] },
        { cells: ['Typical range', 'Made to about 24" Class 300; practical to about 12"', 'Common in gas pipelines to 60"; API 6D runs to Class 2500'] },
        { cells: ['Body bleed / DBB', 'No bleed from the body in a single-ball valve', 'Both seats seal independently; DBB or DIB depending on seat design'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>In a <strong>floating</strong> valve the ball sits between two seats with no fixed bearing. When it is closed, line pressure acts across the whole bore and drives the ball into the downstream seat — that is the seal. As Valve Magazine puts it, beyond a certain ball size and pressure the seat load becomes so high that the operating torque makes the valve impractical, which is why floating valves, although made up to 24" and Class 300, are generally used up to about 12". In small sizes a forged body takes the higher classes: our <a href="/p/forged-floating-ball-valve-side-entry">forged side-entry floating valve</a> runs to Class 2500 up to 6".</p><p>In a <strong>trunnion-mounted</strong> valve the ball cannot float, so the seats float instead. Each seat ring is spring-loaded and energised by upstream pressure onto a ball that turns on fixed stem and trunnion bearings. The line thrust goes into the body, not into a seat, so torque stays low at large sizes and high classes — the standard choice for pipelines and large-bore process lines. Trunnion valves often carry seat sealant injection ports and a body drain.</p><h3>Soft or metal seats</h3><p>Most soft seats are a thermoplastic such as PTFE, limited to roughly 232 °C (450 °F) depending on the grade, and give bubble-tight shut-off. Metal seats — hardfaced ball and seats lapped as a set — take heat, abrasion and solids, and seal tightly as long as the hardened faces are not scored by debris. Both designs come either way: see the <a href="/p/metal-seated-floating-ball-valve">metal-seated floating</a> and <a href="/p/metal-seated-trunnion-mounted-ball-valve">metal-seated trunnion</a> valves.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Which standard: ISO 17292, API 6D or ISO 14313.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<ul><li><strong>ISO 17292:2015</strong> covers metal ball valves for petroleum, petrochemical and natural gas plants: DN 8 to DN 600 (NPS ¼ to 24), Class 150, 300, 600 and 800 (Class 800 only with threaded or socket-weld ends), and PN 16 to PN 100, in full, reduced or double-reduced bore. It is the usual standard for floating process valves.</li><li><strong>API 6D</strong>, 25th edition (2021), is now titled simply <em>Specification for Valves</em> — it began as a pipeline-valve standard and the title change recognises valves used across oil and gas. It covers ball, gate, plug, check and axial valves and is the usual standard for trunnion valves.</li><li><strong>ISO 14313:2025</strong> is a supplement to API 6D 25th edition: API 6D applies, with ISO’s additional requirements, for Class 150 to 2500.</li></ul><p>Read the class against the standard. A valve described as ISO 17292 above Class 800 is outside that standard’s scope; at Class 900 and up the valve is built to API 6D or to ASME B16.34 for the shell. For how classes, PN and CWP compare, see <a href="/blog/ball-valve-pressure-ratings-cwp-wog">ball valve pressure ratings</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'DBB, DIB-1 and DIB-2.', anchor: 'dbb-dib' },
    {
      type: 'comparison_table',
      caption: 'API 6D isolation terms, as applied to ball valves',
      columns: ['Term', 'What it means', 'Cavity relief'],
      rows: [
        { cells: ['DBB', 'One valve, two seats, each sealing against pressure from its own end, with a bleed of the cavity between them', 'Self-relieving seats vent the cavity into the line'], highlight: true },
        { cells: ['DIB-1', 'Two bidirectional seats: each seals against pressure from either direction', 'Cannot relieve past the seats; needs an external relief valve'] },
        { cells: ['DIB-2', 'One bidirectional and one unidirectional (self-relieving) seat', 'Relieves toward the self-relieving side; counts as DIB only with the bidirectional seat downstream'] },
        { cells: ['Two-ball compact DBB', 'Two isolation balls and a bleed in one body', 'Bleed between the balls'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>The API definitions are narrower than they sound. A DBB valve seals against pressure applied from both ends at once; it does not give positive double isolation when only one side is under pressure. DIB seats each hold pressure from a single source, so trapped cavity pressure — for example from liquid warming in a closed valve — has no way out, and the valve needs external cavity relief. Trunnion valves can be built to any of the three; a single floating ball cannot bleed from its body at all. Where a permit asks for isolation by two valves and a bleed between them, a <a href="/p/floating-dbb-compact-manifold-ball-valve">floating</a> or <a href="/p/trunnion-dbb-compact-manifold-ball-valve">trunnion</a> compact DBB valve puts both balls and the bleed in one short body. For instrument-size DBB, see <a href="/blog/needle-globe-and-instrumentation-valves">needle and instrumentation valves</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Body styles and special valves.', anchor: 'bodies' },
    {
      type: 'prose',
      html: '<ul><li><strong>Side-entry (split body):</strong> two or three bolted pieces; the ball and seats go in from the end. The general pipeline and process trunnion valve — <a href="/p/side-entry-trunnion-mounted-ball-valve-api-6d">side-entry trunnion</a>.</li><li><strong>Top-entry:</strong> a one-piece body with a bolted bonnet; remove the bonnet and the ball and seats come out through the top, so the valve can be serviced without cutting it out of the line — <a href="/p/top-entry-trunnion-mounted-ball-valve-api-6d">top-entry trunnion</a>.</li><li><strong>Fully welded:</strong> body halves welded together around the ball, so there is no bolted body joint to leak; stem extensions are offered for buried service — <a href="/p/fully-welded-trunnion-mounted-ball-valve">fully welded trunnion</a>.</li><li><strong>Three-way:</strong> an L-port ball connects the common port to one of the other two, never both, so it diverts; a T-port ball can connect two or all three ports depending on how it is drilled, so it can also mix. Port patterns differ between makers — ask for the flow diagram for each position. See the <a href="/p/three-way-ball-valve-l-t-port">three-way ball valve</a>.</li><li><strong>Pigging ball valve:</strong> the ball carries a pocket that holds a pig. A quarter turn moves the pocket between a loading closure and the line, to launch or receive a pig, and the passage lets flow continue past it — <a href="/p/pigging-ball-valve-launching-receiving">pigging ball valve</a>.</li><li><strong>Jacketed:</strong> a heating jacket fed with steam or thermal oil around the body, for fluids that set when they cool — <a href="/p/jacketed-ball-valve">jacketed ball valve</a>.</li></ul><h3>Fire-safe: API 607 and API 6FA</h3><p>A fire-safe soft-seated valve has a metal secondary seat behind the polymer seat, so that if a fire destroys the soft seat the ball still seals against metal. The claim is proved by type testing. API 607 (7th edition) covers quarter-turn valves and other valves with non-metallic seats; API 6FA covers API 6A and 6D valves. Both specify a 30-minute burn with flame at 760 to 982 °C, and soft-seated valves are cycled after cooldown and leak-tested again. Ask for the fire-test certificate for the size range and class offered, not a “fire-safe design” note.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Actuated valves and subsea valves.', anchor: 'actuation' },
    {
      type: 'prose',
      html: '<p>Lower trunnion torque is the reason large automated ball valves are almost always trunnion-mounted. The actuator is chosen by power available and the position the valve must reach when that power is lost:</p><ul><li><strong>Pneumatic</strong> — scotch-yoke or rack-and-pinion on plant air. A <strong>spring-return</strong> actuator moves the valve to a defined fail-closed or fail-open position on loss of air or signal, which is what an ESD valve relies on; double-acting needs air both ways. See <a href="/p/pneumatic-actuated-valve-esd">pneumatic and ESD valves</a>.</li><li><strong>Electric</strong> — quarter-turn for ball valves, mounted to ISO 5211. Without backup power an electric actuator stays where it is when power fails, so it is not fail-safe by default. See <a href="/p/electric-actuated-valve">electric actuated valves</a>.</li><li><strong>Hydraulic and gas-over-oil</strong> — gas-over-oil uses the pipeline’s own gas pressure on oil to drive the actuator, the oil keeping gas out of the cylinder, so a remote block valve needs no external power. Line-break logic closes the valve when pressure falls too fast. See <a href="/p/hydraulic-electro-hydraulic-gas-over-oil-actuated-valve">hydraulic and gas-over-oil valves</a>.</li></ul><p>For the safety logic around shutdown valves, see <a href="/blog/surface-safety-valves-and-esd-systems">surface safety valves and ESD systems</a>.</p><h3>Subsea</h3><p><strong>API 6DSS</strong> covers ball, check, gate, plug and axial valves for subsea pipelines in Class 150 to 2500 — the standard for <a href="/p/subsea-ball-valve-api-6dss">subsea pipeline ball valves</a> on PLEMs, PLETs and manifolds. <strong>API 17D</strong> covers subsea wellheads and trees, including the tree valves and actuators — the <a href="/p/subsea-gate-valve-api-17d">subsea gate valve</a> is built to it. Seat design (SPE or DPE), ROV interface and any hyperbaric test belong on the data sheet.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a floating and a trunnion ball valve?', answer: 'In a floating valve line pressure pushes the ball onto the downstream seat to seal. In a trunnion valve the ball is fixed on a stem and trunnion and spring-loaded seats are pressed onto it by upstream pressure, which keeps torque low at large sizes and high classes.' },
        { question: 'At what size should I switch to a trunnion ball valve?', answer: 'There is no single cut-off in the standards. Floating valves are made up to about 24" Class 300 but are practical to about 12"; the higher the pressure, the smaller the size at which seat load and torque make a floating design impractical.' },
        { question: 'Is ISO 17292 the same as API 6D?', answer: 'No. ISO 17292 covers metal ball valves to NPS 24 and Class 800 for plant service. API 6D covers ball, gate, plug, check and axial valves to Class 2500; ISO 14313:2025 is a supplement to API 6D.' },
        { question: 'What is the difference between DBB and DIB?', answer: 'Under API 6D a DBB valve has two seats that seal against pressure from both ends, with a cavity bleed, and self-relieving seats. DIB seats each hold pressure from one source: DIB-1 has two bidirectional seats and needs external cavity relief; DIB-2 has one bidirectional and one self-relieving seat.' },
        { question: 'Can a floating ball valve provide double block and bleed?', answer: 'A single floating ball cannot bleed from its body. Double block and bleed with floating balls means a compact valve with two balls and a bleed between them in one body.' },
        { question: 'What does API 607 fire-safe mean?', answer: 'The valve design has passed a fire type test: a 30-minute burn, then leak tests, with soft-seated valves cycled after cooldown. API 607 covers quarter-turn and soft-seated valves; API 6FA covers API 6A and 6D valves.' },
      ],
    },
    {
      type: 'prose',
      html:
        '<h3>What we list</h3><p>Floating and trunnion-mounted ball valves, actuated valves and subsea valves:</p>' +
        stockList(['floating-ball-valves', 'trunnion-mounted-ball-valves', 'actuated-valves', 'subsea-valves']) +
        '<p>For a quote, send the size, class, bore (full or reduced), end connections, body and seat material, temperature, service fluid (including H₂S), the isolation required (DBB, DIB-1 or DIB-2), fire-test requirement, and operator — with the fail position for an actuated valve.</p>',
    },
    {
      type: 'product_embed',
      heading: 'Ball valves',
      skus: ['IH-PV-FBC', 'IH-PV-FBF', 'IH-PV-TBS', 'IH-PV-TBT', 'IH-PV-TBW', 'IH-PV-DBT', 'IH-PV-ACP', 'IH-OFE-SSB'],
    },
    { type: 'category_link', slug: 'trunnion-mounted-ball-valves', label: 'Trunnion mounted ball valves', blurb: 'Side-entry, top-entry, fully welded, DBB and pigging ball valves.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Pipeline, process and offshore isolation valves.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'vm-ball-basics', text: 'Valve Magazine. “Ball Valves Basics.” 9 August 2021.', url: 'https://www.valvemagazine.com/articles/ball-valves-basics' },
        { id: 'slb-dbb-dib', text: 'SLB. “How It Works: Double Block-and-Bleed and Double Isolation-and-Bleed.” Valve Insights.', url: 'https://www.slb.com/resource-library/article/valve-insights/how-it-works-dbb-and-dib' },
        { id: 'slb-bt1', text: 'SLB. Grove BT1 top-entry ball valve product page.', url: 'https://www.slb.com/zh-cn/valves/ball-valves/grove-bt1-top-entry-ball-valve' },
        { id: 'iso-17292', text: 'EN ISO 17292:2015, Metal ball valves for petroleum, petrochemical and allied industries — scope.', url: 'https://genorma.com/en/standards/en-iso-17292-2015' },
        { id: 'iso-14313', text: 'ISO 14313:2025, Oil and gas industries — Pipeline transportation systems — Valves — scope (supplement to API 6D, 25th edition).', url: 'https://genorma.com/en/standards/iso-14313-2025' },
        { id: 'vwa-api-6d', text: 'Valve World Americas. “What is new with API 6D.”', url: 'https://valve-world-americas.com/what-is-new-with-api-6d/' },
        { id: 'vm-fire-testing', text: 'Valve Magazine. “The Past, Present and Future of Fire Testing.” 9 May 2018.', url: 'https://www.valvemagazine.com/articles/the-past-present-and-future-of-fire-testing' },
        { id: 'wp-remote', text: 'World Pipelines. “Flow control in remote locations.” 22 January 2019.', url: 'https://www.worldpipelines.com/special-reports/22012019/special-report-flow-control-in-remote-locations/' },
        { id: 'us-4016621', text: 'US Patent 4,016,621. Device and method for launching and/or retrieving pipeline scrapers. 1977.', url: 'https://patents.google.com/patent/US4016621' },
        { id: 'aa-3way', text: 'Assured Automation. “Actuated 3-Way Ball Valve Selection: L-Port vs. T-Port.”', url: 'https://blog.assuredautomation.com/actuated-3-way-ball-valve-selection-l-port-vs-t-port/' },
        { id: 'wiki-actuator', text: 'Wikipedia. “Valve actuator.”', url: 'https://en.wikipedia.org/wiki/Valve_actuator' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['ball-valve-pressure-ratings-cwp-wog', 'surface-safety-valves-and-esd-systems', 'needle-globe-and-instrumentation-valves', 'lubricated-vs-non-lubricated-plug-valves', 'butterfly-valves-wafer-lug-and-grooved', 'cryogenic-valves-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Sealing and size ranges from Valve Magazine; DBB/DIB from SLB; standard scopes from ISO 17292:2015, ISO 14313:2025 and API 6D 25th edition; fire testing from Valve Magazine.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying ball valves?',
      body: 'Send the data sheet or valve list — size, class, bore, ends, materials, service, isolation and fire-test requirements, and operator. We will confirm the design and standard for each line and quote.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
