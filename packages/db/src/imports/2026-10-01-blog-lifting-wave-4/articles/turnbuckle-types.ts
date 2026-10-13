import type { BlogArticleSeed } from '../shared'

/**
 * Turnbuckles — end fittings, body types, standards and use.
 *
 * Ratings are from our own tables (2026-10-01): US drop-forged hook vs
 * eye/jaw, DIN 1478 hook-and-eye vs eye-and-eye. Two rows were deliberately
 * not used: DIN 1478 M16 eye-and-eye (1,170 kg, out of sequence — probably
 * 1,770) and the stainless US-type table (identical to carbon, unconfirmed).
 *
 * Standard and maker statements checked 2026-09-30:
 *   - Crosby turnbuckle catalogue section (2023): in-line pull only, 5:1,
 *     proof 2.5 × WLL, 1″ × 12 hook-and-hook 5,000 lb vs eye-and-eye 10,000 lb,
 *     meets ASTM F1145 / ASME B30.26.
 *   - Van Beest (Green Pin) instructions: use the lock nuts, no side loads,
 *     pre-use checks, never substitute end fittings.
 *   - DIN 1480:2005 clause 11: the forged body is stronger than DIN 34828
 *     weld-on ends of the same steel; other ends must be checked separately.
 *     The standard has no WLL table.
 *   - ASTM F1145 scope (abstract only; no design factor stated there).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'turnbuckle-types',
  title: 'Turnbuckle types: hook, eye and jaw ends, open and closed bodies, and what each can carry',
  excerpt:
    'A turnbuckle is only as strong as its weakest end, and that is usually the hook: on our US drop-forged range a 1/2″ hook end is rated 1,500 lb against 2,200 lb for eye or jaw ends. Here is how end fittings and body types change the rating, which standards cover what, and how to keep a turnbuckle from unwinding.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Types of turnbuckles: hook vs eye vs jaw, DIN 1480 vs US forged',
  seoDescription:
    'Turnbuckle types explained: hook, eye and jaw end fittings and their ratings, open and closed bodies, DIN 1480, DIN 1478 and ASTM F1145, and how to lock and inspect a turnbuckle.',
  focusKeyword: 'types of turnbuckles',
  publishedAt: '2026-10-01T09:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A turnbuckle’s rating is set by its end fittings. Hook ends carry least: on our US drop-forged range a 1/2″ hook end is 1,500 lb against 2,200 lb for eye or jaw.',
        'Jaw and eye ends carry the full rating. Choose jaws to connect to a plate or pad eye, eyes to take a shackle or wire rope thimble.',
        'Turnbuckles are for straight, in-line pulls only. A side load or bending load is not rated.',
        'Lock it. Lock nuts, or wire through the body and the end fittings, stop vibration unwinding the threads.',
        'DIN 1480 standardises the body, not a complete rated assembly. Use the WLL the maker publishes for the assembled turnbuckle.',
      ],
    },
    {
      type: 'lead',
      html: 'A turnbuckle does one simple thing: turn the body and the two threaded ends draw together or apart, tensioning whatever is between them. What makes them confusing is the number of combinations — three common end fittings, two body styles, inch and metric threads, and several standards — and the fact that the rating can change by half depending on which end you choose.',
    },

    { type: 'section_head', number: '/01', title: 'The end fittings.', anchor: 'end-fittings' },
    {
      type: 'comparison_table',
      caption: 'Turnbuckle end fittings',
      columns: ['End', 'Connects to', 'Rating'],
      rows: [
        { cells: ['Jaw', 'A plate, pad eye or lug, through a pin or bolt', 'Full rating'] },
        { cells: ['Eye', 'A shackle, a thimbled wire rope eye or another eye', 'Full rating'] },
        { cells: ['Hook', 'An eye or ring that can be hooked on and off', 'Reduced — the lowest of the three'], highlight: true },
        { cells: ['Stub or weld-on end', 'Welded directly to the structure', 'Set by the weld and the maker’s rating'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The hook is the weak end because it is an open shape that bends to open under load. Our tables show how much it costs:',
    },
    {
      type: 'comparison_table',
      caption: 'Hook ends against eye and jaw ends, from our tables',
      columns: ['Turnbuckle', 'Hook end', 'Eye or jaw end'],
      rows: [
        { cells: ['US drop-forged, 3/8″', '1,000 lb', '1,200 lb'] },
        { cells: ['US drop-forged, 1/2″', '1,500 lb', '2,200 lb'], highlight: true },
        { cells: ['US drop-forged, 5/8″', '2,250 lb', '3,500 lb'] },
        { cells: ['US drop-forged, 3/4″', '3,000 lb', '5,200 lb'] },
        { cells: ['DIN 1478, M10 (hook and eye vs eye and eye)', '235 kg', '650 kg'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The gap widens with size: one major US maker rates a 1″ × 12″ hook-and-hook turnbuckle at 5,000 lb against 10,000 lb for eye-and-eye. A hook-and-eye turnbuckle is rated at its hook end. Where the connection allows it, choose jaw or eye ends: they carry more and cannot unhook.',
    },
    {
      type: 'direct_answer',
      question: 'Which turnbuckle end is strongest?',
      answer:
        'Jaw and eye ends carry the turnbuckle’s full rating; hook ends are rated lower because the open hook can straighten under load. On our US drop-forged range, a 1/2″ turnbuckle is rated 2,200 lb with eye or jaw ends but 1,500 lb with a hook. A turnbuckle with one hook is rated at the hook.',
    },

    { type: 'section_head', number: '/02', title: 'Open body or closed body.', anchor: 'body-types' },
    {
      type: 'paragraph',
      html: '<strong>Open-body turnbuckles</strong> have a forged frame with the threads exposed in the middle — the US drop-forged pattern and the DIN 1480 body are both of this kind. You can see both threaded ends inside the frame, which makes it easy to check how much thread is engaged and how much take-up is left.',
    },
    {
      type: 'paragraph',
      html: '<strong>Closed-body turnbuckles</strong>, often called rigging screws, have a tubular body that hides the threads — DIN 1478 is the metric pipe-body pattern, and stainless rigging screws with jaw, eye or swage ends are common in marine and architectural work. They look neater and keep dirt off the threads, but you cannot see thread engagement, so the ends must be set to the maker’s marks or minimum lengths.',
    },
    {
      type: 'paragraph',
      html: '<strong>Light-duty patterns</strong> — die-cast zinc and commercial turnbuckles — are for tensioning wires, fences, nets and signs. Where one is listed without a published rating, it should not be put in any load path that matters.',
    },

    { type: 'section_head', number: '/03', title: 'The standards behind the names.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<ul><li><strong>ASTM F1145</strong> is the US specification for turnbuckles — swaged, welded, cast or forged, with or without jam nuts — for tensioning rods, wire rope and similar. It covers several types and classes and requires proof, breaking, bending and galvanising tests. Major makers rate their forged turnbuckles at a 5:1 design factor and proof-test them at 2.5 times the WLL.</li><li><strong>DIN 1480</strong> standardises the forged open body. It has no table of working loads. It says the body is stronger than DIN 34828 weld-on ends of the same steel; with other end fittings, the capacity has to be checked. In practice, use the WLL the maker publishes for the complete assembly.</li><li><strong>DIN 1478</strong> is the tubular pipe-body pattern.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A DIN number is not a rating.',
      body: 'Two turnbuckles sold as “DIN 1480” can carry very different loads, because the standard fixes the body’s dimensions, not the strength of the finished assembly. Some makers list DIN 1480-style rigging screws for light duties such as rope railings with no WLL at all. Use a turnbuckle in a load path only if it comes with a published WLL and a certificate.',
    },

    { type: 'section_head', number: '/04', title: 'Using one safely.', anchor: 'use' },
    {
      type: 'prose',
      html: '<ul><li><strong>In-line pull only.</strong> Turnbuckles are made for a straight pull along their axis. Do not side-load them or let them bend over an edge.</li><li><strong>Engage the threads properly.</strong> On an open body, both threaded ends should be visible well into the frame. On a closed body, follow the maker’s minimum engagement. Never run a turnbuckle out to its last few threads to gain length; use a longer one.</li><li><strong>Lock it.</strong> Use the lock nuts supplied, or pass seizing wire through the body and the end fittings, so vibration cannot unwind it.</li><li><strong>Keep the parts matched.</strong> Never substitute an end fitting not made for that turnbuckle.</li></ul>',
    },
    {
      type: 'paragraph',
      html: '<strong>Check before every use:</strong> the markings are legible; the body and end threads are the same type and undamaged; the locking parts are in place and cannot vibrate out; and nothing is bent, nicked, cracked or opened out — especially the throat of a hook end. Remove any turnbuckle that fails one of these.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a turnbuckle',
      intro: 'Start from what it connects to and what it holds.',
      branches: [
        { condition: 'Connecting to a plate or pad eye', outcome: 'Jaw end, full rating.' },
        { condition: 'Connecting to a shackle or a thimbled rope eye', outcome: 'Eye end, full rating.' },
        { condition: 'Needs to be hooked on and off quickly', outcome: 'Hook end — size it on the lower hook rating.' },
        { condition: 'Marine, architectural or corrosive service', outcome: 'Stainless closed-body rigging screw, with a published WLL.' },
        { condition: 'Fencing, netting or light tensioning', outcome: 'Commercial or die-cast turnbuckle — never in a load path.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Turnbuckles in this guide',
      skus: ['IH-LR-TB-US', 'IH-LR-TB-D1480', 'IH-LR-TB-D1478TG', 'IH-LR-TB-IT', 'IH-LR-TB-GRSCB', 'IH-LR-TB-SSJJ', 'IH-LR-TB-COM'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the difference between a turnbuckle and a rigging screw?',
          answer:
            'The terms overlap. “Turnbuckle” is usually used for the open-frame type where the threads are visible, and “rigging screw” for a closed, tubular body that hides them. Both tension a line by turning the body to draw two threaded ends together.',
        },
        {
          question: 'Why is a hook-end turnbuckle rated lower?',
          answer:
            'Because an open hook can straighten under load before the rest of the turnbuckle is stressed. On our US range a 3/4″ turnbuckle is rated 5,200 lb with eye or jaw ends but 3,000 lb with a hook.',
        },
        {
          question: 'How do I stop a turnbuckle from loosening?',
          answer:
            'Tighten the lock nuts against the body, or pass seizing wire through the body and the end fittings. Vibration will otherwise slowly unwind it.',
        },
        {
          question: 'Can a turnbuckle take a side load?',
          answer:
            'No. Turnbuckles are rated for a straight, in-line pull. A side or bending load is not covered by the rating.',
        },
        {
          question: 'Is a DIN 1480 turnbuckle rated for lifting?',
          answer:
            'DIN 1480 standardises the body and has no load table, so the rating depends on the maker and the end fittings. Treat a DIN 1480 turnbuckle as rated only if the maker publishes a WLL for the complete assembly and supplies a certificate.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'turnbuckles-rigging-screws',
      label: 'Turnbuckles and rigging screws',
      blurb: 'US drop-forged, DIN 1480, DIN 1478, Italian and stainless patterns, with ratings by end fitting.',
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'To connect an eye-end turnbuckle to a pad eye or chain.',
    },
    {
      type: 'related_articles',
      slugs: ['types-of-shackles', 'wire-rope-clips-installation', 'working-load-limit-vs-breaking-strength', 'eye-bolt-types-and-angled-loads'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Ratings from the size tables on the linked product pages. Standard scopes from ASTM F1145 and DIN 1480:2005; use and inspection rules from published manufacturer instructions.',
    },
    {
      type: 'cta_block',
      heading: 'Need turnbuckles with a published rating?',
      body: 'Tell us the end fittings, thread size and take-up you need, and the load. We will quote forged turnbuckles or rigging screws with their WLL and the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
