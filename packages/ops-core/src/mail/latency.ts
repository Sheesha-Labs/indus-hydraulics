/**
 * Pipeline latency (S05-T09): seconds from a message's arrival to its first Indus label (#3), over the last
 * 200 live messages. Nearest-rank percentiles on whole seconds; the alert line is 180 s at p95.
 */
export const LATENCY_WINDOW = 200
export const LATENCY_ALERT_P95_S = 180

export function percentile(sorted: readonly number[], p: number): number | null {
  if (sorted.length === 0) return null
  const rank = Math.ceil((p / 100) * sorted.length)
  return sorted[Math.min(sorted.length, Math.max(1, rank)) - 1]!
}

export function latencyStats(samplesSeconds: readonly number[]): {
  p50: number | null
  p95: number | null
  count: number
} {
  const s = samplesSeconds
    .filter((x) => Number.isFinite(x) && x >= 0)
    .map((x) => Math.round(x))
    .sort((a, b) => a - b)
  return { p50: percentile(s, 50), p95: percentile(s, 95), count: s.length }
}

/** Alert only when the window is full enough to mean something and p95 is over the line. */
export function latencyBreached(
  stats: { p95: number | null; count: number },
  minSamples = 20
): boolean {
  return stats.count >= minSamples && (stats.p95 ?? 0) > LATENCY_ALERT_P95_S
}
