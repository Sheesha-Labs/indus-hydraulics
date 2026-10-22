import type { BlogArticleSeed } from '../shared'
import { SHELVES, stockListBy, type Listing } from '../products'

/**
 * FRL guide. Element ratings: Parker 12F Prep-Air II coalescing data (Grade 6 = 0.01 µm; Grade 6 vs Grade 10 flow
 * at 1/2" and 3/4" ports; polycarbonate bowl −25 to 52 °C / −13 to 125 °F and 150 psig, metal bowl to 65.5 °C /
 * 150 °F and 250 psig; manual twist or automatic float drain; metal bowl guard). Norgren Excelon Plus published data
 * (40 µm and 5 µm particulate, 0.01 µm coalescing, 10 bar, −10 to +60 °C, auto drain that discharges at a preset
 * level). Lubrication rule: SMC "Handling Precautions" oil notice (class 1 turbine oil ISO VG32, no additives; factory
 * grease is washed away once oil is supplied, so lubrication must continue). Moisture washing out lubrication and
 * causing rust: Compressed Air Challenge, "How's the weather in your pipes?" (R. Marshall, Compressed Air Best
 * Practices, Nov 2012). MAC Valves ISO 8573-1 note: MAC's minimum recommendation for its products is [7:4:3].
 * Product titles and counts from products.ts only.
 * Left out as unsourced: a polycarbonate chemical list (makers publish their own; we tell the reader to check it),
 * a "micro-fog delivers x% of drops" figure, a general pressure-drop rule of thumb for FRL sizing, and any lubricator
 * drip-rate setting.
 */

const FRL = 'air-preparation-frl' as const
const OTHER_BRANDS = [...new Set((SHELVES[FRL] as Listing[]).map((l) => l.brand))].filter(
  (b) => b !== 'Parker Hannifin' && b !== 'Wilkerson'
)

