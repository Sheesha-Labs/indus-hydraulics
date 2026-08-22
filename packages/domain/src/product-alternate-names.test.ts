import { describe, expect, it } from 'vitest'
import {
  ALTERNATE_NAME_LANGS,
  buildAlternateNames,
  hasEnoughToName,
  alternateNameStrings,
} from './product-alternate-names'
import { readFittingAttributes } from './product-alternate-names-parse'

/** The product in the competitor sample that prompted this feature. */
const DKOL_45 = {
  title: '45° Metric Female 24° O-ring Cone (Light Series) Hose Fitting',
  specs: [
    { label: 'Thread Gender', value: 'Female' },
    { label: 'Thread Form', value: 'Metric M14×1.5 to M45×2' },
    { label: 'Sealing Form', value: '24° cone with O-ring' },
    { label: 'Fitting Configuration', value: '45-elbow' },
  ],
}

describe('readFittingAttributes', () => {
  it('reads the sample fitting from its specs', () => {
    const a = readFittingAttributes(DKOL_45)
    expect(a.gender).toBe('female')
    expect(a.thread).toBe('metric')
    expect(a.seat).toBe('cone-24')
    expect(a.configuration).toBe('elbow-45')
    expect(a.series).toBe('light')
    expect(a.oring).toBe(true)
    expect(a.kind).toBe('hose-fitting')
  })

  it('falls back to the title when no specs exist', () => {
    const a = readFittingAttributes({ title: DKOL_45.title })
    expect(a.gender).toBe('female')
    expect(a.thread).toBe('metric')
    expect(a.seat).toBe('cone-24')
    expect(a.configuration).toBe('elbow-45')
  })

  it('does not read "female" as "male"', () => {
    // "female" contains "male"; a naive check gets this backwards.
    expect(readFittingAttributes({ title: 'BSP Female 60° Cone Adapter' }).gender).toBe('female')
    expect(readFittingAttributes({ title: 'BSP Male 60° Cone Adapter' }).gender).toBe('male')
  })

  it('reads a leading angle as an elbow even without the word', () => {
    expect(readFittingAttributes({ title: '90° JIC Female 37° Seat Hose Fitting' }).configuration).toBe(
      'elbow-90',
    )
  })

  it('tolerates the masculine ordinal that appears in some titles', () => {
    // Several titles use º (U+00BA) rather than ° (U+00B0).
    const a = readFittingAttributes({ title: 'JIC 37º swivel female (45º elbow)' })
    expect(a.seat).toBe('cone-37')
    expect(a.thread).toBe('jic')
  })

  it('leaves an unrecognised attribute null rather than guessing', () => {
    const a = readFittingAttributes({ title: 'Spiral hose tail x Flange' })
    expect(a.thread).toBeNull()
    expect(a.gender).toBeNull()
  })
})

describe('two-ended adapters', () => {
  it('declines a part that joins two thread standards', () => {
    // This model holds one thread. "ORFS X Metric" is ORFS at one end and
    // metric at the other, and naming it by either sends the wrong part.
    const a = readFittingAttributes({ title: 'Male Connector m ORFS X m Metric Flat' })
    expect(a.twoEnded).toBe(true)
    expect(buildAlternateNames(a)).toEqual([])
  })

  it('declines when the title and the specs name different standards', () => {
    // The spec describes the stud end, the title the port end. Whichever
    // parsed first would have won, silently.
    const a = readFittingAttributes({
      title: 'Male Stud Connector ORFS',
      specs: [{ label: 'Thread Form', value: 'BSPP G1/8 to G2 (parallel)' }],
    })
    expect(a.twoEnded).toBe(true)
    expect(buildAlternateNames(a)).toEqual([])
  })

  it('declines when two standards appear in one title', () => {
    expect(readFittingAttributes({ title: 'Male Stud Elbow NPT (BSP)' }).twoEnded).toBe(true)
  })

  it('still names a single-standard part', () => {
    const a = readFittingAttributes(DKOL_45)
    expect(a.twoEnded).toBe(false)
    expect(buildAlternateNames(a).length).toBe(4)
  })
})

