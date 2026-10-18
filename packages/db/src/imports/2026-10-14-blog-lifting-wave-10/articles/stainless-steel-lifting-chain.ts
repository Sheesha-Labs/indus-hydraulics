import type { BlogArticleSeed } from '../shared'

/**
 * Stainless steel lifting chain. Ratings from the live Indus Grade 60 stainless (316L / 318LN duplex)
 * table and G80/G100 tables. Checked 2026-10-14: another maker's stainless 3/8″ 5,500 lb vs G80
 * 7,100 / G100 8,800 lb (maker catalogue, high); no dedicated EN/ISO stainless lifting chain standard
 * found — makers cite EN 818 by analogy (stated as "we found none"); stainless chain 100 % WLL to
 * ~343 °C / 650 °F for one maker (high); SSINA — chloride SCC rare below 60 °C immersed, 304/316
 * very susceptible, evaporation concentrates chlorides (high); Nickel Institute — 304/316 cracked at
 * room temperature in indoor swimming-pool air (high).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'stainless-steel-lifting-chain',
  title: 'Stainless steel lifting chain: Grade 60 ratings, where it is worth it, and its limits',
  excerpt:
    'Stainless steel chain lifts where galvanised alloy chain would rust or contaminate: food plants, water treatment, marine and offshore. It carries less than Grade 80 at the same size, and chlorides in warm air can crack it. Ratings from our Grade 60 table, where stainless is worth it, which stainless chain to avoid for lifting, and how to look after it.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Stainless Steel Lifting Chain: Grade 60 Ratings and Limits',
  seoDescription:
    'Stainless steel lifting chain explained: Grade 60 WLL by size against Grade 80 and Grade 100, 316L and duplex grades, where stainless is worth it, rated vs unrated stainless chain, temperature, and chloride stress corrosion cracking.',
  focusKeyword: 'stainless steel lifting chain',
  publishedAt: '2026-10-14T10:52:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Stainless lifting chain carries less than alloy chain: at 10 mm our Grade 60 stainless is rated 2.45 t, against 3.2 t for Grade 80 and 4 t for Grade 100.',
        'Choose it for corrosion resistance and cleanliness, not strength.',
        'Only lift on stainless chain sold with a working load limit; much stainless link chain is published with a breaking load only.',
        'Chlorides in warm or evaporating conditions can crack 304 and 316 stainless — inspect it as closely as alloy chain.',
        'We found no dedicated EN or ISO standard for stainless lifting chain; makers rate it by analogy with alloy chain standards.',
      ],
    },
    {
      type: 'lead',
      html: 'Galvanised alloy chain is the default for lifting, but it rusts once the zinc goes, and rust and zinc flakes are unwelcome in a food plant, a clean room or a water tank. Stainless lifting chain solves that — at a price in capacity, and with a corrosion risk of its own. For the general stainless-or-galvanised question across rigging, see <a href="/blog/stainless-vs-galvanized-rigging-gulf">stainless vs galvanized rigging in Gulf coastal air</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Ratings side by side.', anchor: 'ratings' },
    {
      type: 'comparison_table',
      caption: 'Single-leg WLL at the same size, from our tables',
      columns: ['Chain size', 'Grade 60 stainless', 'Grade 80', 'Grade 100'],
      rows: [
        { cells: ['6 mm', '0.9 t', '1.15 t', '1.4 t'] },
        { cells: ['8 mm', '1.55 t', '2.05 t', '2.5 t'] },
        { cells: ['10 mm', '2.45 t', '3.2 t', '4 t'], highlight: true },
        { cells: ['13 mm', '3.85 t', '5.4 t', '6.7 t'] },
        { cells: ['16 mm', '6 t', '8.2 t', '10 t'] },
        { cells: ['22 mm', '11 t', '15 t', '19 t'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Is stainless steel chain as strong as alloy lifting chain?',
      answer:
        'No. At the same size, rated stainless lifting chain carries roughly three quarters of Grade 80 — for example 2.45 t against 3.2 t at 10 mm in our tables — and less again against Grade 100. Choose stainless for corrosion resistance, and size it on its own WLL.',
    },

    { type: 'section_head', number: '/02', title: 'Rated and unrated stainless chain.', anchor: 'rated' },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/grade-60-stainless-steel-lifting-chain">Grade 60 stainless lifting chain</a> is 316L up to 13 mm and 318LN duplex from 16 mm, with a WLL at every size. Much other stainless link chain — including general-purpose 304 and 316 link chain — is published with a breaking load and no lifting rating; it is for marine, architectural and general duty, not lifting. If a chain has no WLL, do not lift on it. See <a href="/blog/din-link-chain-standards">DIN link chain standards</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Where it is worth it.', anchor: 'uses' },
    {
      type: 'prose',
      html: '<ul><li><strong>Food, pharmaceutical and clean areas</strong>, where rust and zinc flakes are contamination.</li><li><strong>Water and wastewater</strong>: pump lifting chain in wet wells and tanks.</li><li><strong>Marine and offshore</strong>, where galvanising wears quickly.</li><li><strong>Heat</strong>: one maker rates its stainless lifting chain at full WLL to about 340 °C — more than some Grade 100.</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Chlorides and cracking.', anchor: 'scc' },
    {
      type: 'paragraph',
      html: 'Stainless steel has its own failure mode: chloride stress corrosion cracking. The US stainless steel industry association notes that it is rare below about 60 °C in immersion, but that 304 and 316 are very susceptible, and that evaporation can concentrate chlorides enough to crack them below the usual thresholds. The Nickel Institute has documented 304 and 316 cracking at room temperature in indoor swimming-pool air. Hot, salty, wet-dry conditions — splash zones, desalination plants, pool halls — call for close examination of stainless lifting gear, and duplex grades resist it better.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Same rules as alloy chain.',
      body: 'Stainless lifting chain needs fittings rated for it, a tag, pre-use checks and thorough examination like any other lifting gear. A sling is rated to its weakest part; mixing stainless and alloy parts also invites galvanic corrosion.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What grade is stainless lifting chain?', answer: 'Commonly Grade 50 or Grade 60. Our stainless lifting chain is Grade 60, in 316L and 318LN duplex.' },
        { question: 'Is 316 stainless chain good for lifting?', answer: 'Only if it is sold as lifting chain with a WLL. General 316 link chain is often rated by breaking load only.' },
        { question: 'Is there a standard for stainless lifting chain?', answer: 'We found no dedicated EN or ISO standard; makers rate it by analogy with alloy chain sling standards.' },
        { question: 'Can stainless steel chain crack?', answer: 'Yes — chloride stress corrosion cracking can affect 304 and 316 in warm, salty or evaporating conditions.' },
        { question: 'Do you have stainless chain fittings?', answer: 'Yes — stainless hammerlocks, connecting links and hooks to match.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Stainless chain and fittings',
      skus: ['IH-LR-SC-G60', 'IH-LR-SC-SSHE', 'IH-LR-SC-SSHUS', 'IH-LR-SC-SSSCL', 'IH-LR-HK-SSCSHSL', 'IH-LR-SC-SSLC'],
    },
    {
      type: 'category_link',
      slug: 'stainless-steel-chain',
      label: 'Stainless steel chain',
      blurb: 'Grade 60 stainless lifting chain, link chain and stainless fittings.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'marine',
      label: 'Marine',
      blurb: 'Rigging, mooring and deck hardware for marine work.',
    },
    {
      type: 'related_articles',
      slugs: ['stainless-vs-galvanized-rigging-gulf', 'when-stainless-is-worth-it', 'grade-80-vs-grade-100-chain-slings', 'chain-grades-explained', 'din-link-chain-standards', 'jetty-and-marine-construction-rigging'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Ratings from the live Indus Grade 60 stainless, Grade 80 and Grade 100 tables; temperature from a maker’s catalogue; stress corrosion cracking from SSINA and the Nickel Institute.',
    },
    {
      type: 'cta_block',
      heading: 'Lifting in a corrosive or clean area?',
      body: 'Send the load, the environment and the reach. We will quote rated stainless chain and fittings.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
