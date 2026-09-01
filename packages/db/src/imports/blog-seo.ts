/**
 * Per-article SEO metadata: title, description, focus keyword.
 *
 * WHY THIS EXISTS AS A FILE RATHER THAN AS EDITS TO 93 SEEDS
 *
 * Same reasoning as `blog-cross-links.ts`. Seeds live in seven wave
 * directories; a rewrite spread across all of them is unreviewable, and
 * re-running an old wave runner would put the old metadata back. The importer
 * composes this in on every write, so a re-run reapplies it.
 *
 * THE CONSTRAINT THAT DROVE EVERY CHOICE HERE
 *
 * `scoreEntity` in @indus/domain charges for a focus keyword. It computes
 * `100 * weightedPass / totalWeight`, and a non-empty keyword pushes two extra
 * checks worth 13 between them: `keywordInTitle` (8) and `keywordInUrl` (5).
 * A keyword that fails them adds 13 to the denominator and nothing to the
 * numerator, so it scores strictly worse than having no keyword at all.
 *
 * Before this file, 57 of 93 articles were in exactly that state — carrying a
 * keyword that appeared in neither the title nor the URL, and being marked
 * down for it.
 *
 * `keywordInUrl` compares `keyword.replace(/\s+/g, '-')` against the URL, and
 * the URL is `/blog/<slug>`. Slugs are already indexed and are not being
 * changed for a score. So every keyword here is a contiguous hyphen-joined
 * phrase taken from its own slug, and every title contains that phrase
 * verbatim. Both checks pass by construction rather than by hope.
 *
 * Titles are 30–60 characters and descriptions 120–160, which are
 * `TITLE_RANGE` and `DESCRIPTION_RANGE` from @indus/domain — not round numbers
 * picked here. `blog-seo.test.ts` asserts all four properties for all 93, so a
 * later edit that breaks one fails the build rather than the score.
 *
 * Titles carry no " | Indus Hydraulics" suffix. The storefront appends it.
 */

export type BlogSeo = {
  /** 30–60 characters, and contains `focusKeyword` verbatim. */
  seoTitle: string
  /** 120–160 characters. */
  seoDescription: string
  /** A contiguous phrase from the article's own slug. */
  focusKeyword: string
}

