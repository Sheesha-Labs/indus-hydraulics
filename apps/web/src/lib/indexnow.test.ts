import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('next/server', () => ({ after: vi.fn() }))

const { INDEXNOW_KEY, indexNowUrls } = await import('./indexnow')
const { BASE_URL } = await import('./seo')

const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public')

describe('indexnow', () => {
  it('serves the key file the constant names, containing exactly the key', () => {
    const file = readFileSync(path.join(PUBLIC_DIR, `${INDEXNOW_KEY}.txt`), 'utf8')
    expect(file.trim()).toBe(INDEXNOW_KEY)
  })

  it('bulk-submit script carries the same key', () => {
    const script = readFileSync(
      path.resolve(PUBLIC_DIR, '../../../scripts/indexnow-submit.mjs'),
      'utf8'
    )
    expect(script).toContain(`const KEY = '${INDEXNOW_KEY}'`)
  })

  it('uses a key the protocol accepts', () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-zA-Z0-9-]{8,128}$/)
  })

  it('resolves paths against BASE_URL, de-duplicated', () => {
    expect(indexNowUrls(['/p/a', '/p/a', '/blog/b'])).toEqual([
      `${BASE_URL}/p/a`,
      `${BASE_URL}/blog/b`,
    ])
  })

  it('drops admin, relative, protocol-relative and empty paths', () => {
    expect(
      indexNowUrls(['/admin', '/admin/products', 'p/x', '//evil.test/x', '', null, undefined])
    ).toEqual([])
  })
})
