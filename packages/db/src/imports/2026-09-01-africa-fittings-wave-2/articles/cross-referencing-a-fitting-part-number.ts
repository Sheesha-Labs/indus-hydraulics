import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The fittings analogue of `how-to-cross-reference-a-hydraulic-hose`, which
 * teaches the method and refuses to publish an interchange table because we
 * hold no verified interchange data. Same position here, same reason.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cross-referencing-a-fitting-part-number',
  title: 'Cross-referencing a fitting part number when the brand is gone',
  excerpt:
    'A part number describes a fitting in one manufacturer’s language. Translating it means decoding what it says about geometry — and geometry is the only thing that has to match.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Cross-referencing a fitting part number — how to do it safely',
  seoDescription:
    'How to translate a hydraulic fitting part number into the geometry that matters, why interchange tables are risky, and what to send instead.',
  focusKeyword: 'cross-referencing a fitting part number',
  publishedAt: '2026-09-01T14:35:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do I find the equivalent of a fitting part number I cannot decode?',
      answer:
        'Stop treating the number as the thing to match and treat the geometry as the thing to match: end forms at both ends, thread and seat at each, bore, pressure rating and material. A number encodes those in one manufacturer’s scheme; another maker’s number encodes the same facts differently. Two parts are interchangeable when the geometry and rating agree, not when a table says so.',
    },
    {
      type: 'lead',
      html: 'Cross-referencing comes up constantly on imported machines, where the fitting on the machine came from a supply chain nobody local is part of. It is a solvable problem, and the reason it goes wrong is almost always that the number was trusted further than it deserved.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What a part number actually encodes.',
      anchor: 'what-it-encodes',
    },
    {
      type: 'paragraph',
      html: 'Most fitting numbering schemes are descriptive rather than arbitrary: a block for the shape, blocks for each end, a block for size, sometimes a suffix for material or seal. Once you know which block is which, the number becomes a specification you can read. <strong>The trap is that the block boundaries differ by maker</strong>, so a scheme learned on one brand actively misleads on another.',
    },
    {
      type: 'comparison_table',
      caption: 'The properties that have to match, in order of consequence',
      columns: ['Property', 'What goes wrong if it does not match'],
      rows: [
        { cells: ['Thread and seat at each end', 'It will not seal, or will not fit at all'], highlight: true },
        { cells: ['Pressure rating', 'The dangerous mismatch — it fits and then it fails'] },
        { cells: ['Bore', 'Flow restriction, heat, and pressure drop'] },
        { cells: ['Material and plating', 'Corrosion life, and galvanic behaviour against what it joins'] },
        { cells: ['Shape and orientation', 'A hose that no longer sits where it was routed'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Why we do not publish an interchange table.',
      anchor: 'no-table',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'An interchange table is a safety claim, and ours would be a guess.',
      body: 'A table asserting that one maker’s part replaces another’s is a statement about pressure rating and material as well as geometry. We hold no verified interchange data, so publishing one would mean inventing it — and the failure mode is a part that fits, holds for a while, and lets go on a machine with a person beside it. The method below is what we can stand behind.',
    },
    {
      type: 'decision_tree',
      heading: 'Working from a number you cannot decode',
      branches: [
        {
          condition: 'The part is in your hand',
          outcome: 'Measure it and ignore the number',
          detail:
            'Thread across the crests, pitch, seat, bore, both ends. The number becomes a cross-check rather than the input.',
        },
        {
          condition: 'The part is gone but the machine is there',
          outcome: 'Measure the port and the hose end it mated to',
          detail: 'The two halves of the joint define the fitting between them.',
        },
        {
          condition: 'Neither — you have only a number from a parts list',
          outcome: 'Send the number, the machine and the position',
          detail:
            'We will say what we can infer and what remains ambiguous. Where it is ambiguous, we would rather tell you than ship a probability.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The rating question people skip.',
      anchor: 'rating',
    },
    {
      type: 'paragraph',
      html: 'Two adapters with identical threads and seats can carry very different working pressures, because rating follows material, wall section and manufacturing route rather than appearance. On a return line the difference is invisible; on a pump line it is the whole thing. <strong>When cross-referencing, name the pressure the line actually sees</strong> rather than assuming that a part that fits was designed for it.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can you match a competitor’s part number?',
          answer:
            'We can identify what a part is from its geometry and quote an equivalent against that, stating the rating and material of what we supply. What we will not do is assert an interchange we cannot verify — the check belongs on the geometry, not on a table.',
        },
        {
          question: 'The number is stamped on the fitting but half worn away.',
          answer:
            'Photograph it anyway, along with the measurements. A partial number often narrows the family enough to confirm what the measurements already say, which is exactly the role it should play.',
        },
        {
          question: 'Is a "same dimensions" part always safe?',
          answer:
            'Not on its own. Dimensions plus pressure rating plus material is the test. If the line is a high-pressure one, treat the rating as the first question rather than the last.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Holding a number nobody recognises?',
      body: 'Send it with a photograph and whatever you can measure. We will decode what we can, name what we are sure of, and tell you plainly where the number leaves a question open.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
