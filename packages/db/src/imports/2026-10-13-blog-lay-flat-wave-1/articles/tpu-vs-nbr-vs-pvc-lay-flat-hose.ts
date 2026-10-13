import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * TPU vs NBR vs PVC lay flat hose. Figures from our live tables (TPU dewatering / riser / concrete,
 * NBR discharge); PVC has no published table, so no PVC pressure number is quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'tpu-vs-nbr-vs-pvc-lay-flat-hose',
  title: 'TPU vs NBR vs PVC lay flat hose: which cover material, for which job',
  excerpt:
    'Three materials make almost every lay flat hose sold today. TPU is the strongest and lasts longest when dragged; nitrile rubber shrugs off oil and is rated 10 bar in every size; PVC is light and cheap for clean, low-pressure water. Here is how they compare on pressure, abrasion, oil, temperature, weight and cost — and how to choose.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'TPU vs NBR vs PVC Lay Flat Hose: Pressure, Abrasion & Cost Compared',
  seoDescription:
    'TPU, nitrile rubber (NBR) and PVC lay flat hose compared on pressure rating, abrasion, oil resistance, temperature, weight and cost — with a decision guide for dewatering, frac, fuel and irrigation.',
  focusKeyword: 'tpu vs pvc lay flat hose',
  publishedAt: '2026-10-13T15:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'TPU (thermoplastic polyurethane) carries the highest pressures and lasts longest when dragged; it is the default for dewatering, frac water, risers, fuel and slurry.',
        'NBR (nitrile rubber) resists oil and fuel residue, has a ribbed cover for wear, and our discharge hose is rated 10 bar in every size from 1-1/2" to 12".',
        'PVC is the lightest and cheapest, and the right choice for clean water at low pressure — irrigation, site pumps, seasonal lines.',
        'Through-the-weave construction (polymer extruded through the jacket in one pass) matters as much as the polymer: it cannot delaminate.',
        'Choose by fluid first, then pressure, then how hard the hose is handled — price is the last question, not the first.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask three suppliers for “6-inch lay flat hose” and you can be quoted three different products at three very different prices, all honestly described. The difference is the polymer the hose is made of. It decides how much pressure the hose can carry, whether it survives being dragged across a quarry floor, what happens when diesel gets into the water, and how many seasons you get before replacing it.',
    },

    { type: 'section_head', number: '/01', title: 'The short answer.', anchor: 'short-answer' },
    {
      type: 'direct_answer',
      question: 'Which is better: TPU, NBR or PVC lay flat hose?',
      answer:
        'TPU is best for high pressure, heavy handling and long life — dewatering, frac water, well risers, fuel and slurry. NBR is the choice where oil or fuel is in the water and a solid 10 bar is enough. PVC is best value for clean water at low pressure, such as irrigation and site pumps. Pick by fluid, then pressure, then handling.',
    },
    {
      type: 'comparison_table',
      caption: 'TPU, NBR and PVC lay flat hose compared (figures from our range where published)',
      columns: ['Property', 'TPU', 'NBR', 'PVC'],
      rows: [
        { cells: ['Working pressure', '10 to 40 bar for transfer and riser hose; to 85 bar for concrete hose', '10 bar in every size, 1-1/2" to 12"', 'Low pressure; confirmed per order'], highlight: true },
        { cells: ['Burst pressure', '30 to 100 bar for transfer and riser hose; to 170 bar concrete', '30 bar', 'Not published'] },
        { cells: ['Abrasion', 'Highest', 'Good (ribbed cover)', 'Lowest'] },
        { cells: ['Oil and fuel', 'Good; antistatic grade for fuel', 'Good', 'Poor'] },
        { cells: ['Temperature (our range)', '-50 °C to +80 °C', '-20 °C to +80 °C', 'Mild conditions only'] },
        { cells: ['Weight, 6" bore', '2.30 kg/m (dewatering hose)', '2.15 kg/m', 'Lightest'] },
        { cells: ['Continuous length', 'Up to 400 m', 'Up to 200 m', 'Shorter coils'] },
        { cells: ['Relative cost', 'Highest', 'Middle', 'Lowest'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'TPU: the high-pressure, high-wear choice.', anchor: 'tpu' },
    {
      type: 'figure',
      imageId: FIG['fig-tpu-cutaway'],
      captionPrefix: 'FIG. 01',
      caption: 'In a through-the-weave TPU hose the polymer passes through the woven jacket, so tube, jacket and cover are a single wall with nothing to peel apart.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'Thermoplastic polyurethane is the toughest of the three. It is extruded through the circular-woven polyester jacket in a single pass, which bonds tube, jacket and cover into one wall. That construction gives TPU lay flat its two defining traits: it holds high pressure for its weight, and it survives being dragged across rock, gravel and concrete for years.',
    },
    {
      type: 'paragraph',
      html: 'In our range TPU spans the widest pressure band of any material: the <a href="/p/tpu-lay-flat-dewatering-hose">TPU dewatering hose</a> is 21 bar at 1-1/2" falling to 10 bar at 16"; the <a href="/p/tpu-lay-flat-well-riser-hose">well riser hose</a> reaches 40 bar at 1-1/4" with tensile strength up to 60,900 kg; and the high-pressure class of <a href="/p/tpu-lay-flat-concrete-placement-hose">concrete placement hose</a> is rated 85 bar. It stays flexible from -50 °C to +80 °C, resists UV, ozone, hydrolysis and many chemicals, and is made in single lengths up to 400 m.',
    },
    {
      type: 'paragraph',
      html: '<strong>Choose TPU for:</strong> construction and mine dewatering, frac water transfer, borehole risers, <a href="/p/antistatic-tpu-lay-flat-fuel-hose">fuel transfer</a> (antistatic grade with a copper earthing wire), <a href="/p/tpu-lay-flat-drinking-water-hose">drinking water</a>, concrete and <a href="/p/tpu-lay-flat-slurry-drag-hose">slurry drag lines</a> — anything pressurised, dragged or reused for years.',
    },

    { type: 'section_head', number: '/03', title: 'NBR: the oil-resistant all-rounder.', anchor: 'nbr' },
    {
      type: 'paragraph',
      html: 'Nitrile rubber is a synthetic rubber chosen for its resistance to oils and fuels. An NBR lay flat hose stays reliable where water carries oil, diesel residue or hydraulic fluid — tank cleaning, oily wash-down, dewatering on plant yards and refinery sites — and its rubber cover, ribbed along its length, takes wear when the hose is dragged.',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/nbr-lay-flat-discharge-hose">NBR lay flat discharge hose</a> is rated 10 bar working and 30 bar burst in every size from 1-1/2" to 12" — a 3:1 safety factor — and handles -20 °C to +80 °C. A single pressure class across the range makes it easy to standardise on: every length on site has the same limit. For heavier mine dewatering there is a <a href="/p/heavy-duty-nbr-lay-flat-hose">heavy-duty NBR hose</a>, and for fire water a red or yellow <a href="/p/nbr-lay-flat-fire-hose">NBR fire hose</a>.',
    },
    {
      type: 'paragraph',
      html: '<strong>Choose NBR for:</strong> dewatering and pump discharge where oil or fuel may be present, industrial wash-down, and any site that wants one 10-bar rating on every hose.',
    },

    { type: 'section_head', number: '/04', title: 'PVC: light and economical.', anchor: 'pvc' },
    {
      type: 'paragraph',
      html: 'PVC lay flat is the familiar blue irrigation hose. It is the lightest and cheapest of the three, odourless, and easy for one person to run out and roll up. Its limits are pressure, abrasion and environment: PVC is a low-pressure hose, it wears quickly when dragged over rough ground, it is not suited to oils, and it stiffens in cold weather and ages faster in strong sun than TPU or NBR.',
    },
    {
      type: 'paragraph',
      html: 'Within those limits it is the right tool and there is no reason to pay more. <strong>Choose <a href="/p/pvc-lay-flat-discharge-hose">PVC lay flat hose</a> for:</strong> irrigation supply, discharge from small site and trash pumps, pool and tank draining, and seasonal lines that are laid once and left.',
    },

    { type: 'section_head', number: '/05', title: 'Cost: price per metre is the wrong number.', anchor: 'cost' },
    {
      type: 'paragraph',
      html: 'PVC always wins on price per metre. It rarely wins on price per year of service when the hose is pressurised, dragged or redeployed. Three questions settle it:',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>How many times will it be deployed?</strong> A line that is laid and recovered dozens of times a year pays for TPU’s abrasion resistance quickly.</li><li><strong>What does a failure cost?</strong> A burst on a dewatering line that floods an excavation, or a fuel leak, costs more than the hose. Choose the material with margin.</li><li><strong>What is the pressure at the pump?</strong> If the required pressure is above what PVC can safely carry at that bore, the comparison ends there.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Choosing in four steps.', anchor: 'choosing' },
    {
      type: 'decision_tree',
      heading: 'Which lay flat material?',
      branches: [
        { condition: 'Is there fuel, oil or hydrocarbon in the fluid?', outcome: 'Fuel transfer: antistatic TPU. Oily water: NBR or TPU. Never PVC.', sku: 'IH-LF-TOF' },
        { condition: 'Is it drinking water?', outcome: 'Use a hose made and certified for potable water.', sku: 'IH-LF-TPW' },
        { condition: 'Is the working pressure above 10 bar, or the bore above 8" at high flow?', outcome: 'TPU — check the rating for your bore in the size table.', sku: 'IH-LF-TDW' },
        { condition: 'Will it be dragged, redeployed often or left out for years?', outcome: 'TPU for heavy handling; NBR is a sound middle ground.', sku: 'IH-LF-NBR' },
        { condition: 'Clean water, low pressure, light use?', outcome: 'PVC is the economical choice.', sku: 'IH-LF-PVC' },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two follow-ups: how the three materials cope with a <a href="/blog/lay-flat-hose-in-gulf-heat">Gulf summer</a>, and why a TPU hose for diesel needs an earthing wire — see the <a href="/blog/antistatic-fuel-transfer-hose-guide">antistatic fuel transfer hose guide</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is TPU the same as polyurethane (PU) hose?', answer: 'TPU is thermoplastic polyurethane, the extrudable form of polyurethane used for lay flat hose. Suppliers often say PU and TPU interchangeably for lay flat; what matters more is whether it is extruded through the jacket or bonded as a separate liner.' },
        { question: 'Can NBR lay flat hose carry diesel?', answer: 'NBR resists oils and fuels well and is often used for oily water. For dedicated fuel transfer use a hose built and earthed for it — our antistatic TPU fuel hose has a copper wire in the jacket for static dissipation.' },
        { question: 'How long does PVC lay flat hose last?', answer: 'It depends on sun, handling and pressure. Laid once for a season in mild conditions it can last several seasons; dragged, pressurised or left in strong sun it wears out much faster than TPU or NBR.' },
        { question: 'Which lay flat hose is best for the Gulf heat?', answer: 'TPU or NBR. Both are rated to +80 °C in our range and resist UV and ozone far better than PVC. Store coils out of direct sun when not in use.' },
        { question: 'Which material is lightest?', answer: 'PVC, then NBR, then TPU at the same bore — though TPU’s higher pressure means a smaller TPU bore can sometimes replace a larger rubber one.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'One of each',
      skus: ['IH-LF-TDW', 'IH-LF-NBR', 'IH-LF-PVC', 'IH-LF-TOF'],
    },
    {
      type: 'category_link',
      slug: 'tpu-lay-flat-hoses',
      label: 'TPU lay flat hoses',
      blurb: 'Through-the-weave TPU hose for dewatering, frac water, risers, fuel, drinking water, concrete and slurry.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'oman',
      label: 'Lay flat hose supply to Oman',
      blurb: 'TPU and NBR lay flat hose for oilfield water, mining and municipal projects in Oman.',
    },
    {
      type: 'related_articles',
      slugs: ['lay-flat-hose-in-gulf-heat', 'antistatic-fuel-transfer-hose-guide', 'lay-flat-hose-guide', 'lay-flat-hose-pressure-ratings', 'why-lay-flat-hose-fails', 'pvc-or-rubber-suction-hose'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Pressure, temperature, weight and length figures from the Indus TPU, NBR and PVC lay flat hose listings as published on 13 October 2026.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure which material?',
      body: 'Tell us the fluid, pressure, bore and how the hose will be used, and we will recommend the material and class — with the size table for the bore you need.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
