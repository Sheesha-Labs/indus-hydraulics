import 'server-only'

// The Assistant's model layer (ADR-08): registry, structured calls, prompt caching and budget reservation.
// Server-only; never imports @indus/ops-db (the app injects an AiLedger).
export const OPS_AI = '@indus/ops-ai' as const

export * from './budget'
export * from './cache-layout'
export * from './client'
export * from './cost'
export * from './errors'
export * from './ledger'
export * from './models'
export * from './structured-call'
export * from './batches'
export * from './api-schema'
