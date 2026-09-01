import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The article that has to be willing to say "that component is scrap".
 *
 * Publishes no thread-repair procedure for a pressure-carrying port. Inserts
 * and re-tapping are named as things that exist and as decisions belonging to
 * whoever owns the risk, not as instructions from a supplier's blog.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'damaged-port-repair-or-scrap',
  title: 'A damaged port: repair it, or is the component scrap?',
  excerpt:
    'The fitting is cheap and the thing it screws into is not. How to judge what is in front of you, and the cases where the honest answer is that it is finished.',
  categorySlug: 'failure-analysis',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:32:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'When can a damaged port be repaired, and when is the component scrap?',
      answer:
        'It turns on how much thread is intact and whether the sealing surface survived. Light damage to the first thread or two, with a clean seat, is usually recoverable. Damage through the sealing face, a stripped thread over most of its length, or a crack anywhere is not a repair question — it is a replacement question, and on a pressure-carrying component the honest answer is often that it is finished. What decides it is not the appearance but who carries the risk if the repair fails under pressure.',
    },
    {
      type: 'lead',
      html: 'Every workshop eventually finds a damaged port on a component that is expensive, on a machine that is needed, at a moment when nobody wants to hear it. The temptation to make it work is enormous. The purpose of this article is to make the judgement explicit rather than emotional.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What to establish before deciding anything.',
      anchor: 'establish',
    },
    {
      type: 'comparison_table',
      caption: 'Three questions, in order',
      columns: ['Question', 'Why it comes first'],
      rows: [
        { cells: ['Is the sealing surface intact?', 'A damaged seat cannot be sealed by any thread repair'], highlight: true },
        { cells: ['How much thread is undamaged?', 'Engagement length carries the load; the first threads carry most of it'] },
        { cells: ['Is there any crack?', 'A crack ends the discussion — it is not a thread problem'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The order matters. People start at the thread because that is where the damage is visible, and a beautifully restored thread under a damaged seat produces a joint that will never seal. <strong>Look at the seat first, under a light, at an angle.</strong>',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The options, and who owns them.',
      anchor: 'options',
    },
    {
      type: 'paragraph',
      html: 'Thread inserts, oversize repairs and re-tapping all exist and all have legitimate uses. What they have in common is that they change a pressure-carrying component from its designed condition, and <strong>the person who accepts that change owns the consequence</strong> — which is the plant’s engineer or the machine’s owner, not the fitter and not a parts supplier.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'We will not tell you how to make a damaged high-pressure port safe.',
      body: 'Not because the techniques are secret, but because the decision needs the pressure, the duty cycle, the material and the consequences of failure in front of it — and none of those are in our hands. What we can do is identify the correct fitting, tell you what the original port was, and say plainly when we think a component should be replaced.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The cheaper decision people miss.',
      anchor: 'cheaper-decision',
    },
    {
      type: 'paragraph',
      html: 'On many machines the damaged port sits in a manifold, a block or an adapter that can be replaced on its own for far less than the assembly around it. Before condemning a cylinder or a valve bank, establish <strong>what the port is actually part of</strong> — the answer is sometimes a component worth a fraction of what the conversation had assumed.',
    },
    {
      type: 'paragraph',
      html: 'And where the machine has to move today, capping the line and running on a reduced circuit is frequently possible. That is not a repair, it is a schedule decision — but it converts a stoppage into a planned job, which is usually what the site actually needs.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can a stripped port be repaired with a thread insert?',
          answer:
            'Inserts are used in industry, including on hydraulic components. Whether one is acceptable on a specific port at a specific pressure is an engineering decision for whoever owns the machine, and it depends on material, engagement and duty rather than on the technique itself.',
        },
        {
          question: 'The seat is scored but the thread is fine. Can it seal?',
          answer:
            'Not reliably. The thread holds and the seat seals, so a damaged seat with a perfect thread is a joint that will weep. Where the port design allows a seal that does not rely on the damaged surface, that is worth checking — but it is a change of joint type, not a repair.',
        },
        {
          question: 'How do I stop this happening again?',
          answer:
            'Almost every damaged port we hear about was caused by a taper thread in a straight port, a cross-thread started at an angle, or repeated over-tightening. All three are identification and make-up problems rather than accidents.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Not sure what the port was originally?',
      body: 'Photograph it with a measurement across the threads and tell us the component. We will identify the original fitting and say what we would do — including when we think the component should be replaced rather than repaired.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
