import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Marine anchors, read from the 14 family listings and their variant rows:
 * anchor type, pattern, mass range, material and certification. The Danforth
 * family summary said 20 kg to 30 kg; its variant rows run from 1.5 kg to
 * 18,000 kg, and the article follows the rows (summary corrected by
 * 2026-10-06-listing-data-fixes). Holding-power ratios and class
 * mass allowances are not on the listings and are not quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'types-of-marine-anchors',
  title: 'Types of marine anchors: stockless, Hall, Pool, HHP, Admiralty, Danforth and claw',
  excerpt:
    'Ship anchors and small-craft anchors are different families with different jobs. The anchor types we list, how each one holds, the mass ranges available and what to specify when ordering one.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T02:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the main types of marine anchor?',
      answer:
        'For ships: stockless bower anchors such as the Hall, Baldt and Pool types, which stow in the hawse pipe; high holding power (HHP) stockless anchors; and stocked anchors such as the Admiralty pattern. For small craft: fluke anchors (Danforth), plough anchors (CQR), claw anchors (Bruce), delta anchors and grapnels. Ship anchors are specified by mass — on our listings from 20 kg to 35,000 kg — and small-craft anchors by mass or length.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Stockless anchors (Hall, Baldt, Pool) have flukes that pivot on the crown and stow straight into the hawse pipe.',
        'HHP stockless anchors are designed to hold more for their mass; ours (type HY-14) run from 56 kg to 13,500 kg.',
        'The Admiralty pattern is a stocked anchor — ours to GB 545-96, 50 kg to 10,000 kg.',
        'Small-craft anchors trade setting ability against seabed type: fluke for sand and mud, plough and claw for mixed ground, grapnel for rock.',
        'Ship anchors on our listings come with the manufacturer\'s test certificate; specify class certification where the vessel needs it.',
      ],
    },
    {
      type: 'lead',
      html: 'An anchor holds a vessel by digging into the seabed and by the weight and catenary of the chain behind it. The shape of the anchor decides <strong>how quickly it digs in, how well it holds once set</strong> and how easily it stows, and the two big families — ship anchors and small-craft anchors — have settled on different answers.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Anchor types on our listings.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'Marine anchors we list',
      columns: ['Anchor', 'Type and use', 'Mass range listed'],
      rows: [
        { cells: ['Hall', 'Stockless bower anchor', '100 kg to 11,100 kg'], highlight: true },
        { cells: ['Baldt', 'Stockless bower anchor', '50 kg to 35,000 kg'] },
        { cells: ['Pool (type N and welded)', 'Stockless bower anchor', '20 kg to 17,200 kg; welded 60 kg to 17,260 kg'] },
        { cells: ['HHP stockless (HY-14)', 'High holding power bower anchor', '56 kg to 13,500 kg'] },
        { cells: ['Admiralty (GB 545-96)', 'Stocked anchor', '50 kg to 10,000 kg'] },
        { cells: ['Single fluke', 'One-fluke anchor', '75 kg to 8,000 kg'] },
        { cells: ['Danforth', 'Fluke anchor', '1.5 kg to 18,000 kg'] },
        { cells: ['Plough (CQR), claw (Bruce), delta', 'Small-craft anchors', 'Plough 5–16 kg; claw 2–20 kg; delta 230–450 mm'] },
        { cells: ['Grapnel', 'Folding or four-prong, small craft and retrieval', 'Folding 0.7 kg up; four-prong 2–20 kg'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Stockless bower anchors.',
      anchor: 'stockless',
    },
    {
      type: 'paragraph',
      html: 'Most merchant ships carry stockless anchors. The two flukes are cast or fabricated as one piece that pivots on the crown at the end of the shank, so when the anchor drags the flukes tip down and bite, and when it is weighed the shank draws straight up into the hawse pipe with nothing sticking out. The Hall, Baldt and Pool patterns are variations on the theme, differing in fluke shape, crown design and whether the head is cast or welded. They are specified by mass, and the mass a ship carries is set by its class rules.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'High holding power and stocked anchors.',
      anchor: 'hhp',
    },
    {
      type: 'paragraph',
      html: 'High holding power (HHP) stockless anchors use larger, more efficient flukes so that they hold more per tonne of anchor. Class societies treat an approved HHP design differently from an ordinary stockless anchor when setting the required mass, so use the class rule for the vessel rather than a like-for-like weight swap. The Admiralty pattern is the traditional stocked anchor, with a bar set at right angles to the arms that turns the anchor so a fluke digs in; it holds well but is awkward to stow, and today it serves as a mooring anchor and on traditional craft more often than as a bower.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Small-craft anchors.',
      anchor: 'small-craft',
    },
    {
      type: 'paragraph',
      html: 'Small-craft anchors are chosen for the seabed. Fluke anchors such as the Danforth set deep in sand and mud and hold very well for their weight, but struggle in rock and weed. Plough (CQR) and claw (Bruce) anchors set in a wider range of bottoms and tend to reset when the wind turns the boat. Delta anchors are a fixed-shank plough shape, ours in mirror-polished stainless steel from 230 mm to 450 mm. Grapnels hook into rock and are also used for retrieving lines; ours fold in galvanised and stainless steel, or come as fixed four-prong stainless anchors from 2 kg to 20 kg.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The anchor is only half of the system.',
      body: 'Holding depends as much on the chain or rode as on the anchor: the weight of chain lying on the seabed keeps the pull on the anchor horizontal, and too short a scope lifts the shank and breaks it out. Size the chain and shackles with the anchor, from components rated for the job — see anchor chain grades U1, U2 and U3.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering an anchor.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'For a ship anchor, give the type, the mass, and the certification required — our ship-anchor listings come with the manufacturer\'s test certificate, and class certification should be specified where the vessel needs it — along with the chain size and the shackle that will join them. For small-craft anchors, give the type, mass or length, material and the boat or duty. The chain that goes with a bower anchor is covered in <a href="/blog/anchor-chain-grades-u1-u2-u3">anchor chain grades U1, U2 and U3</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is a stockless anchor?',
          answer:
            'An anchor without a stock, whose flukes pivot on the crown. It stows straight into the hawse pipe and is the usual bower anchor on merchant ships. Hall, Baldt and Pool are stockless types.',
        },
        {
          question: 'What does HHP mean on an anchor?',
          answer:
            'High holding power: a design with more efficient flukes that holds more for its mass. Our HHP stockless anchors (type HY-14) run from 56 kg to 13,500 kg.',
        },
        {
          question: 'Which anchor is best for a sandy bottom?',
          answer:
            'A fluke anchor such as a Danforth sets deep and holds very well in sand and mud. Plough and claw anchors cope better with mixed ground.',
        },
        {
          question: 'What is an Admiralty anchor?',
          answer:
            'A traditional stocked anchor with a bar at right angles to the arms. Ours are to GB 545-96, from 50 kg to 10,000 kg.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Marine anchors',
      skus: [
        'IH-LR-AN-HALL',
        'IH-LR-AN-BALDT',
        'IH-LR-AN-POOLN',
        'IH-LR-AN-HHP14',
        'IH-LR-AN-ADM',
        'IH-LR-AN-DAN',
        'IH-LR-AN-BCA',
        'IH-LR-AN-FGA',
      ],
    },
    {
      type: 'category_link',
      slug: 'marine-anchors',
      label: 'Marine anchors',
      blurb: 'Ship and small-craft anchors with size tables.',
    },
    {
      type: 'category_link',
      slug: 'anchor-chain-accessories',
      label: 'Anchor chain and accessories',
      blurb: 'Stud link and studless chain, Kenter and D shackles.',
    },

    {
      type: 'cta_block',
      heading: 'Need an anchor for a vessel or a mooring?',
      body: 'Send the anchor type and mass, or the vessel and its class requirement, and the chain size. We will quote anchor, chain and shackles with their certificates.',
      quoteLabel: 'Quote anchors',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Anchor types, patterns, mass ranges, materials and certification checked against our marine anchor listings.',
    },
  ],
}

export default ARTICLE
