import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The 30° seat problem, which is the single most useful thing in this wave.
 *
 * Two families in wide use on Japanese machines share a 30° seat and differ in
 * the thread underneath it — one carries a BSP parallel thread, the other a
 * metric one. A fitter checking the seat angle alone concludes they match, and
 * they do not. That confusion is the article rather than a footnote in it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fittings-on-a-used-japanese-machine',
  title: 'Fittings on a used Japanese machine: the 30° seat problem',
  excerpt:
    'Two common families share a 30° seat and use different threads underneath it. Checking the angle alone tells you they match, and they do not — here is how to separate them.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Fittings on a used Japanese machine — the 30° seat problem',
  seoDescription:
    'JIS 30° flare and metric 30° flare look identical at the seat and differ at the thread. How to tell them apart on a used Japanese excavator, and what to stock.',
  focusKeyword: 'fittings on a used japanese machine',
  publishedAt: '2026-09-01T12:15:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Why do two fittings with the same 30° seat not fit each other?',
      answer:
        'Because the seat and the thread are separate decisions. Japanese practice includes a 30° flare seat carried on a BSP parallel thread and a 30° flare seat carried on a metric thread. Measure only the seat and both look like the same family; measure the thread and they are not interchangeable. Always identify a fitting by seat angle *and* thread — one without the other is half an answer.',
    },
    {
      type: 'lead',
      html: 'Used Japanese excavators and loaders are the backbone of a great many fleets we supply, and they carry the most quietly confusing connection convention in common circulation. Nothing about it is exotic. It simply punishes the very reasonable habit of identifying a fitting by looking at the seat.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Seat and thread are two separate questions.',
      anchor: 'two-questions',
    },
    {
      type: 'paragraph',
      html: 'Every threaded hydraulic connection answers two questions independently: <strong>what holds it together</strong> — the thread — and <strong>what seals it</strong> — the seat, the O-ring, or the bonded washer. Most families pair one thread with one seat consistently enough that people stop thinking of them as separate. On Japanese machines that shortcut fails, because the same 30° seat appears above two different threads.',
    },
    {
      type: 'comparison_table',
      caption: 'Same seat, different thread',
      columns: ['Property', '30° flare on a BSP parallel thread', '30° flare on a metric thread'],
      rows: [
        { cells: ['Seat angle', '30° — identical to the eye and to a seat gauge', '30°'], highlight: true },
        { cells: ['Thread form', '55° Whitworth, threads per inch', '60° metric, millimetre pitch'] },
        { cells: ['What separates them', 'A pitch gauge, in one second', 'A pitch gauge, in one second'] },
        { cells: ['Failure if swapped', 'Cross-threads, or engages and never seals', 'Same'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A pitch gauge is the cheapest tool in this trade and settles the whole question.',
      body: 'It costs less than one wasted trip to a machine, weighs nothing, and turns the commonest identification failure in a mixed fleet into a five-second check. If a workshop buys one thing after reading this, buy that.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What else is on the machine.',
      anchor: 'what-else',
    },
    {
      type: 'paragraph',
      html: 'Alongside the 30° flare families you will meet <strong>BSP parallel with a bonded seal</strong> at ports, <strong>metric 24° cone</strong> on tube work, and <strong>four-bolt flanges</strong> at the pump and the travel motors. On machines that have been through a rebuild in a market where inch fittings are the norm, expect to find JIC and NPT that the factory never fitted — a used machine carries the history of its repairs as much as its build.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The give-away for a repaired line.',
      body: 'A hose whose two ends belong to different families, or a short adapter stack at one end, almost always means somebody bridged what they had to what was there. It works, but it is a place to look first when a machine has a leak nobody can explain — every extra joint is another place to seal.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to stock for a used-import fleet.',
      anchor: 'what-to-stock',
    },
    {
      type: 'paragraph',
      html: 'Depth beats breadth. For a workshop running used Japanese machines the useful drawer is: 30° flare ends in both thread conventions across the two or three bores you actually meet, BSP parallel with bonded seals, a small set of bridging adapters, and the flange halves for your pump sizes. Add a seat gauge and a pitch gauge to the toolbox and the identification problem mostly disappears.',
    },
    {
      type: 'category_link',
      slug: 'japanese-hose-fittings',
      label: 'Japanese hose fittings',
      blurb: '30° flare hose ends for JIS and metric conventions.',
    },
    {
      type: 'category_link',
      slug: 'bsp-hydraulic-adapters-uae',
      label: 'BSP adapters',
      blurb: 'Parallel and taper, with bonded seals.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is a JIS 30° fitting the same as a metric 30° fitting?',
          answer:
            'No. The seat is the same and the thread is not, so they will not interchange. Identify by seat angle and thread together; either one alone is ambiguous on these machines.',
        },
        {
          question: 'Can I adapt between the two conventions?',
          answer:
            'Yes, with the correct adapter, and it is a normal thing to do on a machine that has already been repaired once. Use one adapter, not a stack of three — every joint is a leak path and a stack also moves the hose end further from where it was designed to sit.',
        },
        {
          question: 'The machine came without any documentation. Where do I start?',
          answer:
            'At the fitting rather than the machine. Photograph the end, measure across the thread crests, take the pitch, and check the seat. Those four things identify almost any fitting in circulation, and they are the same four we ask for when we quote.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Running used imports with no dealer support?',
      body: 'Send photographs and measurements of the ends you replace most. We will name them, say which bridging adapters your fleet actually needs, and quote the set as one consignment rather than piece by piece.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
