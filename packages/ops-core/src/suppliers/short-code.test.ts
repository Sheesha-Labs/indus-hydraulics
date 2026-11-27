import { describe, expect, it } from 'vitest'
import { supplierShortCode } from './short-code'

describe('supplierShortCode', () => {
  it.each([
    ['Example Valve Co', 'EXA'],
    ['The Sample Works Ltd', 'SAM'],
    ['Al Sample Trading LLC', 'SAM'],
    ['Émile Industrie', 'EMI'],
    ['3M', 'M'],
    ['', '—'],
    ['---', '—'],
  ])('%s → %s', (name, code) => expect(supplierShortCode(name)).toBe(code))
})
