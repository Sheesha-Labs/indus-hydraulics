import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * R, RX and BX ring joint gaskets, read from the 59 listings: style, flange
 * pairing, pitch diameter, section dimensions and materials. Several flow
 * iron listings call 2-1/16" to 7-1/16" 3K and 5K flanges "API 6BX" with a BX
 * groove; at those sizes and pressures API 6A uses 6B flanges with R or RX
 * rings, which is what the ring listings themselves say and what this follows.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'ring-joint-gaskets-r-rx-bx',
  title: 'R, RX and BX ring joint gaskets: which ring fits which flange',
  excerpt:
    'Ring joint gaskets look interchangeable and are not. How R, RX and BX rings differ, which flanges each one fits, why R-45 and R-46 share a diameter but not a groove, and what to check before making up a joint.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T00:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between R, RX and BX ring gaskets?',
      answer:
        'R rings are oval or octagonal in section and fit ASME B16.5 ring-joint flanges and API 6B flanges. RX rings are pressure-energised and fit the same API 6B grooves as the R ring of the same number. BX rings are a separate family for API 6BX flanges — 10,000, 15,000 and 20,000 psi, and 5,000 psi from 13-5/8" up — and carry a pressure-passage hole. A BX ring never goes in an R groove, and an R or RX ring never goes in a 6BX flange.',
    },
    {
      type: 'key_takeaways',
      items: [
        'R: oval or octagonal, for ASME B16.5 RTJ flanges (Class 150 to 2500) and API 6B flanges.',
        'RX: pressure-energised, interchangeable with the R ring of the same number in API 6B flanges — RX-24 and R-24 share a 3.750 in pitch diameter.',
        'BX: API 6BX flanges only, at 10K, 15K and 20K, and at 5K from 13-5/8" up. Not interchangeable with R or RX.',
        'Same pitch diameter does not mean same ring: R-45 and R-46 are both 8.313 in, but 0.438 in and 0.500 in wide.',
        'Rings are listed in soft iron, low carbon steel, F5, 304, 316, 321, 347, 410, Alloy 625 and Alloy 825. The ring must be softer than the groove.',
      ],
    },
    {
      type: 'lead',
      html: 'A ring joint seals by crushing a metal ring into a groove machined in each flange face, so the ring and the groove have to match exactly. There are three families of ring, each tied to a family of flange, and <strong>the ring number alone does not tell you which family you are in</strong>. Get the family right first; the number and the material follow.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Three families, three flange types.',
      anchor: 'families',
    },
    {
      type: 'comparison_table',
      caption: 'Examples from our ring gasket listings',
      columns: ['Ring', 'Flanges (as listed)', 'Key dimensions'],
      rows: [
        { cells: ['R-24', 'ASME NPS 2 Class 900 / 1500; API 6B 2-1/16" 3K / 5K', 'P 3.750 in, width 0.438 in, octagonal height 0.630 in'], highlight: true },
        { cells: ['RX-24', 'API 6B 2-1/16" 3K / 5K', 'P 3.750 in, OD 4.172 in, height 1.000 in'] },
        { cells: ['R-45', 'ASME NPS 6 Class 300 / 600 / 900; API 6B 7-1/16" 2K / 3K', 'P 8.313 in, width 0.438 in'] },
        { cells: ['R-46', 'ASME NPS 6 Class 1500; API 6B 7-1/16" 5K', 'P 8.313 in, width 0.500 in'] },
        { cells: ['RX-46', 'API 6B 7-1/16" 5K', 'P 8.313 in, OD 8.750 in, height 1.125 in'] },
        { cells: ['BX-152', 'API 6BX 2-1/16" 10K / 15K / 20K', 'OD 3.334 in, height and width 0.403 in'] },
        { cells: ['BX-155', 'API 6BX 4-1/16" 10K / 15K / 20K', 'OD 5.825 in, height and width 0.560 in'] },
        { cells: ['BX-160', 'API 6BX 13-5/8" 5K', 'OD 15.850 in, pressure-passage hole 0.120 in'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'R rings: oval or octagonal.',
      anchor: 'r',
    },
    {
      type: 'paragraph',
      html: 'R rings are made to ASME B16.20 and API 6A and fit ASME B16.5 ring-joint flanges from Class 150 to Class 2500 and API 6B flanges at 2,000, 3,000 and 5,000 psi. They come in two sections. The octagonal ring seats on its angled faces in a modern flat-bottomed groove; the oval ring can sit in either a flat-bottomed groove or the older round-bottomed type. One ring number can serve several flanges — R-24 is listed for NPS 2 Class 900 and 1500 and for API 2-1/16" at 3K and 5K — which is why the number, not the flange size, is what to order.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'RX rings: same groove, pressure-energised.',
      anchor: 'rx',
    },
    {
      type: 'paragraph',
      html: 'An RX ring is taller and has an asymmetric section that the line pressure pushes harder against the groove, so the seal improves as pressure rises. It is designed for the same groove as the R ring of the same number in an API 6B flange: RX-24 and R-24 share a 3.750 in pitch diameter, but RX-24 is 1.000 in tall against 0.630 in for an octagonal R-24. Because the RX ring is taller, the gap left between the flange faces after make-up differs from an R ring\'s, so check it against the flange data rather than assuming.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'BX rings: the 6BX family.',
      anchor: 'bx',
    },
    {
      type: 'paragraph',
      html: 'BX rings are for API 6BX flanges: every size at 10,000, 15,000 and 20,000 psi, and the large sizes at lower pressure — on our listings BX-160 for 13-5/8" 5K, BX-163 for 18-3/4" 5K and BX-165 for 21-1/4" 5K. Each BX ring carries a small pressure-passage hole (0.060 in on BX-152, 0.120 in on BX-160) so pressure cannot be trapped between the ring and the groove. BX numbers start at 150 and share nothing with the R and RX series; there is no substitute across the families.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Same diameter, different ring.',
      body: 'R-45 and R-46 both have an 8.313 in pitch diameter, but R-45 is 0.438 in wide and R-46 is 0.500 in. One fits 7-1/16" 2K and 3K flanges, the other 7-1/16" 5K. Order by ring number, and check the ring number marked on the flange or in its documentation, not just the bore and pressure.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Material, hardness and reuse.',
      anchor: 'material',
    },
    {
      type: 'paragraph',
      html: 'Our rings are listed in soft iron (D), low carbon steel (S), F5, 304, 316, 321, 347 and 410 stainless, Alloy 625 and Alloy 825. The ring has to be softer than the groove so that the ring deforms and the flange does not; a ring harder than the groove marks it and spoils the next seal. Match the material to the flange and the service, including any sour-service requirement, and check the ring\'s stamped number and material code before fitting. A ring is crushed into shape when the joint is made up, so treat ring gaskets as single-use.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Ordering the right ring.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Give the ring number and the material, and if the number is unknown, the flange standard (ASME B16.5, API 6B or API 6BX), the nominal size and the pressure class. For a full nipple-up, rings are best ordered with the studs and nuts for the same flange. Where the joint is on a wellhead, a valve or treating iron, see <a href="/blog/api-6a-nameplate-markings">reading an API 6A nameplate</a> for the material and temperature classes that apply to the whole assembly.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can an RX ring replace an R ring?',
          answer:
            'In an API 6B flange, an RX ring fits the same groove as the R ring of the same number. The flange gap after make-up will differ, because the RX ring is taller.',
        },
        {
          question: 'Can a BX ring be used in a 6B flange?',
          answer:
            'No. BX rings are only for API 6BX flanges, and R and RX rings are not used in 6BX flanges.',
        },
        {
          question: 'Which ring fits a 2-1/16" 10,000 psi flange?',
          answer:
            'BX-152, which our listing gives for API 6BX 2-1/16" at 10,000, 15,000 and 20,000 psi.',
        },
        {
          question: 'Can ring joint gaskets be reused?',
          answer:
            'Treat them as single-use. The ring deforms into the groove when the joint is made up and will not seal reliably a second time.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Ring joint gaskets',
      skus: ['IH-RTJ-R24', 'IH-RTJ-RX24', 'IH-RTJ-R46', 'IH-RTJ-RX46', 'IH-RTJ-BX152', 'IH-RTJ-BX155', 'IH-RTJ-BX160', 'IH-RTJ-BX159'],
    },
    {
      type: 'category_link',
      slug: 'ring-joint-gaskets',
      label: 'Ring joint gaskets',
      blurb: '59 R, RX and BX rings with dimensions and flange pairings.',
    },
    {
      type: 'category_link',
      slug: 'flow-iron-flanges-api',
      label: 'API flanges',
      blurb: 'Blind, companion, weld-neck and instrument flanges.',
    },

    {
      type: 'cta_block',
      heading: 'Not sure which ring a flange takes?',
      body: 'Send the flange standard, size and pressure class, or the number stamped on the old ring, and the service. We will confirm the ring and material and quote rings and bolting together.',
      quoteLabel: 'Quote ring gaskets',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Ring styles, flange pairings, dimensions and materials checked against our ring joint gasket listings.',
    },
  ],
}

export default ARTICLE
