import { describe, expect, it } from 'vitest'
import { assertStable, buildSystem, UnstableSystemPromptError } from './cache-layout'

describe('cache layout', () => {
  it('puts a 1-hour cache breakpoint on the last stable block only', () => {
    const blocks = buildSystem([
      { id: 'rules', text: 'You classify business email.' },
      { id: 'labels', text: 'Labels: enquiry, quote, other.' },
    ])
    expect(blocks).toEqual([
      { type: 'text', text: 'You classify business email.' },
      {
        type: 'text',
        text: 'Labels: enquiry, quote, other.',
        cache_control: { type: 'ephemeral', ttl: '1h' },
      },
    ])
  })

  it('is byte-stable: the same parts give the same blocks', () => {
    const parts = [{ id: 'a', text: 'Stable text.' }]
    expect(JSON.stringify(buildSystem(parts))).toBe(JSON.stringify(buildSystem(parts)))
  })

  it('refuses timestamps and uuids in system text', () => {
    expect(() => assertStable({ id: 'x', text: 'Today is 2026-11-24T09:00:00Z.' })).toThrow(
      UnstableSystemPromptError
    )
    expect(() =>
      assertStable({ id: 'x', text: 'Message 01937a5e-0000-7000-8000-000000000001' })
    ).toThrow(UnstableSystemPromptError)
    // a plain date or a version number is fine
    expect(() => assertStable({ id: 'x', text: 'Rules as of 2026-11. Version 1.' })).not.toThrow()
    expect(() => buildSystem([])).toThrow(RangeError)
  })
})
