import { describe, expect, it } from 'vitest'
import { code, lineOf, sources, UI_ROOTS } from './scan'

/** No inline style in Ops UI (CLAUDE.md §4.4). packages/ops-pdf is exempt and not scanned. */
const STYLE = /(?<![\w-])style=\s*[{"']/g

/** 134 .tsx files at S01-T10, minus 10, rounded down to a multiple of 10. */
const MIN_FILES = 120

describe('no inline style', () => {
  const files = sources(UI_ROOTS, /\.tsx$/)

  it(`finds the source it guards: ${files.length} files, at least ${MIN_FILES}`, () => {
    expect(files.length).toBeGreaterThanOrEqual(MIN_FILES)
  })

  it('no JSX element takes a style attribute', () => {
    const hits: string[] = []
    for (const f of files) {
      const text = code(f.text)
      for (const m of text.matchAll(STYLE)) hits.push(`${f.path}:${lineOf(text, m.index)}`)
    }
    expect(hits, hits.join('\n')).toEqual([])
  })
})
