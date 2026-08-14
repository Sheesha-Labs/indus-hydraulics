import { describe, expect, test } from 'vitest'
import { safeNextPath } from './safe-next-path'

describe('safeNextPath', () => {
  test('accepts same-origin absolute paths, with query and hash', () => {
    expect(safeNextPath('/products')).toBe('/products')
    expect(safeNextPath('/rfqs/RFQ-2026-0001')).toBe('/rfqs/RFQ-2026-0001')
    expect(safeNextPath('/seo/search?tab=queries')).toBe('/seo/search?tab=queries')
    expect(safeNextPath('/')).toBe('/')
  })

  test('rejects protocol-relative URLs', () => {
    // Starts with '/', so a naive startsWith('/') check lets these through and
    // the browser navigates off-origin.
    expect(safeNextPath('//evil.example')).toBeNull()
    expect(safeNextPath('//evil.example/admin')).toBeNull()
  })

  test('rejects backslash variants that browsers normalise to //', () => {
    expect(safeNextPath('/\\evil.example')).toBeNull()
    expect(safeNextPath('\\\\evil.example')).toBeNull()
  })

  test('rejects absolute URLs and non-path values', () => {
    for (const value of ['https://evil.example', 'http://evil.example', 'javascript:alert(1)', 'products', '']) {
      expect(safeNextPath(value), value).toBeNull()
    }
  })

  test('rejects non-string input', () => {
    expect(safeNextPath(null)).toBeNull()
    expect(safeNextPath(undefined)).toBeNull()
    expect(safeNextPath(new File([], 'x'))).toBeNull()
  })
})
