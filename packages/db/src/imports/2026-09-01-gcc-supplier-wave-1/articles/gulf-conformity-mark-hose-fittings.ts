import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * The article that says a mark does not apply.
 *
 * G-Mark is scoped to low-voltage electrical equipment and toys, with the
 * household-electrical list being extended. Hydraulic and industrial hose sit
 * outside it. Several suppliers in this niche imply otherwise, and a buyer who
 * has been told to "get the G-Mark" on a hose order is being sent to a scheme
 * that will not certify the product.
 *
 * Publishing the negative is the point: it is the question, it has a clean
 * answer, and the answer costs us nothing to give.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'gulf-conformity-mark-hose-fittings',
  title: 'Gulf conformity mark: does hydraulic hose need G-Mark?',
  excerpt:
    'No — and knowing why saves a procurement team a month. What G-Mark actually covers, what it does not, and which requirement people are usually reaching for when they ask for it.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Does hydraulic hose need G-Mark? Gulf conformity mark scope',
  seoDescription:
    'The Gulf conformity mark covers low-voltage electrical equipment and toys, not hydraulic or industrial hose. What applies to a hose consignment into the GCC instead.',
  focusKeyword: 'gulf conformity mark',
  publishedAt: '2026-09-01T07:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Does hydraulic hose need a Gulf conformity mark?',
      answer:
        'No. The Gulf conformity mark is scoped to low-voltage electrical equipment and children’s toys, with the list being extended across household electrical products. Hydraulic and industrial hose are not in scope, and no conformity body can issue a G-Mark against them. What a hose consignment actually needs is national — SABER in Saudi Arabia, KUCAS in Kuwait — plus the ordinary commercial documents and whatever the end user has written into the purchase order.',
    },
    {
      type: 'lead',
      html: 'The Gulf conformity mark is widely described as a product passport for the GCC, which is close enough to true within its own scope and misleading everywhere else. It comes up on hose enquiries several times a year, usually because a QA department has read that goods entering the Gulf need G-Mark and has applied that sentence to everything on the purchase order.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the mark actually covers.',
      anchor: 'what-it-covers',
    },
    {
      type: 'paragraph',
      html: 'G-Mark is administered by the GCC Standardization Organization and applies in its member states. Its scope is defined by Gulf technical regulations, and the two that carry the bulk of it are <strong>low-voltage electrical equipment</strong> and <strong>toys</strong>. The electrical list has been extended over time to take in household electrical products, and some electrically powered devices sit inside it. That is the shape of the scheme: it is about electrical safety and children’s products, not about industrial components in general.',
    },
    {
      type: 'comparison_table',
      caption: 'What a Gulf buyer meets, and where each one applies',
      columns: ['Requirement', 'Applies to', 'Relevant to a hose order?'],
      rows: [
        {
          cells: ['G-Mark', 'Low-voltage electrical equipment, toys', 'No'],
          highlight: true,
        },
        {
          cells: ['SABER registration', 'Regulated products entering Saudi Arabia', 'Yes, per tariff line'],
        },
        {
          cells: ['KUCAS reports', 'Regulated products entering Kuwait', 'Yes, per tariff line'],
        },
        {
          cells: ['Certificate of origin', 'Effectively every commercial consignment', 'Yes, always'],
        },
        {
          cells: [
            'Test and material certificates',
            'Whatever the purchase order asks for',
            'Yes — and these are the ones that get forgotten',
          ],
        },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What people usually mean when they ask for it.',
      anchor: 'what-they-mean',
    },
    {
      type: 'paragraph',
      html: 'In practice an enquiry asking for G-Mark on hose is asking one of three real questions, and it is worth separating them before anyone starts chasing certificates.',
    },
    {
      type: 'decision_tree',
      heading: 'Which question is actually being asked',
      branches: [
        {
          condition: '"Will this clear customs?"',
          outcome: 'A national conformity question',
          detail:
            'Saudi Arabia and Kuwait run registration schemes against their own regulated lists. Qatar operates pre-shipment verification against its list. That is where the answer lives, not in G-Mark.',
        },
        {
          condition: '"Can you prove this hose is what you say it is?"',
          outcome: 'A test and traceability question',
          detail:
            'The answer is the assembly’s proof-test record, the layline, the batch, and material certificates on the fittings. All of it exists; none of it is a Gulf mark.',
        },
        {
          condition: '"Does it meet the standard we specified?"',
          outcome: 'A conformity-to-specification question',
          detail:
            'That is answered against EN 853, EN 856, SAE 100R or the API series as applicable, with a declaration from the supplier. It is contractual rather than regulatory.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Asking for a mark that cannot be issued costs weeks.',
      body: 'A purchase order that makes G-Mark a condition of supply for hose cannot be satisfied by anyone, because no notified body will certify a product outside the scheme’s scope. The order then sits while people look for a supplier who can do it. The fix is a clause amendment, and it is faster to raise the question at tender than at delivery.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What to write into the purchase order instead.',
      anchor: 'what-to-specify',
    },
    {
      type: 'paragraph',
      html: 'If the intent behind the clause is assurance rather than a specific mark, the assurance can be specified directly and is straightforward to supply: the <strong>construction standard</strong> the hose is built to, a <strong>proof-test certificate</strong> against the finished assembly, <strong>material certificates</strong> on the metallic parts where the service demands them, and a <strong>certificate of origin</strong>. That set answers the underlying question, is deliverable, and is checkable on arrival.',
    },
    {
      type: 'paragraph',
      html: 'Where the destination genuinely has a registration regime, name the destination rather than the mark. "Consignment to be delivered DAP Riyadh with SABER shipment registration complete" is unambiguous and actionable. "G-Mark required" is neither.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is G-Mark the same as the CE mark?',
          answer:
            'They are separate schemes with separate scopes and separate marks, although both are conformity marks applied to products in a regional market. A CE mark on an item does not produce a G-Mark, and neither is a general import permit.',
        },
        {
          question: 'Which countries recognise G-Mark?',
          answer:
            'It is the mark of the GSO member states — the six GCC countries and Yemen. Recognition is not the issue for hose, though; scope is. The mark does not extend to the product.',
        },
        {
          question: 'Our client insists on G-Mark for hose assemblies. What now?',
          answer:
            'Ask which risk the clause is managing. In almost every case the intent is met by the construction standard, the proof-test certificate and the material certificates, and the clause can be amended to say that. We are happy to put that in writing for a client’s QA department.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Unsure which certificate your order actually needs?',
      body: 'Send the specification clause and the destination. We will tell you which requirements are real, which cannot be issued against hose at all, and what to put in their place — before the order is placed rather than after.',
      quoteLabel: 'Ask a documentation question',
    },
  ],
}

export default ARTICLE
