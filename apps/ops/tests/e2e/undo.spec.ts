import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S06-T07 · board-114 Undo and corrections: approve → Undo in the toast ("↺ Undone at … · nothing was sent ·
 * back in Review"); an approval whose email already left → the receipt's Undo answers "… left at …. It
 * can't be recalled." and opens "Send a correction instead?" → Start; a correction card in Review; and
 * "Revert to before Assistant change" on a History row writes "Reverted by". Fixture mail on example.test;
 * the Inngest event stub accepts the queued events; nothing is sent.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const PURCHASE = 'e2e-s06u-purchase@example.test'
const SENDER = 'e2e-s06u-sender@example-valve.test'
const ids: Record<string, string> = {}
const stamp = Date.now().toString(36)

async function card(key: string): Promise<{ ref: string; threadId: string }> {
  const t = await db.mailThread.create({
    data: {
      mailboxId: ids.purchase!,
      gmailThreadId: `e2e-s06u-${key}-${stamp}`,
      subject: `RFQ ${key}`,
    },
    select: { id: true },
  })
  const m = await db.mailMessage.create({
    data: {
      mailboxId: ids.purchase!,
      threadId: t.id,
      gmailMessageId: `e2e-s06u-${key}-${stamp}`,
      rfcMessageId: `<e2e-s06u-${key}-${stamp}@example-valve.test>`,
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
      flags: { passwordProtected: [`${key}.pdf`] },
    },
    select: { id: true },
  })
  const ref = `A-E2E-S06U-${key.toUpperCase()}-${stamp.toUpperCase()}`
  await db.assistantAction.create({
    data: {
      ref,
      actionKey: 'ask_open_copy',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      subjectType: 'mail_message',
      subjectId: m.id,
      headline: `Ask Example Sender for an open copy of ${key}.pdf`,
      reasons: [{ text: `${key}.pdf is password-protected, so it could not be read` }],
      preview: {
        mailbox: PURCHASE,
        to: [SENDER],
        subject: `Re: RFQ ${key}`,
        text: 'Thank you; we could not open the file. Could you send a copy without a password?',
      },
      checks: [{ label: 'Same thread and mailbox', status: 'pass' }],
      confidence: 'sure',
      onApproveText: `Sends the reply from ${PURCHASE} in this thread`,
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
  return { ref, threadId: t.id }
}

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s06u-' } } })
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
  ids.a = (await card('undo')).ref
  ids.b = (await card('left')).ref
})

test.afterAll(async () => {
  await db.assistantAction.updateMany({
    where: { ref: { startsWith: 'A-E2E-S06U-' }, state: { in: ['proposed', 'later'] } },
    data: { state: 'cancelled' },
  })
  await db.outboundEmail.deleteMany({ where: { mailboxId: ids.purchase } })
  await db.mailThread.deleteMany({ where: { mailboxId: ids.purchase } })
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s06u-' } } })
})

const state = async (ref: string) =>
  (await db.assistantAction.findUniqueOrThrow({ where: { ref } })).state

test('board-114: approve, then Undo inside the window: nothing was sent, back in Review', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/review?card=${ids.a}`)
  const cardEl = page.locator(`#proposal-${ids.a}`)
  await expect(cardEl).toBeVisible({ timeout: 90_000 })
  await cardEl.locator('[data-verb="approve"]').click()
  const toasts = page.locator('[data-part="toast-region"]')
  await expect(toasts.getByRole('button', { name: /^Undo \d:\d{2}/ })).toBeVisible({
    timeout: 30_000,
  })
  await expect.poll(() => state(ids.a!)).toBe('queued')
  await toasts.getByRole('button', { name: /^Undo/ }).click()
  await expect(
    toasts.getByText(/↺ Undone at \d{2}:\d{2} · nothing was sent · back in Review/)
  ).toBeVisible()
  await expect.poll(() => state(ids.a!)).toBe('undone')
  expect(
    (await db.outboundEmail.findFirstOrThrow({ where: { action: { ref: ids.a } } })).status
  ).toBe('cancelled')
})

test('board-114: an email that left cannot be undone; a correction is offered and started', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/review?card=${ids.b}`)
  const cardEl = page.locator(`#proposal-${ids.b}`)
  await expect(cardEl).toBeVisible({ timeout: 90_000 })
  await cardEl.locator('[data-verb="approve"]').click()
  await expect.poll(() => state(ids.b!)).toBe('queued')
  // The send goes out (the queue's work, simulated here): the receipt's Undo now meets "left".
  await db.outboundEmail.updateMany({
    where: { action: { ref: ids.b } },
    data: { status: 'sent', sentAt: new Date(), gmailMessageId: `e2e-s06u-sent-${stamp}` },
  })
  const toasts = page.locator('[data-part="toast-region"]')
  await toasts.getByRole('button', { name: /^Undo/ }).click()
  await expect(
    toasts.getByText(new RegExp(`${ids.b} left at \\d{2}:\\d{2}\\. It can’t be recalled\\.`))
  ).toBeVisible()
  const modal = page.getByRole('dialog', { name: 'Send a correction instead?' })
  await expect(modal).toBeVisible()
  await modal.getByRole('radio', { name: 'Wrong attachment' }).click()
  await expect(modal.getByRole('radio', { name: 'Wrong attachment' })).toHaveAttribute(
    'aria-checked',
    'true'
  )
  await modal.getByLabel('Note for the Assistant (optional)').fill('The file was last year’s list')
  await modal.getByRole('button', { name: 'Start correction' }).click()
  await expect(toasts.getByText(/drafting a correction/)).toBeVisible()
  await expect(modal).toBeHidden()
  expect(await state(ids.b!)).toBe('queued')
})

