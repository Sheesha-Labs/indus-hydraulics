import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Sizing pneumatic valves. Cv definition, ISO 6358 sonic conductance C and critical pressure ratio b, JIS effective
 * area S, S = 5C and Cv(ref) = S/18 for b 0.3–0.5, 15% allowable variation in ISO/JIS/NFPA, and Cv alone being
 * insufficient (N. Oneyama, SMC Corp., Machine Design, 11 Oct 2001). Kv–Cv relation derived from the unit
 * definitions (US gal/min at 1 psi vs m³/h at 1 bar), arithmetic shown. Cylinder sizing method: free-air flow
 * Q = V·Cr/(28.8·t), Cv = Q·A, ΔP choice 2/5/10 psi, 80 psig inlet assumption, ISO 15407 18 mm/26 mm and ISO 5599
 * sizes 1–3 (Chris Landis, Parker Hannifin, Machine Design, 21 Nov 2007). Worked example 25 mm bore × 100 mm stroke at
 * 6 bar, Cf = 7, required Cv 0.158/0.166, 0.200 chosen; smaller valves switch faster; manifolds share supply and
 * exhaust channels (Michael Foy, Festo, Machine Design, 17 Apr 2003). SY5000 effective areas 10.6/12.6 mm² (Cv 0.59/0.7)
 * and manifold types (SMC SY5000 product page) — quoted as SMC's series figures only. Back-pressure check valve and
 * individual-exhaust options on SMC manifolds (SMC manifold option lists). Left out as unsourced: Parker's A-constant
 * table values, any Cv for our listings, ISO 5599-1 per-size flow figures.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sizing-pneumatic-valves-flow-cv',
  title: 'Sizing pneumatic valves: Cv, Kv, sonic conductance and matching a valve to a cylinder',
  excerpt:
    'What Cv, Kv and the ISO 6358 sonic conductance C and critical pressure ratio b each tell you, why Cv alone can mislead on air, how to work out the flow a cylinder needs and the valve Cv to deliver it using Parker’s published method, and how ISO 5599-1 plug-in valves differ from maker manifolds — including common vs individual exhaust.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Sizing Pneumatic Valves: Cv, Kv and Sonic Conductance',
  seoDescription:
    'How to size a pneumatic valve: Cv vs Kv vs ISO 6358 sonic conductance C and b, Parker’s method for cylinder bore, stroke and time, ISO 5599 vs maker manifolds.',
  focusKeyword: 'pneumatic valve sizing Cv',
  publishedAt: '2026-10-22T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Cv is a water-flow rating borrowed from process valves. On compressed air it describes only one point of the flow curve; SMC’s research manager calls Cv alone insufficient for selecting pneumatic valves.',
        'ISO 6358 rates a pneumatic valve with two numbers: sonic conductance C (the maximum, choked flow) and critical pressure ratio b (where flow chokes). Two valves with the same Cv can differ by over 30% in maximum flow.',
        'To size a valve, work out the free-air flow the cylinder needs from its volume, pressure and stroke time, then the Cv that passes it at an allowed pressure drop — Parker suggests 5 psi as the usual figure.',
        'Do not match the valve port to the cylinder port. Festo notes smaller valves switch faster, cost less and draw less power; size on flow and add margin for fittings and tubing.',
        'ISO 5599-1 sizes 1, 2 and 3 (and ISO 15407 18 mm and 26 mm) are interchangeable sub-base interfaces; maker manifolds such as SMC’s VV5Q and SS5Y are not.',
      ],
    },
    {
      type: 'lead',
      html: 'An undersized valve is the commonest reason a new pneumatic machine misses its cycle time, and an oversized one wastes money, cabinet space and switching speed. Valve flow is published in at least four different ways — Cv, Kv, effective area S, and the ISO 6358 pair C and b — and they do not convert neatly. This guide explains each rating in plain words, then walks through a maker’s published method for picking a valve to suit a cylinder.',
    },

    { type: 'section_head', number: '/01', title: 'Cv and Kv: the water ratings.', anchor: 'cv-kv' },
    {
      type: 'prose',
      html: '<p><strong>Cv</strong> (flow coefficient) is the flow of water in US gallons per minute that passes a valve with a 1 psi pressure drop. It came from process-control valves and is the figure most North American pneumatic catalogues still print. <strong>Kv</strong> is the metric equivalent: cubic metres of water per hour at a 1 bar pressure drop.</p><p>Because both are water ratings, the conversion between them is pure unit arithmetic: 1 US gal/min is 0.2271 m³/h and 1 psi is 0.06895 bar, so Kv = Cv × 0.2271 ÷ √0.06895 ≈ <strong>0.865 × Cv</strong>, and Cv ≈ 1.156 × Kv.</p><p>The problem is that air is compressible. As the pressure drop across a valve grows, the air speeds up until it reaches sonic velocity in the narrowest passage; beyond that point (“choked flow”) lowering the outlet pressure further does not increase the flow. Writing in Machine Design in 2001, N. Oneyama of SMC’s technology research division pointed out that the ANSI Cv for air is measured at a tiny pressure drop — pressure ratios of 0.98 to 0.99, at the extreme end of the subsonic range — so it gives one representative point and says nothing about where the valve chokes. His example: two valves with identical Cv of 0.2 can differ by more than 30% in maximum flow if their critical pressure ratios are 0.1 and 0.5. His conclusion was blunt: Cv alone is not enough to select a valve for a pneumatic actuator.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Sonic conductance C and critical pressure ratio b (ISO 6358).', anchor: 'iso-6358' },
    {
      type: 'prose',
      html: '<p>ISO 6358 describes a pneumatic component by its whole flow curve, using two measured numbers:</p><ul><li><strong>Sonic conductance, C</strong> — the maximum flow at choked conditions per unit of upstream absolute pressure, usually published in dm³/(s·bar). Think of it as the size of the hole the air sees.</li><li><strong>Critical pressure ratio, b</strong> — the ratio of downstream to upstream absolute pressure at which the flow reaches its maximum. A low b means the valve keeps increasing its flow over a wider range of pressure drops; Oneyama notes that b varies from one valve design to another.</li></ul><p>With C and b you can calculate the flow at any working pressure and pressure drop, not just at the 1 psi point. SMC has published measured C and b for its valve series since 2000, with Cv and the Japanese effective area S as secondary figures.</p><p><strong>Effective area S</strong> (mm²) is the older JIS rating, still printed by SMC — its SY5000 page, for example, gives 10.6 mm² (Cv 0.59) body-ported and 12.6 mm² (Cv 0.7) base-mounted for the series. SMC gives two rough conversions: <strong>S ≈ 5 × C</strong>, and a reference <strong>Cv ≈ S ÷ 18</strong>, which it says corresponds to valves with b between 0.3 and 0.5. Treat any conversion as approximate: Oneyama notes that the ISO, JIS and ANSI/NFPA standards all allow a 15% variation in the measured figures.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Pneumatic flow ratings compared',
      columns: ['Rating', 'Defined as', 'Units', 'Who prints it', 'Limitation'],
      rows: [
        { cells: ['Cv', 'Water flow at 1 psi pressure drop', 'US gal/min', 'North American catalogues, Parker’s included', 'One point at a tiny pressure drop; does not show choking'] },
        { cells: ['Kv', 'Water flow at 1 bar pressure drop', 'm³/h', 'Metric and process-valve catalogues', 'Same as Cv; Kv ≈ 0.865 × Cv'] },
        { cells: ['S (effective area)', 'Equivalent orifice area at choked flow (JIS)', 'mm²', 'SMC', 'Maximum flow only; S ≈ 5 × C'] },
        { cells: ['C and b (ISO 6358)', 'Sonic conductance and critical pressure ratio', 'dm³/(s·bar), dimensionless', 'SMC and other makers testing to ISO 6358', 'Needs both numbers; the most complete description'], highlight: true },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Matching a valve to a cylinder: Parker’s method.', anchor: 'cylinder-method' },
    {
      type: 'prose',
      html: '<p>The question a valve size answers is: <em>how much air must pass, in what time, with how much pressure lost on the way?</em> Chris Landis, valve and vacuum product manager at Parker Hannifin, set out Parker’s method in Machine Design (2007). In outline:</p><ol><li><strong>Cylinder volume.</strong> V = (π/4) × d² × l, where d is the bore and l the stroke. Use the annulus area (bore minus rod) for the retract stroke.</li><li><strong>Compression ratio.</strong> Cr = P1 ÷ Pa, the absolute supply pressure divided by atmospheric pressure (14.7 psi). Each cubic inch of cylinder at working pressure takes Cr cubic inches of free air.</li><li><strong>Free-air flow.</strong> Q = V × Cr ÷ (28.8 × t), with V in cubic inches and t the stroke time in seconds, gives scfm. (The 28.8 converts cubic inches per second to cubic feet per minute: 1,728 ÷ 60.)</li><li><strong>Required Cv.</strong> Cv = Q × A, where A is a constant Parker tabulates for the inlet pressure and the pressure drop you allow across the valve. It comes from the standard gas-flow equation, with air’s specific gravity and absolute temperature built in.</li></ol><p>On the pressure drop, Parker’s guidance is: assume <strong>5 psi</strong> for most work; use <strong>2 psi</strong> for time- or process-critical applications; a <strong>10 psi</strong> drop is often acceptable and permits smaller, cheaper valves. Its worked charts assume 80 psig at the valve, based on a typical plant running at 100 psig with line losses. Note that l ÷ t is only the average rod speed — the cylinder accelerates from rest — so build in margin.</p><h3>A worked example from Festo</h3><p>Michael Foy, a design engineer at Festo, worked the same calculation in metric for Machine Design (2003): a 25 mm bore, 100 mm stroke cylinder with a 10 mm rod, at 6 bar with a 0.25 bar pressure drop, extending in 0.25 s and retracting in 0.2 s. With a compression factor of 7 ((6 + 1) ÷ 1), he arrived at a required Cv of 0.158 to extend and 0.166 to retract, and selected a valve of Cv 0.200. Note that the faster retract stroke, not the larger extend volume, set the size.</p>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Size on flow, not on port thread.',
      body: 'Foy’s advice is that matching the valve port to the cylinder port is no longer recommended: smaller valves switch faster, cost less and consume less power because they use smaller solenoids. If the chosen valve moves the cylinder too fast, a flow control slows it. Do allow margin — every fitting, tube run, silencer and flow control between the valve and the cylinder adds its own restriction.',
    },
    {
      type: 'prose',
      html: '<p>Three practical checks once you have a target Cv:</p><ul><li><strong>Compare like with like.</strong> If one maker prints C and b and another prints Cv, convert carefully or ask for the same rating. A valve that looks larger on Cv may choke earlier.</li><li><strong>Look at the whole path.</strong> The tubing bore and the fittings often restrict more than the valve. Our guides to <a href="/blog/pneumatic-tubing-materials-guide">pneumatic tubing</a> and <a href="/blog/push-to-connect-fittings-and-silencers">push-to-connect fittings and silencers</a> cover those parts of the circuit.</li><li><strong>Remember the exhaust.</strong> The air leaving the cylinder must pass back through the valve and out through the silencer. A restrictive silencer or a meter-out flow control slows the stroke as surely as a small valve; see <a href="/blog/cylinder-speed-control-and-quick-exhaust-valves">cylinder speed control and quick exhaust valves</a>.</li></ul><p>We do not publish flow figures on our listings: we sell by maker part number, and flow varies within a series by body type, port and function. Ask us for the maker’s data sheet for the exact part number.</p>',
    },

    { type: 'section_head', number: '/04', title: 'ISO 5599-1 plug-in valves vs maker manifolds.', anchor: 'manifolds' },
    {
      type: 'prose',
      html: '<p>Most machines with more than a handful of valves mount them on a manifold, which shares a common supply and common exhaust galleries and cuts the tubing and fittings needed. There are two families:</p><h3>ISO interchangeable</h3><p><strong>ISO 5599-1</strong> fixes the sub-base mounting interface for five-port valves — Parker’s range covers sizes 1, 2 and 3 — and <strong>ISO 5599-2</strong> covers the version with an integrated electrical connector. <strong>ISO 15407</strong> does the same for the smaller 18 mm and 26 mm widths. Parker notes that its plug-in valves meet ISO 15407 and 5599 dimensional and electrical standards. The point of the standard is interchangeability: a size-1 ISO valve from one maker should fit a size-1 ISO sub-base from another. Our Parker H-ISO H1, HA and HB listings are valves of this kind.</p><h3>Maker-proprietary manifolds</h3><p>SMC’s SY, VQZ, VQ, VF and VFS valves, ARO’s Alpha, MaxAir and Sierra lines and Numatics’ manifold blocks are designed around their own manifold bases. They are generally more compact for a given flow and offer more electrical options — multi-pin, fieldbus, plug-in wiring — but a valve from one maker will not fit another maker’s base, and often not a different series from the same maker. When replacing a single valve on such a manifold, quote the manifold part number as well as the valve.</p><h3>Common vs individual exhaust</h3><p>On a common-exhaust manifold, all valves exhaust into one shared gallery. When several valves exhaust at once — or the shared silencer is restrictive or clogged — the gallery pressure rises, and that back-pressure can push into the outlets of other valves and nudge a cylinder or single-acting actuator that should be at rest. SMC offers back-pressure check valves and individual-exhaust options on its manifold series for this reason. Specify individual exhaust (or back-pressure checks) when a manifold drives single-acting cylinders, vacuum ejectors or sensitive actuators, or when exhaust air must be piped away from the machine.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Valve mounting options',
      columns: ['Option', 'Interchangeable between makers?', 'Strengths', 'Best for'],
      rows: [
        { cells: ['Body-ported single valve', 'No (port threads only)', 'Simple; valve can sit close to the cylinder', 'One-off valves, long distances between actuators'] },
        { cells: ['ISO 5599-1 sub-base (sizes 1, 2, 3)', 'Yes, at the interface', 'Second-source replacement; larger flows', 'Heavy-duty and large-bore cylinders, long-life plant'] },
        { cells: ['ISO 15407 (18 mm, 26 mm)', 'Yes, at the interface', 'Compact ISO option', 'Smaller cylinders with an interchangeability requirement'] },
        { cells: ['Maker manifold (SMC, ARO, Numatics, Parker)', 'No', 'Compact, high flow per width, fieldbus and multi-pin wiring', 'Automation machines with many valves'] },
      ],
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a valve size',
      branches: [
        { condition: 'Do you know bore, stroke, pressure and stroke time?', outcome: 'Work out Q and the required Cv by Parker’s method, at a 5 psi drop (2 psi if timing is critical).' },
        { condition: 'Maker publishes C and b?', outcome: 'Use them — they describe the whole flow curve; Cv is a single point.' },
        { condition: 'Long tube runs or many fittings?', outcome: 'Add margin or size up the tube; the valve is not the only restriction.' },
        { condition: 'Must second-source replacements fit the same base?', outcome: 'ISO 5599-1 or ISO 15407 valves.' },
        { condition: 'Manifold drives single-acting cylinders or vacuum?', outcome: 'Individual exhaust or back-pressure check valves on those stations.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is Cv on a pneumatic valve?', answer: 'The flow of water in US gallons per minute that passes the valve at a 1 psi pressure drop. It is a convenient comparison figure, but on compressed air it describes only one point of the flow curve.' },
        { question: 'How do I convert Cv to Kv?', answer: 'Kv ≈ 0.865 × Cv, and Cv ≈ 1.156 × Kv. Both are water ratings, so the conversion is exact unit arithmetic.' },
        { question: 'What is sonic conductance in a pneumatic valve?', answer: 'The ISO 6358 measure of a valve’s maximum (choked) air flow per unit of upstream absolute pressure, usually in dm³/(s·bar). It is published with the critical pressure ratio b, which says where the flow chokes.' },
        { question: 'How do I size a solenoid valve for a pneumatic cylinder?', answer: 'Calculate the cylinder volume, multiply by the compression ratio to get free air, divide by the stroke time to get flow, then find the Cv that passes that flow at an allowed pressure drop — Parker suggests 5 psi. Add margin for fittings and tubing.' },
        { question: 'Should the valve port size match the cylinder port size?', answer: 'Not necessarily. Festo notes that smaller valves switch faster, cost less and use less power. Size on the flow the cylinder needs, then use a flow control if it runs too fast.' },
        { question: 'What is an ISO 5599 valve?', answer: 'A five-port valve built to the ISO 5599-1 sub-base interface (sizes 1, 2 and 3 and up), so valves of the same size from different makers fit the same base. ISO 5599-2 adds an integrated electrical connector.' },
        { question: 'What is the difference between common and individual exhaust on a valve manifold?', answer: 'With common exhaust, all valves vent into one gallery and back-pressure can affect idle actuators. Individual exhaust gives each station its own exhaust path; SMC also offers back-pressure check valves for the same problem.' },
      ],
    },

    { type: 'section_head', number: '/05', title: 'What we list.', anchor: 'what-we-list' },
    {
      type: 'prose',
      html: '<p>Every listing on our solenoid valves shelf — single valves, ISO valves and maker manifolds from SMC, Parker, ARO and Numatics — sold by maker part number; ask for the maker’s flow data for any part.</p>' + stockList(['pneumatic-solenoid-valves']),
    },
    {
      type: 'product_embed',
      heading: 'ISO valves and valve manifolds',
      skus: [
        'IH-PAR-H-ISO-H1-SERIES-SINGLE-SOLENOID-VALVES-4-WAY-2-PO',
        'IH-PAR-H-ISO-HA-SERIES-SINGLE-SOLENOID-VALVES-4-WAY-2-PO',
        'IH-PAR-H-ISO-HB-SERIES-SINGLE-SOLENOID-VALVES-4-WAY-2-PO',
        'IH-SMC-VQZ2000-SERIES-VALVE',
        'IH-SMC-VV5Q-SERIES-MANIFOLD',
        'IH-SMC-SS5Y5-SERIES-MANIFOLD',
        'IH-ARO-ALPHA-SERIES-THIN-MANIFOLDS',
        'IH-NUM-MANIFOLD-BLOCK-4-STATIONS-NPT',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-solenoid-valves', label: 'Pneumatic solenoid valves', blurb: 'ISO and maker valves and manifolds from SMC, Parker, ARO and Numatics.' },
    { type: 'category_link', slug: 'pneumatic-fittings-silencers', label: 'Fittings and silencers', blurb: 'Exhaust silencers and fittings that complete the valve’s flow path.' },
    {
      type: 'related_articles',
      slugs: [
        'solenoid-valve-functions-3-2-5-2-5-3',
        'how-to-size-a-pneumatic-cylinder',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'pneumatic-tubing-materials-guide',
        'push-to-connect-fittings-and-silencers',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Flow ratings from SMC’s published explanation of ISO 6358, JIS and ANSI ratings; sizing method from Parker; worked example from Festo; SY5000 figures from SMC’s product page. Kv–Cv derived from unit definitions.',
    },
    {
      type: 'cta_block',
      heading: 'Need a valve sized for a cylinder?',
      body: 'Send us the bore, rod, stroke, supply pressure and the stroke time you need, or the part number of the valve you are replacing. We will quote a maker valve or manifold to suit, with the maker’s flow data.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
