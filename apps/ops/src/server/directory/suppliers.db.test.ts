import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Suppliers on the local database (S10-T03): the nightly figures (pages, a material change asks for a summary only
 * with 3+ replies), the board-128 search by part number and the category filter through sub-trades, the profile's
 * bank masking (last 4 for the Owner, status only for the Helper; no IBAN anywhere in what a data function returns).
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const TAG = `sdb${Date.now().toString(36)}`

describe.skipIf(!DB_URL)('suppliers · local database', () => {
  let stats: typeof import('./supplier-stats')
  let data: typeof import('../../data/suppliers')
  let seeder: typeof import('./testing/suppliers-seed')
  let seed: import('./testing/suppliers-seed').SuppliersSeed
  let enquiryId = ''
  let supplierId = ''

  beforeAll(async () => {
    stats = await import('./supplier-stats')
    data = await import('../../data/suppliers')
    seeder = await import('./testing/suppliers-seed')
    seed = await seeder.seedSuppliers(opsDb, TAG)
    supplierId = seed.supplierIds[3]! // Sample Bearings LLC
    const e = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2095-${Date.now().toString().slice(-6)}`,
        title: TAG,
        receivedVia: 'email',
        receivedAt: new Date(),
      },
      select: { id: true },
    })
    enquiryId = e.id
    const rfq = await opsDb.supplierRfq.create({
      data: {
        ref: `IH-RFQ-2095-P${Date.now().toString().slice(-5)}`,
        enquiryId,
        status: 'sent' as never,
      },
      select: { id: true },
    })
    const sent = new Date(Date.now() - 5 * 86_400_000)
    for (let k = 0; k < 4; k++)
      await opsDb.supplierRfqRecipient.create({
        data: {
          rfqId:
            k === 0
              ? rfq.id
              : (
                  await opsDb.supplierRfq.create({
                    data: {
                      ref: `IH-RFQ-2095-P${Date.now().toString().slice(-5)}9${k}`,
                      enquiryId,
                      status: 'sent' as never,
                    },
                    select: { id: true },
                  })
                ).id,
          supplierId,
          status: k < 3 ? 'quoted' : 'no_reply',
          sentAt: sent,
          repliedAt: k < 3 ? new Date(sent.getTime() + (k + 1) * 24 * 3_600_000) : null,
        },
      })
    const q = await opsDb.supplierQuote.create({
      data: { enquiryId, supplierId, receivedAt: new Date(), rfqId: rfq.id, status: 'confirmed' },
      select: { id: true },
    })
    await opsDb.supplierQuoteLine.create({ data: { quoteId: q.id, offeredPartNo: '6316-C3' } })
  })

  afterAll(async () => {
    await seeder.archiveSuppliers(opsDb, seed)
    await opsDb.enquiry.update({ where: { id: enquiryId }, data: { closedAt: new Date() } })
    await opsDb.$disconnect()
  })

  it('computes the figures in pages and asks for a summary only on a material change with 3+ replies', async () => {
    await opsDb.supplierProfile.update({
      where: { companyId: supplierId },
      data: { replyRatePct: null, medianReplyHours: null, posCount: 0 },
    })
    let cursor = ''
    const summarise: string[] = []
    let pages = 0
    for (;;) {
      const page = await stats.refreshSupplierStatsPage(cursor)
      summarise.push(...page.summarise)
      pages++
      if (!page.nextCursor) break
      cursor = page.nextCursor
    }
    expect(pages).toBeGreaterThanOrEqual(1)
    const p = await opsDb.supplierProfile.findUniqueOrThrow({ where: { companyId: supplierId } })
    expect(p.rfqsAsked).toBe(4)
    expect(p.repliesCount).toBe(3)
    expect(Number(p.replyRatePct)).toBe(75)
    expect(Number(p.medianReplyHours)).toBe(48)
    expect(p.reliabilityAt).not.toBeNull()
    expect(summarise).toContain(supplierId)
    // Unchanged figures the second night: no new summary.
    const again = await stats.refreshSupplierStatsPage('')
    expect(again.summarise).not.toContain(supplierId)
  })

  it('finds the suppliers who quoted a part number, whatever its spelling', async () => {
    const list = await data.listSuppliers(data.suppliersSearchSchema.parse({ q: '6316 C3' }))
    expect(list.rows.map((r) => r.id)).toContain(supplierId)
    expect(list.partNote).toMatch(/matches 1 supplier who quoted it/)
    const none = await data.listSuppliers(data.suppliersSearchSchema.parse({ q: 'ZZ-99999-Q' }))
    expect(none.partNote).toMatch(/No supplier has quoted/)
  })

  it('filters by a parent category through its sub-trades, and counts tiers', async () => {
    const list = await data.listSuppliers(
      data.suppliersSearchSchema.parse({ trade: seed.parityTradeId })
    )
    expect(list.total).toBe(14)
    expect(list.tierCounts.blocked).toBe(1)
    const fast = await data.listSuppliers(
      data.suppliersSearchSchema.parse({ trade: seed.parityTradeId, fast: '1' })
    )
    expect(fast.rows.every((r) => r.median !== null)).toBe(true)
  })

  it('masks bank details: last 4 for the Owner, status only for the Helper, never an IBAN', async () => {
    await opsDb.supplierBankAccount.create({
      data: {
        supplierId: seed.profileId,
        bankName: 'TEST BANK',
        accountName: 'Sample Instruments Ltd',
        ibanEnc: Buffer.from('sealed'),
        ibanLast4: '5432',
        status: 'verified',
      },
    })
    const owner = await data.getSupplierProfile(seed.profileId, { role: 'owner' })
    expect(owner!.bank).toMatchObject({
      name: 'TEST BANK',
      masked: '•••• 5432',
      status: 'Verified',
    })
    const helper = await data.getSupplierProfile(seed.profileId, { role: 'helper' })
    expect(helper!.bank).toMatchObject({ name: null, masked: null, status: 'Verified' })
    expect(JSON.stringify(owner)).not.toMatch(/ibanEnc|sealed/)
    await opsDb.supplierBankAccount.deleteMany({ where: { supplierId: seed.profileId } })
  })
})
