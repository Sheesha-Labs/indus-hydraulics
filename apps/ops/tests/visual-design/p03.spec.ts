import { readFileSync } from 'node:fs'
import { opsDb as db } from '@indus/ops-db'
import { PNG } from 'pngjs'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, compareToReference, recordParity, type Mask } from './compare'
import { boardPngPath, hasReference } from './reference'

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
  await db.company.deleteMany({ where: { name: { startsWith: 'P03 ' } } })
  await db.company.create({
    data: { name: 'P03 Sample Client LLC', isClient: true, domains: ['client-one.example'] },
  })
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
  await db.company.deleteMany({ where: { name: { startsWith: 'P03 ' } } })
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

function boardCrop(board: string, box: Mask): Buffer {
  const src = PNG.sync.read(readFileSync(boardPngPath(board)))
  const out = new PNG({ width: box.w, height: box.h })
  PNG.bitblt(src, out, box.x, box.y, box.w, box.h, 0, 0)
  return PNG.sync.write(out)
}

test('board-94 parity: the Unsure pile', async ({ page, signedInAs }) => {
  const a = await db.assistantAction.create({
    data: {
      ref: `A-P03-${Date.now().toString(36)}`,
      actionKey: 'classify_mail',
      levelAtTime: 'do_quietly',
      guardrails: [],
      subjectType: 'mail_message',
      subjectId: (
        await db.mailMessage.findFirstOrThrow({ where: { gmailMessageId: 'e2e-p03-m6' } })
      ).id,
      headline: 'Unsure what this is',
      reasons: [],
      state: 'proposed',
      surface: 'mail_unsure',
      options: [
        { key: 'supplier_price_list', label: 'Supplier price list', consequence: '' },
        { key: 'supplier_quote', label: 'Supplier quote for IH-RFQ-2611-P12', consequence: '' },
      ],
    },
    select: { id: true },
  })
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/mail/unsure')
  await settle(page)
  await page.waitForLoadState('networkidle')
  const { ratio, size } = await compareToBoardPng(page, '94.png', { name: 'board-94' })
  const limit = 0.05
  recordParity({
    board: '94 Unsure',
    group: 'P03 boards',
    ratio,
    area: `full frame ${size}`,
    limit,
    note: 'One fictional unsure email where the board shows three; the right column states the rule in text where the board draws a sample toast and the empty state.',
  })
  expect(ratio).toBeLessThanOrEqual(limit)
  await db.assistantAction.update({ where: { id: a.id }, data: { state: 'rejected' } })
})

const DIALOG_95: Mask = { x: 401, y: 60, w: 638, h: 524 }

test('board-95 parity: the Link to… dialog', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto(`/mail/all/${ids.t2}?link=1`)
  await settle(page)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('radio').first()).toBeVisible()
  await page.waitForLoadState('networkidle')
  const ours = await dialog.screenshot({ animations: 'disabled', caret: 'hide' })
  const { ratio, size } = compareToReference(ours, boardCrop('95.png', DIALOG_95), {
    name: 'board-95-dialog',
    sizeTolerance: 260,
  })
  const limit = 0.13
  recordParity({
    board: '95 Link to…',
    group: 'P03 boards',
    ratio,
    area: `the dialog, ${size}, compared over the common area`,
    limit,
    note: 'Kit Modal (560 wide, title in the header) against the board’s 638-wide dialog with an eyebrow; suggestions come from the fixture.',
  })
  expect(ratio).toBeLessThanOrEqual(limit)
})

// S05-T07: boards 96 and 97 are state sheets; /_kit/mail-states lays the real components out the same way.
for (const [board, limit, note] of [
  [
    '96',
    0.05,
    'Fictional names and addresses; the out-of-office chip sits under its card where the board puts it inside a record row.',
  ],
  [
    '97',
    0.04,
    'Fictional text; the huge-thread rows and both-mailboxes chips are drawn as in the reading pane.',
  ],
] as const) {
  test(`board-${board} parity: mail states sheet`, async ({ page }) => {
    await prepare(page)
    await page.setViewportSize({ width: 1440, height: 940 })
    await page.goto(`/_kit/mail-states?board=${board}`)
    await settle(page)
    await page.waitForLoadState('networkidle')
    const { ratio, size } = await compareToBoardPng(page, `${board}.png`, {
      name: `board-${board}`,
    })
    recordParity({
      board: `${board} Mail states`,
      group: 'P03 boards',
      ratio,
      area: `full frame ${size}`,
      limit,
      note,
    })
    expect(ratio).toBeLessThanOrEqual(limit)
  })
}
