import { describe, expect, it } from 'vitest'
import { landingNext, resolveLanding } from './landing'

const owner = { role: 'owner' as const, welcomeSeen: false, setupDone: false }

describe('resolveLanding', () => {
  it.each([
    [{ ...owner }, '/welcome'],
    [{ ...owner, welcomeSeen: true }, '/today'],
    [{ ...owner, setupDone: true }, '/today'],
    [{ ...owner, role: 'helper' as const }, '/today'],
    [{ ...owner, role: 'helper' as const, welcomeSeen: false, setupDone: false }, '/today'],
    [{ ...owner, next: '/enquiries?view=open' }, '/enquiries?view=open'],
    [
      { ...owner, role: 'helper' as const, next: '/settings/team#devices' },
      '/settings/team#devices',
    ],
    [{ ...owner, next: '//evil.example' }, '/welcome'],
    [{ ...owner, next: 'https://evil.example' }, '/welcome'],
    [{ ...owner, next: '/\\evil.example' }, '/welcome'],
    [{ ...owner, welcomeSeen: true, next: '/sign-in' }, '/today'],
    [{ ...owner, welcomeSeen: true, next: '/sign-in/two-factor?next=/x' }, '/today'],
    [{ ...owner, welcomeSeen: true, next: '/api/auth/signout' }, '/today'],
    [{ ...owner, welcomeSeen: true, next: '/sign-inside' }, '/sign-inside'],
    [{ ...owner, welcomeSeen: true, next: '' }, '/today'],
    [{ ...owner, welcomeSeen: true, next: null }, '/today'],
  ])('%j → %s', (input, expected) => {
    expect(resolveLanding(input)).toBe(expected)
  })

  it('landingNext keeps query and hash, refuses auth pages', () => {
    expect(landingNext('/today?x=1#y')).toBe('/today?x=1#y')
    expect(landingNext('/sign-in?error=locked')).toBeNull()
  })
})
