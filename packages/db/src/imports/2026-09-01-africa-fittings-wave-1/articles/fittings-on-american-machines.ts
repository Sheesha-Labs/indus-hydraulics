import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The inch world, for workshops whose drawer is metric and BSP.
 *
 * Existing articles cover JIC vs ORFS vs NPT vs BSP and where JIC is the wrong
 * choice; this one is about meeting the inch families on a machine when your
 * fleet is otherwise metric — what arrives together, what to carry, and the
 * NPT-in-a-parallel-port mistake that damages the port rather than the fitting.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'fittings-on-american-machines',
  title: 'Fittings on American machines: the inch families, and what travels with them',
  excerpt:
    'JIC, ORFS, NPT, O-ring boss and split flanges arrive as a set. What each is for, which two are routinely confused, and the mistake that ruins a port rather than a fitting.',
  categorySlug: 'fitting-identification',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Fittings on American machines — JIC, ORFS, NPT and O-ring boss',
  seoDescription:
    'The inch thread families on American-built machines, how to tell JIC from ORFS and NPT from a parallel port, and what a metric workshop should add to cover them.',
  focusKeyword: 'fittings on american machines',
  publishedAt: '2026-09-01T12:45:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Expect four threaded families plus flanges: JIC 37° flare, ORFS, NPT taper, and SAE O-ring boss at ports.',
        'JIC seals on a 37° cone; ORFS seals on a flat face with an O-ring in it. They are not interchangeable and the difference is visible.',
        'NPT is a taper thread that seals on the thread itself. Putting one into a straight port damages the port.',
        'An O-ring boss port is straight-threaded and seals on an O-ring under the shoulder — it is not an NPT port even though both take a male stud.',
        'A metric workshop covering these machines needs a second drawer, not a substitution.',
      ],
    },
    {
      type: 'lead',
      html: 'American-built machines — and machines built anywhere for the North American market — bring the inch families with them, and they arrive as a group rather than one at a time. A workshop whose fleet has been metric and BSP until now meets four new things in one afternoon, two of which look enough alike to be swapped.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The four, and what each seals on.',
      anchor: 'the-four',
    },
    {
      type: 'comparison_table',
      caption: 'What actually makes the seal',
      columns: ['Family', 'Where it seals', 'Thread'],
      rows: [
        { cells: ['JIC 37° flare', 'A 37° cone, metal to metal', 'Straight, inch'] },
        { cells: ['ORFS', 'A flat face, on an O-ring set into it', 'Straight, inch'], highlight: true },
        { cells: ['NPT', 'On the thread itself, as it wedges', 'Tapered, inch'] },
        { cells: ['SAE O-ring boss', 'An O-ring under the shoulder, against the port face', 'Straight, inch'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The two straight-threaded ones are the pair worth learning by sight. <strong>A JIC male is a plain cone; an ORFS male is a flat face with a groove and an O-ring in it.</strong> Once you have looked at both, you will not confuse them again — but until you have, the hex sizes and the general shape are similar enough to invite it.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The mistake that costs a port.',
      anchor: 'the-mistake',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'An NPT male will start into a straight port. It should not be there.',
      body: 'A tapered thread wedges as it tightens. In a straight port it will engage, feel tight, and be steadily deforming the port’s first threads while it does so — so the fault shows up later as a port that no longer seals with the correct fitting either. This is the one identification error on these machines that turns a cheap part into a machining job.',
    },
    {
      type: 'paragraph',
      html: 'The reverse case is quieter and just as common: a straight male in a tapered port, which never seals properly and gets tightened harder in the hope that it will. <strong>Taper and straight is the first thing to establish, before size and before family</strong> — run a straight edge along the thread, or start a nut on it and see whether it runs freely down the length.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What a metric workshop should add.',
      anchor: 'what-to-add',
    },
    {
      type: 'paragraph',
      html: 'Adding a second family properly beats adapting between families badly. For a workshop taking on one or two American machines, the useful additions are JIC ends in the bores those machines actually use, ORFS if the machine has it, a small set of O-ring boss plugs and studs, and the bridging adapters between JIC and whatever your existing fleet is. Do not try to cover the inch world with adapters stacked on metric parts — that is three leak paths where there should be one.',
    },
    {
      type: 'category_link',
      slug: 'jic-adapters',
      label: 'JIC adapters',
      blurb: '37° flare adapters, unions and bridging parts.',
    },
    {
      type: 'category_link',
      slug: 'orfs-adapters',
      label: 'ORFS adapters',
      blurb: 'Flat-face O-ring adapters and O-ring kits.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Carry the O-rings, not just the fittings.',
      body: 'ORFS and O-ring boss both depend on a small rubber part that is easy to lose, easy to nick on installation, and impossible to improvise. A box of the right sizes turns a stopped machine into a five-minute job, and it is the cheapest thing in this article.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can a JIC fitting go into an ORFS port?',
          answer:
            'No. One seals on a cone and the other on a flat face with an O-ring, so even where a thread engages there is no sealing geometry. Use the correct family, or a proper adapter between them.',
        },
        {
          question: 'Is PTFE tape correct on these fittings?',
          answer:
            'On NPT, where the thread itself seals, a thread sealant is normal — applied so that it cannot enter the system. On JIC, ORFS and O-ring boss it is wrong: the seal is made at the cone, the face or the O-ring, and tape on the thread only masks a joint that is not seating.',
        },
        {
          question: 'How do I tell a tapered thread from a straight one quickly?',
          answer:
            'Start a matching nut or look along the crests against a straight edge. A taper narrows visibly over the length of the thread; a straight thread does not. It takes seconds and it prevents the expensive mistake.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Adding an imported machine to a metric fleet?',
      body: 'Send photographs of the ports and hose ends. We will tell you which families the machine actually carries, what to add to the drawer, and which bridging adapters are worth having — as one quotation rather than five parcels.',
      quoteLabel: 'Identify a fitting',
    },
  ],
}

export default ARTICLE
