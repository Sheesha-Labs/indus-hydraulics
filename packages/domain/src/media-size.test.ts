import { describe, it, expect } from 'vitest'
import { parseMediaStoragePath, isOwnedStorageRef, measureRemoteBytes } from './media-size'

describe('parseMediaStoragePath', () => {
  it('reads bucket and key out of a Supabase public URL', () => {
    const ref = parseMediaStoragePath(
      'https://abc.supabase.co/storage/v1/object/public/product-images/products/x/1-a.png'
    )
    expect(ref).toEqual({
      kind: 'supabase-public',
      bucket: 'product-images',
      key: 'products/x/1-a.png',
    })
  })

  it('prefers the Supabase shape over the generic URL shape', () => {
    // The whole point of the ordering: our own public images are URLs too, and
    // classifying them as external would send the backfill over the network.
    const ref = parseMediaStoragePath(
      'https://abc.supabase.co/storage/v1/object/public/product-images/a.png'
    )
    expect(ref.kind).toBe('supabase-public')
  })

  it('splits a bucket-prefixed key', () => {
    expect(parseMediaStoragePath('product-documents/products/123/1-sheet.pdf')).toEqual({
      kind: 'bucket-key',
      bucket: 'product-documents',
      key: 'products/123/1-sheet.pdf',
    })
  })

  it('treats a slashless path as a bare key, not a bucket', () => {
    expect(parseMediaStoragePath('sheet.pdf')).toEqual({ kind: 'bare-key', key: 'sheet.pdf' })
  })

  it('never reads a URL scheme as a bucket name', () => {
    // supabase.ts slices on the first '/' without an http guard and would ask
    // for a bucket literally called 'https:'.
    const ref = parseMediaStoragePath('https://www.dupont.com/a/b/sheet.pdf')
    expect(ref).toEqual({
      kind: 'external-url',
      url: 'https://www.dupont.com/a/b/sheet.pdf',
      host: 'www.dupont.com',
    })
  })

  it('classifies plain http the same as https', () => {
    const ref = parseMediaStoragePath('http://products.sealfast.com/Asset/Bauer Type_FLF_1.pdf')
    expect(ref.kind).toBe('external-url')
  })

  it('returns unknown for empty and whitespace paths', () => {
    expect(parseMediaStoragePath('').kind).toBe('unknown')
    expect(parseMediaStoragePath('   ').kind).toBe('unknown')
  })

  it('does not treat a leading slash as a bucket', () => {
    // indexOf('/') === 0, so the bucket would be the empty string.
    expect(parseMediaStoragePath('/orphan.pdf').kind).toBe('bare-key')
  })

  it('marks only our own buckets as owned', () => {
    expect(isOwnedStorageRef(parseMediaStoragePath('product-documents/a.pdf'))).toBe(true)
    expect(isOwnedStorageRef(parseMediaStoragePath('https://x.test/a.pdf'))).toBe(false)
    expect(isOwnedStorageRef(parseMediaStoragePath('a.pdf'))).toBe(false)
  })
})

// A minimal stand-in for the bits of `fetch` this module touches.
function stubFetch(
  routes: Record<string, { status: number; headers?: Record<string, string>; throws?: boolean }>
) {
  const calls: string[] = []
  const impl = async (_url: string, init: { method: string }) => {
    calls.push(init.method)
    const r = routes[init.method]
    if (!r || r.throws) throw new Error('network down')
    const headers = new Map(Object.entries(r.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]))
    return {
      ok: r.status >= 200 && r.status < 300,
      status: r.status,
      headers: { get: (n: string) => headers.get(n.toLowerCase()) ?? null },
    }
  }
  return { impl: impl as never, calls }
}

describe('measureRemoteBytes', () => {
  it('reads Content-Length from a HEAD and does not fall back', async () => {
    const { impl, calls } = stubFetch({ HEAD: { status: 200, headers: { 'content-length': '197353' } } })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toEqual({
      ok: true,
      bytes: 197353,
    })
    expect(calls).toEqual(['HEAD'])
  })

  it('falls back to a ranged GET when HEAD is refused', async () => {
    const { impl, calls } = stubFetch({
      HEAD: { status: 405 },
      GET: { status: 206, headers: { 'content-range': 'bytes 0-0/558874' } },
    })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toEqual({
      ok: true,
      bytes: 558874,
    })
    expect(calls).toEqual(['HEAD', 'GET'])
  })

  it('falls back when HEAD answers 200 with no length', async () => {
    const { impl } = stubFetch({
      HEAD: { status: 200 },
      GET: { status: 200, headers: { 'content-length': '4096' } },
    })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toEqual({
      ok: true,
      bytes: 4096,
    })
  })

  it('falls back when HEAD throws', async () => {
    const { impl, calls } = stubFetch({
      HEAD: { status: 0, throws: true },
      GET: { status: 206, headers: { 'content-range': 'bytes 0-0/10' } },
    })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toEqual({
      ok: true,
      bytes: 10,
    })
    expect(calls).toEqual(['HEAD', 'GET'])
  })

  it('reports a 404 as missing, not as unreachable', async () => {
    // The distinction is the point: missing means the row is orphaned, and
    // unreachable means try again. Collapsing them invents orphans.
    const { impl } = stubFetch({ HEAD: { status: 404 } })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toMatchObject({
      ok: false,
      reason: 'missing',
    })
  })

  it('reports a total network failure as unreachable', async () => {
    const { impl } = stubFetch({ HEAD: { status: 0, throws: true }, GET: { status: 0, throws: true } })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toMatchObject({
      ok: false,
      reason: 'unreachable',
    })
  })

  it('reports a reachable file with no usable length as unmeasurable', async () => {
    const { impl } = stubFetch({ HEAD: { status: 200 }, GET: { status: 206 } })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toMatchObject({
      ok: false,
      reason: 'unmeasurable',
    })
  })

  it('rejects a zero or malformed Content-Length rather than storing 0', async () => {
    // Writing 0 back is exactly the state this whole exercise is undoing.
    const { impl } = stubFetch({
      HEAD: { status: 200, headers: { 'content-length': '0' } },
      GET: { status: 206 },
    })
    await expect(measureRemoteBytes('https://x.test/a.pdf', { fetchImpl: impl })).resolves.toMatchObject({
      ok: false,
    })
  })
})
