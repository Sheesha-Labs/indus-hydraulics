import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { ibanWithCheckDigits } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Trust on the local database (S10-T07, boards 130–132): the block effects listed are the effects applied, unblock
 * is the Owner's; a bank-change email from a supplier is detected, makes a pending account (payments blocked), raises
 * the locked notification once per message; ordinary supplier mail does not; the gate holds through the cooling-off.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))
const requested: Array<{ actionKey: string; subjectId: string }> = []
vi.mock('../assistant/request', () => ({
  requestAction: async (r: { actionKey: string; subjectId: string }) => {
    requested.push(r)
    return 'id'
  },
  requestActionQuietly: async () => true,
}))

const TAG = `tr${Date.now().toString(36)}`
const DOMAIN = `${TAG}-valves.example`
const IBAN = ibanWithCheckDigits('IT', 'X0542811101000000123456')

describe.skipIf(!DB_URL)('trust · local database', () => {
  let block: typeof import('./block')
  let watch: typeof import('./bank-change')
  let alert: typeof import('../assistant/actions/bank-change-alert')
  let trust: typeof import('../../data/supplier-trust')
  let owner = { id: '', role: 'owner' as const }
  let helper = { id: '', role: 'helper' as const }
  let supplierId = ''
  let mailboxId = ''

  beforeAll(async () => {
    process.env.OPS_TOKEN_KEYS ??= JSON.stringify({ t1: Buffer.alloc(32, 5).toString('base64') })
    process.env.OPS_TOKEN_KEY_ACTIVE ??= 't1'
    block = await import('./block')
    watch = await import('./bank-change')
    alert = await import('../assistant/actions/bank-change-alert')
    trust = await import('../../data/supplier-trust')
    const users = await opsDb.user.findMany({
      where: { status: 'active' },
      select: { id: true, role: true },
    })
    owner = { id: users.find((u) => u.role === 'owner')!.id, role: 'owner' }
    helper = { id: (users.find((u) => u.role === 'helper') ?? users[0]!).id, role: 'helper' }
    supplierId = (
      await opsDb.company.create({
        data: {
          name: `Example Valvole ${TAG}`,
          isSupplier: true,
          primaryDomain: DOMAIN,
          domains: [DOMAIN],
          supplierProfile: { create: { tier: 'principal', registryPhone: '+39 030 000 2140' } },
        },
        select: { id: true },
      })
    ).id
    mailboxId = (await opsDb.mailbox.findFirstOrThrow({ select: { id: true } })).id
  })

  afterAll(async () => {
    await opsDb.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
    await opsDb.$disconnect()
  })

  async function message(from: string, body: string, minutesAgo = 0) {
    const thread = await opsDb.mailThread.create({
      data: { mailboxId, gmailThreadId: `${TAG}-${Math.random()}` },
      select: { id: true },
    })
    return (
      await opsDb.mailMessage.create({
        data: {
          mailboxId,
          threadId: thread.id,
          gmailMessageId: `${TAG}-${Math.random()}`,
          direction: 'inbound',
          origin: 'live',
          fromAddress: from,
          toAddresses: ['purchase@example.test'],
          subject: 'Account details',
          bodyText: body,
          sentAt: new Date(Date.now() - minutesAgo * 60_000),
          receivedAt: new Date(Date.now() - minutesAgo * 60_000),
        },
        select: { id: true },
      })
    ).id
  }

  it('ordinary supplier mail is not a bank change; a change request asks for the alert', async () => {
    const plain = await message(
      `sales@${DOMAIN}`,
      'Please find our quotation attached. Delivery 6 weeks.',
      60
    )
    expect(await watch.watchBankChange(plain)).toBe(false)
    const ask = await message(
      `accounts@${DOMAIN}`,
      `Please note our bank has changed. Kindly remit the balance now to ${IBAN}. Call +39 351 000 8812.`
    )
    expect(await watch.watchBankChange(ask)).toBe(true)
    expect(requested.at(-1)).toMatchObject({ actionKey: 'bank_change_alert', subjectId: ask })
    expect(
      await watch.watchBankChange(
        await message('someone@unknown.example', `Our bank has changed: ${IBAN}`)
      )
    ).toBe(false)
  })

  it('the alert makes a pending account, blocks payments and raises the locked notification once', async () => {
    const id = await message(
      `accounts@${DOMAIN}`,
      `Our bank details have changed. Please pay the balance today to ${IBAN}. Tel +39 351 000 8812.`
    )
    const def = alert.default
    const request = {
      actionKey: 'bank_change_alert',
      subjectType: 'mail_message' as const,
      subjectId: id,
      trigger: 't',
      origin: 'live' as const,
      sourceVersion: id,
    }
    const { input } = await def.gather({ request })
    expect(input.supplierId).toBe(supplierId)
    const p = await def.propose(input, {} as never)
    if (!p.ok) throw new Error('propose failed')
    const v = await def.verify(p.out, input)
    expect(v.confidence).toBe('sure')
    const action = await opsDb.assistantAction.create({
      data: {
        ref: `A-${TAG}-1`,
        actionKey: 'bank_change_alert',
        levelAtTime: 'do_and_tell',
        headline: 'x',
        reasons: [],
        state: 'running',
        inputs: { input } as never,
        subjectType: 'mail_message',
        subjectId: id,
        idempotencyKey: `${TAG}:1`,
      },
      select: { id: true },
    })
    for (let k = 0; k < 2; k++)
      await opsDb.$transaction((tx) =>
        def.effect(tx, v, { actionId: action.id, ref: 'A', request, level: 'do_and_tell' })
      )
    const accounts = await opsDb.supplierBankAccount.findMany({
      where: { supplierId, requestedViaMessageId: id },
    })
    expect(accounts).toHaveLength(1)
    expect(accounts[0]).toMatchObject({ status: 'pending_verification', ibanLast4: IBAN.slice(-4) })
    const notes = await opsDb.notification.findMany({
      where: { dedupeKey: `bank-change:${accounts[0]!.id}` },
    })
    expect(notes.length).toBeGreaterThan(0)
    expect(notes.every((n) => n.event === 'bank_detail_change' && n.severity === 'critical')).toBe(
      true
    )
    const gate = await trust.supplierPaymentGate(supplierId)
    expect(gate).toMatchObject({ allowed: false, reason: 'bank_change_pending' })
    const page = await trust.bankChangeData(supplierId, accounts[0]!.id)
    expect(page!.numbersInEmail.join(' ')).toContain('351 000 8812')
    expect(JSON.stringify(page)).not.toContain(IBAN)
  })

  it('a genuine call-back verifies it, and payments wait for the cooling-off', async () => {
    const { recordBankCallback } = await import('./bank')
    const acc = await opsDb.supplierBankAccount.findFirstOrThrow({
      where: { supplierId, status: 'pending_verification' },
    })
    await expect(
      opsDb.$transaction((tx) =>
        recordBankCallback(
          tx,
          {
            accountId: acc.id,
            numberSource: 'registry',
            numberDialled: '+39 351 000 8812',
            spokeTo: 'x',
            outcome: 'genuine',
          },
          owner
        )
      )
    ).rejects.toThrow(/appears in the email|registry/)
    await opsDb.supplierBankAccount.updateMany({
      where: { supplierId, status: 'pending_verification', id: { not: acc.id } },
      data: { status: 'rejected' },
    })
    await opsDb.$transaction((tx) =>
      recordBankCallback(
        tx,
        {
          accountId: acc.id,
          numberSource: 'registry',
          numberDialled: '+39 030 000 2140',
          spokeTo: 'Giulia Example',
          outcome: 'genuine',
        },
        owner
      )
    )
    const gate = await trust.supplierPaymentGate(supplierId)
    expect(gate).toMatchObject({ allowed: false, reason: 'cooling_off' })
  })

  it('block: the effects listed are the effects applied; unblock is the Owner’s and restores the tier', async () => {
    const preview = await block.previewBlockEffects(supplierId)
    const applied = await opsDb.$transaction((tx) =>
      block.blockSupplier(tx, supplierId, { reason: 'counterfeit', evidence: ['msg'] }, helper)
    )
    expect(applied).toEqual(preview)
    const p = await opsDb.supplierProfile.findUniqueOrThrow({ where: { companyId: supplierId } })
    expect(p).toMatchObject({ tier: 'blocked', blockReason: 'counterfeit' })
    expect((await trust.supplierPaymentGate(supplierId)).allowed).toBe(false)
    if (helper.id !== owner.id)
      await expect(
        opsDb.$transaction((tx) => block.unblockSupplier(tx, supplierId, 'Cleared', helper))
      ).rejects.toThrow()
    const out = await opsDb.$transaction((tx) =>
      block.unblockSupplier(tx, supplierId, 'Cleared by the maker', owner)
    )
    expect(out.tier).toBe('principal')
    const rows = await opsDb.supplierApproval.findMany({
      where: { supplierId },
      orderBy: { decidedAt: 'asc' },
    })
    expect(rows.map((r) => r.decision)).toEqual(['block', 'unblock'])
  })
})
