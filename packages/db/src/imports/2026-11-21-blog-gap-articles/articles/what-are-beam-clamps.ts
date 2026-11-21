import type { BlogArticleSeed } from '../shared'

/**
 * What beam clamps are. Figures from the live lifting-beam-clamps listings: the lifting beam clamp in
 * 1, 2, 3, 5 and 10 t with flange width ranges 75–220 mm (1 and 2 t), 80–220 mm (3 and 5 t) and
 * 90–320 mm (10 t); plate clamps for comparison — horizontal plate clamp 0.75–5 t with proof load
 * twice WLL on the listing, vertical CDH 1–8 t per pair, TMS 1–10 t, PPD to 30 t per pair. Plate clamps
 * fall under ASME B30.20 (below-the-hook devices) and EN 13155 (non-fixed load lifting attachments).
 * Flange thickness limits are on the listing drawing but not labelled in the data, so not quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'what-are-beam-clamps',
  title: 'What are beam clamps? Lifting points on steel beams, and how to size one',
  excerpt:
    'A beam clamp grips the bottom flange of a steel I-beam or H-beam and gives you a fixed lifting point for a chain block or hoist, with no welding or drilling. Here is how they work, how to size one to the flange, and how they differ from plate clamps and trolleys.',
  categorySlug: 'lifting-rigging',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'What Are Beam Clamps? Types, Sizing and Uses',
  seoDescription:
    'What beam clamps are: a fixed lifting point on an I-beam flange. Sizing to flange width, WLL, beam clamp vs trolley, and plate lifting clamps compared.',
  focusKeyword: 'what are beam clamps',
  publishedAt: '2026-11-21T09:30:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are beam clamps?',
      answer:
        'A lifting beam clamp is a clamp that grips the bottom flange of a steel I-beam or H-beam and provides a fixed anchor point, usually a shackle or eye, for hanging a chain block, lever hoist or electric hoist. It fits without welding or drilling, adjusts to a range of flange widths and is rated with a working load limit.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A beam clamp is a fixed lifting point on a steel beam. It does not move along the beam; a beam trolley does.',
        'Size it by two things: the WLL you need and the flange width of the beam. Our lifting beam clamp covers 75–220 mm flanges at 1 t and 2 t, 80–220 mm at 3 t and 5 t, and 90–320 mm at 10 t.',
        'Load it vertically, below the centre of the beam. Side pulls and angled loads are outside what a standard beam clamp is rated for unless the maker says otherwise.',
        'The beam itself must be able to carry the load. That is a structural check by a competent person, not something the clamp’s rating covers.',
        'A plate lifting clamp is a different tool: it grips a steel plate to lift the plate itself.',
      ],
    },
    {
      type: 'lead',
      html: 'On a plant room ceiling, a pipe rack or a steel frame there is often a beam exactly where you need a lifting point, and nothing on it to hang a hoist from. A beam clamp solves that. It clamps onto the beam’s lower flange, gives you a rated attachment point and comes off again when the job is done. This guide explains what beam clamps are, how they differ from the other <a href="/c/lifting-beam-clamps">lifting and beam clamps</a> on our shelf, and how to choose one.',
    },

    { type: 'section_head', number: '/01', title: 'How a beam clamp works.', anchor: 'how' },
    {
      type: 'paragraph',
      html: 'A lifting beam clamp has two jaws that hook over the edges of the bottom flange. A threaded spindle draws the jaws together until they grip the flange, and a shackle or eye between them hangs directly under the centre of the beam. The hoist hook goes into that shackle. Because the jaws sit over the top of the flange, the load pulls the clamp down onto the beam rather than relying on friction. Our <a href="/p/lifting-beam-clamp">lifting beam clamp</a> works this way, in five sizes from 1 t to 10 t.',
    },
    {
      type: 'paragraph',
      html: 'Typical uses are maintenance lifts on pumps and motors under a plant room beam, pulling equipment into position during installation, and temporary lifting points during steel erection and shutdowns. See <a href="/blog/shutdown-and-turnaround-rigging">rigging for plant shutdowns and turnarounds</a> and <a href="/blog/steel-erection-rigging-equipment">steel erection rigging equipment</a> for how they fit into a kit.',
    },

    { type: 'section_head', number: '/02', title: 'Sizing a beam clamp to the beam.', anchor: 'sizing' },
    {
      type: 'paragraph',
      html: 'Measure the bottom flange width of the beam, check its thickness, and choose a clamp whose WLL is at least the load plus the weight of the hoist and rigging hanging from it. The flange width must fall within the clamp’s adjustment range; a beam at the edge of the range should be checked against the drawing on the listing.',
    },
    {
      type: 'comparison_table',
      caption: 'Lifting beam clamp: capacity and flange width range (from our listing)',
      columns: ['Capacity', 'Flange width range'],
      rows: [
        { cells: ['1 t', '75–220 mm'] },
        { cells: ['2 t', '75–220 mm'] },
        { cells: ['3 t', '80–220 mm'] },
        { cells: ['5 t', '80–220 mm'] },
        { cells: ['10 t', '90–320 mm'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The clamp’s rating is not the beam’s rating.',
      body: 'A 5 t beam clamp on a beam that can only carry 2 t is a 2 t lifting point at best. Before using a building or pipe-rack beam as a lifting point, a competent person must confirm the beam, its connections and the structure can take the load. Never exceed the WLL of the clamp or of the hoist hanging from it.',
    },

    { type: 'section_head', number: '/03', title: 'Beam clamp vs beam trolley.', anchor: 'vs-trolley' },
    {
      type: 'paragraph',
      html: 'Both hang a hoist from a beam flange. A beam clamp is fixed: once tightened, the load can only go straight up and down. A beam trolley runs on wheels along the flange, so the load can be moved along the beam, pushed by hand or driven by a geared chain wheel. Choose a clamp for a lift at one point, a trolley when the load has to travel. Trolley sizing is covered in <a href="/blog/beam-trolley-guide">beam trolleys: push or geared</a>.',
    },
    {
      type: 'comparison_table',
      caption: 'Beam clamp, beam trolley and plate clamp',
      columns: ['Device', 'What it does', 'Use it for'],
      rows: [
        { cells: ['Beam clamp', 'Fixed anchor point on a beam flange', 'Hanging a hoist at one point'], highlight: true },
        { cells: ['Beam trolley', 'Runs along the beam flange', 'Moving a load along the beam'] },
        { cells: ['Plate lifting clamp', 'Grips a steel plate or section', 'Lifting the plate or section itself'] },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Plate lifting clamps: the other kind of clamp.', anchor: 'plate-clamps' },
    {
      type: 'paragraph',
      html: 'A plate lifting clamp hangs from the hook and grips the load, rather than the structure. Vertical clamps such as the <a href="/p/vertical-plate-lifting-clamp-type-cdh">Type CDH vertical plate clamp</a> (1 t to 8 t per pair) use a toothed cam that tightens as the load comes on, for lifting or turning plate on edge. Horizontal clamps such as the <a href="/p/horizontal-plate-lifting-clamp">horizontal plate lifting clamp</a> (0.75 t to 5 t, proof tested to twice WLL on the listing) are used in pairs or sets with a sling to lift plate lying flat. There are also clamps for steel sections, such as the <a href="/p/horizontal-lifting-clamp-for-steel-sections-type-lc">Type LC section clamp</a>. Plate clamps are below-the-hook devices under ASME B30.20 and load lifting attachments under EN 13155.',
    },
    {
      type: 'paragraph',
      html: 'Each plate clamp has a jaw opening range, and the plate must sit inside it. When to use vertical or horizontal clamps, and why horizontal clamps are rated per pair, is in <a href="/blog/vertical-vs-horizontal-plate-lifting-clamps">vertical and horizontal plate lifting clamps</a>.',
    },
    {
      type: 'paragraph',
      html: 'A note on search terms: "beam clamps 3/8" or "beam clamps for unistrut" usually means the small clamps tapped for threaded rod that hang pipe, cable tray and channel from steelwork. Those are support fittings, not lifting equipment, and must not be used to lift.',
    },

    { type: 'section_head', number: '/05', title: 'Using and inspecting a beam clamp.', anchor: 'use' },
    {
      type: 'prose',
      html: '<ul><li>Check the clamp’s WLL, the flange width and the beam’s capacity before fitting.</li><li>Fit the jaws fully over both flange edges and tighten the spindle as the instructions require, with the shackle centred under the beam.</li><li>Keep the load vertical; do not drag loads sideways from a beam clamp.</li><li>Do not stack clamps or hang one from another.</li><li>Check before each use for cracked or bent jaws, a damaged spindle thread and a worn shackle. A competent person carries out the periodic thorough examination at the interval the local rules set; in the UAE see <a href="/blog/lifting-equipment-inspection-uae">lifting equipment inspection in the UAE</a>.</li></ul>',
    },

    { type: 'section_head', number: '/06', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<ul><li>The load weight, plus the hoist and rigging.</li><li>The beam size, or its flange width and thickness.</li><li>Whether the load stays at one point or must travel along the beam.</li><li>For plate clamps: plate thickness, size and whether it is lifted flat or vertical.</li></ul><p>We quote and ship <a href="/c/lifting-beam-clamps">lifting and beam clamps</a> from Dubai, UAE, with the manufacturer’s test certificate.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can beam clamps be used for lifting?', answer: 'Lifting beam clamps are made for it and carry a WLL. Small threaded-rod beam clamps for pipe and channel supports are not lifting equipment and must never be used to lift.' },
        { question: 'How do I size a beam clamp?', answer: 'Choose a WLL at least equal to the load plus the hoist and rigging, and make sure the beam’s flange width is inside the clamp’s range. The beam itself must also be checked for the load.' },
        { question: 'What is the difference between a beam clamp and a beam trolley?', answer: 'A beam clamp is fixed in one place on the beam. A trolley runs along the flange so the load can be moved.' },
        { question: 'What types of lifting clamps are there?', answer: 'Beam clamps, which anchor to a beam, and plate clamps, which grip the load: vertical plate clamps, horizontal plate clamps used in pairs, universal clamps and clamps for steel sections.' },
        { question: 'Is a plate lifting clamp rated per clamp or per pair?', answer: 'Vertical clamps are usually rated per clamp; many horizontal clamps are rated per pair. Read the listing and the marking on the clamp.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Beam and plate clamps',
      skus: ['IH-LR-LC-BEAM', 'IH-LR-LC-CDH', 'IH-LR-LC-HOR', 'IH-LR-LC-LC', 'IH-LR-LC-PPD'],
    },
    { type: 'category_link', slug: 'lifting-beam-clamps', label: 'Lifting and beam clamps', blurb: 'Lifting beam clamps from 1 t to 10 t, with vertical, horizontal and section plate clamps.' },
    {
      type: 'related_articles',
      slugs: ['beam-trolley-guide', 'vertical-vs-horizontal-plate-lifting-clamps', 'chain-block-vs-lever-hoist-vs-electric-hoist', 'shutdown-and-turnaround-rigging'],
    },
    {
      type: 'cta_block',
      heading: 'Need a lifting point on a beam?',
      body: 'Send the load and the beam size. We will match the beam clamp, or a trolley if the load needs to move, and quote it with the hoist if you need one.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
