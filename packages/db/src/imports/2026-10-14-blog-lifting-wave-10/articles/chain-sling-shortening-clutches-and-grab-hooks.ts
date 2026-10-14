import type { BlogArticleSeed } from '../shared'

/**
 * Shortening chain slings. Checked 2026-10-14: a US maker requires a 20 % WLL reduction when
 * shortening with conventional grab hooks, except with its cradle grab hook / shorteners (maker
 * catalogue, high); a European maker rates its grab hooks at 100 % so no reduction (high); OSHA
 * 1910.184(c)(2) no shortening with knots, bolts or makeshift devices (high); knotting not allowed
 * (maker, high). Not found in ASME B30.9 / EN 818-4 — not attributed to them. Clutch and shortening
 * grab hook ratings = chain WLL in the live Indus tables.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'chain-sling-shortening-clutches-and-grab-hooks',
  title: 'Shortening a chain sling: clutches, cradle grab hooks and the 20% rule',
  excerpt:
    'Uneven loads and off-centre lifting points need legs of different lengths, and a chain sling with shorteners adjusts on the spot. But not every grab hook carries the full chain rating when it shortens a leg. Shortening clutches, cradle and conventional grab hooks, when a maker requires a 20% reduction, and what must never be used instead.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Chain Sling Shortening Clutches and Grab Hooks Explained',
  seoDescription:
    'How to shorten a chain sling safely: shortening clutches, cradle grab hooks and conventional grab hooks, when a 20% WLL reduction applies, full-rated shorteners in our range, and why chain is never knotted or bolted.',
  focusKeyword: 'chain shortening clutch',
  publishedAt: '2026-10-14T10:44:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Shorteners let each leg of a chain sling be adjusted to the load’s centre of gravity.',
        'Shortening clutches and cradle grab hooks are designed to hold the chain at its full WLL.',
        'Some makers require a 20% reduction when a conventional grab hook is used to shorten; others rate their grab hooks at 100% — the maker’s data decides.',
        'Never shorten chain by knotting it, bolting it or wrapping it round a hook.',
        'The shortener must match the chain’s grade and size.',
      ],
    },
    {
      type: 'lead',
      html: 'A two-leg sling lifting a load with an off-centre lifting point needs one leg shorter than the other, or the load tilts. Shortening fittings let the rigger take up chain on the leg that needs it, in seconds. They work by catching a link of the chain in a slot sized to it — and how well that slot supports the link decides whether the chain keeps its full rating. For the sling codes that name shorteners, see <a href="/blog/chain-sling-codes-explained">chain sling codes explained</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The shortening fittings.', anchor: 'fittings' },
    {
      type: 'comparison_table',
      caption: 'Ways to shorten a chain sling leg',
      columns: ['Fitting', 'How it holds the chain', 'Rating when shortening'],
      rows: [
        { cells: ['Shortening clutch', 'A forged slot that holds one link flat, fitted in the leg or on the master link', 'Full chain WLL in our range'], highlight: true },
        { cells: ['Cradle or shortening grab hook', 'A throat shaped to support the link it holds', 'Full chain WLL in our range'] },
        { cells: ['Conventional grab hook', 'A narrow throat that catches a link on edge', 'Maker-dependent — one maker requires a 20% reduction'] },
        { cells: ['Knot, bolt, wrap', 'Not a fitting', 'Never'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Does shortening a chain sling reduce its WLL?',
      answer:
        'Not when a shortening clutch or a cradle grab hook rated at full chain WLL is used. With a conventional grab hook it may: at least one maker requires a 20% reduction when its standard grab hooks are used to shorten, while others rate their grab hooks at 100%. Use the maker’s data for the fitting fitted.',
    },

    { type: 'section_head', number: '/02', title: 'What our tables show.', anchor: 'ratings' },
    {
      type: 'paragraph',
      html: 'Our Grade 80 clevis shortening clutch is rated 1.12 t at 6 mm, 3.15 t at 10 mm and 8 t at 16 mm — the chain’s own rating at each size — and the Grade 80 shortening grab hook matches it. The Grade 100 clevis shortening clutch is rated 1.4 t at 6 mm and 4 t at 10 mm. Match the shortener to the chain grade and size, as for every other part. See <a href="/blog/grade-80-vs-grade-100-chain-slings">Grade 80 vs Grade 100</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Using them.', anchor: 'use' },
    {
      type: 'prose',
      html: '<ul><li>Seat the link fully in the slot, flat, with the load running straight out of the fitting.</li><li>Shorten before the lift, with the sling slack, never under load.</li><li>Keep the free end of the chain clear of the load and the hook.</li><li>Rate the sling on the leg angle after shortening — see the <a href="/blog/sling-angle-chart">sling angle chart</a>.</li><li>Check shorteners for wear and opening at every pre-use check.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never knot or bolt chain.',
      body: 'US OSHA rules prohibit shortening slings with knots, bolts or other makeshift devices, and makers prohibit knotting chain. A knot bends links over each other and can break them well below the sling’s rating.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a chain shortening clutch?', answer: 'A forged fitting with a slot that holds one chain link, used to shorten a sling leg without reducing its rating when it is rated at full chain WLL.' },
        { question: 'Does a grab hook reduce chain sling capacity?', answer: 'It depends on the hook. Some makers require a 20% reduction for conventional grab hooks used to shorten; cradle grab hooks and many makers’ grab hooks carry the full rating.' },
        { question: 'Can I shorten a chain sling with a knot?', answer: 'No. Knotting chain is prohibited.' },
        { question: 'Can I shorten a sling under load?', answer: 'No. Adjust the legs with the sling slack, then take up the load.' },
        { question: 'Do your shorteners carry the full chain rating?', answer: 'Our Grade 80 and Grade 100 clevis shortening clutches and shortening grab hooks are rated at the chain’s WLL for each size.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Shortening clutches and grab hooks',
      skus: ['IH-LR-G8-CSC', 'IH-LR-G10-CSC', 'IH-LR-G8-SGHC', 'IH-LR-G10-CCGH', 'IH-LR-G10-SHCL', 'IH-LR-G8-GRADE80CC', 'IH-LR-G8-CGH'],
    },
    {
      type: 'category_link',
      slug: 'grade-100-chain-fittings',
      label: 'Grade 100 chain fittings',
      blurb: 'Shortening clutches, grab hooks, connectors and master links.',
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
      slugs: ['chain-sling-codes-explained', 'grade-80-vs-grade-100-chain-slings', 'hammerlock-vs-clevis-chain-fittings', 'sling-angle-chart', 'chain-sling-capacity-chart', 'lifting-hook-types'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Shortener ratings from the live Indus tables; the 20% grab-hook reduction and full-rated grab hooks from maker catalogues; knotting and bolting from US OSHA 1910.184.',
    },
    {
      type: 'cta_block',
      heading: 'Need adjustable slings?',
      body: 'Send the load, leg count and reach. We will quote chain slings with shorteners rated at the chain’s full WLL.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