test('board-114: a correction card waits in Review as one card', async ({ page, signedInAs }) => {
  const original = await db.assistantAction.findUniqueOrThrow({ where: { ref: ids.b! } })
  const out = await db.outboundEmail.findFirstOrThrow({ where: { actionId: original.id } })
  const ref = `A-E2E-S06U-CORR-${stamp.toUpperCase()}`
  await db.assistantAction.create({
    data: {
      ref,
      actionKey: 'correction_email',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      subjectType: 'mail_thread',
      subjectId: out.threadId!,
      headline: `Correction to ${ids.b}: Wrong attachment`,
      reasons: [
        { text: `${ids.b} left; it can’t be recalled` },
        { text: 'The file was last year’s list' },
      ],
      preview: {
        mailbox: PURCHASE,
        to: [SENDER],
        subject: 'Re: RFQ left',
        text: 'Our previous email had the wrong attachment; apologies. The right file is attached.',
      },
      checks: [{ label: 'Add the corrected figure before you approve', status: 'warn' }],
      confidence: 'likely',
      onApproveText: `Sends the correction from ${PURCHASE} in the same thread`,
      output: { note: 'x', problem: null },
      state: 'proposed',
      surface: 'review',
      correctionOfId: original.id,
    },
  })
  await signedInAs('owner')
  await page.goto(`/review?card=${ref}`)
  const cardEl = page.locator(`#proposal-${ref}`)
  await expect(cardEl).toBeVisible({ timeout: 90_000 })
  await expect(cardEl.getByText(`Correction to ${ids.b}: Wrong attachment`)).toBeVisible()
  await expect(cardEl.getByText('Re: RFQ left')).toBeVisible()
})

test('board-114: Revert to before Assistant change writes Reverted by, keeping the old row', async ({
  page,
  signedInAs,
}) => {
  const e = await db.enquiry.upsert({
    where: { ref: 'ENQ-2026-0001' },
    create: {
      ref: 'ENQ-2026-0001',
      title: 'Plant turnaround spares',
      receivedVia: 'email',
      receivedAt: new Date(Date.now() - 10 * 86_400_000),
    },
    update: {},
    select: { id: true },
  })
  const t = await db.mailThread.create({
    data: { mailboxId: ids.purchase!, gmailThreadId: `e2e-s06u-rev-${stamp}` },
    select: { id: true },
  })
  const m = await db.mailMessage.create({
    data: {
      mailboxId: ids.purchase!,
      threadId: t.id,
      gmailMessageId: `e2e-s06u-rev-${stamp}`,
      direction: 'inbound',
      fromAddress: SENDER,
      toAddresses: [PURCHASE],
      ccAddresses: [],
      subject: 'Price list',
      bodyText: 'Attached.',
      sentAt: new Date(),
      labelsApplied: [],
      origin: 'live',
      classification: 'supplier_price_list',
      confidence: 'sure',
      handledState: 'not_linked',
    },
    select: { id: true },
  })
  const a = await db.assistantAction.create({
    data: {
      ref: `A-E2E-S06U-REV-${stamp.toUpperCase()}`,
      actionKey: 'classify_mail',
      levelAtTime: 'do_quietly',
      guardrails: [],
      enquiryId: e.id,
      subjectType: 'mail_message',
      subjectId: m.id,
      headline: 'Classified as Supplier price list',
      reasons: [],
      state: 'done',
      surface: 'review',
    },
    select: { id: true },
  })
  const field = `classification`
  const ev = await db.activityEvent.create({
    data: {
      actorKind: 'assistant',
      actionId: a.id,
      enquiryId: e.id,
      subjectType: 'mail_message',
      subjectId: m.id,
      kind: 'status',
      field,
      before: 'client_enquiry',
      after: 'supplier_price_list',
      note: `Revert target ${stamp}`,
    },
    select: { id: true },
  })
  await signedInAs('owner')
  await page.goto('/enquiries/ENQ-2026-0001/activity')
  const table = page.getByRole('region', { name: 'History of changes' })
  await expect(table).toBeVisible({ timeout: 90_000 })
  const row = table.locator('li', { hasText: `Revert target ${stamp}` })
  await row.getByRole('button', { name: 'Revert to before Assistant change' }).click()
  await expect(page.getByText(/Reverted classification · logged as A-/)).toBeVisible()
  await expect(table.getByText('Reverted by OE').first()).toBeVisible()
  const msg = await db.mailMessage.findUniqueOrThrow({ where: { id: m.id } })
  expect(msg.classification).toBe('client_enquiry')
  expect(await db.activityEvent.findUniqueOrThrow({ where: { id: ev.id } })).toMatchObject({
    after: 'supplier_price_list',
  })
  await expect(row.getByRole('button', { name: 'Revert to before Assistant change' })).toHaveCount(
    0
  )
})
