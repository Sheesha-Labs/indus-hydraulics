import type { BlogArticleSeed } from '../shared'

/**
 * Grade 80 vs Grade 100 chain slings — the buying decision (chain-grades-explained covers the
 * grade ladder). WLL and kg/m from the live Indus G80 and G100 chain tables. Checked 2026-10-14:
 * Grade 80 temperature bands 100/90/75 % to 200/300/400 °C (European maker data, high — not
 * attributed to EN 818); Grade 100 limits vary by maker, some 200 °C maximum (high); makers forbid
 * galvanising or plating alloy chain (three maker catalogues, high); OSHA 1910.184(e)(2) attachments
 * at least equal to chain, else rated to weakest (high); OSHA (e)(1) tag: size, grade, rated
 * capacity, reach (high). Grade marking "8"/"10" stated as common maker practice only.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'grade-80-vs-grade-100-chain-slings',
  title: 'Grade 80 vs Grade 100 chain slings: capacity, weight, heat and mixing components',
  excerpt:
    'Grade 100 chain carries about a quarter more than Grade 80 at the same size and weighs the same per metre — so for the same load it is a size smaller and much lighter. But Grade 80 tolerates more heat, and a sling with one Grade 80 part is a Grade 80 sling. How to choose between them, with our tables side by side.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Grade 80 vs Grade 100 Chain Slings: Which to Buy',
  seoDescription:
    'Grade 80 vs Grade 100 chain slings compared: WLL and weight per metre at each size, lighter slings for the same load, temperature limits, why alloy chain is never galvanised, and the rule for mixing Grade 80 and Grade 100 components.',
  focusKeyword: 'grade 80 vs grade 100 chain',
  publishedAt: '2026-10-14T10:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'At the same chain size, Grade 100 carries about 25% more than Grade 80 and weighs the same per metre.',
        'For the same load, Grade 100 is often a size smaller — a 4 t leg is 10 mm Grade 100 against 13 mm Grade 80, about 40% lighter.',
        'Grade 80 keeps more of its rating at high temperature; some makers do not permit Grade 100 above 200 °C.',
        'A sling is rated by its weakest component: one Grade 80 fitting makes a Grade 80 sling.',
        'Neither grade may be galvanised or plated after manufacture.',
      ],
    },
    {
      type: 'lead',
      html: 'Grade 80 and Grade 100 are both alloy lifting chain, built into slings with matching master links, connectors and hooks. Grade 100 is the stronger steel, so it does the same job with smaller, lighter chain — which matters when riggers carry slings up a structure or onto a roof. Grade 80 is the long-established workhorse, and more forgiving of heat. For the full grade ladder, from Grade 30 to Grade 100, see <a href="/blog/chain-grades-explained">chain grades explained</a>.',
    },

    { type: 'section_head', number: '/01', title: 'Side by side.', anchor: 'tables' },
    {
      type: 'comparison_table',
      caption: 'Single-leg WLL and weight per metre, from our Grade 80 and Grade 100 chain tables',
      columns: ['Chain size', 'Grade 80 WLL', 'Grade 100 WLL', 'Weight per metre'],
      rows: [
        { cells: ['6 mm', '1.15 t', '1.4 t', '0.8 kg'] },
        { cells: ['8 mm', '2.05 t', '2.5 t', '1.43 kg'] },
        { cells: ['10 mm', '3.2 t', '4 t', '2.2 kg'], highlight: true },
        { cells: ['13 mm', '5.4 t', '6.7 t', '3.7–3.8 kg'] },
        { cells: ['16 mm', '8.2 t', '10 t', '5.6–5.7 kg'] },
        { cells: ['22 mm', '15 t', '19 t', '10.8–10.9 kg'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between Grade 80 and Grade 100 chain?',
      answer:
        'Grade 100 is made from a stronger alloy steel, so at the same size it carries about 25% more than Grade 80 — for example 4 t against 3.2 t at 10 mm — at the same weight per metre. Grade 80 tolerates higher temperatures. Both are rated for overhead lifting, and a sling takes the rating of its weakest component.',
    },

    { type: 'section_head', number: '/02', title: 'Choose by the job.', anchor: 'choose' },
    {
      type: 'comparison_table',
      caption: 'When each grade fits',
      columns: ['Situation', 'Better choice', 'Why'],
      rows: [
        { cells: ['Slings carried by hand, at height or onto roofs', 'Grade 100', 'Same WLL in a smaller, lighter chain'] },
        { cells: ['Heavy multi-leg slings', 'Grade 100', 'Smaller chain and fittings for the same capacity'] },
        { cells: ['Hot work — near furnaces, hot plant, steel works', 'Grade 80', 'Keeps more of its rating at temperature; check the maker’s limits'] },
        { cells: ['Adding to or repairing an existing Grade 80 fleet', 'Either, rated as Grade 80', 'Mixed slings take the lower rating'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Heat.', anchor: 'heat' },
    {
      type: 'paragraph',
      html: 'European makers commonly rate Grade 80 slings at their full WLL up to 200 °C, 90% from 200 to 300 °C and 75% from 300 to 400 °C, and not for use above 400 °C. Grade 100 varies more by maker: some do not permit their Grade 100 slings above 200 °C at all; others derate from 200 °C. Some US makers publish different steps again. Use the derating table for the sling you actually have, and remember that a sling exposed to high heat may lose strength permanently — it needs examination before further use.',
    },

    { type: 'section_head', number: '/04', title: 'Mixing and marking.', anchor: 'mixing' },
    {
      type: 'paragraph',
      html: 'A chain sling is only as strong as its weakest part. US OSHA rules require attachments to be rated at least equal to the chain, or the sling is rated to the weakest component; makers say the same. Grade 100 fittings can be used to repair a Grade 80 sling, but the sling keeps its Grade 80 rating. Components are commonly marked with their grade (“8” or “10”), and every sling should carry a tag stating at least its size, grade, rated capacity and reach. See <a href="/blog/chain-sling-codes-explained">chain sling codes explained</a> and the <a href="/blog/chain-sling-capacity-chart">chain sling capacity chart</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never galvanise alloy chain.',
      body: 'Makers forbid hot-dip galvanising or plating Grade 80 and Grade 100 chain and fittings after manufacture: the process can damage the heat treatment or cause hydrogen embrittlement. Where corrosion is the problem, see stainless chain or a maker-applied finish.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is Grade 100 chain stronger than Grade 80?', answer: 'Yes. At the same size, Grade 100 carries about 25% more — for example 6.7 t against 5.4 t at 13 mm in our tables.' },
        { question: 'Can I use Grade 100 hooks on Grade 80 chain?', answer: 'Yes, if they fit the chain size, but the sling is rated as Grade 80.' },
        { question: 'Can Grade 100 chain be used at high temperature?', answer: 'Less than Grade 80. Some makers do not permit Grade 100 slings above 200 °C. Check the maker’s table.' },
        { question: 'Is Grade 100 chain heavier?', answer: 'No — the same weight per metre at the same size. For the same load it is usually lighter, because a smaller size is needed.' },
        { question: 'Can alloy chain slings be galvanised?', answer: 'No. Makers forbid galvanising or plating alloy lifting chain after manufacture.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Grade 80 and Grade 100 chain and slings',
      skus: ['IH-LR-CH-G100', 'IH-LR-CH-G80', 'IH-LR-CS-G100DOS', 'IH-LR-CS-G80DOS', 'IH-LR-G10-MLA', 'IH-LR-G10-ESHL', 'IH-LR-G10-CCE', 'IH-LR-G8-CLE'],
    },
    {
      type: 'category_link',
      slug: 'chain-slings',
      label: 'Chain slings',
      blurb: 'Grade 80 and Grade 100 chain slings in one to four legs, every hook type.',
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
      slugs: ['chain-grades-explained', 'chain-sling-capacity-chart', 'chain-sling-codes-explained', 'chain-sling-shortening-clutches-and-grab-hooks', 'hammerlock-vs-clevis-chain-fittings', 'master-links-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'WLL and weights from the live Indus Grade 80 and Grade 100 chain tables; temperature, galvanising and mixing rules from maker catalogues and US OSHA 1910.184.',
    },
    {
      type: 'cta_block',
      heading: 'Choosing a chain sling?',
      body: 'Send the load, the number of legs, the reach and the hooks you need. We will quote Grade 80 or Grade 100, with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
