import type { BlogArticleSeed } from '../shared'

/**
 * Sling colour codes — EN 1492, the US round-sling convention, and the label.
 *
 * Sources, checked 2026-09-28 to 2026-10-01:
 *   - EN 1492-1/-2 WLL colours and mode factors: the standard text and a
 *     maker's EN 1492 user manual (Dolezych, 04/2026). Our own round and
 *     webbing sling tables carry exactly the same colours.
 *   - Label colour by fibre and temperature ranges: same maker manual.
 *   - US round slings: WSTDA RS-1 (2001 edition) Table 1 — read from a hosted
 *     copy, so cited by name only. Its footnote says colours and capacities may
 *     vary between makers; a maker's own statement says round-sling colour is
 *     not governed by ASME B30.9.
 *   - Marking and withdrawal: OSHA 29 CFR 1910.184 (c)(14) and (i)(1).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'sling-colour-code-chart',
  title: 'Sling colour code chart: what each colour means, and why the label still decides',
  excerpt:
    'Under EN 1492, a violet polyester sling is rated 1 t, green 2 t, yellow 3 t, grey 4 t, red 5 t, brown 6 t, blue 8 t and orange 10 t or more. US round slings follow a different scale, so a green sling can mean 2 t or 5,300 lb depending on where it was made. Here is the chart — and why the label, not the colour, is the rating.',
  categorySlug: 'rigging-capacity-charts',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Sling colour code chart: EN 1492 webbing and round sling colours',
  seoDescription:
    'The EN 1492 sling colour code for webbing and round slings, what the label colour means, how hitch changes the rating, and why US round slings use a different colour scale.',
  focusKeyword: 'sling colour code chart',
  publishedAt: '2026-10-01T09:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Under EN 1492, the colour of a polyester webbing or round sling shows its vertical WLL: violet 1 t, green 2 t, yellow 3 t, grey 4 t, red 5 t, brown 6 t, blue 8 t, orange 10 t and over.',
        'The colour of the label is a different code: it shows the fibre — blue for polyester, green for polyamide (nylon), brown for polypropylene.',
        'US round slings use a different colour scale. A green US round sling is rated 5,300 lb (about 2.4 t), not 2 t. Never identify an imported sling by colour alone.',
        'The colour is the vertical rating. Choked, the WLL falls to 80%; in a basket with parallel legs it doubles.',
        'The label is the rating. A sling with a missing or unreadable label is taken out of service, whatever its colour.',
      ],
    },
    {
      type: 'lead',
      html: 'Colour-coded slings exist so that a rigger can pick the right capacity from across a yard. That works as long as everyone on site is reading the same code. On a Gulf project with slings from Europe, the US and Asia in the same container, they often are not.',
    },

    { type: 'section_head', number: '/01', title: 'The EN 1492 chart.', anchor: 'en-1492-chart' },
    {
      type: 'paragraph',
      html: 'EN 1492-1 (flat webbing slings) and EN 1492-2 (round slings) give the same colour for each working load limit. Our polyester round and webbing slings are made to it, and the colours below are the ones in their size tables.',
    },
    {
      type: 'comparison_table',
      caption: 'EN 1492 sling colour code — vertical WLL',
      columns: ['Colour', 'WLL, straight lift', 'WLL, choked'],
      rows: [
        { cells: ['Violet', '1 t', '0.8 t'] },
        { cells: ['Green', '2 t', '1.6 t'] },
        { cells: ['Yellow', '3 t', '2.4 t'] },
        { cells: ['Grey', '4 t', '3.2 t'] },
        { cells: ['Red', '5 t', '4.0 t'] },
        { cells: ['Brown', '6 t', '4.8 t'] },
        { cells: ['Blue', '8 t', '6.4 t'] },
        { cells: ['Orange', '10 t and over', '80% of the straight WLL'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'Orange covers everything from 10 t up — our orange round slings run from 10 t to 100 t — so above 10 t the colour tells you only that the sling is heavy-duty. The standard also reserves these colours for these ratings: a sling with any other WLL must not be made in them.',
    },
    {
      type: 'direct_answer',
      question: 'What does the colour of a lifting sling mean?',
      answer:
        'On a polyester webbing or round sling made to EN 1492, the colour shows its vertical working load limit: violet 1 t, green 2 t, yellow 3 t, grey 4 t, red 5 t, brown 6 t, blue 8 t and orange 10 t or more. US round slings use a different scale, so always confirm the rating on the sling’s label.',
    },

    { type: 'section_head', number: '/02', title: 'The label has its own colour code.', anchor: 'label-colour' },
    {
      type: 'paragraph',
      html: 'Under EN 1492 the colour of the <strong>label</strong> — the sewn-on tag that carries the sling’s details — tells you what the sling is made of. That matters because the fibres react differently to heat and chemicals.',
    },
    {
      type: 'comparison_table',
      caption: 'EN 1492 label colour by fibre',
      columns: ['Label colour', 'Fibre', 'Watch out for'],
      rows: [
        { cells: ['Blue', 'Polyester', 'Alkalis. Use from −40 °C to 100 °C.'], highlight: true },
        { cells: ['Green', 'Polyamide (nylon)', 'Mineral acids. Use from −40 °C to 100 °C.'] },
        { cells: ['Brown', 'Polypropylene', 'Solvents. Use from −40 °C to 80 °C.'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Green sling, green label: two different codes.',
      body: 'A green sling body means 2 t. A green label means polyamide. A polyester 2 t sling therefore has a green body and a blue label. Read the body colour for capacity and the label colour for material — and then read what is printed on the label.',
    },

    { type: 'section_head', number: '/03', title: 'US round slings use a different scale.', anchor: 'us-colours' },
    {
      type: 'paragraph',
      html: 'In the US, round sling colours follow a convention published by the Web Sling & Tie Down Association (WSTDA RS-1). It uses some of the same colours for quite different capacities, and adds colours that EN 1492 does not use at all.',
    },
    {
      type: 'comparison_table',
      caption: 'Same colour, different rating — EN 1492 against the US round-sling convention',
      columns: ['Colour', 'EN 1492', 'US round sling (WSTDA RS-1)'],
      rows: [
        { cells: ['Violet / purple', '1 t (2,205 lb)', '2,600 lb (1.18 t)'] },
        { cells: ['Green', '2 t (4,409 lb)', '5,300 lb (2.40 t)'], highlight: true },
        { cells: ['Yellow', '3 t (6,614 lb)', '8,400 lb (3.81 t)'] },
        { cells: ['Tan', 'Not used', '10,600 lb (4.81 t)'] },
        { cells: ['Red', '5 t (11,023 lb)', '13,200 lb (5.99 t)'] },
        { cells: ['White', 'Not used', '16,800 lb (7.62 t)'] },
        { cells: ['Blue', '8 t (17,637 lb)', '21,200 lb (9.62 t)'], highlight: true },
      ],
    },
    {
      type: 'paragraph',
      html: 'The US convention is not set by ASME B30.9, and the WSTDA table itself notes that colours and capacities may vary between manufacturers. So a blue sling could be 8 t, 21,200 lb or something else again. On a site that receives slings from more than one source, the only safe rule is to read every label.',
    },

    { type: 'section_head', number: '/04', title: 'The colour is the vertical rating.', anchor: 'hitches' },
    {
      type: 'paragraph',
      html: 'The colour gives the WLL for a straight, vertical lift. Every other way of rigging the sling has its own factor, set out in EN 1492:',
    },
    {
      type: 'comparison_table',
      caption: 'EN 1492 mode factors, and a yellow 3 t sling in each mode',
      columns: ['How the sling is used', 'Factor', 'Yellow 3 t sling'],
      rows: [
        { cells: ['Straight lift', '1.0', '3.0 t'] },
        { cells: ['Choked', '0.8', '2.4 t'] },
        { cells: ['Basket, legs parallel', '2.0', '6.0 t'] },
        { cells: ['Basket, legs 0°–45° from vertical', '1.4', '4.2 t'] },
        { cells: ['Basket, legs 45°–60° from vertical', '1.0', '3.0 t'] },
        { cells: ['Two slings, 0°–45° from vertical', '1.4', '4.2 t'] },
        { cells: ['Two slings, 45°–60° from vertical', '1.0', '3.0 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The angle factors come from the geometry in our <a href="/blog/sling-angle-chart">sling angle chart</a>. When choking, let the choke draw up naturally; never force it down against the load.',
    },

    { type: 'section_head', number: '/05', title: 'The label is the rating.', anchor: 'the-label' },
    {
      type: 'paragraph',
      html: 'Colour is a quick guide for picking up the right sling. The label is the record: it states the working load limit, the material, the length, the maker and a traceability code, and it is what an inspector checks against the certificate. Sling makers who use the colour code say so plainly — the colour is a guide, the label decides.',
    },
    {
      type: 'paragraph',
      html: 'That is why a sling whose label is missing or unreadable comes out of service, however obvious its colour looks. US regulations require every sling to carry legible identification, and the same rule runs through EN-based inspection practice and the UAE codes of practice — see our <a href="/blog/lifting-equipment-inspection-uae">guide to lifting inspection in the UAE</a>.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Sunlight fades both codes.',
      body: 'Synthetic slings stored in the open lose colour and strength to sunlight. A faded sling whose colour is hard to read, or whose label has bleached or worn away, has lost the information that tells you what it can carry. Store slings out of the sun, and withdraw any with an illegible label.',
    },
    {
      type: 'product_embed',
      heading: 'Colour-coded slings in this guide',
      skus: ['IH-LR-SY-PRSEE', 'IH-LR-SY-PRSE', 'IH-LR-SY-PWSE', 'IH-LR-SY-PFWSEE'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'What colour is a 1 tonne sling?',
          answer:
            'Violet under EN 1492. Under the US round-sling convention, purple is 2,600 lb, about 1.18 t — so check the label on any sling not made to EN 1492.',
        },
        {
          question: 'What colour is a 5 tonne sling?',
          answer: 'Red under EN 1492. A US round sling in red is rated 13,200 lb, about 6 t, under the WSTDA convention.',
        },
        {
          question: 'Why are all heavy slings orange?',
          answer:
            'EN 1492 uses orange for every sling of 10 t and above. Above 10 t the colour tells you only that the sling is heavy-duty; the rating must be read from the label.',
        },
        {
          question: 'What does a blue label on a sling mean?',
          answer:
            'Under EN 1492, a blue label means the sling is polyester. A green label means polyamide (nylon) and a brown label means polypropylene. The label colour shows material, not capacity.',
        },
        {
          question: 'Can I use a sling if the label has come off?',
          answer:
            'No. A sling without a legible label has no verifiable rating and must be taken out of service, even if its colour suggests a capacity.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'synthetic-slings',
      label: 'Synthetic slings',
      blurb: 'Polyester round and webbing slings made to EN 1492, colour-coded by WLL.',
    },
    {
      type: 'category_link',
      slug: 'lifting-slings',
      label: 'Lifting slings',
      blurb: 'Synthetic, wire rope and chain slings and fittings.',
    },
    {
      type: 'related_articles',
      slugs: ['types-of-lifting-slings', 'sling-angle-chart', 'working-load-limit-vs-breaking-strength', 'lifting-equipment-inspection-uae'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'EN 1492 colours and mode factors checked against EN 1492-1/-2 and a manufacturer’s EN 1492 user manual; US colours from WSTDA RS-1 (2001 edition) Table 1. Pound and tonne conversions ours. The label on the sling governs.',
    },
    {
      type: 'cta_block',
      heading: 'Need slings colour-coded to EN 1492?',
      body: 'Tell us the load, the hitch and the length. We will quote polyester round or webbing slings in the matching EN 1492 colour, each labelled and supplied with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
