import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Flood response pumping with lay flat hose. Facts checked 2026-10-13: UAE NCM April 2024 rainfall
 * (Gulf News), Dubai airport cancellations (Flightradar24), Oman April 2024 deaths (Times of Oman,
 * "at least 19"), July 2021 Germany/Belgium deaths and damage (PreventionWeb, Uni Bonn), UK fire
 * service HVP capability (GOV.UK, EA blog), EU HCP module spec (Decision 2010/481/EU Annex II).
 * Friction figures are Hazen–Williams estimates (C = 140) on our actual IDs.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'flood-response-pumping-lay-flat-hose',
  title: 'Flood response pumping: lay flat hose for high-volume pumps, from Dubai to the Ahr valley',
  excerpt:
    'Floods are a pumping problem measured in thousands of cubic metres an hour. The pumps get the attention; the hose decides how much of that water actually leaves. Lessons from the 2024 UAE and Oman floods and the 2021 floods in Germany and Belgium, how high-volume pumping units are equipped, and how to size and stock lay flat hose for flood response.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Flood Pumping Hose: Lay Flat for High-Volume Pumps',
  seoDescription:
    'How to size and stock lay flat hose for flood response: high-volume pump flows, friction loss over 1–3 km, the EU high-capacity pumping module, Storz couplings, deployment and recovery — with lessons from UAE, Oman and European floods.',
  focusKeyword: 'flood pumping hose',
  publishedAt: '2026-10-13T21:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Flood pumps move hundreds to thousands of cubic metres an hour; at those flows the hose bore, not the pump, often limits what gets out.',
        'A UK fire-service high volume pump carries 3 km of 150 mm hose and is rated up to 7,000 L/min — but over the full 3 km, friction cuts that flow sharply.',
        'The EU high-capacity pumping module must move at least 1,000 m³/h, against 40 m of head and over 1,000 m, with Storz-compatible couplings.',
        'For 1,000 m³/h over a kilometre, 12" to 16" lay flat keeps losses to a few bar; 10" needs about 8 bar per km.',
        'Stock hose on reels with matched couplings, and plan recovery and cleaning — flood water is dirty.',
      ],
    },
    {
      type: 'lead',
      html: 'On 16 April 2024 the UAE’s National Center of Meteorology recorded 254.8 mm of rain in under 24 hours at Khatm Al Shakla in Al Ain — the largest in 75 years of records. Dubai International cancelled more than a thousand flights over the following days, and in Oman flash floods from 14 April killed at least 19 people. Three years earlier, in July 2021, floods in Germany and Belgium killed more than 220 people, at least 134 of them in the Ahr valley, and caused around €33 billion of damage in Germany alone. When the rain stops, the work becomes moving water — and that means pumps and a great deal of hose.',
    },

    { type: 'section_head', number: '/01', title: 'The scale of flood pumping.', anchor: 'scale' },
    {
      type: 'paragraph',
      html: 'Flood water lies in underpasses, basements, car parks and low-lying districts, and has to be moved to a drain, a river or the sea — often over hundreds of metres or kilometres. Two benchmarks show the scale. In England, every fire-service <strong>high volume pump</strong> (HVP) carries 3 km of 150 mm hose and is rated at up to 7,000 litres a minute (420 m³/h). Across Europe, the EU Civil Protection Mechanism defines a <strong>high-capacity pumping module</strong> that must move at least 1,000 m³/h against a 40 m height difference, deliver water over 1,000 m, handle muddy water up to 40 °C, use Storz-compatible couplings, deploy within 12 hours and run for 21 days. Belgium’s module sent to Emilia-Romagna in 2023 was rated at 6,000 m³/h.',
    },
    {
      type: 'figure',
      imageId: FIG['fig-hcp-pumps'],
      captionPrefix: 'FIG. 01',
      caption: 'High-capacity pumps run several large lay flat lines in parallel to move flood water over an embankment.',
      aspectRatio: '16/9',
    },

    { type: 'section_head', number: '/02', title: 'Why the hose sets the flow.', anchor: 'friction' },
    {
      type: 'paragraph',
      html: 'Pump ratings are quoted at low head and short hose lengths. Lay the hose out to a distant outfall and friction takes over. At 420 m³/h, a 6" (155 mm) lay flat line loses roughly 18 bar per kilometre — so a 150 mm HVP line delivers its rated flow only over short distances, and far less at the end of 3 km. The same flow through 8" loses under 5 bar per kilometre. That is why flood teams run parallel lines, and why the larger the flow, the larger the bore should be.',
    },
    {
      type: 'comparison_table',
      caption: 'Estimated friction loss per kilometre of TPU lay flat hose, clean water (Hazen–Williams, C = 140, actual inside diameters)',
      columns: ['Flow', 'Bore', 'Velocity', 'Loss per km'],
      rows: [
        { cells: ['420 m³/h (7,000 L/min)', '6" (155 mm)', '6.2 m/s', '≈ 18 bar'] },
        { cells: ['420 m³/h (7,000 L/min)', '8" (205 mm)', '3.5 m/s', '≈ 4.7 bar'] },
        { cells: ['1,000 m³/h', '10" (254 mm)', '5.5 m/s', '≈ 8.2 bar'] },
        { cells: ['1,000 m³/h', '12" (305 mm)', '3.8 m/s', '≈ 3.4 bar'], highlight: true },
        { cells: ['1,000 m³/h', '14" (355 mm)', '2.8 m/s', '≈ 1.6 bar'] },
        { cells: ['1,000 m³/h', '16" (405 mm)', '2.2 m/s', '≈ 0.8 bar'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What size hose is used for flood pumping?',
      answer:
        'It depends on flow and distance. Fire-service high volume pumps use 150 mm hose for around 7,000 L/min over short runs; for 1,000 m³/h over a kilometre or more, 12" to 16" lay flat keeps friction loss to a few bar. Larger flows use several lines in parallel.',
    },

    { type: 'section_head', number: '/03', title: 'Choosing hose for flood work.', anchor: 'hose' },
    {
      type: 'paragraph',
      html: 'Flood water carries silt, debris and often fuel and sewage. A <a href="/p/tpu-lay-flat-dewatering-hose">TPU lay flat transfer hose</a> resists abrasion when dragged over rubble and kerbs, shrugs off oil and chemicals, and is light for its size — 4.6 kg/m at 12" — so crews can lay it by hand from a reel. It runs from 1-1/2" to 16" (14 bar from 6" to 14", 10 bar at 16") in lengths up to 400 m. For shorter, lower-pressure lines from smaller pumps, <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> handles oily water. Every pump still needs rigid <a href="/c/suction-hoses">suction hose</a> on its inlet.',
    },
    {
      type: 'paragraph',
      html: '<strong>Couplings</strong> decide how fast a line goes down. Storz couplings are genderless — any two ends lock with a quarter turn — which is why the EU module specification calls for Storz compatibility. Our <a href="/p/large-bore-storz-lay-flat-coupling">large-bore Storz couplings</a> carry the system up to 12"; <a href="/p/large-bore-flanged-lay-flat-coupling">flanged</a> and <a href="/p/large-bore-lay-flat-grooved-coupling">grooved</a> couplings connect to pumps and fixed pipework. See our <a href="/blog/lay-flat-hose-couplings-guide">coupling guide</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Deploying and recovering.', anchor: 'deployment' },
    {
      type: 'prose',
      html: '<ol><li><strong>Keep hose on reels or flaked in boxes</strong>, couplings fitted and capped, so a line can be run out in minutes.</li><li><strong>Run the shortest practical route</strong> to an outfall the authority has approved; avoid sharp debris and protect road crossings with hose ramps.</li><li><strong>Lift over walls and embankments</strong> with wide bends — a kink at the crest throttles the line.</li><li><strong>Start pumps gradually</strong> and close valves slowly; long, full lines surge.</li><li><strong>Recover from the far end</strong>, draining as you go; a <a href="/p/portable-lay-flat-hose-winder">portable winder</a> handles 6" to 12" lengths without a crew of six.</li><li><strong>Wash and disinfect</strong> hose that carried sewage-contaminated water before storage, and inspect every length for cuts.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Drinking water is a separate stock.',
      body: 'Hose used for flood water must never be reused for drinking water. Keep a separate, identified stock of drinking-water hose for emergency supply — see our guide to overland pumping and water main bypass.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How far can a flood pump push water through lay flat hose?', answer: 'As far as its pressure allows after friction. At 420 m³/h, 6" hose loses roughly 18 bar per kilometre and 8" about 4.7 bar, so bore matters more than pump size over long distances.' },
        { question: 'What couplings are used for flood pumping hose?', answer: 'Storz couplings are common because any two ends connect with a quarter turn; the EU high-capacity pumping module calls for Storz compatibility. Flanged and grooved couplings connect to pumps and pipework.' },
        { question: 'What is a high volume pump?', answer: 'A trailer or vehicle-mounted pump used by fire and rescue services for flooding and large fires. In England each carries 3 km of 150 mm hose and is rated at up to 7,000 L/min.' },
        { question: 'Can lay flat hose be used for dirty flood water?', answer: 'Yes. TPU and NBR lay flat handle silty and oily water; clean and disinfect the hose after use.' },
        { question: 'How much hose should a flood response team stock?', answer: 'Enough to reach the furthest likely outfall from each pump, plus spare lengths for damage — and on reels or in boxes with couplings fitted, so it deploys quickly.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For flood response',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-CST', 'IH-LF-CFL', 'IH-LF-CVG', 'IH-LF-EPW', 'IH-LF-SEP'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'Large-bore transfer hose, couplings and winders for flood response.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'germany',
      label: 'Lay flat hose supply to Germany',
      blurb: 'Large-bore hose and Storz couplings for German flood and civil protection teams.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'netherlands',
      label: 'Lay flat hose supply to the Netherlands',
      blurb: 'High-capacity pumping hose for Dutch water management.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'oman',
      label: 'Lay flat hose supply to Oman',
      blurb: 'Flood and dewatering hose for Omani municipalities and contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-couplings-guide', 'overland-pumping-water-main-bypass', 'construction-dewatering-hose-gcc', 'lay-flat-hose-vs-hdpe-pipe'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Flood facts from the UAE NCM, Oman press, PreventionWeb and the University of Bonn; HVP capability from GOV.UK; EU module from Decision 2010/481/EU. Friction losses are estimates on our hose inside diameters.',
    },
    {
      type: 'cta_block',
      heading: 'Equipping a flood response unit?',
      body: 'Tell us the pump flows, the distances to your outfalls and how the hose will be stored. We will size the bores, couplings and reels.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
