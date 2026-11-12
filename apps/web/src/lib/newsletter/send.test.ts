import { beforeEach, describe, expect, it, vi } from 'vitest'
import { newsletterEmailHash } from './tokens'

// The sender against a mocked Prisma client and Resend. Ported in spirit
// from Bazar's send.test.ts, plus the duplicate-send rules Bazar lacked.

const dbMock = {
  newsletterCampaign: { findUnique: vi.fn(), updateMany: vi.fn() },
  newsletterDelivery: { findMany: vi.fn(), updateMany: vi.fn(), count: vi.fn(), groupBy: vi.fn() },
  newsletterSuppression: { findMany: vi.fn() },
  newsletterSettings: { findUnique: vi.fn() },
  newsletterList: { count: vi.fn() },
  $transaction: vi.fn(),
  $queryRaw: vi.fn(),
}
const sendCampaignBatch = vi.fn()

vi.mock('server-only', () => ({}))
vi.mock('@indus/db', () => ({ db: dbMock, Prisma: { sql: (s: TemplateStringsArray, ...v: unknown[]) => ({ s, v }) } }))
vi.mock('@indus/email', async () => {
  const actual = await vi.importActual<typeof import('@indus/email')>('@indus/email')
  return { ...actual, sendCampaignBatch }
})
vi.mock('../email-branding', () => ({
  loadEmailBranding: async () => ({ legalName: 'Indus Hydraulic Power Trading LLC', registeredAddressLines: ['Dubai'], replyTo: null }),
}))
vi.mock('../store-settings', () => ({ getStoreSettings: async () => ({ logoUrl: null, footerLogoUrl: null }) }))
vi.mock('./records', () => ({ resolveRecords: async () => new Map() }))

const { MAX_SEND_ATTEMPTS, batchKey, finishCampaign, pauseSeconds, sendBatch } = await import('./send')

const CAMPAIGN = {
  status: 'sending',
  subject: 'New in stock',
  preheader: '',
  format: 'blocks',
  design: { version: 1, settings: {}, blocks: [{ id: 'b1', type: 'heading', props: { heading: 'Hello' } }] },
  bodyHtml: '',
  dryRun: false,
}
const sub = (email: string, status = 'confirmed') => ({ email, status, unsubscribeToken: 'a'.repeat(48) })
const con = (email: string, status = 'active') => ({ email, status, unsubscribeToken: 'b'.repeat(48) })

beforeEach(() => {
  vi.clearAllMocks()
  dbMock.newsletterCampaign.findUnique.mockResolvedValue(CAMPAIGN)
  dbMock.newsletterSuppression.findMany.mockResolvedValue([])
  dbMock.newsletterSettings.findUnique.mockResolvedValue(null)
  dbMock.newsletterDelivery.updateMany.mockImplementation(async ({ where }: { where: { id?: { in?: string[] } | string } }) => ({
    count: typeof where.id === 'string' ? 1 : (where.id?.in?.length ?? 0),
  }))
  dbMock.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops))
  sendCampaignBatch.mockResolvedValue({ ok: true, providerIds: ['re_1', 're_2'], status: 'sent' })
})

describe('pace and keys', () => {
  it('spreads batches of 100 across the hour', () => {
    expect(pauseSeconds(600)).toBe(600)
    expect(pauseSeconds(6000)).toBe(60)
    expect(pauseSeconds(50)).toBe(3600)
  })

  it('keys a batch on its deliveries, whatever their order', () => {
    expect(batchKey('c1', ['b', 'a'])).toBe(batchKey('c1', ['a', 'b']))
    expect(batchKey('c1', ['a', 'b'])).not.toBe(batchKey('c1', ['a', 'c']))
    expect(batchKey('c1', ['a'])).not.toBe(batchKey('c2', ['a']))
  })
})

