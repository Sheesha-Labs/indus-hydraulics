import { opsDb as db } from '@indus/ops-db'
import { seedBoard05 } from '../../src/server/enquiry/testing/overview-seed'
import { seedQualify } from '../../src/server/enquiry/testing/qualify-seed'
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

test('board-16 parity: match to client and lead', async ({ page, signedInAs }) => {
  const domain = `${tag}.example.test`
  const company = await db.company.create({
    data: { name: 'Sample Marine Engineering', isClient: true, primaryDomain: domain },
  })
  await db.lead.create({
    data: {
      ref: `L-9${String(Date.now()).slice(-5)}`,
      name: 'Sample Marine Engineering',
      companyId: company.id,
      title: 'MV Example hydraulic refit',
      source: 'email',
      stage: 'qualified',
    },
  })
  const mb = await db.mailbox.findFirstOrThrow({ where: { role: 'client' }, select: { id: true } })
  const t = await db.mailThread.create({ data: { mailboxId: mb.id, gmailThreadId: `t-${tag}` } })
  const m = await db.mailMessage.create({
    data: {
      mailboxId: mb.id,
      threadId: t.id,
      gmailMessageId: `g-${tag}`,
      rfcMessageId: `${tag}@client.example.test`,
      direction: 'inbound',
      fromAddress: `j.sample@${domain}`,
      fromName: 'J Sample',
      toAddresses: ['sales@example.test'],
      ccAddresses: [],
      subject: 'RFQ',
      bodyText: 'Please quote.',
      bodyTextHash: tag,
      sentAt: new Date(),
      labelsApplied: [],
      origin: 'live',
    },
  })
  const b = await db.intakeBatch.create({
    data: {
      source: 'mail',
      mailMessageId: m.id,
      clientRef: 'SME-RFQ-0921',
    },
  })
  await db.intakeLineCandidate.createMany({
    data: Array.from({ length: 34 }, (_, i) => ({
      batchId: b.id,
      ord: i + 1,
      description: `Line ${i + 1}`,
      qty: 1,
      confidence: 'sure' as const,
      decision: i === 33 ? ('merged' as const) : ('accepted' as const),
    })),
  })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/enquiries/intake/${b.id}/match`)
  await expect(page.locator('[data-built="intake-match"][data-ready]')).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '16',
    0.03,
    'Matched on the sender only (same-name sample companies from other seeds make a letterhead match Unsure); the client reference makes Go straight to an enquiry the suggestion (S09-T04 rule) where the board selects the open lead; neutral client, lead and sender; categories read "after the trade list is set up" until trades are seeded; the dimmed page behind is a plain skeleton.'
  )
  await db.intakeBatch.update({ where: { id: b.id }, data: { status: 'cancelled' } })
})

/** Board 03's seven leads, neutral: [title, company, contact, source, interest, value USD, stage, next action, days]. */
const BOARD03 = [
  [
    'Polymer plant expansion, phase 2',
    'Sample Polymers',
    'Sample Contact A',
    'manual',
    'Valves, actuation',
    '400000',
    'qualified',
    'Site visit',
    3,
  ],
  [
    'Compressor overhaul',
    'Sample Petrochem Services',
    'Sample Contact B',
    'email',
    'Seals, bearings',
    '250000',
    'qualified',
    'Send line card',
    null,
  ],
  [
    'Desalination plant retrofit',
    'Sample Desal Co.',
    'Sample Contact C',
    'callback',
    'Butterfly valves',
    '520000',
    'contacted',
    'Intro call',
    -2,
  ],
  [
    'Potline maintenance contract',
    'Sample Aluminium',
    'Sample Contact D',
    'website',
    'Bearings, gearbox spares',
    '310000',
    'contacted',
    'Qualify volumes',
    null,
  ],
  [
    'Pump station instrumentation',
    'Sample Water',
    'Sample Contact E',
    'email',
    'Flow & pressure',
    '180000',
    'new',
    'First reply',
    null,
  ],
  [
    'Fleet dry-dock spares 2027',
    'Sample Marine Services',
    'Sample Contact F',
    'manual',
    'Seals, hydraulics',
    '460000',
    'new',
    'First reply',
    null,
  ],
  [
    'Clinker cooler upgrade',
    'Sample Cement',
    'Sample Contact G',
    'email',
    'Bearings',
    '140000',
    'qualified',
    'Awaiting RFQ',
    null,
  ],
] as const

async function seedLead(over: Record<string, unknown>) {
  const id = (await db.$queryRaw<Array<{ id: string }>>`SELECT gen_random_uuid() AS id`)[0]!.id
  const [{ formatted }] = await db.$queryRaw<Array<{ formatted: string }>>`
    SELECT formatted FROM ops.allocate_number('lead', '', 'lead'::ops."RecordType", ${id}::uuid)`
  return db.lead.create({
    data: { id, ref: formatted!, name: 'x', source: 'email', ...over } as never,
  })
}

test('board-03 parity: leads', async ({ page, signedInAs }) => {
  // Local only: open leads left by other runs are set aside so the list shows this seed.
  await db.lead.updateMany({
    where: { stage: { in: ['new', 'contacted', 'qualified'] } },
    data: { stage: 'dropped' },
  })
  const owner = await db.user.findFirstOrThrow({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  for (const [i, [title, company, contact, source, interest, value, stage, next, days]] of [
    ...BOARD03,
  ]
    .reverse()
    .entries()) {
    await seedLead({
      title,
      name: contact,
      companyName: company,
      source,
      interest,
      estValue: value,
      estCurrency: 'USD',
      stage,
      nextAction: next,
      nextActionAt: days === null ? null : new Date(Date.now() + days * 86_400_000),
      ownerId: owner.id,
      createdAt: new Date(Date.now() - (10 - i) * 60_000),
    })
  }
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/enquiries/leads')
  await expect(page.locator('[data-built="leads"]')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '03',
    0.05,
    'Neutral leads and contacts; Source words are the stored channels (no event names); one owner (no RK/SM/AH: only KB and AB exist).'
  )
})

test('board-22 parity: lead detail', async ({ page, signedInAs }) => {
  const owner = await db.user.findFirstOrThrow({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  const company = await db.company.create({
    data: { name: 'Sample Marine Engineering', isClient: true },
  })
  const lead = await seedLead({
    title: 'MV Example hydraulic refit',
    name: 'Sample Superintendent',
    companyId: company.id,
    stage: 'qualified',
    ownerId: owner.id,
    estValue: '214000',
    estCurrency: 'USD',
    interest: 'MV Example · dry-dock Oct',
    neededBy: new Date('2026-10-02T00:00:00Z'),
  })
  const rows = [
    [
      'Hydraulic hose 1/2" 2SN, 3 m, JIC female both ends',
      'HH-08-2SN-3000',
      24,
      'EA',
      'EN 853 2SN',
    ],
    ['Hydraulic hose 3/4" 4SH, 2 m', 'HH-12-4SH-2000', 12, 'EA', 'EN 856 4SH'],
    ['Adaptor JIC 1/2" M × BSP 1/2" M', 'ADP-JB-08', 60, 'EA', 'Zinc-plated steel'],
    ['Ball valve 1" 3-pc, high pressure', 'BV-16-3P', 8, 'EA', '6000 psi?'],
    ['Quick coupling ISO-A 1/2"', 'QC-ISOA-08', 30, 'PR', 'Steel'],
    ['Hydraulic filter element 10 µm', 'HF-1O-220', 18, 'EA', 'Glass fibre'],
    ['Inline check valve 3/8"', 'CV-06-IL', 16, 'EA', 'Carbon steel'],
    ['Pressure gauge 0–400 bar, glycerine-filled', 'PG-400-G', 10, 'EA', 'SS case'],
    ['Hydraulic hose 1/2" 2SN, 3 m', 'HH-08-2SN-3000', 24, 'EA', 'EN 853 2SN'],
  ] as const
  await db.leadLine.createMany({
    data: Array.from({ length: 33 }, (_, i) => {
      const r = rows[i % rows.length]!
      return {
        leadId: lead.id,
        no: i + 1,
        description: r[0],
        partNo: r[1],
        qty: r[2],
        uom: r[3],
        specNotes: r[4],
        sourcePage: 2,
        spanIds: [],
      }
    }),
  })
  const b = await db.intakeBatch.create({
    data: {
      source: 'upload',
      status: 'confirmed',
      leadId: lead.id,
      confirmedById: owner.id,
      confirmedAt: new Date(),
    },
  })
  await db.intakeFile.createMany({
    data: [
      {
        batchId: b.id,
        filename: 'SME-RFQ-0921_MV-Example.pdf',
        kind: 'pdf',
        status: 'ready',
        linesFound: 34,
      },
      {
        batchId: b.id,
        filename: 'nameplate_pump2.jpeg',
        kind: 'image',
        status: 'ready',
        linesFound: 0,
      },
    ],
  })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/enquiries/leads/${lead.ref}`)
  await expect(page.locator('[data-built="lead-specs"]')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '22',
    0.06,
    'Neutral lead, client and files; the header adds a Stage menu beside Upload more files; Source shows "Typed" for lines without a span; activity reads the stored events.'
  )
})

