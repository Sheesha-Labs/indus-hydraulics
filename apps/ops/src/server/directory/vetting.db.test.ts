import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ibanWithCheckDigits, SCREENING_LISTS } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Vetting and approval on the local database (S10-T05, board 51): the IBAN sealed (round trip across a key
 * rotation, never stored or returned in clear), call-back rules (registry number, never one from the email, Owner
 * only), cooling-off and supersede, and the Owner's decision (needs screening + a genuine call-back; trial limits;
 * reject with a reason and a 6-month wait). IBANs are built at run time.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))

const TAG = `vet${Date.now().toString(36)}`
const IBAN = ibanWithCheckDigits('DE', '370400440532013000')
const IBAN2 = ibanWithCheckDigits('DE', '370400440532013099')

describe.skipIf(!DB_URL)('vetting and approval · local database', () => {
  let bank: typeof import('./bank')
  let approval: typeof import('./approval')
  let screening: typeof import('./screening')
  let seal: typeof import('./iban-seal')
  let owner = { id: '', role: 'owner' as const }
  let helper = { id: '', role: 'helper' as const }
  let supplierId = ''
  const keyA = Buffer.alloc(32, 3).toString('base64')
  const keyB = Buffer.alloc(32, 4).toString('base64')

  beforeAll(async () => {
    process.env.OPS_TOKEN_KEYS = JSON.stringify({ a: keyA })
    process.env.OPS_TOKEN_KEY_ACTIVE = 'a'
    bank = await import('./bank')
    approval = await import('./approval')
    screening = await import('./screening')
    seal = await import('./iban-seal')
    const users = await opsDb.user.findMany({
      where: { status: 'active' },
      select: { id: true, role: true },
    })
    owner = { id: users.find((u) => u.role === 'owner')!.id, role: 'owner' }
    helper = { id: (users.find((u) => u.role === 'helper') ?? users[0]!).id, role: 'helper' }
    supplierId = (
      await opsDb.company.create({
        data: {
          name: `Example Hidrolik ${TAG}`,
          isSupplier: true,
          phone: '+90 212 000 4400',
          supplierProfile: {
            create: { onboardingStatus: 'under_review', registryPhone: '+90 212 000 4400' },
          },
        },
        select: { id: true },
      })
    ).id
    for (const kind of [
      'trade_licence',
      'vat_certificate',
      'iso_certificate',
      'bank_letter',
      'company_profile',
      'nda',
    ])
      await opsDb.complianceDocument.create({
        data: { companyId: supplierId, kind: kind as never, title: kind, status: 'received' },
      })
  })

  afterAll(async () => {
    await opsDb.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
    await opsDb.$disconnect()
  })

  it('seals the IBAN: last 4 in clear, opens after a key rotation, refuses another supplier', async () => {
    const acc = await opsDb.$transaction((tx) =>
      bank.addSupplierBankAccount(
        tx,
        supplierId,
        { bankName: 'TEST BANK', accountName: 'Example Hidrolik', iban: IBAN, currency: 'EUR' },
        { kind: 'user', id: helper.id }
      )
    )
    expect(acc.last4).toBe(IBAN.slice(-4))
    const row = await opsDb.supplierBankAccount.findUniqueOrThrow({ where: { id: acc.id } })
    expect(Buffer.from(row.ibanEnc).toString('utf8')).not.toContain(IBAN)
    expect(row.status).toBe('pending_verification')
    process.env.OPS_TOKEN_KEYS = JSON.stringify({ a: keyA, b: keyB })
    process.env.OPS_TOKEN_KEY_ACTIVE = 'b'
    expect(seal.openIban(row.ibanEnc, supplierId)).toBe(IBAN)
    expect(() => seal.openIban(row.ibanEnc, '00000000-0000-0000-0000-000000000000')).toThrow()
    const summary = await bank.bankSummary(supplierId)
    expect(JSON.stringify(summary)).not.toContain(IBAN)
    await expect(
      opsDb.$transaction((tx) =>
        bank.addSupplierBankAccount(
          tx,
          supplierId,
          {
            bankName: 'X',
            accountName: 'X',
            iban: IBAN.slice(0, -1) + (IBAN.endsWith('1') ? '2' : '1'),
          },
          { kind: 'user', id: helper.id }
        )
      )
    ).rejects.toThrow(/does not check out/)
  })

  it('the decision waits for screening and a genuine call-back', async () => {
    const f = await approval.decisionFacts(supplierId)
    expect(f.allowed.approve_trial.allowed).toBe(false)
    expect(f.allowed.approve_trial.reasons.join(' ')).toMatch(/screening/)
    await expect(
      opsDb.$transaction((tx) => approval.decide(tx, supplierId, 'approve_trial', owner))
    ).rejects.toThrow(/screening/)
  })

  it('call-back: Owner only, registry number only, never a number from the email; genuine starts the cooling-off', async () => {
    const acc = await opsDb.supplierBankAccount.findFirstOrThrow({
      where: { supplierId, status: 'pending_verification' },
    })
    const base = {
      accountId: acc.id,
      numberSource: 'registry' as const,
      numberDialled: '+90 212 000 4400',
      spokeTo: 'Selin Example',
      outcome: 'genuine' as const,
    }
    if (helper.id !== owner.id)
      await expect(
        opsDb.$transaction((tx) => bank.recordBankCallback(tx, base, helper))
      ).rejects.toThrow()
    await expect(
      opsDb.$transaction((tx) =>
        bank.recordBankCallback(tx, { ...base, numberSource: 'other' }, owner)
      )
    ).rejects.toThrow(/registry/)
    await expect(
      opsDb.$transaction((tx) =>
        bank.recordBankCallback(tx, { ...base, numberDialled: '+90 212 999 1111' }, owner)
      )
    ).rejects.toThrow(/not the registry/)
    const out = await opsDb.$transaction((tx) => bank.recordBankCallback(tx, base, owner))
    expect(out.status).toBe('verified')
    const hours = (new Date(out.coolingOffUntil!).getTime() - Date.now()) / 3_600_000
    expect(Math.round(hours)).toBe(24)
    await expect(
      opsDb.$transaction((tx) => bank.recordBankCallback(tx, base, owner))
    ).rejects.toThrow(/already been decided/)
  })

  it('a later verified account supersedes the earlier one in the same currency', async () => {
    const acc2 = await opsDb.$transaction((tx) =>
      bank.addSupplierBankAccount(
        tx,
        supplierId,
        { bankName: 'TEST BANK', accountName: 'Example Hidrolik', iban: IBAN2, currency: 'EUR' },
        { kind: 'user', id: owner.id }
      )
    )
    await opsDb.$transaction((tx) =>
      bank.recordBankCallback(
        tx,
        {
          accountId: acc2.id,
          numberSource: 'registry',
          numberDialled: '+90 212 000 4400',
          spokeTo: 'Selin Example',
          outcome: 'genuine',
        },
        owner
      )
    )
    const rows = await opsDb.supplierBankAccount.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'asc' },
    })
    expect(rows.map((r) => r.status)).toEqual(['superseded', 'verified'])
  })

  it('screening complete + genuine call-back: the Owner approves on trial with conditions; the Helper cannot', async () => {
    await opsDb.$transaction((tx) =>
      screening.recordScreening(
        tx,
        supplierId,
        SCREENING_LISTS.map((l) => ({
          key: l.key,
          result: 'clear' as const,
          evidenceUrl: 'https://example.test/search',
        })),
        helper
      )
    )
    const p = await opsDb.supplierProfile.findUniqueOrThrow({ where: { companyId: supplierId } })
    expect(p.rescreenDueAt).not.toBeNull()
    if (helper.id !== owner.id)
      await expect(
        opsDb.$transaction((tx) => approval.decide(tx, supplierId, 'approve_trial', helper))
      ).rejects.toThrow()
    const f = await approval.decisionFacts(supplierId)
    expect(f.allowed.approve.allowed).toBe(false) // code of conduct and ownership declaration still open
    const out = await opsDb.$transaction((tx) =>
      approval.decide(tx, supplierId, 'approve_trial', owner)
    )
    expect(out).toMatchObject({ tier: 'trial', onboarding: 'approved_trial' })
    expect(out.conditions[0]).toMatch(
      /first PO blocked until code of conduct and ownership declaration/
    )
    const after = await opsDb.supplierProfile.findUniqueOrThrow({
      where: { companyId: supplierId },
    })
    expect(after).toMatchObject({
      tier: 'trial',
      trialPoLimit: 3,
      trialPosUsed: 0,
      trialTpiEachPo: true,
    })
    expect(Number(after.trialPoMaxAmount)).toBe(25000)
    const rec = await opsDb.supplierApproval.findFirstOrThrow({
      where: { supplierId, decision: 'approve_trial' },
    })
    expect(rec.decidedById).toBe(owner.id)
  })

  it('reject stores the reason and blocks re-proposal for 6 months', async () => {
    const other = (
      await opsDb.company.create({
        data: {
          name: `Example Rejected ${TAG}`,
          isSupplier: true,
          supplierProfile: { create: { onboardingStatus: 'under_review' } },
        },
        select: { id: true },
      })
    ).id
    await expect(
      opsDb.$transaction((tx) => approval.decide(tx, other, 'reject', owner, ''))
    ).rejects.toThrow(/reason/)
    await opsDb.$transaction((tx) =>
      approval.decide(tx, other, 'reject', owner, 'Counterfeit risk')
    )
    const p = await opsDb.supplierProfile.findUniqueOrThrow({ where: { companyId: other } })
    expect(p.onboardingStatus).toBe('rejected')
    expect(p.rejectReason).toBe('Counterfeit risk')
    const months = (p.reproposeAfter!.getTime() - Date.now()) / (30.4 * 86_400_000)
    expect(Math.round(months)).toBe(6)
    await expect(
      opsDb.$transaction((tx) => approval.submitForReview(tx, other, helper))
    ).rejects.toThrow(/proposed again from/)
    await opsDb.company.update({ where: { id: other }, data: { archivedAt: new Date() } })
  })
})
