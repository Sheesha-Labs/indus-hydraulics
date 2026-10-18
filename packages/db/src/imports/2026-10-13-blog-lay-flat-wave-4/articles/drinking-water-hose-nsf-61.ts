import type { BlogArticleSeed } from '../shared'

/**
 * Drinking-water hose and NSF/ANSI/CAN 61. Checked 2026-10-14: scope and limits (UL, SCC), 2023
 * edition approval (SCC — later editions not verified, so no edition year is claimed in copy),
 * certification process (NSF), NSF/ANSI/CAN 372 and SDWA 0.25% (EPA), NSF listing database and
 * water-contact temperature codes, ASDWA 2019 survey, UK WRAS/BS 6920/Reg 31 (WRAS, DWI), 4MS
 * (UBA). NO Gulf acceptance is claimed (not verified). IH-LF-TPW: maker lists NSF/ANSI 61 — we ask
 * buyers to request the certificate; Indus does not claim the certification itself.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'drinking-water-hose-nsf-61',
  title: 'Drinking-water hose and NSF/ANSI 61: what the certification means and how to check it',
  excerpt:
    '“NSF 61 certified” is the line buyers look for on drinking-water hose — but what does it actually cover, what does it not, and how do you check that the hose in front of you is the one that was certified? A plain guide to NSF/ANSI/CAN 61, its lead-content partner NSF 372, how to read a listing, and how it compares with UK WRAS and Regulation 31 and the European 4MS approach.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Drinking Water Hose and NSF/ANSI 61: What It Means',
  seoDescription:
    'What NSF/ANSI/CAN 61 certification covers for drinking-water hose, what it does not (pressure, performance), NSF 372 and the 0.25% lead-free rule, how to verify a listing, and how it compares with WRAS, Regulation 31 and 4MS.',
  focusKeyword: 'nsf 61 drinking water hose',
  publishedAt: '2026-10-14T07:20:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'NSF/ANSI/CAN 61 is a health-effects standard: it tests what leaches from a product into drinking water against health-based limits.',
        'It says nothing about pressure rating, performance, taste and odour, or microbial growth.',
        'Lead content is covered separately by NSF/ANSI/CAN 372 and the US “lead free” limit of 0.25% weighted average on wetted surfaces.',
        'Check the listing itself: the exact product, size, water-contact temperature and any footnotes on use.',
        'In the UK the route is WRAS approval and BS 6920 testing, and Regulation 31 for public supply; in parts of Europe, national schemes harmonised under the 4MS initiative.',
      ],
    },
    {
      type: 'lead',
      html: 'Temporary drinking-water lines — bypass mains, camp and event supplies, emergency relief after floods — put hose in contact with water people will drink. Buyers rightly ask whether the hose is approved for it, and in much of the world the answer they look for is <strong>NSF/ANSI/CAN 61</strong>. It is a meaningful certification, but a narrow one, and the listing details matter. This guide explains what it covers, how to check it, and how it relates to the approvals used in the UK and Europe.',
    },

    { type: 'section_head', number: '/01', title: 'What NSF/ANSI/CAN 61 covers.', anchor: 'scope' },
    {
      type: 'paragraph',
      html: 'NSF/ANSI/CAN 61, <em>Drinking Water System Components — Health Effects</em>, is published by NSF International and adopted as an American National Standard and a National Standard of Canada. It covers products that contact drinking water — pipes and hoses, fittings, tanks, gaskets and seals, coatings and linings, process media and mechanical devices — and tests them for <strong>contaminants that leach into the water</strong>, judged against health-based limits. Certification is done by accredited third-party bodies: a review of the product’s formulation, laboratory testing, a factory inspection, and then ongoing audits and retesting, usually annually. A change of formulation must be reported.',
    },
    {
      type: 'direct_answer',
      question: 'What does NSF 61 certification mean for a hose?',
      answer:
        'It means an accredited body has tested the hose and found that substances leaching from it into drinking water are within health-based limits, under the conditions in its listing, and audits production to keep it that way. It does not certify pressure rating, durability, taste and odour or microbial growth.',
    },

    { type: 'section_head', number: '/02', title: 'What it does not cover.', anchor: 'limits' },
    {
      type: 'prose',
      html: '<ul><li><strong>Pressure and performance.</strong> NSF 61 sets no requirements for pressure rating, burst or durability — check the hose’s own rating separately. See <a href="/blog/lay-flat-hose-pressure-ratings">lay flat hose pressure ratings</a>.</li><li><strong>Taste, odour and microbial growth.</strong> Not part of NSF 61 (they are part of the UK’s BS 6920 testing).</li><li><strong>Lead content.</strong> Assessed under the separate NSF/ANSI/CAN 372. Under the US Safe Drinking Water Act, “lead free” means no more than 0.25% lead, weighted average, across wetted surfaces.</li><li><strong>Installation hygiene.</strong> A certified hose still has to be stored clean, flushed and disinfected to the water authority’s procedure before use.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'How to check a listing.', anchor: 'verify' },
    {
      type: 'paragraph',
      html: 'Certification belongs to a specific product, made at a specific plant, in specific sizes, for specific conditions. Look the product up in the certifier’s online listing — NSF’s database searches by company, trade name and product type — and check the exact row:',
    },
    {
      type: 'comparison_table',
      caption: 'Reading an NSF/ANSI/CAN 61 listing',
      columns: ['Check', 'What to look for'],
      rows: [
        { cells: ['Product and trade name', 'The exact hose you are buying, not a related product from the same maker'] },
        { cells: ['Size', 'Your bore is in the listed sizes'] },
        { cells: ['Water contact temperature', 'CLD 23 (cold, 23 °C), D. HOT (60 °C) or C. HOT (82 °C) — the listing must cover your water temperature'], highlight: true },
        { cells: ['Footnotes and restrictions', 'Limits on surface area to volume, end use or conditions'] },
        { cells: ['Currency', 'The listing is current; certifiers advise confirming with them'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Ask for the certificate, then check it.',
      body: 'A data sheet that says “NSF 61” is a claim, not proof. Ask for the certificate or listing reference with the quotation, and check it against the certifier’s online listing before the hose goes into service.',
    },

    { type: 'section_head', number: '/04', title: 'Where it is accepted.', anchor: 'acceptance' },
    {
      type: 'paragraph',
      html: 'In the <strong>United States</strong>, the major model plumbing codes require NSF 61-certified products, and a 2019 survey of state drinking-water agencies found 49 states requiring it through law, regulation or policy; in <strong>Canada</strong>, 11 of 13 provinces and territories. In the <strong>UK</strong>, the route is different: WRAS approval under the water fittings regulations, with non-metallic materials tested to <strong>BS 6920</strong> (which adds odour and flavour, appearance and microbial growth), and for products used by water companies in public supply, approval by the Drinking Water Inspectorate under <strong>Regulation 31</strong>. In <strong>Europe</strong>, Germany, France, the Netherlands and Denmark harmonise their acceptance testing through the 4MS initiative, applied through each country’s own law. In the Gulf, requirements are set by each country’s water authority — ask the authority or your consultant which approval it accepts before you order.',
    },
    {
      type: 'paragraph',
      html: 'Our <a href="/p/tpu-lay-flat-drinking-water-hose">TPU drinking-water hose</a> is blue for identification, and its manufacturer lists NSF/ANSI 61 certification; ask for the certificate with your quotation and check it as above. It is not a WRAS, Regulation 31 or 4MS-country approval — if your project needs one of those, tell us before ordering. For using it as a temporary main, see <a href="/blog/overland-pumping-water-main-bypass">over-pumping and water main bypass</a>.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Is NSF 61 the same as WRAS approval?', answer: 'No. NSF/ANSI/CAN 61 is the North American health-effects standard; WRAS approval and BS 6920 testing are the UK route, and Regulation 31 applies to products used in public water supply in England and Wales.' },
        { question: 'Does NSF 61 mean the hose is lead free?', answer: 'Lead content is assessed separately under NSF/ANSI/CAN 372; the US limit is 0.25% weighted average on wetted surfaces.' },
        { question: 'Does NSF 61 certify the hose’s pressure rating?', answer: 'No. It covers health effects only. Check the hose’s pressure rating separately.' },
        { question: 'Can NSF 61 hose be used with hot water?', answer: 'Only if the listing covers that temperature — check the water-contact temperature code: cold (23 °C), domestic hot (60 °C) or commercial hot (82 °C).' },
        { question: 'How do I verify an NSF 61 claim?', answer: 'Ask for the certificate, then look the exact product, size and temperature up in the certifier’s online listing.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Drinking-water hose',
      skus: ['IH-LF-TPW', 'IH-LF-CVG', 'IH-LF-CST'],
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'united-kingdom',
      label: 'Hose supply to the UK',
      blurb: 'Drinking-water and transfer hose for UK projects.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'saudi-arabia',
      label: 'Hose supply to Saudi Arabia',
      blurb: 'Temporary water supply hose for Saudi projects.',
    },
    {
      type: 'related_articles',
      slugs: ['overland-pumping-water-main-bypass', 'lay-flat-hose-in-gulf-heat', 'flood-response-pumping-lay-flat-hose', 'lay-flat-hose-guide'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'NSF/ANSI/CAN 61 and 372 scope from NSF, UL and the Standards Council of Canada; lead-free definition from the US EPA; acceptance from a 2019 ASDWA survey; UK from WRAS and DWI; 4MS from the German Environment Agency.',
    },
    {
      type: 'cta_block',
      heading: 'Need drinking-water hose?',
      body: 'Tell us the approval your authority requires, the bore, length and water temperature. We will confirm what can be supplied against it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
