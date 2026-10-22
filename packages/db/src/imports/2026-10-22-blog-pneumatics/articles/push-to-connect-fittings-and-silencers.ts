import { stockList } from '../products'
import type { BlogArticleSeed } from '../shared'

/**
 * Push-to-connect fittings and exhaust silencers. Anatomy (chuck, collet, guide, release button, NBR packing), tube
 * materials, −100 kPa to 1 MPa, 3 MPa proof, −5 to 60 °C, NPT to ANSI/ASME B1.20.1, sealant-coated threads (SMC KQ2
 * catalogue); cutting square with a tube cutter not pliers, push to the stop and pull back, releasing with the button
 * flange, not pressing the button before mounting, lodged tube, polyurethane swelling on re-insertion, hand-tight plus
 * two or three turns, excess torque squeezes sealant out (SMC KQ2 fittings & tubing precautions, Best Pneumatics);
 * pipe tape 1.5–2 threads exposed, depressurise before removal
 * (SMC common precautions); TJ inner sleeve for TUS soft polyurethane, always in safety circuits (SMC USA product page);
 * TRB strip-to-mark (SMC TRB); lesser of tube and fitting rating (SMC TL). Dixon ratings per family, sealant, two-finger
 * release, "pulling tightens", seals on the tube OD, circuit pressure depends on tube, DOT FMVSS 571.106 / SAE J1131 /
 * SAE J2494-3 (Dixon push-in fittings data sheet DVCC_923, 2023). Thread forms: ASME B1.20.1 (NPT), ISO 7-1 (R/Rc, BSPT),
 * ISO 228-1 (G, BSPP, joints not made on the thread). Silencers: resin and copper-alloy sintered elements, 30/35/38/40
 * dB(A), 5–60 °C and 5–150 °C, sonic conductance C = effective area ÷ 5 and must exceed the valve's, clogging slows
 * exhaust → replace, a clogged silencer can break, not a filter, oil mist → exhaust cleaner, tightening 1/4 turn and
 * never wrench the sintered part (SMC AN/ANA1/ANB1 catalogue and silencer precautions); metering valve with silencer,
 * cylinder speed easily set, >20 dB, 0–1 MPa, residual-pressure caution with pilot check valves (SMC ASN2); Parker EM
 * sintered bronze mufflers and muffler/flow controls 250 psig (17.2 bar), 0–300 °F, brass and bronze, lockable screw
 * that cannot be blown out (Parker catalogue 0650-E via search summary).
 * Left out as unsourced: Parker Prestolok / Prestomatic / PTC ratings (Parker literature not reachable; only reseller
 * data found), a numerical tube OD tolerance for push-in fittings, Gast / Texas Pneumatic Tools / Wilkerson XMC /
 * Transair ratings, silencer back-pressure figures, SMC thread torque values (the source rendering was ambiguous).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'push-to-connect-fittings-and-silencers',
  title: 'Push-to-connect fittings and exhaust silencers: how they grip, seal, release and slow a cylinder',
  excerpt:
    'A push-in fitting grips the tube with a toothed collet and seals on its outside diameter with an O-ring — so the tube cut, the tube size and the thread end decide whether it holds. How push-in fittings work, fitting and releasing tube, pressure and temperature limits by maker, NPT vs BSPT vs BSPP, and how sintered bronze, plastic and speed-control mufflers affect exhaust back-pressure and cylinder speed.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Push-to-Connect Air Fittings & Silencers: A Buyer’s Guide',
  seoDescription:
    'How push-in air fittings grip, seal and release, maker pressure and temperature limits, NPT vs BSPT vs BSPP, and sintered bronze vs plastic silencers.',
  focusKeyword: 'push to connect fittings',
  publishedAt: '2026-10-22T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A push-in fitting holds the tube with a stainless toothed chuck or collet and seals with an elastomer seal on the tube’s outside diameter — so the tube must be the right OD and cut square.',
        'Cut tube with a tube cutter, never pliers or scissors; push it to the stop, then pull back to check. To release, press the button flange evenly and hold it while pulling the tube out.',
        'Ratings vary by maker and body material: Dixon gives 290 psi and −4 to 175 °F for nylon/nickel-plated brass push-ins, 435 psi and −13 to 302 °F for nickel-plated brass. The tube may be the lower limit.',
        'NPT (60°) and BSPT (55°) are both taper threads that seal on the thread with sealant; BSPP is parallel and seals on a gasket or O-ring. They do not interchange.',
        'A silencer must flow more than the valve it sits on. A clogged one raises back-pressure and slows the cylinder; a speed-control muffler does the same deliberately and adjustably.',
      ],
    },
    {
      type: 'lead',
      html: 'Push-to-connect fittings made pneumatic piping fast: no spanner, no ferrule, reusable. They are also unforgiving of a badly cut tube, the wrong OD or the wrong thread. The silencers on valve exhausts look even simpler, but they sit in the path every exhaust stroke takes, so their size and condition set how fast a cylinder moves. This guide covers both, on the makers’ own data.',
    },

    { type: 'section_head', number: '/01', title: 'How a push-in fitting grips and seals.', anchor: 'how-it-works' },
    {
      type: 'prose',
      html: '<p>SMC’s KQ2 one-touch fitting shows the parts every push-in fitting has in some form:</p><ul><li><strong>Chuck (or collet teeth).</strong> A stainless steel ring of teeth angled so the tube slides in but bites if pulled. SMC describes a large retaining force; Dixon puts it simply — pulling on the tubing only tightens the connection.</li><li><strong>Seal.</strong> An elastomer packing — NBR in SMC’s KQ2, a nitrile D-seal in Dixon’s nylon/nickel-plated brass push-ins — that seals on the outside diameter of the tube. SMC says its special profile ensures sealing while reducing the force needed to insert the tube.</li><li><strong>Collet and release button.</strong> Pressing the button drives the collet into the chuck and frees the tube. SMC notes that on removal the chuck and collet are released so they do not bite into the tube excessively.</li><li><strong>Guide and body.</strong> The guide centres the tube; on elbows and tees the body swivels on the stud so it can be aligned after the thread is tight.</li></ul><p>Because the seal works on the tube’s OD, the fitting is full-bore: Dixon points out that its fittings seal on the outside of the tube, with no internal tube support restricting the flow.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Getting the tube right.', anchor: 'tube' },
    {
      type: 'prose',
      html: '<h3>Material and OD</h3><p>Each maker lists the tube materials its fittings accept. SMC’s KQ2 takes FEP, PFA, nylon, soft nylon and polyurethane tube; Dixon’s nylon/nickel-plated brass push-ins take semi-rigid nylon, polyurethane and polyethylene. The fitting is made for one OD in one size system — 6 mm and 1/4 inch (6.35 mm) are different fittings. Our <a href="/blog/pneumatic-tubing-materials-guide">tubing materials guide</a> explains why the two never mix.</p><h3>Cut square</h3><p>SMC: cut the tube perpendicular, without damaging the outer surface, with a tube cutter. Do not use pliers, nippers or scissors — they deform the tube, and a diagonal or flattened end can let it pull out or leak.</p><h3>Push to the stop, then pull</h3><p>Hold the tube and push it straight in until it stops, then pull it back gently to confirm it is held. SMC warns that an incompletely inserted tube can leak or come out. Do not press the release button while inserting, or before mounting.</p><h3>Soft tube needs an insert</h3><p>Very soft tube can collapse under the chuck. SMC’s instruction for its TUS soft polyurethane is to fit a TJ inner sleeve into the tube end when using a one-touch fitting — and always to use one in a safety circuit or other critical area.</p><h3>Special tubes</h3><p>Some tubes need preparation before they go in. SMC’s TRB flame-resistant double-layer tube has its insertion length printed on the outer jacket: cut, then strip the jacket back to the mark so only the inner nylon tube enters the fitting. And polyurethane swells under pressure, so SMC cautions that a used polyurethane tube may not re-insert — check that it passes smoothly through the release button.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Releasing a tube.', anchor: 'release' },
    {
      type: 'prose',
      html: '<p>First exhaust the line. SMC’s common precautions require the supply to be shut off and all residual compressed air released before equipment is removed. Then:</p><ol><li>Press the release button flange <strong>evenly and fully</strong> — SMC notes that if the button is not held down enough the tube cannot be withdrawn. Dixon describes the same move as holding two fingers on the insert while pulling the tube out.</li><li>Keep the button held while you pull the tube straight out.</li><li>If a piece of tube is left lodged in the fitting, remove it — SMC warns a lodged piece causes leaks and makes later removal difficult.</li><li>Before re-using the tube, check the end is undamaged and, for polyurethane, that it still passes smoothly through the release button.</li></ol>',
    },

    { type: 'section_head', number: '/04', title: 'Pressure and temperature limits, by maker.', anchor: 'ratings' },
    {
      type: 'prose',
      html: '<p>Push-in fitting ratings depend on the body and seal materials, and makers state them differently. Two rules apply across all of them. Dixon states that maximum circuit pressure depends equally on the type and diameter of the tube used; SMC says to observe the lower of the tube and fitting ratings. A 290 psi fitting on polyurethane tube rated 0.8 MPa (116 psi) at 20 °C is a 116 psi connection — and less when warm.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Push-in fitting limits as published by the maker (fitting only — the tube may be lower)',
      columns: ['Fitting family', 'Pressure', 'Temperature', 'Notes'],
      rows: [
        { cells: ['SMC KQ2 one-touch', '−100 kPa to 1 MPa (10 bar); proof 3 MPa', '−5 to 60 °C; water 0 to 40 °C', 'NBR seal; stainless chuck; R, Rc, M, NPT and UNF threads'] },
        { cells: ['Dixon nylon / nickel-plated brass', '290 psi at ambient; vacuum 28 inHg', '−4 to 175 °F (−23 to 79 °C)', 'Glass-reinforced nylon 6.6 body, nitrile D-seal, polypropylene button'], highlight: true },
        { cells: ['Dixon nickel-plated brass', 'Up to 435 psi; vacuum 28 inHg', '−13 to 302 °F (−25 to 150 °C)', 'FDA compliant, silicone free; fractional and metric'] },
        { cells: ['Dixon stainless steel', '290 psi; vacuum 28 inHg', '−4 to 245 °F (−20 to 118 °C)', 'Materials to FDA and EC 1934/2004'] },
        { cells: ['Dixon brass', 'Up to the tube’s working pressure; vacuum service', '−40 to 212 °F', 'Pre-applied PTFE-based sealant on male threads'] },
        { cells: ['Dixon metric push-in', '290 psi at ambient; vacuum 28 inHg', '−4 to 175 °F', '4 to 10 mm tube; 1/8, 1/4, 3/8 in BSPT; sealant on taper threads'] },
        { cells: ['Dixon D.O.T. push-in', 'Vacuum to 250 psi at ambient', '−40 to 220 °F', 'Air brake: meets DOT FMVSS 571.106, SAE J1131, SAE J2494-3; 5/32 to 1/2 in tube, NPT'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Read the temperature column against the site, not the specification sheet’s ambient. SMC’s KQ2 tops out at 60 °C and Dixon’s nylon-bodied push-ins at 175 °F (79 °C); next to a hot machine or in a sun-heated enclosure on a Gulf site, a metal-bodied fitting and a fluoropolymer or nylon tube give more margin. The D.O.T. family is for vehicle air-brake lines, built to the US standards in the table.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Thread ends: NPT, BSPT and BSPP.', anchor: 'threads' },
    {
      type: 'prose',
      html: '<p>The tube end is push-in; the other end screws into a valve, cylinder or manifold port, and that thread must match the port exactly. The three you will meet:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Pipe threads on push-in fittings',
      columns: ['Thread', 'Standard', 'Form', 'Thread angle', 'Seals on', 'Pitch at 1/4 in'],
      rows: [
        { cells: ['NPT', 'ASME B1.20.1', 'Taper', '60°', 'The thread, with sealant or tape', '18 threads per inch'], highlight: true },
        { cells: ['BSPT (R male, Rc female)', 'ISO 7-1', 'Taper', '55°', 'The thread, with sealant or tape', '19 threads per inch'] },
        { cells: ['BSPP (G)', 'ISO 228-1', 'Parallel', '55°', 'A gasket, bonded seal or O-ring — not the thread', '19 threads per inch'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>NPT and BSPT look alike and are both tapered, but the thread angle differs and so does the pitch in most small sizes (1/8 inch is 27 threads per inch in NPT against 28 in BSP), so forcing one into the other cross-threads and leaks. BSPP is parallel: ISO 228-1 covers threads where the pressure-tight joint is <em>not</em> made on the thread, so a BSPP fitting needs its face seal, and a taper male screwed into a parallel port has nothing to seal against.</p><p>For taper threads, most push-in fittings arrive with sealant already applied: Dixon pre-applies a PTFE-based sealant to all male pipe threads, and SMC offers its fittings with sealant on the thread. SMC’s instruction is to tighten by hand, then a further two or three turns with a spanner on the body hex; over-tightening squeezes the sealant out. If you add tape, SMC says to leave 1.5 to 2 threads bare at the end so shreds of tape cannot enter the line. Our own-label push-to-connect fittings are Tube × NPT; Dixon’s metric push-ins come in BSPT and BSPP.</p>',
    },

    { type: 'section_head', number: '/06', title: 'Exhaust silencers and speed-control mufflers.', anchor: 'silencers' },
    {
      type: 'prose',
      html: '<p>A valve exhausting straight to atmosphere is loud. A silencer — muffler — on the exhaust port breaks the jet up through a porous element. The element is either sintered resin or sintered metal:</p><ul><li><strong>Plastic (sintered resin).</strong> SMC’s compact AN silencers have a resin body and resin sintered element, cut exhaust noise by 30 dB(A), and run at 5 to 60 °C. Tighten by hand, then only a quarter turn on the hex — SMC warns that resin bodies are damaged if over-tightened or gripped with pliers.</li><li><strong>Sintered bronze and copper alloy.</strong> SMC’s BC-element silencers are a nickel-plated copper-alloy sintered body rated 5 to 150 °C, suited to small valves and pilot exhausts. Parker’s EM mufflers use a sintered bronze element. Metal takes heat and knocks; SMC’s instruction is to turn a sintered element in by hand and never put a spanner on the sintered part.</li><li><strong>High noise reduction.</strong> Larger cased silencers do more: SMC’s ANA1 gives 40 dB(A), which SMC says keeps plant noise below 85 dB(A).</li></ul><h3>Back-pressure and cylinder speed</h3><p>Everything a cylinder exhausts goes through the silencer, so the silencer is part of the exhaust flow path. SMC’s selection rule is that the silencer’s sonic conductance C — by SMC’s conversion, its effective area in mm² divided by 5 — must be larger than the valve’s. An undersized silencer, or one blocked with oil, rust and dust, holds back-pressure in the exhausting chamber, and the piston slows. SMC’s maintenance note is direct: if exhaust speed drops and performance falls because of clogging, replace the silencer. SMC adds that a silencer is not a filter. Where the exhaust carries oil mist, SMC recommends an exhaust cleaner, which collects the oil as well as reducing noise — the job of mist-eliminating exhaust silencers such as Wilkerson’s XMC series.</p><h3>Speed-control mufflers</h3><p>Turn the problem into a tool and you have a speed-control muffler: a silencer with an adjustable needle. SMC’s ASN2 metering valve with silencer uses the same needle shape as its speed controllers so that cylinder speed is easily set at the valve exhaust, while cutting noise by over 20 dB at maximum flow. On a 5/2 valve each exhaust port serves one side of the cylinder, so a speed-control muffler on each sets extend and retract speed independently — exhaust-side (meter-out) control, without fittings at the cylinder. Parker’s EM muffler/flow controls do the same, with an adjusting screw that cannot be blown out and can be locked. SMC adds a caution: residual pressure behind the exhaust needle can upset pilot check valves between valve and cylinder, so check the circuit before fitting one. More on speed control in our <a href="/blog/cylinder-speed-control-and-quick-exhaust-valves">speed control guide</a>.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A blocked exhaust can stop a machine — or break the silencer.',
      body: 'SMC warns that a clogged silencer or exhaust cleaner can block the exhaust port, and that the system must be designed so this cannot cause a dangerous malfunction. A cylinder that cannot exhaust may not retract or stop where expected. SMC also warns that continuing to run with a clogged silencer can break it. Inspect silencers on a schedule, replace them when exhaust speed falls, and never plug an exhaust port to quieten a valve.',
    },
    {
      type: 'decision_tree',
      heading: 'Which fitting or silencer?',
      branches: [
        { condition: 'NPT ports (common on American machines)?', outcome: 'Push-in with NPT male thread, in the tube’s own size system — our own-label Tube × NPT range, Dixon or Parker.' },
        { condition: 'Metric tube on BSP ports?', outcome: 'Metric push-in with BSPT (taper, sealant) or BSPP (parallel, face seal) to match the port.' },
        { condition: 'Hot area, washdown or food-adjacent?', outcome: 'Metal body: nickel-plated brass (Dixon to 302 °F) or stainless.' },
        { condition: 'Vehicle air brake line?', outcome: 'D.O.T. push-in fittings to FMVSS 571.106, with air-brake tube.' },
        { condition: 'Valve exhaust too loud?', outcome: 'Silencer with a sonic conductance larger than the valve’s; sintered bronze where it is hot or knocked.' },
        { condition: 'Need to set cylinder speed at the valve?', outcome: 'Speed-control muffler on each exhaust port; check for pilot check valves first.' },
      ],
    },

    { type: 'section_head', number: '/07', title: 'What we list.', anchor: 'listings' },
    {
      type: 'prose',
      html: `<p>Our push-to-connect shelf carries Dixon push-in fittings in brass, nickel-plated brass, nylon/nickel-plated brass, stainless steel, metric BSPP/BSPT and D.O.T. air-brake versions, Parker Prestomatic and PTC fittings, and our own-label Tube × NPT connectors, elbows, tees, unions and plugs. Every listing is below, quoted by maker part number.</p>${stockList(['push-to-connect-pneumatic-fittings'])}<p>The fittings-and-silencers shelf carries Parker EM sintered bronze mufflers and muffler/flow controls, Dixon conical and speed-control mufflers, Gast and Texas Pneumatic Tools mufflers, Wilkerson XMC exhaust silencer mist eliminators, and Transair fittings:</p>${stockList(['pneumatic-fittings-silencers'])}`,
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do push-to-connect air fittings work?', answer: 'A ring of stainless teeth grips the tube so it slides in but bites if pulled, and an elastomer seal seals on the tube’s outside diameter. Pressing the release button pushes a collet against the teeth and lets the tube out.' },
        { question: 'How do you remove tubing from a push-in fitting?', answer: 'Exhaust the line first. Press the release button flange evenly and fully, hold it, and pull the tube straight out. Remove any piece of tube left lodged in the fitting.' },
        { question: 'Why is my push-in fitting leaking?', answer: 'Usually a tube cut at an angle or crushed by pliers, a tube not pushed fully home, a scored tube surface, or a tube of the wrong OD — 6 mm in a 1/4 inch fitting, for example. Recut square with a tube cutter and check the size.' },
        { question: 'What pressure are push-to-connect fittings rated for?', answer: 'It depends on the maker and material: SMC rates its KQ2 at 1 MPa (10 bar); Dixon gives 290 psi for nylon/nickel-plated brass and up to 435 psi for nickel-plated brass. The tube’s rating at temperature is often lower, and the lower figure applies.' },
        { question: 'Are NPT and BSPT threads interchangeable?', answer: 'No. NPT has a 60° thread angle and BSPT 55°, and most small sizes have different pitches. Both are taper threads that seal on the thread; BSPP is parallel and seals on a gasket or O-ring.' },
        { question: 'Does a muffler slow down a pneumatic cylinder?', answer: 'It can. An undersized or clogged silencer holds back-pressure in the exhausting side of the cylinder and slows it. SMC says the silencer must flow more than the valve and should be replaced when exhaust speed drops.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Fittings and silencers',
      skus: [
        'IH-PN-PC',
        'IH-PN-PL',
        'IH-DIX-NYLON-NICKEL-PLATED-BRASS-PUSH-IN-MALE-CONNECTORS',
        'IH-DIX-METRIC-PUSH-IN-MALE-BSPT-ELBOWS',
        'IH-DIX-D-O-T-PUSH-IN-MALE-CONNECTORS',
        'IH-PAR-EM-SINTERED-BRONZE-MUFFLERS',
        'IH-DIX-SPEED-CONTROL-MUFFLERS',
        'IH-WLK-XMC-SERIES-EXHAUST-SILENCER-MIST-ELIMINATORS',
      ],
    },
    { type: 'category_link', slug: 'push-to-connect-pneumatic-fittings', label: 'Push-to-connect fittings', blurb: 'Push-in connectors, elbows, tees, unions and plugs, inch and metric, NPT and BSP.' },
    { type: 'category_link', slug: 'pneumatic-fittings-silencers', label: 'Fittings & silencers', blurb: 'Sintered bronze and plastic mufflers, speed-control mufflers and exhaust mist eliminators.' },
    { type: 'category_link', slug: 'pneumatic-tubing', label: 'Pneumatic tubing', blurb: 'Nylon, polyurethane, polyolefin and fluoropolymer tube to match.' },
    {
      type: 'related_articles',
      slugs: [
        'pneumatic-tubing-materials-guide',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'sizing-pneumatic-valves-flow-cv',
        'solenoid-valve-functions-3-2-5-2-5-3',
        'frl-filter-regulator-lubricator-guide',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Fitting construction, installation and limits from SMC KQ2 literature and the Dixon push-in fittings data sheet (2023); silencer data from SMC AN/ASN2 catalogues and Parker EM series data; thread forms per ASME B1.20.1, ISO 7-1 and ISO 228-1.',
    },
    {
      type: 'cta_block',
      heading: 'Matching fittings to tube and ports?',
      body: 'Send the tube OD (inch or metric), the port thread, the pressure and temperature, and the valve model for any silencers. We will quote push-in fittings, silencers and speed-control mufflers by maker part number.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
