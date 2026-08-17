import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'food-grade-hose-compliance',
  title: 'Food-grade hose: the certificate matters as much as the hose',
  excerpt:
    'On food, beverage and potable duty the material is only half the requirement. What the regulations actually cover, and what an auditor will ask you for.',
  categorySlug: 'industrial-hose',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Food grade hose compliance — FDA, EC 1935/2004 and traceability',
  seoDescription:
    'Food and beverage hose: what FDA 21 CFR 177.2600 and EC 1935/2004 cover, why cleanability matters as much as the compound, and the documentation an auditor expects.',
  focusKeyword: 'food grade hose compliance',
  publishedAt: '2026-08-17T13:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Food-grade is a documented status, not a description. An uncertified hose made of a compliant compound is still not a food-grade hose.',
        'Two regulatory frameworks dominate: the US FDA rules on food-contact rubber, and the EU framework regulation on food-contact materials.',
        'Cleanability is part of compliance. A smooth bore with no crevices is what makes cleaning-in-place effective.',
        'Taint and odour transfer matter commercially even where they are not a safety issue — a compliant hose can still ruin a batch.',
        'Keep the certificate with the hose record. Producing it a year later is the hard part, not obtaining it at purchase.',
      ],
    },
    {
      type: 'lead',
      html: 'Food and beverage duty is the one place in industrial hose where paperwork sits alongside performance as a hard requirement. A hose can be entirely suitable and still fail an audit, because what is being audited is the evidence rather than the rubber.',
    },

    { type: 'section_head', number: '/01', title: 'What the frameworks cover.', anchor: 'frameworks' },
    {
      type: 'standard_citation',
      standard: '21 CFR 177.2600',
      publisher: 'US FDA',
      title: 'Rubber articles intended for repeated use',
      summary:
        'The US rule most often cited for food-contact hose. It governs the composition of rubber articles used repeatedly in contact with food, which is why compliance is a statement about the compound and its permitted constituents rather than about a finished hose in the abstract.',
    },
    {
      type: 'standard_citation',
      standard: 'Regulation (EC) No 1935/2004',
      publisher: 'European Union',
      title: 'Materials and articles intended to come into contact with food',
      summary:
        'The EU framework regulation. It sets the general requirement that food-contact materials must not transfer constituents to food in quantities that endanger health or change its composition, taste or odour — which is why taint is a compliance question here and not only a commercial one.',
    },
    {
      type: 'paragraph',
      html: 'Which framework applies is a function of where the product is sold, not where the hose is bought — and plants exporting into more than one market frequently need to satisfy both. The practical consequence is that "food grade" alone is not a specification: the useful question is <em>compliant with what, and evidenced how</em>.',
    },

    { type: 'section_head', number: '/02', title: 'Cleanability is part of it.', anchor: 'cleanability' },
    {
      type: 'direct_answer',
      question: 'Why does bore finish matter on a food hose?',
      answer:
        'Because cleaning has to reach every surface the product touched. A smooth bore with no crevices, steps or dead legs lets a cleaning-in-place cycle do its job; a rough or damaged bore gives residue somewhere to sit, and a hose that cannot be reliably cleaned is a contamination route regardless of what it is made from.',
    },
    {
      type: 'paragraph',
      html: 'This is why internal damage condemns a food hose more decisively than the equivalent damage on a general-purpose one. A gouge in the liner is not a strength problem at these pressures — it is a place that cannot be cleaned.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Dedicate and mark hoses by product.',
      body: 'Colour coding and dedication per product is standard practice in food plants for good reason. It removes both cross-contamination and the allergen question, and it makes the hose register something an auditor can follow.',
    },

    { type: 'section_head', number: '/03', title: 'What an auditor asks for.', anchor: 'audit' },
    {
      type: 'sop_block',
      header: 'FOOD HOSE · RECORD TO KEEP',
      completion: '5 items',
      phases: [
        {
          name: 'At purchase',
          rows: [
            { task: 'Compliance certificate', detail: 'Naming the framework the hose is certified against. Request it at order; retrieving it later is far harder.', who: 'Procurement', tool: 'Supplier' },
            { task: 'Batch and traceability', detail: 'What was fitted where, and when. This is the record that makes a recall bounded rather than open-ended.', who: 'Procurement', tool: 'Hose register' },
          ],
        },
        {
          name: 'In service',
          rows: [
            { task: 'Product dedication', detail: 'Which hose is used for which product, marked on the hose itself and recorded.', who: 'Production', tool: 'Colour coding' },
            { task: 'Cleaning validation', detail: 'That the cleaning regime reaches the hose bore, and evidence it was followed.', who: 'QA', tool: 'CIP records' },
            { task: 'Inspection of the bore', detail: 'Internal condition, not just the cover. Damage to the liner condemns the hose.', who: 'Production', tool: 'Visual' },
          ],
        },
      ],
    },
    { type: 'product_embed', heading: 'Food and beverage constructions', skus: ['IH-IH-SANF', 'IH-IH-SANB', 'IH-IH-PREMVIN'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is a food-grade liner enough on its own?', answer: 'No. The couplings and gaskets are also in product contact and must be suitable, and the assembly needs to be cleanable as a whole. A compliant hose on an unsuitable coupling is not a compliant assembly.' },
        { question: 'Can a food hose be used for something else and then returned to food duty?', answer: 'It should not be. Once a hose has carried a non-food product you cannot evidence that it is clean to food standard, and evidence is what compliance consists of.' },
        { question: 'Does potable water count as food contact?', answer: 'It is treated under its own requirements, which overlap with but are not identical to food-contact rules. Specify potable duty explicitly rather than assuming a food hose covers it.' },
        { question: 'What if the certificate is lost?', answer: 'The hose is effectively uncertified for audit purposes. Keep certificates with the hose register rather than in a purchasing file — that is the difference between having compliance and being able to show it.' },
      ],
    },
    { type: 'category_link', slug: 'food-beverage-hoses', label: 'Food and beverage hose', blurb: 'Hygienic suction and delivery constructions, supplied with certification.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Framework-level guidance. Which regulation applies depends on your market and product — confirm with your QA function.' },
    { type: 'cta_block', heading: 'Need certification with the hose?', body: 'Tell us the product, the market you sell into and the cleaning regime. We will supply the assembly with the documentation your auditor will ask for.', quoteLabel: 'Request certified hose' },
  ],
}

export default ARTICLE
