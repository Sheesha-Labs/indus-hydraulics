/**
 * The blog's internal link graph, in one file.
 *
 * WHY THIS IS NOT IN THE ARTICLE SEEDS
 *
 * The obvious home for a link is the article that carries it, and that is
 * where `category_link` and `product_embed` already live. It is the wrong home
 * for the graph. Seeds are spread across seven wave directories, so the edges
 * would be too — and re-running an old wave importer would then silently strip
 * every link added to its articles after the fact. One article's links are
 * content; the shape of the whole graph is a separate decision that wants to
 * be reviewable in one diff.
 *
 * So `runBlogArticleImport` composes these in on every write. Re-running any
 * wave reapplies the graph rather than destroying it, which is the property
 * that made this worth doing.
 *
 * WHAT GOES WHERE
 *
 *   related — three articles, chosen so at least one crosses category. Same
 *   category only would build eleven closed islands rather than one cluster.
 *
 *   pages — markets, services and industries, and ONLY where the article
 *   genuinely bears on them. This is deliberately sparse, and stayed sparse
 *   when the delivery-reach section arrived. The two are different things: a
 *   `page_link` is a card asserting this article is *about* that page, and
 *   ninety-three articles each asserting that about a dozen countries is the
 *   doorway-page pattern our own competitor teardown identifies as the reason
 *   a rival's site does not rank. The `market_reach` block is a shipping note
 *   with prose behind it and rotating destinations — see
 *   `@indus/domain/blog-market-reach`. Adding a market here still means "this
 *   article is genuinely about that market", and still costs against the cap
 *   in blog-cross-links.test.ts.
 *
 *   skus — applied only to articles that carry no product_embed of their own,
 *   so an author's own choice always wins.
 */

export type BlogPageLink = {
  kind: 'market' | 'service' | 'industry'
  slug: string
  label: string
  blurb?: string
}

export type BlogCrossLinks = {
  /** Blog post slugs. Never the article's own — the importer rejects that. */
  related?: string[]
  pages?: BlogPageLink[]
  /** Fallback only: ignored when the article already embeds products. */
  skus?: string[]
}

const OIL_GAS: BlogPageLink = {
  kind: 'industry',
  slug: 'oil-gas',
  label: 'Oil and gas',
  blurb: 'Pressure control, drilling and downstream hose across the Gulf.',
}
const MARINE: BlogPageLink = {
  kind: 'industry',
  slug: 'marine',
  label: 'Marine and offshore',
  blurb: 'Deck equipment, splash zone and vessel hydraulics.',
}
const CONSTRUCTION: BlogPageLink = {
  kind: 'industry',
  slug: 'construction',
  label: 'Construction',
  blurb: 'Earthmoving, lifting and concrete plant.',
}
const MINING: BlogPageLink = {
  kind: 'industry',
  slug: 'mining',
  label: 'Mining',
  blurb: 'Continuous duty, abrasive ground and long distances from a workshop.',
}
const STEEL: BlogPageLink = {
  kind: 'industry',
  slug: 'steel',
  label: 'Steel and metals',
  blurb: 'Hot environments where hose life is set by radiant heat.',
}
const POWER: BlogPageLink = {
  kind: 'industry',
  slug: 'power',
  label: 'Power and energy',
  blurb: 'Turbine, generation and water treatment plant.',
}

const SVC_CLEANLINESS: BlogPageLink = {
  kind: 'service',
  slug: 'iso-4406-oil-cleanliness-coding-q1-2026-aluminum-smelter',
  label: 'Oil cleanliness coding across fourteen systems',
  blurb: 'What contamination monitoring actually caught, and how early.',
}
const SVC_RIG_REFIT: BlogPageLink = {
  kind: 'service',
  slug: 'sour-service-hose-assembly-build-100-line-rig-refit',
  label: '112 assemblies for a rig refit',
  blurb: 'Bulk build and tagging, fourteen days, every hose traceable.',
}
const SVC_WORKOVER: BlogPageLink = {
  kind: 'service',
  slug: 'workover-rig-cylinder-hose-overhaul-jebel-ali',
  label: 'Ninety-six hoses in nineteen days',
  blurb: 'A whole-machine hose overhaul against a rig date.',
}
const SVC_MANIFOLD: BlogPageLink = {
  kind: 'service',
  slug: 'custom-16-port-manifold-en24-420-bar-press-control',
  label: 'A 420 bar manifold from a sketch',
  blurb: 'Press control built to a drawing that started on grid paper.',
}

const MKT_SAUDI: BlogPageLink = {
  kind: 'market',
  slug: 'saudi-arabia',
  label: 'Saudi Arabia',
  blurb: 'Overland from Jebel Ali, the largest of our export destinations.',
}
const MKT_OMAN: BlogPageLink = {
  kind: 'market',
  slug: 'oman',
  label: 'Oman',
  blurb: 'Road freight, short transit, no port call.',
}
const MKT_IRAQ: BlogPageLink = {
  kind: 'market',
  slug: 'iraq',
  label: 'Iraq',
  blurb: 'Oilfield-heavy demand and a documentation-heavy route.',
}
const MKT_QATAR: BlogPageLink = {
  kind: 'market',
  slug: 'qatar',
  label: 'Qatar',
  blurb: 'Gas processing, construction and marine.',
}
const MKT_KENYA: BlogPageLink = {
  kind: 'market',
  slug: 'kenya',
  label: 'Kenya',
  blurb: 'Sea freight to Mombasa, and onward into East Africa.',
}

