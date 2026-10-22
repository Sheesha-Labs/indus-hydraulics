import type { BlogArticleSeed } from '../shared'
import { cylinderStockBlocks } from '../cylinder-stock'

/**
 * Cushioning, kinetic energy, mounting, side load, rod-end couplers and buckling. Sources: SMC C96 operation manual
 * (allowable kinetic energy table, air cushion vs non-cushion, 32–100 mm; cushion valve adjustment, fully-closed and
 * over-opened warnings, allowable rotations; bumper bounce; external shock absorber / speed-reduction circuit; lateral
 * load warning and guide-friction check; cantilever mounting at high speed; no synchronised cylinders; dust and rod
 * protection; piston speed 50–1000 mm/s); SMC BEST guide cushion page (E = ½mv², larger bore or external stopper) and
 * buckling page (maximum stroke by bore, pressure and mounting, "regardless of the load factor", full force on an
 * external stopper); Parker P1F catalogue 0980 (how the needle-screw cushion works, speed at start of cushioning about
 * 50% above average, horizontal 6 bar diagram, mounting accessories with ISO codes, flexo coupling ±4°, metallic scraper);
 * Parker P1D catalogue PDE2570TCUK (cushioning diagram assumptions, mass ÷2.5 or speed ÷1.5 at high relative load,
 * moving-mass table, lateral-load rule, guidance modules via flexo coupling); Parker catalogue 0900P-7 (4MA NFPA
 * mounting codes, adjustable cushions, bumper seals and 1/4 in stroke loss per bumper, HI LOAD gland for side load,
 * oversize rod numbers, stop tube ordering, piston rod selection chart). Left out as unsourced: SMC floating-joint
 * misalignment figures, any ranking of mounting styles by buckling length (SMC's table values could not be read
 * reliably), Parker's cushioning diagram values (graph only) and stop-tube length rules.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pneumatic-cylinder-cushioning-and-mounting',
  title: 'Pneumatic cylinder cushioning and mounting: kinetic energy limits, side load, alignment couplers and buckling',
  excerpt:
    'How adjustable air cushions and bumpers stop a piston, the kinetic energy limits SMC and Parker publish and how to check against them, which mounting styles side-load a cylinder, why a flexible rod coupler matters, and how buckling limits stroke — with the makers’ own figures and rules.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pneumatic Cylinder Cushioning, Mounting & Side Load',
  seoDescription:
    'Air cushions vs bumpers, SMC and Parker kinetic energy limits, mounting styles and side load, flexo rod couplers, and buckling stroke limits for air cylinders.',
  focusKeyword: 'pneumatic cylinder cushioning',
  publishedAt: '2026-10-22T14:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An adjustable air cushion traps the last of the exhaust air behind a needle screw; a bumper is a polymer pad. In SMC’s C96 data the air cushion roughly doubles the allowable energy — 11.4 J against 6.0 J at 63 mm.',
        'Check E = ½mv² against the maker’s limit, using the speed at the start of cushioning — Parker says it is typically about 50% above the average speed — and include the piston and rod in the mass.',
        'Too much energy: SMC says to add a speed-reduction circuit or an external shock absorber; Parker’s P1D data says to cut mass by 2.5× or speed by 1.5× when the cylinder is heavily loaded.',
        'Cylinders are not built to carry side load. SMC warns against excessive lateral load; Parker says P1D needs an external guide under significant lateral load. A flexo coupling takes up ±4° of angular error.',
        'Buckling caps the stroke. SMC tabulates maximum stroke by bore, pressure and mounting, regardless of load factor; Parker handles it on 4MA with oversize rods and stop tubes.',
      ],
    },
    {
      type: 'lead',
      html: 'A cylinder sized correctly for force can still fail early — the piston hammering the end cover because the moving mass is too fast, or the rod bearing wearing oval because the mounting pushes it sideways. Both failures come from choices made after sizing: the cushioning, the mounting style and the connection to the load. This guide covers each, using the limits the makers publish.',
    },

    { type: 'section_head', number: '/01', title: 'Air cushions and bumpers.', anchor: 'cushioning' },
    {
      type: 'prose',
      html: '<h3>Adjustable air cushions</h3><p>Parker describes the mechanism on its P1F: a threaded needle screw adjusts into an orifice in the end plate. Screwing it further in lets less air escape in a given time, and the slowed exhaust builds back-pressure that slows the piston as it enters the end cushioning seal. The cushion absorbs the kinetic energy of the load at both ends of the stroke.</p><p>Setting it is finished on the machine. SMC ships its C96 cushions pre-adjusted but says to readjust them for the actual load and speed when the cylinder goes into service — clockwise to stiffen, anticlockwise to soften. SMC’s warnings are worth following exactly:</p><ul><li><strong>Not fully closed.</strong> Run with the cushion valve shut and the piston may bounce, fail to complete its stroke, or damage the cushion seal from excess pressure.</li><li><strong>Not over-opened.</strong> Open it beyond the allowable number of turns and the screw can blow out of the cover when air is applied. SMC gives 4 turns for 32 and 40 mm, 4.5 for 50 and 63 mm and 5.5 for 80 and 100 mm on C96.</li><li><strong>Not switched off.</strong> SMC says to use the air cushion whenever the cylinder runs; otherwise, above the non-cushioned energy limit, the piston rod assembly or tie rods will be damaged.</li></ul><h3>Bumpers</h3><p>A bumper is a resilient pad on the piston or in the cover that takes the impact directly. It needs no adjustment and quietens the end of stroke, but absorbs less energy than an air cushion — compare SMC’s with and without figures below. Parker offers bumper piston seals on its 4MA for additional noise reduction and smooth end-of-stroke deceleration, and separate 1/4 in thick bumpers at either or both ends — each of which costs 1/4 in of stroke, so a 6 in stroke cylinder with bumpers at both ends has an effective stroke of 5-1/2 in. SMC notes a slight bounce at the stroke end with a bumper cushion. Parker’s P1F combines both: adjustable pneumatic cushioning plus a mechanical cushion that reduces the noise of the piston striking the end covers.</p><p>Our 4MA listings name the piston option where the part numbers share it — look for “Bumper Seals” or “Lipseals and Magnetic Ring” in the title.</p>',
    },

    { type: 'section_head', number: '/02', title: 'Kinetic energy: what the makers publish.', anchor: 'kinetic-energy' },
    {
      type: 'prose',
      html: '<p>The load arriving at the end of stroke carries kinetic energy E = ½ m v² (joules, with m in kg and v in m/s). The cushion has to absorb it. Makers publish the limit in two forms:</p><ul><li><strong>SMC</strong> gives a table of allowable kinetic energy in joules per bore, with and without the air cushion (below), and states that running above it can break the product and cause injury. Its selection guide says to go to a larger bore or add an external stopper when the value is exceeded.</li><li><strong>Parker</strong> gives a diagram of maximum permissible speed at the start of cushioning against moving mass, per bore. For P1F it is valid for horizontal movement at 6 bar with the mass guided externally. For P1D it assumes low load, equilibrium speed, a correctly set cushion screw and 6 bar at the cylinder port — and at high relative load (more than 1 bar pressure drop across the piston), Parker says to reduce the mass by a factor of 2.5 for a given speed, or the speed by 1.5 for a given mass.</li></ul><h3>Two traps in the arithmetic</h3><ol><li><strong>Use the speed entering the cushion, not the average.</strong> Parker: the piston speed at the start of cushioning is typically about 50% higher than the average speed, and it is this higher speed that determines the cylinder. A 300 mm stroke in 0.6 s averages 0.5 m/s but arrives at about 0.75 m/s.</li><li><strong>Count the cylinder’s own moving parts.</strong> Parker publishes the moving mass for cushioning calculations — for a 63 mm P1D, 0.50 kg plus 0.025 kg per 10 mm of stroke.</li></ol><h3>Worked check</h3><p>A 63 mm cylinder with 300 mm stroke moves a 15 kg guided load horizontally. Moving mass = 15 + 0.50 + (30 × 0.025) = 16.25 kg. At 0.5 m/s average, the cushion sees about 0.75 m/s: E = ½ × 16.25 × 0.75² = <strong>4.6 J</strong>. Against SMC’s C96 figures for 63 mm, that is inside both the 11.4 J air-cushion limit and the 6.0 J non-cushion limit. Double the average speed to 1.0 m/s and the cushion sees 1.5 m/s: E = ½ × 16.25 × 1.5² = <strong>18.3 J</strong> — beyond the air cushion. The options then are SMC’s: a speed-reduction circuit so the cylinder slows before the cushion, an external shock absorber, or a larger bore.</p><p>Parker’s diagrams are drawn for horizontal motion. A load travelling downwards is also pulled into the cushion by gravity; ask the maker for the vertical case rather than reading it off a horizontal chart.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'SMC C96 (ISO cylinder) allowable kinetic energy, from SMC’s operation manual. Other series and makers differ — use the data for the cylinder you are fitting.',
      columns: ['Bore (mm)', 'With air cushion (J)', 'Without air cushion (J)'],
      rows: [
        { cells: ['32', '2.3', '1.1'] },
        { cells: ['40', '3.6', '1.8'] },
        { cells: ['50', '6.1', '3.6'] },
        { cells: ['63', '11.4', '6.0'], highlight: true },
        { cells: ['80', '21.1', '12.0'] },
        { cells: ['100', '31.7', '12.0'] },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Over-energy failures are sudden.',
      body: 'SMC states that operating above the allowable kinetic energy can break the cylinder and cause injury or damage. A piston rod or tie rod that fails at the end of stroke releases the load. If the energy check is marginal, slow the cylinder before the cushion or fit an external shock absorber — and SMC adds: check the machine frame is rigid enough to take the stopping force.',
    },

    { type: 'section_head', number: '/03', title: 'Mounting styles and the side load they cause.', anchor: 'mounting' },
    {
      type: 'prose',
      html: '<p>Mountings fall into two families. <strong>Fixed</strong> mountings — flanges, feet, side lugs, tapped ends, extended tie rods — hold the cylinder rigidly on one line. <strong>Pivot</strong> mountings — clevises, eyes and trunnions — let the cylinder swing, so it can follow a load that moves in an arc. Both are standardised: Parker’s 4MA catalogue lists 20 styles with their NFPA codes, and its P1F accessory range carries the ISO designations.</p><p>A cylinder’s rod bearing guides the rod; it is not designed to carry the load. SMC is direct: <strong>do not apply excessive lateral load to the piston rod</strong>, and it publishes allowable lateral load against stroke for C96. Parker is equally direct for P1D: where there are <strong>significant lateral loads</strong> on the piston rod, an external guide must be used to achieve maximum service life. Where Parker does offer side-load capacity, it names it: the 4MA can be ordered with a HI LOAD gland for side-load conditions.</p><h3>How mountings create side load</h3><ul><li><strong>A fixed cylinder driving a guided load</strong> must be on exactly the same line as the guides. Any misalignment is forced through the rod bearing. SMC gives a field check: the cylinder should move the load smoothly at its own minimum operating pressure plus load weight × guide friction coefficient ÷ piston area. If it does, the guides are not loading the cylinder.</li><li><strong>A fixed cylinder pushing an unguided load</strong> carries the whole load on its rod. Use a guided cylinder or external guide instead.</li><li><strong>One-end (cantilever) mounting at speed.</strong> SMC warns that a cylinder fixed at one end only — a basic, flange or direct mount — can vibrate at the stroke end at high speed, and the bending moment damages it. Add a support bracket, or slow it down; long-stroke cylinders mounted horizontally from one end need the bracket anyway.</li><li><strong>Two cylinders on one load.</strong> SMC advises against moving a single load with synchronised cylinders: even if set to the same speed, their speeds drift apart and the load racks between them.</li></ul><h3>Protecting the rod</h3><p>Dust on the rod is carried into the seal on every stroke. SMC says not to use its C96 in dusty locations or where water or oil splash it. Where the rod gets coated — Parker lists resin, ice, cement and sugar — Parker offers a metallic scraper on P1F and a metallic rod wiper on 4MA. On a dusty site, specify the scraper or wiper option when you order.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Mounting families with the designations Parker uses (4MA catalogue 0900P-7 for NFPA; P1F catalogue 0980 for ISO accessories)',
      columns: ['Family', 'NFPA codes (Parker 4MA)', 'ISO accessories (Parker P1F)', 'Load path', 'Watch for'],
      rows: [
        { cells: ['Flange', 'MF1 head, MF2 cap rectangular flange', 'MF1 / MF2 flange', 'Thrust on the cylinder axis', 'Alignment with the load; cantilever vibration at speed (SMC)'] },
        { cells: ['Foot / side', 'MS1 side end angles, MS2 side lugs, MS4 side tap, MS7 side end lugs', 'MS1 foot brackets', 'Thrust offset from the axis into the base', 'Alignment; rigid base (SMC)'] },
        { cells: ['Tie-rod extension / no mount', 'MX0–MX5', '—', 'As flange, on the tie rods', 'Alignment'] },
        { cells: ['Clevis / eye (pivot)', 'MP1 cap fixed clevis, MP2 cap detachable clevis, MP4 cap detachable eye', 'MP2, MP4, MP6, AB6 brackets; CS7 swivel bearing', 'Swings with an arcing load', 'Buckling on long strokes; rod end must pivot too'], highlight: true },
        { cells: ['Trunnion (pivot)', 'MT1 head, MT2 cap, MT4 intermediate', 'MT4 centre trunnion with AT4 brackets; MT5/MT6 flange trunnion', 'Swings about the trunnion pins', 'Buckling; pin wear — Parker MT4 can be positioned on the body'] },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Rod-end alignment couplers.', anchor: 'couplers' },
    {
      type: 'prose',
      html: '<p>Even a well-aligned fixed cylinder is rarely perfectly in line with its load over the full stroke. A rigid rod-end connection turns every fraction of a degree into side load on the rod bearing. A <strong>self-aligning coupler</strong> between the rod and the load takes that out.</p><ul><li><strong>Parker flexo coupling (PM5)</strong>, for P1D and P1F, is intended to take up axial angle errors within <strong>±4°</strong>. Parker uses the same flexo coupling to join its P1D rod-guidance modules to the piston rod, stating that it prevents the build-up of stresses in the cylinder.</li><li><strong>Swivel rod eye (AP6)</strong> with a DIN 648K spherical bearing, paired with an AB6 clevis bracket, for pivot-mounted cylinders whose rod end must also articulate.</li><li><strong>Rod clevis (AP2)</strong> for a pinned rod end.</li></ul><p>Rule of thumb from the makers’ own designs: if the cylinder body is fixed and the load is guided, couple the rod to the load through a flexible coupling; if the cylinder pivots, the rod end must pivot in the same plane.</p>',
    },

    { type: 'section_head', number: '/05', title: 'Buckling and stroke limits.', anchor: 'buckling' },
    {
      type: 'prose',
      html: '<p>A long, thin rod pushing a load is a column, and a column buckles. SMC’s approach is the simplest to apply: assuming the force the cylinder generates acts as a buckling force on the rod, it tabulates the <strong>maximum usable stroke</strong> for each bore at 0.3, 0.5 and 0.7 MPa, for foot, rod-flange, head-flange, clevis and trunnion mountings. SMC stresses the stroke limit applies <strong>regardless of the load factor</strong>: even under a light load, once the rod is stopped by an external stopper at the extending end, the cylinder’s full force acts on it.</p><p>So check buckling for any long-stroke cylinder that pushes, and above all for clamps and presses that stall on the workpiece. The limit moves with three things you control: the bore and rod (a bigger rod is stiffer), the pressure (less force, longer allowable stroke), and the mounting style, which sets how the column is supported at each end.</p><h3>The fixes Parker offers on 4MA</h3><ul><li><strong>Oversize rods.</strong> The 4MA order code includes oversize rod numbers 2 and 3, and Parker refers you to its piston-rod selection chart to choose the rod diameter. Our 4MA listings for “Rod Number 2” and “Rod Number 3” are those.</li><li><strong>Stop tubes.</strong> Parker lets you add a stop tube by ordering the gross stroke (net stroke plus stop tube) and specifying the tube length in the order notes. Whether a stroke needs one comes from Parker’s rod selection chart — send us the stroke, bore, pressure and mounting and we will check it.</li><li><strong>HI LOAD gland</strong> where the rod also sees side load.</li></ul><p>For ISO cylinders, use the maker’s buckling or rod-load data for the series, and do not extrapolate one maker’s table to another’s cylinder: the standard fixes the mounting dimensions, not the rod material or bearing length.</p>',
    },
    {
      type: 'decision_tree',
      heading: 'Cushioning and mounting checks',
      branches: [
        { condition: 'Is ½mv² at cushion-entry speed (about 1.5× average) inside the maker’s limit?', outcome: 'Yes: set the air cushion on commissioning. No: slow the cylinder before the cushion, add a shock absorber or go up a bore.' },
        { condition: 'Light load, low speed, noise the main concern?', outcome: 'Bumpers are enough — allow for the stroke they take up (1/4 in per bumper on Parker 4MA).' },
        { condition: 'Load guided separately from the cylinder?', outcome: 'Fixed mounting, with a flexo coupling at the rod end (±4° on Parker PM5).' },
        { condition: 'Load moves in an arc?', outcome: 'Clevis or trunnion mounting with a swivel rod eye or clevis at the rod end.' },
        { condition: 'Load pushes sideways on the rod?', outcome: 'Guided cylinder or external guide; Parker 4MA HI LOAD gland for moderate side load.' },
        { condition: 'Long stroke pushing, or a clamp that stalls on the work?', outcome: 'Check the maker’s buckling stroke limit; consider an oversize rod or a stop tube.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'How does a pneumatic cylinder air cushion work?', answer: 'Near the end of stroke the main exhaust is cut off and the remaining air escapes through an orifice set by a needle screw. The back-pressure this builds slows the piston before it reaches the end cover.' },
        { question: 'How do I adjust the cushion on an air cylinder?', answer: 'Set it on the machine with the real load and speed. Turn the screw in to stiffen, out to soften. SMC warns not to run it fully closed (the piston may bounce or not complete the stroke) and not to open it past the allowable turns.' },
        { question: 'What is the difference between an air cushion and a bumper?', answer: 'An air cushion is adjustable and absorbs more energy — on SMC’s C96, roughly twice the non-cushioned figure. A bumper is a fixed pad that needs no adjustment and absorbs less energy; Parker’s separate 4MA bumpers take up 1/4 in of stroke each.' },
        { question: 'How do I calculate kinetic energy for a pneumatic cylinder?', answer: 'E = ½ × moving mass × speed², with the mass including the piston and rod and the speed taken at the start of cushioning. Parker says that speed is typically about 50% above the average speed.' },
        { question: 'Can a pneumatic cylinder take side load?', answer: 'Not much. SMC warns against excessive lateral load on the rod and Parker requires an external guide under significant lateral load on P1D. Use a guided cylinder, an external guide, or a flexible rod coupling to remove misalignment.' },
        { question: 'What limits the stroke of a pneumatic cylinder?', answer: 'Rod buckling. SMC tabulates the maximum stroke by bore, pressure and mounting style, independent of the load. Parker offers oversize rods and stop tubes on 4MA for long strokes.' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'what-we-list' },
    ...cylinderStockBlocks(
      '<p>Every cylinder on our shelf is linked below — Parker 4MA (including bumper-seal and oversize-rod listings) and 2MNR tie-rod, P1D and P1F ISO 15552, SR-family round body, LP compact and HB/P5E guided cylinders, plus Destaco. Tell us the mounting and rod end with the part number and we will quote the cylinder and its accessories.</p>'
    ),
    {
      type: 'product_embed',
      heading: 'Cushioned, bumpered and guided cylinders',
      skus: [
        'IH-PAR-4MA-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-4-INCH-3',
        'IH-PAR-4MA-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-2-INCH-4',
        'IH-PAR-P1F-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-SMOOTH-4',
        'IH-PAR-P1F-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-SMOOTH-PRO',
        'IH-PAR-P1F-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-TIE-ROD-16',
        'IH-PAR-P1D-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-COMPOS-4',
        'IH-PAR-HB-SERIES-GUIDED-PNEUMATIC-CYLINDERS-COMPACT-SLID',
        'IH-PAR-P5E-SERIES-GUIDED-PNEUMATIC-CYLINDERS-COMPOSITE-B',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-cylinders', label: 'Pneumatic cylinders', blurb: 'NFPA and ISO tie-rod, round-body, compact and guided air cylinders.' },
    { type: 'category_link', slug: 'pneumatic-flow-check-valves', label: 'Flow and check valves', blurb: 'Speed controls to slow a cylinder before it reaches the cushion.' },
    {
      type: 'related_articles',
      slugs: [
        'pneumatic-cylinder-types-guide',
        'how-to-size-a-pneumatic-cylinder',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'sizing-pneumatic-valves-flow-cv',
        'pneumatic-grippers-and-vacuum-guide',
        'air-safety-relief-soft-start-and-lockout-valves',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Energy limits and mounting rules quoted per maker: SMC C96 manual and selection guide; Parker catalogues 0980 (P1F), PDE2570TCUK (P1D) and 0900P-7 (4MA).',
    },
    {
      type: 'cta_block',
      heading: 'Need the mounting and rod-end parts too?',
      body: 'Send us the cylinder part number, the moving mass, the speed and how it is mounted. We will check the cushioning and quote the cylinder with its brackets and coupler.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
