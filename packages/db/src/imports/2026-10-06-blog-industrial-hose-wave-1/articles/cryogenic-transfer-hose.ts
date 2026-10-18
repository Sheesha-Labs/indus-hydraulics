import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Cryogenic hose and couplings, read from the cryogenic listings on the
 * specialty assemblies and metal hose couplings shelves. The EN 13648-1 line
 * on three listings is not repeated (that standard covers cryogenic vessel
 * safety devices, not hose).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'cryogenic-transfer-hose',
  title: 'Cryogenic transfer hose: LIN, LOX, argon, CO₂ and LNG',
  excerpt:
    'At −196 °C rubber is glass, so cryogenic transfer hose is stainless metal hose — cleaned, braided and certified for the gas. The temperatures on our listings, the oxygen-cleaning rule, and the couplings that go with it.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T13:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What hose is used for cryogenic liquids?',
      answer:
        'Stainless steel corrugated metal hose, because no elastomer stays flexible at cryogenic temperatures. Our cryogenic hoses use 316L cores and braids and are listed for liquid nitrogen to −196 °C, liquid argon to −186 °C, liquid oxygen to −183 °C, LNG to −162 °C and CO₂ to −78 °C. Oxygen service adds a cleaning requirement, and the couplings and insulation are part of the specification.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Cryogenic hose is metal: our LIN, LAR, LOX and LNG hoses are 316L cores with double 316L braid.',
        'Listed service temperatures: LIN −196 °C, LAR −186 °C, LOX −183 °C, LNG −162 °C, CO₂ −78 °C.',
        'Oxygen hose must be cleaned for oxygen service; our LOX hose lists CGA G-4.1 cleaning.',
        'Pressures are modest by metal-hose standards: 30–50 bar on the liquid transfer hoses, up to 100 bar on the CO₂ process connector.',
        'Non-valved cryogenic couplings, insulation covers and the right gasket complete the assembly.',
      ],
    },
    {
      type: 'lead',
      html: 'At −196 °C a rubber hose is no longer a hose — it is brittle enough to shatter. Every cryogenic transfer line, from a nitrogen dewar to an LNG truck, is therefore a <strong>stainless steel metal hose</strong>. What separates one from another is the gas, the cleanliness it demands, the pressure, and the certifications that come with the duty.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'By gas.',
      anchor: 'by-gas',
    },
    {
      type: 'comparison_table',
      caption: 'Cryogenic hose in our range',
      columns: ['Service', 'Hose', 'Rating', 'Sizes'],
      rows: [
        { cells: ['Liquid nitrogen (LIN)', 'Thorburn LIN transfer hose, 316L, double braid', '35 bar, −196 to +60 °C', 'DN13 – DN100'] },
        { cells: ['Liquid argon (LAR)', 'Witzenmann LAR transfer hose, 316L, double braid', '30 bar, −186 to +60 °C', 'DN13 – DN100'] },
        { cells: ['Liquid oxygen (LOX)', 'Thorburn LOX transfer hose, 316L, double braid', '35 bar, −183 to +60 °C', 'DN13 – DN100'], highlight: true },
        { cells: ['LNG unloading', 'Thorburn LNG unloading hose, 316L, double braid', '30 bar, −162 to +60 °C', 'DN50 – DN200'] },
        { cells: ['LNG marine transfer', 'Senior Flexonics LNG marine hose, 316L, double braid', '50 bar, −162 to +60 °C', 'DN100 – DN250'] },
        { cells: ['CO₂ dewar transfer', 'Thorburn CO₂ connector, single braid', '50 bar, −78 to +60 °C', 'DN13 – DN25'] },
        { cells: ['CO₂ process plant', 'Thorburn CO₂ connector, double braid', '100 bar, −78 to +60 °C', 'DN25 – DN100'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Oxygen is the special case.',
      anchor: 'oxygen',
    },
    {
      type: 'paragraph',
      html: 'Liquid and gaseous oxygen turn ordinary contamination — a film of oil, a fleck of grease, a fibre — into a fuel. Hose for oxygen service must be cleaned and kept clean for oxygen, sealed and bagged until it is installed. Our LOX transfer hose lists CGA-440 and CGA G-4.1, the Compressed Gas Association\'s oxygen-cleaning practice, together with UL536; our industrial oxygen service hose (CGA96) carries CGA-8.1-M86, CGA96, CGA G-4.1 and UL536. Never substitute a general-purpose metal hose on an oxygen line.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'No oil, no grease, no substitutes on oxygen.',
      body: 'Do not lubricate oxygen fittings with ordinary grease, do not handle cleaned components with oily gloves, and do not swap an oxygen-cleaned hose for a standard one in an emergency. Ignition in oxygen service is violent.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Couplings, insulation and frost.',
      anchor: 'couplings',
    },
    {
      type: 'paragraph',
      html: 'Cryogenic hose ends in couplings that seal at temperature. Our Thorburn T52 non-valved cryogenic couplings come in a liquid-phase version (DN13 to DN100, 35 bar) and a vapour-return version (DN13 to DN50, 14 bar), both rated to −200 °C and listed with CGA-8.1-M86. An uninsulated cryogenic hose frosts heavily and boils off product; the ThermaCover cryogenic insulation cover fits host hoses from DN25 to DN200 and is rated to −200 °C. Keep frosted hose away from people — cold burns from bare metal at these temperatures are immediate.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Handling and certification.',
      anchor: 'handling',
    },
    {
      type: 'paragraph',
      html: 'Metal hose at cryogenic temperature is stiffer than at ambient, and the corrugations are where fatigue starts: move it only when warm where possible, never twist it, and support long runs. Specify the certification the duty requires when ordering — CGA references for industrial gases, and for marine LNG our Senior Flexonics hose lists the IGC Code with BV, DNV or Lloyd\'s approval selectable.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can rubber hose carry liquid nitrogen?',
          answer:
            'No. Rubber becomes brittle at cryogenic temperatures. Liquid nitrogen hose is stainless metal hose — ours is rated to −196 °C.',
        },
        {
          question: 'What makes a hose suitable for oxygen?',
          answer:
            'Oxygen-compatible materials and cleaning for oxygen service. Our LOX hose lists CGA G-4.1 cleaning and CGA-440.',
        },
        {
          question: 'What pressure are cryogenic hoses rated for?',
          answer:
            'Our liquid transfer hoses are rated 30–50 bar; the CO₂ process connector is rated 100 bar. Check the listing for your gas and size.',
        },
        {
          question: 'Do cryogenic hoses need insulation?',
          answer:
            'Usually. Uninsulated hose frosts and boils off product. Our ThermaCover cryogenic insulation cover fits DN25 to DN200 hose and is rated to −200 °C.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Cryogenic hose and couplings',
      skus: [
        'IH-MH-THORBURN-CRYO-LIN',
        'IH-MH-WITZENMANN-CRYO-LAR',
        'IH-MH-THORBURN-CRYO-LOX',
        'IH-MH-THORBURN-CRYO-LNG-UNLOAD',
        'IH-MH-THORBURN-CRYO-CO2-PROCESS',
        'IH-MH-THORBURN-T52-CRYO-LIQUID',
        'IH-MH-THORBURN-THERMACOVER-CRYO',
        'IH-MH-THORBURN-CGA96-O2',
      ],
    },
    {
      type: 'category_link',
      slug: 'metallic-specialty-assemblies',
      label: 'Specialty metal hose assemblies',
      blurb: 'Cryogenic, oxygen, chlorine, steam-jacketed and heated hose.',
    },
    {
      type: 'category_link',
      slug: 'metallic-hose-couplings',
      label: 'Metal hose couplings',
      blurb: 'Cryogenic couplings, unions, swivel joints and tanker couplings.',
    },

    {
      type: 'cta_block',
      heading: 'Specifying a cryogenic line?',
      body: 'Tell us the gas, the pressure, the bore, the length and the connections at each end. We will quote the hose, couplings and insulation, cleaned and certified for the gas.',
      quoteLabel: 'Quote cryogenic hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Temperatures, pressures, sizes and certifications checked against our cryogenic hose and coupling listings.',
    },
  ],
}

export default ARTICLE
