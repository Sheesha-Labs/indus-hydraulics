import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Bollards and mooring fittings, read from the 38 listings and their variant
 * rows: type, pattern standard, size and WLL. The GB/T 554 Type A listings
 * label the same 29–981 kN figures WLL (2008) and MBL (1996), and the ISO
 * 13795 towing figures in kN do not match their tonnes; none of those are
 * quoted. Dock bollard WLLs in tonnes and the CB/T 3845 WLLs in kN are
 * consistent and are used.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'types-of-mooring-bollards',
  title: 'Types of mooring bollards: ship double bollards, cross bollards, dock bollards and cleats',
  excerpt:
    'A bollard on a ship\'s deck and a bollard on a quay do the same job under different rules. The bollard types we list — double, cross, T-head, stag horn, bitts and cleats — how they are rated, and what to check before fitting one.',
  categorySlug: 'lifting-rigging',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T03:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the main types of mooring bollard?',
      answer:
        'On ships: double bollards (two posts on one base, for belaying a line in figure-eights) and cross bollards (a single post with a cross arm), built to standards such as GB/T 554, JIS F 2001, DIN 82607 and ISO 13795. On quays: dock bollards such as T-head, stag horn, twin horn, single bitt and inclined double bitt types, rated by working load limit — 10 t to 200 t on our listings. On small craft: cleats, fairleads and chocks.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Ship bollards are welded deck fittings made to a pattern standard; dock bollards are cast and anchored into the quay.',
        'Double bollards take a line belayed in figure-eights; cross bollards suit smaller lines and vessels.',
        'Dock bollard heads — T-head, stag horn, twin horn — keep the line on at steep angles; ours are rated 10 t to 200 t WLL.',
        'Our CB/T 3845 cross bollards are rated 50 kN at 100 mm to 650 kN at 400 mm.',
        'A working load limit is not a breaking load. The quay or deck structure under the bollard must be able to take the load too.',
      ],
    },
    {
      type: 'lead',
      html: 'Every mooring line ends on a fitting, and the fitting has to hold whatever the line puts into it — in a gust, a passing ship\'s wash or a falling tide. Bollards come in a handful of shapes, and <strong>the shape follows from where the line comes from</strong>: along a deck, up from a quay, or at a steep angle from a high-sided ship.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Ship bollards.',
      anchor: 'ship',
    },
    {
      type: 'comparison_table',
      caption: 'Shipboard bollards on our listings',
      columns: ['Type', 'Pattern standards we list', 'Sizes'],
      rows: [
        { cells: ['Double bollard', 'GB/T 554 Types A, B, C; JIS F 2001; DIN 82607; ISO 13795 Types A and B; NS 2584', 'DN 100 to DN 800 (GB/T 554 Type A)'], highlight: true },
        { cells: ['Cross bollard', 'GB/T 554 Types D, DH, DL, E; JIS F 2804; GB 10106 A and B; CB/T 3845', '100 mm to 400 mm (CB/T 3845)'] },
        { cells: ['Welded inclined bollard', 'CB/T 169', '8 sizes'] },
        { cells: ['Stainless cross bollards', 'GB/T 554 Type D; DR and DS types', '50 mm to 100 mm; 4" to 8"'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'A double bollard is two hollow posts on a common base plate welded to the deck; a mooring line is belayed around both in figure-eights, so friction rather than a knot holds it. Cross bollards have a single post with a horizontal bar, which keeps the line from riding up and suits smaller lines and vessels. The pattern standard fixes the dimensions and the plate thicknesses, and the rating comes with the pattern and size — the CB/T 3845 cross bollards on our listings run from 50 kN WLL at 100 mm to 650 kN at 400 mm.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Dock bollards.',
      anchor: 'dock',
    },
    {
      type: 'comparison_table',
      caption: 'Dock bollards on our listings',
      columns: ['Type', 'Head shape', 'WLL range'],
      rows: [
        { cells: ['T-head', 'Cross-shaped head that stops the line lifting off', '10 t to 200 t'], highlight: true },
        { cells: ['Stag horn and twin horn', 'Two horns for several lines and steep angles', '10 t to 200 t'] },
        { cells: ['Single bitt', 'Single post', '20 t to 200 t'] },
        { cells: ['Inclined double bitts', 'Two inclined posts', '20 t to 200 t'] },
        { cells: ['R type, J type, K head', 'Other dock bollard head patterns', '10 t to 200 t; 10 t to 50 t; 15 t to 200 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Dock bollards are cast in steel or iron and anchored into the quay structure. Their heads are shaped so that a line led up at a steep angle from a high-sided ship, or around the bollard from several directions, stays on: the T-head\'s cross arm and the horns of stag horn and twin horn bollards do that job. They are rated by working load limit in tonnes, and the anchor bolts and the quay itself must carry the same load — a 200 t bollard on a quay edge that was designed for 50 t is a 50 t bollard.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'WLL is not breaking load, and the fitting is not the whole system.',
      body: 'A bollard\'s working load limit is a safe working figure with a margin below the load that would break it. Never load a bollard, its fixings or the structure beneath beyond the rated WLL, and do not assume a fitting is rated for a line just because the line fits around it.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Cleats, fairleads and chocks.',
      anchor: 'small',
    },
    {
      type: 'paragraph',
      html: 'Small craft and workboats use smaller fittings. Our stainless cleats — boat cleats, rope cleats and blue water cleats, AISI 316 on most — take lines belayed by hand; Skene-type fairleads and straight chocks lead a line cleanly off the deck edge without chafe; and bow rollers carry an anchor rode over the stem. They are sized to the line and the boat rather than given a WLL on our listings, so treat them as boat hardware, not as rated lifting or towing points.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Choosing and ordering.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Shipboard fittings follow the vessel\'s mooring arrangement and its class requirements, so give the pattern standard, type and size from the drawing. For a quay, give the bollard type, the required WLL, the quay construction and the fixing method. Fenders for the same berth are covered in <a href="/blog/types-of-marine-fenders">types of marine fenders</a>, and the lines themselves in <a href="/blog/fibre-rope-materials-compared">fibre rope materials compared</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between a bollard and a bitt?',
          answer:
            'The terms overlap. On our listings, bitts are single or paired posts on a quay, and bollards include both shipboard double and cross bollards and shaped dock bollards such as T-head and stag horn types.',
        },
        {
          question: 'How are dock bollards rated?',
          answer:
            'By working load limit in tonnes. Ours run from 10 t to 200 t depending on type. The fixings and the quay must carry the same load.',
        },
        {
          question: 'What is a T-head bollard?',
          answer:
            'A dock bollard with a cross-shaped head that stops the mooring line lifting off at steep angles. Ours are rated 10 t to 200 t WLL.',
        },
        {
          question: 'Which standards cover ship double bollards?',
          answer:
            'Our listings include GB/T 554, JIS F 2001, DIN 82607, ISO 13795 and NS 2584 patterns. Use the standard on the vessel\'s drawing.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Bollards and mooring fittings',
      skus: [
        'IH-LR-BM-MDBG55420',
        'IH-LR-BM-MDBI137952',
        'IH-LR-BM-MSCBCBT38',
        'IH-LR-BM-THDB',
        'IH-LR-BM-SHB',
        'IH-LR-BM-SBB',
        'IH-LR-BM-SSBC',
        'IH-LR-BM-SSSF',
      ],
    },
    {
      type: 'category_link',
      slug: 'bollards-mooring',
      label: 'Bollards and mooring',
      blurb: '38 ship bollards, dock bollards, cleats, fairleads and chocks.',
    },
    {
      type: 'category_link',
      slug: 'fibre-rope-twine',
      label: 'Fibre rope and twine',
      blurb: 'Mooring hawsers and ropes in PP, PE, polyester, nylon and HMPE.',
    },

    {
      type: 'cta_block',
      heading: 'Fitting out a deck or a quay?',
      body: 'Send the bollard type, pattern standard and size, or the required WLL and fixing method for a quay. We will quote fittings with their certificates.',
      quoteLabel: 'Quote bollards',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Types, pattern standards, sizes and WLLs checked against our bollard and mooring listings.',
    },
  ],
}

export default ARTICLE
