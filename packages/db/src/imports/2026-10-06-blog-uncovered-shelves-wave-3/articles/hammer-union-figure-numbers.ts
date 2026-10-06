import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Hammer union figures, read from the 21 standard-service and 9 sour-gas
 * listings: working and test pressure by size, seal arrangement, ends and
 * size range. The Figure 300 listing's slug and title disagree on pressure,
 * so it is left out of the table; the sour Figure 1003 test pressure equals
 * its working pressure on the listing and is not quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hammer-union-figure-numbers',
  title: 'Hammer union figure numbers explained: pressures, seals and sour service from Figure 100 to 2202',
  excerpt:
    'A hammer union figure number mostly tells you its working pressure — 602 is 6,000 psi, 1502 is 15,000 psi — but not always, and some sizes are derated. How to read the figure, the seal behind it and the sour-service versions.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T00:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What do hammer union figure numbers mean?',
      answer:
        'For most figures the number tracks the cold working pressure: Figure 100 is 1,000 psi, 200 and 206 are 2,000 psi, 400 is 4,000 psi, 602 is 6,000 psi, 1002 is 10,000 psi, 1502 is 15,000 psi and 2002 is 20,000 psi. The pattern has exceptions — Figure 2202 is a 15,000 psi sour-gas union — and some figures are derated in larger sizes, so read the rating by size from the listing or the nameplate, never from the number alone.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Figure number ≈ working pressure for most figures: 602 = 6,000 psi, 1002 = 10,000 psi, 1502 = 15,000 psi, 2002 = 20,000 psi.',
        'The pattern has exceptions: Figure 2202 is a 15,000 psi union for sour gas, not a 22,000 psi one.',
        'Some figures drop with size: Figure 400 is 2,500 psi above 4", and Figure 1002 is 7,500 psi at 5" and 6".',
        'Sour-gas versions are derated: Figure 1502 sour is 10,000 psi and Figure 1002 sour is 7,500 psi on our listings.',
        'Never join unions of different figures. Check the figure on both halves and the nut before every make-up.',
      ],
    },
    {
      type: 'lead',
      html: 'A hammer union joins two lengths of pipe or iron with a wing nut that is struck tight with a hammer, which is why it is the connection of choice on temporary lines that are rigged up and down every job. The figure number cast or stamped on it is <strong>the single most important fact about the union</strong>, because unions of different figures can look alike while being rated thousands of psi apart.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The figures on our listings.',
      anchor: 'figures',
    },
    {
      type: 'comparison_table',
      caption: 'Standard-service hammer unions, as listed',
      columns: ['Figure', 'Working pressure', 'Seal', 'Ends and sizes'],
      rows: [
        { cells: ['50', '500 psi', 'O-ring', 'Threaded and socket weld, 4"–5"'] },
        { cells: ['100', '1,000 psi', 'Not stated', 'Threaded, 2"–8"'] },
        { cells: ['200', '2,000 psi', 'Metal-to-metal ball and cone', 'Threaded 1"–8"; butt weld 2"–8"'] },
        { cells: ['206', '2,000 psi', 'Ball and cone plus secondary seal', 'Threaded 1"–8"; butt weld 2"–8"'] },
        { cells: ['400', '4,000 psi to 4"; 2,500 psi 5"–12"', 'Metal-to-metal ball and cone', 'Threaded, 2"–12"'] },
        { cells: ['600', '6,000 psi', 'Metal-to-metal on a bronze seat insert', 'Threaded, 1"–4"'] },
        { cells: ['602', '6,000 psi', 'Nitrile seal ring over steel-to-steel seating', 'Threaded 1"–4"; butt weld 1"–4"'], highlight: true },
        { cells: ['1002', '10,000 psi to 4"; 7,500 psi at 5"–6"', 'Lip seal to 4"; O-ring at 5"–6"', 'Threaded 1"–4"; butt weld 1"–6"'] },
        { cells: ['1502', '15,000 psi', 'Replaceable nitrile seal ring', 'Threaded 1"–3"; butt weld 1"–6"'], highlight: true },
        { cells: ['2002', '20,000 psi', 'Lip seal with anti-extrusion ring', 'Butt weld, 2"–6"'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Where the rule breaks.',
      anchor: 'exceptions',
    },
    {
      type: 'paragraph',
      html: 'Three things catch people out. Some figures lose pressure with size: Figure 400 is listed at 4,000 psi from 2" to 4" and 2,500 psi from 5" to 12", and Figure 1002 at 10,000 psi to 4" and 7,500 psi at 5" and 6". Some figure numbers break the pattern: Figure 2202 is a 15,000 psi union for sour gas. And sour-gas versions of a familiar figure are derated — see section 4. The test pressure on our standard-service listings is one and a half times the working pressure: 22,500 psi for Figure 1502, 9,000 psi for Figure 602.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Special-purpose figures.',
      anchor: 'special',
    },
    {
      type: 'paragraph',
      html: 'A few figures exist for a job rather than a pressure class. Figure 207 is a blanking cap (2,000 psi, 3" to 6"). Figure 211 is an insulated union, used to isolate one side of a line electrically, at 2,000 psi in 2" and 3". Figure 1003 is a misaligning union that accepts up to 7.5° off the centre line — 15° included — except the 2" size at 3.5°; it is rated 10,000 psi in 2" and 3" and 7,500 psi in 4" and 5". Figure 1004 is a 10,000 psi butt-weld union in 5" and 6".',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Sour gas service.',
      anchor: 'sour',
    },
    {
      type: 'paragraph',
      html: 'Hydrogen sulphide embrittles hard steel, so a union for sour gas is made from hardness-controlled material and usually carries a lower rating than its standard twin. On our sour-gas listings, Figure 1502 is 10,000 psi rather than 15,000; Figure 1002 is 7,500 psi to 4" and 5,000 psi at 5" and 6"; Figure 1003 is 7,500 psi in 2" and 3" and 5,000 psi in 4" and 5"; Figure 1004 is 7,500 psi; Figure 602 stays at 6,000 psi. Figure 2202 is the sour figure for 15,000 psi, butt weld from 2" to 6", with a lip seal and a stainless steel anti-extrusion ring.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never mix figures.',
      body: 'Unions of different figures, and sometimes different sizes, can look alike and partly thread together. A mismatched union can hold at low pressure and separate at working pressure, and industry safety alerts warn of fatal results. Confirm the figure and size on both halves and the nut, keep figures segregated in storage, and replace any union whose markings cannot be read.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ends, seals and ordering.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Unions come with threaded line-pipe ends or butt-weld ends; for butt weld, the weld schedule must match the pipe (Schedule 40 and 80 on Figures 200 and 206, Schedule 80 and XXS on 602, XXS on 1002 and 1502). On the elastomer-sealed figures the seal ring is a service item — replace it whenever it is cut, flattened or hardened. To order, give the figure, size, end connection and schedule, and whether the service is standard or sour. Unions are part of the wider treating-iron picture in <a href="/blog/flow-iron-explained">flow iron explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What pressure is a 1502 hammer union rated for?',
          answer:
            'Standard-service Figure 1502 is 15,000 psi working with a 22,500 psi test pressure on our listings. The sour-gas version is 10,000 psi.',
        },
        {
          question: 'What is the difference between Figure 602 and 1502?',
          answer:
            'Pressure class: 602 is 6,000 psi and 1502 is 15,000 psi. They are not interchangeable and must never be joined to each other.',
        },
        {
          question: 'Which hammer union is used for sour gas at 15,000 psi?',
          answer:
            'Figure 2202, listed at 15,000 psi for sour gas service, butt weld from 2" to 6".',
        },
        {
          question: 'What is a Figure 1003 union?',
          answer:
            'A misaligning union that accepts up to 7.5° off the centre line (3.5° in 2"), rated 10,000 psi in 2" and 3" and 7,500 psi in 4" and 5" for standard service.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Standard-service hammer unions',
      skus: [
        'IH-FI-HU-1502-BW-15K-STD-INDUS',
        'IH-FI-HU-1502-NPT-15K-STD-INDUS',
        'IH-FI-HU-602-NPT-6K-STD-INDUS',
        'IH-FI-HU-1002-BW-10K-STD-INDUS',
        'IH-FI-HU-206-NPT-2K-STD-INDUS',
        'IH-FI-HU-2002-BW-20K-STD-INDUS',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Sour gas service',
      skus: ['IH-FI-HU-2202-BW-15K-SOUR-INDUS', 'IH-FI-HU-1502-BW-10K-SOUR-INDUS', 'IH-FI-HU-1002-BW-7K5-SOUR-INDUS'],
    },
    {
      type: 'category_link',
      slug: 'hammer-unions-standard-service',
      label: 'Standard service hammer unions',
      blurb: 'Figures 50 to 2002, threaded and butt weld.',
    },
    {
      type: 'category_link',
      slug: 'hammer-unions-sour-gas-service',
      label: 'Sour gas service hammer unions',
      blurb: 'Figures 602, 1002, 1003, 1004, 1502 and 2202 for sour wells.',
    },

    {
      type: 'cta_block',
      heading: 'Need unions for a rig-up?',
      body: 'Send the figure, size, end connection and weld schedule, and say whether the service is sour. We will quote unions and spare seal rings together.',
      quoteLabel: 'Quote hammer unions',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Working and test pressures, seals, ends and sizes checked against our hammer union listings.',
    },
  ],
}

export default ARTICLE
