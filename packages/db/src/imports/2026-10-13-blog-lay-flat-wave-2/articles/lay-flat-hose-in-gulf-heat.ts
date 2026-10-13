import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Lay flat hose in Gulf summer heat: material temperature ratings (IH-LF listings), measured UAE
 * air temperatures (NCM via Gulf News, 2025), ground surface estimate (Emirates Astronomy Society
 * chairman, Khaleej Times 2025), WHO Legionella growth range, UAE midday work break. Practical
 * advice is general; no derating figures are claimed — none are published.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-in-gulf-heat',
  title: 'Lay flat hose in Gulf heat: temperature ratings, UV, storage and summer site practice',
  excerpt:
    'UAE air temperatures passed 51 °C in 2025, and sun-baked ground runs hotter still. A lay flat hose rated to +80 °C has less margin than it seems once it lies empty on sand in July. What heat and UV do to TPU, nitrile and PVC hose, why warm water in a static line is a hygiene risk, and how to deploy, run and store hose through a Gulf summer.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose in Gulf Heat: Temperature, UV and Storage',
  seoDescription:
    'How Gulf summer heat and UV affect TPU, NBR and PVC lay flat hose: temperature ratings vs ground temperatures, pressure at high temperature, warm water and Legionella, deployment timing and shaded storage.',
  focusKeyword: 'lay flat hose heat',
  publishedAt: '2026-10-13T17:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Gulf summers routinely pass 45 °C in the shade; the UAE recorded 51.8 °C in August 2025, and exposed ground can reach around 65 °C.',
        'Our TPU and NBR lay flat hoses are rated to +80 °C — enough, but an empty black hose lying in the sun can get closer to that than the air temperature suggests.',
        'Water flowing through a hose keeps it near water temperature. The risks come when it lies empty, or full and static, in the sun.',
        'Pressure ratings are quoted at normal temperatures; for a line that will run hot, confirm the rating.',
        'Store hose rolled, in shade, off the ground; deploy and recover in the cooler hours.',
      ],
    },
    {
      type: 'lead',
      html: 'Hose that performs perfectly in a European winter can have a hard first summer on a Gulf site. On 1 August 2025 the UAE’s National Center of Meteorology recorded 51.8 °C at Sweihan, and the ground in direct sun runs hotter than the air — figures of around 65 °C are cited for UAE ground surfaces in high summer. A dark lay flat hose lying empty on that ground is a solar collector. None of this rules lay flat out; it changes how you choose, run and store it.',
    },

    { type: 'section_head', number: '/01', title: 'What the temperature rating means.', anchor: 'rating' },
    {
      type: 'paragraph',
      html: 'A hose temperature rating is the range in which the materials keep their properties in service. Our TPU lay flat hoses — <a href="/p/tpu-lay-flat-dewatering-hose">dewatering and transfer</a>, <a href="/p/tpu-lay-flat-drinking-water-hose">drinking water</a>, <a href="/p/antistatic-tpu-lay-flat-fuel-hose">fuel</a> and <a href="/p/tpu-lay-flat-well-riser-hose">well riser</a> — are rated from -50 °C to +80 °C. The <a href="/p/nbr-lay-flat-discharge-hose">NBR discharge hose</a> is rated -20 °C to +80 °C. PVC lay flat has the lowest heat tolerance of the three and softens, stiffens and ages fastest in sun and heat, which is why we steer it towards short, seasonal, low-pressure work.',
    },
    {
      type: 'comparison_table',
      caption: 'Lay flat hose materials in Gulf summer conditions',
      columns: ['Material', 'Rated temperature', 'Sun and UV', 'Summer verdict'],
      rows: [
        { cells: ['TPU', '-50 °C to +80 °C', 'Resists UV, ozone and weather', 'Best choice for long outdoor lines'], highlight: true },
        { cells: ['NBR (nitrile rubber)', '-20 °C to +80 °C', 'Weather resistant; heavier, ribbed cover', 'Good, especially with oily water'] },
        { cells: ['PVC', 'Lowest of the three', 'Ages and stiffens fastest in sun', 'Short-term, shaded or seasonal use only'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Can lay flat hose be used in 50 °C heat?',
      answer:
        'Yes. TPU and nitrile lay flat hoses rated to +80 °C work through Gulf summers, and flowing water keeps the hose close to water temperature. The risks are hose left empty or static in direct sun, which gets much hotter than the air, and pressure ratings that are quoted at normal temperatures — so shade static lines and confirm the rating for hot service.',
    },

    { type: 'section_head', number: '/02', title: 'Empty, full and flowing.', anchor: 'conditions' },
    {
      type: 'paragraph',
      html: 'A hose with water moving through it stays close to the temperature of the water, whatever the sun is doing. The hard cases are the other two. <strong>Empty hose</strong> lying flat on hot ground absorbs heat from above and below and has nothing to carry it away; that is when it is softest and most easily damaged by dragging or vehicle traffic. <strong>Full, static hose</strong> — a line shut in at midday, or a fire or drinking-water line waiting to be used — heats the water inside it. Charging a sun-baked hose is fine, but do it gradually, and do not drag a hot empty hose across rough ground.',
    },
    {
      type: 'paragraph',
      html: 'Thermoplastics lose some strength as they get hotter, so a working pressure quoted at normal ambient temperature does not automatically hold at the top of the temperature range. For lines that will run with hot water — deep-well water can come up warm — or that will sit pressurised in full sun, tell us the conditions and we will confirm the rating. See <a href="/blog/lay-flat-hose-pressure-ratings">how lay flat pressure ratings work</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Warm water and hygiene.', anchor: 'hygiene' },
    {
      type: 'paragraph',
      html: 'For temporary drinking-water and wash-water lines, heat is a water-quality issue as much as a hose issue. WHO guidance puts the growth range of <em>Legionella</em> bacteria at roughly 25 °C to 50 °C — exactly the temperature of water left standing in a hose in the Gulf sun. Keep potable lines flowing or drained, flush them before use, shade or bury long static runs, and use hose made for drinking water. Our <a href="/p/tpu-lay-flat-drinking-water-hose">TPU drinking-water hose</a> is blue for identification; tell us the approval your authority requires.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Hot couplings.',
      body: 'Aluminium and steel couplings in direct sun get hot enough to burn bare skin. Crews connecting hose in summer need gloves, and couplings should be shaded where a line stays in place.',
    },

    { type: 'section_head', number: '/04', title: 'Summer site practice.', anchor: 'practice' },
    {
      type: 'prose',
      html: '<ul><li><strong>Deploy and recover in the cooler hours.</strong> Early morning and evening are kinder to people and hose. In the UAE the midday outdoor work break (12:30 to 15:00, 15 June to 15 September) already shapes the day; other GCC states have their own summer rules.</li><li><strong>Keep lines working.</strong> A flowing line is a cool line. If a line will be idle for days, drain it.</li><li><strong>Shade what stands still.</strong> Manifolds, coupling points and static runs benefit from shade cloth or a light cover of sand.</li><li><strong>Keep hose off hot steel</strong> — pump skids, exhausts and steel plates get far hotter than sand.</li><li><strong>Inspect for heat and UV ageing</strong>: chalky or cracked covers, stiffness, and blistering along the folds.</li></ul>',
    },

    { type: 'section_head', number: '/05', title: 'Storage between jobs.', anchor: 'storage' },
    {
      type: 'figure',
      imageId: FIG['fig-shade-storage'],
      captionPrefix: 'FIG. 01',
      caption: 'Hose between jobs belongs rolled, on pallets and under shade — the cheapest way to add seasons to its life.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'More hose life is lost in the yard than on the job. Drain and flush the hose, roll it flat from the far end, and store the coils on pallets under a roof or shade canopy, away from sun, ozone sources such as electric motors, fuels and sharp objects. Do not stack heavy coils so high that the bottom ones deform in the heat. A hose that has spent a summer in a shaded store will outlast one left on the ground by years. Our article on <a href="/blog/why-lay-flat-hose-fails">why lay flat hose fails</a> covers what to look for at inspection.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What temperature can TPU lay flat hose take?', answer: 'Our TPU lay flat hoses are rated from -50 °C to +80 °C.' },
        { question: 'Is PVC lay flat hose suitable for the Gulf?', answer: 'For short, low-pressure, seasonal work, yes. For long outdoor lines left in the sun, TPU or nitrile lasts much longer.' },
        { question: 'Does heat reduce lay flat hose pressure rating?', answer: 'Plastics and rubbers lose some strength as they get hotter, so ratings quoted at normal temperatures may not hold at the top of the range. Tell us the water and site temperatures for a hot-service line and we will confirm the rating.' },
        { question: 'How should lay flat hose be stored in summer?', answer: 'Drained, rolled flat, on pallets, in shade or under a roof, away from fuel, electric motors and sharp objects.' },
        { question: 'Is warm water in a drinking-water hose a problem?', answer: 'Yes. Water standing in a hose in the sun can sit in the temperature range where Legionella grows. Keep potable lines flowing or drained and flush them before use.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Lay flat for hot climates',
      skus: ['IH-LF-TDW', 'IH-LF-TPW', 'IH-LF-NBR', 'IH-LF-NBRH', 'IH-LF-TOF', 'IH-LF-PVC'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hoses',
      label: 'Lay flat hoses',
      blurb: 'TPU, nitrile and PVC lay flat hose, couplings and reels.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'qatar',
      label: 'Lay flat hose supply to Qatar',
      blurb: 'Hose, couplings and reels for Qatar construction and utilities.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'bahrain',
      label: 'Lay flat hose supply to Bahrain',
      blurb: 'Dewatering, transfer and fire hose for Bahrain projects.',
    },
    {
      type: 'related_articles',
      slugs: ['tpu-vs-nbr-vs-pvc-lay-flat-hose', 'why-lay-flat-hose-fails', 'lay-flat-hose-pressure-ratings', 'construction-dewatering-hose-gcc', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Air temperature from the UAE National Center of Meteorology as reported in August 2025; ground surface figure as cited by the Emirates Astronomy Society; Legionella growth range from WHO guidance. Material ratings from the Indus lay flat hose listings.',
    },
    {
      type: 'cta_block',
      heading: 'Running hose through a Gulf summer?',
      body: 'Tell us the duty, the line length and how long it will stand in the sun. We will recommend the material and confirm pressure for the conditions.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
