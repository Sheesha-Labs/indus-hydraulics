import type { BlogArticleSeed } from '../shared'

/**
 * Webbing and round sling capacity chart.
 *
 * Capacities and colours from the live round sling (PRSEE / PRSE) and
 * webbing (PFWSEE / PWSE) listings — the generator asserts each EN 1492
 * colour against the listing. Mode factors, multi-leg factors, 7:1 design
 * factor and −40 to 100 °C are the EN 1492 figures already verified for
 * sling-colour-code-chart and types-of-lifting-slings (2026-10-01).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'webbing-and-round-sling-capacity-chart',
  title: 'Webbing and round sling capacity chart: WLL for every hitch, 1 t to 100 t',
  excerpt: 'The full EN 1492 chart for polyester webbing and round slings: straight, choked and basket ratings for every capacity from 1 t to 100 t, two- and multi-leg ratings, colours, weights and the temperature limits.',
  categorySlug: 'rigging-capacity-charts',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Webbing & round sling capacity chart — every hitch, 1–100 t',
  seoDescription: 'Polyester webbing and round sling WLL chart to EN 1492: straight, choke and basket ratings from 1 t to 100 t, multi-leg factors, colours and weights.',
  focusKeyword: 'webbing sling capacity chart',
  publishedAt: '2026-10-13T12:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'The rating on a polyester sling is for a straight, vertical lift. Choked it carries 80%; in a basket with parallel legs, twice as much.',
        'A basket with legs at up to 45° from vertical carries 1.4 times the straight rating, and from 45° to 60°, 1.0 times.',
        'A 5 t (red) sling therefore lifts 5 t straight, 4 t choked and 10 t in a parallel basket.',
        'Under EN 1492 the body colour shows the straight rating up to 8 t; every sling from 10 t up is orange, so read the label.',
        'Polyester slings are rated from −40 °C to 100 °C with a 7:1 design factor, and are cut by unprotected edges.',
      ],
    },
    {
      type: 'lead',
      html: 'Every polyester webbing or round sling carries one number on its label: the working load limit for a straight lift. Everything else — choking it, wrapping it into a basket, pairing it with a second sling — is that number multiplied by a mode factor. The chart below does the multiplication for every capacity we list, so the figure for the hitch you are about to rig can be read straight off.',
    },
    {
      type: 'direct_answer',
      question: 'How much can a webbing sling lift in a choke or basket hitch?',
      answer: 'Under EN 1492, a choked sling carries 0.8 times its straight rating, a basket with parallel legs 2.0 times, a basket with legs up to 45° from vertical 1.4 times, and from 45° to 60° 1.0 times. A 2 t green sling lifts 2 t straight, 1.6 t choked and 4 t in a parallel basket.',
    },
    { type: 'section_head', number: '/01', title: 'The capacity chart, every hitch.', anchor: 'chart' },
    {
      type: 'paragraph',
      html: 'Working load limit in tonnes for each hitch, for every capacity in our round sling range. The same factors apply to flat webbing slings of the same rating.',
    },
    {
      type: 'comparison_table',
      caption: 'Polyester webbing and round sling WLL (t) by hitch — EN 1492 mode factors',
      columns: ['Sling WLL', 'Colour', 'Straight', 'Choked', 'Basket, parallel', 'Basket, 0–45°', 'Basket, 45–60°'],
      rows: [
        { cells: ['1 t', 'Violet', '1', '0.8', '2', '1.4', '1'] },
        { cells: ['2 t', 'Green', '2', '1.6', '4', '2.8', '2'] },
        { cells: ['3 t', 'Yellow', '3', '2.4', '6', '4.2', '3'] },
        { cells: ['4 t', 'Grey', '4', '3.2', '8', '5.6', '4'] },
        { cells: ['5 t', 'Red', '5', '4', '10', '7', '5'] },
        { cells: ['6 t', 'Brown', '6', '4.8', '12', '8.4', '6'] },
        { cells: ['8 t', 'Blue', '8', '6.4', '16', '11.2', '8'] },
        { cells: ['10 t', 'Orange', '10', '8', '20', '14', '10'] },
        { cells: ['12 t', 'Orange', '12', '9.6', '24', '16.8', '12'] },
        { cells: ['15 t', 'Orange', '15', '12', '30', '21', '15'] },
        { cells: ['20 t', 'Orange', '20', '16', '40', '28', '20'] },
        { cells: ['25 t', 'Orange', '25', '20', '50', '35', '25'] },
        { cells: ['30 t', 'Orange', '30', '24', '60', '42', '30'] },
        { cells: ['36 t', 'Orange', '36', '28.8', '72', '50.4', '36'] },
        { cells: ['40 t', 'Orange', '40', '32', '80', '56', '40'] },
        { cells: ['50 t', 'Orange', '50', '40', '100', '70', '50'] },
        { cells: ['75 t', 'Orange', '75', '60', '150', '105', '75'] },
        { cells: ['100 t', 'Orange', '100', '80', '200', '140', '100'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Orange tells you only that it is heavy.',
      body: 'EN 1492 colours run violet, green, yellow, grey, red, brown and blue for 1 t to 8 t. Every sling of 10 t and over is orange, so above 8 t the colour cannot tell a 10 t sling from a 100 t one. Read the label every time. US round slings use a different colour scale altogether — the sling colour code chart compares them.',
    },
    { type: 'section_head', number: '/02', title: 'Two slings, and multi-leg slings.', anchor: 'multi-leg' },
    {
      type: 'paragraph',
      html: 'Two slings used together on one hook, or a multi-leg assembly, are rated by the same angle bands as chain and wire rope. Here the factor applies to the rating of each sling (each leg):',
    },
    {
      type: 'comparison_table',
      caption: 'Two-leg and multi-leg WLL (t) for polyester slings, by WLL of each leg',
      columns: ['Each sling', 'Colour', '2 legs, 0–45°', '2 legs, 45–60°', '3–4 legs, 0–45°', '3–4 legs, 45–60°'],
      rows: [
        { cells: ['1 t', 'Violet', '1.4', '1', '2.1', '1.5'] },
        { cells: ['2 t', 'Green', '2.8', '2', '4.2', '3'] },
        { cells: ['3 t', 'Yellow', '4.2', '3', '6.3', '4.5'] },
        { cells: ['4 t', 'Grey', '5.6', '4', '8.4', '6'] },
        { cells: ['5 t', 'Red', '7', '5', '10.5', '7.5'] },
        { cells: ['6 t', 'Brown', '8.4', '6', '12.6', '9'] },
        { cells: ['8 t', 'Blue', '11.2', '8', '16.8', '12'] },
        { cells: ['10 t', 'Orange', '14', '10', '21', '15'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'As with every multi-leg sling, three and four legs share one rating: on a rigid load four legs cannot be relied on to share the weight, so the factor assumes three. Make sure each pair of slings is the same capacity and length; mixing ratings in one lift puts the weaker sling at risk.',
    },
    { type: 'section_head', number: '/03', title: 'Webbing or round sling?', anchor: 'webbing-or-round' },
    {
      type: 'paragraph',
      html: 'Both are polyester, both follow EN 1492 (part 1 for flat webbing, part 2 for round slings), and both use the same colours and factors. They differ in how they meet the load. Flat webbing gives a wide, flat bearing surface that spreads pressure on finished and painted loads. A round sling is a core of continuous yarn inside a cover; it is more flexible and wraps awkward shapes. Weights are close; at the light end the round sling is a little heavier:',
    },
    {
      type: 'comparison_table',
      caption: 'Weight of a 2 m sling, from our listings (kg)',
      columns: ['WLL', 'Colour', 'Flat webbing, eye and eye', 'Round sling, endless'],
      rows: [
        { cells: ['1 t', 'Violet', '0.4', '0.6'] },
        { cells: ['2 t', 'Green', '0.8', '0.95'] },
        { cells: ['3 t', 'Yellow', '1.25', '1.3'] },
        { cells: ['4 t', 'Grey', '1.675', '1.7'] },
        { cells: ['5 t', 'Red', '2.3', '2.05'] },
        { cells: ['6 t', 'Brown', '2.6', '2.55'] },
        { cells: ['8 t', 'Blue', '3.4', '3.4'] },
      ],
    },
    {
      type: 'comparison_table',
      caption: 'Capacity ranges in our polyester sling listings',
      columns: ['Sling', 'Range'],
      rows: [
        { cells: ['Polyester round sling, eye and eye', '1 t to 100 t'] },
        { cells: ['Polyester round sling, endless', '1 t to 20 t'] },
        { cells: ['Polyester webbing sling, eye and eye', '1 t to 12 t'] },
        { cells: ['Polyester webbing sling, endless', '1 t to 12 t'] },
      ],
    },
    { type: 'section_head', number: '/04', title: 'Limits that are not in the chart.', anchor: 'limits' },
    {
      type: 'prose',
      html: '<ul><li><strong>Design factor.</strong> EN 1492 polyester slings are rated at 7:1 — a 5 t sling must not break below 35 t. The extra margin over chain and wire rope reflects how easily a synthetic sling is cut or weakened without visible signs.</li><li><strong>Temperature.</strong> −40 °C to 100 °C for polyester. Keep slings off hot steel decks and out of direct sun when they are not in use.</li><li><strong>Chemicals.</strong> Polyester resists mineral acids but is damaged by alkalis. A blue label means polyester; green, polyamide; brown, polypropylene.</li><li><strong>Edges.</strong> An unprotected steel edge can cut a polyester sling under load. Use sleeves or corner pads, or switch to chain.</li><li><strong>Choking.</strong> Let the choke draw up by itself, and never choke a sling around a sharp edge.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Withdraw it if the label is gone.',
      body: 'A synthetic sling whose label is missing or unreadable has no verifiable rating and is taken out of service. So is a round sling whose cover is cut through to the core, or any sling with cuts, burns, chemical damage or broken stitching in the eyes.',
    },
    {
      type: 'paragraph',
      html: 'Worked example: a 6 t pipe spool is lifted in a basket with two legs at about 30° from vertical. That is the 0–45° basket band, factor 1.4, so the sling needs a straight rating of at least 6 ÷ 1.4 = 4.3 t. A 4 t grey sling gives 5.6 t — not enough. A 5 t red sling gives 7 t. Use the red sling, with edge protection at any flange.',
    },
    {
      type: 'product_embed',
      heading: 'Polyester slings in this chart',
      skus: ['IH-LR-SY-PRSEE', 'IH-LR-SY-PRSE', 'IH-LR-SY-PFWSEE', 'IH-LR-SY-PWSE'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'How much can a 1 tonne webbing sling lift?',
          answer: '1 t straight, 0.8 t choked, 2 t in a basket with vertical legs, 1.4 t in a basket with legs up to 45° from vertical, and 1 t from 45° to 60°. It is violet under EN 1492.',
        },
        {
          question: 'How much does a choke hitch reduce a round sling?',
          answer: 'To 80% of its straight rating under EN 1492. A 3 t yellow round sling is rated 2.4 t choked.',
        },
        {
          question: 'Is a round sling stronger than a webbing sling?',
          answer: 'Not at the same rating. Both are rated to EN 1492 with the same factors; a 5 t round sling and a 5 t webbing sling lift the same. Choose on the load’s shape and surface.',
        },
        {
          question: 'What is the design factor for polyester slings?',
          answer: '7:1 under EN 1492. The minimum breaking force is at least seven times the working load limit.',
        },
        {
          question: 'What colour is a 10 tonne sling?',
          answer: 'Orange — and so is every EN 1492 sling above 10 t. The label is the only way to tell them apart.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'synthetic-slings',
      label: 'Synthetic slings',
      blurb: 'Polyester round and webbing slings to EN 1492, 1 t to 100 t.',
    },
    { type: 'category_link', slug: 'lifting-slings', label: 'Lifting slings', blurb: 'Synthetic, wire rope and chain slings.' },
    {
      type: 'related_articles',
      slugs: [
        'sling-colour-code-chart',
        'sling-angle-chart',
        'types-of-lifting-slings',
        'chain-sling-capacity-chart',
        'wire-rope-sling-capacity-chart',
        'lifting-gear-rejection-criteria',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Ratings, colours and weights from our polyester sling listings. Mode factors, colours, design factor and temperature range from EN 1492-1/-2 user information. The label on the sling governs.',
    },
    {
      type: 'cta_block',
      heading: 'Need polyester slings for a job?',
      body: 'Send the load, the hitch and the length. We will quote round or webbing slings in the right EN 1492 colour, with edge protection where the load needs it.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
