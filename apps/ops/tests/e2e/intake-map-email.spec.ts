import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { opsDb as db, Prisma } from '@indus/ops-db'
import { expect, test } from '../signed-in'
import { runStep } from '../support/steps'

/**
 * S08-T05 · board-35 Map spreadsheet columns and board-36 Read lines from email. The local Inngest stub runs no
 * function, so the capture step a real run would take is run here in a subprocess (tests/support/run-step.ts) —
 * the same server code. Board 35: upload a sheet, map it, remember it for the client, and the client's next sheet
 * opens with the mapping applied. Board 36: open a seeded message, the intake opens once, the table and sentence
 * are marked, the earlier reply is ignored, and Continue creates the enquiry.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const FIX = join(process.cwd(), 'src', 'server', 'intake', 'parse', '__fixtures__')
const batches: string[] = []
const enquiries: string[] = []
let companyId = ''

test.beforeAll(async () => {
  companyId = (
    await db.company.create({
      data: { name: `Sample Client LLC e2e ${Date.now()}` },
      select: { id: true },
    })
  ).id
})

test.afterAll(async () => {
  if (enquiries.length)
    await db.enquiry.updateMany({
      where: { id: { in: enquiries } },
      data: { closedReason: 'other', closeNote: 'e2e', closedAt: new Date() },
    })
  if (batches.length)
    await db.intakeBatch.deleteMany({ where: { id: { in: batches }, status: 'open' } })
  await db.clientColumnMapping.deleteMany({ where: { companyId } })
})

async function uploadSheet(page: import('@playwright/test').Page, name: string) {
  await page.goto('/enquiries/new')
  const chooser = page.getByLabel('Choose enquiry files')
  await expect(chooser).toHaveAttribute('data-ready', 'true', { timeout: 90_000 })
  await chooser.setInputFiles({
    name,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: (await import('node:fs')).readFileSync(join(FIX, 'spares.xlsx')),
  })
  await expect(page).toHaveURL(/batch=/, { timeout: 60_000 })
  const batchId = new URL(page.url()).searchParams.get('batch')!
  batches.push(batchId)
  await db.intakeBatch.update({ where: { id: batchId }, data: { clientCompanyId: companyId } })
  const file = await db.intakeFile.findFirstOrThrow({ where: { batchId }, select: { id: true } })
  return { batchId, fileId: file.id }
}

test('board-35: map the columns, remember them, the next sheet opens mapped', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  const first = await uploadSheet(page, 'Spares-Q4.xlsx')
  expect(runStep('map-sheet', first.fileId)).toEqual({ lines: 12, remembered: false })

  await page.goto(`/enquiries/new?batch=${first.batchId}`)
  await page.getByRole('link', { name: 'Map columns →' }).click({ timeout: 90_000 })
  await expect(
    page.getByRole('heading', { name: 'Map spreadsheet columns', level: 1 })
  ).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByText('Sheet 1 of 3 · 18 rows · 6 columns')).toBeVisible()
  await expect(page.getByText('Rows 1–2 are a merged title')).toBeVisible()
  await expect(page.getByText('row 18 is a total and is skipped')).toBeVisible()
  await expect(page.getByText('Consumables also has a table · 8 rows')).toBeVisible()
  await expect(
    page.getByText('Line 12 has no part number. It goes to review with the description only.')
  ).toBeVisible()
  await expect(page.getByText('12 lines ready · 2 to check')).toBeVisible()
  await expect(page.getByLabel('Column C, Maker P/N, maps to')).toHaveValue('part_no')

  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await page.getByLabel('Column F, Remarks, maps to').selectOption('spec')
  await expect
    .poll(
      async () =>
        (await db.intakeLineCandidate.findFirst({ where: { fileId: first.fileId, ord: 4 } }))
          ?.spec ?? null,
      { timeout: 30_000 }
    )
    .toBe('As per sample')
  await expect(
    page.getByRole('checkbox', { name: /Remember this mapping for Sample Client LLC e2e/ })
  ).toBeChecked()
  await page.getByRole('button', { name: 'Continue to review' }).click()
  await expect(page).toHaveURL(new RegExp(`/enquiries/intake/${first.batchId}$`), {
    timeout: 60_000,
  })
  await expect(page.getByRole('heading', { name: 'Review extracted lines', level: 1 })).toBeVisible(
    {
      timeout: 90_000,
    }
  )
  const saved = await db.clientColumnMapping.findFirstOrThrow({ where: { companyId } })
  expect((saved.byHeader as Record<string, string>).remarks).toBe('spec')

  const second = await uploadSheet(page, 'Spares-Q1.xlsx')
  expect(runStep('map-sheet', second.fileId)).toEqual({ lines: 12, remembered: true })
  await page.goto(`/enquiries/intake/${second.batchId}/map?file=${second.fileId}`)
  await expect(page.getByText('Applied from the last sheet this client sent.')).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByLabel('Column F, Remarks, maps to')).toHaveValue('spec')
  expect(
    (await db.clientColumnMapping.findUniqueOrThrow({ where: { id: saved.id } })).usedCount
  ).toBe(2)
})

const BODY = [
  'Dear Indus team,',
  '',
  'Please quote your best price and delivery for the below, required onboard by 30 Sep.',
  '',
  'Item\tDescription\tP/N\tQty',
  '1\tHose 1" 4SH, 1.5 m, JIC F/F\t\t6 nos',
  '2\tDirectional valve NG10, 24 VDC\tTEST-NG10-24\t2 nos',
  '3\tReturn filter element\tTEST-HF-10-220\t6 nos',
  '',
  'Also need 4 nos pressure gauge 0-250 bar, same as last order.',
  '',
  'Drawing of the HPU attached for reference.',
  '',
  'Best regards,',
  'Sample Buyer',
  '',
  'On 2 Sep 2026, Example Sales <sales@example.test> wrote:',
  '> Please find our quotation attached for the gauges and fittings.',
].join('\n')

test('board-36: read lines from an email, continue to an enquiry', async ({ page, signedInAs }) => {
  const mailbox = await db.mailbox.findFirstOrThrow({ select: { id: true } })
  const domain = `e2e${Date.now()}.example.test`
  await db.company.update({ where: { id: companyId }, data: { domains: [domain] } })
  const thread = await db.mailThread.create({
    data: { mailboxId: mailbox.id, gmailThreadId: `t-e2e-${randomUUID()}` },
    select: { id: true },
  })
  const msg = await db.mailMessage.create({
    data: {
      mailboxId: mailbox.id,
      threadId: thread.id,
      gmailMessageId: `g-e2e-${randomUUID()}`,
      direction: 'inbound',
      fromAddress: `buyer@${domain}`,
      fromName: 'Sample Buyer',
      toAddresses: ['sales@example.test'],
      ccAddresses: [],
      subject: 'RFQ – hydraulic spares / SC-RFQ-0924',
      bodyText: BODY,
      bodyTextHash: randomUUID(),
      sentAt: new Date('2026-09-22T06:14:00Z'),
      labelsApplied: [],
      origin: 'live',
    },
    select: { id: true },
  })

  await signedInAs('owner')
  await page.goto(`/mail/inbox/${thread.id}/read-lines`)
  await expect(page.getByRole('heading', { name: 'Read lines from email', level: 1 })).toBeVisible({
    timeout: 90_000,
  })
  // Arriving opens the message's intake once.
  await expect
    .poll(async () => db.intakeBatch.count({ where: { mailMessageId: msg.id } }), {
      timeout: 30_000,
    })
    .toBe(1)
  const b = await db.intakeBatch.findFirstOrThrow({
    where: { mailMessageId: msg.id },
    select: { id: true, files: { select: { id: true, kind: true } } },
  })
  batches.push(b.id)
  const body = b.files.find((f) => f.kind === 'email')!

  // What extract_lines stages for the body (the stub runs no function): three table lines and the sentence.
  const lines: Array<[string, string | null, number, 'table' | 'text', 'sure' | 'likely', string]> =
    [
      ['Hose 1" 4SH, 1.5 m, JIC F/F', null, 6, 'table', 'likely', 'Hose 1" 4SH, 1.5 m, JIC F/F'],
      [
        'Directional valve NG10, 24 VDC',
        'TEST-NG10-24',
        2,
        'table',
        'sure',
        'Directional valve NG10',
      ],
      ['Return filter element', 'TEST-HF-10-220', 6, 'table', 'sure', 'Return filter element'],
      ['Pressure gauge 0-250 bar', null, 4, 'text', 'sure', 'pressure gauge 0-250 bar'],
    ]
  for (const [i, [description, partNo, qty, detail, confidence, quote]] of lines.entries()) {
    const at = BODY.indexOf(quote)
    const span = await db.sourceSpan.create({
      data: {
        sourceKind: 'email',
        sourceId: msg.id,
        charStart: at,
        charEnd: at + quote.length,
        quote,
        resolved: 'exact',
      },
      select: { id: true },
    })
    await db.intakeLineCandidate.create({
      data: {
        batchId: b.id,
        fileId: body.id,
        ord: i + 1,
        description,
        partNo,
        qty: new Prisma.Decimal(qty),
        uom: 'EA',
        uomRaw: 'nos',
        confidence,
        reasons: partNo ? [] : ['No part no. · matched by description'],
        sourceKind: 'email',
        sourceDetail: detail,
        spanIds: [span.id],
        fieldSpans: { description: span.id },
      },
    })
  }
  await db.intakeFile.update({ where: { id: body.id }, data: { status: 'ready', linesFound: 4 } })
  runStep('same-as-before', body.id)

  await page.reload()
  await expect(page.getByText('Table · 3 lines')).toBeVisible({ timeout: 60_000 })
  await expect(page.getByText('Text · 1 line')).toBeVisible()
  await expect(page.getByText('Ignored · earlier reply')).toBeVisible()
  await expect(page.getByText('Found in the subject')).toBeVisible()
  await expect(page.getByText('“required onboard by 30 Sep”')).toBeVisible()
  await expect(
    page
      .getByText('Which earlier order?')
      .or(page.getByText('Points at an earlier order that is not on file'))
  ).toBeVisible()
  await expect(page.getByText('4 lines · 2 to check')).toBeVisible()
  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await page.getByRole('button', { name: 'Continue to match' }).click()
  await expect(page).toHaveURL(/\/enquiries\/ENQ-\d{4}-\d+/, { timeout: 60_000 })
  const done = await db.intakeBatch.findUniqueOrThrow({
    where: { id: b.id },
    select: { status: true, enquiryId: true },
  })
  expect(done.status).toBe('confirmed')
  enquiries.push(done.enquiryId!)
  // The Unsure line ("same as last order" with no history) is not written: it stays a question.
  expect(await db.enquiryLine.count({ where: { enquiryId: done.enquiryId! } })).toBe(3)
})
