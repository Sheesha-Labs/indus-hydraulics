import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The fittings twin of `what-to-send-for-a-hose-quote`, and deliberately not a
 * copy of it: a hose is quoted from a specification the buyer supplies, a
 * fitting is quoted from an identification the supplier has to make.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'what-to-send-for-a-fittings-quote',
  title: 'What to send for a fittings quote',
  excerpt:
    'Six things turn an enquiry into a named part on the first reply. Sending five of them is the difference between a quote today and three days of questions.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'What to send for a fittings quote — the six details',
  seoDescription:
    'The measurements, photographs and context a supplier needs to name a hydraulic fitting on the first reply, and the two details buyers most often leave out.',
  focusKeyword: 'what to send for a fittings quote',
  publishedAt: '2026-09-01T14:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Send observations, not conclusions. A measurement can be checked; "it is BSP" can only be believed.',
        'Diameter across the thread crests plus the pitch identifies most fittings on their own.',
        'A photograph straight down the bore settles the seat, which no description reliably does.',
        'Say where in the circuit it sits — a pump line and a return line of the same size are not the same order.',
        'Say how many machines carry the same fitting. It changes the quantity, and quantity is what stops the next breakdown.',
      ],
    },
    {
      type: 'lead',
      html: 'A hose is quoted from a specification the buyer supplies. A fitting is quoted from an identification the supplier has to make, which is why an enquiry that names a part badly is slower than one that describes it well. The six things below are what let us answer with a part number rather than with questions.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The six.',
      anchor: 'the-six',
    },
    {
      type: 'comparison_table',
      caption: 'What each one does',
      columns: ['Send', 'Why it matters'],
      rows: [
        { cells: ['Diameter across the thread crests', 'The size band — the single strongest clue'], highlight: true },
        { cells: ['Thread pitch, measured or estimated', 'Separates metric from inch and narrows to one size'] },
        { cells: ['A photograph square-on and one down the bore', 'Settles the seat and the end form'] },
        { cells: ['Male or female, straight or tapered', 'Decides whether the thread seals or only holds'] },
        { cells: ['Where it sits in the circuit', 'Pressure rating, and whether a swivel is needed'] },
        { cells: ['How many you need, across how many machines', 'Turns a single part into a set that prevents the next stoppage'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A rough measurement beats no measurement.',
      body: 'People delay sending an enquiry because they do not have a pitch gauge. Send what you have and say how you took it — "about 22 mm across the crests with a caliper, pitch measured over ten threads with a ruler" is entirely workable, and it is far better than waiting until someone drives to town.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The two people leave out.',
      anchor: 'left-out',
    },
    {
      type: 'paragraph',
      html: 'The first is <strong>position in the circuit</strong>. The same thread appears on a return line at low pressure and on a pump line at high pressure, and the fitting that suits one is not automatically right for the other. Telling us it came off a boom cylinder rather than a case drain changes what we quote and occasionally changes our answer to "not that part".',
    },
    {
      type: 'paragraph',
      html: 'The second is <strong>how many machines carry it</strong>. Almost every fittings enquiry we receive is for one part, and almost every fleet has three machines that will need the same one within the year. Saying so costs nothing and lets us quote a quantity that makes the freight worth paying once.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'When you have a part number.',
      anchor: 'part-numbers',
    },
    {
      type: 'paragraph',
      html: 'Send it, and send the measurements as well. A part number is a useful cross-check and a poor sole input: numbering schemes are manufacturer-specific, they get transcribed wrongly off oily labels, and a number that was correct for a machine built one year is not always correct for the same model built another. <strong>Where the number and the measurements disagree, we will tell you which one we followed and why.</strong>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A photograph of a part in a catalogue is not an identification.',
      body: 'Pictures of adapters look alike across families and sizes. Where a screenshot is all you have, say so — we will treat it as a starting point rather than as a specification, and ask for the two measurements that convert it into one.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can you quote from a photograph alone?',
          answer:
            'Often, and more reliably with one caliper reading beside it. Where a photograph leaves genuine ambiguity we will say what the possibilities are and what single measurement would settle it, rather than guessing and shipping.',
        },
        {
          question: 'What if the fitting is damaged?',
          answer:
            'Measure a second example from the same machine if one exists, and tell us it was damaged. An over-tightened or cross-threaded fitting measures smaller than it was, and a measurement taken from it will send us to the wrong size.',
        },
        {
          question: 'Do you need the machine make and model?',
          answer:
            'It is useful context and it is not an identification — the same model can carry different conventions by year and by build market, and a used machine carries its repair history. We quote from the fitting.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Have an end you cannot name?',
      body: 'Send the photographs and whatever you could measure, with a note of where it sits in the circuit. We will name it, say how confident we are, and quote the quantity your fleet actually needs.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
