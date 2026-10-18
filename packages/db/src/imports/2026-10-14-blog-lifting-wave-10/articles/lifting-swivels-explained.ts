import type { BlogArticleSeed } from '../shared'

/**
 * Rigging swivels. Checked 2026-10-14: a maker's regular and jaw-end swivels (G-402/G-403 pattern)
 * are positioning devices, not intended to rotate under load; 5:1 design factor (maker catalogue,
 * high); some swivel hooks designed to rotate under load, others must not be swivelled while loaded
 * (maker, high); bearing swivels rotate under load (medium — distributor pages; our G80 roller-bearing
 * swivel listing). Rating not chain-equivalent: 1/2″ 3,600 lb, 1″ 12,500 lb in our G-401 table.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-swivels-explained',
  title: 'Lifting swivels explained: positioning swivels, bearing swivels and swivel hooks',
  excerpt:
    'A swivel stops rigging twisting, but most swivels are not designed to turn while they carry the load. Regular eye and jaw swivels, bearing swivels that are built to rotate under load, swivel hooks of both kinds, and why a swivel is chosen by its rating, not by the size stamped on it.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting Swivels Explained: Rotating Under Load or Not',
  seoDescription:
    'Rigging and lifting swivels compared: regular eye-and-eye and jaw-end swivels as positioning devices, bearing swivels that rotate under load, swivel hooks, ratings by size, and how to choose and use them.',
  focusKeyword: 'lifting swivel',
  publishedAt: '2026-10-14T10:46:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Regular swivels — eye and eye, jaw and eye, jaw and jaw — are positioning devices, not designed to rotate under load.',
        'Bearing swivels have a thrust bearing and are made to rotate while carrying the load.',
        'Swivel hooks come in both kinds; only those designed for it may be turned under load.',
        'Choose a swivel by its WLL, not its nominal size — the size does not match chain of the same size.',
        'A swivel is one more component in the load path, with its own rating and inspection.',
      ],
    },
    {
      type: 'lead',
      html: 'Rigging twists. Chain kinks, wire rope and lines spin out, and a load that turns slowly in the wind winds its slings. A swivel lets one side turn freely relative to the other. What matters is whether it is meant to turn while the load hangs on it — because the common forged swivels are not. For swivel lifting points bolted to the load, see <a href="/blog/pad-eye-vs-swivel-lifting-point">lifting points compared</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Two kinds of swivel.', anchor: 'kinds' },
    {
      type: 'comparison_table',
      caption: 'Positioning swivels vs bearing swivels',
      columns: ['Type', 'Rotates under load?', 'Use'],
      rows: [
        { cells: ['Regular swivel (eye and eye, jaw and eye, G-401/402/403 pattern)', 'No — positioning device', 'Letting rigging untwist and align before the lift; mooring and chain lines'], highlight: true },
        { cells: ['Bearing swivel (roller or ball thrust bearing)', 'Yes, as rated', 'Loads that must be turned while suspended'] },
        { cells: ['Swivel hook, plain', 'Not under load, per its maker', 'Aligning the hook to the load before lifting'] },
        { cells: ['Swivel hook, bearing', 'Only where the maker states it', 'Turning loads on the hook'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Can a lifting swivel rotate under load?',
      answer:
        'Only a swivel designed for it. Regular forged swivels — eye and eye, jaw and eye — are positioning devices that let rigging untwist; makers state they are not intended to rotate under load. Bearing swivels and some bearing swivel hooks are built to rotate under load, within their rating.',
    },

    { type: 'section_head', number: '/02', title: 'Rating is not size.', anchor: 'rating' },
    {
      type: 'paragraph',
      html: 'Swivels are sold by nominal size, but that size is not the size of chain they match. In our G-401 pattern chain swivel table, the 1/2″ swivel is rated 3,600 lb (about 1.6 t) and the 1″ swivel 12,500 lb (about 5.7 t) — below the chain of those sizes. Choose the swivel by its WLL against the load, then check it fits the shackle, link or hook either side. One maker designs its regular swivels to a 5:1 design factor; our Grade 80 roller-bearing lifting swivel is rated 3.15 t and 5.3 t.',
    },

    { type: 'section_head', number: '/03', title: 'Using swivels.', anchor: 'use' },
    {
      type: 'prose',
      html: '<ul><li>Load a swivel in line — never side-load it.</li><li>Check it turns freely before the lift; a seized swivel is a twisted sling waiting to happen.</li><li>Inspect the shank, the eyes or jaws and, for bearing swivels, the bearing for wear and play.</li><li>Remove from service on the same criteria as other hardware — see <a href="/blog/asme-b30-26-rigging-hardware-explained">ASME B30.26 explained</a>.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Don’t turn a load on a plain swivel.',
      body: 'If the load must be rotated while suspended, use a bearing swivel or bearing swivel hook rated for rotation under load. Turning a loaded positioning swivel wears and can damage it.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a rigging swivel used for?', answer: 'To let rigging untwist and align, so chain, rope or slings do not kink or wind up.' },
        { question: 'What is the difference between a jaw end swivel and a regular swivel?', answer: 'A jaw end swivel has a pinned jaw at one end instead of an eye; both are positioning swivels, not designed to rotate under load.' },
        { question: 'Is a 1/2 inch swivel rated for 1/2 inch chain?', answer: 'No — swivel ratings do not follow chain size. Check the swivel’s own WLL.' },
        { question: 'Can I rotate a load on a swivel hook?', answer: 'Only if the hook is designed and marked for rotation under load, usually with a bearing.' },
        { question: 'Are stainless swivels available?', answer: 'Yes, in eye-and-jaw, regular and jaw-end patterns, for marine and corrosive service.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Swivels and swivel hooks',
      skus: ['IH-LR-RL-G401', 'IH-LR-RL-RS', 'IH-LR-RL-JES', 'IH-LR-RL-80LSRB', 'IH-LR-G8-SLHLKNKBB', 'IH-LR-HK-322L', 'IH-LR-RL-SSJESG403'],
    },
    {
      type: 'category_link',
      slug: 'master-links-rings-swivels',
      label: 'Master links, rings and swivels',
      blurb: 'Master links, rings, regular and bearing swivels.',
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
      slugs: ['pad-eye-vs-swivel-lifting-point', 'lifting-hook-types', 'asme-b30-26-rigging-hardware-explained', 'master-links-explained', 'snatch-block-vs-pulley-block', 'how-to-rig-a-shackle-correctly'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Swivel ratings from the live Indus tables; rotation-under-load guidance and design factor from a maker’s published warnings.',
    },
    {
      type: 'cta_block',
      heading: 'Need a swivel for the lift?',
      body: 'Tell us the load and whether it must turn while suspended. We will quote the right swivel, with its certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
