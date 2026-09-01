import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The field article: no gauges, no reference table, a machine down.
 *
 * `photographing-a-hydraulic-fitting` covers the photograph; this covers the
 * measurement, and specifically what can be established with a tape, a caliper
 * and a known fastener when the proper tools are three hundred kilometres away.
 *
 * It does not publish a thread table. Sending a measurement to someone who
 * holds the tables is the recommended path, and pretending a reader can
 * conclusively identify a thread from a tape measure would be false.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'measuring-a-fitting-without-gauges',
  title: 'Measuring a fitting without gauges: what you can establish in the field',
  excerpt:
    'No seat gauge, no pitch gauge, a machine down and a phone with two bars. What a caliper and a known bolt will actually tell you, and what to send.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Measuring a hydraulic fitting without gauges — field method',
  seoDescription:
    'How to identify a hydraulic fitting in the field with a caliper, a tape and a known bolt: what each measurement settles, and what to send a supplier.',
  focusKeyword: 'measuring a fitting without gauges',
  publishedAt: '2026-09-01T13:45:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Four observations identify almost any fitting: diameter across the thread crests, pitch, seat shape, and male or female.',
        'A caliper gives the first. A known bolt or a ruler over ten threads gives a usable estimate of the second.',
        'Metric and inch threads separate cleanly once you have a diameter and an approximate pitch together — neither alone is enough.',
        'Photograph the seat straight down the bore, in daylight, wiped clean. That single picture settles the family more often than any measurement.',
        'Send observations, not conclusions. "22.1 mm across the crests, about 1.5 mm pitch, cone seat" is worth more than "it is metric".',
      ],
    },
    {
      type: 'lead',
      html: 'Measuring a fitting without gauges is a field skill rather than a substitute for owning them. The gauges cost very little and every workshop should own them. This article is for the other situation: the machine is in a field or on a haul road, the toolbox has a tape and a caliper in it, and the answer has to be good enough to order a part today rather than after the next trip to town.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The four observations.',
      anchor: 'four-observations',
    },
    {
      type: 'comparison_table',
      caption: 'What each one narrows down',
      columns: ['Observation', 'How to take it', 'What it settles'],
      rows: [
        {
          cells: [
            'Diameter across the crests',
            'Caliper across the outside of a male thread, or inside a female',
            'The size band — the strongest single clue',
          ],
          highlight: true,
        },
        {
          cells: [
            'Pitch',
            'Measure ten threads with a ruler and divide, or match a known bolt',
            'Metric versus inch, and which size within the band',
          ],
        },
        {
          cells: ['Seat shape', 'Look straight down the bore, cleaned and in daylight', 'The family — cone, flat face, O-ring, taper'],
        },
        {
          cells: ['Male or female, straight or tapered', 'Run a straight edge along the crests', 'Whether the thread seals or only holds'],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The known-bolt trick.',
      body: 'A workshop always has bolts of known size. Run the fitting’s nut onto a bolt you can identify, or hold a bolt’s thread against the fitting’s and look along the crests: threads of the same pitch line up along their whole length, and threads of different pitch visibly drift apart within half a dozen turns. It is not a gauge, but it will separate a 1.5 mm pitch from a 1.25 without one.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What a measurement cannot tell you.',
      anchor: 'limits',
    },
    {
      type: 'paragraph',
      html: 'Two things resist the field method and it is worth knowing which they are. <strong>Seat angles that are close together</strong> — 24° against 30°, or 30° against 37° — are not reliably separable by eye, which is why a photograph down the bore is worth more than a description of it. And a <strong>worn or damaged thread</strong> measures smaller than it was; if the fitting failed by being over-tightened or cross-threaded, measure a second example from the same machine if one exists.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not conclude "it is BSP" from a diameter alone.',
      body: 'Several families overlap closely in diameter and differ in pitch and seat. A conclusion sent to a supplier is acted on; an observation sent to a supplier is checked. Send what you measured and let the person with the tables in front of them do the identifying — it costs you nothing and removes the commonest cause of a wrong part arriving after a long transit.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to send.',
      anchor: 'what-to-send',
    },
    {
      type: 'paragraph',
      html: 'A message that gets a part named on the first reply contains: the four observations above, a photograph of the end square-on, a photograph straight down the bore, a photograph of the whole hose or line in place, and a note of what the machine is and where it sits in the circuit. The last one matters more than people expect — a return line and a pump line of the same size are not the same order.',
    },
    {
      type: 'paragraph',
      html: 'If the failed part is in your hand, photograph it against a ruler or with a coin for scale. If it is a hose you need remade, <strong>send both ends and the length</strong>, measured between the sealing faces rather than end to end.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can you identify a fitting from a photograph alone?',
          answer:
            'Often, and much more reliably with one measurement alongside it. A photograph plus a caliper reading across the crests is close to definitive for most of what circulates.',
        },
        {
          question: 'How do I measure a female thread with a caliper?',
          answer:
            'Across the roots, inside the port, which reads slightly larger than the nominal size — say that is what you did when you send it. Where possible measure the male that came out of it instead.',
        },
        {
          question: 'What should I buy so this never happens again?',
          answer:
            'A thread pitch gauge and a seat angle gauge. Together they cost less than one wasted day and they turn every future identification into a five-second check.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Machine down and no gauges on site?',
      body: 'Send the photographs and whatever you could measure. We will name the part from that, tell you what we inferred and how confident it is, and quote it — rather than asking you to be sure before we will help.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
