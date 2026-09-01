import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Agriculture, which is a different buying problem from construction.
 *
 * Tractors are repaired further from a stockist than almost anything else we
 * supply, by people who will not send a photograph and wait — so the article's
 * job is to make a farm workshop able to stock ahead correctly, rather than to
 * identify one fitting at a time.
 *
 * Implement couplers are named as a family (ISO agricultural quick couplers)
 * without asserting which size any given tractor carries.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'tractor-hydraulic-fittings',
  title: 'Tractor hydraulic fittings: what a farm workshop should stock',
  excerpt:
    'Tractors sit further from a hydraulics counter than any other machine, and the repair happens when the rain is coming. What to hold, and what to identify before you need it.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Tractor hydraulic fittings — what a farm workshop should stock',
  seoDescription:
    'The thread families found on tractors and implements, how the quick-coupler question differs from the fitting question, and what to hold on a farm before the season.',
  focusKeyword: 'tractor hydraulic fittings',
  publishedAt: '2026-09-01T12:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'BSP parallel is the family you will meet most on tractors built for markets that inherited British plumbing conventions.',
        'Implements are a separate question from the tractor — they arrive with their own convention and often their own couplers.',
        'Agricultural quick couplers are a family of their own and are not interchangeable with the industrial couplers on excavators.',
        'The failure that strands a tractor is rarely exotic: a burst hose, a stripped port, or a coupler that will not connect under residual pressure.',
        'Identify and write down what your machines use before the season, not during it.',
      ],
    },
    {
      type: 'lead',
      html: 'A tractor is repaired where it stops. That single fact separates agricultural hydraulics from every other kind we supply — an excavator is on a site with a workshop, and a tractor is in a field an hour from a road, at the point in the year when the work cannot wait. The right response is not faster identification. It is stocking correctly before the season starts.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The tractor and the implement are two different questions.',
      anchor: 'two-questions',
    },
    {
      type: 'paragraph',
      html: 'The tractor’s own circuits — steering, brakes, transmission, the loader if it has one — follow whatever convention the manufacturer built to, and for a great many tractors in circulation that means <strong>BSP parallel</strong>, with bonded seals at ports and 60° cones on unions. The implements hanging off the back are a separate population entirely: bought separately, often built by a different maker in a different country, and connected through couplers rather than through threads.',
    },
    {
      type: 'comparison_table',
      caption: 'Where the two populations differ',
      columns: ['Property', 'On the tractor', 'On the implement'],
      rows: [
        { cells: ['Convention', 'Usually consistent across the machine', 'Whatever its own maker used'] },
        { cells: ['Connection to the rest', 'Threaded, permanent', 'Quick couplers, connected daily'], highlight: true },
        { cells: ['What fails', 'Hoses, ports, occasional stripped threads', 'Couplers, seals and the hoses between'] },
        { cells: ['What to stock', 'Hose ends and adapters in the tractor’s family', 'Spare coupler halves and seals'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Couplers are their own world.',
      anchor: 'couplers',
    },
    {
      type: 'paragraph',
      html: 'Agricultural quick couplers are a distinct family, standardised separately from the industrial couplers used on excavators and skid steers. They are designed to be connected and disconnected constantly, often by someone in gloves in poor light, and they carry their own failure mode: <strong>a coupler will not connect against trapped pressure</strong>. Heat in the sun raises the pressure in a disconnected implement line, and by afternoon the half that connected easily in the morning will not go on at all.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never lever a coupler on.',
      body: 'If it will not connect, there is pressure behind it. Relieve it properly rather than forcing the connection — a coupler forced together carries damage to its seal that will show up as a slow drip and then as a failure when the implement is loaded.',
    },
    {
      type: 'category_link',
      slug: 'quick-couplers',
      label: 'Quick couplers',
      blurb: 'Coupler halves, dust caps and seals.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The pre-season list.',
      anchor: 'pre-season',
    },
    {
      type: 'paragraph',
      html: 'The most useful hour a farm workshop spends is before the season, with a caliper and a notebook, writing down what each machine actually carries. Ports at the loader, the ends on the two hoses that always fail, the coupler sizes on each implement. Photograph them. That page turns an emergency into a phone call — and it is the single thing that makes ordering ahead possible at all when the nearest counter is a long drive away.',
    },
    {
      type: 'comparison_table',
      caption: 'Worth having on the shelf before the season',
      columns: ['Item', 'Why'],
      rows: [
        { cells: ['Hose ends in the tractor’s family, in the two commonest bores', 'The hose that fails is nearly always one of two'] },
        { cells: ['Bonded seals, a box of the sizes you use', 'They are single-use in practice and cost almost nothing'] },
        { cells: ['One spare coupler half per implement type', 'The part most likely to be damaged by daily handling'] },
        { cells: ['A short list of bridging adapters', 'For the implement that does not match the tractor'] },
        { cells: ['Dust caps', 'Cheap, and the reason the coupler lasts a season instead of a month'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Buy the season’s consumables as one consignment.',
      body: 'For farms far from a supplier, a single ordered set before the season costs less to ship and less in downtime than four emergency parcels during it. Send the list from your notebook and we will quote it as one.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Are tractor fittings BSP?',
          answer:
            'BSP parallel is very common, particularly on tractors built for markets that inherited British plumbing conventions, but it is not universal and implements frequently differ from the tractor they hang on. Measure rather than assume — and write down what each machine carries so you only have to do it once.',
        },
        {
          question: 'Can I use an industrial quick coupler on an implement?',
          answer:
            'They are different families and do not interchange. Replacing one half with a coupler from another family gives you a connection that appears to work on one implement and fits nothing else you own.',
        },
        {
          question: 'The coupler will not connect in the afternoon but did in the morning.',
          answer:
            'Trapped pressure from heat in a disconnected line. Relieve it at the implement rather than forcing the halves together. It is the most common coupler complaint we hear and it is not a fault in the coupler.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Stocking a farm workshop before the season?',
      body: 'Send your list — machines, implements, the ends you replace most — and we will quote the set as one consignment, with the bridging adapters your particular mix needs.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
