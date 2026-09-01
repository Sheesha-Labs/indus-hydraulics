import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Prevention side of `removing-a-seized-hydraulic-fitting`, which covers
 * extraction. This one is about what happens before that, and what to change at
 * fitting time so it does not.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'why-fittings-seize-in-coastal-air',
  title: 'Why fittings seize in coastal air, and what to change at fitting time',
  excerpt:
    'A seized joint is decided months earlier, at the moment somebody made it up. What that person could have done differently, and what they could not.',
  categorySlug: 'failure-analysis',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-09-01T16:28:00.000Z',
  bodyBlocks: [
    {
      type: 'lead',
      html: 'Fittings seize because corrosion gets between two threads and grows there, and in salt-laden air it starts within weeks rather than years. By the time the joint has to come apart the decision that mattered — what went on the thread and what protected the outside of it — was taken by somebody who has probably left the site.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Seizure is an assembly-time decision that surfaces months later, at the worst moment.',
        'Corrosion starts where the coating is thinnest: thread crests, hex corners, and anywhere a spanner slipped.',
        'A joint that has been made up and broken twice corrodes faster than one that never moved.',
        'Anti-seize belongs on the thread and never on the sealing face — the two are different surfaces doing different jobs.',
        'On coastal sites, plating grade and joint count matter more than any other specification decision.',
      ],
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What is actually happening in the thread.',
      anchor: 'in-the-thread',
    },
    {
      type: 'paragraph',
      html: 'Two steel surfaces are in contact with a moist, salt-carrying atmosphere finding its way between them by capillary action. Corrosion product occupies more volume than the metal it came from, so the gap closes and the two parts become mechanically locked. <strong>Nothing about the seal is involved</strong> — a perfectly sealing joint seizes exactly as readily as a weeping one, which is why the problem is invisible until somebody needs the joint apart.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Dissimilar metals accelerate it.',
      body: 'A stainless fitting in a plated steel port puts two different metals in contact with an electrolyte between them. On a coastal site expect the joint to be the casualty rather than either part, and inspect it as a joint rather than as two components.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What can be decided at fitting time.',
      anchor: 'at-fitting-time',
    },
    {
      type: 'comparison_table',
      caption: 'Choices made at assembly, paid for at removal',
      columns: ['Decision', 'Effect on seizure'],
      rows: [
        { cells: ['Plating grade on the fitting', 'The largest single lever on exposed joints'], highlight: true },
        { cells: ['Anti-seize on the thread only', 'Slows the mechanism directly; must not reach the seat'] },
        { cells: ['Joint count in the line', 'Every joint is another candidate; a stack of adapters is three'] },
        { cells: ['Protecting the hex after assembly', 'Cheap, and it is where the spanner will need to grip'] },
        { cells: ['Recording the fitted date', 'Turns an unknown into a planned change at the next shutdown'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Anti-seize on a sealing face causes the leak it was meant to prevent.',
      body: 'On a cone, a flat face or an O-ring, the seal is metal-to-metal or elastomer-to-metal and a film of compound in between prevents it seating. Thread only, and wiped rather than smeared. This is the commonest way a well-intentioned habit produces a weep.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'When it has already seized.',
      anchor: 'already-seized',
    },
    {
      type: 'paragraph',
      html: 'Extraction is its own subject and we have written it separately. What belongs here is the decision that follows: a joint that had to be forced apart has almost certainly damaged something, and the <strong>correct assumption is that both the fitting and the seal are scrap</strong> until inspection says otherwise. Re-using a fitting that came out under protest is how a seizure becomes a leak on the same machine a week later.',
    },
    {
      type: 'paragraph',
      html: 'The second decision is whether the rest of that machine is in the same state. Seizure is a site-wide condition rather than a component fault, so one seized joint is a prompt to check the others while the machine is already stopped.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Does stainless solve seizure?',
          answer:
            'It solves corrosion of the fitting and introduces galling, which is a different way for threads to lock. It also brings a galvanic couple if the port is plated steel. On coastal sites it is a per-position decision, not a default.',
        },
        {
          question: 'Is anti-seize compatible with hydraulic fluid?',
          answer:
            'Use a compound rated for the service and keep it out of the system — thread only, wiped thin. Anything that can migrate past the seal into the fluid is a contamination decision as well as a corrosion one.',
        },
        {
          question: 'How often should exposed joints be inspected in salt air?',
          answer:
            'More often than inland, and what you are looking for is plating loss at the crests and hex corners rather than a leak. That is the point at which a future intervention starts getting expensive.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Coastal site, joints that will not come apart?',
      body: 'Tell us the positions and the exposure. We will quote the finish alongside the part, say where stainless helps and where it makes the joint worse, and flag which positions are worth changing at the next stop.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
