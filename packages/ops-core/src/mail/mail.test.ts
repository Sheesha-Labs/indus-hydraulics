import { describe, expect, it } from 'vitest'
import { decideZip, normaliseForExtraction, normaliseText, parseAuthenticationResults } from '.'

describe('normaliseText (the text Why? offsets point into)', () => {
  it.each([
    ['“Quote” for ‘RFQ’ – 2 pcs — urgent…', '"Quote" for \'RFQ\' - 2 pcs - urgent...'],
    ['line one\r\nline two\rline three', 'line one\nline two\nline three'],
    ['a \t  b  c   ', 'a b c'],
    ['top\n\n\n\n\n\nbottom', 'top\n\n\nbottom'],
    ['ｆｕｌｌｗｉｄｔｈ ①', 'fullwidth 1'],
    ['  trailing   \nspaces  \n', 'trailing\nspaces'],
  ])('%j → %j', (input, expected) => {
    expect(normaliseText(input)).toBe(expected)
  })

  it('hashes the normalised text, so the same content hashes the same', () => {
    const hash = (t: string) => `h:${t.length}:${t}`
    expect(normaliseForExtraction('a\r\nb', hash).sha256Hex).toBe(
      normaliseForExtraction('a\nb  ', hash).sha256Hex
    )
  })
})

describe('parseAuthenticationResults', () => {
  it('reads spf, dkim and dmarc; first header wins', () => {
    expect(
      parseAuthenticationResults([
        'mx.example.test; dkim=pass header.i=@example.test; spf=softfail smtp.mailfrom=x@example.test; dmarc=fail (p=NONE) header.from=example.test',
        'other.test; spf=pass',
      ])
    ).toEqual({ spf: 'softfail', dkim: 'pass', dmarc: 'fail' })
    expect(parseAuthenticationResults('mx.example.test; spf=none')).toEqual({
      spf: 'none',
      dkim: null,
      dmarc: null,
    })
    expect(parseAuthenticationResults(null)).toEqual({ spf: null, dkim: null, dmarc: null })
    expect(parseAuthenticationResults('mx; spf=bogus')).toEqual({
      spf: null,
      dkim: null,
      dmarc: null,
    })
  })
})

describe('decideZip', () => {
  it.each([
    [{ entries: 3, expandedBytes: 3_000_000, compressedBytes: 1_000_000 }, 'expand'],
    [{ entries: 201, expandedBytes: 10, compressedBytes: 10 }, 'too_many_entries'],
    [
      { entries: 1, expandedBytes: 101 * 1024 * 1024, compressedBytes: 90 * 1024 * 1024 },
      'too_large_expanded',
    ],
    [{ entries: 1, expandedBytes: 51_000, compressedBytes: 1_000 }, 'ratio_too_high'],
    [{ entries: 0, expandedBytes: 0, compressedBytes: 22 }, 'expand'],
  ])('%j → %s', (input, expected) => {
    const d = decideZip(input)
    expect(d.action === 'expand' ? 'expand' : d.reason).toBe(expected)
  })
})
