import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Directory services against the local database (S10-T01): companies and contacts, the matcher (merged → survivor,
 * free mail never identifies), merge (every relation moved, snapshot written), the blocked matcher and Owner-only
 * profile fields. Neutral names only.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))

const TAG = `s10d${Date.now().toString(36)}`
const dom = (n: string) => `${TAG}-${n}.example`

describe.skipIf(!DB_URL)('directory services · local database', () => {
  let company: typeof import('./company')
  let contact: typeof import('./contact')
  let match: typeof import('./match-company')
  let merge: typeof import('./merge')
  let blocked: typeof import('./blocked')
  let profiles: typeof import('./profiles')
  let ownerId = ''
  let helperId = ''
  const companies: string[] = []
  const owner = () => ({ id: ownerId, role: 'owner' as const })
  const helper = () => ({ id: helperId, role: 'helper' as const })
  const actor = () => ({ kind: 'user' as const, id: ownerId })

  beforeAll(async () => {
    process.env.OPS_TOKEN_KEYS ??= JSON.stringify({ t1: Buffer.alloc(32, 7).toString('base64') })
    process.env.OPS_TOKEN_KEY_ACTIVE ??= 't1'
    company = await import('./company')
    contact = await import('./contact')
    match = await import('./match-company')
    merge = await import('./merge')
    blocked = await import('./blocked')
    profiles = await import('./profiles')
    const users = await opsDb.user.findMany({
      select: { id: true, role: true },
      where: { status: 'active' },
    })
    ownerId = users.find((u) => u.role === 'owner')!.id
    helperId = users.find((u) => u.role === 'helper')?.id ?? ownerId
  })

  afterAll(async () => {
    const ids = companies
    await opsDb.supplierBankAccount.deleteMany({ where: { supplierId: { in: ids } } })
    await opsDb.supplierLineCard.deleteMany({ where: { supplierId: { in: ids } } })
    await opsDb.enquiry.deleteMany({ where: { clientId: { in: ids } } })
    await opsDb.contact.deleteMany({ where: { companyId: { in: ids } } })
    await opsDb.clientProfile.deleteMany({ where: { companyId: { in: ids } } })
    await opsDb.supplierProfile.deleteMany({ where: { companyId: { in: ids } } })
    await opsDb.company.updateMany({ where: { id: { in: ids } }, data: { mergedIntoId: null } })
    await opsDb.company.deleteMany({ where: { id: { in: ids } } })
    await opsDb.$disconnect()
  })

  async function make(
    name: string,
    roles: { client?: boolean; supplier?: boolean },
    domains: string[] = []
  ) {
    const c = await opsDb.$transaction((tx) =>
      company.createCompany(tx, { name, roles, domains }, actor())
    )
    companies.push(c.id)
    return c.id
  }

  it('creates a company with the profile rows for its roles and clean domains', async () => {
    const id = await make(`Example Valve Co ${TAG}`, { client: true, supplier: true }, [
      `https://www.${dom('a')}/x`,
      `mail.${dom('a')}`,
    ])
    const c = await opsDb.company.findUniqueOrThrow({
      where: { id },
      select: { domains: true, primaryDomain: true, clientProfile: true, supplierProfile: true },
    })
    expect(c.domains).toEqual([dom('a')])
    expect(c.primaryDomain).toBe(dom('a'))
    expect(c.clientProfile).not.toBeNull()
    expect(c.supplierProfile?.tier).toBe('contact_only')
    await expect(
      opsDb.$transaction((tx) => company.addDomain(tx, id, dom('a'), actor()))
    ).resolves.toBeUndefined()
  })

  it('upserts one contact per address; a directory listing never downgrades a verified contact', async () => {
    const id = await make(`Sample Client ${TAG}`, { client: true })
    const a = await opsDb.$transaction((tx) =>
      contact.upsertContact(
        tx,
        { companyId: id, email: `Buyer@${dom('b')}`, name: 'Pat Buyer', sourceKind: 'manual' },
        actor()
      )
    )
    const b = await opsDb.$transaction((tx) =>
      contact.upsertContact(
        tx,
        { companyId: id, email: `buyer@${dom('b')}`, sourceKind: 'directory_only' },
        actor()
      )
    )
    expect(a.created).toBe(true)
    expect(b).toEqual({ id: a.id, created: false })
    const row = await opsDb.contact.findUniqueOrThrow({
      where: { id: a.id },
      select: { sourceKind: true, firstName: true },
    })
    expect(row).toEqual({ sourceKind: 'manual', firstName: 'Pat' })
    await expect(
      opsDb.$transaction((tx) =>
        contact.upsertContact(
          tx,
          { companyId: id, email: 'x@y', sourceKind: 'verified_on_page' },
          actor()
        )
      )
    ).rejects.toThrow()
  })

  it('free-mail domains never identify a company; a unique domain does', async () => {
    const id = await make(`Example Pumps ${TAG}`, { supplier: true }, [dom('c')])
    expect((await match.matchCompanyBySender(`someone@gmail.com`)).match).toBeNull()
    const r = await match.matchCompanyBySender(`sales@mail.${dom('c')}`)
    expect(r.match?.companyId).toBe(id)
    expect(r.match?.basis).toBe('sender_domain')
  })

  it('merges every relation onto the survivor; mail from the merged domain links to the survivor', async () => {
    const survivor = await make(`Example Seals ${TAG}`, { supplier: true }, [dom('s')])
    const merged = await make(`Example Seals Trading ${TAG}`, { client: true, supplier: true }, [
      dom('m'),
    ])
    const twinEmail = `sales@${dom('s')}`
    await opsDb.contact.create({
      data: { companyId: survivor, email: twinEmail, sourceKind: 'manual' },
    })
    const twin = await opsDb.contact.create({
      data: { companyId: merged, email: twinEmail, sourceKind: 'manual' },
      select: { id: true },
    })
    const own = await opsDb.contact.create({
      data: { companyId: merged, email: `ops@${dom('m')}`, sourceKind: 'manual' },
      select: { id: true },
    })
    const enquiry = await opsDb.enquiry.create({
      data: {
        ref: `ENQ-2098-${Date.now().toString().slice(-6)}`,
        title: `${TAG} merge`,
        receivedVia: 'email',
        receivedAt: new Date(),
        clientId: merged,
        contactId: twin.id,
      },
      select: { id: true },
    })
    await opsDb.supplierLineCard.create({
      data: { supplierId: merged, brand: 'Generic', evidenceUrl: 'https://example.test/l' },
    })
    await opsDb.supplierLineCard.create({ data: { supplierId: survivor, brand: 'Generic' } })

    const out = await merge.mergeCompaniesNow(survivor, merged, owner())
    expect(out.contactsMerged).toBe(1)
    const e = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: enquiry.id },
      select: { clientId: true, contactId: true },
    })
    expect(e.clientId).toBe(survivor)
    expect(e.contactId).not.toBe(twin.id)
    expect((await opsDb.contact.findUniqueOrThrow({ where: { id: own.id } })).companyId).toBe(
      survivor
    )
    const cards = await opsDb.supplierLineCard.findMany({ where: { supplierId: survivor } })
    expect(cards).toHaveLength(1)
    expect(cards[0]!.evidenceUrl).toBe('https://example.test/l')
    const s = await opsDb.company.findUniqueOrThrow({
      where: { id: survivor },
      select: { domains: true, aliases: true, isClient: true, clientProfile: true },
    })
    expect(s.domains.sort()).toEqual([dom('m'), dom('s')].sort())
    expect(s.aliases).toContain(`Example Seals Trading ${TAG}`)
    expect(s.isClient).toBe(true)
    expect(s.clientProfile).not.toBeNull()
    const snap = await opsDb.activityEvent.findFirst({
      where: { subjectId: survivor, field: 'merge' },
    })
    expect(
      (snap!.before as { moved: Record<string, string[]> }).moved['enquiry.clientId']
    ).toContain(enquiry.id)
    // Matching: the merged company's address and domain resolve to the survivor.
    expect((await match.matchCompanyBySender(`ops@${dom('m')}`)).match?.companyId).toBe(survivor)
    expect((await match.matchCompanyBySender(`new@${dom('m')}`)).match?.companyId).toBe(survivor)
    expect(await match.resolveSurvivor(merged)).toBe(survivor)
    await expect(merge.mergeCompaniesNow(survivor, merged, owner())).rejects.toThrow()
  })

  it('a Helper cannot merge a supplier with verified bank details', async () => {
    const a = await make(`Example Gauges ${TAG}`, { supplier: true })
    const b = await make(`Example Gauges Two ${TAG}`, { supplier: true })
    await opsDb.supplierBankAccount.create({
      data: {
        supplierId: b,
        bankName: 'TEST BANK',
        accountName: 'x',
        ibanEnc: Buffer.from('x'),
        ibanLast4: '5432',
        status: 'verified',
      },
    })
    if (helperId !== ownerId)
      await expect(merge.mergeCompaniesNow(a, b, helper())).rejects.toThrow(/Only Krishan/)
    await expect(merge.assertCanMerge(opsDb, [a, b], owner())).resolves.toBeUndefined()
  })

  it('blocked matcher: name, domain, phone and IBAN; nothing for others', async () => {
    const id = await make(`Example Fake Co ${TAG}`, { supplier: true }, [dom('f')])
    await opsDb.company.update({ where: { id }, data: { phone: '+971 4 123 4567' } })
    await opsDb.supplierProfile.update({
      where: { companyId: id },
      data: { tier: 'blocked', blockReason: 'fake_company' },
    })
    const { ibanHash } = await import('./iban-seal')
    await opsDb.supplierBankAccount.create({
      data: {
        supplierId: id,
        bankName: 'TEST BANK',
        accountName: 'x',
        ibanEnc: Buffer.from('x'),
        ibanLast4: '5432',
        ibanHash: ibanHash('GB82 WEST 1234 5698 7654 32'),
      },
    })
    expect(
      (await blocked.isBlockedCounterparty({ name: `EXAMPLE FAKE CO. ${TAG} LLC` })).matchedOn
    ).toEqual(['name'])
    expect((await blocked.isBlockedCounterparty({ domain: `www.${dom('f')}` })).blocked).toBe(true)
    expect((await blocked.isBlockedCounterparty({ phone: '00971 4 1234567' })).matchedOn).toEqual([
      'phone',
    ])
    expect(
      (await blocked.isBlockedCounterparty({ iban: 'GB82WEST12345698765432' })).matchedOn
    ).toEqual(['iban'])
    expect(
      (await blocked.isBlockedCounterparty({ name: 'Unrelated Co', domain: 'unrelated.example' }))
        .blocked
    ).toBe(false)
    await expect(blocked.assertNotBlocked(id)).rejects.toThrow(/blocked/)
  })

  it('Owner-only profile fields refuse a Helper server-side', async () => {
    const id = await make(`Sample Buyer ${TAG}`, { client: true })
    if (helperId !== ownerId)
      await expect(
        opsDb.$transaction((tx) =>
          profiles.updateClientProfile(
            tx,
            id,
            'credit',
            { creditHold: true, creditHoldReason: 'Overdue' },
            helper()
          )
        )
      ).rejects.toThrow()
    await opsDb.$transaction((tx) =>
      profiles.updateClientProfile(
        tx,
        id,
        'credit',
        { creditHold: true, creditHoldReason: 'Overdue' },
        owner()
      )
    )
    const p = await opsDb.clientProfile.findUniqueOrThrow({ where: { companyId: id } })
    expect(p.creditHold).toBe(true)
    expect(p.creditHoldSince).not.toBeNull()
    await expect(
      opsDb.$transaction((tx) =>
        profiles.updateClientProfile(tx, id, 'credit', { creditHold: true }, owner())
      )
    ).rejects.toThrow(/Say why/)
    await opsDb.$transaction((tx) =>
      profiles.updateClientProfile(
        tx,
        id,
        'acknowledgement',
        { acknowledgeEnquiries: false },
        helper()
      )
    )
    expect(
      (await opsDb.clientProfile.findUniqueOrThrow({ where: { companyId: id } }))
        .acknowledgeEnquiries
    ).toBe(false)
  })
})