const ARTICLE: BlogArticleSeed = {
  slug: 'frl-filter-regulator-lubricator-guide',
  title: 'FRL units explained: filter, regulator and lubricator — order, grades, drains, bowls and sizing',
  excerpt:
    'An FRL is the last thing compressed air passes through before it reaches a valve or cylinder. What each element does and why the order is filter, regulator, lubricator; particulate vs coalescing grades in microns; manual, semi-automatic and automatic drains; relieving regulators; when to lubricate; polycarbonate vs metal bowls; and sizing by flow, not port size.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'FRL Units: Filter, Regulator & Lubricator Guide',
  seoDescription:
    'FRL guide: F-R-L order, particulate vs coalescing micron grades, drains, relieving regulators, polycarbonate bowl limits and sizing by flow.',
  focusKeyword: 'filter regulator lubricator',
  publishedAt: '2026-10-22T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An FRL is assembled in the direction of flow as filter, then regulator, then lubricator: clean the air, set its pressure, then add oil last so nothing downstream strips it out.',
        'Particulate elements stop solid dirt and liquid water at ratings such as 40 µm or 5 µm; coalescing elements take out oil and water aerosols — Parker and Norgren both rate theirs at 0.01 µm.',
        'Many modern valves and cylinders run on non-lubricated air. Once you do add oil, keep adding it: SMC warns that the factory lubricant is washed away and malfunctions can follow.',
        'Polycarbonate bowls have lower limits than metal ones — Parker’s 12F gives 52 °C and 150 psig for polycarbonate against 65.5 °C and 250 psig for metal. Check the maker’s chemical list too.',
        'Size an FRL by the flow it must pass at the pressure drop you can accept, read from the maker’s flow chart. Port size alone is not a sizing method.',
      ],
    },
    {
      type: 'lead',
      html: 'Almost every pneumatic machine has one: a short stack of bowls and a gauge where the air line meets the machine. It is the cheapest part of the circuit and decides how long everything after it lasts. This guide covers what each part of an FRL does, how makers grade them, and how to choose one that will pass the flow your machine actually needs.',
    },

    { type: 'section_head', number: '/01', title: 'What each element does, and why the order matters.', anchor: 'order' },
    {
      type: 'prose',
      html: '<p>FRL stands for <strong>filter, regulator, lubricator</strong>, and that is also the order in which they sit in the line, reading in the direction of flow.</p><ul><li><strong>Filter.</strong> Removes solid particles and liquid water, and — with a coalescing element — fine oil and water aerosols. It goes first because everything after it, including the regulator’s own valve seat and diaphragm, is better off seeing clean air.</li><li><strong>Regulator.</strong> Reduces the supply pressure to a steady, lower working pressure and holds it there as the flow changes. A regulated supply makes cylinder force and speed repeatable.</li><li><strong>Lubricator.</strong> Adds a controlled amount of oil to the air for components that need it. It goes last because a filter downstream of it would remove the oil it has just added — a coalescing filter is designed to do exactly that.</li></ul><p>Two of the three are often combined. A <strong>filter-regulator</strong> puts both functions in one body, which saves length and a joint; we list them from Parker, Wilkerson, Norgren, ARO (as piggyback filter/regulators), Dixon, Nitra, Metal Work, Groz and others. Not every machine needs all three: most plants now run lubricated tools on one line and non-lubricated automation on another, and the second needs only an F and an R.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Filter grades: particulate vs coalescing.', anchor: 'filter-grades' },
    {
      type: 'prose',
      html: '<p>A general-purpose or <strong>particulate</strong> filter works in two stages. Deflector vanes spin the air so liquid water and heavy particles are thrown to the bowl wall and drain down; the air then passes an element that stops particles above its rating. Norgren’s Excelon Plus filters are published with 40 µm and 5 µm elements — the coarser grade for general plant air, the finer where valves or instruments are less tolerant of dirt.</p><p>A <strong>coalescing</strong> filter does a different job. Its dense fibre element catches sub-micron droplets of oil and water and lets them merge (coalesce) into drops large enough to drain. Parker rates its 12F Prep-Air II coalescing element (Grade 6) at <strong>0.01 µm</strong>; Norgren also publishes a 0.01 µm grade in the Excelon Plus range. Because a coalescing element is fine enough to clog quickly on bulk water and dirt, it is normally installed after a general-purpose filter rather than instead of one.</p><p>Oil <em>vapour</em> and odour pass a coalescer; removing them takes an activated-carbon element after it, such as Norgren’s Plus 84 vapour-removal filters.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Filter types on an air line (ratings quoted by maker; check the part’s own data)',
      columns: ['Filter type', 'What it removes', 'Published ratings', 'Where it goes'],
      rows: [
        { cells: ['General-purpose / particulate', 'Liquid water and solid particles above the element rating', 'Norgren Excelon Plus: 40 µm or 5 µm', 'First element of every FRL'], highlight: true },
        { cells: ['Coalescing', 'Oil and water aerosols, fine particles', 'Parker 12F Grade 6: 0.01 µm; Norgren Excelon Plus: 0.01 µm', 'After a particulate filter; before sensitive valves, paint, instruments'] },
        { cells: ['Vapour removal (activated carbon)', 'Oil vapour and odour', 'Rated by the maker per element', 'After a coalescing filter'] },
        { cells: ['Main-line filter', 'Bulk water, dirt and aerosols at compressor flow', 'Rated by the maker per element and flow', 'In the main header, near the receiver or dryer'] },
      ],
    },
    {
      type: 'prose',
      html: '<h3>Drains: manual, semi-automatic and automatic</h3><p>The water a filter separates collects in the bowl, and it has to leave before it reaches the baffle — once the bowl is full, the next slug of water goes straight downstream. There are three ways to get it out:</p><ul><li><strong>Manual drain.</strong> A twist or push valve at the bottom of the bowl. Fine for a dry supply and a disciplined maintenance round.</li><li><strong>Semi-automatic drain.</strong> Opens when air pressure is removed from the bowl, so the bowl empties every time the line is shut down.</li><li><strong>Automatic (float) drain.</strong> A float opens the drain when the water reaches a set level, under pressure. Parker offers its 12F filters with a manual twist drain or an automatic float drain; Norgren describes its Excelon Plus automatic drain as releasing water once it reaches a pre-set level.</li></ul><p>On main lines and receivers, where the water volume is far larger than a bowl can take, use a dedicated condensate drain: we list Dynaquip timed electric auto drains, Ingersoll Rand zero-loss electric drains, SMC automatic drains and Conrader cable-operated drain valves.</p>',
    },

    { type: 'section_head', number: '/03', title: 'Regulators: relieving and non-relieving.', anchor: 'regulators' },
    {
      type: 'prose',
      html: '<p>A regulator balances a spring, which you set with the knob, against the downstream pressure acting on a diaphragm or piston. When downstream pressure falls, the spring opens the valve and lets more air through; when it rises to the setting, the valve closes.</p><p>The difference between the two types is what happens when downstream pressure ends up <em>above</em> the setting — because someone turned the knob down, or because a cylinder was pushed back against a closed port and compressed the air behind it.</p><ul><li>A <strong>relieving</strong> regulator has a small vent through the centre of the diaphragm. Excess downstream pressure lifts the diaphragm off its seat and bleeds to atmosphere through the bonnet until the pressure is back at the setting. Turn the knob down and the gauge follows. This is the usual choice for machine supplies. Dixon lists replacement diaphragm relieving kits for its Series 1 regulators.</li><li>A <strong>non-relieving</strong> regulator has no vent. Downstream pressure above the setting stays trapped until something downstream uses or exhausts it.</li></ul><p>The shelf also carries precision regulators (ARO), stainless steel regulators (Parker PR11), electronic proportional regulators set by a control signal (Parker P32P) and SMC booster regulators.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A relieving regulator is not a lockout.',
      body: 'Turning a relieving regulator to zero does not isolate the supply or empty the cylinders and pilot lines downstream. Isolating a machine needs a lockable shut-off that exhausts the downstream side, and a check that no air is trapped behind closed valves.',
    },

    { type: 'section_head', number: '/04', title: 'Lubricated or non-lubricated air.', anchor: 'lubrication' },
    {
      type: 'prose',
      html: '<p>Older pneumatic valves, cylinders and nearly all air tools were built to run on oiled air, and a lubricator was standard. Most current automation components are not: valves and cylinders leave the factory with their seals greased and are designed to run on clean, non-lubricated air. That is cheaper, cleaner and better for anything downstream that must not see oil — packaging, paint, food, instruments.</p><p>The catch is that the decision is one-way. SMC’s handling precautions say that if lubrication is supplied, the original lubricant applied during manufacture will be washed away, so lubrication must continue — without it, malfunctions could occur. SMC specifies class 1 turbine oil ISO VG32 with no additives (or an approved class 2 oil) and tells users not to add additives of their own. Water does the same damage from the other side: the Compressed Air Challenge notes that moisture in compressed air causes rust and increased wear in valves, solenoid valves and air motors because it washes away lubrication.</p><p>So decide per line: equipment commissioned on oil keeps a filled lubricator; a machine built on non-lubricated components gets an F and an R, and nobody adds an L later “to help”.</p><h3>Oil-fog and micro-fog</h3><p>Lubricators come in two patterns. In an <strong>oil-fog</strong> type the drops you see falling in the sight dome go downstream as relatively large particles, suited to a short run to a single tool or cylinder. In a <strong>micro-fog</strong> (or micro-mist) type the oil is atomised and only the finest particles go downstream; those travel further and divide more evenly, which suits long lines and manifolds feeding several valves. We list both patterns from Dixon, plus Norgren micro-fog, Parker 16L Micro-Mist and SMC micromist lubricators.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Bowls, bowl guards and metal bowls.', anchor: 'bowls' },
    {
      type: 'prose',
      html: '<p>Most filter and lubricator bowls are transparent polycarbonate so you can see the water level and the oil. Polycarbonate is tough, but it is a plastic, and its limits are lower than a metal bowl’s. Parker’s figures for the 12F Prep-Air II filter make the difference plain:</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Bowl limits as published for specific series — other series and makers differ',
      columns: ['Bowl', 'Temperature', 'Maximum pressure', 'Source'],
      rows: [
        { cells: ['Polycarbonate with metal guard', '−25 to 52 °C (−13 to 125 °F)', '150 psig (10.3 bar)', 'Parker 12F Prep-Air II'] },
        { cells: ['Metal (zinc)', '−25 to 65.5 °C (−13 to 150 °F)', '250 psig (17.2 bar)', 'Parker 12F Prep-Air II'], highlight: true },
        { cells: ['Polycarbonate', '−10 to +60 °C', '10 bar', 'Norgren Excelon Plus'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Three practical rules follow.</p><ul><li><strong>Check the chemical list.</strong> Every maker that sells a polycarbonate bowl publishes the chemicals that attack it. Compare it with the compressor oil, any solvent or cleaner used near the machine, and anything sprayed in the area. If the list rules any of them out, use a metal bowl.</li><li><strong>Keep the guard on.</strong> A bowl guard is there to hold the pieces if a bowl fails under pressure. Parker’s 12F, for example, wraps its polycarbonate bowl in a metal guard.</li><li><strong>Mind the heat.</strong> On Gulf sites an FRL mounted in direct sun, on a compressor skid or next to a hot process can run well above room temperature. Where it may approach the polycarbonate limit, choose a metal bowl with a sight glass.</li></ul><p>Replacement Dixon and Groz bowls and guards are on the shelf.</p>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Exhaust the unit before you remove a bowl.',
      body: 'A filter or lubricator bowl is a small pressure vessel. Shut off and exhaust the supply, and confirm on the gauge that the unit is at zero, before unscrewing a bowl, changing an element or refilling a lubricator. Replace a bowl that is crazed, cloudy or cracked rather than returning it to service, and never run a polycarbonate bowl without its guard.',
    },

    { type: 'section_head', number: '/06', title: 'Sizing: flow at an allowable pressure drop.', anchor: 'sizing' },
    {
      type: 'prose',
      html: '<p>Every element in an FRL takes some pressure out of the air passing through it, and the faster the air flows, the more it takes. An FRL that looks fine on the gauge when the machine is idle can sag badly when three cylinders stroke at once — and the cylinders then run slow and push less than they were sized for.</p><p>So the sizing question is not “what is the port size?” but “<strong>how much flow, in scfm or l/min, must this unit pass at peak, and how much pressure drop can the machine accept at that flow?</strong>” Makers answer it with a flow chart or a flow figure at stated conditions — an inlet pressure and a pressure drop. Read the chart at your peak flow, check the drop is acceptable, and compare units only at the same conditions.</p><p>The element grade matters as much as the body. Parker publishes the 12F coalescing filter at 75 scfm with its Grade 6 (0.01 µm) element on a 1/2" port and 125 scfm with its coarser Grade 10 element on the same port. The finer the element, the less it passes in the same housing — so a coalescing filter often has to be a size larger than the regulator next to it.</p><p>In service, a filter’s pressure drop rises as the element loads with dirt — which is why some filters carry a differential pressure indicator — and a regulator’s outlet pressure falls as flow rises.</p><h3>Modular vs combination units</h3><p>A <strong>combination</strong> unit is a pre-assembled FRL or filter-regulator under one part number. We list them from Dixon, ARO, Wilkerson, Norgren, Metal Work, Nitra, Groz, Boston Gear, Thern and Texas Pneumatic Tools (including portable FRL systems).</p><p>A <strong>modular</strong> system is built from individual units that clamp together, so the stack can be configured per machine — filter, coalescer, regulator, lubricator, soft-start and dump — and one module replaced without disturbing the rest. Parker’s Global series (P31 mini, P32 compact, P33 standard) and Metal Work Syntesi work this way, and the same modular soft-start, dump and lockout valves fit the stack. Close-nippled units, such as Parker’s 06G and 06H filter/regulators, join the elements with short pipe nipples instead.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Which air preparation does this line need?',
      branches: [
        { condition: 'General machine air, non-lubricated valves and cylinders?', outcome: 'Filter-regulator, 40 µm or 5 µm element, relieving regulator, automatic drain.' },
        { condition: 'Air tools or equipment commissioned on oiled air?', outcome: 'Full FRL with a lubricator — and keep it filled. Oil-fog for one tool on a short run; micro-fog for long lines or manifolds.' },
        { condition: 'Paint, instruments, packaging or anything that must not see oil?', outcome: 'Particulate filter, then 0.01 µm coalescing filter, then regulator. No lubricator. Add a vapour-removal filter for odour-free air.' },
        { condition: 'FRL in direct sun, on a compressor skid or near solvents?', outcome: 'Metal bowls with sight glasses, or check the polycarbonate temperature and chemical limits first.' },
        { condition: 'Machine needs safe start-up and isolation?', outcome: 'Modular stack with lockout, soft-start and dump valves alongside the FRL.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the correct order for a filter, regulator and lubricator?', answer: 'In the direction of flow: filter, then regulator, then lubricator. The filter protects the regulator; the lubricator goes last so no filter downstream removes the oil it adds.' },
        { question: 'What micron filter do I need for compressed air?', answer: 'For general machine air, a 40 µm or 5 µm particulate element — Norgren publishes both. To remove oil and water aerosols, add a coalescing filter after it; Parker and Norgren rate theirs at 0.01 µm.' },
        { question: 'Do pneumatic cylinders and valves need a lubricator?', answer: 'Most modern valves and cylinders are pre-lubricated and are designed to run on non-lubricated air. Air tools and older equipment usually need oil. Once a component has been run on oiled air, keep it lubricated — SMC warns that the factory lubricant is washed away and malfunctions can follow if oil stops.' },
        { question: 'What is the difference between a relieving and non-relieving regulator?', answer: 'A relieving regulator vents downstream pressure that rises above its setting through a hole in the diaphragm, so turning the knob down lowers the outlet pressure. A non-relieving regulator has no vent, so excess pressure stays trapped until it is used downstream.' },
        { question: 'What temperature can a polycarbonate filter bowl take?', answer: 'It depends on the series. Parker gives −25 to 52 °C at up to 150 psig for its 12F polycarbonate bowl, against 65.5 °C and 250 psig for the metal bowl; Norgren lists Excelon Plus at −10 to +60 °C and 10 bar. Check the part’s own data and its chemical list.' },
        { question: 'How do I size an FRL?', answer: 'By flow, not port size. Work out the peak flow the machine draws, then use the maker’s flow chart to choose a unit that passes it at a pressure drop the machine can accept. Finer elements pass less flow in the same body.' },
      ],
    },

    { type: 'section_head', number: '/07', title: 'What we list.', anchor: 'what-we-list' },
    {
      type: 'prose',
      html: '<p>Every listing on our filters, regulators and lubricators shelf, by maker part number under the maker’s own brand. First, the Parker and Wilkerson ranges:</p>' + stockListBy(FRL, ['Parker Hannifin', 'Wilkerson']),
    },
    {
      type: 'prose',
      html: '<p>And every other maker on the shelf — ARO, Norgren, Dixon, SMC, Metal Work, Nitra, Ingersoll Rand, Hankison, Texas Pneumatic Tools, Boston Gear, Groz, Numatics and the rest:</p>' + stockListBy(FRL, OTHER_BRANDS),
    },
    {
      type: 'product_embed',
      heading: 'Filters, regulators and lubricators',
      skus: [
        'IH-PAR-P32-COMPACT-GLOBAL-MODULAR-FILTER-REGULATORS',
        'IH-PAR-P32-COMPACT-GLOBAL-MODULAR-COALESCING-FILTERS',
        'IH-NOR-EXCELON-PLUS-84-SERIES-AIR-COMBINATION-FILTER-REG',
        'IH-WLK-C28-SERIES-FILTER-REGULATOR-LUBRICATORS',
        'IH-ARO-2000-SERIES-FILTER-REGULATOR-LUBRICATORS',
        'IH-MWK-SYNTESI-SERIES-FILTER-REGULATOR-LUBRICATORS',
        'IH-DIX-FRL-COMBINATIONS',
        'IH-SMC-AL-SERIES-LUBRICATOR',
      ],
    },
    { type: 'category_link', slug: 'air-preparation-frl', label: 'Filters, regulators & lubricators', blurb: 'FRL units, filter-regulators, coalescing filters, lubricators, elements, bowls and drains.' },
    { type: 'category_link', slug: 'pneumatic-safety-lockout-valves', label: 'Safety, soft-start & lockout valves', blurb: 'Lockout, soft-start and dump valves that sit alongside the FRL, and receiver safety valves.' },
    { type: 'category_link', slug: 'pneumatics', label: 'All pneumatics', blurb: 'Cylinders, valves, tubing, fittings, grippers, vacuum and air motors.' },
    {
      type: 'related_articles',
      slugs: [
        'compressed-air-quality-iso-8573-1',
        'air-safety-relief-soft-start-and-lockout-valves',
        'sizing-pneumatic-valves-flow-cv',
        'solenoid-valve-functions-3-2-5-2-5-3',
        'pneumatic-tubing-materials-guide',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Element ratings, bowl limits and flow figures from Parker 12F and Norgren Excelon Plus published data; lubrication rule from SMC’s handling precautions. Figures differ by series — check the part’s data sheet.',
    },
    {
      type: 'cta_block',
      heading: 'Specifying air preparation for a machine?',
      body: 'Send the maker part number, or the port size, peak flow, working pressure, whether the line is lubricated and where the unit will be mounted. We will quote the FRL, elements and drains by maker part number.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
