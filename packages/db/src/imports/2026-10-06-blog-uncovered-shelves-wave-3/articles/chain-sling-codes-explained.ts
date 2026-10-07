import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Chain sling make-up codes and multi-leg ratings, read from the 54 chain
 * sling families and their variant rows (G80 4–50 mm, G100 6–26 mm, single
 * WLL and two angle bands for multi-leg slings). The codes are the ones the
 * listings use. Angle bands are given as leg angle from vertical, which is
 * how the variant columns' included angles translate.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'chain-sling-codes-explained',
  title: 'Chain sling codes explained: SOS, DOS, TOS, QOS and the hook letters',
  excerpt:
    'A chain sling code such as DOSL or QOG describes the whole assembly: how many legs, what is at the top and what is on the end. How to read the codes, which hook does what, and why a four-leg sling is rated the same as a three-leg one.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T03:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do you read a chain sling code like DOS or QOSL?',
      answer:
        'Read it left to right: the first letter is the number of legs (S single, D two, T three, Q four), the next is the top fitting (O for an oblong master link), and the last letters are the fitting on each leg end (S sling hook, SL self-locking hook, G grab hook, F foundry hook, O oblong link). DOS is a two-leg sling with a master link and sling hooks; QOSL a four-leg sling with self-locking hooks. Grade 80 or Grade 100 comes in front of the code.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Code = legs + top fitting + end fitting. DOS: two legs, oblong master link, sling hooks.',
        'Hook letters: S sling hook, SL self-locking hook, G grab hook, F foundry hook; O at the end means an oblong link.',
        'Single legs without a master link name both ends: SSS has a sling hook at each end, SGG a grab hook at each.',
        'On our listings a 10 mm Grade 80 single leg is 3.15 t; a two-leg sling 4.25 t up to 45° from vertical; a three- or four-leg sling 6.7 t.',
        'Three- and four-leg slings carry the same rating, because four legs cannot be relied on to share the load. WLL is not breaking load.',
      ],
    },
    {
      type: 'lead',
      html: 'A chain sling is ordered from a code of three or four letters, and that code is the whole specification bar the chain size and grade. Read it correctly and you know <strong>how many legs, what hangs on the crane hook and what grips the load</strong>. Read it carelessly and a sling arrives with grab hooks where self-locking hooks were wanted, or with two legs where the lift needed four.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Reading the code.',
      anchor: 'code',
    },
    {
      type: 'comparison_table',
      caption: 'Chain sling code letters on our listings',
      columns: ['Position', 'Letter', 'Meaning'],
      rows: [
        { cells: ['First — legs', 'S / D / T / Q', 'Single, two, three or four legs'], highlight: true },
        { cells: ['Second — top', 'O', 'Oblong master link'] },
        { cells: ['End — fitting', 'S', 'Sling hook, with latch'] },
        { cells: ['End — fitting', 'SL', 'Self-locking hook'] },
        { cells: ['End — fitting', 'G', 'Grab hook'] },
        { cells: ['End — fitting', 'F', 'Foundry hook'] },
        { cells: ['End — fitting', 'O', 'Oblong link'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Multi-leg slings always start from a master link, so their codes read legs-O-fitting: DOG is a two-leg sling with grab hooks, TOF a three-leg sling with foundry hooks, QOO a four-leg sling with oblong links on the ends. Single legs can have a master link (SOS, SOG, SOF, SOSL, SOO) or a fitting at each end with no master link, and then both ends are named: SSS (sling hooks), SGG (grab hooks), SFF (foundry hooks), SSLSL (self-locking hooks), SSG, SFG and SSLG (one of each). Our listings carry all 27 make-ups in Grade 80, from 4 mm to 50 mm, and in Grade 100, from 6 mm to 26 mm.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Which hook does what.',
      anchor: 'hooks',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Sling hook (S)</strong> — the general-purpose lifting hook, with a spring latch across the throat to stop slack slings jumping out.</li><li><strong>Self-locking hook (SL)</strong> — closes and locks when loaded and cannot open until it is unloaded and released, for lifts where a latch is not enough.</li><li><strong>Grab hook (G)</strong> — a narrow throat that grips a chain link, used to shorten a leg or choke it back on itself. Check the hook\'s own rating: some grab hooks reduce the chain\'s working load limit unless they are a type designed to carry it in full.</li><li><strong>Foundry hook (F)</strong> — a wide, open throat without a latch, for loads with large lifting eyes such as ladles and moulds.</li><li><strong>Oblong link (O)</strong> — a link on the leg end, for fitting the sling to shackles or pad-eyes, or choking it.</li></ul><p>Hooks are covered more fully in <a href="/blog/lifting-hook-types">lifting hook types</a>, and master links in <a href="/blog/master-links-explained">master links explained</a>.</p>',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'How multi-leg slings are rated.',
      anchor: 'ratings',
    },
    {
      type: 'comparison_table',
      caption: '10 mm Grade 80 chain slings, WLL as listed',
      columns: ['Sling', 'Legs up to 45° from vertical', 'Legs 45° to 60°'],
      rows: [
        { cells: ['Single leg (SOS)', '3.15 t', '—'] },
        { cells: ['Two-leg (DOS)', '4.25 t', '3.15 t'], highlight: true },
        { cells: ['Three-leg (TOS)', '6.7 t', '4.75 t'] },
        { cells: ['Four-leg (QOS)', '6.7 t', '4.75 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our slings are rated on the EN 818-4 method. A two-leg sling is rated 1.4 times a single leg with its legs up to 45° from the vertical, and 1.0 times from 45° to 60°; three- and four-leg slings are rated 2.1 times and 1.5 times. The four-leg sling gets no more than the three-leg one because, on a rigid load, there is no guarantee all four legs take an equal share — two can end up carrying most of it. Grade 100 runs a quarter higher size for size: the 10 mm Grade 100 single leg is listed at 4 t and the four-leg at 8 t. Angles and their effect on leg tension are set out in the <a href="/blog/sling-angle-chart">sling angle chart</a>.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never exceed 60° from vertical, and never exceed the WLL.',
      body: 'No chain sling on our listings is rated beyond 60° from the vertical. The working load limit is the most the sling may lift in the stated configuration; it is not the breaking load, and it falls if the sling is shortened with a hook not rated for it, used in a choke, or used hot. Inspect before every lift and withdraw any sling with stretched links, a damaged hook or a missing latch.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Ordering a chain sling.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Give the grade, the code, the chain size and the effective reach — the length from the bearing point of the master link to the bearing point of the hook. If you know the load and the lifting points rather than the sling, send the load mass, the number and position of lifting points and the headroom, and we will work out the code and size. Our slings ship with the manufacturer\'s test certificate and serial-numbered identification. They are made only from Grade 80 and Grade 100 alloy chain — Grade 30, 43 and 70 chain is for lashing and transport, never for overhead lifting. Chain grades themselves are compared in <a href="/blog/chain-grades-explained">chain grades explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does SOS mean on a chain sling?',
          answer:
            'Single leg, oblong master link, sling hook. On our listings a 10 mm Grade 80 SOS is rated 3.15 t.',
        },
        {
          question: 'Why is a four-leg sling rated the same as a three-leg sling?',
          answer:
            'Because on a rigid load the four legs cannot be relied on to share the load equally. EN 818-4 rates both at 2.1 times a single leg up to 45° from vertical.',
        },
        {
          question: 'What is the difference between a sling hook and a self-locking hook?',
          answer:
            'A sling hook has a spring latch. A self-locking hook locks closed under load and cannot open until it is unloaded and released.',
        },
        {
          question: 'How much stronger is Grade 100 than Grade 80?',
          answer:
            'About 25% size for size on our listings: a 10 mm single leg is 3.15 t in Grade 80 and 4 t in Grade 100.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Chain slings',
      skus: [
        'IH-LR-CS-G80SOS',
        'IH-LR-CS-G80DOS',
        'IH-LR-CS-G80TOS',
        'IH-LR-CS-G80QOS',
        'IH-LR-CS-G100DOSL',
        'IH-LR-CS-G100QOSL',
        'IH-LR-CS-G80DOG',
        'IH-LR-CS-G80SSS',
      ],
    },
    {
      type: 'category_link',
      slug: 'chain-slings',
      label: 'Chain slings',
      blurb: '27 make-ups in Grade 80 and Grade 100, with WLL tables.',
    },
    {
      type: 'category_link',
      slug: 'grade-100-chain-fittings',
      label: 'Grade 100 chain fittings',
      blurb: 'Hooks, master links and connectors for Grade 100 assemblies.',
    },

    {
      type: 'cta_block',
      heading: 'Need a chain sling made up?',
      body: 'Send the grade, code, chain size and reach — or the load and lifting points. We will quote the sling with its certificate.',
      quoteLabel: 'Quote chain slings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Make-up codes, size ranges and WLLs by leg count and angle checked against our chain sling listings.',
    },
  ],
}

export default ARTICLE
