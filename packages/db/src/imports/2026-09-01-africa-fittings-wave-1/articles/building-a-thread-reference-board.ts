import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The one piece of workshop practice in this wave.
 *
 * A physical board of known samples is how a workshop stops re-identifying the
 * same four threads every month. It is cheap, it needs no supplier, and it is
 * the sort of thing technicians photograph and share — which is also the sort
 * of thing that earns a link.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'building-a-thread-reference-board',
  title: 'Building a thread reference board for a mixed-fleet workshop',
  excerpt:
    'A board of known samples on the wall answers in five seconds what a catalogue answers in twenty minutes. What to put on it, how to label it, and what to keep off it.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Thread reference board for a hydraulics workshop',
  seoDescription:
    'How to build a hydraulic thread reference board: which samples to mount, how to label them so they stay trustworthy, and how to use it to order faster.',
  focusKeyword: 'thread reference board',
  publishedAt: '2026-09-01T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'lead',
      html: 'A thread reference board is the cheapest fix available for a workshop that identifies the same parts every month. Every workshop that runs a mixed fleet ends up identifying the same handful of threads over and over, usually under pressure, usually by a different person each time. A reference board fixes that for the price of an afternoon and a sheet of plywood, and it is the single cheapest improvement most of the workshops we supply could make.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Mount known-good male and female samples of every family your fleet actually uses.',
        'Label each with the thread, the seat and where on the machine it came from — not just the family name.',
        'Keep it to what you have. A board carrying families you never meet trains people to guess.',
        'Chain a pitch gauge and a seat gauge to the board so they are never missing.',
        'Photograph the finished board. That photograph is what you send when you order.',
      ],
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What goes on it.',
      anchor: 'what-goes-on',
    },
    {
      type: 'paragraph',
      html: 'Samples, not pictures. A person identifying a fitting wants to <strong>offer the part up to a known one</strong> and see whether the nut starts, whether the seats match, whether the hex is the same. Mount both halves where you can — a male and its mating female — because half the identification problems in a workshop are about a port rather than a hose end.',
    },
    {
      type: 'comparison_table',
      caption: 'A board for a typical mixed fleet',
      columns: ['Item', 'Why it earns a place'],
      rows: [
        { cells: ['Male and female of each family you run', 'The core of the whole thing'] },
        { cells: ['The two or three bores that actually fail', 'Depth where it is used, not breadth for completeness'], highlight: true },
        { cells: ['One example of each seat: 24°, 30°, 37°, flat face, taper', 'Trains the eye on the distinction that matters most'] },
        { cells: ['A bonded seal, an O-ring and a bite ring', 'The parts people forget are part of the joint'] },
        { cells: ['Pitch gauge and seat gauge, on a chain', 'Tools that are attached do not walk'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never mount a part you are not certain of.',
      body: 'A board is an authority the moment it is on the wall, and a mislabelled sample propagates a wrong answer for years. Where you are unsure of a sample, label it with the measurements only — "M22×1.5, 24° cone" — rather than with a family name you are guessing at.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'How to label it so it stays trustworthy.',
      anchor: 'labelling',
    },
    {
      type: 'paragraph',
      html: 'Three lines per sample. The <strong>thread</strong> as measured. The <strong>seat</strong>. And <strong>where it came from</strong> — "boom cylinder, the yellow loader" — because that last line is what makes the board useful to someone ordering a part rather than only to someone identifying one. Write on the board itself, not on tape that will fall off in the heat.',
    },
    {
      type: 'paragraph',
      html: 'Then photograph it, in good light, straight on, and keep that photograph where whoever raises orders can find it. A supplier receiving that image with an order has your entire fleet convention in one file, and the conversation about what you mean by "the usual" stops happening.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Keeping it current.',
      anchor: 'current',
    },
    {
      type: 'paragraph',
      html: 'Add to it when a new machine arrives, and take something off when the last machine using it leaves the yard. A board that has grown for ten years and been pruned never is a museum: it holds families nobody runs any more, and it teaches new fitters that anything is possible, which is the opposite of what it is for.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The board is also a stock list.',
      body: 'Whatever is mounted on it is, almost by definition, what the workshop should hold. Reading the board back as a purchase list once a year is a good way to find both the items you keep running out of and the ones you have not touched since you bought them.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-fittings',
      label: 'Hydraulic fittings',
      blurb: 'Hose ends and ferrules across the families a mixed fleet meets.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is a printed chart not enough?',
          answer:
            'A chart tells you what a family is; a sample lets you compare the part in your hand against a known good one. Charts are useful alongside a board and a poor substitute for one.',
        },
        {
          question: 'What if we run too many families to mount them all?',
          answer:
            'Then mount the seats and the bores that fail, and treat the rest as order-on-demand. A board of six things people trust beats a board of forty that nobody reads.',
        },
        {
          question: 'Can you supply the samples?',
          answer:
            'Yes — send your fleet list or the photographs from a yard walk and we will quote a set of male and female samples in the families you actually run, along with the gauges.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Want a sample set for the wall?',
      body: 'Tell us which families your fleet runs, or send photographs and we will work it out. We will quote a labelled set of samples and the two gauges, shipped as one consignment.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
