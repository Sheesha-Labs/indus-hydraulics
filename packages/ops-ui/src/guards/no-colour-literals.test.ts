import { describe, expect, it } from 'vitest'
import { code, lineOf, sources, UI_ROOTS } from './scan'

/** Colour comes from tokens only (CLAUDE.md §4.3). Generated and build files are exempt. */
const HEX = /(?<![\w&/])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g
const FUNCS = /\b(?:oklch|rgba?|hsla?)\(/g

function literalsIn(text: string): { index: number; match: string }[] {
  // In-page anchors (href="#f01") are not colours.
  const t = text.replace(/href=(["'`{]+)#[\w-]*/g, (s) => ' '.repeat(s.length))
  return [...t.matchAll(HEX), ...t.matchAll(FUNCS)].map((m) => ({ index: m.index, match: m[0] }))
}

/** 203 files at S01-T10, minus 10, rounded down to a multiple of 10. */
const MIN_FILES = 190

describe('no colour literals', () => {
  const files = sources(UI_ROOTS, /\.tsx?$/)

  it(`finds the source it guards: ${files.length} files, at least ${MIN_FILES}`, () => {
    expect(files.length).toBeGreaterThanOrEqual(MIN_FILES)
  })

  it('no file writes a colour literal', () => {
    const hits: string[] = []
    for (const f of files) {
      const text = code(f.text)
      for (const l of literalsIn(text)) hits.push(`${f.path}:${lineOf(text, l.index)} ${l.match}`)
    }
    expect(hits, hits.join('\n')).toEqual([])
  })

  it('catches the mistakes it exists for', () => {
    expect(literalsIn("'bg-[#ffffff]'")).toHaveLength(1)
    expect(literalsIn("fill='rgb(1,2,3)'")).toHaveLength(1)
    expect(literalsIn("'oklch(0.5 0.1 250)'")).toHaveLength(1)
    expect(literalsIn('<a href="#f01">')).toEqual([])
    expect(literalsIn("import x from '#ops-client'")).toEqual([])
  })
})
