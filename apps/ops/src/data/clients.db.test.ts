import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../server/mail-send/testing/fixture'

/**
 * Boards 11 and 12 reads on the local database (S10-T02): the view's ranking and KPI row, filters, the profile's
 * lists, and margin masking for a Helper without canSeeMargins. The seed quotes in BHD so `ccy=BHD` isolates it.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

describe.skipIf(!DB_URL)('clients · local database', () => {
  let seed: import('../server/directory/testing/clients-seed').ClientsSeed
  let data: typeof import('./clients')
  let seeder: typeof import('../server/directory/testing/clients-seed')

  beforeAll(async () => {
    seeder = await import('../server/directory/testing/clients-seed')
    data = await import('./clients')
    // A previous run's rows are archived; only this seed quotes in BHD now.
    await opsDb.$executeRaw`UPDATE ops.company c SET "archivedAt" = now() FROM ops.client_profile p
      WHERE p."companyId" = c.id AND p."quotingCurrency" = 'BHD' AND c."archivedAt" IS NULL`.catch(() => undefined)
    seed = await seeder.seedClients(opsDb, `cdb${Date.now()}`)
  })

  afterAll(async () => {
    await seeder.archiveClients(opsDb, seed)
    await opsDb.$disconnect()
  })

  it('ranks by enquiry flow and totals the KPI row from the view', async () => {
    const list = await data.listClients({ filter: 'all', ccy: 'BHD' })
    expect(list.total).toBe(6)
    expect(list.rows[0]!.id).toBe(seed.clientIds[0]) // five enquiries this year
    const counts = list.rows.map((r) => r.enquiries)
    expect([...counts].sort((a, b) => b - a)).toEqual(counts)
    expect(list.kpis.active).toBe(6)
    expect(list.rows.find((r) => r.id === seed.clientIds[1])!.win).toBe('37%')
  })

  it('filters by credit hold', async () => {
    await opsDb.clientProfile.update({ where: { companyId: seed.clientIds[2]! }, data: { creditHold: true } })
    const held = await data.listClients({ filter: 'credit_hold', ccy: 'BHD' })
    expect(held.rows.map((r) => r.id)).toEqual([seed.clientIds[2]])
    expect(held.rows[0]!.creditHold).toBe(true)
  })

  it('reads the profile and masks margins for a Helper without canSeeMargins', async () => {
    const owner = await data.getClientPage(seed.clientIds[0]!, { role: 'owner', canSeeMargins: false })
    expect(owner!.enquiries).toHaveLength(5)
    expect(owner!.quotations).toHaveLength(6)
    expect(owner!.quotations[0]!.margin).toBe('16.1%')
    expect(owner!.kpis.avgMargin).not.toBeNull()
    expect(owner!.buys[0]!.label).toBe('Seals & gaskets')
    expect(owner!.lostReasons).toEqual([{ label: 'Price', count: 1 }])
    expect(owner!.contacts).toHaveLength(3)
    const helper = await data.getClientPage(seed.clientIds[0]!, { role: 'helper', canSeeMargins: false })
    expect(helper!.kpis.avgMargin).toBeNull()
    expect(helper!.quotations.every((q) => q.margin === null)).toBe(true)
    const allowed = await data.getClientPage(seed.clientIds[0]!, { role: 'helper', canSeeMargins: true })
    expect(allowed!.kpis.avgMargin).not.toBeNull()
  })

  it('returns null for a company that is not a client', async () => {
    const s = await opsDb.company.create({ data: { name: 'Example Valve Co cdb', isSupplier: true }, select: { id: true } })
    expect(await data.getClientPage(s.id, { role: 'owner', canSeeMargins: true })).toBeNull()
    await opsDb.company.delete({ where: { id: s.id } })
  })
})
