import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * S05-T05 · board-91 Mail: the folder rail, the thread list (J / K), a thread with the Assistant pane first,
 * the sandboxed bodies, Change type, Unlink, and a Helper's reply on the client mailbox becoming "Ask Krishan
 * to send". Fixture mailboxes and mail on example.test are created here and removed at the end; nothing talks
 * to Google, and no email is queued (an Owner's send is covered by reply.db.test.ts).
 *
 * Needs the seeded demo users and the S05 migrations on the dev database. Serial: it shares the mailboxes.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const SALES = 'e2e-s05-sales@example.test'
const PURCHASE = 'e2e-s05-purchase@example.test'
const ids: Record<string, string> = {}

async function blocking(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

async function message(
  mailboxId: string,
  threadId: string,
  over: {
    from: string
    fromName: string
    subject: string
    body: string
    minutesAgo: number
    classification: string
    confidence: 'sure' | 'likely' | 'unsure' | null
    handledState: 'unsure' | 'not_linked' | 'needs_you' | 'handled'
    note: string
    rfc: string
  }
): Promise<string> {
  const m = await db.mailMessage.create({
    data: {
      mailboxId,
      threadId,
      gmailMessageId: `e2e-s05-${over.rfc}`,
      rfcMessageId: `${over.rfc}@example.test`,
      direction: 'inbound',
      fromAddress: over.from,
      fromName: over.fromName,
      toAddresses: [mailboxId === ids.sales ? SALES : PURCHASE],
      ccAddresses: [],
      subject: over.subject,
      bodyText: over.body,
      sentAt: new Date(Date.now() - over.minutesAgo * 60_000),
      receivedAt: new Date(Date.now() - over.minutesAgo * 60_000),
      labelsApplied: [],
      origin: 'live',
      classification: over.classification as never,
      confidence: over.confidence,
      handledState: over.handledState,
      assistantNote: over.note,
    },
    select: { id: true },
  })
  return m.id
}

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s05-' } } })
  await db.company.deleteMany({ where: { name: { startsWith: 'E2E S05 ' } } })
  const scopes = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.send',
  ]
  const sales = await db.mailbox.create({
    data: {
      address: SALES,
      displayName: 'Sales Example',
      role: 'client',
      status: 'live',
      scopes,
      canRead: true,
      canLabel: true,
      canSend: true,
    },
    select: { id: true },
  })
  const purchase = await db.mailbox.create({
    data: {
      address: PURCHASE,
      displayName: 'Purchase Example',
      role: 'supplier',
      status: 'live',
      scopes,
      canRead: true,
      canLabel: true,
      canSend: true,
    },
    select: { id: true },
  })
  ids.sales = sales.id
  ids.purchase = purchase.id
  const company = await db.company.create({
    data: { name: 'E2E S05 Example Valve Co', isSupplier: true, domains: ['valve-maker.example'] },
    select: { id: true },
  })
  ids.company = company.id

  const t1 = await db.mailThread.create({
    data: {
      mailboxId: purchase.id,
      gmailThreadId: 'e2e-s05-t1',
      subject: 'RE: IH-RFQ-2611-P07 offer attached',
      lastMessageAt: new Date(Date.now() - 5 * 60_000),
    },
    select: { id: true },
  })
  const t2 = await db.mailThread.create({
    data: {
      mailboxId: sales.id,
      gmailThreadId: 'e2e-s05-t2',
      subject: 'Price list Q4',
      lastMessageAt: new Date(Date.now() - 15 * 60_000),
    },
    select: { id: true },
  })
  const t3 = await db.mailThread.create({
    data: {
      mailboxId: sales.id,
      gmailThreadId: 'e2e-s05-t3',
      subject: 'RFQ ball valves',
      lastMessageAt: new Date(Date.now() - 25 * 60_000),
    },
    select: { id: true },
  })
  ids.t1 = t1.id
  ids.t2 = t2.id
  ids.t3 = t3.id
  ids.m1 = await message(purchase.id, t1.id, {
    from: 'sales@valve-maker.example',
    fromName: 'A Supplier',
    subject: 'RE: IH-RFQ-2611-P07 offer attached',
    body: 'Dear team,\n\nPlease find attached our offer for items 1, 2 and 3. Prices EXW, delivery 6 weeks, valid 30 days.\n\nRegards',
    minutesAgo: 5,
    classification: 'supplier_quote',
    confidence: 'sure',
    handledState: 'handled',
    note: 'Supplier quote · Sure · from a known supplier domain',
    rfc: 'e2e-s05-m1',
  })
  await db.mailLink.create({
    data: {
      messageId: ids.m1,
      subjectType: 'company',
      subjectId: company.id,
      linkedBy: 'assistant',
      confidence: 'likely',
    },
  })
  ids.m2 = await message(sales.id, t2.id, {
    from: 'team@unknown-co.example',
    fromName: 'Sales Team',
    subject: 'Price list Q4',
    body: 'Please see our price list for the next quarter.',
    minutesAgo: 15,
    classification: 'unclassified',
    confidence: 'unsure',
    handledState: 'unsure',
    note: 'Supplier price list · Unsure · Supplier price list or new enquiry?',
    rfc: 'e2e-s05-m2',
  })
  ids.m3 = await message(sales.id, t3.id, {
    from: 'buyer@client-one.example',
    fromName: 'A Buyer',
    subject: 'RFQ ball valves',
    body: 'Please quote 10 pcs ball valve 2 inch, class 300, delivery Jebel Ali.',
    minutesAgo: 25,
    classification: 'client_enquiry',
    confidence: 'sure',
    handledState: 'not_linked',
    note: 'Client enquiry · Sure · from a new sender',
    rfc: 'e2e-s05-m3',
  })
})

