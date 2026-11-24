import { describe, expect, it } from 'vitest'
import { costUsd, estimateUsd, formatUsd6, parsePrice, tokenCounts, type Price } from './cost'

const PRICES: Record<string, Price> = {
  opus: {
    inputPerM: '4.0000',
    outputPerM: '20.0000',
    cacheReadPerM: '0.2000',
    cacheWrite5mPerM: '5.0000',
    cacheWrite1hPerM: '8.0000',
    webSearchPerK: '10.0000',
  },
  sonnet: {
    inputPerM: '2.0000',
    outputPerM: '10.0000',
    cacheReadPerM: '0.1000',
    cacheWrite5mPerM: '2.5000',
    cacheWrite1hPerM: '4.0000',
    webSearchPerK: '10.0000',
  },
  haiku: {
    inputPerM: '0.1000',
    outputPerM: '0.5000',
    cacheReadPerM: '0.0100',
    cacheWrite5mPerM: '0.1250',
    cacheWrite1hPerM: '0.2000',
    webSearchPerK: '10.0000',
  },
}

describe('cost', () => {
  it('prices plain input and output per model (worked examples)', () => {
    const usage = { input_tokens: 10_000, output_tokens: 2_000 }
    // Opus 5.5: 10,000 × 4 / 1M + 2,000 × 20 / 1M = 0.04 + 0.04
    expect(costUsd(usage, PRICES.opus!)).toBe('0.080000')
    // Sonnet 5.5: 0.02 + 0.02
    expect(costUsd(usage, PRICES.sonnet!)).toBe('0.040000')
    // Haiku 5.5: 0.001 + 0.001
    expect(costUsd(usage, PRICES.haiku!)).toBe('0.002000')
  })

  it('prices cache reads, both cache write TTLs and web searches', () => {
    const usage = {
      input_tokens: 1_000,
      output_tokens: 500,
      cache_read_input_tokens: 20_000,
      cache_creation_input_tokens: 3_000,
      cache_creation: { ephemeral_5m_input_tokens: 1_000, ephemeral_1h_input_tokens: 2_000 },
      server_tool_use: { web_search_requests: 3 },
    }
    // Sonnet: in 0.002 + out 0.005 + read 0.002 + 5m 0.0025 + 1h 0.008 + 3 searches 0.03 = 0.0495
    expect(costUsd(usage, PRICES.sonnet!)).toBe('0.049500')
    expect(tokenCounts(usage)).toEqual({
      inputTokens: 1_000,
      outputTokens: 500,
      cacheReadTokens: 20_000,
      cacheWriteTokens: 3_000,
      cacheWrite1hTokens: 2_000,
      webSearches: 3,
    })
  })

  it('treats cache writes without a TTL breakdown as 5-minute writes', () => {
    const c = tokenCounts({ input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 400 })
    expect(c.cacheWriteTokens).toBe(400)
    expect(c.cacheWrite1hTokens).toBe(0)
  })

  it('rounds half-up to 6 decimals once, and never uses floats', () => {
    // 1 Haiku input token = 0.0000001 USD → rounds to 0.000000; 5 tokens = 0.0000005 → 0.000001
    expect(costUsd({ input_tokens: 1, output_tokens: 0 }, PRICES.haiku!)).toBe('0.000000')
    expect(costUsd({ input_tokens: 5, output_tokens: 0 }, PRICES.haiku!)).toBe('0.000001')
    expect(formatUsd6(12_345_678_901n)).toBe('1.234568')
  })

  it('refuses malformed prices and token counts', () => {
    expect(() => parsePrice('-1')).toThrow(RangeError)
    expect(() => parsePrice('0.00001')).toThrow(RangeError)
    expect(parsePrice('0.10')).toBe(1_000n)
    expect(() => costUsd({ input_tokens: 1.5, output_tokens: 0 }, PRICES.haiku!)).toThrow(
      RangeError
    )
  })

  it('estimates the worst case and rounds the reservation up', () => {
    // 4,000 chars ≈ 1,000 tokens × 0.1 + 1,000 max output × 0.5 per M = 0.0001 + 0.0005
    expect(estimateUsd({ chars: 4_000, maxTokens: 1_000, price: PRICES.haiku! })).toBe('0.000600')
    // a countTokens result wins over chars; searches are added
    expect(
      estimateUsd({
        chars: 1,
        inputTokens: 100_000,
        maxTokens: 0,
        price: PRICES.opus!,
        maxSearches: 5,
      })
    ).toBe('0.450000')
    // a tiny estimate never rounds to zero
    expect(estimateUsd({ chars: 4, maxTokens: 0, price: PRICES.haiku! })).toBe('0.000001')
  })
})
