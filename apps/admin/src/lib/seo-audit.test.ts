import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Black-box test for `withSeoAudit`. We mock the `@indus/db` module so the
 * helper sees a fake `db.$transaction` + `tx.seoAuditLog.createMany`.
 * The goal is twofold:
 *
 *   1. Happy path: when `fn` resolves and `before !== after`, a
 *      `seoAuditLog.createMany` call is issued inside the SAME transaction
 *      callback (not on the global `db`).
 *   2. Rollback: when `fn` throws, the audit insert is never reached. The
 *      transaction itself is responsible for rolling back the partial state;
 *      the helper just must not attempt the audit insert.
 */

type CreateManyArgs = { data: Array<Record<string, unknown>> }

const createMany = vi.fn<(args: CreateManyArgs) => Promise<{ count: number }>>().mockResolvedValue({
  count: 0,
})

type TxCallback<T> = (tx: { seoAuditLog: { createMany: typeof createMany } }) => Promise<T>

const transaction = vi.fn(async <T,>(callback: TxCallback<T>): Promise<T> => {
  return callback({ seoAuditLog: { createMany } })
})

vi.mock('@indus/db', () => ({
  db: {
    $transaction: <T,>(cb: TxCallback<T>) => transaction(cb),
  },
  Prisma: { TransactionClient: undefined, InputJsonValue: undefined },
}))

import { withSeoAudit } from './seo-audit'

beforeEach(() => {
  createMany.mockClear()
  transaction.mockClear()
})

describe('withSeoAudit', () => {
  it('writes one audit row per changed field after fn resolves', async () => {
    await withSeoAudit(
      {
        entityType: 'product',
        entityId: 'prod-1',
        before: { seoTitle: 'old', seoDescription: 'same' },
        after: { seoTitle: 'new', seoDescription: 'same' },
        actorId: 'staff-1',
      },
      async () => {
        // entity update would happen here in real code
      },
    )

    expect(transaction).toHaveBeenCalledOnce()
    expect(createMany).toHaveBeenCalledOnce()
    const call = createMany.mock.calls[0]?.[0]
    expect(call?.data).toHaveLength(1)
    expect(call?.data[0]).toMatchObject({
      entityType: 'product',
      entityId: 'prod-1',
      field: 'seoTitle',
      before: 'old',
      after: 'new',
      actorId: 'staff-1',
    })
  })

  it('skips the audit insert when nothing changed', async () => {
    await withSeoAudit(
      {
        entityType: 'product',
        entityId: 'prod-1',
        before: { seoTitle: 'same' },
        after: { seoTitle: 'same' },
        actorId: null,
      },
      async () => undefined,
    )
    expect(createMany).not.toHaveBeenCalled()
  })

  it('does not write audit rows when fn throws (transaction rolls back)', async () => {
    await expect(
      withSeoAudit(
        {
          entityType: 'product',
          entityId: 'prod-1',
          before: { seoTitle: 'old' },
          after: { seoTitle: 'new' },
          actorId: 'staff-1',
        },
        async () => {
          throw new Error('update failed')
        },
      ),
    ).rejects.toThrow('update failed')
    expect(createMany).not.toHaveBeenCalled()
  })

  it('passes through the value fn returns', async () => {
    const result = await withSeoAudit(
      {
        entityType: 'global:seo_setting',
        entityId: null,
        before: { robotsTxt: 'a' },
        after: { robotsTxt: 'b' },
        actorId: 'staff-1',
        reason: 'manual edit',
      },
      async () => 42,
    )
    expect(result).toBe(42)
  })

  it('forwards the reason field to every audit row', async () => {
    await withSeoAudit(
      {
        entityType: 'product',
        entityId: 'prod-1',
        before: { seoTitle: 'a', seoDescription: 'x' },
        after: { seoTitle: 'b', seoDescription: 'y' },
        actorId: null,
        reason: 'reverted',
      },
      async () => undefined,
    )
    const call = createMany.mock.calls[0]?.[0]
    expect(call?.data.every((row) => row.reason === 'reverted')).toBe(true)
  })
})