export const BLOG_SEO: Record<string, BlogSeo> = {
  // ── failure-analysis ───────────────────────────────────────────────────
  'why-hydraulic-hoses-fail': {
    focusKeyword: 'why hydraulic hoses fail',
    seoTitle: 'Why hydraulic hoses fail: six modes, and the signs',
    seoDescription:
      'The six ways a hydraulic hose actually fails, what each one leaves behind on the hose, and how to tell them apart from the evidence in your hand.',
  },
  'hose-routing-bend-radius-twist': {
    focusKeyword: 'hose routing bend radius',
    seoTitle: 'Hose routing bend radius, twist and early failure',
    seoDescription:
      'Bend radius, twist and clamping decide how long a hydraulic hose lasts. The routing faults that halve hose life, and how to spot them on a machine.',
  },
  'hose-burst-at-the-fitting': {
    focusKeyword: 'hose burst at the fitting',
    seoTitle: 'Hose burst at the fitting: what that tells you',
    seoDescription:
      'A hydraulic hose that bursts at the ferrule failed differently from one that bursts mid-length. What each location proves about the cause, and what to check.',
  },
  'hydraulic-hose-cover-blistering': {
    focusKeyword: 'hydraulic hose cover blistering',
    seoTitle: 'Hydraulic hose cover blistering and pinholes',
    seoDescription:
      'Blisters and pinholes in a hose cover are usually permeation rather than a manufacturing defect. How to tell which you have, and what to do about each.',
  },
  'hydraulic-hose-wire-corrosion': {
    focusKeyword: 'hydraulic hose wire corrosion',
    seoTitle: 'Hydraulic hose wire corrosion under the cover',
    seoDescription:
      'Reinforcement wire rusting under an intact cover means water got in somewhere. Where it enters, why the cover looks fine, and how much strength is left.',
  },
  'hydraulic-hose-abrasion-failure': {
    focusKeyword: 'hydraulic hose abrasion',
    seoTitle: 'Hydraulic hose abrasion: finding the rub point',
    seoDescription:
      'Abrasion is the most preventable hose failure and the easiest to misread. How to find the rub point from the wear mark before the hose lets go.',
  },
  'hydraulic-hose-installed-with-a-twist': {
    focusKeyword: 'hydraulic hose installed with a twist',
    seoTitle: 'A hydraulic hose installed with a twist fails early',
    seoDescription:
      'A few degrees of twist at installation takes a large share of a hose assembly life. How to see it in the layline, and how to fit one without it.',
  },
  'hydraulic-hose-kinked': {
    focusKeyword: 'hydraulic hose kinked',
    seoTitle: 'Hydraulic hose kinked at the fitting: bend radius',
    seoDescription:
      'A hose kinked at the fitting is usually an elbow that should have been fitted instead. Bend radius against elbow choice, and how to route it properly.',
  },
  'hydraulic-hose-tube-swelling': {
    focusKeyword: 'hydraulic hose tube swelling',
    seoTitle: 'Hydraulic hose tube swelling and fluid mismatch',
    seoDescription:
      'A swollen or hardened inner tube reads the fluid incompatibility straight off the failure. What each symptom points at, and how to specify the right tube.',
  },
  'hydraulic-hose-cover-cracking': {
    focusKeyword: 'hydraulic hose cover cracking',
    seoTitle: 'Hydraulic hose cover cracking: heat or ozone',
    seoDescription:
      'Cracks across a hose cover come from heat ageing or ozone attack, and the pattern tells you which. How to read it, and what changes in each case.',
  },
  'hydraulic-hose-crimp-faults': {
    focusKeyword: 'hydraulic hose crimp faults',
    seoTitle: 'Hydraulic hose crimp faults: too tight, too loose',
    seoDescription:
      'An over-crimped and an under-crimped hose fail in opposite ways and leave different evidence. How to measure a crimp, and what each fault leaves behind.',
  },
  'hose-failure-post-mortem': {
    focusKeyword: 'hose failure post-mortem',
    seoTitle: 'The hose failure post-mortem: eleven questions',
    seoDescription:
      'Eleven questions that turn a burst hydraulic hose into a cause you can act on, so the same assembly in the same position does not fail again next month.',
  },
  'new-hydraulic-hose-weeping': {
    focusKeyword: 'new hydraulic hose weeping',
    seoTitle: 'New hydraulic hose weeping? Check these first',
    seoDescription:
      'A new hose assembly leaking at the joint is almost never the crimp. Seat damage, seat angle, missing O-rings and make-up, in the order to check them.',
  },
  'cross-threaded-hydraulic-port': {
    focusKeyword: 'cross-threaded hydraulic port',
    seoTitle: 'Cross-threaded hydraulic port: what can be saved',
    seoDescription:
      'Whether a stripped hydraulic port is recoverable depends on where it seals. O-ring boss against tapered, thread inserts, and when to replace the block.',
  },
  'split-female-quick-coupler': {
    focusKeyword: 'split female quick coupler',
    seoTitle: 'Split female quick coupler: what causes it',
    seoDescription:
      'A cracked female hydraulic coupler is not bad luck. Pressure against a closed poppet, trapped fluid expanding, and fatigue from being forced on.',
  },

  // ── fitting-identification ─────────────────────────────────────────────
  'identify-any-hydraulic-fitting': {
    focusKeyword: 'identify any hydraulic fitting',
    seoTitle: 'How to identify any hydraulic fitting in four steps',
    seoDescription:
      'Thread diameter, pitch, seat form and seat angle identify almost any hydraulic fitting without markings. The four measurements, in the order that works.',
  },
  'bspp-vs-bspt': {
    focusKeyword: 'bspp vs bspt',
    seoTitle: 'BSPP vs BSPT: parallel, tapered and how each seals',
    seoDescription:
      'A BSPP parallel thread needs a bonded seal and a BSPT tapered thread does not. How to tell them apart in your hand, and what happens when they are mixed.',
  },
  'jic-vs-orfs-vs-npt-vs-bsp': {
    focusKeyword: 'jic vs orfs vs npt vs bsp',
    seoTitle: 'JIC vs ORFS vs NPT vs BSP: the four families',
    seoDescription:
      'The four hydraulic connector families compared on seat, sealing surface, pressure and where each belongs — with the traps that let two of them thread together.',
  },
  'hydraulic-thread-size-and-pitch-reference': {
    focusKeyword: 'hydraulic thread size and pitch',
    seoTitle: 'Hydraulic thread size and pitch, by fitting family',
    seoDescription:
      'A bench reference for hydraulic thread size and pitch across JIC, ORFS, BSP, metric and NPT, so a caliper and a thread gauge settle any identification.',
  },
  'photographing-a-hydraulic-fitting': {
    focusKeyword: 'photographing a hydraulic fitting',
    seoTitle: 'Photographing a hydraulic fitting for identification',
    seoDescription:
      'Four photographs and one measurement identify almost any fitting remotely. The angles that settle seat type, thread and gender — and the ones that waste a day.',
  },
  'bspp-bonded-seal-sizing': {
    focusKeyword: 'bspp bonded seal sizing',
    seoTitle: 'BSPP bonded seal sizing and dowty washers',
    seoDescription:
      'A bonded seal is sized by the thread it sits under, not by any diameter you can measure. How BSP sizing works, and why an oversize seal leaks invisibly.',
  },
  'stacking-hydraulic-adapters': {
    focusKeyword: 'stacking hydraulic adapters',
    seoTitle: 'Stacking hydraulic adapters: when it causes leaks',
    seoDescription:
      'One adapter is engineering, three is a repair waiting to fail. Leverage on the port, added leak paths and flow restriction — and what to fit instead.',
  },

  // ── gulf-conditions ────────────────────────────────────────────────────
  'hydraulic-hose-in-uae-heat': {
    focusKeyword: 'hydraulic hose in uae heat',
    seoTitle: 'Hydraulic hose in UAE heat: what the rating assumes',
    seoDescription:
      'A hose rated for 100 °C assumes a fluid temperature, not a yard in July. What the number covers, what it does not, and how Gulf heat shortens hose life.',
  },
  'hydraulic-hose-uv-and-ozone': {
    focusKeyword: 'hydraulic hose uv and ozone',
    seoTitle: 'Hydraulic hose UV and ozone: covers crack unused',
    seoDescription:
      'Sun and still air crack a hose cover without anything touching it. How UV and ozone attack differ, and what it means for machines parked outdoors.',
  },
  'hydraulic-hose-sand-abrasion': {
    focusKeyword: 'hydraulic hose sand abrasion',
    seoTitle: 'Hydraulic hose sand abrasion in Gulf conditions',
    seoDescription:
      'Airborne sand gets between the hose and everything it touches, and turns contact into wear. Where it does the damage, and the protection that actually works.',
  },
  'hydraulic-hose-coastal-corrosion': {
    focusKeyword: 'hydraulic hose coastal corrosion',
    seoTitle: 'Hydraulic hose coastal corrosion at Jebel Ali',
    seoDescription:
      'Salt air runs the corrosion clock faster on the coast. What it does to fittings and reinforcement wire, and how to specify for Jebel Ali and Mussafah.',
  },
  'offshore-hydraulic-hose': {
    focusKeyword: 'offshore hydraulic hose',
    seoTitle: 'Offshore hydraulic hose and the splash zone',
    seoDescription:
      'Offshore is where fittings stop being an afterthought. Splash zone exposure, material choice and the specification decisions that decide service life.',
  },
  'hydraulic-hose-shelf-life-storage': {
    focusKeyword: 'hydraulic hose shelf life',
    seoTitle: 'Hydraulic hose shelf life and how to store spares',
    seoDescription:
      'A hose can expire on the shelf before it is ever fitted. What the standards say about shelf life and storage, and how to date-code a stores rack properly.',
  },
  'why-summer-is-harder-on-hydraulic-hose': {
    focusKeyword: 'summer is harder on hydraulic hose',
    seoTitle: 'Why summer is harder on hydraulic hose than heat alone',
    seoDescription:
      'Gulf summer stacks fluid temperature, surface temperature, UV and trapped pressure on the same hose at once. Why the combination beats any single figure.',
  },
  'desalination-and-water-treatment-hose': {
    focusKeyword: 'desalination and water treatment hose',
    seoTitle: 'Desalination and water treatment hose selection',
    seoDescription:
      'Seawater is not the difficult part of a desalination duty. Chemical dosing, temperature and cleaning regimes decide which hose survives, and which does not.',
  },

  // ── hose-assembly ──────────────────────────────────────────────────────
  'getting-a-hydraulic-hose-made': {
    focusKeyword: 'getting a hydraulic hose made',
    seoTitle: 'Getting a hydraulic hose made: what to bring',
    seoDescription:
      'What a hose shop measures, what to bring with you, and what we can work out from the old assembly alone. Written so a first visit takes one trip, not two.',
  },
  'skiving-and-fitting-selection': {
    focusKeyword: 'skiving and fitting selection',
    seoTitle: 'Skiving and fitting selection: when hose needs it',
    seoDescription:
      'Skive or no-skive is decided by the fitting, not by preference. What skiving does, when a fitting requires it, and what happens to a joint that skipped it.',
  },
  'on-site-hydraulic-hose-service-uae': {
    focusKeyword: 'on-site hydraulic hose service',
    seoTitle: 'On-site hydraulic hose service across the UAE',
    seoDescription:
      'What a mobile hose service actually involves: response, on-vehicle stock, what can be built at the machine, and what still has to come back to a workshop.',
  },
  'hose-service-northern-emirates': {
    focusKeyword: 'hose service northern emirates',
    seoTitle: 'Hose service Northern Emirates: four problems',
    seoDescription:
      'Sharjah, Ajman, Ras Al Khaimah and Fujairah each break hoses differently — quarry dust, port salt, factory heat. What that changes about stock and response.',
  },
  'bulk-hose-refit-and-tagging': {
    focusKeyword: 'bulk hose refit and tagging',
    seoTitle: 'Bulk hose refit and tagging beats one-at-a-time',
    seoDescription:
      'Replacing a whole machine of hoses at once ends the pattern of one failure a month. How a bulk refit is surveyed, built and tagged, and when it pays.',
  },
  'how-to-measure-a-hydraulic-hose': {
    focusKeyword: 'how to measure a hydraulic hose',
    seoTitle: 'How to measure a hydraulic hose for replacement',
    seoDescription:
      'Overall length is not cut length, and the difference is what sends assemblies back. How to measure face to face, and how to record elbow orientation.',
  },
  'hydraulic-quick-couplers-iso-7241': {
    focusKeyword: 'hydraulic quick couplers iso 7241',
    seoTitle: 'Hydraulic quick couplers ISO 7241: A, B, flat face',
    seoDescription:
      'Two half-inch couplers will not mate if one is Series A and the other Series B. The interchange families explained, and how to identify one from a photo.',
  },
  'hydraulic-fitting-make-up-torque': {
    focusKeyword: 'hydraulic fitting make-up torque',
    seoTitle: 'Hydraulic fitting make-up torque and turns method',
    seoDescription:
      'Why there is no universal torque table, how turns from finger tight works instead, and what over-tightening does to each seat type. Use two wrenches.',
  },
  'field-re-hosing-kit': {
    focusKeyword: 'field re-hosing kit',
    seoTitle: 'The field re-hosing kit to stage before you start',
    seoDescription:
      'Re-hosing a machine that cannot reach a workshop: what to stage, how to tag before removal, and the order of work that avoids stranding the machine.',
  },

  // ── industrial-hose ────────────────────────────────────────────────────
  'industrial-hose-is-not-hydraulic-hose': {
    focusKeyword: 'industrial hose is not hydraulic hose',
    seoTitle: 'Industrial hose is not hydraulic hose: select on medium',
    seoDescription:
      'Industrial hose is chosen on what flows through it; hydraulic hose on pressure. Why swapping one for the other fails, and how to specify each properly.',
  },
  'chemical-transfer-hose-selection': {
    focusKeyword: 'chemical transfer hose selection',
    seoTitle: 'Chemical transfer hose selection and charts',
    seoDescription:
      'How to read a chemical compatibility chart properly: concentration, temperature, exposure time, and the ratings that quietly assume ambient conditions.',
  },
  'steam-hose-safety': {
    focusKeyword: 'steam hose safety',
    seoTitle: 'Steam hose safety: the coupling matters most',
    seoDescription:
      'On a steam hose the coupling fails before the hose does. Why clamped ends are the risk, what to specify instead, and how to inspect one that is in service.',
  },
  'food-grade-hose-compliance': {
    focusKeyword: 'food grade hose compliance',
    seoTitle: 'Food grade hose compliance and certification',
    seoDescription:
      'The certificate matters as much as the hose. Which food-contact standards apply, what a compliant assembly needs end to end, and what traceability proves.',
  },
  'water-suction-and-dewatering-hose': {
    focusKeyword: 'water suction and dewatering hose',
    seoTitle: 'Water suction and dewatering hose specification',
    seoDescription:
      'Suction, not pressure, is the whole specification on a dewatering hose. Why a pressure hose collapses on the suction side, and how to size the bore.',
  },

  // ── machine-down ───────────────────────────────────────────────────────
  'excavator-hydraulic-hose-replacement': {
    focusKeyword: 'excavator hydraulic hose replacement',
    seoTitle: 'Excavator hydraulic hose replacement by circuit',
    seoDescription:
      'Which excavator circuit failed, and how to tell from where the oil is. Boom, arm, bucket, swing and travel, with what each failure looks like on site.',
  },
  'forklift-hydraulic-hose-replacement': {
    focusKeyword: 'forklift hydraulic hose replacement',
    seoTitle: 'Forklift hydraulic hose replacement: mast or tilt',
    seoDescription:
      'Mast, tilt and attachment circuits fail differently on a forklift. How to identify which one has gone, and what to check before fitting the replacement.',
  },
  'tipper-and-transit-mixer-hose': {
    focusKeyword: 'tipper and transit mixer hose',
    seoTitle: 'Tipper and transit mixer hose: three that strand you',
    seoDescription:
      'Three hoses strand a tipper or a mixer more often than the rest combined. Which they are, why they fail, and what is worth carrying as a spare.',
  },
  'wheel-loader-hydraulic-hose': {
    focusKeyword: 'wheel loader hydraulic hose',
    seoTitle: 'Wheel loader hydraulic hose: lift, tilt or steering',
    seoDescription:
      'Telling a lift, tilt or steering failure apart on a wheel loader before anything is dismantled — and which of the three strands the machine immediately.',
  },
  'mobile-crane-hydraulic-hose': {
    focusKeyword: 'mobile crane hydraulic hose',
    seoTitle: 'Mobile crane hydraulic hose and lifting safety',
    seoDescription:
      'On a mobile crane some hose failures are a lifting incident, not a leak. Which circuits carry that risk, and what inspection and certification demand.',
  },
  'backhoe-hydraulic-hose': {
    focusKeyword: 'backhoe hydraulic hose',
    seoTitle: 'Backhoe hydraulic hose: two machines, two problems',
    seoDescription:
      'A backhoe loader is a loader at one end and an excavator at the other, and the hoses fail differently at each. What to expect from both halves.',
  },
  'skid-steer-hydraulic-hose': {
    focusKeyword: 'skid steer hydraulic hose',
    seoTitle: 'Skid steer hydraulic hose: couplers are the weak point',
    seoDescription:
      'On a skid steer the attachment couplers fail long before the hoses do. Why the auxiliary circuit takes the damage, and what to specify instead.',
  },
  'truck-crane-hydraulic-hose': {
    focusKeyword: 'truck crane hydraulic hose',
    seoTitle: 'Truck crane hydraulic hose on a moving boom',
    seoDescription:
      'Hoses on a truck-mounted crane live on a boom that extends, slews and folds. What that motion does to routing, and where the wear always turns up.',
  },
  'boom-lift-hydraulic-hose': {
    focusKeyword: 'boom lift hydraulic hose',
    seoTitle: 'Boom lift hydraulic hose inside a certified machine',
    seoDescription:
      'Access equipment carries an inspection regime, and that changes what a hose replacement has to document. What certification demands of the assembly.',
  },
  'port-equipment-hydraulic-hose': {
    focusKeyword: 'port equipment hydraulic hose',
    seoTitle: 'Port equipment hydraulic hose: salt and no downtime',
    seoDescription:
      'Reach stackers and RTGs combine salt air, continuous duty and no downtime window. How that combination sets the specification and the stock policy.',
  },
  'tractor-hydraulic-hose': {
    focusKeyword: 'tractor hydraulic hose',
    seoTitle: 'Tractor hydraulic hose and older remote couplers',
    seoDescription:
      'On most tractors the remote couplers are older than the machine and rarely match the implement. How to identify what you have before ordering.',
  },
  'concrete-pump-hydraulic-hose': {
    focusKeyword: 'concrete pump hydraulic hose',
    seoTitle: 'Concrete pump hydraulic hose: highest pressure on site',
    seoDescription:
      'Concrete pumps run the highest hydraulic pressures on most sites. What that means for hose grade, fitting choice and how often assemblies are replaced.',
  },
  'injection-moulding-hydraulic-hose': {
    focusKeyword: 'injection moulding hydraulic hose',
    seoTitle: 'Injection moulding hydraulic hose: heat, not motion',
    seoDescription:
      'On a moulding machine heat kills hoses rather than movement. Where radiant heat does the damage, and what changes about grade and routing because of it.',
  },
  'refuse-truck-hydraulic-hose': {
    focusKeyword: 'refuse truck hydraulic hose',
    seoTitle: 'Refuse truck hydraulic hose and the duty cycle',
    seoDescription:
      'A refuse compactor cycles far more often than anyone plans for, and hose life follows the cycle count rather than the calendar. What to schedule instead.',
  },
  'removing-a-seized-hydraulic-fitting': {
    focusKeyword: 'removing a seized hydraulic fitting',
    seoTitle: 'Removing a seized hydraulic fitting without damage',
    seoDescription:
      'Penetrant, heat, backing wrenches and when to cut the hose off — plus the point at which to stop, before a seized fitting becomes a scrapped manifold.',
  },
  'log-splitter-and-shop-press-hose': {
    focusKeyword: 'log splitter and shop press hose',
    seoTitle: 'Log splitter and shop press hose specification',
    seoDescription:
      'Small builds reach relief pressure on every cycle. Why to specify against the relief setting, and why a pressure hose must never go on the suction side.',
  },
  'detaching-a-hose-on-a-modern-machine': {
    focusKeyword: 'detaching a hose on a modern machine',
    seoTitle: 'Detaching a hose on a modern machine: guards first',
    seoDescription:
      'On a recent machine, access takes longer than the hose change. Guards, clamp blocks, bundle order, and what to photograph before anything comes apart.',
  },

  // ── maintenance-reliability ────────────────────────────────────────────
  'hydraulic-hose-inspection': {
    focusKeyword: 'hydraulic hose inspection',
    seoTitle: 'Hydraulic hose inspection: what to look for',
    seoDescription:
      'What to look for on a hydraulic hose, what each sign actually means, and which findings can wait until the next service against which stop the machine now.',
  },
  'hose-register-and-replacement-programme': {
    focusKeyword: 'hose register and replacement programme',
    seoTitle: 'A hose register and replacement programme that works',
    seoDescription:
      'How to build a hose register that ends unplanned failures instead of documenting them: what to record, how to group by risk, and when to replace on time.',
  },
  'contamination-during-a-hose-change': {
    focusKeyword: 'contamination during a hose change',
    seoTitle: 'Contamination during a hose change: what gets in',
    seoDescription:
      'The pump that fails weeks after a hose change did not do so by coincidence. Where contamination enters while the line is open, and the routine that stops it.',
  },
  'grease-and-zerk-fittings': {
    focusKeyword: 'grease and zerk fittings',
    seoTitle: 'Grease and zerk fittings: threads and seized ones',
    seoDescription:
      'Four thread families that look alike, three head styles that need different couplers, and why a point that will not take grease is usually the fitting.',
  },
  'mini-excavator-hose-maintenance': {
    focusKeyword: 'mini excavator hose maintenance',
    seoTitle: 'Mini excavator hose maintenance nobody schedules',
    seoDescription:
      'The four positions that fail first on a mini excavator, a ninety-second daily walk-round, and what to check on every machine returning from hire.',
  },

  // ── oilfield-pressure-control ──────────────────────────────────────────
  'api-7k-16c-16d-which-standard': {
    focusKeyword: 'api 7k 16c 16d',
    seoTitle: 'API 7K 16C 16D: which standard governs which hose',
    seoDescription:
      'Rotary, choke and kill, and BOP control hose each sit under a different API standard. Which governs what on a rig, and what each one actually requires.',
  },
  'api-16c-choke-and-kill-lines': {
    focusKeyword: 'api 16c choke and kill lines',
    seoTitle: 'API 16C choke and kill lines: liner and temperature',
    seoDescription:
      'Liner selection, temperature rating and the 1.5:1 problem on API 16C choke and kill hose — and what a compliant assembly has to carry with it.',
  },
  'bop-control-hose-fire-resistance': {
    focusKeyword: 'bop control hose fire resistance',
    seoTitle: 'BOP control hose fire resistance is half the spec',
    seoDescription:
      'Fire survival is not an extra on BOP control hose, it is half the specification. What the fire test proves, and what a certificate has to show.',
  },
  'api-7k-rotary-vibrator-hose': {
    focusKeyword: 'api 7k rotary vibrator hose',
    seoTitle: 'API 7K rotary vibrator hose: couplings and clamps',
    seoDescription:
      'Coupling type, sour service rating and safety clamps on API 7K rotary and vibrator hose — the three things an inspection will actually look at.',
  },
  'rig-site-hose-replacement-abu-dhabi': {
    focusKeyword: 'rig-site hose replacement abu dhabi',
    seoTitle: 'Rig-site hose replacement Abu Dhabi: the permit',
    seoDescription:
      'On a live rig the permit sets the schedule, not the hose build. How a rig-site replacement in Abu Dhabi and Al Dhafra is planned around it.',
  },

  // ── procurement-export ─────────────────────────────────────────────────
  'how-to-cross-reference-a-hydraulic-hose': {
    focusKeyword: 'cross-reference a hydraulic hose',
    seoTitle: 'How to cross-reference a hydraulic hose properly',
    seoDescription:
      'What actually has to match when cross-referencing a hose or fitting, what a designation does not settle, and why a table found online is not evidence.',
  },
  'what-to-send-for-a-hose-quote': {
    focusKeyword: 'what to send for a hose quote',
    seoTitle: 'What to send for a hose quote to get a price first time',
    seoDescription:
      'Five details cover almost every assembly, and the missing one is usually the same. What to include so the first reply is a number rather than a question.',
  },
  'hydraulic-hose-assembly-cost': {
    focusKeyword: 'hydraulic hose assembly cost',
    seoTitle: 'What drives hydraulic hose assembly cost',
    seoDescription:
      'The hose is rarely the expensive part. Fittings, ends, testing and traceability drive the price of an assembly — here is how to read a quote properly.',
  },
  'hydraulic-hose-stocking-policy': {
    focusKeyword: 'hydraulic hose stocking policy',
    seoTitle: 'A hydraulic hose stocking policy worth holding',
    seoDescription:
      'Which hoses earn a place on the shelf and which do not, how shelf life limits what is worth holding, and how to size a stock list from failure history.',
  },
  'hydraulic-hose-lead-times': {
    focusKeyword: 'hydraulic hose lead times',
    seoTitle: 'Hydraulic hose lead times: stock, built or imported',
    seoDescription:
      'What actually sets a lead time — stocked, made to order, or imported — and which part of the assembly is usually the constraint. No dates, just structure.',
  },
  'bulk-hose-or-finished-assemblies': {
    focusKeyword: 'bulk hose or finished assemblies',
    seoTitle: 'Bulk hose or finished assemblies: which to buy',
    seoDescription:
      'Buying hose by the metre against buying it built and tagged: what each costs you in time, traceability and responsibility, and where the crossover sits.',
  },
  'unbranded-hydraulic-fittings': {
    focusKeyword: 'unbranded hydraulic fittings',
    seoTitle: 'Unbranded hydraulic fittings: what you are buying',
    seoDescription:
      'Unmarked fittings and untraceable hose have no stated rating, whatever the invoice says. What traceability proves, and when its absence actually matters.',
  },
  'hydraulic-hose-kits-for-a-fleet': {
    focusKeyword: 'hydraulic hose kits for a fleet',
    seoTitle: 'Hydraulic hose kits for a fleet, built from failures',
    seoDescription:
      'Turning a fleet history of failures into a planned kit list: which assemblies to pre-build, how many, and how tagging makes the next change a swap.',
  },
  'should-you-buy-a-hose-crimper': {
    focusKeyword: 'should you buy a hose crimper',
    seoTitle: 'Should you buy a hose crimper? The real economics',
    seoDescription:
      'Dies, ferrules and stock cost more than the machine. When owning a crimper pays, what responsibility comes with it, and the middle option most people pick.',
  },

  // ── safety ─────────────────────────────────────────────────────────────
  'hydraulic-fluid-injection-injury': {
    focusKeyword: 'hydraulic fluid injection injury',
    seoTitle: 'Hydraulic fluid injection injury is an emergency',
    seoDescription:
      'A pinhole leak injects fluid through skin with almost no pain and little to see. Why it is a surgical emergency, and what to do in the first hour.',
  },
  'hose-whip-restraint-and-burst-protection': {
    focusKeyword: 'hose whip restraint',
    seoTitle: 'Hose whip restraint and burst protection that works',
    seoDescription:
      'What actually stops a failed hose injuring someone: whip restraints, sleeving and guarding, where each belongs, and how they are anchored correctly.',
  },
  'trapped-pressure-quick-coupler': {
    focusKeyword: 'trapped pressure quick coupler',
    seoTitle: 'Trapped pressure quick coupler: releasing it safely',
    seoDescription:
      'A coupler that will not connect after standing in the sun is holding trapped pressure. How to release it safely, and why hammering it damages the pair.',
  },

  // ── specification-standards ────────────────────────────────────────────
  'hydraulic-hose-pressure-by-size': {
    focusKeyword: 'hydraulic hose pressure by size',
    seoTitle: 'Hydraulic hose pressure by size, not by grade',
    seoDescription:
      'One pressure figure per grade misleads you, because working pressure falls as bore rises. How to read a rating against the size you are actually buying.',
  },
  'braid-vs-spiral-hydraulic-hose': {
    focusKeyword: 'braid vs spiral hydraulic hose',
    seoTitle: 'Braid vs spiral hydraulic hose: bore decides',
    seoDescription:
      'Braided and spiral hose are not two grades of the same thing. Where the crossover sits, what impulse duty demands, and why bore makes the choice for you.',
  },
  'compact-hose-1sc-2sc': {
    focusKeyword: 'compact hose 1sc 2sc',
    seoTitle: 'Compact hose 1SC 2SC: half the bend radius',
    seoDescription:
      'Compact hose gives roughly half the bend radius of standard braided hose at the same pressure, and almost nobody orders it. When it is the right answer.',
  },
  'sae-100r-hose-types': {
    focusKeyword: 'sae 100r hose types',
    seoTitle: 'SAE 100R hose types: a catalogue, not a ranking',
    seoDescription:
      'R1 to R17 is a list of constructions, not a scale of quality. What each SAE 100R type is built for, and why a higher number is not a better hose.',
  },
  'en-853-856-857-vs-sae-100r': {
    focusKeyword: 'en 853 856 857 vs sae 100r',
    seoTitle: 'EN 853 856 857 vs SAE 100R: what cross-references',
    seoDescription:
      'Which EN and SAE hose grades genuinely cross-reference, which only look like they do, and what has to match before a substitution is safe to make.',
  },
  'hydraulic-hose-dash-sizes': {
    focusKeyword: 'hydraulic hose dash sizes',
    seoTitle: 'Hydraulic hose dash sizes from -04 to -48',
    seoDescription:
      'Dash sizes are sixteenths of an inch of bore, with one grade where the number means something else entirely. The full table and the exception.',
  },
  'how-to-read-a-hose-layline': {
    focusKeyword: 'how to read a hose layline',
    seoTitle: 'How to read a hose layline and what it tells you',
    seoDescription:
      'The printing along a hydraulic hose carries grade, size, standard, pressure and often a date. How to read each field, and what to do when it has worn off.',
  },
  'stopping-an-npt-thread-leak': {
    focusKeyword: 'stopping an npt thread leak',
    seoTitle: 'Stopping an NPT thread leak: tape, sealant, neither',
    seoDescription:
      'Where PTFE tape belongs, where anaerobic sealant belongs, and the four connector families where adding either one guarantees the leak you are chasing.',
  },
  'sae-j518-code-61-code-62-flanges': {
    focusKeyword: 'sae j518 code 61 code 62 flanges',
    seoTitle: 'SAE J518 Code 61 Code 62 flanges: telling them apart',
    seoDescription:
      'Two split flanges for the same bore with very different ratings, and little on the part to say which. The measurement that settles it before you order.',
  },
  'where-jic-is-the-wrong-choice': {
    focusKeyword: 'where jic is the wrong choice',
    seoTitle: 'Where JIC is the wrong choice, and what to use',
    seoDescription:
      'JIC is the right default for most of a machine and wrong in four specific cases: vibration, repeated make and break, high impulse, and large bore.',
  },

  // ── GCC supplier sprint + Africa fittings sprint (2026-09-01) ──────────
  //
  // Titles here are capped at 40 characters rather than the 60 the range
  // allows. The storefront appends ' | Indus Hydraulics' (19 chars), so a
  // 60-character title renders at 79 and Google truncates it — an effect the
  // scored range does not model. The 93 entries above predate this rule and
  // are a separate cleanup; `blog-seo.test.ts` enforces the cap for these 40.
  'saber-certificate-for-hydraulic-hose': {
    focusKeyword: 'saber certificate',
    seoTitle: 'SABER certificate for a hose shipment',
    seoDescription:
      'How SABER product and shipment registration works for a hose consignment into Saudi Arabia, who issues what, and the sequence that keeps a load moving.',
  },
  'gulf-conformity-mark-hose-fittings': {
    focusKeyword: 'gulf conformity mark',
    seoTitle: 'Does hose need a Gulf conformity mark?',
    seoDescription:
      'The Gulf conformity mark covers low-voltage equipment and toys, not hydraulic hose. What a hose consignment into the GCC actually needs instead.',
  },
  'certificate-of-origin-gcc-duty': {
    focusKeyword: 'certificate of origin',
    seoTitle: 'Certificate of origin and GCC duty',
    seoDescription:
      'What a certificate of origin states on a hose consignment, why re-export from Dubai does not confer UAE origin, and how duty works inside the customs union.',
  },
  'hose-assembly-test-certificate': {
    focusKeyword: 'assembly test certificate',
    seoTitle: 'The hose assembly test certificate',
    seoDescription:
      'What a hydraulic hose assembly proof-test certificate establishes, what it cannot tell you, and what to ask for alongside it on a documented order.',
  },
  'material-test-certificate-en-10204': {
    focusKeyword: 'material test certificate',
    seoTitle: 'Material test certificate: 3.1 vs 2.2',
    seoDescription:
      'What EN 10204 inspection documents mean on hydraulic fittings, when a 3.1 is genuinely required, and how to write the clause so a supplier can meet it.',
  },
  'nace-mr0175-hose-documentation': {
    focusKeyword: 'nace mr0175',
    seoTitle: 'NACE MR0175 documentation for hose',
    seoDescription:
      'What NACE MR0175 covers on a hose order, why it governs the metallic parts rather than the rubber, and what to specify for sour-service duty.',
  },
  'vendor-approval-for-hose-supply': {
    focusKeyword: 'vendor approval',
    seoTitle: 'Vendor approval for hose supply',
    seoDescription:
      'How operator approved-vendor regimes affect hose supply in the Gulf, what they ask of a contractor, and which documentation makes an order acceptable.',
  },
  'verifying-a-genuine-hydraulic-hose': {
    focusKeyword: 'genuine hydraulic hose',
    seoTitle: 'Verifying a genuine hydraulic hose',
    seoDescription:
      'How to verify a hydraulic hose is the grade it claims to be: layline marking, batch and date, fitting identification and the receiving checks worth doing.',
  },
  'gcc-import-documents-for-hose': {
    focusKeyword: 'gcc import documents',
    seoTitle: 'GCC import documents for a hose order',
    seoDescription:
      'The import documentation regimes for hose consignments into Qatar, Oman, Kuwait and Bahrain, how each differs from Saudi SABER, and what to prepare.',
  },
  'oilfield-hose-document-pack': {
    focusKeyword: 'oilfield hose document pack',
    seoTitle: 'The oilfield hose document pack',
    seoDescription:
      'The documentation that travels with an oilfield hose assembly: traceability, test records, material certificates and conformity statements.',
  },
  'fittings-on-a-chinese-excavator': {
    focusKeyword: 'chinese excavator',
    seoTitle: 'Fittings on a Chinese excavator',
    seoDescription:
      'The thread families found on Chinese-built excavators and loaders, how to tell metric cone from BSP in the hand, and what a workshop should stock.',
  },
  'fittings-on-a-used-japanese-machine': {
    focusKeyword: 'used japanese machine',
    seoTitle: 'Fittings on a used Japanese machine',
    seoDescription:
      'Two common families share a 30 degree seat and use different threads underneath. How to separate them on a used Japanese excavator, and what to stock.',
  },
  'tractor-hydraulic-fittings': {
    focusKeyword: 'tractor hydraulic fittings',
    seoTitle: 'Tractor hydraulic fittings to stock',
    seoDescription:
      'The thread families found on tractors and implements, how the quick-coupler question differs from the fitting question, and what to hold before a season.',
  },
  'fittings-on-american-machines': {
    focusKeyword: 'american machines',
    seoTitle: 'Hydraulic fittings on American machines',
    seoDescription:
      'The inch thread families on American-built machines, how to tell JIC from ORFS and a taper thread from a straight port, and what a metric workshop adds.',
  },
  'fittings-on-european-machines': {
    focusKeyword: 'european machines',
    seoTitle: 'Hydraulic fittings on European machines',
    seoDescription:
      'The metric cone family on European-built machines, the light and heavy series distinction that catches people out, and what else sits at ports and pumps.',
  },
  'korean-excavator-hydraulic-fittings': {
    focusKeyword: 'korean excavator',
    seoTitle: 'Korean excavator hydraulic fittings',
    seoDescription:
      'Which thread families to expect on Korean-built excavators, why one machine can carry more than one, and how to identify per line rather than per machine.',
  },
  'bsp-or-metric-fittings': {
    focusKeyword: 'bsp or metric fittings',
    seoTitle: 'BSP or metric fittings: which is it?',
    seoDescription:
      'Why thread convention follows the origin of the machine rather than the country it works in, and how to stock a workshop for a mixed-import fleet.',
  },
  'measuring-a-fitting-without-gauges': {
    focusKeyword: 'fitting without gauges',
    seoTitle: 'Measuring a fitting without gauges',
    seoDescription:
      'How to identify a hydraulic fitting in the field with a caliper, a ruler and a known bolt: what each measurement settles, and what to send a supplier.',
  },
  'building-a-thread-reference-board': {
    focusKeyword: 'thread reference board',
    seoTitle: 'Building a thread reference board',
    seoDescription:
      'How to build a hydraulic thread reference board: which samples to mount, how to label them so they stay trustworthy, and how to use it when ordering.',
  },
  'bridging-two-thread-standards': {
    focusKeyword: 'two thread standards',
    seoTitle: 'Bridging two thread standards safely',
    seoDescription:
      'When adapting between hydraulic thread families is correct, why stacked adapters fail, and how to design the bridge out at the next hose change.',
  },
  'what-to-send-for-a-fittings-quote': {
    focusKeyword: 'fittings quote',
    seoTitle: 'What to send for a fittings quote',
    seoDescription:
      'The measurements, photographs and context a supplier needs to name a hydraulic fitting on the first reply, and the two details buyers leave out.',
  },
  'cross-referencing-a-fitting-part-number': {
    focusKeyword: 'fitting part number',
    seoTitle: 'Cross-referencing a fitting part number',
    seoDescription:
      'How to translate a hydraulic fitting part number into the geometry that matters, why interchange tables are risky, and what to send a supplier instead.',
  },
  'adapter-kit-for-a-mixed-fleet': {
    focusKeyword: 'adapter kit',
    seoTitle: 'An adapter kit for a mixed fleet',
    seoDescription:
      'How to derive a fitting and adapter kit from the machines you actually run, which lines are worth doubling, and why a catalogue kit is mostly dead stock.',
  },
  'spares-list-for-a-remote-site': {
    focusKeyword: 'spares list',
    seoTitle: 'A spares list for a remote site',
    seoDescription:
      'How to choose hydraulic fittings, seals and hose spares for a site far from resupply, weighted by what stops production rather than by unit cost.',
  },
  'inspecting-fittings-on-arrival': {
    focusKeyword: 'inspecting fittings',
    seoTitle: 'Inspecting fittings on arrival',
    seoDescription:
      'What to check when a consignment of hydraulic fittings arrives: thread quality, seat finish, count and plating, and which faults cannot be seen at all.',
  },
  'plating-and-corrosion-on-fittings': {
    focusKeyword: 'plating and corrosion',
    seoTitle: 'Plating and corrosion on fittings',
    seoDescription:
      'Zinc, zinc-nickel and other finishes on hydraulic fittings, how corrosion resistance is compared, and what changes on a humid or coastal site.',
  },
  'when-stainless-is-worth-it': {
    focusKeyword: 'when stainless is worth it',
    seoTitle: 'Fittings: when stainless is worth it',
    seoDescription:
      'Where stainless fittings earn their cost, why they are often rated below carbon steel, and how to decide position by position rather than for a machine.',
  },
  'air-or-sea-for-a-fittings-order': {
    focusKeyword: 'air or sea',
    seoTitle: 'Air or sea for a fittings order',
    seoDescription:
      'How to choose between air and sea freight for hydraulic fittings, why per-consignment costs dominate, and when a split shipment is the cheaper answer.',
  },
  'consolidating-fittings-with-a-hose-order': {
    focusKeyword: 'consolidating fittings',
    seoTitle: 'Consolidating fittings with hose',
    seoDescription:
      'Why sending fittings and hose as one consignment costs less than two, what has to be decided earlier to do it, and when splitting the order is still right.',
  },
  'substituting-a-fitting-safely': {
    focusKeyword: 'substituting a fitting',
    seoTitle: 'Substituting a fitting safely: rules',
    seoDescription:
      'What must match before substituting a hydraulic fitting: thread and seat, pressure rating, material and bore, and when a substitution should be refused.',
  },
  'copper-mine-hydraulic-fittings': {
    focusKeyword: 'copper mine hydraulic fittings',
    seoTitle: 'Copper mine hydraulic fittings',
    seoDescription:
      'What fails on a mining haul fleet versus in the concentrator, which materials the environment argues for, and how to stock a site far from resupply.',
  },
  'gold-plant-hydraulic-fittings': {
    focusKeyword: 'gold plant hydraulic fittings',
    seoTitle: 'Gold plant hydraulic fittings guide',
    seoDescription:
      'Which areas of a gold circuit are abrasion problems and which are chemical ones, and how that changes the material and finish you should specify.',
  },
  'oilfield-fittings-in-west-africa': {
    focusKeyword: 'oilfield fittings',
    seoTitle: 'Oilfield fittings in West Africa',
    seoDescription:
      'How oilfield supply into West Africa splits between rig-side flow equipment and general plant hydraulics, and what documentation each one attracts.',
  },
  'agriculture-and-construction-fittings': {
    focusKeyword: 'construction fittings',
    seoTitle: 'Agriculture and construction fittings',
    seoDescription:
      'How to stock hydraulic fittings for a workshop covering tractors, implements and light construction plant, and which failures actually recur.',
  },
  'quarry-and-crusher-fittings': {
    focusKeyword: 'quarry and crusher fittings',
    seoTitle: 'Quarry and crusher fittings guide',
    seoDescription:
      'Why hydraulic joints fail on crushing and screening plant, what vibration does to a port, and the changes that actually extend life in a quarry.',
  },
  'water-well-drilling-rig-fittings': {
    focusKeyword: 'drilling rig fittings',
    seoTitle: 'Water well drilling rig fittings',
    seoDescription:
      'Which hydraulic fittings and spares to carry on a water-well drilling rig, what fails on rotation and feed circuits, and how to stock a machine that moves.',
  },
  'port-and-terminal-fittings': {
    focusKeyword: 'port and terminal fittings',
    seoTitle: 'Port and terminal fittings: salt air',
    seoDescription:
      'Hydraulic fittings for port equipment: why salt air decides the finish, what fails on reach stackers and cranes, and how to plan around continuous work.',
  },
  'sugar-mill-and-agro-processing-fittings': {
    focusKeyword: 'sugar mill',
    seoTitle: 'Sugar mill fittings and the season',
    seoDescription:
      'Hydraulic fittings in sugar and agro-processing plant: steam and washdown exposure, what to change in the off-season, and how to buy against a calendar.',
  },
  'buying-fittings-in-south-africa': {
    focusKeyword: 'buying fittings',
    seoTitle: 'Buying fittings in South Africa',
    seoDescription:
      'When to buy hydraulic fittings locally in South Africa and when importing makes sense: volume, long-lead items, mixed consignments and specifications.',
  },
  'factory-and-fixed-plant-fittings': {
    focusKeyword: 'fixed plant fittings',
    seoTitle: 'Fixed plant fittings: standardise',
    seoDescription:
      'Why fixed manufacturing plant should narrow its hydraulic fitting families, how to convert without a shutdown, and what it saves in stores and downtime.',
  },
}
