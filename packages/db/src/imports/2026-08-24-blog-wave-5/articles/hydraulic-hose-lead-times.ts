import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-hose-lead-times',
  title: 'Stock, made-to-order, or imported: what sets the lead time',
  excerpt:
    'Three quite different situations get described as "lead time", and they differ by orders of magnitude. Knowing which one you are in is what lets you plan rather than chase.',
  categorySlug: 'procurement-export',
  authorSlug: 'sunil-patel',
  seoTitle: 'Hydraulic hose lead time in the UAE — stock against imported',
  seoDescription:
    'What determines hydraulic hose lead times: stocked grades built same day, made-to-order assemblies, and imported specials. How to tell which category a request falls into.',
  focusKeyword: 'hydraulic hose lead time uae',
  publishedAt: '2026-08-24T15:18:44.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Three categories: built from stock, made to order from stocked components, and imported. They are not close to each other.',
        'Most standard hydraulic assemblies fall into the first category — the components are on the shelf and the build is the work.',
        'What pushes a request into importing is usually a fitting or a material, not the hose.',
        'Certification requirements can add time even when everything is in stock.',
        'Asking which category you are in is more useful than asking how many days.',
      ],
    },
    {
      type: 'lead',
      html: 'The question is almost always "how long", and the honest answer starts by establishing which of three quite different situations the request is in — because the gap between them is not days, it is categories.',
    },

    { type: 'section_head', number: '/01', title: 'The three categories.', anchor: 'three-categories' },
    {
      type: 'comparison_table',
      caption: 'What determines which one you are in',
      columns: ['Category', 'What it means', 'What puts you here'],
      rows: [
        { cells: ['Built from stock', 'Hose and fittings on the shelf; the build is the work', 'Standard grades, common bores, common end types'], highlight: true },
        { cells: ['Made to order', 'Components stocked, but something needs sourcing or preparing', 'Less common fitting, stainless, an unusual combination'] },
        { cells: ['Imported', 'A component has to come in', 'Specials, unusual materials, non-standard constructions'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The useful insight is that <strong>the hose is rarely what pushes a request up a category.</strong> Standard constructions in common bores are stocked. What moves a job into sourcing is usually a fitting — an unusual thread, a stainless variant, a size at the edge of a range.',
    },
    {
      type: 'direct_answer',
      question: 'How long does a hydraulic hose assembly take?',
      answer:
        'It depends which of three categories the request falls into: built from stocked components, made to order where something needs sourcing, or imported where a component has to come in. Most standard assemblies are the first. What usually pushes a request up a category is a fitting rather than the hose.',
    },

    { type: 'section_head', number: '/02', title: 'Why there are no day counts on this page.', anchor: 'no-day-counts' },
    {
      type: 'callout',
      tone: 'note',
      title: 'A published lead time goes stale, and a stale one is worse than none.',
      body: 'Stock positions move, shipping moves, and a number written on a website in August is a liability in November. What does not go stale is the structure: which category a request is in, and what would move it down one. Ask us for the actual timing on the actual job and you will get a real answer rather than a page you cannot rely on.',
    },

    { type: 'section_head', number: '/03', title: 'Moving a job down a category.', anchor: 'moving-down' },
    {
      type: 'decision_tree',
      heading: 'Where there is flexibility',
      intro: 'Sometimes a request that looks like a wait is not one.',
      branches: [
        { condition: 'An unusual fitting is holding it up', outcome: 'Ask whether an adapter combination from stock achieves the same connection.', detail: 'More joints is a real trade-off, so this is a judgement rather than an automatic yes — but it can turn a wait into an afternoon.' },
        { condition: 'The grade specified is uncommon', outcome: 'Ask whether a stocked construction meets the same requirement at that bore.', detail: 'Compare at the bore, not on the designation. Often something stocked is equal or better.' },
        { condition: 'You need it certified', outcome: 'Say so at the quote stage, not at collection.', detail: 'Testing and documentation are quick when planned and awkward when they are a surprise.' },
        { condition: 'You will need it again', outcome: 'Talk about holding stock for you.', detail: 'The second time is the one worth planning for. Recurring specials are the strongest case for consignment.' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The emergency is usually the second failure, not the first.',
      body: 'A hose that fails once is bad luck. The same position failing again is predictable, and predictable things should not be emergencies. If you have had a machine down twice for the same assembly, that is the one to hold — or the one whose routing needs fixing.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Standard constructions stocked in Dubai.' },
    { type: 'category_link', slug: 'hydraulic-adapters', label: 'Adapters by family', blurb: 'Often the fastest route round an awkward connection.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can you build same day?', answer: 'For stocked grades and common end types, routinely. Tell us it is urgent when you ask rather than afterwards — it changes how the job is scheduled.' },
        { question: 'Do you come to site?', answer: 'Yes, across the UAE. For a machine that cannot be moved, that is usually faster than any workshop turnaround.' },
        { question: 'What if you do not stock what I need?', answer: 'We will tell you that plainly, say what it would take, and offer the stocked alternative if there is a genuine one. We would rather do that than quote a date we cannot hold.' },
        { question: 'Can you hold stock against our fleet?', answer: 'Yes. For customers with recurring requirements that is usually the arrangement that removes the lead-time question entirely.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'No lead times in days are published on this page — stock positions and shipping change. Ask for timing on the specific job.',
    },
    { type: 'cta_block', heading: 'Need to know how long?', body: 'Send the specification and we will tell you which category it is in and what the actual timing is — including when the answer is that we would not be the fastest option.', quoteLabel: 'Ask about timing' },
  ],
}

export default ARTICLE
