import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * High-pressure metal hose, read from the 10 high-pressure metallic listings:
 * how the pressure is reached (compressed corrugations, closed pitch, double
 * and triple braid), headline pressures and certifications.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'high-pressure-metal-hose',
  title: 'High-pressure metal hose: compressed corrugations, extra braid and 414 bar',
  excerpt:
    'Metal hose reaches hydraulic pressures by changing the corrugation and adding braid. How the high-pressure constructions differ, what they give up in flexibility, and where they beat a rubber hydraulic hose.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T12:50:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'How high a pressure can a metal hose take?',
      answer:
        'Our high-pressure metal hoses are listed up to 414 bar at the smallest size, on fully compressed annular cores with double or triple braid. They get there by packing the corrugations closer together, using a heavier closed-pitch profile, and adding braid layers — which trades away some flexibility. Ratings fall as the bore rises, and our high-pressure range runs to DN100 (DN150 on the helical model).',
    },
    {
      type: 'key_takeaways',
      items: [
        'Three levers raise metal hose pressure: compressed or closed-pitch corrugations, more braid layers, and heavier wall.',
        'Our high-pressure range: up to 414 bar (Thorburn S98Z, S99Z), 380 bar (Hose Master Stresstite), 350 bar (S50HD, Senior Flexonics Pathway HP).',
        'All are listed −200 to +650 °C, with 316L or 321 cores, and most as NACE MR0175 / ISO 15156 compliant.',
        'More pressure means less flexibility: respect the larger bend radius and keep movement to one plane.',
        'Metal beats rubber hydraulic hose where temperature, fire or permeation rule rubber out — not as a general substitute.',
      ],
    },
    {
      type: 'lead',
      html: 'A standard braided metal hose tops out at a few hundred bar in its smallest size. Getting to <strong>hydraulic pressures</strong> takes a different core: corrugations squeezed together so each convolution supports its neighbour, heavier closed-pitch profiles, and two or three layers of braid. The result carries pressures a rubber hose cannot at temperatures a rubber hose cannot survive — and pays for it in stiffness.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'How the pressure is reached.',
      anchor: 'how',
    },
    {
      type: 'paragraph',
      html: 'A corrugation under pressure tries to balloon outward and stretch lengthwise. <strong>Compressing</strong> the corrugations after forming packs them tightly so each one is supported by the next; a <strong>closed-pitch</strong> or omega profile does the same with a heavier section. The braid then restrains the core, and a second or third layer of braid shares the load further. Our Thorburn S98Z and S99Z are fully compressed annular cores with double and triple braid respectively; the S50HD is a compressed helical core with a double 316 braid; the S69 is a closed-pitch omega annular core.',
    },
    {
      type: 'comparison_table',
      caption: 'High-pressure metal hose in our range (headline, smallest size)',
      columns: ['Hose', 'Construction', 'Up to', 'Sizes'],
      rows: [
        { cells: ['Thorburn S98Z (316L or 321)', 'Fully compressed annular, double braid', '414 bar', 'DN6 – DN100'], highlight: true },
        { cells: ['Thorburn S99Z (316L or 321)', 'Fully compressed annular, triple braid; nuclear CRN-rated', '414 bar', 'DN6 – DN100'] },
        { cells: ['Hose Master Stresstite', '321 core, double braid', '380 bar', 'DN6 – DN100'] },
        { cells: ['Thorburn S50HD (316L or 321)', 'Compressed helical, double 316 braid', '350 bar', 'DN25 – DN150'] },
        { cells: ['Senior Flexonics Pathway HP', '316L core, double 316L braid', '350 bar', 'DN10 – DN100'] },
        { cells: ['Thorburn S69', 'Closed-pitch omega annular, 321, single braid', '230 bar', 'DN6 – DN100'] },
        { cells: ['Thorburn S81', '316L annular, double braid', '200 bar', 'DN6 – DN100'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'What it costs in flexibility.',
      anchor: 'flexibility',
    },
    {
      type: 'paragraph',
      html: 'Compressed corrugations and extra braid make a stiffer hose with a larger minimum bend radius. A high-pressure metal hose is not a flexible connector for a moving machine; it is a connection that absorbs misalignment, thermal growth and vibration in a fixed installation. Route it with generous bends, keep movement in one plane, never twist it at installation, and make up the second end with a union or a floating flange.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Where metal beats rubber.',
      anchor: 'versus-rubber',
    },
    {
      type: 'paragraph',
      html: 'At room temperature a spiral rubber hydraulic hose — our R13 holds 350 bar at every size from −12 to −32, our R15 holds 420 bar — is lighter, more flexible and cheaper than any metal hose at the same pressure. Metal earns its place where rubber is ruled out: sustained temperatures above rubber\'s limit (our metal hoses are listed to +650 °C), fire exposure, cryogenic service, media that permeate or attack elastomers, and installations that require an all-metal leak path. In those, it is the only flexible option.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Certification follows the duty.',
      body: 'Most of our high-pressure metal hoses are listed as NACE MR0175 / ISO 15156 compliant for sour service, several carry CSA B51, and the S99Z is CRN-monogrammed with CSA N299.1 and N285.0 nuclear references. Ask for the certificate the duty needs when ordering, not after delivery.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Can metal hose replace hydraulic hose?',
          answer:
            'At the right pressure, yes — but at room temperature a spiral rubber hose is lighter, more flexible and cheaper. Metal is the choice where temperature, fire, permeation or an all-metal requirement rules rubber out.',
        },
        {
          question: 'What is a compressed corrugation?',
          answer:
            'A corrugated core whose convolutions are pressed close together after forming, so each supports its neighbour under pressure. It raises the rating at the cost of flexibility.',
        },
        {
          question: 'Do high-pressure metal hose ratings change with size?',
          answer:
            'Yes. Our listed figures are the headline for the smallest size; the rating falls as the bore rises, and we quote the figure for your size.',
        },
        {
          question: 'Are high-pressure metal hoses suitable for sour service?',
          answer:
            'Most in our range are listed as NACE MR0175 / ISO 15156 compliant. Confirm the specific model and request the certificate.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'High-pressure metal hose',
      skus: [
        'IH-MH-THORBURN-S98Z-316L',
        'IH-MH-THORBURN-S99Z-316L-NUCLEAR',
        'IH-MH-HOSE-MASTER-STRESSTITE',
        'IH-MH-THORBURN-S50HD-316L',
        'IH-MH-SENIOR-FLEX-PATHWAY-HP',
        'IH-MH-THORBURN-S69-321',
        'IH-MH-THORBURN-S81-HP-316L',
      ],
    },
    {
      type: 'category_link',
      slug: 'metallic-high-pressure-hoses',
      label: 'High-pressure metal hose',
      blurb: 'Compressed and closed-pitch cores, double and triple braid, to 414 bar.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose',
      blurb: 'Spiral rubber hose to 420 bar for room-temperature duty.',
    },

    {
      type: 'cta_block',
      heading: 'Need pressure and temperature together?',
      body: 'Send the pressure, temperature, medium, bore and installation. We will tell you whether metal or rubber is the right construction and quote the assembly.',
      quoteLabel: 'Quote high-pressure hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Constructions, headline pressures, sizes and certifications checked against our high-pressure metal hose listings.',
    },
  ],
}

export default ARTICLE
