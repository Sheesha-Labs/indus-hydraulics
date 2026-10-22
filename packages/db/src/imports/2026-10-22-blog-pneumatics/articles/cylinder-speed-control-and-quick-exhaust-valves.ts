import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Cylinder speed control, quick exhaust and pilot-operated checks. Meter-in/meter-out definitions, "ordinary meter-out
 * control", sudden rod extension when only one side is pressurised, extension prevention only after the cylinder is
 * exhausted, mount close to the actuator (SMC ASS/SSC valve catalogue, Best Pneumatics vol. 6, and smcusa.com ASS
 * page: setting pressure 0.1–0.5 MPa). Flow controls let a larger valve be slowed (Michael Foy, Festo, Machine Design
 * 2003). Quick exhaust: placed between control valve and actuator, exhaust capacity greater than many four-way
 * valves (Parker P4Q series page; its port, Cv and pressure figures were read only from a search snippet and are not used). Pilot-operated check: ASP "permits
 * temporary intermediate stops"; ASP-S adds stop/hold to a meter-out speed control; residual-pressure release option
 * (smcusa.com ASP pages). Closed-centre/leakage/compressibility limits (SMC common solenoid valve precautions).
 * Exhaust-centre pairing with pilot checks: from the circuit logic (checks need their pilot vented to close).
 * Moved-off hydraulic and liquid ranges are not named. Left out as unsourced: "up to 5× faster" quick-exhaust claim (reseller only), simulation-study oscillation data,
 * any check-valve cracking pressures, and holding times.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cylinder-speed-control-and-quick-exhaust-valves',
  title: 'Cylinder speed control: meter-out flow controls, quick exhaust valves and pilot-operated checks',
  excerpt:
    'Why pneumatic cylinders are normally speed-controlled meter-out, when meter-in is right, how flow controls with a bypass check work in banjo, in-line and exhaust-port forms, how a quick-exhaust valve speeds a cylinder up, and what a pilot-operated check valve can and cannot do to hold a cylinder in position on compressible air.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pneumatic Cylinder Speed Control: Meter-Out & Quick Exhaust',
  seoDescription:
    'Meter-out vs meter-in speed control for air cylinders, flow controls with bypass check, banjo and in-line types, quick exhaust valves and pilot-operated checks.',
  focusKeyword: 'pneumatic cylinder speed control',
  publishedAt: '2026-10-22T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Meter-out — throttling the air leaving the cylinder — is the normal way to set a double-acting cylinder’s speed. SMC calls it “ordinary meter-out control”.',
        'Meter-in throttles the air going in. Use it for single-acting cylinders and where a meter-out cylinder lurches on start-up.',
        'A speed controller is a needle valve with a bypass check: it throttles one direction and flows freely the other. Fit one per cylinder port, as close to the cylinder as practical.',
        'A quick-exhaust valve at the cylinder port dumps exhaust air straight to atmosphere instead of back through the tube and valve. Parker notes its exhaust capacity is greater than many four-way valves.',
        'Pilot-operated check valves trap air to stop a cylinder, but SMC rates its own as permitting temporary intermediate stops only: valves leak and air is compressible.',
      ],
    },
    {
      type: 'lead',
      html: 'Almost every pneumatic cylinder is fitted with a valve that could move it faster than the machine wants, so speed is set by throttling the air. Where you throttle it — the air going in or the air coming out — decides whether the cylinder runs smoothly, lurches on start-up, or creeps and stalls. This guide covers meter-out and meter-in control, the speed controllers that do it, quick-exhaust valves for the opposite problem, and pilot-operated check valves for stopping a cylinder.',
    },

    { type: 'section_head', number: '/01', title: 'Meter-out and meter-in.', anchor: 'meter-out-meter-in' },
    {
      type: 'prose',
      html: '<p><strong>Meter-in</strong> throttles the air flowing <em>into</em> the cylinder; the exhaust side is free. <strong>Meter-out</strong> throttles the air flowing <em>out</em>; the supply side is free.</p><p>Meter-out is the norm for double-acting cylinders. With the exhaust restricted, the piston is held between full supply pressure on one side and a cushion of back-pressure on the other. That cushion resists a load that tries to run ahead of the piston — a load pulling the rod, a downward stroke under gravity — and keeps the speed steadier as friction and load change. With meter-in, the exhaust side is wide open: the drive side has to build pressure until it overcomes seal friction, the piston jumps, the pressure drops, and the cylinder can move in a series of jerks at low speed. SMC’s own catalogue language reflects this: it refers to “ordinary meter-out control” for cylinder speed, and its ASP-S pilot-check speed controller is described as adding stop and hold to “a meter out speed control”.</p><h3>Where meter-in is right</h3><ul><li><strong>Single-acting cylinders.</strong> There is only one port, and the spring-return stroke exhausts through it. Meter-in controls the powered stroke; a separate meter-out setting on the same port controls the return.</li><li><strong>Start-up lurch.</strong> Meter-out relies on back-pressure in the exhaust side. If the cylinder has been fully exhausted — after a stop, an air dump or lockout — there is no back-pressure on the first stroke, and the rod can shoot out. SMC warns that if pressure is applied to only one side of a cylinder the rod can get out of control and injure people or damage tooling. Its SSC valve (series ASS) solves this by running meter-in while the cylinder is empty, then switching to ordinary meter-out once it is pressurised. SMC’s own cautions on that valve: it works only when the cylinder has been exhausted, it should be mounted as close to the actuator as possible, and it is not for short-stroke cylinders of 100 mm or less or for rotary actuators.</li></ul>',
    },
    {
      type: 'comparison_table',
      caption: 'Meter-out vs meter-in',
      columns: ['Aspect', 'Meter-out', 'Meter-in'],
      rows: [
        { cells: ['What is throttled', 'Air leaving the cylinder', 'Air entering the cylinder'], highlight: false },
        { cells: ['Normal use', 'Double-acting cylinders — the default', 'Single-acting cylinders; small-volume actuators'], highlight: true },
        { cells: ['Behaviour with a running-ahead load', 'Back-pressure resists it', 'Little resistance; rod can run ahead'] },
        { cells: ['Behaviour at low speed', 'Steadier', 'Prone to jerky, stick-slip motion'] },
        { cells: ['First stroke after the cylinder is exhausted', 'Can lurch — no back-pressure yet', 'Controlled'] },
        { cells: ['Fitting position', 'Check valve lets supply in freely; needle throttles exhaust', 'Check valve lets exhaust out freely; needle throttles supply'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Speed controllers: needle plus bypass check.', anchor: 'flow-controls' },
    {
      type: 'prose',
      html: '<p>A cylinder speed controller is an adjustable needle valve with a check valve in parallel. In one direction the check valve is shut and all the air has to pass the needle; in the other the check lifts and air flows freely. Turn it one way round and it meters out; turn it the other way round and it meters in. Most bodies are marked with an arrow or a symbol showing the controlled direction — check it on installation, because a reversed speed controller gives meter-in when you wanted meter-out.</p><p>A plain <strong>needle valve</strong> has no check and throttles both directions equally. It suits bleed and fine-adjustment duties more than cylinder speed control. We list needle valves from Parker and ARO alongside the speed controllers.</p><h3>Body styles</h3><ul><li><strong>Banjo or elbow (port-mounted) speed controllers</strong> screw straight into the cylinder port, with a swivelling outlet for the tube. Fitting them at the cylinder means the controlled volume is just the cylinder chamber, which gives the most consistent speed. SMC, Legris and Numatics (as “flow control swivels”) all make this type.</li><li><strong>In-line speed controllers</strong> sit in the tube run, often on a panel near the valve. Easier to reach for adjustment, but the tube between controller and cylinder is part of the controlled volume.</li><li><strong>Exhaust-port flow controls</strong> fit into the exhaust ports of a five-port valve. Because port 2 exhausts through 3 and port 4 through 5, throttling 3 and 5 separately gives meter-out control of each stroke from the valve body — a neat solution on a manifold, at the cost of the whole tube length sitting in the controlled volume. SMC lists these as exhaust port flow controls.</li></ul><p>Set speed with the needle closed most of the way and open it in small steps with the machine cycling, adjusting extend and retract independently. If the needle is nearly closed to get the speed you want, the valve is probably oversized for the job; see <a href="/blog/sizing-pneumatic-valves-flow-cv">sizing pneumatic valves</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Quick-exhaust valves.', anchor: 'quick-exhaust' },
    {
      type: 'prose',
      html: '<p>The opposite problem — a cylinder that will not go fast enough — is often an exhaust problem. On the return path the air has to travel back down the tube, through the valve and out through a silencer, and every one of those restricts it. A <strong>quick-exhaust valve</strong> fitted at the cylinder port gives the exhaust a short cut: supply air from the control valve flows through it into the cylinder; when the control valve switches and the supply line falls, an internal diaphragm or poppet shifts and opens the cylinder port straight to a large exhaust port on the quick-exhaust valve itself.</p><p>Parker describes its P4Q quick exhaust valves as placed between the control valve and the actuator to give rapid exhaust of control air, and notes their exhaust capacity is greater than that of many four-way directional valves. The practical consequence is that a smaller control valve can still give a fast stroke. We list Parker 0R series, Legris and ARO quick exhausts.</p><ul><li><strong>Mount it at the cylinder port</strong> — the closer it is, the less air has to travel before it is dumped.</li><li><strong>It removes meter-out control on that stroke.</strong> The exhaust no longer passes through the valve’s silencer or an exhaust-port flow control, so a quick exhaust and meter-out on the same port work against each other.</li><li><strong>It is loud.</strong> Fit a silencer to its exhaust port where the maker allows one.</li><li><strong>Fast is not always better.</strong> A faster stroke hits the end cap harder; check the cylinder’s cushioning — see <a href="/blog/pneumatic-cylinder-cushioning-and-mounting">cylinder cushioning and mounting</a>.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Pilot-operated checks for holding position.', anchor: 'pilot-check' },
    {
      type: 'prose',
      html: '<p>A <strong>pilot-operated check valve</strong> lets air into the cylinder freely but blocks it from coming out unless a pilot signal holds the check open. Fit one in each cylinder line, take each pilot from the opposite line, and the cylinder can only move when the valve is actively driving it. Cut the drive — by switching a 5/3 valve to its exhaust centre, or by losing the signal — and both checks close and trap the air on both sides of the piston. SMC’s ASP series combines a speed controller and pilot check in one port-mounted body, and SMC describes it as permitting <strong>temporary intermediate stops</strong>; its ASP-S variant offers a residual-pressure release so the trapped air can be let out by hand. We list Legris piloted non-return valves and Parker blocking valves on our control valves shelf.</p><h3>What it cannot do</h3><ul><li><strong>Hold a precise position.</strong> Trapped air is a spring. If the load changes after the stop, the piston moves until the trapped pressures balance the new load. SMC warns that a cylinder stopped mid-stroke on air cannot be stopped accurately because air is compressible.</li><li><strong>Hold for ever.</strong> Piston seals, rod seals and the check seats all leak a little. SMC’s general valve precautions state valves cannot be used to hold pressure for this reason. The stop drifts with time — slowly on a new, clean cylinder, faster on a worn one.</li><li><strong>Act as a safety device.</strong> A pilot check that holds a vertical load is not a substitute for a mechanical rod lock, a brake or a load support under that load during maintenance. Release the trapped air only under the machine’s lockout procedure.</li></ul><p>Pair pilot checks with an <strong>exhaust-centre</strong> 5/3 valve, so the pilot lines are vented and the checks close firmly. A closed-centre valve can trap pilot pressure and leave the checks part-open. See <a href="/blog/solenoid-valve-functions-3-2-5-2-5-3">solenoid valve functions</a> for the centre conditions.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Trapped air is stored energy.',
      body: 'A cylinder held by pilot-operated checks — or by a closed-centre valve — still contains compressed air after the supply is isolated. Disconnecting a tube or a fitting can release the load or whip the tube. Exhaust both sides of the cylinder and support any raised load before working on the circuit, following the lockout procedure for the machine.',
    },
    {
      type: 'decision_tree',
      heading: 'Which speed or holding device?',
      branches: [
        { condition: 'Double-acting cylinder, need to slow it?', outcome: 'Meter-out speed controller on each port, at the cylinder.' },
        { condition: 'Single-acting cylinder?', outcome: 'Meter-in on the powered stroke; a second controller reversed if the return needs slowing.' },
        { condition: 'Rod lurches on the first stroke after an air dump?', outcome: 'Meter-in, or a start-up extension-prevention valve such as SMC’s SSC (ASS series), plus soft-start air.' },
        { condition: 'Many valves on a manifold, controllers hard to reach at the cylinders?', outcome: 'Exhaust-port flow controls in ports 3 and 5.' },
        { condition: 'Cylinder too slow on its return or exhaust stroke?', outcome: 'Quick-exhaust valve at the cylinder port.' },
        { condition: 'Need a temporary mid-stroke stop?', outcome: 'Pilot-operated checks with an exhaust-centre 5/3 valve — accepting drift.' },
        { condition: 'Position must be held securely or for maintenance?', outcome: 'Mechanical rod lock or brake and lockout — not valves.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between meter-in and meter-out?', answer: 'Meter-in throttles the air entering a cylinder; meter-out throttles the air leaving it. Meter-out is the normal choice for double-acting cylinders because the exhaust back-pressure resists running-ahead loads and steadies the speed.' },
        { question: 'Why does my pneumatic cylinder jerk at low speed?', answer: 'Often because it is metered-in, or because the needle is nearly closed: pressure builds to overcome seal friction, the piston jumps, and the cycle repeats. Switch to meter-out control at the cylinder ports and check the valve is not oversized.' },
        { question: 'Why does my cylinder shoot out on the first stroke?', answer: 'With meter-out control, an exhausted cylinder has no back-pressure on the first stroke, so the rod can lurch. Meter-in, or a start-up valve such as SMC’s SSC that meters in until the cylinder is pressurised, prevents it.' },
        { question: 'Where should a quick exhaust valve be mounted?', answer: 'At, or as close as possible to, the cylinder port, between the cylinder and the control valve, so exhaust air is dumped before it travels back through the tube and valve.' },
        { question: 'Can a pilot-operated check valve hold a pneumatic cylinder in position?', answer: 'Temporarily. SMC describes its pilot-check speed controllers as permitting temporary intermediate stops. Air is compressible and seals leak, so the position shifts with load and drifts with time. Use a rod lock or brake where position must be held.' },
        { question: 'Which way round does a flow control valve go?', answer: 'For meter-out, the free-flow check must let air into the cylinder and the needle must throttle air coming out. Follow the arrow or symbol on the body; reversing it gives meter-in.' },
      ],
    },

    { type: 'section_head', number: '/05', title: 'What we list.', anchor: 'what-we-list' },
    {
      type: 'prose',
      html: '<p>Every listing on our flow control and check valves shelf — speed controllers, needle valves, quick exhausts, and check valves from SMC, Parker, Legris, Numatics, ARO, Conrader, Kingston and others — sold by maker part number. The Conrader and Kingston in-tank and pilot unloader check valves on this shelf belong on compressors and air receivers rather than in cylinder circuits; ask us if you are unsure which check valve suits your circuit.</p>' + stockList(['pneumatic-flow-check-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Speed controllers and quick exhausts',
      skus: [
        'IH-SMC-AIR-CYLINDER-SPEED-CONTROLS',
        'IH-LEG-AIR-CYLINDER-SPEED-CONTROLS',
        'IH-NUM-FLOW-CONTROL-SWIVELS',
        'IH-ARO-IN-LINE-FLOW-CONTROLS',
        'IH-SMC-EXHAUST-PORT-FLOW-CONTROLS',
        'IH-PAR-0R-SERIES-QUICK-EXHAUST-VALVES',
        'IH-LEG-QUICK-EXHAUST-VALVES',
        'IH-ARO-QUICK-EXHAUSTS',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-flow-check-valves', label: 'Flow control and check valves', blurb: 'Speed controllers, needle valves, quick exhausts and check valves.' },
    { type: 'category_link', slug: 'pneumatic-control-valves', label: 'Manual and pilot valves', blurb: 'Including piloted non-return and blocking valves for cylinder lines.' },
    {
      type: 'related_articles',
      slugs: [
        'solenoid-valve-functions-3-2-5-2-5-3',
        'sizing-pneumatic-valves-flow-cv',
        'pneumatic-cylinder-cushioning-and-mounting',
        'air-safety-relief-soft-start-and-lockout-valves',
        'push-to-connect-fittings-and-silencers',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Meter-in/meter-out behaviour and start-up lurch from SMC’s SSC valve catalogue; pilot-check limits from SMC’s ASP pages and valve precautions; quick-exhaust description from Parker’s P4Q series page.',
    },
    {
      type: 'cta_block',
      heading: 'Setting up cylinder speed control?',
      body: 'Tell us the cylinder bore and port thread, the tube size, and whether you want to slow it, speed it up or stop it mid-stroke. We will quote the maker speed controllers, quick exhausts or pilot checks to suit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
