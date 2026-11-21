import { describe, expect, it } from 'vitest'
import { code, lineOf, sources, UI_ROOTS } from './scan'
import { problemsIn } from './token-classes'

describe('token usage', () => {
  const files = sources(UI_ROOTS, /\.(tsx?)$/, { includeTests: true })

  it('finds the source it guards', () => {
    expect(files.length).toBeGreaterThan(5)
  })

  it('every io- class names a generated token', () => {
    const hits: string[] = []
    for (const f of files) {
      const text = code(f.text)
      for (const p of problemsIn(text)) hits.push(`${f.path}:${lineOf(text, p.index)} ${p.message}`)
    }
    expect(hits, hits.join('\n')).toEqual([])
  })

  it('catches the mistakes it exists for', () => {
    expect(problemsIn("cn('bg-io-blue')")).toHaveLength(1)
    expect(problemsIn("'rounded-io-huge'")).toHaveLength(1)
    expect(problemsIn("'w-[var(--io-nope)]'")).toHaveLength(1)
    expect(problemsIn("'bg-blue-500'")).toHaveLength(1)
    expect(problemsIn("'rounded-lg shadow-md text-black'")).toHaveLength(3)
    expect(problemsIn("'text-white bg-transparent rounded-full shadow-none border'")).toEqual([])
    expect(
      problemsIn("'hover:bg-io-card text-io-body text-io-ink-3 rounded-io-3 z-io-modal'")
    ).toEqual([])
    expect(problemsIn("'data-[state=open]:bg-io-accent-tint w-io-well h-[var(--io-row)]'")).toEqual(
      []
    )
  })
})
