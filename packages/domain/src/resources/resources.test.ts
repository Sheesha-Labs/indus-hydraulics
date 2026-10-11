import { describe, expect, test } from 'vitest'
import {
  CONE_RATING_ROWS,
  CRIMP_HOSES,
  CRIMP_SERIES,
  CRIMP_SPECS,
  GLOSSARY,
  RATING_CONNECTIONS,
  RATING_ROWS,
  RESOURCE_GUIDE_SLUGS,
  THREAD_FAMILIES,
  THREAD_SEATS,
  convertLength,
  crimpSpecTotals,
  glossaryByLetter,
  glossaryLetter,
  glossaryTerm,
  jointRating,
  psiToBar,
  resourceEntries,
  resourceTotals,
} from '../index'

describe('crimp specifications', () => {
  test('every hose, size and series combination appears once', () => {
    const keys = CRIMP_SPECS.map((r) => `${r.hose}|${r.dash}|${r.series}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  test('inches and millimetres agree within the source rounding', () => {
    for (const row of CRIMP_SPECS) {
      expect(Math.abs(row.crimpIn * 25.4 - row.crimpMm), `${row.hose} -${row.dash} ${row.series}`).toBeLessThan(0.6)
    }
  })

  test('every row names a hose and a series the page can describe', () => {
    const hoses = new Set(CRIMP_HOSES.map((h) => h.code))
    const series = new Set(CRIMP_SERIES.map((s) => s.code))
    for (const row of CRIMP_SPECS) {
      expect(hoses.has(row.hose)).toBe(true)
      expect(series.has(row.series)).toBe(true)
    }
  })

  test('a crimp diameter is always larger than the hose bore', () => {
    for (const row of CRIMP_SPECS) {
      const [whole, frac] = row.bore.replace('"', '').split('-')
      const parse = (s: string) => (s.includes('/') ? Number(s.split('/')[0]) / Number(s.split('/')[1]) : Number(s))
      const bore = frac !== undefined ? Number(whole) + parse(frac) : parse(whole ?? '0')
      expect(row.crimpIn, `${row.hose} -${row.dash}`).toBeGreaterThan(bore)
    }
  })

  test('100R5 bores follow SAE J517, not dash ÷ 16', () => {
    const r5 = CRIMP_SPECS.find((r) => r.hose === 'R5' && r.dash === 8)
    expect(r5?.bore).toBe('13/32"')
  })

  test('links point at site paths', () => {
    for (const item of [...CRIMP_HOSES, ...CRIMP_SERIES]) {
      if (item.href) expect(item.href.startsWith('/')).toBe(true)
    }
  })

  test('totals are counted from the rows', () => {
    expect(crimpSpecTotals().settings).toBe(CRIMP_SPECS.length)
  })
})

describe('thread chart', () => {
  test('family ids are unique and every seat row points at one', () => {
    const ids = THREAD_FAMILIES.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const seat of THREAD_SEATS) expect(ids, seat.connection).toContain(seat.anchor)
  })

  test('the male thread is always bigger than the female bore', () => {
    for (const family of THREAD_FAMILIES) {
      if (family.kind !== 'thread') continue
      for (const row of family.rows) {
        if (row.femaleId !== null) expect(row.maleOd, `${family.id} ${row.thread}`).toBeGreaterThan(row.femaleId)
      }
    }
  })

  test('diameters grow with dash size within a family', () => {
    for (const family of THREAD_FAMILIES) {
      if (family.kind !== 'thread') continue
      const sized = family.rows.filter((r) => r.dash !== null)
      for (let i = 1; i < sized.length; i++) {
        expect(sized[i]!.maleOd, `${family.id} -${sized[i]!.dash}`).toBeGreaterThan(sized[i - 1]!.maleOd)
      }
    }
  })

  test('the corrections over the cross-checked chart hold', () => {
    const find = (id: string) => THREAD_FAMILIES.find((f) => f.id === id)
    const npt = find('npt-nptf-npsm')
    const unf = find('unf-jic-orb-flareless')
    const orfs = find('orfs')
    if (npt?.kind !== 'thread' || unf?.kind !== 'thread' || orfs?.kind !== 'thread') throw new Error('families missing')
    expect(npt.rows.find((r) => r.dash === 6)?.pitch).toBe('18')
    expect(unf.rows.find((r) => r.dash === 12)?.maleOd).toBe(1.0625)
    expect(orfs.rows.find((r) => r.dash === 16)?.femaleId).toBeLessThan(1.4375)
  })

  test('Code 62 is wider than Code 61 wherever both exist', () => {
    const flange = THREAD_FAMILIES.find((f) => f.kind === 'flange')
    if (flange?.kind !== 'flange') throw new Error('flange family missing')
    for (const row of flange.rows) {
      if (row.code62Spacing !== null) expect(row.code62Spacing).toBeGreaterThan(row.code61Spacing)
    }
  })

  test('converts both ways', () => {
    expect(convertLength(1, 'in').millimetres).toBe(25.4)
    expect(convertLength(25.4, 'mm').inches).toBe(1)
  })
})

describe('pressure ratings', () => {
  test('a joint is rated by its weaker end', () => {
    const result = jointRating('jic', 'nptf', 8)
    expect(result).toEqual({ status: 'rated', psi: 3000, governedBy: ['nptf'], r2: 3500 })
  })

  test('a tie names both ends', () => {
    const result = jointRating('orfs', 'orfs-adjustable', 8)
    expect(result.status === 'rated' && result.governedBy).toEqual(['orfs', 'orfs-adjustable'])
  })

  test('a missing rating is never borrowed from the other end', () => {
    expect(jointRating('jic', 'code61', 4)).toEqual({ status: 'unrated', missing: ['code61'] })
    expect(jointRating('nptf', 'nptf', 5)).toEqual({ status: 'unrated', missing: ['nptf'] })
  })

  test('every rating is a positive whole psi figure on a known connection', () => {
    const ids = new Set(RATING_CONNECTIONS.map((c) => c.id))
    for (const row of RATING_ROWS) {
      for (const [id, psi] of Object.entries(row.psi)) {
        expect(ids.has(id as never)).toBe(true)
        expect(Number.isInteger(psi) && (psi as number) > 0).toBe(true)
      }
    }
    for (const row of CONE_RATING_ROWS) {
      for (const cell of Object.values(row.series)) expect(cell!.psi).toBeGreaterThan(0)
    }
  })

  test('Code 61 follows SAE J518 to 4"', () => {
    const code61 = RATING_ROWS.filter((r) => r.psi.code61 !== undefined).map((r) => [r.dash, r.psi.code61])
    expect(code61).toEqual([
      [8, 5000],
      [12, 5000],
      [16, 5000],
      [20, 4000],
      [24, 3000],
      [32, 3000],
      [40, 2500],
      [48, 2000],
      [56, 500],
      [64, 500],
    ])
  })

  test('psi to bar', () => {
    expect(psiToBar(1000)).toBe(69)
    expect(psiToBar(6000)).toBe(414)
  })
})

describe('glossary', () => {
  test('slugs are unique, URL-safe and every cross-reference resolves', () => {
    const slugs = GLOSSARY.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const term of GLOSSARY) {
      expect(term.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      for (const see of term.see ?? []) {
        expect(glossaryTerm(see), `${term.slug} → ${see}`).toBeDefined()
        expect(see).not.toBe(term.slug)
      }
      if (term.link) expect(term.link.href.startsWith('/')).toBe(true)
    }
  })

  test('is alphabetical and grouped by its first letter', () => {
    const groups = glossaryByLetter()
    expect(groups.reduce((n, g) => n + g.terms.length, 0)).toBe(GLOSSARY.length)
    for (const group of groups) {
      for (const term of group.terms) expect(glossaryLetter(term.term)).toBe(group.letter)
    }
    const letters = groups.map((g) => g.letter)
    expect([...letters].sort()).toEqual(letters)
  })
})

describe('registry', () => {
  test('four references, each with a unique path under /resources', () => {
    const entries = resourceEntries()
    expect(entries).toHaveLength(resourceTotals().references)
    expect(new Set(entries.map((e) => e.href)).size).toBe(entries.length)
    for (const entry of entries) expect(entry.href.startsWith('/resources/')).toBe(true)
  })

  test('card figures are the derived totals, not typed numbers', () => {
    const t = resourceTotals()
    const facts = new Map(resourceEntries().map((e) => [e.key, Object.fromEntries(e.facts)]))
    expect(facts.get('crimp-specifications')?.['Crimp settings']).toBe(String(t.crimpSettings))
    expect(facts.get('hydraulic-glossary')?.['Terms defined']).toBe(String(t.terms))
    expect(facts.get('thread-chart')?.['Connection types']).toBe(String(t.connectionTypes))
  })

  test('guide slugs are listed once', () => {
    expect(new Set(RESOURCE_GUIDE_SLUGS).size).toBe(RESOURCE_GUIDE_SLUGS.length)
  })
})
