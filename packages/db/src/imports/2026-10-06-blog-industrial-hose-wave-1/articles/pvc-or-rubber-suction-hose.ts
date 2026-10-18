import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * PVC against rubber suction and delivery hose, read from the five PVC
 * listings (IRRIBULK, DELVAC, PREMVIN, DELIKATESSE, BAKU, PREMFLEX) and the
 * rubber A210 and A216. The PVC bend-radius fields on those listings are
 * malformed (they read like vacuum figures), so no PVC bend radius is quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pvc-or-rubber-suction-hose',
  title: 'PVC or rubber suction hose: temperature, pressure and the Gulf summer',
  excerpt:
    'PVC suction hose is light, clear and cheap; rubber is heavier and tougher. The decision usually comes down to two numbers — the temperature the hose will see and the pressure at the largest bore.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T11:40:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'Should I use PVC or rubber suction hose?',
      answer:
        'Use PVC where the hose is light-duty, the temperature stays within −10 to +55 °C and the pressure is modest — our PVC suction hoses are rated 2 to 12 bar depending on size, falling as the bore rises. Use rubber where the hose is dragged, sits in the sun, carries more pressure or sees temperature extremes — our rubber water suction hoses are 10 or 16 bar from −20 or −35 to +70 °C. In a Gulf summer, the 55 °C limit is the one that decides it.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Our PVC suction hoses are rated −10 to +55 °C; the rubber A210 and A216 run to +70 °C, and from −20 and −35 °C.',
        'PVC pressure ratings fall with bore: from up to 12 bar on the smallest food and bulk hose to 2–3 bar at the largest sizes.',
        'Rubber holds its rating across the range: A210 is 10 bar from 1" to 6", A216 is 16 bar from 2" to 8".',
        'PVC is light, often clear, and cheap; rubber tolerates abrasion, crushing, sun and handling far better.',
        'Both use a helix for suction; check the vacuum rating, not just the pressure.',
      ],
    },
    {
      type: 'lead',
      html: 'Two suction hoses of the same bore can sit side by side in a store at very different prices — a clear or grey PVC hose with a rigid helix, and a black rubber one with a steel wire. Both pull water. The choice between them usually comes down to <strong>two numbers on the listing</strong>, and in this region one of them is the temperature the hose will reach sitting in the sun.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Temperature is the first filter.',
      anchor: 'temperature',
    },
    {
      type: 'paragraph',
      html: 'Every PVC suction hose in our range is listed from <strong>−10 to +55 °C</strong>. That is the medium and the hose, and it is a real limit: PVC softens as it warms, the helix loses its grip on the shape, and a hose that holds vacuum in the morning can flatten by afternoon. A dark hose lying on a site in a Gulf summer can exceed 55 °C on its surface without carrying anything warm at all. Our rubber water suction hoses — A210 and A216 — are rated to +70 °C, and down to −20 and −35 °C respectively.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Store PVC hose out of the sun.',
      body: 'Coiled PVC suction hose left in direct sun can take a permanent set or soften enough to kink when it is next uncoiled. Keep it shaded, and do not use it on hot discharge water.',
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Pressure falls with bore on PVC.',
      anchor: 'pressure',
    },
    {
      type: 'paragraph',
      html: 'A PVC suction hose is rated per size, and the rating drops as the bore grows: our medium-duty PVC (IRRIBULK) is 3 to 8 bar across 1" to 6", our food and bulk PVC (PREMVIN) 2 to 12 bar across 1/2" to 6", and the PVC oil hose (BAKU) 3 to 9 bar across 1" to 6". All are built to a 3:1 safety factor. The rubber hoses hold a single rating across their range: <strong>10 bar on A210 from 1" to 6", 16 bar on A216 from 2" to 8"</strong>.',
    },
    {
      type: 'comparison_table',
      caption: 'Suction and delivery hose in our range',
      columns: ['Hose', 'Pressure', 'Sizes', 'Temperature'],
      rows: [
        { cells: ['IRRIBULK medium-duty PVC', '3 – 8 bar by size', '1" – 6"', '−10 to +55 °C'] },
        { cells: ['DELVAC clear PVC', '4 – 8 bar by size', '3/4" – 2"', '−10 to +55 °C'] },
        { cells: ['PREMVIN food and bulk PVC', '2 – 12 bar by size', '1/2" – 6"', '−10 to +55 °C'] },
        { cells: ['DELIKATESSE non-toxic PVC', '4 – 8 bar by size', '1" – 3"', '−10 to +55 °C'] },
        { cells: ['A210 rubber water S&D', '10 bar', '1" – 6"', '−20 to +70 °C'], highlight: true },
        { cells: ['A216 rubber water S&D', '16 bar', '2" – 8"', '−35 to +70 °C'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Handling decides the rest.',
      anchor: 'handling',
    },
    {
      type: 'paragraph',
      html: 'PVC hose is light, flexible enough to carry, often clear so the flow can be seen, and inexpensive — the right hose for irrigation, light dewatering and food and bulk transfer where it is handled with some care. Rubber is the hose for being dragged across rubble, driven over and left out: A210 and A216 have mandrel-wrapped SBR covers resistant to ozone and weather, A216 adds abrasion resistance, and both carry a steel helix inside textile plies. A216\'s double helix is built for the heavier suction work at large bores.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Vacuum and couplings.',
      anchor: 'vacuum',
    },
    {
      type: 'paragraph',
      html: 'Both kinds hold suction with a helix — rigid PVC on the PVC hoses, steel wire on the rubber. A210 prints its vacuum on the layline: 700 mmHg. Either way, the hose only holds suction if every joint is airtight, so match the coupling to the hose: cam and groove or Bauer halves clamped properly onto rubber, and fittings sized for the PVC hose\'s helix on PVC. A single loose clamp on a suction line is an air leak that reads as a weak pump.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What temperature can PVC suction hose handle?',
          answer:
            'Our PVC suction hoses are listed from −10 to +55 °C. Above that, use a rubber suction hose such as A210 or A216, rated to +70 °C.',
        },
        {
          question: 'Why does a PVC hose\'s pressure rating drop at larger sizes?',
          answer:
            'Because the load on the wall rises with the bore. Our PVC hoses are rated per size — up to 12 bar on the smallest food and bulk hose and 2 to 3 bar at the largest sizes.',
        },
        {
          question: 'Is rubber suction hose better for dewatering?',
          answer:
            'For site dewatering, usually yes. It tolerates dragging, crushing and sun far better, and our A210 and A216 hold 10 and 16 bar across their size ranges.',
        },
        {
          question: 'Can PVC hose be used for food?',
          answer:
            'Food-grade PVC can. Our PREMVIN food and bulk and DELIKATESSE non-toxic PVC hoses are made for food and bulk transfer within −10 to +55 °C.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'PVC and rubber suction hose',
      skus: ['IH-IH-IRRIBULK', 'IH-IH-DELVAC', 'IH-IH-PREMVIN', 'IH-IH-DELIKATESSE', 'IH-IH-A210', 'IH-IH-A216'],
    },
    {
      type: 'category_link',
      slug: 'water-suction-delivery-hoses',
      label: 'Water suction and delivery hose',
      blurb: 'PVC and rubber suction hose, 3/4" to 8".',
    },
    {
      type: 'category_link',
      slug: 'food-beverage-hoses',
      label: 'Food and beverage hose',
      blurb: 'Food-grade PVC, NBR and silicone suction and delivery hose.',
    },
    {
      type: 'category_link',
      slug: 'bauer-type-couplings',
      label: 'Bauer couplings',
      blurb: 'Lever couplings for irrigation and dewatering lines.',
    },

    {
      type: 'cta_block',
      heading: 'Choosing hose for a pump set?',
      body: 'Tell us the pump, the suction lift, the bore, the temperature and how the hose will be handled. We will quote the hose and couplings that suit the job.',
      quoteLabel: 'Quote suction hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Pressures, temperatures, sizes and constructions checked against our PVC and rubber suction hose listings.',
    },
  ],
}

export default ARTICLE
