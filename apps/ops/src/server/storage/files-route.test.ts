import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `/api/files/[id]` (ADR-21): the route is on the proxy's public prefix list, so it must refuse a
 * caller without a session itself; it never caches; unknown or purged files are 404; and the local
 * Storage stand-in answers only while it is the active storage.
 */

const h = vi.hoisted(() => ({
  signedIn: true,
  urls: new Map<string, string>(),
  local: false,
}))

vi.mock('../../lib/access', async () => {
  const core = await import('../../lib/access-core')
  return {
    AccessError: core.AccessError,
    requireOpsUser: async () => {
      if (!h.signedIn) throw new core.AccessError('unauthenticated')
      return { id: 'u1', role: 'owner' }
    },
  }
})
vi.mock('./files', () => ({
  signedUrlForFile: async (id: string) => h.urls.get(id) ?? null,
}))
vi.mock('./storage', () => ({
  usesLocalStorage: () => h.local,
  getStorage: () => ({ openRead: async () => null }),
}))

const route = await import('../../app/api/files/[id]/route')

const ID = '0193a5b2-7c1d-7e3f-8a9b-0c1d2e3f4a5b'
const call = (id: string, url = `http://localhost/api/files/${id}`) =>
  route.GET(new Request(url), { params: Promise.resolve({ id }) })

beforeEach(() => {
  h.signedIn = true
  h.local = false
  h.urls = new Map([[ID, 'https://storage.test/object/sign/ops-company/x.png?token=t']])
})

describe('GET /api/files/[id]', () => {
  it('requires a session: 401 without one, and never redirects to the object', async () => {
    h.signedIn = false
    const res = await call(ID)
    expect(res.status).toBe(401)
    expect(res.headers.get('location')).toBeNull()
    expect(res.headers.get('cache-control')).toBe('private, no-store')
  })

  it('302s to the 60-second signed URL, private and not stored', async () => {
    const res = await call(ID)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe(h.urls.get(ID))
    expect(res.headers.get('cache-control')).toBe('private, no-store')
  })

  it('404s for a malformed id without asking for a session (nothing to protect)', async () => {
    h.signedIn = false
    expect((await call('example')).status).toBe(404)
  })

  it('404s for an unknown or purged file', async () => {
    const res = await call('0193a5b2-7c1d-7e3f-8a9b-ffffffffffff')
    expect(res.status).toBe(404)
  })

  it('the local stand-in path is 404 unless the local storage is active', async () => {
    expect((await call('local', 'http://localhost/api/files/local?op=get')).status).toBe(404)
    h.local = true
    // Active, but the query is not a valid signed grant.
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
