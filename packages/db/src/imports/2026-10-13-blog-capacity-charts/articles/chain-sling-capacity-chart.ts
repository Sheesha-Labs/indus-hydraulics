import type { BlogArticleSeed } from '../shared'

/**
 * Chain sling capacity chart — Grade 80 and Grade 100.
 *
 * Every WLL is read from the live chain sling listings (SOS, DOS, TOS, QOS in
 * both grades) and the Grade 100 chain table; the generator asserted that the
 * three- and four-leg columns agree before writing this file. Choke (0.8) and
 * Grade 8 heat (100/90/75%) from published chain-sling makers' instructions,
 * checked 2026-10-13; the copy says makers differ above 200 °C.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'chain-sling-capacity-chart',
  title: 'Chain sling capacity chart: Grade 80 and Grade 100 WLL by legs and angle',
  excerpt: 'Working load limits for Grade 80 chain slings from 4 mm to 50 mm and Grade 100 from 6 mm to 26 mm, for one, two, three and four legs at both angle bands — with the factors behind them, the choke and temperature reductions, and a worked sizing example.',
  categorySlug: 'rigging-capacity-charts',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Chain sling capacity chart — Grade 80 & Grade 100 WLL',
  seoDescription: 'Chain sling WLL chart for Grade 80 (4–50 mm) and Grade 100 (6–26 mm): single, two, three and four legs at 0–45° and 45–60°, plus choke and heat reductions.',
  focusKeyword: 'chain sling capacity chart',
  publishedAt: '2026-10-13T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A 10 mm Grade 80 chain sling is rated 3.15 t on a single leg, 4.25 t as a two-leg sling up to 45° from vertical, and 6.7 t as a three- or four-leg sling.',
        'Multi-leg ratings are the single-leg rating times a fixed factor: 1.4 and 1.0 for two legs, 2.1 and 1.5 for three or four legs, in the 0–45° and 45–60° bands.',
        'A four-leg sling carries the same rating as a three-leg sling, because four legs cannot be relied on to share a rigid load.',
        'Grade 100 carries about a quarter more than Grade 80 size for size: 4 t against 3.15 t at 10 mm.',
        'Choking a leg cuts it to 80%. Grade 8 slings are commonly derated to 90% from 200 °C and 75% from 300 °C. Nothing is rated beyond 60° from vertical.',
      ],
    },
    {
      type: 'lead',
      html: 'A chain sling’s capacity depends on three things: the chain size and grade, the number of legs, and the angle the legs hang at. The charts below give all three for every chain sling we list, taken directly from the size tables on the product pages. Find your chain size, then read across to the configuration you will rig.',
    },
    {
      type: 'direct_answer',
      question: 'What is the working load limit of a chain sling?',
      answer: 'It depends on the chain size, grade, number of legs and leg angle. For Grade 80: a 10 mm single leg is 3.15 t, a 13 mm single leg 5.3 t and a 16 mm single leg 8 t. A two-leg sling is rated 1.4 times the single leg with legs up to 45° from vertical; a three- or four-leg sling 2.1 times. Grade 100 runs about 25% higher.',
    },
    { type: 'section_head', number: '/01', title: 'Grade 80 chain sling capacity chart.', anchor: 'grade-80' },
    {
      type: 'paragraph',
      html: 'Working load limit in tonnes, from our Grade 80 sling listings. The angle is measured from the vertical — 0–45° from vertical is up to 90° between two opposite legs; 45–60° is 90° to 120° between them.',
    },
    {
      type: 'comparison_table',
      caption: 'Grade 80 chain sling WLL (t) by chain size, legs and angle from vertical',
      columns: ['Chain', 'Single leg', '2-leg, 0–45°', '2-leg, 45–60°', '3- & 4-leg, 0–45°', '3- & 4-leg, 45–60°'],
      rows: [
        { cells: ['4 mm', '0.5', '0.7', '0.5', '1.05', '0.75'] },
        { cells: ['5 mm', '0.8', '1.12', '0.8', '1.6', '1.18'] },
        { cells: ['6 mm', '1.12', '1.6', '1.12', '2.36', '1.7'] },
        { cells: ['7 mm', '1.5', '2.12', '1.5', '3.15', '2.24'] },
        { cells: ['8 mm', '2', '2.8', '2', '4.25', '3'] },
        { cells: ['10 mm', '3.15', '4.25', '3.15', '6.7', '4.75'] },
        { cells: ['13 mm', '5.3', '7.5', '5.3', '11.2', '8'] },
        { cells: ['16 mm', '8', '11.2', '8', '17', '11.8'] },
        { cells: ['18 mm', '10', '14', '10', '21', '15'] },
        { cells: ['19 mm', '11.2', '15.6', '11.2', '23.5', '16.8'] },
        { cells: ['20 mm', '12.5', '17', '12.5', '26.2', '18.7'] },
        { cells: ['22 mm', '15', '21.2', '15', '31.5', '22.4'] },
        { cells: ['26 mm', '21.2', '30', '21.2', '44.5', '31.5'] },
        { cells: ['28 mm', '25', '33.5', '25', '52.5', '37.5'] },
        { cells: ['30 mm', '28', '39.2', '28', '58.8', '42'] },
        { cells: ['32 mm', '31.5', '45', '31.5', '66.1', '47.2'] },
        { cells: ['36 mm', '40', '56', '40', '84', '60'] },
        { cells: ['38 mm', '45', '63', '45', '94.5', '67.5'] },
        { cells: ['40 mm', '50', '70', '50', '105', '75'] },
        { cells: ['45 mm', '63', '88.2', '63', '132.3', '94.5'] },
        { cells: ['50 mm', '78.5', '109.9', '78.5', '164.8', '117.7'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Check which angle the chart means.',
      body: 'Our charts, and the European standards behind them, measure the leg angle from the vertical. Many US charts measure it from the horizontal, so their 60° is our 30°. Read a horizontal-angle chart as if it were vertical and you will overload the sling. The sling angle chart explains how to measure it on site.',
    },
    { type: 'section_head', number: '/02', title: 'Grade 100 chain sling capacity chart.', anchor: 'grade-100' },
    {
      type: 'paragraph',
      html: 'Grade 100 slings use a higher-strength alloy chain and matching Grade 100 fittings. Our listings run from 6 mm to 26 mm.',
    },
    {
      type: 'comparison_table',
      caption: 'Grade 100 chain sling WLL (t) by chain size, legs and angle from vertical',
      columns: ['Chain', 'Single leg', '2-leg, 0–45°', '2-leg, 45–60°', '3- & 4-leg, 0–45°', '3- & 4-leg, 45–60°'],
      rows: [
        { cells: ['6 mm', '1.4', '2', '1.4', '3', '2.12'] },
        { cells: ['7 mm', '1.9', '2.65', '1.9', '4', '2.8'] },
        { cells: ['8 mm', '2.5', '3.55', '2.5', '5.3', '3.75'] },
        { cells: ['10 mm', '4', '5.6', '4', '8', '6'] },
        { cells: ['13 mm', '6.7', '9.5', '6.7', '14', '10'] },
        { cells: ['16 mm', '10', '14', '10', '21.2', '15'] },
        { cells: ['18 mm', '12.5', '17.5', '12.5', '26.2', '18.7'] },
        { cells: ['19 mm', '14', '20', '14', '30', '21.2'] },
        { cells: ['20 mm', '16', '22.4', '16', '33.6', '24'] },
        { cells: ['22 mm', '19', '26.5', '19', '40', '28'] },
        { cells: ['26 mm', '26.5', '37.5', '26.5', '56', '40'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Single-leg WLL, Grade 80 against Grade 100, from our listings',
      columns: ['Chain', 'Grade 80 (t)', 'Grade 100 (t)', 'Difference'],
      rows: [
        { cells: ['6 mm', '1.12', '1.4', '+25%'] },
        { cells: ['7 mm', '1.5', '1.9', '+27%'] },
        { cells: ['8 mm', '2', '2.5', '+25%'] },
        { cells: ['10 mm', '3.15', '4', '+27%'] },
        { cells: ['13 mm', '5.3', '6.7', '+26%'] },
        { cells: ['16 mm', '8', '10', '+25%'] },
        { cells: ['18 mm', '10', '12.5', '+25%'] },
        { cells: ['19 mm', '11.2', '14', '+25%'] },
        { cells: ['20 mm', '12.5', '16', '+28%'] },
        { cells: ['22 mm', '15', '19', '+27%'] },
        { cells: ['26 mm', '21.2', '26.5', '+25%'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The gain is what makes Grade 100 worth its price on heavy, repeated lifts: the same load can often go on the next chain size down, which is lighter to handle and fits smaller lifting points. Never mix grades in one sling — a Grade 80 hook on a Grade 100 leg drops the whole leg to the Grade 80 rating at best.',
    },
    { type: 'section_head', number: '/03', title: 'Where the numbers come from.', anchor: 'factors' },
    {
      type: 'paragraph',
      html: 'Multi-leg chain slings are rated by the uniform load method of EN 818-4: the single-leg working load limit multiplied by a fixed factor for each configuration and angle band. Our 10 mm Grade 80 sling shows each factor at work:',
    },
    {
      type: 'comparison_table',
      caption: 'Rating factors for chain slings, worked on a 10 mm Grade 80 sling',
      columns: ['Configuration', 'Factor', '10 mm Grade 80 (t)'],
      rows: [
        { cells: ['Single leg, straight', '1.0', '3.15'] },
        { cells: ['Single leg, choked', '0.8', '2.52'] },
        { cells: ['2-leg, 0–45° from vertical', '1.4', '4.25'] },
        { cells: ['2-leg, 45–60° from vertical', '1.0', '3.15'] },
        { cells: ['3- or 4-leg, 0–45°', '2.1', '6.7'] },
        { cells: ['3- or 4-leg, 45–60°', '1.5', '4.75'] },
        { cells: ['Beyond 60° from vertical', '—', 'Not rated'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The two-leg factors are the geometry at the top of each band: two legs at 45° give 2 × cos 45° = 1.41, rounded to 1.4, and at 60° give 2 × cos 60° = 1.0. The three- and four-leg factors are the same arithmetic for three legs — 3 × cos 45° = 2.12 and 3 × cos 60° = 1.5. Published tables round the products to a standard series, so a figure can sit slightly below the raw multiplication.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'A four-leg sling is rated on three legs.',
      body: 'On a rigid load, slight differences in leg length or lifting-point height let two or three legs take the weight while the others go slack. That is why the three- and four-leg columns are identical. If the legs cannot be equalised, or the load is flexible and may hang on two, rate the sling as a two-leg sling.',
    },
    { type: 'section_head', number: '/04', title: 'Reductions: choke, heat and shortening.', anchor: 'reductions' },
    {
      type: 'paragraph',
      html: 'The charts assume a straight, in-line pull on each leg, at normal temperature, with every leg at its full length. Change any of those and the rating comes down:',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Choke hitch.</strong> A leg choked around the load is rated at 80% of its straight rating in chain-sling makers’ instructions. Let the choke draw up naturally; never hammer it down.</li><li><strong>Heat.</strong> A widely published Grade 8 table keeps the full rating from −40 °C to 200 °C, then 90% to 300 °C and 75% to 400 °C. Makers differ above 200 °C — including on whether the sling returns to full rating once it has cooled — and Grade 100 limits are set by each maker, so follow the instructions for the sling in use.</li><li><strong>Shortening.</strong> A leg shortened with a grab hook or clutch keeps its rating only if that fitting is rated for the full chain WLL. Some grab hooks reduce it; check the hook.</li><li><strong>Uneven loading.</strong> If the centre of gravity is off-centre, one leg can carry far more than its share. Plan the lift on the most heavily loaded leg.</li><li><strong>Edges.</strong> A link bent over a sharp edge loses strength. Use packing or edge protection, or a larger chain.</li></ul>',
    },
    { type: 'section_head', number: '/05', title: 'Worked example: sizing a two-leg sling.', anchor: 'worked-example' },
    {
      type: 'paragraph',
      html: 'A 5 t load is lifted on two lifting points, with the legs at about 40° from vertical. That is inside the 0–45° band, so the sling needs a two-leg rating of at least 5 t in the 0–45° column.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong>Grade 80:</strong> 10 mm gives 4.25 t — not enough. 13 mm gives 7.5 t. Use 13 mm, at 3.73 kg of chain per metre.</li><li><strong>Grade 100:</strong> 10 mm gives 5.6 t. Use 10 mm, at 2.23 kg per metre.</li></ul>',
    },
    {
      type: 'paragraph',
      html: 'The Grade 100 sling does the same job one chain size down, with roughly 40% less chain weight per leg. Had the legs opened past 45°, the 45–60° column would apply: 3.15 t for 10 mm Grade 80 and 4 t for 10 mm Grade 100, so both would have to move up a size.',
    },
    {
      type: 'decision_tree',
      heading: 'Reading the chart for a lift',
      intro: 'Work through these in order before choosing a size.',
      branches: [
        {
          condition: 'How many legs will actually share the load?',
          outcome: 'Use the two-leg column for two legs; the three/four-leg column for three or four, on a load that lets them share.',
        },
        {
          condition: 'What is the leg angle from vertical?',
          outcome: 'Up to 45°: first column for that leg count. 45–60°: second column. Beyond 60°: not rated — lengthen the legs or use a spreader.',
        },
        { condition: 'Will any leg be choked?', outcome: 'Take 80% of the figure.' },
        { condition: 'Is the load or the work area hot?', outcome: 'Apply the maker’s heat table for the grade.' },
        { condition: 'Is the centre of gravity off-centre?', outcome: 'Size on the most heavily loaded leg, not the average.' },
      ],
    },
    { type: 'section_head', number: '/06', title: 'The chain behind the sling.', anchor: 'chain' },
    {
      type: 'paragraph',
      html: 'Every sling above is made from Grade 80 or Grade 100 alloy chain with fittings of the same grade. The chain carries the same 4:1 design factor as the sling: our Grade 100 chain is proof-tested to 2.5 times its WLL and breaks at no less than four times it.',
    },
    {
      type: 'comparison_table',
      caption: 'Grade 100 alloy lifting chain, from our table',
      columns: ['Chain', 'WLL (t)', 'Proof load (kN)', 'Min. breaking (kN)', 'Weight (kg/m)'],
      rows: [
        { cells: ['6 mm', '1.4', '35', '57', '0.8'] },
        { cells: ['7 mm (1/4″)', '1.9', '48', '77', '1.09'] },
        { cells: ['8 mm (5/16″)', '2.5', '63', '101', '1.43'] },
        { cells: ['10 mm (3/8″)', '4', '98', '157', '2.23'] },
        { cells: ['12 mm', 'On request', '141', '226', '3.21'] },
        { cells: ['13 mm (1/2″)', '6.7', '166', '265', '3.77'] },
        { cells: ['16 mm (5/8″)', '10', '251', '402', '5.71'] },
        { cells: ['18 mm', '12.5', '318', '509', '7.23'] },
        { cells: ['19 mm (3/4″)', '14', '354', '567', '8.04'] },
        { cells: ['20 mm', '16', '393', '628', '8.92'] },
        { cells: ['22 mm (7/8″)', '19', '475', '760', '10.8'] },
        { cells: ['23 mm', 'On request', '519', '831', '11.8'] },
        { cells: ['25 mm (1″)', 'On request', '614', '982', '13.94'] },
        { cells: ['26 mm', '26.5', '664', '1,062', '15.08'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Grade 30, 43 and 70 chain is transport and lashing chain. It is not made into lifting slings and never appears in a lifting chart.',
    },
    {
      type: 'product_embed',
      heading: 'Chain slings in these charts',
      skus: [
        'IH-LR-CS-G80SOS',
        'IH-LR-CS-G80DOS',
        'IH-LR-CS-G80TOS',
        'IH-LR-CS-G80QOS',
        'IH-LR-CS-G100SOS',
        'IH-LR-CS-G100DOS',
        'IH-LR-CS-G100QOS',
        'IH-LR-CH-G100',
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What is the capacity of a 10 mm Grade 80 chain sling?',
          answer: '3.15 t on a single leg; 4.25 t as a two-leg sling with legs up to 45° from vertical and 3.15 t from 45° to 60°; 6.7 t and 4.75 t as a three- or four-leg sling.',
        },
        {
          question: 'What is the capacity of a 13 mm chain sling?',
          answer: 'In Grade 80, 5.3 t single leg, 7.5 t two-leg and 11.2 t three- or four-leg, up to 45° from vertical. In Grade 100, 6.7 t, 9.5 t and 14 t.',
        },
        {
          question: 'Why is a four-leg chain sling rated the same as a three-leg sling?',
          answer: 'Because on a rigid load the four legs cannot be relied on to share the weight equally — two or three of them usually take it. The rating assumes three legs carry the load.',
        },
        {
          question: 'How much does a choke hitch reduce a chain sling?',
          answer: 'To 80% of the straight rating, in chain-sling makers’ instructions. A 10 mm Grade 80 leg rated 3.15 t straight is rated 2.52 t choked.',
        },
        {
          question: 'Can a chain sling be used at more than 60° from vertical?',
          answer: 'No. Beyond 60° from vertical — more than 120° between two legs — each leg carries more than the whole load and the tension climbs steeply. No chain sling on our listings is rated there.',
        },
        {
          question: 'Is Grade 100 chain stronger than Grade 80?',
          answer: 'Yes, by about 25% size for size on our listings: a 10 mm single leg is 3.15 t in Grade 80 and 4 t in Grade 100.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'chain-slings',
      label: 'Chain slings',
      blurb: '27 make-ups in Grade 80 and Grade 100, each with its full WLL table.',
    },
    { type: 'category_link', slug: 'alloy-lifting-chain', label: 'Alloy lifting chain', blurb: 'Grade 80 and Grade 100 chain by the metre.' },
    {
      type: 'category_link',
      slug: 'grade-100-chain-fittings',
      label: 'Grade 100 chain fittings',
      blurb: 'Master links, hooks and connectors to build or repair a sling.',
    },
    {
      type: 'related_articles',
      slugs: [
        'chain-sling-codes-explained',
        'sling-angle-chart',
        'chain-grades-explained',
        'master-links-explained',
        'wire-rope-sling-capacity-chart',
        'lifting-gear-rejection-criteria',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'WLLs from our Grade 80 and Grade 100 chain sling listings (EN 818-4 method). Choke and heat reductions from published chain-sling makers’ instructions. The tag and certificate on the sling govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need a chain sling sized for a lift?',
      body: 'Send the load, the number and spacing of lifting points and the headroom. We will choose the grade, size and make-up, and quote with the manufacturer’s test certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
