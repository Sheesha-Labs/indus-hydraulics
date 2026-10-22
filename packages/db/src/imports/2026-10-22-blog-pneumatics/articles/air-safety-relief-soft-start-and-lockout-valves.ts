import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Air safety, relief, soft-start, dump and lockout valves. Safety vs relief usage: Aquatrol technical-resources
 * index (Series 88/89 "ASME Section VIII Air/Gas Safety Valves"; Series 69/55 "Non-Code Liquid Relief Valves";
 * Series 560/570 "ASME Section I & VIII Boiler & Vessel Safety Valves"); "Kingston is now part of Aquatrol"
 * (aquatrol.com). Series 740 page: 740/741/742/743 for liquid, steam and air/gas, ASME and National Board certified,
 * UV stamp for Section VIII Div. 1 service, minimum set 15 psig ASME and 1 psig non-code, trim and body materials
 * per model. Aquatrol "Installation and maintenance instructions — ASME safety and relief valves" (IMI-001 Rev 1):
 * install vertically with outlet horizontal; no tape or compound inside the valve; minimum piping, not smaller than
 * the valve; ASME UG-135 text (no intervening stop valves, inlet area, discharge to a safe place, drained discharge
 * lines); factory set tolerance ±2 psi to 70 psi and ±3% above; setting wired and lead-sealed; adjustment only by
 * the manufacturer or an ASME-authorised VR facility to keep code status; lift lever only at 80% of set pressure or
 * more. Kingston KSV25 as published: ASME code certified, API 527 seat tightness, bodies stamped UV and NB.
 * Soft start / dump: Parker P3Y series page (P3YS 2/2, P3YT 3/2; needle valve sets fill rate; main spool opens at
 * about 60% of supply — Parker gives about 50% for the P3XT Lite; dump vents downstream through the exhaust port on
 * loss of pilot signal or supply; not intended as emergency shut-off valves, fit after a manual shut-off). SMC AV/AVL
 * series page: soft start-up valve to raise initial pressure gradually; quick exhaust when supply is cut off; AVL
 * adds lockout for safe servicing; manually operated, yellow body and black button identify it as a pneumatic
 * disconnect. OSHA 29 CFR 1910.147 (osha.gov): definitions of energy source, energy isolating device and lockout
 * device; (c)(5)(ii)(C)(1); (d)(5)(i); (d)(5)(ii); (d)(6); (e)(3).
 * Safety vs relief behaviour (full pop opening for compressible fluids, progressive opening for liquids) is standard
 * ASME terminology; set pressure no higher than MAWP is the ASME VIII requirement for a single relieving device.
 * Left out as unsourced: any claim that a listing on our shelf is ASME stamped (no title says so), receiver sizing
 * or capacity figures, a lift-lever test interval, and any set-pressure margin over working pressure.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'air-safety-relief-soft-start-and-lockout-valves',
  title: 'Air safety valves, soft-start, dump and lockout valves: protecting the receiver and the person servicing the machine',
  excerpt:
    'Two kinds of safety in a compressed air system: a pop safety valve that stops a receiver or line exceeding its pressure, and the soft-start, dump and lockout valves that let a machine be pressurised gently and emptied completely before anyone works on it. Safety vs relief valves, what an ASME UV stamp means, installation rules from the code, and what OSHA 1910.147 asks of residual air.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Air Safety, Soft-Start & Lockout Valves Explained',
  seoDescription:
    'Air receiver safety vs relief valves, ASME UV stamps, soft-start and dump valves, and lockable exhausting valves for OSHA 1910.147 lockout of residual air.',
  focusKeyword: 'pneumatic lockout valve',
  publishedAt: '2026-10-22T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A safety (pop) valve opens fully and fast to protect a receiver or line from overpressure; it is the device for air and gas. Relief valves, which open progressively, are the usual choice for liquids.',
        'An ASME UV stamp on the valve body is the evidence that it is certified for Section VIII pressure vessels. Check the stamp on the valve itself — a series name is not enough, and code status is lost if the valve is reset outside an authorised facility.',
        'A soft-start valve fills a machine slowly through a needle valve, then opens fully — Parker gives about 60% of supply on its P3Y — so cylinders do not lunge on start-up.',
        'A dump or lockout valve must exhaust the downstream air, not just shut it in. OSHA 1910.147(d)(5)(i) requires stored or residual energy to be relieved, disconnected, restrained and otherwise rendered safe.',
        'Soft-start and dump valves are not emergency stops: Parker says to fit them after a manual shut-off valve.',
      ],
    },
    {
      type: 'lead',
      html: 'Compressed air is stored energy. It is stored deliberately in a receiver, and accidentally in every cylinder, hose and pilot line that is still full when a machine stops. The valves in this guide deal with both: the safety valve that keeps a vessel from bursting, and the soft-start, dump and lockout valves that let a machine be brought up to pressure gently and taken back to zero completely before hands go into it.',
    },

    { type: 'section_head', number: '/01', title: 'Safety valves and relief valves.', anchor: 'safety-vs-relief' },
    {
      type: 'prose',
      html: '<p>The two terms are used loosely in catalogues, but they describe different behaviour:</p><ul><li>A <strong>safety valve</strong> — often called a <strong>pop</strong> or pop-off valve — stays shut until the set pressure is reached and then snaps fully open, discharging a large flow at once. It is designed for compressible fluids: air, gas and steam, where a vessel can only be protected by getting a large volume out quickly.</li><li>A <strong>relief valve</strong> opens progressively as pressure rises above the set point and recloses as it falls. It is the usual choice for liquids, where a small discharge relieves a lot of pressure.</li></ul><p>Makers’ own ranges follow that split. Aquatrol, which now includes Kingston, catalogues its Series 88 and 89 as “ASME Section VIII Air/Gas Safety Valves” and its Series 69 and 55 as non-code liquid relief valves. On an air receiver, compressor or air line, you want a safety valve. The relief valves on our shelf — Conrader’s CPR series, Gast’s relief valves — are for the duties their makers specify; check that duty, and the valve’s action, before using one on a receiver.</p><h3>Soft seat or hard seat</h3><p>Several ranges come in both. Conrader lists air safety valves with soft seats and with hard seats; Kingston lists hard-seat 118CSS and 119CSS pop safeties; Dixon lists soft-seat and standard safety pop-off valves. The seat is a material choice with its own limits: Aquatrol’s 740 family, for example, is offered with metal seats or with FKM, nitrile, EPDM, FFKM, PTFE, PCTFE or silicone seats. Pick the seat from the maker’s temperature and media limits for that part number — on a hot compressor discharge, temperature usually decides it.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Which valve does which job',
      columns: ['Valve', 'What it does', 'Where it goes', 'What it is not'],
      rows: [
        { cells: ['Safety (pop) valve', 'Opens fully at set pressure to stop overpressure', 'Receiver, compressor, air line, any vessel', 'A pressure regulator or a lockout'], highlight: true },
        { cells: ['Relief valve', 'Opens progressively above set pressure', 'Liquid lines and duties the maker specifies', 'A receiver safety valve on air'] },
        { cells: ['Soft-start valve', 'Fills the machine slowly, then opens fully', 'Machine inlet, after the FRL and a shut-off', 'An emergency stop'] },
        { cells: ['Dump (exhaust) valve', 'Vents downstream air when its signal or supply is lost', 'Machine inlet, often combined with soft start', 'An emergency stop'] },
        { cells: ['Lockout valve (3-way, exhausting)', 'Shuts off supply, exhausts downstream, accepts a padlock', 'Machine inlet, ahead of everything it isolates', 'A guarantee that cylinders are empty'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'ASME code-stamped valves on receivers.', anchor: 'asme' },
    {
      type: 'prose',
      html: '<p>Air receivers built to the ASME Boiler and Pressure Vessel Code, Section VIII, are protected by pressure-relief devices certified under that code. The visible evidence is on the valve itself: Kingston, for example, describes its KSV25 as ASME code certified with bodies stamped with both the <strong>UV</strong> and <strong>NB</strong> (National Board) symbols, and Aquatrol describes its 740 family as ASME and National Board certified with a UV stamp for Section VIII Division 1 service.</p><p>Two cautions. First, a series name does not prove the stamp: Aquatrol’s 740 family is published with a minimum set pressure of 15 psig for ASME valves and 1 psig for non-code valves, so the same family includes both. Kingston’s 100 series is sold as non-code. Read the stamp and nameplate on the valve you receive, and where a receiver must have a code valve, ask for one by part number. None of our listing titles states an ASME stamp, so we confirm code status per part number when we quote.</p><p>Second, the stamp only means something while the valve is as it left the factory. Aquatrol’s installation instructions state that its ASME valves are factory set — to ±2 psi up to 70 psi and ±3% above 70 psi of the stamped set pressure — with the setting wired and lead-sealed, and that to keep ASME code status adjustments must be made only by the manufacturer or an ASME-authorised “VR” repair facility. A safety valve that has been turned up on site is no longer a code valve.</p><h3>Installation, from the code</h3><p>Aquatrol reproduces the installation paragraph of Section VIII (UG-135) in its instructions. The points that matter on an air receiver:</p><ul><li><strong>No stop valve</strong> between the vessel and its safety valve, or between the safety valve and its point of discharge, except under the narrow conditions the code sets out.</li><li>The opening through all pipe and fittings between the vessel and the valve must be at least the area of the valve inlet, and the pressure drop must not reduce the relieving capacity. Aquatrol adds: keep that piping as short as possible and never smaller than the valve.</li><li>Discharge lines must lead to a safe place, be sized so back-pressure does not cut capacity, and be drained so liquid cannot lodge in them.</li><li>Aquatrol’s own instructions: install the valve vertically with the outlet horizontal, tighten on the inlet hex rather than the body, and keep thread tape and compound out of the valve.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never plug, cap or adjust a receiver safety valve.',
      body: 'A safety valve that discharges is doing its job: find out why pressure reached the set point. Do not fit a stop valve under it, plug its outlet or screw down its setting. If the valve has a lifting lever, Aquatrol’s instructions allow it to be lifted only when the system is at 80% of set pressure or more, held open long enough to clean the seat. A valve that leaks, sticks or has been reset is replaced, not adjusted.',
    },

    { type: 'section_head', number: '/03', title: 'Soft-start (slow-start) valves.', anchor: 'soft-start' },
    {
      type: 'prose',
      html: '<p>When a machine is first pressurised, every cylinder that was left part-way through its stroke, or with one side exhausted, moves at once — and with no back-pressure on the exhaust side, its flow controls cannot hold it back. The result is a cylinder that lunges to the end of its stroke on start-up. A soft-start valve prevents it.</p><p>Parker describes how its P3Y series works: when the valve receives its pilot signal, air starts to flow from inlet to outlet at a slow rate set by a needle valve on top of the unit; when the downstream pressure reaches about <strong>60% of the supply</strong>, the main spool opens and gives full flow. (For its P3XT Lite series Parker gives about 50%.) SMC describes its AV series the same way: a soft start-up valve that supplies air at low speed to raise the initial pressure gradually.</p><p>Fit the soft-start valve at the machine inlet, after the FRL. Set the needle valve so the machine fills slowly enough that nothing moves sharply, but not so slowly that the switch-over takes an age. Parker sells its soft-start valves as 2/2 (P3YS) and 3/2 (P3YT) versions, separately or combined with a dump function; we list Parker Global modular soft-start valves, P32S and P3YS soft-start valves, SMC slow-start valves, and combined units below.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Dump valves and lockout valves.', anchor: 'dump-lockout' },
    {
      type: 'prose',
      html: '<p>A <strong>dump valve</strong> (or exhaust valve) is the opposite half of the same job: when its signal or the supply is lost, it shuts off the inlet and vents the machine’s air to atmosphere. Parker’s P3Y dump valve returns to its initial state on loss of the pilot signal or system pressure, venting the downstream pressure through its exhaust port. SMC’s AV series gives quick exhaust when the supply is cut off. Combined soft-start/dump valves — Parker’s P3YT and Global modular units, Nitra’s ASD series — do both in one body, and can be wired into the machine’s control circuit so that the air is dumped whenever the machine is stopped.</p><p>A <strong>lockout valve</strong> is a manual version built for isolation: a 3-way valve that, when switched off, closes the supply <em>and</em> opens the downstream side to exhaust, and that can be held in the off position with a padlock. SMC adds lockout to its AV design in the AVL series, a manually operated valve with no power requirement, whose yellow body and black button identify it as a pneumatic disconnect. We also list ARO lockout valves, Legris lockout valves, Parker FC601 push-to-connect and FC608 threaded lock-out valves, and Parker’s EZ and LV series push/pull 3-way, 2-position inline valves.</p><p>The 3-way function is the point. A 2-way ball valve shut in the supply line isolates the compressor but leaves the machine full of air. An exhausting lockout valve isolates the supply and empties the line downstream of it.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Soft-start and dump valves are not emergency stops.',
      body: 'Parker states that its soft-start valves are not intended to be used as emergency shut-off valves and should be placed after a manual shut-off valve. A dump valve exhausts the supply line; it does not stop a cylinder that is mid-stroke, and it cannot empty air trapped behind a closed valve. Design emergency stopping as part of the machine’s safety system, not around a single valve.',
    },

    { type: 'section_head', number: '/05', title: 'Lockout and residual air: what OSHA 1910.147 asks.', anchor: 'osha' },
    {
      type: 'prose',
      html: '<p>The US OSHA standard on the control of hazardous energy, 29 CFR 1910.147, is the lockout/tagout rule most often cited, and pneumatic energy is squarely inside it. Its wording, from the regulation text:</p><ul><li><strong>Energy source</strong>: “any source of electrical, mechanical, hydraulic, pneumatic, chemical, thermal, or other energy.”</li><li><strong>Energy isolating device</strong>: “a mechanical device that physically prevents the transmission or release of energy” — the list in the definition includes a line valve.</li><li><strong>Lockout devices</strong> “shall be substantial enough to prevent removal without the use of excessive force or unusual techniques” — (c)(5)(ii)(C)(1).</li><li><strong>Stored energy</strong>: after the lockout devices are applied, “all potentially hazardous stored or residual energy shall be relieved, disconnected, restrained, and otherwise rendered safe” — (d)(5)(i). If it could build up again, “verification of isolation shall be continued until the servicing or maintenance is completed” — (d)(5)(ii).</li><li><strong>Verification</strong>: before work starts, “the authorized employee shall verify that isolation and deenergization” of the machine have been accomplished — (d)(6).</li><li><strong>Removal</strong>: each device “shall be removed from each energy isolating device by the employee who applied the device” — (e)(3).</li></ul><p>For a pneumatic machine, that translates into a sequence: shut the lockable valve and lock it; make sure it has exhausted the line; then deal with the air it cannot reach. A lockout valve at the inlet empties the supply side, but air can remain trapped in cylinders held by closed-centre valves or pilot-operated check valves, in accumulators and receivers on the machine, and in hoses between closed valves. Those pockets have to be bled through their own exhaust or bleed points, or the loads they hold restrained, before the machine counts as de-energised. Check zero on a gauge — do not assume it.</p><p>Outside the US, use your own jurisdiction’s lockout rules and the machine maker’s procedure; the principle of isolating, locking, releasing stored energy and verifying is the same.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which valve do you need?',
      branches: [
        { condition: 'Protecting a receiver, compressor or air line from overpressure?', outcome: 'A safety (pop) valve set no higher than the vessel’s maximum allowable working pressure — ASME UV stamped if the vessel requires a code valve.' },
        { condition: 'Cylinders lunge when the machine is switched on?', outcome: 'A soft-start valve after the FRL, with the needle valve set to fill slowly.' },
        { condition: 'Machine air must vent whenever the machine stops?', outcome: 'A dump valve or combined soft-start/dump valve, wired into the machine’s stop circuit.' },
        { condition: 'Maintenance staff need to isolate the machine?', outcome: 'A lockable 3-way exhausting lockout valve at the inlet — then bleed trapped air downstream and verify zero.' },
        { condition: 'Relieving a liquid line?', outcome: 'A relief valve rated by its maker for that liquid and duty, not an air receiver safety valve.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between a safety valve and a relief valve?', answer: 'A safety (pop) valve opens fully and quickly at its set pressure and is used on air, gas and steam. A relief valve opens progressively as pressure rises and is usually used on liquids. Makers such as Aquatrol catalogue air/gas safety valves separately from liquid relief valves.' },
        { question: 'Does an air receiver need an ASME safety valve?', answer: 'A receiver built to ASME Section VIII is protected by a pressure-relief device certified under that code, marked with the UV stamp on the valve body. Check the receiver’s nameplate and your local pressure-vessel rules, and check the stamp on the valve itself.' },
        { question: 'Can I adjust the set pressure of a safety valve?', answer: 'Not on a code valve. Aquatrol’s instructions say ASME valves are factory set, wired and lead-sealed, and that adjustments must be made by the manufacturer or an ASME-authorised VR facility to keep code status. Replace a valve that is set wrongly.' },
        { question: 'What does a soft-start valve do?', answer: 'It fills a machine with air slowly through an adjustable needle valve, then opens to full flow once downstream pressure reaches a set fraction of supply — about 60% on Parker’s P3Y series — so cylinders do not lunge on start-up.' },
        { question: 'What is a pneumatic lockout valve?', answer: 'A manually operated 3-way valve at the machine inlet that shuts off the supply, exhausts the air downstream and can be padlocked in the off position, so the machine can be isolated for maintenance.' },
        { question: 'Does OSHA lockout apply to compressed air?', answer: 'Yes. 29 CFR 1910.147 defines an energy source as including pneumatic energy, and (d)(5)(i) requires stored or residual energy to be relieved, disconnected, restrained and otherwise rendered safe once lockout devices are applied.' },
        { question: 'Is a dump valve an emergency stop?', answer: 'No. Parker states its soft-start valves are not intended as emergency shut-off valves and should follow a manual shut-off. A dump valve exhausts the supply but does not stop a moving cylinder or empty air trapped behind closed valves.' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'what-we-list' },
    {
      type: 'prose',
      html: '<p>Every listing on our safety, soft-start and lockout valve shelf — Aquatrol, Conrader, Kingston and Dixon safety valves, Parker, SMC, Nitra, ARO and Legris soft-start, dump and lockout valves, and the other SMC valves currently filed there — by maker part number. Code status is confirmed per part number at quotation:</p>' +
        stockList(['pneumatic-safety-lockout-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Safety, soft-start and lockout valves',
      skus: [
        'IH-CNR-SRV-530-SAFETY-VALVE-SOFT-SEAT',
        'IH-KNG-112CR-SERIES-POP-SAFETY-VALVE',
        'IH-AQT-741-SERIES-SAFETY-VALVES',
        'IH-DIX-STANDARD-SAFETY-POP-OFF-VALVES',
        'IH-PAR-GLOBAL-SOFT-START-DUMP-VALVES-P3YT-SERIES',
        'IH-SMC-AVL-SERIES-SOFT-START-LOCK-OUT-VALVE',
        'IH-PAR-FC608-THREADED-PORT-LOCK-OUT-VALVES',
        'IH-LEG-LOCKOUT-VALVES',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-safety-lockout-valves', label: 'Safety, soft-start & lockout valves', blurb: 'Pop safety valves, relief valves, soft-start, dump and lockable exhausting valves.' },
    { type: 'category_link', slug: 'air-preparation-frl', label: 'Filters, regulators & lubricators', blurb: 'The FRL units that soft-start, dump and lockout valves mount beside.' },
    { type: 'category_link', slug: 'pneumatics', label: 'All pneumatics', blurb: 'Cylinders, valves, tubing, fittings, grippers, vacuum and air motors.' },
    {
      type: 'related_articles',
      slugs: [
        'frl-filter-regulator-lubricator-guide',
        'compressed-air-quality-iso-8573-1',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'manual-and-pilot-operated-air-valves',
        'solenoid-valve-functions-3-2-5-2-5-3',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Safety-valve installation and code-status points from Aquatrol’s ASME instructions and series pages; soft-start and dump behaviour from Parker and SMC; lockout text quoted from 29 CFR 1910.147.',
    },
    {
      type: 'cta_block',
      heading: 'Need a safety valve or lockout valve?',
      body: 'For a safety valve, send the set pressure, connection size, required flow and whether it must be ASME stamped. For soft-start, dump or lockout valves, send the port size, flow and supply pressure. We will quote by maker part number.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
