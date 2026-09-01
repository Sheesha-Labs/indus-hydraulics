import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Water-well and small drilling rigs — the most mobile customer in the sprint
 * and the one furthest from any counter on the day it matters. No market card:
 * the article is about the rig, not a country.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'water-well-drilling-rig-fittings',
  title: 'Water well drilling rig fittings: stocking for a machine that moves',
  excerpt:
    'A drilling rig is a workshop that relocates every few weeks, usually further from help each time. What travels with it decides whether a failure costs hours or a fortnight.',
  categorySlug: 'hydraulic-fittings-by-industry',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Water well drilling rig hydraulic fittings and spares',
  seoDescription:
    'Which hydraulic fittings and spares to carry on a water-well drilling rig, what fails on rotation and feed circuits, and how to stock a machine that moves.',
  focusKeyword: 'water well drilling rig fittings',
  publishedAt: '2026-09-01T15:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The rig carries its own store. Anything not on the truck is days away, minimum.',
        'Rotation, feed and mast circuits take the load; the compressor and water lines take the abuse.',
        'Vibration and repeated rig-up and rig-down loosen joints that would be stable on a static machine.',
        'Consumables — seals, bonded washers, caps — matter more here than anywhere else in this series.',
        'One spare made-up assembly for each critical circuit is worth more than a drawer of adapters.',
      ],
    },
    {
      type: 'lead',
      html: 'Drilling rig fittings have to be on the truck, because anything that is not is days away. Water-well and small exploration rigs are the most self-contained customers we supply. They rig up in a village or a bush site, work for days or weeks, and rig down and move — and the supply chain behind them is whatever fits on the support vehicle. A hydraulic failure on a rig is not a maintenance event; it is a project stoppage with a crew standing around it.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Where a rig actually fails.',
      anchor: 'where-it-fails',
    },
    {
      type: 'comparison_table',
      caption: 'By circuit',
      columns: ['Circuit', 'What goes wrong'],
      rows: [
        { cells: ['Rotation head', 'High duty, heat, and hoses that move with the head'], highlight: true },
        { cells: ['Feed and pull-down', 'Load cycling; joints loosen and seats fret'] },
        { cells: ['Mast raise and levelling jacks', 'Used at every rig-up; the joints get disturbed constantly'] },
        { cells: ['Water and air lines', 'Abrasion, dragging, and being walked on'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The third row is the one that distinguishes a rig from static plant. <strong>Every move is a disturbance event</strong> — hoses are handled, joints are broken and remade, lines are dragged across a site — and the failures cluster in the days after a move rather than being spread evenly through the job.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Inspect after rig-up, not before rig-down.',
      body: 'The useful inspection is the one at the new site with the mast up and pressure on the system, because that is when handling damage and disturbed joints reveal themselves. An inspection at the end of the last job checks a machine that is about to be shaken apart on a truck.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What to carry on the truck.',
      anchor: 'the-truck',
    },
    {
      type: 'paragraph',
      html: 'Adapters are useful and assemblies are decisive. A made-up spare for each circuit that stops the rig — rotation feed, mast raise, the pull-down line — turns a stoppage into a change-out, whereas a box of loose fittings turns it into a fabrication job you cannot do without a crimper. Where the rig carries a crimper and someone trained, bulk hose and ends cover more part numbers for the same space.',
    },
    {
      type: 'comparison_table',
      caption: 'A truck kit that earns its space',
      columns: ['Item', 'Why'],
      rows: [
        { cells: ['One made-up assembly per stopping circuit', 'Turns a stoppage into a change-out'] },
        { cells: ['Ends and ferrules in the rig’s bores', 'Covers what the assemblies do not'] },
        { cells: ['Bonded seals and O-rings, by the box', 'The commonest reason a repair stalls half-done'], highlight: true },
        { cells: ['Plugs and caps', 'Lets the rig work on a reduced circuit while a part is in transit'] },
        { cells: ['Pitch and seat gauges', 'Identification in the field, without a signal'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Ordering for a machine with no fixed address.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Deliveries chase a rig badly. The practical pattern is to <strong>order to the contractor’s base rather than to the site</strong>, hold the consignment there, and move parts out with the crew rotation — and to keep a small air-freight budget for the genuine stoppage. Nothing about that is unusual; what is unusual is how rarely it is planned before the first stoppage rather than after it.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is a crimper worth carrying on a rig?',
          answer:
            'Where the rig works far from any hose shop and the crew is trained, yes — one coil of hose and a set of ends covers many failures. It is a capability decision with training attached rather than a purchase.',
        },
        {
          question: 'What is the single most useful spare?',
          answer:
            'A made-up assembly for whichever circuit stops the rig. It is the item that converts a multi-day wait into an hour of work, and it is usually the item nobody bought because it looked expensive.',
        },
        {
          question: 'Can you supply a kit built around our rig?',
          answer:
            'Yes. Send photographs of the ends at the main circuits with measurements, and how far the rig typically works from your base. We will build the truck kit and the base stock separately.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Kitting a rig before it moves out?',
      body: 'Send the circuits and the ends. We will quote a truck kit and a base stock, and say which assemblies are worth having made up in advance rather than fabricated in the field.',
      quoteLabel: 'Build a kit',
    },
  ],
}

export default ARTICLE
