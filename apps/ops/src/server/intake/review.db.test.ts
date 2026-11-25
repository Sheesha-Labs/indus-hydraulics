import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { opsDb, Prisma } from '@indus/ops-db'
import { localDatabaseUrl } from '../mail-send/testing/fixture'

/**
 * Board 15 and board 17 decisions on the local database (S08-T04): accept-all-high touches only Sure lines;
 * Continue is blocked by an Unsure answer, an unmerged duplicate or an undecided line; an answer is the person's
 * ("Decided by") with a preference signal; merges keep or sum; a revision is detected by client reference; and
 * confirming writes the enquiry and its decided lines — never an Unsure one — with an ENQ number.
 */
const DB_URL = localDatabaseUrl()
vi.mock('@sentry/nextjs', () => ({
  captureException: () => undefined,
  withScope: () => undefined,
}))

const {
  acceptAllHigh,
  initials,
  continueBlocker,
  countsOf,
  detectDuplicates,
  detectRevision,
  mergeDuplicates,
  resolveUnsure,
  confirmCandidate,
} = await import('./review')
const { confirmIntakeAsPerson } = await import('../enquiry/from-batch')

describe.skipIf(!DB_URL)('intake review · local database', () => {
  let owner = { id: '', name: '' }
  let batchId = ''
  const enquiries: string[] = []
  const ids: Record<string, string> = {}
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
    new Date()
  )

  beforeAll(async () => {
    owner = await opsDb.user.findFirstOrThrow({
      where: { role: 'owner' },
      select: { id: true, name: true },
    })
    const seq = await opsDb.numberSequence.findUniqueOrThrow({
      where: { key: 'enquiry' },
      select: { seededAt: true },
    })
    if (!seq.seededAt)
      await opsDb.$executeRaw`SELECT ops.seed_number_sequence('enquiry', 9001, '{"source":"local test"}'::jsonb, ${year}, ${owner.id}::uuid)`
    const b = await opsDb.intakeBatch.create({
      data: { source: 'upload', createdById: owner.id, clientRef: `SC-TEST-${Date.now()}` },
      select: { id: true },
    })
    batchId = b.id
    const line = (ord: number, over: Partial<Prisma.IntakeLineCandidateUncheckedCreateInput>) =>
      opsDb.intakeLineCandidate.create({
        data: {
          batchId,
          ord,
          description: `Ball valve ${ord}"`,
          qty: new Prisma.Decimal(ord * 2),
          uom: 'EA',
          partNo: `TEST-${ord}`,
          partNoNorm: `TEST${ord}`,
          confidence: 'sure',
          ...over,
        },
        select: { id: true },
      })
    ids.sure1 = (await line(1, {})).id
    ids.sure2 = (await line(2, {})).id
    ids.check = (
      await line(3, { confidence: 'likely', reasons: ['Unit read from the column header'] })
    ).id
    ids.low = (
      await line(4, {
        confidence: 'unsure',
        qty: null,
        unsure: {
          field: 'qty',
          question: 'Line 4 · which quantity is right?',
          options: [
            { value: '8', label: '8' },
            { value: '10', label: '10' },
          ],
        },
      })
    ).id
    ids.dup = (
      await line(5, {
        description: 'Ball valve 1"',
        partNo: 'TEST-1',
        partNoNorm: 'TEST1',
        qty: new Prisma.Decimal(2),
      })
    ).id
  })

  afterAll(async () => {
    await opsDb.intakeBatch.deleteMany({ where: { id: batchId } })
    if (enquiries.length)
      await opsDb.enquiry.updateMany({
        where: { id: { in: enquiries } },
        data: { closedReason: 'other', closeNote: 'test', closedAt: new Date() },
      })
  })

  it('flags the repeat of line 1 as a duplicate', async () => {
    expect(await opsDb.$transaction((tx) => detectDuplicates(tx, batchId))).toBe(1)
    expect(
      (await opsDb.intakeLineCandidate.findUniqueOrThrow({ where: { id: ids.dup! } })).duplicateOfId
    ).toBe(ids.sure1)
  })

  it('accept all high touches Sure, non-duplicate lines only', async () => {
    expect(await acceptAllHigh(owner, batchId)).toEqual({ accepted: 2 })
    const rows = await opsDb.intakeLineCandidate.findMany({
      where: { batchId },
      orderBy: { ord: 'asc' },
      select: { decision: true },
    })
    expect(rows.map((r) => r.decision)).toEqual([
      'accepted',
      'accepted',
      'pending',
      'pending',
      'pending',
    ])
  })

  it('Continue is blocked by an Unsure line, then a duplicate, then an undecided Check line', async () => {
    const counts = async () =>
      countsOf(
        await opsDb.intakeLineCandidate.findMany({
          where: { batchId },
          select: { decision: true, confidence: true, duplicateOfId: true, unsure: true },
        })
      )
    expect(continueBlocker(await counts())).toBe('1 line still needs an answer.')
    const low = await opsDb.intakeLineCandidate.findUniqueOrThrow({ where: { id: ids.low! } })
    await resolveUnsure(owner, { id: ids.low!, version: low.version, value: '10', via: 'option' })
    expect(continueBlocker(await counts())).toBe('1 duplicate to merge or keep.')
    await mergeDuplicates(owner, ids.dup!, 'sum')
    expect(continueBlocker(await counts())).toBe('1 line still to confirm.')
    const check = await opsDb.intakeLineCandidate.findUniqueOrThrow({ where: { id: ids.check! } })
    await confirmCandidate(owner, ids.check!, check.version)
    expect(continueBlocker(await counts())).toBeNull()
  })

  it('an answer is the person’s, logged with a preference signal; a merge sums the quantities', async () => {
    const low = await opsDb.intakeLineCandidate.findUniqueOrThrow({ where: { id: ids.low! } })
    expect(low.qty?.toString()).toBe('10')
    expect(low.decision).toBe('edited')
    expect(low.unsure).toBeNull()
    expect(low.reasons).toContain(`Decided by ${initials(owner.name)}`)
    const ev = await opsDb.activityEvent.findFirst({
      where: { field: 'line 4 qty', actorId: owner.id },
      orderBy: { at: 'desc' },
    })
    expect(ev?.note).toMatch(/^Decided by /)
    const sig = await opsDb.preferenceSignal.findFirst({
      where: { kind: 'unsure_choice', createdById: owner.id },
      orderBy: { createdAt: 'desc' },
    })
    expect(sig?.payload).toMatchObject({ field: 'qty', chosen: '10', via: 'option' })
    const first = await opsDb.intakeLineCandidate.findUniqueOrThrow({ where: { id: ids.sure1! } })
    expect(first.qty?.toString()).toBe('4')
    expect(
      (await opsDb.intakeLineCandidate.findUniqueOrThrow({ where: { id: ids.dup! } })).decision
    ).toBe('merged')
  })

  it('a revision is detected by the client reference of an open enquiry', async () => {
    const b = await opsDb.intakeBatch.findUniqueOrThrow({ where: { id: batchId } })
    expect(await detectRevision(batchId)).toBeNull()
    const id = (
      await opsDb.enquiry.create({
        data: {
          ref: `ENQ-2099-${String(Date.now()).slice(-7)}`,
          title: 'Earlier',
          clientRef: b.clientRef,
          receivedVia: 'manual',
          receivedAt: new Date(),
          lines: {
            create: [
              {
                no: 1,
                description: 'Ball valve 1"',
                qty: new Prisma.Decimal(2),
                clientPartNo: 'TEST-1',
              },
            ],
          },
        },
        select: { id: true },
      })
    ).id
    enquiries.push(id)
    const hit = await detectRevision(batchId)
    expect(hit).toMatchObject({ enquiryId: id, reason: 'client_ref' })
    expect(hit!.changes).toEqual([{ ord: 1, description: 'Ball valve 1"', from: '2', to: '4' }])
  })

  it('confirm writes the enquiry and the decided lines, with an ENQ number', async () => {
    const out = await confirmIntakeAsPerson(owner, batchId, {})
    enquiries.push(out.enquiryId)
    expect(out.ref).toMatch(new RegExp(`^ENQ-${year}-\\d+$`))
    expect(out.lineCount).toBe(4)
    const e = await opsDb.enquiry.findUniqueOrThrow({
      where: { id: out.enquiryId },
      include: { lines: { orderBy: { no: 'asc' } } },
    })
    expect(e.lines.map((l) => [l.clientPartNo, l.qty.toString()])).toEqual([
      ['TEST-1', '4'],
      ['TEST-2', '4'],
      ['TEST-3', '6'],
      ['TEST-4', '10'],
    ])
    expect(e.receivedVia).toBe('file_upload')
    const b = await opsDb.intakeBatch.findUniqueOrThrow({ where: { id: batchId } })
    expect(b).toMatchObject({
      status: 'confirmed',
      enquiryId: out.enquiryId,
      confirmedById: owner.id,
    })
    const num = await opsDb.issuedNumber.findFirst({
      where: { sequenceKey: 'enquiry', formatted: out.ref },
    })
    expect(num).toMatchObject({ status: 'issued', recordId: out.enquiryId })
    await expect(confirmIntakeAsPerson(owner, batchId, {})).rejects.toThrow(
      'These lines are already confirmed.'
    )
  })
})
