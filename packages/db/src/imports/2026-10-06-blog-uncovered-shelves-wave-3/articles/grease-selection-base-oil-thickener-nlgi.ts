import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Grease selection, read from the 63 Molykote grease listings: base oil,
 * thickener, NLGI grade, base oil viscosity, dropping point and service
 * temperature. The G-006x FM listings gave temperatures in °F labelled °C;
 * they are converted here, and the listings now give both (corrected by
 * 2026-10-06-listing-data-fixes).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'grease-selection-base-oil-thickener-nlgi',
  title: 'Grease selection by base oil, thickener and NLGI grade: reading a grease listing',
  excerpt:
    'Every grease listing gives the same handful of numbers. What the base oil, the thickener, the base oil viscosity and the NLGI grade each tell you, with examples from the 63 Molykote greases we list.',
  categorySlug: 'maintenance-reliability',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T00:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How do you choose an industrial grease?',
      answer:
        'Work through four properties. The base oil sets the temperature range and what the grease is compatible with. The thickener sets how it holds together in heat and water. The base oil viscosity matches speed and load — thick oil for slow, heavy bearings, thin oil for fast or cold ones. The NLGI grade is consistency: grade 2 for most bearings, softer grades for centralised systems. Then check the grease against the seals, plastics and anything else it will touch.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Base oil first: mineral and PAO for general duty, silicone for extreme cold, PFPE and fluorosilicone for heat and chemicals.',
        'Thickener second: lithium, lithium complex, aluminium complex, polyurea, silica and PTFE all appear on our listings.',
        'Base oil viscosity on our greases runs from 17 cSt (PG-65) to 9,850 cSt (EM-D110) at 40 °C — fast and cold at one end, slow and heavy at the other.',
        'Our Molykote greases run from NLGI 0 to 3. Grade 2 is the common bearing grease; softer grades pump through centralised systems.',
        'The dropping point is not a service limit. EM-30L is listed with a 195 °C dropping point and a service range to 150 °C.',
      ],
    },
    {
      type: 'lead',
      html: 'A grease is mostly oil, and the rest decides whether that oil stays where it is needed. The listing for every grease gives the same few facts — base oil, thickener, viscosity, grade, temperature — and <strong>each answers a different question</strong> about the job. Read in the right order, they narrow a range of sixty greases to two or three.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Base oil: temperature and compatibility.',
      anchor: 'base-oil',
    },
    {
      type: 'comparison_table',
      caption: 'Base oils on our Molykote grease listings',
      columns: ['Base oil', 'Examples we list', 'Listed service range'],
      rows: [
        { cells: ['Mineral oil', 'G-0010 (polyurea)', '−30 °C to 170 °C'] },
        { cells: ['PAO (synthetic)', 'G-4500 FMS, G-1033, PG-65, EM-50L', '−55 °C to 150 °C across these'], highlight: true },
        { cells: ['Ester / ester + PAO', 'BG-555, 7514', '−40 °C to 150 °C; −40 °C to 180 °C'] },
        { cells: ['Silicone', '33 Light, G-5133 M, 822M', '−73 °C to 204 °C; −73 °C to 220 °C; −40 °C to 200 °C'] },
        { cells: ['Fluorosilicone', 'FS-841 (PTFE thickener)', '−40 °C to 232 °C'] },
        { cells: ['PFPE', 'HP-670 (PTFE thickener)', '−65 °C to 250 °C'] },
        { cells: ['PAG', 'G-3500, G-3407', '−40 °C to 150 °C; −40 °C to 200 °C'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Mineral and PAO greases cover most plant duty; PAO keeps working colder and lasts longer at temperature. Silicone greases hold their consistency across the widest temperature span — Molykote 33 Light is listed from −73 °C — but silicone oil carries less load between steel surfaces, so they suit light loads, rubber and plastics better than heavily loaded metal bearings. PFPE and fluorosilicone greases are the high-temperature and chemical-resistance end of the range.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Thickener: what holds the oil.',
      anchor: 'thickener',
    },
    {
      type: 'paragraph',
      html: 'The thickener is the sponge that holds the oil and releases it under load. Simple lithium soap is the general-purpose standard; lithium complex, aluminium complex and polyurea are built for higher temperatures and longer life, and aluminium complex is the thickener behind the FM food-machinery greases on our listings (G-4500 FMS, G-1502 FM, G-0062 FM). Silica and PTFE are non-soap thickeners, used with silicone, fluorosilicone and PFPE oils. Mixing greases with different thickeners can soften or harden them, so purge rather than top up when changing product.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Base oil viscosity: speed and load.',
      anchor: 'viscosity',
    },
    {
      type: 'paragraph',
      html: 'The viscosity of the oil inside the grease matters as much as the grease itself. Slow, heavily loaded bearings and open gears need a thick oil to keep a film between the surfaces; fast bearings and cold starts need a thin one that does not churn or stiffen. Our listings show the full span: PG-65 at 17 cSt and BG-555 at 26 cSt at 40 °C at the thin end, G-4500 FMS at 100 cSt and G-1502 FM at 220 cSt in the middle, and EM-50L at 1,050 cSt and EM-D110 at 9,850 cSt at the thick end. The 1122 chain and open-air grease is listed at 1,500 mm²/s.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'NLGI grade: consistency.',
      anchor: 'nlgi',
    },
    {
      type: 'paragraph',
      html: 'The NLGI grade measures how stiff a grease is, from semi-fluid grades through 2, the usual bearing grease, to stiffer grades above it. Our Molykote greases run from NLGI 0 (G-0060 FM, G-0061 FM) to 3, with many at 1 or 2. Softer greases flow and pump more easily, which is why centralised lubrication systems and cold climates favour them; stiffer greases stay put in vertical shafts, loose seals and vibrating equipment. The grade is not a quality rating — the same base oil and thickener can be made in several grades.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Dropping point is not the working limit.',
      body: 'The dropping point is the temperature at which a grease drips in a laboratory test. The usable limit is well below it: EM-30L is listed with a dropping point of 195 °C and a service range to 150 °C, and Molykote 44 MED with 227 °C against 200 °C. Choose on the service range.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Check what the grease touches.',
      anchor: 'compatibility',
    },
    {
      type: 'paragraph',
      html: 'A grease that suits the bearing can still attack the seal, swell a plastic gear or contaminate a product. PAO greases such as PG-65 Plastislip are formulated with plastics in mind; silicone greases such as Molykote 55 O-Ring Grease (−65 °C to 175 °C) for rubber seals; 3451 and 3452 are listed as chemical-resistant bearing and valve greases with fluorinated thickeners. For food plants, the FM greases are the food-machinery grades — confirm the registration on the datasheet. The other Molykote types are covered in <a href="/blog/molykote-lubricant-types-explained">Molykote lubricant types explained</a>.',
    },

    {
      type: 'decision_tree',
      heading: 'A short route through the grease shelf',
      intro: 'Confirm the final choice against the datasheet and the equipment maker\'s requirement.',
      branches: [
        {
          condition: 'General plant bearings and slides, normal temperatures?',
          outcome: 'A lithium or aluminium complex grease on mineral or PAO oil, NLGI 2 — BR-2 Plus or G-4500 FMS.',
          sku: 'IH-LUB-BR-2-PLUS',
        },
        {
          condition: 'Extreme cold, or light loads on rubber and plastic?',
          outcome: 'Silicone — Molykote 33 Light, listed from −73 °C.',
          sku: 'IH-LUB-33-LIGHT-EXTREME-LOW-TEMPERATURE-GREASE',
        },
        {
          condition: 'Bearings running above 200 °C?',
          outcome: 'PFPE HP-670 (to 250 °C) or Molykote 41 (to 290 °C).',
          sku: 'IH-LUB-HP-670-GREASE',
        },
        {
          condition: 'Plastic gears and mechanisms?',
          outcome: 'PAO grease made for plastics — PG-65 Plastislip.',
          sku: 'IH-LUB-PG-65-PLASTISLIP-GREASE',
        },
        {
          condition: 'Fuels, solvents or chemicals in contact?',
          outcome: 'Fluorosilicone FS-841 or the chemical-resistant 3451.',
          sku: 'IH-LUB-FS-841-GREASE',
        },
        {
          condition: 'Food machinery?',
          outcome: 'An FM grade such as G-4500 FMS, after checking its registration.',
          sku: 'IH-LUB-G-4500-FMS-MULTI-PURPOSE-SYNTHETIC-GREASE',
        },
      ],
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does NLGI 2 mean?',
          answer:
            'It is a consistency grade on the NLGI scale — the common grade for rolling bearings. Lower numbers are softer and flow more easily; higher numbers are stiffer.',
        },
        {
          question: 'Is a higher dropping point always better?',
          answer:
            'Not on its own. It indicates thermal stability of the thickener, but the usable limit is the listed service range, which sits well below the dropping point.',
        },
        {
          question: 'Can silicone grease be used on steel bearings?',
          answer:
            'At light loads, yes. Silicone oil carries less load between steel surfaces than mineral or PAO oil, so heavily loaded metal bearings are better served by those.',
        },
        {
          question: 'Which Molykote grease works at the lowest temperature?',
          answer:
            'On our listings, Molykote 33 Light and G-5133 M are rated from −73 °C.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Molykote greases mentioned',
      skus: [
        'IH-LUB-BR-2-PLUS',
        'IH-LUB-G-4500-FMS-MULTI-PURPOSE-SYNTHETIC-GREASE',
        'IH-LUB-33-LIGHT-EXTREME-LOW-TEMPERATURE-GREASE',
        'IH-LUB-HP-670-GREASE',
        'IH-LUB-41-EXTREME-HIGH-TEMPERATURE-BEARING-GREASE',
        'IH-LUB-PG-65-PLASTISLIP-GREASE',
        'IH-LUB-FS-841-GREASE',
        'IH-LUB-55-O-RING-GREASE',
      ],
    },
    {
      type: 'category_link',
      slug: 'molykote-grease-suppliers-uae',
      label: 'Molykote greases',
      blurb: '63 greases across seven base oils and six thickeners.',
    },
    {
      type: 'category_link',
      slug: 'molykote-oils',
      label: 'Molykote oils and fluids',
      blurb: 'Gear, compressor and process gas oils for oil-lubricated equipment.',
    },

    {
      type: 'cta_block',
      heading: 'Want a grease checked against your equipment?',
      body: 'Send the bearing or component, speed, load, temperature range, seal material and any food or chemical contact. We will propose the grease and quote the pack size.',
      quoteLabel: 'Quote Molykote greases',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Base oils, thickeners, NLGI grades, base oil viscosities, dropping points and service ranges checked against our Molykote grease listings.',
    },
  ],
}

export default ARTICLE
