import { describe, expect, it } from 'vitest'
import {
  buildThreadReference,
  groupThreadReference,
  normaliseThreadLabel,
  readThreadLabel,
  THREAD_FAMILY_NOTE,
} from './thread-reference'

describe('normaliseThreadLabel', () => {
  /**
   * Three spellings of one thread live in this column: `M16X1.5` (175
   * variants), `M16×1.5` (59) and the hyphen form the inch rows use. Anything
   * grouping on the raw string publishes the same thread more than once with
   * its count split.
   */
  it('treats X, the multiplication sign and a hyphen as the same separator', () => {
    expect(normaliseThreadLabel('M16×1.5')).toBe(normaliseThreadLabel('M16X1.5'))
    expect(normaliseThreadLabel('G3/8"-19')).toBe(normaliseThreadLabel('G3/8"X19'))
  })

  it('ignores case, quotes and stray whitespace', () => {
    expect(normaliseThreadLabel(' m18 x 1.5 ')).toBe('M18X1.5')
    expect(normaliseThreadLabel('G1/2"X14')).toBe('G1/2X14')
  })
})

describe('readThreadLabel', () => {
  it('reads a metric designation', () => {
    const r = readThreadLabel('M18X1.5')
    expect(r.family).toBe('metric')
    expect(r.size).toBe('M18')
    expect(r.pitch).toBe('1.5 mm')
    expect(r.designation).toBe('M18×1.5')
  })

  it('reads the prefixed families before the bare-fraction rule, so the prefix survives', () => {
    expect(readThreadLabel('G1/2"X14').family).toBe('bsp')
    expect(readThreadLabel('NPT3/8"X18').family).toBe('npt')
    expect(readThreadLabel('R1/2"X14').family).toBe('bspt')
    expect(readThreadLabel('Rc1/4"X19').family).toBe('bspt')
    expect(readThreadLabel('Rc1/4"X19').designation).toBe('Rc 1/4"-19')
  })

  it('reads an inch thread, including the mixed-number form the catalogue uses', () => {
    expect(readThreadLabel('9/16"-18').family).toBe('unf')
    const mixed = readThreadLabel('1.1/16"-12')
    expect(mixed.family).toBe('unf')
    expect(mixed.size).toBe('1.1/16"')
    expect(mixed.pitch).toBe('12 TPI')
  })

  /**
   * The pipe-thread call, and the reason PIPE_TPI is a table rather than a
   * judgement. At 3/8" the two standards disagree on pitch, so an unprefixed
   * `3/8"-18` can only be NPT. At 1/2" they agree, so the same unprefixed form
   * settles nothing and must not be assigned.
   */
  it('names NPT only where BSP taper cannot produce the same pitch', () => {
    expect(readThreadLabel('3/8"-18').family).toBe('npt')
    expect(readThreadLabel('1"-11.5').family).toBe('npt')
    expect(readThreadLabel('1/2"-14').family).toBe('pipe')
    expect(readThreadLabel('3/4"-14').family).toBe('pipe')
  })

  it('does not mistake a straight inch thread for a pipe thread at the same size', () => {
    expect(readThreadLabel('3/4"-16').family).toBe('unf') // NPT 3/4" is 14 TPI
    expect(readThreadLabel('2"-12').family).toBe('unf') // NPT 2" is 11.5 TPI
  })

  it('returns unknown rather than guessing at something unparseable', () => {
    expect(readThreadLabel('FLANGE 62').family).toBe('unknown')
    expect(readThreadLabel('3" LP thread').family).toBe('unknown')
    expect(readThreadLabel('2" butt weld, Sch XXS').family).toBe('unknown')
    expect(readThreadLabel('1"').family).toBe('unknown')
    expect(readThreadLabel('').family).toBe('unknown')
  })
})

/**
 * The honesty rule this table lives or dies by. A thread designation identifies
 * a THREAD; JIC, ORFS and O-ring boss all run UNF, and only the seat separates
 * them, so a note that named one family would be wrong two thirds of the time.
 */
describe('THREAD_FAMILY_NOTE', () => {
  it('never resolves a UNF thread to a single fitting family', () => {
    const note = THREAD_FAMILY_NOTE.unf
    expect(note).toContain('JIC')
    expect(note).toContain('ORFS')
    expect(note).toContain('O-ring boss')
    expect(note.toLowerCase()).toContain('seat')
  })

  it('tells the reader how to break the NPT/BSP-taper tie itself', () => {
    expect(THREAD_FAMILY_NOTE.pipe).toContain('60°')
    expect(THREAD_FAMILY_NOTE.pipe).toContain('55°')
  })
})

describe('buildThreadReference', () => {
  const rows = [
    { label: 'M16X1.5', variants: 175 },
    { label: 'M16×1.5', variants: 59 },
    { label: 'G1/4"X19', variants: 112 },
    { label: 'G1/4"-19', variants: 8 },
    { label: 'FLANGE 62', variants: 40 },
  ]

  it('sums the spellings of one thread into a single row', () => {
    const out = buildThreadReference(rows)
    expect(out.filter((r) => r.family === 'metric')).toHaveLength(1)
    expect(out.find((r) => r.family === 'metric')?.variants).toBe(234)
    expect(out.find((r) => r.family === 'bsp')?.variants).toBe(120)
  })

  it('drops what it could not read rather than publishing a guess', () => {
    expect(buildThreadReference(rows).some((r) => r.designation === 'FLANGE 62')).toBe(false)
  })

  it('orders by how much of the catalogue actually carries the thread', () => {
    expect(buildThreadReference(rows)[0]!.designation).toBe('M16×1.5') // 234 beats 120
  })
})

describe('groupThreadReference', () => {
  it('presents metric, then BSP, then inch, and omits empty groups', () => {
    const readings = buildThreadReference([
      { label: '9/16"-18', variants: 10 },
      { label: 'M16X1.5', variants: 10 },
      { label: 'G1/4"X19', variants: 10 },
    ])
    expect(groupThreadReference(readings).map((g) => g.family)).toEqual(['metric', 'bsp', 'unf'])
  })
})
