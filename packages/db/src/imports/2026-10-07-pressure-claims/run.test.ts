import { describe, expect, it } from 'vitest'

import {
  applyFamilyEdits,
  B16_5_TEXT,
  decide,
  notPublishedFaq,
  notPublishedLine,
  specText,
  TEMPLATE_LINES,
  workingPressureLine,
} from './run'

describe('decide', () => {
  it("uses the manufacturer's figure when the spec row holds one", () => {
    expect(
      decide('IH-CRW-FOUR-LUG-HOSE-END-CROWFOOT', 'Sealfast', '150 psi (per Seal Fast, at 70°F)')
    ).toEqual({
      kind: 'sourced',
      text: '150 psi (per Seal Fast, at 70°F)',
    })
    expect(decide('IH-STZ-X', 'Sunpool', 'Working Pressure: 250 PSI.')).toEqual({
      kind: 'sourced',
      text: '250 PSI',
    })
  })

  it('gives B16.5 flanges the standard ratings for carbon steel and stainless', () => {
    const d = decide('IH-FLG-WELDING-NECK-FLANGE', 'Sunpool', TEMPLATE_LINES.at(-1)!)
    expect(d).toEqual({ kind: 'b16.5', text: B16_5_TEXT })
    for (const figure of ['285 psi', '275 psi', '740 psi', '720 psi'])
      expect(B16_5_TEXT).toContain(figure)
  })

  it('says not published for everything else, naming the brand', () => {
    expect(
      decide(
        'IH-KC-KC-NIPPLE-2',
        'Sunpool',
        'Up to 600 psi (frac water); 250 psi (suction service)'
      )
    ).toEqual({
      kind: 'not-published',
      line: notPublishedLine('Sunpool'),
      faq: notPublishedFaq('Sunpool'),
    })
    // A stub end and a gunmetal dock flange are not B16.5 parts.
    expect(decide('IH-FLG-STUB-END-FLANGE', 'Sunpool', TEMPLATE_LINES.at(-1)!).kind).toBe(
      'not-published'
    )
    expect(decide('IH-GUI-X', 'Sunpool', null).kind).toBe('not-published')
    expect(notPublishedLine('Sunpool')).not.toMatch(/\d/)
  })
})

describe('workingPressureLine', () => {
  const html =
    '<ul><li><strong>Material:</strong> Brass</li><li><strong>Working pressure:</strong> Up to 16 bar (232 psi)</li></ul>'

  it('reads and replaces the one line, escaping the new text', () => {
    const line = workingPressureLine(html)
    expect(line?.text).toBe('Up to 16 bar (232 psi)')
    expect(line?.set('A & B')).toBe(
      '<ul><li><strong>Material:</strong> Brass</li><li><strong>Working pressure:</strong> A &amp; B</li></ul>'
    )
  })

  it('refuses a description with no line or two', () => {
    expect(workingPressureLine('<p>none</p>')).toBeNull()
    expect(workingPressureLine(html + html)).toBeNull()
  })
})

describe('family edits and spec text', () => {
  it('drops the unsourced family sentences', () => {
    const out = applyFamilyEdits(
      'protective-coating shops. Pressure-rated for typical sandblast service (up to 300 psi).'
    )
    expect(out).toEqual({ text: 'protective-coating shops.', hits: 1 })
    expect(
      applyFamilyEdits(
        'no gasket, no O-ring — for high-pressure steam and air service up to 600 psi.'
      ).text
    ).toBe('no gasket, no O-ring — for steam and air service.')
  })

  it('tidies spec values into lines', () => {
    expect(specText('Fitting & Hose Clamps:; Aluminum; Connection Ring:; Carbon Steel')).toBe(
      'Fitting & Hose Clamps: Aluminum; Connection Ring: Carbon Steel'
    )
  })

  it('lists each template line once', () => {
    expect(new Set(TEMPLATE_LINES).size).toBe(TEMPLATE_LINES.length)
  })
})
