import type { BlogArticleSeed } from '../shared'

/**
 * Procedural. No cut-off factors and no crimp diameters — both are per
 * fitting series and per manufacturer, and a wrong figure produces an
 * assembly that looks right and fails under pressure.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'getting-a-hydraulic-hose-made',
  title: 'Getting a hydraulic hose made: what to bring and what we measure',
  excerpt:
    'Bring the old hose if you have it. If you do not, four measurements and two photographs will get the assembly built correctly first time.',
  categorySlug: 'hose-assembly',
  authorSlug: 'mehul-rana',
  seoTitle: 'Getting a hydraulic hose made — what to bring, how it is measured',
  seoDescription:
    'What to bring when having a hydraulic hose assembly made: the measurements that matter, why overall length is not cut length, and what a test certificate shows.',
  focusKeyword: 'where to get hydraulic hoses made',
  publishedAt: '2026-08-17T09:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Bringing the failed assembly is worth more than any measurement you can write down. It carries the grade, the size and both fitting types on it.',
        'Overall length is measured between specific points depending on the fitting type — and it is not the length of hose that gets cut.',
        'Fitting orientation matters on anything with two elbows. Note the angle between them before the old hose is thrown away.',
        'Getting the grade right means matching the working pressure and the bend radius the installation actually needs, not copying what happened to be fitted last.',
        'Ask for the test certificate. If an assembly is going into a regulated environment you will need it, and it is far easier to get at build time.',
      ],
    },
    {
      type: 'lead',
      html: 'The fastest hose job is the one where the old assembly arrives with the person ordering it. Everything needed to rebuild it is printed on the hose or visible on the ends. Everything below is what to do when that is not possible.',
    },

    { type: 'section_head', number: '/01', title: 'Bring the old one.', anchor: 'bring-the-old-one' },
    {
      type: 'paragraph',
      html: 'The layline — the printed stripe running along the cover — normally carries the manufacturer, the grade and the size. That single line resolves most of the specification. The fitting on each end supplies the rest: family, size and orientation. A failed assembly is a complete drawing of itself.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Photograph it on the machine before removing it.',
      body: 'Routing and clamping are the two things the old assembly cannot tell us once it is off, and they are frequently what caused the failure. Two photographs before removal are worth more than a phone call afterwards.',
    },

    { type: 'section_head', number: '/02', title: 'If you cannot.', anchor: 'if-you-cannot' },
    {
      type: 'sop_block',
      header: 'HOSE ASSEMBLY · WHAT WE NEED FROM YOU',
      completion: '6 items',
      phases: [
        {
          name: 'Measure',
          rows: [
            { task: 'Hose bore', detail: 'Inside diameter, or the dash size if the layline is legible. This sets the flow capacity and must match the circuit.', who: 'Customer', tool: 'Caliper' },
            { task: 'Overall length', detail: 'End to end as installed. Say which points you measured between — the convention differs by fitting type and we will confirm it.', who: 'Customer', tool: 'Tape' },
            { task: 'Fitting family and size, both ends', detail: 'They are often different. Photograph each end against a rule if you are unsure.', who: 'Customer', tool: 'Photo' },
            { task: 'Fitting angle', detail: 'Straight, 45° or 90° at each end, and the rotational angle between them if both are elbows.', who: 'Customer', tool: 'Photo' },
          ],
        },
        {
          name: 'Specify',
          rows: [
            { task: 'Working pressure', detail: 'What the circuit actually runs at, from the machine data — not the rating of whatever was fitted before.', who: 'Customer', tool: 'Machine data' },
            { task: 'Application and environment', detail: 'Mobile or static, ambient temperature, and whether the run rubs on anything. This is what decides grade and whether it needs protection.', who: 'Customer', tool: '—' },
          ],
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'Is the length of hose cut the same as the finished assembly length?',
      answer:
        'No. Each fitting consumes some of the overall length, so the hose is cut shorter than the finished assembly by an amount that depends on the fitting series at each end. This is why quoting a finished length is correct and cutting to that figure is not — the workshop applies the deduction.',
    },
    {
      type: 'paragraph',
      html: 'That deduction is specific to the fitting series and the manufacturer, which is why this article does not publish a table of them. Getting it wrong produces an assembly that is measurably the wrong length, and on a tight installation that means either a strained hose or one that will not reach.',
    },

    { type: 'section_head', number: '/03', title: 'What you get back.', anchor: 'what-you-get' },
    {
      type: 'paragraph',
      html: 'A finished assembly should be crimped to the specification for that hose and fitting combination, proof tested, capped, and tagged. The <strong>caps matter more than they look</strong> — an assembly that travels open collects exactly the contamination the system is designed to keep out, and a new hose is a common route for dirt into a clean circuit.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can you build to a drawing rather than a sample?', answer: 'Yes. A drawing needs bore, overall length with the measurement convention stated, both fitting specifications, and the angle between the ends if both are elbows.' },
        { question: 'Can you match a hose I bought elsewhere?', answer: 'Usually. The layline carries the grade and size, and the ends identify the fittings. If the layline is worn off we can work from the construction and the fittings.' },
        { question: 'Do I get a test certificate?', answer: 'Ask for it at the time of order. Proof testing and certification are straightforward as part of the build and awkward to add afterwards — particularly if the assembly has already been fitted.' },
        { question: 'How long does it take?', answer: 'It depends on grade and size availability rather than on the build. Send the specification and we will tell you what is in stock before you travel.' },
      ],
    },
    { type: 'product_embed', heading: 'Common grades and ferrules', skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-CF-NS-R1T1SN', 'IH-CF-NS-R2T2SN'] },
    { type: 'category_link', slug: 'hoses-fittings', label: 'Hose, fittings and ferrules', blurb: 'Everything an assembly is built from, in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Procedure only. Cut-off factors and crimp diameters are per fitting series and per manufacturer, and are deliberately not published here.' },
    { type: 'cta_block', heading: 'Send the specification.', body: 'Photographs of both ends and the layline are usually enough. We will confirm the build and what we hold before you make the trip.', quoteLabel: 'Get an assembly quoted' },
  ],
}

export default ARTICLE
