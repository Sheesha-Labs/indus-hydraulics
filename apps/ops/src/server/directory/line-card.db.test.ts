import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Line card and terms on the local database (S10-T06, board 52): each save is a new version with a diff in activity;
 * Activate is refused without the Owner's decision and without a category; a supplier on trial gets trial line
 * cards; an expired covering certificate suspends exactly the categories it covers and a valid one reinstates them.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))

const TAG = `lc${Date.now().toString(36)}`

describe.skipIf(!DB_URL)('line card · local database', () => {
  let lc: typeof import('./line-card')
  let ownerId = ''
  let supplierId = ''
  const trades: string[] = []

  beforeAll(async () => {
    lc = await import('./line-card')
    ownerId = (
      await opsDb.user.findFirstOrThrow({
        where: { role: 'owner', status: 'active' },
        select: { id: true },
      })
    ).id
    supplierId = (
      await opsDb.company.create({
        data: {
          name: `Example Hose Co ${TAG}`,
          isSupplier: true,
          supplierProfile: { create: { onboardingStatus: 'under_review' } },
        },
        select: { id: true },
      })
    ).id
    for (const n of ['A', 'B', 'C'])
      trades.push(
        (
          await opsDb.trade.create({
            data: { name: `Hose ${n} ${TAG}`, slug: `${TAG}-${n}` },
            select: { id: true },
          })
        ).id
      )
  })

  afterAll(async () => {
    await opsDb.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
    await opsDb.trade.updateMany({
      where: { id: { in: trades } },
      data: { archivedAt: new Date() },
    })
    await opsDb.$disconnect()
  })

  it('versions each save and logs the diff; Activate waits for the decision', async () => {
    const v1 = await opsDb.$transaction((tx) =>
      lc.saveLineCard(
        tx,
        supplierId,
        [
          {
            tradeId: trades[0]!,
            carried: true,
            authorised: false,
            specNote: 'EN 853 1SN/2SN',
            coveredByDocumentIds: [],
          },
          { tradeId: trades[1]!, carried: false, authorised: false, coveredByDocumentIds: [] },
        ],
        { id: ownerId }
      )
    )
    expect(v1.version).toBe(1)
    const cards = await opsDb.supplierLineCard.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'asc' },
    })
    expect(cards.map((c) => c.status)).toEqual(['proposed', 'not_carried'])
    const v2 = await opsDb.$transaction((tx) =>
      lc.saveLineCard(
        tx,
        supplierId,
        [
          {
            tradeId: trades[0]!,
            carried: true,
            authorised: false,
            specNote: 'EN 853 1SN',
            coveredByDocumentIds: [],
          },
        ],
        { id: ownerId }
      )
    )
    expect(v2.version).toBe(2)
    const log = await opsDb.activityEvent.findFirstOrThrow({
      where: { subjectId: supplierId, field: 'lineCard' },
      orderBy: { at: 'desc' },
    })
    expect(JSON.stringify(log.after)).toContain('EN 853 1SN')
    await expect(
      opsDb.$transaction((tx) => lc.activateSupplier(tx, supplierId, { id: ownerId }))
    ).rejects.toThrow(/approves the supplier first/)
  })

  it('a supplier approved on trial activates with trial line cards', async () => {
    await opsDb.supplierProfile.update({
      where: { companyId: supplierId },
      data: { onboardingStatus: 'approved_trial', tier: 'trial' },
    })
    const out = await opsDb.$transaction((tx) =>
      lc.activateSupplier(tx, supplierId, { id: ownerId })
    )
    expect(out.categories).toBe(1)
    const card = await opsDb.supplierLineCard.findFirstOrThrow({
      where: { supplierId, tradeId: trades[0]! },
    })
    expect(card.status).toBe('trial')
    await opsDb.$transaction((tx) =>
      lc.saveLineCard(
        tx,
        supplierId,
        [
          {
            tradeId: trades[2]!,
            carried: true,
            authorised: true,
            evidenceUrl: 'https://maker.example/locator',
            coveredByDocumentIds: [],
          },
        ],
        { id: ownerId }
      )
    )
    const c3 = await opsDb.supplierLineCard.findFirstOrThrow({
      where: { supplierId, tradeId: trades[2]! },
    })
    expect(c3).toMatchObject({ status: 'trial', authorised: true })
    expect(c3.verifiedAt).not.toBeNull()
  })

  it('an expired covering certificate suspends exactly its categories; a valid one reinstates them', async () => {
    const today = new Date(Date.UTC(2026, 10, 27))
    const old = await opsDb.complianceDocument.create({
      data: {
        companyId: supplierId,
        kind: 'approval',
        title: `DNV approval ${TAG}`,
        status: 'received',
        expiresAt: new Date(Date.UTC(2026, 9, 1)),
      },
      select: { id: true },
    })
    await opsDb.supplierLineCard.updateMany({
      where: { supplierId, tradeId: trades[0]! },
      data: { coveredByDocumentIds: [old.id] },
    })
    let page = await lc.suspendLapsedPage('', today)
    expect(page.suspended).toBeGreaterThanOrEqual(1)
    const a = await opsDb.supplierLineCard.findFirstOrThrow({
      where: { supplierId, tradeId: trades[0]! },
    })
    const c = await opsDb.supplierLineCard.findFirstOrThrow({
      where: { supplierId, tradeId: trades[2]! },
    })
    expect(a.status).toBe('suspended')
    expect(a.suspendedReason).toMatch(/expired 2026-10-01/)
    expect(c.status).toBe('trial')
    const fresh = await opsDb.complianceDocument.create({
      data: {
        companyId: supplierId,
        kind: 'approval',
        title: `DNV approval renewed ${TAG}`,
        status: 'received',
        expiresAt: new Date(Date.UTC(2028, 0, 1)),
      },
      select: { id: true },
    })
    await opsDb.supplierLineCard.updateMany({
      where: { supplierId, tradeId: trades[0]! },
      data: { coveredByDocumentIds: [old.id, fresh.id] },
    })
    page = await lc.suspendLapsedPage('', today)
    expect(page.reinstated).toBeGreaterThanOrEqual(1)
    expect(
      (
        await opsDb.supplierLineCard.findFirstOrThrow({
          where: { supplierId, tradeId: trades[0]! },
        })
      ).status
    ).toBe('trial')
  })
})
