import { opsDb as db } from '@indus/ops-db'
import { DEMO_EMAILS, expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'

/**
 * S08 Enquiry intake design parity (local only): full frames at 1440 × 940 against the board PNGs. Data is seeded
 * here with neutral names in the boards' states; each LIMIT is the measured ratio rounded up, with what differs.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const batches: string[] = []
test.afterAll(async () => {
  if (batches.length) await db.intakeBatch.deleteMany({ where: { id: { in: batches } } })
})

async function frame(
  page: import('@playwright/test').Page,
  board: string,
  limit: number,
  note: string
) {
  await settle(page)
  await page.waitForLoadState('networkidle')
  const { ratio, size } = await compareToBoardPng(page, `${board}.png`, { name: `board-${board}` })
  recordParity({
    board: `${board} screen`,
    group: 'P08 boards',
    ratio,
    area: `full frame ${size}`,
    limit,
    note,
  })
  console.log(`board-${board}: ${ratio.toFixed(4)}`)
  expect(ratio).toBeLessThanOrEqual(limit)
}

test('board-14 parity: upload and processing queue', async ({ page, signedInAs }) => {
  const owner = await db.user.findFirstOrThrow({
    where: { email: DEMO_EMAILS.owner },
    select: { id: true },
  })
  const b = await db.intakeBatch.create({
    data: { source: 'upload', createdById: owner.id },
    select: { id: true },
  })
  batches.push(b.id)
  const rows = [
    {
      filename: 'SC-RFQ-0921_Sample.pdf',
      kind: 'pdf',
      status: 'ready',
      progressPct: 100,
      pageCount: 4,
      sizeBytes: 1_887_437,
      linesFound: 34,
      linesToCheck: 3,
    },
    {
      filename: 'IMG_4471.jpeg',
      kind: 'image',
      status: 'extracting',
      progressPct: 64,
      progressNote: 'Reading page 1 of 1 · table found',
      sizeBytes: 905_000,
    },
    {
      filename: 'Gearbox_spares.png',
      kind: 'image',
      status: 'extracting',
      progressPct: 22,
      progressNote: 'Detecting layout',
      sizeBytes: 412_000,
    },
    {
      filename: 'EX-0931_dosing.pdf',
      kind: 'pdf',
      status: 'queued',
      progressNote: 'Waiting',
      pageCount: 2,
      sizeBytes: 655_360,
    },
    {
      filename: 'scan_0019.jpg',
      kind: 'image',
      status: 'needs_attention',
      progressPct: 100,
      progressNote: 'Image too low resolution to read reliably',
      failureKind: 'unreadable',
      failureNote: '96 dpi scan',
      sizeBytes: 220_000,
    },
  ] as const
  for (const [i, r] of rows.entries())
    await db.intakeFile.create({
      data: { batchId: b.id, ...r, createdAt: new Date(Date.now() - (10 - i) * 1000) },
    })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/enquiries/new?batch=${b.id}`)
  await expect(page.getByText('Processing queue · 5 files')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '14',
    0.06,
    'Neutral file names and sizes; the board says 25 MB where C19 sets 20; step 3 says enquiry, not lead; thumbnails are plain tiles.'
  )
})
