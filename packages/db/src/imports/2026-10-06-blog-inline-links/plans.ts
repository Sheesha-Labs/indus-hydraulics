/**
 * In-text catalogue links for the published articles.
 *
 * The 2026-10-05 audit counted the links inside article prose: none to a
 * product, none to a category, across 170 posts. Every catalogue link came from
 * a structured block — a `product_embed` card or a `category_link` tile at the
 * foot of the piece. Those stay; this adds what they cannot give, a descriptive
 * link in the sentence that actually discusses the part, pointing at the
 * deepest page that answers it.
 *
 * Two kinds of entry per article:
 *
 *   links — a phrase the article already uses, linked where it first appears
 *           in a paragraph, prose run or lead (never inside a heading, never
 *           inside an existing link, never in the lead's first words, where the
 *           drop cap sits).
 *   add   — one sentence appended to the paragraph identified by `after`
 *           (matched on the paragraph's text), for articles whose prose carries
 *           too few catalogue nouns to link. Each states something the article
 *           did not, and every figure in one is from the live product data:
 *           temperature limits and cover specifications from the hose specs,
 *           bend radii from the compact-hose tables already quoted on the blog.
 *
 * Rules the plan was written to:
 *
 *   - At most five new links per article, and rarely more than two in one
 *     paragraph.
 *   - The deepest page that fits. /c/hydraulic-hoses already receives 65 of the
 *     blog's category tiles, so a named grade links to its own product page.
 *   - Lifting articles link lifting shelves; a "ferrule" in a wire rope piece
 *     is a wire rope ferrule, not a hose ferrule.
 *   - /c/hose-clamps-sleeves-ferrules holds industrial hose clamps — safety,
 *     interlocking, sanitary and steam clamps. It is not linked from a routing
 *     clamp or a spiral guard on a hydraulic machine, which it does not stock.
 *
 * The runner refuses an unknown href, a phrase it cannot find, or an `after`
 * that names no paragraph, and it skips any link or sentence already present —
 * so a re-run is a no-op rather than a second copy.
 */

export type InlineLink = { phrase: string; href: string }
export type Addition = { after: string; html: string }
export type InlinePlan = { links?: InlineLink[]; add?: Addition[] }

const p = (slug: string) => `/p/${slug}`
const c = (slug: string) => `/c/${slug}`

// Hose grades
const R2 = p('r2-2sn-double-wire-braid-hydraulic-hose')
const R1 = p('r1-1sn-single-wire-braid-hydraulic-hose')
const SH4 = p('4sh-four-spiral-heavy-duty-hydraulic-hose')
const SP4 = p('4sp-four-spiral-hydraulic-hose')
const R12 = p('r12-four-spiral-high-pressure-hose')
const R13 = p('r13-multi-spiral-very-high-pressure-hose')
const SC2 = p('2sc-compact-two-wire-braid-hose')
const SC1 = p('r1-1sc-compact-single-wire-braid-hose')
const R5 = p('r5-textile-cover-single-wire-braid-hose')
const R6 = p('r6-single-fibre-braid-low-pressure-hose')
const R7 = p('r7-thermoplastic-hydraulic-hose')
const R8 = p('r8-thermoplastic-hydraulic-hose')
const R14 = p('r14-ptfe-hydraulic-hose')

// Hydraulic shelves
const FITTINGS = c('hydraulic-fittings')
const ADAPTERS = c('hydraulic-adapters')
const FERRULES = c('crimp-ferrules')
const COUPLERS = c('quick-couplers')
const HYD_HOSES = c('hydraulic-hoses')
const JIC_FIT = c('jic-37-hose-fittings')
const JIC_AD = c('jic-adapters')
const ORFS_FIT = c('orfs-hose-fittings')
const ORFS_AD = c('orfs-adapters')
const BSP_FIT = c('bsp-hose-fittings')
const BSP_AD = c('bsp-hydraulic-adapters-uae')
const NPT_AD = c('npt-adapters')
const DIN2353 = c('din-2353-bite-type-adapters-uae')
const METRIC_FIT = c('metric-hose-fittings')
const METRIC_AD = c('metric-adapters')
const JIS_FIT = c('japanese-hose-fittings')
const FLANGE_FIT = c('sae-flange-fittings')
const SPIRAL_FIT = c('spiral-hose-crimp-fittings')
const SS = c('stainless-steel-hydraulic-fittings')
const SS_BSP = c('ss316l-bsp-fittings')
const SS_JIC = c('ss316l-jic-37-fittings')
const SS_ORFS = c('ss316l-orfs-fittings')

// Industrial and oilfield shelves
const INDUSTRIAL = c('industrial-hose-suppliers-uae')
const SUCTION = c('water-suction-delivery-hoses')
const STEAM = c('industrial-steam-hoses')
const FOOD = c('food-beverage-hoses')
const OIL_CHEM = c('oil-chemical-purpose-hoses')
const CAMLOCK = c('cam-and-groove-couplings')
const BAUER = c('bauer-type-couplings')
const GROUND_JOINT = c('ground-joint-couplings')
const COMPOSITE_FIT = c('composite-hose-fittings')
const UNIVERSAL_AIR = c('universal-air-couplings')
const IND_CLAMPS = c('hose-clamps-sleeves-ferrules')
const METALLIC = c('metallic-hose-suppliers-uae')
const PTFE_IND = c('ptfe-hoses')
const DRILLING = c('drilling-hoses')
const WELL_CONTROL = c('well-control-hoses')
const MOLY_PASTE = c('molykote-pastes')

// Specific parts
const ISO16028 = p('iso-16028-flush-face-hydraulic-quick-coupler')
const ISO5675 = p('iso-5675-farm-tractor-male-tip-coupler')
const FARM_CUP = p('connect-under-pressure-farm-quick-coupler')
const TEST_POINT = p('sae-j1502-diagnostic-test-point-coupler')
const GAUGE_KIT = p('hydraulic-pressure-gauge-test-kit')
const NO_SKIVE_2SN = p('no-skive-crimp-ferrule-for-r2at-2sn-hose')
const NO_SKIVE_1SN2SN = p('no-skive-crimp-ferrule-for-1sn-2sn-hose')
const RETURN_FILTER = p('hydac-0330-return-line-filter')

// Lifting shelves
const SHACKLES = c('shackles')
const HOOKS = c('lifting-hooks')
const MASTER_LINKS = c('master-links-rings-swivels')
const EYE_BOLTS = c('eye-bolts-eye-nuts')
const LIFTING_POINTS = c('lifting-points-pad-eyes')
const ROPE_CLIPS = c('wire-rope-clips')
const THIMBLES = c('wire-rope-thimbles')
const ROPE_FERRULES = c('wire-rope-ferrules-sleeves')
const SOCKETS = c('wire-rope-sockets-terminals')
const WIRE_ROPE = c('steel-wire-rope')
const WIRE_SLINGS = c('wire-rope-slings')
const CHAIN_SLINGS = c('chain-slings')
const SYNTHETIC = c('synthetic-slings')
const ALLOY_CHAIN = c('alloy-lifting-chain')
const TRANSPORT_CHAIN = c('commercial-transport-chain')
const DIN_CHAIN = c('din-link-chain')
const G80_FIT = c('grade-80-chain-fittings')
const G100_FIT = c('grade-100-chain-fittings')
const ANCHOR_CHAIN = c('anchor-chain-accessories')
const CHAIN_BLOCKS = c('chain-blocks-manual-hoists')
const ELECTRIC_HOISTS = c('electric-hoists')
const TROLLEYS = c('beam-trolleys')
const BLOCKS = c('snatch-blocks-pulleys')
const LOAD_BINDERS = c('load-binders')
const STRAPS = c('ratchet-straps-tie-downs')
const STAINLESS_CHAIN = c('stainless-steel-chain')

