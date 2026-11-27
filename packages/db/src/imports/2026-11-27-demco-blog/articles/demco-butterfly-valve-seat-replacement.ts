import type { BlogArticleSeed } from '../shared'

/**
 * DEMCO butterfly valve seat replacement and maintenance. Sources: DEMCO butterfly valve brochure p.6
 * (hard-backed cartridge seat), p.10-12 (seat codes), p.15 (NE-C, NE-I, NE-D component parts: seats,
 * discs, stems, O-rings), p.16 (NF-C parts), p.25 (installation and maintenance, disassembly and
 * reassembly, plastic flanges, throttling discs, vacuum, 50 psi discs) and p.26 (seat elastomers and
 * temperature limits). Seat, disc and stem numbers are as printed; "XXX" and "0XX" are suffix placeholders.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'demco-butterfly-valve-seat-replacement',
  title: 'DEMCO butterfly valve seat replacement: cartridge seat, part numbers and elastomer limits',
  excerpt:
    'A DEMCO butterfly valve seat is a hard-backed cartridge that slips into the body without special tools. Replacing it means removing the handle or actuator, the pins and the stems, and pushing the disc and seat out. This guide gives the steps, the seat numbers by size, the elastomer codes and their temperature limits.',
  categorySlug: 'maintenance-reliability',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'DEMCO Butterfly Valve Seat Replacement and Seat Numbers',
  seoDescription:
    'DEMCO butterfly valve seat replacement: how to remove and refit the cartridge seat, seat part numbers by size, elastomer codes and temperature limits.',
  focusKeyword: 'demco butterfly valve seat replacement',
  publishedAt: '2026-11-27T16:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do you replace the seat in a DEMCO butterfly valve?',
      answer:
        'Open the valve, remove the handle or actuator, remove the tangential pins, pull out the stems and push the disc and the seat out of the body. The seat is a hard-backed cartridge that slip-fits, so no special tools are needed. Refit in reverse, with a little non-hydrocarbon lubricant on the stems, seat and disc flats.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The seat is an elastomer permanently bonded to a rigid backing ring. It slip-fits into the body, and no special precautions are needed for disc position when the valve is installed.',
        'The brochure’s maintenance procedure is five steps: open, remove the operator, remove the pins, pull the stems, push out the disc and seat. Reassemble in reverse order.',
        'Seat part numbers run by size, for example 1786-XXX for 2 in and 1798-XXX for 8 in, and the suffix is the elastomer: -031 Buna-N, -034 FKM, -135 EPDM, -036 natural rubber.',
        'The seat elastomer sets the temperature limit, from −30 °F to 300 °F across the range. Throttling discs need stem O-rings and a flange gasket. Plastic flanges can cup under bolt load.',
        'No regular maintenance or lubrication is required in service.',
      ],
    },
    {
      type: 'lead',
      html: 'A resilient-seated butterfly valve wears at one place more than any other: the seat. The DEMCO design makes that part easy to renew, because the seat is a cartridge, not a boot. This article covers when to replace it, the steps in the brochure, the seat part numbers by size, the elastomer codes with their limits, and three cautions that catch people out. To decode the nameplate first, see <a href="/blog/demco-butterfly-valve-part-numbers">DEMCO butterfly valve part numbers</a>.',
    },

    { type: 'section_head', number: '/01', title: 'The hard-backed cartridge seat.', anchor: 'cartridge-seat' },
    {
      type: 'paragraph',
      html: 'The seat is built by permanently bonding a resilient elastomer to a rigid backing ring. The brochure gives three reasons for that: installation needs no special care over disc position, which matters most on valves with fail-closed actuators; the elastomer does not distort as it does in softer seat designs, which avoids the high torque and early failure that distortion causes; and the seat is slip-fitted into the body, so replacing it needs no special tools. A moulded flange seal at the seat edge takes the mating flange, and two O-ring ribs in the stem bore form a triple stem seal.',
    },
    {
      type: 'paragraph',
      html: 'The brochure gives no hour or cycle count for seat life, and none is invented here. Replace the seat when the valve no longer shuts off drop-tight, when the elastomer is cut, hardened or swollen by the service, or when the elastomer is the wrong one for the fluid and temperature, which the table below helps you check.',
    },

    { type: 'section_head', number: '/02', title: 'Disassembly and reassembly.', anchor: 'steps' },
    {
      type: 'paragraph',
      html: 'The procedure printed on page 25 of the brochure is short. First open the valve, and remove the handle or actuator. Then remove the tangential pins, pull out the stems, and push the disc and the seat out of the body. Reassemble in reverse order, with a small amount of general-purpose, non-hydrocarbon-based lubricant on the outside of the stems, the seat and the disc flats. As with any valve work, isolate and drain the line first and confirm that the line is not under pressure.',
    },
    {
      type: 'paragraph',
      html: 'Refit the valve between the flanges with it closed, and make up with studs or cap screws; the brochure says to install by closing the valve, inserting it between the flanges and tightening. On lug valves used for end-of-line service with downstream piping removed, use only weld-neck or socket flanges. The disc is positively oriented by a rectangular drive, and on 2 to 24 in valves it floats on the stem to centre itself in the seat. While the valve is apart, check the stems, the top O-ring, the stem O-ring and the bronze bearings, listed in the table below and on the <a href="/p/demco-butterfly-valve-stems-bearings-o-rings-2-24">stems, bearings, pins and O-rings</a> listing.',
    },

    {
      type: 'paragraph',
      html: 'With the valve apart, look at the parts the seat works against. The disc has a continuous raised band around the stem hole and the disc edge that presses flat into the seat at every angle, and that band is what keeps the stem journal dry, so a nicked or corroded disc edge can damage a new seat. Check the stem bores in the seat for the two O-ring ribs that form the triple stem seal, the faces where the seat’s flange seal meets the pipe flanges, and the bronze bearings and stems for wear. The upper stem is a flatted double-D. If a valve has been fitted with a worm gear or actuator, mark the stem orientation before you remove it so that the operator goes back at the same open and closed positions.',
    },

    { type: 'section_head', number: '/03', title: 'Seat part numbers and elastomer codes.', anchor: 'seat-numbers' },
    {
      type: 'comparison_table',
      caption: 'Seat base numbers by size. Add the suffix for the elastomer (-031, -034, -135 or -036)',
      columns: ['Valve size', 'Series', 'Seat base number'],
      rows: [
        { cells: ['2 in', 'NE-C, NE-I, NE-D', '1786-XXX'] },
        { cells: ['2-1/2 in', 'NE-C, NE-I, NE-D', '1788-XXX'] },
        { cells: ['3 in', 'NE-C, NE-I', '1790-XXX'] },
        { cells: ['3 in', 'NE-D', '25095-XXX'] },
        { cells: ['4 in', 'NE-C, NE-I, NE-D', '1792-XXX'] },
        { cells: ['5 in', 'NE-C, NE-I, NE-D', '1794-XXX'] },
        { cells: ['6 in', 'NE-C, NE-I, NE-D', '1002-XXX'] },
        { cells: ['8 in', 'NE-C, NE-I, NE-D', '1798-XXX'] },
        { cells: ['10 in', 'NE-C, NE-I, NE-D', '1815-XXX'] },
        { cells: ['12 in', 'NE-C, NE-I, NE-D', '1817-XXX'] },
        { cells: ['14 in', 'NF-C', '23829-03X'] },
        { cells: ['16 in', 'NF-C', '23913-03X'] },
        { cells: ['18 in', 'NF-C', '23903-03X'] },
        { cells: ['20 in', 'NF-C', '23893-03X'] },
        { cells: ['24 in', 'NF-C', '7103-03X'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The elastomer suffix on NE seats is -031 for Buna-N, -034 for FKM, -135 for peroxide-cured EPDM and -036 for natural rubber. The NF-C seats use the same elastomers, with the EPDM code printed as -X35. The 30 and 36 in seats are covered by the brochure’s how-to-order page but have no seat base number listed. Our <a href="/p/demco-butterfly-valve-replacement-seats-2-24">replacement seats</a> listing covers 2 to 24 in. The disc and stem numbers below are the parts you may need with them.',
    },
    {
      type: 'comparison_table',
      caption: 'Discs, lower stems and stem O-rings by size (NE-C, NE-I, NE-D). Disc suffix: -002 316 SS, -005 nickel-plated ductile iron, -014 aluminium bronze',
      columns: ['Size', 'Disc 200 psi', 'Disc 285 psi', 'Disc throttling', 'Lower stem (-001 416 SS, -002 316 SS)', 'Stem O-ring'],
      rows: [
        { cells: ['2 in', '22045-0XX', '22196-0XX', '22214-0XX', '22080-00X', '5526-113'] },
        { cells: ['2-1/2 in', '22046-0XX', '22197-0XX', '22215-0XX', '22081-00X', '5526-115'] },
        { cells: ['3 in', '22047-0XX', '22198-0XX', '22216-0XX', '22081-00X', '5526-115'] },
        { cells: ['4 in', '22048-0XX', '22199-0XX', '22217-0XX', '22082-00X', '5526-116'] },
        { cells: ['5 in', '22049-0XX', '22200-0XX', '22218-0XX', '22083-00X', '5526-212'] },
        { cells: ['6 in', '22050-0XX', '22201-0XX', '22219-0XX', '22083-00X', '5526-212'] },
        { cells: ['8 in', '22051-0XX', '22202-0XX', '22220-0XX', '22084-00X', '5526-212'] },
        { cells: ['10 in', '22052-0XX', '22203-0XX', '22221-0XX', '22085-00X', '5526-214'] },
        { cells: ['12 in', '22053-0XX', '22204-0XX', '22222-0XX', '22086-00X', '5526-220'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'On 8 to 12 in valves the 285 psi aluminium bronze disc uses suffix -024, and the 8 to 12 in upper stem can be 17-4 PH stainless steel (suffix -012) with a 316 stainless steel lower stem. Discs are on the <a href="/p/demco-butterfly-valve-replacement-discs-2-24">replacement discs</a> listing.',
    },

    { type: 'section_head', number: '/04', title: 'Elastomer limits.', anchor: 'elastomers' },
    {
      type: 'comparison_table',
      caption: 'Seat elastomers and temperature limits, from the brochure',
      columns: ['Code', 'Elastomer', 'Temperature range', 'Use for', 'Not for'],
      rows: [
        { cells: ['-031', 'Buna-N', '0 to 180 °F [−18 to 82 °C]', 'Hydrocarbon and petroleum duty', 'Not stated'] },
        { cells: ['-135', 'Peroxide-cured EPDM', '20 to 275 °F [−6 to 135 °C]', 'Water, saturated steam to 275 °F, alkaline solutions', 'Oil and hydrocarbons'] },
        { cells: ['-034', 'FKM', '20 to 300 °F [−6 to 149 °C]', 'Elevated temperature and harsh chemicals', 'Hot water and steam'] },
        { cells: ['-036', 'Natural rubber', '−30 to 150 °F [−34 to 65 °C]', 'Abrasion resistance, dry material handling', 'Oils and solvents'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The valve as a whole is rated −30 to 300 °F by seat selection, so the seat limits above are the real limits. Pick the elastomer from the fluid first and the temperature second; EPDM is the elastomer the brochure recommends for water service, and for the hot-service picture on rigs and plants see <a href="/blog/demco-valves-middle-east-applications">where DEMCO valves are used in the Middle East</a>.',
    },

    { type: 'section_head', number: '/05', title: 'Three cautions.', anchor: 'cautions' },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Throttling discs need stem O-rings and gaskets.',
      body: 'A throttling (0 psi) disc has no seat interference, so it does not seal the stem. The valve is supplied with stem O-rings for this (four are required on throttling valves only), and in 2 to 12 in sizes the flange gaskets help the O-rings seal and must be used only with throttling discs. When you swap a disc, check which disc type is in the valve before you reuse its O-rings.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Plastic flanges can cup.',
      body: 'Steel or cast iron flanges, raised-face or flat-faced, are suitable. Plastic flanges can be damaged by overtightened bolting and may deflect or cup, which leaks at the flange. The brochure asks that plastic flange installations be referred to the maker for review.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Dry and vacuum service.',
      body: 'Dry service raises opening torque significantly, and the brochure recommends 50 psi discs for the dry service found in many vacuum applications, for lower torque and longer seat life. A valve seals against 10 µm of vacuum (29.9 in Hg). Sizing for torque is in <a href="/blog/demco-butterfly-valve-torque-actuator-sizing">torque and actuator sizing</a>.',
    },

    { type: 'section_head', number: '/06', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'paragraph',
      html: 'Indus Hydraulics quotes DEMCO butterfly valve spares from Dubai, UAE. For a seat, send the valve size, the series, the shut-off rating and the elastomer, or the nameplate number. For a disc or stem, add the material codes. We confirm the seat, disc, stem, bearing and O-ring numbers against the brochure before quoting. Browse the <a href="/c/butterfly-valves">butterfly valves</a> shelf.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Do I need special tools to change a DEMCO butterfly valve seat?',
          answer:
            'No. The hard-backed cartridge seat is slip-fitted into the body, and the brochure describes seat replacement as in-field repair without special tools.',
        },
        {
          question: 'What lubricant should I use on reassembly?',
          answer:
            'A small amount of general-purpose, non-hydrocarbon-based lubricant on the outside of the stems, the seat and the disc flats. No regular lubrication is required in service.',
        },
        {
          question: 'What is the temperature limit of an EPDM seat?',
          answer:
            'Peroxide-cured EPDM is rated 20 to 275 °F [−6 to 135 °C] and is recommended for water. It resists saturated steam to 275 °F, but is not suitable for oil or hydrocarbons.',
        },
        {
          question: 'Which seat should I fit for a hot hydrocarbon line?',
          answer:
            'FKM covers elevated temperature (20 to 300 °F) and harsh chemicals, and Buna-N covers petroleum duty up to 180 °F. Neither is for hot water or steam. Send the fluid and temperature and we will check.',
        },
        {
          question: 'Why does my throttling valve have extra O-rings?',
          answer:
            'A throttling disc does not press into the seat, so it provides no stem seal. Four stem O-rings are provided on throttling valves, helped by flange gaskets on 2 to 12 in sizes.',
        },
        {
          question: 'Can I use a DEMCO butterfly valve with plastic flanges?',
          answer:
            'The brochure warns that plastic flanges can be damaged by overtightening and may cup and leak, and asks for those installations to be referred to the maker.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Seats, discs, stems and a valve',
      skus: ['IH-VAL-BFLY-SEATS', 'IH-VAL-BFLY-DISCS', 'IH-VAL-BFLY-STEMS-PARTS', 'IH-VAL-BFLY-NEC-W-6'],
    },
    {
      type: 'category_link',
      slug: 'butterfly-valves',
      label: 'Butterfly valves',
      blurb: 'DEMCO butterfly valves with replacement seats, discs, stems, bearings, handles and operators.',
    },
    {
      type: 'related_articles',
      slugs: ['demco-butterfly-valve-part-numbers', 'demco-butterfly-valve-torque-actuator-sizing', 'demco-gate-valve-vs-butterfly-valve', 'butterfly-valves-wafer-lug-and-grooved'],
    },
    {
      type: 'cta_block',
      heading: 'Need a seat, disc or stem?',
      body: 'Send the nameplate number or the series, size and rating. We will confirm the part numbers and quote from Dubai.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
