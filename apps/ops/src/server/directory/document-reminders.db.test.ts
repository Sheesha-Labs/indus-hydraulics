import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { SENDS_EXTERNALLY } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Action #16 and ops.reminders.documents on the local database (S10-T08, C18), with a frozen clock walking one
 * supplier's documents across 60, 30 and 7 days: one reminder per supplier groups every due document; the
 * thresholds count only when the email leaves (onSent), so an undone reminder is asked for again the next morning;
 * Indus's own documents raise a notification per threshold and a Today row, never an email; expiry marks once;
 * the 90-day re-screen and a pending bank change show on Today.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidateTag: () => undefined,
}))
const requested: Array<{ actionKey: string; subjectId: string; sourceVersion: string | number }> =
  []
vi.mock('../assistant/request', () => ({
  requestAction: async (r: (typeof requested)[number]) => {
    requested.push(r)
    return 'id'
  },
  requestActionQuietly: async (r: (typeof requested)[number]) => {
    requested.push(r)
    return true
  },
}))

const TAG = `rem${Date.now().toString(36)}`
const DAY = 86_400_000
/** The frozen "today": a UTC midnight like dubaiToday() returns. */
const T0 = new Date(Date.UTC(2027, 0, 4))
const at = (base: Date, days: number) => new Date(base.getTime() + days * DAY)

