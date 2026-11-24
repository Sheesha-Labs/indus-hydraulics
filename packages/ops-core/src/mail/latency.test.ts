import { describe, expect, it } from 'vitest'
import { latencyBreached, latencyStats, percentile } from './latency'

describe('pipeline latency', () => {
  it('nearest-rank percentiles on whole seconds', () => {
    expect(percentile([], 50)).toBeNull()
    expect(percentile([7], 95)).toBe(7)
    const s = Array.from({ length: 100 }, (_, i) => i + 1)
    expect(percentile(s, 50)).toBe(50)
    expect(percentile(s, 95)).toBe(95)
    expect(latencyStats([30.4, 10, 20, -1, Number.NaN, 400])).toEqual({
      p50: 20,
      p95: 400,
      count: 4,
    })
  })

  it('alerts over 180 s at p95 once there are enough samples', () => {
    expect(latencyBreached({ p95: 181, count: 20 })).toBe(true)
    expect(latencyBreached({ p95: 180, count: 200 })).toBe(false)
    expect(latencyBreached({ p95: 900, count: 5 })).toBe(false)
  })
})