test('board-23 parity: convert to enquiry', async ({ page, signedInAs }) => {
  const owner = await db.user.findFirstOrThrow({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  const lead = await seedLead({
    title: 'MV Example hydraulic refit',
    name: 'Sample',
    stage: 'qualified',
    ownerId: owner.id,
    clientRef: 'SME-RFQ-0921',
    neededBy: new Date('2026-10-02T00:00:00Z'),
  })
  const trades = await Promise.all(
    ['Hoses', 'Fittings', 'Valves', 'Instruments'].map((n) =>
      db.trade.upsert({
        where: { name: n },
        create: { name: n, slug: `${n.toLowerCase()}-${tag}` },
        update: {},
      })
    )
  )
  const counts = [14, 11, 5, 3]
  let no = 0
  for (const [i, t] of trades.entries())
    await db.leadLine.createMany({
      data: Array.from({ length: counts[i]! }, () => ({
        leadId: lead.id,
        no: ++no,
        description: `Line ${no}`,
        qty: 1,
        tradeId: t.id,
        spanIds: [],
      })),
    })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/enquiries/leads/${lead.ref}?convert=1`)
  await expect(page.locator('[data-part="convert-lead"]')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '23',
    0.28,
    'Most of the ratio is placement: the kit Modal centres in the content area beside the sidebar, the board centres on the whole frame (120px), and it opens over the lead page where the board dims a skeleton; line-card suppliers per category arrive with S12; Owner is a select of KB and AB.'
  )
})

test('board-167 parity: the quick read and the path', async ({ page, signedInAs }) => {
  const mb = await db.mailbox.findFirstOrThrow({
    where: { role: 'client' },
    select: { id: true, address: true },
  })
  const s = await seedQualify(db, {
    tag: `${tag}q`,
    ref: `ENQ-2092-${String(Date.now()).slice(-7)}`,
    variant: 'legit',
    salesMailboxId: mb.id,
    salesAddress: mb.address,
  })
  enquiries.push(s.enquiryId)
  await db.enquiry.update({ where: { id: s.enquiryId }, data: { ownerId } })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/enquiries/${s.ref}`)
  await expect(page.locator('[data-built="enquiry-qualification"]')).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '167',
    0.08,
    'Neutral client and a long test domain, so the chips wrap under the eyebrow; C8 has eleven tabs where the board draws nine; "Fit 13 of 14" counts the OEM lines as sourced (ops-core fitCounts) where the board says 11; the path sub-lines are worded from the read (no nameplate-photo line); "Lines to regret: 14 · Change" sits above the On choose note; the T2 body pads 16 where the board pads 24.'
  )
})

test('board-168 parity: the regret card in Review', async ({ page, signedInAs }) => {
  const mb = await db.mailbox.findFirstOrThrow({
    where: { role: 'client' },
    select: { id: true, address: true },
  })
  const s = await seedQualify(db, {
    tag: `${tag}r`,
    ref: `ENQ-2092-${String(Date.now()).slice(-7)}`,
    variant: 'legit',
    salesMailboxId: mb.id,
    salesAddress: mb.address,
    regretCard: true,
  })
  enquiries.push(s.enquiryId)
  const a = await db.assistantAction.findUniqueOrThrow({
    where: { id: s.regretActionId! },
    select: { ref: true },
  })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/review?card=${a.ref}`)
  await expect(page.locator(`#proposal-${a.ref}`)).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '168',
    0.08,
    'The card is in the Review queue (T4) with the email in its preview, where the board draws the email at full width beside the card; the scope is fixed per card (chosen on the path card: Regret politely or Quote what we can), so there is no Whole enquiry | Lines only switch; neutral client and supplier; the Done-for-you rail shows this database’s counts.'
  )
  await db.assistantAction.update({
    where: { id: s.regretActionId! },
    data: { state: 'cancelled' },
  })
})
