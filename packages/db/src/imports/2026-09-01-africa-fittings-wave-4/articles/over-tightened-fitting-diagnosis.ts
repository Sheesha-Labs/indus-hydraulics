import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Downstream of `hydraulic-fitting-make-up-torque`, which teaches the method.
 * This one is about reading a joint that has already been assembled by someone
 * else — the normal case on a used machine or a rented one.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'over-tightened-fitting-diagnosis',
  title: 'Over-tightened or under-tightened: reading a joint after the fact',
  excerpt:
    'Both faults leak, and the marks they leave are different. What to look for on a joint somebody else assembled, and which of the two is the expensive one.',
  categorySlug: 'failure-analysis',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:24:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An over-tightened fitting and a loose one both weep, and they leave completely different evidence behind.',
        'Under-tightening leaves clean, undamaged surfaces — the joint simply was not brought up.',
        'Over-tightening leaves rolled seats, stretched threads, flattened O-rings and sometimes a cracked nut.',
        'The expensive half is over-tightening, because the damage moves into the port rather than staying in the fitting.',
        'On a used machine, assume nothing about how the last person assembled it.',
      ],
    },
    {
      type: 'lead',
      html: 'Diagnosing an over-tightened fitting matters most on machines other people have worked on — a used import, a rental, anything with an unrecorded repair history. The joint in front of you was made up by somebody whose habits you do not know, and the two ways they could have got it wrong need opposite responses.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The evidence each fault leaves.',
      anchor: 'evidence',
    },
    {
      type: 'comparison_table',
      caption: 'Same symptom, opposite causes',
      columns: ['What you find', 'Under-tightened', 'Over-tightened'],
      rows: [
        { cells: ['Sealing face', 'Clean, unmarked', 'Rolled, burnished or galled'], highlight: true },
        { cells: ['O-ring or bonded seal', 'Round, undamaged', 'Flattened, extruded, sometimes cut'] },
        { cells: ['Threads', 'Normal', 'Pickup, stretch, or a nut that will not run freely'] },
        { cells: ['Port', 'Unaffected', 'First threads deformed — the expensive part'] },
        { cells: ['Behaviour', 'Weeps steadily from new', 'Sealed at first, then weeps and worsens'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The bottom row is the one that costs money.',
      body: 'An under-tightened joint has done no harm and will seal when made up correctly. An over-tightened one has moved damage into the component behind it, and the bill is a valve block or a cylinder rather than a fitting. That asymmetry is the whole argument for correct make-up rather than "tight enough".',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Why it happens more where there are no tools.',
      anchor: 'no-tools',
    },
    {
      type: 'paragraph',
      html: 'A torque wrench is rare on the sites we supply, and the substitute is judgement built on pipework habits — where tighter genuinely is better. Carried into a joint that seals on a cone, a flat face or an O-ring, that habit is destructive. <strong>The flats-from-finger-tight method needs no tool at all</strong> and is the practical answer where a wrench is not available; the existing article on make-up covers the method itself.',
    },
    {
      type: 'paragraph',
      html: 'The second driver is a joint that would not seal for a reason nobody diagnosed. It gets tightened, then tightened again, and the fault it was masking is still there underneath the damage now added to it.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to do with what you find.',
      anchor: 'what-to-do',
    },
    {
      type: 'decision_tree',
      heading: 'After inspection',
      branches: [
        {
          condition: 'Clean surfaces, seal intact',
          outcome: 'Re-make correctly with a new seal',
          detail: 'Nothing is damaged. Replace the elastomer anyway — it is the cheapest part of the job.',
        },
        {
          condition: 'Fitting damaged, port clean',
          outcome: 'Replace the fitting',
          detail: 'The ordinary outcome, and the reason to keep the common ends in stock rather than ordering per failure.',
        },
        {
          condition: 'Port thread damaged',
          outcome: 'Stop and assess the component',
          detail:
            'This is no longer a fitting job. Whether the port can be saved is a separate question and the answer is sometimes no.',
        },
        {
          condition: 'Damage on a machine you are about to hand over',
          outcome: 'Record it',
          detail: 'An undocumented over-tightened port becomes the next person’s mystery leak.',
        },
      ],
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can a fitting be re-used after being over-tightened?',
          answer:
            'If the sealing face is marked, no — the mark is a leak path and it does not go away. If it was over-tightened but the surfaces are unmarked, it can be, with a new seal, but inspect the threads carefully first.',
        },
        {
          question: 'How tight is correct without a torque wrench?',
          answer:
            'Finger tight, then a defined number of flats depending on the family and size. That method exists precisely because the torque figure is impractical on a machine, and it is more repeatable than feel.',
        },
        {
          question: 'Everything on this machine looks over-tightened. Now what?',
          answer:
            'Assume the habit rather than the incident, and check the ports rather than the fittings — fittings are cheap and ports are not. Where several ports are damaged, that is a training conversation rather than a parts order.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Port damaged rather than the fitting?',
      body: 'Photograph the port threads and tell us what the component is. We will say whether a repair option exists, and quote the fitting either way so the machine is not waiting on the answer.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