export const INLINE_PLANS: Record<string, InlinePlan> = {
  // ── industrial-hose ──────────────────────────────────────────────────────
  'chemical-transfer-hose-selection': {
    links: [{ phrase: 'rubber hose', href: OIL_CHEM }],
    add: [
      {
        after: 'the investigation tends to start in the wrong place.',
        html: ` On transfer lines that coupling is very often a <a href="${CAMLOCK}">cam and groove coupling</a>, and its gasket needs the same compatibility check as the hose liner.`,
      },
      {
        after: 'a hose that warns you is worth a great deal.',
        html: ` The end fittings are part of that design too: <a href="${COMPOSITE_FIT}">composite hose fittings</a> are made for the construction and are not interchangeable with rubber-hose shanks.`,
      },
    ],
  },
  'food-grade-hose-compliance': {
    links: [
      { phrase: 'industrial hose', href: INDUSTRIAL },
      { phrase: 'food hose', href: FOOD },
    ],
    add: [
      {
        after: 'compliant with what, and evidenced how.',
        html: ` That applies equally to a <a href="${p('silicone-suction-delivery-hose')}">silicone suction and delivery hose</a> and to a <a href="${p('pvc-non-toxic-suction-delivery-hose')}">non-toxic PVC hose</a>: the material is only half of the answer.`,
      },
    ],
  },
  'industrial-hose-is-not-hydraulic-hose': {
    links: [
      { phrase: 'industrial hose', href: INDUSTRIAL },
      { phrase: 'hydraulic hose', href: HYD_HOSES },
      { phrase: 'delivery hose', href: SUCTION },
    ],
  },
  'steam-hose-safety': {
    links: [
      { phrase: 'steam hose', href: STEAM },
    ],
    add: [
      {
        after: 'as one item rather than three.',
        html: ` For saturated steam that means a purpose-made steam coupling — a <a href="${GROUND_JOINT}">ground joint coupling</a> on its bolted clamp, or a European coupling secured by an <a href="${p('en-14423-clamp')}">EN 14423 clamp</a> — not a worm-drive band.`,
      },
      {
        after: 'is not thereby fit for another season.',
        html: ` Saturated steam hose in our range runs from a <a href="${p('steam-hot-water-food-hose-7-bar')}">7 bar steam and hot water hose</a> to an <a href="${p('high-pressure-red-saturated-steam-hose-18-bar')}">18 bar saturated steam hose</a>, and the replacement interval belongs to the duty, not the grade.`,
      },
    ],
  },
  'water-suction-and-dewatering-hose': {
    links: [{ phrase: 'delivery hose', href: SUCTION }],
    add: [
      {
        after: 'doing exactly what it was always going to do.',
        html: ` A true suction hose, such as our <a href="${p('water-suction-delivery-hose-16-bar')}">16 bar water suction and delivery hose</a>, carries a steel helix that holds the bore open when the pump pulls.`,
      },
      {
        after: 'a hose nobody can handle gets dropped rather than carried.',
        html: ` Where sets are joined and split on site, <a href="${CAMLOCK}">cam and groove couplings</a> are the usual choice on pump connections and <a href="${BAUER}">Bauer couplings</a> on irrigation and slurry lines.`,
      },
    ],
  },

  // ── specification-standards ──────────────────────────────────────────────
  'braid-vs-spiral-hydraulic-hose': {
    links: [
      { phrase: '2SN', href: R2 },
      { phrase: '4SH', href: SH4 },
      { phrase: '1SC', href: SC1 },
      { phrase: '2SC', href: SC2 },
    ],
    add: [
      {
        after: 'and a higher price.',
        html: ` It also takes different ends: <a href="${SPIRAL_FIT}">spiral hose crimp fittings</a> are a separate range from the fittings used on braid.`,
      },
    ],
  },
  'compact-hose-1sc-2sc': {
    links: [{ phrase: '2SN', href: R2 }],
    add: [
      {
        after: 'compact is worth considering before re-routing the machine.',
        html: ` In our range that means <a href="${SC1}">1SC</a> for single-wire duty and <a href="${SC2}">2SC</a> for two-wire; both have a smaller outside diameter than standard braid, so the ferrule has to be the one specified for the compact hose.`,
      },
    ],
  },
  'en-853-856-857-vs-sae-100r': {
    links: [
      { phrase: '2SN', href: R2 },
      { phrase: 'R12', href: R12 },
      { phrase: '4SP', href: SP4 },
      { phrase: 'R13', href: R13 },
    ],
  },
  'how-to-read-a-hose-layline': {
    links: [
      { phrase: '2SN', href: R2 },
      { phrase: 'fitting ends', href: FITTINGS },
    ],
    add: [
      {
        after: 'from its physical properties instead.',
        html: ` Outside diameter, wire count and cover type will usually narrow it to one construction in our <a href="${HYD_HOSES}">hydraulic hose range</a>.`,
      },
    ],
  },
  'hydraulic-hose-dash-sizes': {
    links: [{ phrase: 'SAE 100R5', href: R5 }],
    add: [
      {
        after: 'from the grade’s outside diameter.',
        html: ` At −08, for example, <a href="${SC2}">2SC</a> measures 20.8 mm over the cover against 22.2 mm for <a href="${R2}">2SN</a> — enough to decide whether a bundle fits its clamp.`,
      },
    ],
  },
  'hydraulic-hose-pressure-by-size': {
    links: [
      { phrase: '2SC', href: SC2 },
      { phrase: '4SH', href: SH4 },
      { phrase: '2SN', href: R2 },
      { phrase: 'R13', href: R13 },
    ],
  },
  'sae-100r-hose-types': {
    links: [
      { phrase: 'R7', href: R7 },
      { phrase: 'R2AT', href: R2 },
      { phrase: 'R6', href: R6 },
      { phrase: 'R13', href: R13 },
      { phrase: 'R12', href: R12 },
    ],
  },
  'sae-j518-code-61-code-62-flanges': {
    links: [
      { phrase: 'pipe flange', href: c('industrial-flanges') },
      { phrase: 'split flange', href: FLANGE_FIT },
    ],
    add: [
      {
        after: 'the O-ring must be the correct section for the groove.',
        html: ` The clamp halves are code-specific too: <a href="${p('split-flange-clamps-code-61-pair-bolts')}">Code 61 clamps</a> and <a href="${p('split-flange-clamps-code-62-pair-bolts')}">Code 62 clamps</a> are not interchangeable.`,
      },
    ],
  },
  'stopping-an-npt-thread-leak': {
    links: [{ phrase: 'tapered pipe thread', href: NPT_AD }],
    add: [
      {
        after: 'only stops that surface from meeting.',
        html: ` That is why NPT gets sealant and a <a href="${JIC_AD}">JIC</a> or <a href="${ORFS_AD}">ORFS</a> joint never should.`,
      },
    ],
  },
  'where-jic-is-the-wrong-choice': {
    links: [{ phrase: 'JIC', href: JIC_FIT }],
    add: [
      {
        after: 'not much more expensive.',
        html: ` The usual alternatives are <a href="${ORFS_FIT}">ORFS fittings</a> and, at large bores, <a href="${FLANGE_FIT}">SAE flange heads</a>.`,
      },
    ],
  },

  // ── hose-assembly ────────────────────────────────────────────────────────
  'bulk-hose-refit-and-tagging': {
    add: [
      {
        after: 'two hours with a torch and a tape measure.',
        html: ` Each line names the hose construction and the <a href="${FERRULES}">ferrule</a> and <a href="${FITTINGS}">hose fittings</a> used, so the next assembly is built to the same crimp specification.`,
      },
    ],
  },
  'field-re-hosing-kit': {
    add: [
      {
        after: 'the difference is almost entirely preparation.',
        html: ` That means bulk hose, <a href="${FERRULES}">ferrules</a> and <a href="${FITTINGS}">hose fittings</a> in the bores the machine actually carries, plus caps and plugs for every open port.`,
      },
    ],
  },
  'getting-a-hydraulic-hose-made': {
    links: [{ phrase: 'fitting on each end', href: FITTINGS }],
    add: [
      {
        after: 'a common route for dirt into a clean circuit.',
        html: ` The same applies whether the hose is a two-wire <a href="${R2}">2SN</a> or a four-spiral <a href="${SH4}">4SH</a>: the ends are crimped to the specification for that pairing.`,
      },
    ],
  },
  'hose-service-northern-emirates': {
    links: [{ phrase: 'hose and fittings', href: FITTINGS }],
    add: [
      {
        after: 'when the attachment changed.',
        html: ` A cover specified for abrasion — <a href="${SH4}">4SH</a> carries one — slows that pattern; re-routing stops it.`,
      },
    ],
  },
  'how-to-measure-a-hydraulic-hose': {
    links: [{ phrase: 'our catalogue', href: FITTINGS }],
    add: [
      {
        after: 'adds length that is not there.',
        html: ` On a <a href="${JIC_FIT}">JIC 37° female swivel</a> the sealing face is the cone seat; on an <a href="${ORFS_FIT}">ORFS female</a> it is the flat face that meets the O-ring on the male.`,
      },
    ],
  },
  'hydraulic-fitting-make-up-torque': {
    links: [{ phrase: 'ORFS fittings', href: ORFS_FIT }],
    add: [
      {
        after: 'but not how far the nut travelled.',
        html: ` Makers publish it in flats or turns for <a href="${JIC_FIT}">JIC 37° fittings</a>, size by size.`,
      },
    ],
  },
  'hydraulic-quick-couplers-iso-7241': {
    add: [
      {
        after: 'no record of which is which.',
        html: ` Our range covers <a href="${p('iso-7241-series-a-valved-hydraulic-quick-coupler')}">ISO 7241 Series A</a>, <a href="${p('iso-7241-series-b-valved-hydraulic-quick-coupler')}">Series B</a> and <a href="${ISO16028}">ISO 16028 flat-face</a> couplers, so a pair can be replaced like for like.`,
      },
    ],
  },
  'on-site-hydraulic-hose-service-uae': {
    links: [
      { phrase: 'bulk hose', href: HYD_HOSES },
      { phrase: 'ferrules', href: FERRULES },
    ],
  },
  'skiving-and-fitting-selection': {
    links: [{ phrase: 'one-piece fitting', href: FITTINGS }],
    add: [
      {
        after: 'relaxes over the following weeks.',
        html: ` Most current two-wire hose is built for no-skive ends — our <a href="${NO_SKIVE_2SN}">no-skive ferrule for R2AT and 2SN</a> is one — while spiral hose generally still needs skiving, as with the <a href="${p('skive-interlock-crimp-ferrule-for-4sh-hose')}">skive interlock ferrule for 4SH</a>.`,
      },
    ],
  },

  // ── failure-analysis ─────────────────────────────────────────────────────
  'cross-threaded-hydraulic-port': {
    add: [
      {
        after: 'a straightforward repair in the other.',
        html: ` Tapered <a href="${NPT_AD}">NPT</a> and BSPT ports seal on the thread; <a href="${BSP_AD}">BSPP</a>, metric and SAE O-ring boss ports seal on a face or a seal.`,
      },
    ],
  },
  'damaged-port-repair-or-scrap': {
    add: [
      {
        after: 'which is usually what the site actually needs.',
        html: ` Blank the port in the meantime with a proper plug or an <a href="${p('sae-blind-flange')}">SAE blind flange</a>, not a bolt and a rag.`,
      },
    ],
  },
  'dirt-ingress-in-transit-and-storage': {
    add: [
      {
        after: 'on a closed circuit; it dilutes it.',
        html: ` The filters do their best — a <a href="${RETURN_FILTER}">10-micron return-line element</a> catches what reaches it — but they are the last line of defence, not the plan.`,
      },
      {
        after: 'opened at the machine rather than at the shelf.',
        html: ` That applies to every <a href="${FITTINGS}">hose fitting</a> and <a href="${ADAPTERS}">adapter</a> as much as to a finished assembly.`,
      },
    ],
  },
  'galvanic-corrosion-in-fittings': {
    add: [
      {
        after: 'rather than glancing at two apparently sound components.',
        html: ` Where both halves can be stainless, <a href="${SS_BSP}">316L BSP</a> and <a href="${SS_JIC}">316L JIC fittings</a> remove the couple entirely.`,
      },
    ],
  },
  'hose-burst-at-the-fitting': {
    links: [{ phrase: 'ferrule', href: FERRULES }],
    add: [
      {
        after: 'is not evidence that it is the right ferrule.',
        html: ` For two-wire hose that means the ferrule specified for it, such as the <a href="${NO_SKIVE_2SN}">no-skive ferrule for R2AT and 2SN</a>; for four-spiral hose, a <a href="${p('skive-interlock-crimp-ferrule-for-4sh-hose')}">skive interlock ferrule for 4SH</a>.`,
      },
    ],
  },
  'hose-failure-post-mortem': {
    add: [
      {
        after: 'each one actually changes the conclusion.',
        html: ` Keep the failed assembly whole — the <a href="${FERRULES}">ferrule</a> and the <a href="${FITTINGS}">fitting</a> carry half the evidence.`,
      },
    ],
  },
  'hose-routing-bend-radius-twist': {
    links: [{ phrase: 'spiral hose', href: SH4 }],
    add: [
      {
        after: 'a flattened or creased section, usually near an end.',
        html: ` Where the route cannot open out, a compact grade such as <a href="${SC2}">2SC</a> bends to half the radius of standard two-wire braid.`,
      },
    ],
  },
  'hydraulic-hose-abrasion-failure': {
    add: [
      {
        after: 'fails at the clamp instead.',
        html: ` Where the cover itself is the weak point, a grade with a cover specified for abrasion — <a href="${SH4}">4SH</a> and <a href="${R13}">R13</a> among ours — buys time, but re-routing is still the fix.`,
      },
    ],
  },
  'hydraulic-hose-cover-blistering': {
    links: [{ phrase: 'PTFE tube', href: R14 }],
    add: [
      {
        after: 'a different tube compound or a cover designed to vent.',
        html: ` Thermoplastic hose such as <a href="${R7}">R7</a> has a nylon tube rather than a nitrile one, which changes the permeation picture again.`,
      },
    ],
  },
  'hydraulic-hose-cover-cracking': {
    links: [
      { phrase: 'R5', href: R5 },
      { phrase: 'PTFE', href: R14 },
    ],
    add: [
      {
        after: 'puts the wrong hose in an exposed run.',
        html: ` Of the grades we stock, <a href="${R2}">2SN</a> and <a href="${SH4}">4SH</a> carry covers specified for both abrasion and weather.`,
      },
    ],
  },
  'hydraulic-hose-crimp-faults': {
    links: [{ phrase: 'no-skive hose', href: R2 }],
    add: [
      {
        after: 'reached with a specific die.',
        html: ` Our <a href="${p('double-skive-crimp-ferrule-for-r13-hose')}">double-skive ferrule for R13</a> and <a href="${NO_SKIVE_1SN2SN}">no-skive ferrule for 1SN and 2SN</a> each have their own crimp diameters for exactly this reason.`,
      },
    ],
  },
  'hydraulic-hose-installed-with-a-twist': {
    links: [{ phrase: 'ferrule', href: FERRULES }],
    add: [
      {
        after: 'the number of turns tells you by how much.',
        html: ` Swivel ends — a <a href="${JIC_FIT}">JIC 37° female swivel</a> or an <a href="${ORFS_FIT}">ORFS female swivel</a> — let the nut turn without turning the hose, which is the point of fitting one.`,
      },
    ],
  },
  'hydraulic-hose-kinked': {
    links: [
      { phrase: 'compact hose', href: SC2 },
      { phrase: 'ferrule', href: FERRULES },
    ],
    add: [
      {
        after: 'every time pressure rises.',
        html: ` Where the run has to turn immediately, a 45° or 90° elbow from our <a href="${FITTINGS}">hose fittings</a> range takes the bend in steel instead of rubber.`,
      },
    ],
  },
  'hydraulic-hose-tube-swelling': {
    links: [{ phrase: 'R5', href: R5 }],
    add: [
      {
        after: 'that assumption needs checking.',
        html: ` Where it fails the check, <a href="${R14}">R14 PTFE hose</a> is chemically inert, and thermoplastic grades such as <a href="${R8}">R8</a> use a polyamide tube.`,
      },
    ],
  },
  'hydraulic-hose-wire-corrosion': {
    add: [
      {
        after: 'a much shorter one on the water.',
        html: ` Where corrosion rather than pressure governs, the alternative is a different family: <a href="${R14}">PTFE hose with a stainless braid</a>, or a <a href="${METALLIC}">metallic hose</a>.`,
      },
    ],
  },
  'new-hydraulic-hose-weeping': {
    links: [
      { phrase: 'hose end', href: FITTINGS },
      { phrase: 'metal cone', href: JIC_FIT },
      { phrase: 'ORFS', href: ORFS_FIT },
      { phrase: 'ferrule', href: FERRULES },
    ],
  },
  'over-tightened-fitting-diagnosis': {
    add: [
      {
        after: 'the damage now added to it.',
        html: ` The parts most often damaged this way are the cheapest to replace — the <a href="${ADAPTERS}">adapter</a> or the hose end — which is the argument for replacing them rather than tightening again.`,
      },
    ],
  },
  'reading-a-weeping-joint': {
    add: [
      {
        after: 'something is being worn, not merely leaking.',
        html: ` A scored seat makes the part scrap: replace the <a href="${ADAPTERS}">adapter</a> or the <a href="${FITTINGS}">hose fitting</a>, not only the seal.`,
      },
    ],
  },
  'sealant-on-hydraulic-threads': {
    add: [
      {
        after: 'both are reasonable within their scope.',
        html: ` On a straight-thread port the answer is the seal it was designed for — a bonded washer on <a href="${BSP_AD}">BSPP</a>, an O-ring on <a href="${ORFS_AD}">ORFS</a> and O-ring boss — and no compound at all.`,
      },
    ],
  },
  'split-female-quick-coupler': {
    add: [
      {
        after: 'it was caused in the yard by a mallet.',
        html: ` Couplers built to connect against residual pressure exist for exactly this duty — the <a href="${FARM_CUP}">connect-under-pressure farm coupler</a> is one — and a <a href="${ISO16028}">flat-face ISO 16028 coupler</a> is easier to keep clean.`,
      },
    ],
  },
  'why-fittings-seize-in-coastal-air': {
    add: [
      {
        after: 'while the machine is already stopped.',
        html: ` Where seizure keeps recurring, <a href="${SS_JIC}">316L stainless JIC</a> and <a href="${SS_BSP}">316L BSP fittings</a> on the exposed joints, with an <a href="${MOLY_PASTE}">anti-seize paste</a> on the threads, are the usual next step.`,
      },
    ],
  },
  'why-hydraulic-hoses-fail': {
    add: [
      {
        after: 'Nothing about the hose caused it.',
        html: ` A cover specified for abrasion, as on our <a href="${SH4}">4SH</a> and <a href="${R13}">R13</a> spiral hose, buys time; re-routing and guarding end it.`,
      },
    ],
  },

  // ── maintenance-reliability ──────────────────────────────────────────────
  'contamination-during-a-hose-change': {
    add: [
      {
        after: 'the feedback loop is too long to teach anyone anything.',
        html: ` An <a href="${p('hydraulic-oil-sampling-valve-coupler')}">oil sampling valve</a> turns the guesswork into a particle count, and a <a href="${RETURN_FILTER}">return-line filter</a> catches what the change let in.`,
      },
    ],
  },
  'crimping-on-site-or-adapting': {
    add: [
      {
        after: 'removes it entirely for the failures that matter most.',
        html: ` For the adapting route, hold the <a href="${JIC_AD}">JIC</a> and <a href="${BSP_AD}">BSP adapters</a> that bridge your two most common families, not a random assortment.`,
      },
    ],
  },
  'grease-and-zerk-fittings': {
    add: [
      {
        after: 'a component you probably cannot remove.',
        html: ` The grease itself is a separate specification from the fitting; our <a href="${c('molykote-grease-suppliers-uae')}">Molykote greases</a> are listed by type and duty.`,
      },
    ],
  },
  'hose-register-and-replacement-programme': {
    add: [
      {
        after: 'when something fails at an inconvenient time.',
        html: ` Record the construction as printed on the layline — <a href="${R2}">2SN</a>, <a href="${SP4}">4SP</a> and so on — with the bore, the length and both <a href="${FITTINGS}">fitting types</a>.`,
      },
    ],
  },
  'hydraulic-hose-inspection': {
    add: [
      {
        after: 'let the findings set the next interval.',
        html: ` A <a href="${GAUGE_KIT}">pressure gauge test kit</a> on a <a href="${TEST_POINT}">diagnostic test point</a> adds the one reading a walk-round cannot give.`,
      },
    ],
  },
  'mini-excavator-hose-maintenance': {
    add: [
      {
        after: 'more valuable than any hose check.',
        html: ` Most current attachment circuits use <a href="${ISO16028}">ISO 16028 flat-face couplers</a>; keep spare pairs of whichever <a href="${COUPLERS}">quick coupler</a> type the machine already runs.`,
      },
    ],
  },
  'reusing-fittings-in-a-rebuild': {
    add: [
      {
        after: 'a leak found after reassembly costs the most.',
        html: ` Replacing a marginal <a href="${ADAPTERS}">adapter</a> costs less than the leak it would cause.`,
      },
    ],
  },
  'storing-fittings-and-seals-on-site': {
    add: [
      {
        after: 'A store that holds a little of everything holds nothing usefully.',
        html: ` For most fleets that means depth in the two or three <a href="${FITTINGS}">hose fitting</a> families the machines actually carry, and the <a href="${ADAPTERS}">adapters</a> that bridge them.`,
      },
    ],
  },

  // ── safety ───────────────────────────────────────────────────────────────
  'hose-whip-restraint-and-burst-protection': {
    add: [
      {
        after: 'rather than through it.',
        html: ` On compressed-air lines the separation risk is highest at the joint, which is why <a href="${UNIVERSAL_AIR}">universal air couplings</a> should be pinned or clipped and restrained across the connection.`,
      },
    ],
  },
  'hydraulic-fluid-injection-injury': {
    add: [
      {
        after: 'recognise it, name it and move fast.',
        html: ` Prevention is the cheaper part: depressurise before inspecting, search for pinholes with a piece of card rather than a hand, and confirm zero pressure on a <a href="${TEST_POINT}">test point</a> before loosening anything.`,
      },
    ],
  },
  'trapped-pressure-quick-coupler': {
    add: [
      {
        after: 'to hold a poppet firmly shut.',
        html: ` Couplers designed to connect against that pressure — the <a href="${FARM_CUP}">connect-under-pressure farm coupler</a> or a <a href="${p('thread-to-connect-flush-face-quick-coupler')}">thread-to-connect flush-face coupler</a> — remove the problem rather than managing it.`,
      },
    ],
  },

  // ── gulf-conditions ──────────────────────────────────────────────────────
  'desalination-and-water-treatment-hose': {
    links: [
      { phrase: 'PTFE', href: PTFE_IND },
      { phrase: 'clamps', href: IND_CLAMPS },
    ],
    add: [
      {
        after: 'a safety event rather than a maintenance one.',
        html: ` Larger chemical transfer runs suit <a href="${p('uhmwpe-chemical-suction-delivery-hose-16-bar')}">UHMWPE-lined chemical hose</a>, which resists a very wide range of acids and alkalis.`,
      },
    ],
  },
  'hydraulic-hose-coastal-corrosion': {
    links: [
      { phrase: 'PTFE hose', href: R14 },
      { phrase: 'metallic hose', href: METALLIC },
    ],
  },
  'hydraulic-hose-in-uae-heat': {
    add: [
      {
        after: 'from the one the installation is asking.',
        html: ` Where it is genuinely hot, <a href="${R13}">R13</a> and <a href="${R5}">R5</a> are rated to 121 °C and <a href="${R14}">R14 PTFE</a> to 204 °C, against 100 °C for 1SN and 2SN.`,
      },
    ],
  },
  'hydraulic-hose-sand-abrasion': {
    links: [{ phrase: 'quick coupler', href: COUPLERS }],
    add: [
      {
        after: 'without anything having moved.',
        html: ` Covers specified for abrasion — <a href="${SC2}">2SC</a> and <a href="${SP4}">4SP</a> both carry one — resist it longer, but clearance is still the cure.`,
      },
      {
        after: 'a fluid-cleanliness measure, not housekeeping.',
        html: ` Flat-face couplers such as <a href="${ISO16028}">ISO 16028</a> wipe clean in a way recessed poppet couplers do not.`,
      },
    ],
  },
  'hydraulic-hose-shelf-life-storage': {
    links: [
      { phrase: 'Bulk hose', href: HYD_HOSES },
      { phrase: 'fittings', href: FITTINGS },
    ],
  },
  'hydraulic-hose-uv-and-ozone': {
    add: [
      {
        after: 'the cover needs to carry both, and several of ours do.',
        html: ` <a href="${R1}">1SN</a>, <a href="${R2}">2SN</a> and <a href="${SH4}">4SH</a> are among them.`,
      },
    ],
  },
  'offshore-hydraulic-hose': {
    links: [
      { phrase: 'Choke and kill lines', href: WELL_CONTROL },
      { phrase: 'rotary hose', href: DRILLING },
    ],
    add: [
      {
        after: 'when the hose needs changing.',
        html: ` That is the case for <a href="${SS}">316L stainless fittings</a> on exposed deck circuits.`,
      },
    ],
  },
  'why-summer-is-harder-on-hydraulic-hose': {
    add: [
      {
        after: 'moving the preparation work earlier in the year.',
        html: ` For runs that live hot, <a href="${R13}">R13</a> is rated to 121 °C and <a href="${R14}">R14 PTFE</a> to 204 °C — headroom, not immunity.`,
      },
    ],
  },

  // ── machine-down ─────────────────────────────────────────────────────────
  'backhoe-hydraulic-hose': {
    links: [{ phrase: 'both fitting types', href: FITTINGS }],
    add: [
      {
        after: 'the one most improved by guarding.',
        html: ` A cover specified for abrasion, as on <a href="${R2}">2SN</a>, helps; a guard over the run helps more.`,
      },
    ],
  },
  'boom-lift-hydraulic-hose': {
    add: [
      {
        after: 'make sure the evidence exists when they ask.',
        html: ` Assemblies we build are crimped with matched <a href="${FERRULES}">ferrules</a>, proof-tested and tagged, so that evidence exists from the day the hose is fitted.`,
      },
    ],
  },
  'concrete-pump-hydraulic-hose': {
    add: [
      {
        after: 'are spiral rather than braid.',
        html: ` On our range that means <a href="${SH4}">4SH</a> or <a href="${R13}">R13</a>, crimped with <a href="${SPIRAL_FIT}">spiral hose fittings</a>.`,
      },
    ],
  },
  'detaching-a-hose-on-a-modern-machine': {
    add: [
      {
        after: 'Everything around it is the job.',
        html: ` Before starting, have the replacement assembly, caps for every open port and any <a href="${ADAPTERS}">adapters</a> or <a href="${FITTINGS}">hose ends</a> you may need on the bench.`,
      },
    ],
  },
  'excavator-hydraulic-hose-replacement': {
    links: [
      { phrase: 'an elbow', href: FITTINGS },
      { phrase: 'compact construction', href: SC2 },
    ],
  },
  'forklift-hydraulic-hose-replacement': {
    add: [
      {
        after: 'may be exposed at full lift.',
        html: ` Over a sheave the bend radius governs, which is where compact grades such as <a href="${SC1}">1SC</a> and <a href="${SC2}">2SC</a> — half the radius of standard braid — earn their place.`,
      },
    ],
  },
  'injection-moulding-hydraulic-hose': {
    add: [
      {
        after: 'only one of them appears in any specification.',
        html: ` Where the radiant heat cannot be shielded, <a href="${R14}">R14 PTFE hose</a> (204 °C) or <a href="${R13}">R13</a> (121 °C) gives more headroom than 100 °C braid.`,
      },
    ],
  },
  'log-splitter-and-shop-press-hose': {
    links: [{ phrase: 'crimped assemblies', href: FITTINGS }],
    add: [
      {
        after: 'thousands of times a season.',
        html: ` That usually points to two-wire hose such as <a href="${R2}">2SN</a> or <a href="${SC2}">2SC</a>, chosen at the actual bore against the relief setting.`,
      },
    ],
  },
  'mobile-crane-hydraulic-hose': {
    add: [
      {
        after: 'whose whole basis of safe use is documentation.',
        html: ` Match the construction printed on the layline — <a href="${R2}">2SN</a>, <a href="${SH4}">4SH</a>, <a href="${R13}">R13</a> — not just the bore.`,
      },
    ],
  },
  'port-equipment-hydraulic-hose': {
    add: [
      {
        after: 'replace on age where inspection access is poor.',
        html: ` Exposed fittings are the other half: <a href="${SS}">316L stainless fittings</a> on spreader and boom joints outlast plated steel in salt air.`,
      },
    ],
  },
  'refuse-truck-hydraulic-hose': {
    add: [
      {
        after: 'Replacing them on a schedule is cheap next to the alternative.',
        html: ` Built as a set — in <a href="${R2}">2SN</a> or <a href="${SP4}">4SP</a> to match what is fitted — the packer and lifter assemblies can be swapped in one workshop visit.`,
      },
    ],
  },
  'removing-a-seized-hydraulic-fitting': {
    add: [
      {
        after: 'no oil arriving from the rest of the line.',
        html: ` Plan to replace what you cut: a new <a href="${FITTINGS}">hose end</a> and, if the port fitting fought you, a new <a href="${ADAPTERS}">adapter</a> as well.`,
      },
    ],
  },
  'skid-steer-hydraulic-hose': {
    links: [{ phrase: 'Flat-face couplers', href: ISO16028 }],
    add: [
      {
        after: 'Older agricultural-style couplers have recesses that hold grit.',
        html: ` For heavier circuits there is also a <a href="${p('high-pressure-iso-16028-flush-face-coupler')}">high-pressure ISO 16028 flush-face coupler</a>; check the interchange marking on both halves before mixing them.`,
      },
    ],
  },
  'tipper-and-transit-mixer-hose': {
    add: [
      {
        after: 'a single interval across both will be wrong for one of them.',
        html: ` Record which construction each truck carries — <a href="${SC1}">1SC</a>, <a href="${SC2}">2SC</a> or <a href="${SP4}">4SP</a> — so a replacement matches the original rather than whatever is on the reel.`,
      },
    ],
  },
  'tractor-hydraulic-hose': {
    links: [{ phrase: 'Agricultural couplers', href: ISO5675 }],
    add: [
      {
        after: 'and it costs nothing.',
        html: ` Where implements are swapped under residual pressure, a <a href="${FARM_CUP}">connect-under-pressure coupler</a> saves the struggle.`,
      },
    ],
  },
  'truck-crane-hydraulic-hose': {
    add: [
      {
        after: 'unable to set up on site.',
        html: ` Replace them on age, in the construction printed on the old hose — <a href="${R2}">2SN</a>, <a href="${SC2}">2SC</a> or <a href="${SH4}">4SH</a> — rather than waiting for the failure.`,
      },
    ],
  },
  'wheel-loader-hydraulic-hose': {
    add: [
      {
        after: 'at opposite ends of the steering range.',
        html: ` Where the joint geometry is tight, a compact grade such as <a href="${SC2}">2SC</a> bends in half the radius of <a href="${R2}">2SN</a>.`,
      },
    ],
  },

  // ── procurement-export ───────────────────────────────────────────────────
  'bulk-hose-or-finished-assemblies': {
    links: [{ phrase: 'standard ends', href: FITTINGS }],
    add: [
      {
        after: 'anything a competent person will ask about.',
        html: ` Bulk means hose such as <a href="${R2}">2SN</a> by the metre, with the matching <a href="${NO_SKIVE_1SN2SN}">no-skive ferrules</a> and ends.`,
      },
    ],
  },
  'how-to-cross-reference-a-hydraulic-hose': {
    add: [
      {
        after: 'than the part number does.',
        html: ` A layline reading EN 853 2SN / SAE 100R2AT names a construction we stock as <a href="${R2}">2SN</a>; one reading EN 856 4SH names <a href="${SH4}">4SH</a>.`,
      },
    ],
  },
  'hydraulic-hose-assembly-cost': {
    links: [
      { phrase: 'two fittings', href: FITTINGS },
      { phrase: 'ferrules', href: FERRULES },
    ],
  },
  'hydraulic-hose-kits-for-a-fleet': {
    add: [
      {
        after: 'how fast that particular machine can be back.',
        html: ` Each assembly in the kit is tagged with its construction and ends — the <a href="${FITTINGS}">hose fittings</a> and <a href="${FERRULES}">ferrules</a> it was built with — so it can be rebuilt identically.`,
      },
    ],
  },
  'hydraulic-hose-lead-times': {
    links: [
      { phrase: 'an unusual thread', href: ADAPTERS },
      { phrase: 'a stainless variant', href: SS },
    ],
  },
  'hydraulic-hose-stocking-policy': {
    links: [
      { phrase: 'a box of fittings', href: FITTINGS },
      { phrase: 'one coupler standard', href: COUPLERS },
    ],
  },
  'should-you-buy-a-hose-crimper': {
    links: [
      { phrase: 'ferrule', href: FERRULES },
      { phrase: 'bulk hose and fittings', href: FITTINGS },
    ],
  },
  'unbranded-hydraulic-fittings': {
    links: [{ phrase: 'ferrule', href: FERRULES }],
    add: [
      {
        after: 'leaves with a pressure rating that is an assumption.',
        html: ` A marked ferrule, by contrast, ties back to a published crimp table — ours, such as the <a href="${NO_SKIVE_2SN}">no-skive ferrule for R2AT and 2SN</a>, are listed against the hose they were designed for.`,
      },
    ],
  },
  'what-to-send-for-a-hose-quote': {
    add: [
      {
        after: 'that is a complete request.',
        html: ` The ends are usually one of the families on our <a href="${FITTINGS}">hose fittings</a> shelf — JIC, ORFS, BSP, metric or flange.`,
      },
    ],
  },

  // ── gcc-compliance ───────────────────────────────────────────────────────
  'gulf-conformity-mark-hose-fittings': {
    add: [
      {
        after: 'and is checkable on arrival.',
        html: ` For a hydraulic assembly that means naming the hose — <a href="${R2}">EN 853 2SN</a>, say — and the <a href="${FITTINGS}">end fittings</a> on the order.`,
      },
    ],
  },
  'gcc-import-documents-for-hose': {
    add: [
      {
        after: 'rather than by a rule.',
        html: ` A <a href="${HYD_HOSES}">hydraulic hose</a> assembly, an <a href="${INDUSTRIAL}">industrial hose</a> and a steel adapter are three different entries, and each should read the same on every document.`,
      },
    ],
  },
  'hose-assembly-test-certificate': {
    add: [
      {
        after: 'rather than on the item you are buying.',
        html: ` The ends are part of what is tested: the <a href="${FERRULES}">ferrule</a> and its crimp are exactly what a proof test loads.`,
      },
    ],
  },
  'vendor-approval-for-hose-supply': {
    add: [
      {
        after: 'a supplier behaviour rather than a supplier status.',
        html: ` On a hose order that means the construction from the layline — <a href="${R2}">2SN</a> or <a href="${SH4}">4SH</a>, for example — the fitting series and the test record, stated on the paperwork.`,
      },
    ],
  },
  'material-test-certificate-en-10204': {
    links: [
      { phrase: 'ferrules', href: FERRULES },
      { phrase: 'clamps', href: IND_CLAMPS },
    ],
  },
  'nace-mr0175-hose-documentation': {
    links: [{ phrase: 'ferrule', href: FERRULES }],
    add: [
      {
        after: 'it is not part of any standard document set.',
        html: ` On flow iron the same logic applies to the connections: <a href="${c('hammer-unions-sour-gas-service')}">sour gas service hammer unions</a> are made and documented as a separate range for that reason.`,
      },
    ],
  },
  'oilfield-hose-document-pack': {
    links: [
      { phrase: 'vibrator hose', href: DRILLING },
      { phrase: 'choke and kill service', href: WELL_CONTROL },
    ],
  },
  'saber-certificate-for-hydraulic-hose': {
    links: [{ phrase: 'a steel adapter', href: ADAPTERS }],
  },
  'verifying-a-genuine-hydraulic-hose': {
    links: [{ phrase: 'the ferrule', href: FERRULES }],
  },

  // ── oilfield-pressure-control ────────────────────────────────────────────
  'api-16c-choke-and-kill-lines': {
    links: [{ phrase: 'flanged ends', href: c('flow-iron-flanges-api') }],
    add: [
      {
        after: 'it is the ends that tend to be treated as a commodity.',
        html: ` The same applies to the <a href="${c('ring-joint-gaskets')}">ring joint gaskets</a> that seal those flanges.`,
      },
    ],
  },
  'api-7k-16c-16d-which-standard': {
    links: [{ phrase: 'choke and kill line', href: WELL_CONTROL }],
    add: [
      {
        after: 'Margin that is not in the design has to come from inspection.',
        html: ` The 7K family — <a href="${DRILLING}">rotary and vibrator hose</a> — sits between the two, at 2.5:1.`,
      },
    ],
  },
  'api-7k-rotary-vibrator-hose': {
    links: [
      { phrase: 'restraint', href: c('oilfield-restraint-systems') },
      { phrase: 'rotary hose', href: DRILLING },
    ],
  },
  'bop-control-hose-fire-resistance': {
    links: [
      { phrase: 'control hose', href: p('blowout-preventer-control-hose-fireshield-5000') },
      { phrase: 'Megashield 5000 assemblies', href: p('hose-megashield-5000-hose-assemblies') },
      { phrase: 'Flameshield low-pressure oilfield hose', href: p('low-pressure-oilfield-hose-flameshield') },
    ],
  },
  'rig-site-hose-replacement-abu-dhabi': {
    links: [
      { phrase: 'choke and kill line', href: WELL_CONTROL },
      { phrase: 'rotary hose', href: DRILLING },
    ],
  },

  // ── fitting-identification ───────────────────────────────────────────────
  'bridging-two-thread-standards': {
    links: [
      { phrase: 'contains adapters', href: ADAPTERS },
      { phrase: 'one hose end', href: FITTINGS },
    ],
  },
  'bsp-or-metric-fittings': {
    add: [
      {
        after: 'from a diagnosis into a line item.',
        html: ` The answer is usually two families rather than one — <a href="${BSP_FIT}">BSP</a> and <a href="${METRIC_FIT}">metric 24° cone</a> on most European and Chinese machines, <a href="${JIC_FIT}">JIC</a> on American ones.`,
      },
    ],
  },
  'bspp-bonded-seal-sizing': {
    links: [{ phrase: 'BSPP joint', href: BSP_FIT }],
    add: [
      {
        after: 'does not need careful torque management.',
        html: ` It seals the male stud of a <a href="${BSP_AD}">BSP adapter</a> against a flat port face, and it is sized to the thread, not the hex.`,
      },
    ],
  },
  'bspp-vs-bspt': {
    links: [
      { phrase: 'BSPP', href: BSP_FIT },
      { phrase: 'BSPT', href: BSP_AD },
    ],
  },
  'building-a-thread-reference-board': {
    links: [{ phrase: 'hose end', href: FITTINGS }],
    add: [
      {
        after: 'rather than only to someone identifying one.',
        html: ` Start with the families the yard actually carries — for most mixed fleets that means <a href="${BSP_AD}">BSP</a>, <a href="${METRIC_AD}">metric</a> and <a href="${JIC_AD}">JIC</a> samples.`,
      },
    ],
  },
  'fittings-on-a-chinese-excavator': {
    links: [
      { phrase: 'DIN 2353', href: DIN2353 },
      { phrase: 'BSP parallel', href: BSP_FIT },
      { phrase: 'split flanges', href: FLANGE_FIT },
      { phrase: 'the adapters that bridge between them', href: ADAPTERS },
    ],
  },
  'fittings-on-a-used-japanese-machine': {
    links: [
      { phrase: 'BSP parallel', href: BSP_FIT },
      { phrase: 'JIC', href: JIC_FIT },
      { phrase: '30° flare ends', href: JIS_FIT },
      { phrase: 'bridging adapters', href: ADAPTERS },
    ],
  },
  'fittings-on-american-machines': {
    links: [
      { phrase: 'BSP', href: BSP_FIT },
      { phrase: 'JIC male', href: JIC_FIT },
      { phrase: 'ORFS male', href: ORFS_FIT },
      { phrase: 'the bridging adapters', href: ADAPTERS },
    ],
  },
  'fittings-on-european-machines': {
    links: [
      { phrase: 'DIN 2353', href: DIN2353 },
      { phrase: 'BSP parallel', href: BSP_FIT },
      { phrase: 'ORFS', href: ORFS_FIT },
      { phrase: 'The adapters worth holding', href: ADAPTERS },
    ],
  },
  'hydraulic-thread-size-and-pitch-reference': {
    links: [
      { phrase: 'NPT', href: NPT_AD },
      { phrase: 'BSP', href: BSP_FIT },
      { phrase: 'JIC', href: JIC_FIT },
      { phrase: 'ORFS', href: ORFS_FIT },
    ],
  },
  'identify-any-hydraulic-fitting': {
    links: [
      { phrase: 'BSPP', href: BSP_FIT },
      { phrase: 'BSPT', href: BSP_AD },
    ],
    add: [
      {
        after: 'by which point the port thread may need re-cutting.',
        html: ` At 1/2" and 3/4" the <a href="${NPT_AD}">NPT</a> and BSPT pitches match, which is why the two get forced together.`,
      },
    ],
  },
  'jic-vs-orfs-vs-npt-vs-bsp': {
    links: [
      { phrase: 'NPT', href: NPT_AD },
      { phrase: 'BSP', href: BSP_FIT },
      { phrase: 'JIC 37°', href: JIC_FIT },
    ],
  },
  'korean-excavator-hydraulic-fittings': {
    links: [
      { phrase: 'adapter stack', href: ADAPTERS },
      { phrase: 'a single hose end', href: FITTINGS },
    ],
    add: [
      {
        after: 'before any repair has touched it.',
        html: ` In practice that means <a href="${METRIC_FIT}">metric 24° cone</a> ends and <a href="${JIS_FIT}">30° flare</a> ends, sometimes on the same machine.`,
      },
    ],
  },
  'measuring-a-fitting-without-gauges': {
    add: [
      {
        after: 'measure a second example from the same machine if one exists.',
        html: ` The families behind those angles are <a href="${METRIC_FIT}">metric 24° cone</a>, <a href="${JIS_FIT}">JIS 30°</a> and <a href="${JIC_FIT}">JIC 37°</a>.`,
      },
    ],
  },
  'photographing-a-hydraulic-fitting': {
    add: [
      {
        after: 'without further discussion.',
        html: ` That combination separates, for example, a <a href="${JIC_AD}">JIC</a> male from an <a href="${ORFS_AD}">ORFS</a> male of the same thread, which a diameter alone cannot.`,
      },
    ],
  },
  'stacking-hydraulic-adapters': {
    add: [
      {
        after: 'not really about how many adapters there are.',
        html: ` A typical stack bridges a <a href="${BSP_AD}">BSP</a> port to a <a href="${JIC_AD}">JIC</a> or <a href="${ORFS_AD}">ORFS</a> hose end, two or three parts deep.`,
      },
    ],
  },
  'tractor-hydraulic-fittings': {
    links: [
      { phrase: 'BSP parallel', href: BSP_FIT },
      { phrase: 'Agricultural quick couplers', href: ISO5675 },
    ],
  },

  // ── buying-hydraulic-fittings ────────────────────────────────────────────
  'adapter-kit-for-a-mixed-fleet': {
    add: [
      {
        after: 'use two or three bores between them.',
        html: ` The kit then follows the families those positions carry — <a href="${BSP_AD}">BSP</a>, <a href="${METRIC_AD}">metric</a> or <a href="${JIC_AD}">JIC adapters</a> in whichever bores the notebook shows.`,
      },
    ],
  },
  'cross-referencing-a-fitting-part-number': {
    add: [
      {
        after: 'actively misleads on another.',
        html: ` Where we can verify an equivalent maker number, it is listed beside our own part number on the <a href="${FITTINGS}">hose fitting</a> or adapter page.`,
      },
    ],
  },
  'plating-and-corrosion-on-fittings': {
    links: [{ phrase: 'stainless where the environment is aggressive', href: SS }],
    add: [
      {
        after: 'every tool contact is a start point.',
        html: ` Stainless has no coating to damage — see our <a href="${SS_BSP}">316L BSP</a> and <a href="${SS_ORFS}">316L ORFS</a> fittings.`,
      },
    ],
  },
  'spares-list-for-a-remote-site': {
    links: [
      { phrase: 'hose by the metre', href: HYD_HOSES },
      { phrase: 'ferrules', href: FERRULES },
    ],
  },
  'what-to-send-for-a-fittings-quote': {
    add: [
      {
        after: 'makes the freight worth paying once.',
        html: ` The same goes for <a href="${ADAPTERS}">adapters</a> and <a href="${FITTINGS}">hose fittings</a>: name the quantity across the fleet, not just the one in your hand.`,
      },
    ],
  },
  'substituting-a-fitting-safely': {
    add: [
      {
        after: 'not acceptable on a pump or service line.',
        html: ` Our <a href="${BSP_AD}">BSP</a> and <a href="${JIC_AD}">JIC</a> adapter pages give a working pressure for each size, which is the figure to check.`,
      },
    ],
  },
  'when-stainless-is-worth-it': {
    links: [
      { phrase: 'Common stainless grades used for fittings', href: SS },
      { phrase: 'anti-seize', href: MOLY_PASTE },
    ],
  },

  // ── hydraulic-fittings-by-industry ───────────────────────────────────────
  'agriculture-and-construction-fittings': {
    links: [
      { phrase: 'quick couplers', href: COUPLERS },
      { phrase: 'agricultural couplers', href: ISO5675 },
      { phrase: 'hose ends', href: FITTINGS },
    ],
  },
  'buying-fittings-in-south-africa': {
    links: [
      { phrase: 'a single adapter', href: ADAPTERS },
      { phrase: 'couplers', href: COUPLERS },
    ],
  },
  'copper-mine-hydraulic-fittings': {
    links: [{ phrase: 'adapter stacks', href: ADAPTERS }],
    add: [
      {
        after: 'a maintenance problem long before it is a leak.',
        html: ` Inside the concentrator that makes the case for <a href="${SS_BSP}">316L stainless fittings</a> on the joints that see washdown.`,
      },
    ],
  },
  'factory-and-fixed-plant-fittings': {
    links: [{ phrase: 'the adapters that used to bridge it', href: ADAPTERS }],
    add: [
      {
        after: 'putting the right steel where the environment demands it.',
        html: ` Washdown areas are where <a href="${SS}">316L stainless fittings</a> earn their cost; hot zones are a hose question, where <a href="${R14}">PTFE hose</a> rated to 204 °C moves the limit.`,
      },
    ],
  },
  'gold-plant-hydraulic-fittings': {
    links: [{ phrase: 'stainless adapters', href: SS }],
    add: [
      {
        after: 'area-based material policy beats reactive replacement here.',
        html: ` In those zones, <a href="${SS_BSP}">316L BSP</a> and <a href="${SS_ORFS}">316L ORFS fittings</a> replace the plated parts that fail first.`,
      },
    ],
  },
  'oilfield-fittings-in-west-africa': {
    links: [
      { phrase: 'flow-iron and pressure-control ancillaries', href: c('flow-iron-wellhead-equipment-uae') },
      { phrase: 'hydraulic hose and adapters', href: ADAPTERS },
    ],
  },
  'port-and-terminal-fittings': {
    links: [{ phrase: 'keep bridging adapters', href: ADAPTERS }],
    add: [
      {
        after: 'and it arrives quietly.',
        html: ` On the exposed joints, <a href="${SS_JIC}">316L stainless JIC</a> and <a href="${SS_ORFS}">ORFS fittings</a> take the plating out of the equation.`,
      },
    ],
  },
  'quarry-and-crusher-fittings': {
    links: [{ phrase: 'Every adapter in a line', href: ADAPTERS }],
    add: [
      {
        after: 'the same ones keep happening.',
        html: ` Bulk hose in the construction already fitted — often two-wire <a href="${R2}">2SN</a> — and the matching <a href="${FITTINGS}">hose ends</a> cover those repeat failures.`,
      },
    ],
  },
  'sugar-mill-and-agro-processing-fittings': {
    add: [
      {
        after: 'rather than run-to-failure during a campaign.',
        html: ` Steam and hot-water lines in particular want hose built for it — a <a href="${p('high-pressure-red-saturated-steam-hose-18-bar')}">saturated steam hose</a> with <a href="${GROUND_JOINT}">ground joint couplings</a>, not a general-purpose hose with a worm-drive clamp.`,
      },
    ],
  },

  // ── lifting-rigging ──────────────────────────────────────────────────────
  'chain-block-vs-lever-hoist-vs-electric-hoist': {
    links: [
      { phrase: 'chain block', href: CHAIN_BLOCKS },
      { phrase: 'trolley', href: TROLLEYS },
      { phrase: 'Electric hoists', href: ELECTRIC_HOISTS },
      { phrase: 'a proper sling', href: c('lifting-slings') },
    ],
  },
  'chain-grades-explained': {
    links: [
      { phrase: 'alloy lifting chain', href: ALLOY_CHAIN },
      { phrase: 'transport chain', href: TRANSPORT_CHAIN },
      { phrase: 'chain slings', href: CHAIN_SLINGS },
      { phrase: 'master links', href: MASTER_LINKS },
      { phrase: 'DIN 764', href: DIN_CHAIN },
    ],
  },
  'crosby-pattern-numbers-explained': {
    links: [
      { phrase: 'anchor shackle', href: SHACKLES },
      { phrase: 'master link', href: MASTER_LINKS },
      { phrase: 'eye hooks', href: HOOKS },
      { phrase: 'wire rope clips', href: ROPE_CLIPS },
    ],
  },
  'din-link-chain-standards': {
    links: [
      { phrase: 'DIN 766', href: DIN_CHAIN },
      { phrase: 'anchor chain', href: ANCHOR_CHAIN },
      { phrase: 'Grade 80 chain', href: ALLOY_CHAIN },
    ],
  },
  'eye-bolt-types-and-angled-loads': {
    links: [
      { phrase: 'eye nut', href: EYE_BOLTS },
      { phrase: 'shoulder nut eye bolt', href: p('shoulder-nut-eye-bolt-hot-dip-galvanized') },
      { phrase: 'our DIN 580 table', href: p('din-580-eye-bolt') },
      { phrase: 'Grade 80 swivel lifting point', href: p('grade-80-swivel-lifting-point') },
    ],
  },
  'lever-vs-ratchet-load-binder': {
    links: [
      { phrase: 'tie-down', href: STRAPS },
      { phrase: 'lever binder', href: LOAD_BINDERS },
      { phrase: 'recoil-less lever binder', href: p('recoil-less-lever-load-binder-grade-70') },
      { phrase: 'Grade 70 chain', href: TRANSPORT_CHAIN },
    ],
  },
  'lifting-equipment-inspection-uae': {
    links: [
      { phrase: 'shackles', href: SHACKLES },
      { phrase: 'chain blocks', href: CHAIN_BLOCKS },
      { phrase: 'pulleys', href: BLOCKS },
    ],
  },
  'lifting-gear-rejection-criteria': {
    links: [
      { phrase: 'wire rope sling', href: WIRE_SLINGS },
      { phrase: 'round sling', href: SYNTHETIC },
      { phrase: 'reshape a shackle', href: SHACKLES },
    ],
  },
  'lifting-gear-test-certificate': {
    links: [
      { phrase: 'alloy chain slings', href: CHAIN_SLINGS },
      { phrase: 'wire rope slings', href: WIRE_SLINGS },
    ],
  },
  'lifting-hook-types': {
    links: [
      { phrase: 'Swivel hooks', href: HOOKS },
      { phrase: 'clevis grab hooks', href: p('grade-80-clevis-grab-hook') },
      { phrase: 'chain sling', href: CHAIN_SLINGS },
      { phrase: 'needs a master link', href: MASTER_LINKS },
    ],
  },
  'master-links-explained': {
    links: [
      { phrase: 'wire rope sling', href: WIRE_SLINGS },
      { phrase: 'crane hook', href: HOOKS },
      { phrase: 'Grade 100 sling', href: G100_FIT },
    ],
  },
  'pad-eye-vs-swivel-lifting-point': {
    links: [
      { phrase: 'lifting point', href: LIFTING_POINTS },
      { phrase: 'Grade 80 swivel lifting screw point', href: p('grade-80-swivel-lifting-point') },
    ],
  },
  'precast-concrete-lifting-clutch': {
    links: [{ phrase: 'lifting clutch', href: p('precast-concrete-lifting-clutch') }],
    add: [
      {
        after: 'should carry the same load-class marking.',
        html: ` The clutch ring then connects to the crane through a rated <a href="${CHAIN_SLINGS}">chain sling</a> or <a href="${SHACKLES}">shackle</a>, chosen for the angled load in each leg.`,
      },
    ],
  },
  'ratchet-strap-vs-chain-and-binder': {
    links: [
      { phrase: 'Our 2″ strap', href: p('ratchet-strap-2in-50-mm') },
      { phrase: 'tie-downs', href: STRAPS },
      { phrase: 'binder', href: LOAD_BINDERS },
    ],
  },
  'sling-angle-chart': {
    links: [
      { phrase: 'wire rope sling', href: WIRE_SLINGS },
      { phrase: 'chain slings', href: CHAIN_SLINGS },
      { phrase: 'polyester slings', href: SYNTHETIC },
      { phrase: 'lifting points', href: LIFTING_POINTS },
      { phrase: 'dee shackle', href: SHACKLES },
    ],
  },
  'sling-colour-code-chart': {
    links: [
      { phrase: 'flat webbing slings', href: p('polyester-flat-webbing-sling-eye-and-eye') },
      { phrase: 'orange round slings', href: p('polyester-round-sling-eye-and-eye') },
    ],
  },
  'snatch-block-vs-pulley-block': {
    links: [
      { phrase: 'shackle', href: SHACKLES },
      { phrase: '418-pattern snatch block', href: p('light-snatch-block-with-hook-418-pattern') },
    ],
  },
  'spelter-sockets-open-vs-closed': {
    links: [
      { phrase: 'Sockets of this pattern', href: SOCKETS },
      { phrase: '6x19', href: p('6x19-steel-wire-rope') },
    ],
  },
  'stainless-vs-galvanized-rigging-gulf': {
    links: [{ phrase: 'shackle', href: SHACKLES }],
    add: [
      {
        after: 'rather than assuming a stainless part matches its carbon equivalent.',
        html: ` Our <a href="${p('stainless-steel-screw-pin-anchor-shackle-us-type')}">stainless anchor shackles</a> and <a href="${STAINLESS_CHAIN}">stainless chain</a> each carry their own tables for that reason.`,
      },
    ],
  },
  'turnbuckle-types': {
    links: [
      { phrase: 'DIN 1480 body', href: p('din-1480-turnbuckle') },
      { phrase: 'wire rope', href: WIRE_ROPE },
    ],
  },
  'types-of-lifting-slings': {
    links: [
      { phrase: 'alloy chain slings', href: CHAIN_SLINGS },
      { phrase: 'polyester round sling', href: SYNTHETIC },
      { phrase: 'Grade 80 chain', href: ALLOY_CHAIN },
      { phrase: 'wire rope slings', href: WIRE_SLINGS },
      { phrase: 'master links', href: MASTER_LINKS },
    ],
  },
  'types-of-shackles': {
    links: [
      { phrase: 'G-209 pattern', href: p('screw-pin-anchor-shackle-g-209-pattern') },
      { phrase: 'G-210 pattern', href: p('screw-pin-chain-shackle-g-210-pattern') },
      { phrase: 'padeye', href: LIFTING_POINTS },
      { phrase: 'synthetic sling', href: SYNTHETIC },
      { phrase: 'anchor chain', href: ANCHOR_CHAIN },
    ],
  },
  'wire-rope-clips-installation': {
    links: [
      { phrase: 'thimble', href: THIMBLES },
      { phrase: 'Fist grips', href: p('drop-forged-fist-grip-wire-rope-clip-hot-dip-galvanized') },
      { phrase: 'pulley', href: BLOCKS },
      { phrase: 'DIN 1142 design', href: p('din-1142-wire-rope-clip-yellow-chromated') },
      { phrase: 'ferrule-secured', href: ROPE_FERRULES },
    ],
  },
  'wire-rope-construction-explained': {
    links: [
      { phrase: '6x36WS', href: p('6x36ws-steel-wire-rope') },
      { phrase: 'compacted 6x19S', href: p('compacted-steel-wire-rope-6x19s') },
      { phrase: 'wide-body shackles', href: SHACKLES },
      { phrase: 'wire rope slings', href: WIRE_SLINGS },
    ],
  },
  'wire-rope-eye-terminations': {
    links: [
      { phrase: 'Flemish eyes', href: p('flemish-eye-wire-rope-sling') },
      { phrase: 'ferrule makers validate', href: ROPE_FERRULES },
      { phrase: 'copper ferrules', href: p('copper-ferrule') },
    ],
  },
  'wire-rope-thimble-types': {
    links: [
      { phrase: 'shackle pin', href: SHACKLES },
      { phrase: 'its ferrule or splice', href: ROPE_FERRULES },
      { phrase: 'extra-heavy thimble', href: p('extra-heavy-wire-rope-thimble-g-414-pattern-hot-dip-galvanized') },
      { phrase: 'DIN 6899', href: p('din-6899-a-wire-rope-thimble') },
    ],
  },
  'working-load-limit-vs-breaking-strength': {
    links: [
      { phrase: 'wire rope sling', href: WIRE_SLINGS },
      { phrase: 'Grade 80 table', href: ALLOY_CHAIN },
      { phrase: 'A shackle', href: SHACKLES },
      { phrase: 'eye bolt', href: EYE_BOLTS },
      { phrase: 'Polyester slings', href: SYNTHETIC },
    ],
  },
}
