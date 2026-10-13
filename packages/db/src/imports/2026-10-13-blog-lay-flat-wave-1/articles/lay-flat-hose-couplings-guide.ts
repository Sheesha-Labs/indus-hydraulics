import type { BlogArticleSeed } from '../shared'
import { FIG } from '../media'

/**
 * Lay flat hose couplings. Size ranges, materials and features from our live coupling listings
 * (IH-LF-C*) and the existing cam & groove, Storz and Bauer shelves. No per-size ratings are
 * published for the large-bore couplings, so none are quoted.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'lay-flat-hose-couplings-guide',
  title: 'Lay flat hose couplings: Bauer, camlock, Storz, grooved and flanged compared',
  excerpt:
    'A lay flat line is only as good as its joints. Small bores take camlock, Storz or Bauer couplings banded onto the hose; from 4" up, purpose-made couplings with forged shanks and bolted clamps end in grooved, Storz, flanged or high-pressure connections. Here is how each family works, where it fits, and how to fit one so it stays on.',
  categorySlug: 'industrial-hose',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Lay Flat Hose Couplings: Bauer vs Camlock vs Storz vs Grooved vs Flanged',
  seoDescription:
    'How to choose lay flat hose couplings: Bauer, camlock, Storz, grooved, flanged, high-pressure and expansion-ring couplings compared by size, speed, pressure and what they connect to — plus fitting tips.',
  focusKeyword: 'lay flat hose couplings',
  publishedAt: '2026-10-13T15:40:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Pick the coupling from what it must connect to: another hose, a pump, a valve, grooved pipe or a flange.',
        'Up to about 6", camlock, Storz and Bauer couplings banded onto the hose are fast and familiar. From 4" to 16", dedicated lay flat couplings with forged shanks and bolted clamps hold far better.',
        'Storz is genderless — any two ends connect — which speeds up long lines. Camlock and Bauer have male and female halves.',
        'The clamp must match the hose wall, not just the bore. A clamp sized for one hose class will not hold another.',
        'The coupling has its own pressure limit, and a line is limited by its weakest joint.',
      ],
    },
    {
      type: 'lead',
      html: 'Lay flat hose rarely fails in the middle of a length. It fails where it is joined — a coupling pulled off under pressure, a band that crept, a reducer that throttled an 8" line down to 6". Choosing the coupling family and fitting it properly matters as much as choosing the hose, and the right answer changes with the bore.',
    },

    { type: 'section_head', number: '/01', title: 'The coupling families.', anchor: 'families' },
    {
      type: 'direct_answer',
      question: 'Which coupling is best for lay flat hose?',
      answer:
        'For small bores up to about 6", camlock (cam and groove) or Storz couplings banded onto the hose are the usual choice — Storz where any end must join any other. From 4" to 16", use dedicated lay flat couplings with a forged shank and bolted clamp, ending in a grooved, Storz or flanged connection; use a high-pressure coupling for pumped transfer lines.',
    },
    {
      type: 'comparison_table',
      caption: 'Lay flat coupling families compared',
      columns: ['Family', 'How it connects', 'Typical bores', 'Best for'],
      rows: [
        { cells: ['Cam and groove (camlock)', 'Male adaptor locked by two cam arms', 'Up to 6"', 'Pump and tanker connections, quick changes'] },
        { cells: ['Storz', 'Symmetrical heads lock with a quarter turn; no male or female', 'Up to 6" standard; 8" to 12" large-bore', 'Long lines of many lengths; fire and flood'], highlight: true },
        { cells: ['Bauer-type', 'Ball-and-socket male into lever-ring female', 'Small to mid bores', 'Agriculture, irrigation, quick field joints'] },
        { cells: ['Grooved end', 'Grooved spigot joined by a grooved pipe clamp', '4" to 16"', 'Joining hose to grooved steel or HDPE pipe and manifolds'] },
        { cells: ['Flanged', 'Bolted flange to a matching flange', '4" to 16"', 'Pumps, valves, permanent or semi-permanent lines'] },
        { cells: ['Male × female (large bore)', 'Matching halves join directly', '8" to 12"', 'Hose-to-hose joints on long transfer lines'] },
        { cells: ['High-pressure male × female', 'Locking halves with bolted clamps, leak-tested', '4" to 12"', 'Frac water, high-head dewatering, oil transfer'] },
        { cells: ['Expansion ring', 'Ring expanded inside the hose; threaded end', '1" to 2-1/2"', 'Fire hose with NST, NPSH or BAT threads'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Small and mid bores: camlock, Storz, Bauer.', anchor: 'small-bores' },
    {
      type: 'paragraph',
      html: '<strong><a href="/c/cam-and-groove-couplings">Cam and groove couplings</a></strong> are the most widely used quick coupling on pumps, tankers and hose: a male adaptor is pushed into a female coupler and two arms lock it. They need no tools, mate across most makes of the same size and pattern, and come in aluminium, stainless, brass and polypropylene. Their one discipline is gender — every joint needs a male and a female half.',
    },
    {
      type: 'paragraph',
      html: '<strong><a href="/c/storz-couplings">Storz couplings</a></strong> are symmetrical: every head is identical, and any two lock together with a quarter turn. On a line made of many lengths that removes the most common field problem — two lengths arriving the wrong way round — which is why fire services and flood responders standardise on Storz. Our standard Storz couplings and adapters run from 1" to 6"; the <a href="/p/large-bore-storz-lay-flat-coupling">large-bore Storz lay flat coupling</a> carries the system on to 8", 10" and 12".',
    },
    {
      type: 'paragraph',
      html: '<strong><a href="/c/bauer-type-couplings">Bauer-type couplings</a></strong> join a ball-ended male into a female with a lever ring, and tolerate a few degrees of misalignment — useful on uneven ground. They are common in irrigation and agriculture, and sold as hose-shank, flanged and threaded halves.',
    },

    { type: 'section_head', number: '/03', title: 'Large bores: dedicated lay flat couplings.', anchor: 'large-bores' },
    {
      type: 'figure',
      imageId: FIG['fig-couplings-grooved'],
      captionPrefix: 'FIG. 01',
      caption: 'A grooved-end lay flat coupling lets the hose join grooved steel pipe and manifolds with a standard grooved clamp.',
      aspectRatio: '16/9',
    },
    {
      type: 'paragraph',
      html: 'From 4" upwards a banded-on quick coupling becomes the weak point: the force trying to push it off the hose grows with the bore area. Large-bore <a href="/c/lay-flat-hose-couplings">lay flat couplings</a> solve that with a <strong>forged shank</strong> that the hose slides over and <strong>bolted clamp halves</strong> that grip the hose wall around its whole circumference. The clamps can be removed and refitted to a new hose end, so the coupling outlives several hoses. Aluminium versions are hard-anodised against wear and corrosion.',
    },
    {
      type: 'prose',
      html: '<ul><li><strong><a href="/p/large-bore-lay-flat-grooved-coupling">Grooved end</a></strong> (4" to 16") — the hose ends in a grooved spigot, joined to grooved pipe, pumps and valves with a grooved clamp. The usual choice where a lay flat line meets a steel or HDPE manifold.</li><li><strong><a href="/p/large-bore-flanged-lay-flat-coupling">Flanged</a></strong> (4" to 16", aluminium, stainless or carbon steel) — bolts straight to a pump, valve or flanged pipe. The most secure joint for big, higher-pressure lines.</li><li><strong><a href="/p/large-bore-male-female-lay-flat-coupling">Male × female</a></strong> (8" to 12") — matching halves on each hose end for fast hose-to-hose joints along a long line.</li><li><strong><a href="/p/high-pressure-lay-flat-hose-coupling">High-pressure</a></strong> (4" to 12") — zinc-plated cast aluminium halves, every one air leak-tested, for frac water, high-head dewatering and oil transfer.</li><li><strong><a href="/p/lay-flat-slurry-hose-coupling">Slurry</a></strong> (4" to 10") — knurled for a gloved grip; 4", 5" and 6" intermate without adapters, as do 7" and 8".</li></ul>',
    },

    { type: 'section_head', number: '/04', title: 'Special duties.', anchor: 'special' },
    {
      type: 'paragraph',
      html: '<strong>Borehole risers</strong> use a <a href="/p/stainless-well-riser-hose-coupling">stainless well riser coupling</a> that carries the weight of the pump and the water column through the hose and still lets the coupled hose coil flat. <strong>Fire hose</strong> in US-thread systems uses <a href="/p/expansion-ring-fire-hose-coupling">expansion-ring couplings</a> — a brass ring expanded inside the hose locks the jacket into the coupling bowl — in NST, NPSH or BAT threads; elsewhere fire hose takes Storz or national instantaneous patterns.',
    },

    { type: 'section_head', number: '/05', title: 'Fitting a coupling so it stays on.', anchor: 'fitting' },
    {
      type: 'prose',
      html: '<ol><li><strong>Match coupling to hose.</strong> Tell the supplier the hose type and wall, not just the bore — a TPU dewatering hose and an NBR hose of the same bore have different walls, and the clamp must close on the one you have.</li><li><strong>Cut square.</strong> A clean, square cut lets the hose seat fully on the shank. Never push hose onto a damaged or corroded shank.</li><li><strong>Push fully home</strong> before closing any clamp or band.</li><li><strong>Tighten evenly</strong>, side to side, to the torque for the size — then check again after the first pressurisation, as the hose settles.</li><li><strong>Restrain the ends.</strong> On pressurised lines, especially near people or roads, secure couplings against whipping if a joint fails.</li><li><strong>Keep the bore full size.</strong> Reducers at each end of a large line throw away much of what the larger hose was bought for.</li></ol>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'The coupling has its own pressure limit.',
      body: 'A line is limited by its weakest component. Check the working pressure of the coupling, the hose and anything they connect to, and work to the lowest. For pumped transfer lines above ordinary dewatering pressures, use a coupling built and tested for it.',
    },
    {
      type: 'paragraph',
      html: 'Two applications put couplings under particular load: <a href="/blog/frac-water-transfer-lay-flat-hose">frac water lines</a>, where high-pressure couplings set the limit, and <a href="/blog/flexible-borehole-riser-vs-steel-column-pipe">borehole risers</a>, where the coupling carries the pump.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Can I put a camlock on lay flat hose?', answer: 'Yes, up to about 6", using a hose-shank camlock and bands or clamps sized to the hose. For larger bores use a dedicated lay flat coupling with a forged shank and bolted clamp.' },
        { question: 'Why do fire services use Storz couplings?', answer: 'Storz heads are genderless, so any two hose ends connect with a quarter turn. On lines made of many lengths that saves time and avoids lengths arriving the wrong way round.' },
        { question: 'Do different makes of Storz coupling fit each other?', answer: 'Couplings of the same Storz size are made to interconnect. Sizes are designated by their claw dimension, so confirm the size code, not just the hose bore, when mixing sources.' },
        { question: 'How do I connect lay flat hose to HDPE or steel pipe?', answer: 'Use a grooved-end lay flat coupling and a grooved clamp to a grooved pipe end or spool, or a flanged lay flat coupling to a flange.' },
        { question: 'Can you supply hose with the couplings already fitted?', answer: 'Yes. We cut lay flat hose to length and fit the couplings, so assemblies arrive ready to connect and tested on request.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Lay flat couplings',
      skus: ['IH-LF-CVG', 'IH-LF-CST', 'IH-LF-CFL', 'IH-LF-CHP', 'IH-LF-CFM', 'IH-LF-CAG', 'IH-LF-CWR', 'IH-LF-CER'],
    },
    {
      type: 'category_link',
      slug: 'lay-flat-hose-couplings',
      label: 'Lay flat hose couplings',
      blurb: 'Grooved, large-bore Storz, flanged, male × female, high-pressure, slurry, riser and expansion-ring couplings.',
    },
    {
      type: 'page_link',
      kind: 'market',
      slug: 'netherlands',
      label: 'Lay flat hose supply to the Netherlands',
      blurb: 'Storz and grooved lay flat lines for Dutch water management, dredging and agricultural contractors.',
    },
    {
      type: 'related_articles',
      slugs: ['frac-water-transfer-lay-flat-hose', 'flexible-borehole-riser-vs-steel-column-pipe', 'lay-flat-hose-guide', 'lay-flat-hose-pressure-ratings', 'lay-flat-hose-flow-and-friction-loss', 'lay-flat-hose-vs-hdpe-pipe'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-13',
      note: 'Size ranges, materials and features from the Indus lay flat coupling, cam and groove, Storz and Bauer-type listings as published on 13 October 2026.',
    },
    {
      type: 'cta_block',
      heading: 'Need couplings matched to your hose?',
      body: 'Tell us the hose type and bore and what each end connects to. We will supply the couplings loose or fitted to the hose as tested assemblies.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
