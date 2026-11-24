import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'

/**
 * P03 design parity (S05, local only): board 91 Mail, full frame at 1440 × 940, a supplier quote open with the
 * Assistant pane. Fictional mail on example.test stands in for the board's (different names, subjects and
 * counts), so the ratio measures layout, not text; LIMITS hold the measured value rounded up, with the reason.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const SALES = 'e2e-p03-sales@example.test'
const PURCHASE = 'e2e-p03-purchase@example.test'
const ids: Record<string, string> = {}

const ROWS: Array<[string, string, string, string, string, string, string]> = [
  // mailbox, from, fromName, subject, class, note, body
  [
    'purchase',
    'g.ferri@valve-maker.example',
    'A Supplier',
    'RE: IH-RFQ-2611-P07 — offer attached',
    'supplier_quote',
    'Captured quote: 4 of 5 lines, EUR, EXW 6 wks',
    'Please find attached our offer for items 1, 2, 3 and 5. Prices EXW, delivery 6 weeks, valid 30 days.',
  ],
  [
    'sales',
    'o.buyer@client-one.example',
    'A Buyer',
    'RE: Rig spares — line 4 trim',
    'client_reply',
    'Added answer to line 4; shared with the supplier',
    'Line 4 trim is SS316, please proceed.',
  ],
  [
    'sales',
    'k.owner@example.test',
    'The Owner',
    'Fwd: RFQ 1203 · Please address',
    'client_enquiry',
    'Proposed ENQ-2026-0433 · 14 lines · deadline 28 Nov',
    'Please address the attached enquiry.',
  ],
  [
    'purchase',
    's.doyle@gauge-co.example',
    'A Seller',
    'RE: IH-RFQ-2611-P08 — two questions',
    'supplier_question',
    '2 questions bundled for the client',
    'Two questions before we quote.',
  ],
  [
    'sales',
    'purchasing@client-two.example',
    'Purchasing',
    'PO-7781 against your quotation',
    'client_po',
    'Recognised PO; check against INDUS/Q10935',
    'Please find our PO attached.',
  ],
  [
    'sales',
    'team@unknown-co.example',
    'Sales Team',
    'Price list Q4',
    'unclassified',
    'Supplier price list or new enquiry?',
    'Our price list for Q4.',
  ],
  [
    'purchase',
    'g.ferri@valve-maker.example',
    'A Supplier',
    'Automatic reply: out of office',
    'auto_reply',
    'Out until 21 Nov; reply-by moved to 22 Nov',
    'I am out of the office.',
  ],
  [
    'purchase',
    'ops@forwarder.example',
    'Seabridge Logistics',
    'Quote SB-26-4471 · air consolidation',
    'freight',
    'Freight quote for ENQ-2026-0402',
    'Our rates for the consolidation.',
  ],
]

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-p03-' } } })
  const scopes = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
  ]
  for (const [address, role] of [
    [SALES, 'client'],
    [PURCHASE, 'supplier'],
  ] as const) {
    const m = await db.mailbox.create({
      data: {
        address,
        displayName: address,
        role,
        status: 'live',
        canSend: true,
        canLabel: true,
        scopes,
      },
      select: { id: true },
    })
    ids[role] = m.id
  }
  let n = 0
  for (const [box, from, fromName, subject, cls, note, body] of ROWS) {
    n += 1
    const mailboxId = box === 'sales' ? ids.client! : ids.supplier!
    const at = new Date(Date.now() - n * 20 * 60_000)
    const t = await db.mailThread.create({
      data: { mailboxId, gmailThreadId: `e2e-p03-t${n}`, subject, lastMessageAt: at },
      select: { id: true },
    })
    ids[`t${n}`] = t.id
    await db.mailMessage.create({
      data: {
        mailboxId,
        threadId: t.id,
        gmailMessageId: `e2e-p03-m${n}`,
        rfcMessageId: `e2e-p03-m${n}@example.test`,
        direction: 'inbound',
        fromAddress: from,
        fromName,
        toAddresses: [box === 'sales' ? SALES : PURCHASE],
        ccAddresses: [],
        subject,
        bodyText: body,
        sentAt: at,
        receivedAt: at,
        labelsApplied: [],
        origin: 'live',
        classification: cls as never,
        confidence: cls === 'unclassified' ? 'unsure' : 'sure',
        handledState: cls === 'unclassified' ? 'unsure' : 'handled',
        assistantNote: note,
      },
    })
  }
})

test.afterAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-p03-' } } })
})

test('board-91 parity: Mail with a supplier quote open', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/mail/all/${ids.t1}`)
  await settle(page)
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('complementary', { name: 'What the Assistant did' })).toBeVisible()
  const { ratio, size } = await compareToBoardPng(page, '91.png', { name: 'board-91' })
  const limit = 0.08
  recordParity({
    board: '91 Mail',
    group: 'P03 boards',
    ratio,
    area: `full frame ${size}`,
    limit,
    note: 'Fictional mail stands in for the board’s (names, subjects, counts differ). Messages render in the kit MailMessage card (From/To/Subject rows) where the board draws a compact card.',
  })
  expect(ratio).toBeLessThanOrEqual(limit)
})
