import { describe, expect, it } from 'vitest'
import {
  codeAt,
  formatManualKey,
  isCodeShaped,
  matchStep,
  newTotpSecret,
  normaliseCode,
  otpauthUri,
} from './totp-core'

const SECRET = newTotpSecret()
// A fixed instant in the middle of a 30-second step.
const T = 1_790_000_015
const STEP = Math.floor(T / 30)

describe('TOTP (RFC 6238, SHA-1, 6 digits, 30 s)', () => {
  it('accepts the current code and returns its step', () => {
    expect(matchStep(SECRET, codeAt(SECRET, T), { epochSeconds: T })).toBe(STEP)
  })

  it('accepts one step either side and nothing further', () => {
    expect(matchStep(SECRET, codeAt(SECRET, T - 30), { epochSeconds: T })).toBe(STEP - 1)
    expect(matchStep(SECRET, codeAt(SECRET, T + 30), { epochSeconds: T })).toBe(STEP + 1)
    expect(matchStep(SECRET, codeAt(SECRET, T - 60), { epochSeconds: T })).toBeNull()
    expect(matchStep(SECRET, codeAt(SECRET, T + 60), { epochSeconds: T })).toBeNull()
  })

  it('refuses a step at or below the last accepted one (replay pre-check)', () => {
    const code = codeAt(SECRET, T)
    expect(matchStep(SECRET, code, { epochSeconds: T, afterStep: STEP })).toBeNull()
    expect(matchStep(SECRET, code, { epochSeconds: T, afterStep: STEP - 1 })).toBe(STEP)
  })

  it('refuses a wrong code and anything not six digits', () => {
    const right = codeAt(SECRET, T)
    const wrong = String((Number(right) + 1) % 1_000_000).padStart(6, '0')
    expect(matchStep(SECRET, wrong, { epochSeconds: T })).toBeNull()
    for (const bad of ['', '12345', '1234567', 'abcdef', '12 345']) {
      expect(isCodeShaped(bad)).toBe(false)
      expect(matchStep(SECRET, bad, { epochSeconds: T })).toBeNull()
    }
  })

  it('normalises typed spaces and dashes; formats the manual key in fours', () => {
    expect(normaliseCode(' 123 456 ')).toBe('123456')
    expect(normaliseCode('123-456')).toBe('123456')
    expect(formatManualKey('ABCDEFGHIJKL')).toBe('ABCD EFGH IJKL')
  })

  it('labels the authenticator entry Indus Operations', () => {
    const uri = otpauthUri('owner@example.test', SECRET)
    expect(uri.startsWith('otpauth://totp/')).toBe(true)
    expect(uri).toContain('issuer=Indus%20Operations')
    expect(uri).toContain(`secret=${SECRET}`)
  })
})
