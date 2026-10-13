import type { BlogArticleSeed } from '../shared'

/**
 * What a lifting gear test certificate proves, and how to read one.
 *
 * Sources checked 2026-10-01: LEEA 059-5 and 059-6 (documentation and marking
 * summaries of EN 818-4, EN 13414-1, EN 1492-1/-2, EN 1677, EN 13889, EN 818-2
 * — trade-body summaries, so described as what the standards ask for, not
 * quoted); Directive 2006/42/EC (Art. 2(d), Annex II 1.A, Annex I 4.3.2,
 * 4.4.1) and Regulation (EU) 2023/1230 consolidated text (applies from
 * 20 January 2027); UK LOLER 1998 Schedule 1 and reg. 9; OSHA 1910.184 (e)(4)
 * and (f)(4)(ii); RUD and Gunnebo statements on checking certificates before
 * first use; UAE rules as already verified (ADS 22 forms LE01/02/03; Dubai
 * GU48 certificate fields). EN 10204 types from a copy — kept to one line and
 * pointed at our existing EN 10204 article.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-gear-test-certificate',
  title: 'What a lifting gear test certificate proves — and how to read one',
  excerpt:
    'New lifting gear arrives with a manufacturer’s certificate; gear in service carries a report of thorough examination. They answer different questions. The first proves the item was made and tested to its standard; the second says it was fit to use on the day it was examined. Here is what each must contain, and the checks to make before the first lift.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting equipment test certificate: what it proves and how to read it',
  seoDescription:
    'How to read a lifting gear test certificate: manufacturer’s certificate vs declaration of conformity vs thorough examination report, the fields each must contain, and what to check before first use.',
  focusKeyword: 'lifting equipment test certificate',
  publishedAt: '2026-10-01T15:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A manufacturer’s test certificate proves the item was made and proof-tested to a stated standard. It says nothing about the item’s condition today.',
        'A report of thorough examination says the item was fit for service on the day a competent or third-party examiner inspected it.',
        'Under EU law, lifting accessories also need a declaration of conformity; the manufacturer’s certificate and the declaration can be one document.',
        'Before first use, match the traceability code and WLL on the certificate to the marking on the item. If they do not match, the certificate is not for that item.',
        'Keep the manufacturer’s certificate for the item’s whole life. Inspectors rely on it for the original rating.',
      ],
    },
    {
      type: 'lead',
      html: 'Rated lifting gear ships with a certificate, and every site inspector asks to see one. But “the certificate” can mean three different documents, issued by different people at different times, proving different things. Knowing which one you are holding is the difference between paperwork that protects you and paperwork that only looks as if it does.',
    },

    { type: 'section_head', number: '/01', title: 'Three different documents.', anchor: 'three-documents' },
    {
      type: 'comparison_table',
      caption: 'The paperwork that travels with lifting gear',
      columns: ['Document', 'Issued by, when', 'Proves'],
      rows: [
        { cells: ['Manufacturer’s test certificate', 'The maker, at manufacture', 'The item was made to the named standard and passed its proof or manufacturing test'], highlight: true },
        { cells: ['Declaration of conformity', 'The maker, at supply (EU and UK markets)', 'The item meets the legal safety requirements for lifting accessories'] },
        { cells: ['Report of thorough examination', 'A competent person or approved third party, in service', 'The item was fit for continued use on the day it was examined'] },
      ],
    },
    {
      type: 'direct_answer',
      question: 'What does a lifting equipment test certificate prove?',
      answer:
        'A manufacturer’s test certificate proves the item was made to a named standard and passed its proof test, and ties that to the item by a traceability code. It does not prove the item is fit to use now — that is the job of the periodic thorough examination report, issued by a competent person or approved third-party inspector.',
    },

    { type: 'section_head', number: '/02', title: 'The manufacturer’s certificate.', anchor: 'manufacturer-certificate' },
    {
      type: 'paragraph',
      html: 'The product standards set what the maker’s certificate must contain. The details vary by product, but a complete certificate gives you enough to identify the item, its rating and how it was tested:',
    },
    {
      type: 'comparison_table',
      caption: 'What the product standards ask a manufacturer’s certificate to show',
      columns: ['Product', 'Fields to look for'],
      rows: [
        { cells: ['Chain sling (EN 818-4)', 'Maker, date and authentication; standard; sling ID number; all components; chain size and grade; nominal length; WLL; proof force for welded slings'] },
        { cells: ['Wire rope sling (EN 13414-1)', 'Maker; standard; description with components; WLL and leg angles; static test coefficient of components'] },
        { cells: ['Webbing or round sling (EN 1492)', 'Maker; WLL and angle range; type, length and width; material; fitting grade; protection sleeves; standard; test references; traceability code; signatory and date'] },
        { cells: ['Components and fittings (EN 1677)', 'Maker, date and authentication; standard; code and description; grade; WLL; manufacturing proof force, and confirmation it was met'] },
        { cells: ['Shackles (EN 13889)', 'Maker; standard; traceability code; description; grade; WLL; confirmation the minimum breaking load was met'] },
        { cells: ['Chain sold by length (EN 818-2)', 'Proof force, breaking force and total elongation at fracture'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Material certificates to EN 10204 — types 2.1, 2.2, 3.1 and 3.2 — are a different thing again: they report on the steel or the product’s inspection, and a 3.1 certificate is validated by an inspector independent of production. Our <a href="/blog/material-test-certificate-en-10204">guide to EN 10204 certificates</a> explains the types.',
    },

    { type: 'section_head', number: '/03', title: 'The declaration of conformity.', anchor: 'declaration' },
    {
      type: 'paragraph',
      html: 'In the EU, slings and their components are classed as lifting accessories under the Machinery Directive, and must be supplied with an EC declaration of conformity. It names the manufacturer, identifies the product, states that it conforms, lists the standards applied, and is signed and dated. Lifting accessories must also be marked with their maximum working load and supplied with instructions that include the static test coefficient. Makers may combine the declaration and the manufacturer’s certificate into one document.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A change coming in January 2027.',
      body: 'The EU Machinery Regulation (EU) 2023/1230 replaces the Machinery Directive from 20 January 2027, with a new format for the declaration of conformity. Certificates issued for the European market will change format from that date; the rating and traceability checks below stay the same.',
    },

    { type: 'section_head', number: '/04', title: 'The report of thorough examination.', anchor: 'examination-report' },
    {
      type: 'paragraph',
      html: 'Once gear is in service, the certificate that matters is the latest examination report. In the UAE it is issued by an approved third-party inspector — in Abu Dhabi on standard forms for equipment found safe, found unsafe, or with a defect report; in Dubai, a certificate showing the item’s serial number, the tests done and its SWL. See our <a href="/blog/lifting-equipment-inspection-uae">guide to lifting inspection in the UAE</a>.',
    },
    {
      type: 'paragraph',
      html: 'The UK’s LOLER regulations, which Abu Dhabi’s inspection specification cites as a reference, list what such a report must contain. It is a useful checklist for any examination report:',
    },
    {
      type: 'prose',
      html: '<ul><li>Who owns the equipment, and where it was examined.</li><li>What was examined — an identification that matches the item.</li><li>Its safe working load.</li><li>The date of this examination and of the previous one, and the latest date for the next.</li><li>Whether it is safe to use, and any defect found — with the repair needed and, for defects that could become dangerous, the date by which to fix them.</li><li>Particulars of any test carried out.</li><li>The examiner’s name, qualifications and employer, and the date of the report.</li></ul>',
    },

    { type: 'section_head', number: '/05', title: 'Checks before the first lift.', anchor: 'checks' },
    {
      type: 'decision_tree',
      heading: 'Reading a certificate',
      intro: 'Five checks, every time.',
      branches: [
        { condition: 'Does the traceability or serial code match the item?', outcome: 'If not, the certificate belongs to something else.' },
        { condition: 'Does the WLL match the tag or stamp?', outcome: 'If they differ, the item does not lift until it is resolved.' },
        { condition: 'Is a standard named, and does it fit the product?', outcome: 'A sling certificate citing a component standard, or no standard at all, needs explaining.' },
        { condition: 'Is the test stated — proof force, and confirmation it was met?', outcome: 'For new gear, the manufacturer’s proof test; in service, the examination date.' },
        { condition: 'Is it signed, dated and from an identifiable issuer?', outcome: 'An unsigned or anonymous certificate is not evidence of anything.' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A certificate is not a substitute for examination.',
      body: 'A certificate proves what was true when the item was made or last examined. It cannot tell you about damage since. Pre-use checks and periodic examinations — against the criteria in our rejection criteria guide — are what keep the paperwork true.',
    },
    {
      type: 'paragraph',
      html: 'US rules make the same point from the other side: employers must keep the proof-test certificate for new, repaired or reconditioned alloy chain slings, and for wire rope slings with welded end attachments, which are proof-tested at twice their rated capacity. Makers add that the certificate should be checked against the tag before the first lift. Our <a href="/blog/lifting-gear-rejection-criteria">rejection criteria guide</a> covers what to look for between examinations.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is a manufacturer’s test certificate enough for a site inspection?',
          answer:
            'For new gear before its first examination, it is the starting document. Once the gear is in service, sites and regulators require periodic thorough examination reports — in the UAE, by an approved third-party inspector, typically every six months for lifting accessories.',
        },
        {
          question: 'What is the difference between a test certificate and a declaration of conformity?',
          answer:
            'The test certificate records how the item was made and tested. The declaration of conformity, required for lifting accessories on the EU market, is the maker’s legal statement that the product meets the safety requirements. They may be issued as one document.',
        },
        {
          question: 'What should I do if the certificate and the tag do not match?',
          answer:
            'Do not use the item until the discrepancy is resolved with the supplier. A certificate whose traceability code or WLL does not match the item is not evidence for that item.',
        },
        {
          question: 'How long should I keep a lifting gear certificate?',
          answer:
            'For the life of the item. The manufacturer’s certificate records the original rating that every later examination is checked against.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'lifting-rigging-equipment-uae',
      label: 'Lifting & rigging equipment',
      blurb: 'Slings, shackles, hooks and chain, each supplied with the manufacturer’s test certificate.',
    },
    {
      type: 'related_articles',
      slugs: ['lifting-gear-rejection-criteria', 'lifting-equipment-inspection-uae', 'working-load-limit-vs-breaking-strength', 'material-test-certificate-en-10204'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Certificate contents from LEEA’s summaries of the EN product standards; EU requirements from Directive 2006/42/EC and Regulation (EU) 2023/1230; report contents from UK LOLER 1998 Schedule 1; US requirements from 29 CFR 1910.184.',
    },
    {
      type: 'cta_block',
      heading: 'Need certificates for an inspection?',
      body: 'Rated lifting items we supply ship with the manufacturer’s test certificate. Tell us what your inspector or client requires, and we will confirm what we can provide with the quotation.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
