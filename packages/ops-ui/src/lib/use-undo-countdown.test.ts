import { describe, expect, it } from 'vitest'
import { formatUndo, nextTickDelay } from './use-undo-countdown'

describe('formatUndo', () => {
  it.each([
    [300000, '5:00'],
    [299000, '4:59'],
    [298001, '4:59'],
    [298000, '4:58'],
    [61000, '1:01'],
    [60000, '1:00'],
    [999, '0:01'],
    [1, '0:01'],
    [0, '0:00'],
    [-50, '0:00'],
  ])('%i ms → %s (rounds up, never 0:00 while undo works)', (ms, label) => {
    expect(formatUndo(ms)).toBe(label)
  })
})

describe('nextTickDelay', () => {
  it.each([
    [299000, 1000],
    [298500, 500],
    [1, 1],
    [1500, 500],
  ])('%i ms left → next label change in %i ms', (ms, delay) => {
    expect(nextTickDelay(ms)).toBe(delay)
  })
})
