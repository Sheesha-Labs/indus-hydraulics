import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The commercial centre of the wave: turn a fleet into a stock list.
 *
 * Deliberately does not publish a fixed kit list. A kit that suits a mixed
 * fleet is derived from that fleet, and a canned list would be wrong for
 * nearly everyone who read it — which is also why we quote against a yard walk
 * rather than selling a box.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'adapter-kit-for-a-mixed-fleet',
  title: 'Building an adapter kit for a mixed fleet',
  excerpt:
    'A kit built from a catalogue is mostly parts you will never fit. A kit built from a yard walk is small, cheap, and covers the failures that actually happen.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Adapter kit for a mixed fleet — how to build the right one',
  seoDescription:
    'How to derive an adapter and fitting kit from the machines you actually run, which lines to double, and why a catalogue kit is mostly dead stock.',
  focusKeyword: 'adapter kit for a mixed fleet',
  publishedAt: '2026-09-01T14:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Derive the kit from the fleet, never from a catalogue. Two or three bores account for nearly every replacement.',
        'Double the items that strand a machine; single the items that merely annoy.',
        'Seals, bonded washers and O-rings cost almost nothing and are the most common reason a repair stops halfway.',
        'Bridging adapters belong in the kit only for the family pairs your fleet actually mixes.',
        'A kit is a living list — review it once a season against what you actually used.',
      ],
    },
    {
      type: 'lead',
      html: 'An adapter kit is only worth its shelf space when it was derived from the machines in the yard. Every workshop that buys a pre-made adapter assortment ends up with the same thing: a case where four compartments are empty and thirty are full of sizes nobody has ever needed. The parts were not wrong; the selection was made by someone who had never seen the fleet.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Start from the yard, not the catalogue.',
      anchor: 'start-from-the-yard',
    },
    {
      type: 'paragraph',
      html: 'Walk the machines with a notebook and record, per machine and per position, the ends that have been replaced in the last year. You will almost always find that <strong>a small number of positions account for most of the work</strong> — boom and bucket circuits, the loader, whatever runs closest to an abrasion point — and that those positions use two or three bores between them.',
    },
    {
      type: 'paragraph',
      html: 'That list, not a catalogue index, is the kit. Everything else is available on order, and the whole point of the exercise is to be precise about which things you are choosing not to hold.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What to double and what to single.',
      anchor: 'double-or-single',
    },
    {
      type: 'comparison_table',
      caption: 'Deciding quantity by consequence rather than by price',
      columns: ['Item', 'Quantity logic'],
      rows: [
        { cells: ['Ends for the positions that stop the machine', 'Two — the second one is insurance, not stock'], highlight: true },
        { cells: ['Bridging adapters for families you genuinely mix', 'One or two, per pair you actually run'] },
        { cells: ['Bonded seals and O-rings', 'A box. They are single-use in practice and weigh nothing'] },
        { cells: ['Plugs and caps', 'A handful — for capping a line while a part is on order'] },
        { cells: ['Anything for a family you do not run', 'None'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Capping is a legitimate repair strategy.',
      body: 'A machine that can run on a reduced circuit with a line capped is not stopped. A small set of plugs and caps in the right threads buys the days between a failure and a delivery, which on a remote site is the difference between a delay and a stoppage.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'The seals nobody counts.',
      anchor: 'seals',
    },
    {
      type: 'paragraph',
      html: 'The commonest way a fittings repair stalls is not a missing fitting. It is a missing <strong>bonded seal, O-ring or dowty washer</strong> — the two-cent part that the correct joint depends on, is single-use in practice, and is not in the box because nobody thought of it as a spare. Buy them by the box in the sizes your kit implies, and store them where they will not be pinched for another job.',
    },
    {
      type: 'category_link',
      slug: 'hose-clamps-sleeves-ferrules',
      label: 'Clamps, sleeves and ferrules',
      blurb: 'The small parts a kit is not finished without.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Reviewing it.',
      anchor: 'review',
    },
    {
      type: 'paragraph',
      html: 'Once a season, compare the kit against what actually came out of it. Items used repeatedly should be doubled. Items untouched for two seasons should be questioned — either the fleet changed, or the item was aspirational. This review takes ten minutes and it is what stops a kit becoming the case with four empty compartments.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How big should a kit be?',
          answer:
            'Smaller than most people expect. For a typical mixed fleet, ends in two or three bores across the families you run, a set of bridging adapters, plugs and caps, and boxes of seals. Depth in what fails beats breadth across what exists.',
        },
        {
          question: 'Should the kit live in the workshop or on the truck?',
          answer:
            'Both, in different sizes. A truck set covers the failures you can fix in the field; the workshop set is the depth behind it. Splitting them stops the truck set being cannibalised until it is empty on the day it matters.',
        },
        {
          question: 'Can you quote a kit against our machines?',
          answer:
            'Yes — send the yard-walk notes or photographs, and we will build the list with quantities, flag which lines are worth doubling, and quote it as one consignment.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Turn a yard walk into a stock list.',
      body: 'Send the notes, however rough. We will name the parts, propose quantities based on which failures stop a machine, and quote the set as one consignment rather than a stream of parcels.',
      quoteLabel: 'Build a stock list',
    },
  ],
}

export default ARTICLE
