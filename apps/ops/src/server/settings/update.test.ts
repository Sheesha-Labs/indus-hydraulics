import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OpsUser } from '../../lib/access-core'

/**
 * updateSetting / markSignedOff against an in-memory stand-in for the transaction client: the
 * permission rule, the version check, the audit row through the same client, and the cache tag
 * purged only after a successful write. settings.db.test.ts repeats the important cases on Postgres.
 */

type Row = {
  key: string
  value: unknown
  version: number
  ownerOnly: boolean
  signoffStatus: 'awaiting' | 'signed_off' | 'not_required'
  signedOffById: string | null
  signedOffAt: Date | null
}

const h = vi.hoisted(() => ({
  rows: new Map<string, Row>(),
  audit: [] as unknown[],
  revalidated: [] as unknown[][],
  /** Simulates another writer committing between our read and our write. */
  raceOnce: false,
  txCalls: 0,
}))

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => {
    h.revalidated.push(args)
  },
  unstable_cache: (fn: () => unknown) => fn,
}))

vi.mock('@indus/ops-db', () => {
  const tx = {
    settingsEntry: {
      findUnique: async ({ where }: { where: { key: string } }) => {
        const r = h.rows.get(where.key)
        return r ? structuredClone(r) : null
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { key: string; version?: number; signoffStatus?: string }
        data: Record<string, unknown>
      }) => {
        const r = h.rows.get(where.key)
        if (h.raceOnce) {
          h.raceOnce = false
          if (r) r.version += 1
        }
        if (!r) return { count: 0 }
        if (where.version !== undefined && r.version !== where.version) return { count: 0 }
        if (where.signoffStatus !== undefined && r.signoffStatus !== where.signoffStatus) {
          return { count: 0 }
        }
        const { version, ...rest } = data as { version?: { increment: number } }
        Object.assign(r, rest)
        if (version) r.version += version.increment
        return { count: 1 }
      },
    },
    currency: {
      findMany: async ({ where }: { where: { code: { in: string[] } } }) =>
        where.code.in
          .filter((c) => ['AED', 'USD', 'EUR', 'GBP'].includes(c))
          .map((code) => ({ code })),
    },
    activityEvent: {
      createMany: async ({ data }: { data: unknown[] }) => {
        h.audit.push(...data)
        return { count: data.length }
      },
    },
  }
  return {
    opsDb: {
      $transaction: async (fn: (t: typeof tx) => Promise<unknown>) => {
        h.txCalls++
        // Roll back on failure: restore the rows and the audit log as they were.
        const snapshot = new Map([...h.rows].map(([k, v]) => [k, structuredClone(v)]))
        const auditLen = h.audit.length
        try {
          return await fn(tx)
        } catch (e) {
          h.rows = snapshot
          h.audit.length = auditLen
          throw e
        }
      },
    },
  }
})

const OWNER: OpsUser = {
  id: '00000000-0000-7000-8000-000000000001',
  email: 'owner@example.test',
  name: 'Owner Example',
  initials: 'OE',
  role: 'owner',
  canSeeMargins: true,
  canSendSupplierMail: true,
  canEditChaserRules: true,
}
// A Helper with every toggle on still cannot change an owner-only setting.
const HELPER: OpsUser = {
  ...OWNER,
  id: '00000000-0000-7000-8000-000000000002',
  email: 'helper@example.test',
  name: 'Helper Example',
  initials: 'HE',
  role: 'helper',
}

const PRICING = {
  marginPct: 18,
  floorPct: 12,
  hardMinPct: 5,
  rounding: { stepAed: 5, above: { thresholdAed: 5000, stepAed: 10 } },
  priceGuardPct: 25,
}

function seed() {
  h.rows = new Map<string, Row>([
    [
      'pricing.defaults',
      {
        key: 'pricing.defaults',
        value: PRICING,
        version: 0,
        ownerOnly: true,
        signoffStatus: 'awaiting',
        signedOffById: null,
        signedOffAt: null,
      },
    ],
    [
      'currency',
      {
        key: 'currency',
        value: { book: 'AED', quotation: ['AED', 'USD', 'EUR'], defaultQuotation: 'AED' },
        version: 3,
        ownerOnly: true,
        signoffStatus: 'not_required',
        signedOffById: null,
        signedOffAt: null,
      },
    ],
    [
      'setup.progress',
      {
        key: 'setup.progress',
        value: { welcomeSeenBy: [] },
        version: 0,
        ownerOnly: false,
        signoffStatus: 'not_required',
        signedOffById: null,
        signedOffAt: null,
      },
    ],
  ])
}

beforeEach(() => {
  seed()
  h.audit = []
  h.revalidated = []
  h.raceOnce = false
  h.txCalls = 0
})

async function refusal(p: Promise<unknown>): Promise<string> {
  try {
    await p
    return 'resolved'
  } catch (e) {
    return (e as Error).message
  }
}

