import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * requireOpsUser's loader is ONE database round trip (S03-T02): a single raw query that joins the user
 * and the token's session, and no other client call. Every call on the mocked client is recorded.
 */
const h = vi.hoisted(() => ({
  calls: [] as string[],
  sql: [] as string[],
  rows: [] as Record<string, unknown>[],
}))

vi.mock('@indus/ops-db', () => {
  const record = (path: string) => {
    h.calls.push(path)
    return Promise.resolve(null)
  }
  const model = (name: string) =>
    new Proxy({}, { get: (_t, method) => () => record(`${name}.${String(method)}`) })
  const opsDb = new Proxy(
    {
      $queryRaw: (strings: TemplateStringsArray) => {
        h.calls.push('$queryRaw')
        h.sql.push(strings.join('?'))
        return Promise.resolve(h.rows)
      },
    } as Record<string, unknown>,
    { get: (target, key) => (key in target ? target[key as string] : model(String(key))) }
  )
  return { opsDb }
})

const USER = '01937a5e-0000-7000-8000-0000000000aa'
const SID = '01937a5e-0000-7000-8000-0000000000bb'

describe('loadOpsAccessRow', () => {
  beforeEach(() => {
    h.calls = []
    h.sql = []
    h.rows = []
  })

  it('reads the user and the session with one query', async () => {
    const { loadOpsAccessRow } = await import('./session-store')
    const expires = new Date('2026-11-23T16:00:00Z')
    const seen = new Date('2026-11-23T08:00:00Z')
    h.rows = [
      {
        id: USER,
        email: 'owner@example.test',
        name: 'Owner Example',
        initials: 'OE',
        role: 'owner',
        status: 'active',
        canSeeMargins: true,
        canSendSupplierMail: true,
        canEditChaserRules: true,
        sessionId: SID,
        revokedAt: null,
        expires,
        lastSeenAt: seen,
        sessionCreatedAt: seen,
      },
    ]
    const row = await loadOpsAccessRow(USER, SID)
    expect(h.calls).toEqual(['$queryRaw'])
    expect(h.sql[0]).toMatch(/FROM ops\."user" u\s+LEFT JOIN ops\.user_session s/)
    expect(h.sql[0]).toContain('s."userId" = u.id')
    expect(row?.session).toEqual({ revokedAt: null, expires, lastSeenAt: seen, createdAt: seen })
    expect(row).not.toHaveProperty('sessionId')
  })

  it('returns session null when the join found no row for this user', async () => {
    const { loadOpsAccessRow } = await import('./session-store')
    h.rows = [
      {
        id: USER,
        role: 'helper',
        status: 'active',
        sessionId: null,
        revokedAt: null,
        expires: null,
        lastSeenAt: null,
        sessionCreatedAt: null,
      },
    ]
    expect((await loadOpsAccessRow(USER, SID))?.session).toBeNull()
  })

  it('does not query for an id that is not a uuid', async () => {
    const { loadOpsAccessRow } = await import('./session-store')
    expect(await loadOpsAccessRow('not-a-uuid', SID)).toBeNull()
    expect(h.calls).toEqual([])
  })
})
