import type { BlogArticleSeed } from '../shared'
import { FERRULE_SECTION } from '../diagrams'

/**
 * Pillar: instrumentation tube fittings. How compression fittings work, families, sizes, materials, end
 * connections and selection. Sources read 2026-10-21: Swagelok Installer's Pocket Guide MS-13-151, Gaugeable Tube
 * Fittings MS-01-140, Tubing Data MS-01-107; Parker CPI/A-LOK catalogue 4230/4233 and Bulletin 4200-B4; ISO 8434-1
 * scope page. Our range from the IH-TF listings (316L forged, ASTM A479/A276 bar, 1/16"–2" double ferrule,
 * single ferrule inch and metric, rated to the tube up to 12,000 psi by OD and wall per the maker's table).
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'instrumentation-tube-fittings-guide',
  title: 'Instrumentation tube fittings: how compression fittings work, the families, and how to choose them',
  excerpt:
    'A compression tube fitting joins small stainless tube to a valve, gauge or transmitter with nothing but a nut and one or two ferrules — and it only works if tube, ferrules, nut and body were made to work together. How the ferrules seal and grip, single against double ferrule, cutting rings, sizes, materials, end connections and the rules that keep an instrument line tight for decades.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Instrumentation Tube Fittings Guide: Compression Fittings Explained',
  seoDescription:
    'How instrumentation compression tube fittings work: front and back ferrules, single vs double ferrule, cutting rings, tube sizes, 316 and alloy materials, NPT, BSP and SAE ends, and how to select fittings for instrument lines.',
  focusKeyword: 'instrumentation tube fittings',
  publishedAt: '2026-10-21T13:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A compression tube fitting seals on the outside of the tube: a nut drives the ferrules forward so they seal against the tube and the fitting body and grip the tube, with no welding, threading or flaring.',
        'In a two-ferrule fitting the front ferrule seals and the back ferrule drives it and grips the tube; a single-ferrule fitting does both with one ring.',
        'Instrument two-ferrule fittings follow no industry design standard — each maker designs to its own drawings — so tube, ferrules, nuts and bodies must never be mixed between makers.',
        'The fitting is only as strong as the tube: our 316 fittings are rated to the tube, up to 12,000 psi, depending on its OD and wall.',
        'Fully annealed stainless tube no harder than 90 HRB (Parker prefers 80 HRB or less), cut square and deburred, is what lets the ferrules seal.',
      ],
    },
    {
      type: 'lead',
      html: 'Every analyser shelter, wellhead control panel, sample system and hydraulic test bench is plumbed with small stainless tube and compression fittings. They are reliable for decades when they are built right and they leak from day one when they are not, and almost all the difference lies in details that look unimportant: which ferrule went in which nut, how hard the tube was, whether the tube was pushed all the way home. This guide covers how they work and how to choose them; the companion articles cover making them up, choosing tube and finding leaks.',
    },

    { type: 'section_head', number: '/01', title: 'How a compression fitting seals.', anchor: 'principle' },
    {
      type: 'diagram',
      captionPrefix: 'FIG. 01',
      caption: 'A two-ferrule compression fitting, made up. The nut pushes the back ferrule, which drives the front ferrule into the body’s taper: the front ferrule seals on the body and the tube, the back ferrule grips the tube behind it.',
      alt: 'Cross-section diagram of a two-ferrule compression tube fitting. From right to left: the tube passes through the nut, then the back ferrule, then the front ferrule, and bottoms against the shoulder inside the fitting body. The front ferrule is wedged into the body’s tapered mouth, sealing on both the body and the tube. The back ferrule sits behind it and grips the tube. Arrows show the nut pushing axially.',
      svg: FERRULE_SECTION,
    },
    {
      type: 'prose',
      html: '<p>Every compression fitting has the same three jobs to do at the tube end: seal against the fitting body, seal against the outside of the tube, and hold the tube so pressure and vibration cannot pull it out. It does all three with the tube itself left intact — no welding, no threading, no flare.</p><h3>Two-ferrule fittings</h3><p>In the two-ferrule design used by most instrument fitting makers, the work is split. As the nut is tightened, the <strong>back ferrule</strong> pushes the <strong>front ferrule</strong> forward into the tapered mouth of the body. The front ferrule is squeezed between body and tube and makes both seals. The back ferrule is driven inward behind it and grips the tube. Swagelok’s back ferrule is designed to hinge and collet — gripping hard at one point and supporting the tube just behind it — to resist the bending fatigue that vibration causes; Parker case-hardens its back ferrules (about 70 HRC at the surface) so they bite into tube that is often harder than ideal.</p><p>Makers describe the two-ferrule joint as live-loaded: the ferrules stay elastically sprung against the tube and body, which is what lets the joint hold through temperature swings at start-up and shutdown. And the make-up motion is axial — the nut turns but the tube is not twisted.</p><h3>Single-ferrule fittings</h3><p>A single-ferrule instrument fitting uses one ferrule that both seals and grips. Parker’s CPI is the best-known example. It has fewer parts to lose or mis-assemble, and makers publish the same make-up turns as their two-ferrule lines.</p><h3>Cutting-ring fittings are a different family</h3><p>The 24° cutting-ring fitting of hydraulic systems — ISO 8434-1, formerly DIN 2353 — looks similar but works differently: the ring’s edges bite into the tube to hold and seal it, and the whole system is dimensionally standardised, from 4 to 42 mm OD, for fluid-power ports. It is covered in <a href="/blog/fittings-on-european-machines">fittings on European machines</a>. Do not use cutting-ring parts in an instrument fitting, or the other way round.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'There is no standard that makes two makers’ ferrules interchangeable.',
      body: 'Swagelok states plainly that no industrial design standard exists for two-ferrule tube fittings — each maker designs to its own drawings and tolerances — and calls intermixing components dangerous. Parker strongly discourages mixing materials too. Keep every nut, ferrule and body in a joint from one maker, and keep the tube to that maker’s specification.',
    },

    { type: 'section_head', number: '/02', title: 'Sizes.', anchor: 'sizes' },
    {
      type: 'prose',
      html: '<p>Instrument tube fittings are sized by the <strong>outside diameter of the tube</strong>, not by a pipe size or a bore. Inch fittings run from 1/16" to 1" for hand assembly, and to 2" with hydraulic presetting tools; metric fittings from 2 mm to 25 mm by hand and to 50 mm with tools. Our double-ferrule range covers 1/16" to 2", and our single-ferrule range includes metric fittings from 2 mm to 38 mm.</p><p>Inch and metric sizes that look close are not interchangeable: 6 mm and 1/4" (6.35 mm), 10 mm and 3/8" (9.53 mm), 12 mm and 1/2" (12.7 mm) are all different. Makers mark metric bodies to stop the mistake — Swagelok metric fittings carry a stepped shoulder on the body hex and shaped metric fittings are stamped “MM”; Parker metric fittings also carry an identification shoulder. Measure the tube with a caliper before ordering.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Inch and metric tube sizes that are commonly confused',
      columns: ['Inch tube', 'OD (mm)', 'Nearest metric tube', 'Difference'],
      rows: [
        { cells: ['1/8"', '3.18', '3 mm', '0.18 mm'] },
        { cells: ['1/4"', '6.35', '6 mm', '0.35 mm'], highlight: true },
        { cells: ['3/8"', '9.53', '10 mm', '0.47 mm'] },
        { cells: ['1/2"', '12.70', '12 mm', '0.70 mm'] },
        { cells: ['3/4"', '19.05', '18 or 20 mm', '1.05 / 0.95 mm'] },
        { cells: ['1"', '25.40', '25 mm', '0.40 mm'] },
      ],
    },

    { type: 'section_head', number: '/03', title: 'Materials.', anchor: 'materials' },
    {
      type: 'prose',
      html: '<p>The default is <strong>316 stainless steel</strong>: our fittings are forged 316L from bar to ASTM A479 and A276. Makers also offer brass (for copper and plastic tube), carbon steel, and for corrosive or offshore service, 6Mo super-austenitic, 2507 super duplex, and nickel alloys 825, 625 and C-276.</p><p>Two material rules come from the makers themselves. The <strong>tube must be softer than the fitting</strong>, so with stainless fittings the stainless tube must be fully annealed — stainless tube in brass fittings is not allowed. And <strong>do not mix materials</strong> between tube and fitting: Parker allows only brass fittings on copper tube as an exception, because of galvanic corrosion and hardness differences. Material choice for the Gulf’s salt air is covered in <a href="/blog/stainless-tube-fittings-corrosion-gulf">stainless tube fittings and corrosion</a>.</p>',
    },

    { type: 'section_head', number: '/04', title: 'Pressure: the tube sets it.', anchor: 'pressure' },
    {
      type: 'prose',
      html: '<p>A compression fitting is rated <em>to the tube</em>. The makers test their fittings across a range of wall thicknesses for each OD and publish working pressure as a property of the tube — so 1/4" × 0.035" 316 seamless tube is rated 5,100 psig and the fitting on it holds the same. Our listings carry this: rated to the tube, up to 12,000 psi on 316 stainless tubing, by OD and wall. The full table and the temperature derating are in <a href="/blog/instrumentation-tubing-pressure-ratings">instrumentation tubing pressure ratings</a>.</p><p>Two exceptions: bored-through fittings (for thermocouples and dip tubes) are derated — Swagelok rates them at 0.75 of the tube up to 1/2", 0.50 to 3/4" and 0.25 above — and walls outside the maker’s tested range are not rated at all.</p>',
    },

    { type: 'section_head', number: '/05', title: 'The shapes and the ends.', anchor: 'shapes' },
    {
      type: 'prose',
      html: '<p>Tube fittings come in the same shapes as pipe fittings — unions, elbows, tees, crosses, reducers, caps, plugs and bulkhead versions — plus connectors that join a tube end to another kind of end:</p><ul><li><strong>Male and female connectors</strong> to NPT, BSPT, BSPP or SAE straight thread ports.</li><li><strong>Gauge connectors</strong> with a BSP parallel female thread and a gasket face for pressure gauges.</li><li><strong>Weld connectors</strong> — socket weld, pipe weld and butt weld — for joining to welded pipework.</li><li><strong>Port connectors</strong> with a machined ferrule end, to join two fittings directly without a length of tube.</li><li><strong>Bulkhead fittings</strong> that pass through a panel and lock with a nut.</li><li><strong>Positionable elbows and tees</strong> with an O-ring and locknut, which can be turned to face the tube before locking.</li><li><strong>Inserts</strong> that support soft plastic tube from inside so the ferrules have something to grip.</li><li><strong>O-seal and bored-through connectors</strong> for vacuum service and for thermocouples.</li></ul><p>Every end type and its standard is in <a href="/blog/tube-fitting-end-connections">tube fitting end connections</a>.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Choosing an instrument tube fitting',
      branches: [
        { condition: 'What tube is installed — OD, wall, material?', outcome: 'Measure with a caliper; inch and metric are not interchangeable. The tube sets the rating.' },
        { condition: 'Whose fittings are already on the panel?', outcome: 'Stay with that maker throughout the line. Do not intermix nuts, ferrules or bodies.' },
        { condition: 'Single or double ferrule?', outcome: 'Match the existing design. For new work, see single vs double ferrule.' },
        { condition: 'What does the other end connect to?', outcome: 'NPT, BSPT, BSPP gauge port, SAE straight thread, weld, bulkhead or another tube.' },
        { condition: 'Is the service corrosive, sour or offshore?', outcome: '316 for most; 6Mo or 2507 for hot marine air; NACE MR0175 compliance for sour.' },
        { condition: 'Gas service or vacuum?', outcome: 'Heavier wall, scratch-free tube, and the maker’s gas-service guidance.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What is a compression tube fitting?', answer: 'A fitting that seals and grips on the outside of a tube using a nut and one or two ferrules, with no welding, threading or flaring of the tube.' },
        { question: 'What does each ferrule do in a two-ferrule fitting?', answer: 'The front ferrule seals against the fitting body and the tube; the back ferrule pushes it forward and grips the tube behind it.' },
        { question: 'Can I mix ferrules and nuts from different manufacturers?', answer: 'No. There is no industry design standard for two-ferrule fittings, and makers say intermixing causes unpredictable performance and leaks. Keep each joint, and preferably each line, to one maker.' },
        { question: 'What pressure is an instrument tube fitting rated to?', answer: 'To the tube it is installed on. The rating depends on tube OD, wall, material and temperature — for example 5,100 psig on 1/4" × 0.035" 316 seamless tube. Our 316 fittings reach up to 12,000 psi on the right tube.' },
        { question: 'Is a compression fitting the same as a DIN 2353 fitting?', answer: 'No. DIN 2353, now ISO 8434-1, is a standardised hydraulic cutting-ring fitting whose ring bites into the tube. Instrument compression fittings are proprietary ferrule designs. Do not mix parts between them.' },
        { question: 'What tube should I use with stainless compression fittings?', answer: 'Fully annealed seamless or welded-and-drawn stainless tube to ASTM A269 or A213, no harder than 90 HRB — Parker recommends 80 HRB or less — free of scratches, within the maker’s wall range.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Common instrument fittings',
      skus: ['IH-TF-CF', 'IH-TF-AM', 'IH-TF-LM', 'IH-TF-C', 'IH-TF-FS', 'IH-TF-MCN-SF', 'IH-TF-MCR-SF', 'IH-TB-ST6'],
    },
    { type: 'category_link', slug: 'double-ferrule-tube-fittings', label: 'Double ferrule tube fittings', blurb: '316L forged, 1/16" to 2", every common shape.' },
    { type: 'category_link', slug: 'single-ferrule-tube-fittings', label: 'Single ferrule tube fittings', blurb: 'Inch and metric, NPT, BSPT, BSPP and SAE ends.' },
    { type: 'category_link', slug: 'stainless-steel-instrumentation-tubing', label: 'Stainless instrumentation tubing', blurb: '304 and 316, seamless and welded, ASTM A269.' },
    {
      type: 'related_articles',
      slugs: ['single-vs-double-ferrule-tube-fittings', 'how-to-make-up-a-compression-fitting', 'instrumentation-tubing-pressure-ratings', 'tube-fitting-end-connections', 'compression-fitting-leaks', 'stainless-tube-fittings-corrosion-gulf'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Construction, intermix, size-marking and material rules from Swagelok and Parker installation guides and catalogues; our range from our tube fitting listings.',
    },
    {
      type: 'cta_block',
      heading: 'Building or extending an instrument line?',
      body: 'Send the tube OD, wall and material, the end connections and the pressure. We will quote fittings and tube for the line from one maker, with material certificates if the job needs them.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
