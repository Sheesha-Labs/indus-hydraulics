import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Lay flat hose vs HDPE pipe for temporary lines. Hose figures from our 12" TPU dewatering hose
 * (305 mm ID, 4.60 kg/m, 14 bar). HDPE comparison computed for PE100 SDR 17 (PN 10), 315 mm OD,
 * 18.7 mm wall, density 958 kg/m³ → about 16.7 kg/m; stated as a calculated comparison, not a quote.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-vs-hdpe-pipe',
  title: 'Lay flat hose vs HDPE pipe for temporary water lines: speed, cost and when each wins',
  excerpt:
    'For a line that has to go down quickly, move often or come back up, lay flat hose usually beats HDPE pipe on installation time, transport and labour. For a line that stays for years, is buried or carries vacuum, HDPE wins. This guide compares the two on weight, joints, pressure, handling and life — with the decision points that settle most projects.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose vs HDPE Pipe for Temporary Pipelines: Which to Use',
  seoDescription:
    'Lay flat hose vs HDPE pipe for dewatering, frac water and bypass lines: installation speed, weight, joints, pressure, transport and reuse compared, with clear rules for when each wins.',
  focusKeyword: 'lay flat hose vs hdpe pipe',
  publishedAt: '2026-10-13T15:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Lay flat wins when a line is temporary, moves, or must go down fast: 400 m on one reel, laid by a small crew in hours, recovered and reused.',
        'HDPE wins for long-life, buried or suction lines: it holds its shape under vacuum and traffic, and its cost per year falls the longer it stays.',
        'Weight: 12" TPU lay flat is 4.6 kg/m; 315 mm PE100 SDR 17 pipe of similar bore is roughly 17 kg/m.',
        'Joints: a 400 m lay flat length has two couplings; the same run of 12 m HDPE sticks has over 30 fusion or mechanical joints.',
        'Pressure at large bore is comparable: 12" TPU lay flat is rated 14 bar; SDR 17 PE100 is PN 10.',
      ],
    },
    {
      type: 'lead',
      html: 'Temporary water lines — dewatering mains, frac water transfer, bypass pumping around a water main, flood relief — used to be built from rigid pipe because nothing else carried the flow. Large-bore lay flat hose changed that. The question on most projects now is not which is better in general, but which is better for a line of this length, this life and this route.',
    },

    { type: 'section_head', number: '/01', title: 'The short answer.', anchor: 'short-answer' },
    {
      type: 'direct_answer',
      question: 'Is lay flat hose or HDPE pipe better for a temporary pipeline?',
      answer:
        'Lay flat hose is usually better for temporary, above-ground lines that must be installed quickly, moved or recovered: it ships on reels, lays out in hours with a small crew and has very few joints. HDPE pipe is better for lines that stay in place for years, are buried, cross heavy traffic or carry suction, where its rigidity and long life pay off.',
    },
    {
      type: 'comparison_table',
      caption: 'Lay flat hose vs HDPE pipe for a 12-inch temporary line',
      columns: ['Property', 'TPU lay flat hose', 'HDPE pipe (PE100 SDR 17)'],
      rows: [
        { cells: ['Weight', '4.6 kg/m (12", 305 mm bore)', 'About 17 kg/m (315 mm OD)'] },
        { cells: ['Pressure', '14 bar working, 42 bar burst', 'PN 10 at 20 °C'] },
        { cells: ['Lengths and joints', 'Up to 400 m per length; two couplings', '6 or 12 m sticks; a joint every stick'], highlight: true },
        { cells: ['Installation', 'Reel off a trailer, tractor or truck', 'Fuse or couple each joint, then place'] },
        { cells: ['Transport and storage', 'Rolls flat onto a reel', 'Bulky; sticks or large coils'] },
        { cells: ['Suction and vacuum', 'No — collapses', 'Yes'] },
        { cells: ['Buried service and traffic', 'Above ground only; protect at crossings', 'Can be buried'] },
        { cells: ['Reuse', 'Recovered and redeployed many times', 'Reusable, but slower to recover'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Where lay flat wins.', anchor: 'lay-flat-wins' },
    {
      type: 'figure',
      imageId: FIG['fig-hdpe-deploy'],
      captionPrefix: 'FIG. 01',
      caption: 'Lay flat pays out from a drum as fast as the truck drives. A rigid line of the same length needs a joint every few metres.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: '<strong>Speed.</strong> A 400 m length of <a href="/p/tpu-lay-flat-dewatering-hose">TPU lay flat hose</a> is laid in the time it takes a vehicle to drive the route, with a coupling at each end. The rigid alternative is dozens of joints — each one fused or clamped, checked and supported. On emergency work, such as pumping out a flooded site or bypassing a burst main, that difference is measured in days.',
    },
    {
      type: 'paragraph',
      html: '<strong>Logistics.</strong> Empty lay flat is flat. Several hundred metres of large-bore hose travel on one reel and store in a container corner; the same length of pipe needs flatbeds and laydown space. At 4.6 kg per metre, a 12" hose is roughly a quarter of the weight of pipe of the same bore, so it moves with lighter equipment — a <a href="/p/tractor-mounted-lay-flat-hose-reel">tractor-mounted reel</a>, a <a href="/p/portable-lay-flat-hose-winder">portable winder</a> or a <a href="/p/lay-flat-hose-mover">hose mover</a>.',
    },
    {
      type: 'paragraph',
      html: '<strong>Changing routes.</strong> Construction dewatering moves as the excavation moves; frac water lines move from pad to pad; agricultural mains move field to field. Lay flat is recovered as fast as it was laid and redeployed, so one stock of hose serves many jobs. It also follows uneven ground without bends or supports.',
    },
    {
      type: 'paragraph',
      html: '<strong>Fewer leak points.</strong> Fewer joints means fewer places to leak and less pressure lost at couplings. With full-bore <a href="/c/lay-flat-hose-couplings">lay flat couplings</a> at each end, a long length is close to a continuous pipe.',
    },

    { type: 'section_head', number: '/03', title: 'Where HDPE wins.', anchor: 'hdpe-wins' },
    {
      type: 'prose',
      html: '<ul><li><strong>Long service life in one place.</strong> If a line will run for years, HDPE’s lower cost per year and buried installation usually win.</li><li><strong>Buried or trafficked routes.</strong> Lay flat is an above-ground product; buried lines and heavy traffic crossings are pipe territory, or need protected crossings.</li><li><strong>Suction and vacuum.</strong> Lay flat collapses under vacuum. Suction lines need rigid pipe or <a href="/p/epdm-pe-suction-hose">rigid-helix suction hose</a>.</li><li><strong>Gravity and low-velocity flow.</strong> A lay flat hose needs pressure to stay round; a gravity line or a line that drains and refills often is better in pipe.</li><li><strong>Exposure to sharp debris and vandalism</strong> over long unattended periods.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Cost: compare the whole job.', anchor: 'cost' },
    {
      type: 'paragraph',
      html: 'Price per metre of material rarely decides it. Compare the full cost of the line over its life on the project:',
    },
    {
      type: 'prose',
      html: '<ul><li>Transport to site and between sites.</li><li>Installation labour and equipment — fusion machines and crews against a reel and two people.</li><li>Time to first water: on dewatering and emergency work, every day the line is not running has a cost.</li><li>Recovery, cleaning and storage at the end.</li><li>Number of redeployments — a hose reused across many jobs spreads its cost.</li><li>Pumping energy: the bore sets friction loss; see our <a href="/blog/lay-flat-hose-flow-and-friction-loss">friction loss guide</a>.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'On short-life, frequently moved lines the labour, transport and time savings of lay flat usually outweigh its higher price per metre. On a line that will run untouched for years, HDPE typically comes out ahead.',
    },

    { type: 'section_head', number: '/05', title: 'Using both.', anchor: 'hybrid' },
    {
      type: 'paragraph',
      html: 'Many projects combine them: a permanent HDPE main with lay flat spurs to pumps that move, or lay flat across a temporary stretch joining two pipe sections. <a href="/p/large-bore-lay-flat-grooved-coupling">Grooved-end</a> and <a href="/p/large-bore-flanged-lay-flat-coupling">flanged</a> lay flat couplings join hose to grooved or flanged pipe spools without improvised adapters.',
    },
    {
      type: 'decision_tree',
      heading: 'Lay flat or HDPE?',
      branches: [
        { condition: 'Will the line be buried or run under heavy traffic?', outcome: 'HDPE.' },
        { condition: 'Does the line carry suction or vacuum anywhere?', outcome: 'HDPE or rigid-helix suction hose on that section.', sku: 'IH-LF-SEP' },
        { condition: 'Will it stay in one place for years?', outcome: 'Usually HDPE.' },
        { condition: 'Must it be running within days, move during the job, or be recovered?', outcome: 'Lay flat hose.', sku: 'IH-LF-TDW' },
        { condition: 'Does it cross rough or changing terrain above ground?', outcome: 'Lay flat hose, with couplings to join pipe where needed.', sku: 'IH-LF-CVG' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can lay flat hose replace HDPE for frac water transfer?', answer: 'Yes, and it is widely used for it: large-bore TPU lay flat hose is laid between ponds and well pads in hours and recovered for the next pad. Check the working pressure of the bore against the transfer pumps.' },
        { question: 'How long does lay flat hose last compared with HDPE pipe?', answer: 'HDPE is designed for decades in place. TPU lay flat is designed for repeated deployment; its life depends on handling, abrasion and sun. For temporary, mobile lines it typically gives many deployments.' },
        { question: 'Can lay flat hose be buried?', answer: 'It is designed for use above ground. For road crossings use hose ramps or sleeves; for a buried section use pipe and join it to the hose with grooved or flanged couplings.' },
        { question: 'Is lay flat hose cheaper than HDPE?', answer: 'Per metre of material, usually not. Over a temporary job, often yes, once transport, installation labour, time to first water and reuse are counted.' },
        { question: 'Does lay flat hose have the same pressure rating as HDPE?', answer: 'At large bores they are comparable: our 12" TPU lay flat hose is rated 14 bar working, while PE100 SDR 17 pipe is PN 10. Always compare the rating for the specific bore.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For temporary lines',
      skus: ['IH-LF-TDW', 'IH-LF-CVG', 'IH-LF-CFL', 'IH-LF-EHR', 'IH-LF-EPW'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'Large-bore TPU, NBR and PVC lay flat hose with couplings and reels for temporary lines.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Temporary lines for Saudi projects',
      blurb: 'Lay flat hose for dewatering and frac water transfer on Saudi construction and oilfield work.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'norway',
      label: 'Lay flat hose supply to Norway',
      blurb: 'Temporary transfer and dewatering lines for Norwegian construction and tunnelling.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-guide', 'lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-couplings-guide', 'suction-hose-vs-lay-flat-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Hose figures from the Indus TPU lay flat dewatering hose size table as published on 13 October 2026. HDPE weight calculated for PE100 SDR 17, 315 mm OD, 18.7 mm wall; HDPE pressure class from the SDR 17 / PE100 designation (PN 10 at 20 °C).',
    },
    {
      type: 'cta_block',
      heading: 'Planning a temporary line?',
      body: 'Send the route length, flow, lift and how long the line will run. We will compare hose options, size the bore and quote hose, couplings and handling equipment.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
