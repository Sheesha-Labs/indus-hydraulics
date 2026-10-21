import type { BlogArticleSeed } from '../shared'

/**
 * Single vs double ferrule. Construction and make-up from Swagelok MS-01-140 / MS-13-151 and Parker CPI/A-LOK
 * catalogue 4230/4233 (A-LOK two-ferrule with silver-plated nut; CPI single ferrule with moly-coated nut; same
 * make-up turns). Cutting-ring contrast from the ISO 8434-1 scope page. No claim is made that either design is
 * universally better — makers publish both for the same duties.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'single-vs-double-ferrule-tube-fittings',
  title: 'Single vs double ferrule tube fittings: how they differ, and which to use',
  excerpt:
    'Two ferrules split the sealing and the gripping between them; one ferrule does both. How each design works, what the makers say about vibration, thermal cycling and remakes, why the two must never be mixed in one joint, how a single-ferrule instrument fitting differs from a hydraulic cutting ring, and how to decide for a new line.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Single vs Double Ferrule Compression Fittings: Differences',
  seoDescription:
    'Single ferrule vs double ferrule compression tube fittings compared: how each seals and grips, vibration and thermal cycling, remakes, make-up turns, intermixing, cutting rings and how to choose.',
  focusKeyword: 'single vs double ferrule',
  publishedAt: '2026-10-21T13:10:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A double-ferrule fitting separates the jobs: the front ferrule seals on body and tube, the back ferrule drives it and grips the tube.',
        'A single-ferrule fitting uses one ring to seal and grip, with fewer parts to lose or put in backwards.',
        'Both are made up the same way — 1-1/4 turns past finger-tight from 1/4" (6 mm), 3/4 turn on 1/16"–3/16" — and both are rated to the tube.',
        'Never mix the two in one joint, and never mix makers: the ferrule geometries are proprietary.',
        'For a new line the deciding factors are what is already installed, the maker you will standardise on, and the service — vibration, gas and thermal cycling favour the designs makers have tested for them.',
      ],
    },
    {
      type: 'lead',
      html: 'Open a box of instrument fittings and you will find either two little rings behind each nut or one. Both are compression fittings, both seal on the outside of stainless tube, and both appear on the same panels. They are not interchangeable, and the choice between them is usually made once — when the plant standardises on a fitting maker — and then lived with for decades.',
    },

    { type: 'section_head', number: '/01', title: 'Double ferrule: two jobs, two rings.', anchor: 'double' },
    {
      type: 'prose',
      html: '<p>In a two-ferrule fitting the nut pushes the back ferrule, and the back ferrule pushes the front ferrule into the tapered bore of the body. The front ferrule, squeezed between body and tube, makes both seals; the back ferrule is driven inward behind it and grips the tube. The makers’ descriptions are consistent: the front ferrule is the primary seal, the back ferrule anchors the tube.</p><p>Splitting the work lets each ferrule be optimised. Swagelok’s back ferrule hinges and collets — gripping the tube and supporting it just behind the grip — to isolate the stress concentration from vibration and resist fatigue at the fitting, which is the classic failure point of small tube on vibrating equipment. Parker’s A-LOK back ferrule is case-hardened, and its nut is silver-plated to prevent galling of the body threads. Makers describe the two-ferrule joint as live-loaded, staying sprung through thermal cycles.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Single ferrule: one ring does both.', anchor: 'single' },
    {
      type: 'prose',
      html: '<p>A single-ferrule instrument fitting has one ring between nut and body. As the nut is tightened, the ring is driven into the body taper and closes onto the tube, sealing on both and gripping the tube. Parker’s CPI is the reference design: one ferrule that both seals and grips, with a molybdenum-disulfide-coated nut. Parker publishes the same make-up turns for CPI as for its two-ferrule A-LOK.</p><p>The practical advantages are simplicity — one loose part per joint rather than two, and no way to fit two ferrules in the wrong order — and a compact nut. Our single-ferrule range covers inch tube and metric tube from 2 mm to 38 mm, with NPT, BSPT, BSPP and SAE straight-thread ends.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Single and double ferrule instrument fittings',
      columns: ['Feature', 'Double ferrule', 'Single ferrule'],
      rows: [
        { cells: ['Parts at each tube end', 'Nut, back ferrule, front ferrule', 'Nut, one ferrule'] },
        { cells: ['Seal', 'Front ferrule on body and tube', 'The ferrule on body and tube'] },
        { cells: ['Grip', 'Back ferrule, behind the seal', 'The same ferrule'], highlight: true },
        { cells: ['Make-up', '1-1/4 turns (3/4 on 1/16–3/16")', 'Same turns (Parker CPI)'] },
        { cells: ['Assembly errors', 'Ferrules can be reversed or lost', 'Fewer parts to misplace'] },
        { cells: ['Rating', 'To the tube', 'To the tube'] },
        { cells: ['Interchange', 'Not with any other maker’s parts', 'Not with any other maker’s parts'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Not the same as a cutting ring.', anchor: 'cutting-ring' },
    {
      type: 'prose',
      html: '<p>The hydraulic 24° cutting-ring fitting — ISO 8434-1, formerly DIN 2353 — is also a single-ring compression fitting, but a different family. Its ring has cutting edges that bite into the tube to seal and hold it; it is standardised dimensionally from 4 to 42 mm, so rings and nuts from different makers are designed to fit the same body; and it is designed around fluid-power ports to ISO 6149, ISO 1179 and ISO 9974. Instrument single-ferrule fittings are proprietary and are not cut into the tube in the same way. Do not use a hydraulic cutting ring in an instrument fitting, or the reverse.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Never mix designs or makers.', anchor: 'intermix' },
    {
      type: 'callout',
      tone: 'danger',
      title: 'One maker, one design, per joint.',
      body: 'A single ferrule in a two-ferrule nut and body, or one maker’s ferrules in another maker’s body, may tighten and even hold a test — and then leak or let the tube pull out under pressure, vibration or a temperature swing. Swagelok calls intermixing dangerous, noting that no industrial design standard exists for two-ferrule fittings. Parker discourages mixing materials as well. Keep spare ferrules labelled by maker and design.',
    },

    { type: 'section_head', number: '/05', title: 'Which to use on a new line.', anchor: 'choose' },
    {
      type: 'prose',
      html: '<p>Both designs are used for the same duties — instrument impulse lines, sample systems, analyser panels, hydraulic and pneumatic control lines — at pressures set by the tube. What actually decides it:</p><ol><li><strong>What is already installed.</strong> A plant standardised on one design keeps spares, tools and training for it. Matching it is almost always right.</li><li><strong>The maker you will standardise on.</strong> Choose the maker first; the design follows from that maker’s range.</li><li><strong>Service.</strong> For heavy vibration, gas service and frequent thermal cycling, ask for the maker’s test data for that duty rather than relying on the generic claim of either design.</li><li><strong>Assembly skill on site.</strong> Fewer parts per joint reduces one class of error; a gap inspection gauge, used on first make-up, catches under-tightening on either design.</li><li><strong>Metric or inch.</strong> Both designs come in both, but check that the fitting family you choose covers every size on the job.</li></ol>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is the difference between single and double ferrule fittings?', answer: 'A double-ferrule fitting uses a front ferrule to seal and a back ferrule to drive it and grip the tube. A single-ferrule fitting uses one ring to do both.' },
        { question: 'Which is better, single or double ferrule?', answer: 'Neither in general. Both are rated to the tube and used for the same duties. Match what is installed, standardise on one maker, and check that maker’s test data for vibration, gas or thermal cycling.' },
        { question: 'Can I put a single ferrule in a double ferrule fitting?', answer: 'No. The body, nut and ferrules are designed as a set. Mixing designs or makers risks leaks or tube blow-out.' },
        { question: 'Do single and double ferrule fittings use the same make-up turns?', answer: 'For the main makers, yes: 1-1/4 turns past finger-tight for 1/4" (6 mm) and larger, 3/4 turn for 1/16", 1/8" and 3/16" (2–4 mm).' },
        { question: 'Is a DIN 2353 fitting a single ferrule fitting?', answer: 'It is a single cutting-ring fitting, but a different, standardised hydraulic family (now ISO 8434-1) whose ring bites into the tube. It is not interchangeable with instrument single-ferrule fittings.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Double and single ferrule',
      skus: ['IH-TF-CF', 'IH-TF-FS', 'IH-TF-FF', 'IH-TF-FB', 'IH-TF-CF-SF', 'IH-TF-FO-SF', 'IH-TF-MCN-SF', 'IH-TF-MCR-SF'],
    },
    { type: 'category_link', slug: 'double-ferrule-tube-fittings', label: 'Double ferrule tube fittings', blurb: '316L forged, front and back ferrules sold separately and as sets.' },
    { type: 'category_link', slug: 'single-ferrule-tube-fittings', label: 'Single ferrule tube fittings', blurb: 'Inch and metric, with replacement ferrules.' },
    {
      type: 'related_articles',
      slugs: ['instrumentation-tube-fittings-guide', 'how-to-make-up-a-compression-fitting', 'compression-fitting-leaks', 'fittings-on-european-machines'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Construction and make-up from Swagelok and Parker installation documents; cutting-ring scope from ISO 8434-1.',
    },
    {
      type: 'cta_block',
      heading: 'Not sure which design is on your panel?',
      body: 'Send a photograph of a fitting taken apart, or the part number on the body. We will identify the design and quote matching fittings and ferrules.',
      quoteLabel: 'Ask us',
    },
  ],
}

export default ARTICLE
