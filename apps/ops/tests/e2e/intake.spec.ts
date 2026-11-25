import { copyFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S08 · board-14 Upload and processing queue. Files go from the browser straight to Storage on signed URLs, Ops
 * reads them back and queues them. The local Inngest stub records events but runs no function, so the states a
 * capture job writes (Extracting, Ready, Needs attention) are set on the rows here; the job itself is tested in
 * capture.db.test.ts. Cancel and Remove are clicked for real; a file whose bytes disagree with its name is refused.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

// Playwright runs from apps/ops.
const FIX = join(process.cwd(), 'src', 'server', 'intake', 'parse', '__fixtures__')
const batches: string[] = []

test.afterAll(async () => {
  if (batches.length) await db.intakeBatch.deleteMany({ where: { id: { in: batches } } })
})

test('board-14: upload, queue states, cancel, remove, review link', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/enquiries/new')
  await expect(
    page.getByRole('heading', { name: 'Upload enquiry documents', level: 1 })
  ).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('heading', { name: 'Drop enquiry files here' })).toBeVisible()
  await expect(page.getByText('What happens next')).toBeVisible()

  await page
    .getByLabel('Choose enquiry files')
    .setInputFiles(
      ['encrypted.pdf', 'rfq-3-pages.pdf', 'scan-96dpi.jpg', 'semicolons.csv'].map((f) =>
        join(FIX, f)
      )
    )
  await expect(page).toHaveURL(/\/enquiries\/new\?batch=[0-9a-f-]{36}/, { timeout: 60_000 })
  const batchId = new URL(page.url()).searchParams.get('batch')!
  batches.push(batchId)
  await expect(page.getByText('Processing queue · 4 files')).toBeVisible({ timeout: 30_000 })
  const files = await db.intakeFile.findMany({
    where: { batchId },
    select: { id: true, filename: true, status: true },
  })
  expect(files.map((f) => f.status)).toEqual(['queued', 'queued', 'queued', 'queued'])
  const id = (name: string) => files.find((f) => f.filename === name)!.id

  // What the capture job writes, set here (the stub runs no function).
  await db.intakeFile.update({
    where: { id: id('rfq-3-pages.pdf') },
    data: { status: 'extracting', progressPct: 40, progressNote: 'Reading 3 pages', pageCount: 3 },
  })
  await db.intakeFile.update({
    where: { id: id('scan-96dpi.jpg') },
    data: {
      status: 'needs_attention',
      progressPct: 100,
      progressNote: 'Image too low resolution to read reliably',
      failureKind: 'unreadable',
      failureNote: '96 dpi scan',
    },
  })
  await db.intakeFile.update({
    where: { id: id('semicolons.csv') },
    data: { status: 'ready', progressPct: 100, linesFound: 7, linesToCheck: 1 },
  })
  await page.reload()

  const row = (name: string) => page.getByRole('listitem').filter({ hasText: name })
  await expect(row('rfq-3-pages.pdf').getByText('Extracting')).toBeVisible()
  await expect(row('rfq-3-pages.pdf').getByText('Reading 3 pages')).toBeVisible()
  await expect(row('scan-96dpi.jpg').getByText('Needs attention')).toBeVisible()
  await expect(row('scan-96dpi.jpg').getByText('JPEG · 96 dpi scan')).toBeVisible()
  await expect(row('scan-96dpi.jpg').getByRole('button', { name: 'Re-upload' })).toBeVisible()
  await expect(row('semicolons.csv').getByText('7 lines extracted · 1 to check')).toBeVisible()
  await expect(row('semicolons.csv').getByRole('link', { name: 'Review →' })).toHaveAttribute(
    'href',
    `/enquiries/intake/${batchId}`
  )
  await expect(row('encrypted.pdf').getByText('Queued')).toBeVisible()

  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await row('rfq-3-pages.pdf').getByRole('button', { name: 'Cancel' }).click()
  await expect
    .poll(
      async () =>
        (await db.intakeFile.findUniqueOrThrow({ where: { id: id('rfq-3-pages.pdf') } })).status,
      { timeout: 60_000 }
    )
    .toBe('cancelled')
  await expect(row('rfq-3-pages.pdf').locator('[data-part="chip"]')).toHaveText('Cancelled', {
    timeout: 20_000,
  })
  await expect(row('rfq-3-pages.pdf').getByText('Stopped before any line was read')).toBeVisible()
  await row('encrypted.pdf').getByRole('button', { name: 'Remove' }).click()
  await expect
    .poll(
      async () =>
        (await db.intakeFile.findUniqueOrThrow({ where: { id: id('encrypted.pdf') } })).status,
      { timeout: 60_000 }
    )
    .toBe('removed')
  await expect(row('encrypted.pdf')).toHaveCount(0, { timeout: 60_000 })
  await expect(page.getByText('Processing queue · 3 files')).toBeVisible()
  // Nothing was written to an enquiry.
  expect((await db.intakeBatch.findUniqueOrThrow({ where: { id: batchId } })).enquiryId).toBeNull()
})

test('board-14: a file whose bytes disagree with its name is refused', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/enquiries/new')
  await expect(page.getByRole('heading', { name: 'Drop enquiry files here' })).toBeVisible({
    timeout: 90_000,
  })
  const dir = mkdtempSync(join(tmpdir(), 'ops-intake-'))
  const fake = join(dir, 'lines.xlsx')
  copyFileSync(join(FIX, 'rfq-3-pages.pdf'), fake)
  await page.getByLabel('Choose enquiry files').setInputFiles(fake)
  await expect(
    page.getByText(
      'lines.xlsx: lines.xlsx is not what its name says (.xlsx). Save it again and re-upload.'
    )
  ).toBeVisible({ timeout: 30_000 })
  const url = new URL(page.url()).searchParams.get('batch')
  if (url) batches.push(url)
  else {
    const b = await db.intakeBatch.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })
    if (b) batches.push(b.id)
  }
})

test('board-14: the intake list shows every open batch', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/enquiries/intake')
  await expect(
    page.getByRole('heading', { name: 'Upload enquiry documents', level: 1 })
  ).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('link', { name: /^Intake \d+$/ })).toBeVisible()
})
