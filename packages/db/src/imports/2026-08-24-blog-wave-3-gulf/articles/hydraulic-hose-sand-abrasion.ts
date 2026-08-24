import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-sand-abrasion',
  title: 'Sand: the abrasive that gets between the hose and everything else',
  excerpt:
    'On a desert site the hose is not rubbing against a bracket. It is rubbing against a bracket through a layer of sand — and that changes both how fast the cover goes and what actually stops it.',
  categorySlug: 'gulf-conditions',
  authorSlug: 'mehul-rana',
  seoTitle: 'Hydraulic hose sand abrasion — protection on desert sites',
  seoDescription:
    'Why sand accelerates hydraulic hose cover wear, why a clamp can make it worse, and how to choose between sleeving, spiral guard and re-routing on a desert site.',
  focusKeyword: 'hose sand abrasion protection',
  publishedAt: '2026-08-24T13:55:53.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Sand turns every contact point into a grinding point, and it turns some non-contact points into contact points.',
        'A clamp with sand in it wears the hose faster than no clamp at all — the sand is held against the cover and cannot escape.',
        'Spiral guard sheds sand better than a close-fitting textile sleeve, which can hold it against the hose.',
        'Sand also loads the outside of every fitting, so it shortens the life of anything that has to move or seal.',
        'The cover is the sacrificial layer. Once reinforcement shows, the assembly is finished regardless of how good it looks elsewhere.',
      ],
    },
    {
      type: 'lead',
      html: 'Abrasion is the most preventable hose failure anywhere. On a desert site it is also the fastest, because the surfaces doing the abrading are not the ones anybody designed against — they are ordinary brackets and clamps with a few grains of quartz sitting between them and the hose.',
    },

    { type: 'section_head', number: '/01', title: 'Why the same contact is worse here.', anchor: 'why-worse' },
    {
      type: 'paragraph',
      html: 'A hose resting against a smooth bracket wears slowly; rubber against painted steel is not a very effective abrasive pair. Introduce sand and the contact becomes rubber against quartz, which is harder than almost anything else on the machine. <strong>The bracket stops being the abrasive and becomes the anvil.</strong>',
    },
    {
      type: 'paragraph',
      html: 'It also creates contacts that would not otherwise exist. Sand builds up in the space between a hose and a frame member, and a gap that was adequate clearance becomes a wear point without anything having moved.',
    },
    {
      type: 'direct_answer',
      question: 'How do you protect hydraulic hoses from sand abrasion?',
      answer:
        'By removing contact where possible and shedding sand where it is not. Re-route so the hose does not touch anything; where it must, use spiral guard rather than a close-fitting sleeve, because sand trapped inside a tight sleeve grinds instead of falling out. Clamps need checking and clearing rather than simply tightening.',
    },

    { type: 'section_head', number: '/02', title: 'The clamp problem.', anchor: 'clamps' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A clamp full of sand is a grinding jig.',
      body: 'Clamping is normally the right answer to abrasion, because it stops the hose moving. On a dusty site a clamp that has filled with sand holds the abrasive firmly against the cover and gives it nowhere to go, so the hose wears at the one point that was supposed to be protected. Clamps on desert plant need clearing as a maintenance item, not just checking for tightness.',
    },
    {
      type: 'comparison_table',
      caption: 'Protection options where sand is present',
      columns: ['Option', 'Sheds sand?', 'Notes'],
      rows: [
        { cells: ['Re-route away from contact', 'Not applicable — no contact', 'Always the best answer where there is room'], highlight: true },
        { cells: ['Spiral guard', 'Yes — open construction', 'Sand falls through rather than accumulating'] },
        { cells: ['Close-fitting textile sleeve', 'Poorly', 'Excellent against rubbing, can trap grit against the cover'] },
        { cells: ['Clamp', 'No', 'Effective, but needs clearing on a dusty site'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'It is not only the hose.', anchor: 'not-only-hose' },
    {
      type: 'paragraph',
      html: 'Sand loads every external surface on the machine, and hydraulic connections are among the things that suffer. Grit on a fitting thread makes assembly harder and can damage a seat; grit on a quick coupler face is carried straight into the circuit on the next connection. <strong>On a dusty site, capping and wiping couplers before connecting is a fluid-cleanliness measure, not housekeeping.</strong>',
    },
    { type: 'category_link', slug: 'hose-clamps-sleeves-ferrules', label: 'Clamps, sleeves and guards', blurb: 'Spiral guard and textile sleeve, sized on outside diameter.' },
    { type: 'category_link', slug: 'quick-couplers', label: 'Quick couplers', blurb: 'Dust caps are part of the coupler, not an accessory.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Spiral guard or textile sleeve?', answer: 'Spiral guard where sand is the issue, because its open construction lets grit fall out. Textile sleeve where the problem is rubbing against a smooth surface and dust is not a factor. On many desert machines both are appropriate in different places.' },
        { question: 'What size guard do I need?', answer: 'Sized on the hose outside diameter, which varies by construction at the same dash size. Tell us the grade as well as the size and we will get it right first time.' },
        { question: 'Does an abrasion-resistant cover solve it?', answer: 'It helps and it is worth specifying where contact is unavoidable. It extends the time before the cover is breached rather than stopping the wear, so it is a complement to fixing the contact, not a substitute.' },
        { question: 'How often should clamps be cleared on a desert site?', answer: 'Whenever the machine is greased is a reasonable rhythm, because someone is already going round it with a rag. What matters is that it is on a list at all — clamps are almost never inspected once fitted.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own field service practice on UAE desert sites.',
    },
    { type: 'cta_block', heading: 'Working on sand?', body: 'Tell us which machines and where the hoses run. Guarding a desert fleet properly is cheap compared with what it saves, and most of it is spiral guard and better clamping.', quoteLabel: 'Ask about site protection' },
  ],
}

export default ARTICLE
