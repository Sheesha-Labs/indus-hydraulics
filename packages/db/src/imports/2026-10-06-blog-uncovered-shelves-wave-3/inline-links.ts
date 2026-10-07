/**
 * In-text catalogue links for wave 3 — applied by `run.ts` before import.
 * See ../2026-10-06-blog-industrial-hose-wave-1/inline-links.ts for the rules.
 *
 * Mostly products the article names in its prose but does not embed, so the
 * wave widens the set of products featured in a post rather than linking the
 * same SKUs twice.
 */
import type { InlineLink } from '../2026-10-06-blog-inline-links/plans'

const p = (slug: string) => `/p/${slug}`
const c = (slug: string) => `/c/${slug}`

export const WAVE_INLINE_LINKS: Record<string, InlineLink[]> = {
  'molykote-lubricant-types-explained': [
    { phrase: 'HP-670', href: p('molykote-hp-670-grease') },
    { phrase: 'Molykote 41', href: p('molykote-41-extreme-high-temperature-bearing-grease') },
    { phrase: '1122 chain and open-air grease', href: p('molykote-1122-chain-and-open-air-grease') },
    { phrase: 'G-Rapid Plus', href: p('molykote-g-rapid-plus-paste-1kg') },
    { phrase: 'Molykote 1000', href: p('molykote-1000') },
    { phrase: 'HSC Plus', href: p('molykote-hsc-plus-paste') },
    { phrase: 'D-708', href: p('molykote-d-708-anti-friction-coating') },
    { phrase: 'Molykote 4', href: p('molykote-4-electrical-insulating-compound') },
    { phrase: '3099 HVIC', href: p('molykote-3099-hvic-high-voltage-insulator-coating-compound') },
    { phrase: 'L-8030', href: p('molykote-l-8030-lubricant') },
    { phrase: '211 Fluid 15,000 cSt', href: p('molykote-211-fluid-15-000-cst') },
  ],
  'anti-seize-and-assembly-pastes': [
    { phrase: 'Molykote 41', href: p('molykote-41-extreme-high-temperature-bearing-grease') },
    { phrase: 'HTP', href: p('molykote-htp-paste') },
    { phrase: 'D Paste', href: p('molykote-d-paste') },
    { phrase: 'E Paste', href: p('molykote-e-paste') },
  ],
  'anti-friction-coatings-explained': [
    { phrase: 'D-7708', href: p('molykote-d-7708-anti-friction-coating') },
    { phrase: 'Molykote 7415', href: p('molykote-7415-thinner') },
  ],
  'grease-selection-base-oil-thickener-nlgi': [
    { phrase: 'G-1502 FM', href: p('molykote-g-1502-fm-synthetic-bearing-and-gear-grease') },
    { phrase: 'G-0062 FM', href: p('molykote-g-0062-fm-white-multipurpose-grease') },
    { phrase: 'BG-555', href: p('molykote-bg-555-low-noise-grease') },
    { phrase: 'EM-50L', href: p('molykote-em-50l-grease') },
    { phrase: 'EM-D110', href: p('molykote-em-d110-grease') },
    { phrase: '1122 chain and open-air grease', href: p('molykote-1122-chain-and-open-air-grease') },
    { phrase: 'G-0060 FM', href: p('molykote-g-0060-fm-white-multipurpose-grease') },
    { phrase: '3451', href: p('molykote-3451-chemical-resistant-bearing-grease') },
    { phrase: '3452', href: p('molykote-3452-chemical-resistant-valve-grease') },
  ],
  'hammer-union-figure-numbers': [
    { phrase: 'Figure 400', href: p('hammer-union-set-400-series-npt-npt-4-000-psi-standard-service') },
    { phrase: 'Figure 207', href: p('hammer-union-set-207-series-with-tappable-end-cap-2-000-psi-standard-service') },
    { phrase: 'Figure 211', href: p('hammer-union-set-211-series-npt-npt-2-000-psi-standard-service') },
    { phrase: 'Figure 1003', href: p('figure-1003-misaligning-hammer-union-standard-service') },
    { phrase: 'Figure 1004', href: p('hammer-union-set-1004-series-butt-weld-schedule-xxh-10-000-psi-standard-service') },
  ],
  'ring-joint-gaskets-r-rx-bx': [
    { phrase: 'BX-163', href: p('bx-163-ring-joint-gasket') },
    { phrase: 'BX-165', href: p('bx-165-ring-joint-gasket') },
  ],
  'flow-iron-explained': [
    { phrase: 'relief valves', href: c('oilfield-pressure-relief-valves') },
    { phrase: '206 sour pup joint', href: p('pup-joint-206-series-f-m-bw-xh-det-2-000-psi-sour-service') },
    { phrase: 'double-end (DET) designs', href: p('pup-joint-1502-npst-det-threaded-threaded-15-000-psi-standard-service') },
    { phrase: 'Style 100', href: p('swivel-joint-1502-style-100-3-axis-heavy-duty-15-000-psi-standard-service') },
    { phrase: 'Style 40 reel swivel', href: p('reel-swivel-1502-style-40-2-axis-reel-15-000-psi-standard-service') },
    { phrase: 'Adapter flanges', href: p('adapter-flange-api-6bx-10k-1502-female-weco-standard-service') },
    { phrase: 'double flange adapter', href: p('double-flange-adapter-2500-rtj-1502-weco-sour-service') },
    { phrase: 'diverter manifolds', href: p('diverter-manifold-1502-series-15-000-psi-standard-service') },
    { phrase: 'multi-well manifolds', href: p('multi-well-manifold-8-well-1502-series-15-000-psi-standard-service') },
  ],
  'api-6a-nameplate-markings': [
    { phrase: 'worm-gear operator', href: c('oilfield-valve-accessories') },
    { phrase: 'R-35', href: p('r-35-ring-joint-gasket') },
    { phrase: 'R-39', href: p('r-39-ring-joint-gasket') },
    { phrase: 'RX-39', href: p('rx-39-ring-joint-gasket') },
    { phrase: 'BX-169', href: p('bx-169-ring-joint-gasket') },
  ],
  'wellhead-components-explained': [
    { phrase: '2-9/16" at 5,000 psi', href: p('christmas-tree-api-6b-5k-conventional-standard-service') },
    { phrase: '10,000 psi sour tree', href: p('christmas-tree-api-6bx-10k-conventional-sour-service') },
    { phrase: 'subsea tree', href: p('surface-test-tree-subsea-api-6bx-15k-standard-service') },
  ],
  'mud-gate-valve-repair-kits': [
    { phrase: '2171112-01', href: p('demco-dm-7500-gate-valve-gate-3-inch') },
    { phrase: '1931-002', href: p('demco-dm-gate-valve-stem-2-inch') },
    { phrase: '2171108-01', href: p('demco-dm-7500-gate-valve-gate-5-inch') },
  ],
  'lubricated-vs-non-lubricated-plug-valves': [
    { phrase: '2" × 1" reduced port', href: p('plug-valve-lubricated-lt-manual-2-in-1-in-1502-m-f-reducing-15-000-psi-standard-service') },
    { phrase: '2" Class 900 at 2,220 psi', href: p('plug-valve-non-lubricated-te-manual-2-in-900-rf-2-220-psi-sour-service') },
  ],
  'oilfield-check-valves-explained': [
    { phrase: 'dart check', href: p('dart-check-valve-compact-2-in-1502-f-m-15-000-psi-standard-service') },
    { phrase: 'swing check', href: p('swing-check-valve-in-line-3-in-1502-f-m-15-000-psi-standard-service') },
    { phrase: '3" Class 150 at 285 psi', href: p('swing-check-valve-tee-body-3-in-150-rf-285-psi-sour-service') },
    { phrase: 'Model G', href: p('drill-pipe-float-valve-size-3-1-2-if') },
  ],
  'positive-vs-adjustable-chokes': [
    { phrase: 'instrumentation valves', href: c('oilfield-instrumentation-valves') },
    { phrase: '10,000 psi sour', href: p('choke-manifold-single-stage-1502-10-000-psi-sour-service') },
    { phrase: '602 ends at 6,000 psi sour', href: p('choke-manifold-single-stage-602-6-000-psi-sour-service') },
  ],
  'ram-vs-annular-bop': [
    { phrase: 'drilling spools', href: c('bop-spools-adapters') },
    { phrase: 'GX style', href: p('subsea-annular-bop-hydril-gx-style-18-3-4-10-000-psi-wp-sour-service-nace-mr0175') },
    { phrase: 'subsea preventer', href: p('subsea-ram-bop-cameron-tl-style-18-3-4-15-000-psi-wp-triple-cavity-sour-service-nace-mr0175') },
    { phrase: 'quadruple snubbing', href: p('snubbing-bop-stack-7-1-16-10-000-psi-wp-with-stripper-rams-sour-service-nace-mr0175') },
    { phrase: 'coiled-tubing stacks', href: p('coiled-tubing-quad-bop-5-1-8-10-000-psi-wp-sour-service-nace-mr0175') },
    { phrase: 'spherical styles', href: p('annular-packing-element-shaffer-spherical-style-13-5-8-10k-hnbr-sour-service-nace-mr0175') },
    { phrase: 'new ring gaskets', href: p('api-6a-bx-ring-gasket-set-bx-152-bx-154-bx-155-bx-158-bx-160-bx-169-inconel-625-clad-sour-service') },
    { phrase: 'five-year kit', href: p('koomey-5-year-soft-goods-kit-spm-seals-diaphragms-bladders-pilot-hose-set-api-16d') },
  ],
  'demco-butterfly-valve-part-numbers': [
    { phrase: 'Sanitary NE-I', href: p('demco-series-ne-i-sanitary-butterfly-valve-fda-2-12') },
  ],
  'ball-valve-pressure-ratings-cwp-wog': [
    { phrase: 'globe valve', href: c('oilfield-globe-valves') },
    { phrase: 'Schedule 160 butt-weld ends', href: p('floating-ball-valve-2-in-butt-weld-schedule-160-5-000-psi-sour-service') },
    { phrase: '4" 1502 valves', href: p('trunnion-ball-valve-4-in-1502-f-m-10-000-psi-sour-service') },
    { phrase: 'BSP parallel threads', href: p('high-pressure-hydraulic-ball-valve-1-1-4-inch') },
  ],
  'types-of-marine-fenders': [
    { phrase: 'Arch fenders', href: p('arch-fender') },
    { phrase: 'element fenders', href: p('leg-fender-element-fender') },
  ],
  'types-of-marine-anchors': [
    { phrase: 'Plough (CQR)', href: p('galvanized-plough-cqr-anchor') },
    { phrase: 'Delta anchors', href: p('stainless-steel-delta-anchor-dt-type') },
    { phrase: 'four-prong stainless anchors', href: p('stainless-steel-four-prong-grapnel-anchor') },
  ],
  'anchor-chain-grades-u1-u2-u3': [
    { phrase: 'Studless chain', href: p('studless-anchor-chain-grades-u1-u2-and-u3') },
    { phrase: 'Kenter shackle', href: p('kenter-shackle-grades-u2-and-u3') },
  ],
  'types-of-mooring-bollards': [
    { phrase: 'twin horn bollards', href: p('twin-horn-bollard') },
    { phrase: 'rope cleats', href: p('stainless-steel-rope-cleat') },
    { phrase: 'blue water cleats', href: p('stainless-steel-mooring-cleat-blue-water-cleat-deck-hardware') },
    { phrase: 'straight chocks', href: p('stainless-steel-straight-chock') },
    { phrase: 'bow rollers', href: p('stainless-steel-bow-roller') },
  ],
  'fibre-rope-materials-compared': [
    { phrase: 'polypropylene from 4 mm to 30 mm', href: p('polypropylene-twisted-rope') },
    { phrase: 'polyethylene from 6 mm to 20 mm', href: p('polyethylene-twisted-rope') },
    { phrase: 'coloured PE', href: p('coloured-polyethylene-rope') },
    { phrase: 'braided rope from 3 mm to 20 mm', href: p('8-strand-braided-rope') },
    { phrase: 'Sixteen-strand braid', href: p('16-strand-braided-rope') },
    { phrase: 'polypropylene multifilament', href: p('polypropylene-multifilament-rope') },
    { phrase: 'lead or chain core', href: p('combination-rope-with-lead-or-chain-core') },
  ],
  'snap-hooks-and-quick-links': [
    { phrase: 'pear-shaped spring snaps', href: p('pear-shaped-spring-snap-hook') },
    { phrase: 'oval snap hooks', href: p('oval-snap-hook-carbine-hook') },
    { phrase: 'boat snaps', href: p('stainless-steel-fixed-eye-boat-snap') },
  ],
  'chain-sling-codes-explained': [
    { phrase: 'TOF', href: p('grade-80-three-leg-chain-sling-foundry-hooks-tof') },
    { phrase: 'QOO', href: p('grade-80-four-leg-chain-sling-oblong-link-ends-qoo') },
    { phrase: 'SOF', href: p('grade-80-single-leg-chain-sling-master-link-foundry-hook-sof') },
    { phrase: 'SGG', href: p('grade-80-single-leg-chain-sling-grab-hook-both-ends-sgg') },
    { phrase: 'SFF', href: p('grade-80-single-leg-chain-sling-foundry-hook-both-ends-sff') },
    { phrase: 'SSLSL', href: p('grade-80-single-leg-chain-sling-self-locking-hook-both-ends-sslsl') },
    { phrase: '10 mm Grade 100 single leg', href: p('grade-100-single-leg-chain-sling-master-link-sling-hook-sos') },
  ],
  'vertical-vs-horizontal-plate-lifting-clamps': [
    { phrase: 'Horizontal clamps', href: p('horizontal-plate-lifting-clamp') },
  ],
}
