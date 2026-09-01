import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The article that talks a reader out of stainless as often as into it.
 *
 * The derating point is the one most buyers do not know: a stainless fitting is
 * frequently rated below its carbon-steel equivalent in the same size, so
 * "upgrading" a high-pressure line to stainless can be a downgrade in the
 * property that matters.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'when-stainless-is-worth-it',
  title: 'When stainless is worth it, and when it is a downgrade',
  excerpt:
    'Stainless fittings resist corrosion and often carry a lower pressure rating than the carbon-steel part they replace. Both facts matter, and only one of them is on the buyer’s mind.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'When stainless hydraulic fittings are worth it',
  seoDescription:
    'Where stainless steel fittings earn their cost, why they are often rated below carbon steel, and how to decide position by position rather than for a whole machine.',
  focusKeyword: 'when stainless is worth it',
  publishedAt: '2026-09-01T15:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Stainless answers a corrosion problem. It does not automatically answer a pressure or a strength one.',
        'A stainless fitting is frequently rated below the carbon-steel equivalent in the same size — check before substituting on a high-pressure line.',
        'The decision is per position, not per machine: exposed, washed-down and splash-zone positions earn it, internal ones rarely do.',
        'Mixing stainless and plated steel in one joint introduces a galvanic couple. Sometimes that is the right trade; make it knowingly.',
        'Stainless galls when threads are dry. Assembly practice changes with the material.',
      ],
    },
    {
      type: 'lead',
      html: 'Stainless comes up whenever a site is coastal, a plant is washed down, or a fluid is aggressive — and the conversation usually goes straight from "we have corrosion" to "quote it all in stainless". That is occasionally right and usually expensive, because the property being bought is not the property that is failing everywhere on the machine.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The derating people do not expect.',
      anchor: 'derating',
    },
    {
      type: 'paragraph',
      html: 'Pressure rating follows material strength and wall section. Common stainless grades used for fittings are not simply "better steel" — for a given size and design the working pressure of a stainless fitting is <strong>often lower than its carbon-steel counterpart</strong>. Substituting like-for-like by dimension on a high-pressure line can therefore reduce the rating of the joint while feeling like an upgrade.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check the rating on the actual part, in the actual size.',
      body: 'This is not a rule of thumb to apply across a catalogue — it varies by family, size and design. Ask for the working pressure of the stainless part you are considering and compare it against the line, not against the part it replaces.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Where it earns its cost.',
      anchor: 'where-it-earns',
    },
    {
      type: 'comparison_table',
      caption: 'Position by position',
      columns: ['Position', 'Stainless?'],
      rows: [
        { cells: ['Exposed on the outside of a machine, coastal or washdown site', 'Usually worth it'], highlight: true },
        { cells: ['Splash zone, marine deck, chemical plant', 'Yes, and specify the grade'] },
        { cells: ['Inside a housing, dry and sheltered', 'Rarely'] },
        { cells: ['High-pressure line where rating is marginal', 'Only after checking the rating'] },
        { cells: ['Everything, for consistency', 'A cost decision dressed as an engineering one'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What changes when you fit it.',
      anchor: 'fitting-it',
    },
    {
      type: 'paragraph',
      html: 'Stainless threads <strong>gall</strong> — the two surfaces cold-weld under load and the joint seizes on assembly, sometimes badly enough to destroy both parts. The mitigations are ordinary: an appropriate anti-seize on the thread and not on the sealing face, correct make-up rather than brute force, and not repeatedly assembling and dismantling the same pair. A workshop meeting stainless for the first time should know this before its first seized joint rather than after.',
    },
    {
      type: 'paragraph',
      html: 'And in a mixed installation, remember the joint is now two different metals in contact. On a coastal site that couple corrodes preferentially at the less noble side, so the plated port can end up as the casualty of the stainless fitting screwed into it. <strong>Sometimes that is still the right trade</strong> — the port is easier to protect than the exposed fitting — but it should be a decision rather than a surprise.',
    },
    {
      type: 'category_link',
      slug: 'ss316l-bsp-fittings',
      label: 'SS316L BSP fittings',
      blurb: 'Stainless BSP ends for corrosive and coastal service.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is 316 always the right stainless grade?',
          answer:
            'It is the common choice for marine and chemical exposure, and it is not universal — grade selection follows the medium and the environment. Tell us the fluid and the site and we will say what we would supply and why.',
        },
        {
          question: 'Can I mix stainless fittings with steel hose ends?',
          answer:
            'Physically yes, and it creates a galvanic couple that matters on a wet, salty site. Where the exposure is severe, match the materials through the joint rather than at one end of it.',
        },
        {
          question: 'Does stainless remove the need for good plating elsewhere?',
          answer:
            'No — it moves the problem to whatever is next to it. The most common outcome of a partial stainless conversion is that the corrosion simply reappears at the adjacent plated part.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Deciding where stainless is worth it?',
      body: 'Send the positions, the fluid and the site conditions. We will say which positions earn stainless, which do not, and where the rating means the answer is no.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
