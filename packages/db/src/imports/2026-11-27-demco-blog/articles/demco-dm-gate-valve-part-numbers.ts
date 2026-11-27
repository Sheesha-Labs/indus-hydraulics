import type { BlogArticleSeed } from '../shared'

/**
 * Reading a DEMCO DM gate valve assembly number. Sources: DEMCO gate valve catalogue "Assembly Part Number
 * Example" panels and parts lists on pp.7, 9, 11, 13 (DM 7500), 15, 17, 19, 21 (DM 5000), 23, 25, 27, 29
 * (ASME Class 600, 900, 1500) and 31, 33, 35, 37, 39, 41, 43 (DMA). Worked examples are as printed:
 * J025088-3772140 (p.7), J024929-2782110 (p.15), J003947-4782112 (p.25), J025296-37891201 (p.31).
 * Digit order is read from those examples against the kit trim strings (J0XXXXX-XX72140 and XX82110).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-dm-gate-valve-part-numbers',
  title: 'Reading a DEMCO DM gate valve assembly number: base number plus seven digits',
  excerpt:
    'A DEMCO DM gate valve assembly number is a base number that fixes the size and testing group, then seven digits for end connection, body, stem, gate, seat, elastomer and ring-groove inlay. Automated DMA valves add an eighth digit for actuation. Here is how to read the printed examples.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DEMCO DM Gate Valve Part Number: How to Read It',
  seoDescription:
    'How to read a DEMCO DM gate valve assembly number: base number, seven digits for end, body, stem, gate, seat, elastomer and inlay, with worked examples.',
  focusKeyword: 'demco dm gate valve part number',
  publishedAt: '2026-11-27T15:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do I read a DEMCO DM gate valve part number?',
      answer:
        'A DM assembly number is a J-prefixed base number, which sets the size and testing group, then seven digits: end connection, body configuration, stem, gate, seat, seat elastomer and ring-groove inlay. DMA automated valves add an eighth digit for actuation. J025088-3772140 is a 2 in DM 7500, flanged, with HNBR seals.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The base number (for example J025088) identifies the valve, its seat port and, on the 7,500 psi valve, its testing group. The seven digits after the dash identify the build.',
        'The seven digits run in this order: end connection, body configuration, stem material, gate material, seat material, seat and seal elastomer, ring-groove inlay.',
        'The end-connection code means different things at different sizes, so a code is only meaningful against the size page of the catalogue.',
        'Repair kits are listed against a trim string such as J0XXXXX-XX72140, which leaves the first two digits (end connection and body) open because a kit does not depend on them.',
        'The nameplate and the assembly number are the record. The catalogue says to consult the maker for trims it does not list.',
      ],
    },
    {
      type: 'lead',
      html: 'An assembly number on a DM gate valve nameplate looks like a serial number. It is not: every digit after the dash records a choice made when the valve was built, and reading it tells you the end connection, the seat elastomer and the stem material before you take the bonnet off. This article reads the examples the catalogue prints and lists the codes for each size. For which family you hold, see <a href="/blog/demco-dm-5000-vs-dm-7500-gate-valve">DM 5000 vs DM 7500</a>; for the kits that use these trims, see <a href="/blog/mud-gate-valve-repair-kits">mud gate valve repair kits</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The base number.', anchor: 'base-number' },
    {
      type: 'paragraph',
      html: 'Everything before the dash is the assembly base number. On the DM 7500 it changes with seat port and with the testing group (see <a href="/blog/demco-dm-5000-vs-dm-7500-gate-valve">the group descriptions</a>), and each parts list in the catalogue is headed “Assembly Base Number: NACE Compliant”. The catalogue prints three bases per size.',
    },
    {
      type: 'comparison_table',
      caption: 'DM 7500 and DMA 7500 base numbers by seat port and group',
      columns: ['Seat port', 'DM 7500 Group 1', 'Group 2', 'Group 3', 'DMA 7500 Groups 1, 2, 3'],
      rows: [
        { cells: ['2 in', 'J025088', 'J025103', 'J025104', 'J025296, J025343, J025344'] },
        { cells: ['3 in', 'J025299', 'J025300', 'J025301', 'J025295, J025331, J025332'] },
        { cells: ['4 in', 'J025102', 'J025107', 'J025108', 'J025294, J025329, J025330'] },
        { cells: ['5-1/8 in', 'J025090', 'J025109', 'J025110', 'J025293, J025327, J025328'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The 5,000 psi valve has one base per size and nominal pipe size of the ends, not per group. The 2 in seat port uses J024929 for 2 in nominal ends (threaded, flanged, weld and hammer union) and J025205 for 2-1/2 in nominal weld ends. The 3 in uses J025119 and J025116 (4 in weld ends), the 4 in uses J025206, J025118 (5 in weld and hammer union) and J025220 (6 in weld), and the 5-1/8 in uses J025317 and J025326 (6 in weld). The ASME Class 900 valve uses J003947 at 2 in, and the Class 1500 uses J003948; the Class 600 valve uses a separate base for threaded, weld, grooved and flanged bodies.',
    },

    { type: 'section_head', number: '/02', title: 'The seven digits.', anchor: 'digits' },
    {
      type: 'paragraph',
      html: 'After the dash comes the build string. The examples in the catalogue show the order, and the repair-kit trim strings agree with it.',
    },
    {
      type: 'comparison_table',
      caption: 'DM gate valve assembly number digits, by position',
      columns: ['Digit', 'Meaning', 'DM 7500 codes', 'DM 5000 codes'],
      rows: [
        { cells: ['1', 'End connection', '3 flanged 10,000 psi RTJ; weld and hammer union codes by size', '2 flanged 5,000 psi RTJ (7 on the 5-1/8 in); weld, threaded and hammer union codes by size'] },
        { cells: ['2', 'Body configuration', '5 weld, 7 flanged, 9 hammer union', '4 threaded, 5 weld, 7 flanged, 9 hammer union'] },
        { cells: ['3', 'Stem material', '7 = 410 stainless steel', '8 = 316 stainless steel (17-4PH on the 5-1/8 in)'] },
        { cells: ['4', 'Gate (and wear ring)', '2 = 41XX and 41XX; 7 = 410 SS and 410 SS', '2 = 41XX; 8 = ASTM A351 CF8M (CA15 on the 5-1/8 in)'] },
        { cells: ['5', 'Seat ring or insert', '1 = 410 stainless steel', '1 = 1045; 8 = ASTM A351 CF8M (CA15 on the 5-1/8 in)'] },
        { cells: ['6', 'Seat and seal elastomer', '2 = FKM and FKM; 4 = HNBR and HNBR', '1 = Buna-N and Buna-N; 2 = FKM and FKM'] },
        { cells: ['7', 'Ring-groove inlay', '0 none; 1 = 316 SS inlay; 2 = 625 SS inlay (flanged only)', '0 none; 1 = 316 SS inlay; 2 = 625 SS inlay (flanged only)'] },
        { cells: ['8 (DMA only)', 'Actuation', '1 = with hydraulic Ledeen actuator; 2 = bare stem for actuation', 'DMA 5000 uses the same two codes'], highlight: true },
      ],
    },

    { type: 'section_head', number: '/03', title: 'The worked examples.', anchor: 'examples' },
    {
      type: 'paragraph',
      html: '<strong>J025088-3772140</strong> is the DM 7500 2 in, Group 1 example. Base J025088 is the 2 in Group 1 valve. Then 3 is a 10,000 psi RTJ flange, 7 is a flanged body, 7 is a 410 stainless steel stem, 2 is 41XX gate and wear rings, 1 is a 410 stainless steel seat ring, 4 is HNBR seat and seals, and 0 is no ring-groove inlay. The same trim, without the first two digits, is the string the 7,500 psi repair kits are listed for: J0XXXXX-XX72140.',
    },
    {
      type: 'paragraph',
      html: '<strong>J024929-2782110</strong> is the DM 5000 2 in example. Base J024929 is the 5,000 psi 2 in valve. 2 is a 5,000 psi RTJ flange, 7 flanged body, 8 a 316 stainless steel stem, 2 a 41XX gate, 1 a 1045 seat insert, 1 Buna-N seat and seals, and 0 no inlay. Its kit trim string is J0XXXXX-XX82110.',
    },
    {
      type: 'paragraph',
      html: '<strong>J003947-4782112</strong> is an ASME Class 900 2 in example. 4 is a Class 900 RTJ flange, 7 flanged, 8 a 316 stainless steel stem, 2 a 1045 gate, 1 a 1045 seat insert, 1 Buna-N, and 2 a 625 stainless steel inlay in the ring groove. An inlay can only be specified on a flanged valve.',
    },
    {
      type: 'paragraph',
      html: '<strong>J025296-37891201</strong> is a DMA 7500 2 in example, and the only one of the four with eight digits. 3 is the 10,000 psi flange, 7 flanged, 8 a 17-4 PH stainless steel stem, 9 a 17-4 PH gate with 41XX wear rings, 1 a 410 stainless steel seat ring, 2 FKM, 0 no inlay, and the final 1 says the valve is supplied with a hydraulic Ledeen actuator rather than a bare stem. The DMA 7500 kit trim is J0XXXXX-XX891401.',
    },

    { type: 'section_head', number: '/04', title: 'End-connection codes by size.', anchor: 'end-codes' },
    {
      type: 'paragraph',
      html: 'The first digit changes meaning with the size and pressure rating, because the pipe the valve welds to changes. The DM 7500 codes are below. The flange is code 3 at every size.',
    },
    {
      type: 'comparison_table',
      caption: 'DM 7500 end-connection codes by seat port (flanged = 3 at every size)',
      columns: ['Seat port', 'Weld codes', 'Hammer union codes (Fig 1502)'],
      rows: [
        { cells: ['2 in', '2 = 2.00 in XXH; 4 = 3.00 in OD × 2.00 in ID', '9 = 2 in XXH'] },
        { cells: ['3 in', '2 = 3.00 in XXH; 4 = 4.00 in XXH; 5 = 4.50 in OD × 2.96 in ID', '8 = 3 in XXH; 9 = 4 in XXH'] },
        { cells: ['4 in', '2 = 4.00 in XXH; 3 = 5.00 in XXH; 4 = 5.81 in OD × 4.06 in ID; 5 = 6.00 in OD × 4.00 in ID', '8 = 4 in XXH; 9 = 5 in XXH'] },
        { cells: ['5-1/8 in', '4 = 6.00 in XXH; 6 = 7.25 in OD × 5.12 in ID', 'None listed'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'DM 5000 end-connection codes by seat port',
      columns: ['Seat port', 'Flanged (5,000 RTJ)', 'Weld', 'Threaded', 'Hammer union'],
      rows: [
        { cells: ['2 in', '2', '1 = Sch 80; 2 = XXH; 5 = Sch 160', '0 = line pipe (LP); 2 = external upset tubing (UPTBG)', '9 = 2 in XXH'] },
        { cells: ['3 in', '2', '1 = Sch 80; 2 = XXH; 5 = Sch 160', '0 = LP; 1 = TBS', '8 = 3 in XXH; 9 = 4 in XXH'] },
        { cells: ['4 in', '2', '1 = Sch 80; 2 = XXH; 5 = Sch 160', '0 = LP; 1 = TBS', '8 = 4 in XXH; 9 = 5 in XXH'] },
        { cells: ['5-1/8 in', '7', '2 = XXH; 5 = Sch 160', '3 = long casing (LC)', 'None listed'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'In the ASME classes the end code also carries the flange facing: Class 600 uses 2 for RTJ and 3 for RF, Class 900 uses 4 for RTJ and 5 for RF, and Class 1500 uses 6 for RTJ and 7 for RF. For threaded ends the catalogue asks for the pipe type: non-upset tubing (TBG), long casing thread (LCSG), external upset tubing (UPTBG) or short casing thread (CSG). For weld ends, give the schedule of the mating pipe.',
    },

    { type: 'section_head', number: '/05', title: 'Using the number to order parts.', anchor: 'ordering' },
    {
      type: 'paragraph',
      html: 'A repair kit is not ordered by the whole assembly number. It is listed against a trim string with the end connection and body digits left as XX, because the same kit fits whichever end connection the valve has. For the 7,500 psi valve that string is J0XXXXX-XX72140: 410 stainless steel stem, 41XX with QPQ nitrided gate, HNBR seat and seals. For the 5,000 psi valve it is J0XXXXX-XX82110: 316 stainless steel stem, 41XX with ENP gate, 1045 Buna-N seat and seals (17-4PH stem on the 5-1/8 in). If your valve’s last five digits differ from the string, the stem, gate or elastomer is different, and the catalogue says to consult the maker for other trim options.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Read the digits, then check the nameplate.',
      body: 'Codes are only valid against the size page they come from. Two different sizes can print the same digit for a different pipe, and some printed values in the catalogue are inconsistent with the other pages. When a part is expensive, confirm the number against the nameplate or the original order before you rely on the decode.',
    },

    {
      type: 'paragraph',
      html: 'A few habits avoid wrong orders. Read the base number first and confirm the family, because J025088 and J024929 are both 2 in valves but are a 7,500 psi and a 5,000 psi design. Then read the digits left to right and check each against the size page, not against a different size. Where the second digit is 5 or 9, a weld or hammer union end, the first digit names the pipe the valve welds to or the Fig 1502 union it mates with, so read it from the size table above. Last, compare the trim against the kit string before ordering a kit: if the stem, gate, seat, elastomer and inlay digits match, the standard kit applies.',
    },

    { type: 'section_head', number: '/06', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'paragraph',
      html: 'Indus Hydraulics quotes DEMCO gate valves and spares from Dubai, UAE. Send the full assembly number from the nameplate, or the size, pressure rating, testing group and end connection if you do not have it. We read it against the catalogue and quote the matching valve or kit. The <a href="/c/oilfield-gate-valves">oilfield gate valves</a> and <a href="/c/gate-valve-repair-kits">repair kits</a> shelves list what we hold.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What does J025088 mean on a DEMCO valve?',
          answer:
            'It is the base number of the 2 in DM 7500 valve in testing Group 1. The 2 in Group 2 and Group 3 bases are J025103 and J025104.',
        },
        {
          question: 'How many digits follow the base number?',
          answer:
            'Seven on a DM gate valve and eight on a DMA automated valve. The eighth digit is the actuation: 1 with a hydraulic Ledeen actuator, 2 bare stem for actuation.',
        },
        {
          question: 'What does the ring-groove inlay digit mean?',
          answer:
            '0 is no inlay, 1 is a 316 stainless steel inlay and 2 is a 625 inlay in the flange ring groove. Inlays are available only on flanged valves.',
        },
        {
          question: 'What are the seat and seal elastomer codes?',
          answer:
            'On the DM 7500, 2 is FKM and 4 is HNBR. On the DM 5000 and the ASME classes, 1 is Buna-N and 2 is FKM.',
        },
        {
          question: 'Why do repair kits show XX in the part number?',
          answer:
            'The first two digits are the end connection and body configuration, which do not change the parts in the kit. A kit is listed against the stem, gate, seat, elastomer and inlay digits only.',
        },
        {
          question: 'My valve is not in the catalogue trims. What now?',
          answer:
            'The catalogue says to consult the maker for repair kit trims it does not list. Send us the nameplate and we will check.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'DM gate valves and kits',
      skus: ['IH-VAL-DM7500-2', 'IH-VAL-DM5000-2', 'IH-GVRK-DM7K5-KIT-2', 'IH-GVRK-DM5K-KIT-2'],
    },
    {
      type: 'category_link',
      slug: 'oilfield-gate-valves',
      label: 'Oilfield gate valves',
      blurb: 'DEMCO Series DM and DMA gate valves with their assembly numbers on each listing.',
    },
    {
      type: 'category_link',
      slug: 'gate-valve-repair-kits',
      label: 'Gate valve repair kits',
      blurb: 'DM and DMA minor and major kits, gates, seats, stems and seals.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-dm-5000-vs-dm-7500-gate-valve', 'mud-gate-valve-repair-kits', 'demco-gate-valve-vs-butterfly-valve', 'model-72-vs-dm-gate-valve'],
    },
    {
      type: 'cta_block',
      heading: 'Have an assembly number to decode?',
      body: 'Send us the nameplate. We will confirm the valve, the trim and the matching kit and quote it from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
