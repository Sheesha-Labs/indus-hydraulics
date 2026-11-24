import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * S06-T02 · board-104 Review: approve → the server's undo countdown → Undo returns the card; Edit → Save and
 * approve sends the edited version; Reject with a reason chip; Later leaves the queue; J moves card to card.
 * Fixture mail on example.test. Needs the Inngest event stub (tests/support/inngest-stub.ts) so a queued
 * send's event is accepted; nothing is sent.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const PURCHASE = 'e2e-s06-purchase@example.test'
const SENDER = 'e2e-s06-sender@example-valve.test'
const ids: Record<string, string> = {}
const stamp = Date.now().toString(36)

async function blocking(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

async function card(key: string, file: string): Promise<string> {
  const t = await db.mailThread.create({
    data: {
      mailboxId: ids.purchase!,
      gmailThreadId: `e2e-s06-${key}-${stamp}`,
      subject: `RFQ ${key}`,
    },
    select: { id: true },
  })
  const m = await db.mailMessage.create({
    data: {
      mailboxId: ids.purchase!,
      threadId: t.id,
      gmailMessageId: `e2e-s06-${key}-${stamp}`,
      rfcMessageId: `<e2e-s06-${key}-${stamp}@example-valve.test>`,
      direction: 'inbound',
      fromAddress: SENDER,
      fromName: 'Example Sender',
      toAddresses: [PURCHASE],
      ccAddresses: [],
      subject: `RFQ ${key}`,
      bodyText: 'Please see the attached file.',
      sentAt: new Date(Date.now() - 30 * 60_000),
      labelsApplied: [],
      origin: 'live',
      classification: 'supplier_quote',
      confidence: 'sure',
      handledState: 'needs_you',
      flags: { passwordProtected: [file] },
    },
    select: { id: true },
  })
  const ref = `A-E2E-S06-${key.toUpperCase()}-${stamp.toUpperCase()}`
  await db.assistantAction.create({
    data: {
      ref,
      actionKey: 'ask_open_copy',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      subjectType: 'mail_message',
      subjectId: m.id,
      headline: `Ask Example Sender for an open copy of ${file}`,
      reasons: [{ text: `${file} is password-protected, so it could not be read` }],
      preview: {
        mailbox: PURCHASE,
        to: [SENDER],
        subject: `Re: RFQ ${key}`,
        text: `Thank you; we could not open ${file} because it is password-protected. Could you send a copy without a password?`,
      },
      checks: [{ label: 'Same thread and mailbox', status: 'pass' }],
      confidence: 'sure',
      onApproveText: `Sends the reply from ${PURCHASE} in this thread`,
      options: [
        { key: 'send', label: 'Send the reply', consequence: 'Queued with the 5-minute undo' },
        { key: 'skip', label: 'Not needed', consequence: 'Nothing is sent' },
      ],
      output: { note: 'x', problem: null },
      state: 'proposed',
      surface: 'review',
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
  })
  return ref
}

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s06-' } } })
  const purchase = await db.mailbox.create({
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
  ids.purchase = purchase.id
  ids.a = await card('approve', 'list-a.pdf')
  ids.b = await card('edit', 'list-b.pdf')
  ids.c = await card('reject', 'list-c.pdf')
  ids.d = await card('later', 'list-d.pdf')
  ids.e = await card('next', 'list-e.pdf')
  ids.f = await card('after', 'list-f.pdf')
})

test.afterAll(async () => {
  await db.outboundEmail.deleteMany({ where: { mailboxId: ids.purchase } })
  await db.mailThread.deleteMany({ where: { mailboxId: ids.purchase } })
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s06-' } } })
})

const state = async (ref: string) =>
  (await db.assistantAction.findUniqueOrThrow({ where: { ref } })).state

test('board-104: approve with the undo countdown, then Undo returns the card', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/review?card=${ids.a}`)
  await expect(page.getByRole('heading', { name: /^Review · \d+ waiting$/ })).toBeVisible({
    timeout: 90_000,
  })
  const cardEl = page.locator(`#proposal-${ids.a}`)
  await expect(cardEl).toBeVisible()
  await expect(cardEl.getByText('Re: RFQ approve')).toBeVisible()
  expect(await blocking(page)).toEqual([])
  await cardEl.locator('[data-verb="approve"]').click()
  const toasts = page.locator('[data-part="toast-region"]')
  await expect(toasts.getByRole('button', { name: /Undo/ })).toBeVisible({ timeout: 30_000 })
  await expect.poll(() => state(ids.a!)).toBe('queued')
  const out = await db.outboundEmail.findFirstOrThrow({
    where: { action: { ref: ids.a } },
    select: { status: true, toAddresses: true },
  })
  expect(out).toMatchObject({ status: 'scheduled', toAddresses: [SENDER] })
  await toasts.getByRole('button', { name: /Undo/ }).click()
  await expect.poll(() => state(ids.a!)).toBe('undone')
  const back = await db.assistantAction.findFirstOrThrow({
    where: {
      retryOfId: (await db.assistantAction.findUniqueOrThrow({ where: { ref: ids.a } })).id,
    },
  })
  expect(back.state).toBe('proposed')
  expect(
    (await db.outboundEmail.findFirstOrThrow({ where: { action: { ref: ids.a } } })).status
  ).toBe('cancelled')
})

test('board-104: Edit, then Save and approve sends the edited version', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/review?card=${ids.b}`)
  const cardEl = page.locator(`#proposal-${ids.b}`)
  await expect(cardEl).toBeVisible({ timeout: 90_000 })
  await cardEl.locator('[data-verb="edit"]').click()
  await expect(page).toHaveURL(/edit=1/)
  const subject = page.getByLabel('Subject')
  await subject.fill('Re: RFQ edit (open copy, please)')
  await page.getByRole('button', { name: 'Save and approve' }).click()
  await expect.poll(() => state(ids.b!), { timeout: 30_000 }).toBe('queued')
  const sent = await db.outboundEmail.findFirstOrThrow({ where: { action: { ref: ids.b } } })
  expect(sent.subject).toBe('Re: RFQ edit (open copy, please)')
  const row = await db.assistantAction.findUniqueOrThrow({ where: { ref: ids.b } })
  expect(row.editDiff).toMatchObject({ fields: ['subject'] })
})

