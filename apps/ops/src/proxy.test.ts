import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { encode } from 'next-auth/jwt'

/**
 * The proxy with a real Ops session token (S03-T02): a live session passes, a revoked sid is sent to
 * /sign-in?reason=session_revoked with its cookie cleared once the 60 s cache refreshes, and the
 * revocation query runs at most once per TTL however many requests arrive.
 */
const h = vi.hoisted(() => ({ revoked: [] as string[], queries: 0 }))

vi.mock('@indus/ops-db', () => ({
  opsDb: {
    userSession: {
      findMany: async () => {
        h.queries += 1
        return h.revoked.map((id) => ({ id }))
      },
    },
  },
}))
vi.mock('./lib/env', () => ({ env: () => ({ APP_ENV: 'test' }) }))

const SECRET = 'proxy-test-secret-0123456789abcdef0123456789'
const COOKIE = 'indus.ops-session'
const SID = '01937a5e-0000-7000-8000-000000000001'

async function sessionCookie(claims: Record<string, unknown>): Promise<string> {
  return encode({ token: claims, secret: SECRET, salt: COOKIE, maxAge: 8 * 3600 })
}

function get(path: string, cookie?: string): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3132'), {
    headers: cookie ? { cookie: `${COOKIE}=${cookie}` } : {},
  })
}

describe('proxy · session revocation', () => {
  let proxy: typeof import('./proxy').default
  let previous: string | undefined

  beforeAll(async () => {
    previous = process.env.OPS_AUTH_SECRET
    process.env.OPS_AUTH_SECRET = SECRET
    proxy = (await import('./proxy')).default
  })

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  afterAll(() => {
    if (previous === undefined) delete process.env.OPS_AUTH_SECRET
    else process.env.OPS_AUTH_SECRET = previous
  })

  it('lets a live session through, then redirects it once revoked and the cache has refreshed', async () => {
    const cookie = await sessionCookie({ sub: 'u1', kind: 'ops', role: 'owner', sid: SID })
    h.revoked = []
    const ok = await proxy(get('/today', cookie))
    expect(ok.status).toBe(200)
    const before = h.queries

    // Signed out from Devices: the proxy keeps serving its cached set until the TTL passes …
    h.revoked = [SID]
    for (let i = 0; i < 25; i++) expect((await proxy(get('/today', cookie))).status).toBe(200)
    expect(h.queries).toBe(before)

    // … then one query, and the revoked sid goes to sign-in with its cookie cleared.
    vi.advanceTimersByTime(60_000)
    const res = await proxy(get('/enquiries', cookie))
    expect(h.queries).toBe(before + 1)
    expect(res.status).toBe(307)
    const location = new URL(res.headers.get('location')!)
    expect(location.pathname).toBe('/sign-in')
    expect(location.searchParams.get('reason')).toBe('session_revoked')
    expect(res.headers.get('set-cookie') ?? '').toMatch(new RegExp(`${COOKIE}=;.*Max-Age=0`, 'i'))
    expect(res.headers.get('x-robots-tag')).toContain('noindex')

    // An API gets a 401, not a redirect.
    const api = await proxy(get('/api/health', cookie))
    expect(api.status).toBe(401)
  })

  it('never queries for public paths or requests without a token', async () => {
    const before = h.queries
    vi.advanceTimersByTime(120_000)
    await proxy(get('/sign-in'))
    const res = await proxy(get('/today'))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).searchParams.get('reason')).toBeNull()
    expect(h.queries).toBe(before)
  })

  it('treats a token without sid, or of another kind, as no session', async () => {
    const noSid = await sessionCookie({ sub: 'u1', kind: 'ops', role: 'owner' })
    const res = await proxy(get('/today', noSid))
    expect(res.status).toBe(307)
    expect(new URL(res.headers.get('location')!).searchParams.get('reason')).toBe('session_ended')
    const staff = await sessionCookie({ sub: 'u1', kind: 'staff', sid: SID })
    expect((await proxy(get('/today', staff))).status).toBe(307)
  })
})
