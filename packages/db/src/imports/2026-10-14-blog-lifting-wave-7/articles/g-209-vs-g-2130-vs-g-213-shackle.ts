import type { BlogArticleSeed } from '../shared'

/**
 * G-209 vs G-2130 vs G-213 pattern shackles. Ratings from live size tables (identical WLL by size
 * across the three anchor patterns up to 2"; G-2130 runs to 4" / 150 t, G-209 to 2-1/2" / 55 t,
 * G-213 to 2" / 35 t). RR-C-271F classes read 2026-10-14 (everyspec). Rigging rules from Crosby
 * Applications & Warnings (2023/2025), stated as the maker's guidance for its own products.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'g-209-vs-g-2130-vs-g-213-shackle',
  title: 'G-209 vs G-2130 vs G-213 shackles: screw pin, bolt type or round pin?',
  excerpt:
    'G-209, G-2130 and G-213 are the three anchor shackle patterns contractors order most, and up to 2" they carry exactly the same working load limits. What differs is the pin — and the pin decides where each one is allowed. How the three compare, how they map to RR-C-271, their chain-shackle equivalents, and which to order for which job.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'G-209 vs G-2130 vs G-213 Shackle: Which Pin, Which Job',
  seoDescription:
    'G-209 screw pin, G-2130 bolt type and G-213 round pin anchor shackles compared: same WLL table, different pins, RR-C-271 classes, chain-shackle equivalents (G-210, G-2150, G-215) and when to use each on site.',
  focusKeyword: 'g-209 vs g-2130',
  publishedAt: '2026-10-14T08:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Up to 2", G-209, G-2130 and G-213 pattern anchor shackles carry the same WLL at each size — 2 t at 1/2", 8.5 t at 1", 35 t at 2".',
        'G-209 has a screw pin: quick to rig, for lifting gear made and broken often.',
        'G-2130 has a bolt, nut and cotter: for long-term installations and anywhere the pin could turn under load.',
        'G-213 has a round pin and cotter: in-line loads only — no side loading, no multiple sling legs.',
        'The chain-shackle (dee) equivalents are G-210, G-2150 and G-215.',
      ],
    },
    {
      type: 'lead',
      html: 'Pattern numbers are the shorthand of the rigging loft. A storekeeper who asks for “G-209 1 inch” gets a galvanised screw-pin anchor shackle with known dimensions and a known rating, from any maker who makes to that pattern. Three anchor patterns cover most site needs, and because their rating tables match, the choice between them is entirely about the pin. Our <a href="/blog/shackle-buying-guide-uae">shackle buying guide</a> covers the rest of the order.',
    },

    { type: 'section_head', number: '/01', title: 'Three pins, one rating table.', anchor: 'compare' },
    {
      type: 'comparison_table',
      caption: 'Anchor shackle patterns compared (ratings from our live size tables)',
      columns: ['Property', 'G-209', 'G-2130', 'G-213'],
      rows: [
        { cells: ['Pin', 'Screw pin', 'Bolt, nut and cotter', 'Round pin and cotter'] },
        { cells: ['RR-C-271 class', 'Class 2 (screw pin)', 'Class 3 (bolt, nut, cotter)', 'Class 1 (round pin)'] },
        { cells: ['1/2" / 1" / 2" WLL', '2 t / 8.5 t / 35 t', '2 t / 8.5 t / 35 t', '2 t / 8.5 t / 35 t'], highlight: true },
        { cells: ['Largest size in our range', '2-1/2", 55 t', '4", 150 t', '2", 35 t'] },
        { cells: ['Side loading', 'Allowed with maker’s reduction', 'Allowed with maker’s reduction', 'Not allowed'] },
        { cells: ['Typical use', 'Temporary rigging, made and broken often', 'Long-term rigging, rotating loads', 'Tie-downs, towing, in-line pulls'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between G-209 and G-2130 shackles?',
      answer:
        'The pin. A G-209 has a screw pin that threads into the body — quick to fit for temporary rigging. A G-2130 has a bolt, nut and cotter pin, so the pin cannot unscrew — the choice for long-term installations and anywhere the load could turn the pin. Up to 2" both carry the same working load limit at each size.',
    },

    { type: 'section_head', number: '/02', title: 'G-209: screw pin.', anchor: 'g-209' },
    {
      type: 'paragraph',
      html: 'The <a href="/p/screw-pin-anchor-shackle-g-209-pattern">G-209 pattern</a> is the everyday rigging shackle: the pin screws into the body, so it is fitted and removed in seconds. Two rules make it safe. The pin must be fully engaged — the collar seated against the ear — and tightened before each lift. And it must not be used where a running line or a rotating load can turn the pin, because a screw pin that is turned can back itself out. Crosby, for example, warns against letting a live line rotate the screw pin, such as in a choker hitch, and calls for a screw pin used long-term to be secured (moused) against rotation.',
    },

    { type: 'section_head', number: '/03', title: 'G-2130: bolt type.', anchor: 'g-2130' },
    {
      type: 'paragraph',
      html: 'The <a href="/p/bolt-type-anchor-shackle-g-2130-pattern">G-2130 pattern</a> replaces the screw pin with a bolt, a nut and a cotter pin through the bolt — often called a safety-pin shackle. Once the cotter is in, the pin cannot work loose, whatever the load does. Makers recommend bolt-type shackles for permanent or long-term installations and wherever the load may slide on the pin and turn it. In our range the G-2130 also runs to the largest sizes — up to 4" and 150 t — and the <a href="/p/bolt-type-chain-shackle-g-2150-pattern">G-2150</a> is its dee-shaped chain-shackle partner.',
    },

    { type: 'section_head', number: '/04', title: 'G-213: round pin.', anchor: 'g-213' },
    {
      type: 'paragraph',
      html: 'The <a href="/p/round-pin-anchor-shackle-g-213-pattern">G-213 pattern</a> uses a plain pin held by a cotter. It is cheap and quick, and suits tie-downs, towing and strictly in-line pulls. It is not for side loading, and makers say round-pin shackles must never be used to gather several sling legs. If a lift could put any angle on the shackle, choose a G-209 or G-2130 instead. The chain-shackle version is the <a href="/p/round-pin-chain-shackle-g-215-pattern">G-215</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Anchor or chain body.', anchor: 'body' },
    {
      type: 'paragraph',
      html: 'Each pin comes in two bodies. The <strong>anchor</strong> (bow) shackle has a rounded bow that accepts several sling legs or a pull at an angle; the <strong>chain</strong> (dee) shackle has a narrower, straight-sided body for in-line pulls. Anchor shackles are the default for lifting with slings; chain shackles suit chain connections and in-line rigging. See <a href="/blog/types-of-shackles">types of shackles</a> and <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle correctly</a>.',
    },
    {
      type: 'decision_tree',
      heading: 'Which pattern?',
      branches: [
        { condition: 'Will the shackle stay in place for weeks or longer, or could the load turn the pin?', outcome: 'G-2130 bolt type.', sku: 'IH-LR-SH-G2130' },
        { condition: 'Is it temporary rigging, made and broken often, with the pin bearing on a fixed point?', outcome: 'G-209 screw pin.', sku: 'IH-LR-SH-G209' },
        { condition: 'Is the pull strictly in line, with one connection each side — a tie-down or tow?', outcome: 'G-213 round pin.', sku: 'IH-LR-SH-G213' },
        { condition: 'Above 2" or 35 t?', outcome: 'G-2130 runs to 4" and 150 t; or a wide-body sling shackle.', sku: 'IH-LR-SH-WBSSSP' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Do G-209 and G-2130 have the same rating?', answer: 'Yes, size for size up to 2" in our tables — for example 8.5 t at 1". The G-2130 range continues to 4" and 150 t.' },
        { question: 'Can I side load a G-213 round pin shackle?', answer: 'No. Makers do not allow side loading of round-pin shackles or using them to gather several sling legs.' },
        { question: 'What does the G stand for?', answer: 'In Crosby’s pattern numbering the G prefix indicates a corrosion-protective (galvanised) finish. Pattern shackles from other makers use the number for the shape; see pattern numbers explained.' },
        { question: 'What is a safety pin shackle?', answer: 'A bolt-type shackle like the G-2130: a bolt, nut and cotter pin instead of a screw pin.' },
        { question: 'Which pattern is used under a crane hook with multiple legs?', answer: 'An anchor (bow) shackle with a screw or bolt pin — G-209 or G-2130 — with the pin on the hook and the legs in the bow.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'The three patterns and their chain-shackle partners',
      skus: ['IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-SH-G213', 'IH-LR-SH-G210', 'IH-LR-SH-G2150', 'IH-LR-SH-G215'],
    },
    {
      type: 'category_link',
      slug: 'shackles',
      label: 'Shackles',
      blurb: 'Screw pin, bolt type and round pin shackles in every pattern.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['shackle-buying-guide-uae', 'how-to-rig-a-shackle-correctly', 'types-of-shackles', 'shackle-size-and-capacity-chart', 'crosby-pattern-numbers-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Ratings from the live Indus size tables for the G-209, G-2130 and G-213 pattern families. RR-C-271F classes; rigging guidance from a shackle maker’s published applications and warnings, which apply to that maker’s products.',
    },
    {
      type: 'cta_block',
      heading: 'Need pattern shackles?',
      body: 'Send the patterns, sizes and quantities. We will quote from stock with the manufacturer’s test certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
