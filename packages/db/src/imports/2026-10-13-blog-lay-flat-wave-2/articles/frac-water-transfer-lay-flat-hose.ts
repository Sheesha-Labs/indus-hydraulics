import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Frac water transfer with large-bore lay flat hose, with the GCC context (Jafurah, Oman tight gas).
 * Field facts: Aramco (Jafurah status and scale), Arab News 2023 (desalination plant), Reuters via
 * Fox Business (treated seawater), BP (Khazzan), USGS (water per well). Friction figures are
 * Hazen–Williams estimates (C = 140) on the actual IDs of IH-LF-TDW, labelled as estimates.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'frac-water-transfer-lay-flat-hose',
  title: 'Frac water transfer with lay flat hose: sizing, pressure and layout for GCC well pads',
  excerpt:
    'A fractured gas well can take millions of litres of water, delivered at rates of 40 to 100+ barrels a minute. Large-bore lay flat hose moves it from pond to pad faster than any temporary pipe. How to size the line, what pressure it must carry, which couplings hold, and what changes when the water is treated seawater — as at Saudi Arabia’s Jafurah field.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Frac Water Transfer Hose: Lay Flat Sizing, Pressure and Layout',
  seoDescription:
    'How to size and lay out a 10", 12", 14" or 16" lay flat frac water line: flow in barrels a minute, friction loss per kilometre, working pressure, couplings, road crossings and seawater service in GCC gas fields.',
  focusKeyword: 'frac water transfer hose',
  publishedAt: '2026-10-13T17:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Frac water lines are usually 10" to 16" TPU lay flat hose, laid from a pond or water source to the frac spread and recovered after the job.',
        'Size on the peak rate the frac crew needs: at 80 barrels a minute a 12" line loses roughly 2 bar per kilometre; a 10" loses about 5.',
        'Working pressure is 14 bar for our 10" to 14" transfer hose and 10 bar at 16" — check the transfer pump against it, including surge.',
        'Couplings set the limit as often as the hose: use high-pressure male × female, grooved or flanged couplings rated for the line.',
        'Treated seawater, as planned at Jafurah, is no problem for TPU and polyester — but choose stainless rather than aluminium couplings for long saline service.',
      ],
    },
    {
      type: 'lead',
      html: 'Hydraulic fracturing is a water business before it is anything else. The US Geological Survey puts the median water use of a horizontally fractured gas well at more than 5 million US gallons — about 19,000 m³ — and the frac crew wants it delivered at the rate the blender demands, not the rate a truck fleet can manage. That is why, from the Permian to the Arabian Peninsula, the last few kilometres to the well pad are usually laid in large-bore lay flat hose.',
    },

    { type: 'section_head', number: '/01', title: 'Frac water in the Gulf.', anchor: 'gcc' },
    {
      type: 'paragraph',
      html: 'Saudi Aramco began producing gas from <strong>Jafurah</strong>, the kingdom’s unconventional gas field, in December 2025. Aramco describes a 17,000 km² field holding an estimated 229 trillion cubic feet of raw gas, with sales gas planned to reach 2 billion cubic feet a day by 2030 — and every well is hydraulically fractured. Rather than draw on scarce groundwater, Aramco has said it will frac with lightly treated <strong>seawater</strong>, supplied from a dedicated desalination and treatment plant with a design capacity of 80,000 m³ a day and a distribution network running some 200 km to the field.',
    },
    {
      type: 'paragraph',
      html: 'In Oman, BP’s Khazzan and Ghazeer tight-gas developments in Block 61 are built on horizontal wells and hydraulic fracturing, with hundreds of wells planned, and PDO has its own tight-gas projects. Whatever the source — seawater, treated produced water or a brackish well — the last link from the storage pond or tank farm to the frac spread is a temporary line that has to go down quickly, carry a high rate and come back up when the pad is finished.',
    },
    {
      type: 'direct_answer',
      question: 'What hose is used for frac water transfer?',
      answer:
        'Large-bore lay flat hose — usually 10" to 16" TPU lay flat with a woven polyester jacket — is the standard frac water transfer line. It is laid from a reel or hose truck between the water source and the frac spread, carries 40 to 100+ barrels a minute, and is drained and recovered after the job.',
    },

    { type: 'section_head', number: '/02', title: 'Why lay flat beats temporary pipe.', anchor: 'why-lay-flat' },
    {
      type: 'paragraph',
      html: 'The alternatives are trucks, aluminium or steel temporary pipe, and HDPE. Trucks are slow and expensive per barrel. Rigid pipe needs a joint every few metres and a crew to make them. HDPE must be fused and is hard to recover. A <a href="/p/tpu-lay-flat-dewatering-hose">TPU lay flat transfer hose</a> comes in lengths of up to 400 m, so a 3 km line has fewer than ten couplings; it pays off a reel at walking pace or faster, follows the ground, and rolls back flat for the next pad. At 4.6 kg/m for a 12" hose, a whole kilometre weighs less than five tonnes. Our comparison of <a href="/blog/lay-flat-hose-vs-hdpe-pipe">lay flat hose and HDPE pipe</a> covers where the balance tips the other way.',
    },

    { type: 'section_head', number: '/03', title: 'Sizing the line.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'Start from the peak rate the frac crew needs at the blender, in barrels per minute (1 bbl/min ≈ 9.5 m³/h), and the length of the line. The pump has to overcome friction along the hose plus any rise in ground level. Friction rises with roughly the square of the flow and falls steeply with bore, so one size up often halves the loss — and a smaller pump, or none at the midpoint, can do the job.',
    },
    {
      type: 'comparison_table',
      caption: 'Estimated friction loss per kilometre of TPU lay flat transfer hose (Hazen–Williams, C = 140, actual inside diameters)',
      columns: ['Flow', '10" (254 mm)', '12" (305 mm)', '14" (355 mm)', '16" (405 mm)'],
      rows: [
        { cells: ['40 bbl/min (≈ 380 m³/h)', '1.4 bar/km', '0.6 bar/km', '0.3 bar/km', '0.1 bar/km'] },
        { cells: ['60 bbl/min (≈ 570 m³/h)', '2.9 bar/km', '1.2 bar/km', '0.6 bar/km', '0.3 bar/km'] },
        { cells: ['80 bbl/min (≈ 760 m³/h)', '5.0 bar/km', '2.0 bar/km', '1.0 bar/km', '0.5 bar/km'], highlight: true },
        { cells: ['100 bbl/min (≈ 950 m³/h)', '7.5 bar/km', '3.1 bar/km', '1.5 bar/km', '0.8 bar/km'] },
        { cells: ['120 bbl/min (≈ 1,150 m³/h)', '10.5 bar/km', '4.3 bar/km', '2.1 bar/km', '1.1 bar/km'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two worked cases. A <strong>4 km line at 80 bbl/min</strong> in 12" hose loses about 8 bar to friction — within the 14 bar working pressure with room for a modest rise in ground and for surge. The same line in 10" would need about 20 bar, beyond the hose, and would need a booster pump part-way. In 16" it loses about 2 bar, but 16" is rated 10 bar, so it suits long, flat runs at lower pump pressure. These are estimates for clean water on level ground; add elevation (1 bar per 10 m of rise) and check the pump curve. Our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a> explains the method.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Velocity and surge.',
      body: 'At 100 bbl/min a 10" line runs at over 5 m/s. A valve closed quickly at that speed, or a transfer pump tripping, sends a pressure wave down the line that can exceed working pressure. Start and stop pumps gradually, use slow-closing valves, and keep the steady-state pressure well below the rating so surge has somewhere to go.',
    },

    { type: 'section_head', number: '/04', title: 'Pressure: hose, coupling and pump.', anchor: 'pressure' },
    {
      type: 'paragraph',
      html: 'Our TPU transfer hose is rated 14 bar working from 6" to 14" (15 bar at 8") and 10 bar at 16", with burst at three times working. The rating that matters is at the pump discharge, where pressure is highest. The line is only as strong as its weakest coupling, so check that too: a <a href="/p/high-pressure-lay-flat-hose-coupling">high-pressure male × female coupling</a> (4" to 12", each one air leak-tested) is built for frac and high-head lines, while <a href="/p/large-bore-lay-flat-grooved-coupling">grooved</a> and <a href="/p/large-bore-flanged-lay-flat-coupling">flanged</a> couplings join the hose to pumps, manifolds and frac tanks. See <a href="/blog/lay-flat-hose-pressure-ratings">how lay flat pressure ratings work</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Laying out the line.', anchor: 'layout' },
    {
      type: 'prose',
      html: '<ol><li><strong>Walk the route first.</strong> Avoid sharp rock, pipeline markers, flare areas and anything hot. Keep bends wide — a kink in a 12" hose under pressure is a burst waiting to happen.</li><li><strong>Lay it out flat and straight</strong> before charging. Never pressurise hose still on the reel.</li><li><strong>Protect every road crossing</strong> with a hose ramp or bury it in a shallow trench with a cover. Vehicles driven over a charged hose crush the jacket.</li><li><strong>Fill slowly</strong> with a vent open at the high point to let air out. Trapped air makes the line surge.</li><li><strong>Patrol it.</strong> Wind, traffic and animals move hose; a walk-down each shift catches abrasion and coupling leaks early.</li></ol>',
    },
    {
      type: 'figure',
      imageId: FIG['fig-hose-ramp'],
      captionPrefix: 'FIG. 01',
      caption: 'A hose ramp keeps service traffic off a charged transfer line where it crosses a site road.',
      aspectRatio: '16/9',
    },

    { type: 'section_head', number: '/06', title: 'Seawater and produced water.', anchor: 'water-quality' },
    {
      type: 'paragraph',
      html: 'TPU and polyester do not corrode, so saline water is no threat to the hose itself. The couplings are another matter: anodised aluminium is fine for a few weeks, but on a line that will carry treated seawater for months, specify stainless steel shanks and clamps, flush with fresh water before storage, and inspect seals. Produced or flowback water can carry hydrocarbons, solids and dissolved gases; TPU resists oils and abrasion well, but tell us the analysis so we can confirm compatibility — and treat any line carrying flowback as a hydrocarbon service, with an <a href="/p/antistatic-tpu-lay-flat-fuel-hose">antistatic hose</a> where the hazard assessment calls for one.',
    },

    { type: 'section_head', number: '/07', title: 'Recovery and reuse.', anchor: 'recovery' },
    {
      type: 'paragraph',
      html: 'When the pad is finished, drain the line from the high points, then wind it onto reels from the far end so the rolling pushes out what is left. A <a href="/p/portable-lay-flat-hose-winder">portable winder</a> handles short lengths of 6" to 12"; long transfer lines go back onto truck- or trailer-mounted reels. Flush lines that carried saline or produced water, inspect the cover for abrasion along the edges, and store out of the sun — see <a href="/blog/lay-flat-hose-in-gulf-heat">lay flat hose in Gulf heat</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What size lay flat hose is used for frac water?', answer: '10", 12" and 16" are the common frac transfer sizes. 12" carries 60 to 80 barrels a minute over several kilometres with moderate friction loss; 16" suits higher rates or longer runs at lower pressure.' },
        { question: 'How many barrels a minute can a 12" lay flat hose carry?', answer: 'There is no fixed limit — the question is friction loss. At 80 bbl/min a 12" line loses roughly 2 bar per kilometre; at 120 bbl/min about 4.3 bar per kilometre. Check the total against the 14 bar working pressure and the pump.' },
        { question: 'Can lay flat hose carry treated seawater?', answer: 'Yes. TPU and polyester are not affected by salt water. Choose stainless steel couplings for long saline service and flush the line with fresh water before storing it.' },
        { question: 'How long can a single length of lay flat transfer hose be?', answer: 'Up to 400 m, which keeps couplings to a minimum on long lines.' },
        { question: 'Can lay flat hose be reused on the next pad?', answer: 'Yes. Drain it, roll it onto a reel, inspect the cover and couplings, and store it out of the sun. Damaged sections can be cut out and re-coupled.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For frac water lines',
      skus: ['IH-LF-TDW', 'IH-LF-CHP', 'IH-LF-CVG', 'IH-LF-CFL', 'IH-LF-CFM', 'IH-LF-TOF', 'IH-LF-EPW'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Large-bore TPU lay flat for frac water, dewatering and long temporary transfer lines, 1-1/2" to 16".',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Lay flat hose supply to Saudi Arabia',
      blurb: 'Transfer hose, couplings and reels for Eastern Province oil and gas operations.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'oman',
      label: 'Lay flat hose supply to Oman',
      blurb: 'Large-bore hose and couplings for Oman’s oil and tight-gas fields.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-vs-hdpe-pipe', 'lay-flat-hose-couplings-guide', 'antistatic-fuel-transfer-hose-guide', 'well-service-and-stimulation-hose', 'lay-flat-hose-in-gulf-heat'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Jafurah facts from Saudi Aramco and press reports of the field’s water supply (2023–2026); water per well from the US Geological Survey; Oman tight gas from BP. Friction losses are Hazen–Williams estimates on the published inside diameters of our TPU transfer hose.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a frac water line?',
      body: 'Send the peak rate, line length, ground profile and water source. We will size the hose, check pressure and surge, and quote hose, couplings and reels as one package.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
