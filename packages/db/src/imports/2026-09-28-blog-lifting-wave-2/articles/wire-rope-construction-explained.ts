import type { BlogArticleSeed } from '../shared'

/**
 * Wire rope construction — reading 6x19, 6x36, 6x37, IWRC and fibre core.
 *
 * The 12 mm / 1770 N/mm² comparison is read from the live variants on
 * 2026-09-28. The finding the article is built around is visible in our own
 * data: at the same diameter and grade, the common six-strand constructions
 * sit within about 12% of each other on breaking load. Construction mostly
 * trades flexibility against abrasion and crush resistance; a steel core adds
 * about 8% and compaction about 17%.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'wire-rope-construction-explained',
  title: 'Wire rope construction explained: 6x19 vs 6x36 vs 6x37, and IWRC vs fibre core',
  excerpt:
    'A wire rope designation such as 6x36WS-IWRC 1770 B sZ tells you almost everything about how the rope will behave. The surprise is how little the construction changes its strength: at 12 mm, the common six-strand ropes break within about 12% of each other. What changes is flexibility, abrasion resistance and crush resistance.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: '6x19 vs 6x36 wire rope: construction, core and designation explained',
  seoDescription:
    'How to read a wire rope designation, the difference between 6x19, 6x36 and 6x37 wire rope, IWRC versus fibre core, and how to choose a construction for the job.',
  focusKeyword: '6x19 vs 6x36 wire rope',
  publishedAt: '2026-09-28T12:05:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        '“6x19” means six strands of about 19 wires each. The first number is strands, the second is wires per strand.',
        'Fewer, larger wires resist abrasion and crushing. More, smaller wires bend more easily and last longer over sheaves.',
        'At the same diameter and tensile grade, construction changes breaking load less than people expect: 75 to 85 kN across five common six-strand constructions at 12 mm with a fibre core, in our tables.',
        'An independent wire rope core (IWRC) adds about 8% strength and resists crushing on a drum. A fibre core is more flexible and holds lubricant.',
        'Line-contact constructions — Seale, Warrington, Filler — are stronger and more fatigue-resistant than older point-contact 6x19 and 6x37.',
      ],
    },
    {
      type: 'lead',
      html: 'A wire rope is ordered by diameter, but it is chosen by construction. Two ropes of the same diameter can have almost the same breaking load and behave completely differently — one lasting years on a crane drum, the other flattening in a month. The designation printed on the reel tells you which is which, once you know how to read it.',
    },

    { type: 'section_head', number: '/01', title: 'Reading the designation.', anchor: 'designation' },
    {
      type: 'paragraph',
      html: 'Take a full designation such as <strong>16 mm 6x36WS-IWRC 1770 B sZ</strong>. Read left to right, it gives the diameter, the construction, the core, the tensile grade, the finish and the lay.',
    },
    {
      type: 'comparison_table',
      caption: 'Reading 16 mm 6x36WS-IWRC 1770 B sZ',
      columns: ['Part', 'Means'],
      rows: [
        { cells: ['16 mm', 'Nominal diameter, measured across the crowns of the strands'] },
        { cells: ['6x36', 'Six strands, 36 wires in each strand'] },
        { cells: ['WS', 'Warrington-Seale strand pattern — the way the wires are laid within the strand'] },
        { cells: ['IWRC', 'Independent wire rope core — a small wire rope at the centre'] },
        { cells: ['1770', 'Tensile grade of the wire, in N/mm²'] },
        { cells: ['B', 'Galvanised, zinc class B (U means ungalvanised, bright)'] },
        { cells: ['sZ', 'Right-hand regular lay — the wires and the strands are laid in opposite directions'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Two ropes that differ only in tensile grade differ only in strength: our 16 mm 6x36WS breaks at 150 kN in 1770 grade with a fibre core and at 132.6 kN in 1570. Everything else in the designation changes how the rope handles.',
    },

    { type: 'section_head', number: '/02', title: 'Strands and wires: the trade-off.', anchor: 'the-trade-off' },
    {
      type: 'paragraph',
      html: 'Every construction sits somewhere on one trade-off. <strong>Large outer wires</strong> have more metal to wear away and resist crushing, but they are stiff and fatigue quickly when bent over a sheave. <strong>Many small wires</strong> bend easily and survive thousands of cycles over sheaves, but each wire has little metal to lose to abrasion.',
    },
    {
      type: 'comparison_table',
      caption: 'Breaking load at 12 mm, 1770 N/mm², from our tables',
      columns: ['Construction', 'Fibre core', 'IWRC', 'Character'],
      rows: [
        { cells: ['6x7', '84.6 kN', '91.5 kN', 'Few large wires. Abrasion-resistant and stiff'] },
        { cells: ['6x19 (point contact)', '78.2 kN', '84.6 kN', 'The traditional general-purpose rope'] },
        { cells: ['6x19S / 6x19W (line contact)', '84.1 kN', '90.7 kN', 'Stronger and more fatigue-resistant than point-contact 6x19'], highlight: true },
        { cells: ['6x36WS', '84.1 kN', '90.7 kN', 'Flexible. The usual choice for cranes, hoists and slings'], highlight: true },
        { cells: ['6x37 (point contact)', '75.2 kN', '81.3 kN', 'Very flexible, lowest strength of the six'] },
        { cells: ['6x12+7FC', '53.3 kN', '—', 'Fibre centres in every strand. Very flexible, for mooring and marine use'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Across the first five rows, fibre-core breaking load at 12 mm moves only between 75 and 85 kN. Swapping the fibre core for steel adds about 8% — most of that spread again. Construction is chosen for how the rope has to work; the diameter and grade are then chosen for the load.',
    },
    {
      type: 'direct_answer',
      question: 'What is the difference between 6x19 and 6x36 wire rope?',
      answer:
        'Both have six strands. 6x19 has about 19 wires per strand, so its wires are larger: it resists abrasion and crushing better but is stiffer. 6x36 has 36 smaller wires per strand, so it is more flexible and lasts longer running over sheaves and drums. At the same diameter and grade the line-contact versions have almost the same breaking load.',
    },

    { type: 'section_head', number: '/03', title: '“6x19 class” and “6x37 class”.', anchor: 'rope-classes' },
    {
      type: 'paragraph',
      html: 'Catalogues use the numbers two ways, and it causes real confusion. Strictly, <strong>6x19</strong> and <strong>6x37</strong> are specific older <em>point-contact</em> constructions, in which the wires in each layer cross the wires beneath them. In US usage, “6x19 class” and “6x37 class” are also <em>families</em>: the 6x19 class covers ropes with roughly 16 to 26 wires per strand, including 6x19S Seale and 6x26WS, and the 6x37 class covers roughly 27 to 49, including 6x36WS.',
    },
    {
      type: 'paragraph',
      html: 'So a specification that says “6x37 class” is usually satisfied by 6x36WS, and a quotation for “6x37” may mean either. When it matters, ask for the full construction.',
    },
    {
      type: 'paragraph',
      html: '<strong>Point contact versus line contact.</strong> In a point-contact strand, each layer of wires is laid at a different angle, so the wires touch at points and notch each other under load. In a line-contact strand — Seale (S), Warrington (W), Filler (F) and Warrington-Seale (WS) — the wires are sized so that each layer nests in the layer below along its full length. Line-contact ropes are stronger at the same diameter and last longer in bending, which is why they have replaced point-contact ropes for most lifting work.',
    },

    { type: 'section_head', number: '/04', title: 'Fibre core or steel core.', anchor: 'core' },
    {
      type: 'comparison_table',
      caption: 'Fibre core against independent wire rope core',
      columns: ['Property', 'Fibre core (FC)', 'IWRC'],
      rows: [
        { cells: ['Strength', 'Base', 'About 8% higher at the same size'] },
        { cells: ['Crush resistance on a drum', 'Lower — the core compresses', 'Higher'] },
        { cells: ['Flexibility', 'Higher', 'Lower'] },
        { cells: ['Heat', 'Fibre degrades at high temperature', 'Tolerates heat'] },
        { cells: ['Lubrication', 'Core holds lubricant', 'Needs relubrication in service'] },
        { cells: ['Typical use', 'Slings, general rigging, light hoisting', 'Cranes, winches, multi-layer drums, heavy slings'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Where a rope spools in several layers on a drum, the layers above press down on the rope below. A fibre core lets the rope flatten and the strands bite into each other. That is the usual reason cranes and winches specify IWRC.',
    },

    { type: 'section_head', number: '/05', title: 'Compacted, strand and other ropes.', anchor: 'other-ropes' },
    {
      type: 'prose',
      html: '<ul><li><strong>Compacted strand ropes</strong> have their strands drawn through a die to flatten the outer wires. More steel fits in the same diameter and the smooth surface resists wear: our compacted 6x19S at 12 mm breaks at 10 t (about 98 kN) against 84.1 kN for the standard rope.</li><li><strong>8-strand ropes</strong> such as 8x19S are more flexible and rounder in section. They run well over small sheaves, at some cost in strength.</li><li><strong>Spiral strand</strong> — 1x7, 1x19, 1x37 — is a single strand, not a rope. It is strong and stiff and it stretches little, so it is used for standing rigging, stays and guys. It must not run over sheaves.</li><li><strong>Stainless steel rope</strong> is chosen for corrosion resistance in marine and architectural work. Check its breaking load separately rather than assuming it matches galvanised rope of the same size.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'Bending, sheaves and slings.', anchor: 'bending' },
    {
      type: 'paragraph',
      html: 'Wire rope loses strength when it is bent. Wrap a rope around a pin of its own diameter and it keeps roughly half its breaking load; the larger the ratio of sheave or pin diameter (D) to rope diameter (d), the more it keeps. This is why sheaves are sized to the rope, why wide-body shackles exist for wire rope slings, and why a sling rated in a vertical hitch is rated lower when choked around a small load.',
    },
    {
      type: 'paragraph',
      html: 'The rope’s breaking load is also not the sling’s WLL. A wire rope sling is rated from the breaking load of the rope, the efficiency of its end terminations and a design factor of 5:1. Our <a href="/blog/working-load-limit-vs-breaking-strength">guide to working load limit</a> covers the arithmetic.',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a construction',
      intro: 'Start from how the rope will be worked.',
      branches: [
        { condition: 'Running over sheaves or onto a drum, many cycles', outcome: '6x36WS, line contact.', detail: 'IWRC if it spools in several layers or works hot.' },
        { condition: 'Dragging over the ground or rubbing against structure', outcome: '6x19S or 6x7: larger outer wires to wear through.' },
        { condition: 'General-purpose slings', outcome: '6x19 or 6x36 class, fibre core or IWRC to suit the load and handling.' },
        { condition: 'Highest strength in a given diameter', outcome: 'Compacted strand rope with IWRC.' },
        { condition: 'Stays, guys and standing rigging', outcome: 'Spiral strand — 1x19 or 1x37 — never run over a sheave.' },
        { condition: 'Mooring and marine handling where flexibility matters most', outcome: '6x12+7FC, with fibre centres in the strands.' },
      ],
    },
    {
      type: 'standard_citation',
      standard: 'ISO 4309',
      publisher: 'ISO',
      title: 'Cranes — Wire ropes — Care and maintenance, inspection and discard',
      summary:
        'Sets out how wire ropes on cranes are inspected in service and when they must be discarded, on criteria that include broken wires counted over a stated length, reduction in diameter, corrosion, and deformation such as kinks, birdcaging and core protrusion.',
    },
    {
      type: 'product_embed',
      heading: 'The ropes in this guide',
      skus: [
        'IH-LR-WR-6X19',
        'IH-LR-WR-6X19SW',
        'IH-LR-WR-6X36WSWR',
        'IH-LR-WR-6X37',
        'IH-LR-WR-6X7',
        'IH-LR-WR-CWR6X19S',
        'IH-LR-WR-8X19SWR',
        'IH-LR-WR-1X37WSG',
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is 6x36 stronger than 6x19?',
          answer:
            'Not meaningfully. At 12 mm and 1770 N/mm² our 6x36WS and 6x19S line-contact ropes have the same breaking load, 84.1 kN with a fibre core. 6x36 is more flexible; 6x19 resists abrasion and crushing better. Choose between them on how the rope will be worked.',
        },
        {
          question: 'What does IWRC stand for?',
          answer:
            'Independent wire rope core: a small wire rope at the centre, in place of a fibre core. It adds about 8% strength and resists crushing on a drum, at some cost in flexibility.',
        },
        {
          question: 'How do I measure wire rope diameter?',
          answer:
            'Across the crowns of the strands, at the widest point, with a caliper wide enough to span two strands. Measuring across the flats reads undersize. A new rope normally measures slightly over its nominal diameter.',
        },
        {
          question: 'What do sZ and zZ mean?',
          answer:
            'They describe the lay. sZ is right-hand regular lay: wires and strands laid in opposite directions, which handles well and resists crushing. zZ is right-hand Lang’s lay: both laid the same way, which wears more evenly but must be restrained from untwisting under load.',
        },
        {
          question: 'When should a wire rope sling be taken out of service?',
          answer:
            'Under ASME B30.9, a single-part wire rope sling is removed when it has 10 randomly distributed broken wires in one rope lay, or five broken wires in one strand in one lay. It is also removed for kinking, crushing, birdcaging, heat damage, severe corrosion or damaged end fittings, and when its tag is missing.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'steel-wire-rope',
      label: 'Steel wire rope',
      blurb: 'Every construction in this guide, with breaking loads by tensile grade and core.',
    },
    {
      type: 'category_link',
      slug: 'wire-rope-slings',
      label: 'Wire rope slings',
      blurb: 'Single-leg, multi-leg, endless and Flemish-eye slings, rated by hitch and angle.',
    },
    {
      type: 'category_link',
      slug: 'wire-rope-clips',
      label: 'Wire rope clips',
      blurb: 'Drop-forged and malleable clips for terminating wire rope.',
    },
    {
      type: 'related_articles',
      slugs: ['wire-rope-clips-installation', 'working-load-limit-vs-breaking-strength', 'sling-angle-chart', 'chain-grades-explained'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-09-28',
      note: 'Breaking loads are taken from the size tables on the linked product pages, at 1770 N/mm² unless stated. They are minimum breaking loads for the rope, not working load limits.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a rope?',
      body: 'Send the designation from the old reel or tag, or the diameter, construction and the machine it runs on. We will quote a matching rope cut to length, with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
