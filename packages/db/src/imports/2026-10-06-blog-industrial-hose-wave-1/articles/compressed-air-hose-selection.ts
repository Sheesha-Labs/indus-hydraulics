import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Compressed air hose, read from the eight air and water listings plus A125:
 * pressures, standards printed on the hose, oil-mist tubes, mandrel against
 * extruded construction, the 40 bar high-temperature hose and the anti-static
 * hose.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'compressed-air-hose-selection',
  title: 'Compressed air hose selection: oil mist, temperature and the 40 bar exception',
  excerpt:
    'Most air hose on a site is rated 20 bar and looks the same. The differences that matter are the tube against compressor oil, the temperature off the discharge, and how the hose was built.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T11:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do I choose a compressed air hose?',
      answer:
        'Start with pressure and temperature at the point of use, then the tube. Our air and water hoses are rated 20 bar with oil-mist-resistant tubes for compressor air, from 6 mm to 76 mm. Where the air is hot — straight off a compressor discharge — use a high-temperature hose: ours is rated 40 bar and +100 °C from 2" to 4". Add anti-static construction where static matters, and always restrain the couplings.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Compressor air carries oil mist; our air hoses have oil-mist-resistant tubes, which a plain water hose does not.',
        'The 20 bar air and water hoses print their standard on the hose: BS 5118/2 and ISO 2398 on A101HP and A102HP, EN ISO 2398 on the mandrel-built A190.',
        'Hot discharge air needs a high-temperature hose: A116EU100 is 40 bar, −30 to +100 °C, 2" to 4", with steel wire plies.',
        'Mandrel-built hose holds its bore and roundness better in large sizes; extruded hose is lighter and smoother in small ones.',
        'An air hose that separates whips violently; pin the couplings and fit a whip check.',
      ],
    },
    {
      type: 'lead',
      html: 'Air hose is the most common hose on any site and the least specified. Almost all of it is rated 20 bar, and almost all of it looks alike — which is why the differences get missed. The ones that matter are the <strong>tube against compressor oil</strong>, the temperature of the air where the hose actually starts, and how the hose was built.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Oil mist and the tube.',
      anchor: 'oil-mist',
    },
    {
      type: 'paragraph',
      html: 'Compressed air carries fine oil from the compressor, and over time that oil attacks tube compounds that are fine with water. Our air and water hoses are built with <strong>oil-mist-resistant tubes</strong> — NR/SBR or SBR on the 20 bar hoses, EPDM on the anti-static hose — and covers resistant to abrasion, ozone and weather. Where the line carries more oil than mist, or is a lubricator feed, the mineral oil and air hose (A125, 20 bar, NBR tube) is the better choice.',
    },
    {
      type: 'comparison_table',
      caption: 'Our air and water hoses',
      columns: ['Hose', 'Rating and standard on the hose', 'Sizes', 'Temperature'],
      rows: [
        { cells: ['A101HP black / A102HP yellow', '20 bar, SF 3:1; BS 5118/2 and ISO 2398', '1/4" – 1" / 1/2" – 1"', '−20 to +80 °C'], highlight: true },
        { cells: ['A190 black / A190Y yellow, mandrel built', '20 bar, SF 3:1; EN ISO 2398', '1/2" – 3"', '−20 to +70 °C'] },
        { cells: ['A103HP blue / A105HP green multi-utility', '20 bar, SF 3:1', '3/4" – 1"', '−20 to +90 °C'] },
        { cells: ['A101AS-T3 anti-static', '20 bar, SF 3:1; BS 2878 printed', '1/4" – 1"', '−30 to +80 °C, 100 °C intermittent'] },
        { cells: ['A116EU100 high-temperature air', '40 bar, SF 3:1', '2" – 4"', '−30 to +100 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Hot air off the compressor.',
      anchor: 'temperature',
    },
    {
      type: 'paragraph',
      html: 'Air leaves a compressor hot, and the first few metres of hose see temperatures the rest of the system never does. A standard 20 bar air hose rated to +70 or +80 °C will age fast there. Our <strong>high-temperature air hose (A116EU100)</strong> is built for that position: 40 bar working, 120 bar minimum burst, −30 to +100 °C, with high-tensile steel wire plies and a pin-pricked EPDM cover, from 2" to 4". It is the hose for compressor discharge lines and large-bore site air mains, not for the tool end.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Mandrel-built or extruded.',
      anchor: 'construction',
    },
    {
      type: 'paragraph',
      html: 'Small air hose is usually extruded: the tube and cover are pushed through a die over the reinforcement, giving a smooth, light hose — our A101HP and A102HP. Larger hose is better built on a mandrel, where the layers are wrapped over a steel core and cured on it, which holds the bore round and true and resists kinking in the bigger sizes — our A190 and A190Y, from 1/2" to 3". The pressure rating is the same 20 bar; the difference is how the hose behaves when it is dragged, coiled and run over.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Couplings and restraint.',
      anchor: 'restraint',
    },
    {
      type: 'paragraph',
      html: 'Site air runs on universal (claw) couplings, which connect any hose to any tool of the same type. That convenience is also the hazard: compressed air is stored energy, and a hose end that lets go is driven by the air behind it. Pin every claw joint with a safety clip, fit a whip check cable across joints and from hose to tool, and turn the air off before disconnecting. Our whip checks run from a 1/8" cable at 12" to a 3/8" cable at 44".',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Never use compressed air on skin or clothing.',
      body: 'Air from a blowgun or a hose end can drive particles into eyes and skin and can enter the body through a cut. Keep the pressure at the tool to what the task needs, and never point a hose at a person.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What pressure rating should an air hose have?',
          answer:
            'At least the compressor\'s maximum delivery pressure. Our standard air and water hoses are rated 20 bar at a 3:1 safety factor; the high-temperature air hose is rated 40 bar.',
        },
        {
          question: 'Can I use a water hose for compressed air?',
          answer:
            'Not reliably. Compressor air carries oil mist, which attacks tube compounds that are fine with water. Use an air hose with an oil-mist-resistant tube.',
        },
        {
          question: 'Which air hose goes on a compressor discharge?',
          answer:
            'A high-temperature hose. Our A116EU100 is rated 40 bar and −30 to +100 °C, from 2" to 4".',
        },
        {
          question: 'What is the difference between mandrel-built and extruded air hose?',
          answer:
            'Mandrel-built hose is cured on a steel core, which keeps the bore round and kink-resistant in large sizes. Extruded hose is lighter and smoother and suits small sizes.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Air and water hose',
      skus: ['IH-IH-A101HP', 'IH-IH-A102HP', 'IH-IH-A190', 'IH-IH-A190Y', 'IH-IH-A116EU100', 'IH-IH-A101AS-T3', 'IH-IH-A105HP', 'IH-IH-A125'],
    },
    {
      type: 'product_embed',
      heading: 'Couplings and restraint',
      skus: ['IH-UAC-US-HOSE', 'IH-UAC-EU-HOSE', 'IH-UAC-WHIP-HOSE-HOSE', 'IH-UAC-WHIP-HOSE-TOOL'],
    },
    {
      type: 'category_link',
      slug: 'air-water-hoses',
      label: 'Air and water hose',
      blurb: '20 bar air and water hose, anti-static hose and 40 bar high-temperature air hose.',
    },
    {
      type: 'category_link',
      slug: 'universal-air-couplings',
      label: 'Universal air couplings',
      blurb: 'Claw couplings, washers and whip checks.',
    },

    {
      type: 'cta_block',
      heading: 'Laying out a site air system?',
      body: 'Tell us the compressor pressure and discharge temperature, the main and drop sizes and the tools. We will quote the hose, couplings, clips and whip checks.',
      quoteLabel: 'Quote air hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Pressures, temperatures, standards, compounds and sizes checked against our air and water hose listings.',
    },
  ],
}

export default ARTICLE
