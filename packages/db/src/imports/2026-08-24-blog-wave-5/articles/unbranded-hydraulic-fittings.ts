import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'unbranded-hydraulic-fittings',
  title: 'Unmarked fittings and untraceable hose: what you are actually buying',
  excerpt:
    'The problem with an unbranded fitting is not that it is cheap. It is that nobody can tell you its crimp specification, its material or its pressure rating — so the assembly built from it has no stated rating at all.',
  categorySlug: 'procurement-export',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Unbranded hydraulic fittings — traceability, crimp specs and risk',
  seoDescription:
    'Why unmarked hydraulic fittings and untraceable hose are a specification problem rather than a quality one, what questions to ask a supplier, and what to look for on delivery.',
  focusKeyword: 'unbranded hydraulic fittings',
  publishedAt: '2026-08-28T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An unmarked fitting may be perfectly good. The problem is that nobody can demonstrate it, including the seller.',
        'Without a known hose-and-ferrule combination there is no published crimp diameter, so the assembly has no stated rating.',
        'Material matters and is invisible — plating, base steel and stainless grade cannot be judged by eye.',
        'The failure usually appears at the crimp or the seat, weeks or months later, on a machine.',
        'Ask three questions: who made it, what is the crimp specification, and what does the certificate say.',
      ],
    },
    {
      type: 'lead',
      html: 'This is not an argument that cheap fittings are bad fittings. Plenty of perfectly sound hydraulic hardware is made by companies nobody in this region has heard of. The argument is narrower and harder to answer: <strong>if you cannot say who made it, you cannot state what the assembly built from it is rated to.</strong>',
    },

    { type: 'section_head', number: '/01', title: 'The crimp problem.', anchor: 'crimp-problem' },
    {
      type: 'paragraph',
      html: 'A crimp is a finished outside diameter, published by the fitting manufacturer for a specific combination of hose construction and ferrule. It is the number that makes the assembly a rated component rather than a hopeful one.',
    },
    {
      type: 'paragraph',
      html: 'An unmarked ferrule has no published anything. It can be crimped — it will grip, it will hold on a test — but <strong>the workshop cannot state the diameter it should have reached, so it cannot verify that it did.</strong> The assembly leaves with a pressure rating that is an assumption.',
    },
    {
      type: 'direct_answer',
      question: 'Are unbranded hydraulic fittings safe?',
      answer:
        'Some are perfectly sound and some are not, and the real problem is that you cannot tell which. Without a known manufacturer there is no published crimp specification for the hose-and-ferrule combination, no material certificate and no pressure rating that can be stated — so the assembly built from it has no verified rating, whatever it holds on a test.',
    },

    { type: 'section_head', number: '/02', title: 'What is invisible.', anchor: 'invisible' },
    {
      type: 'comparison_table',
      caption: 'Things you cannot judge by looking',
      columns: ['Property', 'Why it matters', 'Visible?'],
      rows: [
        { cells: ['Crimp specification', 'Defines whether the assembly is rated', 'No'], highlight: true },
        { cells: ['Base material and heat treatment', 'Strength, and behaviour at pressure', 'No'] },
        { cells: ['Plating type and thickness', 'Corrosion life, especially coastal', 'Partly — and misleadingly'] },
        { cells: ['Stainless grade', '316 and 304 look identical and behave differently in salt', 'No'], highlight: true },
        { cells: ['Thread tolerance', 'Whether it seats correctly or merely engages', 'No'] },
        { cells: ['Ferrule length and profile', 'Whether it matches the hose reinforcement', 'Partly'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A fitting that assembles is not a fitting that is right.',
      body: 'Everything in the list above is compatible with a part that threads together smoothly and passes a proof test. That is precisely why this is a specification problem rather than a quality-control one — the check that would catch it is not one you can perform on delivery.',
    },

    { type: 'section_head', number: '/03', title: 'Three questions to ask.', anchor: 'three-questions' },
    {
      type: 'decision_tree',
      heading: 'Of any supplier, including us',
      intro: 'None is unreasonable and all three have specific answers.',
      branches: [
        { condition: 'Who manufactured this?', outcome: 'A name, not a country.', detail: '"Imported" is not a manufacturer. A supplier who cannot name the maker cannot obtain a specification from them either.' },
        { condition: 'What is the crimp diameter for this hose and ferrule?', outcome: 'A number, in millimetres, from the manufacturer.', detail: 'If the answer is a machine setting rather than a finished diameter, that is the wrong answer.' },
        { condition: 'What does the certificate state?', outcome: 'What was tested, at what pressure, on what.', detail: 'A generic statement of conformity is not a test record for your assembly.' },
        { condition: 'Any of the three cannot be answered', outcome: 'You are buying hardware, not a rated assembly.', detail: 'That may be acceptable on a low-consequence circuit. It is not acceptable on lifting, access or anything within an inspection regime.' },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Where this genuinely does not matter much.',
      body: 'A low-pressure return line on a yard machine is not the same risk as a crane hoist circuit. Being clear-eyed about that is more useful than a blanket rule — the point is to make the trade deliberately rather than discovering later that it was made for you by whoever was cheapest.',
    },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Traceable, with published crimp specifications.' },
    { type: 'category_link', slug: 'crimp-ferrules', label: 'Crimp ferrules', blurb: 'Matched to the constructions we supply.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How can I tell a stainless fitting is really 316?', answer: 'Not by eye, and not reliably by a magnet. It comes from the material certificate, which is why traceability is the whole answer to this question rather than an inspection technique.' },
        { question: 'We have been using unmarked fittings for years without problems. Is that evidence?', answer: 'It is evidence that they have held, which is worth something. It is not evidence of a rating, and it does not transfer to the next batch from the same source — which may be from a different factory entirely.' },
        { question: 'Do you supply the crimp specification with your fittings?', answer: 'Yes. Ask and you will get the published crimp diameter for the combination. If you are crimping in-house you should have it, and we should not be leaving you to guess.' },
        { question: 'Is a brand name enough on its own?', answer: 'No — counterfeits of known brands exist. What matters is a supply chain you can trace and a supplier who can produce the specification, which is a different question from what is stamped on the hex.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'General guidance. No claims are made here about any specific manufacturer or supplier.',
    },
    { type: 'cta_block', heading: 'Not sure what is on your shelf?', body: 'Send photographs of what you are holding. We will tell you what we can identify, what we cannot, and where it matters enough to replace.', quoteLabel: 'Ask about traceability' },
  ],
}

export default ARTICLE
