import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { opsDb as db, Prisma } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S08 · board-15 Review extracted lines and board-17 intake exceptions. A PDF is uploaded through board 14 for real;
 * the lines a capture would stage (the local Inngest stub runs no function) are written here with their spans. The
 * person resolves an Unsure part number, merges a duplicate, confirms a Check line, accepts all high and continues:
 * the enquiry exists with the decided lines and an ENQ number. Board 17's states render from the kit sheet.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const FIX = join(process.cwd(), 'src', 'server', 'intake', 'parse', '__fixtures__')
const batches: string[] = []
const enquiries: string[] = []

test.afterAll(async () => {
  if (enquiries.length)
    await db.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedReason: 'other', closeNote: 'e2e', closedAt: new Date() },
    })
  if (batches.length)
    await db.intakeBatch.deleteMany({ where: { id: { in: batches }, status: 'open' } })
})

test('board-15: review, resolve, merge, accept all high, continue', async ({
  page,
  signedInAs,
}) => {
  const owner = await db.user.findFirstOrThrow({ where: { role: 'owner' }, select: { id: true } })
  const seq = await db.numberSequence.findUniqueOrThrow({
    where: { key: 'enquiry' },
    select: { seededAt: true },
  })
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
    new Date()
  )
  if (!seq.seededAt)
    await db.$executeRaw`SELECT ops.seed_number_sequence('enquiry', 9001, '{"source":"local e2e"}'::jsonb, ${year}, ${owner.id}::uuid)`

  await signedInAs('owner')
  await page.goto('/enquiries/new')
  const chooser = page.getByLabel('Choose enquiry files')
  await expect(chooser).toHaveAttribute('data-ready', 'true', { timeout: 90_000 })
  await chooser.setInputFiles(join(FIX, 'rfq-3-pages.pdf'))
  await expect(page).toHaveURL(/batch=/, { timeout: 60_000 })
  const batchId = new URL(page.url()).searchParams.get('batch')!
  batches.push(batchId)
  const file = await db.intakeFile.findFirstOrThrow({
    where: { batchId },
    select: { id: true, storedFileId: true },
  })

  // What extract_lines stages (the stub runs no function): five lines, spans on page 1.
  const span = (quote: string, y: number) =>
    db.sourceSpan.create({
      data: {
        sourceKind: 'pdf',
        sourceId: file.storedFileId!,
        page: 1,
        bbox: { x: 70, y, w: 420, h: 10 },
        quote,
        resolved: 'exact',
      },
      select: { id: true },
    })
  const mk = async (
    ord: number,
    over: Partial<Prisma.IntakeLineCandidateUncheckedCreateInput>,
    y: number
  ) => {
    const s = await span(String(over.description ?? 'line'), y)
    return db.intakeLineCandidate.create({
      data: {
        batchId,
        fileId: file.id,
        ord,
        uom: 'EA',
        confidence: 'sure',
        sourcePage: 1,
        sourceKind: 'pdf',
        spanIds: [s.id],
        fieldSpans: { description: s.id },
        description: 'x',
        ...over,
      },
      select: { id: true },
    })
  }
  await mk(
    1,
    {
      description: 'Ball valve 2" ANSI 300 RF',
      partNo: 'TEST-0001',
      partNoNorm: 'TEST0001',
      qty: new Prisma.Decimal(10),
    },
    112
  )
  await mk(
    2,
    {
      description: 'Gate valve 4" class 150',
      partNo: 'TEST-0002',
      partNoNorm: 'TEST0002',
      qty: new Prisma.Decimal(4),
    },
    130
  )
  await mk(
    3,
    {
      description: 'Spiral wound gasket 2" 300#',
      partNo: 'TEST-0003',
      partNoNorm: 'TEST0003',
      qty: new Prisma.Decimal(24),
      confidence: 'likely',
      reasons: ['Unit read from the column header'],
    },
    148
  )
  await mk(
    4,
    {
      description: 'Hydraulic filter element 10 µm',
      partNo: 'TEST-1O-220',
      partNoNorm: 'TEST1O220',
      qty: new Prisma.Decimal(18),
      confidence: 'unsure',
      reasons: ['Part no. has look-alike readings'],
      unsure: {
        field: 'partNumber',
        question: 'Line 4 · which part number is right?',
        options: [
          { value: 'TEST-10-220', label: 'TEST-10-220', sub: 'seen on 3 past RFQs' },
          { value: 'TEST-1O-220', label: 'TEST-1O-220', sub: 'as read' },
        ],
      },
    },
    166
  )
  const dup = await mk(
    5,
    {
      description: 'Ball valve 2" ANSI 300 RF',
      partNo: 'TEST-0001',
      partNoNorm: 'TEST0001',
      qty: new Prisma.Decimal(10),
    },
    184
  )
  const first = await db.intakeLineCandidate.findFirstOrThrow({
    where: { batchId, ord: 1 },
    select: { id: true },
  })
  await db.intakeLineCandidate.update({ where: { id: dup.id }, data: { duplicateOfId: first.id } })
  await db.intakeFile.update({
    where: { id: file.id },
    data: { status: 'ready', linesFound: 5, linesToCheck: 3, pageCount: 3 },
  })

  await page.goto(`/enquiries/intake/${batchId}`)
  await expect(page.getByRole('heading', { name: 'Review extracted lines', level: 1 })).toBeVisible(
    { timeout: 90_000 }
  )
  await expect(page.locator('main#content [data-template="T9"]')).toBeVisible()
  await expect(page.getByText('2 high')).toBeVisible()
  await expect(page.getByText('1 check')).toBeVisible()
  await expect(page.getByText('1 low')).toBeVisible()
  await expect(page.getByText('1 duplicate', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Page 1 of rfq-3-pages.pdf' })).toBeVisible()
  await expect(page.getByText('Same as line 1')).toBeVisible()
  const cont = page.getByRole('button', { name: 'Continue to match' })
  await expect(cont).toBeDisabled()

  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  // Keyboard: the quantity cell saves on Enter.
  const qty = page.getByLabel('Quantity, line 2')
  await qty.fill('6')
  await qty.press('Enter')
  await expect
    .poll(
      async () =>
        (
          await db.intakeLineCandidate.findFirstOrThrow({ where: { batchId, ord: 2 } })
        ).qty?.toString(),
      { timeout: 30_000 }
    )
    .toBe('6')

  await page.getByRole('button', { name: 'TEST-10-220 · seen on 3 past RFQs' }).click()
  await expect
    .poll(
      async () =>
        (await db.intakeLineCandidate.findFirstOrThrow({ where: { batchId, ord: 4 } })).partNo,
      { timeout: 30_000 }
    )
    .toBe('TEST-10-220')
  await page.getByRole('button', { name: 'Merge · keep 10' }).click()
  await expect
    .poll(
      async () =>
        (await db.intakeLineCandidate.findUniqueOrThrow({ where: { id: dup.id } })).decision,
      { timeout: 30_000 }
    )
    .toBe('merged')
  await page.getByRole('button', { name: 'Confirm line 3 as read' }).click()
  await expect
    .poll(
      async () =>
        (await db.intakeLineCandidate.findFirstOrThrow({ where: { batchId, ord: 3 } })).decision,
      { timeout: 30_000 }
    )
    .toBe('accepted')
  await page.getByRole('button', { name: 'Accept all high' }).click()
  await expect(page.getByText(/^4 of 4 confirmed/)).toBeVisible({ timeout: 30_000 })
  await expect(cont).toBeEnabled()
  await cont.click()
  await expect(page).toHaveURL(new RegExp(`/enquiries/ENQ-${year}-\\d+`), { timeout: 60_000 })
  const b = await db.intakeBatch.findUniqueOrThrow({
    where: { id: batchId },
    select: { status: true, enquiryId: true },
  })
  expect(b.status).toBe('confirmed')
  enquiries.push(b.enquiryId!)
  const lines = await db.enquiryLine.findMany({
    where: { enquiryId: b.enquiryId! },
    orderBy: { no: 'asc' },
    select: { clientPartNo: true, qty: true },
  })
  expect(lines.map((l) => [l.clientPartNo, l.qty.toString()])).toEqual([
    ['TEST-0001', '10'],
    ['TEST-0002', '6'],
    ['TEST-0003', '24'],
    ['TEST-10-220', '18'],
  ])
})

test('board-17: the four intake exception states', async ({ page }) => {
  await page.goto('/_kit/intake-states')
  await expect(page.getByRole('heading', { name: 'Image too low resolution' })).toBeVisible({
    timeout: 90_000,
  })
  await expect(
    page.getByText(
      'scan_0019.jpg is 96 dpi. Part numbers could not be read with any confidence, so no lines were created.'
    )
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ask client for original' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Handwritten changes on a printed list' })
  ).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Handwritten · 10' })).toBeVisible()
  await expect(
    page.getByText('Choice is logged on the line with the page crop attached.')
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Merge · keep 24' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Merge · sum to 48' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'This looks like a revision of ENQ-2026-0411' })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Treat as new enquiry' })).toBeVisible()
  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})
