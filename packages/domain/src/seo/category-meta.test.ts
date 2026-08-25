import { describe, expect, it } from 'vitest'
import {
  DESCRIPTION_MAX,
  STORED_TITLE_BUDGET,
  fitCategoryDescription,
  fitCategoryTitle,
  stripSiteName,
} from './category-meta'

describe('stripSiteName', () => {
  it('removes the suffix the layout already appends', () => {
    expect(stripSiteName('Pressure Washer Fittings — Dubai | Indus Hydraulics')).toBe(
      'Pressure Washer Fittings — Dubai',
    )
  })

  it('never strips a title down to nothing', () => {
    expect(stripSiteName('Indus Hydraulics')).toBe('Indus Hydraulics')
  })
})

describe('fitCategoryTitle', () => {
  it('leaves a title that already fits alone', () => {
    expect(fitCategoryTitle('Crimp Ferrules', 'Crimp Ferrules')).toBeNull()
  })

  it('keeps the head and re-adds what fits', () => {
    // 60 characters stored is 79 rendered, and Google shows about 60.
    expect(
      fitCategoryTitle('Ram BOPs — Cameron U / Shaffer SL / Coiled Tubing / Snubbing', 'Ram BOPs'),
    ).toBe('Ram BOPs — Cameron U / Shaffer SL')
  })

  it('keeps a run of short items but drops a lone short one', () => {
    /*
      "— Pipe / VBR / Blind" is a list and reads as a title. "— Frac" on its
      own reads as a sentence that got cut off, which is the thing this module
      exists to stop.
    */
    expect(
      fitCategoryTitle(
        'BOP Ram Blocks — Pipe / VBR / Blind / Shear / Blind-Shear',
        'BOP Ram Blocks',
      ),
    ).toBe('BOP Ram Blocks — Pipe / VBR / Blind')
    expect(
      fitCategoryTitle(
        'Well Service & Intervention Hoses — Frac, Stimulation, Well Test',
        'Well Service & Intervention Hoses',
      ),
    ).toBe('Well Service & Intervention Hoses')
  })

  it('treats a bracketed gloss as part of the head', () => {
    // Splitting at the bracket threw away "(BOP)" — the acronym buyers search.
    expect(
      fitCategoryTitle(
        'Blowout Preventers (BOP), Ram Blocks, Control Units & Services',
        'Blowout Preventers (BOP)',
      ),
    ).toBe('Blowout Preventers (BOP), Ram Blocks')
  })

  it('keeps the comma style of a title that has no dash', () => {
    const fitted = fitCategoryTitle(
      'Blowout Preventers (BOP), Ram Blocks, Control Units & Services',
      'Blowout Preventers (BOP)',
    )
    expect(fitted).not.toContain('—')
  })

  it('falls back to the category name when the head alone is too long', () => {
    const long = 'An Extremely Long Head Phrase That Cannot Possibly Fit Anywhere'
    expect(fitCategoryTitle(long, 'Short Name')).toBe('Short Name')
  })

  it('never returns something over budget', () => {
    const cases = [
      [
        'Oilfield Instrumentation & Controls — Sensors, Recorders, VFD, ATEX Panels',
        'Instrumentation & Controls',
      ],
      ['Well Control Hoses — Choke & Kill, BOP Control, Subsea | API 16C', 'Well Control Hoses'],
      ['API 6A Wellhead — Tubing Heads, Casing Heads, Christmas Trees', 'Wellhead'],
    ] as const
    for (const [stored, name] of cases) {
      const fitted = fitCategoryTitle(stored, name)
      expect(fitted!.length).toBeLessThanOrEqual(STORED_TITLE_BUDGET)
    }
  })
})

describe('fitCategoryDescription', () => {
  it('leaves a description inside the budget alone', () => {
    expect(fitCategoryDescription('Short and fine.', null)).toBeNull()
  })

  it('falls back to the on-page paragraph when nothing is stored', () => {
    expect(fitCategoryDescription(null, 'Velocity-drop dust collectors.')).toBe(
      'Velocity-drop dust collectors.',
    )
  })

  it('takes the longest clean cut, not the first kind that matches', () => {
    /*
      This one used to lose half its length: its only early comma sat at 84, a
      clause boundary sat further out, and whichever rule fired first won
      rather than whichever rule kept the most.
    */
    const source =
      'Annular & ram BOPs, control units, choke & kill manifolds, diverters, spools, spares, and API STD 53 BOP services — Cameron / Hydril / Shaffer / NOV compatibility, sour-service defaults.'
    const fitted = fitCategoryDescription(source, null)!
    expect(fitted.length).toBeGreaterThan(100)
    expect(fitted.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    expect(source.startsWith(fitted)).toBe(true)
  })

  it('prefers a full stop to a slightly longer cut that ends mid-thought', () => {
    // Taking the longest cut alone ended this on "…casing hangers. 2K-20K".
    const source =
      'Cameron / FMC / Stream-Flo / NOV API 6A wellhead components — tubing heads, casing heads, Christmas trees, frac trees, tubing hangers, casing hangers. 2K-20K psi, sour-service trim.'
    expect(fitCategoryDescription(source, null)).toBe(
      'Cameron / FMC / Stream-Flo / NOV API 6A wellhead components — tubing heads, casing heads, Christmas trees, frac trees, tubing hangers, casing hangers.',
    )
  })

  it('never ends on a dangling conjunction or separator', () => {
    const fitted = fitCategoryDescription(
      'Top-hole diverter systems for offshore jack-up and platform drilling with shallow-gas protection on ADNOC offshore fields, Saudi Aramco offshore fields, and equivalent GCC operations',
      null,
    )!
    expect(fitted).not.toMatch(/\s(and|or|with|for)$/i)
    expect(fitted).not.toMatch(/[,;:—–·-]$/)
  })

  it('never cuts inside a word', () => {
    const source = `${'word '.repeat(40)}end.`
    const fitted = fitCategoryDescription(source, null)!
    expect(source.startsWith(fitted)).toBe(true)
    expect(source[fitted.length] === undefined || /\s|[,.]/.test(source[fitted.length]!)).toBe(true)
  })
})
