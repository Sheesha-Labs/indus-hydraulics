import { opsDb as db } from '@indus/ops-db'
import { DEMO_EMAILS, expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'

/**
 * P05/P06 screens design parity (S06, local only): board 104 Review, 111 Assistant log (one row open) and 113
 * an enquiry's History, full frame at 1440 × 940 on fixture rows with neutral names (example.test). The local
 * database is disposable: open Review cards left by earlier runs are cancelled first so the queue is the
 * fixture's. Each LIMIT holds the measured value rounded up, with the reason it is not lower.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const TAG = `P05${Date.now().toString(36).toUpperCase()}`
const ids: Record<string, string> = {}
let seq = 0
const ref = () => `A-${TAG}-${++seq}`

async function company(name: string, client = true) {
  return (
    await db.company.create({
      data: { name, isClient: client, isSupplier: !client, domains: [] },
      select: { id: true },
    })
  ).id
}

async function enquiry(n: number, title: string, clientId: string) {
  return db.enquiry.create({
    data: {
      ref: `ENQ-2099-${String(n).padStart(2, '0')}${Date.now() % 100}`,
      title,
      clientId,
      clientRef: 'GPS/MM/25-1187',
      receivedVia: 'manual',
      receivedAt: new Date('2026-09-14T06:00:00Z'),
      deadline: new Date('2026-09-30T10:00:00Z'),
      stage: 'quoted',
    },
    select: { id: true, ref: true },
  })
}

test.beforeAll(async () => {
  // The queue is the fixture's: cards other runs left open are closed (local, disposable database).
  await db.assistantAction.updateMany({
    where: { surface: 'review', state: { in: ['proposed', 'later', 'queued'] } },
    data: { state: 'cancelled' },
  })
  const owner = await db.user.findFirstOrThrow({
    where: { email: DEMO_EMAILS.owner },
    select: { id: true },
  })
  ids.owner = owner.id
  const c1 = await company(`${TAG} Sample Steel Works`)
  const c2 = await company(`${TAG} Sample Client LLC`)
  const e1 = await enquiry(1, 'Mill bearings', c1)
  const e2 = await enquiry(2, 'Turnaround spares — valves, bearings & instruments', c2)
  ids.e1 = e1.id
  ids.e2 = e2.id
  ids.e2ref = e2.ref
  const now = Date.now()
  const at = (minAgo: number) => new Date(now - minAgo * 60_000)

  // Board 104: the receipt, one expanded card on the first record, three rows on the second.
  await db.assistantAction.create({
    data: {
      ref: ref(),
      actionKey: 'ask_price_hold',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      enquiryId: e2.id,
      headline: 'Ask Example Valve Co and Demo Bearings FZE to hold prices to 23 Oct',
      reasons: [],
      preview: { mailbox: 'purchase@example.test' },
      state: 'queued',
      surface: 'review',
      decidedById: owner.id,
      decidedAt: at(1),
      undoUntil: new Date(now + 221_000),
      createdAt: at(30),
    },
  })
  await db.assistantAction.create({
    data: {
      ref: ref(),
      actionKey: 'send_supplier_rfqs',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      enquiryId: e1.id,
      subjectType: 'enquiry',
      subjectId: e1.id,
      headline: 'Send IH-RFQ-2611-P12 to 5 suppliers for 6 bearing lines.',
      reasons: [
        { text: '6 of 9 lines are bearings; the 3 gauge lines go as P13 tomorrow.' },
        { text: 'Example Valve Co and Demo Bearings FZE quoted these sizes in September.' },
      ],
      checks: [
        { label: 'Client identifiers: none found', status: 'pass', detail: '6 fields' },
        { label: 'First email to Sample Bearing House', status: 'warn', detail: 'research' },
      ],
      confidence: 'likely',
      unsureAbout: 'One supplier was found by research.',
      onApproveText: '5 emails from purchase@ in 5 minutes · reply-by 30 Sep.',
      state: 'proposed',
      surface: 'review',
      createdAt: at(130),
    },
  })
  for (const [key, headline, confidence, mins] of [
    ['decide_equivalent', 'Quote line 4 at 9.8% (floor 12%)', 'likely', 120],
    ['send_quotation', 'Send INDUS/Q10941 to Sample Client LLC · USD 157,588 + VAT', 'sure', 110],
    ['chase_suppliers', 'Chase Example Valve Co for line 12 on IH-RFQ-2611-P08', 'sure', 100],
  ] as const) {
    await db.assistantAction.create({
      data: {
        ref: ref(),
        actionKey: key,
        levelAtTime: 'draft_and_ask',
        guardrails: [],
        enquiryId: e2.id,
        subjectType: 'enquiry',
        subjectId: e2.id,
        headline,
        reasons: [{ text: 'Client mentions an OEM direct quote · 3 options' }],
        confidence,
        state: 'proposed',
        surface: 'review',
        createdAt: at(mins),
      },
    })
  }

  // Board 111: one day of the log (Wed 23 Sep), the 09:10 row open.
  const day = (hhmm: string) => new Date(`2026-09-23T${hhmm}:00+04:00`)
  const LOG: Array<[string, string, string, string, string, string]> = [
    // time, key, level, state, headline, cost
    [
      '10:12',
      'price_quotation',
      'draft_and_ask',
      'edited_approved',
      'Repriced line 4 of INDUS/Q10941 to 9.8% after your decision',
      '0.02',
    ],
    [
      '09:52',
      'capture_supplier_quotes',
      'do_and_tell',
      'done',
      'Captured the Example Valve Co quote · 9 lines, USD',
      '0.31',
    ],
    [
      '09:31',
      'pick_suppliers',
      'draft_and_ask',
      'rejected',
      'Proposed Sample Bearing House for bearings',
      '0.18',
    ],
    [
      '09:10',
      'chase_suppliers',
      'do_and_tell',
      'done',
      'Sent chaser to Example Valve Co for IH-RFQ-2611-P08',
      '0.01',
    ],
    [
      '09:05',
      'chase_suppliers',
      'do_and_tell',
      'undone',
      'Sent chaser to Demo Bearings FZE for IH-RFQ-2611-P05',
      '0.01',
    ],
    [
      '08:52',
      'link_mail',
      'do_quietly',
      'done',
      'Linked a supplier’s question email to the enquiry',
      '0.00',
    ],
    [
      '08:40',
      'create_enquiry',
      'do_and_tell',
      'done',
      'Created an enquiry from sales@ · Sample Client LLC',
      '0.22',
    ],
    [
      '08:31',
      'chase_suppliers',
      'do_and_tell',
      'failed',
      'Sent chaser to Sample Gauge Co for IH-RFQ-2611-P04',
      '0.01',
    ],
  ]
  for (const [hhmm, key, level, state, headline, cost] of LOG) {
    const a = await db.assistantAction.create({
      data: {
        ref: ref(),
        actionKey: key,
        levelAtTime: level as never,
        guardrails: [],
        enquiryId: e2.id,
        subjectType: 'enquiry',
        subjectId: e2.id,
        headline,
        reasons: [],
        state: state as never,
        surface: 'review',
        costUsd: cost,
        decidedById: state === 'edited_approved' || state === 'rejected' ? owner.id : null,
        createdAt: day(hhmm),
        ...(hhmm === '09:10'
          ? {
              inputs: {
                read: [
                  'IH-RFQ-2611-P08 · sent 15 Sep, reply-by 18 Sep',
                  '1st chaser · 21 Sep · no reply',
                  'Supplier out-of-office · none on file',
                ],
              },
              preview: {
                mailbox: 'purchase@example.test',
                to: ['quotes@examplevalve.example'],
                subject: 'RE: RFQ IH-RFQ-2611-P08 — reminder',
                text: 'Dear team, a gentle reminder about our RFQ sent on 15 September. Could you let us have your offer for line 12, or tell us if you will not quote, by Friday 25 September?',
              },
            }
          : {}),
      },
      select: { id: true },
    })
    if (hhmm === '09:10') ids.open = a.id
  }

  // Board 113: History on the record the cockpit can show (the header is S02's fixture until S09: only
  // ENQ-2026-0001), timed just now so this run's rows sit on top of rows earlier runs left.
  const fx = await db.enquiry.upsert({
    where: { ref: 'ENQ-2026-0001' },
    create: {
      ref: 'ENQ-2026-0001',
      title: 'Plant turnaround spares',
      receivedVia: 'email',
      receivedAt: new Date(now - 10 * 86_400_000),
    },
    update: {},
    select: { id: true },
  })
  const H: Array<[string, string, string, unknown, unknown, string, string | null]> = [
    // at, actor, field, before, after, kind, note
    [
      '2026-09-23T10:12:00+04:00',
      'assistant',
      'line.4.margin',
      '18.0%',
      '9.8%',
      'money',
      'After your decision on the judgement card',
    ],
    [
      '2026-09-23T10:12:00+04:00',
      'assistant',
      'line.4.unitSell',
      'USD 3,554.88',
      'USD 3,231.71',
      'money',
      null,
    ],
    [
      '2026-09-23T09:40:00+04:00',
      'user',
      'line.4.decision',
      null,
      'Approve at 9.8%',
      'decision',
      'Overridden: Assistant proposed the same; logged as an exception',
    ],
    [
      '2026-09-22T16:40:00+04:00',
      'assistant',
      'line.1.selectedSupplier',
      'Demo Bearings FZE',
      'Example Valve Co',
      'supplier',
      'Why? Lowest that meets the delivery date',
    ],
    [
      '2026-09-22T16:41:00+04:00',
      'user',
      'line.6.selectedSupplier',
      'Sample Gauge Co',
      'Sample Bearing House',
      'supplier',
      'Overridden by KB · local stock',
    ],
    [
      '2026-09-21T11:05:00+04:00',
      'assistant',
      'line.2.supplierCost',
      'EUR 360.00',
      'EUR 352.00',
      'money',
      'Revised supplier quote, page 1',
    ],
    [
      '2026-09-19T14:22:00+04:00',
      'user',
      'line.12.quantity',
      '6',
      '4',
      'quantity',
      'Client email 19 Sep: “4 off, not 6”',
    ],
    [
      '2026-09-18T10:10:00+04:00',
      'assistant',
      'paymentTerms',
      '30 days',
      '30 days from delivery',
      'terms',
      'Preset P1 applied',
    ],
    ['2026-09-17T09:00:00+04:00', 'user', 'margin.default', '18%', '18%', 'money', null],
  ]
  let k = 0
  for (const [, actor, field, before, after, kind, note] of H) {
    k += 1
    await db.activityEvent.create({
      data: {
        at: new Date(now + 60_000 - k * 37 * 60_000),
        actorKind: actor as never,
        actorId: actor === 'user' ? owner.id : null,
        enquiryId: fx.id,
        subjectType: 'enquiry',
        subjectId: fx.id,
        kind: kind as never,
        field,
        before: before as never,
        after: after as never,
        note,
        sensitive: kind === 'money',
      },
    })
  }
})

test.afterAll(async () => {
  await db.assistantAction.updateMany({
    where: { ref: { startsWith: `A-${TAG}-` }, state: { in: ['proposed', 'later', 'queued'] } },
    data: { state: 'cancelled' },
  })
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
    group: board === '104' ? 'P05 boards' : 'P06 boards',
    ratio,
    area: `full frame ${size}`,
    limit,
    note,
  })
  console.log(`board-${board}: ${ratio.toFixed(4)}`)
  expect(ratio).toBeLessThanOrEqual(limit)
}

test('board-104 parity: Review on fixture cards', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/review')
  await expect(page.getByRole('heading', { name: /^Review · 4 waiting$/ })).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '104',
    0.12,
    'Fixture cards; the rail’s Done-for-you counts come from the local database (every test run’s actions), and the family chips show only families with cards.'
  )
})

test('board-111 parity: the Assistant log with one row open', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  // Scoped to this run's record: earlier runs left their own rows on the same day (append-only).
  await page.goto(`/assistant/log?day=2026-09-23&record=${ids.e2ref}&open=${ids.open}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 90_000 })
  await expect(page.getByText('Inputs read')).toBeVisible({ timeout: 30_000 })
  await frame(
    page,
    '111',
    0.09,
    'Fixture rows scoped to one record; the filters are chips and segmented links where the board draws dropdowns.'
  )
})

test('board-113 parity: an enquiry’s History', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/enquiries/ENQ-2026-0001/activity')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '113',
    0.09,
    'The record header is S02’s fixture until S09; earlier runs’ rows sit in the same History (append-only); document versions are the empty slot until S17.'
  )
})
