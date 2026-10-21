import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Waterworks valves: resilient- vs metal-seated gate valves, check valves and slam on pump stations, butterfly valves,
 * air valves on a main, coatings and drinking-water approvals.
 * Sources read 2026-10-21:
 * - Valve Magazine, "Which gate valve is best for today's waterworks systems?" (2023): C500 metal-seated gate valves,
 *   standard developed 1913, C500 designation 1953; C500 valves allow leakage that worsens over time and need more
 *   torque; C509 (1980) introduced resilient seats with no leakage allowance; C509 walls carried over from C500;
 *   C515 (1999) requires ductile iron body and bonnet, walls by finite element analysis, no 12.5 % wall-reduction
 *   allowance (C500/C509 have one); most utilities now specify C515; one-piece rubber-encapsulated leak-tight wedge,
 *   lower torque; C509 and C515 castings typically fusion-bonded epoxy coated, C500 valves were not.
 * - AWWA C515 (Mar 2021) scope via Standard Norge listing: NRS 3–54 in., OS&Y 3–16 in.; minimum design working
 *   pressure 200 psig all sizes; up to 16 ft/s full open; 33–125 °F.
 * - AWWA C500 (1999 revision) scope via Standard Norge listing: iron-body bronze-mounted NRS 3–48 in., OS&Y 3–12 in.;
 *   double disc (parallel or inclined seats) or solid wedge; 200 psig to 12 in., 150 psig 16 in. and up; approximately
 *   level installation; excludes vertical lines, corrosive water, excessive water hammer, frequent operation and
 *   throttling.
 * - EN 1074-2:2000 and EN 1074-3:2000 and EN 1074-4:2000 scopes via EVS (minimum fitness-for-purpose requirements for
 *   isolating, check and air valves in or connected to water supply systems above or below ground, see EN 805,
 *   carrying water for human consumption; isolating valves whatever their type and materials).
 * - EN 1171:2015 (STN edition preview, scope clause): cast iron gate valves, flanged, socket or spigot ends, mainly
 *   industrial and general-purpose, usable elsewhere if the relevant performance standards are met; DN 40–DN 1000;
 *   PN 6, 10, 16, 25.
 * - BS 5163-1:2004 abstract via SFS: code of practice for selecting key-operated flanged cast iron gate valves complying
 *   with BS EN 1074-1 and -2, mainly for underground waterworks use in the UK.
 * - AWWA C508 (June 2017 revision) scope via Standard Norge: iron-body nonassisted swing checks 2–24 in., MJ or
 *   flanged, approximately level; 200 psig 2–12 in., 150 psig 14–24 in.; max 125 °F; newer July 2025 edition 2–48 in.
 * - J. V. Ballun, "Company Examines Slam Characteristics of Check Valves", Water Technology Online, 2003: dual disc,
 *   spring-assisted silent checks best; angled-seat short-stroke flexible-disc and tilted disc next; ball and swing
 *   highest slam potential; under 20 ft/s² single low-head pump, up to 40 ft/s² multi-pump high-head; 1 ft/s reverse
 *   velocity ≈ 100 ft (43 psi); 0.5–1.0 ft/s mild; heavier springs or dashpots for severe slam; vertical pipe effects.
 * - AWWA C504-23 scope via Nimonik: rubber-seated butterfly 3–72 in.; wafer Class 150B 3–20 in.; short- and long-body
 *   flanged; MJ ends; pH 6–12; 33–125 °F; 250 psig working and differential; 16 ft/s.
 * - EN 593:2017 abstract via NSAI shop: metallic butterfly valves, wafer, lug, flange, butt-weld; isolating, regulating
 *   or control; DN 20–DN 4000; PN 2.5–160; Class 150–900.
 * - AWWA notice on C512 (metallic body and cover): air-release ½–6 in.; air/vacuum and combination ½–20 in.; gray
 *   iron, ductile iron, carbon steel or stainless bodies; to 300 psig; above freezing to 125 °F; pH 6–12; water or
 *   wastewater.
 * - Uni-Bell PVC Pipe Association technical brief, "Air valves: improving the performance of pressure pipelines"
 *   (2013, citing AWWA M51): at least 2 % dissolved air; air pockets cut flow area and magnify surge; three valve
 *   types and their other names; placement at high points, abrupt increases in downslope / decreases in upslope, long
 *   ascents and descents, start and end of long horizontal runs; small distribution lines may not need them; sizing
 *   per M51, check assumptions with the maker.
 * - Valve Magazine, "Interior coatings for waterworks valves": AWWA C550 covers water, wastewater and reclaimed water
 *   pH 4–9; FBE powder sprayed electrostatically on preheated parts then post-cured, no solvents; minimum 6 mils gate
 *   valves, 8 mils quarter-turn; specs often 8–16 mils; NSF 61 measures leaching, not impact, adhesion or corrosion;
 *   specifying alternate coatings invalidates a valve's NSF 61 certification.
 * - WRAS, "What is a WRAS Material Approval?": non-metallic materials (rubber, O-rings) tested for effects on water
 *   quality to BS 6920; fittings on the public supply must comply with the Water Supply (Water Fittings) Regulations
 *   1999 (England and Wales) or Scottish Byelaws.
 * NOT used: EN 12334 and BS 5153 scopes (not read); AWWA C509 current size range; AWWA C518 or any dual-disc water
 * standard; rag-handling claims for ball checks; head-loss figures for any type; strainer mesh guidance; seawater
 * material selection for desalination; air valve spacing intervals (only a secondary summary seen).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'waterworks-valves-guide',
  title: 'Waterworks valves: gate, check, butterfly and air valves for water, wastewater and desalination',
  excerpt:
    'Ductile iron valves for mains, pump stations and treatment works: resilient-seated against metal-seated gate valves, which check valve slams and which does not, concentric and double eccentric butterfly valves, and where air release, air/vacuum and combination air valves go on a main. What AWWA C500, C515, C508, C504, C512, EN 1074 and EN 1171 actually cover, and what epoxy coatings and drinking-water approvals mean.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Waterworks Valves: Gate, Check, Butterfly and Air Valves',
  seoDescription:
    'Resilient vs metal-seated gate valves, check valve slam, butterfly and air valves for water mains: AWWA C515, C508, C504, C512, EN 1074, epoxy and NSF 61.',
  focusKeyword: 'waterworks valves',
  publishedAt: '2026-10-22T02:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Resilient-seated gate valves (AWWA C509, C515) have no leakage allowance; metal-seated C500 valves allow leakage and need more torque. Most utilities now specify C515.',
        'EN 1074 is the European standard for valves on drinking-water supply. EN 1171 covers cast iron gate valves mainly for industrial and general-purpose use, DN 40 to 1000.',
        'On pump stations, long-stroke swing and ball checks have the most slam potential; spring-assisted dual disc and silent checks the least. High-head, multi-pump stations decelerate fastest.',
        'Air release valves vent small pockets under pressure; air/vacuum valves move large volumes on filling and draining; combination (double orifice) valves do both.',
        'Fusion-bonded epoxy is the usual interior coating. NSF 61 and WRAS cover what leaches into the water, not coating strength — and changing the coating can void a certification.',
      ],
    },
    {
      type: 'lead',
      html: 'Waterworks valves look like plant valves, but they are bought against a different set of standards: AWWA in North America, EN 1074 and BS in Europe and the UK, and whichever of the two the project specification names elsewhere. They are mostly ductile iron, epoxy coated and flanged to EN 1092-2 or ASME B16.1. This guide covers the four families on a water or wastewater main — isolation, non-return, butterfly and air valves — and the coating and approval questions that sit across all of them.',
    },

    { type: 'section_head', number: '/01', title: 'Gate valves: resilient or metal seated.', anchor: 'gate-valves' },
    {
      type: 'prose',
      html: '<p>The metal-seated gate valve is the original waterworks valve. AWWA C500 covers iron-body, bronze-mounted valves with double-disc gates (parallel or inclined seats) or a solid wedge, non-rising stem from 3 to 48 in. and OS&amp;Y rising stem from 3 to 12 in. The 1999 revision rates them at 200 psig to 12 in. and 150 psig from 16 in., and leaves corrosive water, frequent operation and throttling outside its scope. Metal seats leak a little, and more as they wear, and friction keeps torque high.</p><p>AWWA C509 (1980) introduced the resilient seat: a rubber-encapsulated wedge that closes leak-tight, with no leakage allowance and lower torque. AWWA C515 followed in 1999 as the reduced-wall version: it requires ductile iron for the body and bonnet, sets wall thicknesses by finite element analysis, and drops the 12.5 % wall-thickness tolerance that C500 and C509 allow. The 2021 edition covers non-rising stem valves from 3 to 54 in. and OS&amp;Y from 3 to 16 in., at a minimum design working pressure of 200 psig, up to 16 ft/s full open and 33 to 125 °F. Our <a href="/p/resilient-seated-gate-valve-ductile-iron">resilient seated gate valve</a> and <a href="/p/metal-seated-gate-valve-ductile-iron">metal seated gate valve</a> are listed in both stem types.</p><p>On European and UK projects the reference is different. EN 1074-1 and EN 1074-2 set the fitness-for-purpose requirements for isolating valves of any type or material on supply systems carrying water for human consumption, above or below ground. EN 1171 is an industrial standard — cast iron gate valves with flanged, socket or spigot ends, DN 40 to DN 1000, PN 6 to PN 25 — that may be used for water only where the relevant performance standard is also met. BS 5163-1 is a UK code of practice for choosing key-operated, flanged cast iron gate valves that comply with EN 1074-1 and -2, mainly for underground use. BS 5163-1 is written for buried, key-operated valves; the OS&amp;Y version, with its rising stem, is limited to smaller sizes in both AWWA standards (12 in. in C500, 16 in. in C515).</p>',
    },

    { type: 'section_head', number: '/02', title: 'Check valves and slam on pump stations.', anchor: 'check-valves' },
    {
      type: 'comparison_table',
      caption: 'Waterworks check valves by slam potential (horizontal pipe, after Ballun 2003)',
      columns: ['Type', 'How it closes', 'Slam potential', 'Typical water duty'],
      rows: [
        { cells: ['Swing check (AWWA C508)', 'Hinged disc swings shut under weight and reverse flow; long stroke, no spring', 'Highest group', 'General pump stations and water lines, approximately level'] },
        { cells: ['Ball check', 'Ball rolls back onto the seat when the pump stops; long stroke, no spring', 'Highest group', 'Sewage and wastewater pumping'] },
        { cells: ['Flexible disc (rubber flapper)', 'Rubber disc flexes onto an angled seat; short stroke', 'Middle group', 'Raw water and wastewater pumping'] },
        { cells: ['Dual plate', 'Two half-plates close on springs', 'Lowest group', 'Pump discharges and mains where length and weight matter'], highlight: true },
        { cells: ['Silent (centre-guided)', 'Spring-assisted disc on the pipe axis, short stroke', 'Lowest group', 'Pump discharges, booster sets, fast-decelerating stations'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>When a pump trips, the water column slows, stops and runs back. A check valve that has not closed by then is slammed shut by the reverse flow. Valve engineer John Ballun puts the result at about 100 ft of head (43 psi) for every 1 ft/s of reverse velocity at closure; 0.5 to 1 ft/s is a mild slam, more should be designed out with heavier springs, a dashpot or a different valve. Deceleration matters as much as the valve: under 20 ft/s² for a single low-head pump, up to about 40 ft/s² for high-head, multi-pump stations, where a quiet swing check can start to hammer.</p><p>AWWA C508 covers iron-body, unassisted swing checks with flanged or mechanical-joint ends for approximately level installation; the 2017 revision runs 2 to 24 in. at 200 psig to 12 in. and 150 psig above, to 125 °F, and the 2025 edition extends it to 48 in. EN 1074-3 does the same job as EN 1074-2 for check valves on drinking-water supply. Orientation changes the picture: in vertical pipe, Ballun found swing and tilted disc valves may slam more and dual disc and silent checks less.</p><p>For wastewater, our <a href="/p/ball-check-valve-wastewater">ball check valve</a> has a rubber-coated ball as its only moving part, and the <a href="/p/flexible-check-valve-rubber-flapper">flexible check valve</a> has no hinge pin. Where the station decelerates fast, look at the <a href="/p/silent-check-valve-ductile-iron">silent check</a>, <a href="/p/resilient-axial-flow-check-valve-water">axial flow check</a> or <a href="/p/resilient-dual-plate-check-valve-wafer">dual plate check</a>. The plant-side detail is in <a href="/blog/industrial-check-valve-types">industrial check valve types</a>.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Butterfly valves: concentric and double eccentric.', anchor: 'butterfly-valves' },
    {
      type: 'prose',
      html: '<p>AWWA C504 is the rubber-seated butterfly valve standard for water. The 2023 edition covers 3 to 72 in., in wafer bodies (Class 150B, 3 to 20 in.), short- and long-body flanged, and mechanical-joint ends, at up to 250 psig working and differential pressure, 16 ft/s full open, pH 6 to 12 and 33 to 125 °F. EN 593 is broader: metallic butterfly valves of any end type — wafer, lug, flanged or butt-weld — for isolating, regulating or control duty, DN 20 to DN 4000, PN 2.5 to PN 160 and Class 150 to 900.</p><p>In practice the choice splits by size and duty. Rubber-lined concentric valves, where the liner covers the bore so the water never touches the body, suit filtration, dosing and distribution in treatment works; see the <a href="/p/water-treatment-concentric-butterfly-valve">water treatment concentric butterfly valve</a>. Double eccentric (double offset) flanged valves, whose disc swings clear of the seal as it opens, are the large-diameter isolation valve for transmission mains and pump stations; the <a href="/p/double-eccentric-butterfly-valve-water">double eccentric butterfly valve</a> runs to DN 4000. Wafer, lug and dead-end service are covered in <a href="/blog/butterfly-valves-wafer-lug-and-grooved">butterfly valves: wafer, lug or grooved</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Air valves: which type goes where.', anchor: 'air-valves' },
    {
      type: 'prose',
      html: '<p>Water carries at least 2 % dissolved air by volume in normal pipeline conditions, according to AWWA Manual M51, and it collects at high points. Air pockets cut the flow area, raise pumping cost and magnify surge pressures. There are three valve types:</p><ul><li><strong>Air release valves</strong> (small-orifice or pressure air valves) continuously vent small quantities of air from a line under pressure.</li><li><strong>Air/vacuum valves</strong> (large-orifice or low-pressure air valves) discharge large volumes while a line fills and let large volumes in when it drains or the pressure drops below atmospheric.</li><li><strong>Combination air valves</strong> (double orifice) do both.</li></ul><p>They go at high points, at abrupt increases in downslope and decreases in upslope, along long ascents and descents, and at the start and end of long horizontal runs. Transmission mains and sewer force mains need them; small distribution networks may not, because hydrants and service connections vent the air. M51 gives a sizing method; the maker should check its assumptions.</p><p>AWWA C512 covers all three for water and wastewater: air release valves ½ to 6 in., air/vacuum and combination valves ½ to 20 in., up to 300 psig and 125 °F. EN 1074-4 is the European fitness-for-purpose standard for air valves on drinking-water supply. We list a <a href="/p/double-orifice-air-release-valve">double orifice air release valve</a> and a <a href="/p/single-orifice-air-release-valve">single orifice air release valve</a>. A <a href="/p/y-strainer-ductile-iron-flanged">Y strainer</a> upstream protects pumps, control valves and meters from debris.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Coatings and drinking-water approval.', anchor: 'coatings' },
    {
      type: 'prose',
      html: '<p>Fusion-bonded epoxy (FBE) is the usual interior coating for resilient-seated gate valves and most other ductile iron waterworks valves. Powder is sprayed electrostatically onto preheated castings and post-cured, with no solvent. AWWA C550 sets minimum requirements for interior coatings on valves in water, wastewater and reclaimed water service from pH 4 to 9, including an impact test; valve standards call for at least 6 mils on gate valves and 8 mils on quarter-turn valves, and project specifications often ask for 8 to 16 mils.</p><p>Drinking-water approval is a separate question. NSF/ANSI 61 measures what leaches into the water from a wetted material; it says nothing about impact, adhesion or corrosion resistance, and specifying an alternative coating invalidates a valve’s NSF 61 certification. In the UK, fittings on the public supply must comply with the Water Supply (Water Fittings) Regulations 1999 or the Scottish Byelaws, and a WRAS material approval shows that a non-metallic part such as a rubber seat or O-ring has been tested to BS 6920 for its effect on water quality. Ask for the certificate for the specific valve model and size, not a general statement. For hose on the same duty, see <a href="/blog/drinking-water-hose-nsf-61">drinking-water hose and NSF/ANSI 61</a>.</p>',
    },
    {
      type: 'prose',
      html: '<h3>What to send for a quote</h3><ul><li><strong>Valve and duty:</strong> isolation, non-return, air or strainer; drinking water, raw water, wastewater or seawater; pump station, transmission main or treatment works.</li><li><strong>Size and pressure:</strong> DN or NPS, PN or class, and the system test pressure.</li><li><strong>Standard:</strong> AWWA C515, C500, C508, C504 or C512, or EN 1074 with EN 1092-2 flanges — and the edition, because specifications still quote C500 or C509 for C515 valves.</li><li><strong>Installation:</strong> buried with key and extension spindle, chamber with handwheel or gearbox, or actuated; for check valves, horizontal or vertical and the number of pumps.</li><li><strong>Coating and approval:</strong> FBE thickness, NSF 61 or WRAS, and the inspection and test certificates you need.</li></ul><p>For seawater intake and brine lines, our listings offer stainless steel, duplex and super duplex bodies on request in place of ductile iron.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between AWWA C509 and C515?', answer: 'Both cover resilient-seated gate valves. C515 requires ductile iron for the body and bonnet, sets thinner walls by finite element analysis and removes the 12.5 % wall tolerance C509 allows.' },
        { question: 'Is EN 1171 a drinking-water standard?', answer: 'No. EN 1171 covers cast iron gate valves mainly for industrial and general-purpose use. Valves on drinking-water supply are assessed to EN 1074-1 and EN 1074-2.' },
        { question: 'Which check valve stops slam on a pump station?', answer: 'Spring-assisted designs that close before flow reverses: dual plate, silent and axial nozzle checks. Long-stroke swing and ball checks slam most on lines that decelerate fast.' },
        { question: 'Do I need an air release valve or a combination air valve?', answer: 'An air release valve only vents small pockets under pressure. Where the line also fills and drains, as at most high points on a main, a combination (double orifice) valve does both jobs.' },
        { question: 'Does fusion-bonded epoxy make a valve NSF 61 approved?', answer: 'Not by itself. NSF 61 certification applies to the valve with its specified wetted materials; changing the coating invalidates it. Ask for the certificate for the model and size.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Ductile iron waterworks valves, built to order:</p>' + stockList(['waterworks-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Waterworks valves',
      skus: ['IH-PV-WGR', 'IH-PV-WGM', 'IH-PV-WSW', 'IH-PV-WBC', 'IH-PV-WDP', 'IH-PV-WBE', 'IH-PV-WAD', 'IH-PV-WYS'],
    },
    { type: 'category_link', slug: 'waterworks-valves', label: 'Waterworks valves', blurb: 'Gate, check, butterfly and air valves and strainers for water and wastewater.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'vm-gate', text: 'Valve Magazine. “Which Gate Valve Is Best for Today’s Waterworks Systems?” 2023.', url: 'https://valvemagazine.com/articles/which-gate-valve-is-best-for-todays-waterworks-systems/' },
        { id: 'awwa-c515', text: 'AWWA C515, Reduced-Wall, Resilient-Seated Gate Valves for Water Supply Service, 2021 revision — scope.', url: 'https://online.standard.no/en/awwa-c515-4' },
        { id: 'awwa-c500', text: 'AWWA C500, Metal-Seated Gate Valves for Water Supply Service, 1999 revision — scope.', url: 'https://online.standard.no/en/awwa-c500' },
        { id: 'en-1074-2', text: 'EN 1074-2:2000, Valves for water supply — Part 2: Isolating valves — scope.', url: 'https://www.evs.ee/en/evs-en-1074-2-2000' },
        { id: 'en-1171', text: 'EN 1171:2015, Industrial valves — Cast iron gate valves — scope (STN edition preview).', url: 'https://normy.normoff.gov.sk/norma/122926/nahlad' },
        { id: 'awwa-c508', text: 'AWWA C508, Swing-Check Valves for Waterworks Service, 2 In. Through 24 In., 2017 revision — scope.', url: 'https://online.standard.no/en/awwa-c508-3' },
        { id: 'ballun-slam', text: 'Ballun, J. V. “Company Examines Slam Characteristics of Check Valves.” Water Technology Online, 2003.', url: 'https://watertechonline.com/home/article/14172607/company-examines-slam-characteristics-of-check-valves' },
        { id: 'awwa-c504', text: 'AWWA C504-23, Rubber-Seated Butterfly Valves — scope.', url: 'https://standards.nimonik.com/products/awwa/c504/' },
        { id: 'en-593', text: 'EN 593:2017, Industrial valves — Metallic butterfly valves for general purposes — abstract.', url: 'https://shop.standards.ie/en-ie/standards/en-593-2017-346321_saig_cen_cen_791955' },
        { id: 'bs-5163-1', text: 'BS 5163-1:2004, Valves for waterworks purposes — Predominantly key-operated cast iron gate valves — Code of practice.', url: 'https://store.sfs.fi/en/bs-5163-1-2004' },
        { id: 'awwa-c512', text: 'AWWA. Comment period on AWWA C512, Air-Release, Air/Vacuum and Combination Air Valves for Water and Wastewater Service — Metallic Body and Cover.', url: 'https://www.awwa.org/AWWA-Articles/awwa-comment-period-on-awwa-c512-air-release-air-vacuum-and-combination-air-valves-for-water-and-wastewater-service-metallic-body-and-cover/' },
        { id: 'unibell-air', text: 'Uni-Bell PVC Pipe Association. “Air Valves: Improving the Performance of Pressure Pipelines.” Technical brief, 2013.', url: 'https://www.uni-bell.org/portals/0/ResourceFile/air-valves-improving-the-performance-of-pressure-pipelines.pdf' },
        { id: 'vm-coatings', text: 'Valve Magazine. “Interior Coatings for Waterworks Valves.”', url: 'https://www.valvemagazine.com/articles/interior-coatings-for-waterworks-valves' },
        { id: 'wras-materials', text: 'WRAS. “What is a WRAS Material Approval?”', url: 'https://wrasapprovals.co.uk/material-approvals' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['industrial-check-valve-types', 'butterfly-valves-wafer-lug-and-grooved', 'api-600-602-603-gate-and-globe-valves', 'drinking-water-hose-nsf-61', 'desalination-and-water-treatment-hose', 'overland-pumping-water-main-bypass'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Standard scopes from published AWWA, EN and BS abstracts; slam data from Ballun (2003); air valve placement from the Uni-Bell brief citing AWWA M51; coatings from Valve Magazine.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying waterworks valves?',
      body: 'Send the valve type, size and pressure class, the service (drinking water, raw water, wastewater or seawater), the standard and edition, how it is installed and operated, and the coating and approval you need.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
