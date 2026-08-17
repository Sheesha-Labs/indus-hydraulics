import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'water-suction-and-dewatering-hose',
  title: 'Dewatering and water transfer hose: why suction is the whole specification',
  excerpt:
    'On a dewatering set the pump is rarely the problem. Suction hose that collapses, leaks air or sits above the water line accounts for most of the calls.',
  categorySlug: 'industrial-hose',
  authorSlug: 'mehul-rana',
  seoTitle: 'Water suction and dewatering hose selection',
  seoDescription:
    'Choosing suction and delivery hose for dewatering: why delivery hose collapses under vacuum, what an air leak does to priming, and how lift affects the specification.',
  focusKeyword: 'water suction and delivery hose',
  publishedAt: '2026-08-17T16:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A pump that will not prime is usually a suction-side problem, and usually the hose or its couplings rather than the pump.',
        'Delivery hose collapses under vacuum. Suction duty needs a helix-reinforced construction, which is why it is heavier and stiffer.',
        'An air leak on the suction side stops a pump priming even though nothing leaks water — because the leak only shows under vacuum.',
        'Suction hose kinked flat at the pump inlet is a very common site fault, and it presents as a pump fault.',
        'On construction dewatering the hose spends its life being dragged, driven over and left in the sun. Specify for the handling, not just the fluid.',
      ],
    },
    {
      type: 'lead',
      html: 'Dewatering is the application where the hose is most often blamed last and at fault first. Water is not aggressive, pressures are modest and the pump is the expensive item — so when a set will not prime, the pump gets attention while the actual cause is usually a few metres upstream of it.',
    },

    { type: 'section_head', number: '/01', title: 'Suction is a different hose.', anchor: 'suction-is-different' },
    {
      type: 'direct_answer',
      question: 'Why can you not use delivery hose for suction?',
      answer:
        'Because it is built to resist pressure from the inside and has nothing holding the wall out against vacuum. On the suction side it flattens, chokes the flow and eventually stops the pump priming altogether. Suction hose carries a reinforcing helix specifically to hold the bore open under negative pressure.',
    },
    {
      type: 'paragraph',
      html: 'The confusion is understandable, because the failure is intermittent. A delivery hose pressed into suction service often works while the pump is primed and the lift is small, then collapses the moment conditions get harder — which reads as a pump losing performance rather than a hose doing exactly what it was always going to do.',
    },

    { type: 'section_head', number: '/02', title: 'Air leaks you cannot see.', anchor: 'air-leaks' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A suction-side leak leaks air inward, not water outward.',
      body: 'This is why it is missed. There is nothing wet to find — the joint is under vacuum, so it draws air in. The symptom is a pump that will not hold prime, and the cause is often a coupling or a gasket that looks perfectly sound.',
    },
    {
      type: 'comparison_table',
      caption: 'Symptom to cause on a dewatering set',
      columns: ['Symptom', 'Likely cause', 'Check'],
      rows: [
        { cells: ['Will not prime at all', 'Air ingress on the suction side, or a collapsed hose', 'Couplings, gaskets, and the hose at the inlet'], highlight: true },
        { cells: ['Primes then loses prime', 'Intermittent air leak, or strainer breaking the surface', 'Submergence depth and joint integrity'] },
        { cells: ['Flow drops as level falls', 'Lift exceeding what the set can manage', 'Static lift, and whether the hose run has risen'] },
        { cells: ['Hose flattened at the inlet', 'Delivery hose on suction duty, or a kink', 'Construction — is there a helix?'] },
        { cells: ['Gradual flow loss over weeks', 'Partially blocked strainer', 'Strainer, before anything else'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Specify for the handling.', anchor: 'handling' },
    {
      type: 'paragraph',
      html: 'Construction dewatering hose is dragged across rubble, driven over, coiled wet and left in direct sun between jobs. Cover abrasion resistance and UV tolerance matter more here than they would on a plant installation, and a hose specified purely on bore and pressure will be technically correct and short-lived. Where sets move frequently, weight matters too — a hose nobody can handle gets dropped rather than carried.',
    },
    { type: 'product_embed', heading: 'Suction and delivery constructions', skus: ['IH-IH-A210', 'IH-IH-A216', 'IH-IH-DELVAC'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How do I find a suction air leak?', answer: 'Pressurise the suction line gently and look for bubbles, or work systematically through the joints re-making each one. You will not find it by looking for water, because there is none to find.' },
        { question: 'Does the strainer need to be fully submerged?', answer: 'Yes, and with margin. A strainer that breaks the surface as the level drops draws air, and the set loses prime just as the job is nearly finished.' },
        { question: 'Can I use suction hose on the delivery side?', answer: 'You can — it is stronger than it needs to be there. It is heavier, stiffer and more expensive, so it is usually a waste rather than a mistake.' },
        { question: 'Why does my hose kink at the pump inlet?', answer: 'Usually because the run turns immediately at the coupling with no straight section. Same principle as hydraulic routing: let the hose leave the fitting straight before it turns.' },
      ],
    },
    { type: 'category_link', slug: 'water-suction-delivery-hoses', label: 'Water suction and delivery hose', blurb: 'Helix-reinforced constructions for dewatering and transfer.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Selection and diagnosis principles only. Vacuum ratings and lift capability are per construction and per pump.' },
    { type: 'cta_block', heading: 'Specifying a dewatering set?', body: 'Tell us the lift, the flow and how the hose gets handled between jobs. We will specify hose and couplings that survive the site, not just the duty.', quoteLabel: 'Specify a set' },
  ],
}

export default ARTICLE
