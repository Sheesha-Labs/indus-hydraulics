import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Corrugated stainless hose, read from the 13 stainless corrugated listings.
 * Working pressures on these listings are the headline (smallest-size) figure,
 * so every one is quoted as "up to". The "ISO 10380 Class: PSL n" field is not
 * repeated: PSL is API vocabulary, not an ISO 10380 class.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'corrugated-stainless-steel-hose',
  title: 'Corrugated stainless steel hose: core, braid and the pressure each layer adds',
  excerpt:
    'A metal hose is a corrugated stainless core that bends, and a braid that holds the pressure. How unbraided, single and double braid compare, annular against helical, and 316L against 321.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T12:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is corrugated stainless steel hose?',
      answer:
        'It is a flexible metal hose made from a thin stainless tube formed into corrugations, so it can bend, usually covered with one or two layers of stainless wire braid that carry the pressure. With no rubber in it, it handles temperatures from −200 to +650 °C on our listings and media that would attack elastomers. The braid count sets the pressure: on our Thorburn S9x series, up to 13 bar unbraided, 146 bar single braid and 215 bar double braid.',
    },
    {
      type: 'key_takeaways',
      items: [
        'The corrugated core gives flexibility and seals the medium; the braid restrains the core and carries the pressure.',
        'Braid count sets the rating: on our S9x series up to 13 bar unbraided, 146 bar single braid, 215 bar double braid (smallest sizes).',
        'Our stainless corrugated hoses are listed from −200 to +650 °C, with 316L or 321 cores and 304 or 316L braid.',
        'Annular corrugations are the norm for pressure and vibration; helical corrugations suit extra-flexible, drainable runs.',
        'Metal hose must not be twisted in installation, and it tolerates movement in one plane far better than in several.',
      ],
    },
    {
      type: 'lead',
      html: 'Where a rubber hose meets its limits — heat, cryogenic cold, aggressive media, fire risk, permeation — the answer is usually metal. A corrugated stainless hose is two parts doing two jobs: a <strong>thin corrugated core</strong> that bends and keeps the medium in, and a <strong>braid</strong> that stops the core stretching like a spring under pressure. Almost everything about choosing one follows from that split.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Core and braid.',
      anchor: 'core-braid',
    },
    {
      type: 'paragraph',
      html: 'Pressurise an unbraided corrugated core and it tries to extend, the way a bellows does. The braid — woven stainless wire over the core, welded to the end fittings — stops that, and in doing so carries most of the pressure load. That is why the same core is rated so differently with and without braid. On our Thorburn S9x series, the 316L core is rated up to 13 bar unbraided (S91), 146 bar with a single 304 braid (S92) and 215 bar with a double braid (S92Z).',
    },
    {
      type: 'comparison_table',
      caption: 'Thorburn S9x 316L series: what the braid adds',
      columns: ['Construction', 'Model', 'Up to (smallest size)', 'Sizes'],
      rows: [
        { cells: ['Unbraided core', 'S91', '13 bar', 'DN6 – DN350'] },
        { cells: ['Single 304 braid', 'S92', '146 bar', 'DN6 – DN350'], highlight: true },
        { cells: ['Double 304 braid', 'S92Z', '215 bar', 'DN6 – DN300'] },
        { cells: ['Single 316L braid (premium)', 'S93', '146 bar', 'DN6 – DN350'] },
        { cells: ['Double 316L braid (premium)', 'S93Z', '215 bar', 'DN6 – DN300'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The headline pressure is the smallest size.',
      body: 'Metal hose ratings fall as the bore rises. The figures on our listings are the headline figure for the smallest size; the rating for the size you are fitting comes from the maker\'s table, and we quote it with the assembly.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: '316L or 321, 304 or 316L braid.',
      anchor: 'materials',
    },
    {
      type: 'paragraph',
      html: 'Our stainless corrugated hoses are built on <strong>316L</strong> or <strong>321</strong> cores. 316L is the general corrosion-resistant choice; 321 is titanium-stabilised stainless, chosen for sustained high-temperature service. The S95 and S96 series mirror S91 and S92 with a 321 core. Braid is 304 as standard and 316L on the premium S93 series, for corrosive atmospheres where the braid is exposed. All are listed from −200 to +650 °C. Where stainless itself is not enough — chlorine, hot chlorides, strong acids — the next step is an exotic alloy core.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Annular or helical.',
      anchor: 'annular-helical',
    },
    {
      type: 'paragraph',
      html: 'Most metal hose is <strong>annular</strong>: each corrugation is a separate ring. It flexes well, resists pressure and vibration, and is the norm for process and pressure service. <strong>Helical</strong> corrugations spiral along the hose like a thread; the hose is extra-flexible and drains fully, which suits low-pressure, frequently moved or drainable runs — our Thorburn S65 Extra Flex is helical 321 with a 304 braid, up to 35 bar, DN25 to DN250. Commercial grades such as our Adflex (up to 100 bar, DN6 to DN300) and the close-pitch Hyparflex (triple braid, up to 175 bar) sit alongside.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Installing metal hose.',
      anchor: 'installation',
    },
    {
      type: 'paragraph',
      html: 'Metal hose fails at the installation more often than in service. It must never be twisted: torsion on a corrugated core concentrates stress at the corrugations and fatigues them quickly, so make up the second end with the hose relaxed, using a union or a floating flange. Keep movement in one plane, respect the dynamic bend radius rather than the static one when the hose moves, and do not let it bend sharply at the end fitting. A hose that absorbs vibration needs a live length — the S91, S95 and S96 listings give 102 mm.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Twist is the commonest killer.',
      body: 'A few degrees of twist set into a metal hose at installation can halve its life. Use a swivel union or a lap-joint flange at one end so the hose can hang straight before it is tightened.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does the braid on a metal hose do?',
          answer:
            'It stops the corrugated core extending under pressure and carries most of the pressure load. On our S9x series it takes the rating from 13 bar unbraided to 146 bar single braid and 215 bar double braid.',
        },
        {
          question: 'What temperature can stainless metal hose handle?',
          answer:
            'Our stainless corrugated hoses are listed from −200 to +650 °C. The end fittings and any gaskets may set a lower limit.',
        },
        {
          question: 'Is 321 or 316L better for metal hose?',
          answer:
            '316L is the general corrosion-resistant choice; 321 is stabilised for sustained high-temperature service. Choose by the medium and the temperature.',
        },
        {
          question: 'Which standard covers corrugated metal hose?',
          answer:
            'ISO 10380, which our metal hose listings cite. Many also list CSA B51 and NACE MR0175 / ISO 15156 compliance where relevant.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Stainless corrugated hose',
      skus: [
        'IH-MH-THORBURN-S91-316L-UB',
        'IH-MH-THORBURN-S92-316L',
        'IH-MH-THORBURN-S92Z-316L',
        'IH-MH-THORBURN-S93-316L',
        'IH-MH-THORBURN-S96-321',
        'IH-MH-THORBURN-S65-XFLEX-321',
        'IH-IH-METALLIC-ADFLEX',
        'IH-IH-METALLIC-HYPARFLEX',
      ],
    },
    {
      type: 'category_link',
      slug: 'metallic-stainless-corrugated-hoses',
      label: 'Stainless corrugated hose',
      blurb: '316L and 321 cores, unbraided to triple braid, DN6 to DN350.',
    },
    {
      type: 'category_link',
      slug: 'metallic-hose-couplings',
      label: 'Metal hose couplings',
      blurb: 'Pipe unions, swivel joints, tanker and dry-break couplings.',
    },

    {
      type: 'cta_block',
      heading: 'Specifying a metal hose assembly?',
      body: 'Send the medium, pressure, temperature, bore, length, end fittings and how the hose moves. We will quote the core, braid and ends, with the rating for your size.',
      quoteLabel: 'Quote metal hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Constructions, materials, headline pressures, temperatures and sizes checked against our stainless corrugated hose listings.',
    },
  ],
}

export default ARTICLE
