/**
 * In-text catalogue links for this wave's articles.
 *
 * Same rule as ../2026-10-06-blog-inline-links: a phrase the article already
 * uses, linked where it first appears in prose, to the deepest page that
 * answers it. Kept out of the seeds so the article copy stays readable and the
 * link set reviewable in one place; `run.ts` applies it before import, and
 * fails the run if a phrase is not found.
 */
import type { InlineLink } from '../2026-10-06-blog-inline-links/plans'

const p = (slug: string) => `/p/${slug}`
const c = (slug: string) => `/c/${slug}`

export const WAVE_INLINE_LINKS: Record<string, InlineLink[]> = {
  'bauer-couplings-explained': [
    { phrase: 'suction lines', href: c('water-suction-delivery-hoses') },
    { phrase: 'lever ring', href: p('zinc-plated-steel-lever-rings-bauer-type') },
    { phrase: 'cam and groove', href: c('cam-and-groove-couplings') },
    { phrase: 'Storz head', href: c('storz-couplings') },
  ],
  'bulk-material-and-sandblast-hose': [
    { phrase: 'bulk material suction and delivery hose', href: p('bulk-material-suction-delivey-hose-10-bar') },
    { phrase: 'MDSE chemical and abrasion PVC hose', href: p('mdse-chemical-abrasion-pvc-suction-delivery-hose') },
    { phrase: 'crowfoot', href: c('crowfoot-couplings') },
    { phrase: 'nozzle holders', href: p('aluminum-npsh-threaded-hose-end-nozzle-holders') },
  ],
  'cam-and-groove-coupling-types': [
    { phrase: 'Socket-weld halves', href: c('specialty-adapters-couplings') },
    { phrase: 'ferrules and sleeves', href: c('hose-clamps-sleeves-ferrules') },
    { phrase: 'CrimpTEK C and E halves', href: p('crimptek-type-c-female-coupler-crimp-shank-cam-and-groove-coupling') },
    { phrase: 'Self-locking couplers', href: p('self-locking-type-c-female-coupler-hose-shank-self-locking-cam-and-groove-coupling') },
    { phrase: 'Lockable dust caps', href: p('type-dcl-lockable-dust-caps-ss-brass') },
  ],
  'composite-hose-explained': [
    { phrase: 'PTFE grade', href: p('ptfe-chemical-composite-hose-20-bar') },
    { phrase: 'rubber hose', href: c('oil-chemical-purpose-hoses') },
    { phrase: 'vapour recovery grade', href: p('vapour-recovery-composite-hose-14-bar') },
    { phrase: 'cam lock C and E with spiral tails', href: p('camlock-type-c-x-spiral-tail-for-composite-hose') },
  ],
  'compressed-air-hose-selection': [
    { phrase: 'mineral oil and air hose', href: p('multi-purpose-mineral-oil-air-hose-20-bar') },
    { phrase: 'high-temperature air hose', href: p('high-temperature-air-hose-40-bar') },
    { phrase: 'universal (claw) couplings', href: c('universal-air-couplings') },
    { phrase: 'whip check cable', href: p('safety-whip-check-cable-hose-to-hose') },
  ],
  'corrugated-stainless-steel-hose': [
    { phrase: 'exotic alloy core', href: c('metallic-exotic-alloy-hoses') },
    { phrase: 'Thorburn S65 Extra Flex', href: p('thorburn-s65-extra-flex-helical-type-321-ss-with-304-ss-braid') },
    { phrase: 'Adflex', href: p('adflex-commercial-grade-metallic-hose') },
    { phrase: 'union', href: c('metallic-hose-couplings') },
  ],
  'cryogenic-transfer-hose': [
    { phrase: 'stainless steel metal hose', href: c('metallic-stainless-corrugated-hoses') },
    { phrase: 'industrial oxygen service hose', href: p('thorburn-cga96-industrial-oxygen-service-hose') },
    { phrase: 'T52 non-valved cryogenic couplings', href: p('thorburn-t52-non-valved-cryogenic-coupling-liquid-phase') },
    { phrase: 'ThermaCover cryogenic insulation cover', href: p('thorburn-thermacover-cryogenic-insulation-cover') },
  ],
  'en-14420-hose-fittings-explained': [
    { phrase: 'transfer hose', href: c('oil-chemical-purpose-hoses') },
    { phrase: 'DIN 2817', href: p('en-14420-3-din-2817-safety-clamp') },
    { phrase: 'cam and groove range', href: c('cam-and-groove-couplings') },
  ],
  'exotic-alloy-metal-hose': [
    { phrase: 'Monel hoses', href: p('thorburn-m96-monel-400-annular-single-monel-braid') },
    { phrase: 'HS95 Hastelloy', href: p('thorburn-hs95-hastelloy-c276-annular-with-ss304-braid-cost-effective') },
    { phrase: 'Witzenmann Inconel 625 HYDRA series', href: p('witzenmann-inconel-625-annular-hose-hydra-series') },
  ],
  'flanged-hose-connections': [
    { phrase: 'heavy-duty KC nipples', href: p('heavy-duty-kc-x-fixed-flange') },
    { phrase: 'composite hose tails', href: p('spiral-hose-tail-x-flange') },
    { phrase: 'blind flange', href: p('blind-flange-asme-b16-5-150-300-lbs') },
    { phrase: 'gunmetal dock flange', href: p('gunmetal-dock-flange-x-male-thread') },
    { phrase: 'ring gaskets', href: c('ring-joint-gaskets') },
  ],
  'food-hose-materials-compared': [
    { phrase: 'SANF food hose', href: p('san-hygienic-food-suction-delivey-hose-10-bar') },
    { phrase: 'A235BU hose', href: p('steam-hot-water-food-hose-7-bar') },
    { phrase: 'SANSIL hose', href: p('silicone-suction-delivery-hose') },
    { phrase: 'sanitary-style crimp ferrules', href: p('sanitary-style-crimp-ferrule') },
    { phrase: 'heavy-duty sanitary clamps', href: p('heavy-duty-single-pin-sanitary-clamp-x-serrated-wing-nut') },
  ],
  'gost-barcelona-and-geka-couplings': [
    { phrase: 'Storz', href: c('storz-couplings') },
    { phrase: 'Guillemin', href: c('guillemin-couplings') },
    { phrase: 'GOST adapters', href: p('gost-adapter-x-male-thread') },
  ],
  'ground-joint-steam-couplings': [
    { phrase: 'black saturated steam hose', href: p('black-saturated-steam-hose-10-bar') },
    { phrase: 'universal clamps', href: p('zinc-plated-iron-universal-clamps') },
    { phrase: 'EN 14420-3 / DIN 2817 safety clamp', href: p('en-14420-3-din-2817-safety-clamp') },
    { phrase: 'EN 14423', href: p('en-14423-clamp') },
  ],
  'guillemin-couplings-explained': [
    { phrase: 'Storz', href: c('storz-couplings') },
    { phrase: 'spiral hose tail', href: p('guillemin-coupling-spiral-hose-tail') },
    { phrase: 'Reducers', href: p('guillemin-adapter-reducing-type') },
  ],
  'high-pressure-metal-hose': [
    { phrase: 'Thorburn S98Z', href: p('thorburn-s98z-ultra-hp-fully-compressed-annular-type-316l-ss') },
    { phrase: 'S50HD', href: p('thorburn-s50hd-ultra-hp-compressed-helical-type-316l-ss') },
    { phrase: 'R13', href: p('r13-multi-spiral-very-high-pressure-hose') },
    { phrase: 'R15', href: p('r15-six-spiral-ultra-high-pressure-hose') },
  ],
  'industrial-hose-clamps': [
    { phrase: 'EN 14420-5 GA and GI fittings', href: c('en14420-5-fittings') },
    { phrase: 'KC nipples', href: c('kc-nipple-fittings') },
    { phrase: 'drag hose clamp', href: p('drag-hose-clamp') },
    { phrase: 'CrimpTEK cam and groove halves', href: p('crimptek-type-c-female-coupler-crimp-shank-cam-and-groove-coupling') },
  ],
  'industrial-hose-couplings-guide': [
    { phrase: 'dry disconnect', href: c('dry-disconnect-couplings') },
    { phrase: 'Ring lock couplings', href: c('ring-lock-couplings') },
    { phrase: 'EN 14423 clamp couplings', href: p('en-14423-clamp') },
  ],
  'industrial-hose-guide': [
    { phrase: 'bulk material hose', href: p('bulk-material-suction-delivey-hose-10-bar') },
    { phrase: 'oil suction and delivery hoses', href: c('oil-chemical-purpose-hoses') },
    { phrase: 'PVC suction hose', href: c('water-suction-delivery-hoses') },
    { phrase: 'cam and groove halves', href: c('cam-and-groove-couplings') },
  ],
  'industrial-hose-safety-factors': [
    { phrase: 'steam and hot water hose', href: p('steam-hot-water-food-hose-7-bar') },
    { phrase: '2SN hose', href: p('r2-2sn-double-wire-braid-hydraulic-hose') },
    { phrase: 'choke and kill lines', href: c('well-control-hoses') },
    { phrase: 'cam and groove coupling', href: c('cam-and-groove-couplings') },
  ],
  'kc-nipples-and-shank-couplings': [
    { phrase: 'interlocking', href: p('interlocking-clamp') },
    { phrase: 'crimped sleeve', href: p('sleeve-for-kc-and-camlock') },
    { phrase: 'Pin-lug couplings', href: c('pin-lug-shank-couplings') },
    { phrase: 'brass menders', href: p('brass-hose-menders') },
  ],
  'metal-hose-guide': [
    { phrase: 'Senior Flexonics Bartlett fire-safe assembly', href: p('senior-flexonics-bartlett-fire-safe-hose-assembly') },
    { phrase: 'fire jackets', href: p('thorburn-fj72-fry-sil-fire-jacket') },
    { phrase: 'ball-joint armour guards', href: p('thorburn-af-series-ball-joint-armor-flex-hose-guard-304-ss') },
    { phrase: 'O-seal pipe unions', href: p('thorburn-uo-o-seal-never-leak-pipe-union-small-bore-1-2-in-to-2-in') },
  ],
  'oil-suction-and-discharge-hose': [
    { phrase: 'UHMWPE hose', href: p('uhmwpe-chemical-suction-delivery-hose-16-bar') },
    { phrase: 'mineral oil hose', href: p('multi-purpose-mineral-oil-hose-10-bar') },
    { phrase: 'cam and groove halves', href: c('cam-and-groove-couplings') },
    { phrase: 'Hammer unions', href: c('hammer-union-suppliers-uae') },
  ],
  'ptfe-hose-explained': [
    { phrase: 'smoothbore', href: p('ptfe-smoothbore-hose-with-stainless-steel-braid') },
    { phrase: 'convoluted', href: p('convoluted-ptfe-hose-with-stainless-steel-braid') },
    { phrase: 'R14', href: p('r14-ptfe-hydraulic-hose') },
    { phrase: 'PTFE chemical composite hose', href: p('ptfe-chemical-composite-hose-20-bar') },
  ],
  'pvc-or-rubber-suction-hose': [
    { phrase: 'medium-duty PVC', href: p('medium-duty-pvc-suction-delivery-hose') },
    { phrase: 'food and bulk PVC', href: p('food-bulk-pvc-suction-delivery-hose') },
    { phrase: 'PVC oil hose', href: p('pvc-oil-suction-delivery-hose') },
    { phrase: 'cam and groove', href: c('cam-and-groove-couplings') },
  ],
  'reading-an-industrial-hose-layline': [
    { phrase: 'mandrel-built air hose', href: p('black-mandrel-built-air-water-hose-20-bar') },
    { phrase: 'anti-static air hose', href: p('anti-static-air-water-hose-20-bar') },
    { phrase: 'vapour recovery composite', href: p('vapour-recovery-composite-hose-14-bar') },
  ],
  'storz-coupling-sizes': [
    { phrase: 'Reducers', href: p('reduce-type') },
    { phrase: '3-segment clamp', href: p('3-segment-clamp-for-storz') },
    { phrase: 'fire department connection', href: p('storz-fdc-ul-listed-painted') },
    { phrase: 'safety latch', href: p('storz-coupling-with-safety-latch') },
  ],
  'tanker-loading-and-vapour-recovery-hose': [
    { phrase: 'composite fittings', href: c('composite-hose-fittings') },
    { phrase: 'Met-O-Seal tanker couplings', href: p('thorburn-mts4-met-o-seal-tanker-coupling-heavy-duty') },
    { phrase: 'T92H dry-break quick coupling', href: p('thorburn-t92h-dry-break-quick-coupling') },
  ],
  'uhmwpe-chemical-hose': [
    { phrase: 'smoothbore PTFE hose', href: p('ptfe-smoothbore-hose-with-stainless-steel-braid') },
    { phrase: 'cam and groove halves', href: c('cam-and-groove-couplings') },
    { phrase: 'EN 14420-5 fittings', href: c('en14420-5-fittings') },
    { phrase: 'DIN 2817 safety clamp', href: p('en-14420-3-din-2817-safety-clamp') },
  ],
  'universal-air-couplings-explained': [
    { phrase: 'NBR washer', href: p('universal-coupling-washer-nbr') },
    { phrase: 'zinc-plated iron four-lug hose ends', href: p('zinc-plated-iron-four-lug-hose-end-crowfoot-couplings') },
    { phrase: 'safety whip checks', href: p('safety-whip-check-cable-hose-to-tool') },
  ],
}