describe('hasEnoughToName', () => {
  it('requires a thread standard plus two identifying attributes', () => {
    expect(hasEnoughToName({ thread: 'metric' })).toBe(false)
    expect(hasEnoughToName({ thread: 'metric', gender: 'female' })).toBe(false)
    expect(hasEnoughToName({ thread: 'metric', gender: 'female', seat: 'cone-24' })).toBe(true)
  })

  it('does not count a straight body as identifying', () => {
    // "mâle BSP" passed before this: thread + gender + straight. It is a pair
    // of words, not a designation anyone types into a search box.
    expect(hasEnoughToName({ thread: 'bsp', gender: 'male', configuration: 'straight' })).toBe(false)
    expect(hasEnoughToName({ thread: 'bsp', gender: 'male', configuration: 'elbow-90' })).toBe(true)
  })

  it('refuses to name a product with no thread standard at all', () => {
    expect(hasEnoughToName({ gender: 'female', seat: 'cone-24', series: 'light' })).toBe(false)
  })
})

describe('buildAlternateNames', () => {
  it('emits nothing when the attributes are too thin', () => {
    // The whole safety property: a fragment is worse than a gap.
    expect(buildAlternateNames({ thread: 'metric' })).toEqual([])
    expect(buildAlternateNames({})).toEqual([])
  })

  it('leads the German name with the DIN designation', () => {
    // DKO-L is what a German buyer types. It is the single most valuable
    // token this feature produces.
    const names = buildAlternateNames(readFittingAttributes(DKOL_45))
    const de = names.find((n) => n.lang === 'de')!.name
    expect(de.startsWith('DKO-L')).toBe(true)
    expect(de).toContain('45° Bogen')
    expect(de).toContain('Innengewinde')
    expect(de).toContain('24° Konus')
  })

  it('leads the Romance names with gender', () => {
    const names = buildAlternateNames(readFittingAttributes(DKOL_45))
    expect(names.find((n) => n.lang === 'fr')!.name.startsWith('femelle')).toBe(true)
    expect(names.find((n) => n.lang === 'es')!.name.startsWith('hembra')).toBe(true)
    expect(names.find((n) => n.lang === 'it')!.name.startsWith('femmina')).toBe(true)
  })

  it('carries the series into every language', () => {
    const names = buildAlternateNames(readFittingAttributes(DKOL_45))
    expect(names.find((n) => n.lang === 'fr')!.name).toContain('série L')
    expect(names.find((n) => n.lang === 'es')!.name).toContain('serie L')
    expect(names.find((n) => n.lang === 'de')!.name).toContain('DKO-L')
    expect(names.find((n) => n.lang === 'it')!.name).toContain('DKOL')
  })

  it('never translates an international thread designation', () => {
    // BSP is BSP in every catalogue in every language. Translating it would
    // invent a term nobody searches for.
    const names = buildAlternateNames(
      readFittingAttributes({ title: 'BSP Female 60° Cone Adapter (Light Series)' }),
    )
    for (const n of names) expect(n.name, n.lang).toContain('BSP')
  })

  it('produces a name in every configured language or none at all', () => {
    const names = buildAlternateNames(readFittingAttributes(DKOL_45))
    expect(names.map((n) => n.lang).sort()).toEqual([...ALTERNATE_NAME_LANGS].sort())
  })

  it('emits no empty strings', () => {
    const names = buildAlternateNames(readFittingAttributes(DKOL_45))
    for (const n of names) expect(n.name.trim().length, n.lang).toBeGreaterThan(0)
  })

  it('collapses to a flat list for the alias blob', () => {
    const strings = alternateNameStrings(buildAlternateNames(readFittingAttributes(DKOL_45)))
    expect(strings).toHaveLength(4)
    expect(strings.join(' ')).toContain('DKO-L')
  })

  it('never leaves a double space or a stray dash', () => {
    // The composers skip null parts; a naive join leaves gaps that read as
    // sloppy on a page a buyer is judging us by.
    const cases = [
      DKOL_45,
      { title: 'BSP Male Flat Seal Hose Fitting' },
      { title: '90° JIC Female 37° Seat Compact Hose Fitting' },
      { title: 'Double hexagonal NPSM swivel female cone 60º' },
    ]
    for (const c of cases) {
      for (const n of buildAlternateNames(readFittingAttributes(c))) {
        expect(n.name, `${c.title} / ${n.lang}`).not.toMatch(/\s{2}/)
        expect(n.name, `${c.title} / ${n.lang}`).not.toMatch(/–\s*$/)
        expect(n.name, `${c.title} / ${n.lang}`).not.toMatch(/^\s|\s$/)
      }
    }
  })
})
