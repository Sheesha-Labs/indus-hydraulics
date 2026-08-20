import { describe, expect, it } from 'vitest'
import {
  HOSE_SIZE_TABLES,
  compareHoseGradesAtDash,
  hoseDashSizes,
  hoseSizeRow,
  hoseSizeTable,
} from './hose-size-tables'

describe('hose size tables', () => {
  it('covers the six grades the comparison table needs', () => {
    const skus = HOSE_SIZE_TABLES.map((t) => t.sku)
    for (const sku of [
      'IH-HOSE-R1-1SN',
      'IH-HOSE-R2-2SN',
      'IH-HOSE-R1-1SC',
      'IH-HOSE-2SC',
      'IH-HOSE-4SP',
      'IH-HOSE-4SH',
    ]) {
      expect(skus).toContain(sku)
    }
  })

  it('holds the 4:1 design factor on every row', () => {
    // The source publishes both figures; this asserts we transcribed them
    // consistently. A row that fails is a transcription error, not a discovery.
    for (const table of HOSE_SIZE_TABLES) {
      for (const row of table.rows) {
        expect(row.burstBar / row.workingBar).toBeCloseTo(4, 1)
      }
    }
  })

  it('has working pressure falling as bore rises, within each grade', () => {
    for (const table of HOSE_SIZE_TABLES) {
      const pressures = table.rows.map((r) => r.workingBar)
      const sorted = [...pressures].sort((a, b) => b - a)
      expect(pressures).toEqual(sorted)
    }
  })

  it('keeps rows in ascending dash order with no duplicates', () => {
    for (const table of HOSE_SIZE_TABLES) {
      const dashes = table.rows.map((r) => r.dash)
      expect(dashes).toEqual([...dashes].sort((a, b) => a - b))
      expect(new Set(dashes).size).toBe(dashes.length)
    }
  })

  it('records outside diameter for every row, and inner diameter where published', () => {
    for (const table of HOSE_SIZE_TABLES) {
      for (const row of table.rows) {
        expect(row.odMm).toBeGreaterThan(0)
        // idMm is deliberately null on the grades whose tables publish OD only.
        if (row.idMm !== null) expect(row.idMm).toBeLessThan(row.odMm)
      }
    }
  })
})

describe('the misleading-comparison problem this exists to fix', () => {
  it('ranks 4SH above 2SC at the bore they share, whatever the maxima say', () => {
    // ProductSpec records 2SC at 450 bar and 4SH at 420, which reads as 2SC
    // being the stronger hose. At -12 — the largest bore 2SC is made in and
    // the smallest 4SH is — the real ordering is the other way round, by a
    // wide margin. That inversion is the entire reason this dataset exists.
    const twoSc = hoseSizeRow('IH-HOSE-2SC', 12)!
    const fourSh = hoseSizeRow('IH-HOSE-4SH', 12)!
    expect(fourSh.workingBar).toBeGreaterThan(twoSc.workingBar)
    expect(fourSh.workingBar / twoSc.workingBar).toBeGreaterThan(1.5)
  })

  it('falls away steeply within a grade, which is what a single figure hides', () => {
    const rows = hoseSizeTable('IH-HOSE-R2-2SN')!.rows
    const first = rows[0]!
    const last = rows[rows.length - 1]!
    // 2SN runs 400 bar at -04 down to 50 bar at -48. Quoting one number for
    // the grade is quoting the top of an eightfold range.
    expect(first.workingBar / last.workingBar).toBeGreaterThan(4)
  })

  it('ranks grades correctly at a common bore', () => {
    const at32 = compareHoseGradesAtDash(32, [
      'IH-HOSE-R2-2SN',
      'IH-HOSE-4SP',
      'IH-HOSE-4SH',
    ])
    expect(at32.map((r) => r.sku)).toEqual([
      'IH-HOSE-4SH',
      'IH-HOSE-4SP',
      'IH-HOSE-R2-2SN',
    ])
  })

  it('omits grades not made in the requested size rather than showing zero', () => {
    // "4SH is not made at -04" and "4SH is weak at -04" are different claims.
    expect(hoseDashSizes('IH-HOSE-4SH')).not.toContain(4)
    const at4 = compareHoseGradesAtDash(4, ['IH-HOSE-R2-2SN', 'IH-HOSE-4SH'])
    expect(at4.map((r) => r.sku)).toEqual(['IH-HOSE-R2-2SN'])
  })
})
