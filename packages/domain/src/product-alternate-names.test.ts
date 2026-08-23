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
  it('names both ends rather than picking one', () => {
    // Previously declined outright. Naming it by either end alone sends the
    // wrong part; naming it by both says what it actually does.
    const a = readFittingAttributes({ title: 'Male Connector m ORFS X m Metric Flat' })
    expect(a.endB).toBeTruthy()
    expect(a.thread).toBe('orfs')
    expect(a.endB?.thread).toBe('metric')

    const names = buildAlternateNames(a)
    expect(names.length).toBe(4)
    const de = names.find((n) => n.lang === 'de')!.name
    // Both standards present, in order, joined by the German preposition.
    expect(de).toMatch(/ORFS/)
    expect(de).toMatch(/metrisch/)
    expect(de.indexOf('ORFS')).toBeLessThan(de.indexOf('metrisch'))
    expect(de).toContain('auf')
  })

  it('reads each end separately across the separator', () => {
    const a = readFittingAttributes({
      title: 'Standard Type B: Female Coupler × Male NPT Cam and Groove Coupling',
    })
    // Camlock is a coupling family, so it is named as one rather than by
    // thread — the family wins over the two-ended path.
    expect(a.couplingFamily).toBe('cam-groove')
    expect(buildAlternateNames(a).length).toBe(4)
  })

  it('declines when two standards are present but the title cannot be split', () => {
    // "Male Stud Connector ORFS" with a BSPP spec names two standards and
    // gives no way to say which end is which. Silence is still correct here.
    const a = readFittingAttributes({
      title: 'Male Stud Connector ORFS',
      specs: [{ label: 'Thread Form', value: 'BSPP G1/8 to G2 (parallel)' }],
    })
    expect(buildAlternateNames(a)).toEqual([])
  })

  it('still names a single-standard part', () => {
    const a = readFittingAttributes(DKOL_45)
    expect(a.endB).toBeFalsy()
    expect(buildAlternateNames(a).length).toBe(4)
  })
})

describe('coupling families', () => {
  it('names a Storz coupling, which has no thread at all', () => {
    const a = readFittingAttributes({ title: 'Storz FDC UL Listed-H. Anodized' })
    expect(a.couplingFamily).toBe('storz')
    const names = buildAlternateNames(a)
    expect(names.length).toBe(4)
    expect(names.find((n) => n.lang === 'de')!.name).toContain('Storz-Kupplung')
    expect(names.find((n) => n.lang === 'fr')!.name).toContain('raccord Storz')
  })

  it('keeps the Camlock type designation verbatim', () => {
    const a = readFittingAttributes({
      title: 'Standard Type C: Female Coupler × Hose Shank Cam and Groove Coupling',
    })
    // Only the letter is stored; the word in front of it is per-language.
    expect(a.couplingType).toBe('C')
    const names = buildAlternateNames(a)
    expect(names.find((n) => n.lang === 'de')!.name).toContain('Typ C')
    expect(names.find((n) => n.lang === 'fr')!.name).toContain('type C')
    expect(names.find((n) => n.lang === 'es')!.name).toContain('tipo C')
    expect(names.find((n) => n.lang === 'it')!.name).toContain('tipo C')
    // "Typ" is German and must not leak into the Romance languages.
    for (const lang of ['fr', 'es', 'it'] as const) {
      expect(names.find((n) => n.lang === lang)!.name).not.toContain('Typ ')
    }
  })

  it('does not name an accessory after the shelf it sits on', () => {
    // A category is a shelf, not a description. This exact title was named
    // "SAE-Flansch" in all four languages before the accessory guard.
    const a = readFittingAttributes({
      title: 'Set of Bolts and Spring Washers',
      categorySlug: 'sae-flange-fittings',
    })
    expect(a.couplingFamily).toBeFalsy()
    expect(buildAlternateNames(a)).toEqual([])
  })

  it('names a crimp ferrule', () => {
    const a = readFittingAttributes({ title: 'Skive Crimp Ferrule for R9 Hose' })
    expect(a.couplingFamily).toBe('crimp-ferrule')
    expect(buildAlternateNames(a).find((n) => n.lang === 'de')!.name).toContain('Presshülse')
  })
})

describe('body types', () => {
  it('names a cap by what it is, not by its thread alone', () => {
    // Declined before: thread plus one attribute. A Verschlusskappe is a cap
    // whatever it screws onto, and that is what a buyer searches.
    const a = readFittingAttributes({ title: 'Swivel Cap JIC' })
    expect(a.body).toBe('cap')
    const names = buildAlternateNames(a)
    expect(names.find((n) => n.lang === 'de')!.name).toContain('Verschlusskappe')
    // "bouchon femelle" already says female; adding the gender word produced
    // "femelle JIC bouchon femelle", which reads as a mistake.
    const fr = names.find((n) => n.lang === 'fr')!.name
    expect(fr).toContain('bouchon femelle')
    expect(fr.match(/femelle/g)).toHaveLength(1)
  })

  it('names a bulkhead fitting', () => {
    const a = readFittingAttributes({ title: 'Bulkhead Elbow Union Metric' })
    expect(a.body).toBe('bulkhead')
    expect(buildAlternateNames(a).find((n) => n.lang === 'es')!.name).toContain('pasamuros')
  })

  it('distinguishes a plug from a cap across languages', () => {
    const plug = readFittingAttributes({ title: 'Blanking Plug for Ports with ED Seal, BSP' })
    expect(plug.body).toBe('plug')
    const de = buildAlternateNames(plug).find((n) => n.lang === 'de')
    if (de) expect(de.name).toContain('Verschlussstopfen')
  })
})

describe('SAE', () => {
  it('recognises SAE as a thread standard', () => {
    const a = readFittingAttributes({ title: '90° SAE Female 45° Cone Hose Fitting' })
    expect(a.thread).toBe('sae')
    expect(a.seat).toBe('cone-45')
    expect(buildAlternateNames(a).length).toBe(4)
  })

  it('reads an inverted flare as its own seat, not a 45° cone', () => {
    const a = readFittingAttributes({ title: '45° SAE Inverted Flare Hose Fitting' })
    expect(a.seat).toBe('inverted-flare')
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
