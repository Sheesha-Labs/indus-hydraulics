import type { BlogArticleSeed } from '../shared'

/**
 * Snatch blocks vs pulley blocks — block load, sheave size, reeving.
 *
 * Sources checked 2026-10-01: Crosby General Catalog "Loads on Blocks",
 * "Sheave Size & Wireline Strength" and "How to Figure Line Parts" pages,
 * the McKissick snatch block manual and Kito Crosby blocks warnings (2025);
 * SafeWork NSW Dogging and Rigging Guide (sheave grooves). Our 418-pattern
 * snatch block rows supply the worked example.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'snatch-block-vs-pulley-block',
  title: 'Snatch block vs pulley block: what the block really carries, and how to size the sheave',
  excerpt:
    'A snatch block opens at the side so a rope can be dropped in without threading the end through. That is its whole difference from a pulley block — but either one can carry nearly twice the line pull, depending on the angle. Here is how to work out the block load, size the sheave and count the parts of line.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Snatch block vs pulley block: block load angle chart and sheave size',
  seoDescription:
    'Snatch block vs pulley block explained: the angle factor that sets the load on the block, sheave diameter to rope diameter, groove fit, reeving ratios and inspection.',
  focusKeyword: 'snatch block vs pulley block',
  publishedAt: '2026-10-01T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A snatch block has a side plate that opens, so the rope can be laid in from the side. A pulley block has to be threaded from the rope end.',
        'The load on a block is the line pull multiplied by an angle factor: 2.00 when the two lines run parallel, 1.41 at 90° between them, 1.00 at 120°.',
        'A small sheave weakens the rope. At a sheave-to-rope diameter ratio of 10 the rope keeps about 86% of its strength; at 4, about 75%.',
        'Each sheave loses some pull to friction — about 4% with bronze bushings and 2% with roller bearings.',
        'Snatch blocks are for infrequent, intermittent use at slow line speeds. Running rigging that works all day needs a block made for it.',
      ],
    },
    {
      type: 'lead',
      html: 'A block changes the direction of a rope, and that is all a single block does — it does not reduce the pull. What it does do, and what catches people out, is carry the pull from both sides of the sheave at once. A snatch block redirecting a 2-tonne winch line can be carrying almost 4 tonnes, and so can the shackle and the anchor point holding it.',
    },

    { type: 'section_head', number: '/01', title: 'Snatch block or pulley block.', anchor: 'definitions' },
    {
      type: 'comparison_table',
      caption: 'The two kinds of block',
      columns: ['Aspect', 'Snatch block', 'Pulley (closed) block'],
      rows: [
        { cells: ['How the rope goes in', 'Side plate opens; the rope is laid in from the side', 'Rope end must be threaded through'] },
        { cells: ['Typical use', 'Redirecting a winch or crane line at any point along it', 'Permanent reeving, tackles and purchases'] },
        { cells: ['Fittings', 'Hook, shackle, eye or tail board', 'Hook, eye, shackle or swivel'] },
        { cells: ['Duty', 'Infrequent, intermittent, slow line speeds', 'Matched to the block’s design'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The side opening is the snatch block’s advantage: you can place it on a line whose ends are already made off, or move it along the line to change the pull’s direction. The price is a hinged side plate and a hitch pin that must always be in place before the block is loaded.',
    },

    { type: 'section_head', number: '/02', title: 'What the block carries.', anchor: 'block-load' },
    {
      type: 'paragraph',
      html: 'Both lines leaving the sheave pull on the block. The total load on the block — and on whatever holds it — is the line pull multiplied by a factor that depends on the angle between the two lines:',
    },
    {
      type: 'comparison_table',
      caption: 'Load on the block as a multiple of line pull',
      columns: ['Angle between the lines', 'Factor', 'Block load at 2 t line pull'],
      rows: [
        { cells: ['0° (lines parallel)', '2.00', '4.00 t'], highlight: true },
        { cells: ['30°', '1.93', '3.86 t'] },
        { cells: ['60°', '1.73', '3.46 t'] },
        { cells: ['90°', '1.41', '2.82 t'] },
        { cells: ['120°', '1.00', '2.00 t'] },
        { cells: ['150°', '0.52', '1.04 t'] },
        { cells: ['180° (straight through)', '0.00', '0 t'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The block, its hook or shackle, and the anchor point must each be rated for the block load, not the line pull. A 2 t winch line turned back on itself through a snatch block needs a 4 t block and a 4 t anchor. The block’s WLL is stamped on it, and a block without a legible capacity tag should not be used.',
    },
    {
      type: 'direct_answer',
      question: 'How much load does a snatch block carry?',
      answer:
        'The line pull multiplied by an angle factor: 2.00 when the lead and load lines are parallel, 1.73 at 60° between them, 1.41 at 90° and 1.00 at 120°. A 2-tonne line pull turned back through a block puts 4 tonnes on the block and its anchor.',
    },

    { type: 'section_head', number: '/03', title: 'Sheave size and rope strength.', anchor: 'sheave-size' },
    {
      type: 'paragraph',
      html: 'A rope bent around a sheave loses strength, and the tighter the bend, the more it loses. The measure is the ratio of sheave diameter (D) to rope diameter (d):',
    },
    {
      type: 'comparison_table',
      caption: 'Rope strength kept at each D/d ratio (Crosby)',
      columns: ['D/d', 'Rope strength kept'],
      rows: [
        { cells: ['40', '95%'] },
        { cells: ['30', '93%'] },
        { cells: ['20', '91%'] },
        { cells: ['10', '86%'], highlight: true },
        { cells: ['8', '83%'] },
        { cells: ['4', '75%'] },
        { cells: ['1', '50%'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Snatch blocks run at low ratios. Our 418-pattern snatch block with a 4-1/2″ sheave takes 1/2″ rope — a D/d of 9, so the rope keeps roughly 84% of its strength over that sheave. That is acceptable for the intermittent, slow work snatch blocks are made for. A rope running over sheaves all day needs much larger ones: the same maker’s data puts bending life at a D/d of 30 at about 2.6 times that at 20, and about 9 times that at 12.',
    },
    {
      type: 'paragraph',
      html: '<strong>Match the groove to the rope.</strong> A groove too large lets the rope flatten; a groove too small pinches it and adds friction. The groove should be slightly larger than the rope’s nominal diameter, and a sheave whose groove has worn below its minimum radius, or become corrugated, must be replaced before new rope is reeved.',
    },

    { type: 'section_head', number: '/04', title: 'Reeving and friction.', anchor: 'reeving' },
    {
      type: 'paragraph',
      html: 'With several sheaves reeved between two blocks, the load is shared between the parts of line, but every sheave loses some pull to friction. The real ratio of load to line pull is therefore a little less than the number of parts:',
    },
    {
      type: 'comparison_table',
      caption: 'Load ÷ line pull, by parts of line (Crosby)',
      columns: ['Parts of line', 'Bronze bushings', 'Roller bearings'],
      rows: [
        { cells: ['1', '0.96', '0.98'] },
        { cells: ['2', '1.87', '1.94'] },
        { cells: ['4', '3.59', '3.81'] },
        { cells: ['6', '5.16', '5.60'] },
        { cells: ['8', '6.60', '7.32'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Block ratings assume every sheave is reeved. A block used with sheaves left empty must be derated in proportion.',
    },

    { type: 'section_head', number: '/05', title: 'Using and inspecting blocks.', anchor: 'use-inspection' },
    {
      type: 'prose',
      html: '<ul><li>Do not side-load a block; keep the rope in the plane of the sheave.</li><li>The hook must carry the load — a latch must never support it.</li><li>Keep the hitch pin in place; for long-term rigging use a bolt, nut and cotter.</li><li>Keep hands clear of the pinch point where the rope enters the sheave.</li><li>Remove from service: a sheave that wobbles or is out of line; cracked bushings, or bushings pushed out beyond the hub (a sign of overload); a hook or shackle with more than 10% wear or 5% deformation; side plates or pins with more than 5% wear.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing a block',
      intro: 'Start from how often the rope runs.',
      branches: [
        { condition: 'Redirecting a winch line now and then', outcome: 'Snatch block rated for the block load at your angle.' },
        { condition: 'A purchase or tackle that stays reeved', outcome: 'Pulley blocks with the sheaves and bearings for the duty.' },
        { condition: 'Rope runs constantly or at speed', outcome: 'Larger sheaves (higher D/d) on roller bearings.' },
        { condition: 'Fibre rope', outcome: 'A block made for fibre rope — wooden-shell or fibre-rope blocks with the right groove.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Blocks in this guide',
      skus: ['IH-LR-BP-418', 'IH-LR-BP-419', 'IH-LR-BP-404', 'IH-LR-BP-RBS', 'IH-LR-BP-MSBSS', 'IH-LR-BP-PB7011', 'IH-LR-BP-WSSB'],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Does a snatch block reduce the pull needed?',
          answer:
            'A single block only changes direction. Mechanical advantage comes from reeving several parts of line between two blocks, and friction takes a few percent at every sheave.',
        },
        {
          question: 'What size snatch block do I need?',
          answer:
            'One rated for the block load, not the line pull: the line pull times the angle factor. Lines parallel give 2.00, 90° between them gives 1.41. The block must also take your rope diameter.',
        },
        {
          question: 'Why does sheave size matter?',
          answer:
            'Because bending weakens wire rope and wears it out. At a sheave-to-rope ratio of 10 the rope keeps about 86% of its strength; at 20, about 91%, with several times the bending life.',
        },
        {
          question: 'Can I use a snatch block for continuous running rigging?',
          answer:
            'Snatch blocks are intended for infrequent, intermittent use at slow line speeds. Continuous running rigging needs blocks and sheaves designed for that duty.',
        },
      ],
    },
    {
      type: 'category_link',
      slug: 'snatch-blocks-pulleys',
      label: 'Snatch blocks and pulleys',
      blurb: 'Snatch blocks, steel and wooden pulley blocks, and sheaves, with WLL and rope size.',
    },
    {
      type: 'related_articles',
      slugs: ['wire-rope-construction-explained', 'types-of-shackles', 'chain-block-vs-lever-hoist-vs-electric-hoist', 'working-load-limit-vs-breaking-strength'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-01',
      note: 'Angle factors, D/d efficiencies and reeving ratios from The Crosby Group’s published block data; product figures from the linked size tables. The block maker’s instructions govern.',
    },
    {
      type: 'cta_block',
      heading: 'Need a block for a winch or tackle?',
      body: 'Send the line pull, the angle between the lines and the rope size. We will quote a block rated for the real block load, with the manufacturer’s certificate.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
