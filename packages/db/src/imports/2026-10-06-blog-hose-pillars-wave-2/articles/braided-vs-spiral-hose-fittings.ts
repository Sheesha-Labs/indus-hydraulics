import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Braided-hose against spiral-hose crimp fittings, read from the 32 + 32
 * listings: hose compatibility, end families, size ranges, standards and the
 * Parker series each listing cross-references.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'braided-vs-spiral-hose-fittings',
  title: 'Braided against spiral hose fittings: why the same thread comes in two crimp series',
  excerpt:
    'A JIC female swivel for 2SN and a JIC female swivel for 4SP look alike and are different parts. Which hoses each series fits, the end families in each, and what happens when they are swapped.',
  categorySlug: 'hose-assembly',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T14:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between braided and spiral hose fittings?',
      answer:
        'They are made for different hose constructions. Braided-hose crimp fittings fit wire-braid hose — on our listings EN 853 1SN and 2SN and SAE 100R1AT, 100R2AT, 100R16 and 100R17. Spiral-hose crimp fittings fit four-spiral hose — EN 856 4SP and SAE 100R12. The thread end can be identical; the hose end, the ferrule and the crimp specification are not, and a fitting crimped onto the wrong construction cannot be given a rating.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Braided series: for 1SN, 2SN, R1AT, R2AT, R16 and R17. Spiral series: for 4SP and R12.',
        'The thread end can be the same — JIC, ORFS, BSP, DIN, Komatsu, SAE flange — while the crimp end differs.',
        'Our listings cross-reference the braided series to Parker 43 series parts and the spiral series to Parker 71 series parts.',
        '4SH, R13 and R15 are outside both series; they take their own fittings and skive or interlock ferrules.',
        'Order the fitting by thread, size, shape and the hose it goes on — never by thread alone.',
      ],
    },
    {
      type: 'lead',
      html: 'Two JIC 37° female swivels of the same size can sit side by side in a drawer and look identical from the nut end. One is made for two-wire braid, the other for four-spiral hose, and they are <strong>not interchangeable</strong>. The thread end of a hose fitting is chosen by the port; the crimp end is chosen by the hose, and that is the half people forget to specify.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Why there are two series.',
      anchor: 'why',
    },
    {
      type: 'paragraph',
      html: 'Braided hose has one or two layers of interwoven wire; spiral hose has four layers laid in alternating helices, a thicker wall and a larger outside diameter for the same bore. The ferrule has to grip each construction differently — on spiral hose it typically has to bite into the wire layers to hold the pressure the hose is rated for — so the stem, the ferrule and the crimp diameter are designed for one construction. A braided-hose fitting crimped onto spiral hose, or the reverse, is an assembly no maker has a specification for.',
    },
    {
      type: 'comparison_table',
      caption: 'The two series on our shelves',
      columns: ['Property', 'Braided-hose crimp fittings', 'Spiral-hose crimp fittings'],
      rows: [
        { cells: ['Hose (listing)', 'EN 853 1SN, 2SN; SAE 100R1AT, 100R2AT, 100R16, 100R17', 'EN 856 4SP; SAE 100R12'], highlight: true },
        { cells: ['Parker series cross-referenced', '43 series (e.g. 10643, 1JC43)', '71 series (e.g. 10671, 16A71)'] },
        { cells: ['JIC 37° female swivel', '−04 to −32', '−06 to −32'] },
        { cells: ['ORFS female swivel', '−04 to −24', 'Listed (straight, 45°, 90°, 90° long drop)'] },
        { cells: ['SAE flange heads', 'Code 61 and Code 62, straight, 45°, 90°', 'Code 61 and Code 62 (Code 62 −12 to −32)'] },
        { cells: ['Material', 'Carbon steel, zinc-plated Cr3+; 316 on request', 'Carbon steel, zinc-plated Cr3+; 316 on request'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The same end families in both.',
      anchor: 'families',
    },
    {
      type: 'paragraph',
      html: 'Both series cover the same thread families, so the choice of series never limits the port you can reach: BSP female swivel 60° cone (straight, 45°, 90°), JIC 37° female swivel and male, ORFS female swivel, DIN light and heavy 24° cone female swivel and male, Komatsu JIS metric 30° and JIS BSP 30° female swivels, SAE 45° flare female, NPT male (rigid and swivel), SAE O-ring boss male, and SAE Code 61 and Code 62 flange heads. Our JIC ends follow SAE J514 and ISO 8434-2; ORFS SAE J1453 and ISO 8434-3; flange heads SAE J518 and ISO 6162.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Hoses outside both series.',
      anchor: 'outside',
    },
    {
      type: 'paragraph',
      html: '4SH, R13 and R15 are heavier spiral constructions than 4SP and R12, and they are not on either listing. They take fittings and ferrules specified for them: our crimp ferrule shelf lists a skive interlock ferrule for 4SH, skive ferrules for 4SH in DN10 to DN16, a DIN 20023 skive ferrule for 4SH and R12 in −32, and a double-skive ferrule for R13. Compact 1SC and 2SC have a smaller outside diameter than standard braid, so confirm the ferrule specified for the compact hose before crimping.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Wrong series, no rating.',
      body: 'A fitting that physically fits a hose is not evidence that it is the right fitting. A braided-hose fitting on spiral hose can hold a static proof test and then release under impulse, taking the fitting off the hose at full pressure. If you are not sure which series is on a hose, cut it off and replace it.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Ordering the right one.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'A hose fitting order needs five things: the thread family and size at the port, the gender, the shape (straight, 45°, 90°, long drop), and the hose the fitting goes on — grade and dash size. The last item picks the series. Where the old assembly is available, the hose layline answers it; where it is not, the hose outside diameter and wire layers seen at a cut end will. See the <a href="/blog/hydraulic-hose-assembly-guide">hose assembly guide</a> for the full build.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can I use a braided hose fitting on spiral hose?',
          answer:
            'No. Braided-hose fittings are made for wire-braid hose; spiral hose needs a spiral series fitting and ferrule. There is no published crimp specification for the mismatch.',
        },
        {
          question: 'Which hoses do your spiral hose fittings fit?',
          answer:
            'EN 856 4SP and SAE 100R12, per our listings. 4SH, R13 and R15 take their own fittings and ferrules.',
        },
        {
          question: 'What are Parker 43 and 71 series?',
          answer:
            'Parker\'s crimp fitting series for braided and spiral hose respectively. Our braided and spiral fittings list the Parker part they cross-reference, such as 10643 or 10671.',
        },
        {
          question: 'Do both series come in the same thread families?',
          answer:
            'Yes — BSP, JIC, ORFS, DIN light and heavy, Komatsu and JIS 30°, SAE 45°, NPT, O-ring boss and SAE flange heads are listed in both.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Braided-hose crimp fittings',
      skus: ['IH-CF43-JICF', 'IH-CF43-ORFSF', 'IH-CF43-BSPF', 'IH-CF43-DINHF', 'IH-CF43-KOMF', 'IH-CF43-C61'],
    },
    {
      type: 'product_embed',
      heading: 'Spiral-hose crimp fittings',
      skus: ['IH-CF71-JICF', 'IH-CF71-ORFSF', 'IH-CF71-BSPF', 'IH-CF71-DINHF', 'IH-CF71-C62', 'IH-CF71-KOMF'],
    },
    {
      type: 'category_link',
      slug: 'braided-hose-crimp-fittings',
      label: 'Braided hose crimp fittings',
      blurb: '32 end styles for 1SN, 2SN, R1AT, R2AT, R16 and R17.',
    },
    {
      type: 'category_link',
      slug: 'spiral-hose-crimp-fittings',
      label: 'Spiral hose crimp fittings',
      blurb: '32 end styles for 4SP and R12.',
    },
    {
      type: 'category_link',
      slug: 'crimp-ferrules',
      label: 'Crimp ferrules',
      blurb: 'Including skive and interlock ferrules for 4SH, R12 and R13.',
    },

    {
      type: 'cta_block',
      heading: 'Not sure which series a hose needs?',
      body: 'Send a photograph of the layline, or of a cut end with a ruler, and the thread at the port. We will name the series and quote fitting and ferrule together.',
      quoteLabel: 'Quote hose fittings',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Hose compatibility, end families, sizes, standards and cross-references checked against our crimp fitting and ferrule listings.',
    },
  ],
}

export default ARTICLE
