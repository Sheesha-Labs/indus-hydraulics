import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'bulk-hose-or-finished-assemblies',
  title: 'Bulk hose by the metre, or finished assemblies?',
  excerpt:
    'Buying hose on a reel and crimping your own looks cheaper and sometimes is. The decision turns on whether you can state a crimp diameter and prove you hit it.',
  categorySlug: 'procurement-export',
  authorSlug: 'sunil-patel',
  seoTitle: 'Bulk hydraulic hose or finished assemblies — which to buy',
  seoDescription:
    'When to buy hydraulic hose by the metre and crimp in-house, when to buy finished assemblies, and what in-house crimping actually requires beyond a machine.',
  focusKeyword: 'hydraulic hose per meter',
  publishedAt: '2026-08-24T15:18:45.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Crimping in-house needs a machine, the right dies, the crimp specifications, and callipers to verify — not just the machine.',
        'The crimp specification is per hose-and-ferrule combination and comes from the fitting manufacturer.',
        'Bulk covers far more part numbers per unit of stock and ages better on the shelf.',
        'Finished assemblies come with a test record, which matters on lifting, access and certified equipment.',
        'Most fleets end up doing both, and the split is by consequence rather than by cost.',
      ],
    },
    {
      type: 'lead',
      html: 'The arithmetic on buying bulk looks compelling: hose is cheap by the metre, fittings are cheap in a box, and a crimper pays for itself in a year. The arithmetic is usually right. What it leaves out is that a crimp is a measured dimension, and owning a press is not the same as being able to state one.',
    },

    { type: 'section_head', number: '/01', title: 'What in-house crimping actually requires.', anchor: 'requires' },
    {
      type: 'comparison_table',
      caption: 'Four things, and the machine is only one',
      columns: ['Requirement', 'Why'],
      rows: [
        { cells: ['The press', 'The obvious one, and the one people budget for'] },
        { cells: ['The correct dies for each combination', 'Die, ferrule and hose are a matched set'] },
        { cells: ['The published crimp diameter for each combination', 'From the fitting manufacturer — not a machine setting'], highlight: true },
        { cells: ['Callipers, and the habit of using them', 'A crimp is verified after pressing, every time'], highlight: true },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A machine setting is not a crimp specification.',
      body: 'Crimpers are set by die and by a scale, and the same setting on the same die produces a different finished diameter on a different hose construction. The specification is the finished outside diameter, published per hose-and-ferrule combination and measured after the press releases. A workshop that crimps by machine setting alone is producing assemblies whose rating nobody can state.',
    },
    {
      type: 'direct_answer',
      question: 'Should we buy hydraulic hose by the metre and crimp our own?',
      answer:
        'It makes sense where you have the dies, the published crimp diameters for the combinations you build, and the habit of verifying each crimp with callipers. Bulk covers far more part numbers per unit of stock and ages better. Where assemblies need a test record — lifting, access, certified equipment — buy them finished.',
    },

    { type: 'section_head', number: '/02', title: 'What each form is good at.', anchor: 'each-form' },
    {
      type: 'comparison_table',
      caption: 'Honest comparison',
      columns: ['Property', 'Bulk + fittings', 'Finished assemblies'],
      rows: [
        { cells: ['Coverage per unit of stock', 'High — any length, many combinations', 'One part number each'], highlight: true },
        { cells: ['Shelf ageing', 'Better — gentler strain, no fittings to corrode', 'Worse — coiled, with fittings'] },
        { cells: ['Time to fit when a machine stops', 'Minutes plus a crimp', 'Minutes'] },
        { cells: ['Test record', 'Only if you test', 'Supplied with the assembly'], highlight: true },
        { cells: ['Skill required on site', 'Real', 'None beyond fitting'] },
        { cells: ['Cost per assembly', 'Lower once volume justifies the kit', 'Higher per unit'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'The split most fleets land on.', anchor: 'the-split' },
    {
      type: 'paragraph',
      html: 'Bulk for the everyday work — general circuits, common bores, standard ends, where a hose is a hose and the workshop can build one in twenty minutes. <strong>Finished and certified for anything where a failure has a consequence beyond downtime</strong>: cranes, access platforms, anything inside an inspection regime, anything a competent person will ask about.',
    },
    {
      type: 'paragraph',
      html: 'That split is about consequence, not cost. It happens to be roughly what most well-run fleets converge on, and the reasoning is worth being explicit about rather than arriving at by habit.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'By the metre, or built and tested.' },
    { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Matched to construction — skive and no-skive.' },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'The other half of a bulk stocking policy.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Will you supply crimp specifications for hose we buy from you?', answer: 'Yes. If you are crimping our hose onto our ferrules, ask and we will give you the published crimp diameter for each combination. You should not be guessing it and we should not be leaving you to.' },
        { question: 'Can we crimp your ferrules onto another brand’s hose?', answer: 'The crimp specification is defined for a specific hose-and-ferrule combination, so mixing them means nobody can state the correct diameter. We would rather supply both sides than have you build assemblies with no defined specification.' },
        { question: 'Do we need to proof test what we build?', answer: 'For general circuits it is good practice. For lifting, access and anything within an inspection regime, treat it as necessary — and if you cannot test, buy those assemblies finished.' },
        { question: 'Is a crimper worth it for a small fleet?', answer: 'It depends on volume and on how far you are from a workshop. For a site four hours out, often yes. For a yard in Dubai, frequently not.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Guidance from our own build practice. Crimp diameters are per hose-and-ferrule combination and come from the fitting manufacturer.',
    },
    { type: 'cta_block', heading: 'Weighing up crimping in-house?', body: 'Tell us your volume and your machines and we will give you an honest view — including when the answer is that it is not worth it for you.', quoteLabel: 'Ask about bulk supply' },
  ],
}

export default ARTICLE
