import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('keeps a type role and a colour together', () => {
    expect(cn('text-io-body', 'text-io-ink')).toBe('text-io-body text-io-ink')
  })

  it('keeps the last of two colours, radii, shadows and sizes', () => {
    expect(cn('bg-io-card', 'bg-io-paper')).toBe('bg-io-paper')
    expect(cn('rounded-io-ctl', 'rounded-io-card')).toBe('rounded-io-card')
    expect(cn('shadow-io-e1', 'shadow-io-e3')).toBe('shadow-io-e3')
    expect(cn('h-io-btn', 'h-io-btn-sm')).toBe('h-io-btn-sm')
  })

  it('keeps the last of two type roles', () => {
    expect(cn('text-io-body', 'text-io-meta')).toBe('text-io-meta')
  })

  it('drops falsy values', () => {
    expect(cn('bg-io-card', false, undefined, null, 'text-io-ink')).toBe('bg-io-card text-io-ink')
  })
})
