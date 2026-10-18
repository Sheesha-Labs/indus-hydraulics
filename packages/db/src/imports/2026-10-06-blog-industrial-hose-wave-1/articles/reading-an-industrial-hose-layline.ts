import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Industrial hose branding, read from the "Hose Branding (Printed)" field on
 * our industrial hose listings. The hydraulic equivalent is
 * `how-to-read-a-hose-layline`.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'reading-an-industrial-hose-layline',
  title: 'Reading an industrial hose layline: pressure, vacuum, safety factor and standard',
  excerpt:
    'The print along an industrial hose carries its part code, working pressure, vacuum rating, safety factor and often its standard. How to read it, with real laylines from our range, and what to do when it is missing.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T12:20:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What does the printing on an industrial hose mean?',
      answer:
        'The layline identifies the hose and its limits. Expect the maker or brand, a part code, the duty (water, oil, air, steam), the working pressure, and often the vacuum rating, the safety factor and the construction standard. For example, our A210 reads "A210 WATER S&D 10 BAR/700mmHg SF 3:1" — a water suction and delivery hose, 10 bar working, 700 mmHg vacuum, safety factor 3:1.',
    },
    {
      type: 'key_takeaways',
      items: [
        'S&D means suction and delivery: the hose has a helix and is rated for vacuum as well as pressure.',
        'Vacuum is printed in mmHg or bar — 700 mmHg on A210, 0.93 bar on A430, 0.9 bar on A460.',
        'SF is the safety factor: burst pressure divided by working pressure.',
        'A standard on the layline is a claim you can check: ISO 2398 on our air hoses, EN 13765:2015 Type 3 on the vapour recovery composite.',
        'No layline, no rating: an unidentifiable hose should be treated as unrated and replaced.',
      ],
    },
    {
      type: 'lead',
      html: 'The print running along an industrial hose is the only specification that travels with it. It survives the hose being cut, coiled and moved between sites, and it answers the questions a buyer, an inspector or a fitter will ask — what is it, what pressure, can it pull suction. Industrial laylines carry a slightly <strong>different vocabulary from hydraulic ones</strong>, and a few minutes with real examples is enough to read them.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Real laylines from our range.',
      anchor: 'examples',
    },
    {
      type: 'comparison_table',
      caption: 'What our industrial hoses print',
      columns: ['Hose', 'Printed on the cover', 'How to read it'],
      rows: [
        { cells: ['A210 water S&D', 'A210 WATER S&D 10 BAR/700mmHg SF 3:1', 'Water suction and delivery, 10 bar, 700 mmHg vacuum, 3:1'], highlight: true },
        { cells: ['A430 oil S&D', 'A430 OIL S & D 10BAR / 0.93 VAC', 'Oil suction and delivery, 10 bar, 0.93 bar vacuum'] },
        { cells: ['A460 oil S&D', 'A460 OIL S&D 20 BAR SF 3:1 VAC 0.9 BAR', '20 bar, 3:1, 0.9 bar vacuum'] },
        { cells: ['A101HP air and water', 'A101HP AIR/WATER BS5118/2 & ISO2398 20 BAR SF 3:1', 'Air and water, 20 bar, built to BS 5118/2 and ISO 2398'] },
        { cells: ['A901AG vapour recovery', 'TYPE 3 EN13765:2015 14 BAR 80°C', 'Composite to EN 13765:2015 Type 3, 14 bar, 80 °C'] },
        { cells: ['A230 steam', 'A230 SUPER STEAM 18 BAR', 'Saturated steam, 18 bar'] },
        { cells: ['A116EU100 air', 'A116EU100 AIR 40 BAR S:F 3:1', 'High-temperature air, 40 bar, 3:1'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'The vocabulary.',
      anchor: 'vocabulary',
    },
    {
      type: 'paragraph',
      html: '<strong>S&D</strong> — suction and delivery — means the hose has a helix and holds vacuum as well as pressure; a hose printed only for delivery should never be used on a pump inlet. <strong>BAR</strong> is the maximum working pressure. <strong>VAC</strong> or a figure in <strong>mmHg</strong> is the vacuum the hose holds without collapsing: 760 mmHg is a perfect vacuum, so 700 mmHg is close to full suction. <strong>SF</strong> or <strong>S:F</strong> is the safety factor — burst pressure divided by working pressure. The part code ties the hose to its datasheet, which is where the temperature range, bend radius and compound live.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'The layline does not carry the temperature.',
      body: 'Most industrial laylines print pressure and vacuum but not the temperature range or the compound. Those come from the datasheet for the part code — which is why the part code is the most useful thing on the hose.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Standards on the cover.',
      anchor: 'standards',
    },
    {
      type: 'paragraph',
      html: 'Where a hose is built to a published standard, the layline says so, and that is a claim you can check against the standard\'s requirements. In our range, the 20 bar air and water hoses print BS 5118/2 and ISO 2398, the mandrel-built air hose prints EN 2398, the anti-static air hose prints BS 2878, and the vapour recovery composite prints EN 13765:2015 Type 3. A hose with no standard printed is not necessarily a poor hose — many good industrial hoses are built to the maker\'s own specification — but its rating rests on the maker\'s datasheet alone.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'When the print has gone.',
      anchor: 'missing',
    },
    {
      type: 'paragraph',
      html: 'Laylines wear off on hoses that are dragged and left in the sun. A hose whose print has gone cannot be identified with confidence, and an assembly that cannot be identified cannot be rated. On a site that works to permits or audits, an unmarked hose should be treated as unrated and replaced. Where the hose is otherwise sound and the record exists, tag the assembly with its part code and test date so the identity survives the print.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Photograph the layline before the hose goes into service.',
      body: 'A photograph of the print, kept with the assembly record, outlives the ink. It is the cheapest identification record there is.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does S&D mean on a hose?',
          answer:
            'Suction and delivery. The hose has a helix and is rated to hold vacuum as well as pressure.',
        },
        {
          question: 'What does 700 mmHg mean on a suction hose?',
          answer:
            'The vacuum the hose holds without collapsing. 760 mmHg is a perfect vacuum, so 700 mmHg is close to full suction.',
        },
        {
          question: 'What does SF 3:1 mean?',
          answer:
            'Safety factor 3:1 — the minimum burst pressure is three times the working pressure.',
        },
        {
          question: 'Is a hose without a printed standard unsafe?',
          answer:
            'Not necessarily. Many hoses are built to the maker\'s own specification. Its rating then rests on the maker\'s datasheet, so keep the part code.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Hoses whose laylines are quoted here',
      skus: ['IH-IH-A210', 'IH-IH-A430', 'IH-IH-A460', 'IH-IH-A101HP', 'IH-IH-A901AG', 'IH-IH-A230', 'IH-IH-A116EU100'],
    },
    {
      type: 'category_link',
      slug: 'industrial-hose-suppliers-uae',
      label: 'Industrial hose',
      blurb: 'Every application shelf, with the printed specification on each listing.',
    },
    {
      type: 'category_link',
      slug: 'water-suction-delivery-hoses',
      label: 'Water suction and delivery hose',
      blurb: 'Rubber and PVC S&D hose with printed vacuum ratings.',
    },

    {
      type: 'cta_block',
      heading: 'Got a hose you cannot identify?',
      body: 'Send a photograph of whatever print remains, the bore and the duty. We will identify it if we can, and quote a marked replacement if we cannot.',
      quoteLabel: 'Identify a hose',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Layline text, pressures, vacuum ratings and standards checked against our industrial hose listings.',
    },
  ],
}

export default ARTICLE
