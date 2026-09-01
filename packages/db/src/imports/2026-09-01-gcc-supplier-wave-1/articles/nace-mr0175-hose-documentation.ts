import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The sour-service article.
 *
 * The correction it exists to make: NACE MR0175 / ISO 15156 is a materials
 * standard for METALS. A purchase order that says "hose to be NACE compliant"
 * is asking for something the standard does not address, because the rubber
 * tube's behaviour in H2S is a compound and decompression question governed
 * elsewhere. Suppliers routinely answer the clause as written and everyone
 * proceeds believing a question was settled that was never asked.
 *
 * The statement about our own supply — material certificates and compliance
 * statements travelling with a sour-service consignment — is published and
 * approved on /markets/saudi-arabia.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'nace-mr0175-hose-documentation',
  title: 'NACE MR0175 documentation on a sour-service hose order',
  excerpt:
    'MR0175 is a materials standard for metals. Asking for a "NACE compliant hose" answers the fittings question and leaves the rubber one untouched — which is usually the one that matters.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'NACE MR0175 hose documentation for sour service',
  seoDescription:
    'What NACE MR0175 / ISO 15156 covers on a hose order, why it applies to the metallic parts rather than the rubber, and what to specify for sour-service duty.',
  focusKeyword: 'nace mr0175',
  publishedAt: '2026-09-01T09:25:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Can a hydraulic hose be NACE MR0175 compliant?',
      answer:
        'Its metallic parts can. MR0175, published jointly as ISO 15156, sets requirements for metallic materials used in H2S-containing oil and gas production environments — so it governs the fittings, ferrules and any wetted steel. It does not set requirements for the rubber tube, whose behaviour in sour service is a compound-selection and rapid-decompression question answered separately. A supplier who confirms "NACE compliant" without distinguishing the two has answered half the question.',
    },
    {
      type: 'lead',
      html: 'Sour service is the one duty where a documentation shortcut has a physical consequence rather than a commercial one. It is also where the wording of the purchase-order clause and the wording of the standard have drifted furthest apart, so both parties can be satisfied that a requirement is met while nobody has looked at the part that fails.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the standard governs.',
      anchor: 'what-it-governs',
    },
    {
      type: 'standard_citation',
      standard: 'NACE MR0175 / ISO 15156',
      publisher: 'ISO / AMPP',
      title:
        'Petroleum and natural gas industries — Materials for use in H2S-containing environments in oil and gas production',
      summary:
        'Sets requirements and recommendations for the selection and qualification of metallic materials for service in environments containing hydrogen sulphide, where cracking mechanisms such as sulphide stress cracking apply. It is organised around material groups and environmental severity, and it addresses metals.',
      url: 'https://www.iso.org/standard/76316.html',
    },
    {
      type: 'paragraph',
      html: 'The practical reading for a hose order: <strong>MR0175 is where the fitting, ferrule and adapter question is settled</strong>, against the material group, the hardness limits and the environment the parts will see. It is a materials-qualification standard, not a product approval — there is no such thing as a NACE certificate for an assembly in the way there is a proof-test certificate for one.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The half the clause usually misses.',
      anchor: 'the-rubber',
    },
    {
      type: 'comparison_table',
      caption: 'Two different questions on the same assembly',
      columns: ['Part', 'What governs it', 'What to ask for'],
      rows: [
        {
          cells: [
            'Fittings, ferrules, adapters',
            'MR0175 / ISO 15156 material requirements',
            'Material certificates plus a compliance statement',
          ],
        },
        {
          cells: [
            'Hose tube and cover compound',
            'Compound resistance to the medium, and to rapid decompression',
            'The compound named, and its suitability stated against the actual service',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'Gas-permeated rubber that is depressurised quickly can blister or tear from the inside — the failure is caused by the pressure drop, not by the pressure. That is a property of the compound and the service cycle, and it is not something a metals standard speaks to. A hose selected only against bore, pressure and temperature can be entirely correct on those three axes and wrong here.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Name the medium, not just the pressure.',
      body: 'For sour or gas service, tell the supplier the fluid, the concentration and the decompression behaviour of the system. A supplier who can only quote against dimensions will supply to the dimensions, and the specification will look satisfied. This is the one case where an under-specified enquiry produces a genuinely dangerous outcome rather than an inconvenient one.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What a sour-service consignment should carry.',
      anchor: 'documents',
    },
    {
      type: 'paragraph',
      html: 'For sour-service items, material certificates and MR0175 / ISO 15156 compliance statements travel with the consignment. Those two documents cover the metallic side properly. The third piece — a written statement of the tube compound and its suitability for the stated medium — has to be asked for, because it is not part of any standard document set.',
    },
    {
      type: 'comparison_table',
      caption: 'The pack, and what each piece answers',
      columns: ['Document', 'Answers'],
      rows: [
        { cells: ['Material certificate on metallic parts', 'What the metal is, traceable to a batch'] },
        { cells: ['MR0175 / ISO 15156 compliance statement', 'That those materials are within the standard for the stated environment'] },
        { cells: ['Compound statement for the tube', 'Whether the rubber suits the medium and the decompression regime'] },
        { cells: ['Assembly proof-test certificate', 'That this assembly held its test pressure'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Where we will not give an answer.',
      body: 'Suitability against a specific sour environment depends on concentration, temperature, partial pressure and cycle — the operator holds those figures and we do not. We can state what a compound is and what it is qualified against; confirming that against a particular well is engineering that belongs with the people who know the fluid.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is there a NACE certificate for a hose assembly?',
          answer:
            'No. MR0175 qualifies materials, so what exists is a compliance statement covering the metallic parts, supported by material certificates. Any document titled as a NACE certificate for a complete assembly is worth reading closely to see what it actually claims.',
        },
        {
          question: 'Do stainless fittings automatically satisfy MR0175?',
          answer:
            'No. The standard works by material group with hardness and condition limits, and some common grades are restricted or excluded for particular environments. It is a per-material, per-environment answer.',
        },
        {
          question: 'What do you need from us to quote a sour-service assembly?',
          answer:
            'The medium and its concentration, temperature, working pressure, whether the system depressurises rapidly, and the end connections. With those we can state what we would supply and what documentation comes with it.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Sour-service assemblies to specify?',
      body: 'Send the medium and the service conditions rather than a part number. We will state the compound, what the metallic parts are certified against, and where we think the specification needs an engineer’s decision rather than a supplier’s.',
      quoteLabel: 'Ask an engineer',
    },
  ],
}

export default ARTICLE
