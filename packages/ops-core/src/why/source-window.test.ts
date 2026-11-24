import { describe, expect, it } from 'vitest'
import { sourceWindow } from './source-window'

describe('sourceWindow', () => {
  it('returns the whole text when it is short, with the exact offset', () => {
    const s = 'Please find attached our price list. Our price list is valid.'
    const at = s.lastIndexOf('price list')
    const w = sourceWindow(s, at, at + 10)!
    expect(w.text).toBe(s)
    expect(w.match).toBe('price list')
    expect(w.matchAt).toBe(at)
    expect(w.paragraph).toBe(1)
  })

  it('cuts long text at word boundaries with ellipses and keeps the offset right', () => {
    const s = `${'alpha '.repeat(100)}TARGET words${' omega'.repeat(100)}`
    const at = s.indexOf('TARGET')
    const w = sourceWindow(s, at, at + 6, 40)!
    expect(w.text.startsWith('…')).toBe(true)
    expect(w.text.endsWith('…')).toBe(true)
    expect(w.text.slice(w.matchAt, w.matchAt + 6)).toBe('TARGET')
    expect(w.text).not.toMatch(/…\S*lph\b/)
  })

  it('counts paragraphs by blank lines', () => {
    const s = 'Subject line\nHello,\n\nSecond para.\n\nThird para with the quote.'
    const at = s.indexOf('quote')
    expect(sourceWindow(s, at, at + 5)!.paragraph).toBe(3)
  })

  it('rejects offsets outside the text', () => {
    expect(sourceWindow('abc', 2, 9)).toBeNull()
    expect(sourceWindow('abc', 2, 2)).toBeNull()
    expect(sourceWindow('abc', -1, 2)).toBeNull()
  })
})
