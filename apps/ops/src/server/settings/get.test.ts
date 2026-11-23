import { beforeEach, describe, expect, it, vi } from 'vitest'

/** getSetting / getSettings with a stand-in client: one query, cache tags, and no silent default. */

const h = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
  queries: [] as unknown[],
  cacheCalls: [] as { keyParts: string[]; tags: string[] }[],
  captured: [] as unknown[],
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown, keyParts: string[], opts: { tags: string[] }) => {
    h.cacheCalls.push({ keyParts, tags: opts.tags })
    return fn
  },
  revalidateTag: () => undefined,
}))

vi.mock('@sentry/nextjs', () => ({
  withScope: (fn: (scope: { setTag: () => void }) => void) => fn({ setTag: () => undefined }),
  captureException: (e: unknown) => {
    h.captured.push(e)
  },
}))

vi.mock('@indus/ops-db', () => ({
  opsDb: {
    settingsEntry: {
      findMany: async (args: { where: { key: { in: string[] } } }) => {
        h.queries.push(args)
        return h.rows.filter((r) => args.where.key.in.includes(r.key as string))
      },
    },
  },
}))

function row(key: string, value: unknown, extra: Record<string, unknown> = {}) {
  return {
    key,
    value,
    version: 2,
    ownerOnly: true,
    signoffStatus: 'awaiting',
    signedOffById: null,
    signedOffAt: null,
    updatedById: null,
    updatedAt: new Date('2026-11-22T10:00:00.000Z'),
    ...extra,
  }
}

const AUTH = { sessionHours: 8, lockAttempts: 5, lockMinutes: 15, inviteDays: 7, resetMinutes: 30 }
const SENDER = { from: 'Indus Operations <no-reply@example.test>', replyTo: 'sales@example.test' }

beforeEach(() => {
  h.rows = [row('auth', AUTH), row('system_email.sender', SENDER)]
  h.queries = []
  h.cacheCalls = []
  h.captured = []
  vi.spyOn(console, 'error').mockReturnValue(undefined)
})

describe('getSetting', () => {
  it('returns the parsed value, cached under the key tag and the all-settings tag', async () => {
    const { getSetting } = await import('./get')
    expect(await getSetting('auth')).toEqual(AUTH)
    expect(h.cacheCalls).toEqual([
      { keyParts: ['ops-settings', 'auth'], tags: ['ops:settings', 'ops:setting:auth'] },
    ])
  })

  it('returns the entry with its version and sign-off state as JSON-safe data', async () => {
    const { getSettingEntry } = await import('./get')
    expect(await getSettingEntry('system_email.sender')).toEqual({
      key: 'system_email.sender',
      value: SENDER,
      version: 2,
      ownerOnly: true,
      signoffStatus: 'awaiting',
      signedOffById: null,
      signedOffAt: null,
      updatedById: null,
      updatedAt: '2026-11-22T10:00:00.000Z',
    })
  })

  it('throws a logged InvalidSettingError for a stored value outside its schema, naming paths only', async () => {
    h.rows = [row('auth', { ...AUTH, lockAttempts: 'five', secretish: 'x' })]
    const { getSetting, InvalidSettingError } = await import('./get')
    let caught: unknown
    try {
      await getSetting('auth')
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(InvalidSettingError)
    expect((caught as Error).message).toContain("'auth'")
    expect((caught as Error).message).toContain('lockAttempts')
    expect((caught as Error).message).not.toContain('five')
    expect(h.captured).toEqual([caught])
  })

  it('throws a logged MissingSettingError when the row is absent (never a silent default)', async () => {
    h.rows = []
    const { getSetting, MissingSettingError } = await import('./get')
    await expect(getSetting('auth')).rejects.toBeInstanceOf(MissingSettingError)
    expect(h.captured).toHaveLength(1)
  })
})

describe('getSettings', () => {
  it('reads several keys in ONE query and returns them in the order asked', async () => {
    const { getSettings } = await import('./get')
    const [sender, auth] = await getSettings(['system_email.sender', 'auth'] as const)
    expect(sender).toEqual(SENDER)
    expect(auth).toEqual(AUTH)
    expect(h.queries).toHaveLength(1)
    expect(h.cacheCalls).toEqual([
      {
        keyParts: ['ops-settings', 'auth', 'system_email.sender'],
        tags: ['ops:settings', 'ops:setting:auth', 'ops:setting:system_email.sender'],
      },
    ])
  })
})

describe('getCompanyLegalName', () => {
  const PROFILE = {
    legalName: '',
    tradingName: '',
    trn: '',
    addressLines: [],
    phone: '',
    website: '',
    copiedFrom: null,
    confirmedAt: null,
  }

  it('is null while Setup 1 has not filled the profile, and the name once it has', async () => {
    const { getCompanyLegalName } = await import('./get')
    h.rows = [row('company.profile', PROFILE)]
    expect(await getCompanyLegalName()).toBeNull()
    h.rows = [row('company.profile', { ...PROFILE, legalName: 'Sample Client LLC' })]
    expect(await getCompanyLegalName()).toBe('Sample Client LLC')
  })
})
