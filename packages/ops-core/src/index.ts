// Pure domain rules for Indus Operations. No I/O, no node: imports, no React:
// only Zod and relative imports (ops-core-purity.test.ts enforces it).
export const OPS_CORE = '@indus/ops-core' as const

export * from './document'
