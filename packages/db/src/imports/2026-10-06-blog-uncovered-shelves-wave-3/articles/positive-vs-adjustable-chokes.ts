import { AUTHOR_SLUG, VERIFIED_ON } from '../shared'

import type { BlogArticleSeed } from '../shared'

/**
 * Positive and adjustable chokes and choke manifolds, read from the 12 choke
 * valve listings and the choke manifold listings: type, ends, ratings, bean
 * sizes, trim materials and staging. Trim designations are named only as the
 * listings name them; flow coefficients are not on the listings and are not
 * quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'positive-vs-adjustable-chokes',
  title: 'Positive and adjustable chokes: bean sizes, carbide trim and choke manifolds',
  excerpt:
    'A choke sets the flow from a well by forcing it through a small opening. How a positive choke differs from an adjustable one, how bean sizes in 64ths of an inch work, and why a dual-stage manifold pairs the two.',
  categorySlug: 'oilfield-pressure-control',
  authorSlug: AUTHOR_SLUG,
  publishedAt: '2026-10-06T02:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is the difference between a positive choke and an adjustable choke?',
      answer:
        'A positive choke has a fixed orifice — a bean — and the flow is changed by swapping the bean for another size. An adjustable choke has a stem and seat whose opening can be varied while the well flows. Positive chokes give a stable, repeatable rate; adjustable chokes give control while conditions change. Our 2" positive and adjustable chokes take beans up to 3/4", and the 3" adjustable chokes up to 2".',
    },
    {
      type: 'key_takeaways',
      items: [
        'Positive choke: fixed bean, changed by replacement. Adjustable choke: variable opening set while flowing.',
        'Bean sizes are quoted in 64ths of an inch: a 3/4" bean is a 48/64 choke.',
        'Our choke trims are tungsten carbide — beans and seats — because flow through a choke erodes everything it touches.',
        'Choke ratings follow the ends: 1502 chokes at 15,000 psi standard and 10,000 psi sour on our listings.',
        'Dual-stage manifolds pair a positive choke with an adjustable one, with beans from 1/16" to 1-1/2" per stage.',
      ],
    },
    {
      type: 'lead',
      html: 'Everything upstream of a choke is at well pressure; everything downstream is at whatever the choke allows. That single restriction sets the flow rate during a well test, a cleanup or a flowback, and <strong>it takes the full pressure drop across a gap the size of a pencil</strong>. The choice between a fixed and an adjustable opening, and the material of the trim, follow from that.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Fixed bean or variable opening.',
      anchor: 'types',
    },
    {
      type: 'comparison_table',
      caption: 'Chokes on our listings',
      columns: ['Property', 'Positive choke', 'Adjustable choke'],
      rows: [
        { cells: ['Opening', 'Fixed bean, replaced to change size', 'Stem and seat, adjusted while flowing'], highlight: true },
        { cells: ['Sizes listed', '2", up to a 3/4" bean', '2" up to a 3/4" bean; 3" up to a 2" bean'] },
        { cells: ['Ends and ratings', '1502 at 15,000 psi standard and 10,000 psi sour; 602 at 6,000 psi sour', '1502, 602 and 206 unions; 3-1/8" API 6A 5M flanged'] },
        { cells: ['Trim', 'Tungsten-carbide bean and seat, Inconel 625 stem', 'Tungsten-carbide bean and seat; Inconel 625 or 17-4PH stem'] },
        { cells: ['Best at', 'Steady, repeatable rate', 'Changing conditions, cleanup, bringing a well on'] },
      ],
    },

    {
      type: 'section_head',
      number: '/02',
      title: 'Bean sizes in 64ths.',
      anchor: 'beans',
    },
    {
      type: 'paragraph',
      html: 'Choke openings are named in sixty-fourths of an inch, so a well "on a 32" is flowing through a 32/64", or 1/2", bean. The convention makes small changes easy to state — moving from a 24/64 to a 28/64 bean is a modest increase in area that a fraction would describe awkwardly. Remember that flow follows the area of the opening, which rises with the square of the diameter: doubling the bean size roughly quadruples the opening.',
    },
    {
      type: 'comparison_table',
      caption: 'Common bean sizes',
      columns: ['Bean (inches)', 'Bean (64ths)'],
      rows: [
        { cells: ['1/16"', '4/64'] },
        { cells: ['1/4"', '16/64'] },
        { cells: ['1/2"', '32/64'] },
        { cells: ['3/4"', '48/64'], highlight: true },
        { cells: ['1"', '64/64'] },
        { cells: ['1-1/2"', '96/64'] },
      ],
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Carbide trim and erosion.',
      anchor: 'trim',
    },
    {
      type: 'paragraph',
      html: 'Fluid leaving a choke bean is moving very fast, and any sand or proppant in it cuts steel quickly. That is why every choke on our listings has a tungsten-carbide bean and seat, with an Inconel 625 or 17-4PH stem, and why beans are treated as consumables. A bean that has eroded oversize lets more flow through than its stamped size says, which shows up as a rate that creeps upward at a constant setting. Check and replace beans on a schedule, and carry spares in the sizes the programme calls for.',
    },

    {
      type: 'section_head',
      number: '/04',
      title: 'Choke manifolds.',
      anchor: 'manifolds',
    },
    {
      type: 'paragraph',
      html: 'A choke manifold mounts chokes with the valves and fittings around them so that flow can be routed, choked and isolated. Our single-stage manifolds come with 1502 union ends at 15,000 psi standard and 10,000 psi sour, with 602 ends at 6,000 psi sour, and with API 6BX flanges at 10,000 psi, beans from 1/16" up to 1" or 1-1/2". The dual-stage manifolds put a positive choke and an adjustable choke in series, each taking part of the pressure drop, with beans from 1/16" to 1-1/2" per stage — less erosion at each and finer control at the second.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Bleed down before changing a bean.',
      body: 'Changing a positive choke bean means opening the body. Isolate the choke on both sides, bleed it to zero, confirm there is no trapped pressure, and only then open it. A body that is opened under pressure can eject the cap and bean with lethal force.',
    },

    {
      type: 'section_head',
      number: '/05',
      title: 'Ordering.',
      anchor: 'ordering',
    },
    {
      type: 'paragraph',
      html: 'Give the choke type, size, end connections (union figure or flange), pressure and service, and the bean sizes you need, plus any instrument tap — two of our 15,000 psi chokes carry 9/16" Autoclave connections, and gauges on taps like these are isolated with needle, gauge or double block and bleed instrumentation valves. Union-ended chokes take the rating of their figure, explained in <a href="/blog/hammer-union-figure-numbers">hammer union figure numbers</a>, and choke manifolds are part of the layout described in <a href="/blog/flow-iron-explained">flow iron explained</a>.',
    },

    {
      type: 'faq_block',
      items: [
        {
          question: 'What does a 32/64 choke mean?',
          answer:
            'A choke bean with a 32/64" — half-inch — opening. Choke sizes are quoted in sixty-fourths of an inch.',
        },
        {
          question: 'Why are choke beans tungsten carbide?',
          answer:
            'Flow through a choke is fast and often carries sand, which erodes steel quickly. Tungsten carbide resists that wear far longer.',
        },
        {
          question: 'What is a dual-stage choke manifold?',
          answer:
            'A manifold with two chokes in series — on our listings a positive choke then an adjustable choke — so each takes part of the pressure drop.',
        },
        {
          question: 'What pressure are your 1502 chokes rated for?',
          answer:
            '15,000 psi for standard service and 10,000 psi for sour service.',
        },
      ],
    },

    {
      type: 'product_embed',
      heading: 'Chokes',
      skus: [
        'IH-OFV-CHOKE-POS-FC140-2-1502FM-15K-STD-SPM',
        'IH-OFV-CHOKE-POS-FC140-2-1502FM-10K-SOUR-SPM',
        'IH-OFV-CHOKE-ADJ-N60-5X7-2-1502FM-15K-STD-CAMERON',
        'IH-OFV-CHOKE-ADJ-H2-3-1502FM-15K-STD-FMC',
        'IH-OFV-CHOKE-ADJ-H2-3-1502FM-10K-SOUR-FMC',
        'IH-OFV-CHOKE-ADJ-H2-318-5M-FLG-5K-SOUR-STREAMFLO',
      ],
    },
    {
      type: 'product_embed',
      heading: 'Choke manifolds',
      skus: [
        'IH-FI-MN-CK-D-1502-15K-STD-FMC',
        'IH-FI-MN-CK-S-1502-15K-STD-CAMERON',
        'IH-FI-MN-CK-D-1502-10K-SOUR-FORUM',
        'IH-FI-MN-CK-API10K-FLG-NOV',
      ],
    },
    {
      type: 'category_link',
      slug: 'oilfield-choke-valves',
      label: 'Choke valves',
      blurb: 'Positive and adjustable chokes, union and flanged.',
    },
    {
      type: 'category_link',
      slug: 'flow-iron-manifolds',
      label: 'Manifolds',
      blurb: 'Single-stage and dual-stage choke manifolds.',
    },

    {
      type: 'cta_block',
      heading: 'Need chokes or beans?',
      body: 'Send the choke type, size, ends, pressure, service and bean sizes. We will quote chokes, spare beans and seats, or a complete manifold.',
      quoteLabel: 'Quote chokes',
    },
    {
      type: 'as_of_stamp',
      verifiedOn: VERIFIED_ON,
      note: 'Types, ends, ratings, bean sizes, trim materials and staging checked against our choke valve and choke manifold listings.',
    },
  ],
}

export default ARTICLE
