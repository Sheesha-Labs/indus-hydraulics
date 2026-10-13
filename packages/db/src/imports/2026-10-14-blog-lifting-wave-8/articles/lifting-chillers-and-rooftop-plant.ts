import type { BlogArticleSeed } from '../shared'

/**
 * Lifting chillers and rooftop plant. Checked 2026-10-14: equipment makers' rigging manuals
 * (spreader bars to keep slings off unit sides; lift only through designated points on the rigging
 * label; trapped water adds weight) — cited generically; WorkSafeBC §14.1 tandem lift >75% of any
 * crane's rating = critical lift and §14.42 written plan; ASME P30.1 standard vs critical lift plans
 * (secondary). Spreader beams: not in our range — said so.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lifting-chillers-and-rooftop-plant',
  title: 'Lifting chillers and rooftop plant: rigging HVAC and MEP equipment safely',
  excerpt:
    'Chillers, cooling towers, AHUs and generators are heavy, top-heavy, fragile and lifted onto roofs where there is no room for error. How MEP contractors rig them — designated lifting points, spreaders to keep slings off the casing, round slings and shackles, tandem lifts and lift plans — and how chain blocks and beam trolleys finish the job inside the plant room.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lifting Chillers and Rooftop Plant: MEP Rigging Guide',
  seoDescription:
    'How to rig chillers, cooling towers, AHUs and generators for rooftop lifts: maker lifting points, spreader bars, slings and shackles, trapped-water weight, tandem and critical lift plans, and chain blocks and beam trolleys in plant rooms.',
  focusKeyword: 'how to lift a chiller',
  publishedAt: '2026-10-14T10:15:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Lift only through the maker’s designated lifting points, as shown on the unit’s rigging label or manual.',
        'Makers call for spreader bars to keep slings clear of the casing and coils; a sling pulling inward can crush a unit worth more than the lift.',
        'Allow for weight you cannot see: trapped water, packing and accessories.',
        'Rooftop lifts near capacity, over occupied buildings or with two cranes are critical lifts — plan them in writing.',
        'Inside the plant room, chain blocks on beam trolleys move units to their final position.',
      ],
    },
    {
      type: 'lead',
      html: 'MEP packages put some of the most expensive single items on a project onto its roof: chillers, cooling towers, air-handling units, generators, transformers. They are heavy for their footprint, often top-heavy, made of thin casings and coils that crush easily, and lifted over a building that may already be occupied. A good lift starts with the maker’s rigging instructions and ends with the unit landed square on its plinth without a mark. This guide covers the rigging.',
    },

    { type: 'section_head', number: '/01', title: 'Start with the maker’s rigging instructions.', anchor: 'maker' },
    {
      type: 'prose',
      html: '<ul><li><strong>Lifting points</strong> — use only the holes, lugs or base-frame points the maker designates, shown on the unit’s rigging label or in its manual.</li><li><strong>Spreader</strong> — chiller and cooling-tower makers call for spreader bars so slings hang clear of the casing, and some give a minimum spreader length and hook height for each model.</li><li><strong>Weight and centre of gravity</strong> — from the nameplate or submittal, plus anything added: packing, accessories, and water or debris trapped in the unit.</li><li><strong>Restrictions</strong> — some units must not be moved by forklift or lifted from certain points; read the manual before the crane arrives.</li></ul>',
    },
    {
      type: 'direct_answer',
      question: 'How do you lift a chiller onto a roof?',
      answer:
        'With a crane sized for the weight and radius, rigged through the maker’s designated lifting points with a spreader bar so the slings hang clear of the casing, using rated slings and shackles, tag lines to control rotation, and a written lift plan — treating it as a critical lift if it is near capacity, over an occupied building or uses two cranes.',
    },

    { type: 'section_head', number: '/02', title: 'The rigging below the hook.', anchor: 'rigging' },
    {
      type: 'comparison_table',
      caption: 'Typical rooftop plant rigging',
      columns: ['Component', 'Role'],
      rows: [
        { cells: ['Spreader bar or frame', 'Holds sling legs vertical and clear of the casing (supplied by the rigging contractor)'] },
        { cells: ['Round or webbing slings', 'Gentle on finished frames; protect from edges'], highlight: true },
        { cells: ['Anchor shackles', 'Connect slings to unit lugs and spreader; bolt type if left in place'] },
        { cells: ['Master link or top rigging', 'Connects the spreader to the crane hook'] },
        { cells: ['Tag lines', 'Control rotation over the roof edge and onto the plinth'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Our range does not include spreader beams, but covers the rest: <a href="/p/polyester-round-sling-endless">round slings</a>, <a href="/p/polyester-flat-webbing-sling-eye-and-eye">webbing slings</a>, <a href="/p/screw-pin-anchor-shackle-g-209-pattern">anchor shackles</a> and master links. Size each sling leg for the load it actually carries at the angle it hangs — see the <a href="/blog/webbing-and-round-sling-capacity-chart">webbing and round sling capacity chart</a> and <a href="/blog/how-to-rig-a-shackle-correctly">how to rig a shackle correctly</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Critical lifts and tandem lifts.', anchor: 'critical' },
    {
      type: 'paragraph',
      html: 'Rooftop lifts are often critical lifts: heavy, near the crane’s limits, over occupied buildings or streets, or using two cranes. Lift-planning practice — such as ASME P30.1 — separates standard lifts from critical ones, which need a more detailed written plan. For tandem lifts, the British Columbia regulation, for example, treats any lift where one crane carries more than 75% of its rated capacity as a critical lift and requires a written plan on site for every tandem lift. Whatever your local rule, plan these lifts in writing, with the rigging drawn out.',
    },

    { type: 'section_head', number: '/04', title: 'Inside the plant room.', anchor: 'plant-room' },
    {
      type: 'paragraph',
      html: 'Once on the roof, units often move the last few metres — or go into a plant room — on rollers, chain blocks and beam trolleys. A <a href="/p/manual-chain-block-type-a">manual chain block</a> hung from a <a href="/p/geared-beam-trolley-type-b">geared beam trolley</a> on a rated runway beam gives fine control for positioning; a <a href="/p/lever-hoist-type-va">lever hoist</a> pulls and tensions sideways. Check that the beam is designed as a lifting beam and rated for the load. See <a href="/blog/chain-block-vs-lever-hoist-vs-electric-hoist">chain block vs lever hoist vs electric hoist</a>.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Never improvise lifting points.',
      body: 'Do not choke a sling round a unit’s frame or pipework, or lift from points the maker has not designated. If the designated points cannot be used, ask the maker or a lifting engineer before the lift.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why use a spreader bar to lift a chiller?', answer: 'To keep the slings vertical and clear of the casing and coils. Makers specify spreaders because slings pulling inward can crush the unit.' },
        { question: 'Where do you attach slings to a chiller?', answer: 'Only at the maker’s designated lifting points shown on the rigging label or manual.' },
        { question: 'Is a rooftop chiller lift a critical lift?', answer: 'Often — if it is near the crane’s capacity, over an occupied building, or uses two cranes. Plan it in writing.' },
        { question: 'How do I move a unit inside a plant room?', answer: 'With a chain block on a beam trolley on a rated runway beam, or a lever hoist for pulling, plus rollers.' },
        { question: 'Do you supply spreader beams?', answer: 'Not in our standard range; we supply the slings, shackles, master links, chain blocks and trolleys used with them.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'For plant lifts',
      skus: ['IH-LR-SY-PRSE', 'IH-LR-SY-PFWSEE', 'IH-LR-SH-G209', 'IH-LR-SH-G2130', 'IH-LR-G8-MLA', 'IH-LR-CB-A', 'IH-LR-BT-GB', 'IH-LR-CB-LVA'],
    },
    {
      type: 'category_link',
      slug: 'hoists-blocks-clamps',
      label: 'Hoists, blocks and clamps',
      blurb: 'Chain blocks, lever hoists, beam trolleys and lifting clamps.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'construction',
      label: 'Construction',
      blurb: 'Lifting, rigging and plant supply for contractors.',
    },
    {
      type: 'page_link',
      kind: 'industry',
      slug: 'power',
      label: 'Power and energy',
      blurb: 'Plant and equipment supply for power and utilities.',
    },
    {
      type: 'related_articles',
      slugs: ['chain-block-vs-lever-hoist-vs-electric-hoist', 'webbing-and-round-sling-capacity-chart', 'how-to-rig-a-shackle-correctly', 'site-mobilisation-rigging-kit', 'sling-angle-chart'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-14',
      note: 'Equipment makers’ published rigging manuals; British Columbia crane regulation Part 14 on tandem and critical lifts; ASME P30.1 lift planning as described in industry sources. The unit maker’s instructions govern.',
    },
    {
      type: 'cta_block',
      heading: 'Planning a plant lift?',
      body: 'Send the unit weights, lifting points and rigging arrangement. We will quote slings, shackles, links, chain blocks and trolleys with certificates.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