test('board-104: Reject with a reason chip; Later leaves the queue; J moves to the next card', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/review?card=${ids.c}`)
  const c = page.locator(`#proposal-${ids.c}`)
  await expect(c).toBeVisible({ timeout: 90_000 })
  await c.locator('[data-verb="reject"]').click()
  const pop = page.getByRole('dialog')
  await expect(pop).toBeVisible()
  await pop.getByText('Not needed', { exact: true }).click()
  await pop.getByLabel('Why not? (one line)').fill('Already received an open copy by email')
  await pop.getByRole('button', { name: 'Reject', exact: true }).click()
  await expect.poll(() => state(ids.c!), { timeout: 30_000 }).toBe('rejected')
  expect((await db.assistantAction.findUniqueOrThrow({ where: { ref: ids.c } })).rejectReason).toBe(
    'Already received an open copy by email'
  )

  await page.goto(`/review?card=${ids.d}`)
  const d = page.locator(`#proposal-${ids.d}`)
  await expect(d).toBeVisible({ timeout: 90_000 })
  await d.locator('[data-verb="later"]').click()
  await page.getByRole('menuitem', { name: /In 1 hour/ }).click()
  await expect.poll(() => state(ids.d!), { timeout: 30_000 }).toBe('later')
  await page.goto('/review')
  await expect(page.locator(`#proposal-${ids.d}`)).toHaveCount(0)

  // J moves to the next card (its ?card= in the URL), K back.
  await page.goto(`/review?card=${ids.e}`)
  await expect(page.locator(`#proposal-${ids.e}`)).toBeVisible({ timeout: 90_000 })
  await page.locator('main#content h1').click()
  await page.keyboard.press('j')
  await expect(page).toHaveURL(new RegExp(`card=${ids.f}`))
  await expect(page.locator(`#proposal-${ids.f}`)).toBeVisible()
  await page.locator('main#content h1').click()
  await page.keyboard.press('k')
  await expect(page).toHaveURL(new RegExp(`card=${ids.e}`))
})
