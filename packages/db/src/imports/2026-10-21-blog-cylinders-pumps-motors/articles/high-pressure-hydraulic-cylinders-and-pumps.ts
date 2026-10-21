import type { BlogArticleSeed } from '../shared'

/**
 * 10,000 psi systems. Enerpac series ranges from our listings and enerpac.com category pages; worked examples
 * (RC-106, RC-158, RC-256, RC-308, RC-10010) from Enerpac's Basic Hydraulics page; 80% load-and-stroke rule,
 * saddles, cribbing, "lifting device, not a load-holding device", gauge, parallel cylinders and B30.1 compliance
 * from Enerpac's safety handbook and category pages; HCL 10% side load to 90% stroke from the HCL502 page;
 * aluminium ~5,000 cycles from Enerpac Cylinders 101; P-392 stages and 55 in³ usable oil from instruction sheet
 * L1763; ZE4/ZE5 flows and SFP 4% accuracy from enerpac.com and L14004711. Stroke counts computed.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'high-pressure-hydraulic-cylinders-and-pumps',
  title: '10,000 psi hydraulic cylinders and pumps: choosing, matching and using a 700 bar system safely',
  excerpt:
    'Jacking, pressing, pulling and bolting tools run at 10,000 psi, where a small cylinder lifts tens of tonnes and a mistake is measured in crushed hands. Single and double-acting, hollow plunger, low-height, lock-nut and aluminium cylinders; hand, air and electric pumps; matching oil volume; and the rules that keep a 700 bar lift safe.',
  categorySlug: 'cylinders-pumps-motors',
  authorSlug: 'ayush-bhatia',
  seoTitle: '10,000 psi Hydraulic Cylinders & Pumps: Selection and Safety',
  seoDescription:
    'How to choose 10,000 psi (700 bar) hydraulic cylinders and pumps: RC, RR, hollow plunger, low height, lock-nut and aluminium cylinders, hand, air and electric pumps, oil volume matching, synchronised lifting and safety rules.',
  focusKeyword: '10000 psi hydraulic cylinder',
  publishedAt: '2026-10-21T10:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'At 10,000 psi a cylinder with 6.49 in² of effective area pushes about 65,000 lbf — so tools for jacking and pressing are small, portable and dangerous if misused.',
        'Choose the cylinder by tonnage, stroke and closed height first, then the type: spring-return, double-acting, hollow plunger, low-height, lock-nut, aluminium or high-tonnage.',
        'The pump must hold more usable oil than all the cylinders and hoses it feeds: an RC-158 needs 25 in³; four RC-308s need 214 in³.',
        'Enerpac’s own rule: use only 80% of rated load and stroke, because most loads are not lifted on their true centre.',
        'A cylinder is a lifting device, not a load-holding device. Crib or block the load before anyone goes under it, or use a lock-nut cylinder.',
      ],
    },
    {
      type: 'lead',
      html: 'Industrial hydraulics mostly runs at 2,000–5,000 psi. Jacking, pressing, pulling, bending and bolting tools run at 10,000 psi (700 bar), because at that pressure a cylinder small enough to carry by hand can lift a building column or press a bearing off a shaft. The same pressure makes every hose, coupler and gauge in the system part of a safety case. This guide covers choosing the cylinder and the pump as one system, and using them properly.',
    },

    { type: 'section_head', number: '/01', title: 'The arithmetic at 10,000 psi.', anchor: 'arithmetic' },
    {
      type: 'prose',
      html: '<p>The rules are the same as for any cylinder — force is pressure × effective area, oil needed is effective area × stroke — but the numbers are larger. Enerpac’s own worked examples:</p><ul><li>An RC-106 has 2.24 in² of effective area; at 8,000 psi it pushes 17,920 lb. To lift 14,000 lb it needs 6,250 psi.</li><li>An RC-256 (5.15 in²) lifting 41,000 lb needs about 7,961 psi.</li><li>Four RC-308 cylinders (6.49 in² each) lifting 180,000 lb share it at about 6,933 psi.</li><li>An RC-158 has 3.14 in² and 8" of stroke: it takes 25.12 in³ of oil to extend fully. An RC-10010 (20.63 in², 10.25") takes 211.46 in³.</li></ul><p>Capacities are named by nominal tonnage at 10,000 psi; each cylinder’s actual capacity is on its own data and is often a little above the nominal figure.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Cylinder types.', anchor: 'cylinders' },
    {
      type: 'comparison_table',
      caption: '10,000 psi cylinder families on our shelf (Enerpac)',
      columns: ['Series', 'Type', 'Capacity', 'Stroke', 'Use'],
      rows: [
        { cells: ['RC', 'Single-acting, spring return', '5–100 ton', '0.63"–14.25"', 'General jacking, pushing, pressing'], highlight: true },
        { cells: ['RR', 'Double-acting', '10–500 ton', '2.25"–48"', 'High-cycle work, controlled retract, pulling'] },
        { cells: ['RCH / RRH', 'Hollow plunger, single / double-acting', '12–100 ton (RCH)', '0.31"–6.13"', 'Pulling and tensioning: bars, cables, pullers'] },
        { cells: ['RCS', 'Low height, spring return', '10–100 ton', '1.5"–2.44"', 'Lifting where clearance is tight'] },
        { cells: ['LPL', 'Low height, lock nut, load return', '60–500 ton', '1.77"–1.97"', 'Lift and hold mechanically'] },
        { cells: ['RSM', 'Flat jack, spring return', '5–150 ton', '0.25"–0.63"', 'Very low clearance: under machines and plates'] },
        { cells: ['RAC / RAR / RACH / RARH / RACL', 'Aluminium: single, double, hollow, lock nut', '20–150 ton', '1.97"–9.84"', 'Where weight matters'] },
        { cells: ['HCG / HCR / HCL', 'High tonnage: single, double, lock nut', '50–1,000 ton', '1.97"–11.81"', 'Heavy lifting, bridge and structure work'] },
      ],
    },
    {
      type: 'prose',
      html: '<h3>Single-acting or double-acting</h3><p>Single-acting cylinders return by an internal spring (RC, RCS, RSM) or by the load’s weight (HCG, LPL, HCL). They need one hose and a simple pump valve. Enerpac notes that spring return can be slow on high-capacity, long-stroke cylinders and that load-return cylinders are for intermittent work. Double-acting cylinders (RR, HCR, RAR) are powered back, so retraction is controlled and fast and the cylinder can pull; they need two hoses and a pump with a 4-way valve.</p><h3>Hollow plunger</h3><p>A hole through the plunger lets a rod, cable or puller screw pass through the cylinder, so it can pull as well as push: tensioning anchor bolts and cables, pulling bearings and gears with a puller set, testing anchors.</p><h3>Lock-nut</h3><p>A threaded collar on the plunger is run down against the cylinder body once the load is raised, holding it mechanically with the hydraulic pressure released. It is the right cylinder for any load that must stay up for more than a moment. The HCL range also withstands 10% side load up to 90% of stroke.</p><h3>Aluminium</h3><p>Aluminium cylinders are far lighter than steel ones — useful when a cylinder has to be carried up a structure — but Enerpac rates them for about 5,000 cycles at recommended pressure; steel has the longer fatigue life. Use aluminium for portability, steel for repetitive work.</p><h3>Finish</h3><p>For outdoor and corrosive environments — a jetty, a coastal plant, a Gulf site — Enerpac recommends nitrocarburised surfaces, which its high-tonnage lock-nut cylinders carry as standard.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Pumps.', anchor: 'pumps' },
    {
      type: 'prose',
      html: '<h3>Hand pumps</h3><p>A two-speed hand pump has a large first stage that moves a lot of oil per stroke at low pressure to bring the cylinder up to the load quickly, and a small second stage that takes over automatically as pressure builds. Enerpac’s P-392 is typical: 0.687 in³ per stroke to 200 psi, then 0.151 in³ per stroke to 10,000 psi, with 55 in³ (about 900 cm³) of usable oil. On an RC-308 (6.49 in²) that is about 9 strokes per inch of travel before the load and 43 strokes per inch under it — fine for occasional lifts, slow for repetitive work.</p><h3>Air-hydraulic pumps</h3><p>Driven by workshop or site compressed air, with no electrical supply at the cylinder. The right choice where electrical equipment is unwelcome or unavailable. We stock Enerpac PA, XA, ZA and Turbo II (PACG, PAMG, PARG, PASG, PATG) air pumps, and BVA PA pumps.</p><h3>Electric pumps</h3><p>For repetitive work, large cylinders and multiple cylinders. Flow at 700 bar sets the speed under load: Enerpac’s ZE4 delivers 0.82 L/min and the ZE5 1.64 L/min at 700 bar, with 20 L reservoirs on common models. The PU economy and ZU and ZE ranges cover workshop and site duty; the XC is cordless.</p><h3>Torque wrench and special pumps</h3><p>Hydraulic torque wrench pumps (ZA4T, ZE4T, ZU4T, LAT) run at 700 bar, with some versions at 800 bar for the wrenches that need it — check the wrench’s rating before connecting. The ZU5 post-tensioning pump and the SFP split-flow pumps serve specialist work: the SFP runs several lifting points from one pump with lifting accuracy of 4% across points, for bridge bearing replacement, machinery moving and skidding.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Matching pump to cylinder.', anchor: 'matching' },
    {
      type: 'prose',
      html: '<ol><li><strong>Oil volume.</strong> Add up the effective area × stroke of every cylinder on the pump, and the hoses. The pump’s <em>usable</em> oil must exceed it. The P-392’s 55 in³ will extend one RC-158 (25 in³) but not four RC-308s (214 in³), which need a pump such as the P-462/464 with 462 in³ usable or an electric pump with a large reservoir. Enerpac’s warning applies on the way back too: never return more oil to the reservoir than it can hold.</li><li><strong>Action.</strong> Single-acting cylinders need a 3-way valve and one hose; double-acting cylinders a 4-way valve and two hoses.</li><li><strong>Speed.</strong> Hand pumps for occasional lifts; air or electric for repetitive work, many cylinders or large volumes.</li><li><strong>Gauge.</strong> Always fit a pressure gauge between the pump and the cylinders. Enerpac is explicit that without one, relief settings can be exceeded — and the gauge is how you read the load, since force is pressure × area.</li><li><strong>Couplers and hoses</strong> rated for 10,000 psi, never ordinary hydraulic hose.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Parallel cylinders lift the lightest corner first.',
      body: 'Several cylinders on one pump all see the same pressure, so the one with the least load moves first and the load tilts. For an even lift, control each cylinder with its own valve, or use a split-flow or synchronised lift system.',
    },

    { type: 'section_head', number: '/05', title: 'The rules that keep a 700 bar lift safe.', anchor: 'safety' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never work under a load held only by hydraulics.',
      body: 'Enerpac describes its cylinders as lifting devices, not load-holding devices. Before anyone goes under or near a raised load, crib or block it — softwood cribbing is preferred because it cracks slowly and audibly — or hold it on a lock-nut cylinder with the nut run down.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>80% of load and stroke.</strong> Enerpac’s guidance is to use only 80% of a cylinder’s rated load and stroke. Most loads are not lifted on their true centre, and off-centre loading puts side load on the plunger; running to full stroke drives the bearing into the stop ring.</li><li><strong>Always use a saddle</strong>, in full contact with the load. It protects the plunger thread and stops the plunger end mushrooming. Tilt saddles take up a few degrees of misalignment. Never rely on the plunger thread to carry the load.</li><li><strong>Fully supported base</strong> — flat, clean and debris-free, on a base plate where the ground is soft.</li><li><strong>Do not exceed rated stroke.</strong> To go higher, block the load, raise the cylinder on a support and continue.</li><li><strong>Never weld on or modify a cylinder.</strong></li><li><strong>Hand-pump technique:</strong> short strokes as the handle stiffens; close the release valve finger-tight only; never extend the handle.</li><li><strong>Check the standard.</strong> Enerpac states its cylinders comply with ASME B30.1, the safety standard for jacks and industrial rollers.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a 10,000 psi cylinder',
      branches: [
        { condition: 'General lift or push, occasional use?', outcome: 'RC single-acting, spring return.', sku: 'IH-ENE-CYL-RC' },
        { condition: 'Repetitive work, controlled retract, or pulling?', outcome: 'RR double-acting with a 4-way valve pump.', sku: 'IH-ENE-CYL-RR' },
        { condition: 'Pulling a bar, cable or puller through the cylinder?', outcome: 'RCH or RRH hollow plunger.', sku: 'IH-ENE-CYL-RCH' },
        { condition: 'Very little clearance under the load?', outcome: 'RCS low height or RSM flat jack.', sku: 'IH-ENE-CYL-RCS' },
        { condition: 'Load must stay up?', outcome: 'Lock-nut cylinder — LPL, RACL or HCL.', sku: 'IH-ENE-CYL-HCL' },
        { condition: 'Cylinder carried by hand up a structure?', outcome: 'Aluminium RAC or RAR — for intermittent use.', sku: 'IH-ENE-CYL-RAC' },
        { condition: 'Hundreds of tonnes?', outcome: 'High tonnage HCG or HCR, usually with a synchronised pump.', sku: 'IH-ENE-CYL-HCG' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How much can a 10,000 psi cylinder lift?', answer: 'Its effective area × 10,000 psi. A cylinder with 6.49 in² pushes about 65,000 lbf, about 32 short tons — which is why it is sold as a 30-ton cylinder. Use only 80% of the rated load in practice.' },
        { question: 'What is the difference between single and double-acting jacking cylinders?', answer: 'Single-acting cylinders are pushed out hydraulically and returned by a spring or the load. Double-acting cylinders are powered both ways, so retraction is fast and controlled and they can pull; they need a 4-way valve.' },
        { question: 'What is a hollow plunger cylinder for?', answer: 'Pulling and tensioning. A rod or cable passes through the hole in the plunger, so the cylinder can tension anchor bolts and cables or drive a puller.' },
        { question: 'How do I size a pump for a hydraulic cylinder?', answer: 'Add the oil volume of every cylinder (effective area × stroke) and the hoses. The pump’s usable oil must exceed it. Then choose hand, air or electric for the speed and frequency of the work.' },
        { question: 'Can I leave a load on a hydraulic jack?', answer: 'Not without mechanical support. A hydraulic cylinder is a lifting device, not a holding device. Crib or block the load, or use a lock-nut cylinder with the nut run down.' },
        { question: 'Why do I need a gauge on a hand pump?', answer: 'Because the gauge is the only way to see the pressure — and so the load — and to avoid exceeding the cylinder’s rating or the relief setting.' },
        { question: 'Are aluminium cylinders as strong as steel?', answer: 'They carry the same rated load but have a shorter fatigue life — Enerpac rates aluminium at about 5,000 cycles at recommended pressure. Use them where weight matters, steel for repetitive work.' },
      ],
    },
    {
      type: 'product_embed',
      heading: '10,000 psi cylinders',
      skus: ['IH-ENE-CYL-RC', 'IH-ENE-CYL-RR', 'IH-ENE-CYL-RCH', 'IH-ENE-CYL-RCS', 'IH-ENE-CYL-LPL', 'IH-ENE-CYL-RAC', 'IH-ENE-CYL-HCG', 'IH-ENE-CYL-ACC'],
    },
    {
      type: 'product_embed',
      heading: '10,000 psi pumps',
      skus: ['IH-ENE-PUMP-P-LIGHTWEIGHT', 'IH-ENE-PUMP-P-ULTIMA', 'IH-ENE-PUMP-PATG', 'IH-ENE-PUMP-ZE', 'IH-ENE-PUMP-ZU', 'IH-ENE-PUMP-XC', 'IH-ENE-PUMP-SFP', 'IH-ENE-PUMP-ZE4T'],
    },
    { type: 'category_link', slug: 'high-pressure-cylinders', label: '10,000 psi cylinders', blurb: 'RC, RR, hollow plunger, low height, lock-nut, aluminium and high tonnage.' },
    { type: 'category_link', slug: 'high-pressure-hydraulic-pumps', label: '10,000 psi pumps', blurb: 'Hand, air, electric, cordless, torque wrench and split-flow pumps.' },
    {
      type: 'related_articles',
      slugs: ['hydraulic-cylinder-guide', 'hydraulic-cylinder-force-and-speed', 'hydraulic-fluid-injection-injury', 'hydraulic-pump-types-gear-vane-piston'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Ranges from our Enerpac listings; worked examples, pump data and safety rules from Enerpac’s education pages and instruction sheets.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a lift or a press job?',
      body: 'Send the load, the number of lifting points, the clearance under the load and the stroke you need. We will propose cylinders, a pump with enough oil, hoses, couplers and a gauge as one kit.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
