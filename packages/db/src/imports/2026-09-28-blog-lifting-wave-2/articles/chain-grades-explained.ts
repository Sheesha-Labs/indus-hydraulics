import type { BlogArticleSeed } from '../shared'

/**
 * Chain grades — Grade 30 to Grade 100, and the overhead-lifting line.
 *
 * The 3/8″ (10 mm) comparison is read from the live variants on 2026-09-28:
 * NACM inch tables for Grades 30, 43 and 70, and our 10 mm Grade 80 and
 * Grade 100 alloy lifting chain. Every design factor in the table is computed
 * from those rows, not assumed — which is how the 3:1 on Grade 43 surfaced.
 *
 * The "not for overhead lifting" statement for Grades 30, 43 and 70 is the
 * rule every lifting page on the site already carries.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'chain-grades-explained',
  title: 'Chain grades explained: Grade 30, 43, 70, 80 and 100, and which can lift overhead',
  excerpt:
    'Chain grade is a statement about the steel, and it decides two things: how much a given size carries, and whether it may be used overhead at all. Grades 30, 43 and 70 are for tie-down and towing. Only alloy Grade 80 and Grade 100 are lifting chain. Here is the whole ladder, with figures from our own tables.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Chain grades explained: Grade 30, 43, 70, 80 and 100 compared',
  seoDescription:
    'What chain grades mean, how Grade 30, 43, 70, 80 and 100 chain compare at the same size, and why only alloy Grade 80 and 100 may be used for overhead lifting.',
  focusKeyword: 'chain grades explained',
  publishedAt: '2026-09-28T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Only alloy chain — Grade 80 and Grade 100 — is made for overhead lifting. Grades 30, 43 and 70 are for tie-down, towing and general use.',
        'The grade describes the steel’s strength. At 3/8″ (10 mm), WLL in our tables climbs from 1,200 kg in Grade 30 to 4,000 kg in Grade 100.',
        'Grade 43 is rated at 3:1 on breaking load; the others at 4:1. That is a transport-chain convention, and one more reason a transport chain is not a sling.',
        'Transport chain to AS/NZS 4344 is rated by lashing capacity, which is half its breaking load. Lashing capacity is not a lifting WLL.',
        'Identify a chain by the grade mark embossed on its links, not by its colour. Colours are manufacturers’ conventions, not a standard.',
      ],
    },
    {
      type: 'lead',
      html: 'Two chains of the same size can look identical and differ in strength by a factor of three. One may be rated to lift a load over people, and the other may not. The difference is the grade, and it is stamped on the links for a reason.',
    },

    { type: 'section_head', number: '/01', title: 'What a grade is.', anchor: 'what-a-grade-is' },
    {
      type: 'paragraph',
      html: 'A chain grade is a statement about the strength of the steel the links are made from. For alloy lifting chain the number is tied to the breaking stress: Grade 80 chain is designed to break at a mean stress of about 800 N/mm² in the link, and Grade 100 at about 1,000 N/mm². A higher grade therefore carries more at the same size, or the same load at a smaller and lighter size.',
    },
    {
      type: 'paragraph',
      html: 'Grades 30, 43 and 70 are the North American carbon-steel grades, published by the National Association of Chain Manufacturers (NACM). They are sold as proof coil, high test and transport chain. They are made for lashing, towing, logging, fencing and general use, and they are <strong>not for overhead lifting</strong>.',
    },
    {
      type: 'direct_answer',
      question: 'Which chain grades can be used for overhead lifting?',
      answer:
        'Alloy chain only: Grade 80 and Grade 100 (and higher alloy grades from some makers), used as a chain sling or in a hoist with fittings of the same grade. Grade 30 proof coil, Grade 43 high test and Grade 70 transport chain are not for overhead lifting, whatever their breaking load.',
    },

    { type: 'section_head', number: '/02', title: 'The ladder, at one size.', anchor: 'the-ladder' },
    {
      type: 'paragraph',
      html: 'Here is every grade at 3/8″ (10 mm), from the size tables on our product pages. The design factor column is breaking load divided by WLL, worked out from those rows.',
    },
    {
      type: 'comparison_table',
      caption: 'Chain grades at 3/8″ (10 mm), from our tables',
      columns: ['Grade', 'Sold as', 'WLL', 'Breaking load', 'Factor', 'Overhead lifting'],
      rows: [
        { cells: ['30', 'Proof coil', '1,200 kg', '47.2 kN', '4:1', 'No'] },
        { cells: ['43', 'High test', '2,450 kg', '72.1 kN', '3:1', 'No'] },
        { cells: ['70', 'Transport, binder chain', '3,000 kg', '117.4 kN', '4:1', 'No'] },
        { cells: ['80', 'Alloy lifting chain', '3,200 kg', '126 kN', '4:1', 'Yes'], highlight: true },
        { cells: ['100', 'Alloy lifting chain', '4,000 kg', '157 kN', '4:1', 'Yes'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two things stand out. Grade 70 transport chain breaks at nearly the same load as Grade 80 at this size — and it is still not lifting chain. And Grade 43 is rated at only 3:1. Breaking strength is not what separates lifting chain from the rest.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Strength is not what makes a chain lifting chain.',
      body: 'Alloy lifting chain is quenched and tempered for toughness, so it stretches visibly before it breaks. It is made and proof-tested to a lifting standard, it has a matching system of Grade 80 or Grade 100 hooks, links and connectors, and it has inspection criteria to go with it. Carbon-steel grades have none of that, however close their breaking load. Never lift overhead on Grade 30, 43 or 70.',
    },

    { type: 'section_head', number: '/03', title: 'Each grade, and what it is for.', anchor: 'each-grade' },
    {
      type: 'prose',
      html: '<h3>Grade 30 — proof coil</h3><p>Low-carbon steel, the cheapest and weakest grade. Used for barriers, light towing, farm work and general fixing. Every length is proof-tested, which is where the name comes from — not because it is rated for anything demanding.</p><h3>Grade 43 — high test</h3><p>Higher-carbon steel, about twice the WLL of Grade 30 at the same size. Used in towing, logging and some tie-down work. Its 3:1 rating on breaking load is lower than the other grades here.</p><h3>Grade 70 — transport chain</h3><p>Heat-treated carbon steel, usually finished in yellow chromate. This is the chain in truck load binders: it lashes loads to trailers. It is strong, but it is made for load restraint, not lifting.</p><h3>Grade 80 — alloy lifting chain</h3><p>Quenched and tempered alloy steel, and the long-standing standard for chain slings. It is used with Grade 80 master links, hooks and connectors so that the whole sling carries one rating. In Europe it is specified to EN 818-2, and made into slings to EN 818-4.</p><h3>Grade 100 — alloy lifting chain</h3><p>A higher-strength alloy that carries about 25% more than Grade 80 at the same size. That buys a lighter sling for the same load, which matters for riggers handling large slings by hand. It needs Grade 100 fittings; Grade 80 fittings on Grade 100 chain limit the whole sling to Grade 80.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Transport chain is rated differently.', anchor: 'lashing-capacity' },
    {
      type: 'paragraph',
      html: 'Load-restraint chain is often rated in <strong>lashing capacity</strong> (LC) rather than WLL. Our Grade 70 chain to AS/NZS 4344 at 10 mm has a lashing capacity of 6,000 kg and a breaking load of 118 kN — so the LC is half the breaking load. That is a sensible margin for holding a load against a moving trailer. It is far too thin for lifting, and it is why an LC figure must never be read as a WLL.',
    },
    {
      type: 'paragraph',
      html: 'The same logic runs through the hardware. Grade 70 binder chain, grab hooks and load binders are a lashing system. Grade 80 and 100 hooks, master links and connectors are a lifting system. Mixing the two produces a sling whose rating is set by its weakest part.',
    },

    { type: 'section_head', number: '/05', title: 'Other chain you will meet.', anchor: 'other-chain' },
    {
      type: 'prose',
      html: '<p>Several chains in the catalogue sit outside the grade ladder:</p><ul><li><strong>Hoist chain to EN 818-7</strong> is calibrated Grade 80 chain made to a tight pitch tolerance for the load wheel of a chain block. It is sold by size and pitch — our range runs from 3 × 9 mm to 22 × 66 mm — and it is not for making slings.</li><li><strong>DIN 766 calibrated chain</strong> is made to fit a windlass gypsy on boats and small vessels.</li><li><strong>DIN 763, DIN 764 and DIN 5685</strong> long- and short-link chains are general-purpose mild steel and stainless steel chain.</li><li><strong>Stainless steel chain</strong> is chosen for corrosion. It is rated well below alloy chain of the same size, and much of it carries no lifting rating at all.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Identifying a chain you already have.', anchor: 'identifying' },
    {
      type: 'paragraph',
      html: 'Look for the grade mark. Alloy lifting chain carries a grade mark and a manufacturer’s mark embossed on links at intervals along its length, and a chain sling carries a tag with its WLL. Grade 30, 43 and 70 chain is marked by grade in the same way under NACM practice.',
    },
    {
      type: 'paragraph',
      html: 'Do not identify chain by colour. Yellow chromate is common on Grade 70 and painted or powder-coated finishes on alloy grades, but these are makers’ conventions, not a standard. A chain with no legible grade mark, or a sling with no tag, is treated as unrated and does not lift.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a chain grade',
      intro: 'Start from what the chain will do, not from its size.',
      branches: [
        { condition: 'Lifting a load overhead, or as part of a sling', outcome: 'Grade 80 or Grade 100 alloy chain, with fittings of the same grade.', detail: 'Choose Grade 100 where sling weight matters; the fittings must match.' },
        { condition: 'Holding a load down on a vehicle', outcome: 'Grade 70 transport chain with load binders, rated in lashing capacity.' },
        { condition: 'Towing, logging or general pulling', outcome: 'Grade 43 or Grade 70, sized on their WLL.' },
        { condition: 'Barriers, fencing or light fixing', outcome: 'Grade 30 proof coil or general-purpose DIN chain.' },
        { condition: 'Running over a chain block load wheel', outcome: 'Calibrated hoist chain to EN 818-7, matched to the block’s pitch.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'The chains in this guide',
      skus: [
        'IH-LR-CH-G30A',
        'IH-LR-CH-G43A',
        'IH-LR-CH-G70A',
        'IH-LR-CH-G80',
        'IH-LR-CH-G100',
        'IH-LR-CH-80HCE8187',
        'IH-LR-CH-70CASN434',
        'IH-LR-CH-BCH4370',
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Can I lift with Grade 70 chain?',
          answer:
            'No. Grade 70 is transport chain, made for tie-down. At 3/8″ its breaking load is close to Grade 80’s, but it is not made, tested or supported by fittings to a lifting standard. Use Grade 80 or Grade 100 alloy chain for any overhead lift.',
        },
        {
          question: 'What is the difference between Grade 80 and Grade 100 chain?',
          answer:
            'Grade 100 is a stronger alloy that carries about 25% more at the same size — 4,000 kg against 3,200 kg at 10 mm in our tables. Both are lifting chain at 4:1. Grade 100 chain needs Grade 100 fittings to keep its rating.',
        },
        {
          question: 'Can I mix Grade 80 and Grade 100 components in one sling?',
          answer:
            'The sling is then rated as the lowest grade in it, and the tag must say so. Most sites avoid mixing grades so that a Grade 100 tag can always be trusted.',
        },
        {
          question: 'Why is proof coil called proof coil?',
          answer:
            'Because every length is proof-tested before sale and it was traditionally sold in coils. The name says nothing about its fitness for lifting, and it is not lifting chain.',
        },
        {
          question: 'How do I tell what grade a chain is?',
          answer:
            'Read the grade mark embossed on the links, and the tag on a sling. Do not go by colour. If there is no legible mark, treat the chain as unrated.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'alloy-lifting-chain',
      label: 'Alloy lifting chain, Grade 80 and 100',
      blurb: 'WLL, breaking and proof-load tables for every size.',
    },
    {
      type: 'category_link',
      slug: 'commercial-transport-chain',
      label: 'Commercial and transport chain',
      blurb: 'Grade 30, 43 and 70 chain, binder chain and connecting links.',
    },
    {
      type: 'category_link',
      slug: 'grade-80-chain-fittings',
      label: 'Grade 80 chain fittings',
      blurb: 'Master links, hooks and connectors for building a Grade 80 chain sling.',
    },
    {
      type: 'related_articles',
      slugs: ['working-load-limit-vs-breaking-strength', 'sling-angle-chart', 'types-of-shackles', 'wire-rope-construction-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-28',
      note: 'WLL and breaking loads are taken from the size tables on the linked product pages. Design factors are calculated from those figures.',
    },
    {
      type: 'cta_block',
      heading: 'Building a chain sling?',
      body: 'Tell us the load, the number of legs and the headroom. We will quote Grade 80 or Grade 100 chain and fittings to suit, with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