describe('sendBatch', () => {
  it('sends subscribers and list contacts with their own unsubscribe link and List-Unsubscribe headers', async () => {
    dbMock.newsletterDelivery.findMany.mockResolvedValue([
      { id: 'd1', subscriber: sub('a@x.com'), contact: null },
      { id: 'd2', subscriber: null, contact: con('b@y.com') },
    ])
    expect(await sendBatch('c1', ['d1', 'd2'])).toEqual({ sent: 2, skipped: 0, failed: 0 })
    const [inputs, opts] = sendCampaignBatch.mock.calls[0]!
    expect(inputs.map((i: { to: string[] }) => i.to[0])).toEqual(['a@x.com', 'b@y.com'])
    expect(inputs[0].headers['List-Unsubscribe']).toContain('a'.repeat(48))
    expect(inputs[1].html).toContain('b'.repeat(48))
    expect(inputs[1].html).toContain('mailing list') // the list-contact footer
    expect(inputs[0].fromEmail).toMatch(/@news\.indushydraulics\.com$/)
    expect(opts.idempotencyKey).toBe(batchKey('c1', ['d1', 'd2']))
    // Only rows still `sending` are moved to sent, with Resend's ids.
    const marks = dbMock.newsletterDelivery.updateMany.mock.calls.map(([a]) => a)
    expect(marks).toContainEqual(
      expect.objectContaining({ where: { id: 'd1', status: 'sending' }, data: expect.objectContaining({ status: 'sent', providerId: 're_1' }) }),
    )
  })

  it('only loads rows still in `sending`, so a retry after a partial success sends nothing twice', async () => {
    dbMock.newsletterDelivery.findMany.mockResolvedValue([])
    expect(await sendBatch('c1', ['d1'])).toEqual({ sent: 0, skipped: 0, failed: 0 })
    expect(dbMock.newsletterDelivery.findMany.mock.calls[0]![0].where).toMatchObject({ status: 'sending', campaignId: 'c1' })
    expect(sendCampaignBatch).not.toHaveBeenCalled()
  })

  it('skips anyone who left or is suppressed since the snapshot', async () => {
    dbMock.newsletterDelivery.findMany.mockResolvedValue([
      { id: 'd1', subscriber: sub('gone@x.com', 'unsubscribed'), contact: null },
      { id: 'd2', subscriber: null, contact: con('sup@x.com') },
      { id: 'd3', subscriber: sub('ok@x.com'), contact: null },
    ])
    dbMock.newsletterSuppression.findMany.mockResolvedValue([{ emailHash: newsletterEmailHash('sup@x.com') }])
    sendCampaignBatch.mockResolvedValue({ ok: true, providerIds: ['re_3'], status: 'sent' })
    const r = await sendBatch('c1', ['d1', 'd2', 'd3'])
    expect(r).toEqual({ sent: 1, skipped: 2, failed: 0 })
    expect(sendCampaignBatch.mock.calls[0]![0].map((i: { to: string[] }) => i.to[0])).toEqual(['ok@x.com'])
  })

  it('rehearses without calling Resend', async () => {
    dbMock.newsletterCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, dryRun: true })
    dbMock.newsletterDelivery.findMany.mockResolvedValue([{ id: 'd1', subscriber: sub('a@x.com'), contact: null }])
    expect((await sendBatch('c1', ['d1'])).sent).toBe(1)
    expect(sendCampaignBatch).not.toHaveBeenCalled()
  })

  it('throws on a provider failure while attempts remain, marks failed on the last', async () => {
    dbMock.newsletterDelivery.findMany.mockResolvedValue([{ id: 'd1', subscriber: sub('a@x.com'), contact: null }])
    sendCampaignBatch.mockResolvedValue({ ok: false, error: 'rate limited' })
    await expect(sendBatch('c1', ['d1'], 0)).rejects.toThrow(/rate limited/)
    expect(await sendBatch('c1', ['d1'], MAX_SEND_ATTEMPTS - 1)).toEqual({ sent: 0, skipped: 0, failed: 1 })
  })

  it('skips the batch of a cancelled campaign', async () => {
    dbMock.newsletterCampaign.findUnique.mockResolvedValue({ ...CAMPAIGN, status: 'cancelled' })
    dbMock.newsletterDelivery.findMany.mockResolvedValue([{ id: 'd1', subscriber: sub('a@x.com'), contact: null }])
    expect(await sendBatch('c1', ['d1'])).toEqual({ sent: 0, skipped: 1, failed: 0 })
    expect(sendCampaignBatch).not.toHaveBeenCalled()
  })
})

describe('finishCampaign', () => {
  const NOW = new Date('2026-11-09T12:00:00Z')

  it('fails orphaned rows instead of re-sending them, then closes when nothing is open', async () => {
    dbMock.newsletterDelivery.count.mockResolvedValue(0)
    dbMock.newsletterCampaign.updateMany.mockResolvedValue({ count: 1 })
    expect(await finishCampaign('c1', NOW)).toBe(true)
    const orphan = dbMock.newsletterDelivery.updateMany.mock.calls[0]![0]
    expect(orphan.where).toMatchObject({ campaignId: 'c1', status: 'sending', claimedAt: { lt: new Date('2026-11-09T11:30:00Z') } })
    expect(orphan.data.status).toBe('failed')
    expect(dbMock.newsletterCampaign.updateMany.mock.calls[0]![0]).toMatchObject({
      where: { id: 'c1', status: 'sending' },
      data: { status: 'sent', sentAt: NOW },
    })
  })

  it('stays open while anything is queued, and never marks a cancelled campaign sent', async () => {
    dbMock.newsletterDelivery.count.mockResolvedValue(3)
    expect(await finishCampaign('c1', NOW)).toBe(false)
    expect(dbMock.newsletterCampaign.updateMany).not.toHaveBeenCalled()
  })
})
