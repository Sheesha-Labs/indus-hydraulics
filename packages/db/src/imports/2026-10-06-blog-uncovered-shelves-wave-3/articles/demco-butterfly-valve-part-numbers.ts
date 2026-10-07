import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * DEMCO butterfly valve part numbers, from the decode that matched 15 of 16
 * photographed Cameron labels and agrees with the part numbers on our NE-C
 * listings, plus series data from the 45 butterfly valve listings (shut-off
 * ratings, body rating, vacuum, seat temperature ranges). The final suffix
 * character is an operator code that has not been decoded, and the article
 * says so.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-butterfly-valve-part-numbers',
  title: 'DEMCO butterfly valve part numbers decoded: series, size, body, stem, disc and seat',
  excerpt:
    'A DEMCO butterfly valve number such as J022122-1215311 spells out the valve: series and size in the base, then body style, body, stem, disc and seat in the suffix. How to read one, and when to trust the nameplate instead.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T02:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do you read a DEMCO butterfly valve part number?',
      answer:
        'Split it at the dash. In the base, the last two digits give the series and size — on the NE-C series 19 is 2", 22 is 4" and 27 is 12". In the seven-character suffix, read left to right: body style (1 wafer, 5 lug), body material, stem, disc, a two-digit seat code (31 Buna-N, 34 Viton, 35 EPDM, 36 natural rubber) and an operator code. J022122-1215311 is a 4" NE-C wafer valve with a cast iron body, 416 stem, nickel-plated ductile iron disc and Buna-N seat.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Base number: the last two digits are series and size. NE-C runs 19 (2") to 27 (12"); NE-I uses 28 to 36 for the same sizes.',
        'Suffix: body style, body material, stem, disc, seat (two digits), operator — in that order.',
        'Body style 1 is wafer, 5 is lug. Seat 31 is Buna-N, 34 Viton, 35 EPDM, 36 natural rubber.',
        'The standard valves shut off drop-tight at 200 psi in an ASME Class 150 body rated 285 psi; other bases cover 285 psi, 50 psi and throttling service.',
        'The nameplate beats the decode. One label we checked printed a different body and seat from the ones its code implied.',
      ],
    },
    {
      type: 'lead',
      html: 'When a butterfly valve on a mud system or a water line has to be replaced, the part number on its tag is often all there is to go on. DEMCO numbers are more useful than most because <strong>the number is the specification</strong>: size, body, stem, disc and seat are all encoded, and reading them avoids ordering a lug valve for a wafer slot or a Buna-N seat for a hot line.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'The base number: series and size.',
      anchor: 'base',
    },
    {
      type: 'comparison_table',
      caption: 'Last two digits of the base number, 200 psi valves (— means not on our NE-D listings)',
      columns: ['Size', 'NE-C', 'NE-I', 'NE-D'],
      rows: [
        { cells: ['2"', '19', '28', '81'] },
        { cells: ['2-1/2"', '20', '29', '—'] },
        { cells: ['3"', '21', '30', '—'] },
        { cells: ['4"', '22', '31', '83'], highlight: true },
        { cells: ['5"', '23', '32', '84'] },
        { cells: ['6"', '24', '33', '85'] },
        { cells: ['8"', '25', '34', '—'] },
        { cells: ['10"', '26', '35', '—'] },
        { cells: ['12"', '27', '36', '—'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The bases in this table are the 200 psi shut-off valves, numbered J0221xx. Bases beginning J0222 cover the other shut-off ratings — 285 psi high-pressure, 50 psi low-torque and throttling — so J022230, for example, is a 6" valve at 285 psi. A J prefix and the leading zeros are part of the Cameron numbering and carry no size information.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The suffix, character by character.',
      anchor: 'suffix',
    },
    {
      type: 'comparison_table',
      caption: 'Reading the seven-character suffix',
      columns: ['Position', 'Meaning', 'Codes'],
      rows: [
        { cells: ['1', 'Body style', '1 wafer; 5 lug'], highlight: true },
        { cells: ['2', 'Body material', '1 ductile iron; 2 cast (grey) iron; 4 carbon steel'] },
        { cells: ['3', 'Stem', '1 416 stainless; 2 316 stainless'] },
        { cells: ['4', 'Disc', '2 316 stainless; 3 Monel; 4 aluminium bronze; 5 nickel-plated ductile iron; 6 PVF-coated ductile iron'] },
        { cells: ['5–6', 'Seat', '31 Buna-N; 34 Viton; 35 EPDM; 36 natural rubber'] },
        { cells: ['7', 'Operator', 'Not decoded — confirm the handle or gear separately'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Two worked examples.',
      anchor: 'examples',
    },
    {
      type: 'paragraph',
      html: 'J022122-1215311: base 22 is a 4" NE-C; suffix 1 wafer, 2 cast iron body, 1 416 stem, 5 nickel-plated ductile iron disc, 31 Buna-N seat, then the operator code. It is one of the part numbers on our 4" NE-C wafer listing. J022122-5122351: the same 4" NE-C, but 5 lug, 1 ductile iron body, 2 316 stem, 2 316 disc and 35 EPDM seat — on our 4" NE-C lug listing. Changing one digit changed the body style, body, stem, disc and seat.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The nameplate beats the decode.',
      body: 'This decode matched fifteen of sixteen DEMCO labels we checked. The sixteenth, J022119-1214311, printed a ductile iron body and a Viton seat where the code implies cast iron and Buna-N. Where the tag states materials, believe the tag — and where it matters, confirm with a photograph of the valve.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Wafer or lug, and the two pressure ratings.',
      anchor: 'wafer-lug',
    },
    {
      type: 'paragraph',
      html: 'A wafer valve is clamped between two flanges by bolts that pass around it, so it cannot hold pressure with the downstream pipe removed. A lug valve has tapped lugs that bolt to each flange separately, and our lug listings are marked as capable of end-of-line service. Two pressures appear on every listing: the body rating, ASME Class 150 at 285 psi non-shock, and the drop-tight shut-off rating, 200 psi bi-directional on the standard valves. The valves are also rated for vacuum to 29.9 in Hg. Our NF-C valves, 14" to 36", shut off at 150 psi standard.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Choosing seat and disc.',
      anchor: 'materials',
    },
    {
      type: 'paragraph',
      html: 'The seat sets the temperature window: on our listings Buna-N is 0 °F to 180 °F (−18 °C to 82 °C), EPDM 20 °F to 275 °F (−7 °C to 135 °C) and Viton 20 °F to 300 °F (−7 °C to 149 °C). Buna-N suits oil, water and drilling mud at ambient temperature; EPDM hot water and steam-cleaned lines but not oil; Viton hot oils and chemicals. The disc meets the flow: nickel-plated ductile iron for general duty, aluminium bronze and Monel for seawater, 316 stainless for corrosive and food service. Sanitary NE-I and Teflon-lined NEI-T valves are listed for FDA service.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What size is a DEMCO J022125 valve?',
          answer:
            'An 8" NE-C — base digits 25 on the NE-C series. The suffix then gives the body style and materials.',
        },
        {
          question: 'What does seat code 34 mean?',
          answer:
            'Viton (FKM). The other seat codes are 31 Buna-N, 35 EPDM and 36 natural rubber.',
        },
        {
          question: 'Can a wafer butterfly valve be used at the end of a line?',
          answer:
            'No. A wafer valve needs flanges on both sides to hold it. Use a lug valve, which our listings mark as end-of-line capable.',
        },
        {
          question: 'What pressure does a DEMCO NE-C valve shut off?',
          answer:
            '200 psi drop-tight, bi-directional, in an ASME Class 150 body rated 285 psi. Other bases are available for 285 psi, 50 psi low-torque and throttling.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'DEMCO butterfly valves',
      skus: [
        'IH-VAL-BFLY-NEC-W-4',
        'IH-VAL-BFLY-NEC-L-4',
        'IH-VAL-BFLY-NEC-L-6',
        'IH-VAL-BFLY-NEI-W-6',
        'IH-VAL-BFLY-NED-W-4',
        'IH-VAL-BFLY-NFC',
        'IH-VAL-BFLY-NEIT',
        'IH-VAL-BFLY-WGO',
      ],
    },
    {
      type: 'category_link',
      slug: 'butterfly-valves',
      label: 'Butterfly valves',
      blurb: 'DEMCO NE-C, NE-I, NE-D, NF-C and NEI-T valves, operators and actuators.',
    },
    {
      type: 'category_link',
      slug: 'oilfield-butterfly-valves',
      label: 'Oilfield butterfly valves',
      blurb: 'Wafer, lug and triple-offset valves to API 609.',
    },

    {
      type: 'cta_block',
      heading: 'Replacing a DEMCO valve?',
      body: 'Send the part number from the tag and a photograph of the valve. We will decode it, confirm it against the nameplate and quote the replacement and operator.',
      quoteLabel: 'Quote butterfly valves',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Decode checked against Cameron labels and the part numbers on our listings; ratings and seat temperatures checked against our butterfly valve listings.',
    },
  ],
}

export default ARTICLE
