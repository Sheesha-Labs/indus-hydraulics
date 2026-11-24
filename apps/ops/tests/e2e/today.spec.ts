import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S07-T06 · board-178 (Owner and Helper) and board-182. Today greets by the Dubai clock, lists Needs you as
 * compact Review cards with Approve inline (the S06 action; the server's undo window counts down), Came in,
 * Late or at risk, Done for you and the rail. The Helper's Needs you holds supplier-side cards only. The states
 * sheet draws calm, on fire, paused, disconnected, setup unfinished and the first morning.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const PURCHASE = 'e2e-s07-purchase@example.test'
const SENDER = 'e2e-s07-sender@example-valve.test'
const stamp = Date.now().toString(36)
const ids: Record<string, string> = {}

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s07-' } } })
  ids.purchase = (
    await db.mailbox.create({
      data: {
        address: PURCHASE,
        displayName: 'Purchase Example',
        role: 'supplier',
        status: 'live',
        scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.send'],
        canRead: true,
        canLabel: true,
        canSend: true,
      },
      select: { id: true },
    })
  ).id
  const t = await db.mailThread.create({
    data: { mailboxId: ids.purchase, gmailThreadId: `e2e-s07-${stamp}`, subject: 'RFQ today' },
    select: { id: true },
  })
  const m = await db.mailMessage.create({
    data: {
      mailboxId: ids.purchase,
      threadId: t.id,
      gmailMessageId: `e2e-s07-${stamp}`,
      rfcMessageId: `<e2e-s07-${stamp}@example-valve.test>`,
      direction: 'inbound',
      fromAddress: SENDER,
      fromName: 'Example Sender',
      toAddresses: [PURCHASE],
      ccAddresses: [],
      subject: 'RFQ today',
      bodyText: 'Please see the attached file.',
      sentAt: new Date(Date.now() - 30 * 60_000),
      labelsApplied: [],
      origin: 'live',
      classification: 'supplier_quote',
      confidence: 'sure',
      handledState: 'needs_you',
      flags: { passwordProtected: ['today.pdf'] },
    },
    select: { id: true },
  })
  ids.ref = `A-E2E-S07T-${stamp}`
  const a = await db.assistantAction.create({
    data: {
      ref: ids.ref,
      actionKey: 'ask_open_copy',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      subjectType: 'mail_message',
      subjectId: m.id,
      headline: `Ask Example Sender for an open copy of today.pdf ${stamp}`,
      reasons: [{ text: 'today.pdf is password-protected, so it could not be read' }],
      preview: {
        mailbox: PURCHASE,
        to: [SENDER],
        subject: 'Re: RFQ today',
        text: 'Thank you; we could not open today.pdf. Could you send a copy without a password?',
      },
      checks: [{ label: 'Same thread and mailbox', status: 'pass' }],
      confidence: 'sure',
      onApproveText: `Sends the reply from ${PURCHASE} in this thread`,
      output: { note: 'x', problem: null },
      state: 'proposed',
      surface: 'review',
      // Oldest in the queue, so it is the first card on Today.
      createdAt: new Date('2020-01-01T00:00:00Z'),
      inputs: {
        request: {
          actionKey: 'ask_open_copy',
          subjectType: 'mail_message',
          subjectId: m.id,
          trigger: 'test',
          origin: 'live',
          sourceVersion: 1,
          mailboxId: ids.purchase,
        },
      },
    },
    select: { id: true },
  })
  ids.action = a.id
})

test.afterAll(async () => {
  await db.assistantAction
    .updateMany({ where: { ref: ids.ref }, data: { state: 'cancelled' } })
    .catch(() => undefined)
  await db.outboundEmail.deleteMany({ where: { mailboxId: ids.purchase } })
  await db.mailThread.deleteMany({ where: { mailboxId: ids.purchase } })
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s07-' } } })
})

test('board-178: the Owner’s Today, with Approve inline', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/today')
  await expect(
    page.getByRole('heading', { level: 1, name: /^Good (morning|afternoon|evening), / })
  ).toBeVisible()
  await expect(page.getByText(/^Needs you · \d+/)).toBeVisible()
  await expect(page.getByRole('link', { name: /^See all \d+$/ })).toBeVisible()
  for (const e of ['Came in since yesterday', 'Late or at risk', 'This month', 'This week'])
    await expect(page.getByText(e, { exact: true })).toBeVisible()
  await expect(page.getByText(/^Done for you/)).toBeVisible()
  // Needs you holds compact Review cards (decision cards keep their own primary, as on Review).
  const card = page.getByRole('article', {
    name: `Ask Example Sender for an open copy of today.pdf ${stamp}`,
  })
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: 'Approve' }).click()
  await expect
    .poll(
      async () => (await db.assistantAction.findUniqueOrThrow({ where: { id: ids.action! } })).state
    )
    .not.toBe('proposed')
  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('board-178: the Helper’s Today leads with supplier-side work', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('helper')
  await page.goto('/today')
  await expect(
    page.getByRole('heading', { level: 1, name: /^Good (morning|afternoon|evening), / })
  ).toBeVisible()
  await expect(page.getByText('Cash in next 7 days')).toHaveCount(0)
})

test('board-182: the Today states sheet', async ({ page }) => {
  await page.goto('/_kit/today-states')
  await expect(page.getByRole('heading', { name: 'Nothing needs you right now.' })).toBeVisible()
  await expect(page.getByText('Then 28 more, grouped by record.')).toBeVisible()
  await expect(page.getByText('Shown once, above Needs you.')).toBeVisible()
})
