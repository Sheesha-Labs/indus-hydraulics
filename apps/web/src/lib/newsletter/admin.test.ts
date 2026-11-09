import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NEWSLETTER_FROM_EMAIL } from '@indus/domain'
import { newsletterEmailHash } from './tokens'

// The admin service against a mocked Prisma client and mailer.

const dbMock = {
  newsletterSubscriber: { findMany: vi.fn(), updateMany: vi.fn(), groupBy: vi.fn() },
  newsletterSuppression: { findMany: vi.fn(), findUnique: vi.fn() },
  newsletterList: { findUnique: vi.fn(), update: vi.fn() },
  newsletterListImport: { create: vi.fn(), update: vi.fn() },
  newsletterListContact: { createMany: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn() },
  $transaction: vi.fn(),
}
const sendEmailBatch = vi.fn()

vi.mock('@indus/db', () => ({ db: dbMock, Prisma: {} }))
vi.mock('@indus/email', async () => {
  const actual = await vi.importActual<typeof import('@indus/email')>('@indus/email')
  return { ...actual, sendEmailBatch }
})
vi.mock('../email-branding', () => ({
  loadEmailBranding: async () => ({
    legalName: 'Indus Hydraulic Power Trading LLC',
    registeredAddressLines: ['Dubai'],
    replyTo: 'sales@indushydraulics.me',
  }),
}))

const {
  LIST_IMPORT_CONSENT,
  RESEND_CONFIRMATION_MAX,
  addContact,
  describeImport,
  exportFileName,
  importContacts,
  resendConfirmations,
  subscriberWhere,
  unsubscribeSubscriber,
} = await import('./admin')

const NOW = new Date('2026-11-09T12:00:00Z')

beforeEach(() => {
  vi.clearAllMocks()
  dbMock.newsletterList.findUnique.mockResolvedValue({ id: 'L1' })
  dbMock.newsletterSuppression.findMany.mockResolvedValue([])
  dbMock.newsletterSuppression.findUnique.mockResolvedValue(null)
  dbMock.newsletterListImport.create.mockResolvedValue({ id: 'I1' })
  dbMock.newsletterListContact.createMany.mockImplementation(async ({ data }: { data: unknown[] }) => ({ count: data.length }))
  dbMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 1 })
  dbMock.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === 'function' ? (arg as (tx: typeof dbMock) => unknown)(dbMock) : Promise.all(arg as unknown[]),
  )
  sendEmailBatch.mockResolvedValue({ ok: true, results: [], status: 'sent' })
})

describe('importContacts', () => {
  const base = { listId: 'L1', fileName: 'visitors.xlsx', consent: true, staffId: 'S1' }

  it('refuses without the consent statement, and writes nothing', async () => {
    const r = await importContacts({ ...base, consent: false, pairs: [['a@x.com', 'A']] })
    expect(r.status).toBe('error')
    expect(dbMock.newsletterListImport.create).not.toHaveBeenCalled()
    expect(dbMock.newsletterListContact.createMany).not.toHaveBeenCalled()
  })

  it('refuses a payload that is not [address, name] pairs', async () => {
    for (const pairs of [null, 'a@x.com', [['a@x.com']], [['a@x.com', 5]], [{ email: 'a@x.com' }]]) {
      expect((await importContacts({ ...base, pairs })).status).toBe('error')
    }
    expect(dbMock.newsletterListContact.createMany).not.toHaveBeenCalled()
  })

  it('re-parses on the server: lower-cases, drops junk and duplicates, leaves out suppressed addresses', async () => {
    dbMock.newsletterSuppression.findMany.mockResolvedValue([{ emailHash: newsletterEmailHash('gone@x.com') }])
    const r = await importContacts({
      ...base,
      pairs: [
        ['Jane@X.com', 'Jane'],
        ['jane@x.com', 'Jane again'],
        ['not-an-address', 'Bad'],
        ['GONE@x.com', 'Left before'],
        ['ali@y.com', ''],
      ],
    })
    expect(r.status).toBe('ok')
    const rows = dbMock.newsletterListContact.createMany.mock.calls[0]![0]
    expect(rows.skipDuplicates).toBe(true)
    expect(rows.data.map((d: { email: string }) => d.email)).toEqual(['jane@x.com', 'ali@y.com'])
    expect(rows.data[0]).toMatchObject({ listId: 'L1', name: 'Jane', source: 'upload', importId: 'I1', addedById: 'S1' })
    if (r.status === 'ok') {
      expect(r.report).toEqual({ rows: 5, added: 2, alreadyOnList: 0, suppressed: 1, invalid: 1, duplicates: 1, truncated: 0 })
    }
  })

  it('records the consent wording and who imported, and counts what was already on the list', async () => {
    dbMock.newsletterListContact.createMany.mockResolvedValue({ count: 1 })
    const r = await importContacts({ ...base, pairs: [['a@x.com', ''], ['b@x.com', '']] })
    expect(dbMock.newsletterListImport.create.mock.calls[0]![0].data).toMatchObject({
      listId: 'L1',
      consentText: LIST_IMPORT_CONSENT,
      importedById: 'S1',
      fileName: 'visitors.xlsx',
      rows: 2,
    })
    expect(r.status === 'ok' && r.report.alreadyOnList).toBe(1)
    expect(dbMock.newsletterListImport.update.mock.calls[0]![0]).toMatchObject({ where: { id: 'I1' }, data: { added: 1, alreadyOnList: 1 } })
  })

  it('never updates an existing contact — re-importing cannot revive someone who left', async () => {
    await importContacts({ ...base, pairs: [['a@x.com', '']] })
    expect(dbMock.newsletterListContact.updateMany).not.toHaveBeenCalled()
  })

  it('strips path characters from the file name', async () => {
    await importContacts({ ...base, fileName: '../../etc/<b>list</b>.csv', pairs: [['a@x.com', '']] })
    expect(dbMock.newsletterListImport.create.mock.calls[0]![0].data.fileName).toBe('....etcblistb.csv')
  })

  it('answers a missing list without writing', async () => {
    dbMock.newsletterList.findUnique.mockResolvedValue(null)
    expect((await importContacts({ ...base, pairs: [['a@x.com', '']] })).status).toBe('error')
    expect(dbMock.newsletterListImport.create).not.toHaveBeenCalled()
  })
})

