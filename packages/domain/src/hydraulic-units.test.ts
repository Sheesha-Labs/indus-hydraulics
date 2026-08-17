import { describe, expect, it } from 'vitest'
import {
  convertPressure,
  dashSizeTable,
  dashToSize,
  pressureInAllUnits,
} from './hydraulic-units'

describe('convertPressure', () => {
  it('is exact for bar to MPa', () => {
    // 10 bar = 1 MPa by definition, not approximation.
    expect(convertPressure(10, 'bar', 'mpa')).toBe(1)
    expect(convertPressure(1, 'mpa', 'bar')).toBe(10)
  })

  it('matches the published psi/bar relationship', () => {
    // 1 bar ≈ 14.5038 psi.
    expect(convertPressure(1, 'bar', 'psi')).toBeCloseTo(14.5038, 4)
  })

  it('round-trips without drift', () => {
    const original = 5075
    const there = convertPressure(original, 'psi', 'bar')
    expect(convertPressure(there, 'bar', 'psi')).toBeCloseTo(original, 6)
  })

  it('is the identity when units match', () => {
    expect(convertPressure(350, 'bar', 'bar')).toBe(350)
  })

  it('returns NaN rather than a wrong number for non-finite input', () => {
    expect(Number.isNaN(convertPressure(Number.NaN, 'bar', 'psi'))).toBe(true)
    expect(Number.isNaN(convertPressure(Infinity, 'bar', 'psi'))).toBe(true)
  })

  it('converts a real four-spiral figure consistently across all three units', () => {
    const all = pressureInAllUnits(350, 'bar')
    expect(all.bar).toBe(350)
    expect(all.mpa).toBeCloseTo(35, 6)
    expect(all.psi).toBeCloseTo(5076.3, 1)
  })
})

describe('dashToSize', () => {
  it('treats the dash number as sixteenths of an inch', () => {
    expect(dashToSize(8)).toMatchObject({ inches: 0.5, inchFraction: '1/2' })
    expect(dashToSize(4)).toMatchObject({ inches: 0.25, inchFraction: '1/4' })
  })

  it('reduces to lowest terms and handles whole inches', () => {
    expect(dashToSize(16)!.inchFraction).toBe('1')
    expect(dashToSize(32)!.inchFraction).toBe('2')
  })

  it('renders mixed numbers rather than improper fractions', () => {
    expect(dashToSize(20)!.inchFraction).toBe('1-1/4')
    expect(dashToSize(24)!.inchFraction).toBe('1-1/2')
  })

  it('converts to millimetres on the exact inch definition', () => {
    expect(dashToSize(8)!.millimetres).toBeCloseTo(12.7, 6)
    expect(dashToSize(16)!.millimetres).toBeCloseTo(25.4, 6)
  })

  it('rejects nonsense rather than returning a plausible-looking size', () => {
    expect(dashToSize(0)).toBeNull()
    expect(dashToSize(-8)).toBeNull()
    expect(dashToSize(6.5)).toBeNull()
  })
})

describe('dashSizeTable', () => {
  it('covers the sizes in common use, in order', () => {
    const table = dashSizeTable()
    expect(table[0]!.dash).toBe(4)
    expect(table.at(-1)!.dash).toBe(48)
    expect(table.map((r) => r.dash)).toEqual([...table.map((r) => r.dash)].sort((a, b) => a - b))
  })
})
