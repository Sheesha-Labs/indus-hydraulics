import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * When adapting is right, and when it is a repair waiting to fail.
 *
 * `stacking-hydraulic-adapters` covers the stack itself. This is the decision
 * upstream of it: a mixed fleet forces bridging constantly, and the question is
 * which bridge to build. The honest position — adapting between families is
 * normal and correct, stacking to reach a size is not — is also the one that
 * sells fewer parts per order and keeps the customer.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'bridging-two-thread-standards',
  title: 'Bridging two thread standards: one adapter good, three adapters bad',
  excerpt:
    'A mixed fleet forces you to join families that were never meant to meet. Where that is ordinary engineering, where it becomes a leak with a schedule, and how to design it out at the next hose change.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Bridging two thread standards — adapting between fitting families',
  seoDescription:
    'When adapting between hydraulic thread families is correct, why stacked adapters fail, and how to design the bridge out when a hose is next replaced.',
  focusKeyword: 'bridging two thread standards',
  publishedAt: '2026-09-01T14:15:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Is it acceptable to adapt between two thread standards?',
      answer:
        'Yes, with one correctly rated adapter, and it is completely normal on a mixed fleet — components from different makers meet on the same machine from new. What is not acceptable is a stack: two or three adapters chained to reach a thread or a size. Every joint is a leak path, every joint is a pressure drop, and a stack also cantilevers the hose end away from where the designer put it.',
    },
    {
      type: 'lead',
      html: 'Bridging two thread standards is ordinary engineering until it becomes a stack of three adapters. Nobody plans to bridge standards. It happens because a machine arrived from one country, a replacement pump came from another, and the hose in the van has the end that was in the van. The result is a joint that works, and the question worth asking is whether it is the joint you would build if you had the parts — because at the next hose change, you will.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What a good bridge looks like.',
      anchor: 'good-bridge',
    },
    {
      type: 'comparison_table',
      caption: 'One adapter, or three',
      columns: ['Property', 'One correct adapter', 'A stack of three'],
      rows: [
        { cells: ['Leak paths added', 'One', 'Three'], highlight: true },
        { cells: ['Length added', 'Short', 'Enough to change how the hose sits'] },
        { cells: ['Weight cantilevered off the port', 'Minor', 'Meaningful, and it works on the port thread'] },
        { cells: ['What it says about the parts on hand', 'The right one was available', 'It was not, and this was the workaround'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The physical consequence people underestimate is the third row. A stack is a lever arm bolted to a port, and the machine vibrates all day. <strong>The failure often shows up in the port rather than the adapters</strong> — which is a far more expensive thing to fix than the joint that caused it.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'When a bridge is the right answer.',
      anchor: 'when-right',
    },
    {
      type: 'decision_tree',
      heading: 'Adapt, or change the hose end?',
      branches: [
        {
          condition: 'The port and the component are permanent, and they differ from new',
          outcome: 'Adapt, with one correctly rated adapter',
          detail:
            'This is ordinary. A pump with a different port convention from the valve it feeds is a design fact, not a mistake to correct.',
        },
        {
          condition: 'You are replacing the hose anyway',
          outcome: 'Change the hose end instead of adapting',
          detail:
            'A hose made with the right end at each end has no added joints at all. This is the cheapest moment to remove a bridge and the one most often missed.',
        },
        {
          condition: 'You are adapting to reach a size rather than a family',
          outcome: 'Stop — get the right part',
          detail:
            'A reducer stack to get from one bore to another usually means the wrong hose was picked. Fix that instead of plumbing around it.',
        },
        {
          condition: 'It is an emergency and the machine has to move',
          outcome: 'Bridge it, then write it on the job card',
          detail:
            'A temporary fix is legitimate. A temporary fix nobody recorded becomes permanent, and is found two years later by someone chasing a leak.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never bridge across a pressure rating.',
      body: 'An adapter has its own rating, and a chain of parts is limited by the weakest one in it. Adapting a high-pressure line through a fitting intended for a return line is the one version of this that is dangerous rather than merely untidy — check the rating of every part in the joint, not just the hose.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Designing the bridges out.',
      anchor: 'designing-out',
    },
    {
      type: 'paragraph',
      html: 'Bridges accumulate quietly. A useful habit on any machine that has been through several repairs is to note, at each hose change, whether the joint being disturbed contains adapters that a correctly-ended hose would remove. Order that hose with the right ends next time. Over a season the machine drifts back towards the plumbing it was designed with, and the number of joints on it falls.',
    },
    {
      type: 'paragraph',
      html: 'When you send us a hose to remake, tell us what is currently at each end <strong>including the adapters</strong>. Where the stack can become one hose end, we will say so and quote it that way — it is a smaller order and a better joint, and we would rather sell the second one.',
    },
    {
      type: 'category_link',
      slug: 'specialty-adapters-couplings',
      label: 'Specialty adapters',
      blurb: 'Bridging parts between families, and the awkward combinations.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How many adapters is too many?',
          answer:
            'More than one, in almost every case. If reaching the connection needs two or three, the parts on hand are wrong for the job — treat it as a temporary fix, record it, and correct it at the next hose change.',
        },
        {
          question: 'Do adapters reduce flow?',
          answer:
            'Each one adds a small restriction and each internal step change adds turbulence. On a single joint it is usually immaterial; on a stack, in a high-flow line, it is one more reason the stack is the wrong answer.',
        },
        {
          question: 'Can you supply a hose with different families at each end?',
          answer:
            'Yes, and it is frequently the right answer for a machine whose components differ from new. Send both ends and the length between sealing faces and we will build it that way.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Machine carrying adapter stacks?',
      body: 'Photograph the joints and send them with the hose lengths. Where a stack can become one hose end, we will quote it that way — fewer parts, fewer leaks, and a hose that sits where it was meant to.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
