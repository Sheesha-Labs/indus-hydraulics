import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * EN 10204 certificate types, explained for the person writing or reading the
 * purchase-order clause rather than for a metallurgist.
 *
 * The distinction that matters commercially is 2.2 versus 3.1: whether the
 * results are the manufacturer's general test data or an actual test on the
 * batch supplied, validated by someone independent of the production
 * department. Almost every dispute about "we sent certificates and they were
 * rejected" is that line.
 *
 * Nothing here claims we hold 3.1 documents for any particular product family
 * — availability is per item and per batch, and the article says so.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'material-test-certificate-en-10204',
  title: 'Material test certificate: EN 10204 3.1 vs 2.2 on hydraulic fittings',
  excerpt:
    'The difference between a 2.2 and a 3.1 is not detail — it is whether the numbers came from your batch. That single distinction is behind most rejected document packs.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'EN 10204 3.1 vs 2.2 material test certificate for fittings',
  seoDescription:
    'What EN 10204 inspection document types mean on hydraulic fittings and adapters, when a 3.1 is genuinely required, and how to write the clause so it can be met.',
  focusKeyword: 'material test certificate',
  publishedAt: '2026-09-01T09:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A 2.2 reports the manufacturer’s test results on the product type. A 3.1 reports tests on the actual batch supplied, validated by someone independent of production.',
        'A 3.2 adds validation by a second party — the customer’s inspector or a nominated body.',
        'The certificate is traceable to a heat or batch number, and that number has to appear on or with the goods for the document to mean anything.',
        'A 3.1 cannot be produced after the fact for stock that was never batch-traced. Ask before the order, not on receipt.',
        'Specify the type by its EN 10204 designation. "Mill certificate" and "MTC" mean different things to different suppliers.',
      ],
    },
    {
      type: 'lead',
      html: 'A material test certificate is the document most often specified and least often read closely. Material certificates come up on any order where the metallic parts carry pressure or go somewhere regulated, and they are the most misunderstood documents in the pack. The confusion is not about metallurgy. It is that four superficially similar documents have very different evidential weight, and purchase orders routinely ask for one and accept another.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The four types, in the order of what they prove.',
      anchor: 'the-types',
    },
    {
      type: 'comparison_table',
      caption: 'EN 10204 inspection documents',
      columns: ['Type', 'What it reports', 'Who attests it'],
      rows: [
        {
          cells: [
            '2.1',
            'A declaration of compliance with the order — no test results',
            'The manufacturer',
          ],
        },
        {
          cells: [
            '2.2',
            'Test results, but from non-specific inspection of the product type',
            'The manufacturer',
          ],
        },
        {
          cells: [
            '3.1',
            'Test results from the actual batch supplied',
            'The manufacturer’s inspection representative, independent of production',
          ],
          highlight: true,
        },
        {
          cells: [
            '3.2',
            'Test results from the batch supplied, jointly validated',
            'The manufacturer plus the purchaser’s inspector or a nominated body',
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'The step that matters is between 2.2 and 3.1. Both carry numbers, and to a reader who is checking that a document exists they look equivalent. They are not: a 2.2 says <em>this is what this product normally tests at</em>, and a 3.1 says <em>this is what the material in your box actually tested at</em>. Only the second is traceable to your goods.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A 3.1 cannot be created retrospectively.',
      body: 'It certifies tests carried out on an identified heat or batch, so it depends on the batch having been tracked from the mill through manufacture to the shelf. If an item was bought as untraced stock, no amount of paperwork later produces a valid 3.1 for it. This is why the requirement has to be known before the order is placed, and why "we will send the certificates with the goods" is not always a promise that can be kept.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'When a 3.1 is genuinely required.',
      anchor: 'when-required',
    },
    {
      type: 'paragraph',
      html: 'Specifying 3.1 on everything is a common defensive habit and it has a cost: it narrows the supply to traced stock, and it slows an order that did not need slowing. The requirement earns its place where the <strong>material itself is a safety variable</strong> — pressure-containing parts in an audited plant, sour-service duty, class-approved marine work, or anywhere a regulator or client will later ask to see the chain from the mill.',
    },
    {
      type: 'decision_tree',
      heading: 'Which certificate to specify',
      branches: [
        {
          condition: 'General mobile equipment, workshop and fleet work',
          outcome: 'A 2.2 or a declaration of conformity is usually proportionate',
          detail:
            'The evidence that matters here is the assembly proof test and the traceability of the hose, not the heat number of the adapter.',
        },
        {
          condition: 'Pressure-containing parts in a plant with an audit regime',
          outcome: '3.1 on the metallic parts',
          detail:
            'Specify it at enquiry so availability can be checked against traced stock before anything is promised.',
        },
        {
          condition: 'Sour service, or a client who nominates their own inspector',
          outcome: '3.1 as a minimum, and 3.2 where the inspector is to witness',
          detail:
            'A 3.2 has scheduling consequences, because the second party has to be present. It is a project decision, not a stock decision.',
        },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Writing the clause so it can be met.',
      anchor: 'the-clause',
    },
    {
      type: 'paragraph',
      html: 'Three details turn an unanswerable clause into a quotable one: the <strong>designation</strong> (say "EN 10204 3.1", not "mill certificate"), the <strong>scope</strong> (which line items — fittings and ferrules, or everything including clamps), and whether the certificate must be <strong>traceable to a marking on the part</strong>. That last one is the difference between a document pack and an auditable one.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Ask what is actually available before you commit to a delivery date.',
      body: 'Availability of 3.1 documentation is per item and per batch, not a property of a supplier. The right question at enquiry is "which of these lines can you supply with 3.1, and what does it do to the lead time" — and a supplier who answers that honestly, including where the answer is no, is the one to keep.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is an MTC the same as an EN 10204 3.1?',
          answer:
            '"MTC" is used loosely for anything from a 2.1 declaration to a full 3.1. Because the term has no fixed meaning across suppliers, specify the EN 10204 type and avoid the abbreviation in the purchase order.',
        },
        {
          question: 'Do hoses have material certificates?',
          answer:
            'Rubber hose is documented differently — by construction standard, batch and layline rather than by heat number. EN 10204 documents belong to the metallic parts: fittings, adapters, ferrules and flanges.',
        },
        {
          question: 'Can you supply 3.1 certificates for stainless fittings?',
          answer:
            'Where the stock is traced, yes; where it is not, we will say so rather than send a 2.2 and hope it passes. Ask at enquiry with the line items listed and we will answer per line.',
        },
        {
          question: 'What does a certificate need to be checkable against?',
          answer:
            'A heat or batch number that appears on the goods, the packing or the tag. A certificate quoting a number that appears nowhere on what arrived cannot be reconciled by a receiving inspector.',
        },
      ],
    },

    {
      type: 'category_link',
      slug: 'stainless-steel-hydraulic-fittings',
      label: 'Stainless steel fittings',
      blurb: 'SS316L for coastal, offshore and chemical service.',
    },
    {
      type: 'cta_block',
      heading: 'Order with a documentation clause?',
      body: 'Send the clause with the line list. We will tell you, line by line, which certificates can be supplied against stock and which would need a traced batch ordered in — before you commit to a date.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
