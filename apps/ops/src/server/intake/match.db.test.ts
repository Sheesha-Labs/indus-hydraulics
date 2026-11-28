import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb, Prisma } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Board 16 on the local database (S09-T04): company matching (contact email, domain, never a webmail domain,
 * letterhead, several → Unsure), the step's suggestion and summary, and the three outcomes — enquiry, new lead,
 * open lead — each idempotent on the batch, with an unknown sender created inline as a client.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))
vi.mock('../settings/get', () => ({
  getSetting: async (key: string) =>
    key === 'qualify.free_mail_domains' ? { domains: ['webmail.example'] } : {},
}))
const emitted: string[] = []
vi.mock('../../inngest/emit', () => ({
  emitEventOrThrow: async () => undefined,
  emitEvent: async (e: { name: string; data: { actionKey?: string } }) => {
    emitted.push(e.data.actionKey ?? e.name)
    return true
  },
}))

const { matchCompany } = await import('../directory/match-company')
const { getMatchStep, applyMatch } = await import('./match')

const TAG = `s09mt${Date.now()}`

describe.skipIf(!DB_URL)('intake match · local database', () => {
  let owner = { id: '' }
  const companies: Record<string, string> = {}
  const batches: string[] = []
  const enquiries: string[] = []
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
    new Date()
  )

  async function batch(
    over: Partial<Prisma.IntakeBatchUncheckedCreateInput> = {},
    mail?: { from: string; name: string }
  ) {
    let mailMessageId: string | undefined
    if (mail) {
      // Any mailbox holds the thread; the local database may have none left by other suites, so make one
      // (role personal: a stray client mailbox would change what other suites see as sales@).
      const mb =
        (await opsDb.mailbox.findFirst({ select: { id: true } })) ??
        (await opsDb.mailbox.create({
          data: {
            address: `s04q-${TAG}-sales@example.test`,
            displayName: 'Sales Example',
            role: 'personal',
            status: 'live',
          },
          select: { id: true },
        }))
      const t = await opsDb.mailThread.create({
        data: { mailboxId: mb.id, gmailThreadId: `t-${TAG}-${randomUUID()}` },
      })
      mailMessageId = (
        await opsDb.mailMessage.create({
          data: {
            mailboxId: mb.id,
            threadId: t.id,
            gmailMessageId: `g-${TAG}-${randomUUID()}`,
            rfcMessageId: `${randomUUID()}@client.example.test`,
            direction: 'inbound',
            fromAddress: mail.from,
            fromName: mail.name,
            toAddresses: ['sales@example.test'],
            ccAddresses: [],
            subject: 'RFQ for spares',
            bodyText: 'Please quote.',
            bodyTextHash: randomUUID(),
            sentAt: new Date(),
            labelsApplied: [],
            origin: 'live',
          },
        })
      ).id
    }
    const b = await opsDb.intakeBatch.create({
      data: {
        source: mail ? 'mail' : 'upload',
        createdById: owner.id,
        ...(mailMessageId ? { mailMessageId } : {}),
        ...over,
      },
      select: { id: true },
    })
    batches.push(b.id)
    for (const ord of [1, 2])
      await opsDb.intakeLineCandidate.create({
        data: {
          batchId: b.id,
          ord,
          description: `Gate valve ${ord}"`,
          qty: new Prisma.Decimal(ord * 3),
          uom: 'EA',
          partNo: `TEST-${TAG}-${ord}`,
          partNoNorm: `TEST${ord}`,
          confidence: 'sure',
          decision: 'accepted',
        },
      })
    await opsDb.intakeLineCandidate.create({
      data: {
        batchId: b.id,
        ord: 3,
        description: 'Gate valve 1"',
        qty: 3,
        confidence: 'sure',
        decision: 'merged',
      },
    })
    return b.id
  }

  beforeAll(async () => {
    owner = await opsDb.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })
    const seq = await opsDb.numberSequence.findUniqueOrThrow({
      where: { key: 'enquiry' },
      select: { seededAt: true },
    })
    if (!seq.seededAt)
      await opsDb.$executeRaw`SELECT ops.seed_number_sequence('enquiry', 9001, '{"source":"local test"}'::jsonb, ${year}, ${owner.id}::uuid)`
    const mk = async (
      k: string,
      name: string,
      extra: Partial<Prisma.CompanyUncheckedCreateInput> = {}
    ) => {
      companies[k] = (await opsDb.company.create({ data: { name, isClient: true, ...extra } })).id
    }
    await mk('dom', `Zephyrine Example Works ${TAG}`, { primaryDomain: `${TAG}.example.test` })
    await mk('contact', `Quillon Sample Trading ${TAG}`)
    await opsDb.contact.create({
      data: {
        companyId: companies.contact!,
        email: `buyer@${TAG}-c.example.test`,
        name: 'Sample Buyer',
      },
    })
    await mk('twinA', `Marlowe Twin Holdings ${TAG}`)
    await mk('twinB', `Marlowe Twin Holding ${TAG}`)
  })

  afterAll(async () => {
    await opsDb.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedAt: new Date() },
    })
    await opsDb.$disconnect()
  })

  it('matches on contact email, then domain; never by a webmail domain; letterhead fuzzy; several are Unsure', async () => {
    expect(await matchCompany({ senderEmail: `BUYER@${TAG}-c.example.test` })).toMatchObject({
      kind: 'sure',
      companyId: companies.contact,
      basis: ['contact_email'],
    })
    expect(await matchCompany({ senderEmail: `x@${TAG}.example.test` })).toMatchObject({
      kind: 'sure',
      companyId: companies.dom,
      basis: ['sender_domain'],
    })
    expect(await matchCompany({ senderEmail: `someone-${TAG}@webmail.example` })).toEqual({
      kind: 'none',
    })
    expect(await matchCompany({ letterheadName: `Zephyrine Example Works ${TAG}` })).toMatchObject({
      kind: 'sure',
      companyId: companies.dom,
      basis: ['letterhead'],
    })
    const twins = await matchCompany({ letterheadName: `Marlowe Twin Holdings ${TAG}` })
    expect(twins.kind).toBe('unsure')
    if (twins.kind === 'unsure')
      expect(twins.candidates.map((c) => c.companyId).sort()).toEqual(
        [companies.twinA, companies.twinB].sort()
      )
  })

  it('the step: suggestion with evidence, summary, open leads', async () => {
    const id = await batch(
      {
        deadline: new Date('2099-10-02T10:00:00Z'),
        clientRef: 'SC-RFQ-0921',
        terms: { closingDate: { text: '2099-10-02', quote: 'Closing 2 Oct', page: 1 } },
      },
      { from: `x@${TAG}.example.test`, name: 'X' }
    )
    const s = (await getMatchStep(id))!
    expect(s.company).toMatchObject({
      kind: 'sure',
      companyId: companies.dom,
      sentence: `Matched on sender x@${TAG}.example.test`,
    })
    expect(s.suggested).toBe('enquiry')
    expect(s.enquiryEvidence).toBe(
      'The document is a formal RFQ with a deadline (2 Oct found on page 1)'
    )
    expect(s.summary).toEqual({ lines: 2, merged: 1, categories: null, clientRef: 'SC-RFQ-0921' })
    expect(s.openLeads).toEqual([])
  })

  it('enquiry: created once with the follow-ups; a second click returns the same', async () => {
    const id = await batch(
      { deadline: new Date('2099-10-02T10:00:00Z') },
      { from: `x@${TAG}.example.test`, name: 'X' }
    )
    emitted.length = 0
    const a = await applyMatch(id, { option: 'enquiry', companyId: companies.dom! }, owner)
    expect(a).toMatchObject({ kind: 'enquiry', replayed: false })
    const e = await opsDb.enquiry.findFirstOrThrow({
      where: { ref: a.label },
      include: { lines: true },
    })
    enquiries.push(e.id)
    expect(e.clientId).toBe(companies.dom)
    expect(e.lines).toHaveLength(2)
    expect(emitted).toContain('ops/enquiry.created')
    expect(emitted).toContain('ack_email')
    const again = await applyMatch(id, { option: 'enquiry', companyId: companies.dom! }, owner)
    expect(again).toEqual({ ...a, replayed: true })
    expect(await opsDb.enquiry.count({ where: { ref: a.label } })).toBe(1)
  })

  it('unknown sender → client created inline with the sender as contact → new lead with L- number', async () => {
    const id = await batch({}, { from: `jane@${TAG}-new.example.test`, name: 'Jane Sample' })
    const s = (await getMatchStep(id))!
    expect(s.company).toEqual({ kind: 'none' })
    expect(s.suggested).toBe('new_lead')
    const r = await applyMatch(
      id,
      { option: 'new_lead', newClient: `Novel Sample Co ${TAG}` },
      owner
    )
    expect(r.kind).toBe('lead')
    expect(r.label).toMatch(/^L-\d{4,}$/)
    const lead = await opsDb.lead.findUniqueOrThrow({
      where: { ref: r.label },
      include: { lines: { orderBy: { no: 'asc' } }, company: true, contact: true },
    })
    expect(lead.company?.primaryDomain).toBe(`${TAG}-new.example.test`)
    expect(lead.contact).toMatchObject({
      email: `jane@${TAG}-new.example.test`,
      sourceKind: 'email_header',
    })
    expect(lead.lines.map((l) => [l.no, l.description, l.qty?.toString()])).toEqual([
      [1, 'Gate valve 1"', '3'],
      [2, 'Gate valve 2"', '6'],
    ])
    expect(lead.stage).toBe('new')
    expect((await opsDb.intakeBatch.findUniqueOrThrow({ where: { id } })).leadId).toBe(lead.id)

    // A second intake from the same client offers that lead and appends to it.
    const id2 = await batch({}, { from: `jane@${TAG}-new.example.test`, name: 'Jane Sample' })
    const s2 = (await getMatchStep(id2))!
    expect(s2.company).toMatchObject({ kind: 'sure', companyId: lead.companyId })
    expect(s2.openLeads.map((l) => l.ref)).toEqual([lead.ref])
    expect(s2.suggested).toBe('open_lead')
    const r2 = await applyMatch(id2, { option: 'open_lead', leadId: lead.id }, owner)
    expect(r2).toMatchObject({ kind: 'lead', label: lead.ref })
    expect(await opsDb.leadLine.count({ where: { leadId: lead.id } })).toBe(4)
    expect(await applyMatch(id2, { option: 'open_lead', leadId: lead.id }, owner)).toMatchObject({
      replayed: true,
    })
  })

  it('a free-mail sender is not matched by domain and the new client gets no domain', async () => {
    const id = await batch({}, { from: `someone-${TAG}@webmail.example`, name: 'Someone' })
    const r = await applyMatch(
      id,
      { option: 'new_lead', newClient: `Webmail Sample ${TAG}` },
      owner
    )
    const lead = await opsDb.lead.findUniqueOrThrow({
      where: { ref: r.label },
      include: { company: true },
    })
    expect(lead.company?.primaryDomain).toBeNull()
    expect(lead.company?.domains).toEqual([])
  })

  it('refuses without a client', async () => {
    const id = await batch()
    await expect(applyMatch(id, { option: 'enquiry' }, owner)).rejects.toThrow(
      'Choose the client first.'
    )
  })
})
