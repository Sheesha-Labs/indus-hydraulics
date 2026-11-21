import { describe, expect, it } from 'vitest'
import { code, lineOf, sources, UI_ROOTS } from './scan'

/** No inline style in Ops UI (CLAUDE.md §4.4). packages/ops-pdf is exempt and not scanned. */
const STYLE = /(?<![\w-])style=\s*[{"']/g

describe('no inline style', () => {
  const files = sources(UI_ROOTS, /\.tsx$/)

  it('finds the source it guards', () => {
    expect(files.length).toBeGreaterThan(3)
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
