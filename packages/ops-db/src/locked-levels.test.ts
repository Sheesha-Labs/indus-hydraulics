import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from './index'

/**
 * Locked levels in SQL (S07-T01, ADR-10): connected as ops_app to the local Postgres, ops.locked_level_guard()
 * refuses any level but the lock on #20 / #28, Never on an unlocked row and a level above a row's max. Inside
 * rolled-back transactions, so a missing guard would still change nothing.
 *
 *   DATABASE_URL="postgresql://ops_app:…@localhost:54329/<db>?schema=ops" bun test src/locked-levels.test.ts
 */
function localOpsAppUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    const u = new URL(raw)
    return ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname) && u.username === 'ops_app'
      ? raw
      : undefined
  } catch {
    return undefined
  }
}

const URL_ = localOpsAppUrl()
const REFUSED = /locked at|only valid for actions locked|allows at most|check_violation/i

describe.skipIf(!URL_)('locked Autopilot levels · local database as ops_app', () => {
  // Built in beforeAll: bun runs a skipped describe's body, and a client with no URL throws there.
  let db: PrismaClient
  beforeAll(() => {
    db = new PrismaClient({ datasources: { db: { url: URL_! } } })
  })

  afterAll(async () => {
    await db?.$disconnect()
  })

  const attempt = (sql: string) =>
    db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(sql)
      throw new Error('ROLLBACK: the statement was allowed')
    })

  it.each(['send_quotation', 'supplier_pos'])('%s cannot leave Draft and ask', async (key) => {
    for (const level of ['do_and_tell', 'do_quietly', 'suggest', 'off']) {
      await expect(
        attempt(`UPDATE ops.autopilot_setting SET level = '${level}' WHERE "actionKey" = '${key}'`)
      ).rejects.toThrow(REFUSED)
    }
  })

  it('supplier_payments cannot leave Never', async () => {
    await expect(
      attempt(
        `UPDATE ops.autopilot_setting SET level = 'draft_and_ask' WHERE "actionKey" = 'supplier_payments'`
      )
    ).rejects.toThrow(REFUSED)
  })

  it('Never is refused on a row not locked at Never', async () => {
    await expect(
      attempt(
        `UPDATE ops.autopilot_setting SET level = 'never' WHERE "actionKey" = 'extract_lines'`
      )
    ).rejects.toThrow(REFUSED)
  })

  it('a priced client send cannot go above its max', async () => {
    await expect(
      attempt(
        `UPDATE ops.autopilot_setting SET level = 'do_and_tell' WHERE "actionKey" = 'order_ack_proforma'`
      )
    ).rejects.toThrow(REFUSED)
  })

  it('an unlocked row still changes (inside the rolled-back transaction)', async () => {
    await expect(
      attempt(
        `UPDATE ops.autopilot_setting SET level = 'do_and_tell' WHERE "actionKey" = 'extract_lines'`
      )
    ).rejects.toThrow(/ROLLBACK: the statement was allowed/)
  })
})
