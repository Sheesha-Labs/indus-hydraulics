import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Exotic alloy metal hose, read from the 20 exotic alloy listings: Monel 400,
 * Inconel 625, Hastelloy C276 and bronze cores, their braids, temperature
 * ceilings and the chlorine certifications. Pressures are headline figures.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'exotic-alloy-metal-hose',
  title: 'Exotic alloy metal hose: Monel, Inconel, Hastelloy and bronze, and when stainless is not enough',
  excerpt:
    'When the medium attacks stainless — chlorine, hot chlorides, strong acids — or the temperature passes 650 °C, the core changes alloy. What each one is for, the limits on our listings, and the braid question.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T12:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'When do you need an exotic alloy metal hose?',
      answer:
        'When stainless steel will not survive the medium or the temperature. Monel 400 is the classic core for dry chlorine and hydrofluoric service; Hastelloy C276 for strong acids and hot chlorides; Inconel 625 for the highest temperatures — our Inconel hoses are listed to +815 °C — and for corrosive media at heat. Bronze suits marine and non-ferrous systems at lower temperature, to +250 °C on our listings.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Change the core alloy when the medium attacks stainless or the temperature passes stainless\'s limit.',
        'Our listings: Monel 400 to +540 °C, Hastelloy C276 to +675 °C (540 °C with a 304 braid), Inconel 625 to +815 °C, bronze to +250 °C.',
        'Monel hoses carry Chlorine Institute Pamphlet 6 references — the chlorine-service grade.',
        'A 304 stainless braid over an exotic core is cheaper but limits the hose to the braid\'s temperature and corrosion resistance.',
        'Braid count still sets pressure: on Thorburn Inconel 625, up to 13 bar unbraided, 150 bar single braid, 215 bar double braid.',
      ],
    },
    {
      type: 'lead',
      html: 'Stainless steel covers most metal hose duty, from cryogenic cold to 650 °C. The exceptions are specific and expensive to get wrong: chlorine, hot chlorides, hydrofluoric acid, strong reducing acids, and temperatures beyond stainless\'s reach. For those, the corrugated core is made from a different alloy — and the <strong>braid has to be chosen just as carefully</strong>, because it is the braid that is exposed to the atmosphere.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Four alloys, four jobs.',
      anchor: 'alloys',
    },
    {
      type: 'comparison_table',
      caption: 'Exotic alloy cores in our range',
      columns: ['Core', 'Typical reason to choose it', 'Temperature (listing)'],
      rows: [
        { cells: ['Monel 400', 'Dry chlorine, hydrofluoric acid, seawater', '−200 to +540 °C'] },
        { cells: ['Hastelloy C276', 'Strong acids, hot chlorides, mixed corrosives', '−200 to +675 °C; +540 °C with 304 braid'] },
        { cells: ['Inconel 625', 'Highest temperatures; corrosive media at heat', '−200 to +815 °C; +540 °C with 304 braid'], highlight: true },
        { cells: ['Bronze', 'Marine and non-ferrous systems at lower temperature', '−200 to +250 °C'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'These are the classic uses of each alloy; the compatibility of a specific medium at a specific concentration and temperature still has to be checked. Where the medium is chlorine, the Monel hoses in our range carry the relevant references: the Thorburn M96 and M96Z are listed with Chlorine Institute Pamphlet 6 and Specification 135-3, and the Hose Master Annuflex Monel with Pamphlet 6.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The braid question.',
      anchor: 'braid',
    },
    {
      type: 'paragraph',
      html: 'An exotic core can carry a braid of the same alloy or a <strong>304 stainless braid</strong>. The stainless braid is the cost-effective choice where only the inside of the hose sees the aggressive medium — our HS95 Hastelloy listing describes its SS304 braid as the cost-effective option for exactly that reason. The trade-off is that the hose is then limited by the braid: our listings drop the Hastelloy and Inconel ceilings from 675 and 815 °C to 540 °C where the braid is 304, and a stainless braid in a corrosive atmosphere will go before the core. Where the outside is as hostile as the inside, match the braid to the core.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check the end fittings too.',
      body: 'An Inconel hose with carbon steel flanges is a carbon steel assembly at the joints. Our exotic hoses can be fitted with matched-alloy ends; specify them where the medium touches the fitting.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Pressure still comes from the braid.',
      anchor: 'pressure',
    },
    {
      type: 'paragraph',
      html: 'As with stainless, the braid count sets the rating. On the Thorburn Inconel 625 series the headline figure is up to 13 bar unbraided (I95), 150 bar with a single Inconel braid (I96) and 215 bar with a double braid (I96Z); the Witzenmann Inconel 625 HYDRA series is listed to 145 bar. Hastelloy C276 runs from 12 bar unbraided (H95) to 200 bar double braided (H96Z); Monel 400 from 10 bar (M95) to 145 bar (M96Z); bronze from 8 bar (B95) to 75 bar (B96Z). All are headline figures for the smallest size, falling as the bore rises.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Why is Monel used for chlorine hose?',
          answer:
            'Monel 400 resists dry chlorine well, which is why chlorine transfer hose is built on it. Our Monel hoses carry Chlorine Institute Pamphlet 6 references.',
        },
        {
          question: 'What temperature can an Inconel metal hose take?',
          answer:
            'Our Inconel 625 hoses are listed to +815 °C with an Inconel braid, and +540 °C where the braid is 304 stainless.',
        },
        {
          question: 'Is a stainless braid acceptable on a Hastelloy hose?',
          answer:
            'Where only the inside sees the aggressive medium, yes, and it is cheaper. The hose is then limited to the braid\'s temperature and corrosion resistance — 540 °C on our listings.',
        },
        {
          question: 'Are exotic alloy hoses NACE compliant?',
          answer:
            'Many of ours are listed as NACE MR0175 / ISO 15156 compliant — the Inconel and Hastelloy series among them. The Monel and bronze listings are not; check the specific model.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Exotic alloy metal hose',
      skus: [
        'IH-MH-THORBURN-M96-MONEL',
        'IH-MH-THORBURN-M96Z-MONEL',
        'IH-MH-THORBURN-H96-HASTELLOY',
        'IH-MH-THORBURN-HS96-HASTELLOY',
        'IH-MH-THORBURN-I96-INCONEL',
        'IH-MH-WITZENMANN-INCONEL',
        'IH-MH-THORBURN-B96-BRONZE',
        'IH-MH-HOSE-MASTER-HASTELLOY',
      ],
    },
    {
      type: 'category_link',
      slug: 'metallic-exotic-alloy-hoses',
      label: 'Exotic alloy metal hose',
      blurb: 'Monel, Inconel, Hastelloy and bronze cores, unbraided to double braid.',
    },
    {
      type: 'category_link',
      slug: 'metallic-specialty-assemblies',
      label: 'Specialty metal hose assemblies',
      blurb: 'Chlorine transfer, cryogenic, steam-jacketed and heated hose.',
    },

    {
      type: 'cta_block',
      heading: 'Handling a medium that eats stainless?',
      body: 'Send the medium, concentration, temperature, pressure and the environment outside the hose. We will propose the core, braid and end fittings — and say so if a non-metallic hose is the better answer.',
      quoteLabel: 'Quote alloy hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Alloys, braids, temperatures, headline pressures and certifications checked against our exotic alloy hose listings.',
    },
  ],
}

export default ARTICLE
