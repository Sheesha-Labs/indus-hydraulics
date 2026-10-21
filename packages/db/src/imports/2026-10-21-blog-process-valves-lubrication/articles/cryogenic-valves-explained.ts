import type { BlogArticleSeed } from '../shared'
import { stockList } from '../products'

/**
 * Cryogenic valves: what makes a valve cryogenic, the standards, cavity relief, top vs side entry, and liquid
 * hydrogen. Sources read 2026-10-21: BSI Knowledge, BS 6364:1984 record (title "Specification for valves for
 * cryogenic service", status withdrawn 23 July 2021; descriptors include austenitic steels and low-temperature
 * testing); BSMD (Bahrain) store record of ISO 28921-1:2022 (scope: design, dimensions, material, fabrication and
 * production testing of gate, globe, ball/plug and butterfly isolating valves and check valves, -50 °C to -196 °C;
 * excludes ISO 21011 valves, safety valves and control valves); NDLS record of MSS SP-134-2012 (scope: stainless and
 * alloy cryogenic valves with body/bonnet extensions; gate, globe, butterfly, ball, check; used with ASME B16.34 and
 * API parent standards; check valves may not need extensions); ISO 21011 scope via the Albanian standards body (DPS) record (valves
 * for cryogenic vessels, -40 °C and below, vacuum-jacketed valves up to DN 150, revision under way); Habonim
 * cryogenic catalogue 2018 (thin liquid layer between bonnet bore and stem evaporates, keeping the stem seal at
 * ambient; long bonnet to BS 6364 with 250 mm straight neck for non-cold-box service; vertical install preferred,
 * 12" bonnet to 45° from vertical, 6" bonnet to 15°; relief hole on the upstream side of the ball; flow arrows and
 * stem mark; boiling points of cryogens; PCTFE seats to -269 °C; helium leak test by EN 1779 vacuum method);
 * Habonim blog "cryogenic bi-directional" (why trapped cavity liquid over-pressures; relief hole makes a floating
 * ball valve unidirectional; body marking of relief direction; trunnion or self-relieving seats for bidirectional
 * sealing); Flow-Tek (Bray) Technical Bulletin 1008 (bonnet extension gives a vapour column that insulates the stem
 * seal; vent holes in stem slot and upstream ball face; flow arrow marking; cleaning for oxygen-reactive media);
 * Inko page on a top-entry cryogenic ball valve (one-piece body welded in, bonnet raised above insulation so trim and
 * seals are replaced in line); Valve Magazine, "Austenitic Stainless Steels" (2008) (no ductile-to-brittle transition
 * in wrought austenitic grades; cast CF grades carry ferrite; B31.3 Table A-1 minimum temperatures -198 °C to -254 °C;
 * US vs European impact-test practice); Project Materials, "What is a cryogenic valve?" (BS 6364 cryogenic test:
 * valve cooled in liquid nitrogen, leakage measured with helium; carbon steel not used in cryogenic service);
 * Berkeley Lab EHS, Liquid hydrogen (20 K boiling point; transfer lines condense air into oxygen-enriched liquid;
 * vacuum-insulated lines a necessity).
 * Added 2026-10-21 (oxygen service, shelf oxygen-service-valves): AIGA 012/19 Cleaning of Equipment for Oxygen
 * Service (harmonised with CGA G-4.1, identical technical content across AIGA/CGA/EIGA/JIMGA; scope: surfaces in
 * contact with >23.5% O2; NVR limit <220 mg/m2 unless risk assessed; particle limits; UV and wipe tests; ASTM G93 cited
 * for cleaning methods and cleanliness levels; CLEANED FOR OXYGEN SERVICE label visible outside the package); AIGA
 * 021/20 Oxygen Pipeline and Piping Systems (originally EIGA Doc 13; copper, nickel, Monel highly burn resistant;
 * exemption pressure and minimum thickness; impingement curve 30 m/s at 0.3-1.5 MPa abs, P.V = 45 to 10 MPa, 4.5 m/s at
 * 10-20 MPa; exempt materials above the curve; aluminium bronze not recommended; ignition mechanisms; isolation valves
 * open/closed only with bypass equalisation; gear operators for slow opening of ball/butterfly; process control valves
 * the most severe duty; exempt materials recommended downstream of bypass valves; flammability data valid to 200 C).
 * EIGA Doc 33 number from CGA's G-4.1 listing note via search, not read on an EIGA page.
 * NOT used: bonnet-length-by-temperature tables (secondary source only), ISO 28921-2 type-test details, BS 6364
 * Appendix A test pressures and acceptance figures (standard not read), any maker of our own-label listings; the Appendix B
 * exemption pressures per alloy (table not checked); ASTM G93 cleanliness levels (ASTM page blocked); the 61 m/s
 * copper-alloy rule in a valve maker's oxygen bulletin (PDF not readable).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cryogenic-valves-explained',
  title: 'Cryogenic valves explained: extended bonnets, BS 6364 and ISO 28921-1, cavity relief and liquid hydrogen',
  excerpt:
    'A cryogenic valve is an ordinary valve type rebuilt for liquefied gas: an extended bonnet that keeps the stem seal warm, austenitic stainless steel that stays tough at -196 °C, a vent that stops trapped liquid over-pressurising the body, and a cold test before it ships. What BS 6364, ISO 28921-1 and MSS SP-134 cover, top entry vs side entry ball valves, the other valve types used on LNG, and what changes at -253 °C for liquid hydrogen.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Cryogenic Valves Explained: BS 6364, Bonnets, LNG, LH2',
  seoDescription:
    'How cryogenic valves work: extended bonnets, BS 6364, ISO 28921-1, MSS SP-134, materials, cavity relief, top vs side entry ball valves and liquid hydrogen.',
  focusKeyword: 'cryogenic valves',
  publishedAt: '2026-10-22T01:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An extended bonnet holds the stem seal away from the cold body; liquid in the neck boils off, and the vapour column keeps the packing near ambient temperature.',
        'ISO 28921-1 covers low-temperature isolating and check valves from -50 °C to -196 °C. BS 6364 is withdrawn but still written into many data sheets.',
        'Bodies and trim are austenitic stainless steel, which has no ductile-to-brittle transition; carbon steel is not used in cryogenic service.',
        'Liquid trapped in a closed ball or gate cavity boils as it warms. An upstream vent relieves it, and makes the valve one-directional.',
        'Top-entry valves are welded in and serviced through the cover, so the line and its insulation stay in place.',
        'Liquid hydrogen at about -253 °C needs vacuum-jacketed valves: cold bare metal condenses air into an oxygen-enriched liquid.',
      ],
    },
    {
      type: 'lead',
      html: 'LNG is stored at about -162 °C, liquid nitrogen and argon near -196 °C and -186 °C, and liquid hydrogen at about -253 °C. At those temperatures an ordinary valve fails in three ways: the stem packing freezes and leaks, carbon-steel parts turn brittle, and liquid trapped inside the closed valve boils and over-pressurises the body. A cryogenic valve is a gate, globe, ball, butterfly or check valve with each of those problems designed out. This guide explains how, which standards apply, and what to send when you ask for a quote.',
    },

    { type: 'section_head', number: '/01', title: 'What makes a valve cryogenic.', anchor: 'design' },
    {
      type: 'prose',
      html: '<h3>The extended bonnet and its gas column</h3><p>The stem seal is the hardest part to keep tight at cryogenic temperature, so it is moved away from the cold. A tube between the body and the gland, the extended bonnet, lifts the packing well above the line. Liquid that rises into the narrow gap between the bonnet bore and the stem boils off, and the column of vapour it leaves insulates the stem seal, which stays close to ambient temperature. One maker’s long bonnet, for example, has a 250 mm straight neck to meet BS 6364 for service outside a cold box.</p><p>The gas column only works if liquid cannot climb to the packing. Install with the bonnet vertical where you can. The same catalogue allows its long bonnet up to 45° from vertical and its short bonnet only 15°. Do not insulate up the extension; it is meant to stay warm.</p><h3>Materials that stay tough</h3><p>Carbon and low-alloy steels, and 400-series stainless, lose impact toughness as they get colder. Wrought austenitic stainless steels such as 304 and 316 have no ductile-to-brittle transition and keep essentially full toughness at cryogenic temperature, which is why cryogenic bodies are CF8, CF8M, CF3 or CF3M castings or 304/316 forgings. ASME B31.3 lists minimum temperatures for these grades between -198 °C and -254 °C, depending on grade and product form. Cast grades carry some ferrite, so many buyers still ask for Charpy impact tests at -196 °C. North American codes generally do not require them; European rules generally do.</p><h3>Cleaning</h3><p>Valves for oxygen service, and many for other cryogens, are degreased and bagged so that no oil or grease meets the fluid. If the line carries liquid oxygen, say so on the enquiry.</p><h3>Oxygen service</h3><p>Oxygen cleaning has its own standard. The industrial gas associations publish one harmonised text, CGA G-4.1, Cleaning of Equipment for Oxygen Service, with identical technical content issued by EIGA (Doc 33) and in Asia as AIGA 012. It applies to every surface in contact with gas or liquid above 23.5% oxygen. Its acceptance limit for non-volatile residue is below 220 mg/m² unless a risk assessment supports a higher figure, with separate limits for particles. Surfaces are checked under UV light and by wipe tests, and cleaned items carry a CLEANED FOR OXYGEN SERVICE label that can be read from outside the package. The cleaning methods themselves are covered by ASTM G93.</p><p>Cleaning is only half of it. EIGA Doc 13, the oxygen pipeline code (AIGA 021 in Asia), lists the ways a valve ignites in oxygen: particle impact, frictional heating and galling, and the heat of adiabatic compression when a downstream line is pressurised quickly. Copper, nickel and copper-nickel alloys such as Monel are highly burn-resistant. Below an alloy’s exemption pressure, at a minimum thickness the code gives, it can be used at any gas velocity. Above it, the gas velocity must stay under the code’s impingement curve wherever particles can strike a surface: 30 m/s from 0.3 to 1.5 MPa absolute, falling as pressure rises to 4.5 m/s between 10 and 20 MPa. Carbon and stainless steel are used below the curve; above it, exempt materials are used. Aluminium bronze is not recommended, because it can burn once ignited.</p><p>The code also sets how oxygen valves are used. Isolation valves are fully open or fully closed, never throttling, and are opened only once a bypass has equalised the pressure across them. Ball and butterfly valves open quickly, so they are often fitted with gear operators to slow them down. Control valves are the most severe duty, bypass and vent valves are treated the same way, and the code recommends exempt materials for bypass valves and the piping downstream of them. Its data on metal flammability applies up to 200 °C. See the <a href="/p/oxygen-service-valves-cleaned">oxygen service valves</a>.</p>',
    },

    { type: 'section_head', number: '/02', title: 'BS 6364, ISO 28921-1 and MSS SP-134.', anchor: 'standards' },
    {
      type: 'comparison_table',
      caption: 'Standards a cryogenic valve data sheet is likely to cite',
      columns: ['Standard', 'What it covers', 'Status to note'],
      rows: [
        { cells: ['BS 6364:1984', 'Requirements for valves in cryogenic service, on top of the valve product standard, including a cryogenic test', 'Withdrawn by BSI in 2021, but still widely specified'], highlight: true },
        { cells: ['ISO 28921-1:2022', 'Design, dimensions, materials, fabrication and production testing of gate, globe, ball/plug, butterfly and check valves, -50 °C to -196 °C', 'Current. Excludes control valves, safety valves and ISO 21011 valves'] },
        { cells: ['MSS SP-134', 'Stainless and alloy cryogenic valves with body/bonnet extensions: gate, globe, butterfly, ball and check', 'Used with ASME B16.34 and the API product standards, not instead of them'] },
        { cells: ['ISO 21011', 'Valves for cryogenic vessels at -40 °C and below, including vacuum-jacketed valves up to DN 150', 'Vessel valves, not pipeline valves; under revision'] },
        { cells: ['ASME B16.34, API 600/602/608/609, API 6D', 'Pressure-temperature ratings, wall thickness and the product design', 'The parent standard the cryogenic rules add to'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Cryogenic standards add to a valve product standard; they do not replace it. A cryogenic gate valve is still an API 600 or API 602 gate valve with ASME B16.34 ratings, and a cryogenic trunnion ball valve can still be API 6D. The cryogenic standard adds the bonnet extension, the material and impact requirements and the cold test.</p><p>The cold test is what buyers usually mean by “tested to BS 6364”. The valve is cooled in liquid nitrogen, pressurised, usually with helium, and its seat and stem leakage are measured cold. Ask whether the test was run on your valve or on a prototype of the same design, and ask for the test record either way.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Cavity relief, and top vs side entry.', anchor: 'ball-valves' },
    {
      type: 'prose',
      html: '<p>When a ball valve closes, liquid is trapped in the bore of the ball and the body cavity. As it warms it turns to gas, and the gas can raise the cavity pressure far above the line pressure. The usual fix is a relief hole drilled in the upstream face of the ball, so the cavity always vents to the upstream pipe. The hole has a cost: the valve now seals in one direction only, and must be installed with its flow arrow the right way round. Makers mark the body, and often the stem, to show which side the hole faces. Bidirectional sealing needs a trunnion-mounted ball with seats that relieve the cavity themselves; see <a href="/blog/floating-vs-trunnion-mounted-ball-valves">floating vs trunnion mounted ball valves</a>. Gate valves have the same problem, which is why a cryogenic wedge carries a relief hole on its upstream side.</p><ul><li><strong>Side entry</strong> (split body): the body is bolted together in two or three pieces, and the ball and seats are fitted from the end. It is the usual design and costs less, but repairing the trim means taking the valve out of the line.</li><li><strong>Top entry</strong>: a one-piece body welded into the line, with the ball, seats and seals lifted out through a bolted top cover. On a welded, insulated LNG line the trim can be changed without cutting pipe or stripping insulation, and there are fewer body joints that could leak.</li></ul><p>The other valve types follow the same rules. Gate valves isolate, and globe valves throttle and give tight shut-off on fill, drain and bypass lines. Both have extended bonnets. Offset butterfly valves, where the disc swings clear of the seat before it turns, suit large LNG lines where a ball valve would be too heavy. Cryogenic check valves, which have no stem, may need no bonnet extension at all. Cryogenic globe control valves carry the extended bonnet as well, but they sit outside ISO 28921-1, which does not cover control valves.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Liquid hydrogen.', anchor: 'hydrogen' },
    {
      type: 'prose',
      html: '<p>Liquid hydrogen boils at about 20 K (-253 °C), below the -196 °C floor of ISO 28921-1 and colder than every common cryogen except helium. Two things change. First, any heat that gets in boils off product, so valves are built with extended bodies inside a vacuum jacket, often with a low-conductivity insert in the extension, and the stem is sealed with a bellows so the gland cannot leak hydrogen. Second, bare metal at that temperature condenses the air around it into a liquid that can be enriched in oxygen, a fire and explosion hazard. Berkeley Lab’s safety guidance calls vacuum-insulated transfer lines a necessity with liquid hydrogen; an un-jacketed valve in the middle of a jacketed line defeats them. For the lines either side of the valve, see <a href="/blog/cryogenic-transfer-hose">cryogenic transfer hose</a> and <a href="/blog/cryogenic-jacketed-and-heated-metal-hose">vacuum-jacketed metal hose</a>.</p>',
    },
    {
      type: 'prose',
      html: '<h3>What to send for a quote</h3><ul><li>Fluid and minimum design temperature, and whether it is LNG, nitrogen, oxygen, argon or hydrogen</li><li>Valve type, size, ASME class, end connections and operator</li><li>Parent standard and cryogenic standard (BS 6364, ISO 28921-1 or MSS SP-134), and whether a cold test is needed on each valve or a type test will do</li><li>Flow direction for ball valves, and whether bidirectional sealing is required</li><li>Top or side entry; in a cold box or not; bonnet orientation</li><li>Impact testing, oxygen cleaning, fire-safe and fugitive-emission requirements, and the inspection you want</li></ul>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a cryogenic valve?', answer: 'A gate, globe, ball, butterfly or check valve built for liquefied gas below about -50 °C: an extended bonnet that keeps the stem seal warm, austenitic stainless materials, cavity relief where liquid can be trapped, and a cold test.' },
        { question: 'Why do cryogenic valves have long bonnets?', answer: 'To move the stem packing away from the cold. Liquid in the neck boils off, and the vapour column insulates the seal so it stays near ambient temperature and does not freeze and leak.' },
        { question: 'Is BS 6364 still current?', answer: 'No. BSI lists BS 6364:1984 as withdrawn in 2021, but data sheets still cite it, especially for its cryogenic test. ISO 28921-1:2022 is the current international standard for low-temperature isolating valves.' },
        { question: 'Why is there a hole in a cryogenic ball?', answer: 'Liquid trapped in a closed ball boils as it warms and can over-pressurise the cavity. A hole on the upstream side vents it to the line, so the valve seals in one direction and must be installed with its flow arrow the right way round.' },
        { question: 'Can a cryogenic valve be installed horizontally?', answer: 'Vertical bonnets are preferred. Makers state a maximum tilt for each bonnet length; beyond it, liquid can reach the packing.' },
        { question: 'What is different about liquid hydrogen valves?', answer: 'At about -253 °C they need vacuum-jacketed bodies to limit boil-off and to stop air condensing into oxygen-enriched liquid on the cold metal. Bellows stem seals are common.' },
      ],
    },
    {
      type: 'prose',
      html: '<h3>What we list</h3><p>Cryogenic and liquid hydrogen valves, and valves cleaned for oxygen service:</p>' + stockList(['cryogenic-valves', 'oxygen-service-valves']),
    },
    {
      type: 'product_embed',
      heading: 'Cryogenic valves',
      skus: ['IH-PV-CTT', 'IH-PV-CTS', 'IH-PV-CFS', 'IH-PV-CGT', 'IH-PV-CGL', 'IH-PV-CBF', 'IH-PV-CCK', 'IH-PV-HGL'],
    },
    { type: 'category_link', slug: 'cryogenic-valves', label: 'Cryogenic valves', blurb: 'Ball, gate, globe, butterfly, check, control and liquid hydrogen valves.' },
    { type: 'page_link', kind: 'industry', slug: 'oil-gas', label: 'Oil & gas', blurb: 'LNG liquefaction, terminals and gas processing.' },
    {
      type: 'references',
      heading: 'Sources',
      entries: [
        { id: 'bsi-6364', text: 'BSI. BS 6364:1984 Specification for valves for cryogenic service (status record).', url: 'https://knowledge.bsigroup.com/products/specification-for-valves-for-cryogenic-service' },
        { id: 'iso-28921-1', text: 'ISO 28921-1:2022 Industrial valves — Isolating valves for low-temperature applications — Part 1: Design, manufacturing and production testing (scope).', url: 'https://bsmd.moic.gov.bh/store/standards/iso:pub:std:IS:78445/ISO%2028921-1:2022?lang=en' },
        { id: 'mss-sp-134', text: 'MSS SP-134-2012 Valves for Cryogenic Service, Including Requirements for Body/Bonnet Extensions (scope).', url: 'https://ndls.org.cn/standard/detail/dad0fe67151ee7437762a235f301d1a3' },
        { id: 'iso-21011', text: 'ISO 21011:2008 Cryogenic vessels — Valves for cryogenic service (scope).', url: 'https://dps.gov.al/en/project/show/dps:proj:46842' },
        { id: 'habonim-cat', text: 'Habonim. Cryogenic ball valves catalogue, 2018.', url: 'https://habonim.com/wp-content/uploads/2018/04/Cryogenic-2018-catalog.pdf' },
        { id: 'habonim-bidir', text: 'Habonim. Bi-directional sealing in cryogenic ball valves.', url: 'https://blog.habonim.com/cryogenic-bi-directional' },
        { id: 'flowtek-1008', text: 'Flow-Tek. Cryogenic Service Ball Valves, Technical Bulletin 1008.', url: 'https://www.specifiedby.com/bray-controls-uk-ltd/cryogenic-valves/bray-controls-uk-ltd_cryogenic_techspec_5_tb-1008-cryo-1.pdf' },
        { id: 'valve-mag-ss', text: 'Spence, T. “Austenitic Stainless Steels.” Valve Magazine, April 2008.', url: 'https://valvemagazine.com/articles/austenitic-stainless-steels/' },
        { id: 'lbl-lh2', text: 'Berkeley Lab EHS. Liquid hydrogen.', url: 'https://ehs.lbl.gov/service/chemical-lab-safety/liquid-hydrogen/' },
        { id: 'aiga-012', text: 'AIGA 012/19, Cleaning of Equipment for Oxygen Service (harmonised with CGA G-4.1 and EIGA).', url: 'https://asiaiga.org/uploaded_docs/en_AIGA_012_19_Cleaning_of_Equipment_for_Oxygen_Service.pdf' },
        { id: 'aiga-021', text: 'AIGA 021/20, Oxygen Pipeline and Piping Systems (originally EIGA Doc 13).', url: 'https://asiaiga.org/uploaded_docs/en_AIGA_21_20_Oxygen_Pipeline_and_Piping_Systems.pdf' },
      ],
    },
    {
      type: 'related_articles',
      slugs: ['floating-vs-trunnion-mounted-ball-valves', 'industrial-check-valve-types', 'cryogenic-transfer-hose', 'cryogenic-jacketed-and-heated-metal-hose', 'lng-bunkering-couplings-iso-21593', 'butterfly-valves-wafer-lug-and-grooved'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Standards scope and status from BSI, ISO and MSS records; bonnet, cavity-relief and installation details from maker catalogues; materials from Valve Magazine; hydrogen from Berkeley Lab; oxygen service from AIGA 012 and 021 (CGA G-4.1, EIGA Docs 33 and 13).',
    },
    {
      type: 'cta_block',
      heading: 'Specifying cryogenic valves?',
      body: 'Send the fluid and minimum temperature, valve type, size, class and ends, the standards on your data sheet, flow direction and any cold-test or inspection requirements. We will quote against it and flag anything missing.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
