import type { BlogArticleSeed } from '../shared'
import { cylinderStockBlocks } from '../cylinder-stock'

/**
 * Pneumatic cylinder types and the interchange standards. Sources: ISO 15552:2018 published abstract (32–320 mm,
 * 1 000 kPa, basic/mounting/accessory dimensions, single or double rod, with or without magnetic-sensor provision);
 * ISO 6432:2015 scope and note (8–25 mm, mounting dimensions only, "freedom of design"); ISO 21287:2004 title
 * (compact, 20–100 mm) and its published summary on end-cover mountings; Parker P1D Premier catalogue PDE2570TCUK
 * (complies with ISO 6431, ISO 15552, VDMA 24562 and AFNOR; guidance modules; lateral-load rule; −20 to +80 °C);
 * Parker P1F catalogue 0980 (ISO 15552 interchangeability, smooth-profile and tie-rod variants, magnetic piston
 * standard, none on high-temperature version, rod lock behaviour and WH note, CPS needs a magnetic piston); Parker
 * catalogue 0900P-7 (4MA NFPA-interchangeable, 1-1/2 to 8 in, 250 psig, seal temperature ranges, 20 NFPA mounting
 * styles, removable gland, magnetic piston ring, oversize rod numbers, 2MNR non-rotating); Parker SR/SRM product page
 * (non-repairable stainless body, 5/16–3 in, 250 psi, −10 to 165 °F, single or double acting, 12 in max stroke, SRM
 * sensors); SMC C96 operation manual (temperature range narrower with built-in magnet, sunlight/radiant heat/dust,
 * seal replacement). Left out as unsourced: the ANSI/NFPA T3.6.7 clause number, ISO withdrawal dates, which of our
 * P1A/LP/LPM/HB/P5E listings carry a magnet or meet which standard, and any rodless cylinder figures.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'pneumatic-cylinder-types-guide',
  title: 'Pneumatic cylinder types: tie-rod, round-body, compact, guided and rodless — and what ISO 15552, ISO 6432 and NFPA really fix',
  excerpt:
    'Tie-rod and profile, round-body, compact, guided and rodless air cylinders compared; single- vs double-acting; what the ISO 15552, ISO 6432, ISO 21287 and NFPA interchange standards fix (mounting dimensions) and what they leave to the maker (everything inside); and how magnetic pistons make position sensing work.',
  categorySlug: 'pneumatics',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pneumatic Cylinder Types: Tie-Rod, Round-Body, ISO & NFPA',
  seoDescription:
    'Tie-rod, round-body, compact, guided and rodless air cylinders compared, single vs double acting, ISO 15552, ISO 6432, ISO 21287 and NFPA, and magnetic pistons.',
  focusKeyword: 'pneumatic cylinder types',
  publishedAt: '2026-10-22T12:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An interchange standard fixes mounting dimensions, not the cylinder inside. ISO 6432 says outright that it leaves makers free to design — seals, cushioning and temperature limits still come from the maker’s data sheet.',
        'ISO 15552 covers 32–320 mm bores at 10 bar; Parker states its P1D also meets the older ISO 6431 and VDMA 24562. ISO 6432 covers 8–25 mm minis, ISO 21287 20–100 mm compacts. NFPA tie-rod is the inch-bore family.',
        'Parker’s SR round-body cylinders are non-repairable: stainless body, 5/16 to 3 in bores, 250 psi, 12 in maximum stroke. Tie-rod ranges such as Parker 4MA and P1F have service or seal kits.',
        'A magnetic piston is what lets a sensor in the body slot read position. Parker fits one as standard on P1F and 4MA but leaves it out of the high-temperature P1F, where the field is too weak.',
        'If the load pushes sideways, use a guided cylinder or an external guide: Parker says a P1D with significant lateral rod loads must have one.',
      ],
    },
    {
      type: 'lead',
      html: 'Ask for “a 50 mm air cylinder” and you could be sent several designs that share a bore and little else. The body style decides how the cylinder mounts, whether it can be rebuilt and how much side load it tolerates; the interchange standard decides whether another maker’s cylinder will bolt into the same holes. This guide sorts the types, explains what the ISO and NFPA standards actually guarantee, and shows how position sensing works — so an enquiry names the right thing first time.',
    },

    { type: 'section_head', number: '/01', title: 'Five body styles.', anchor: 'body-styles' },
    {
      type: 'prose',
      html: '<h3>Tie-rod and profile-body cylinders</h3><p>The classic industrial cylinder: two end covers clamped to a barrel. On a <strong>tie-rod</strong> cylinder, four rods run outside the barrel and hold the covers on; on a <strong>profile</strong> cylinder, an extruded aluminium body carries the screws and usually the sensor slots. Parker builds both under one ISO 15552 range: its P1F comes as a smooth profile (P1F-S) or as a round tube with stainless tie rods (P1F-T), which Parker describes as the version for heavy-duty applications. In inch bores, Parker’s 4MA — which Parker calls an NFPA-interchangeable cylinder — has an extruded aluminium profile body as standard and a round tube with tie rods as an option, in bores from 1-1/2 to 8 in, rated 250 psig for air service, with a bronze gland that can be removed without taking the cylinder apart.</p><p>These are the cylinders that get rebuilt. Parker lists service kits for 4MA and seal kits for P1F; SMC’s manual for its C96 ISO cylinder lists the rod seal, piston seal, cushion seal and tube gasket as replaceable.</p><h3>Round-body cylinders, non-repairable and repairable</h3><p>A round-body cylinder has a tube with the end caps fixed to it. Many are built to be thrown away when worn rather than resealed. Parker’s SR series is explicitly <strong>non-repairable</strong>: a stainless steel body with aluminium end caps, bores from 5/16 to 3 in, 250 psi maximum, −10 to 165 °F, single- or double-acting, with a maximum stroke of 12 in (304 mm). Repairable round-body designs exist; before relying on one, check that the maker publishes a seal kit for that exact series and bore. Round bodies are light, cheap and compact across the barrel — a good choice for short-stroke, light-duty work where replacing the cylinder is quicker than resealing it.</p><h3>Compact cylinders</h3><p>A compact (short-body) cylinder minimises length for a given stroke, for fixtures, clamps and presses where the space behind the cylinder is tight. ISO 21287 covers compact cylinders from 20 to 100 mm bore in the 10 bar series. Our shelf carries Parker’s inch-bore LP and LPM compact ranges.</p><h3>Guided cylinders</h3><p>A plain cylinder’s rod bearing is not designed to carry the load sideways or stop it twisting. A guided cylinder adds guide rods or shafts on bearings beside the piston rod. Parker’s rod-guidance modules for P1D show the idea: a factory-fitted guide with plain or linear ball bearings lets the cylinder take turning moments and greater transverse forces, connected to the piston rod through a flexible coupling so no stress builds up in the cylinder. On our shelf, Parker’s HB compact slide and P5E guided cylinders (composite bearings, oversize chrome-plated shafts) are guided designs.</p><h3>Rodless cylinders</h3><p>A rodless cylinder moves a carriage along the body instead of pushing a rod out of it, so nothing projects beyond the body at full stroke. We do not list rodless cylinders on this shelf; ask if you need one and we will quote the maker’s range.</p>',
    },
    {
      type: 'comparison_table',
      caption: 'Cylinder body styles at a glance (figures are the named maker’s, for the range quoted)',
      columns: ['Type', 'Interchange standard', 'Example range (maker data)', 'Repairable?', 'Suits'],
      rows: [
        { cells: ['NFPA tie-rod (inch)', 'NFPA mounting styles', 'Parker 4MA: 1-1/2–8 in, 250 psig air', 'Yes — Parker lists service kits', 'Inch-dimension plants, heavy industrial duty'], highlight: true },
        { cells: ['ISO profile or tie-rod (metric)', 'ISO 15552, 32–320 mm', 'Parker P1F: 32–125 mm, 1–10 bar', 'Yes — Parker lists seal kits', 'General metric automation'] },
        { cells: ['Round body, non-repairable', 'Maker-specific (inch); ISO 6432 for 8–25 mm metric minis', 'Parker SR: 5/16–3 in, 250 psi, 12 in max stroke', 'No — replace the cylinder', 'Light, short-stroke duty'] },
        { cells: ['Compact / short body', 'ISO 21287, 20–100 mm', 'Parker LP and LPM (inch bores)', 'Check the maker’s kit list', 'Fixtures and clamps where length is tight'] },
        { cells: ['Guided', 'Maker’s own drawing', 'Parker HB and P5E', 'Check the maker’s kit list', 'Side loads, anti-rotation, precise travel'] },
        { cells: ['Rodless', 'Maker’s own drawing', 'Not listed on our shelf', '—', 'Long strokes in short installed length'] },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Single-acting, double-acting and the variants.', anchor: 'acting' },
    {
      type: 'prose',
      html: '<p>A <strong>double-acting</strong> cylinder has a port at each end: air drives it out and air drives it back, so it can push and pull under control in both directions. The ISO ranges are double-acting as standard — Parker’s P1D and P1F and SMC’s C96 are all listed as double-acting.</p><p>A <strong>single-acting</strong> cylinder is powered one way only and returns on a spring or under the load’s own weight. It needs only a three-port valve and uses no air on the return, at the cost of a return stroke you cannot power or hold with air. Parker offers its SR round-body series both ways.</p><p>Three variants come up often enough to name in an enquiry:</p><ul><li><strong>Double rod (through rod).</strong> The rod exits both covers, so the area and force are the same both ways and the second rod end can carry a cam or stop. ISO 15552 includes double-rod cylinders; Parker’s 4MA offers single or double rod ends, and our shelf has P1F through-rod listings.</li><li><strong>Non-rotating.</strong> Parker’s 2MNR is its non-rotating tie-rod cylinder, for tooling that must not turn on the rod.</li><li><strong>Rod lock.</strong> Parker’s P1F-L has a spring-applied lock in the front cover that clamps the rod when air pressure is lost; its static lock force corresponds to 7 bar. Parker adds that additional measures are required for safety-related applications.</li></ul>',
    },

    { type: 'section_head', number: '/03', title: 'The interchange standards: what they fix, and what they do not.', anchor: 'standards' },
    {
      type: 'prose',
      html: '<p>Pneumatic cylinder standards are <em>dimensional</em> standards. They exist so that a cylinder from one maker fits the brackets, clevises and rod ends of another. They do not specify seal material, cushion capacity, temperature range or service life.</p><h3>ISO 15552 — the main metric family</h3><p>ISO 15552 sets the basic, mounting and accessory dimensions for single- and double-rod cylinders with detachable mountings, bores 32 to 320 mm, maximum 1 000 kPa (10 bar), with or without provision for magnetic sensors. Older drawings often call up ISO 6431 or VDMA 24562 instead: Parker states that its P1D complies with ISO 6431, ISO 15552, VDMA 24562 and the AFNOR installation dimensions, and that its P1F meets ISO 15552 for full interchangeability with any ISO cylinder.</p><h3>ISO 6432 — mini round-body cylinders</h3><p>ISO 6432 covers single-rod cylinders from 8 to 25 mm bore, 10 bar maximum. Its scope is the clearest statement of what any of these standards does: it establishes the mounting dimensions required for interchangeability, and a note says it allows manufacturers freedom of design and does not restrict technical development.</p><h3>ISO 21287 — compact cylinders</h3><p>ISO 21287 covers compact cylinders, 10 bar series, bores 20 to 100 mm. Its published summary notes that 20 and 25 mm compacts take end-cover mountings to ISO 21287, while 32 to 100 mm compacts take ISO 15552 end-cover mountings.</p><h3>NFPA — the inch-bore family</h3><p>North American tie-rod air cylinders follow NFPA mounting dimensions, with each mounting style given an NFPA code. Parker’s 4MA catalogue lists 20 standard mounting styles against their NFPA codes — MS1 side end angles, MF1 head rectangular flange, MP1 cap fixed clevis, MT4 intermediate trunnion, MX0 no mount and so on. An NFPA cylinder will not drop into an ISO 15552 bracket, or the reverse: the bores, rod threads and port threads are inch on one and metric on the other (Parker’s 4MA ships NPTF ports as standard, the P1F G threads).</p><h3>What still differs between “interchangeable” cylinders</h3><ul><li><strong>Temperature range.</strong> Parker’s P1D is rated −20 to +80 °C; SMC’s C96 −20 to +70 °C, narrowing to −10 to +60 °C with a built-in magnet; Parker’s 4MA with standard seals −23 to +74 °C.</li><li><strong>Cushioning.</strong> Each maker publishes its own cushion capacity — see our <a href="/blog/pneumatic-cylinder-cushioning-and-mounting">cushioning and mounting guide</a>.</li><li><strong>Sensors.</strong> Slot shape and sensor families are maker-specific.</li><li><strong>Variants within a range.</strong> Parker notes that the rod extension (WH) on a P1F with rod lock is <em>not</em> to the ISO dimension, so a rod guidance module needs an extended rod.</li></ul><p>When you replace a cylinder with another maker’s “equivalent”, check the bore, stroke, rod end and mounting against the standard, and check the temperature, cushioning and sensor against the new maker’s data sheet.</p>',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 15552',
      publisher: 'ISO',
      title: 'Pneumatic fluid power — Cylinders with detachable mountings, 1 000 kPa (10 bar) series, bores from 32 mm to 320 mm — Basic, mounting and accessories dimensions',
      summary:
        'Sets a metric series of basic, mounting and accessory dimensions so that single- and double-rod pneumatic cylinders, with or without provision for magnetic sensors, are interchangeable. Maximum rated pressure 1 000 kPa (10 bar). It is a dimensional standard: it does not set seal materials, cushioning capacity or temperature range, which come from each maker’s data.',
      edition: '2018',
    },
    {
      type: 'standard_citation',
      standard: 'ISO 6432',
      publisher: 'ISO',
      title: 'Pneumatic fluid power — Single rod cylinders, 1 000 kPa (10 bar) series, bores from 8 mm to 25 mm — Basic and mounting dimensions',
      summary:
        'Establishes the metric mounting dimensions needed for interchangeability of commonly used pneumatic cylinders up to 10 bar. A note in the scope states that it allows manufacturers freedom of design and does not restrict technical development.',
      edition: '2015',
    },

    { type: 'section_head', number: '/04', title: 'Magnetic pistons and position sensing.', anchor: 'sensing' },
    {
      type: 'prose',
      html: '<p>The usual way to read an air cylinder’s position is a sensor fitted in a slot on the body. The sensor reads a <strong>magnet on the piston</strong> through the non-magnetic aluminium or stainless barrel, so it needs no hole in the cylinder and can be slid along to set the switching point. No magnet, no signal — so a magnetic piston is worth specifying even when you have no sensor yet.</p><ul><li><strong>Parker P1F</strong> has a magnetic piston as standard; Parker’s continuous position sensor (CPS) for it requires one.</li><li><strong>Parker 4MA</strong> includes a magnetic piston ring as a standard feature, with integrated sensor grooves in the extruded body, though the order code also offers lip-seal and bumper pistons without the ring. Our 4MA listings name the piston type where the part numbers share one — “Lipseals and Magnetic Ring”, “Bumper Seals”.</li><li><strong>Parker SR and SRM.</strong> Parker says the SRM can be ordered with reed or solid-state sensors that adjust anywhere along the body.</li></ul><p><strong>Heat is the limit.</strong> Parker builds its high-temperature P1F (to +150 °C) <em>without</em> a magnetic piston, because the magnetic field strength at high temperature is too low for reliable sensing. SMC narrows its C96 range from −20 to +70 °C to −10 to +60 °C when a magnet is fitted. On a Gulf site, a cylinder mounted in direct sun or near a furnace can exceed those figures even when the air temperature does not — SMC’s manual says not to expose the cylinder to direct sunlight for long periods or to radiant heat, and not to use it in dusty locations. Shade or shield the cylinder, or choose a range rated for the heat.</p>',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'A rod lock or a cylinder is not a safety device on its own.',
      body: 'Parker states that its P1F rod lock needs additional measures in safety-related applications, and SMC warns that a clamp or suspended load can drop if circuit pressure falls after a power failure. Where a falling or released load could injure someone, design the circuit for it — do not rely on the cylinder alone.',
    },

    { type: 'section_head', number: '/05', title: 'Choosing a type.', anchor: 'choosing' },
    {
      type: 'decision_tree',
      heading: 'Which cylinder type?',
      branches: [
        { condition: 'Replacing an existing cylinder on an inch-dimension machine?', outcome: 'NFPA tie-rod — match bore, stroke, rod end and the NFPA mounting code (e.g. Parker 4MA).' },
        { condition: 'New metric machine, or replacing an ISO 6431 / VDMA 24562 cylinder?', outcome: 'ISO 15552 profile or tie-rod — Parker P1D or P1F.' },
        { condition: 'Short stroke, light duty, cheaper to replace than repair?', outcome: 'Non-repairable round body — Parker SR, or SRM if you need sensors.' },
        { condition: 'Very little length behind the cylinder?', outcome: 'Compact cylinder — ISO 21287 in metric, Parker LP/LPM in inch bores.' },
        { condition: 'Load pushes sideways, or the tooling must not rotate?', outcome: 'Guided cylinder (Parker HB, P5E), an external guide, or a non-rotating cylinder (Parker 2MNR).' },
        { condition: 'Must hold position if air is lost?', outcome: 'Rod-lock cylinder (Parker P1F-L) — plus a circuit designed for the failure, not the lock alone.' },
        { condition: 'Need end-of-stroke signals?', outcome: 'Specify a magnetic piston, and check its temperature limit against the site.' },
      ],
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'What are the main types of pneumatic cylinder?', answer: 'Tie-rod and profile-body cylinders (NFPA in inch bores, ISO 15552 in metric), round-body cylinders (often non-repairable), compact short-body cylinders, guided cylinders and rodless cylinders. Each can be single- or double-acting.' },
        { question: 'What is the difference between ISO 15552 and ISO 6432?', answer: 'ISO 15552 covers cylinders with detachable mountings from 32 to 320 mm bore. ISO 6432 covers small single-rod cylinders from 8 to 25 mm bore. Both are 10 bar series and both fix mounting dimensions only.' },
        { question: 'Is ISO 15552 the same as ISO 6431 and VDMA 24562?', answer: 'They describe the same family of metric cylinder mounting dimensions, and older drawings often cite ISO 6431 or VDMA 24562. Parker, for example, states its P1D complies with ISO 6431, ISO 15552, VDMA 24562 and AFNOR installation dimensions.' },
        { question: 'Are ISO cylinders from different makers fully interchangeable?', answer: 'Their mounting and accessory dimensions are. Seals, cushioning, temperature range and sensors are not set by the standard — ISO 6432 explicitly leaves makers freedom of design — so check those on the new maker’s data sheet.' },
        { question: 'What does non-repairable mean on a round-body air cylinder?', answer: 'The end caps are fixed to the tube, so seals cannot be replaced; when it wears out, you replace the cylinder. Parker’s SR series is an example. Tie-rod cylinders such as Parker 4MA and P1F have seal or service kits.' },
        { question: 'Why does a pneumatic cylinder need a magnetic piston?', answer: 'Sensors in the body slot detect the magnet on the piston through the barrel. Without it the cylinder cannot report its position. Check the temperature limit: Parker omits the magnet on high-temperature P1F cylinders, and SMC narrows its C96 rating with a magnet fitted.' },
        { question: 'When do I need a guided pneumatic cylinder?', answer: 'When the load is offset, pushes sideways or must not rotate. Parker states that a P1D with significant lateral loads on the piston rod must have an external guide to achieve its service life.' },
      ],
    },

    { type: 'section_head', number: '/06', title: 'What we list.', anchor: 'what-we-list' },
    ...cylinderStockBlocks(
      '<p>Every listing on our pneumatic cylinder shelf is linked below — 207 maker ranges, nearly all Parker (4MA and 2MNR tie-rod, P1D and P1F ISO, SR-family round body, LP compact, HB and P5E guided) plus Destaco. Each listing carries the maker’s part numbers; send us the part number, or bore, stroke, mounting and rod end, and we will quote.</p>'
    ),
    {
      type: 'product_embed',
      heading: 'One of each type',
      skus: [
        'IH-PAR-4MA-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-2-INCH-BOR',
        'IH-PAR-P1F-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-SMOOTH-6',
        'IH-PAR-P1D-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-COMPOS-4',
        'IH-PAR-SR-SERIES-AIR-CYLINDERS-1-1-2-INCH-BORE',
        'IH-PAR-SRM-SERIES-AIR-CYLINDERS-1-1-2-INCH-BORE',
        'IH-PAR-LP-SERIES-COMPACT-PNEUMATIC-CYLINDERS-2-INCH-BORE',
        'IH-PAR-P5E-SERIES-GUIDED-PNEUMATIC-CYLINDERS-COMPOSITE-B',
        'IH-PAR-2MNR-SERIES-TIE-ROD-PNEUMATIC-CYLINDERS-2-INCH-BO',
      ],
    },
    { type: 'category_link', slug: 'pneumatic-cylinders', label: 'Pneumatic cylinders', blurb: 'NFPA and ISO tie-rod, round-body, compact and guided air cylinders.' },
    { type: 'category_link', slug: 'pneumatics', label: 'All pneumatics', blurb: 'Cylinders, valves, FRLs, tubing, fittings, grippers, vacuum and air motors.' },
    {
      type: 'related_articles',
      slugs: [
        'how-to-size-a-pneumatic-cylinder',
        'pneumatic-cylinder-cushioning-and-mounting',
        'solenoid-valve-functions-3-2-5-2-5-3',
        'cylinder-speed-control-and-quick-exhaust-valves',
        'pneumatic-grippers-and-vacuum-guide',
        'compressed-air-quality-iso-8573-1',
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-10-22',
      note: 'Standard scopes from ISO’s published abstracts; range data from Parker catalogues 0900P-7, 0980 and PDE2570TCUK, Parker’s SR/SRM page and SMC’s C96 manual.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing or specifying a cylinder?',
      body: 'Send us the maker’s part number, or the bore, stroke, mounting style, rod end and whether you need a magnetic piston. We will match the range and quote.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
