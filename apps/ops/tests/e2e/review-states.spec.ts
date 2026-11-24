import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S06-T03 · board-110 Review states: a stale card blocks approval and offers Redraft; a send that failed after
 * approval sits on top with Retry (a new send, a new key) and the other verbs. Fixture rows on example.test;
 * needs the Inngest event stub (tests/support/inngest-stub.ts).
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const PURCHASE = 'e2e-s06b-purchase@example.test'
const ids: Record<string, string> = {}
const stamp = Date.now().toString(36).toUpperCase()

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s06b-' } } })
  const box = await db.mailbox.create({
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
  ids.box = box.id
  const owner = await db.user.findFirstOrThrow({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  ids.staleRef = `A-E2E-S06B-STALE-${stamp}`
  await db.assistantAction.create({
    data: {
      ref: ids.staleRef,
      actionKey: 'ask_open_copy',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      headline: 'Ask Example Sender for an open copy of spares.pdf',
      reasons: [{ text: 'spares.pdf is password-protected' }],
      preview: {
        mailbox: PURCHASE,
        to: ['sender@example-valve.test'],
        subject: 'Re: spares',
        text: 'Could you send it without a password?',
      },
      checks: [],
      confidence: 'sure',
      state: 'proposed',
      surface: 'review',
      staleAt: new Date(),
      staleReason: 'The supplier replied since this was drafted (10:02).',
      inputs: {
        request: {
          actionKey: 'ask_open_copy',
          subjectType: 'mail_message',
          subjectId: '00000000-0000-7000-8000-000000000001',
          trigger: 'test',
          origin: 'live',
          sourceVersion: 1,
        },
      },
    },
  })
  ids.failedRef = `A-E2E-S06B-FAILED-${stamp}`
  const failed = await db.assistantAction.create({
    data: {
      ref: ids.failedRef,
      actionKey: 'ask_open_copy',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      headline: 'Ask Example Supplier for an open copy of pumps.pdf',
      reasons: [],
      state: 'failed',
      surface: 'review',
      decidedById: owner.id,
      decidedAt: new Date(),
      failureReason: 'purchase@ refused the connection',
    },
    select: { id: true },
  })
  ids.failed = failed.id
  await db.outboundEmail.create({
    data: {
      kind: 'other',
      mailboxId: box.id,
      toAddresses: ['supplier@example-valve.test'],
      ccAddresses: [],
      bccAddresses: [],
      subject: 'Re: pumps',
      bodyHtml: '<p>Please send an open copy.</p>',
      bodyText: 'Please send an open copy.',
      status: 'failed',
      failureReason: 'purchase@ refused the connection at 09:49',
      actionId: failed.id,
      idempotencyKey: `e2e-s06b:${stamp}:failed`,
    },
  })
})

test.afterAll(async () => {
  await db.assistantAction.updateMany({
    where: {
      ref: { startsWith: 'A-E2E-S06B-' },
      state: { in: ['proposed', 'later', 'failed', 'running'] },
    },
    data: { state: 'cancelled' },
  })
  await db.outboundEmail.deleteMany({ where: { mailboxId: ids.box } })
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s06b-' } } })
})

test('board-110: a stale card blocks approval and redrafts', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/review?card=${ids.staleRef}`)
  const card = page.locator('[data-part="proposal-card"][data-state="stale"]')
  await expect(card).toBeVisible({ timeout: 90_000 })
  await expect(card.getByText('The supplier replied since this was drafted (10:02).')).toBeVisible()
  await expect(card.getByText('Approving is blocked until it is redrafted.')).toBeVisible()
  await card.getByRole('button', { name: 'Redraft' }).click()
  await expect
    .poll(
      async () =>
        (await db.assistantAction.findUniqueOrThrow({ where: { ref: ids.staleRef } })).state,
      { timeout: 30_000 }
    )
    .toBe('cancelled')
})

test('board-110: a failed send sits on top with Retry, which queues a new send', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/review')
  const row = page.locator('[data-part="attention"][data-kind="failed"]', {
    hasText: 'Ask Example Supplier for an open copy of pumps.pdf',
  })
  await expect(row).toBeVisible({ timeout: 90_000 })
  await expect(row.getByText(/refused the connection at 09:49/)).toBeVisible()
  await expect(row.getByRole('link', { name: 'Fix mailbox in Settings' })).toHaveAttribute(
    'href',
    '/settings/mailboxes'
  )
  await row.getByRole('button', { name: 'Retry' }).click()
  await expect
    .poll(
      async () =>
        db.outboundEmail.count({ where: { actionId: ids.failed, retryOfId: { not: null } } }),
      { timeout: 30_000 }
    )
    .toBe(1)
  await expect(row).toHaveCount(0)
})
