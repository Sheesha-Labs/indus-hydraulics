/**
 * Zip-bomb guard (S04-T05, 08-map-integrations §1.6): an archive is expanded only when it has at most 200
 * entries, at most 100 MB expanded, and a compression ratio of at most 50. Anything else is stored as it came,
 * not expanded. Pure.
 */
export const ZIP_LIMITS = {
  maxEntries: 200,
  maxExpandedBytes: 100 * 1024 * 1024,
  maxRatio: 50,
} as const

export type ZipDecision =
  | { action: 'expand' }
  | { action: 'store_only'; reason: 'too_many_entries' | 'too_large_expanded' | 'ratio_too_high' }

export function decideZip(input: {
  entries: number
  expandedBytes: number
  compressedBytes: number
}): ZipDecision {
  if (input.entries > ZIP_LIMITS.maxEntries)
    return { action: 'store_only', reason: 'too_many_entries' }
  if (input.expandedBytes > ZIP_LIMITS.maxExpandedBytes)
    return { action: 'store_only', reason: 'too_large_expanded' }
  const ratio = input.compressedBytes > 0 ? input.expandedBytes / input.compressedBytes : Infinity
  if (input.expandedBytes > 0 && ratio > ZIP_LIMITS.maxRatio)
    return { action: 'store_only', reason: 'ratio_too_high' }
  return { action: 'expand' }
}
