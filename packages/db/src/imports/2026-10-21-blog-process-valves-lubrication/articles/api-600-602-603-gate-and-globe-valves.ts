import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * API 600, 602, 603 and 623 gate and globe valves, BS 1873, ASME B16.34, bonnet types, wedge types, API 6D pipeline gates.
 * Sources read 2026-10-21:
 * - normdocs catalogue, API Std 600:2015 (13th ed.) abstract: heavy-duty bolted bonnet steel gate valves for refinery and
 *   related service; OS&Y, rising stem, non-rising handwheel, single or double gate, wedge or parallel seating, metallic
 *   seats, flanged or butt-welding ends; NPS 1 to 42; Classes 150 to 2500; superseded by the 2021 edition.
 * - normservis, API Std 602 11th ed. (2022) abstract, and normdocs API Std 602:2009 abstract: compact steel gate, globe and
 *   check valves; DN 8 to 100 (NPS 1/4 to 4); Classes 150, 300, 600, 800, 1500; Class 800 an intermediate class for
 *   socket-weld and threaded ends; flanged/butt-weld NPS 1/2 to 4 (no flanged 800); SW/threaded to NPS 2 1/2 in 800 and
 *   1500; bonnet joints bolted, welded, threaded with seal weld, union nut to 800; bellows stem seal NPS 1/4 to 2;
 *   extended body NPS 1/2 to 2; ASME B16.5 / B1.20.1 / B16.11 ends.
 * - online.standard.no, API Std 603 (6th ed. 2007 and 2018 abstracts): corrosion-resistant bolted bonnet gate valves,
 *   Standard Class ASME B16.34, full port, NPS 1/2 to 24, Classes 150, 300, 600, flanged or butt-welding, OS&Y.
 * - online.standard.no, API Std 623 (Jan 2021 abstract): heavy-duty bolted bonnet steel globe valves, OS&Y, conventional,
 *   Y-pattern and right-angle, flanged or butt-welding ends, NPS 2 to 24, Classes 150 to 2500.
 * - BSI Knowledge, BS 1873:1975: current; OS&Y globe and globe stop and check valves, straight, angle and oblique patterns,
 *   cast or forged carbon and alloy steel, 15 mm to 400 mm, Classes 150 to 2500, flanged or butt-welding ends.
 * - ASME, B16.34 page: scope (ratings, dimensions, tolerances, materials, NDE, testing, marking; cast, forged, fabricated).
 * - US DOE Fundamentals Handbook DOE-HDBK-1018/2-93, Mechanical Science Vol. 2, Valves: gate valves not for throttling
 *   (flow change near shutoff, vibration, seat wear); solid, flexible, split wedge and parallel disk; flexible wedge in
 *   steam to prevent binding; split wedge for non-condensing gas and liquid at normal temperature; parallel disk sealed by
 *   upstream pressure with springs at no pressure; globe throttling; Z, Y and angle bodies; backseat.
 * - Spirax Sarco, Isolation valves — linear movement: parallel slide the most common steam gate; globe higher pressure
 *   drop; bellows "zero emissions" seal; packing stiffens after long idle periods.
 * - US patent 2,810,494 (pressure seal for high-pressure gate valves): bonnet inside the neck, studs give initial load,
 *   line pressure tightens the gasket, segmented thrust ring.
 * - Flowserve Valbart TCSGV page: slab gate, floating gate and spring-energized seats, piggable, API 6D, DBB, cavity relief.
 * - Puffer SCV through-conduit gate page: expanding mechanical gate, full port for pigs, API 6D, B16.10 / B16.25 / B16.47.
 * Added 2026-10-21 (power-plant and nuclear section, shelf power-nuclear-valves):
 * - Valve Magazine, "The proposed MSS standard for standard class castings" (2012): B16.34 sets specific NDE that a
 *   casting must meet to be Special Class; Standard Class castings need only visual examination and no leak on hydrotest.
 * - Valve Magazine, "Misconceptions regarding control and isolation valve standards": Special Class allows extended
 *   pressure-temperature ratings after NDE (radiographic, volumetric and surface, ultrasonic); Limited Class (B16.34
 *   Appendix V) extends ratings above 900 °F.
 * - Emerson B16.34 ratings bulletin (2017): a valve used under the BPVC, the B31 codes or regulations is subject to that
 *   code's limits.
 * - Industrial Monitor Direct, "ASME Section I boiler piping to first valve": piping from boiler to first valve is part of
 *   the boiler, designed to the boiler's pressure/temperature; B31.1 beyond the first valve.
 * - ASME nuclear component certification page: Section III title; N certificate covers vessels, pumps, valves, piping
 *   systems; NV pressure relief valves; certificate follows a survey of the QA programme; Code stamp.
 * - HSB / INL NRIC slides, ASME Nuclear Certification Overview (Dec 2024): certificate granted for 3 years, for a
 *   specific shop or field location and scope; allows Code stamp and certifying data reports for completed items.
 * - AFNOR record, ASME BPVC Section III Div. 1 Subsection NB, Class 1 Components: scope covers material, design,
 *   fabrication, examination, testing and overpressure protection for Class 1 construction.
 * NOT used: class thresholds for pressure-seal bonnets (no standard read); API 600 vs 603 wall-thickness figures (blog
 * only); API 6D scope text (only a scanned copy, not readable); ISO 15848 classes; API 6D test pressures; B16.34
 * Special Class end-connection limits and NDE acceptance levels (forum only); the exact Section I valve count on
 * multi-boiler headers and blowoff lines (sources disagree); NRC Quality Group A/B/C mapping and RG 1.26 (NRC
 * documents not readable); whether Class 2/3 now sit in a combined Subsection NCD (retailer listing only); NQA-1.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'api-600-602-603-gate-and-globe-valves',
  title: 'API 600, 602, 603 and 623 gate and globe valves: which standard covers which valve',
  excerpt:
    'A refinery gate valve is bought to API 600, a small-bore forged one to API 602, a thin-wall stainless one to API 603, and a globe valve to API 623 or BS 1873, all rated by ASME B16.34. What each standard covers in size, class and construction, when a bolted bonnet gives way to a pressure seal or a bellows, how solid, flexible, split and parallel gates differ, and where an API 6D slab or expanding gate fits instead.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'API 600, 602, 603 and 623 Gate and Globe Valves Explained',
  seoDescription:
    'What API 600, 602, 603, 623 and BS 1873 each cover in size and class, gate vs globe, bonnet and wedge types, and API 6D pipeline gate valves.',
  focusKeyword: 'API 600 gate valve',
  publishedAt: '2026-10-22T01:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'API 600: heavy-duty bolted bonnet steel gate valves, NPS 1 to 42, Class 150 to 2500. API 603: corrosion-resistant gate valves, NPS ½ to 24, Class 150 to 600.',
        'API 602 covers compact gate, globe and check valves up to NPS 4, in Classes 150 to 1500 plus the intermediate Class 800 used for socket-weld and threaded ends.',
        'Globe valves are bought to API 623 (NPS 2 to 24) or BS 1873 (15 to 400 mm), both Class 150 to 2500; ASME B16.34 sets the pressure-temperature rating behind all of them.',
        'A gate valve isolates; it is not used to throttle. A globe valve throttles and shuts off, at the cost of a higher pressure drop.',
        'Parallel-disc gates do not bind when the line cools, which is why they are common on steam; bellows seals remove the stem leak path.',
        'Pipelines that are pigged use API 6D through-conduit slab or expanding gate valves, not API 600 wedge gates.',
      ],
    },
    {
      type: 'lead',
      html: 'Most plant data sheets call up a gate or globe valve by a standard number before anything else: API 600, API 602, API 603, API 623, BS 1873. Each one covers a defined range of sizes, classes and constructions, and a valve outside that range can be built to ASME B16.34 but is not a valve to that standard. This guide sets out what each standard covers, how bonnets and gates differ, and what to send when you ask for a quote.',
    },

    { type: 'section_head', number: '/01', title: 'The standards side by side.', anchor: 'standards' },
    {
      type: 'comparison_table',
      caption: 'Scope of the common gate and globe valve standards, as published in their abstracts',
      columns: ['Standard', 'Covers', 'Sizes', 'Classes'],
      rows: [
        { cells: ['API 600', 'Heavy-duty bolted bonnet steel gate valves, flanged or butt-weld, for refinery and related service', 'NPS 1 to 42', '150 to 2500'], highlight: true },
        { cells: ['API 602', 'Compact steel gate, globe and check valves', 'NPS ¼ to 4', '150, 300, 600, 800, 1500'] },
        { cells: ['API 603', 'Corrosion-resistant bolted bonnet gate valves, full port, flanged or butt-weld', 'NPS ½ to 24', '150, 300, 600'] },
        { cells: ['API 623', 'Heavy-duty bolted bonnet steel globe valves: conventional, Y-pattern and angle', 'NPS 2 to 24', '150 to 2500'] },
        { cells: ['BS 1873', 'Carbon and alloy steel globe and globe stop and check valves: straight, angle and oblique', '15 to 400 mm', '150 to 2500'] },
        { cells: ['ASME B16.34', 'Pressure-temperature ratings, wall, materials, NDE, testing and marking for steel and alloy valves', 'All', 'Ratings for every class'] },
      ],
    },
    {
      type: 'prose',
      html: '<p><strong>API 600</strong> is the refinery gate valve: a cast steel body, bolted bonnet, outside screw and yoke with a rising stem and non-rising handwheel, a single or double gate with wedge or parallel seating, and metal seats. The standard describes it as heavy-duty, for service where corrosion and erosion call for extra metal. Our <a href="/p/cast-steel-gate-valve-api-600">cast steel gate valve, API 600</a> is this valve.</p><p><strong>API 603</strong> covers the same OS&amp;Y bolted bonnet gate valve in corrosion-resistant alloys, built to the Standard Class wall of ASME B16.34 rather than the heavier API 600 body, from NPS ½ to 24 and only to Class 600. It is a gate valve standard; stainless globe and check valves supplied alongside an API 603 gate are built to ASME B16.34. See the <a href="/p/api-603-stainless-steel-gate-globe-check-valves">API 603 stainless steel valves</a>.</p><p><strong>API 602</strong> is the compact forged valve for small bore: gate, globe and check, NPS ¼ to 4. Socket-weld (to ASME B16.11) and threaded ends run to NPS 2½ in Class 800 and 1500; flanged and butt-weld ends run from NPS ½ to 4 in Classes 150 to 1500. Class 800 is not a listed B16.34 class but an intermediate rating widely used for socket-weld and threaded compact valves. The standard also covers welded, bolted and seal-welded threaded bonnets, extended-body valves, and bellows stem seals up to NPS 2. Forged valves above Class 1500, or above NPS 4, are built to ASME B16.34 rather than API 602. See the <a href="/p/forged-steel-gate-valve-api-602">forged steel gate valve</a> and <a href="/p/forged-steel-globe-valve-api-602">forged steel globe valve</a>.</p><p><strong>Globe valves</strong> are bought to <strong>API 623</strong>, a heavy-duty bolted bonnet steel globe valve from NPS 2 to 24, or to <strong>BS 1873</strong>, which covers cast or forged carbon and alloy steel globe and globe stop-and-check valves from 15 to 400 mm. Both run from Class 150 to 2500. Our <a href="/p/cast-steel-globe-valve-bs-1873">cast steel globe valve, BS 1873</a> is in this group.</p><p><strong>ASME B16.34</strong> sits behind all of them. It sets the pressure-temperature ratings, dimensions, tolerances, materials, non-destructive examination, testing and marking for cast, forged and fabricated steel and nickel-alloy valves. For what a class number means in bar at temperature, see <a href="/blog/ball-valve-pressure-ratings-cwp-wog">ball valve pressure ratings</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Gate or globe: isolation or throttling.', anchor: 'gate-vs-globe' },
    {
      type: 'prose',
      html: '<p>A gate valve is for isolation. When it is fully open the gate is out of the flow path and the pressure drop is small; when it is closed the gate seals all the way round the seat. It is not used to regulate flow: most of the change in flow happens close to shut-off, at high velocity, so a part-open gate vibrates and its seat and disc wear until the valve leaks.</p><p>A globe valve moves the disc straight onto and off the seat, so the gap closes gradually and the valve throttles well as well as shutting off. The flow has to change direction through the body, so the pressure drop is higher than through a gate. Three body shapes deal with that differently:</p><ul><li><strong>T or Z body:</strong> the usual straight pattern, simple to make and repair.</li><li><strong>Y pattern:</strong> seat and stem at about 45°, a straighter flow path and lower loss; suited to high pressure and other severe service.</li><li><strong>Angle:</strong> ends at 90°, one turn of the flow, and the valve doubles as an elbow.</li></ul><p>Plug discs throttle better than ball or composition discs. Many globe valves also have a backseat: fully open, the disc seats against the bonnet and keeps line pressure off the packing so it can be renewed. For small instrument and bleed valves, see <a href="/blog/needle-globe-and-instrumentation-valves">needle, globe and instrumentation valves</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Bonnets: bolted, pressure seal, bellows.', anchor: 'bonnets' },
    {
      type: 'prose',
      html: '<p><strong>Bolted bonnet.</strong> The bonnet is bolted to a flange on the body over a gasket. It is the construction API 600, 603 and 623 are written around, and the easiest to take apart.</p><p><strong>Pressure seal.</strong> The bonnet sits inside the body neck. Studs pull it up against a metal gasket for the first seal; after that, line pressure pushes the bonnet outward and drives the gasket harder into its seat, so the joint tightens as pressure rises. A segmented thrust ring in a groove in the neck takes the load. It was developed for high-pressure gate valves, and the confined gasket also copes with distortion of the neck under sharp temperature changes. See the <a href="/p/pressure-seal-gate-globe-check-valves">pressure seal gate, globe and check valves</a> and the <a href="/p/forged-pressure-seal-valve">forged pressure seal valves</a> for small bore.</p><p><strong>Bellows seal.</strong> A metal bellows is welded to the stem at one end and the bonnet at the other, so there is no sliding seal for the fluid to escape through; a packing gland above it is the back-up. It is chosen where the stem must not leak at all: toxic or costly media and plants with strict emission limits. A packed gland, by contrast, can stiffen when a valve sits unused for a long time and leak the next time it is operated. See the <a href="/p/bellows-seal-gate-globe-valve">bellows seal valves</a> and, up to NPS 2, the <a href="/p/forged-bellows-seal-gate-globe-valve">forged bellows seal valves</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Wedges, parallel slides and pipeline gates.', anchor: 'gates' },
    {
      type: 'comparison_table',
      caption: 'Gate types and where each is used',
      columns: ['Gate', 'How it seals', 'Where it is used'],
      rows: [
        { cells: ['Solid wedge', 'One-piece wedge between inclined seats; simple and strong', 'General service; can bind if the body cools and closes on it'] },
        { cells: ['Flexible wedge', 'One-piece wedge cut round the edge so it flexes to the seats', 'Steam and hot service, where a solid wedge could be clamped shut'], highlight: true },
        { cells: ['Split wedge', 'Two halves that self-align to each seat', 'Non-condensing gases and liquids at normal temperatures'] },
        { cells: ['Parallel slide', 'Two parallel discs held apart by a spring; line pressure pushes the downstream disc onto its seat', 'High-pressure steam and boiler service; does not bind on cooling'] },
        { cells: ['Through-conduit slab (API 6D)', 'One-piece slab with a full bore; floating gate and spring-energized seats', 'Oil and gas pipelines that are pigged'] },
        { cells: ['Expanding gate (API 6D)', 'Gate and segment expand onto both seats at end of travel; mechanical seal', 'Pipelines and isolation needing a positive seal on both seats'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Hot lines are where gate choice matters. When a steam line heats up and the body distorts, a solid wedge that fitted snugly when cold can be clamped between the seats and refuse to open. A flexible wedge gives a little; a <a href="/p/parallel-slide-gate-valve">parallel slide gate</a> avoids the problem, because its discs are not wedged in at all. The parallel slide is the most common gate valve in steam. Some parallel-disc valves seal on one side only and carry a flow arrow; they must not be fitted backwards.</p><p>A pipeline that is pigged needs a valve whose open bore matches the pipe and leaves no cavity, which a wedge gate does not give. That is the job of the API 6D <a href="/p/through-conduit-slab-gate-valve-api-6d">through-conduit slab gate</a>, with its full-bore slab, and the <a href="/p/expanding-gate-valve-api-6d">expanding gate</a>, whose gate and segment spread onto both seats to seal. Slab gates are offered with cavity relief and double block and bleed. Where a forged body is required above the API 602 range, see the <a href="/p/large-size-forged-valve">large size forged valves</a>.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Power-plant and nuclear valves.', anchor: 'power-nuclear' },
    {
      type: 'prose',
      html: '<h3>Steam and feedwater: B16.34 Special Class</h3><p>Main steam, reheat, feedwater and extraction valves are the same gate, globe and check types described above, built for higher pressure and temperature: butt-weld ends, alloy-steel bodies, and parallel or flexible gates that do not bind as the line heats and cools. They are still rated to ASME B16.34, but a data sheet may ask for <strong>Special Class</strong> rather than Standard Class. A Standard Class casting only has to pass a visual examination and the hydrostatic test. A Special Class valve has had the extra non-destructive examination the standard sets out, such as radiographic, ultrasonic and surface examination,, and in return it is allowed higher pressure-temperature ratings in the same class. B16.34 also defines a <strong>Limited Class</strong>, which extends ratings above 900 °F (482 °C). If the data sheet says Special Class, the NDE records are part of the order. See the <a href="/p/power-plant-high-pressure-gate-globe-check-valves">power plant high-pressure gate, globe and extraction check valves</a>, and for cooling water and auxiliary lines the <a href="/p/power-plant-butterfly-and-ball-valves">power plant butterfly and ball valves</a>.</p><h3>Boiler valves: ASME Section I</h3><p>A valve used under the ASME Boiler and Pressure Vessel Code or the B31 piping codes is also bound by any limits that code sets, on top of its B16.34 rating. On a boiler, the piping up to the first stop valve is treated as part of the boiler under ASME Section I and is designed for the boiler’s own pressure and temperature. Piping beyond that valve is generally built to ASME B31.1. Section I sets exactly where the boundary falls on each line; confirm it with the plant’s inspector, and say on the enquiry which valves sit inside it.</p><h3>Nuclear valves: ASME Section III</h3><p>Nuclear plant valves are built to Section III of the Code, Rules for Construction of Nuclear Facility Components. Section III puts each component in a class. Class 1 rules are in Subsection NB, which covers material, design, fabrication, examination, testing and overpressure protection; Class 2 and Class 3 components have their own rules. The plant’s design documents state the class of each valve.</p><p>Section III items come from holders of an ASME nuclear certificate. The N certificate covers vessels, pumps, valves and piping systems; NV covers pressure relief valves. ASME grants it after surveying the holder’s quality assurance programme, for three years, for a named shop and a stated scope. It lets the holder apply the Code stamp, the “N stamp”, and certify the data report for each finished item. Ask for the certificate scope and the data report with the valve, and list any seismic or other qualification the project requires. See the <a href="/p/nuclear-gate-globe-check-valves">nuclear gate, globe and check valves</a> and <a href="/p/nuclear-ball-butterfly-valves">nuclear ball and butterfly valves</a>.</p>',
    },

    { type: 'section_head', number: '/06', title: 'What to send for a quote.', anchor: 'rfq' },
    {
      type: 'prose',
      html: '<ul><li><strong>Valve type and standard:</strong> gate or globe; API 600, 602, 603, 623 or BS 1873, or ASME B16.34 where the size or class is outside them.</li><li><strong>Size and class:</strong> NPS and ASME class, or Class 800 for compact socket-weld or threaded valves.</li><li><strong>Body and trim:</strong> body material (for example A216 WCB, A105, CF8M) and the trim number or seat facing.</li><li><strong>Ends:</strong> RF or RTJ flange, butt-weld with pipe schedule, socket-weld or NPT.</li><li><strong>Bonnet and gate:</strong> bolted, pressure seal or bellows; solid, flexible or parallel gate; globe pattern.</li><li><strong>Operator:</strong> handwheel, gear or actuator, with the maximum differential pressure for sizing.</li><li><strong>Service and tests:</strong> fluid, temperature, sour service, low-emission packing, and any third-party inspection.</li></ul>',
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between API 600 and API 603?', answer: 'API 600 covers heavy-duty bolted bonnet steel gate valves from NPS 1 to 42 and Class 150 to 2500. API 603 covers corrosion-resistant gate valves to the Standard Class wall of ASME B16.34, NPS ½ to 24 and Class 150 to 600.' },
        { question: 'Does API 602 cover Class 2500?', answer: 'No. API 602 lists Classes 150, 300, 600 and 1500 plus the intermediate Class 800. A forged Class 2500 valve is built to ASME B16.34.' },
        { question: 'Can a gate valve be used to throttle?', answer: 'No. Most flow change happens near shut-off at high velocity, so a part-open gate vibrates and its seat and disc wear. Use a globe valve to regulate flow.' },
        { question: 'Which standard covers steel globe valves?', answer: 'API 623 (NPS 2 to 24) and BS 1873 (15 to 400 mm), both Class 150 to 2500; small forged globe valves are covered by API 602.' },
        { question: 'Why are parallel slide gate valves used on steam?', answer: 'Their discs are held apart by a spring and sealed by line pressure rather than wedged in, so they do not bind when the line heats and cools.' },
        { question: 'What gate valve is used on a pigged pipeline?', answer: 'An API 6D through-conduit slab or expanding gate valve, whose open bore matches the pipe so pigs pass straight through.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Gate and globe valves, and power-plant and nuclear valves:</p>' + stockList(['industrial-gate-valves', 'industrial-globe-valves', 'power-nuclear-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Gate and globe valves',
      skus: ['IH-PV-GTC', 'IH-PV-FGV', 'IH-PV-SSV', 'IH-PV-GLC', 'IH-PV-FGL', 'IH-PV-PSV', 'IH-PV-BSC', 'IH-PV-TCG'],
    },
    { type: 'category_link', slug: 'industrial-gate-valves', label: 'Industrial gate valves', blurb: 'API 600, 602, 603 and API 6D gate valves.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'Refinery, plant and pipeline valves.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'api-600', text: 'API Std 600:2015, Steel Gate Valves — Flanged and Butt-welding Ends, Bolted Bonnets, 13th ed. Abstract (normdocs catalogue).', url: 'https://catalogue.normdocs.ru/catalog/ALSFR-4fbb7676-c43e-418f-964a-4832868cd9d0/Standard-API-Std-600-2015' },
        { id: 'api-602', text: 'API Std 602, 11th ed. (2022), Gate, Globe, and Check Valves for Sizes DN 100 (NPS 4) and Smaller. Abstract (Normservis).', url: 'https://eshop.normservis.sk/norma/apistd-602-ed-11-1.5.2022.html' },
        { id: 'api-603', text: 'API Std 603, Corrosion-resistant, Bolted Bonnet Gate Valves — Flanged and Butt-welding Ends. Abstract (Standard Norge).', url: 'https://online.standard.no/en/api-std-603-11' },
        { id: 'api-623', text: 'API Std 623, Steel Globe Valves — Flanged and Butt-welding Ends, Bolted Bonnets. Abstract (Standard Norge).', url: 'https://online.standard.no/en/api-std-623-4' },
        { id: 'bs-1873', text: 'BSI. BS 1873:1975, Steel globe and globe stop and check valves (flanged and butt-welding ends).', url: 'https://knowledge.bsigroup.com/products/specification-for-steel-globe-and-globe-stop-and-check-valves-flanged-and-butt-welding-ends-for-the-petroleum-petrochemical-and-allied-industries' },
        { id: 'asme-b16-34', text: 'ASME. B16.34, Valves — Flanged, Threaded, and Welding End.', url: 'https://www.asme.org/codes-standards/find-codes-standards/b16-34-valves-flanged-threaded-welding-end' },
        { id: 'doe-1018', text: 'US Department of Energy. DOE Fundamentals Handbook, Mechanical Science, Vol. 2 (DOE-HDBK-1018/2-93), Module 4: Valves.', url: 'https://pdhonline.com/courses/m139/Mechanical%20Science%20Vol%202.pdf' },
        { id: 'spirax', text: 'Spirax Sarco. Isolation valves — linear movement.', url: 'https://www.spiraxsarco.com/learn-about-steam/pipeline-ancillaries/isolation-valves---linear-movement?sc_lang=en-GB' },
        { id: 'us2810494', text: 'US Patent 2,810,494, Pressure seal (high-pressure gate valve bonnet joint).', url: 'https://patents.google.com/patent/US2810494A/en' },
        { id: 'valbart', text: 'Flowserve. Valbart TCSGV through-conduit slab gate valve.', url: 'https://www.flowserve.com/products/products-catalog/valves/gate-valves/slab-gate-valves-valbart-tcsgv-through-conduit-slab-gate-valve/' },
        { id: 'vm-castings', text: 'Valve Magazine. “The proposed MSS standard for standard class castings” (2012).', url: 'https://valvemagazine.com/articles/the-proposed-mss-standard-for-standard-class-castings/' },
        { id: 'vm-misconceptions', text: 'Valve Magazine. “Misconceptions regarding control and isolation valve standards.”', url: 'https://www.valvemagazine.com/articles/misconceptions-regarding-control-and-isolation-valve-standards' },
        { id: 'emerson-b16-34', text: 'Emerson. Pressure/temperature ratings, ASME B16.34 valves (bulletin, 2017).', url: 'https://emerson.com/documents/automation/bulletin-pressure-temperature-ratings-asme-16-34-hancock-en-en-5198154.pdf' },
        { id: 'imd-section-i', text: 'Industrial Monitor Direct. ASME Section I boiler piping to first valve requirements.', url: 'https://industrialmonitordirect.com/blogs/knowledgebase/asme-section-i-boiler-piping-to-first-valve-requirements' },
        { id: 'asme-nuclear', text: 'ASME. Nuclear component certification (certificate types and scopes).', url: 'https://www.asme.org/certification-accreditation/nuclear-component-certification' },
        { id: 'hsb-nuclear', text: 'Lockwood, M. (HSB). ASME Nuclear Certification Overview, December 2024 (INL NRIC).', url: 'https://nric.inl.gov/content/uploads/34/2024/12/ASME-Certification-and-Accreditation.pdf' },
        { id: 'asme-iii-nb', text: 'ASME BPVC Section III, Division 1, Subsection NB, Class 1 Components (catalogue record, AFNOR).', url: 'https://www.boutique.afnor.org/en-gb/standard/asme-bpvc-2023-section-iii-division-1-subsection-nb/section-iii-rules-for-construction-of-nuclear-facility-components-division-/as714/352337' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['needle-globe-and-instrumentation-valves', 'ball-valve-pressure-ratings-cwp-wog', 'lubricated-vs-non-lubricated-plug-valves', 'oilfield-check-valves-explained', 'industrial-check-valve-types', 'floating-vs-trunnion-mounted-ball-valves'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Scopes from the published abstracts of API 600 (2015), 602 (2022), 603, 623 (2021) and BS 1873:1975; gate and globe behaviour from DOE and Spirax Sarco; B16.34 Special Class from Valve Magazine; Section III certificates from ASME.',
    },
    {
      type: 'cta_block',
      heading: 'Need gate or globe valves to a data sheet?',
      body: 'Send the standard, size and class, body and trim material, end connections, bonnet and operator, and the service. We will check the data sheet against the standard and quote.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