export const BLOG_CROSS_LINKS: Record<string, BlogCrossLinks> = {
  // ── failure-analysis ───────────────────────────────────────────────────
  'why-hydraulic-hoses-fail': {
    related: [
      'hose-failure-post-mortem',
      'hydraulic-hose-inspection',
      'hose-routing-bend-radius-twist',
    ],
  },
  'hose-routing-bend-radius-twist': {
    related: [
      'hydraulic-hose-installed-with-a-twist',
      'hydraulic-hose-kinked',
      'compact-hose-1sc-2sc',
    ],
  },
  'hose-burst-at-the-fitting': {
    related: [
      'hydraulic-hose-crimp-faults',
      'skiving-and-fitting-selection',
      'new-hydraulic-hose-weeping',
    ],
  },
  'hydraulic-hose-cover-blistering': {
    related: [
      'hydraulic-hose-tube-swelling',
      'chemical-transfer-hose-selection',
      'why-hydraulic-hoses-fail',
    ],
  },
  'hydraulic-hose-wire-corrosion': {
    related: [
      'hydraulic-hose-coastal-corrosion',
      'hydraulic-hose-abrasion-failure',
      'hydraulic-hose-inspection',
    ],
    pages: [MARINE],
  },
  'hydraulic-hose-abrasion-failure': {
    related: [
      'hose-routing-bend-radius-twist',
      'hydraulic-hose-sand-abrasion',
      'hydraulic-hose-inspection',
    ],
    skus: ['IH-HOSE-2SC', 'IH-HOSE-R1-1SC'],
  },
  'hydraulic-hose-installed-with-a-twist': {
    related: [
      'hose-routing-bend-radius-twist',
      'how-to-measure-a-hydraulic-hose',
      'detaching-a-hose-on-a-modern-machine',
    ],
    skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC'],
  },
  'hydraulic-hose-kinked': {
    related: [
      'compact-hose-1sc-2sc',
      'hose-routing-bend-radius-twist',
      'how-to-measure-a-hydraulic-hose',
    ],
  },
  'hydraulic-hose-tube-swelling': {
    related: [
      'chemical-transfer-hose-selection',
      'hydraulic-hose-cover-blistering',
      'bspp-bonded-seal-sizing',
    ],
  },
  'hydraulic-hose-cover-cracking': {
    related: [
      'hydraulic-hose-uv-and-ozone',
      'hydraulic-hose-shelf-life-storage',
      'why-summer-is-harder-on-hydraulic-hose',
    ],
  },
  'hydraulic-hose-crimp-faults': {
    related: [
      'skiving-and-fitting-selection',
      'should-you-buy-a-hose-crimper',
      'hose-burst-at-the-fitting',
    ],
    skus: ['IH-CF-NS-R1T1SN', 'IH-CF-NS-1SN2SN', 'IH-CF-DS-R13'],
  },
  'hose-failure-post-mortem': {
    related: [
      'why-hydraulic-hoses-fail',
      'hydraulic-hose-inspection',
      'hose-register-and-replacement-programme',
    ],
    skus: ['IH-HOSE-2SC', 'IH-HOSE-4SP'],
  },
  'new-hydraulic-hose-weeping': {
    related: [
      'hydraulic-fitting-make-up-torque',
      'stopping-an-npt-thread-leak',
      'bspp-bonded-seal-sizing',
    ],
    skus: ['IH-AD-JIC-001', 'IH-AD-ORFS-001', 'IH-AD-MET-001'],
  },
  'cross-threaded-hydraulic-port': {
    related: [
      'hydraulic-fitting-make-up-torque',
      'removing-a-seized-hydraulic-fitting',
      'stacking-hydraulic-adapters',
    ],
    skus: ['IH-AD-BSP-020', 'IH-AD-NPT-001', 'IH-AD-JIC-001'],
  },
  'split-female-quick-coupler': {
    related: [
      'trapped-pressure-quick-coupler',
      'hydraulic-quick-couplers-iso-7241',
      'skid-steer-hydraulic-hose',
    ],
    skus: ['IH-QC-ISO16028', 'IH-QC-ISO7241B-V', 'IH-QC-FARM-CUP'],
  },

  // ── fitting-identification ─────────────────────────────────────────────
  'identify-any-hydraulic-fitting': {
    related: [
      'hydraulic-thread-size-and-pitch-reference',
      'jic-vs-orfs-vs-npt-vs-bsp',
      'photographing-a-hydraulic-fitting',
    ],
  },
  'bspp-vs-bspt': {
    related: [
      'bspp-bonded-seal-sizing',
      'stopping-an-npt-thread-leak',
      'hydraulic-thread-size-and-pitch-reference',
    ],
  },
  'jic-vs-orfs-vs-npt-vs-bsp': {
    related: [
      'where-jic-is-the-wrong-choice',
      'sae-j518-code-61-code-62-flanges',
      'identify-any-hydraulic-fitting',
    ],
  },
  'hydraulic-thread-size-and-pitch-reference': {
    related: [
      'identify-any-hydraulic-fitting',
      'bspp-vs-bspt',
      'photographing-a-hydraulic-fitting',
    ],
    skus: ['IH-AD-BSP-053', 'IH-AD-JIC-001', 'IH-AD-MET-002', 'IH-AD-NPT-001'],
  },
  'photographing-a-hydraulic-fitting': {
    related: [
      'identify-any-hydraulic-fitting',
      'what-to-send-for-a-hose-quote',
      'hydraulic-thread-size-and-pitch-reference',
    ],
    skus: ['IH-AD-JIC-001', 'IH-AD-ORFS-001'],
  },
  'bspp-bonded-seal-sizing': {
    related: ['bspp-vs-bspt', 'new-hydraulic-hose-weeping', 'hydraulic-fitting-make-up-torque'],
    skus: ['IH-AD-MET-001', 'IH-AD-BSP-020', 'IH-AD-BSP-056'],
  },
  'stacking-hydraulic-adapters': {
    related: [
      'cross-threaded-hydraulic-port',
      'how-to-measure-a-hydraulic-hose',
      'hydraulic-fitting-make-up-torque',
    ],
    skus: ['IH-AD-BSP-019', 'IH-AD-JIC-002', 'IH-AD-ORFS-002'],
  },

  // ── gulf-conditions ────────────────────────────────────────────────────
  'hydraulic-hose-in-uae-heat': {
    related: [
      'why-summer-is-harder-on-hydraulic-hose',
      'hydraulic-hose-cover-cracking',
      'injection-moulding-hydraulic-hose',
    ],
    pages: [MKT_SAUDI],
  },
  'hydraulic-hose-uv-and-ozone': {
    related: [
      'hydraulic-hose-cover-cracking',
      'hydraulic-hose-shelf-life-storage',
      'hydraulic-hose-in-uae-heat',
    ],
    skus: ['IH-HOSE-2SC', 'IH-HOSE-R1-1SC'],
  },
  'hydraulic-hose-sand-abrasion': {
    related: [
      'hydraulic-hose-abrasion-failure',
      'contamination-during-a-hose-change',
      'mini-excavator-hose-maintenance',
    ],
    pages: [MINING],
    skus: ['IH-HOSE-2SC', 'IH-HOSE-4SP'],
  },
  'hydraulic-hose-coastal-corrosion': {
    related: [
      'hydraulic-hose-wire-corrosion',
      'port-equipment-hydraulic-hose',
      'offshore-hydraulic-hose',
    ],
    pages: [MARINE],
  },
  'offshore-hydraulic-hose': {
    related: [
      'hydraulic-hose-coastal-corrosion',
      'bop-control-hose-fire-resistance',
      'hydraulic-hose-wire-corrosion',
    ],
    pages: [MARINE, OIL_GAS],
  },
  'hydraulic-hose-shelf-life-storage': {
    related: [
      'hydraulic-hose-stocking-policy',
      'hydraulic-hose-cover-cracking',
      'hose-register-and-replacement-programme',
    ],
    skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC'],
  },
  'why-summer-is-harder-on-hydraulic-hose': {
    related: [
      'hydraulic-hose-in-uae-heat',
      'trapped-pressure-quick-coupler',
      'hydraulic-hose-uv-and-ozone',
    ],
    pages: [MKT_OMAN],
  },
  'desalination-and-water-treatment-hose': {
    related: [
      'water-suction-and-dewatering-hose',
      'industrial-hose-is-not-hydraulic-hose',
      'chemical-transfer-hose-selection',
    ],
    pages: [POWER],
  },

  // ── hose-assembly ──────────────────────────────────────────────────────
  'getting-a-hydraulic-hose-made': {
    related: [
      'how-to-measure-a-hydraulic-hose',
      'what-to-send-for-a-hose-quote',
      'skiving-and-fitting-selection',
    ],
  },
  'skiving-and-fitting-selection': {
    related: [
      'hydraulic-hose-crimp-faults',
      'should-you-buy-a-hose-crimper',
      'hose-burst-at-the-fitting',
    ],
  },
  'on-site-hydraulic-hose-service-uae': {
    related: [
      'field-re-hosing-kit',
      'hose-service-northern-emirates',
      'contamination-during-a-hose-change',
    ],
    pages: [SVC_WORKOVER],
  },
  'hose-service-northern-emirates': {
    related: [
      'on-site-hydraulic-hose-service-uae',
      'field-re-hosing-kit',
      'bulk-hose-refit-and-tagging',
    ],
  },
  'bulk-hose-refit-and-tagging': {
    related: [
      'field-re-hosing-kit',
      'hydraulic-hose-kits-for-a-fleet',
      'hose-register-and-replacement-programme',
    ],
    pages: [SVC_RIG_REFIT],
  },
  'how-to-measure-a-hydraulic-hose': {
    related: [
      'what-to-send-for-a-hose-quote',
      'getting-a-hydraulic-hose-made',
      'hydraulic-hose-dash-sizes',
    ],
    skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-4SP'],
  },
  'hydraulic-quick-couplers-iso-7241': {
    related: [
      'trapped-pressure-quick-coupler',
      'split-female-quick-coupler',
      'skid-steer-hydraulic-hose',
    ],
    skus: ['IH-QC-ISO7241A-V', 'IH-QC-ISO7241B-V', 'IH-QC-ISO16028', 'IH-QC-FARM-ISO5675'],
  },
  'hydraulic-fitting-make-up-torque': {
    related: [
      'new-hydraulic-hose-weeping',
      'cross-threaded-hydraulic-port',
      'stopping-an-npt-thread-leak',
    ],
    skus: ['IH-AD-JIC-001', 'IH-AD-ORFS-001', 'IH-AD-MET-001'],
  },
  'field-re-hosing-kit': {
    related: [
      'bulk-hose-refit-and-tagging',
      'contamination-during-a-hose-change',
      'removing-a-seized-hydraulic-fitting',
    ],
    pages: [SVC_WORKOVER],
    skus: ['IH-HOSE-2SC', 'IH-AD-BSP-053', 'IH-CF-NS-1SN2SN'],
  },

  // ── industrial-hose ────────────────────────────────────────────────────
  'industrial-hose-is-not-hydraulic-hose': {
    related: [
      'chemical-transfer-hose-selection',
      'water-suction-and-dewatering-hose',
      'hydraulic-hose-pressure-by-size',
    ],
  },
  'chemical-transfer-hose-selection': {
    related: [
      'hydraulic-hose-tube-swelling',
      'industrial-hose-is-not-hydraulic-hose',
      'food-grade-hose-compliance',
    ],
  },
  'steam-hose-safety': {
    related: [
      'industrial-hose-is-not-hydraulic-hose',
      'hose-whip-restraint-and-burst-protection',
      'chemical-transfer-hose-selection',
    ],
    pages: [POWER],
  },
  'food-grade-hose-compliance': {
    related: [
      'chemical-transfer-hose-selection',
      'unbranded-hydraulic-fittings',
      'industrial-hose-is-not-hydraulic-hose',
    ],
  },
  'water-suction-and-dewatering-hose': {
    related: [
      'desalination-and-water-treatment-hose',
      'industrial-hose-is-not-hydraulic-hose',
      'log-splitter-and-shop-press-hose',
    ],
    pages: [MINING],
  },

  // ── machine-down ───────────────────────────────────────────────────────
  'excavator-hydraulic-hose-replacement': {
    related: [
      'mini-excavator-hose-maintenance',
      'detaching-a-hose-on-a-modern-machine',
      'hydraulic-quick-couplers-iso-7241',
    ],
    pages: [CONSTRUCTION],
  },
  'forklift-hydraulic-hose-replacement': {
    related: [
      'port-equipment-hydraulic-hose',
      'hydraulic-hose-inspection',
      'hose-routing-bend-radius-twist',
    ],
  },
  'tipper-and-transit-mixer-hose': {
    related: [
      'concrete-pump-hydraulic-hose',
      'refuse-truck-hydraulic-hose',
      'truck-crane-hydraulic-hose',
    ],
    pages: [CONSTRUCTION],
  },
  'wheel-loader-hydraulic-hose': {
    related: [
      'backhoe-hydraulic-hose',
      'excavator-hydraulic-hose-replacement',
      'hydraulic-hose-abrasion-failure',
    ],
    pages: [MINING],
  },
  'mobile-crane-hydraulic-hose': {
    related: [
      'truck-crane-hydraulic-hose',
      'boom-lift-hydraulic-hose',
      'hose-whip-restraint-and-burst-protection',
    ],
    pages: [CONSTRUCTION],
  },
  'backhoe-hydraulic-hose': {
    related: [
      'wheel-loader-hydraulic-hose',
      'excavator-hydraulic-hose-replacement',
      'removing-a-seized-hydraulic-fitting',
    ],
  },
  'skid-steer-hydraulic-hose': {
    related: [
      'hydraulic-quick-couplers-iso-7241',
      'trapped-pressure-quick-coupler',
      'split-female-quick-coupler',
    ],
    skus: ['IH-QC-ISO16028', 'IH-QC-FARM-CUP', 'IH-QC-ISO16028-HP'],
  },
  'truck-crane-hydraulic-hose': {
    related: [
      'mobile-crane-hydraulic-hose',
      'boom-lift-hydraulic-hose',
      'hose-routing-bend-radius-twist',
    ],
    pages: [CONSTRUCTION],
  },
  'boom-lift-hydraulic-hose': {
    related: [
      'mobile-crane-hydraulic-hose',
      'hose-whip-restraint-and-burst-protection',
      'hose-register-and-replacement-programme',
    ],
  },
  'port-equipment-hydraulic-hose': {
    related: [
      'hydraulic-hose-coastal-corrosion',
      'forklift-hydraulic-hose-replacement',
      'hydraulic-hose-wire-corrosion',
    ],
    pages: [MARINE],
  },
  'tractor-hydraulic-hose': {
    related: [
      'hydraulic-quick-couplers-iso-7241',
      'trapped-pressure-quick-coupler',
      'log-splitter-and-shop-press-hose',
    ],
    skus: ['IH-QC-FARM-ISO5675', 'IH-QC-FARM-CUP', 'IH-QC-ISO7241A-V'],
  },
  'concrete-pump-hydraulic-hose': {
    related: [
      'tipper-and-transit-mixer-hose',
      'hydraulic-hose-pressure-by-size',
      'braid-vs-spiral-hydraulic-hose',
    ],
    pages: [CONSTRUCTION],
  },
  'injection-moulding-hydraulic-hose': {
    related: [
      'hydraulic-hose-in-uae-heat',
      'hydraulic-hose-cover-cracking',
      'log-splitter-and-shop-press-hose',
    ],
    pages: [STEEL],
  },
  'refuse-truck-hydraulic-hose': {
    related: [
      'tipper-and-transit-mixer-hose',
      'hose-register-and-replacement-programme',
      'hydraulic-hose-abrasion-failure',
    ],
  },
  'removing-a-seized-hydraulic-fitting': {
    related: [
      'cross-threaded-hydraulic-port',
      'detaching-a-hose-on-a-modern-machine',
      'grease-and-zerk-fittings',
    ],
    skus: ['IH-AD-BSP-053', 'IH-AD-NPT-001', 'IH-AD-JIC-001'],
  },
  'log-splitter-and-shop-press-hose': {
    related: [
      'hydraulic-hose-pressure-by-size',
      'water-suction-and-dewatering-hose',
      'should-you-buy-a-hose-crimper',
    ],
    pages: [SVC_MANIFOLD],
    skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-4SP'],
  },
  'detaching-a-hose-on-a-modern-machine': {
    related: [
      'removing-a-seized-hydraulic-fitting',
      'excavator-hydraulic-hose-replacement',
      'contamination-during-a-hose-change',
    ],
    skus: ['IH-HOSE-2SC', 'IH-AD-JIC-001'],
  },

  // ── maintenance-reliability ────────────────────────────────────────────
  'hydraulic-hose-inspection': {
    related: [
      'hose-register-and-replacement-programme',
      'why-hydraulic-hoses-fail',
      'mini-excavator-hose-maintenance',
    ],
  },
  'hose-register-and-replacement-programme': {
    related: [
      'hydraulic-hose-inspection',
      'hydraulic-hose-kits-for-a-fleet',
      'bulk-hose-refit-and-tagging',
    ],
  },
  'contamination-during-a-hose-change': {
    related: [
      'field-re-hosing-kit',
      'hydraulic-hose-sand-abrasion',
      'detaching-a-hose-on-a-modern-machine',
    ],
    pages: [SVC_CLEANLINESS],
    skus: ['IH-QC-OILSAMPLE', 'IH-0330R010BN4HC', 'IH-0160DN010BN4HC'],
  },
  'grease-and-zerk-fittings': {
    related: [
      'removing-a-seized-hydraulic-fitting',
      'mini-excavator-hose-maintenance',
      'hydraulic-thread-size-and-pitch-reference',
    ],
    skus: ['IH-AD-BSP-019', 'IH-AD-NPT-001'],
  },
  'mini-excavator-hose-maintenance': {
    related: [
      'hydraulic-hose-inspection',
      'excavator-hydraulic-hose-replacement',
      'hydraulic-quick-couplers-iso-7241',
    ],
    pages: [CONSTRUCTION],
    skus: ['IH-QC-ISO16028', 'IH-HOSE-2SC'],
  },

  // ── oilfield-pressure-control ──────────────────────────────────────────
  'api-7k-16c-16d-which-standard': {
    related: [
      'api-16c-choke-and-kill-lines',
      'api-7k-rotary-vibrator-hose',
      'bop-control-hose-fire-resistance',
    ],
    pages: [OIL_GAS],
  },
  'api-16c-choke-and-kill-lines': {
    related: [
      'api-7k-16c-16d-which-standard',
      'bop-control-hose-fire-resistance',
      'rig-site-hose-replacement-abu-dhabi',
    ],
    pages: [OIL_GAS, MKT_IRAQ],
  },
  'bop-control-hose-fire-resistance': {
    related: [
      'api-7k-16c-16d-which-standard',
      'api-16c-choke-and-kill-lines',
      'offshore-hydraulic-hose',
    ],
    pages: [OIL_GAS],
  },
  'api-7k-rotary-vibrator-hose': {
    related: [
      'api-7k-16c-16d-which-standard',
      'rig-site-hose-replacement-abu-dhabi',
      'hose-whip-restraint-and-burst-protection',
    ],
    pages: [OIL_GAS, SVC_RIG_REFIT],
  },
  'rig-site-hose-replacement-abu-dhabi': {
    related: [
      'api-7k-rotary-vibrator-hose',
      'bulk-hose-refit-and-tagging',
      'on-site-hydraulic-hose-service-uae',
    ],
    pages: [OIL_GAS, SVC_RIG_REFIT],
  },

  // ── procurement-export ─────────────────────────────────────────────────
  'how-to-cross-reference-a-hydraulic-hose': {
    related: [
      'how-to-read-a-hose-layline',
      'unbranded-hydraulic-fittings',
      'en-853-856-857-vs-sae-100r',
    ],
    skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-HOSE-4SP', 'IH-HOSE-4SH'],
  },
  'what-to-send-for-a-hose-quote': {
    related: [
      'how-to-measure-a-hydraulic-hose',
      'photographing-a-hydraulic-fitting',
      'getting-a-hydraulic-hose-made',
    ],
    skus: ['IH-HOSE-2SC', 'IH-CF-NS-1SN2SN'],
  },
  'hydraulic-hose-assembly-cost': {
    related: [
      'bulk-hose-or-finished-assemblies',
      'should-you-buy-a-hose-crimper',
      'hydraulic-hose-stocking-policy',
    ],
    skus: ['IH-HOSE-R1-1SC', 'IH-CF-NS-R1T1SN'],
  },
  'hydraulic-hose-stocking-policy': {
    related: [
      'hydraulic-hose-kits-for-a-fleet',
      'hydraulic-hose-shelf-life-storage',
      'hydraulic-hose-lead-times',
    ],
    skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-CF-NS-1SN2SN'],
  },
  'hydraulic-hose-lead-times': {
    related: [
      'hydraulic-hose-stocking-policy',
      'bulk-hose-or-finished-assemblies',
      'hydraulic-hose-kits-for-a-fleet',
    ],
    pages: [MKT_SAUDI, MKT_OMAN, MKT_KENYA],
    skus: ['IH-HOSE-2SC', 'IH-HOSE-4SP'],
  },
  'bulk-hose-or-finished-assemblies': {
    related: [
      'should-you-buy-a-hose-crimper',
      'hydraulic-hose-assembly-cost',
      'hydraulic-hose-stocking-policy',
    ],
    pages: [MKT_IRAQ, MKT_KENYA],
    skus: ['IH-HOSE-R1-1SC', 'IH-HOSE-2SC', 'IH-CF-NS-1SN2SN', 'IH-CF-DS-R13'],
  },
  'unbranded-hydraulic-fittings': {
    related: [
      'how-to-read-a-hose-layline',
      'how-to-cross-reference-a-hydraulic-hose',
      'hydraulic-hose-crimp-faults',
    ],
    skus: ['IH-CF-NS-1SN2SN', 'IH-AD-JIC-001', 'IH-AD-BSP-053'],
  },
  'hydraulic-hose-kits-for-a-fleet': {
    related: [
      'hose-register-and-replacement-programme',
      'hydraulic-hose-stocking-policy',
      'bulk-hose-refit-and-tagging',
    ],
    pages: [MKT_QATAR, MKT_OMAN],
    skus: ['IH-HOSE-2SC', 'IH-CF-NS-1SN2SN', 'IH-AD-JIC-001'],
  },
  'should-you-buy-a-hose-crimper': {
    related: [
      'skiving-and-fitting-selection',
      'bulk-hose-or-finished-assemblies',
      'hydraulic-hose-crimp-faults',
    ],
    skus: ['IH-CF-NS-R1T1SN', 'IH-CF-NS-1SN2SN', 'IH-CF-DS-R13', 'IH-HOSE-2SC'],
  },

  // ── safety ─────────────────────────────────────────────────────────────
  'hydraulic-fluid-injection-injury': {
    related: [
      'hose-whip-restraint-and-burst-protection',
      'trapped-pressure-quick-coupler',
      'hydraulic-hose-inspection',
    ],
    skus: ['IH-HOSE-2SC', 'IH-QC-GAUGEKIT'],
  },
  'hose-whip-restraint-and-burst-protection': {
    related: [
      'hydraulic-fluid-injection-injury',
      'api-7k-rotary-vibrator-hose',
      'mobile-crane-hydraulic-hose',
    ],
  },
  'trapped-pressure-quick-coupler': {
    related: [
      'split-female-quick-coupler',
      'hydraulic-quick-couplers-iso-7241',
      'hydraulic-fluid-injection-injury',
    ],
    skus: ['IH-QC-FARM-CUP', 'IH-QC-FF-TTC-HP', 'IH-QC-ISO16028'],
  },

  // ── specification-standards ────────────────────────────────────────────
  'hydraulic-hose-pressure-by-size': {
    related: ['hydraulic-hose-dash-sizes', 'braid-vs-spiral-hydraulic-hose', 'sae-100r-hose-types'],
  },
  'braid-vs-spiral-hydraulic-hose': {
    related: ['sae-100r-hose-types', 'compact-hose-1sc-2sc', 'hydraulic-hose-pressure-by-size'],
  },
  'compact-hose-1sc-2sc': {
    related: [
      'braid-vs-spiral-hydraulic-hose',
      'hydraulic-hose-kinked',
      'hose-routing-bend-radius-twist',
    ],
  },
  'sae-100r-hose-types': {
    related: [
      'en-853-856-857-vs-sae-100r',
      'braid-vs-spiral-hydraulic-hose',
      'how-to-read-a-hose-layline',
    ],
  },
  'en-853-856-857-vs-sae-100r': {
    related: [
      'sae-100r-hose-types',
      'how-to-cross-reference-a-hydraulic-hose',
      'how-to-read-a-hose-layline',
    ],
  },
  'hydraulic-hose-dash-sizes': {
    related: [
      'hydraulic-hose-pressure-by-size',
      'how-to-measure-a-hydraulic-hose',
      'how-to-read-a-hose-layline',
    ],
  },
  'how-to-read-a-hose-layline': {
    related: [
      'how-to-cross-reference-a-hydraulic-hose',
      'unbranded-hydraulic-fittings',
      'sae-100r-hose-types',
    ],
  },
  'stopping-an-npt-thread-leak': {
    related: ['bspp-vs-bspt', 'hydraulic-fitting-make-up-torque', 'new-hydraulic-hose-weeping'],
    skus: ['IH-AD-NPT-001', 'IH-AD-NPT-003', 'IH-AD-BSP-020'],
  },
  'sae-j518-code-61-code-62-flanges': {
    related: [
      'jic-vs-orfs-vs-npt-vs-bsp',
      'where-jic-is-the-wrong-choice',
      'hydraulic-fitting-make-up-torque',
    ],
    skus: ['IH-AD-HSF-001', 'IH-AD-HSF-003', 'IH-AD-HSF-002'],
  },
  'where-jic-is-the-wrong-choice': {
    related: [
      'jic-vs-orfs-vs-npt-vs-bsp',
      'sae-j518-code-61-code-62-flanges',
      'new-hydraulic-hose-weeping',
    ],
    skus: ['IH-AD-ORFS-001', 'IH-AD-JIC-001', 'IH-AD-HSF-001'],
  },

  // ── gcc-compliance (2026-09-01 wave 1) ─────────────────────────────────
  //
  // One market card in the whole cluster, on the article that is genuinely
  // about the Saudi lane. The other nine are about a document or a scheme
  // rather than about a country, so they link sideways and let the generated
  // reach section carry the geography — see the note at the top of this file.
  'saber-certificate-for-hydraulic-hose': {
    related: [
      'certificate-of-origin-gcc-duty',
      'gcc-import-documents-for-hose',
      'gulf-conformity-mark-hose-fittings',
    ],
    pages: [
      {
        kind: 'market',
        slug: 'saudi-arabia',
        label: 'Supplying Saudi Arabia from Dubai',
        blurb: 'Freight routes, transit, Incoterms and the full document set for the Saudi lane.',
      },
    ],
  },
  'gulf-conformity-mark-hose-fittings': {
    related: [
      'saber-certificate-for-hydraulic-hose',
      'gcc-import-documents-for-hose',
      'hose-assembly-test-certificate',
    ],
  },
  'certificate-of-origin-gcc-duty': {
    related: [
      'saber-certificate-for-hydraulic-hose',
      'gcc-import-documents-for-hose',
      'material-test-certificate-en-10204',
    ],
  },
  'hose-assembly-test-certificate': {
    related: [
      'material-test-certificate-en-10204',
      'verifying-a-genuine-hydraulic-hose',
      'how-to-read-a-hose-layline',
    ],
  },
  'material-test-certificate-en-10204': {
    related: [
      'hose-assembly-test-certificate',
      'nace-mr0175-hose-documentation',
      'oilfield-hose-document-pack',
    ],
  },
  'nace-mr0175-hose-documentation': {
    related: [
      'material-test-certificate-en-10204',
      'oilfield-hose-document-pack',
      'api-7k-16c-16d-which-standard',
    ],
  },
  'vendor-approval-for-hose-supply': {
    related: [
      'verifying-a-genuine-hydraulic-hose',
      'oilfield-hose-document-pack',
      'unbranded-hydraulic-fittings',
    ],
  },
  'verifying-a-genuine-hydraulic-hose': {
    related: [
      'how-to-read-a-hose-layline',
      'unbranded-hydraulic-fittings',
      'hose-assembly-test-certificate',
    ],
  },
  'gcc-import-documents-for-hose': {
    related: [
      'saber-certificate-for-hydraulic-hose',
      'certificate-of-origin-gcc-duty',
      'gulf-conformity-mark-hose-fittings',
    ],
  },
  'oilfield-hose-document-pack': {
    related: [
      'api-7k-16c-16d-which-standard',
      'nace-mr0175-hose-documentation',
      'hose-assembly-test-certificate',
    ],
  },

  // ── fitting-identification, machine-origin cluster (2026-09-01) ────────
  //
  // No market cards anywhere in this cluster. The articles are about a thread
  // family, not about a country — the geography they serve is carried by the
  // generated reach section, and the cap stays where it is.
  'fittings-on-a-chinese-excavator': {
    related: [
      'identify-any-hydraulic-fitting',
      'bsp-or-metric-fittings',
      'measuring-a-fitting-without-gauges',
    ],
  },
  'fittings-on-a-used-japanese-machine': {
    related: [
      'identify-any-hydraulic-fitting',
      'bridging-two-thread-standards',
      'hydraulic-thread-size-and-pitch-reference',
    ],
  },
  'tractor-hydraulic-fittings': {
    related: ['tractor-hydraulic-hose', 'hydraulic-quick-couplers-iso-7241', 'bsp-or-metric-fittings'],
  },
  'fittings-on-american-machines': {
    related: ['jic-vs-orfs-vs-npt-vs-bsp', 'where-jic-is-the-wrong-choice', 'stopping-an-npt-thread-leak'],
  },
  'fittings-on-european-machines': {
    related: [
      'hydraulic-thread-size-and-pitch-reference',
      'bspp-bonded-seal-sizing',
      'bridging-two-thread-standards',
    ],
  },
  'korean-excavator-hydraulic-fittings': {
    related: [
      'fittings-on-a-used-japanese-machine',
      'bridging-two-thread-standards',
      'excavator-hydraulic-hose-replacement',
    ],
  },
  'bsp-or-metric-fittings': {
    related: ['jic-vs-orfs-vs-npt-vs-bsp', 'hydraulic-hose-kits-for-a-fleet', 'building-a-thread-reference-board'],
  },
  'measuring-a-fitting-without-gauges': {
    related: [
      'photographing-a-hydraulic-fitting',
      'identify-any-hydraulic-fitting',
      'hydraulic-thread-size-and-pitch-reference',
    ],
  },
  'building-a-thread-reference-board': {
    related: ['bsp-or-metric-fittings', 'field-re-hosing-kit', 'hydraulic-hose-kits-for-a-fleet'],
  },
  'bridging-two-thread-standards': {
    related: ['stacking-hydraulic-adapters', 'cross-threaded-hydraulic-port', 'hydraulic-fitting-make-up-torque'],
  },

  // ── buying-hydraulic-fittings (2026-09-01 wave 2) ──────────────────────
  //
  // One market card, on the article about freight mode, where naming a real
  // lane is the point rather than decoration. Everything else links sideways.
  'what-to-send-for-a-fittings-quote': {
    related: [
      'measuring-a-fitting-without-gauges',
      'photographing-a-hydraulic-fitting',
      'what-to-send-for-a-hose-quote',
    ],
  },
  'cross-referencing-a-fitting-part-number': {
    related: [
      'how-to-cross-reference-a-hydraulic-hose',
      'identify-any-hydraulic-fitting',
      'substituting-a-fitting-safely',
    ],
  },
  'adapter-kit-for-a-mixed-fleet': {
    related: [
      'bsp-or-metric-fittings',
      'building-a-thread-reference-board',
      'hydraulic-hose-kits-for-a-fleet',
    ],
  },
  'spares-list-for-a-remote-site': {
    related: ['field-re-hosing-kit', 'hydraulic-hose-shelf-life-storage', 'adapter-kit-for-a-mixed-fleet'],
  },
  'inspecting-fittings-on-arrival': {
    related: [
      'unbranded-hydraulic-fittings',
      'verifying-a-genuine-hydraulic-hose',
      'building-a-thread-reference-board',
    ],
  },
  'plating-and-corrosion-on-fittings': {
    related: [
      'hydraulic-hose-coastal-corrosion',
      'when-stainless-is-worth-it',
      'removing-a-seized-hydraulic-fitting',
    ],
  },
  'when-stainless-is-worth-it': {
    related: ['plating-and-corrosion-on-fittings', 'offshore-hydraulic-hose', 'hydraulic-hose-wire-corrosion'],
  },
  'air-or-sea-for-a-fittings-order': {
    related: [
      'consolidating-fittings-with-a-hose-order',
      'hydraulic-hose-lead-times',
      'spares-list-for-a-remote-site',
    ],
    pages: [
      {
        kind: 'market',
        slug: 'kenya',
        label: 'Supplying Kenya from Dubai',
        blurb: 'Lane, freight modes, Incoterms and the documents that travel with a consignment.',
      },
    ],
  },
  'consolidating-fittings-with-a-hose-order': {
    related: ['air-or-sea-for-a-fittings-order', 'hydraulic-hose-kits-for-a-fleet', 'bulk-hose-refit-and-tagging'],
  },
  'substituting-a-fitting-safely': {
    related: [
      'bridging-two-thread-standards',
      'cross-referencing-a-fitting-part-number',
      'stacking-hydraulic-adapters',
    ],
  },

  // ── hydraulic-fittings-by-industry (2026-09-01 wave 3) ─────────────────
  //
  // This is the wave the market-card budget was raised for. Eight of the ten
  // carry a card because eight of them genuinely are about a place — the lane,
  // the resupply distance and the fleet mix are the article's subject, not
  // decoration. The quarry and drilling-rig pieces carry none: a crusher is a
  // crusher anywhere, and the generated reach section covers the geography.
  'copper-mine-hydraulic-fittings': {
    related: ['quarry-and-crusher-fittings', 'gold-plant-hydraulic-fittings', 'adapter-kit-for-a-mixed-fleet'],
    pages: [
      {
        kind: 'market',
        slug: 'zambia',
        label: 'Supplying Zambia from Dubai',
        blurb: 'The lane to the Copperbelt: freight, transit and the documents that travel with it.',
      },
    ],
  },
  'gold-plant-hydraulic-fittings': {
    related: ['copper-mine-hydraulic-fittings', 'when-stainless-is-worth-it', 'plating-and-corrosion-on-fittings'],
    pages: [
      {
        kind: 'market',
        slug: 'ghana',
        label: 'Supplying Ghana from Dubai',
        blurb: 'Freight, transit and documentation on the Ghanaian lane.',
      },
    ],
  },
  'oilfield-fittings-in-west-africa': {
    related: ['oilfield-hose-document-pack', 'api-7k-16c-16d-which-standard', 'vendor-approval-for-hose-supply'],
    pages: [
      {
        kind: 'market',
        slug: 'nigeria',
        label: 'Supplying Nigeria from Dubai',
        blurb: 'Form M, SONCAP and PAAR — the sequence that has to happen before the vessel sails.',
      },
    ],
  },
  'agriculture-and-construction-fittings': {
    related: ['tractor-hydraulic-fittings', 'adapter-kit-for-a-mixed-fleet', 'bsp-or-metric-fittings'],
    pages: [
      {
        kind: 'market',
        slug: 'kenya',
        label: 'Supplying Kenya from Dubai',
        blurb: 'Lane, freight modes and the documents that travel with a consignment.',
      },
    ],
  },
  'quarry-and-crusher-fittings': {
    related: [
      'bridging-two-thread-standards',
      'hydraulic-fitting-make-up-torque',
      'hydraulic-hose-abrasion-failure',
    ],
  },
  'water-well-drilling-rig-fittings': {
    related: ['field-re-hosing-kit', 'spares-list-for-a-remote-site', 'measuring-a-fitting-without-gauges'],
  },
  'port-and-terminal-fittings': {
    related: [
      'plating-and-corrosion-on-fittings',
      'when-stainless-is-worth-it',
      'port-equipment-hydraulic-hose',
    ],
    pages: [
      {
        kind: 'market',
        slug: 'south-africa',
        label: 'Supplying South Africa from Dubai',
        blurb: 'Sea and air lanes into Durban and the Gauteng inland leg.',
      },
    ],
  },
  'sugar-mill-and-agro-processing-fittings': {
    related: ['factory-and-fixed-plant-fittings', 'hydraulic-hose-shelf-life-storage', 'steam-hose-safety'],
    pages: [
      {
        kind: 'market',
        slug: 'tanzania',
        label: 'Supplying Tanzania from Dubai',
        blurb: 'The Dar es Salaam lane and the inland leg behind it.',
      },
    ],
  },
  'buying-fittings-in-south-africa': {
    related: [
      'consolidating-fittings-with-a-hose-order',
      'air-or-sea-for-a-fittings-order',
      'adapter-kit-for-a-mixed-fleet',
    ],
    pages: [
      {
        kind: 'market',
        slug: 'south-africa',
        label: 'Supplying South Africa from Dubai',
        blurb: 'What a consolidated consignment into South Africa actually involves.',
      },
    ],
  },
  'factory-and-fixed-plant-fittings': {
    related: [
      'sugar-mill-and-agro-processing-fittings',
      'injection-moulding-hydraulic-hose',
      'bsp-or-metric-fittings',
    ],
    pages: [
      {
        kind: 'market',
        slug: 'egypt',
        label: 'Supplying Egypt from Dubai',
        blurb: 'Freight and documentation on the Egyptian lane.',
      },
    ],
  },

  // ── Africa fittings wave 4 — the diagnostic cluster (2026-09-01) ───────
  //
  // One market card in the wave, on the article that is genuinely about a long
  // sea lane. Everything else is a condition rather than a place, so the
  // generated reach section carries the geography. 17 of 18 after this.
  'reading-a-weeping-joint': {
    related: [
      'new-hydraulic-hose-weeping',
      'over-tightened-fitting-diagnosis',
      'sealant-on-hydraulic-threads',
    ],
  },
  'over-tightened-fitting-diagnosis': {
    related: [
      'hydraulic-fitting-make-up-torque',
      'cross-threaded-hydraulic-port',
      'damaged-port-repair-or-scrap',
    ],
  },
  'why-fittings-seize-in-coastal-air': {
    related: [
      'removing-a-seized-hydraulic-fitting',
      'plating-and-corrosion-on-fittings',
      'galvanic-corrosion-in-fittings',
    ],
  },
  'damaged-port-repair-or-scrap': {
    related: [
      'cross-threaded-hydraulic-port',
      'over-tightened-fitting-diagnosis',
      'bridging-two-thread-standards',
    ],
  },
  'sealant-on-hydraulic-threads': {
    related: [
      'stopping-an-npt-thread-leak',
      'jic-vs-orfs-vs-npt-vs-bsp',
      'reading-a-weeping-joint',
    ],
  },
  'galvanic-corrosion-in-fittings': {
    related: [
      'when-stainless-is-worth-it',
      'plating-and-corrosion-on-fittings',
      'why-fittings-seize-in-coastal-air',
    ],
  },
  'dirt-ingress-in-transit-and-storage': {
    related: [
      'contamination-during-a-hose-change',
      'storing-fittings-and-seals-on-site',
      'air-or-sea-for-a-fittings-order',
    ],
    pages: [
      {
        kind: 'market',
        slug: 'nigeria',
        label: 'Supplying Nigeria from Dubai',
        blurb: 'The longest lane we run — weeks at sea, and what that does to an uncapped part.',
      },
    ],
  },
  'storing-fittings-and-seals-on-site': {
    related: [
      'hydraulic-hose-shelf-life-storage',
      'spares-list-for-a-remote-site',
      'dirt-ingress-in-transit-and-storage',
    ],
  },
  'reusing-fittings-in-a-rebuild': {
    related: [
      'inspecting-fittings-on-arrival',
      'substituting-a-fitting-safely',
      'bspp-bonded-seal-sizing',
    ],
  },
  'crimping-on-site-or-adapting': {
    related: [
      'should-you-buy-a-hose-crimper',
      'bridging-two-thread-standards',
      'field-re-hosing-kit',
    ],
  },
}
