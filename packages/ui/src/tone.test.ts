import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { isTone, LEGACY_TONE_ALIASES, TONES } from './tone'

/**
 * One tone vocabulary, enforced.
 *
 * Before this, three components coloured by meaning and each named the colours
 * differently: StatusPill said `good`/`warn`, Callout said `success`/`warning`,
 * and Toast had no caution tone at all. Passing `warn` where `warning` belonged
 * was a compile error in one component and silently wrong in another — and a
 * warning simply could not be expressed as a toast.
 *
 * These tests fail if a fourth vocabulary starts to grow.
 */

const SRC = __dirname

function sourceFiles(): string[] {
  return readdirSync(SRC)
    .filter((f) => /\.tsx?$/.test(f) && !f.endsWith('.test.ts') && !f.endsWith('.test.tsx'))
    .map((f) => path.join(SRC, f))
}

describe('the vocabulary itself', () => {
  it('has no duplicates', () => {
    expect(new Set(TONES).size).toBe(TONES.length)
  })

  it('covers the four meanings a UI actually needs, plus neutral and accent', () => {
    expect([...TONES].sort()).toEqual(
      ['accent', 'danger', 'info', 'neutral', 'success', 'warning'].sort(),
    )
  })

  it('recognises its own members and rejects the retired names', () => {
    for (const t of TONES) expect(isTone(t)).toBe(true)
    for (const legacy of Object.keys(LEGACY_TONE_ALIASES)) expect(isTone(legacy)).toBe(false)
  })

  it('maps every retired name to a current one', () => {
    for (const [, to] of Object.entries(LEGACY_TONE_ALIASES)) expect(isTone(to)).toBe(true)
  })

  it('retires the pair that caused the confusion', () => {
    expect(LEGACY_TONE_ALIASES.warn).toBe('warning')
    expect(LEGACY_TONE_ALIASES.good).toBe('success')
  })
})

describe('no component keeps a private vocabulary', () => {
  /**
   * A component may still declare its own union for something that is NOT a
   * tone — Badge's `kind` is a visual palette, NavTabs' `variant` is a shape.
   * What must not come back is a second list of tone NAMES.
   */
  it('declares no tone union outside tone.ts', () => {
    const offenders: string[] = []
    for (const file of sourceFiles()) {
      if (path.basename(file) === 'tone.ts') continue
      const src = readFileSync(file, 'utf8')
      for (const m of src.matchAll(/export type \w*Tone\w* =([^\n]*(?:\n\s*\|[^\n]*)*)/g)) {
        // An alias to the shared type is the supported migration path.
        if (/=\s*Tone\b/.test(m[0])) continue
        offenders.push(`${path.basename(file)} — ${m[0].split('\n')[0]!.trim()}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('uses no retired tone name in a tone position', () => {
    const offenders: string[] = []
    for (const file of sourceFiles()) {
      const src = readFileSync(file, 'utf8')
      for (const legacy of Object.keys(LEGACY_TONE_ALIASES)) {
        // `kind: 'warn'` is Badge's own palette and is allowed; a `tone` is not.
        const re = new RegExp(`tone[\\s]*[:=][\\s]*['"]${legacy}['"]`, 'g')
        if (re.test(src)) offenders.push(`${path.basename(file)} — tone '${legacy}'`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('every tone-taking component covers every tone', () => {
  /**
   * A `Record<Tone, …>` is exhaustive at compile time, so a missing key already
   * fails typecheck. This asserts the components actually use that shape rather
   * than a partial map with a fallback, which would compile and then render the
   * wrong colour.
   */
  it.each(['StatusPill.tsx', 'Toast.tsx'])('%s maps Record<Tone, …>', (file) => {
    const src = readFileSync(path.join(SRC, file), 'utf8')
    expect(src).toMatch(/Record<Tone,/)
  })

  it('Callout defines a class for every tone', () => {
    const src = readFileSync(path.join(SRC, 'Callout.tsx'), 'utf8')
    const block = /tone:\s*\{([\s\S]*?)\n\s{4}\}/.exec(src)?.[1] ?? ''
    const declared = [...block.matchAll(/^\s{6}(\w+):/gm)].map((m) => m[1]!)
    // Callout has no accent tone on purpose: accent-soft is the bulk-action
    // bar's fill and a page must not have two things wearing it.
    for (const tone of TONES.filter((t) => t !== 'accent')) {
      expect(declared).toContain(tone)
    }
  })
})
