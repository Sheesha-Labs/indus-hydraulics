import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Safety factors, read straight off the "Safety Factor" field on every
 * industrial hose listing, checked against each listing's working and burst
 * pressure, and set against the hydraulic and API factors already quoted on the
 * blog.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'industrial-hose-safety-factors',
  title: 'Industrial hose safety factors: why water is 3:1, chemicals 4:1 and steam 10:1',
  excerpt:
    'The safety factor is the gap between working pressure and burst, and it is not the same for every hose. What our industrial hose listings use for each duty, and why the gap grows with the consequence of failure.',
  categorySlug: 'industrial-hose',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T12:10:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What safety factor does an industrial hose have?',
      answer:
        'It depends on the duty. On our listings, water, air and oil suction and delivery hoses are built to 3:1 — a 10 bar hose bursts at no less than 30 bar. Chemical, composite, silicone and several multipurpose oil hoses are 4:1. Steam hoses are 10:1: our 18 bar steam hose has a 180 bar minimum burst. The factor grows with the consequence of a failure and with how fast the hose ages in service.',
    },
    {
      type: 'key_takeaways',
      items: [
        'Safety factor = minimum burst pressure ÷ working pressure. It is a design margin, not a licence to run above the working pressure.',
        'On our listings: 3:1 for water, air and oil S&D hose; 4:1 for chemical, composite, silicone and multipurpose oil hose; 10:1 for steam.',
        'Steam gets the largest factor because heat ages the hose continuously and a failure releases scalding steam.',
        'Hydraulic hose is built to 4:1; API 16C choke and kill lines run as close as 1.5:1, which is why their inspection regime is so strict.',
        'The assembly is only as good as its weakest part: coupling, clamp or hose.',
      ],
    },
    {
      type: 'lead',
      html: 'Every industrial hose listing in our range carries a field most buyers skip: the safety factor. It is the ratio between the pressure the hose is rated to work at and the pressure it is guaranteed not to burst below, and it is <strong>not the same number for every hose</strong>. Reading why it changes says more about how to use a hose than any marketing description.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'What the factor is.',
      anchor: 'definition',
    },
    {
      type: 'paragraph',
      html: 'Divide the minimum burst pressure by the working pressure and you have the safety factor. A 10 bar water hose with a 30 bar burst is 3:1. The margin exists to absorb everything the rating cannot see — pressure spikes, ageing, small amounts of damage, temperature — so that a hose run at its working pressure for its whole life does not fail. It is not spare capacity: running a 10 bar hose at 15 bar spends the margin that was meant for its old age.',
    },
    {
      type: 'comparison_table',
      caption: 'Safety factors on our industrial hose listings',
      columns: ['Duty', 'Example from our range', 'Working / burst', 'Factor'],
      rows: [
        { cells: ['Water suction and delivery', 'A210', '10 / 30 bar', '3:1'] },
        { cells: ['Compressed air and water', 'A101HP', '20 / 60 bar', '3:1'] },
        { cells: ['Oil suction and delivery', 'A460', '20 / 60 bar', '3:1'] },
        { cells: ['Oil, mud and sea water', 'A400EU', '20 / 80 bar', '4:1'] },
        { cells: ['Chemical (UHMWPE)', 'A410', '10 / 40 bar', '4:1'] },
        { cells: ['Composite', 'A901GG', '20 / 80 bar', '4:1'] },
        { cells: ['Silicone food', 'SANSIL', '3 – 10 bar by size', '4:1'] },
        { cells: ['Saturated steam', 'A230', '18 / 180 bar', '10:1'], highlight: true },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Why the factor changes.',
      anchor: 'why',
    },
    {
      type: 'paragraph',
      html: 'Two things push a factor up: how bad a failure would be, and how fast the hose ages. Water at 10 bar escaping from a split is a nuisance; the hose ages slowly; 3:1 is enough. A chemical or a fuel escaping is a release, and composite and chemical hose are exposed to media that work on them over time, so 4:1. Steam is both — a failure releases scalding steam at the operator, and heat ages the rubber continuously from the inside, where nobody can inspect it — so steam hose is built to <strong>10:1</strong>. Our 7 bar steam and hot water hose bursts at no less than 70 bar; our 18 bar hose at 180.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A big factor is not a reason to run higher.',
      body: 'A 10 bar steam hose with a 100 bar burst is still a 10 bar hose. The factor is the margin its designers needed for steam service; a hose run above its working pressure is a hose whose margin has been spent on day one.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Against hydraulic and oilfield hose.',
      anchor: 'comparison',
    },
    {
      type: 'paragraph',
      html: 'Hydraulic hose is built to 4:1 — a 2SN hose rated 400 bar at −04 has a 1,600 bar minimum burst. Oilfield hose goes the other way: API 16C choke and kill lines are designed as close as 1.5:1 between working and test, and API 7K rotary hose at 2.5:1. Those thin margins are made acceptable by the inspection, pressure-testing and recertification regimes around them — margin that is not in the design has to come from inspection.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'The assembly factor.',
      anchor: 'assembly',
    },
    {
      type: 'paragraph',
      html: 'A hose\'s safety factor says nothing about its couplings. A 20 bar oil hose on a 6" cam and groove coupling rated 75 psi is a 5 bar assembly; a 16 bar suction hose on a nipple held by one band clamp is whatever that clamp holds. Rate an assembly at its weakest component, mark it at that figure, and pressure-test the assembly rather than trusting the hose\'s datasheet.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'How is a hose safety factor calculated?',
          answer:
            'Minimum burst pressure divided by maximum working pressure. A 10 bar hose with a 30 bar minimum burst has a 3:1 safety factor.',
        },
        {
          question: 'Why do steam hoses have a 10:1 safety factor?',
          answer:
            'Because a failure releases scalding steam and heat ages the hose continuously from the inside. Our steam hoses are built to 10:1.',
        },
        {
          question: 'Can I run a hose above its working pressure if the safety factor is high?',
          answer:
            'No. The safety factor is the designers\' margin for spikes, ageing and damage. Running above the working pressure spends it.',
        },
        {
          question: 'Does the safety factor apply to the whole assembly?',
          answer:
            'No — only to the hose. The couplings and clamping have their own ratings, and the assembly is rated at its weakest part.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Hoses quoted in this article',
      skus: ['IH-IH-A210', 'IH-IH-A101HP', 'IH-IH-A460', 'IH-IH-A410', 'IH-IH-A901GG', 'IH-IH-SANSIL', 'IH-IH-A230', 'IH-IH-A235BU'],
    },
    {
      type: 'category_link',
      slug: 'industrial-hose-suppliers-uae',
      label: 'Industrial hose',
      blurb: 'Every application shelf: suction, air, oil, chemical, composite, food and steam.',
    },
    {
      type: 'category_link',
      slug: 'industrial-steam-hoses',
      label: 'Industrial steam hose',
      blurb: '7, 10 and 18 bar steam hose at 10:1.',
    },

    {
      type: 'cta_block',
      heading: 'Rating an assembly for a permit or an audit?',
      body: 'Send the hose, the couplings and the clamping. We will state the rating of each part and the assembly, and pressure-test and tag it if you need the record.',
      quoteLabel: 'Ask about a rating',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Working pressures, burst pressures and safety factors checked against our industrial hose listings.',
    },
  ],
}

export default ARTICLE