describe.skipIf(!DB_URL)('document reminders · local database', () => {
  let job: typeof import('./document-reminders')
  let action: typeof import('../assistant/actions/remind-supplier-documents')
  let today: typeof import('../today/providers')
  let supplierId = ''
  let isoId = ''
  let atexId = ''
  let indusDocId = ''
  let ownerId = ''

  beforeAll(async () => {
    process.env.OPS_TOKEN_KEYS ??= JSON.stringify({ t1: Buffer.alloc(32, 7).toString('base64') })
    process.env.OPS_TOKEN_KEY_ACTIVE ??= 't1'
    job = await import('./document-reminders')
    action = await import('../assistant/actions/remind-supplier-documents')
    today = await import('../today/providers')
    ownerId = (
      await opsDb.user.findFirstOrThrow({
        where: { role: 'owner', status: 'active' },
        select: { id: true },
      })
    ).id
    supplierId = (
      await opsDb.company.create({
        data: {
          name: `Example Gauges ${TAG}`,
          isSupplier: true,
          primaryDomain: `${TAG}.example`,
          domains: [`${TAG}.example`],
          supplierProfile: { create: { tier: 'approved' } },
          contacts: {
            create: {
              name: 'Pat Example',
              role: 'Quality',
              email: `quality@${TAG}.example`,
              verifiedAt: new Date(),
            },
          },
        },
        select: { id: true },
      })
    ).id
    // Two of the supplier's documents reach 60 days on the same morning; the reminder groups both.
    const docs = await opsDb.complianceDocument.createManyAndReturn({
      data: [
        {
          companyId: supplierId,
          kind: 'iso_certificate',
          title: 'ISO 9001',
          expiresAt: at(T0, 60),
        },
        { companyId: supplierId, kind: 'atex_certificate', title: 'ATEX', expiresAt: at(T0, 58) },
        {
          companyId: null,
          kind: 'iso_certificate',
          title: `Indus ISO ${TAG}`,
          issuer: 'Example Registrar',
          expiresAt: at(T0, 30),
        },
      ],
      select: { id: true, companyId: true, kind: true },
    })
    isoId = docs.find((d) => d.companyId && d.kind === 'iso_certificate')!.id
    atexId = docs.find((d) => d.kind === 'atex_certificate')!.id
    indusDocId = docs.find((d) => !d.companyId)!.id
  })

  afterAll(async () => {
    const ids = [isoId, atexId, indusDocId].filter(Boolean)
    if (ids.length)
      await opsDb.complianceDocument.updateMany({
        where: { id: { in: ids } },
        data: { archivedAt: new Date() },
      })
    if (supplierId)
      await opsDb.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
    await opsDb.$disconnect()
  })

  const mine = () => requested.filter((r) => r.subjectId === supplierId)

  async function draft(sourceVersion: string) {
    const def = action.default
    const request = {
      actionKey: 'remind_supplier_documents',
      subjectType: 'company' as const,
      subjectId: supplierId,
      trigger: 'cron',
      origin: 'live' as const,
      sourceVersion,
    }
    const { input } = await def.gather({ request })
    const p = await def.propose(input, {} as never)
    if (!p.ok) throw new Error('propose failed')
    const v = await def.verify(p.out, input)
    return { def, request, input, v, proposal: def.toProposal(v, input) }
  }

  async function sent(sourceVersion: string) {
    const { def, request } = await draft(sourceVersion)
    const row = await opsDb.assistantAction.create({
      data: {
        ref: `A-${TAG}-${Math.random().toString(36).slice(2, 8)}`,
        actionKey: 'remind_supplier_documents',
        levelAtTime: 'draft_and_ask',
        headline: 'x',
        reasons: [],
        state: 'done',
        subjectType: 'company',
        subjectId: supplierId,
        idempotencyKey: `${TAG}:${sourceVersion}`,
      },
      select: { id: true },
    })
    await opsDb.$transaction((tx) => def.onSent!(tx, { id: row.id, request } as never))
  }

  it('#16 is a supplier email that always asks first', () => {
    expect(SENDS_EXTERNALLY).toContain('remind_supplier_documents')
    expect(action.default.alwaysAsk).toBeTruthy()
    expect(action.default.external).toBe(true)
  })

  it('60 days: one reminder for the supplier names both due documents', async () => {
    requested.length = 0
    await job.supplierReminders(T0)
    expect(mine()).toHaveLength(1)
    const sv = String(mine()[0]!.sourceVersion)
    expect(sv).toMatch(new RegExp(`^expiry:[0-9a-f-]+:${T0.toISOString().slice(0, 10)}$`))
    const { input, v, proposal } = await draft(sv)
    expect(input.documents.map((d) => d.kind).sort()).toEqual([
      'atex_certificate',
      'iso_certificate',
    ])
    expect(input.documents.every((d) => d.threshold === 60)).toBe(true)
    expect(input.contact?.email).toBe(`quality@${TAG}.example`)
    expect(v.out.missing).toEqual([])
    expect(proposal.headline).toContain('(60 days)')
  })

  it('an undone reminder is asked for again next morning; a sent one is not', async () => {
    requested.length = 0
    await job.supplierReminders(at(T0, 1))
    expect(mine()).toHaveLength(1)
    await sent(String(mine()[0]!.sourceVersion))
    const after = await opsDb.complianceDocument.findMany({
      where: { id: { in: [isoId, atexId] } },
      select: { remindersSentDays: true },
    })
    expect(after.every((d) => d.remindersSentDays.includes(60))).toBe(true)
    requested.length = 0
    await job.supplierReminders(at(T0, 2))
    expect(mine()).toHaveLength(0)
  })

  it('30 and 7 days each fire once more, then nothing', async () => {
    for (const day of [30, 53]) {
      requested.length = 0
      await job.supplierReminders(at(T0, day))
      expect(mine()).toHaveLength(1)
      const { input } = await draft(String(mine()[0]!.sourceVersion))
      expect(new Set(input.documents.map((d) => d.threshold))).toEqual(
        new Set([day === 30 ? 30 : 7])
      )
      await sent(String(mine()[0]!.sourceVersion))
      requested.length = 0
      await job.supplierReminders(at(T0, day + 1))
      expect(mine()).toHaveLength(0)
    }
    const iso = await opsDb.complianceDocument.findUniqueOrThrow({ where: { id: isoId } })
    expect(iso.remindersSentDays).toEqual([60, 30, 7])
  })

  it('expiry marks a document expired once', async () => {
    expect(await job.markExpired(at(T0, 61))).toBeGreaterThanOrEqual(2)
    const rows = await opsDb.complianceDocument.findMany({
      where: { id: { in: [isoId, atexId] } },
      select: { status: true },
    })
    expect(rows.every((r) => r.status === 'expired')).toBe(true)
    const again = await opsDb.complianceDocument.count({
      where: { id: { in: [isoId, atexId] }, status: 'expired' },
    })
    await job.markExpired(at(T0, 62))
    expect(
      await opsDb.complianceDocument.count({
        where: { id: { in: [isoId, atexId] }, status: 'expired' },
      })
    ).toBe(again)
  })

  it('Indus documents: a notification per threshold, never an email; once only', async () => {
    const outBefore = await opsDb.outboundEmail.count()
    await job.indusReminders(T0)
    const notes = await opsDb.notification.findMany({
      where: { dedupeKey: `company-doc:${indusDocId}:30` },
      select: { title: true, event: true },
    })
    expect(notes.length).toBeGreaterThan(0)
    expect(notes[0]).toMatchObject({ event: 'document_expiring' })
    expect(notes[0]!.title).toContain('expires in 30 days · Example Registrar')
    await job.indusReminders(at(T0, 1))
    expect(
      await opsDb.notification.count({
        where: { dedupeKey: { startsWith: `company-doc:${indusDocId}:` } },
      })
    ).toBe(notes.length)
    expect(await opsDb.outboundEmail.count()).toBe(outBefore)
  })

  it('Today shows the Indus document, the re-screen and the pending bank change', async () => {
    await opsDb.supplierProfile.update({
      where: { companyId: supplierId },
      data: { rescreenDueAt: new Date(Date.now() - DAY) },
    })
    const bank = await opsDb.supplierBankAccount.create({
      data: {
        supplierId,
        bankName: 'Requested by email',
        accountName: 'Example Gauges',
        ibanEnc: Buffer.from('sealed'),
        ibanLast4: '0001',
        status: 'pending_verification',
        requestedAt: new Date(),
      },
      select: { id: true },
    })
    const now = new Date()
    const ctx = {
      userId: ownerId,
      role: 'owner' as const,
      canSeeMargins: true,
      now,
      since: at(now, -1),
      startOfToday: at(now, -0.5),
      endOfWeek: at(now, 6),
      oneWorkingDayAgo: at(now, -1),
    }
    await opsDb.complianceDocument.update({
      where: { id: indusDocId },
      data: { expiresAt: at(now, 20) },
    })
    const rows = async (key: string) => {
      const p = today.todayProviders('owner').find((x) => x.key === key)!
      return p.read(await p.query(ctx), ctx)
    }
    expect(
      (await rows('company.documents')).find((r) => r.key === `company-doc:${indusDocId}`)?.title
    ).toMatch(/^Indus ISO .* expires in (19|20) days$/)
    expect((await rows('supplier.rescreen')).some((r) => r.key === `rescreen:${supplierId}`)).toBe(
      true
    )
    const b = (await rows('supplier.bank_change')).find((r) => r.key === `bank-change:${bank.id}`)
    expect(b).toMatchObject({
      mark: 'bad',
      href: `/suppliers/${supplierId}/bank-change/${bank.id}`,
    })
    // The Helper sees the supplier-side rows first.
    const keys = today.todayProviders('helper').map((p) => p.key)
    expect(keys.indexOf('supplier.bank_change')).toBeLessThan(keys.indexOf('company.documents'))
  })
})
