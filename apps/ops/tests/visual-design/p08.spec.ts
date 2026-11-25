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

/** Board 15's source: four A4 pages with the item table on page 2 and its repeat on page 3, neutral names only. */
const BOARD15_LINES = [
  [
    '1',
    'Hydraulic hose 1/2" 2SN, 3 m, JIC female both ends',
    'HH-08-2SN-3000',
    '24',
    'EA',
    'EN 853 2SN',
  ],
  ['2', 'Hydraulic hose 3/4" 4SH, 2 m', 'HH-12-4SH-2000', '12', 'EA', 'EN 856 4SH'],
  ['3', 'Adaptor JIC 1/2" M x BSP 1/2" M', 'ADP-JB-08', '60', 'EA', 'Zinc-plated steel'],
  ['4', 'Ball valve 1" 3-pc, high pressure', 'BV-16-3P', '8', 'EA', '6000 psi'],
  ['5', 'Quick coupling ISO-A 1/2"', 'QC-ISOA-08', '30', 'PR', 'Steel'],
  ['6', 'Hydraulic filter element 10 um', 'HF-1O-220', '18', 'EA', 'Glass fibre'],
  ['7', 'Inline check valve 3/8"', 'CV-06-IL', '16', 'EA', 'Carbon steel'],
  ['8', 'Pressure gauge 0-400 bar, glycerine-filled', 'PG-400-G', '10', 'EA', 'SS case'],
] as const

async function board15Pdf(): Promise<{
  bytes: Buffer
  rowTop: (page: number, i: number) => number
}> {
  const { PDFDocument, StandardFonts } = await import('pdf-lib')
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const baseline = (i: number) => 640 - i * 26
  for (let p = 1; p <= 4; p++) {
    const page = doc.addPage([595, 842])
    page.drawText('EXAMPLE MARINE ENGINEERING', { x: 40, y: 770, size: 16, font: bold })
    page.drawText('Ship repair & conversion', { x: 40, y: 755, size: 8.5, font })
    page.drawText('REQUEST FOR QUOTATION', { x: 395, y: 772, size: 9, font: bold })
    page.drawText(`Ref: EX-RFQ-0921 · Page ${p} of 4`, { x: 440, y: 760, size: 8.5, font })
    if (p === 2 || p === 3) {
      page.drawText('Section B - hoses, fittings and valves. Quote each line separately.', {
        x: 40,
        y: 700,
        size: 8.5,
        font,
      })
      for (const [label, x] of [
        ['Item', 40],
        ['Description', 70],
        ['Part no.', 290],
        ['Qty', 395],
        ['Unit', 420],
        ['Material / spec', 450],
      ] as const)
        page.drawText(label, { x, y: 664, size: 8.5, font: bold })
      const rows = p === 2 ? BOARD15_LINES : ([['9', ...BOARD15_LINES[0].slice(1)]] as const)
      rows.forEach(([no, desc, part, qty, uom, spec], i) => {
        const y = baseline(i)
        page.drawText(no, { x: 44, y, size: 8.5, font })
        page.drawText(desc.slice(0, 40), { x: 70, y, size: 8.5, font })
        page.drawText(part, { x: 290, y, size: 8.5, font })
        page.drawText(qty, { x: 395, y, size: 8.5, font })
        page.drawText(uom, { x: 420, y, size: 8.5, font })
        page.drawText(spec, { x: 450, y, size: 8.5, font })
      })
    }
  }
  return {
    bytes: Buffer.from(await doc.save()),
    rowTop: (_page, i) => 842 - baseline(i) - 10,
  }
}

test('board-15 parity: review extracted lines', async ({ page, signedInAs }) => {
  const { bytes, rowTop } = await board15Pdf()
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/enquiries/new')
  const chooser = page.getByLabel('Choose enquiry files')
  await expect(chooser).toHaveAttribute('data-ready', 'true', { timeout: 90_000 })
  await chooser.setInputFiles({
    name: 'EX-RFQ-0921_Sample.pdf',
    mimeType: 'application/pdf',
    buffer: bytes,
  })
  await expect(page).toHaveURL(/batch=/, { timeout: 60_000 })
  const batchId = new URL(page.url()).searchParams.get('batch')!
  batches.push(batchId)
  const file = await db.intakeFile.findFirstOrThrow({
    where: { batchId },
    select: { id: true, storedFileId: true },
  })
  const lines = [
    ...BOARD15_LINES.map((l, i) => ({ l, page: 2, row: i })),
    { l: ['9', ...BOARD15_LINES[0].slice(1)] as const, page: 3, row: 0 },
  ]
  let firstId = ''
  for (const { l, page: pg, row } of lines) {
    const [no, desc, part, qty, uom, spec] = l
    const ord = Number(no)
    const span = await db.sourceSpan.create({
      data: {
        sourceKind: 'pdf',
        sourceId: file.storedFileId!,
        page: pg,
        bbox: { x: 40, y: rowTop(pg, row), w: 520, h: 10 },
        quote: desc,
        resolved: 'exact',
      },
      select: { id: true },
    })
    const flag =
      ord === 4
        ? {
            confidence: 'likely' as const,
            reasons: ['Rating read as 6000 or 5000 psi'],
            spec: '6000 psi?',
          }
        : ord === 6
          ? {
              confidence: 'unsure' as const,
              reasons: ['Part no. unclear: “10” or “1O”'],
              unsure: {
                field: 'partNumber',
                question: 'Line 6 · which part number is right?',
                options: [
                  { value: 'HF-10-220', label: 'HF-10-220', sub: 'seen on 3 past RFQs' },
                  { value: 'HF-1O-220', label: 'HF-1O-220', sub: 'as read' },
                ],
              },
            }
          : ord === 8
            ? { confidence: 'likely' as const, reasons: ['Quantity is handwritten'] }
            : { confidence: 'sure' as const, decision: ord === 9 ? 'pending' : 'accepted' }
    const c = await db.intakeLineCandidate.create({
      data: {
        batchId,
        fileId: file.id,
        ord,
        description: desc.replace(', JIC female both ends', ', 3 m').replace(', 3 m, 3 m', ', 3 m'),
        partNo: part,
        partNoNorm: part.replace(/[^A-Z0-9]/gi, '').toUpperCase(),
        qty,
        uom,
        spec,
        sourceKind: 'pdf',
        sourcePage: pg,
        spanIds: [span.id],
        fieldSpans: { description: span.id },
        ...flag,
        ...(ord === 9 ? { duplicateOfId: firstId } : {}),
      } as never,
      select: { id: true },
    })
    if (ord === 1) firstId = c.id
  }
  await db.intakeFile.update({
    where: { id: file.id },
    data: {
      status: 'ready',
      linesFound: 9,
      linesToCheck: 4,
      pageCount: 4,
    },
  })
  await page.goto(`/enquiries/intake/${batchId}`)
  await expect(page.getByRole('heading', { name: 'Review extracted lines', level: 1 })).toBeVisible(
    { timeout: 90_000 }
  )
  await expect(page.getByText('Line 6 · which part number is right?')).toBeVisible()
  await frame(
    page,
    '15',
    0.08,
    'Nine neutral lines where the board has 34 (counts differ); the page is drawn from its text layer, so the scan, its grid and the handwritten 10 are not there.'
  )
})

test('board-17 parity: intake exceptions', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/_kit/intake-states')
  await expect(page.getByRole('heading', { name: 'Image too low resolution' })).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '17',
    0.04,
    'Neutral client name and reference; the board titles the revision CRQ-2411 but its button says ENQ-2026-0411, and the sheet uses the ENQ ref in both.'
  )
})
