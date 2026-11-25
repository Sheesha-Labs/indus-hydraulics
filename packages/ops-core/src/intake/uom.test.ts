import { describe, expect, it } from 'vitest'
import { normaliseUom, unitCounts, type UomTable } from './uom'

const table: UomTable = {
  codes: new Set(['EA', 'M', 'SET']),
  aliases: new Map([
    ['NOS', 'EA'],
    ['PCS', 'EA'],
    ['MTR', 'M'],
  ]),
}

describe('normaliseUom', () => {
  it.each<[string | null, boolean, string | null, string]>([
    ['EA', false, 'EA', 'exact'],
    ['nos.', false, 'EA', 'alias'],
    [' Pcs ', false, 'EA', 'alias'],
    ['MTR', true, 'M', 'header'],
    ['BUNDLE', false, null, 'unknown'],
    ['', false, null, 'missing'],
    [null, false, null, 'missing'],
  ])('%s', (raw, fromHeader, code, method) => {
    expect(normaliseUom(raw, table, { fromHeader })).toEqual({ code, method })
  })
  it('unitCounts', () => {
    expect(unitCounts(['NOS', 'nos', 'MTR', 'bundle', null], table)).toEqual([
      { raw: 'NOS', code: 'EA', count: 2 },
      { raw: 'MTR', code: 'M', count: 1 },
      { raw: 'BUNDLE', code: null, count: 1 },
    ])
  })
})
