import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb, Prisma } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Leads on the local database (S09-T05): L- numbering, convert to enquiry (only the ticked categories, files
 * moved, notes carried, the lead closed as Converted through its machine, the ENQ allocated once and a repeat
 * returning the same enquiry), spec and stage edits, and the CSV import (server parse, bad rows reported,
 * transactions of at most 500 rows).
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({ captureException: () => undefined, withScope: () => undefined }))

const { createLead } = await import('./create')
const { convertLeadToEnquiry, UNCATEGORISED, nextEnquiryRefPreview } = await import('./convert')
const { updateLeadLineSpec, setLeadStage } = await import('./update')
const { importLeadsCsv, parseLeadCsv, MAX_ROWS_PER_TX } = await import('./import-csv')

const TAG = `s09ld${Date.now()}`

describe.skipIf(!DB_URL)('leads · local database', () => {
  let owner = { id: '', role: 'owner' as const }
  let helper = { id: '', role: 'helper' as const }
  let tradeA = ''
  let tradeB = ''
  const enquiries: string[] = []
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
    new Date()
  )

  beforeAll(async () => {
    owner = {
      ...(await opsDb.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })),
      role: 'owner',
    }
    helper = {
      ...(await opsDb.user.findFirstOrThrow({
        where: { role: 'helper', status: 'active' },
        select: { id: true },
      })),
      role: 'helper',
    }
    const seq = await opsDb.numberSequence.findUniqueOrThrow({
      where: { key: 'enquiry' },
      select: { seededAt: true },
    })
    if (!seq.seededAt)
      await opsDb.$executeRaw`SELECT ops.seed_number_sequence('enquiry', 9001, '{"source":"local test"}'::jsonb, ${year}, ${owner.id}::uuid)`
    tradeA = (await opsDb.trade.create({ data: { name: `Hoses ${TAG}`, slug: `hoses-${TAG}` } })).id
    tradeB = (await opsDb.trade.create({ data: { name: `Valves ${TAG}`, slug: `valves-${TAG}` } }))
      .id
  })

  afterAll(async () => {
    await opsDb.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedAt: new Date() },
    })
    await opsDb.$disconnect()
  })

  async function leadWithLines() {
    const company = await opsDb.company.create({
      data: { name: `Sample Client LLC ${TAG}`, isClient: true },
    })
    const l = await opsDb.$transaction((tx) =>
      createLead(
        tx,
        {
          name: 'Sample Client LLC',
          companyId: company.id,
          source: 'email',
          title: 'Refit spares',
          notes: 'Prefers EU makes.',
        },
        owner
      )
    )
    await opsDb.leadLine.createMany({
      data: [
        {
          leadId: l.id,
          no: 1,
          description: 'Hose 1/2"',
          qty: new Prisma.Decimal(24),
          uom: 'EA',
          tradeId: tradeA,
          spanIds: [],
        },
        {
          leadId: l.id,
          no: 2,
          description: 'Hose 3/4"',
          qty: new Prisma.Decimal(12),
          uom: 'EA',
          tradeId: tradeA,
          spanIds: [],
        },
        {
          leadId: l.id,
          no: 3,
          description: 'Ball valve 1"',
          qty: new Prisma.Decimal(8),
          uom: 'EA',
          tradeId: tradeB,
          spanIds: [],
        },
        {
          leadId: l.id,
          no: 4,
          description: 'Gasket set',
          qty: new Prisma.Decimal(4),
          uom: 'SET',
          spanIds: [],
        },
      ],
    })
    const b = await opsDb.intakeBatch.create({
      data: { source: 'upload', status: 'confirmed', leadId: l.id },
    })
    return { ...l, companyId: company.id, batchId: b.id }
  }

  it('numbers leads L-nnnn in order', async () => {
    const a = await opsDb.$transaction((tx) =>
      createLead(tx, { name: `A ${TAG}`, source: 'manual' }, owner)
    )
    const b = await opsDb.$transaction((tx) =>
      createLead(tx, { name: `B ${TAG}`, source: 'manual' }, owner)
    )
    expect(a.ref).toMatch(/^L-\d{4,}$/)
    expect(Number(b.ref.slice(2))).toBe(Number(a.ref.slice(2)) + 1)
    const ev = await opsDb.activityEvent.findFirstOrThrow({
      where: { subjectType: 'lead', subjectId: a.id },
    })
    expect(ev.note).toBe(`Created ${a.ref}`)
  })

  it('converts with only the ticked categories, once', async () => {
    const l = await leadWithLines()
    const preview = await nextEnquiryRefPreview(opsDb)
    const out = await opsDb.$transaction((tx) =>
      convertLeadToEnquiry(
        tx,
        {
          leadId: l.id,
          clientRef: 'SC-RFQ-1',
          deadline: '2099-10-02',
          ownerId: helper.id,
          categories: [tradeA, UNCATEGORISED],
          preallocate: true,
        },
        owner
      )
    )
    enquiries.push(out.enquiryId)
    expect(out).toMatchObject({ lines: 3, replayed: false })
    expect(preview === null || out.ref >= preview).toBe(true)
    const e = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: out.enquiryId },
      include: { lines: { orderBy: { no: 'asc' } } },
    })
    expect(e).toMatchObject({
      clientId: l.companyId,
      clientRef: 'SC-RFQ-1',
      ownerId: helper.id,
      preallocateRequested: true,
      receivedVia: 'email',
      stage: 'new',
    })
    expect(e.deadline?.toISOString()).toBe('2099-10-02T10:00:00.000Z')
    expect(e.lines.map((x) => [x.no, x.description, x.qty.toString()])).toEqual([
      [1, 'Hose 1/2"', '24'],
      [2, 'Hose 3/4"', '12'],
      [3, 'Gasket set', '4'],
    ])
    expect(
      (await opsDb.intakeBatch.findUniqueOrThrow({ where: { id: l.batchId } })).enquiryId
    ).toBe(out.enquiryId)
    const lead = await opsDb.lead.findUniqueOrThrow({ where: { id: l.id } })
    expect(lead).toMatchObject({ stage: 'converted', convertedEnquiryId: out.enquiryId })
    const notes = await opsDb.activityEvent.findFirstOrThrow({
      where: { subjectId: out.enquiryId, field: 'notes' },
    })
    expect(notes.note).toBe('Lead notes: Prefers EU makes.')
    const again = await opsDb.$transaction((tx) =>
      convertLeadToEnquiry(
        tx,
        { leadId: l.id, ownerId: helper.id, categories: [tradeB], preallocate: false },
        owner
      )
    )
    expect(again).toMatchObject({
      enquiryId: out.enquiryId,
      ref: out.ref,
      replayed: true,
      lines: 3,
    })
    expect(
      await opsDb.issuedNumber.count({ where: { sequenceKey: 'enquiry', formatted: out.ref } })
    ).toBe(1)
  })

  it('refuses no categories, an inactive owner and a line without a quantity', async () => {
    const l = await leadWithLines()
    await expect(
      opsDb.$transaction((tx) =>
        convertLeadToEnquiry(
          tx,
          { leadId: l.id, ownerId: owner.id, categories: [], preallocate: false },
          owner
        )
      )
    ).rejects.toThrow('Tick at least one category')
    await expect(
      opsDb.$transaction((tx) =>
        convertLeadToEnquiry(
          tx,
          {
            leadId: l.id,
            ownerId: '00000000-0000-7000-8000-000000000999',
            categories: [tradeA],
            preallocate: false,
          },
          owner
        )
      )
    ).rejects.toThrow('Choose an active team member')
    await opsDb.leadLine.updateMany({ where: { leadId: l.id, no: 3 }, data: { qty: null } })
    await expect(
      opsDb.$transaction((tx) =>
        convertLeadToEnquiry(
          tx,
          { leadId: l.id, ownerId: owner.id, categories: [tradeB], preallocate: false },
          owner
        )
      )
    ).rejects.toThrow('Line 3 has no quantity')
  })

  it('spec edits and stage changes are version-checked and logged; the machine refuses a skip', async () => {
    const l = await leadWithLines()
    const line = await opsDb.leadLine.findFirstOrThrow({ where: { leadId: l.id, no: 1 } })
    await opsDb.$transaction((tx) =>
      updateLeadLineSpec(
        tx,
        { lineId: line.id, version: line.version, specNotes: 'EN 853 2SN' },
        owner
      )
    )
    await expect(
      opsDb.$transaction((tx) =>
        updateLeadLineSpec(tx, { lineId: line.id, version: line.version, specNotes: 'x' }, owner)
      )
    ).rejects.toThrow('Someone changed this a moment ago')
    const lead = await opsDb.lead.findUniqueOrThrow({ where: { id: l.id } })
    await expect(
      opsDb.$transaction((tx) =>
        setLeadStage(tx, { leadId: l.id, version: lead.version, to: 'qualified' }, owner)
      )
    ).rejects.toThrow('New cannot move to Qualified')
    await opsDb.$transaction((tx) =>
      setLeadStage(tx, { leadId: l.id, version: lead.version, to: 'contacted' }, owner)
    )
    const ev = await opsDb.activityEvent.findMany({
      where: { subjectType: 'lead', subjectId: l.id },
      orderBy: { at: 'asc' },
    })
    expect(ev.map((e) => e.field)).toEqual(expect.arrayContaining(['line1.specNotes', 'stage']))
  })

  it('CSV: parsed on the server, bad rows reported, unknown columns listed', async () => {
    const csv = [
      'Name,Company,Email,Est value,Currency,Next action date,Owner,Colour',
      `Ann ${TAG},Sample Co,ann@example.test,1000,usd,2099-10-01,ZZ,red`,
      ',Nobody Co,,,,,,',
      `Bob ${TAG},,not-an-email,,,,,`,
      `Cy ${TAG},,,12x,,,,`,
      `Di ${TAG},,,,,31/12/2099,,`,
    ].join('\n')
    const p = parseLeadCsv(csv)
    expect(p.unknownColumns).toEqual(['colour'])
    expect(p.rows.map((r) => r.row)).toEqual([2, 6])
    expect(p.skipped).toEqual([
      { row: 3, reason: 'name is empty' },
      { row: 4, reason: 'email is not an address' },
      { row: 5, reason: 'est value is not a number' },
    ])
    expect(parseLeadCsv('Company\nX').skipped).toEqual([{ row: 1, reason: 'no "name" column' }])
    const out = await importLeadsCsv(csv, owner)
    expect(out.created).toBe(2)
    const ann = await opsDb.lead.findFirstOrThrow({ where: { name: `Ann ${TAG}` } })
    expect(ann).toMatchObject({ source: 'import', estCurrency: 'USD', ownerId: owner.id })
    expect(ann.estValue?.toString()).toBe('1000')
    const di = await opsDb.lead.findFirstOrThrow({ where: { name: `Di ${TAG}` } })
    expect(di.nextActionAt?.toISOString()).toBe('2099-12-31T06:00:00.000Z')
  })

  it('CSV: at most 500 rows per transaction', async () => {
    const rows = Array.from({ length: MAX_ROWS_PER_TX + 3 }, (_, i) => `Bulk ${TAG} ${i}`)
    const sizes: number[] = []
    const out = await importLeadsCsv(['Name', ...rows].join('\n'), owner, async (_fn, n) => {
      sizes.push(n)
    })
    expect(sizes).toEqual([500, 3])
    expect(out.created).toBe(MAX_ROWS_PER_TX + 3)
  })
})
