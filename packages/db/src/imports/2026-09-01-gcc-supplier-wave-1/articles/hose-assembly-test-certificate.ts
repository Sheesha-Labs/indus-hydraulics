import { AUTHOR_SLUG } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * What the proof test does and does not establish.
 *
 * The temptation with this article is to publish our own test pressures as a
 * table. We do not hold assembly-level test records as data anywhere the site
 * can read, and the multiples that matter — proof at twice working pressure,
 * minimum burst at four times — belong to the construction standards and are
 * cited as such rather than restated as ours.
 *
 * The claim about our own process (crimped, pressure-tested and tagged with
 * the hose, the fitting and the test date) is published and approved on
 * /markets/saudi-arabia and is reused verbatim in substance.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hose-assembly-test-certificate',
  title: 'What a hose assembly test certificate proves — and what it does not',
  excerpt:
    'A proof test is a pass or fail against a pressure, applied once, to a specific assembly. It is strong evidence of one thing and no evidence at all of several others people read into it.',
  categorySlug: 'gcc-compliance',
  authorSlug: AUTHOR_SLUG,
  seoTitle: 'Hose assembly test certificate — what a proof test proves',
  seoDescription:
    'What a hydraulic hose assembly proof-test certificate establishes, what it cannot tell you, and what to ask for alongside it on a documented order.',
  focusKeyword: 'hose assembly test certificate',
  publishedAt: '2026-09-01T08:35:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What does a hose assembly test certificate actually prove?',
      answer:
        'That this specific assembly, on the day it was made, held a stated pressure for a stated time without leaking or moving its fittings. That is a real and useful result: it catches a bad crimp, a wrong ferrule and a damaged fitting seat. It says nothing about how long the assembly will last, whether the hose grade is right for the application, or how it will behave under pressure cycling.',
    },
    {
      type: 'lead',
      html: 'Proof testing is the last thing that happens to an assembly before it is tagged and crated, and the certificate that comes out of it is the document most often quoted in purchase orders. It is worth understanding precisely, because it is strong evidence of one thing and is routinely read as evidence of three.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The test itself.',
      anchor: 'the-test',
    },
    {
      type: 'paragraph',
      html: 'A hydrostatic proof test fills the assembly with fluid, raises it to a defined pressure above the working pressure, holds it, and inspects for leakage, movement of the fitting relative to the hose, and any permanent change. It is <strong>non-destructive by design</strong> — the assembly is expected to survive it and be fitted afterwards. Burst testing, which destroys the sample, is a separate exercise carried out on samples from production rather than on the item you are buying.',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 1402',
      publisher: 'ISO',
      title: 'Rubber and plastics hoses and hose assemblies — Hydrostatic testing',
      summary:
        'Defines the method for hydrostatic testing of hose and hose assemblies, including proof testing, and the conditions under which the test is carried out. The construction standard for the hose — EN 853, EN 856 or the SAE 100R series — is what sets the pressures the test is applied at.',
      url: 'https://www.iso.org/standard/72888.html',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The multiples come from the construction standard, not the test method.',
      body: 'Proof and minimum burst pressures are expressed as multiples of the maximum working pressure in the standard the hose is built to. That is why a certificate is only meaningful alongside the grade: "proof tested" with no stated pressure and no stated standard is a sentence, not a result.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What it does not establish.',
      anchor: 'what-it-misses',
    },
    {
      type: 'comparison_table',
      caption: 'Read carefully: three things a passed proof test does not tell you',
      columns: ['Question', 'Does the certificate answer it?', 'What does'],
      rows: [
        {
          cells: [
            'Will this assembly survive in service?',
            'No — it is a single static hold, not a cycling test',
            'Correct grade selection, routing and bend radius',
          ],
          highlight: true,
        },
        {
          cells: [
            'Is the hose right for this fluid and temperature?',
            'No',
            'The tube compound and temperature rating on the specification',
          ],
        },
        {
          cells: [
            'Was the right hose used?',
            'Not on its own',
            'The layline recorded on the tag and the batch traceability behind it',
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'The third row is the one worth dwelling on. A proof test confirms the assembly held pressure; it does not confirm that the hose in it is the grade the drawing called for, because a lower-grade hose will also hold a proof pressure applied against the lower grade’s own rating. <strong>Traceability, not the pressure test, is what proves the right hose was used.</strong> The two documents belong together and answer different questions.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'What a useful certificate carries.',
      anchor: 'what-it-carries',
    },
    {
      type: 'paragraph',
      html: 'A certificate that can be checked against the item in your hand is more valuable than a longer one that cannot. The connection between the paper and the part is the whole point.',
    },
    {
      type: 'comparison_table',
      caption: 'Fields that make a certificate checkable',
      columns: ['Field', 'Why it earns its place'],
      rows: [
        { cells: ['Assembly identifier, matching the tag', 'Ties the document to one physical item'] },
        { cells: ['Hose grade and layline detail', 'Lets a receiving inspector verify the construction'] },
        { cells: ['Fitting and ferrule references', 'The crimp is only right for a stated combination'] },
        { cells: ['Test pressure and hold time', 'Without these the result is not interpretable'] },
        { cells: ['Test date', 'Also the date the assembly’s service life starts being counted from'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'An untagged assembly makes its own certificate useless.',
      body: 'A crate of identical-looking assemblies with one certificate covering them all cannot be reconciled to anything once the crate is opened. If the documentation matters enough to specify, specify the tag as well — the certificate is only as good as its ability to point at one item.',
    },
    {
      type: 'paragraph',
      html: 'Assemblies leaving Dubai are crimped, pressure-tested and shipped as finished items, tagged with the hose, the fitting and the test date. That tag is what makes a hose register possible at the other end, and it is the reason a documented order is worth asking for even when nobody is auditing you.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is every assembly proof tested, or a sample?',
          answer:
            'That is a scope question worth settling in the order. Testing every assembly and testing a sample are both defensible practices for different jobs, but they produce different documents — and a certificate covering a batch is not evidence about an individual item in it.',
        },
        {
          question: 'Does a proof test damage the hose?',
          answer:
            'A correctly applied proof test is non-destructive; the assembly is designed to take it and remain in service. Repeated proof testing of the same assembly is not free of consequence, which is why re-testing a returned assembly is a decision rather than a routine.',
        },
        {
          question: 'Can you supply certificates for assemblies made from customer-supplied hose?',
          answer:
            'The proof test can be carried out and certified. The traceability half cannot be, because the batch history of hose we did not supply is not ours to attest to — and a certificate should not imply otherwise.',
        },
      ],
    },

    {
      type: 'cta_block',
      heading: 'Need assemblies with documentation?',
      body: 'Tell us what the purchase order asks for — proof test, material certificates, tags, a register — and we will confirm what travels with the consignment before it is made, rather than after.',
      quoteLabel: 'Ask for a quotation',
    },
  ],
}

export default ARTICLE
