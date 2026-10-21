import type { BlogArticleSeed } from '../shared'

/**
 * Compression fitting leaks: causes and fixes, each tied to Swagelok MS-13-151 / MS-01-140 / MS-01-107 or
 * Parker 4230/4233 and 4200-B4 (read 2026-10-21). Over-tightening presented as practice, not a quoted maker rule;
 * "never use as a frequently-disconnected union" NOT claimed (Swagelok says remakes "many times").
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'compression-fitting-leaks',
  title: 'Why compression fittings leak, and how to find and fix the cause',
  excerpt:
    'A weeping instrument fitting is almost never a faulty fitting. It is a tube that was never bottomed, a nut that was never counted, a ferrule from another maker, a tube too hard or too scratched, a line with no supports, or a joint that was tightened under pressure. Each cause, how to recognise it, and what to do — in the order to check them.',
  categorySlug: 'instrumentation-gauges',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Compression Fitting Leaking? Causes and How to Fix It',
  seoDescription:
    'Why compression tube fittings leak: under-tightening, tube not bottomed, intermixed parts, hard or scratched tube, thin wall in gas service, vibration, strain and corrosion — how to diagnose each and fix it safely.',
  focusKeyword: 'compression fitting leaking',
  publishedAt: '2026-10-21T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Depressurise before touching a leaking fitting: makers prohibit tightening or loosening under pressure.',
        'On a new joint, check it with the gap gauge first: if the gauge enters, it was never tightened enough.',
        'If the tube was not pushed fully onto the body shoulder, the joint will leak or pull out however hard it is tightened.',
        'Intermixed ferrules, nuts and bodies from different makers are a leak waiting to happen — there is no standard that makes them fit.',
        'Hard, scratched, oval or burred tube, or thin wall in gas service, cannot be sealed by tightening; it has to be replaced.',
        'Lines that vibrate, are strained or are clamped wet fail later — at the fitting, from fatigue, strain or corrosion.',
      ],
    },
    {
      type: 'lead',
      html: 'Instrument fittings are among the most reliable joints in a plant when they are assembled to the maker’s procedure, which is exactly why a leaking one should be treated as evidence rather than as a nut to tighten. The cause is usually visible to someone who knows where to look. This is the checklist, in the order we would work through it.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Depressurise first. Every time.',
      body: 'Do not tighten, loosen or bleed a fitting while the system is under pressure — Swagelok and Parker both prohibit it. A partly made-up joint can release the tube suddenly, and a pinhole jet of hydraulic oil or process fluid can cause an injection injury.',
    },

    { type: 'section_head', number: '/01', title: 'Assembly faults.', anchor: 'assembly' },
    {
      type: 'prose',
      html: '<h3>Under-tightened</h3><p>The commonest cause on a new joint. On a first make-up, hold the maker’s gap inspection gauge against the gap between nut and body: if it enters anywhere round the nut, the fitting needs more tightening (Parker: repeat the assembly). The fix is to depressurise and complete the 1-1/4 turns (3/4 turn on 1/16"–3/16") from finger-tight — which is only possible if the original position was marked. If it was not, replacing the joint is the honest answer.</p><h3>Tube not bottomed</h3><p>Makers require the tube to rest firmly on the body shoulder before tightening. A tube that stopped short — because of a burr, a bent end or simply not being pushed — ends up with ferrules swaged on the wrong part of the tube. It may hold a test and then weep or pull out. A depth mark on the tube showing above the nut is the giveaway. The fix is to cut the swaged end off and remake with new ferrules.</p><h3>Remade wrong</h3><p>A remade joint goes back to its marked position, then only slightly further — Parker says 10–20°, after several remakes. A full 1-1/4 turns on a remake over-compresses the ferrules; using the gap gauge on a remake gives a meaningless answer. Over-tightening in general is a practice problem rather than a maker-quoted rule, but the effect is real: crushed ferrules, a necked tube, and fewer remakes left.</p><h3>Ferrules reversed or missing</h3><p>On two-ferrule fittings, a back ferrule fitted the wrong way round, or a front ferrule left out, cannot seal. Take the nut off a depressurised joint and look.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Mixed parts.', anchor: 'intermix' },
    {
      type: 'prose',
      html: '<p>Look at the nuts and bodies on a leaking panel: if the hex shapes, markings or finishes differ, parts from more than one maker are in the line. Swagelok states that no industrial design standard exists for two-ferrule fittings and calls intermixing dangerous, citing unpredictable performance and environmental releases; Parker strongly discourages mixing tube and fitting materials, citing galvanic corrosion and hardness differences. The fix is to replace every mixed joint with one maker’s complete fitting, and to label spares so it does not happen again.</p>',
    },

    { type: 'section_head', number: '/03', title: 'The tube.', anchor: 'tube' },
    {
      type: 'comparison_table',
      caption: 'Tube faults that tightening cannot fix',
      columns: ['Fault', 'How to recognise it', 'Fix'],
      rows: [
        { cells: ['Too hard', 'Ferrules barely mark the tube; tube kinks when bent; mill certificate shows hardness above 90 HRB', 'Replace with fully annealed tube (80 HRB or less preferred for gas)'] },
        { cells: ['Scratched or dented under the ferrule', 'Marks visible where the ferrule sat; worst in gas service', 'Cut back past the damage, or replace the length'], highlight: true },
        { cells: ['Out of round', 'Tube does not enter the fitting easily; caliper reads differently across diameters', 'Replace; never force oval tube into a fitting'] },
        { cells: ['Burred or badly cut', 'Tube would not bottom; chips in the line', 'Cut square with a proper cutter, deburr, clean'] },
        { cells: ['Wall too thin for gas', 'Leaks on helium or nitrogen but not on liquid', 'Heavier wall, outside the maker’s thin-wall cells'] },
        { cells: ['Wrong size', 'Metric tube in inch fitting or the reverse', 'Measure with a caliper; replace fitting or tube'] },
      ],
    },
    {
      type: 'prose',
      html: '<p>Makers are blunt about tube condition. Stainless tube must be fully annealed and softer than the fitting; Swagelok specifies no harder than 90 HRB and Parker recommends 80 HRB or less. A dull or wrong cutting wheel work-hardens the tube end. Scratches, depressions and raised marks where the ferrule seals are leak paths — and Parker notes that low-density gases such as helium and argon cannot be sealed on damaged tube at all. Marking tube with a scribe instead of a pencil creates exactly that kind of scratch.</p>',
    },

    { type: 'section_head', number: '/04', title: 'The installation around the fitting.', anchor: 'installation' },
    {
      type: 'prose',
      html: '<ul><li><strong>Vibration and missing supports.</strong> Unsupported tube vibrates, loosens its fittings and can fatigue through right behind the ferrule. Parker’s spacing guide is about 3 ft (0.9 m) for 1/4"–1/2" tube, 4 ft (1.2 m) to 7/8", 5 ft (1.5 m) at 1" and 7 ft (2.1 m) above, with clamps close to each bend.</li><li><strong>Strain.</strong> Parker’s warning is that a strained joint will eventually leak. A tube bent to meet a fitting, pulled into place, or with no room to expand and contract (no U-bend in a long run) puts a bending load on the ferrules that the joint was never designed to carry.</li><li><strong>Thermal cycling.</strong> Two-ferrule fittings are designed to stay live-loaded through start-up and shutdown cycles, but a joint that was marginal to begin with shows up here first.</li><li><strong>Corrosion.</strong> In salt air, 316 pits and crevice-corrodes under clamps and between touching runs; a leak at a fitting may be a pinhole in the tube just beside it. See <a href="/blog/stainless-tube-fittings-corrosion-gulf">corrosion in salt air</a>.</li><li><strong>The other end.</strong> A leak at a tapered thread is a sealant or thread problem, not a ferrule problem; a leak at a parallel-thread port is a washer or O-ring problem. See <a href="/blog/tube-fitting-end-connections">end connections</a>.</li></ul>',
    },
    {
      type: 'decision_tree',
      heading: 'Finding the cause',
      branches: [
        { condition: 'Is the system depressurised?', outcome: 'If not, do nothing to the fitting until it is.' },
        { condition: 'Is the leak at the tube end or the thread end?', outcome: 'Thread end: sealant (taper) or washer / O-ring (parallel). Tube end: continue.' },
        { condition: 'First make-up: does the gap gauge enter?', outcome: 'Under-tightened. Complete the turns from the marked position, or remake with new ferrules.' },
        { condition: 'Are all parts from one maker and one design?', outcome: 'If not, replace the joint with one maker’s complete fitting.' },
        { condition: 'Was the tube bottomed, square-cut and deburred?', outcome: 'If not, cut back and remake.' },
        { condition: 'Is the tube annealed, round, unscratched and thick enough for gas?', outcome: 'If not, replace the tube.' },
        { condition: 'Is the line supported, unstrained and free of crevice corrosion?', outcome: 'Fix the installation, or the new joint will fail the same way.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Why is my compression fitting leaking?', answer: 'Most often: under-tightening, a tube that was not bottomed, parts from different makers, damaged or too-hard tube, or a line that vibrates or is strained. The fitting itself is rarely faulty.' },
        { question: 'Should I just tighten a leaking compression fitting?', answer: 'Only after depressurising, and only if you know where it started — a first make-up can be completed to its turns; a remake should only go slightly past its marks. Tightening blindly crushes the ferrules and rarely fixes the real cause.' },
        { question: 'Can I use thread sealant to stop a compression fitting leak?', answer: 'Not on the tube end. Ferrules seal on the tube and body; sealant does nothing there and can contaminate the line. Sealant belongs only on tapered pipe threads.' },
        { question: 'Why does my fitting leak on gas but not on liquid?', answer: 'Gas finds smaller leak paths. Scratched tube, thin wall that cannot coin out defects, or tube harder than 80–90 HRB will seal liquid but not helium or nitrogen.' },
        { question: 'Can different brands of compression fittings be mixed?', answer: 'No. There is no design standard for two-ferrule fittings, and makers warn intermixing causes leaks and releases. Keep each joint to one maker.' },
        { question: 'Why do fittings on vibrating equipment keep leaking?', answer: 'Missing or widely spaced supports let the tube vibrate, which loosens the joint and fatigues the tube behind the ferrule. Support it close to the fitting and each bend.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Replacement fittings, ferrules and tube',
      skus: ['IH-TF-FS', 'IH-TF-FF', 'IH-TF-FB', 'IH-TF-FO-SF', 'IH-TF-CF', 'IH-TF-L', 'IH-TB-ST6'],
    },
    { type: 'category_link', slug: 'instrumentation-tube-fittings', label: 'Instrumentation tube fittings', blurb: 'Fittings, ferrule sets and 304/316 tube.' },
    {
      type: 'related_articles',
      slugs: ['how-to-make-up-a-compression-fitting', 'instrumentation-tubing-pressure-ratings', 'instrumentation-tube-fittings-guide', 'stainless-tube-fittings-corrosion-gulf', 'hydraulic-fluid-injection-injury'],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-21',
      note: 'Every cause tied to Swagelok or Parker installation and tubing documents; over-tightening described as practice rather than a quoted rule.',
    },
    {
      type: 'cta_block',
      heading: 'Chasing leaks on a panel?',
      body: 'Send photographs of the fittings and the tube, the tube size and wall, and what the line carries. We will tell you what we think is wrong and quote the parts to put it right from one maker.',
      quoteLabel: 'Ask us',
    },
  ],
}

export default ARTICLE
