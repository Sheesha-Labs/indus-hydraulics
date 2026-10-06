import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * EN 14420, read from the parts that cite it: EN 14420-5 GA and GI fittings,
 * the EN 14420-3 / DIN 2817 safety clamp and the cam and groove range
 * (EN 14420-7). The Guillemin female-thread listing also cites EN 14420-6 and
 * DIN 28450, which are tank-truck coupling standards rather than Guillemin; that
 * citation is not repeated here.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'en-14420-hose-fittings-explained',
  title: 'EN 14420 hose fittings explained: safety clamps, GA and GI tails, and cam locks',
  excerpt:
    'EN 14420 is the European family of standards for industrial hose fittings with clamp units. Which parts each section covers, what GA and GI mean, and how the safety clamp holds the hose.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T10:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is EN 14420?',
      answer:
        'EN 14420 is the European standard series for industrial hose fittings with clamp units — the threaded tails, safety clamps and couplings used on chemical, oil and steam transfer hose. In our range, EN 14420-3 covers the DIN 2817 safety clamp, EN 14420-5 the threaded GA (male) and GI (female) hose fittings that clamp works with, and EN 14420-7 the cam locking couplings.',
    },
    {
      type: 'key_takeaways',
      items: [
        'EN 14420-3 is the safety clamp, the same design known as DIN 2817: a forged two-piece clamp bolted around the hose over the fitting\'s collar.',
        'EN 14420-5 covers threaded hose fittings made for that clamp — GA with a male thread, GI with a female thread and a flat gasket.',
        'Our EN 14420-5 fittings run from 1/2" to 4" in brass, 304 or 316 stainless, with smooth or serrated tails.',
        'EN 14420-7 is the European cam locking coupling standard; our cam and groove range is listed to it and to MIL A-A-59326.',
        'The clamp and the fitting are a matched pair: the clamp grips a collar machined for it, which a plain barb does not have.',
      ],
    },
    {
      type: 'lead',
      html: 'Specifications for chemical, oil and steam transfer hose written in Europe — and a good many written in the Gulf for European-built plant — call up EN 14420. It is not one part but a family: a clamp, a set of threaded tails designed around that clamp, and the couplings that go on the other end. Knowing <strong>which section covers which part</strong> is most of what it takes to order an assembly that passes the inspection.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The safety clamp: EN 14420-3 / DIN 2817.',
      anchor: 'safety-clamp',
    },
    {
      type: 'paragraph',
      html: 'The core of the system is a forged two-piece clamp bolted around the hose. Its inside is shaped to grip both the hose cover and a collar on the fitting, so the clamp locks the fitting into the hose rather than just squeezing rubber onto a barb. The design is long known as DIN 2817 and is now EN 14420-3. Our clamp is listed in forged aluminium (6082 or 6061-T6), forged brass and 316 stainless, to suit the medium and the environment.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Clamp and fitting are a pair.',
      body: 'The safety clamp is made to grip a collar on an EN 14420-5 fitting. On a plain barbed nipple it has nothing to hold and becomes an expensive band clamp. Order the two together, in the same size.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The tails: EN 14420-5, GA and GI.',
      anchor: 'ga-gi',
    },
    {
      type: 'paragraph',
      html: 'EN 14420-5 covers threaded hose fittings made for the safety clamp. Two letters do most of the work: <strong>GA</strong> is the fitting with a male thread, <strong>GI</strong> the fitting with a female thread, which carries a flat gasket — PTFE or PU in our listings. Each comes with a smooth tail or a serrated one; the serrated tail adds grip in softer hose, the smooth tail suits linings that a serration would cut.',
    },
    {
      type: 'comparison_table',
      caption: 'Our EN 14420-5 fittings (1/2" – 4")',
      columns: ['Fitting', 'Thread', 'Materials / gasket'],
      rows: [
        { cells: ['GA, smooth tail', 'Male', 'Brass; 304 or 316 stainless'] },
        { cells: ['GA, serrated tail', 'Male', 'Brass; 304 or 316 stainless'] },
        { cells: ['GI, smooth tail', 'Female', 'Brass; 304 or 316 stainless; PTFE or PU gasket'], highlight: true },
        { cells: ['GI, serrated tail', 'Female', 'Brass; 304 or 316 stainless; PTFE or PU gasket'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Couplings on the other end: EN 14420-7.',
      anchor: 'couplings',
    },
    {
      type: 'paragraph',
      html: 'A GA or GI tail gives the hose a thread; what screws onto it depends on the plant. <strong>EN 14420-7</strong> covers cam locking couplings, and our cam and groove range is listed to it alongside the US MIL A-A-59326, so the A to F types interchange across the two. Where the plant runs another pattern, a thread adapter to that pattern completes the assembly.',
    },
    {
      type: 'paragraph',
      html: 'Not every part in an EN 14420 assembly cites the standard, and that is normal: hose is specified by its own standards, and flanges by theirs. What matters is that the clamp and tail are a matched EN 14420-3 and -5 pair, and that the assembly is rated at its weakest component — the hose, the coupling or the clamp.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is DIN 2817 the same as EN 14420-3?',
          answer:
            'Yes, in practice. The DIN 2817 safety clamp design is now standardised as EN 14420-3, and our clamp is listed to both designations.',
        },
        {
          question: 'What do GA and GI mean on an EN 14420-5 fitting?',
          answer:
            'GA is the fitting with a male thread; GI is the fitting with a female thread and a flat gasket. Both are made for the EN 14420-3 safety clamp.',
        },
        {
          question: 'Smooth or serrated tail?',
          answer:
            'Serrated tails add grip in softer hose; smooth tails suit hose linings that a serration could cut. Our EN 14420-5 range offers both in brass and stainless.',
        },
        {
          question: 'Which part of EN 14420 covers cam lock couplings?',
          answer:
            'EN 14420-7. Our cam and groove couplings are listed to EN 14420-7 and to MIL A-A-59326.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'EN 14420 clamp and fittings',
      skus: [
        'IH-CLP-SAFETY-14420-3',
        'IH-EN5-SS-GA-SERRATED',
        'IH-EN5-SS-GI-SERRATED',
        'IH-EN5-BR-GA-SERRATED',
        'IH-EN5-BR-GI-FLAT',
        'IH-EN5-SS-GI-FLAT',
        'IH-CGC-STD-C',
        'IH-CGC-STD-E',
      ],
    },
    {
      type: 'category_link',
      slug: 'en14420-5-fittings',
      label: 'EN 14420-5 fittings',
      blurb: 'GA and GI threaded hose fittings, smooth or serrated, 1/2" to 4".',
    },
    {
      type: 'category_link',
      slug: 'hose-clamps-sleeves-ferrules',
      label: 'Clamps, sleeves and ferrules',
      blurb: 'EN 14420-3 / DIN 2817 safety clamps, EN 14423 clamps and more.',
    },
    {
      type: 'category_link',
      slug: 'oil-chemical-purpose-hoses',
      label: 'Oil and chemical hose',
      blurb: 'UHMWPE chemical, oil suction and delivery, and multipurpose hose.',
    },

    {
      type: 'cta_block',
      heading: 'Working to an EN 14420 specification?',
      body: 'Send the hose, the bore, the medium and the coupling the plant needs. We will quote the safety clamps, the GA or GI tails and the couplings as a matched assembly.',
      quoteLabel: 'Quote EN 14420 fittings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Standards, sizes, materials and gaskets checked against our EN 14420-5, clamp and cam and groove listings.',
    },
  ],
}

export default ARTICLE
