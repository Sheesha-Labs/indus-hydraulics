import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../server/mail-send/testing/fixture'

/**
 * Board 04 reads and moves on the local database (S09-T02). Enquiries are seeded under one owner of their own
 * (initials "zq") so the owner filter isolates them from everything else in the local database.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const { listPipeline, listEnquiries, CARDS_PER_COLUMN } = await import('./enquiries')
const { moveToGroup } = await import('../server/enquiry/pipeline')
const { parseEnquiriesSearch } = await import('../app/(console)/enquiries/search-params')

const TAG = `s09pl${Date.now()}`
const OWNER = { role: 'owner' as const, canSeeMargins: true }
const HELPER = { role: 'helper' as const, canSeeMargins: false }

describe.skipIf(!DB_URL)('enquiries pipeline · local database', () => {
  let userId = ''
  const ids: Record<string, string> = {}
  const created: string[] = []

  async function enquiry(stage: string, n: number, extra: Record<string, unknown> = {}) {
    const e = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2097-${String(Date.now()).slice(-6)}${n}`,
        title: `${TAG} ${stage} ${n}`,
        receivedVia: 'email',
        receivedAt: new Date(Date.now() - n * 60_000),
        deadline: new Date(Date.now() + (10 + n) * 86_400_000),
        ownerId: userId,
        stage: stage as never,
        estValueMax: String(1000 * (n + 1)),
        estCurrency: 'USD',
        lines: { create: [{ no: 1, description: 'x', qty: 1 }] },
        ...extra,
      },
      select: { id: true },
    })
    created.push(e.id)
    return e.id
  }

  beforeAll(async () => {
    const u = await opsDb.user.create({
      data: { email: `${TAG}@example.test`, name: 'Pipeline Tester', initials: 'ZQ', role: 'helper', status: 'active' },
      select: { id: true },
    })
    userId = u.id
    ids.new = await enquiry('new', 1)
    ids.chosen = await enquiry('qualifying', 2, { chosenPath: 'quote_fully' })
    ids.sourcing = await enquiry('sourcing', 3)
    ids.quotes = await enquiry('quotes_in', 4)
    ids.pricing = await enquiry('pricing', 5)
    ids.quoted = await enquiry('quoted', 6)
    ids.nego = await enquiry('negotiation', 7)
    ids.lost = await enquiry('lost', 8)
    for (let i = 0; i < CARDS_PER_COLUMN + 2; i++) await enquiry('sourcing', 100 + i)
  })

  afterAll(async () => {
    await opsDb.enquiry.updateMany({ where: { id: { in: created } }, data: { ownerId: null, closedAt: new Date() } })
    await opsDb.user.update({ where: { id: userId }, data: { status: 'removed' } }).catch(() => undefined)
    await opsDb.$disconnect()
  })

  it('groups by C7 column, caps each column at 50 and counts every card', async () => {
    const cols = await listPipeline({ owner: 'zq' }, OWNER)
    const by = Object.fromEntries(cols.map((c) => [c.key, c]))
    expect(cols.map((c) => c.key)).toEqual(['enquiry', 'sourcing', 'quotes_in', 'quoted', 'negotiation', 'won'])
    expect(by.enquiry!.count).toBe(2)
    expect(by.quotes_in!.cards.map((c) => c.stage).sort()).toEqual(['pricing', 'quotes_in'])
    expect(by.sourcing!.count).toBe(CARDS_PER_COLUMN + 3)
    expect(by.sourcing!.cards).toHaveLength(CARDS_PER_COLUMN)
    expect(by.won!.count).toBe(0)
    // Soonest deadline first.
    expect(by.enquiry!.cards[0]!.title).toContain('new 1')
    expect(by.enquiry!.total).toBe('$5K')
    const card = by.enquiry!.cards.find((c) => c.id === ids.chosen)!
    expect(card).toMatchObject({ covLabel: '0 / 1 sent', cov: 0, value: '$3K', moves: ['sourcing'] })
    expect(by.enquiry!.cards.find((c) => c.id === ids.new)!.moves).toEqual([])
    expect(by.negotiation!.cards[0]!.canWin).toBe(true)
  })

  it('masks values for a Helper without the flag', async () => {
    const cols = await listPipeline({ owner: 'zq' }, HELPER)
    expect(cols.every((c) => c.total === '' && c.cards.every((x) => x.value === null))).toBe(true)
    const page = await listEnquiries(parseEnquiriesSearch({ view: 'table', owner: 'zq', sort: 'value' }), HELPER)
    expect(page.rows.every((r) => r.value === null)).toBe(true)
  })

  it('table: keyset pages of 50 with filter counts and no repeats', async () => {
    const s = parseEnquiriesSearch({ view: 'table', owner: 'zq' })
    const p1 = await listEnquiries(s, OWNER)
    expect(p1.rows).toHaveLength(50)
    expect(p1.nextCursor).not.toBeNull()
    expect(p1.counts).toMatchObject({ enquiry: 2, sourcing: CARDS_PER_COLUMN + 3, quotes_in: 2, ended: 1 })
    expect(p1.counts.all).toBe(8 + CARDS_PER_COLUMN + 2)
    const p2 = await listEnquiries({ ...s, cursor: p1.nextCursor! }, OWNER)
    expect(p2.rows.length).toBe(p1.counts.all - 50)
    expect(p2.nextCursor).toBeNull()
    const seen = new Set([...p1.rows, ...p2.rows].map((r) => r.id))
    expect(seen.size).toBe(p1.counts.all)
    // Deadline ascending across the page boundary.
    expect(p1.rows.at(-1)!.due).toBeDefined()
    const filtered = await listEnquiries(parseEnquiriesSearch({ view: 'table', owner: 'zq', stage: 'quotes_in' }), OWNER)
    expect(filtered.rows.map((r) => r.id).sort()).toEqual([ids.quotes, ids.pricing].sort())
    const byValue = await listEnquiries(parseEnquiriesSearch({ view: 'table', owner: 'zq', sort: 'value' }), OWNER)
    expect(byValue.rows[0]!.title).toContain('sourcing 151')
    const v2 = await listEnquiries(
      parseEnquiriesSearch({ view: 'table', owner: 'zq', sort: 'value', cursor: byValue.nextCursor! }),
      OWNER
    )
    expect(new Set([...byValue.rows, ...v2.rows].map((r) => r.id)).size).toBe(p1.counts.all)
    const q = await listEnquiries(parseEnquiriesSearch({ view: 'table', owner: 'zq', q: 'negotiation 7' }), OWNER)
    expect(q.rows.map((r) => r.id)).toEqual([ids.nego])
  })

  async function move(id: string, toGroup: string, role: 'owner' | 'helper' = 'owner') {
    const user = { id: '', role }
    const version = (await opsDb.enquiry.findUniqueOrThrow({ where: { id } })).version
    return opsDb.$transaction((tx) =>
      moveToGroup(tx, { enquiryId: id, toGroup: toGroup as never, version }, { ...user, id: userId })
    )
  }

  it('moves only where the machine allows, with its reason otherwise', async () => {
    await expect(move(ids.new!, 'sourcing')).rejects.toThrow('Choose a path on the qualification card first')
    await expect(move(ids.new!, 'quoted')).rejects.toThrow('New cannot move to Quoted')
    expect(await move(ids.new!, 'won')).toMatchObject({ kind: 'won', message: 'Record the client PO to mark it Won' })
    expect(await move(ids.chosen!, 'sourcing')).toMatchObject({ kind: 'moved', from: 'qualifying', to: 'sourcing' })
    expect(await move(ids.sourcing!, 'quotes_in')).toMatchObject({ kind: 'moved', to: 'quotes_in' })
    await expect(move(ids.quotes!, 'sourcing')).rejects.toThrow(/re-sourced/)
    await expect(move(ids.pricing!, 'quoted')).rejects.toThrow('Send the quotation first')
    expect(await move(ids.quoted!, 'negotiation')).toMatchObject({ kind: 'moved', to: 'negotiation' })
    expect(await move(ids.nego!, 'quotes_in')).toMatchObject({ kind: 'moved', to: 'pricing' })
    await expect(move(ids.lost!, 'enquiry', 'helper')).rejects.toThrow(
      'Only the Owner reopens an enquiry'
    )
    expect(await move(ids.lost!, 'enquiry')).toMatchObject({ kind: 'moved', to: 'qualifying' })
    // A stale version is a conflict, not a silent overwrite.
    const stale = (await opsDb.enquiry.findUniqueOrThrow({ where: { id: ids.quoted! } })).version - 1
    await expect(
      opsDb.$transaction((tx) =>
        moveToGroup(tx, { enquiryId: ids.quoted!, toGroup: 'quotes_in', version: stale }, { id: userId, role: 'owner' })
      )
    ).rejects.toThrow('Someone changed this a moment ago')
  })
})
