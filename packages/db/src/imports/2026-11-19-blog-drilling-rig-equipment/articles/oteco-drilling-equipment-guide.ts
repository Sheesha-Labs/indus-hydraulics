import type { BlogArticleSeed } from '../shared'

/**
 * Hub article for the Oteco range. Sources: Oteco Products Brochure (overview), Oteco brochures for the
 * Model 72 and DM gate valves, PRV and RRV relief valves, pressure gauges, float valves, fluid-end parts,
 * manifold fittings and rig hardware (all transcribed in _raw/brochure-review.md); listing facts from
 * _faq/facts/ oteco-gate-valves, oteco-gate-valve-spares, oteco-relief-valves, oteco-pressure-gauges,
 * oteco-float-valves, oteco-fluid-end, oteco-swivel-washpipe, oteco-bop-rubber, oteco-manifold-fittings,
 * oteco-rig-floor and oteco-rig-hardware. ISO 9001: Oteco Inc. company certification (gate-valve-spares FAQ facts).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oteco-drilling-equipment-guide',
  title: 'Oteco drilling and wellsite equipment: the range, and how to order it in the Middle East',
  excerpt:
    'Oteco Inc. of Houston makes the consumable and wear parts of a drilling rig: mud gate valves, relief valves, gauges, pump pistons, float valves, wipers, BOP rubbers and more. A guide to the range by family, how to identify a part, and how to order it from an authorised Oteco distributor in the UAE.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Oteco Distributor UAE: Drilling Equipment',
  seoDescription:
    'Oteco drilling and wellsite equipment by family: gate and relief valves, gauges, pump pistons, float valves, wipers, BOP rubbers. Authorised UAE distributor.',
  focusKeyword: 'Oteco distributor UAE',
  publishedAt: '2026-11-19T08:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Oteco Inc. makes drilling and wellsite equipment in Houston, Texas, and holds ISO 9001 certification. Indus Hydraulics is an authorised Oteco distributor for the Middle East, with Oteco stock at our warehouse in Dubai.',
        'The range covers four jobs: controlling pressure (gate valves, relief valves, gauges), the mud pump fluid end (pistons, valves and seats, dampener diaphragms, float valves), the rig floor (wipers, mud guards, washpipe) and BOP rubber and manifold fittings.',
        'Oteco parts are made to fit equipment from other makers, and in a few cases Oteco publishes a direct interchange. Where it does not, we match by the Oteco part number or the equipment model, not by guesswork.',
        'To order, send the Oteco part number from the nameplate, or the model, size, pressure, end connection and service. We confirm the part before it ships.',
      ],
    },
    {
      type: 'lead',
      html: 'A drilling rig runs on parts that wear out on a schedule: valve seats, pump pistons, wiper rubbers, packing, gauges. Oteco makes a broad range of them, and a maintenance planner who knows the families can usually find a part in one search instead of five. This guide walks through the range family by family, shows where to read more, and explains what we need to quote.',
    },

    { type: 'section_head', number: '/01', title: 'Who Oteco is and how we supply it.', anchor: 'who' },
    {
      type: 'paragraph',
      html: 'Oteco Inc. makes its equipment in Houston, Texas, including its own rubber compounds and moulded products, and holds ISO 9001 certification as a company. Indus Hydraulics is an authorised Oteco distributor for the Middle East. We keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide. The full range is on our <a href="/brands/oteco">Oteco brand page</a>, and everything below is listed on our shelves with its Oteco part numbers.',
    },
    {
      type: 'paragraph',
      html: 'Hydril, Shaffer, Regan, Cameron, Grayloc, Weco and the other makes named in this guide are trademarks of their owners. Oteco parts are replacement parts made to fit that equipment; Indus Hydraulics is not affiliated with those makers.',
    },

    { type: 'section_head', number: '/02', title: 'Controlling pressure: valves and gauges.', anchor: 'pressure' },
    {
      type: 'paragraph',
      html: '<strong>Gate valves.</strong> Oteco makes two mud gate valves. The <a href="/p/oteco-model-72-gate-valve-2-inch">Model 72</a> is a rising-stem valve from 2 to 5 inches at 2,000, 3,000 and 5,000 psi, with replaceable body subs for the end connections; Oteco states that its parts interchange with Cameron Type ‘S’ Flex-Seal parts. The <a href="/p/oteco-dm-gate-valve-2-inch">DM</a> is an in-line repairable valve that reaches 7,500 psi. Which to choose is covered in <a href="/blog/model-72-vs-dm-gate-valve">Model 72 or DM</a>, and the repair parts in <a href="/blog/rebuilding-a-model-72-gate-valve">rebuilding a Model 72</a> and our guide to <a href="/blog/mud-gate-valve-repair-kits">mud gate valve repair kits</a>.',
    },
    {
      type: 'paragraph',
      html: '<strong>Relief valves.</strong> The PRV is a shear-pin valve; the RRV (Type RR) is a manual-reset valve with no pins. Both protect mud pumps and mud manifolds. <a href="/blog/shear-pin-vs-reset-relief-valve">Shear-pin or reset relief valve</a> compares them, and <a href="/blog/oilfield-pressure-relief-valves">oilfield pressure relief valves</a> puts them in the wider picture.',
    },
    {
      type: 'paragraph',
      html: '<strong>Pressure gauges.</strong> The Model 6, 7 and 8 gauges differ in dial case size, range and sub, and come in standard, sour gas (H2S) and salt water trims. See <a href="/blog/drilling-pressure-gauge-models">drilling pressure gauge models</a>, and the general guides to <a href="/blog/pressure-gauge-guide">pressure gauges</a> and <a href="/blog/how-to-choose-a-pressure-gauge-range">choosing a gauge range</a>.',
    },

    { type: 'section_head', number: '/03', title: 'The mud pump fluid end and the drill string.', anchor: 'fluid-end' },
    {
      type: 'paragraph',
      html: 'The fluid end is where the abrasive mud does its damage. Oteco makes <a href="/p/oteco-double-acting-mud-pump-pistons">double-acting</a> and <a href="/p/oteco-single-acting-mud-pump-pistons">single-acting</a> pistons in premium and bonded urethane constructions, in series A, B, K and L; premium <a href="/p/oteco-mud-pump-valves-seats">valves and seats</a>; and diaphragms for Hydril and Mattco K-10 and K-20 <a href="/p/oteco-pulsation-dampener-diaphragms-parts">pulsation dampeners</a>. Oteco states that its premium pistons interchange with other API-design pistons. Start with <a href="/blog/mud-pump-pistons-explained">mud pump pistons explained</a> and <a href="/blog/mud-pump-valves-and-dampener-diaphragms">mud pump valves and dampener diaphragms</a>.',
    },
    {
      type: 'paragraph',
      html: 'In the string, the drill pipe <a href="/p/oteco-drill-pipe-float-valve-plunger">plunger</a> (F, FC, FA) and <a href="/p/oteco-drill-pipe-float-valve-flapper">flapper</a> (G, GA, GC, GCA) float valves stop mud and well fluid coming back up the pipe; see <a href="/blog/drill-pipe-float-valve-models">drill pipe float valve models</a>. At the top of the string, Oteco makes washpipe and packing for swivels from Skytop Brewster, Emsco, Gray, National, Ideco, Oilwell, King and Gardner-Denver, covered in <a href="/blog/swivel-washpipe-and-packing">swivel washpipe and packing</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Rig floor, BOP rubber and manifold fittings.', anchor: 'rig-floor' },
    {
      type: 'paragraph',
      html: 'On the rig floor, Oteco makes <a href="/p/oteco-single-pipe-wipers">pipe wipers</a>, square and hexagonal kelly wipers, and the MG-500, MG-600 and MG-800 mud and oil guards; see <a href="/blog/pipe-wipers-and-mud-guards">pipe wipers and mud guards</a>. For well control it moulds <a href="/p/oteco-hydril-annular-bop-packing-units">annular BOP packing units</a> for Hydril GK, GKM and MSP preventers, units for Shaffer spherical and Regan Type K, and rotating-head stripper rubbers, in natural rubber, nitrile and neoprene. The choice of compound is in <a href="/blog/annular-bop-packing-unit-compounds">annular BOP packing unit compounds</a>, and the bigger picture in <a href="/blog/ram-vs-annular-bop">ram vs annular BOP</a>.',
    },
    {
      type: 'paragraph',
      html: 'Oteco’s long-sweep <a href="/p/oteco-90-degree-long-sweep-ells">manifold fittings</a> (ells, tees, crosses, Y fittings and standpipe goosenecks) are castings rated by their end connection, explained in <a href="/blog/manifold-fitting-pressure-ratings">manifold fitting pressure ratings</a>. Related background is in <a href="/blog/flow-iron-explained">flow iron explained</a> and <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>. The rig hardware shelf adds wireline guides and turnbacks, impact box wrenches and roller chain connectors, and the OTECO Connector, which Oteco states is interchangeable with Grayloc clamp connectors.',
    },

    { type: 'section_head', number: '/05', title: 'The range at a glance.', anchor: 'range' },
    {
      type: 'comparison_table',
      caption: 'Oteco families, what they do and where to read more',
      columns: ['Family', 'What it covers', 'Read next'],
      rows: [
        { cells: ['Mud gate valves', 'Model 72 (2 to 5 in, to 5,000 psi) and DM (to 7,500 psi)', 'Model 72 or DM'] },
        { cells: ['Relief valves', 'PRV shear-pin and RRV manual reset, 2 and 3 in', 'Shear-pin or reset'] },
        { cells: ['Pressure gauges', 'Models 6, 7 and 8; standard, sour gas (H2S), salt water', 'Gauge models'] },
        { cells: ['Fluid end', 'Pistons, valves and seats, dampener diaphragms', 'Pistons explained'] },
        { cells: ['Float valves', 'Plunger (F, FC, FA) and flapper (G, GA, GC, GCA)', 'Float valve models'] },
        { cells: ['Washpipe and packing', 'For eight named swivel makers, plus others', 'Washpipe and packing'] },
        { cells: ['Rig floor', 'Pipe and kelly wipers, MG-500, MG-600 and MG-800 guards', 'Wipers and guards'] },
        { cells: ['BOP rubber', 'Hydril, Shaffer and Regan packing units; stripper rubbers', 'Packing compounds'] },
        { cells: ['Manifold fittings', 'Long-sweep ells, tees, crosses, goosenecks, 3,000 to 8,000 psi', 'Fitting ratings'] },
      ],
    },

    { type: 'section_head', number: '/06', title: 'How to order, and what we confirm.', anchor: 'order' },
    {
      type: 'prose',
      html: '<ul><li><strong>Best:</strong> the Oteco part number from the nameplate, the old part or your bill of materials.</li><li><strong>Otherwise:</strong> the model of the equipment the part goes in (for a valve, the Model 72 or DM model number; for a piston, the liner size, series and rod fit; for washpipe, the swivel model), plus size, pressure, end connection and service.</li><li><strong>Service matters.</strong> Standard, sour gas (H2S) and salt water or waterflood trims use different materials. Say which you run.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Some data is decoded, not stated.',
      body: 'Where a source row names no equipment, we have inferred it. Some washpipe makes are inferred from Oteco’s code groups, and piston sizes are decoded from the part code. We confirm against your part number, pump or swivel before shipping.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is Indus Hydraulics an authorised Oteco distributor?', answer: 'Yes, for the Middle East. We hold Oteco stock in Dubai and supply the maker’s documentation and part numbers with each order.' },
        { question: 'Can I order by the old part’s number?', answer: 'Yes, if it is an Oteco number. For another maker’s part, send the make, model and size; Oteco publishes interchanges for only some products, and we say so rather than guess.' },
        { question: 'Does Oteco make equipment to order?', answer: 'Some items are quoted to order: the OTECO Connector, for which we need size, pressure, temperature, service, end preparation and materials, and the jack-up shock pads, made to your drawing and load.' },
        { question: 'Where do I start for a mud pump rebuild?', answer: 'Send the pump model, liner size and rod fit. Pistons, rubbers, hubs, valves, seats and dampener diaphragms are on the fluid end shelf, and we match each by Oteco part number.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Where most orders start',
      skus: [
        'IH-OTC-M72-4',
        'IH-OTC-DM-3',
        'IH-OTC-RRV-3-5K',
        'IH-OTC-PG6-SD',
        'IH-OTC-PST-DA',
        'IH-OTC-FV-PLUNGER',
        'IH-OTC-WP-NATIONAL',
        'IH-OTC-BOP-HYDRIL',
      ],
    },
    { type: 'category_link', slug: 'oilfield-gate-valves', label: 'Gate valves', blurb: 'Oteco Model 72 and DM mud gate valves, 2 to 5 inch.' },
    { type: 'category_link', slug: 'mud-pump-fluid-end-parts', label: 'Mud pump fluid end parts', blurb: 'Pistons, valves, seats and dampener diaphragms.' },
    { type: 'category_link', slug: 'rig-floor-consumables', label: 'Rig floor consumables', blurb: 'Pipe and kelly wipers, mud guards and straps.' },
    {
      type: 'related_articles',
      slugs: [
        'model-72-vs-dm-gate-valve',
        'shear-pin-vs-reset-relief-valve',
        'mud-pump-pistons-explained',
        'cementing-and-drilling-fluid-equipment',
        'oilfield-check-valves-explained',
      ],
    },
    {
      type: 'cta_block',
      heading: 'Need an Oteco part quoted?',
      body: 'Send the Oteco part number, or the model, size, pressure and service. We keep Oteco stock at our warehouse in Dubai, UAE, and ship worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
