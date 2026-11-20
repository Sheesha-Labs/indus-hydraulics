/**
 * In-text links from articles to category pages, 2026-11-20.
 *
 * Why: Search Console URL Inspection on 2026-11-20 found 0 of 40 sampled
 * lifting categories and 0 of 16 marine categories indexed, and 14 of 40 hose
 * categories; most were "URL is unknown to Google" despite being in the
 * sitemap. Googlebot's 30-day logs showed 4,855 product fetches against 155
 * category fetches. Article prose linked products 6,614 times and categories
 * 409 times, and the Lifting, Marine and Hoses & Fittings roots not once —
 * category pages were reachable almost only through the megamenu, which is
 * the same ~430 links on every page.
 *
 * Rules the plan was generated and reviewed to:
 *
 *   - A phrase the article already uses, linked where it first appears outside
 *     headings, existing links and the lead's first words. Nothing is added.
 *   - Multi-word catalogue nouns only ("wire rope slings", "lay flat hose"),
 *     case-sensitive, whole word — no bare "slings", "ferrules" or "anchors".
 *   - Lifting and marine shelves are linked only from lifting and marine
 *     articles; hose shelves only from the rest, so a wire-rope "ferrule" or
 *     a marine "shackle" never lands on the wrong surface.
 *   - Root categories first, then their direct shelves, then deeper shelves;
 *     at most three new links per article; never a URL the prose already links.
 *   - Every link read in its sentence before it went in. Dropped where the
 *     sentence argues against the item ("No chain slings", "never form an eye
 *     with wire rope clips", "used as lifting gear, they are a liability") or
 *     where the shelf does not match the sense ("anchor shackles" in a lifting
 *     shackle piece means a bow shackle, not marine chain accessories).
 *
 * Root category ownership, to stop the two hose roots competing:
 *   /c/hydraulic-hose-fittings-suppliers-uae — "hydraulic hose(s) and fittings",
 *     "hoses and fittings"; /c/industrial-hose-suppliers-uae — "industrial hose(s)".
 */
import type { InlinePlan } from '../2026-10-06-blog-inline-links/plans'

