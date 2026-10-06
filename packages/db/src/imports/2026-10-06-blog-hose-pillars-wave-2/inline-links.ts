/**
 * In-text catalogue links for wave 2 — applied by `run.ts` before import.
 * See ../2026-10-06-blog-industrial-hose-wave-1/inline-links.ts for the rules.
 */
import type { InlineLink } from '../2026-10-06-blog-inline-links/plans'

const p = (slug: string) => `/p/${slug}`
const c = (slug: string) => `/c/${slug}`

export const WAVE_INLINE_LINKS: Record<string, InlineLink[]> = {
  'hydraulic-hose-guide': [
    { phrase: 'our 2SN', href: p('r2-2sn-double-wire-braid-hydraulic-hose') },
    { phrase: 'R13', href: p('r13-multi-spiral-very-high-pressure-hose') },
    { phrase: 'compact 2SC', href: p('2sc-compact-two-wire-braid-hose') },
    { phrase: 'thermoplastic R7 and R8', href: c('thermoplastic-hoses') },
    { phrase: 'R14 PTFE', href: p('r14-ptfe-hydraulic-hose') },
    { phrase: 'skive or interlock ferrules', href: c('crimp-ferrules') },
  ],
  'hydraulic-fittings-guide': [
    { phrase: 'hose fitting', href: c('hydraulic-fittings') },
    { phrase: 'adapter', href: c('hydraulic-adapters') },
    { phrase: 'JIC', href: c('jic-37-hose-fittings') },
    { phrase: 'ORFS', href: c('orfs-hose-fittings') },
    { phrase: 'BSP parallel', href: c('bsp-hose-fittings') },
  ],
  'hydraulic-hose-assembly-guide': [
    { phrase: 'braided-hose crimp fittings', href: c('braided-hose-crimp-fittings') },
    { phrase: 'spiral-hose crimp fittings', href: c('spiral-hose-crimp-fittings') },
    { phrase: 'skive interlock ferrules for 4SH', href: p('skive-interlock-crimp-ferrule-for-4sh-hose') },
    { phrase: 'double-skive ferrule for R13', href: p('double-skive-crimp-ferrule-for-r13-hose') },
  ],
  'braided-vs-spiral-hose-fittings': [
    { phrase: 'skive interlock ferrule for 4SH', href: p('skive-interlock-crimp-ferrule-for-4sh-hose') },
    { phrase: 'DIN 20023 skive ferrule', href: p('skive-crimp-ferrule-din-20023-for-4sh-r12-32-hose') },
    { phrase: 'double-skive ferrule for R13', href: p('double-skive-crimp-ferrule-for-r13-hose') },
    { phrase: 'Compact 1SC and 2SC', href: p('2sc-compact-two-wire-braid-hose') },
  ],
  'npt-npsm-and-sae-hose-fittings': [
    { phrase: 'NPT male adapter', href: c('npt-adapters') },
    { phrase: 'JIC', href: c('jic-37-hose-fittings') },
    { phrase: 'braided and spiral crimp ranges', href: c('braided-hose-crimp-fittings') },
    { phrase: 'double-hexagonal NPSM swivel female', href: p('double-hexagonal-npsm-swivel-female-cone-60') },
  ],
  'ss316l-hydraulic-fittings': [
    { phrase: 'flanges, counter-flanges and split flanges for hose', href: c('ss316l-sae-flanges-for-hoses') },
  ],
  'oilfield-hose-guide': [
    { phrase: 'mud booster hose', href: p('mud-booster-hose') },
    { phrase: 'Fireshield 5000 BOP control hose', href: p('blowout-preventer-control-hose-fireshield-5000') },
    { phrase: 'Megashield 5000 assemblies', href: p('hose-megashield-5000-hose-assemblies') },
    { phrase: 'subsea LMRP hoses', href: p('subsea-lmrp-hoses-for-choke-kill-and-hydraulic-conduit-application') },
    { phrase: 'Flameshield low-pressure hose', href: p('low-pressure-oilfield-hose-flameshield') },
  ],
  'well-service-and-stimulation-hose': [
    { phrase: 'frac water couplings', href: p('frac-water-coupling') },
    { phrase: 'three-segment clamps', href: p('3-segment-clamp-for-frac-water-couplings') },
    { phrase: 'hammer unions', href: c('hammer-union-suppliers-uae') },
    { phrase: 'ring gaskets', href: c('ring-joint-gaskets') },
  ],
  'riser-tensioner-and-compensator-hose': [
    { phrase: 'API 7K rotary hose', href: c('drilling-hoses') },
  ],
}
