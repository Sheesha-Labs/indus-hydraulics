import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Written entirely from the buyer's side.
 *
 * Operator vendor systems are a real and under-explained constraint on Gulf
 * hose supply, and there is no honest way for us to write about them as a
 * participant: we are not on any operator's approved vendor list, and the
 * article says nothing that implies otherwise. What it does instead is explain
 * how the regimes work, which questions they push onto a contractor, and where
 * a supplier can legitimately help — through documentation, traceability and
 * a named manufacturer — rather than through a status we do not hold.
 *
 * No operator's requirements are quoted as fact. Approval regimes are named as
 * a category and the reader is told to read their own contract, because these
 * schemes change and a stale specific would be worse than a general truth.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'vendor-approval-for-hose-supply',
  title: 'Vendor approval for hose supply on a Gulf operator’s site',
  excerpt:
    'Approved vendor lists sit between a contractor and the fastest way to fix a machine. How the regimes actually work, which parts of them are about the supplier and which are about the product.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Vendor approval for hose supply to Gulf operators',
  seoDescription:
    'How operator approved-vendor regimes affect hydraulic hose supply in the Gulf, what they ask of a contractor, and what documentation makes an order acceptable.',
  focusKeyword: 'vendor approval for hose supply',
  publishedAt: '2026-09-01T09:50:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Most operator regimes approve two different things: a supplier, and a product or manufacturer. A contractor usually needs the second more often than the first.',
        'Which one applies to you is written in your contract, not in a general rule about the operator.',
        'Where the requirement is manufacturer-based, the useful question to a supplier is "whose product is this, and can you evidence it" — not "are you approved".',
        'Project and turnaround supply frequently runs under different rules from routine site consumables.',
        'Nothing about an approval regime removes the documentation requirements; it usually adds to them.',
      ],
    },
    {
      type: 'lead',
      html: 'Every large Gulf operator runs some form of vendor qualification, and every contractor working on their sites eventually hits it — usually at the least convenient moment, when a machine is down and the obvious source of a hose is not on a list. The regimes are not mysterious, but they are frequently described in a way that conflates two separate things, and the conflation is what causes the delay.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Two different approvals wearing the same name.',
      anchor: 'two-approvals',
    },
    {
      type: 'comparison_table',
      caption: 'What is being approved',
      columns: ['Approval', 'What it covers', 'Who normally holds it'],
      rows: [
        {
          cells: [
            'Supplier registration',
            'The company: legal status, financial standing, HSE, quality system',
            'The party contracting directly with the operator',
          ],
        },
        {
          cells: [
            'Product or manufacturer approval',
            'A named product, brand or specification for a defined application',
            'The manufacturer, referenced by whoever supplies it',
          ],
          highlight: true,
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'A contractor buying a replacement hose is usually operating under the second. The operator has specified what may be fitted; the contractor’s own registration is what allows them to work on site at all. <strong>Confusing the two produces a question nobody can answer</strong> — asking a stockist whether they are an approved vendor, when what the contract requires is a named manufacturer’s product with traceable documentation.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Read the clause before asking the market.',
      body: 'The contract will say whether the requirement attaches to the supplying company, to the manufacturer, to a specification, or to a combination. Five minutes with the document changes the enquiry from "are you approved" — which invites a useless yes — to something a supplier can actually answer with evidence.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What these regimes actually ask for.',
      anchor: 'what-they-ask',
    },
    {
      type: 'paragraph',
      html: 'Strip away the portals and the terminology and the underlying questions are consistent across operators, because they are all managing the same risks: that the part is what it claims to be, that its provenance can be shown, that it suits the duty, and that somebody is accountable if it fails.',
    },
    {
      type: 'comparison_table',
      caption: 'The four questions behind most vendor regimes',
      columns: ['Question', 'What satisfies it on a hose order'],
      rows: [
        { cells: ['Is the part genuine and identifiable?', 'Layline, batch, tag and a named manufacturer'] },
        { cells: ['Was it made to a stated standard?', 'Construction standard on the specification and on the layline'] },
        { cells: ['Has it been tested?', 'Assembly proof-test certificate tied to the tag'] },
        { cells: ['Do the materials suit the duty?', 'Material certificates, and a compound statement for the tube'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'None of that is exotic, and all of it is available on a normally documented order. That is the practical point of this article: <strong>most of what an operator regime wants is documentation, and documentation is a supplier behaviour rather than a supplier status.</strong>',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Where suppliers overstate, and how to test it.',
      anchor: 'overstatement',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: '"Approved supplier" is a claim to check, not a credential to accept.',
      body: 'Approval is granted for a defined scope — a category, a period, sometimes a single project — and the scope is what matters. Ask which operator, under what registration, for which product categories, and until when. A supplier who is genuinely registered can answer all four in a sentence. Where we are asked this question, the honest answer is that we supply against the operator’s specification and documentation requirements rather than holding operator vendor status ourselves, and we would rather say so than let an assumption stand.',
    },
    {
      type: 'paragraph',
      html: 'Turnarounds and capital projects often run under separate arrangements from day-to-day site supply, sometimes with exemptions that do not apply to routine purchases, and sometimes with stricter requirements than usual. If the order is for a shutdown, confirm which regime it falls under before pricing it — the answer changes what has to travel with the goods.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Are you an approved vendor for the Gulf national oil companies?',
          answer:
            'We do not hold operator vendor status, and we would not claim it. What we do is supply against the operator’s specification with the documentation the contract calls for — named manufacturer, construction standard, proof test, material certificates and traceability — which is what most contractor purchases actually require.',
        },
        {
          question: 'Our contract names a brand we cannot get quickly. What are the options?',
          answer:
            'Ask whether the clause names a brand or a specification. Where it names a specification, an equivalent construction that meets it with evidence is usually acceptable. Where it genuinely names a brand, substitution is the client’s decision to make in writing, not the supplier’s to assume.',
        },
        {
          question: 'Does an approval regime replace the import documentation?',
          answer:
            'No. Conformity registration, origin and the commercial document set are unaffected by it. Vendor requirements sit on top of the customs requirements rather than instead of them.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Supplying into a site with a specification clause?',
      body: 'Send the clause. We will tell you what we can evidence against it, what we cannot, and what an acceptable equivalent would need to demonstrate — in writing, so it can go to your client.',
      quoteLabel: 'Ask about a specification',
    },
  ],
}

export default ARTICLE
