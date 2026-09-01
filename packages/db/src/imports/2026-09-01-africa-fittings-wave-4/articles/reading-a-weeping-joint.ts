import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The entry point of the diagnostic cluster: a joint that weeps, read as
 * evidence rather than tightened harder.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'reading-a-weeping-joint',
  title: 'Reading a weeping joint: where the oil comes from tells you why',
  excerpt:
    'A weep is evidence before it is a fault. Where the oil appears — at the seat, down the thread, under the nut — narrows the cause to one of four things.',
  categorySlug: 'failure-analysis',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What does a weeping joint on a hydraulic fitting actually tell you?',
      answer:
        'Where the oil emerges tells you which surface has failed. Oil at the cone or face means the seal itself is not seating — wrong seat angle, damage, or dirt. Oil tracking down the thread on a tapered joint means the thread sealant path has failed. Oil under the nut on a straight-threaded port means the O-ring or bonded seal is wrong, damaged or reused. And oil only under load means the joint is moving. Four different causes, four different fixes, and only one of them is answered by tightening.',
    },
    {
      type: 'lead',
      html: 'The reflex when a joint weeps is a spanner, and it is usually the wrong tool. On every family except a tapered thread, the seal is made by geometry that is either correct or damaged — extra torque deforms it further. A minute spent looking at <strong>where the oil is arriving from</strong> costs nothing and points at the actual fault.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Four places oil appears, and what each means.',
      anchor: 'four-places',
    },
    {
      type: 'comparison_table',
      caption: 'Reading the leak path',
      columns: ['Where the oil appears', 'What it points at', 'What not to do'],
      rows: [
        {
          cells: ['At the cone or flat face', 'Seat damage, wrong seat angle, or dirt on the sealing face', 'Tighten — it deforms the seat further'],
          highlight: true,
        },
        { cells: ['Down the thread, tapered joint', 'Sealant path failed, or the thread is over-engaged', 'Add more tape over the old tape'] },
        { cells: ['Under the nut, straight thread', 'O-ring or bonded seal wrong, damaged, or reused', 'Assume the fitting is faulty'] },
        { cells: ['Only under load', 'The joint is moving — clamping or a lever arm', 'Fix it at the joint alone'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Clean it before you diagnose it.',
      body: 'Oil tracks along a hose and drips somewhere else entirely, so the wet spot is not always the leak. Degrease the whole joint, run the machine, and look again. Diagnosing from the drip rather than the source is how a good fitting gets replaced and the leak survives the repair.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The one case where tightening is right.',
      anchor: 'when-to-tighten',
    },
    {
      type: 'paragraph',
      html: 'A joint that was genuinely under-made-up will seal when it is brought up correctly, and the honest way to establish that is the flats-from-finger-tight method rather than feel. If a joint has already been made up correctly and still weeps, <strong>more torque will not fix it and will usually make the next repair worse</strong> — the seat rolls, the port thread stretches, and what was a seal replacement becomes a component replacement.',
    },
    {
      type: 'paragraph',
      html: 'On a site with no torque wrench — which is most of the sites this article is written for — the practical rule is one attempt at correct make-up, then dismantle and inspect. Two attempts at tightening is the point where people start damaging things.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to look at once it is apart.',
      anchor: 'once-apart',
    },
    {
      type: 'paragraph',
      html: 'Look at the <strong>sealing face under a light, at an angle</strong>. A radial scratch across a cone or a flat face is a leak path and no amount of assembly will close it. Look at the O-ring for a flat spot or a nick from installation. Look at the first two threads for pickup or deformation. And look at what came out on the rag: metal particles mean something is being worn, not merely leaking.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Photograph the parts before they go in the bin.',
      body: 'A weeping joint is the cheapest diagnostic opportunity a machine offers, and the evidence is discarded within a minute of the repair. A photograph of the seat and the seal, with the fitting beside them, is enough for us to say whether the part was wrong, damaged or simply reused.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'The joint stopped weeping after I tightened it. Is that a fix?',
          answer:
            'Sometimes, if it was genuinely loose. Often it is a deformed seat sealing temporarily under extra load, which returns as a weep and eventually as a failure. If it needed more than correct make-up, treat it as unresolved and plan the change.',
        },
        {
          question: 'Can I reuse the bonded seal after checking the joint?',
          answer:
            'In practice no. The rubber has taken a set, and a re-used bonded seal is the most common reason a joint leaks on the second assembly. They cost very little and they are the item worth keeping by the box.',
        },
        {
          question: 'Does a weep matter if it is only a drip?',
          answer:
            'It matters as information. A drip is a joint telling you which surface has failed, and the same fault under a pressure spike is a spray rather than a drip — which is a different order of problem next to a person.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Sending a joint back for a verdict?',
      body: 'Photograph the sealing face, the seal and the fitting together before the parts are binned. We will say whether it was the wrong part, a damaged one or a reused one — and quote the correct one.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
