import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The shortest article in the wave, deliberately.
 *
 * Korean machines sit between the Japanese and European conventions and the
 * honest answer is "expect both, and a machine may carry either" — so the
 * article is about the consequence of that (carry bridging adapters, identify
 * per line rather than per machine) rather than padding out a thread table we
 * cannot substantiate.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'korean-excavator-hydraulic-fittings',
  title: 'Korean excavator hydraulic fittings: expect more than one convention',
  excerpt:
    'These machines sit between the Japanese and European worlds, and the honest answer is that a single machine can carry both. What that means for how you identify and how you stock.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Korean excavator hydraulic fittings — conventions to expect',
  seoDescription:
    'Which thread families to expect on Korean-built excavators, why a single machine can carry more than one, and how to identify per line rather than per machine.',
  focusKeyword: 'korean excavator hydraulic fittings',
  publishedAt: '2026-09-01T13:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Expect metric families and 30° flare families both, sometimes on the same machine.',
        'Identify per line, not per machine — the assumption that one machine means one convention is what causes the wasted trip.',
        'Flanges at the pump and travel motors, as on every machine of this size.',
        'Machines that have been rebuilt carry whatever the rebuild used, which on an imported second-hand machine can be anything.',
        'Two gauges — seat angle and thread pitch — resolve every one of these questions in seconds.',
      ],
    },
    {
      type: 'lead',
      html: 'Korean excavator hydraulic fittings defeat the habit of learning one convention per manufacturer. Korean excavators and loaders are everywhere in the fleets we supply, and they are the machine that most often defeats the habit of learning one convention per manufacturer. The useful mental model is not "this brand uses that thread"; it is that these machines were designed in a region where two conventions are both normal, and either may appear.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Why one machine can carry two families.',
      anchor: 'two-families',
    },
    {
      type: 'paragraph',
      html: 'Hydraulic components on a large machine come from many suppliers. A pump, a travel motor, a control valve and a cylinder may each arrive at the assembly line with the port convention their own maker uses, and the machine is plumbed to suit rather than converted to a single standard. <strong>The result is a machine that is genuinely mixed from new</strong>, before any repair has touched it.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Identify per line, not per machine.',
      body: 'The practical consequence is small but saves a lot of driving: when you note down what a machine uses, note it per position — boom cylinder, travel motor, valve bank — rather than as one answer for the whole machine.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What a second-hand import adds to that.',
      anchor: 'second-hand',
    },
    {
      type: 'paragraph',
      html: 'A used machine also carries its repair history. Every hose replaced in its previous life was made up from what that workshop stocked, which is why an imported machine often has an adapter stack at one end of a hose and a different family at the other. None of that is wrong — it was the right decision at the time — but it means the machine in front of you is not the machine in the manual.',
    },
    {
      type: 'paragraph',
      html: 'When you re-hose such a machine, it is worth <strong>taking the opportunity to simplify</strong>: replace an adapter stack with a single hose end in the right family, and write down what you did. The next repair is then a phone call rather than an investigation.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The two gauges that end the guessing.',
      anchor: 'gauges',
    },
    {
      type: 'comparison_table',
      caption: 'What each tool settles',
      columns: ['Tool', 'Answers'],
      rows: [
        { cells: ['Seat angle gauge', '24°, 30°, 37° or flat face — the family'], highlight: true },
        { cells: ['Thread pitch gauge', 'Metric pitch or threads per inch — the thread'] },
        { cells: ['Caliper', 'Diameter across the crests — the size'] },
        { cells: ['A phone camera', 'Everything else, when you send it to us'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'metric-adapters',
      label: 'Metric adapters',
      blurb: 'Metric ends, studs and bridging parts.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is there a single thread standard for Korean machines?',
          answer:
            'No, and treating it as though there were is the mistake. Expect metric and 30° flare families, identify each line rather than the machine, and keep bridging adapters for the two conventions your fleet actually mixes.',
        },
        {
          question: 'My machine has different ends on the same hose. Is that a fault?',
          answer:
            'Not necessarily — many hoses are built that way from new, because the two components they join use different conventions. It only becomes a problem when a stack of adapters has grown at one end, which adds leak paths and moves the hose out of its intended position.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Re-hosing a mixed machine?',
      body: 'Photograph both ends of each hose you are replacing, with the thread measured. We will name the parts, and where a stack of adapters can become one correct end, we will say so.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
