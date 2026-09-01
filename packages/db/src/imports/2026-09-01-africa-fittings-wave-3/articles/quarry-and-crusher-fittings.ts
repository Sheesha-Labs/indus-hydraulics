import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * No market card on this one: a quarry is a quarry anywhere, and the article
 * has no place-specific content that would justify claiming it is about a
 * country. The generated reach section carries the geography.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'quarry-and-crusher-fittings',
  title: 'Quarry and crusher fittings: vibration is the whole problem',
  excerpt:
    'Crushing plant destroys joints rather than hoses. Which means the fix is joint count, clamping and torque discipline — not a heavier grade of hose.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Quarry and crusher hydraulic fittings — vibration failures',
  seoDescription:
    'Why hydraulic joints fail on crushing and screening plant, what vibration does to a port, and the changes that actually extend life in a quarry.',
  focusKeyword: 'quarry and crusher fittings',
  publishedAt: '2026-09-01T15:28:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Why do quarry and crusher fittings fail so much faster than the hose they join?',
      answer:
        'Because the plant vibrates continuously and a threaded joint is the least tolerant part of the assembly. Vibration loosens make-up, works fretting damage into seats, and fatigues the port thread behind the fitting — and every extra joint in a line multiplies the exposure. On a quarry the productive changes are almost always fewer joints, better clamping and correct make-up rather than a higher-rated hose.',
    },
    {
      type: 'lead',
      html: 'Crushing and screening is the most hostile ordinary environment we supply into. It is not extreme in pressure or temperature; it simply never stops shaking, and hydraulics tolerate almost anything better than they tolerate that.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What vibration does, in order.',
      anchor: 'what-vibration-does',
    },
    {
      type: 'comparison_table',
      caption: 'The sequence, and where to intervene',
      columns: ['Stage', 'What is happening', 'Intervention'],
      rows: [
        { cells: ['Make-up relaxes', 'The joint loses preload', 'Correct make-up, and re-check after commissioning'] },
        { cells: ['Micro-movement at the seat', 'Fretting begins on the sealing face', 'Clamping, so the hose does not drive the joint'], highlight: true },
        { cells: ['Weeping', 'The seal is no longer continuous', 'Replace before it is chased with a spanner'] },
        { cells: ['Port thread fatigue', 'The expensive failure', 'Prevented earlier, not fixed here'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Chasing a weep with a spanner is how a port dies.',
      body: 'A joint that weeps under vibration has usually lost its sealing geometry, and additional torque deforms rather than reseals it. Take it apart, look at the seat, and replace what is damaged — including the fitting, which is cheap next to the port it is screwed into.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Joint count is the design variable.',
      anchor: 'joint-count',
    },
    {
      type: 'paragraph',
      html: 'Every adapter in a line is another threaded joint exposed to the same shaking, and a stack of two or three is also a lever arm working on the port. On plant that vibrates, <strong>rebuilding a line so it has one correct end at each end is worth more than any upgrade in hose specification</strong>. It is also cheaper, which makes it an unusually easy argument to win.',
    },
    {
      type: 'paragraph',
      html: 'Where a bridge between families is genuinely unavoidable, use one correctly rated adapter and clamp the assembly so the mass of the hose is not hanging on the joint.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Dust, and the second failure mode.',
      anchor: 'dust',
    },
    {
      type: 'paragraph',
      html: 'The other quarry problem is abrasion: airborne dust turns every point where a hose touches a frame into a slow grinding operation, and the cover is gone long before anyone inspects it. Guarding, spiral wrap at contact points and routing that leaves clearance are the answers, in that order. A hose that has been abraded through its cover has already lost the corrosion protection on its reinforcement, so <strong>treat cover damage as a replacement trigger rather than a cosmetic issue.</strong>',
    },
    {
      type: 'category_link',
      slug: 'hose-clamps-sleeves-ferrules',
      label: 'Clamps and protective sleeving',
      blurb: 'What stops the second failure mode.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'What a quarry store should carry.',
      anchor: 'store',
    },
    {
      type: 'paragraph',
      html: 'Depth in very few lines: the ends used on the crusher and screen circuits, bonded seals by the box, clamps and sleeving as consumables rather than as project items, and enough hose to remake the two or three lines that fail repeatedly. Everything else can wait for a consignment, because on a quarry the failures are predictable and the same ones keep happening.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Should we re-torque fittings on vibrating plant?',
          answer:
            'Check make-up after commissioning and after any intervention, yes. Routinely tightening joints on a schedule is not the same thing and tends to damage seats — inspect for movement and weeping instead, and act on what you find.',
        },
        {
          question: 'Do stainless fittings help in a quarry?',
          answer:
            'Rarely. The problem is mechanical, not chemical, and stainless is often rated lower on pressure. Spend the money on clamping, guarding and removing joints.',
        },
        {
          question: 'Why does the same hose keep failing at the same point?',
          answer:
            'Because something is touching it or something is unclamped. Photograph the line in place before removing it — the wear mark shows you the cause, and it disappears the moment the hose is off the machine.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Same line failing every few weeks?',
      body: 'Send a photograph of it in place, before you remove it. We will tell you whether the answer is routing, clamping or a different assembly — and quote only what is actually needed.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