export const CATEGORY_LINK_PLANS: Record<string, InlinePlan> = {
  'anchor-chain-cable-arrangement': {
    links: [
      { phrase: "joining shackles", href: '/c/anchor-chain-accessories' },
    ],
  },
  'anchor-chain-grades-u1-u2-u3': {
    links: [
      { phrase: "lifting chain", href: '/c/lifting-chain-fittings' },
      { phrase: "anchor chain", href: '/c/anchor-chain-fittings' },
      { phrase: "Offshore mooring chain", href: '/c/offshore-mooring-chain' },
    ],
  },
  'anchor-chain-marking-and-certificates': {
    links: [
      { phrase: "anchor chain", href: '/c/anchor-chain-fittings' },
      { phrase: "offshore mooring chain", href: '/c/offshore-mooring-chain' },
    ],
  },
  'anchor-chain-size-chart': {
    links: [
      { phrase: "anchor chain", href: '/c/anchor-chain-fittings' },
      { phrase: "offshore mooring chain", href: '/c/offshore-mooring-chain' },
    ],
  },
  'anchor-chain-wear-limits': {
    links: [
      { phrase: "Kenter shackles", href: '/c/anchor-chain-accessories' },
    ],
  },
  'anchor-proof-load-testing': {
    links: [
      { phrase: "lifting gear", href: '/c/lifting-rigging-equipment-uae' },
    ],
  },
  'asme-b30-26-rigging-hardware-explained': {
    links: [
      { phrase: "rigging hardware", href: '/c/rigging-hardware' },
      { phrase: "wedge sockets", href: '/c/wire-rope-sockets-terminals' },
    ],
  },
  'ball-valve-pressure-ratings-cwp-wog': {
    links: [
      { phrase: "SAE flanges", href: '/c/hydraulic-sae-flanges' },
    ],
  },
  'beam-trolley-guide': {
    links: [
      { phrase: "beam trolleys", href: '/c/beam-trolleys' },
    ],
  },
  'bolted-flange-vs-end-cap-spreader-beams': {
    links: [
      { phrase: "below-the-hook lifting devices", href: '/c/below-the-hook-lifting' },
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'braided-hose-crimp-fittings-guide': {
    links: [
      { phrase: "hoses and fittings", href: '/c/hydraulic-hose-fittings-suppliers-uae' },
      { phrase: "hose assemblies", href: '/c/hydraulic-hose-assemblies' },
    ],
  },
  'bs-3032-din-82101-as-2741-shackles': {
    links: [
      { phrase: "lifting gear", href: '/c/lifting-rigging-equipment-uae' },
    ],
  },
  'buying-fittings-in-south-africa': {
    links: [
      { phrase: "hose assemblies", href: '/c/hydraulic-hose-assemblies' },
    ],
  },
  'centre-of-gravity-in-lifting': {
    links: [
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'chain-block-vs-lever-hoist-vs-electric-hoist': {
    links: [
      { phrase: "lifting equipment", href: '/c/lifting-rigging-equipment-uae' },
    ],
  },
  'chain-grades-explained': {
    links: [
      { phrase: "lifting chain", href: '/c/lifting-chain-fittings' },
      { phrase: "Grade 80 fittings", href: '/c/grade-80-chain-fittings' },
      { phrase: "Grade 100 fittings", href: '/c/grade-100-chain-fittings' },
    ],
  },
  'chain-sling-capacity-chart': {
    links: [
      { phrase: "lifting slings", href: '/c/lifting-slings' },
      { phrase: "chain slings", href: '/c/chain-slings' },
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'chain-sling-codes-explained': {
    links: [
      { phrase: "master links", href: '/c/master-links-rings-swivels' },
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
      { phrase: "alloy chain", href: '/c/alloy-lifting-chain' },
    ],
  },
  'commercial-grade-vs-lifting-grade-shackles': {
    links: [
      { phrase: "rigging equipment", href: '/c/lifting-rigging-equipment-uae' },
      { phrase: "turnbuckles", href: '/c/turnbuckles-rigging-screws' },
    ],
  },
  'composite-hose-explained': {
    links: [
      { phrase: "industrial hose", href: '/c/industrial-hose-suppliers-uae' },
    ],
  },
  'compressed-air-hose-selection': {
    links: [
      { phrase: "air and water hoses", href: '/c/air-water-hoses' },
    ],
  },
  'crosby-pattern-numbers-explained': {
    links: [
      { phrase: "rigging hardware", href: '/c/rigging-hardware' },
    ],
  },
  'cryogenic-jacketed-and-heated-metal-hose': {
    links: [
      { phrase: "metal hoses", href: '/c/metallic-hose-suppliers-uae' },
    ],
  },
  'desalination-and-water-treatment-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'dewatering-discharge-permits-dubai-qatar': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'din-1480-vs-din-1478-turnbuckle': {
    links: [
      { phrase: "turnbuckles", href: '/c/turnbuckles-rigging-screws' },
    ],
  },
  'din-link-chain-standards': {
    links: [
      { phrase: "lifting chain", href: '/c/lifting-chain-fittings' },
    ],
  },
  'equipment-number-anchor-chain-sizing': {
    links: [
      { phrase: "HHP anchors", href: '/c/ship-offshore-anchors' },
    ],
  },
  'eye-bolt-capacity-chart': {
    links: [
      { phrase: "eye bolts", href: '/c/eye-bolts-eye-nuts' },
    ],
  },
  'fire-hose-cabinet-maintenance': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'fire-hose-requirements-uae-civil-defence': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'fire-hose-standards-en-14540-bs-6391-nfpa': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'frac-water-transfer-lay-flat-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'grade-80-vs-grade-100-chain-slings': {
    links: [
      { phrase: "lifting chain", href: '/c/lifting-chain-fittings' },
      { phrase: "master links", href: '/c/master-links-rings-swivels' },
      { phrase: "Grade 100 fittings", href: '/c/grade-100-chain-fittings' },
    ],
  },
  'hammerlock-vs-clevis-chain-fittings': {
    links: [
      { phrase: "chain slings", href: '/c/chain-slings' },
    ],
  },
  'high-pressure-metal-hose': {
    links: [
      { phrase: "metal hoses", href: '/c/metallic-hose-suppliers-uae' },
    ],
  },
  'how-to-assemble-a-kenter-shackle': {
    links: [
      { phrase: "Kenter shackles", href: '/c/anchor-chain-accessories' },
    ],
  },
  'how-to-choose-and-tension-a-turnbuckle': {
    links: [
      { phrase: "turnbuckles", href: '/c/turnbuckles-rigging-screws' },
    ],
  },
  'how-to-repair-lay-flat-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'how-to-spot-counterfeit-rigging-hardware': {
    links: [
      { phrase: "rigging hardware", href: '/c/rigging-hardware' },
    ],
  },
  'hydraulic-fittings-guide': {
    links: [
      { phrase: "SAE flanges", href: '/c/hydraulic-sae-flanges' },
    ],
  },
  'hydraulic-hose-assembly-guide': {
    links: [
      { phrase: "hose and fittings", href: '/c/hydraulic-hose-fittings-suppliers-uae' },
    ],
  },
  'hydraulic-hose-shelf-life-storage': {
    links: [
      { phrase: "hose assemblies", href: '/c/hydraulic-hose-assemblies' },
    ],
  },
  'industrial-hose-couplings-guide': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
      { phrase: "shank couplings", href: '/c/shank-couplings' },
    ],
  },
  'industrial-hose-guide': {
    links: [
      { phrase: "Industrial hose", href: '/c/industrial-hose-suppliers-uae' },
      { phrase: "Lay flat hose", href: '/c/lay-flat-hoses' },
      { phrase: "air hoses", href: '/c/air-water-hoses' },
    ],
  },
  'irrigation-lay-flat-hose-guide': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'jetty-and-marine-construction-rigging': {
    links: [
      { phrase: "turnbuckles", href: '/c/turnbuckles-rigging-screws' },
    ],
  },
  'kc-nipples-and-shank-couplings': {
    links: [
      { phrase: "shank couplings", href: '/c/shank-couplings' },
    ],
  },
  'lay-flat-hose-flow-and-friction-loss': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'lay-flat-hose-guide': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'lay-flat-hose-in-gulf-heat': {
    links: [
      { phrase: "lay flat hoses", href: '/c/lay-flat-hoses' },
    ],
  },
  'lay-flat-hose-vs-hdpe-pipe': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'lifting-bars-for-air-handling-units': {
    links: [
      { phrase: "lifting equipment", href: '/c/lifting-rigging-equipment-uae' },
      { phrase: "spreader beams", href: '/c/spreader-beams' },
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'lifting-chillers-and-rooftop-plant': {
    links: [
      { phrase: "chain blocks", href: '/c/chain-blocks-manual-hoists' },
      { phrase: "beam trolleys", href: '/c/beam-trolleys' },
      { phrase: "master links", href: '/c/master-links-rings-swivels' },
    ],
  },
  'lifting-equipment-inspection-uae': {
    links: [
      { phrase: "lifting equipment", href: '/c/lifting-rigging-equipment-uae' },
    ],
  },
  'lifting-equipment-register-uae': {
    links: [
      { phrase: "lifting equipment", href: '/c/lifting-rigging-equipment-uae' },
    ],
  },
  'lifting-equipment-rules-gcc': {
    links: [
      { phrase: "lifting equipment", href: '/c/lifting-rigging-equipment-uae' },
      { phrase: "rigging hardware", href: '/c/rigging-hardware' },
    ],
  },
  'lifting-equipment-rules-saudi-arabia': {
    links: [
      { phrase: "lifting equipment", href: '/c/lifting-rigging-equipment-uae' },
      { phrase: "chain slings", href: '/c/chain-slings' },
      { phrase: "wire rope slings", href: '/c/wire-rope-slings' },
    ],
  },
  'lifting-gear-rejection-criteria': {
    links: [
      { phrase: "Eye bolts", href: '/c/eye-bolts-eye-nuts' },
      { phrase: "turnbuckles", href: '/c/turnbuckles-rigging-screws' },
    ],
  },
  'lifting-swivels-explained': {
    links: [
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'low-emission-slurry-spreading-rules-europe': {
    links: [
      { phrase: "lay flat hoses", href: '/c/lay-flat-hoses' },
    ],
  },
  'marine-hose-fuel-exhaust-and-bilge': {
    links: [
      { phrase: "industrial hose", href: '/c/industrial-hose-suppliers-uae' },
    ],
  },
  'master-links-explained': {
    links: [
      { phrase: "master links", href: '/c/master-links-rings-swivels' },
    ],
  },
  'metal-hose-guide': {
    links: [
      { phrase: "cryogenic couplings", href: '/c/lng-cryogenic-couplings' },
    ],
  },
  'mine-dewatering-lay-flat-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'npt-npsm-and-sae-hose-fittings': {
    links: [
      { phrase: "hose assemblies", href: '/c/hydraulic-hose-assemblies' },
    ],
  },
  'offshore-mooring-chain-grades-r3-r4-r5': {
    links: [
      { phrase: "anchor chain", href: '/c/anchor-chain-fittings' },
    ],
  },
  'offshore-mooring-components': {
    links: [
      { phrase: "fibre rope", href: '/c/fibre-rope-twine' },
    ],
  },
  'orbital-hydraulic-motor-guide': {
    links: [
      { phrase: "quick couplers", href: '/c/quick-couplers' },
    ],
  },
  'overland-pumping-water-main-bypass': {
    links: [
      { phrase: "Lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'pad-eye-vs-swivel-lifting-point': {
    links: [
      { phrase: "eye bolts", href: '/c/eye-bolts-eye-nuts' },
    ],
  },
  'precast-concrete-lifting-clutch': {
    links: [
      { phrase: "lifting gear", href: '/c/lifting-rigging-equipment-uae' },
    ],
  },
  'precast-panel-and-beam-rigging': {
    links: [
      { phrase: "Chain slings", href: '/c/chain-slings' },
    ],
  },
  'pvc-or-rubber-suction-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'ratchet-strap-vs-chain-and-binder': {
    links: [
      { phrase: "lifting gear", href: '/c/lifting-rigging-equipment-uae' },
    ],
  },
  'reading-an-industrial-hose-layline': {
    links: [
      { phrase: "industrial hoses", href: '/c/industrial-hose-suppliers-uae' },
      { phrase: "air and water hoses", href: '/c/air-water-hoses' },
    ],
  },
  'refuse-truck-hydraulic-hose': {
    links: [
      { phrase: "hose assemblies", href: '/c/hydraulic-hose-assemblies' },
    ],
  },
  'rigging-hardware-rfq-checklist': {
    links: [
      { phrase: "chain slings", href: '/c/chain-slings' },
      { phrase: "round slings", href: '/c/synthetic-slings' },
      { phrase: "Turnbuckles", href: '/c/turnbuckles-rigging-screws' },
    ],
  },
  'shackle-buying-guide-uae': {
    links: [
      { phrase: "rigging hardware", href: '/c/rigging-hardware' },
    ],
  },
  'shackle-size-and-capacity-chart': {
    links: [
      { phrase: "wire rope slings", href: '/c/wire-rope-slings' },
    ],
  },
  'shutdown-and-turnaround-rigging': {
    links: [
      { phrase: "beam trolleys", href: '/c/beam-trolleys' },
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'single-vs-double-jacket-fire-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'site-mobilisation-rigging-kit': {
    links: [
      { phrase: "chain blocks", href: '/c/chain-blocks-manual-hoists' },
      { phrase: "beam trolleys", href: '/c/beam-trolleys' },
    ],
  },
  'sling-angle-chart': {
    links: [
      { phrase: "Spreader beams", href: '/c/spreader-beams' },
    ],
  },
  'sling-angle-compression-force': {
    links: [
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'sling-colour-code-chart': {
    links: [
      { phrase: "webbing slings", href: '/c/synthetic-slings' },
    ],
  },
  'slurry-drag-hose-sizing-and-life': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'slurry-umbilical-system-guide': {
    links: [
      { phrase: "Lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'snap-hooks-and-quick-links': {
    links: [
      { phrase: "master links", href: '/c/master-links-rings-swivels' },
      { phrase: "snap hooks", href: '/c/snap-hooks-quick-links' },
    ],
  },
  'snatch-block-vs-pulley-block': {
    links: [
      { phrase: "snatch blocks", href: '/c/snatch-blocks-pulleys' },
    ],
  },
  'snowmaking-hose-guide': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'spiral-hose-crimp-fittings-guide': {
    links: [
      { phrase: "SAE flanges", href: '/c/hydraulic-sae-flanges' },
    ],
  },
  'spreader-beam-misuse': {
    links: [
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'spreader-beam-vs-lifting-beam': {
    links: [
      { phrase: "spreader beams", href: '/c/spreader-beams' },
      { phrase: "lifting points", href: '/c/lifting-points-pad-eyes' },
    ],
  },
  'ss316l-hydraulic-fittings': {
    links: [
      { phrase: "SAE flange fittings", href: '/c/hydraulic-sae-flanges' },
    ],
  },
  'stainless-steel-lifting-chain': {
    links: [
      { phrase: "lifting gear", href: '/c/lifting-rigging-equipment-uae' },
      { phrase: "lifting chain", href: '/c/lifting-chain-fittings' },
    ],
  },
  'steel-erection-rigging-equipment': {
    links: [
      { phrase: "lifting clamps", href: '/c/hoists-blocks-clamps' },
      { phrase: "chain slings", href: '/c/chain-slings' },
      { phrase: "Synthetic slings", href: '/c/synthetic-slings' },
    ],
  },
  'suction-hose-vs-lay-flat-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'tower-crane-rigging-gear': {
    links: [
      { phrase: "lifting equipment", href: '/c/lifting-rigging-equipment-uae' },
      { phrase: "Chain slings", href: '/c/chain-slings' },
    ],
  },
  'tpu-vs-nbr-vs-pvc-lay-flat-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'turnbuckle-types': {
    links: [
      { phrase: "turnbuckles", href: '/c/turnbuckles-rigging-screws' },
    ],
  },
  'turnbuckles-for-guy-wires-and-cable-bracing': {
    links: [
      { phrase: "wire rope clips", href: '/c/wire-rope-clips' },
    ],
  },
  'types-of-marine-anchors': {
    links: [
      { phrase: "stockless anchors", href: '/c/ship-offshore-anchors' },
      { phrase: "ship anchors", href: '/c/marine-anchors' },
    ],
  },
  'types-of-marine-fenders': {
    links: [
      { phrase: "bollards", href: '/c/bollards-mooring' },
      { phrase: "fenders", href: '/c/marine-fenders' },
    ],
  },
  'types-of-mooring-bollards': {
    links: [
      { phrase: "bollards", href: '/c/bollards-mooring' },
      { phrase: "Fenders", href: '/c/marine-fenders' },
      { phrase: "fairleads", href: '/c/towing-mooring-fittings' },
    ],
  },
  'types-of-shackles': {
    links: [
      { phrase: "anchor chain", href: '/c/anchor-chain-fittings' },
    ],
  },
  'vertical-vs-horizontal-plate-lifting-clamps': {
    links: [
      { phrase: "beam clamps", href: '/c/lifting-beam-clamps' },
    ],
  },
  'water-suction-and-dewatering-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'webbing-and-round-sling-capacity-chart': {
    links: [
      { phrase: "webbing slings", href: '/c/synthetic-slings' },
    ],
  },
  'well-service-and-stimulation-hose': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'why-lay-flat-hose-fails': {
    links: [
      { phrase: "lay flat hose", href: '/c/lay-flat-hoses' },
    ],
  },
  'wire-rope-clips-installation': {
    links: [
      { phrase: "lifting slings", href: '/c/lifting-slings' },
      { phrase: "wire rope clips", href: '/c/wire-rope-clips' },
    ],
  },
  'wire-rope-sling-capacity-chart': {
    links: [
      { phrase: "wire rope slings", href: '/c/wire-rope-slings' },
    ],
  },
  'wire-rope-thimble-types': {
    links: [
      { phrase: "wire rope terminations", href: '/c/wire-rope-fittings' },
    ],
  },
}
