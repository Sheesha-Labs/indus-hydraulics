import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'what-to-send-for-a-hose-quote',
  title: 'What to send when you ask for a hose quote',
  excerpt:
    'Most quote requests come back with a question rather than a price, and it is nearly always the same handful of missing details. Here is what to include so the first reply is a number.',
  categorySlug: 'procurement-export',
  authorSlug: 'sunil-patel',
  seoTitle: 'Hydraulic hose quote — what information to send',
  seoDescription:
    'The details that let a hose supplier quote first time: bore, length, both ends, grade and quantity. What each one settles, and how to send them when you only have the old hose.',
  focusKeyword: 'hydraulic hose quote uae',
  publishedAt: '2026-08-24T15:18:41.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Five items cover almost every assembly: bore and grade, overall length, both end types, elbow orientation, and quantity.',
        'Overall length means sealing face to sealing face — not the length of rubber.',
        'Both ends need stating separately, even when they are identical.',
        'Elbow orientation is the most commonly omitted detail and the most common cause of a remake.',
        'If you have the old hose, photographs of the layline and both ends replace nearly all of the above.',
      ],
    },
    {
      type: 'lead',
      html: 'A hose quote is a simple thing to price and a surprisingly easy thing to under-specify. The difference between a same-day answer and three days of email is usually one line of missing information — and it is the same line most of the time.',
    },

    { type: 'section_head', number: '/01', title: 'The five items.', anchor: 'five-items' },
    {
      type: 'comparison_table',
      caption: 'What each one settles',
      columns: ['Item', 'What it settles', 'If you omit it'],
      rows: [
        { cells: ['Bore and grade', 'Which hose, and whether it suits the pressure', 'We have to ask, or guess and be wrong'] },
        { cells: ['Overall length, face to face', 'The dimension the machine imposes', 'Cut length cannot be derived'], highlight: true },
        { cells: ['End types, both ends', 'Which fittings, and therefore the ferrules', 'Nothing can be quoted at all'] },
        { cells: ['Elbow angle and orientation', 'Whether the assembly will route', 'It gets built straight and comes back'], highlight: true },
        { cells: ['Quantity', 'Pricing, and whether to batch the build', 'Priced as one-off'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: '"Same both ends" is worth writing down.',
      body: 'When both ends really are identical, saying so explicitly is faster than leaving it to be inferred — because the alternative reading is that you only told us about one end. It costs three words and removes a round trip.',
    },

    { type: 'section_head', number: '/02', title: 'If you have the old hose, send photographs instead.', anchor: 'photographs' },
    {
      type: 'paragraph',
      html: 'A failed assembly carries most of its own specification. <strong>Three photographs replace nearly the whole list above</strong>: one along the layline, one of each fitting end. Add the overall length measured with the hose lying straight and relaxed, and that is a complete request.',
    },
    {
      type: 'comparison_table',
      caption: 'What each photograph gives us',
      columns: ['Photograph', 'What we read from it'],
      rows: [
        { cells: ['Along the layline', 'Grade, size, standard, often the pressure rating'] },
        { cells: ['Each fitting end, square on', 'Thread family, seat type, gender'] },
        { cells: ['The hose lying straight, next to a tape', 'Overall length and elbow orientation together'], highlight: true },
        { cells: ['The routing on the machine, before removal', 'Why it failed — which changes what we recommend'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What information does a hydraulic hose supplier need to quote?',
      answer:
        'Bore and grade, overall length from sealing face to sealing face, the fitting type at each end, the angle between the ends if either is an elbow, and the quantity. If you have the old hose, photographs of the layline and both fitting ends plus the measured length replace nearly all of it.',
    },

    { type: 'section_head', number: '/03', title: 'Things worth adding when they apply.', anchor: 'worth-adding' },
    {
      type: 'comparison_table',
      caption: 'Not always needed, occasionally decisive',
      columns: ['Detail', 'When it matters'],
      rows: [
        { cells: ['Working pressure', 'Always worth stating — it confirms the grade rather than copying what was there'] },
        { cells: ['Fluid and temperature', 'Anything other than mineral oil, or anything running hot'] },
        { cells: ['Machine and circuit', 'Lets us sanity-check the specification against the duty'] },
        { cells: ['Test certificate required', 'Lifting equipment, access equipment, anything with an inspection regime'], highlight: true },
        { cells: ['This position has failed before', 'Changes what we recommend — a repeat is a routing problem'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Copying what was there reproduces a wrong specification.',
      body: 'If the previous assembly was under-specified, matching it perfectly gives you the same early failure. Stating the working pressure lets the specification be checked rather than inherited — which is the whole value of asking a supplier rather than a catalogue.',
    },
    { type: 'category_link', slug: 'hydraulic-hoses', label: 'Hydraulic hose by grade', blurb: 'Assemblies built same day for stocked grades.' },
    { type: 'category_link', slug: 'hydraulic-fittings', label: 'Hose fittings by thread type', blurb: 'Every family, with dimension tables.' },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I just send the old hose?', answer: 'Yes, and it is the most reliable option. Send it lying straight rather than coiled tight if you can, and tell us which machine it came off.' },
        { question: 'I do not know the grade. Is that a problem?', answer: 'No, provided we can see the layline or the cut end. Failing both, tell us the working pressure and the bore and we will specify rather than match.' },
        { question: 'How do I describe a fitting I cannot identify?', answer: 'Photograph the end face square on and measure the thread diameter and pitch. The seat is what a photograph settles, and the seat is what distinguishes families that share a thread.' },
        { question: 'Do you quote for quantities, or only one-offs?', answer: 'Both. Tell us the quantity up front — batching a build changes the price and the lead time.' },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Based on what our own quotations desk has to ask for when it is missing.',
    },
    { type: 'cta_block', heading: 'Send it however you have it.', body: 'A list, a photograph, or the old hose in a bag. If something is missing we will tell you exactly what — but most requests with photographs get priced first time.', quoteLabel: 'Request a quote' },
  ],
}

export default ARTICLE
