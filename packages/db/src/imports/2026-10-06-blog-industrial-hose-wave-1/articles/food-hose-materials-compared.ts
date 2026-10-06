import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Food hose by material, read from SANF, SANB, SANSIL, PREMVIN, DELIKATESSE,
 * A235BU and A416. The compliance side is `food-grade-hose-compliance`; this
 * one is about what each material does in service.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'food-hose-materials-compared',
  title: 'Food hose materials compared: NBR, EPDM, silicone, PVC and UHMWPE',
  excerpt:
    'Every food hose is food-grade on its certificate. What separates them in service is the lining: fats and oils, hot cleaning, steam, taste and temperature each favour a different one.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Which material is best for a food hose?',
      answer:
        'It depends on the product and the cleaning. White food-quality NBR suits fatty and oily foods; EPDM suits hot water and steam cleaning but not fats; platinum-cured silicone covers −40 to +200 °C with a smooth, low-taint bore; food PVC is light and cheap but limited to −10 to +55 °C; and UHMWPE suits aggressive or mixed products. Match the lining to the product and to the hottest cleaning cycle it will see.',
    },
    {
      type: 'key_takeaways',
      items: [
        'NBR (nitrile) linings resist fats and vegetable oils; our SANF and SANB food hoses use white food-quality NBR, −20 to +90 °C.',
        'EPDM handles hot water and steam but not fats and oils; our A235BU steam, hot water and food hose has a white FDA-compound EPDM tube.',
        'Silicone runs −40 to +200 °C; our SANSIL hose is platinum cured with a 316L stainless helix.',
        'Food PVC is light and inexpensive but limited to −10 to +55 °C.',
        'Choose for the hottest cleaning cycle, not just the product temperature.',
      ],
    },
    {
      type: 'lead',
      html: 'A food hose has two jobs: carry the product without changing it, and survive being cleaned. The certificate settles the first in principle — every hose in this article is made from food-quality compounds. The <strong>lining material</strong> decides how well it does both in practice, because fats, oils, hot caustic, steam and time each favour a different material.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Five linings, five strengths.',
      anchor: 'linings',
    },
    {
      type: 'comparison_table',
      caption: 'Food hose in our range, by lining',
      columns: ['Lining', 'Our hose', 'Rating and temperature', 'Best at'],
      rows: [
        { cells: ['White NBR (FDA specification)', 'SANF food S&D', '10 bar; −20 to +90 °C, extra for CIP', 'Fatty, oily foods; dairy and edible oils'], highlight: true },
        { cells: ['White NBR', 'SANB brew S&D', '10 bar; −20 to +90 °C', 'Beer, wine and beverages'] },
        { cells: ['White EPDM (FDA compounds)', 'A235BU steam, hot water and food', '7 bar; +170 °C steam, +95 °C hot water', 'Hot water and steam cleaning'] },
        { cells: ['Platinum-cured silicone', 'SANSIL silicone S&D', '3 – 10 bar by size; −40 to +200 °C', 'Wide temperature, low taint, pharma'] },
        { cells: ['Food PVC', 'PREMVIN, DELIKATESSE', '2 – 12 bar by size; −10 to +55 °C', 'Light, low-cost bulk and food transfer'] },
        { cells: ['UHMWPE (FDA specification)', 'A416 chemical S&D', '16 bar; −30 to +100 °C', 'Aggressive or mixed products, concentrates'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Fats and oils: nitrile.',
      anchor: 'nitrile',
    },
    {
      type: 'paragraph',
      html: 'Fats and vegetable oils swell many rubbers; nitrile resists them, which is why it is the lining for dairy, edible oil and fatty food lines. Our SANF food hose carries a white food-quality NBR tube to FDA specification, a blue cloth-finish cover resistant to vegetable oils and fats, synthetic plies and twin carbon steel helices for suction, and is rated 10 bar from 3/4" to 4". The SANB brew hose is the same construction with a red cover for beverage service.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Heat and steam: EPDM and silicone.',
      anchor: 'heat',
    },
    {
      type: 'paragraph',
      html: 'EPDM shrugs off hot water and steam that would age nitrile quickly, but it swells in fats and oils, so it belongs on hot-water, washdown and steam-cleaning lines rather than on an oily product. Our A235BU hose has a white food-grade EPDM tube and is rated to +170 °C on steam and +95 °C on hot water. Silicone covers the widest range of all — our SANSIL hose runs from <strong>−40 to +200 °C</strong>, with a platinum-cured, FDA-approved smooth silicone lining, polyester fabrics and a 316L stainless helix, at a 4:1 safety factor. It is the choice where temperature swings are large or taint must be minimal.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Design for the cleaning, not just the product.',
      body: 'A line that carries cold juice and is cleaned with hot caustic and steam is a hot-chemical hose for part of every day. Specify the lining for the hottest and most aggressive step of the cleaning cycle, and check the cleaning chemicals against it.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Light duty: food PVC.',
      anchor: 'pvc',
    },
    {
      type: 'paragraph',
      html: 'Food PVC hose is light, often clear so the product can be seen, and inexpensive. Our PREMVIN food and bulk hose (1/2" to 6", spring steel reinforced) and DELIKATESSE non-toxic hose (1" to 3", smooth bore) suit gravity and pump transfer of food and bulk products at modest pressure. Their limit is temperature: both are listed from −10 to +55 °C, which rules out hot cleaning and hot product.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Couplings and hygiene.',
      anchor: 'hygiene',
    },
    {
      type: 'paragraph',
      html: 'The joint is where hygiene usually fails: a crevice between hose and fitting holds product and defeats cleaning. Sanitary (tri-clamp) ferrules crimped onto the hose and closed with sanitary clamps give a smooth, cleanable joint; our sanitary-style crimp ferrules (1" to 4") and heavy-duty sanitary clamps (to 12") are in 304 and 316 stainless. Damage to a food hose lining condemns it faster than the same damage on a general-purpose hose — a gouge is not a strength problem at these pressures, it is a place that cannot be cleaned.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'Is NBR or EPDM better for food hose?',
          answer:
            'NBR for fatty and oily products, EPDM for hot water and steam. EPDM swells in fats and oils; NBR ages faster under steam.',
        },
        {
          question: 'What temperature can silicone food hose take?',
          answer:
            'Our platinum-cured SANSIL silicone hose is listed from −40 to +200 °C.',
        },
        {
          question: 'Can PVC food hose be steam cleaned?',
          answer:
            'No. Our food PVC hoses are listed from −10 to +55 °C. Use silicone or an EPDM-lined hose where steam cleaning is part of the cycle.',
        },
        {
          question: 'Which couplings suit a food hose?',
          answer:
            'Sanitary tri-clamp ferrules crimped to the hose, with sanitary clamps, give a smooth, cleanable joint. Ours are 304 and 316 stainless.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Food hose by lining',
      skus: ['IH-IH-SANF', 'IH-IH-SANB', 'IH-IH-SANSIL', 'IH-IH-A235BU', 'IH-IH-PREMVIN', 'IH-IH-DELIKATESSE', 'IH-IH-A416'],
    },
    {
      type: 'product_embed',
      heading: 'Sanitary ends',
      skus: ['IH-CLP-FERRULE-SANITARY', 'IH-CLP-SAN-SINGLE-PIN', 'IH-CLP-SAN-3-SEGMENT'],
    },
    {
      type: 'category_link',
      slug: 'food-beverage-hoses',
      label: 'Food and beverage hose',
      blurb: 'NBR, silicone and food PVC suction and delivery hose.',
    },
    {
      type: 'category_link',
      slug: 'industrial-steam-hoses',
      label: 'Steam and hot water hose',
      blurb: 'Including the EPDM steam, hot water and food hose.',
    },

    {
      type: 'cta_block',
      heading: 'Specifying a food line?',
      body: 'Tell us the product, its temperature, the cleaning cycle and the coupling standard on the plant. We will quote the hose and sanitary ends, with the compliance documents.',
      quoteLabel: 'Quote food hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Linings, ratings, temperatures and sizes checked against our food, steam and chemical hose listings.',
    },
  ],
}

export default ARTICLE
