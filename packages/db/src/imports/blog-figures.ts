/**
 * One in-article photograph per article, reusing another article's hero.
 *
 * WHY REUSE RATHER THAN COMMISSION
 *
 * 93 articles carry a hero and none carried a single picture in the body. The
 * heroes are already a library of 93 specific, well-lit photographs of exactly
 * the subjects this blog writes about, and an article about NPT sealing is
 * genuinely illustrated by the photograph of a bonded seal going onto a
 * parallel thread. Commissioning a second 93 frames to say the same things
 * would cost more and add nothing.
 *
 * So `from` names the article whose hero this figure borrows, and the caption
 * does the work of saying why that picture is here. A caption that only
 * restates the photograph is filler; these say what the reader should take
 * from it.
 *
 * WHAT `imageId` HOLDS, AND WHY IT MATTERS
 *
 * A Media id, resolved from `from` at apply time. That is what
 * `collectMediaIdsFromBlocks` in @indus/domain indexes, and therefore what
 * stops the media library offering to trash a photograph an article is using.
 * Writing a storage URL here would render identically and leave every one of
 * these pictures looking unused — the precise failure the usage index exists
 * to prevent.
 *
 * The shared service-case `FigureBlockView` reads `imageId` as a storage path
 * instead, which is why no figure has ever rendered a picture anywhere on this
 * site. Blog articles use `BlogFigureBlock`, which resolves the id properly.
 *
 * `afterSection` is 1-based over the article's own `section_head` blocks: the
 * figure is inserted immediately after that heading, so a picture always opens
 * a section rather than interrupting an argument mid-paragraph.
 */

export type BlogFigure = {
  /**
   * Slug of the article whose hero photograph this figure borrows.
   *
   * Optional since 2026-09-01. A figure with no `from` is a RESERVED SLOT: the
   * block is written with `imageId: null`, which `BlogFigureBlockView` renders
   * as nothing at all — no frame, no placeholder, no gap. The article reads
   * exactly as it does today, and the moment a photograph exists the slot
   * fills in place without touching the article body.
   *
   * That is the point of reserving them rather than adding figures later: the
   * position in the argument, the caption and the brief are editorial
   * decisions made by whoever wrote the piece, and they are cheaper to make
   * now than to reconstruct when the images arrive.
   */
  from?: string
  caption: string
  /** 1-based index over this article's `section_head` blocks. */
  afterSection: number
  aspectRatio?: '16/9' | '4/3' | '21/9' | '1/1'
  /**
   * What the photograph should show. Rendered only inside the admin editor's
   * placeholder box; the public page shows nothing while the slot is empty.
   * This is the brief the image pass works from.
   */
  placeholderLabel?: string
  /** Figure number, e.g. 'FIG. 01'. */
  captionPrefix?: string
}

