import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'api-16c-choke-and-kill-lines',
  title: 'API 16C choke and kill lines: liner, temperature and the 1.5:1 problem',
  excerpt:
    'A choke and kill line runs closer to its burst pressure than almost anything else on a rig. What sets the temperature ceiling, why the liner is the decision, and what that margin means for handling.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'API 16C choke and kill hose — liner, temperature and ratings',
  seoDescription:
    'API 16C flexible choke and kill lines: 10,000 psi working against 15,000 psi burst, liner options to 100 °C or 130 °C, sour service and what the margin means.',
  focusKeyword: 'api 16c choke and kill hose',
  publishedAt: '2026-08-18T06:30:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The choke and kill lines we supply are rated 10,000 psi working against 15,000 psi minimum burst — a 1.5:1 design factor.',
        'That is far less proportional margin than a hydraulic hose at 4:1. The discipline that compensates is inspection and recertification, not the design.',
        'The liner sets the temperature ceiling. Our constructions run to 100 °C or 130 °C depending on which liner is specified.',
        'Sour service adds NACE MR-0175 on top of 16C, and it constrains the end fittings as well as the hose.',
        'Below the LMRP the governing specification changes to API 17J with ISO 13628-2 — a subsea line is not a 16C line.',
      ],
    },
    {
      type: 'lead',
      html: 'The choke and kill line is one of the few flexible items on a rig where the consequence of a failure is measured in well control rather than downtime. It is also, by design factor, one of the least forgiving — and those two facts are related.',
    },

    { type: 'section_head', number: '/01', title: 'What 1.5:1 actually means.', anchor: 'the-margin' },
    {
      type: 'direct_answer',
      question: 'How much margin does an API 16C choke and kill line have?',
      answer:
        'On the constructions we supply, 10,000 psi working against 15,000 psi minimum burst — a ratio of 1.5:1. For comparison a hydraulic hose to EN or SAE is built to 4:1. The choke and kill line is engineered much closer to its limit, which is exactly why its inspection and recertification regime is stricter.',
    },
    {
      type: 'paragraph',
      html: 'The instinct that a higher-rated hose is a more forgiving hose is wrong here, and it is worth saying plainly. A 16C line is qualified to contain a specific pressure with a defined margin, on the assumption that it is inspected, pressure tested and recertified on schedule. <strong>Damage that a hydraulic hose would absorb inside its 4:1 factor has nowhere to go on a 16C line.</strong>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Handling damage is not cosmetic on this equipment.',
      body: 'Dropping, crushing or dragging a choke and kill line is a condemnation event pending inspection, not something to note and carry on with. The margin that would tolerate it on general hydraulics is not present.',
    },

    { type: 'section_head', number: '/02', title: 'The liner is the decision.', anchor: 'the-liner' },
    {
      type: 'comparison_table',
      caption: 'Choke and kill constructions we supply',
      columns: ['Construction', 'Temperature ceiling', 'Standards', 'Size'],
      rows: [
        { cells: ['Tauroflon™ liner', '130 °C (266 °F)', 'API 16C, API 17J, NACE MR-0175', '3" – 4"'], highlight: true },
        { cells: ['PA liner, high temperature', '130 °C (266 °F)', 'API 16C, API 17J', '3" – 4"'] },
        { cells: ['PA liner, standard', '100 °C (212 °F)', 'API 16C', '3" – 4"'] },
        { cells: ['General 16C assembly', '121 °C', 'API 16C, API 17J', '2" – 4"'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'All four are 10,000 psi working. The differentiator is temperature and service environment, which means the specification conversation is about <em>what is flowing and how hot it is</em>, not about pressure class. A line specified purely on pressure can be correct on paper and unsuitable for the well.',
    },

    { type: 'section_head', number: '/03', title: 'Sour service and subsea.', anchor: 'sour-and-subsea' },
    {
      type: 'paragraph',
      html: '<strong>Sour service</strong> adds NACE MR-0175 to the 16C requirement. The point that gets missed is scope: it constrains materials throughout the assembly, including the flanged ends. Specifying a NACE-compliant hose and pairing it with non-compliant end connections does not produce a NACE-compliant assembly, and it is the ends that tend to be treated as a commodity.',
    },
    {
      type: 'paragraph',
      html: '<strong>Subsea</strong> changes the governing document. Below the LMRP the relevant specification is API 17J alongside ISO 13628-2, and the constructions we supply there are rated 15,000 psi working. A surface 16C line is not a substitute, and the qualification regimes are not equivalent.',
    },
    { type: 'product_embed', heading: 'Choke and kill constructions', skus: ['IH-OG-WCT-002', 'IH-OG-WCT-003', 'IH-OG-WCT-004', 'IH-OG-WCT-005'] },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can a choke and kill line be repaired?', answer: 'No. There is no field repair for a 16C assembly that restores its qualification. Damage means removal from service and replacement or manufacturer assessment.' },
        { question: 'What temperature should I specify against?', answer: 'The maximum the line will actually see, including any excursion, not the nominal produced-fluid temperature. The liner ceiling is a hard limit and the difference between the 100 °C and 130 °C constructions is exactly this decision.' },
        { question: 'Does the flange rating need to match the hose?', answer: 'The assembly is qualified as a whole, ends included. Mixing a hose of one class with ends of another does not give you an assembly rated at the lower of the two — it gives you an unqualified assembly.' },
        { question: 'How often does a 16C line need recertification?', answer: 'On the interval set by the applicable specification and the operator’s own regime, which is stricter than most flexible equipment precisely because of the design factor. Our services team handles recertification alongside choke and kill manifold work.' },
      ],
    },
    { type: 'category_link', slug: 'well-control-hoses', label: 'Well control hose', blurb: 'Choke and kill, subsea LMRP, BOP control and conduit constructions.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-18', note: 'Ratings from the constructions we stock, resting on the manufacturers’ API certification. API 16C covers multiple pressure classes — confirm against the assembly datasheet.' },
    { type: 'cta_block', heading: 'Specifying a choke and kill line?', body: 'Tell us the pressure class, the maximum temperature and whether the service is sour. We will come back with the construction, the certification and the recertification interval.', quoteLabel: 'Specify a line' },
  ],
}

export default ARTICLE
