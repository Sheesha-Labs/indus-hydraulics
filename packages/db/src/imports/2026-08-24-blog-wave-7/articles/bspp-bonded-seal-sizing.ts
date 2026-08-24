import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'bspp-bonded-seal-sizing',
  title: 'BSPP bonded seals and dowty washers: getting the size right',
  excerpt:
    'A bonded seal is sized by the thread it sits under, not by the bore of the fitting or the size printed on the box. That one sentence resolves most of the confusion.',
  categorySlug: 'fitting-identification',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'BSPP bonded seal sizes — how to pick the right dowty washer',
  seoDescription:
    'How bonded seals and dowty washers are sized for BSPP ports, why the nominal size does not match the thread diameter, and what happens when the inside diameter is too large.',
  focusKeyword: 'bspp bonded seal size',
  publishedAt: '2026-08-24T18:35:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A bonded seal is specified by the thread it fits — a 1/2 BSP seal, not a 20 mm seal.',
        'The nominal size is the thread designation. The actual inside diameter is larger than that number, because BSP sizes are historical pipe bore, not thread diameter.',
        'The seal must be a close fit on the thread major diameter. Too large and the rubber has nothing to squeeze against.',
        'The port face has to be flat and machined. A bonded seal against a rough or curved surface will always weep.',
        'Bonded seals are single use in practice. The rubber takes a set, and a re-used one is the most common cause of a joint that leaks on the second assembly.',
      ],
    },
    {
      type: 'lead',
      html: 'Bonded seals are a small, cheap, almost invisible part that decides whether a BSPP joint holds. They also carry a naming convention that is genuinely confusing the first time you meet it, because the number on the packet is a thread designation inherited from Victorian pipe sizing and has no direct relationship to any dimension you can measure with a caliper.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Why the number does not match the measurement.',
      anchor: 'the-number',
    },
    {
      type: 'paragraph',
      html: 'BSP sizes were originally the <strong>bore of a wrought iron pipe</strong>, not the outside diameter of the thread cut on it. A one-quarter BSP thread measures around thirteen millimetres across the major diameter — nowhere near a quarter of an inch. Every dimension you meet in this family carries that history, and a bonded seal is specified against the thread designation rather than against anything you can measure directly.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Order by thread, not by measurement.',
      body: 'If you have measured the thread major diameter, say so and give the number. What you must not do is order a "14 mm bonded seal" because you measured 14 mm — the seal will be listed against a BSP designation, and the mapping between the two is a table, not a calculation.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What makes it seal.',
      anchor: 'what-makes-it-seal',
    },
    {
      type: 'paragraph',
      html: 'A bonded seal is a steel washer with a rubber ring bonded to its inner edge. As the fitting is tightened, the metal washer takes the clamp load and stops at a fixed thickness, and <strong>the rubber is compressed by a controlled amount against the port face.</strong> The metal is the reason a bonded seal does not extrude and does not need careful torque management.',
    },
    {
      type: 'comparison_table',
      caption: 'The three surfaces that have to be right',
      columns: ['Surface', 'Requirement', 'If it is wrong'],
      rows: [
        {
          cells: [
            'Thread major diameter',
            'Seal is a close sliding fit on it',
            'Rubber has no inner surface to seal against',
          ],
          highlight: true,
        },
        {
          cells: ['Port face', 'Flat, machined, undamaged', 'Weeps regardless of torque'],
          highlight: true,
        },
        {
          cells: [
            'Fitting head underside',
            'Flat and square to the thread',
            'Loads the seal unevenly',
          ],
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'An oversize seal is worse than no seal.',
      body: 'A seal whose inside diameter clears the thread with a visible gap looks fitted and is not. The rubber is compressed axially between two flat faces but has nothing to close against on the inside, so it leaks straight down the thread. This is the single most common bonded seal fault and it is invisible once the fitting is tightened.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Materials, and when the standard one is wrong.',
      anchor: 'materials',
    },
    {
      type: 'comparison_table',
      caption: 'Choosing the elastomer',
      columns: ['Material', 'Use it for', 'Avoid with'],
      rows: [
        {
          cells: [
            'Nitrile (NBR)',
            'Mineral oil hydraulics — the default',
            'Phosphate ester fluids, high heat',
          ],
          highlight: true,
        },
        {
          cells: [
            'Fluoroelastomer (FKM)',
            'High temperature, aggressive fluids',
            'Some water-glycol and steam applications',
          ],
        },
        {
          cells: ['EPDM', 'Water-glycol, some brake fluids', 'Mineral oil — it swells badly'],
          highlight: true,
        },
        {
          cells: [
            'Stainless carrier',
            'Corrosive or washdown environments',
            'Nothing in particular — it is a cost decision',
          ],
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How do I choose the right bonded seal size?',
      answer:
        'Order it against the BSP thread designation of the port — a 1/2 BSP seal for a 1/2 BSP thread. Do not order by a measured diameter, because BSP sizes come from historical pipe bore and do not match the thread major diameter. The seal must be a close sliding fit on the thread: one that clears it with a visible gap has nothing to seal against on its inside and will leak down the thread.',
    },

    { type: 'section_head', number: '/04', title: 'Assembly.', anchor: 'assembly' },
    {
      type: 'decision_tree',
      heading: 'Fitting one so it holds first time',
      intro: 'Four steps, and the first two are where the failures are.',
      branches: [
        {
          condition: 'Check the port face',
          outcome: 'It must be flat and machined, with no radial scoring.',
          detail:
            'A cast or painted face is not a sealing surface. If the previous seal has embossed a ring into a soft face, that ring is now a leak path.',
        },
        {
          condition: 'Fit a new seal, not the old one',
          outcome: 'The rubber has taken a compression set.',
          detail:
            'Re-used bonded seals are cheap to avoid and expensive to diagnose. Have the sizes you use on the van.',
        },
        {
          condition: 'Seal goes under the head, against the port face',
          outcome: 'Not on the thread, not part way down.',
          detail:
            'It should slide down the thread and come to rest flat on the face before the head reaches it.',
        },
        {
          condition: 'Tighten to the manufacturer figure',
          outcome:
            'The metal carrier sets the compression, so this is forgiving — but not unlimited.',
          detail:
            'Over-tightening squeezes the rubber out from under the washer and the joint then depends on metal-to-metal contact that was never designed to seal.',
        },
      ],
    },
    {
      type: 'standard_citation',
      standard: 'ISO 228-1',
      publisher: 'ISO',
      title: 'Pipe threads where pressure-tight joints are not made on the threads',
      summary:
        'The standard governing BSPP parallel threads. The title is the important part: the thread is explicitly not the sealing element, which is exactly why a bonded seal or an O-ring is required and why thread tape achieves nothing on this family.',
    },
    {
      type: 'category_link',
      slug: 'seals-accessories',
      label: 'Seals and accessories',
      blurb: 'Bonded seals by thread size and material.',
    },
    {
      type: 'category_link',
      slug: 'bsp-hydraulic-adapters-uae',
      label: 'BSP adapters',
      blurb: 'Parallel and tapered, with the seal type stated.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I re-use a bonded seal?',
          answer:
            'In practice, no. The rubber takes a compression set on first assembly and will not recover enough to seal reliably. They are inexpensive; carry the sizes you use.',
        },
        {
          question: 'What is the difference between a bonded seal and a dowty washer?',
          answer:
            'None in normal usage. Dowty is a brand name that became the generic term in much of the world, in the same way that a particular vacuum cleaner brand did.',
        },
        {
          question: 'Can I use a plain copper washer instead?',
          answer:
            'On a low-pressure or non-critical joint it may hold, but it seals by deforming metal and needs a much higher and more precise clamp load. On a hydraulic port, use the bonded seal the port was designed around.',
        },
        {
          question: 'My port is BSPT, not BSPP. Do I need a bonded seal?',
          answer:
            'No. A tapered BSPT thread seals on the thread flanks and takes a sealant instead. If you are unsure which you have, a parallel thread has the same diameter along its length and a tapered one visibly narrows.',
        },
        {
          question: 'The joint still weeps with a new seal. What now?',
          answer:
            'Check the port face for a machined flat, check that the seal is a close fit on the thread rather than loose, and check that the fitting head underside is square. In that order — the loose-seal case is the most common and the hardest to see once assembled.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Sizes are deliberately not tabulated here — order against the thread designation for the port.',
    },
    {
      type: 'cta_block',
      heading: 'Tell us the port thread and we will send the right seal.',
      body: 'If you are not sure what thread it is, send a photograph of the port and a measurement across the threads. Bonded seals are cheap to stock and expensive to be without.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
