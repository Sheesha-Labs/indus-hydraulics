// `@indus/ops-ui`: the whole kit in one barrel, grouped by kit in L1 sheet order (S01-T10). The app imports
// the per-kit entry points (`@indus/ops-ui/controls`, …), which keep a server page from pulling in every
// client part; this barrel is for tooling, tests and the export-coverage check (index.test.ts).
// The Shell kit and templates land in S02.
export const OPS_UI = '@indus/ops-ui' as const

// Shared foundations: types (05 §3.0), display formatting, the status tone map and class merging.
export type * from './types'
export * from './format'
export * from './status'
export { cn } from './lib/cn'

// K-01 … K-12
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
