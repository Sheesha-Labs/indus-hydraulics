import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Closes the cluster by connecting it back to wave 2's buying decisions.
 * Distinct from `should-you-buy-a-hose-crimper`, which is the capital decision;
 * this is the in-the-moment one with a machine already stopped.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'crimping-on-site-or-adapting',
  title: 'Crimping on site or adapting a line: choosing under pressure',
  excerpt:
    'Machine down, two ways out, and the wrong choice is usually the one that felt faster. What each option actually commits you to.',
  categorySlug: 'maintenance-reliability',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:56:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Is crimping on site better than adapting what you have?',
      answer:
        'Crimping wins when you have the hose, the correct ends and someone trained, because it produces the joint the machine was designed to have. Adapting wins when you do not, and it is a legitimate repair with one correct adapter. The choice goes wrong in two places: crimping with the wrong ferrule or an unverified die, which produces a joint nobody can vouch for, and adapting with a stack of three, which produces a lever arm on a port. Either is defensible; neither survives being done badly.',
    },
    {
      type: 'lead',
      html: 'This decision gets made with a machine stopped and people waiting, which is exactly when the reasoning is worst. Both options are respectable and both have a failure mode that only appears later, so it is worth having thought about it before the day it matters.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What each option commits you to.',
      anchor: 'commits',
    },
    {
      type: 'comparison_table',
      caption: 'The honest comparison',
      columns: ['Property', 'Crimping on site', 'Adapting'],
      rows: [
        { cells: ['Produces', 'The designed joint', 'A working joint with an extra interface'] },
        { cells: ['Needs', 'Hose, correct ends and ferrules, the right die, training', 'One correctly rated adapter'], highlight: true },
        { cells: ['Fails when', 'Wrong ferrule or die, or an unverified crimp', 'A stack replaces a single adapter'] },
        { cells: ['Leaves behind', 'A hose you can specify and reproduce', 'A joint someone should design out later'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A crimp is only as good as the combination it was made from.',
      body: 'Hose, ferrule, fitting and die are a matched set, and a crimp made from parts that were never qualified together is a joint whose retention is unknown. It will usually hold. "Usually" is not a specification on a line that fails next to a person.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The decision, in order.',
      anchor: 'the-decision',
    },
    {
      type: 'decision_tree',
      heading: 'Machine down, both options available',
      branches: [
        {
          condition: 'You have the matched hose, ferrule, fitting and die, and a trained operator',
          outcome: 'Crimp it',
          detail: 'This is the designed joint. Record what you built so it can be reproduced.',
        },
        {
          condition: 'You have hose but not the matched components',
          outcome: 'Adapt, and order the correct assembly',
          detail: 'An unqualified crimp is not the safer of the two options just because it looks like a proper hose.',
        },
        {
          condition: 'One correct adapter bridges it',
          outcome: 'Adapt, record it, design it out at the next change',
          detail: 'Ordinary practice. The recording is the part people skip.',
        },
        {
          condition: 'It needs two or three adapters to reach',
          outcome: 'Treat as temporary, and cap or wait if the line is high pressure',
          detail: 'A stack on a high-pressure port is where this decision stops being a preference.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What makes the choice easier next time.',
      anchor: 'next-time',
    },
    {
      type: 'paragraph',
      html: 'Almost every version of this dilemma traces back to the same two gaps: the ends that fail were not in stock, and nobody had written down what the machine actually carries. Fix those and the decision usually disappears — the correct part is on the shelf and the question never arises. <strong>Where a site is genuinely remote, holding one made-up assembly per stopping circuit removes it entirely</strong> for the failures that matter most.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is a field crimp acceptable on a high-pressure line?',
          answer:
            'When the hose, ferrule, fitting and die are a qualified combination and the operator is trained, yes — that is how assemblies are made anywhere. When any of those is improvised, it is not, and the pressure is exactly why.',
        },
        {
          question: 'How many adapters is too many?',
          answer:
            'More than one, in almost every case. Two or three means the right parts are not on hand: record it as temporary and correct it at the next hose change rather than letting it become the permanent installation.',
        },
        {
          question: 'Should a remote site own a crimper?',
          answer:
            'It is a capability decision with training and matched components attached, not a purchase. Where the fleet is large enough and the lane long enough it pays; where it is not, made-up assemblies held on site do the same job with less that can go wrong.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Tired of choosing between two compromises?',
      body: 'Send the circuits that keep stopping the machine. We will quote made-up assemblies for those positions and the ends worth stocking, so the next failure is a change-out rather than a decision.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
