import { afterAll, describe, expect, it } from 'vitest'
import { PrismaClient } from './index'

/**
 * Append-only proof (S06-T04, CLAUDE.md §11.7): connected as ops_app to the local Postgres, UPDATE and DELETE
 * fail on the trail tables, and DELETE fails on assistant_action. Grants and triggers do it, not code.
 *
 *   DATABASE_URL="postgresql://ops_app:…@localhost:54329/<db>?schema=ops" bun test src/append-only.test.ts
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
const TRAILS = [
  'assistant_action_event',
  'activity_event',
  'ai_call',
  'auth_event',
  'share_link_event',
  'zoho_sync_log',
] as const

describe.skipIf(!URL_)('append-only tables · local database as ops_app', () => {
  const db = new PrismaClient({ datasources: { db: { url: URL_! } } })

  afterAll(async () => {
    await db.$disconnect()
  })

  it.each(TRAILS)('%s rejects UPDATE and DELETE', async (t) => {
    // Inside a rolled-back transaction, so a missing guard would still change nothing.
    const attempt = (sql: string) =>
      db.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(sql)
        throw new Error('ROLLBACK: the statement was allowed')
      })
    await expect(
      attempt(`UPDATE ops.${t} SET "id" = "id" WHERE "id" = (SELECT "id" FROM ops.${t} LIMIT 1)`)
    ).rejects.toThrow(/permission denied|append-only|not allowed|immutable/i)
    await expect(
      attempt(`DELETE FROM ops.${t} WHERE "id" = (SELECT "id" FROM ops.${t} LIMIT 1)`)
    ).rejects.toThrow(/permission denied|append-only|not allowed/i)
  })

  it('assistant_action rejects DELETE', async () => {
    await expect(
      db.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(
          'DELETE FROM ops.assistant_action WHERE "id" = (SELECT "id" FROM ops.assistant_action LIMIT 1)'
        )
        throw new Error('ROLLBACK: the statement was allowed')
      })
    ).rejects.toThrow(/permission denied|append-only|not allowed/i)
  })
})
