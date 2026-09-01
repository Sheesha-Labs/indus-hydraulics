import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Traceability, written as a receiving-inspection procedure.
 *
 * Careful scope: this article does not claim a counterfeit problem of any
 * particular size in any particular market, because we have not measured one
 * and a supplier alleging one about its own region is self-serving. What it
 * does is describe what identity evidence exists on hose and fittings and how
 * to check it — which is useful whether the risk is counterfeiting, an honest
 * mix-up in a store, or a substitution nobody wrote down.
 *
 * `how-to-read-a-hose-layline` already covers reading the layline itself, so
 * this article links there rather than repeating it.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'verifying-a-genuine-hydraulic-hose',
  title: 'Verifying a genuine hydraulic hose: layline, batch and traceability',
  excerpt:
    'What identity evidence a hose and its fittings actually carry, how to check it on receipt, and why the weakest link is almost always the assembly rather than the hose.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Verifying a genuine hydraulic hose — traceability checks',
  seoDescription:
    'How to verify a hydraulic hose is the grade it claims to be: layline marking, batch and cure date, fitting identification and the receiving checks worth doing.',
  focusKeyword: 'genuine hydraulic hose',
  publishedAt: '2026-09-01T10:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The layline is the hose’s own identity statement: standard, size, pressure and manufacturer, printed along its length.',
        'A finished assembly hides most of that evidence under two ferrules, which is why the tag matters as much as the marking.',
        'Fittings carry far less identification than hose. This is where substitution is hardest to detect after the fact.',
        'The strongest practical check is consistency: layline, tag, certificate and invoice line all agreeing.',
        'Anything unmarked should be treated as unknown rather than as suspect — the correct response is to ask, not to assume.',
      ],
    },
    {
      type: 'lead',
      html: 'Verification is usually discussed as a counterfeiting problem, which makes it sound rare and dramatic. In practice most identity failures on a site are mundane: a coil re-labelled in a store, a substitution made in good faith during a breakdown and never written down, an assembly built from whatever was on the rack. The checks are the same either way, and they take a minute.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the hose says about itself.',
      anchor: 'the-layline',
    },
    {
      type: 'paragraph',
      html: 'Bulk hose carries a printed layline along its length giving, in some order, the manufacturer, the construction standard, the size, the maximum working pressure and often a date or batch reference. That is a complete identity statement and it repeats every metre or so, which means <strong>any offcut long enough to fit is long enough to identify</strong>.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A missing layline is a question, not a verdict.',
      body: 'Covers abrade, and a hose that has spent a year against a boom will have lost its printing where it rubbed. Absence of marking on a used hose means the evidence has worn off. Absence on a new coil is different and worth asking about before it goes on the rack.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Why an assembly is harder.',
      anchor: 'assemblies',
    },
    {
      type: 'paragraph',
      html: 'Crimping a fitting on each end covers a few centimetres of hose at both ends and nothing in between, so the layline survives — but the assembly now involves three or four components whose identity is not printed anywhere: the fitting, the ferrule, and the crimp specification that ties them to that hose. Those are established by <strong>records rather than by markings</strong>, which is exactly what a tag and a test certificate are for.',
    },
    {
      type: 'comparison_table',
      caption: 'Where identity evidence lives on a finished assembly',
      columns: ['Component', 'Evidence available', 'How strong'],
      rows: [
        { cells: ['Hose', 'Layline along the visible length', 'Strong, if legible'] },
        {
          cells: ['Fittings and ferrules', 'Part markings where present; otherwise the supplier’s records', 'Weak on the part, adequate on paper'],
          highlight: true,
        },
        { cells: ['The crimp', 'The assembler’s specification and test record', 'Only as good as the records kept'] },
        { cells: ['The assembly as a whole', 'Tag, proof-test certificate, invoice line', 'Strong when all three agree'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'This is the practical reason to buy assemblies from whoever will document them, and to insist on tagging even when nobody is auditing you. The tag is the only thing that survives the crate being opened.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'A receiving check that takes a minute.',
      anchor: 'receiving-check',
    },
    {
      type: 'decision_tree',
      heading: 'Four checks, in the order they catch things',
      intro: 'Do them on arrival, on the loading dock, before anything is put away.',
      branches: [
        {
          condition: 'Does the layline name the standard the order specified?',
          outcome: 'If not, stop here and ask',
          detail:
            'This catches grade substitution, which is the difference that matters most and is the easiest to see.',
        },
        {
          condition: 'Does the tag match the certificate, and the certificate match the invoice line?',
          outcome: 'Three documents, one item',
          detail:
            'A mismatch is usually clerical, and clerical mismatches are exactly what makes a document pack unusable in an audit later.',
        },
        {
          condition: 'Are the end connections the ones ordered, measured rather than eyeballed?',
          outcome: 'Check the seat, not the hex',
          detail: 'JIC, ORFS and BSP are routinely confused by appearance. A thread gauge settles it.',
        },
        {
          condition: 'Is there a date on the hose or the tag?',
          outcome: 'Record it — the clock starts now',
          detail:
            'Age matters for rubber whether or not the assembly is fitted immediately, and a date you did not record on arrival is one you will never recover.',
        },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Price is evidence too, in one direction only.',
      body: 'An offer well below the market for a branded construction is worth a question — not because low prices are inherently suspect, but because materials, wire count and cover compound are where cost is removed and none of those are visible. A satisfactory answer names the manufacturer and the standard and offers documentation. An unsatisfactory one talks about the price.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can you tell a counterfeit hose by looking at it?',
          answer:
            'Rarely, and not reliably. What you can do is check the markings, the documentation and the consistency between them — which catches substitution and mix-ups as well, and those are far more common.',
        },
        {
          question: 'What if the hose has no layline at all?',
          answer:
            'Treat it as unidentified. For a used hose that usually means the printing abraded away; for new stock, ask the supplier for the batch and the construction standard in writing before it is fitted to anything that carries pressure.',
        },
        {
          question: 'Do you supply hose with the manufacturer named?',
          answer:
            'Yes. The construction standard and the manufacturer are stated on the quotation rather than left to the layline to reveal, and assemblies are tagged with the hose, the fitting and the test date.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Want traceability on the next order?',
      body: 'Ask for the construction standard, the manufacturer and tagged assemblies on the quotation. It costs nothing, and it is the difference between a document pack that survives an audit and one that does not.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
