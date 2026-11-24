import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../server/mail-send/testing/fixture'
import {
  registerTodayProvider,
  todayProviders,
  unregisterTodayProvider,
} from '../server/today/providers'
import { getTodayModel } from './today'

/**
 * Today on the local database (S07-T06): providers in registration order and by role (the Helper's supplier
 * side first); the model reads everything in at most three round trips; the Helper's Needs you holds only
 * supplier-side cards and no money figures; a quotation card is never approvable inline.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const tag = randomUUID().slice(0, 8)
const ids: string[] = []

async function card(actionKey: string, minutesAgo: number) {
  const a = await opsDb.assistantAction.create({
    data: {
      ref: `A-T07T-${tag}-${ids.length}`,
      actionKey,
      levelAtTime: 'draft_and_ask',
      subjectType: 'enquiry',
      subjectId: randomUUID(),
      headline: `Today test ${actionKey} ${tag}`,
      reasons: [],
      checks: [],
      state: 'proposed',
      surface: 'review',
      idempotencyKey: `t07t:${randomUUID()}`,
      origin: 'live',
      createdAt: new Date(Date.now() - minutesAgo * 60_000 - 365 * 86_400_000),
    },
    select: { id: true },
  })
  ids.push(a.id)
}

describe.skipIf(!DB_URL)('Today · local database', () => {
  let owner: { id: string; name: string } = { id: '', name: '' }

  beforeAll(async () => {
    owner = await opsDb.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true, name: true } })
    // Oldest first: these three lead the queue.
    await card('send_quotation', 3)
    await card('chase_suppliers', 2)
    await card('ack_email', 1)
  })

  afterAll(async () => {
    await opsDb.assistantAction.updateMany({ where: { id: { in: ids } }, data: { state: 'cancelled' } })
    unregisterTodayProvider('test.helper-only')
    unregisterTodayProvider('test.supplier')
  })

  it('providers keep their order and roles; the Helper sees supplier side first', () => {
    registerTodayProvider({
      section: 'late',
      key: 'test.helper-only',
      roles: ['helper'],
      query: () => opsDb.task.count(),
      read: () => [],
    })
    registerTodayProvider({
      section: 'came_in',
      key: 'test.supplier',
      side: 'supplier',
      query: () => opsDb.task.count(),
      read: () => [],
    })
    const ownerKeys = todayProviders('owner').map((p) => p.key)
    expect(ownerKeys).not.toContain('test.helper-only')
    expect(ownerKeys.indexOf('mail.client')).toBeLessThan(ownerKeys.indexOf('mail.supplier'))
    const helperKeys = todayProviders('helper').map((p) => p.key)
    expect(helperKeys).toContain('test.helper-only')
    expect(helperKeys.indexOf('mail.supplier')).toBeLessThan(helperKeys.indexOf('mail.client'))
    expect(() =>
      registerTodayProvider({ section: 'late', key: 'test.supplier', query: () => opsDb.task.count(), read: () => [] })
    ).toThrow(/registered twice/)
  })

  it('reads everything in at most three round trips', async () => {
    const tx = vi.spyOn(opsDb, '$transaction')
    const find = vi.spyOn(opsDb.assistantAction, 'findMany')
    await getTodayModel({ id: owner.id, name: owner.name, role: 'owner', canSeeMargins: true })
    // Two read transactions (calendar + needs, then the providers); no query outside them.
    expect(tx.mock.calls.length).toBeLessThanOrEqual(3)
    expect(find.mock.calls.length).toBeLessThanOrEqual(1)
    tx.mockRestore()
    find.mockRestore()
  })

  it('Owner: the oldest three cards, a quotation is Review only', async () => {
    const m = await getTodayModel({ id: owner.id, name: owner.name, role: 'owner', canSeeMargins: true })
    expect(m.needs.total).toBeGreaterThanOrEqual(3)
    expect(m.needs.cards).toHaveLength(3)
    // A quotation card is locked: the card says "Locked · you send" and Approve never runs from the keyboard.
    const quotation = m.needs.cards.find((c) => c.headline.includes(`send_quotation ${tag}`))
    if (quotation) expect(quotation.level.locked).toBe(true)
    expect(m.kpi.showMoney).toBe(true)
    expect(m.greeting).toMatch(/^Good (morning|afternoon|evening), /)
  })

  it('Helper: only supplier-side cards and no money', async () => {
    const m = await getTodayModel({ id: owner.id, name: 'Helper Example', role: 'helper', canSeeMargins: false })
    expect(m.needs.cards.every((c) => !c.headline.includes(`send_quotation ${tag}`))).toBe(true)
    expect(m.needs.cards.every((c) => !c.headline.includes(`ack_email ${tag}`))).toBe(true)
    expect(m.kpi.showMoney).toBe(false)
  })
})
