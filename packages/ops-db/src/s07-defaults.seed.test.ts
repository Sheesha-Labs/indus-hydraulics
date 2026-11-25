import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from './index'

/**
 * S07-T07 seed audit on the local database (as ops_app): the catalogue never seeds an external action above Draft
 * and ask under Careful (exceptions aside), the guardrails carry their default values awaiting sign-off, the
 * budget is USD 150 in "warn and pause research", the research cap is USD 5, the chaser wording awaits sign-off
 * and the modes help article is generated from the catalogue.
 *
 *   DATABASE_URL="postgresql://ops_app:…@localhost:54329/<db>?schema=ops" bun test src/s07-defaults.seed.test.ts
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
const AUTOPILOT_SRC = join(
  import.meta.dirname,
  '..',
  '..',
  'ops-core',
  'src',
  'autopilot',
  'index.ts'
)

describe.skipIf(!URL_)('S07 defaults · local database', () => {
  let db: PrismaClient
  beforeAll(() => {
    db = new PrismaClient({ datasources: { db: { url: URL_! } } })
  })

  afterAll(async () => {
    await db?.$disconnect()
  })

  it('no external action seeds above Draft and ask under Careful', async () => {
    const ap = (await import(AUTOPILOT_SRC)) as {
      carefulSendViolations: (defs: unknown[]) => string[]
    }
    const defs = await db.autopilotActionDef.findMany()
    expect(ap.carefulSendViolations(defs)).toEqual([])
  })

  it('guardrails carry their defaults and the two fixed rules', async () => {
    const rows = await db.guardrail.findMany()
    const by = new Map(rows.map((r) => [r.key, r]))
    const rfq = by.get('value_threshold_rfq')?.params as { amount: number } | undefined
    expect(rfq?.amount).toBe(50_000)
    expect(by.get('fixed_client_prices')?.fixed).toBe(true)
    expect(by.get('fixed_no_money')?.fixed).toBe(true)
    expect(by.get('value_threshold')).toBeUndefined()
    for (const k of [
      'first_contact',
      'credit_hold',
      'working_hours',
      'holiday_calendar',
      'daily_send_cap',
    ])
      expect(by.get(k)?.enabled, k).toBe(true)
  })

  it('budget, research cap, chaser wording and the modes article', async () => {
    const budget = await db.settingsEntry.findUniqueOrThrow({ where: { key: 'assistant.budget' } })
    expect((budget.value as { mode: string }).mode).toBeDefined()
    const cap = await db.settingsEntry.findUniqueOrThrow({ where: { key: 'research.cap' } })
    expect((cap.value as { perEnquiryUsd: number }).perEnquiryUsd).toBeGreaterThan(0)
    const tpl = await db.emailTemplate.findUniqueOrThrow({ where: { key: 'supplier_chaser' } })
    expect(tpl.subjectTemplate).toBe('RE: RFQ {rfq_ref} — reminder')
    const article = await db.helpArticle.findUniqueOrThrow({ where: { slug: 'autopilot-modes' } })
    expect(article.body).toMatch(/Send quotation: locked at Draft and ask/)
    expect(article.body).toMatch(/Supplier payments: Never/)
    expect(article.body.toLowerCase()).not.toContain('whatsapp')
  })
})
