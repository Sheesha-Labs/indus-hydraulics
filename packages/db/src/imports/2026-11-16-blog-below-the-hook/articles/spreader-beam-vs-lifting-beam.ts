import type { BlogArticleSeed } from '../shared'
import { SPREADER_VS_LIFTING } from '../diagrams'

/**
 * Spreader beam vs lifting beam: the hub article of the below-the-hook wave. The distinction is drawn
 * by the force path (bending vs compression), which is standard statics. Figures are live listing
 * values: the multi-configuration beam (IH-LR-BH-MCB-16) at a 6 m span rated 7 t as a lifting beam,
 * 14 t as a semi-spreader on two bottom points and 23 t on four; the 8 t modular spreader beam
 * (IH-LR-BH-MSB-8) at 4 m rated 3 / 5 / 8 t at 45 / 30 / 20° with 2.8 / 3.9 / 5.8 m minimum top slings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'spreader-beam-vs-lifting-beam',
  title: 'Spreader beam vs lifting beam: how each carries the load, and how to choose',
  excerpt:
    'A lifting beam hangs from one top point and carries the load in bending. A spreader beam hangs from two top slings and only holds them apart, in compression. That one difference decides the weight of the beam, the headroom it needs and the loads it suits.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Spreader Beam vs Lifting Beam Explained',
  seoDescription:
    'Spreader beam vs lifting beam: bending against compression, headroom, weight and load charts, the hybrid semi-spreader, and which beam suits which lift.',
  focusKeyword: 'spreader beam vs lifting beam',
  publishedAt: '2026-11-16T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A lifting beam hangs from a single top point. The load has to travel along the beam to reach it, so the beam works in bending.',
        'A spreader beam hangs from two angled top slings, one at each end, with the load directly below each end. The load goes straight up the slings; the beam only holds them apart, in compression.',
        'Compression takes far less steel to resist than bending, so a spreader beam is the lighter beam for a given load and span.',
        'A lifting beam needs much less headroom, because it has no angled top slings, and it can carry a load at many points along its length.',
        'Hybrids exist. A semi-spreader hangs from two top lugs set in from the ends: on our multi-configuration beam at a 6 m span that doubles the rating from 7 t to 14 t.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask ten riggers the difference between a spreader beam and a lifting beam and you will get several answers, some of them contradictory. The names are used loosely — on some sites every beam under a hook is a “spreader bar”, on others every one is a “lifting beam”. The useful distinction is not the name but the job the steel is doing, and you can read it from the rigging in a few seconds once you know where to look.',
    },
    {
      type: 'diagram',
      svg: SPREADER_VS_LIFTING,
      captionPrefix: 'FIG. 01',
      caption: 'Follow the load from the bottom slings to the hook. Where it has to travel along the beam, the beam is in bending; where it goes straight up, the beam is in compression.',
      alt: 'Two rigs side by side. Left, a lifting beam hung from one central top sling with four vertical bottom slings to the load; arrows along the beam show the load travelling to the centre, so the beam is in bending. Right, a spreader beam hung from two angled top slings meeting at the hook, with one vertical bottom sling at each end; arrows show the load going straight up the top slings and the beam being squeezed in compression between them.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between a spreader beam and a lifting beam?',
      answer:
        'A lifting beam is suspended from one central point and carries the load in bending, because the load must travel along the beam to reach that point. A spreader beam is suspended by two angled slings from its ends, with the load directly below them, so the load passes straight up the slings and the beam only resists the inward pull of the slings, in compression. Spreader beams are lighter for the same load; lifting beams need less headroom.',
    },

    { type: 'section_head', number: '/01', title: 'Follow the load.', anchor: 'force-path' },
    {
      type: 'prose',
      html: '<p>Start at the load and trace the force up to the hook.</p><ul><li><strong>Lifting beam.</strong> The bottom slings or lugs pass the load into the beam at one or more points along its length. The only way up is a single top point, usually in the middle. So the load has to run sideways along the beam before it can turn upward — and a beam carrying load sideways to a support is in bending, like a plank across a ditch with someone standing on it.</li><li><strong>Spreader beam.</strong> The bottom slings meet the beam at its two ends, and at each end a top sling leads straight up to the hook. The load never travels along the beam at all. What the beam does feel is the top slings trying to swing inward toward the hook. Pulled at an angle, each sling has an inward component, and the beam sits between the two ends and pushes back. That is compression.</li></ul><p>Why the top slings pull inward, and how big the force is, is worked through in <a href="/blog/sling-angle-compression-force">sling angle compression force</a>. For this article the point is simpler: compression in a short straight strut is a much easier load to carry than bending.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Why the difference matters.', anchor: 'why' },
    {
      type: 'paragraph',
      html: 'Bending stress grows with the distance the load has to travel along the beam, so a lifting beam needs a deep, heavy section as the span grows. A spreader beam’s compression does not depend on the span at all — only on the load and the top sling angle. What limits a spreader as it gets longer is buckling, which is why its load chart steps down with span. The same steel goes much further in compression, which is why spreader beams are the common choice for long loads lifted at two points.',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/multi-configuration-modular-lifting-beam">multi-configuration modular lifting beam</a> shows the effect with one set of steel. Built to a 6 m span and hung from a central top point, it is rated 7 t. Rigged as a semi-spreader from two top lugs, with the load on two bottom points, the same sections are rated 14 t; with the load on four bottom points, 23 t. Moving the top connection outward halves the distance the load travels in bending — and the rating doubles.',
    },
    {
      type: 'comparison_table',
      caption: 'One beam at a 6 m span, three ways of rigging it (from our listing)',
      columns: ['Rigged as', 'Load path', 'Rated load'],
      rows: [
        { cells: ['Lifting beam, central top point', 'All in bending, to the centre', '7 t'] },
        { cells: ['Semi-spreader, load on 2 bottom points', 'Bending over a quarter of the span', '14 t'] },
        { cells: ['Semi-spreader, load on 4 bottom points', 'Shorter bending lengths still', '23 t'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'The price of a spreader: headroom.', anchor: 'headroom' },
    {
      type: 'paragraph',
      html: 'A spreader beam needs two top slings meeting at the hook, and the steeper they hang the less they squeeze the beam. The load chart for our <a href="/p/modular-spreader-beam-8-tonne">8 t modular spreader beam</a> at a 4 m span makes the trade explicit: 3 t with the top slings at 45° to the vertical, 5 t at 30° and the full 8 t at 20°. The cost is sling length — the minimum top sling grows from 2.8 m to 3.9 m to 5.8 m. Under a low roof, a portal frame or a tower crane with little hook height to spare, that extra height may simply not exist.',
    },
    {
      type: 'paragraph',
      html: 'A lifting beam hangs from one short sling or straight off the hook on a strip lug, so it needs only its own depth plus the bottom rigging. That is its main advantage, along with the freedom to pick a load up at as many points as the load needs — four, six or more along a long fabrication or a precast unit.',
    },

    { type: 'section_head', number: '/04', title: 'Which beam for which lift.', anchor: 'choose' },
    {
      type: 'comparison_table',
      caption: 'Choosing between the two',
      columns: ['Lift', 'Usual choice', 'Why'],
      rows: [
        { cells: ['Long load, two lifting points, headroom available', 'Spreader beam', 'Lightest beam for the load; slings hang vertical to the load'] },
        { cells: ['Low headroom: plant rooms, workshops, under a canopy', 'Lifting beam', 'No angled top slings'] },
        { cells: ['Load needing support at many points', 'Lifting beam, multi-point', 'Bottom lugs wherever the load needs them'] },
        { cells: ['Four-point loads: modules, pods, containers', 'Spreader frame or one-over-two spreaders', 'Keeps all four legs vertical'] },
        { cells: ['Varying loads on one job', 'Modular or telescopic spreader', 'Span changes with struts or a pin'] },
        { cells: ['Load with an offset centre of gravity', 'Lifting beam with offset or adjustable top lug', 'Top point placed over the centre of gravity'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A spreader beam is not a light lifting beam.',
      body: 'Hang a load from the middle of a spreader, or from a single top sling, and the beam is suddenly in bending it was never designed for. Because a spreader is sized for compression, it is a fraction of the section a lifting beam would need, and it can fail well below its rating. The common ways this happens are in spreader beam misuse.',
    },
    {
      type: 'paragraph',
      html: 'Read the common rigging errors in <a href="/blog/spreader-beam-misuse">spreader beam misuse</a>, and see <a href="/blog/centre-of-gravity-in-lifting">centre of gravity in lifting</a> for loads that are not balanced on their lifting points.',
    },

    { type: 'section_head', number: '/05', title: 'What both have in common.', anchor: 'common' },
    {
      type: 'paragraph',
      html: 'Both are lifting accessories: equipment between the crane hook and the load. Each must be marked with its working load limit and an identification, supplied with a certificate, and thoroughly examined at the intervals the local rules set — in Abu Dhabi, every 6 months for lifting accessories under CoP 34. See <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>. Modular beams are certified for every configuration in their chart, so changing the span within the chart needs no new test.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a spreader bar the same as a spreader beam?', answer: 'Usually, yes. “Spreader bar” is common in North America and on many sites for any spreader. What matters is the rigging: two top slings from the ends means a spreader in compression; one top point means a lifting beam in bending.' },
        { question: 'Why is a spreader beam lighter than a lifting beam?', answer: 'It carries the load in compression, which takes much less steel to resist than bending. The load goes straight up the top slings and never travels along the beam.' },
        { question: 'When should I use a lifting beam instead?', answer: 'When headroom is limited, when the load needs support at more than two points along its length, or when the top point has to be placed over an offset centre of gravity.' },
        { question: 'What is a semi-spreader beam?', answer: 'A hybrid: two top lugs set in from the ends, with the load hung outside or between them. The beam is partly in bending and partly in compression. It carries more than a lifting beam of the same section and needs less headroom than a full spreader.' },
        { question: 'Does the span change a spreader beam’s rating?', answer: 'Yes. The compression depends on the load and the top sling angle, but a longer strut buckles more easily, so the chart steps the rating down as the span grows. Always read the row for the span and angle you rig.' },
        { question: 'Can a spreader beam be used with angled bottom slings?', answer: 'Only within the small angle the maker allows — commonly no more than 6° from vertical. Bottom slings that splay out or lean in change the forces in the beam.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Spreader and lifting beams',
      skus: ['IH-LR-BH-MSB-8', 'IH-LR-BH-MSB-24', 'IH-LR-BH-TSB', 'IH-LR-BH-MCB-16', 'IH-LR-BH-FLB', 'IH-LR-BH-SSB'],
    },
    { type: 'category_link', slug: 'spreader-beams', label: 'Spreader beams', blurb: 'Modular, telescopic, lattice and fixed spreader beams, with span charts at 45°, 30° and 20°.' },
    { type: 'category_link', slug: 'lifting-beams', label: 'Lifting beams', blurb: 'Fixed, multi-point, semi-spreader, counterweight and multi-configuration lifting beams.' },
    { type: 'page_link', kind: 'industry', slug: 'construction', label: 'Construction', blurb: 'Lifting, rigging and plant supply for contractors.' },
    {
      type: 'related_articles',
      slugs: ['sling-angle-compression-force', 'spreader-beam-misuse', 'centre-of-gravity-in-lifting', 'bolted-flange-vs-end-cap-spreader-beams', 'sling-angle-chart'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-11-16',
      note: 'Ratings from the load charts on our live listings. The certificate and user instructions for a specific beam govern.',
    },
    {
      type: 'cta_block',
      heading: 'Spreader or lifting beam?',
      body: 'Send the load weight, the position of its lifting points or centre of gravity, and the hook height you have. We will propose the beam and quote it with its top and bottom rigging.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
