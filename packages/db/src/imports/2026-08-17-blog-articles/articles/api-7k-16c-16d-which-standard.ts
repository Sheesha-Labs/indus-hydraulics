import type { BlogArticleSeed } from '../shared'

/**
 * Figures are taken from the catalogue's own product specs, which rest on the
 * manufacturers' API certification. Phrasing is careful throughout: these are
 * the ratings of the constructions we supply, NOT a claim about what the
 * standard mandates. API 7K and 16C each cover multiple pressure classes.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'api-7k-16c-16d-which-standard',
  title: 'API 7K, 16C and 16D: which standard governs which hose on a rig',
  excerpt:
    'Three API specifications cover three different jobs, and they do not share a design factor. What each one governs, and why a 16C line at 10,000 psi has less margin than a hydraulic hose at 400 bar.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'API 7K vs 16C vs 16D — which hose standard applies',
  seoDescription:
    'API 7K covers rotary and vibrator hose, 16C covers choke and kill lines, 16D covers BOP control. Ratings, design factors and where each applies.',
  focusKeyword: 'api 7k vs api 16c',
  publishedAt: '2026-08-18T06:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'API 7K governs rotary, vibrator and cementing hose. API 16C governs choke and kill lines. API 16D governs BOP control. They are not interchangeable.',
        'The design factor differs by specification. On the constructions we supply, API 7K rotary hose runs 5,000 psi working against 12,500 psi minimum burst — 2.5:1. API 16C choke and kill runs 10,000 against 15,000 — 1.5:1.',
        'By comparison a hydraulic hose to EN or SAE carries a 4:1 factor. Higher-pressure oilfield hose has less proportional margin, not more.',
        'API 16D control hose is specified on fire survival as much as pressure — the Fireshield constructions are rated 1,300 °F for 30 minutes.',
        'Subsea moves the governing document again: API 17J and ISO 13628-2 rather than 16C alone.',
      ],
    },
    {
      type: 'lead',
      html: 'Rig hose is not one category with different pressure ratings. Three separate API specifications cover three separate duties, each written around a different failure mode — and the differences between them show up most clearly in something people rarely compare: how much margin each one leaves between working pressure and burst.',
    },

    { type: 'section_head', number: '/01', title: 'Which standard, which hose.', anchor: 'which-standard' },
    {
      type: 'comparison_table',
      caption: 'The three specifications and the constructions we supply against them',
      columns: ['Specification', 'Governs', 'Rated (as supplied)', 'Size range'],
      rows: [
        { cells: ['API 7K, Spec 7K Grade D', 'Rotary, vibrator and cementing hose', '5,000 psi WP / 12,500 psi MBP', '2" – 5"'] },
        { cells: ['API 16C', 'Choke and kill / well control lines', '10,000 psi WP / 15,000 psi MBP', '3" – 4"'], highlight: true },
        { cells: ['API Spec 16D', 'BOP control hose', '5,000 psi WP, fire-rated cover', '1/4" – 1"'] },
        { cells: ['API 17J (+ ISO 13628-2)', 'Subsea LMRP and conduit', '15,000 psi WP', '2" – 4"'] },
        { cells: ['API 17J / Spec 7K', 'Riser tensioner and compensator', '5,000 psi WP / 12,500 psi MBP', '1" – 4"'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'These are the ratings of specific constructions, not the ceiling of each standard.',
      body: 'API 7K and API 16C each cover several pressure classes. The figures above are what the hose we stock against each specification is rated at — take the class you actually need from the datasheet for the assembly being supplied, not from a table like this one.',
    },

    { type: 'section_head', number: '/02', title: 'The design factor is not universal.', anchor: 'design-factor' },
    {
      type: 'direct_answer',
      question: 'Does oilfield hose have a 4:1 safety factor like hydraulic hose?',
      answer:
        'No. A hydraulic hose to EN or SAE typically carries a 4:1 ratio between minimum burst and working pressure. On the oilfield constructions we supply, API 7K rotary hose is 2.5:1 and API 16C choke and kill is 1.5:1. The higher-pressure hose has proportionally less margin, not more.',
    },
    {
      type: 'comparison_table',
      caption: 'Margin between working and burst, by specification',
      columns: ['Hose', 'Working', 'Minimum burst', 'Ratio'],
      rows: [
        { cells: ['Hydraulic, EN 856 4SP', '450 bar', '4× working', '4 : 1'] },
        { cells: ['API 7K rotary / vibrator', '5,000 psi', '12,500 psi', '2.5 : 1'] },
        { cells: ['API 16C choke and kill', '10,000 psi', '15,000 psi', '1.5 : 1'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'This is worth internalising because it inverts an instinct. People assume the higher-rated hose is the more forgiving one. In practice a choke and kill line is engineered much closer to its limit than a general hydraulic hose, and that is precisely why <strong>recertification intervals and handling discipline matter more on this equipment, not less</strong>. Margin that is not in the design has to come from inspection.',
    },

    { type: 'section_head', number: '/03', title: 'Where each one applies.', anchor: 'where-applies' },
    {
      type: 'decision_tree',
      heading: 'Working out which specification governs',
      branches: [
        { condition: 'Hose between the standpipe and the swivel, or on a cementing unit', outcome: 'API 7K.', detail: 'Rotary and vibrator service. Bonded, crimped and swaged coupling options exist and are not interchangeable in the field.', sku: 'IH-OG-DRL-001' },
        { condition: 'Flexible line in the choke or kill circuit', outcome: 'API 16C.', detail: 'Liner choice sets the temperature ceiling — the constructions we supply run to 100 °C or 130 °C depending on liner.', sku: 'IH-OG-WCT-001' },
        { condition: 'Control line to a BOP stack', outcome: 'API Spec 16D, with fire survival.', detail: 'Pressure is only half the specification; the cover has to survive fire long enough for the stack to function.', sku: 'IH-OG-WCT-006' },
        { condition: 'Subsea, below the LMRP', outcome: 'API 17J with ISO 13628-2.', detail: 'A different governing document and a different qualification regime from surface 16C.', sku: 'IH-OG-WCT-005' },
        { condition: 'Sour service anywhere in the above', outcome: 'NACE MR-0175 in addition to the API specification.', detail: 'It constrains the materials, including the end fittings — not only the hose.', sku: 'IH-OG-DRL-006' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'One from each specification',
      skus: ['IH-OG-DRL-001', 'IH-OG-WCT-001', 'IH-OG-WCT-006', 'IH-OG-WCT-005'],
      note: 'Every assembly is supplied against the manufacturer’s API certification for that construction, with documentation.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can an API 7K hose be used in a choke and kill circuit?', answer: 'No. They are qualified against different specifications for different duties, and the choke and kill line is required to be a 16C item. A 7K hose is not a lower-cost substitute for one.' },
        { question: 'What does NACE MR-0175 change?', answer: 'It constrains material selection for sour service — hydrogen sulphide environments — and it applies to the end fittings and couplings as well as the hose. Specifying a NACE hose with non-compliant ends does not give you a NACE assembly.' },
        { question: 'Why is subsea governed by 17J rather than 16C?', answer: 'Because the duty and the qualification regime differ. Subsea LMRP hose is specified against API 17J alongside ISO 13628-2; 16C remains relevant as a cross-reference but is not the controlling document.' },
        { question: 'Does a higher pressure class always mean a longer service life?', answer: 'No, and the design factors above are why. Rating is about the pressure the hose is qualified to contain, not about how long it will last in service — which is set by duty, handling, temperature and the recertification regime.' },
      ],
    },
    { type: 'category_link', slug: 'oil-gas-hoses', label: 'Oil & gas hose', blurb: 'Drilling, well control, well service, tensioner and low-pressure oilfield constructions.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Ratings taken from the specifications of the constructions we stock, which rest on the manufacturers’ API certification. Pressure classes vary within each standard — confirm against the datasheet for the assembly supplied.' },
    { type: 'cta_block', heading: 'Specifying rig hose?', body: 'Tell us the circuit, the pressure class and whether the service is sour. We will come back with the construction, the certification that ships with it and the lead time.', quoteLabel: 'Specify an assembly' },
  ],
}

export default ARTICLE
