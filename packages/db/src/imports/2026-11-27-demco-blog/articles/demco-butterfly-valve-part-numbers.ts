import type { BlogArticleSeed } from '../shared'

/**
 * DEMCO butterfly valve part numbers (refresh from the 2018 brochure). Sources: DEMCO butterfly valve
 * brochure p.7 (series and sizes), pp.10-12 ("How to Order" for NE-C, NE-I, NE-D, NF-C 14-24 in and
 * 30/36 in), p.13 (base part numbers), p.14 (marine series, certification suffix 01-04), p.15-16
 * (component parts and suffix codes) and p.27 (API 607 fire test). NE-D SP 12 in is printed as 232656,
 * one digit short of its neighbours, and is shown as printed. Body material codes are per series.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-butterfly-valve-part-numbers',
  title: 'DEMCO butterfly valve part numbers: J0, F0, base numbers and the suffix explained',
  excerpt:
    'A DEMCO butterfly valve part number is J0 or F0, a five-digit base number set by series, size and shut-off rating, and a suffix of body, stem, disc, seat and actuation codes. This guide gives the base-number tables for NE-C, NE-I, NE-D, NF-C and marine, and decodes the examples the brochure prints.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DEMCO Butterfly Valve Part Number: J0, F0 and Suffix',
  seoDescription:
    'Read a DEMCO butterfly valve part number: J0 or F0 prefix, base numbers for NE-C, NE-I, NE-D, NF-C and marine, then the body, stem, disc and seat codes.',
  focusKeyword: 'demco butterfly valve part number',
  publishedAt: '2026-11-27T16:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do I read a DEMCO butterfly valve part number?',
      answer:
        'It runs J0 (or F0 for fire-safe), a five-digit base number for the series, size and shut-off rating, a dash, then body configuration, body material, stem, disc, a two-digit seat code and an actuation code. J022124-1215311 is a 6 in NE-C, 200 psi, wafer, with a ten-position handle.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The prefix is J0 for a non-fire-safe valve and F0 for a fire-safe valve. The valve is fire tested to API Spec 607 4th Edition on selected sizes and ratings.',
        'The five-digit base number depends on the series (NE-C, NE-I, NE-D, NE-D SP, NF-C or marine), the size and the shut-off rating. The NE-D shares some base numbers with NE-I.',
        'The suffix has seven positions: body configuration, body material, stem, disc, seat (two digits) and actuation. Marine valves add a dash and a two-digit certification code.',
        'Body material codes differ by series: NE-C 1 is ductile iron lug and 2 is ductile iron wafer; NE-I 1 is ductile iron wafer, 3 aluminium bronze, 4 carbon steel and 8 stainless steel; NE-D 1 is ductile iron.',
        'The brochure notes that legacy materials exist. An older nameplate can carry codes the brochure no longer lists, and the nameplate governs.',
      ],
    },
    {
      type: 'lead',
      html: 'A butterfly valve nameplate is a short string of digits, and it tells you more than the stamped size. It fixes the series, the pressure rating, the body material, the disc and the seat elastomer, which together decide what spares you need. This guide is built on the 2018 DEMCO butterfly valve brochure. For choosing between series, see <a href="/blog/butterfly-valves-wafer-lug-and-grooved">wafer, lug and grooved butterfly valves</a>, and for the gate valve equivalent see <a href="/blog/demco-dm-gate-valve-part-numbers">reading a DM gate valve assembly number</a>.',
    },

    { type: 'section_head', number: '/01', title: 'J0 or F0, then the base number.', anchor: 'prefix' },
    {
      type: 'paragraph',
      html: 'The first two characters are the fire-safety code. <strong>J0</strong> is non-fire-safe and <strong>F0</strong> is fire-safe. The brochure says the resilient-seat design has been fire tested and qualified to API Spec 607 4th Edition, and that fire-safe, CRN, ABS, DNV, EAC and PED certifications are available on selected sizes and pressure ratings. Fire-safe valves also take two stem O-rings in place of one. Next comes the five-digit base number, which is fixed by the series, the size and the shut-off rating. The whole string for the printed 6 in NE-C example is therefore J022124-1215311.',
    },
    {
      type: 'comparison_table',
      caption: 'NE-C and NE-I base numbers, 2 to 12 in',
      columns: ['Size', 'NE-C 200 psi', 'NE-C 285 psi', 'NE-C throttling', 'NE-I 200 psi', 'NE-I 285 psi', 'NE-I throttling'],
      rows: [
        { cells: ['2 in', '22119', '22225', '22243', '22128', '22252', '22270'] },
        { cells: ['2-1/2 in', '22120', '22226', '22244', '22129', '22253', '22271'] },
        { cells: ['3 in', '22121', '22227', '22245', '22130', '22254', '22272'] },
        { cells: ['4 in', '22122', '22228', '22246', '22131', '22255', '22273'] },
        { cells: ['5 in', '22123', '22229', '22247', '22132', '22256', '22274'] },
        { cells: ['6 in', '22124', '22230', '22248', '22133', '22257', '22275'] },
        { cells: ['8 in', '22125', '22231', '22249', '22134', '22258', '22276'] },
        { cells: ['10 in', '22126', '22232', '22250', '22135', '22259', '22277'] },
        { cells: ['12 in', '22127', '22233', '22251', '22136', '22260', '22278'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'NE-D and NE-D SP base numbers, 2 to 12 in (NE-D SP is 200 psi, square stem)',
      columns: ['Size', 'NE-D 200 psi', 'NE-D 285 psi', 'NE-D throttling', 'NE-D SP 200 psi'],
      rows: [
        { cells: ['2 in', '22181', '22279', '22291', '2326563'] },
        { cells: ['2-1/2 in', '22129', '22253', '22271', 'Not listed'] },
        { cells: ['3 in', '25093', '25135', '25136', '2326564'] },
        { cells: ['4 in', '22183', '22281', '22293', '2326497'] },
        { cells: ['5 in', '22184', '22282', '22294', '2326565'] },
        { cells: ['6 in', '22185', '22283', '22295', '2326566'] },
        { cells: ['8 in', '22134', '22258', '22276', '2326569'] },
        { cells: ['10 in', '22186', '22284', '22296', '2326567'] },
        { cells: ['12 in', '22136', '22260', '22278', '232656 as printed'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Three NE-D sizes (2-1/2, 8 and 12 in) print the same base numbers as the NE-I, so the series has to be read from the nameplate, not the number alone. The 12 in NE-D SP number is printed with six digits where its neighbours have seven, so treat it as a typographical gap and confirm it against the valve.',
    },
    {
      type: 'comparison_table',
      caption: 'NF-C base numbers, 14 to 36 in',
      columns: ['Size', 'NF-C 150 psi', 'NF-C 285 psi', 'Marine 150 psi', 'Marine 285 psi'],
      rows: [
        { cells: ['14 in', '23820', '25318', '24611', '25302'] },
        { cells: ['16 in', '23821', '25319', '24612', '25303'] },
        { cells: ['18 in', '23822', '25320', '24613', '25304'] },
        { cells: ['20 in', '23823', '25321', '24614', '25305'] },
        { cells: ['24 in', '23824', '25322', '24615', '25306'] },
        { cells: ['30 in', '24141', '25323', '2227182', '25307'] },
        { cells: ['36 in', '24357', '25324', '2227183', '25308'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Marine series base numbers, 2 to 12 in',
      columns: ['Size', 'Marine 200 psi', 'Marine 285 psi'],
      rows: [
        { cells: ['2 in', '22923', '22914'] },
        { cells: ['2-1/2 in', '22924', '22915'] },
        { cells: ['3 in', '22925', '22916'] },
        { cells: ['4 in', '22926', '22917'] },
        { cells: ['5 in', '22927', '22918'] },
        { cells: ['6 in', '22928', '22919'] },
        { cells: ['8 in', '22929', '22920'] },
        { cells: ['10 in', '22930', '22921'] },
        { cells: ['12 in', '22931', '22922'] },
      ],
    },

    {
      type: 'paragraph',
      html: 'Knowing the series helps when the number is partly worn. NE-C is the general-purpose valve, with a neck long enough to clear 2 in of insulation on ASME Class 150 pipe flanges, in wafer and lug bodies from 2 to 12 in. NE-I is the short-neck valve for food and beverage, utilities and process flowlines, designed for installation between ASME Class 125 and 150 flanges. NE-D is the short-neck valve with body notches to fit lightweight flange patterns, used in bulk material handling and transport, and NE-D SP is its short-pattern version. NF-C is the 14 to 36 in valve, in wafer and lug bodies, with bronze bearings on both stems to reduce operating torque. The marine series is built on the NE-C, NE-I, NE-D and NF-C bodies.',
    },

    { type: 'section_head', number: '/02', title: 'The suffix after the dash.', anchor: 'suffix' },
    {
      type: 'paragraph',
      html: 'After the dash the brochure shows six fields in this order: body configuration, body material, stem material, disc material, seat elastomer (two digits) and actuation. The body material code depends on the series, which is where most mistakes are made.',
    },
    {
      type: 'comparison_table',
      caption: 'DEMCO butterfly valve suffix codes, from the “How to Order” pages',
      columns: ['Field', 'Codes'],
      rows: [
        { cells: ['Body configuration', '1 wafer; 5 lug (NE-D is wafer only)'] },
        { cells: ['Body material, NE-C', '1 ductile iron (lug); 2 ductile iron (wafer)'] },
        { cells: ['Body material, NE-I', '1 ductile iron (wafer only); 3 aluminium bronze; 4 carbon steel; 8 stainless steel'] },
        { cells: ['Body material, NE-D', '1 ductile iron'] },
        { cells: ['Body material, NF-C', '1 ductile iron (lug); 2 ductile iron (wafer); 3 aluminium bronze (lug); 4 steel (lug); 8 stainless steel (lug); 30 and 36 in: 1 ductile iron, wafer or lug'] },
        { cells: ['Stem', '1 = 416 stainless steel; 2 = 316 stainless steel (17-4 PH upper stem on 8 to 12 in)'] },
        { cells: ['Disc', '2 = 316 stainless steel; 4 = aluminium bronze; 5 = nickel-plated ductile iron; A = ZPEX coated ductile iron'] },
        { cells: ['Seat', '31 Buna-N; 34 FKM; 35 peroxide-cured EPDM; 36 natural rubber (NE series)'] },
        { cells: ['Actuation, NE series', '1 ten-position locking handle; 6 two-position locking handle; K ten-position corrosion-resistant handle; 9 bare stem; A worm gear with handwheel; E worm gear, bare shaft'] },
        { cells: ['Actuation, NF-C', '9 bare stem; A worm gear with handwheel; E worm gear, bare shaft'] },
        { cells: ['Marine certification (after a second dash)', '01 ABS; 02 DNV; 03 PED; 04 CRN'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'The marine series is offered in the NE-C lug, NE-I lug and wafer, NE-D wafer and NF-C lug styles. Its suffix uses the same fields (marine actuation codes are 1, 6 and A) and adds the dash and two-digit certification code. Marine body materials are ductile iron (1) as standard, with aluminium bronze (3), carbon steel (4) and stainless steel (8) as options. The discs, stems and seats inside are ordered by their own part numbers: see <a href="/blog/demco-butterfly-valve-seat-replacement">seat replacement and maintenance</a>.',
    },

    { type: 'section_head', number: '/03', title: 'The printed examples, decoded.', anchor: 'examples' },
    {
      type: 'paragraph',
      html: '<strong>22124-1215311</strong> is a 6 in NE-C, 200 psi, wafer valve with standard trim and a handle. 1 is a wafer body, 2 is the NE-C ductile iron wafer body, 1 is a 416 stainless steel stem, 5 is a nickel-plated ductile iron disc, 31 is a Buna-N seat and 1 is a ten-position locking handle.',
    },
    {
      type: 'paragraph',
      html: '<strong>23822-512231A</strong> is an 18 in NF-C, 150 psi, lug valve with stainless steel trim and a Buna-N seat, worm gear operated. 5 is lug, 1 is the ductile iron lug body, 2 and 2 are the 316 stainless steel stem and disc, 31 is Buna-N and A is a worm gear with handwheel.',
    },
    {
      type: 'paragraph',
      html: '<strong>24357-111435A</strong> is a 36 in NF-C, 150 psi valve with a bronze disc, an EPDM seat and a worm gear. 1 is wafer, 1 ductile iron, 1 a 416 stainless steel stem, 4 an aluminium bronze disc, 35 EPDM and A the worm gear. The 36 in is the largest standard size, and the brochure notes that the 30 and 36 in marine valves are available only with a ductile iron lug body.',
    },
    {
      type: 'paragraph',
      html: '<strong>22928-1114311</strong> is a 6 in marine valve, 200 psi, wafer, standard trim, ten-position handle: 1 wafer, 1 ductile iron, 1 a 416 stainless steel stem, 4 an aluminium bronze disc, 31 Buna-N and 1 the handle.',
    },

    { type: 'section_head', number: '/04', title: 'When the nameplate does not match.', anchor: 'nameplate' },
    {
      type: 'callout',
      tone: 'note',
      title: 'The nameplate governs.',
      body: 'The brochure marks some options as legacy materials and tells the reader to consult the maker for them, and it refers older series (NE, NE-S, NE-N and the NF series) to the maker for replacement parts. An older nameplate can therefore carry codes this brochure no longer lists. Read the stamped number first, use this guide to decode what it shares with the current tables, and send us the nameplate when a code does not appear.',
    },
    {
      type: 'paragraph',
      html: 'A few cross-checks help. The series ranges are fixed: NE-C, NE-I and NE-D run from 2 to 12 in, and NF-C runs from 14 to 36 in, so a 16 in valve is an NF-C and a 4 in valve is never one. The pressure rating is in the base number, not the suffix: the standard shut-off is 200 psi for 2 to 12 in and 150 psi for 14 to 36 in, with 285 psi as an option and 50 psi and throttling (0 psi) as further choices at 2 to 12 in.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'paragraph',
      html: 'Indus Hydraulics quotes DEMCO butterfly valves and spares from Dubai, UAE. Send the full nameplate number with the prefix, or the series, size, pressure rating, body (wafer or lug), body material, disc, seat and operator. For spares, tell us which of the seat, disc, stem or operator you need. See the <a href="/c/butterfly-valves">butterfly valves</a> shelf for the valves, seats, discs, stems, handles and operators.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What does the J0 or F0 at the start mean?',
          answer:
            'J0 is non-fire-safe and F0 is fire-safe. The resilient-seat design has been fire tested to API Spec 607 4th Edition, on selected sizes and pressure ratings.',
        },
        {
          question: 'What is the difference between NE-C, NE-I and NE-D?',
          answer:
            'NE-C is the long-neck general-purpose series, NE-I is a short-neck series offered in several body materials, and NE-D is a short-neck valve with body notches for lightweight flange patterns, used in bulk handling. All three cover 2 to 12 in. NF-C covers 14 to 36 in.',
        },
        {
          question: 'How do I tell the seat material from the part number?',
          answer:
            'Use the two digits before the actuation code: 31 is Buna-N, 34 FKM, 35 peroxide-cured EPDM and 36 natural rubber. NF-C seats are offered in 31, 34 and 35.',
        },
        {
          question: 'What do the marine suffix codes 01 to 04 mean?',
          answer:
            'They are certification codes on the marine series: 01 ABS, 02 DNV, 03 PED and 04 CRN.',
        },
        {
          question: 'Why do two different valves share a base number?',
          answer:
            'The NE-D shares the base numbers of the NE-I at 2-1/2, 8 and 12 in. The series is identified on the nameplate, and the suffix decides the body.',
        },
        {
          question: 'Where is the pressure rating in the number?',
          answer:
            'In the base number. Each series has separate base numbers for 200 psi, 285 psi and throttling at 2 to 12 in, and for 150 psi and 285 psi at 14 to 36 in.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'DEMCO butterfly valves',
      skus: ['IH-VAL-BFLY-NEC-W-6', 'IH-VAL-BFLY-NEI-W-4', 'IH-VAL-BFLY-NFC-18', 'IH-VAL-BFLY-MARINE'],
    },
    {
      type: 'category_link',
      slug: 'butterfly-valves',
      label: 'Butterfly valves',
      blurb: 'DEMCO NE-C, NE-I, NE-D, NF-C and marine butterfly valves, with seats, discs, stems and operators.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-butterfly-valve-seat-replacement', 'demco-butterfly-valve-torque-actuator-sizing', 'butterfly-valves-wafer-lug-and-grooved', 'demco-gate-valve-vs-butterfly-valve'],
    },
    {
      type: 'cta_block',
      heading: 'Need a DEMCO butterfly valve or spares?',
      body: 'Send the nameplate number. We will decode it, confirm the series and quote the valve or the seat, disc and stem from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
