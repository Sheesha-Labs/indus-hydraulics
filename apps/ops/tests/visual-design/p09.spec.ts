import { opsDb as db } from '@indus/ops-db'
import { seedBoard05 } from '../../src/server/enquiry/testing/overview-seed'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'

/**
 * S09 enquiry record, pipeline, leads and qualification design parity (local only): full frames at 1440 × 940
 * against the board PNGs. Data is seeded here with neutral names in the boards' states, under an owner of its
 * own so the pipeline shows only this seed (`?owner=`). Each LIMIT is the measured ratio rounded up, with what
 * differs.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const tag = `p09${Date.now()}`
const initials = `P${String.fromCharCode(65 + (Date.now() % 26))}`
let ownerId = ''
const enquiries: string[] = []

test.beforeAll(async () => {
  ownerId = (
    await db.user.create({
      data: {
        email: `${tag}@example.test`,
        name: 'Parity Owner',
        initials,
        role: 'helper',
        status: 'active',
      },
      select: { id: true },
    })
  ).id
})

test.afterAll(async () => {
  await db.enquiry.updateMany({
    where: { id: { in: enquiries } },
    data: { closedAt: new Date(), ownerId: null },
  })
  await db.user.update({ where: { id: ownerId }, data: { status: 'removed' } })
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
    group: 'P09 boards',
    ratio,
    area: `full frame ${size}`,
    limit,
    note,
  })
  console.log(`board-${board}: ${ratio.toFixed(4)}`)
  expect(ratio).toBeLessThanOrEqual(limit)
}

/** Board 04's twelve cards, neutral: [stage, title, client, deadline (days), lines, quoted, value, quotation]. */
const BOARD04 = [
  ['new', 'Kiln drive gearbox spares', 'Sample Cement Co', 9, 6, 0, '86000', null, null],
  ['qualifying', 'Chemical dosing pumps', 'Sample Power & Water', 11, 4, 0, '142000', null, null],
  [
    'sourcing',
    'Hydraulic fittings & hoses',
    'Sample Marine Engineering',
    8,
    34,
    0,
    '214000',
    null,
    null,
  ],
  ['sourcing', 'Isolation valves DN200', 'Sample Utilities', 12, 8, 0, '168000', null, null],
  ['quotes_in', 'Plant turnaround spares', 'Sample Client LLC', 6, 12, 11, '312000', null, null],
  ['pricing', 'Boiler feed pump spares', 'Sample Power & Water', 2, 7, 7, '96000', null, null],
  [
    'quoted',
    'Rolling mill bearings',
    'Sample Steel Works',
    0,
    9,
    9,
    '188000',
    'INDUS/Q90933',
    null,
  ],
  [
    'quoted',
    'Electromagnetic flow meters',
    'Sample Utilities',
    1,
    5,
    5,
    '74000',
    'INDUS/Q90930-R2',
    null,
  ],
  [
    'negotiation',
    'Control valve trims',
    'Sample Client LLC',
    4,
    6,
    6,
    '226000',
    'INDUS/Q90924-R2',
    'asked_for_discount',
  ],
  ['won', 'Stern tube seals', 'Sample Marine Engineering', -12, 3, 3, '58000', null, null],
] as const

test('board-04 parity: the pipeline', async ({ page, signedInAs }) => {
  const base = Date.UTC(2026, 8, 24, 8)
  for (const [
    i,
    [stage, title, client, dd, lines, quoted, value, qnum, ask],
  ] of BOARD04.entries()) {
    const company = await db.company.create({ data: { name: client }, select: { id: true } })
    const e = await db.enquiry.create({
      data: {
        ref: `ENQ-2095-${String(Date.now()).slice(-5)}${String(i).padStart(2, '0')}`,
        title,
        clientId: company.id,
        receivedVia: 'email',
        receivedAt: new Date(base - i * 3_600_000),
        deadline: new Date(Date.now() + dd * 86_400_000),
        ownerId,
        stage: stage as never,
        estValueMax: value,
        estCurrency: 'USD',
        lines: {
          create: Array.from({ length: lines }, (_, n) => ({
            no: n + 1,
            description: `Line ${n + 1}`,
            qty: 1,
            status: n < quoted ? ('quoted' as const) : ('open' as const),
          })),
        },
      },
      select: { id: true },
    })
    enquiries.push(e.id)
    if (qnum)
      await db.quotation.create({
        data: {
          enquiryId: e.id,
          number: `${qnum.replace('9', String(Date.now()).slice(-1))}`,
          currency: 'USD',
          vatTreatment: 'export_zero_rated',
          total: value,
          status: 'sent',
          ...(ask ? { clientStatus: ask as never } : {}),
        },
      })
  }
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/enquiries?owner=${initials.toLowerCase()}`)
  await expect(page.locator('[data-built="pipeline-board"][data-ready]')).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '04',
    0.05,
    'Neutral titles and clients; the board adds a Leads secondary beside New enquiry; sent coverage is 0 until RFQs exist (S12); quotation numbers carry the run digit; Won shows "Won" until an order exists (S22).'
  )
})

test('board-05 parity: the enquiry Overview', async ({ page, signedInAs }) => {
  const ref = `ENQ-2092-${String(Date.now()).slice(-7)}`
  const s = await seedBoard05(db, {
    tag,
    ref,
    ownerId,
    rfqPrefix: `96${String(Date.now()).slice(-2)}`,
  })
  enquiries.push(s.enquiryId)
  // The board's strip: three done actions and one waiting proposal.
  const base = {
    actionKey: 'ack_email',
    levelAtTime: 'draft_and_ask',
    subjectType: 'enquiry',
    subjectId: s.enquiryId,
    enquiryId: s.enquiryId,
    reasons: [],
    basisHash: 'x',
    surface: 'review',
  } as const
  for (const [i, [headline, state]] of [
    ['Capture 2 quotes', 'done'],
    ['Chase Mock Instruments Co today', 'done'],
    ['Send 4 RFQs', 'done'],
    ['Chase Mock Instruments Co again', 'proposed'],
  ].entries())
    await db.assistantAction.create({
      data: {
        ...base,
        ref: `A-P09-${String(Date.now()).slice(-6)}${i}`,
        headline,
        state,
        decidedAt: new Date(Date.now() - (i + 1) * 60_000),
        idempotencyKey: `p09:${tag}:${i}`,
      } as never,
    })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/enquiries/${ref}`)
  await expect(page.locator('[data-built="enquiry-overview"]')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '05',
    0.1,
    'The T2 template body pads 16 where board 05 pads 24, so the body sits 8px higher (most of the ratio); C8 has eleven tabs where the board draws nine; neutral title, client, suppliers (codes SAM/TES/DEM/MOC/TRI) and part numbers; money in AED (C38 on USD quotes at 3.6725) where the board prints $; the strip names neutral suppliers; the deadline reads working days.'
  )
  await db.assistantAction.updateMany({
    where: { enquiryId: s.enquiryId, state: 'proposed' },
    data: { state: 'cancelled' },
  })
})