export const BLOG_FIGURES: Record<string, BlogFigure[]> = {
  // ── failure-analysis ───────────────────────────────────────────────────
  'why-hydraulic-hoses-fail': [
    {
      from: 'hose-failure-post-mortem',
      afterSection: 2,
      caption:
        'Laid out side by side, the six failure modes are told apart by what each one leaves on the hose rather than by where it let go.',
    },
  ],
  'hose-routing-bend-radius-twist': [
    {
      from: 'hydraulic-hose-installed-with-a-twist',
      afterSection: 2,
      caption:
        'The lay-line is the tell: on a correctly fitted hose it runs straight down the cover, and here it spirals.',
    },
  ],
  'hose-burst-at-the-fitting': [
    {
      from: 'hydraulic-hose-crimp-faults',
      afterSection: 2,
      caption:
        'A crimp is measured across the flats against the chart for that hose and ferrule. Eye alone will not separate a good one from a marginal one.',
    },
  ],
  'hydraulic-hose-cover-blistering': [
    {
      from: 'hydraulic-hose-tube-swelling',
      afterSection: 2,
      caption:
        'When the fluid is the problem it usually shows on the inside first. A swollen tube and a blistered cover are the same story read from opposite ends.',
    },
  ],
  'hydraulic-hose-wire-corrosion': [
    {
      from: 'hydraulic-hose-coastal-corrosion',
      afterSection: 2,
      caption:
        'Coastal air does the same thing to the fittings that it does to the reinforcement, and the fittings are the part you can actually see.',
    },
  ],
  'hydraulic-hose-abrasion-failure': [
    {
      from: 'hydraulic-hose-sand-abrasion',
      afterSection: 3,
      caption:
        'Airborne sand turns any point of contact into a grinding surface, which is why a rub that would be tolerable elsewhere is not tolerable here.',
    },
  ],
  'hydraulic-hose-installed-with-a-twist': [
    {
      from: 'how-to-measure-a-hydraulic-hose',
      afterSection: 2,
      caption:
        'Measuring face to face with the hose lying straight and relaxed is what stops the replacement arriving short and being fitted under tension.',
    },
  ],
  'hydraulic-hose-kinked': [
    {
      from: 'hose-routing-bend-radius-twist',
      afterSection: 2,
      caption:
        'Routing decides bend radius. Where there is no room for the bend, the answer is an elbow rather than a tighter curve.',
    },
  ],
  'hydraulic-hose-tube-swelling': [
    {
      from: 'hydraulic-hose-cover-blistering',
      afterSection: 2,
      caption:
        'Permeation blisters raise the cover from underneath. They are evidence about the fluid, not about the quality of the hose.',
    },
  ],
  'hydraulic-hose-cover-cracking': [
    {
      from: 'hydraulic-hose-uv-and-ozone',
      afterSection: 2,
      caption:
        'Sun and still air crack a cover without anything touching it. Beside a newer hose on the same machine, the difference is unmistakable.',
    },
  ],
  'hydraulic-hose-crimp-faults': [
    {
      from: 'should-you-buy-a-hose-crimper',
      afterSection: 3,
      caption:
        'Consistency is what a crimper is really bought for, and consistency lives in the dies as much as in the machine.',
    },
  ],
  'hose-failure-post-mortem': [
    {
      from: 'hydraulic-hose-abrasion-failure',
      afterSection: 2,
      caption:
        'A worn flat with braid showing answers the first question on the list: this hose did not fail from pressure, it failed from contact.',
    },
  ],
  'new-hydraulic-hose-weeping': [
    {
      from: 'hydraulic-fitting-make-up-torque',
      afterSection: 3,
      caption:
        'Two wrenches, always. A joint made up without backing the port body transmits the whole torque into whatever is beneath it.',
    },
  ],
  'cross-threaded-hydraulic-port': [
    {
      from: 'removing-a-seized-hydraulic-fitting',
      afterSection: 3,
      caption:
        'Once the hex starts rounding, the cost has moved from the fitting to the component it is threaded into.',
    },
  ],
  'split-female-quick-coupler': [
    {
      from: 'trapped-pressure-quick-coupler',
      afterSection: 2,
      caption:
        'An attachment left in the sun is where the pressure comes from. Forcing the coupler that results is where the fatigue comes from.',
    },
  ],

  // ── fitting-identification ─────────────────────────────────────────────
  'identify-any-hydraulic-fitting': [
    {
      from: 'hydraulic-thread-size-and-pitch-reference',
      afterSection: 2,
      caption:
        'A caliper and a pitch gauge settle in seconds what a photograph can only narrow down.',
    },
  ],
  'bspp-vs-bspt': [
    {
      from: 'bspp-bonded-seal-sizing',
      afterSection: 2,
      caption:
        'The bonded seal is the whole difference. A parallel thread carries one; a tapered thread has nowhere to put it.',
    },
  ],
  'jic-vs-orfs-vs-npt-vs-bsp': [
    {
      from: 'where-jic-is-the-wrong-choice',
      afterSection: 2,
      caption:
        'A machined cone against a flat face with an O-ring: the two sealing surfaces that decide most of this comparison.',
    },
  ],
  'hydraulic-thread-size-and-pitch-reference': [
    {
      from: 'identify-any-hydraulic-fitting',
      afterSection: 2,
      caption: 'The measurement comes first. The table only tells you what the measurement means.',
    },
  ],
  'photographing-a-hydraulic-fitting': [
    {
      from: 'hydraulic-thread-size-and-pitch-reference',
      afterSection: 2,
      caption:
        'A photograph with a rule and a pitch gauge in frame is worth more than three without them.',
    },
  ],
  'bspp-bonded-seal-sizing': [
    {
      from: 'bspp-vs-bspt',
      afterSection: 2,
      caption:
        'Parallel or tapered is the question the seal depends on, and the two threads are told apart by whether the diameter changes along their length.',
    },
  ],
  'stacking-hydraulic-adapters': [
    {
      from: 'cross-threaded-hydraulic-port',
      afterSection: 3,
      caption:
        'When a stack finally does damage it lands on the port, not on the adapters — and the port is the expensive half.',
    },
  ],

  // ── gulf-conditions ────────────────────────────────────────────────────
  'hydraulic-hose-in-uae-heat': [
    {
      from: 'why-summer-is-harder-on-hydraulic-hose',
      afterSection: 2,
      caption:
        'Ground temperature, not air temperature, is what a hose coiled on a yard in July actually experiences.',
    },
  ],
  'hydraulic-hose-uv-and-ozone': [
    {
      from: 'hydraulic-hose-cover-cracking',
      afterSection: 2,
      caption:
        'Crazing across the cover is the visible end of the process — and by then the reinforcement has been unprotected for a while.',
    },
  ],
  'hydraulic-hose-sand-abrasion': [
    {
      from: 'hydraulic-hose-abrasion-failure',
      afterSection: 2,
      caption:
        'Sand does not create the rub point. It just makes an existing one fail years sooner.',
    },
  ],
  'hydraulic-hose-coastal-corrosion': [
    {
      from: 'hydraulic-hose-wire-corrosion',
      afterSection: 2,
      caption:
        'The cover can look sound while the reinforcement underneath it has already gone. Cutting one open is the only way to know.',
    },
  ],
  'offshore-hydraulic-hose': [
    {
      from: 'hydraulic-hose-coastal-corrosion',
      afterSection: 2,
      caption:
        'What salt air does onshore, it does faster in the splash zone — which is why material choice stops being a cost question offshore.',
    },
  ],
  'hydraulic-hose-shelf-life-storage': [
    {
      from: 'hydraulic-hose-uv-and-ozone',
      afterSection: 2,
      caption:
        'A hose ages on a rack as well as on a machine. Light and moving air are the two things a stores area should exclude.',
    },
  ],
  'why-summer-is-harder-on-hydraulic-hose': [
    {
      from: 'hydraulic-hose-in-uae-heat',
      afterSection: 2,
      caption:
        'A rating of 100 °C describes the fluid inside the hose. It says nothing about a boom cylinder standing in a July yard.',
    },
  ],
  'desalination-and-water-treatment-hose': [
    {
      from: 'water-suction-and-dewatering-hose',
      afterSection: 2,
      caption:
        'On the intake side the specification is set by suction, not by pressure, and a pressure hose there will collapse from the outside in.',
    },
  ],

  // ── hose-assembly ──────────────────────────────────────────────────────
  'getting-a-hydraulic-hose-made': [
    {
      from: 'how-to-measure-a-hydraulic-hose',
      afterSection: 2,
      caption:
        'Face to face, lying straight. This is the single measurement most often taken wrongly.',
    },
  ],
  'skiving-and-fitting-selection': [
    {
      from: 'hydraulic-hose-crimp-faults',
      afterSection: 2,
      caption:
        'Skive or no-skive is set by the fitting, and it changes the crimp diameter the chart asks for.',
    },
  ],
  'on-site-hydraulic-hose-service-uae': [
    {
      from: 'field-re-hosing-kit',
      afterSection: 2,
      caption:
        'What is on the van decides what can be finished at the machine and what has to come back to a workshop.',
    },
  ],
  'hose-service-northern-emirates': [
    {
      from: 'hydraulic-hose-sand-abrasion',
      afterSection: 2,
      caption:
        'Quarry dust in one emirate, port salt in the next: the same machine fails differently an hour up the road.',
    },
  ],
  'bulk-hose-refit-and-tagging': [
    {
      from: 'hydraulic-hose-kits-for-a-fleet',
      afterSection: 2,
      caption:
        'Tagged and grouped before it leaves the bench, a refit becomes a fitting job rather than an identification job.',
    },
  ],
  'how-to-measure-a-hydraulic-hose': [
    {
      from: 'what-to-send-for-a-hose-quote',
      afterSection: 2,
      caption:
        'The old assembly carries most of its own specification. Bringing it in replaces nearly everything on the list.',
    },
  ],
  'hydraulic-quick-couplers-iso-7241': [
    {
      from: 'skid-steer-hydraulic-hose',
      afterSection: 3,
      caption:
        'On an attachment circuit the couplers are handled several times a day, which is why they wear out long before the hoses do.',
    },
  ],
  'hydraulic-fitting-make-up-torque': [
    {
      from: 'new-hydraulic-hose-weeping',
      afterSection: 2,
      caption:
        'A joint that weeps after assembly is usually under- or over-made-up, and both mistakes look identical from a distance.',
    },
  ],
  'field-re-hosing-kit': [
    {
      from: 'contamination-during-a-hose-change',
      afterSection: 3,
      caption:
        'Caps on every open port, every time. A field job is the dirtiest moment in a hydraulic system’s life.',
    },
  ],

  // ── industrial-hose ────────────────────────────────────────────────────
  'industrial-hose-is-not-hydraulic-hose': [
    {
      from: 'chemical-transfer-hose-selection',
      afterSection: 2,
      caption:
        'Industrial hose is chosen on what flows through it. The compatibility chart, not the pressure rating, is the starting point.',
    },
  ],
  'chemical-transfer-hose-selection': [
    {
      from: 'hydraulic-hose-tube-swelling',
      afterSection: 2,
      caption:
        'A swollen tube is what an incompatible fluid looks like once it has been in service. The chart exists to prevent this picture.',
    },
  ],
  'steam-hose-safety': [
    {
      from: 'hose-whip-restraint-and-burst-protection',
      afterSection: 2,
      caption:
        'On steam the coupling is the risk, and restraint is what decides whether a failure is an incident or an injury.',
    },
  ],
  'food-grade-hose-compliance': [
    {
      from: 'unbranded-hydraulic-fittings',
      afterSection: 2,
      caption:
        'Traceability is the product. An unmarked component has no certificate behind it, whatever the invoice says.',
    },
  ],
  'water-suction-and-dewatering-hose': [
    {
      from: 'desalination-and-water-treatment-hose',
      afterSection: 2,
      caption:
        'Plant intakes are the same problem at a larger scale: everything is decided by what happens on the suction side.',
    },
  ],

  // ── machine-down ───────────────────────────────────────────────────────
  'excavator-hydraulic-hose-replacement': [
    {
      from: 'detaching-a-hose-on-a-modern-machine',
      afterSection: 2,
      caption:
        'On a recent machine, getting to the hose takes longer than changing it. Guards and clamp blocks come off first.',
    },
  ],
  'forklift-hydraulic-hose-replacement': [
    {
      from: 'port-equipment-hydraulic-hose',
      afterSection: 2,
      caption:
        'The same lifting circuits at terminal scale, where salt air and continuous duty shorten every interval.',
    },
  ],
  'tipper-and-transit-mixer-hose': [
    {
      from: 'refuse-truck-hydraulic-hose',
      afterSection: 2,
      caption:
        'Body hydraulics on a road vehicle: high cycle counts, exposed routing, and no scheduled window to work in.',
    },
  ],
  'wheel-loader-hydraulic-hose': [
    {
      from: 'backhoe-hydraulic-hose',
      afterSection: 2,
      caption:
        'A backhoe is a loader at one end and an excavator at the other, and the loader end fails the way this one does.',
    },
  ],
  'mobile-crane-hydraulic-hose': [
    {
      from: 'truck-crane-hydraulic-hose',
      afterSection: 2,
      caption:
        'Hoses that track around an articulated boom see movement at every joint, on every lift.',
    },
  ],
  'backhoe-hydraulic-hose': [
    {
      from: 'wheel-loader-hydraulic-hose',
      afterSection: 2,
      caption:
        'The loader half of the machine fails on lift, tilt and steering — the same three circuits, in the same order.',
    },
  ],
  'skid-steer-hydraulic-hose': [
    {
      from: 'hydraulic-quick-couplers-iso-7241',
      afterSection: 2,
      caption:
        'Flat-face against poppet: on a machine that changes attachments daily, the mating faces decide how much dirt gets in.',
    },
  ],
  'truck-crane-hydraulic-hose': [
    {
      from: 'mobile-crane-hydraulic-hose',
      afterSection: 2,
      caption:
        'Wherever a boom carries hose, a failure stops being a leak and becomes a lifting question.',
    },
  ],
  'boom-lift-hydraulic-hose': [
    {
      from: 'hose-whip-restraint-and-burst-protection',
      afterSection: 2,
      caption:
        'Inside a certified machine, what restrains a failed hose is part of the inspection, not an optional extra.',
    },
  ],
  'port-equipment-hydraulic-hose': [
    {
      from: 'hydraulic-hose-coastal-corrosion',
      afterSection: 2,
      caption:
        'Salt reaches the fittings before it reaches anything else, and the ferrule is where it shows first.',
    },
  ],
  'tractor-hydraulic-hose': [
    {
      from: 'hydraulic-quick-couplers-iso-7241',
      afterSection: 2,
      caption:
        'Agricultural remotes are their own interchange family. A coupler that looks right will still refuse to mate.',
    },
  ],
  'concrete-pump-hydraulic-hose': [
    {
      from: 'braid-vs-spiral-hydraulic-hose',
      afterSection: 2,
      caption:
        'At these pressures the choice stops being braid or spiral and becomes how many spiral layers.',
    },
  ],
  'injection-moulding-hydraulic-hose': [
    {
      from: 'hydraulic-hose-cover-cracking',
      afterSection: 2,
      caption:
        'Radiant heat ages a cover from the outside. On a moulding machine that clock runs all shift, every shift.',
    },
  ],
  'refuse-truck-hydraulic-hose': [
    {
      from: 'hose-register-and-replacement-programme',
      afterSection: 2,
      caption:
        'Where hose life follows cycle count rather than the calendar, a register is the only way to schedule anything.',
    },
  ],
  'removing-a-seized-hydraulic-fitting': [
    {
      from: 'cross-threaded-hydraulic-port',
      afterSection: 3,
      caption:
        'This is what you are trying to avoid. Once the port thread is gone, the repair is a component, not a fitting.',
    },
  ],
  'log-splitter-and-shop-press-hose': [
    {
      from: 'hydraulic-hose-pressure-by-size',
      afterSection: 2,
      caption:
        'Specify against the relief setting. On a splitter the circuit reaches it on every single cycle.',
    },
  ],
  'detaching-a-hose-on-a-modern-machine': [
    {
      from: 'contamination-during-a-hose-change',
      afterSection: 3,
      caption:
        'Ports capped the moment they are open. What enters here surfaces weeks later as a valve fault nobody connects back.',
    },
  ],

  // ── maintenance-reliability ────────────────────────────────────────────
  'hydraulic-hose-inspection': [
    {
      from: 'hydraulic-hose-abrasion-failure',
      afterSection: 2,
      caption: 'A shiny patch is a warning with a schedule attached. Exposed braid is not.',
    },
  ],
  'hose-register-and-replacement-programme': [
    {
      from: 'bulk-hose-refit-and-tagging',
      afterSection: 2,
      caption:
        'A planned set replacement is what a register is for. Without one, every failure is a surprise with a machine attached.',
    },
  ],
  'contamination-during-a-hose-change': [
    {
      from: 'field-re-hosing-kit',
      afterSection: 2,
      caption:
        'Caps and plugs in every size belong on the van. They are the cheapest item on it and the one that saves a pump.',
    },
  ],
  'grease-and-zerk-fittings': [
    {
      from: 'removing-a-seized-hydraulic-fitting',
      afterSection: 3,
      caption:
        'A grease nipple shears far more easily than this. The escalation is the same, with much less material to work with.',
    },
  ],
  'mini-excavator-hose-maintenance': [
    {
      from: 'skid-steer-hydraulic-hose',
      afterSection: 2,
      caption:
        'The attachment couplers take the worst of it on any machine that changes tools, and they are the first thing to check on return from hire.',
    },
  ],

  // ── oilfield-pressure-control ──────────────────────────────────────────
  'api-7k-16c-16d-which-standard': [
    {
      from: 'api-7k-rotary-vibrator-hose',
      afterSection: 2,
      caption:
        'Coupling type, sour service rating and safety clamps: three of the things an API 7K inspection actually looks at.',
    },
  ],
  'api-16c-choke-and-kill-lines': [
    {
      from: 'offshore-hydraulic-hose',
      afterSection: 2,
      caption:
        'Offshore, the environment is part of the specification long before the pressure rating is reached.',
    },
  ],
  'bop-control-hose-fire-resistance': [
    {
      from: 'api-7k-16c-16d-which-standard',
      afterSection: 2,
      caption:
        'Which standard governs the hose decides what the certificate has to prove — and fire survival is not an optional annexe.',
    },
  ],
  'api-7k-rotary-vibrator-hose': [
    {
      from: 'hose-whip-restraint-and-burst-protection',
      afterSection: 2,
      caption:
        'Safety clamps are the reason a rotary hose failure is contained rather than catastrophic.',
    },
  ],
  'rig-site-hose-replacement-abu-dhabi': [
    {
      from: 'bulk-hose-refit-and-tagging',
      afterSection: 2,
      caption:
        'Built, tagged and staged before the permit window opens. On a live rig the schedule is set by the permit, not the build.',
    },
  ],

  // ── procurement-export ─────────────────────────────────────────────────
  'how-to-cross-reference-a-hydraulic-hose': [
    {
      from: 'how-to-read-a-hose-layline',
      afterSection: 2,
      caption:
        'The lay-line is where a cross-reference starts. When it has worn off, the assembly has to be identified rather than matched.',
    },
  ],
  'what-to-send-for-a-hose-quote': [
    {
      from: 'photographing-a-hydraulic-fitting',
      afterSection: 2,
      caption:
        'Square on to the end face, with something of known size in frame. Most quote requests fail on this one photograph.',
    },
  ],
  'hydraulic-hose-assembly-cost': [
    {
      from: 'should-you-buy-a-hose-crimper',
      afterSection: 2,
      caption:
        'Dies, ferrules and stock are where the money actually goes — which is also why an assembly costs what it does.',
    },
  ],
  'hydraulic-hose-stocking-policy': [
    {
      from: 'hydraulic-hose-shelf-life-storage',
      afterSection: 2,
      caption:
        'Stock ages. A shelf policy that ignores shelf life is a slow way of buying hose twice.',
    },
  ],
  'hydraulic-hose-lead-times': [
    {
      from: 'bulk-hose-or-finished-assemblies',
      afterSection: 2,
      caption:
        'Bulk on one side, built and tagged on the other. Which side an order comes from is most of its lead time.',
    },
  ],
  'bulk-hose-or-finished-assemblies': [
    {
      from: 'hydraulic-hose-assembly-cost',
      afterSection: 2,
      caption:
        'Everything that goes into one assembly, laid out separately. The hose is rarely the expensive part.',
    },
  ],
  'unbranded-hydraulic-fittings': [
    {
      from: 'hydraulic-hose-crimp-faults',
      afterSection: 2,
      caption:
        'Without a published crimp specification for the pair, there is no figure to measure the finished assembly against.',
    },
  ],
  'hydraulic-hose-kits-for-a-fleet': [
    {
      from: 'hose-register-and-replacement-programme',
      afterSection: 2,
      caption:
        'The kit list comes out of the failure history. Without the record, a kit is a guess in a box.',
    },
  ],
  'should-you-buy-a-hose-crimper': [
    {
      from: 'hydraulic-hose-crimp-faults',
      afterSection: 3,
      caption:
        'Measured across the flats against the manufacturer chart, on every assembly. This is the discipline the machine comes with.',
    },
  ],

  // ── safety ─────────────────────────────────────────────────────────────
  'hydraulic-fluid-injection-injury': [
    {
      from: 'new-hydraulic-hose-weeping',
      afterSection: 2,
      caption:
        'A joint wiped dry and watched is how a leak is found safely. A hand run along a hose is how people are injured.',
    },
  ],
  'hose-whip-restraint-and-burst-protection': [
    {
      from: 'api-7k-rotary-vibrator-hose',
      afterSection: 2,
      caption:
        'On a rig this is not optional equipment. Safety clamps are inspected as part of the assembly.',
    },
  ],
  'trapped-pressure-quick-coupler': [
    {
      from: 'split-female-quick-coupler',
      afterSection: 3,
      caption:
        'This is where forcing it ends: a clean split at the ball groove, where the wall is thinnest.',
    },
  ],

  // ── specification-standards ────────────────────────────────────────────
  'hydraulic-hose-pressure-by-size': [
    {
      from: 'hydraulic-hose-dash-sizes',
      afterSection: 2,
      caption:
        'Working pressure falls as bore rises, which is why one figure per grade tells you almost nothing on its own.',
    },
  ],
  'braid-vs-spiral-hydraulic-hose': [
    {
      from: 'sae-100r-hose-types',
      afterSection: 2,
      caption:
        'Cut back in steps, the constructions separate immediately: braid wraps, spiral lays.',
    },
  ],
  'compact-hose-1sc-2sc': [
    {
      from: 'hydraulic-hose-kinked',
      afterSection: 2,
      caption:
        'Half the bend radius is worth paying for exactly where this happens — and it happens where there was never room.',
    },
  ],
  'sae-100r-hose-types': [
    {
      from: 'en-853-856-857-vs-sae-100r',
      afterSection: 2,
      caption:
        'One braid, two braids, four spirals. The number in the designation describes this, not a ranking of quality.',
    },
  ],
  'en-853-856-857-vs-sae-100r': [
    {
      from: 'sae-100r-hose-types',
      afterSection: 2,
      caption:
        'What actually has to match is the construction, not the designation printed on the cover.',
    },
  ],
  'hydraulic-hose-dash-sizes': [
    {
      from: 'hydraulic-hose-pressure-by-size',
      afterSection: 2,
      caption:
        'Dash size is bore in sixteenths of an inch, and bore is what moves the pressure rating.',
    },
  ],
  'how-to-read-a-hose-layline': [
    {
      from: 'how-to-cross-reference-a-hydraulic-hose',
      afterSection: 2,
      caption:
        'Everything a cross-reference needs is printed here. When it is gone, the part has to be measured instead.',
    },
  ],
  'stopping-an-npt-thread-leak': [
    {
      from: 'bspp-bonded-seal-sizing',
      afterSection: 2,
      caption:
        'A parallel thread seals on a bonded washer, not on the thread. Sealant on this joint holds the washer off its face.',
    },
  ],
  'sae-j518-code-61-code-62-flanges': [
    {
      from: 'hydraulic-fitting-make-up-torque',
      afterSection: 3,
      caption:
        'Flange bolts go down in a cross pattern in stages. Drawn one at a time, the head cocks and pinches the O-ring.',
    },
  ],
  'where-jic-is-the-wrong-choice': [
    {
      from: 'jic-vs-orfs-vs-npt-vs-bsp',
      afterSection: 2,
      caption:
        'The four families side by side. JIC earns its place on most of a machine; this article is about the rest.',
    },
  ],

  // ── Reserved slots: 2026-09-01 sprints (GCC compliance + Africa fittings)
  //
  // Every entry below has NO `from`, so it writes a figure with a null id.
  // `BlogFigureBlockView` renders nothing for those, so the forty articles read
  // today exactly as they read before the slots existed. The caption and the
  // brief are the editorial half of the work, done while the argument is fresh;
  // the image pass fills `from` (or a commissioned Media id) and the pictures
  // appear in place without the bodies being touched.
  'saber-certificate-for-hydraulic-hose': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A shipment file is assembled before the goods move, not behind them — the product registration and the consignment certificate are separate documents doing separate jobs.',
      placeholderLabel: 'Export document set laid out on a warehouse desk beside a crated hose assembly.',
    },
  ],
  'gulf-conformity-mark-hose-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Conformity marks belong to the product families their regulations name. Hose carries its identity on the layline instead.',
      placeholderLabel: 'Close crop of a hose layline running along a coil, printing sharp and legible as printing, in workshop light.',
    },
  ],
  'certificate-of-origin-gcc-duty': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Origin follows the factory that made the item, not the warehouse it was picked from.',
      placeholderLabel: 'Mixed pallet of boxed fittings from several manufacturers, shot square-on in a warehouse aisle.',
    },
  ],
  'hose-assembly-test-certificate': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A proof test is a single held pressure on one identified assembly — which is why the tag on that assembly matters as much as the number on the certificate.',
      placeholderLabel: 'Hose assembly on a test bench, pressure gauge in frame, tag hanging from the ferrule.',
    },
  ],
  'material-test-certificate-en-10204': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'A 3.1 certifies the batch in your hand. Without a heat or batch number visible on the goods, nothing reconciles.',
      placeholderLabel: 'Macro of stamped markings on the hex of a steel fitting, raking light so the characters read as characters.',
    },
  ],
  'nace-mr0175-hose-documentation': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'The standard governs the metal. The tube compound is a separate question that the same purchase order rarely asks.',
      placeholderLabel: 'Cutaway or sectioned hose end showing tube, reinforcement and the metal fitting together, on a neutral bench.',
    },
  ],
  'vendor-approval-for-hose-supply': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'What an operator\'s regime actually wants is evidence: a named manufacturer, a construction standard, a test record and a tag that ties them to this item.',
      placeholderLabel: 'Tagged hose assemblies racked and labelled in a store, tags facing camera, shallow depth of field.',
    },
  ],
  'verifying-a-genuine-hydraulic-hose': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'The layline is the hose\'s own identity statement, and it repeats every metre — any offcut long enough to fit is long enough to identify.',
      placeholderLabel: 'Hands holding a hose offcut with the layline rotated into the light, workshop background thrown out of focus.',
    },
  ],
  'gcc-import-documents-for-hose': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Four destinations, four regimes: the document set is built against where the goods are going rather than assembled once and reused.',
      placeholderLabel: 'Overhead of four separate document wallets fanned on a desk, each with a different consignment label.',
    },
  ],
  'oilfield-hose-document-pack': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'On an oilfield order the pack is part of the product: most of it cannot be reconstructed after the assembly is built.',
      placeholderLabel: 'Bound data book open beside a crated oilfield hose assembly, both in frame, industrial storeroom light.',
    },
  ],
  'fittings-on-a-chinese-excavator': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A metric cone and a BSP cone are twenty-one degrees apart and near-identical down a dark bore. A seat gauge settles in seconds what eyesight cannot.',
      placeholderLabel: 'Two male fittings side by side on a bench with a seat angle gauge resting across them, macro, even light.',
    },
  ],
  'fittings-on-a-used-japanese-machine': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Same seat, different thread: the pair that defeats identification by eye on a used import.',
      placeholderLabel: 'Two 30-degree flare fittings photographed together, threads facing camera, pitch gauge leaning against one.',
    },
  ],
  'tractor-hydraulic-fittings': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'Implements connect through couplers that are handled daily, dropped and dragged — which is why the spare that matters is a coupler half, not a fitting.',
      placeholderLabel: 'Agricultural quick coupler halves on a tractor\'s rear remotes, dusty, end of a working day.',
    },
  ],
  'fittings-on-american-machines': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A JIC male is a plain cone; an ORFS male is a flat face with an O-ring set into it. Once seen side by side they are never confused again.',
      placeholderLabel: 'JIC and ORFS male fittings photographed together head-on, the O-ring clearly visible in the flat face.',
    },
  ],
  'fittings-on-european-machines': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'The same tube size exists in a light and a heavy series with different threads, so a tube diameter is not an identification.',
      placeholderLabel: 'Two DIN 2353 fittings of the same tube size, different series, side by side with a caliper across one.',
    },
  ],
  'korean-excavator-hydraulic-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Components arrive at an assembly line with their own port conventions, so a machine can be genuinely mixed from new.',
      placeholderLabel: 'Excavator valve bank with several hose ends of visibly different families entering it, engine bay light.',
    },
  ],
  'bsp-or-metric-fittings': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'A yard walk with a caliper and a notebook is the cheapest hour a mixed-fleet workshop spends.',
      placeholderLabel: 'Technician crouched at a machine with a caliper on a port and an open notebook on the track.',
    },
  ],
  'measuring-a-fitting-without-gauges': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A caliper across the crests and a pitch taken over ten threads is enough to name most fittings in circulation.',
      placeholderLabel: 'Caliper measuring across the thread crests of a male fitting, held in gloved hands, field conditions.',
    },
  ],
  'building-a-thread-reference-board': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Samples, not pictures: identification is done by offering the unknown part up to a known one.',
      placeholderLabel: 'Plywood workshop board with male and female fittings mounted in rows, hand-written labels beneath each.',
    },
  ],
  'bridging-two-thread-standards': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'One adapter is engineering. Three is a lever arm bolted to a port that vibrates all day.',
      placeholderLabel: 'Stack of three adapters made up on a machine port, side-on so the overhang reads clearly.',
    },
  ],
  'what-to-send-for-a-fittings-quote': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A photograph square-on, a photograph down the bore, and one caliper reading name most fittings on the first reply.',
      placeholderLabel: 'Phone screen showing a photograph of a fitting, held above the actual fitting on a bench.',
    },
  ],
  'cross-referencing-a-fitting-part-number': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A part number encodes geometry in one maker\'s language. The geometry is what has to match.',
      placeholderLabel: 'Worn part number stamped on a fitting body, macro, with a caliper out of focus behind.',
    },
  ],
  'adapter-kit-for-a-mixed-fleet': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'A kit built from a yard walk is small, cheap and covers the failures that repeat. One built from a catalogue is mostly compartments nobody opens.',
      placeholderLabel: 'Open compartment case of adapters on a workshop bench, several compartments empty, others well used.',
    },
  ],
  'spares-list-for-a-remote-site': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'On a long lane the ranking is by what production loses while you wait, not by what the item costs.',
      placeholderLabel: 'Remote site container store with shelves of hose and fittings, dust, hard afternoon light.',
    },
  ],
  'inspecting-fittings-on-arrival': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Running a known nut down an arriving thread takes seconds and catches the commonest visible defect there is.',
      placeholderLabel: 'Hands checking a newly delivered fitting against a known nut on a loading bay, opened carton beside.',
    },
  ],
  'plating-and-corrosion-on-fittings': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'Corrosion starts where the coating is thinnest — thread crests and hex corners — and works underneath from there.',
      placeholderLabel: 'Macro of a corroded fitting hex on a machine, rust blooming at the corners, plating intact elsewhere.',
    },
  ],
  'when-stainless-is-worth-it': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'Stainless answers a corrosion problem. It does not automatically answer a pressure one.',
      placeholderLabel: 'Stainless and plated carbon steel fittings of the same size photographed together on a neutral bench.',
    },
  ],
  'air-or-sea-for-a-fittings-order': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Fittings are dense and small, so the fixed costs of clearing a consignment usually matter more than the freight on it.',
      placeholderLabel: 'Small heavy carton of fittings beside a full pallet of hose on a warehouse floor, scale obvious.',
    },
  ],
  'consolidating-fittings-with-a-hose-order': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'One consignment, one document set, one clearance — the saving is in everything that happens to a parcel, not in the parts.',
      placeholderLabel: 'Single consolidated pallet being wrapped, hose coils and fitting cartons together under the stretch film.',
    },
  ],
  'substituting-a-fitting-safely': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Three of the four checks announce themselves immediately. The rating does not — it behaves perfectly until the day the circuit sees its design pressure.',
      placeholderLabel: 'Two visually similar fittings on a bench, one marked with a paint dot, workshop light.',
    },
  ],
  'copper-mine-hydraulic-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'On the fleet the damage is mechanical: abrasion at contact points and fatigue at the joint.',
      placeholderLabel: 'Hydraulic lines on a haul truck chassis, dust-covered, with a visible rub point against the frame.',
    },
  ],
  'gold-plant-hydraulic-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A gold circuit is abrasive in some areas and chemically aggressive in others. The stock list should say so.',
      placeholderLabel: 'Process plant walkway with hydraulic lines running past wet, scaled steelwork.',
    },
  ],
  'oilfield-fittings-in-west-africa': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Documented flow equipment and ordinary plant hydraulics travel at different speeds. Splitting them is what keeps the second one moving.',
      placeholderLabel: 'Two consignments staged separately in a yard, one crated and sealed, one on an open pallet.',
    },
  ],
  'agriculture-and-construction-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Loader and tipper circuits produce most of the repeat failures on a mixed yard, and most of them are installation faults.',
      placeholderLabel: 'Backhoe loader arm with hydraulic lines, one visibly chafing against the boom casting.',
    },
  ],
  'quarry-and-crusher-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Crushing plant destroys joints rather than hoses: make-up relaxes, the seat frets, and the port pays for it last.',
      placeholderLabel: 'Hydraulic lines clamped along a crusher frame, heavy dust, vibration-worn clamps visible.',
    },
  ],
  'water-well-drilling-rig-fittings': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'A made-up spare assembly turns a stoppage into a change-out. A box of loose fittings turns it into a fabrication job.',
      placeholderLabel: 'Support truck bed with coiled spare assemblies and a small parts case, bush site in the background.',
    },
  ],
  'port-and-terminal-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Salt air works on every exposed joint whether the machine is running or not, and the bill arrives as a longer intervention later.',
      placeholderLabel: 'Reach stacker boom joint with salt-corroded fittings, quayside and containers behind.',
    },
  ],
  'sugar-mill-and-agro-processing-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'Heat, steam and washdown attack the outside of a joint while the inside seals perfectly.',
      placeholderLabel: 'Mill hydraulics beside steam-stained pipework, wet floor, humid interior light.',
    },
  ],
  'buying-fittings-in-south-africa': [
    {
      afterSection: 2,
      captionPrefix: 'FIG. 01',
      caption:
        'A planned consolidated order is a different question from a breakdown part, and only one of them should travel.',
      placeholderLabel: 'Counter of a hydraulics branch with fittings racked behind, customer side of the counter in frame.',
    },
  ],
  'factory-and-fixed-plant-fittings': [
    {
      afterSection: 1,
      captionPrefix: 'FIG. 01',
      caption:
        'A factory\'s thread population is a choice, because the machines do not move.',
      placeholderLabel: 'Row of injection moulding machines with tidy hydraulic runs, clean plant floor, overhead light.',
    },
  ],
}