test.afterAll(async () => {
  await db.assistantAction.findMany({
    where: {
      actionKey: 'manual_reply',
      subjectId: { in: [ids.t1, ids.t2, ids.t3].filter(Boolean) as string[] },
    },
  })
  await db.mailThread.deleteMany({
    where: { id: { in: [ids.t1, ids.t2, ids.t3].filter(Boolean) as string[] } },
  })
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s05-' } } })
  await db.company.deleteMany({ where: { name: { startsWith: 'E2E S05 ' } } })
})

test('board-91: folders, threads, J/K, the Assistant pane and sandboxed bodies', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/mail')
  await expect(page).toHaveURL(/\/mail\/all$/, { timeout: 90_000 })
  const rail = page.getByRole('navigation', { name: 'Mail folders' })
  for (const label of [
    'All',
    'Unsure',
    'Not linked',
    'Needs you',
    'Handled by Assistant',
    'New enquiry',
    'Supplier quote',
    'Not business',
  ]) {
    await expect(rail.getByRole('link', { name: new RegExp(`^${label}`) })).toBeVisible()
  }
  const list = page.getByRole('list', { name: 'Threads' })
  await expect(list.getByText('RE: IH-RFQ-2611-P07 offer attached')).toBeVisible()
  await expect(list.getByText('Supplier quote · Sure · from a known supplier domain')).toBeVisible()

  // J opens the first thread, J again the next; the URL follows.
  const selected = list.locator('a[aria-current="true"]')
  await page.locator('body').press('j')
  await expect(page).toHaveURL(new RegExp(`/mail/all/${ids.t1}`))
  await expect(selected).toContainText('RE: IH-RFQ-2611-P07')
  await page.locator('body').press('j')
  await expect(page).toHaveURL(new RegExp(`/mail/all/${ids.t2}`))
  await expect(selected).toContainText('Price list Q4')
  await page.locator('body').press('k')
  await expect(page).toHaveURL(new RegExp(`/mail/all/${ids.t1}`))

  const pane = page.getByRole('complementary', { name: 'What the Assistant did' })
  await expect(pane.getByText('Classified as supplier quote')).toBeVisible()
  await expect(pane.getByText('Does it quietly')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open in Gmail ↗' })).toHaveAttribute(
    'href',
    /authuser=e2e-s05-purchase%40example\.test/
  )

  // The body is only inside a sandboxed srcdoc frame.
  const frame = page.locator('iframe[title="Email body"]').first()
  await expect(frame).toHaveAttribute('sandbox', '')
  await expect(page.locator('article[data-part="mail-message"]').first()).not.toContainText(
    'Please find attached our offer'
  )

  expect(await blocking(page)).toEqual([])
})

test('board-91: Change type, Unlink and the Unsure folder', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/mail/unsure/${ids.t2}`)
  const pane = page.getByRole('complementary', { name: 'What the Assistant did' })
  await expect(pane.getByText('Unsure what this is')).toBeVisible()
  await pane.getByRole('button', { name: 'Change type' }).click()
  await page.getByRole('menuitem', { name: 'Supplier price list' }).click()
  await expect(page.locator('[data-part="toast-region"]')).toContainText(
    '✓ Filed as Supplier price list'
  )
  await expect
    .poll(
      async () => (await db.mailMessage.findUniqueOrThrow({ where: { id: ids.m2 } })).classification
    )
    .toBe('supplier_price_list')
  const signal = await db.preferenceSignal.findFirst({
    where: { mailboxId: ids.sales, actionKey: 'classify_mail' },
    orderBy: { createdAt: 'desc' },
  })
  expect(signal?.kind).toBe('override')

  await page.goto(`/mail/all/${ids.t1}`)
  await page
    .getByRole('complementary', { name: 'What the Assistant did' })
    .getByRole('button', { name: 'Unlink' })
    .click()
  await expect(page.locator('[data-part="toast-region"]')).toContainText('Unlinked from')
  await expect
    .poll(
      async () => (await db.mailLink.findFirstOrThrow({ where: { messageId: ids.m1 } })).removedAt
    )
    .not.toBeNull()
})

test('board-91: a Helper reply on the client mailbox asks the Owner instead of sending', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('helper')
  await page.goto(`/mail/sales/${ids.t3}`)
  await page.getByRole('button', { name: 'Draft reply' }).click()
  await page
    .locator('[contenteditable="true"]')
    .first()
    .fill('Thank you, we will revert with our offer shortly.')
  await page.getByRole('button', { name: 'Ask Krishan to send' }).click()
  await expect(page.locator('[data-part="toast-region"]')).toContainText(
    'Sent to Krishan to approve'
  )
  const proposal = await db.assistantAction.findFirstOrThrow({
    where: { actionKey: 'manual_reply', subjectId: ids.t3 },
  })
  expect(proposal).toMatchObject({
    state: 'proposed',
    surface: 'review',
    levelAtTime: 'draft_and_ask',
  })
  expect(await db.outboundEmail.count({ where: { threadId: ids.t3 } })).toBe(0)
})
