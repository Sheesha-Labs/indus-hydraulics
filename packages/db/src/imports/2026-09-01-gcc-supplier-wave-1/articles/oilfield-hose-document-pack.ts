import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The document pack, not the standards.
 *
 * `api-7k-16c-16d-which-standard` already explains which standard governs
 * which service and is linked rather than restated. This article answers the
 * next question — what physically travels with the assembly and who signs it —
 * which is where oilfield orders actually stall.
 *
 * It publishes no pressure ratings, no service-life figures and no monogram
 * claims. Whether a specific assembly is supplied under an API monogram
 * licence is a question about a manufacturer and a product, and any general
 * answer would be a claim we cannot stand behind for the whole catalogue.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'oilfield-hose-document-pack',
  title: 'The oilfield hose document pack: what travels with an API assembly',
  excerpt:
    'On an oilfield order the paperwork is part of the product. What the pack normally contains, who has to sign each piece, and the two items that are always requested late.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Oilfield hose document pack — what ships with an API assembly',
  seoDescription:
    'The documentation that travels with an oilfield hose assembly: traceability, test records, material certificates and conformity statements, and how to specify them.',
  focusKeyword: 'oilfield hose document pack',
  publishedAt: '2026-09-01T11:05:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What documents should come with an oilfield hose assembly?',
      answer:
        'At minimum: identification of the assembly tied to a physical tag, evidence of the construction standard it was built to, a pressure-test record for that assembly, material certificates for the metallic parts where the service requires them, and a statement of conformity to the specification on the order. Anything a purchase order adds — sour-service statements, third-party witnessing, a data book in a particular format — has to be agreed before manufacture, because most of it cannot be produced afterwards.',
    },
    {
      type: 'lead',
      html: 'The oilfield hose document pack is part of the product rather than an accompaniment to it. On general industrial orders the documents follow the goods. On oilfield orders they are part of the goods: an assembly that arrives without its pack cannot be installed, and the pack cannot always be reconstructed after the fact. That inversion is the single most useful thing to understand about buying flexible connections for pressure-control and drilling service.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What is normally in the pack.',
      anchor: 'the-pack',
    },
    {
      type: 'comparison_table',
      caption: 'The pack, and what each item answers',
      columns: ['Document', 'What it establishes', 'Producible after the fact?'],
      rows: [
        { cells: ['Assembly identification and tag record', 'Which physical item this pack belongs to', 'No'] },
        { cells: ['Construction standard evidence', 'What the item was built to', 'No'] },
        {
          cells: ['Pressure-test record', 'That this assembly held its test pressure, and when', 'Only by re-testing'],
          highlight: true,
        },
        { cells: ['Material certificates', 'What the metallic parts are, traceable to a batch', 'No, if the batch was never traced'] },
        { cells: ['Statement of conformity to the order', 'That what was supplied matches what was specified', 'Yes'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The right-hand column is the reason this article exists. Only the last line can be produced later. <strong>Everything above it depends on something having been recorded at the time</strong> — a batch tracked, a test carried out and logged, a tag attached to a specific item — and a supplier who did not do that cannot fix it with paperwork.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The two items always requested late.',
      anchor: 'requested-late',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Third-party witnessing and a client-format data book.',
      body: 'Both are common on oilfield purchase orders, both are entirely deliverable, and both are schedule events rather than documents. Witnessing needs an inspector present at a particular moment; a data book in the client’s own template needs the template. Asked for at enquiry, neither is a problem. Asked for when the assemblies are made and crated, they are a re-do.',
    },
    {
      type: 'paragraph',
      html: 'The corresponding advice for buyers is unglamorous: send the documentation clause with the request for quotation, in full, even when it is three pages of boilerplate. A supplier who reads it will price it and schedule it. A supplier who does not read it will quote lower and deliver late, and the difference will look like their fault and be nobody’s.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Specifying the standard is not the same as specifying the pack.',
      anchor: 'standard-vs-pack',
    },
    {
      type: 'paragraph',
      html: 'The API standards that govern this equipment — the rotary and vibrator hose family, choke and kill service, and control-system hose — define what an item must be, not what documents your organisation needs to file. Two assemblies can both be correct against the same standard and arrive with very different packs, because the pack follows the <strong>purchase order and the operator’s own regime</strong>.',
    },
    {
      type: 'paragraph',
      html: 'So the specification has two halves and they are written in different places. The engineering half comes from the standard and the service conditions. The documentation half comes from your client’s contract and your own QA system. Send both to the supplier; sending only the first is how a technically perfect assembly ends up rejected on receipt.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Monogram and licence questions are per manufacturer, per product.',
      body: 'Whether a particular item is supplied under an API monogram licence is a question about the maker and the product line, with a licence number behind it. It is answerable — ask for the number. It is not answerable as a general property of a supplier, and a general answer to it should be treated as an unanswered question.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can you re-issue a document pack for assemblies supplied last year?',
          answer:
            'The conformity statement, yes. Test records and traceability can be reissued only if they were created at the time and retained — which is why the tag on the assembly matters so much. Give us the tag references and we will tell you what exists.',
        },
        {
          question: 'Is a data book different from a document pack?',
          answer:
            'In practice a data book is the pack assembled in a defined structure with an index, often to a client template and sometimes requiring sign-off pages. It is the same content in a specified format, and the format is the part that needs agreeing early.',
        },
        {
          question: 'What do you need from us to quote a documented oilfield order?',
          answer:
            'The service conditions, the standard the items are specified to, the documentation clause in full, and whether any witnessing is required. With those four we can quote the assemblies and the documentation together instead of discovering the second half later.',
        },
      ],
    },

    {
      type: 'category_link',
      slug: 'oil-gas-hoses',
      label: 'Oil & gas hose',
      blurb: 'Rotary, vibrator, choke and kill, and control-line hose.',
    },
    {
      type: 'cta_block',
      heading: 'Oilfield order with a documentation clause?',
      body: 'Send the clause with the enquiry rather than with the order. We will quote the assemblies and the pack together, and tell you which items in the clause are schedule events rather than documents.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
