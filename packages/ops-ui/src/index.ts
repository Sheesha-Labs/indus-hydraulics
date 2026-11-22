// `@indus/ops-ui`: the whole kit in one barrel, grouped by kit in L1 sheet order (S01-T10). The app imports
// the per-kit entry points (`@indus/ops-ui/controls`, …), which keep a server page from pulling in every
// client part; this barrel is for tooling, tests and the export-coverage check (index.test.ts).
// The Shell kit landed in S02 (S02-T01, S02-T02); the L2 templates are exported last.
export const OPS_UI = '@indus/ops-ui' as const

// Shared foundations: types (05 §3.0), display formatting, the status tone map and class merging.
export type * from './types'
export * from './format'
export * from './status'
export { cn } from './lib/cn'

// K-00 … K-12
export * from './shell'
export * from './controls'
export * from './status/index'
export * from './table'
export * from './card'
export * from './assistant'
export * from './mail'
export * from './document'
export * from './timeline'
export * from './form'
export * from './overlay'
export * from './states'
export * from './chart'

// L2 templates (S02-T04: T1–T6; S02-T05: T7–T12, X1)
export * from './templates'