describe('addContact', () => {
  it('adds a normalised address', async () => {
    expect(await addContact('L1', { email: ' Jane@X.com ', name: '  Jane   Doe ' }, 'S1')).toBe('added')
    expect(dbMock.newsletterListContact.createMany.mock.calls[0]![0].data[0]).toMatchObject({
      email: 'jane@x.com',
      name: 'Jane Doe',
      source: 'manual',
      addedById: 'S1',
    })
  })

  it('refuses a suppressed or malformed address, and reports a duplicate', async () => {
    dbMock.newsletterSuppression.findUnique.mockResolvedValueOnce({ reason: 'unsubscribed' })
    expect(await addContact('L1', { email: 'a@x.com', name: '' }, null)).toBe('suppressed')
    expect(await addContact('L1', { email: 'nope', name: '' }, null)).toBe('invalid')
    dbMock.newsletterListContact.createMany.mockResolvedValueOnce({ count: 0 })
    expect(await addContact('L1', { email: 'a@x.com', name: '' }, null)).toBe('already_on_list')
  })
})

describe('resendConfirmations', () => {
  it('only picks pending people last mailed over 24 hours ago, capped', async () => {
    dbMock.newsletterSubscriber.findMany.mockResolvedValue([])
    await resendConfirmations(null, NOW)
    const q = dbMock.newsletterSubscriber.findMany.mock.calls[0]![0]
    expect(q.where.status).toBe('pending')
    expect(q.where.OR).toEqual([{ confirmationSentAt: null }, { confirmationSentAt: { lt: new Date('2026-11-08T12:00:00Z') } }])
    expect(q.take).toBe(RESEND_CONFIRMATION_MAX)
  })

  it('sends fresh tokens through the batch API from the newsletter domain, skipping hard-suppressed addresses', async () => {
    dbMock.newsletterSubscriber.findMany.mockResolvedValue([
      { id: 'a', email: 'a@x.com' },
      { id: 'b', email: 'b@x.com' },
    ])
    dbMock.newsletterSuppression.findMany.mockResolvedValue([{ emailHash: newsletterEmailHash('b@x.com') }])
    const r = await resendConfirmations(['a', 'b'], NOW)
    expect(r).toEqual({ sent: 1, skipped: 1, failed: 0 })
    const [inputs, opts] = sendEmailBatch.mock.calls[0]!
    expect(inputs).toHaveLength(1)
    expect(inputs[0]).toMatchObject({ kind: 'newsletter_confirmation', to: ['a@x.com'], fromEmail: NEWSLETTER_FROM_EMAIL })
    expect(opts.idempotencyKey).toMatch(/^newsletter-resend-/)
    // The new token is claimed only while the row is still pending.
    expect(dbMock.newsletterSubscriber.updateMany.mock.calls[0]![0].where).toEqual({ id: 'a', status: 'pending' })
  })

  it('does not mail someone who confirmed between the read and the claim', async () => {
    dbMock.newsletterSubscriber.findMany.mockResolvedValue([{ id: 'a', email: 'a@x.com' }])
    dbMock.newsletterSubscriber.updateMany.mockResolvedValue({ count: 0 })
    expect(await resendConfirmations(['a'], NOW)).toEqual({ sent: 0, skipped: 1, failed: 0 })
    expect(sendEmailBatch).not.toHaveBeenCalled()
  })
})

describe('unsubscribeSubscriber', () => {
  it('only moves pending or confirmed rows', async () => {
    await unsubscribeSubscriber('id1', NOW)
    expect(dbMock.newsletterSubscriber.updateMany).toHaveBeenCalledWith({
      where: { id: 'id1', status: { in: ['pending', 'confirmed'] } },
      data: { status: 'unsubscribed', unsubscribedAt: NOW, confirmationTokenHash: null },
    })
  })
})

describe('subscriberWhere', () => {
  it('builds status, search and an inclusive date range, ignoring junk', () => {
    expect(subscriberWhere({ status: 'confirmed', q: ' Plant ', from: '2026-11-01', to: '2026-11-09' })).toEqual({
      status: 'confirmed',
      email: { contains: 'plant', mode: 'insensitive' },
      createdAt: { gte: new Date('2026-11-01T00:00:00.000Z'), lt: new Date('2026-11-10T00:00:00.000Z') },
    })
    expect(subscriberWhere({ status: 'deleted' as never, from: '01/11/2026', to: "'; drop" })).toEqual({})
    expect(subscriberWhere({ status: 'pending' }, { withStatus: false })).toEqual({})
  })
})

describe('describeImport and exportFileName', () => {
  it('says what happened', () => {
    expect(describeImport({ rows: 5, added: 2, alreadyOnList: 1, suppressed: 1, invalid: 1, duplicates: 0, truncated: 0 })).toBe(
      "2 added, 1 already on the list, 1 left out — unsubscribed or bounced before, 1 row wasn't an address",
    )
    expect(exportFileName('ADIPEC 2026 — Visitors!', NOW)).toBe('adipec-2026-visitors-2026-11-09.csv')
  })
})
