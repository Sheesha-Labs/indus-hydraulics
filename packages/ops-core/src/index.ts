// Pure domain rules for Indus Operations. No I/O, no node: imports, no React:
// only Zod and relative imports (ops-core-purity.test.ts enforces it).
export const OPS_CORE = '@indus/ops-core' as const

export * from './assistant'
export * from './autopilot'
export * from './calendar'
export * from './document'
export * from './mail'
export * from './money'
export * from './reference'
export * from './result'
export * from './sending'
export * from './state'
export * from './vat'
