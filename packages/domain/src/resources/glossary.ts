/**
 * The hydraulic glossary behind `/resources/hydraulic-glossary`.
 *
 * Written for this site, in the register of the rest of it: what the word means
 * at the counter, what it is confused with, and what to measure. Each term has
 * a stable slug so posts, product pages and the other reference pages can link
 * straight to `#slug`, and `see` names other terms by slug so the page can
 * render cross-references as in-page links. A test checks every `see` slug
 * resolves — a cross-reference to nothing is worse than none.
 *
 * Definitions state facts a reader can check against the standard named. Where
 * a figure is a common convention rather than a rule (proof at twice working
 * pressure), the definition says "typically".
 */

export interface GlossaryTerm {
  readonly term: string
  readonly slug: string
  readonly definition: string
  /** Other terms, by slug. */
  readonly see?: readonly string[]
  /** One page on this site that takes the reader further. */
  readonly link?: { readonly href: string; readonly label: string }
}

const RAW: readonly GlossaryTerm[] = [
  {
    term: 'Adapter',
    slug: 'adapter',
    definition:
      'A fitting that joins two connections, usually of different types or sizes — a JIC male to an NPT male, say. Unlike a hose end, it has no hose tail.',
    see: ['hose-end', 'stacking'],
    link: { href: '/c/hydraulic-adapters', label: 'Hydraulic adapters' },
  },
  {
    term: 'Adjustable stud end',
    slug: 'adjustable-stud-end',
    definition:
      'A straight-thread port end (ORB, ORFS or metric O-ring) with a locknut and backup washer, so an elbow or tee can be turned to face the right way before the nut is tightened. Rated below the fixed version of the same end.',
    see: ['o-ring-boss', 'locknut'],
  },
  {
    term: 'AN fitting',
    slug: 'an-fitting',
    definition:
      'The aerospace 37° flare fitting. It shares its seat angle and thread with JIC, but is made to tighter tolerances; JIC parts should not be substituted into AN systems.',
    see: ['jic-37'],
  },
  {
    term: 'Banjo fitting',
    slug: 'banjo-fitting',
    definition:
      'A ring-shaped fitting held to a port by a hollow bolt, with a seal washer either side. It turns the flow through 90° in very little space.',
    see: ['bonded-seal'],
  },
  {
    term: 'Bend radius (minimum)',
    slug: 'minimum-bend-radius',
    definition:
      'The tightest radius a hose may be bent to in service, measured to the inside of the bend. Bending tighter shortens hose life sharply; the figure is printed in the hose datasheet for each size.',
    see: ['drop-length', 'compact-hose'],
    link: { href: '/blog/hose-routing-bend-radius-twist', label: 'Hose routing and bend radius' },
  },
  {
    term: 'Bite-type fitting',
    slug: 'bite-type-fitting',
    definition:
      'A compression fitting for plain-end tube in which a ring or sleeve bites into the tube wall as the nut is made up. DIN 2353 (now ISO 8434-1) and SAE flareless fittings both work this way.',
    see: ['cutting-ring', 'din-2353', 'flareless-fitting'],
    link: { href: '/c/flareless-bite-type-tube-fittings', label: 'Flareless tube fittings' },
  },
  {
    term: 'Bonded seal',
    slug: 'bonded-seal',
    definition:
      'A steel washer with a rubber ring bonded to its bore, used to seal parallel threads such as BSPP and metric on a flat port face. Often called a Dowty washer. Use a new one every time.',
    see: ['bspp'],
  },
  {
    term: 'BSPP',
    slug: 'bspp',
    definition:
      'British Standard Pipe Parallel, ISO 228-1, written G1/2 and so on. A 55° parallel thread that does not seal on the thread: it needs a bonded washer, an O-ring or a 60° cone in a female swivel.',
    see: ['bspt', 'bonded-seal', 'jis-30-flare'],
    link: { href: '/resources/thread-chart#bsp-jis', label: 'BSP thread dimensions' },
  },
  {
    term: 'BSPT',
    slug: 'bspt',
    definition:
      'British Standard Pipe Taper, ISO 7-1, written R1/2 for the male and Rc1/2 for the female. Same pitch and diameter as BSPP, but tapered, so it seals on the thread. It does not interchange with NPT.',
    see: ['bspp', 'npt'],
  },
  {
    term: 'Bulkhead fitting',
    slug: 'bulkhead-fitting',
    definition:
      'A fitting with a long threaded body that passes through a panel or tank wall and is clamped either side by a locknut.',
    see: ['locknut'],
  },
  {
    term: 'Burst pressure',
    slug: 'burst-pressure',
    definition:
      'The pressure at which a hose or fitting fails in a test. Never a working figure: hydraulic hose is rated so that working pressure is a quarter of minimum burst.',
    see: ['safety-factor', 'working-pressure'],
  },
  {
    term: 'Code 61 / Code 62 flange',
    slug: 'code-61-code-62',
    definition:
      'The two pressure classes of SAE J518 four-bolt flange. Code 61 is standard pressure, Code 62 high pressure, with a thicker head and wider bolt spacing at the same size. They do not interchange.',
    see: ['four-bolt-flange'],
    link: { href: '/blog/sae-j518-code-61-code-62-flanges', label: 'Telling Code 61 and Code 62 apart' },
  },
  {
    term: 'Compact hose',
    slug: 'compact-hose',
    definition:
      'Hose built to a smaller outside diameter and tighter bend radius than the standard grade at the same pressure — SAE 100R16, R17 and the EN 857 1SC/2SC types.',
    see: ['sae-100r', 'minimum-bend-radius'],
  },
  {
    term: 'Cone seat',
    slug: 'cone-seat',
    definition:
      'The angled sealing face a flared or swivel fitting seals on. The angle names the family: 37° JIC, 45° SAE, 30° JIS and Komatsu, 24° DIN, 60° BSP. Different angles never seal on each other.',
    see: ['jic-37', 'jis-30-flare', 'din-2353'],
  },
  {
    term: 'Crimp diameter',
    slug: 'crimp-diameter',
    definition:
      'The outside diameter of a ferrule after crimping, measured with calipers halfway between the die ridges. It is set for one maker’s hose in that maker’s fitting series, and is the check that a crimp is right.',
    see: ['crimping', 'ferrule', 'one-piece-fitting'],
    link: { href: '/resources/crimp-specifications', label: 'Crimp specifications' },
  },
  {
    term: 'Crimping',
    slug: 'crimping',
    definition:
      'Permanently attaching a hose fitting by squeezing its ferrule onto the hose in a set of dies, to a stated crimp diameter.',
    see: ['crimp-diameter', 'die-set', 'skiving'],
    link: { href: '/blog/hydraulic-hose-crimp-faults', label: 'Crimp too tight, crimp too loose' },
  },
  {
    term: 'Cutting ring',
    slug: 'cutting-ring',
    definition:
      'The hardened ring in a DIN 2353 / ISO 8434-1 fitting that bites into metric tube on the 24° cone. Pre-set it before final assembly, and do not reuse it on new tube.',
    see: ['bite-type-fitting', 'din-2353'],
  },
  {
    term: 'Dash size',
    slug: 'dash-size',
    definition:
      'A size in sixteenths of an inch: -8 is 8/16, or 1/2". On hose it is the nominal bore; on JIC and SAE fittings it is the tube outside diameter the fitting suits.',
    see: ['nominal-size', 'tube-od'],
    link: { href: '/tools/dash-size-chart', label: 'Dash size chart' },
  },
  {
    term: 'Die set',
    slug: 'die-set',
    definition:
      'The segmented jaws a crimper closes around a ferrule. Each set covers a range of diameters; using the wrong one gives a crimp that measures right in one place and wrong in another.',
    see: ['crimping'],
  },
  {
    term: 'DIN 2353',
    slug: 'din-2353',
    definition:
      'The German standard for 24° cone bite-type tube fittings, now published as ISO 8434-1. Comes in LL (extra light), L (light) and S (heavy) series, named by tube outside diameter in millimetres.',
    see: ['cutting-ring', 'iso-8434'],
    link: { href: '/resources/thread-chart#din-24-cone', label: '24° cone threads by series' },
  },
  {
    term: 'Drop length',
    slug: 'drop-length',
    definition:
      'On a hose elbow, the distance from the hose centreline to the sealing face of the connection. Short, medium and long drop elbows exist to clear neighbouring fittings.',
    see: ['elbow'],
  },
  {
    term: 'Dryseal thread',
    slug: 'dryseal',
    definition:
      'A taper thread made so the crests and roots crush together and seal without sealant — NPTF is the common one.',
    see: ['npt'],
  },
  {
    term: 'Elbow',
    slug: 'elbow',
    definition:
      'A fitting that turns the line through an angle, usually 45° or 90°. Specify the angle, both ends and, for hose elbows, the drop length.',
    see: ['drop-length', 'adjustable-stud-end'],
  },
  {
    term: 'EN 853, EN 856, EN 857',
    slug: 'en-853-856-857',
    definition:
      'The European hydraulic hose standards: EN 853 for wire-braided hose (1SN, 2SN), EN 856 for spiral hose (4SP, 4SH, R12, R13), EN 857 for compact braid (1SC, 2SC).',
    see: ['sae-100r', 'spiral-hose'],
    link: { href: '/blog/en-853-856-857-vs-sae-100r', label: 'EN against SAE 100R' },
  },
  {
    term: 'Female swivel',
    slug: 'female-swivel',
    definition:
      'A female end whose nut turns freely on the fitting body, so a hose can be connected without twisting it.',
    see: ['cone-seat', 'twist'],
  },
  {
    term: 'Ferrule',
    slug: 'ferrule',
    definition:
      'The outer shell of a hose fitting that is crimped down onto the hose. On a one-piece fitting it is permanently attached to the insert; on a two-piece fitting it is a separate part.',
    see: ['crimp-diameter', 'insert', 'one-piece-fitting'],
  },
  {
    term: 'Flareless fitting',
    slug: 'flareless-fitting',
    definition:
      'An SAE J514 compression fitting for inch tube that seals with a sleeve biting into the tube on a 24° seat, so the tube needs no flaring. Same thread as JIC.',
    see: ['bite-type-fitting', 'jic-37'],
    link: { href: '/c/flareless-bite-type-tube-fittings', label: 'Flareless tube fittings' },
  },
  {
    term: 'Flat-face coupler',
    slug: 'flat-face-coupler',
    definition:
      'A quick coupler whose two halves meet on flat faces, so almost no oil is lost and no air is drawn in on connection. The interchange is ISO 16028.',
    see: ['quick-coupler'],
  },
  {
    term: 'Four-bolt flange',
    slug: 'four-bolt-flange',
    definition:
      'A port connection to SAE J518 / ISO 6162: a flange head with an O-ring, clamped to the port face by two half clamps and four bolts. Used from 1/2" upward where threads would be too large to tighten.',
    see: ['code-61-code-62'],
    link: { href: '/resources/thread-chart#four-bolt-flange', label: 'Flange bolt spacings' },
  },
  {
    term: 'Hose assembly',
    slug: 'hose-assembly',
    definition:
      'A length of hose with a fitting crimped or attached at each end, cut, built and tested as one part.',
    see: ['crimping', 'proof-test'],
    link: { href: '/blog/hydraulic-hose-assembly-guide', label: 'Hose assembly guide' },
  },
  {
    term: 'Hose bore',
    slug: 'hose-bore',
    definition:
      'The nominal inside diameter of a hose, given as a dash size or in inches. For most hose the dash is the bore in sixteenths; SAE 100R5 and PTFE hose follow tube O.D. instead.',
    see: ['dash-size'],
  },
  {
    term: 'Hose end',
    slug: 'hose-end',
    definition:
      'The fitting on the end of a hose: an insert for the hose bore, a ferrule over it, and a connection at the other end.',
    see: ['ferrule', 'insert'],
  },
  {
    term: 'Impulse test',
    slug: 'impulse-test',
    definition:
      'A fatigue test in which a hose assembly is pressurised and released hundreds of thousands of times at temperature, to SAE J343 or ISO 6803. It is what separates hose grades of the same burst pressure.',
    see: ['burst-pressure'],
  },
  {
    term: 'Insert',
    slug: 'insert',
    definition:
      'The stem of a hose fitting that goes inside the hose bore. Also called the nipple or tail.',
    see: ['ferrule', 'hose-end'],
  },
  {
    term: 'Inverted flare',
    slug: 'inverted-flare',
    definition:
      'An SAE J512 connection in which a double-flared tube end is held by a male nut on a 42° seat in the female body. Automotive brake and fuel lines.',
    see: ['sae-45-flare'],
    link: { href: '/resources/thread-chart#sae-inverted-flare', label: 'Inverted flare threads' },
  },
  {
    term: 'ISO 16028',
    slug: 'iso-16028',
    definition: 'The interchange standard for flat-face hydraulic quick couplers.',
    see: ['flat-face-coupler'],
  },
  {
    term: 'ISO 6149',
    slug: 'iso-6149',
    definition:
      'Metric straight-thread ports and stud ends that seal with an O-ring in a chamfer, like SAE ORB. The port carries a ring groove on its spot face to identify it.',
    see: ['o-ring-boss', 'metric-thread'],
  },
  {
    term: 'ISO 7241',
    slug: 'iso-7241',
    definition:
      'The interchange standard for poppet and ball quick couplers. Series A is the European pattern, Series B the North American; the two do not connect to each other.',
    see: ['quick-coupler'],
  },
  {
    term: 'ISO 8434',
    slug: 'iso-8434',
    definition:
      'The international tube fitting standard: part 1 is the 24° cone (formerly DIN 2353), part 2 the 37° flare, part 3 ORFS.',
    see: ['din-2353', 'jic-37', 'orfs'],
  },
  {
    term: 'JIC 37°',
    slug: 'jic-37',
    definition:
      'The SAE J514 flare fitting: a UN/UNF straight thread and a 37° cone that seals metal to metal. The most common hydraulic fitting on American machines, and rated to about 5,000 psi in small sizes.',
    see: ['an-fitting', 'cone-seat', 'unf'],
    link: { href: '/blog/where-jic-is-the-wrong-choice', label: 'Where JIC is the wrong choice' },
  },
  {
    term: 'JIS 30° flare',
    slug: 'jis-30-flare',
    definition:
      'The Japanese flare fitting: a BSPP thread with a 30° seat. Looks like a BSP or JIC fitting and seals on neither.',
    see: ['bspp', 'cone-seat', 'komatsu-flare'],
  },
  {
    term: 'Knurl',
    slug: 'knurl',
    definition:
      'A band of fine diamond or straight ridges rolled onto a part. On some ferrules it marks how far the crimp dies are set, which crimp charts give as "crimp to knurl".',
    see: ['crimp-diameter'],
  },
  {
    term: 'Komatsu 30° flare',
    slug: 'komatsu-flare',
    definition:
      'A Japanese flare fitting with a metric parallel thread and a 30° seat, used on Komatsu machines. Not the same as the JIS 30° flare, which uses a BSP thread.',
    see: ['jis-30-flare', 'metric-thread'],
    link: { href: '/resources/thread-chart#komatsu-30-flare', label: 'Komatsu thread sizes' },
  },
  {
    term: 'Layline',
    slug: 'layline',
    definition:
      'The printing along a hose cover: maker, grade, standard, size, working pressure and production date. Read it before ordering a replacement.',
    see: ['sae-100r'],
    link: { href: '/blog/how-to-read-a-hose-layline', label: 'Reading a hose layline' },
  },
  {
    term: 'Locknut',
    slug: 'locknut',
    definition:
      'The nut that clamps a bulkhead fitting to a panel, or that holds an adjustable stud end in position against its backup washer.',
    see: ['bulkhead-fitting', 'adjustable-stud-end'],
  },
  {
    term: 'Make-up torque',
    slug: 'make-up-torque',
    definition:
      'The torque, or the flats or turns past finger tight, a connection is tightened to. Too little and it weeps, too much and the seat or thread is damaged.',
    see: ['weeping'],
    link: { href: '/blog/hydraulic-fitting-make-up-torque', label: 'How tight is tight' },
  },
  {
    term: 'Metric thread',
    slug: 'metric-thread',
    definition:
      'An ISO 261 thread named by its real size: M18×1.5 measures 18 mm across the crests with 1.5 mm between them. Not every "metric fitting" has one — BSP and JIS fittings are often called metric too.',
    see: ['iso-6149', 'din-2353'],
    link: { href: '/resources/thread-chart#metric-ports', label: 'Metric thread sizes' },
  },
  {
    term: 'Minimum burst pressure',
    slug: 'minimum-burst-pressure',
    definition:
      'The lowest pressure at which a hose or fitting may burst in a qualification test. Working pressure is set from it by the safety factor.',
    see: ['burst-pressure', 'safety-factor'],
  },
  {
    term: 'Nominal size',
    slug: 'nominal-size',
    definition:
      'The name of a size rather than a measurement. A 1/2" NPT thread measures 0.840" across; a -8 hose has a bore near, but not exactly, 1/2".',
    see: ['dash-size'],
  },
  {
    term: 'NPSM',
    slug: 'npsm',
    definition:
      'National Pipe Straight Mechanical: a straight pipe thread used on female swivels, sealing on a 30° seat. It mates a chamfered NPTF male.',
    see: ['npt', 'female-swivel'],
    link: { href: '/blog/npt-npsm-and-sae-hose-fittings', label: 'NPT, NPSM and SAE fittings' },
  },
  {
    term: 'NPT / NPTF',
    slug: 'npt',
    definition:
      'National Pipe Taper (ASME B1.20.1) and its Dryseal version NPTF (B1.20.3). A 60° tapered thread that seals on the thread — NPT with sealant, NPTF by crushing its crests. Rated well below straight-thread ends at larger sizes.',
    see: ['dryseal', 'npsm', 'bspt'],
    link: { href: '/blog/stopping-an-npt-thread-leak', label: 'Stopping an NPT leak' },
  },
  {
    term: 'O-ring boss (ORB)',
    slug: 'o-ring-boss',
    definition:
      'The SAE J1926 straight-thread port: a UN/UNF thread with an O-ring on the male that seals in a chamfer at the port face. Same thread as JIC; different seal.',
    see: ['adjustable-stud-end', 'jic-37', 'iso-6149'],
    link: { href: '/c/orb-adapters', label: 'ORB adapters' },
  },
  {
    term: 'One-piece fitting',
    slug: 'one-piece-fitting',
    definition:
      'A crimp fitting whose ferrule is permanently attached to the insert, so no separate ferrule is ordered. Most modern hydraulic hose fittings are one-piece.',
    see: ['two-piece-fitting', 'ferrule'],
  },
  {
    term: 'ORFS',
    slug: 'orfs',
    definition:
      'O-ring face seal, SAE J1453: an O-ring in a groove on the male face is squeezed against the flat female face. Rated to 6,000 psi in sizes to 1", and the usual cure for a joint that will not stop weeping.',
    see: ['iso-8434'],
    link: { href: '/resources/thread-chart#orfs', label: 'ORFS thread sizes' },
  },
  {
    term: 'Pitch',
    slug: 'pitch',
    definition:
      'The distance between thread crests: in millimetres for metric threads, or given as threads per inch for inch threads.',
    see: ['tpi', 'pitch-gauge'],
  },
  {
    term: 'Pitch gauge',
    slug: 'pitch-gauge',
    definition:
      'A set of toothed blades, each cut to one pitch. The blade that sits in the thread with no light under it gives the pitch.',
    see: ['pitch'],
    link: { href: '/blog/identify-any-hydraulic-fitting', label: 'Identify any fitting in four steps' },
  },
  {
    term: 'Port',
    slug: 'port',
    definition:
      'The threaded or flanged opening in a pump, valve, cylinder or manifold that a fitting screws into.',
    see: ['o-ring-boss', 'iso-6149', 'four-bolt-flange'],
  },
  {
    term: 'Pressure rating',
    slug: 'pressure-rating',
    definition:
      'The maximum working pressure a fitting or hose is recommended for. For a joint it is the lower of the two ends; for an assembly, the lowest of the hose and both fittings.',
    see: ['working-pressure', 'safety-factor'],
    link: { href: '/resources/fitting-pressure-ratings', label: 'Fitting pressure ratings' },
  },
  {
    term: 'Proof test',
    slug: 'proof-test',
    definition:
      'Holding a finished hose assembly at a pressure above its working pressure — typically twice it — to show the assembly holds before it ships.',
    see: ['hose-assembly', 'burst-pressure'],
  },
  {
    term: 'Push-lock fitting',
    slug: 'push-lock-fitting',
    definition:
      'A barbed fitting pushed into a matching push-lock hose with no clamp or crimp. For low-pressure air, water and oil only.',
    link: { href: '/c/brass-push-lock-hose-barbs', label: 'Push-lock hose barbs' },
  },
  {
    term: 'Quick coupler',
    slug: 'quick-coupler',
    definition:
      'A two-half connector that joins and separates a line by hand, usually with valves that close as it parts. Named by its interchange: ISO 7241 A or B, ISO 16028 flat face, ISO 5675 agricultural.',
    see: ['iso-7241', 'iso-16028', 'flat-face-coupler'],
    link: { href: '/blog/hydraulic-quick-couplers-iso-7241', label: 'Quick couplers explained' },
  },
  {
    term: 'Reusable fitting',
    slug: 'reusable-fitting',
    definition:
      'A hose end assembled with spanners rather than a crimper — the socket screws onto the hose and the insert screws into it. Useful in the field; rated below a crimped fitting.',
    see: ['crimping'],
    link: { href: '/c/reusable-hose-ends', label: 'Reusable hose ends' },
  },
  {
    term: 'Run tee and branch tee',
    slug: 'run-tee-branch-tee',
    definition:
      'A tee with one end different from the other two. On a run tee the odd end is in line with one other; on a branch tee it is the side outlet.',
  },
  {
    term: 'SAE 100R',
    slug: 'sae-100r',
    definition:
      'The SAE J517 hose types, 100R1 to 100R19. The number names a construction, not a rank: R2 is two-wire braid, R12 four-spiral, R14 PTFE.',
    see: ['en-853-856-857', 'compact-hose'],
    link: { href: '/blog/sae-100r-hose-types', label: 'SAE 100R types explained' },
  },
  {
    term: 'SAE 45° flare',
    slug: 'sae-45-flare',
    definition:
      'The SAE J512 flare fitting with a 45° seat, for low-pressure fuel, refrigerant and air lines. Not interchangeable with 37° JIC.',
    see: ['jic-37', 'inverted-flare'],
    link: { href: '/resources/thread-chart#sae-45-flare', label: 'SAE 45° flare threads' },
  },
  {
    term: 'Safety factor',
    slug: 'safety-factor',
    definition:
      'The ratio of minimum burst pressure to working pressure. Hydraulic hose and fittings are rated at 4:1.',
    see: ['burst-pressure', 'working-pressure'],
  },
  {
    term: 'Skiving',
    slug: 'skiving',
    definition:
      'Removing the cover (external skive) or inner tube (internal skive) from the end of a hose before fitting it, so the fitting grips the wire. Required by some fittings and forbidden by others.',
    see: ['crimping'],
    link: { href: '/blog/skiving-and-fitting-selection', label: 'Skiving explained' },
  },
  {
    term: 'Spiral hose',
    slug: 'spiral-hose',
    definition:
      'Hose reinforced with four or six layers of steel wire laid in spirals rather than braided — SAE 100R12, R13, R15 and EN 856 4SP and 4SH. Used for high pressure and heavy impulse duty.',
    see: ['wire-braid', 'en-853-856-857'],
  },
  {
    term: 'Stacking',
    slug: 'stacking',
    definition:
      'Screwing adapters into each other to get from one connection to another. Every extra joint is another leak path and another lever on the port.',
    see: ['adapter'],
  },
  {
    term: 'STAMPED',
    slug: 'stamped',
    definition:
      'A checklist for specifying hose: Size, Temperature, Application, Media, Pressure, Ends, Delivery. Missing any one is the usual cause of a wrong hose.',
    link: { href: '/blog/hydraulic-hose-assembly-guide', label: 'Specifying a hose assembly' },
  },
  {
    term: 'Taper thread',
    slug: 'taper-thread',
    definition:
      'A thread whose diameter changes along its length, so it tightens and seals as it goes in. NPT and BSPT are taper threads; a straight edge along the male shows the taper.',
    see: ['npt', 'bspt'],
  },
  {
    term: 'TPI',
    slug: 'tpi',
    definition: 'Threads per inch: the pitch of an inch thread, counted along one inch of its length.',
    see: ['pitch', 'pitch-gauge'],
  },
  {
    term: 'Tube O.D.',
    slug: 'tube-od',
    definition:
      'The outside diameter of rigid tube. Tube fittings are named by it, unlike pipe, which is named by a nominal size.',
    see: ['dash-size', 'nominal-size'],
  },
  {
    term: 'Twist',
    slug: 'twist',
    definition:
      'A hose installed twisted along its length. Even a few degrees shortens its life badly; the layline shows it as a spiral.',
    see: ['female-swivel', 'layline'],
  },
  {
    term: 'Two-piece fitting',
    slug: 'two-piece-fitting',
    definition:
      'A crimp fitting in which the insert and the ferrule are separate parts, ordered and assembled together. Still common on larger sizes and older lines.',
    see: ['one-piece-fitting', 'ferrule'],
  },
  {
    term: 'UNF / UN thread',
    slug: 'unf',
    definition:
      'The Unified inch straight thread (ASME B1.1) used on JIC, ORB, ORFS and flareless fittings. Written as diameter and TPI: 9/16-18.',
    see: ['jic-37', 'o-ring-boss', 'orfs'],
    link: { href: '/resources/thread-chart#unf-jic-orb-flareless', label: 'UNF thread dimensions' },
  },
  {
    term: 'Weeping',
    slug: 'weeping',
    definition:
      'A slow seep of oil from a joint, not enough to drip quickly. Usually a damaged seat, a hard or missing O-ring, or a joint tightened wrong.',
    see: ['make-up-torque', 'orfs'],
    link: { href: '/blog/reading-a-weeping-joint', label: 'Reading a weeping joint' },
  },
  {
    term: 'Whip restraint',
    slug: 'whip-restraint',
    definition:
      'A cable or sleeve anchored either side of a hose fitting so that, if the fitting lets go under pressure, the hose cannot thrash.',
    link: { href: '/blog/hose-whip-restraint-and-burst-protection', label: 'Whip restraints' },
  },
  {
    term: 'Wire braid',
    slug: 'wire-braid',
    definition:
      'Hose reinforcement of steel wire woven at an angle — one braid for SAE 100R1 and EN 853 1SN, two for 100R2 and 2SN.',
    see: ['spiral-hose', 'sae-100r'],
  },
  {
    term: 'Working pressure',
    slug: 'working-pressure',
    definition:
      'The highest pressure a hose or fitting is rated to carry continuously, including surges. Also written MWP, maximum working pressure.',
    see: ['pressure-rating', 'safety-factor'],
  },
]

/** Alphabetical by term, case-insensitive, ignoring leading punctuation. */
export const GLOSSARY: readonly GlossaryTerm[] = [...RAW].sort((a, b) =>
  a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }),
)

const BY_SLUG = new Map(GLOSSARY.map((t) => [t.slug, t]))

export function glossaryTerm(slug: string): GlossaryTerm | undefined {
  return BY_SLUG.get(slug)
}

/** The index letter a term files under. Digits file under `#`. */
export function glossaryLetter(term: string): string {
  const first = term.trim().charAt(0).toUpperCase()
  return /[A-Z]/.test(first) ? first : '#'
}

/** Terms grouped by index letter, in order. */
export function glossaryByLetter(): { letter: string; terms: GlossaryTerm[] }[] {
  const groups = new Map<string, GlossaryTerm[]>()
  for (const term of GLOSSARY) {
    const letter = glossaryLetter(term.term)
    const list = groups.get(letter) ?? []
    list.push(term)
    groups.set(letter, list)
  }
  return [...groups.entries()].map(([letter, terms]) => ({ letter, terms }))
}
