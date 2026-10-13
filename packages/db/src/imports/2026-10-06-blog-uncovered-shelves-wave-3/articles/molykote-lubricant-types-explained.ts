import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Pillar for the six Molykote shelves. Product types, chemistries, temperature
 * ranges and pack facts are read from the 152 listings. Names the products we
 * supply; makes no claim about a distribution agreement.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'molykote-lubricant-types-explained',
  title: 'Molykote lubricant types explained: greases, pastes, coatings, compounds, oils and dispersions',
  excerpt:
    'Molykote sells six different kinds of lubricant, and choosing the wrong kind costs more than choosing the wrong product. What each type is, the job it does, and the products we supply in each.',
  categorySlug: 'maintenance-reliability',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T00:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the main types of Molykote lubricant?',
      answer:
        'Six. Greases (a base oil held in a thickener) for bearings and moving parts; pastes (heavily loaded with solid lubricant) for assembly, threads and anti-seize; anti-friction coatings (solids in a binder, cured on like paint) for parts that cannot be re-lubricated; silicone compounds for sealing, insulating and valve duty; oils and fluids for gears, compressors and process gas; and dispersions, which carry solids in a fluid or a spray. The job decides the type before it decides the product.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Moving parts that can be re-lubricated take a grease or an oil. Threads, splines and press fits take a paste.',
        'Anti-friction coatings are dry films cured onto the part — some at room temperature, some at 180 °C to 220 °C in an oven.',
        'Paste ratings of 650 °C to 1,400 °C describe the solid lubricant left behind as anti-seize, not an oil that survives the heat.',
        'Silicone compounds insulate, seal and lubricate valves and rubber; they are not general bearing greases.',
        'Our Molykote shelves list 63 greases, 28 oils and fluids, 21 pastes, 19 coatings, 12 dispersions and 9 compounds.',
      ],
    },
    {
      type: 'lead',
      html: 'A plant lubrication schedule usually names one or two greases and leaves everything else to whatever is in the store. Molykote\'s range is built the other way round: <strong>the type of lubricant follows from the job</strong>, and inside each type the product follows from the temperature, the load and what the lubricant touches. Get the type right and the choice of product is short.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Six types, six jobs.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'The six Molykote product types on our shelves',
      columns: ['Type', 'What it is', 'Typical job', 'Examples we list'],
      rows: [
        { cells: ['Grease', 'Base oil held in a thickener, sometimes with solid lubricant added', 'Bearings, gears, slides, seals', 'G-4500 FMS, 33 Light, 41, G-0010, BR-2 Plus'], highlight: true },
        { cells: ['Paste', 'High solid-lubricant content in a carrier', 'Assembly, threaded joints, anti-seize, fretting', 'G-N, G-Rapid Plus, 1000, P-37, CU-7439 Plus'] },
        { cells: ['Anti-friction coating', 'Solid lubricant in a binder and solvent, cured on', 'Parts that cannot be re-lubricated, dusty or clean environments', 'D-321 R, D-708, D-6600, PA-744'] },
        { cells: ['Compound', 'Silicone base thickened with silica or PTFE', 'Sealing, electrical insulation, valve and rubber lubrication', '4, 5, 7, 111, 112, G-807'] },
        { cells: ['Oil and fluid', 'Mineral, PAO, ester or silicone fluid', 'Gearboxes, compressors, process gas, barrier fluid', 'L-1122FM, L-1246, L-0268, 211 Fluid'] },
        { cells: ['Dispersion', 'Solids carried in a fluid, an aerosol or as an additive powder', 'Dry films, oil additives, release agents', '557, L-8030, M Gear Oil Additive, Lubolid powders'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Greases: base oil, thickener, grade.',
      anchor: 'greases',
    },
    {
      type: 'paragraph',
      html: 'A grease is a base oil held in place by a thickener, and the two together set its temperature range and what it is compatible with. Our Molykote grease listings cover mineral oil, PAO, ester, silicone, fluorosilicone, PAG and perfluoropolyether (PFPE) bases, thickened with lithium, lithium complex, aluminium complex, polyurea, silica or PTFE, in NLGI grades from 0 to 3. The spread of service temperatures is wide: Molykote 33 Light is listed from −73 °C to 204 °C, HP-670 from −65 °C to 250 °C, Molykote 41 from −20 °C to 290 °C, and the 1122 chain and open-air grease from 10 °C to 160 °C. How to narrow that down is in <a href="/blog/grease-selection-base-oil-thickener-nlgi">grease selection by base oil, thickener and grade</a>.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Pastes: assembly and anti-seize.',
      anchor: 'pastes',
    },
    {
      type: 'paragraph',
      html: 'A paste carries far more solid lubricant than a grease, because its job is to protect surfaces that barely move — threads under torque, press fits, splines and bolted joints that must come apart years later. The solids on our listings are MoS<sub>2</sub>, graphite and white solids, and CU-7439 Plus is a copper-coloured paste. Assembly pastes such as G-N (−18 °C to 400 °C) and G-Rapid Plus (−35 °C to 450 °C) cut friction during fitting and running-in; anti-seize pastes such as Molykote 1000 (−30 °C to 650 °C), P-3700 (to 900 °C), HSC Plus (to 1,100 °C) and P-37 (to 1,400 °C) keep hot bolts from seizing. The detail is in <a href="/blog/anti-seize-and-assembly-pastes">anti-seize and assembly pastes</a>.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Anti-friction coatings: lubrication that stays put.',
      anchor: 'coatings',
    },
    {
      type: 'paragraph',
      html: 'An anti-friction coating is applied like paint — sprayed, dipped or brushed — and cured into a dry film of MoS<sub>2</sub>, graphite or PTFE. There is no oil to drip, wash out or collect dust. Cure conditions differ widely and decide where a coating can be used: D-321 R is listed with a 20 °C cure and D-96 at 23 °C, while D-708, D-7708 and PA-744 cure at 180 °C, D-6600 at 200 °C, and D-6818 and D-7620 at 220 °C. See <a href="/blog/anti-friction-coatings-explained">anti-friction coatings explained</a>.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Compounds, oils and dispersions.',
      anchor: 'others',
    },
    {
      type: 'paragraph',
      html: 'The silicone compounds are specialists: Molykote 4 is an electrical insulating compound (−54 °C to 200 °C), 3099 HVIC a high-voltage insulator coating, 112 a lubricant and sealant, and G-807 a low-friction compound thickened with PTFE. The oils run from ISO 5 barrier fluid through ISO 32 to 100 compressor oils to ISO 150, 220 and 460 gear oils, alongside the 211 silicone fluids. The dispersions include the 557 silicone dry-film lubricant, the L-8030 PFPE lubricant with PTFE, the M gear oil additive with MoS<sub>2</sub>, and Lubolid additive powders listed to a maximum of 650 °C.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Do not mix greases on a whim.',
      body: 'Greases with different thickeners or base oils can soften, harden or separate when mixed in a bearing. When changing product, purge the old grease out rather than topping up over it, and check compatibility with the supplier first. Keep silicone products away from surfaces that will be painted or bonded.',
    },

    {
      type: 'section_head',
      number: '/06',
      title: 'Reading a Molykote name.',
      anchor: 'names',
    },
    {
      type: 'paragraph',
      html: 'Product names carry some information and not much more. FM in a name (G-4500 FM, L-1122FM, P-1900 FM) marks Molykote\'s food-machinery grades; confirm the food-contact registration on the current datasheet before using one in a food plant. The 211 Fluid grades are named by nominal viscosity, and our listings give the viscosity at 40 °C, which reads lower — 211 Fluid 15,000 cSt is listed at 11,378 cSt at 40 °C. Pack sizes vary by product from 400 ml aerosols and cartridges to 180 kg drums and 1,000 kg IBCs.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What is the difference between a Molykote grease and a paste?',
          answer:
            'A grease is mostly base oil held in a thickener, for parts that move and can be re-lubricated. A paste is heavily loaded with solid lubricant such as MoS2, graphite or white solids, for threads, press fits and parts that barely move but must not seize.',
        },
        {
          question: 'Which Molykote product is for very high temperatures?',
          answer:
            'For bolts, an anti-seize paste: Molykote 1000 is listed to 650 °C and P-37 to 1,400 °C, where the solid lubricant does the work. For bearings, a high-temperature grease: Molykote 41 is listed to 290 °C and HP-670 to 250 °C.',
        },
        {
          question: 'What is an anti-friction coating?',
          answer:
            'A dry lubricant film of MoS2, graphite or PTFE in a binder, applied like paint and cured, at room temperature or in an oven depending on the product. It suits parts that cannot be re-lubricated or must stay clean.',
        },
        {
          question: 'Are Molykote FM products food grade?',
          answer:
            'FM marks Molykote\'s food-machinery grades. Check the food-contact registration on the current datasheet for the specific product before using it in a food plant.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'One of each type',
      skus: [
        'IH-LUB-G-4500-FMS-MULTI-PURPOSE-SYNTHETIC-GREASE',
        'IH-LUB-33-LIGHT-EXTREME-LOW-TEMPERATURE-GREASE',
        'IH-LUB-G-N-METAL-ASSEMBLY-PASTE',
        'IH-LUB-P37',
        'IH-LUB-D-321-R-ANTI-FRICTION-COATING-SPRAY',
        'IH-LUB-111-COMPOUND',
        'IH-LUB-L-1122FM-SYNTHETIC-GEAR-OIL-ISO-220',
        'IH-LUB-557-SILICONE-DRY-FILM-LUBRICANT',
      ],
    },
    {
      type: 'category_link',
      slug: 'molykote-grease-suppliers-uae',
      label: 'Molykote greases',
      blurb: '63 greases on mineral, PAO, ester, silicone, PFPE and PAG bases.',
    },
    {
      type: 'category_link',
      slug: 'molykote-pastes',
      label: 'Molykote pastes',
      blurb: 'Assembly and anti-seize pastes, tubs, cans and sprays.',
    },
    {
      type: 'category_link',
      slug: 'molykote-anti-friction-coatings',
      label: 'Molykote anti-friction coatings',
      blurb: 'Air-cured and heat-cured dry films, plus thinner.',
    },
    {
      type: 'category_link',
      slug: 'molykote-compounds',
      label: 'Molykote compounds',
      blurb: 'Silicone compounds for sealing, insulation and valves.',
    },
    {
      type: 'category_link',
      slug: 'molykote-oils',
      label: 'Molykote oils and fluids',
      blurb: 'Gear, compressor, process gas and silicone fluids.',
    },
    {
      type: 'category_link',
      slug: 'molykote-dispersions',
      label: 'Molykote dispersions',
      blurb: 'Dry films, additives, release agents and sprays.',
    },

    {
      type: 'cta_block',
      heading: 'Need a Molykote product matched to a job?',
      body: 'Send the component, the temperature range, the load and speed, and what the lubricant must not attack. We will name the type and the product, and quote the pack size you use.',
      quoteLabel: 'Quote Molykote',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Product types, chemistries, temperature ranges, cure temperatures and pack sizes checked against our Molykote listings.',
    },
  ],
}

export default ARTICLE