describe('updateSetting', () => {
  it('saves a valid value, bumps the version, writes one audit row and purges the tag', async () => {
    const { updateSetting, settingSubjectId } = await import('./update')
    const next = { ...PRICING, marginPct: 20 }
    const change = await updateSetting('pricing.defaults', next, 0, OWNER)
    expect(change).toEqual({ key: 'pricing.defaults', version: 1, before: PRICING, after: next })
    expect(h.rows.get('pricing.defaults')).toMatchObject({
      value: next,
      version: 1,
      updatedById: OWNER.id,
    })
    expect(h.audit).toEqual([
      expect.objectContaining({
        actorKind: 'user',
        actorId: OWNER.id,
        subjectType: 'settings',
        subjectId: settingSubjectId('pricing.defaults'),
        kind: 'settings',
        field: 'pricing.defaults',
        before: PRICING,
        after: next,
        sensitive: true,
      }),
    ])
    expect(h.revalidated).toEqual([['ops:setting:pricing.defaults', { expire: 0 }]])
  })

  it('refuses a stale version with the plain sentence, writes nothing and purges nothing', async () => {
    const { updateSetting } = await import('./update')
    expect(
      await refusal(
        updateSetting(
          'currency',
          { book: 'AED', quotation: ['AED'], defaultQuotation: 'AED' },
          2,
          OWNER
        )
      )
    ).toBe('Someone changed this a moment ago. Reload and try again.')
    expect(h.rows.get('currency')?.version).toBe(3)
    expect(h.audit).toEqual([])
    expect(h.revalidated).toEqual([])
  })

  it('refuses when another write lands between the read and the version-guarded UPDATE', async () => {
    const { updateSetting } = await import('./update')
    h.raceOnce = true
    expect(await refusal(updateSetting('pricing.defaults', PRICING, 0, OWNER))).toBe(
      'Someone changed this a moment ago. Reload and try again.'
    )
    expect(h.audit).toEqual([])
    expect(h.revalidated).toEqual([])
  })

  it('refuses a Helper on an owner-only key, even with every toggle on', async () => {
    const { updateSetting } = await import('./update')
    const { safeMessage } = await import('../../lib/safe-message')
    let caught: unknown
    try {
      await updateSetting('pricing.defaults', PRICING, 0, HELPER)
    } catch (e) {
      caught = e
    }
    expect(safeMessage(caught)).toBe("You don't have access to do that.")
    expect(h.txCalls).toBe(0)
    expect(h.rows.get('pricing.defaults')?.version).toBe(0)
    expect(h.audit).toEqual([])
  })

  it('lets a Helper change setup.progress (not owner-only)', async () => {
    const { updateSetting } = await import('./update')
    const change = await updateSetting('setup.progress', { welcomeSeenBy: [HELPER.id] }, 0, HELPER)
    expect(change.version).toBe(1)
    expect(h.audit).toHaveLength(1)
  })

  it('refuses a value outside its schema with field errors keyed value.<field>', async () => {
    const { updateSetting, SettingInvalidError } = await import('./update')
    let caught: unknown
    try {
      await updateSetting('pricing.defaults', { ...PRICING, floorPct: 30 }, 0, OWNER)
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(SettingInvalidError)
    expect((caught as InstanceType<typeof SettingInvalidError>).fieldErrors).toEqual({
      'value.floorPct': 'The floor cannot be above the default margin.',
    })
    expect(h.audit).toEqual([])
  })

  it('refuses a currency that ops.currency does not hold', async () => {
    const { updateSetting } = await import('./update')
    const value = { book: 'AED', quotation: ['AED', 'XYZ'], defaultQuotation: 'AED' }
    expect(await refusal(updateSetting('currency', value, 3, OWNER))).toBe(
      'Check the highlighted fields.'
    )
    expect(h.rows.get('currency')?.version).toBe(3)
  })

  it('maps every key to one stable v8 uuid', async () => {
    const { settingSubjectId } = await import('./update')
    const id = settingSubjectId('pricing.defaults')
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-8[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(settingSubjectId('pricing.defaults')).toBe(id)
    expect(settingSubjectId('vat')).not.toBe(id)
  })
})

describe('markSignedOff', () => {
  it('lets the Owner sign off an awaiting key once, with an audit row and a purged tag', async () => {
    const { markSignedOff } = await import('./signoff')
    const out = await markSignedOff('pricing.defaults', OWNER)
    expect(out.alreadySignedOff).toBe(false)
    expect(h.rows.get('pricing.defaults')).toMatchObject({
      signoffStatus: 'signed_off',
      signedOffById: OWNER.id,
    })
    expect(h.audit).toEqual([
      expect.objectContaining({
        field: 'pricing.defaults.signoffStatus',
        before: 'awaiting',
        after: 'signed_off',
      }),
    ])
    expect(h.revalidated).toEqual([['ops:setting:pricing.defaults', { expire: 0 }]])

    const again = await markSignedOff('pricing.defaults', OWNER)
    expect(again.alreadySignedOff).toBe(true)
    expect(h.audit).toHaveLength(1)
  })

  it('refuses the Helper, a key that needs no sign-off, and a stale version', async () => {
    const { markSignedOff } = await import('./signoff')
    expect(await refusal(markSignedOff('pricing.defaults', HELPER))).toBe('Not allowed')
    expect(await refusal(markSignedOff('currency', OWNER))).toBe(
      'This setting does not need a sign-off.'
    )
    expect(await refusal(markSignedOff('pricing.defaults', OWNER, 4))).toBe(
      'Someone changed this a moment ago. Reload and try again.'
    )
    expect(h.rows.get('pricing.defaults')?.signoffStatus).toBe('awaiting')
    expect(h.audit).toEqual([])
  })
})
