import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `/api/files/[id]` (ADR-21, S11-T04): the route is on the proxy's public prefix list, so it must refuse a
 * caller without a session or a valid scoped token itself; it never caches; unknown or purged files are 404;
 * a Helper without margins cannot open an internal cost document; `?inline=1` streams; and the local Storage
 * stand-in answers only while it is the active storage.
 */

const h = vi.hoisted(() => ({
  signedIn: true,
  user: { id: 'u1', role: 'owner', canSeeMargins: true } as {
    id: string
    role: string
    canSeeMargins: boolean
  },
  files: new Map<string, { kinds: string[] }>(),
  local: false,
  allowed: true,
  signedUrlOpts: [] as unknown[],
}))

vi.mock('../../lib/access', async () => {
  const core = await import('../../lib/access-core')
  return {
    AccessError: core.AccessError,
    requireOpsUser: async () => {
      if (!h.signedIn) throw new core.AccessError('unauthenticated')
      return h.user
    },
  }
})
vi.mock('./files', () => ({
  SIGNED_URL_SECONDS: 60,
  fileForServing: async (id: string) => {
    const f = h.files.get(id)
    return f
      ? {
          bucket: 'ops-documents',
          path: `k/${id}.pdf`,
          filename: 'INDUS-OA1001.pdf',
          mimeType: 'application/pdf',
          kinds: f.kinds,
        }
      : null
  },
}))
vi.mock('./storage', () => ({
  usesLocalStorage: () => h.local,
  getStorage: () => ({
    openRead: async () => new Blob(['%PDF-1.4 test']).stream(),
    createSignedUrl: async (_b: string, key: string, s: number, opts: unknown) => {
      h.signedUrlOpts.push(opts)
      return `https://storage.test/${key}?expires=${s}`
    },
  }),
}))
vi.mock('../access/rate-limit', () => ({ hit: async () => h.allowed }))
vi.mock('../documents/access', () => ({
  mayOpenFile: (u: { role: string; canSeeMargins: boolean }, kinds: string[]) =>
    u.role === 'owner' || u.canSeeMargins || !kinds.includes('costing_sheet'),
}))

process.env.OPS_TOKEN_KEYS ??= JSON.stringify({ t1: Buffer.alloc(32, 3).toString('base64') })
process.env.OPS_TOKEN_KEY_ACTIVE ??= 't1'
const route = await import('../../app/api/files/[id]/route')
const { signFileToken } = await import('../documents/file-token')

const ID = '0193a5b2-7c1d-7e3f-8a9b-0c1d2e3f4a5b'
const OTHER = '0193a5b2-7c1d-7e3f-8a9b-0c1d2e3f4a5c'
const call = (id: string, url = `http://localhost/api/files/${id}`) =>
  route.GET(new Request(url), { params: Promise.resolve({ id }) })

beforeEach(() => {
  h.signedIn = true
  h.user = { id: 'u1', role: 'owner', canSeeMargins: true }
  h.local = false
  h.allowed = true
  h.signedUrlOpts = []
  h.files = new Map([
    [ID, { kinds: ['order_acknowledgement'] }],
    [OTHER, { kinds: ['costing_sheet'] }],
  ])
})

describe('GET /api/files/[id]', () => {
  it('requires a session or a token: 401 without either, and never redirects to the object', async () => {
    h.signedIn = false
    const res = await call(ID)
    expect(res.status).toBe(401)
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('cache-control')).toBe('private, no-store')
  })

  it('302s to a 60-second signed URL that saves under the stored name, private and not stored', async () => {
    const res = await call(ID)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(`https://storage.test/k/${ID}.pdf?expires=60`)
    expect(res.headers.get('cache-control')).toBe('private, no-store')
    expect(h.signedUrlOpts).toEqual([{ download: 'INDUS-OA1001.pdf' }])
  })

  it('a valid scoped token opens that file without a session; another file, a bad or expired token: 403', async () => {
    h.signedIn = false
    expect((await call(ID, `http://localhost/api/files/${ID}?t=${signFileToken(ID)}`)).status).toBe(
      302
    )
    expect(
      (await call(OTHER, `http://localhost/api/files/${OTHER}?t=${signFileToken(ID)}`)).status
    ).toBe(403)
    expect(
      (await call(ID, `http://localhost/api/files/${ID}?t=${signFileToken(ID)}x`)).status
    ).toBe(403)
    const expired = signFileToken(ID, 60, Date.now() - 120_000)
    expect((await call(ID, `http://localhost/api/files/${ID}?t=${expired}`)).status).toBe(403)
  })

  it('a Helper without margins cannot open an internal cost document', async () => {
    h.user = { id: 'u2', role: 'helper', canSeeMargins: false }
    expect((await call(OTHER)).status).toBe(403)
    expect((await call(ID)).status).toBe(302)
  })

  it('?inline=1 streams the bytes with the stored type and name', async () => {
    const res = await call(ID, `http://localhost/api/files/${ID}?inline=1`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
    expect(res.headers.get('content-disposition')).toBe('inline; filename="INDUS-OA1001.pdf"')
    expect(await res.text()).toBe('%PDF-1.4 test')
  })

  it('429 once the rate limit is spent', async () => {
    h.allowed = false
    const res = await call(ID)
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBe('60')
  })

  it('404s for a malformed id without asking for a session, and for an unknown or purged file', async () => {
    h.signedIn = false
    expect((await call('example')).status).toBe(404)
    h.signedIn = true
    expect((await call('0193a5b2-7c1d-7e3f-8a9b-ffffffffffff')).status).toBe(404)
  })

  it('the local stand-in path is 404 unless the local storage is active', async () => {
    expect((await call('local', 'http://localhost/api/files/local?op=get')).status).toBe(404)
    h.local = true
    expect(
      (await call('local', 'http://localhost/api/files/local?op=get&b=ops-company')).status
    ).toBe(404)
  })

  it('PUT is refused outside the local stand-in', async () => {
    const res = await route.PUT(
      new Request(`http://localhost/api/files/${ID}`, { method: 'PUT' }),
      {
        params: Promise.resolve({ id: ID }),
      }
    )
    expect(res.status).toBe(404)
  })
})
