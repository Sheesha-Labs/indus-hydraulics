import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Receiving inspection, applicable to any fitting from any source.
 *
 * Deliberately NOT an argument that unbranded parts are unsafe as a class —
 * `unbranded-hydraulic-fittings` already holds that position and this stays
 * consistent with it. What this adds is the check, which is the same check
 * whoever supplied the box.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'inspecting-fittings-on-arrival',
  title: 'Inspecting fittings on arrival: the five-minute check',
  excerpt:
    'A box of adapters is easy to sign for and hard to argue about later. Five checks on the loading bay, and the two faults that only show up under pressure.',
  categorySlug: 'buying-hydraulic-fittings',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Inspecting hydraulic fittings on arrival — a five-minute check',
  seoDescription:
    'What to check when a consignment of hydraulic fittings arrives: thread quality, seat finish, markings, plating and count, and which faults only appear under pressure.',
  focusKeyword: 'inspecting fittings on arrival',
  publishedAt: '2026-09-01T14:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Check on the bay, before anything is put away. A discrepancy raised at receipt is a conversation; the same one raised in six weeks is a dispute.',
        'Run a nut down every thread you can. Rough or tight threads are the commonest visible defect.',
        'Look at the seat under light. Machining marks across the seal face matter far more than cosmetic finish elsewhere.',
        'Count against the packing list, and check the sizes rather than trusting the labels on the bags.',
        'Two faults — wrong material and wrong rating — are invisible on the bay. They are settled by documentation, not by inspection.',
      ],
    },
    {
      type: 'lead',
      html: 'Fittings arrive in bags, in quantity, and usually when someone is busy. They get signed for and shelved, and any problem in them surfaces weeks later at the worst moment, by which point the consignment is untraceable and the argument is unwinnable. Five minutes on the bay prevents nearly all of that.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The five checks.',
      anchor: 'five-checks',
    },
    {
      type: 'comparison_table',
      caption: 'What to do, and what each catches',
      columns: ['Check', 'Catches'],
      rows: [
        { cells: ['Run a known nut down each male thread', 'Rough, burred or out-of-tolerance threads'], highlight: true },
        { cells: ['Look into the seat under a light', 'Machining marks or damage across the sealing face'] },
        { cells: ['Compare against a known-good sample', 'Wrong size or family in a correctly-labelled bag'] },
        { cells: ['Count, and measure a sample from each bag', 'Short delivery and mixed bags'] },
        { cells: ['Photograph the consignment as received', 'Everything you will need if there is a dispute'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The known-good sample is why the reference board pays for itself twice.',
      body: 'A board of mounted samples is an identification aid and a receiving-inspection tool. Offering an arriving part up to a known one takes seconds and catches the mislabelled bag that no amount of reading the label will.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What inspection cannot see.',
      anchor: 'invisible',
    },
    {
      type: 'paragraph',
      html: 'Two properties decide whether a fitting is safe in the line you are about to put it in, and neither is visible: <strong>the material</strong> and <strong>the pressure rating</strong>. A part can be dimensionally perfect, beautifully finished, and wrong for a 350-bar line. Those are settled at the order, in what you specified and what the supplier confirmed — which is the practical argument for buying fittings against a stated rating rather than against a picture and a price.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Plating quality is a life question, not a cosmetic one.',
      body: 'On a coastal or humid site the plating decides how long the fitting survives on the outside of a machine before corrosion starts working on the thread. Patchy or thin plating is visible on the bay and is worth raising there — it will not stop the part sealing today and it will shorten its life by a lot.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Storing what you accepted.',
      anchor: 'storing',
    },
    {
      type: 'paragraph',
      html: 'Fittings survive storage well and seals do not. Keep elastomers out of sunlight and heat, keep bags closed so grit does not find the seats, and cap or bag anything with an exposed sealing face. A drawer of loose adapters rolling against each other produces exactly the seat damage the arrival check was looking for — inflicted after the check, by you.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Should I pressure-test fittings on arrival?',
          answer:
            'No — a fitting is tested as part of the assembly it goes into, which is what the assembly proof test is for. Arrival inspection is about geometry, finish, count and documentation.',
        },
        {
          question: 'What do I do if one bag is wrong?',
          answer:
            'Photograph it as received, alongside the packing list, and raise it the same day. Any supplier worth keeping treats a same-day discrepancy as a correction; nobody can do much with an unlabelled bag found in a drawer months later.',
        },
        {
          question: 'Is a rough thread always a reject?',
          answer:
            'A thread that will not accept a known-good nut smoothly is. Minor tooling marks away from the sealing face are cosmetic. The seat and the thread are where the judgement should be strict.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Want the rating stated on the quotation?',
      body: 'Ask for it — material and working pressure, per line. We would rather answer that at quotation than have you inspecting for something that cannot be seen.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
