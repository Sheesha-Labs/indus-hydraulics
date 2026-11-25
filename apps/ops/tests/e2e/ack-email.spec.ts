import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'
import { runStep } from '../support/steps'

/**
 * S08-T07 · board-93 Acknowledge client. The ack_email run (no model: the signed-off template) is taken in a
 * subprocess with the same server code (the local Inngest stub runs no function). In Review the card shows the
 * draft from sales@ and "Why 26 Sep"; approving queues one email with the 5-minute undo and records the revert-by;
 * Undo cancels the send, clears the revert-by and brings the card back; approving again queues it again.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const tag = `e2eack${Date.now()}`
const created: string[] = []

test.afterAll(async () => {
  if (created.length)
    await db.enquiry.updateMany({
      where: { id: { in: created } },
      data: { closedReason: 'other', closeNote: 'e2e', closedAt: new Date() },
    })
})

test('board-93: approve, undo, approve again', async ({ page, signedInAs }) => {
  const sales = await db.mailbox.findFirstOrThrow({
    where: { role: 'client', status: 'live' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, address: true },
  })
  const company = await db.company.create({
    data: { name: `Sample Client LLC ${tag}` },
    select: { id: true },
  })
  const contact = await db.contact.create({
    data: { companyId: company.id, name: 'Sample Buyer', email: `buyer@${tag}.example.test` },
    select: { id: true },
  })
  const thread = await db.mailThread.create({
    data: { mailboxId: sales.id, gmailThreadId: `t-${tag}` },
    select: { id: true },
  })
  const msg = await db.mailMessage.create({
    data: {
      mailboxId: sales.id,
      threadId: thread.id,
      gmailMessageId: `g-${tag}`,
      rfcMessageId: `${randomUUID()}@client.example.test`,
      direction: 'inbound',
      fromAddress: `buyer@${tag}.example.test`,
      fromName: 'Sample Buyer',
      toAddresses: [sales.address],
      ccAddresses: [],
      subject: 'RFQ SC/MM/25-1203 — compressor station spares',
      bodyText: 'Dear Sir, please quote your best price for the 14 items.',
      bodyTextHash: randomUUID(),
      sentAt: new Date('2025-09-24T05:00:00Z'),
      labelsApplied: [],
      origin: 'live',
    },
    select: { id: true },
  })
  const ref = `ENQ-2099-${String(Date.now()).slice(-7)}`
  const e = await db.enquiry.create({
    data: {
      ref,
      title: 'Compressor station spares',
      clientId: company.id,
      contactId: contact.id,
      clientRef: 'SC/MM/25-1203',
      receivedVia: 'email',
      receivedAt: new Date('2025-09-24T05:00:00Z'),
      deadline: new Date('2025-09-28T14:00:00Z'),
      lines: {
        create: Array.from({ length: 14 }, (_, i) => ({
          no: i + 1,
          description: `Spare ${i + 1}`,
          qty: 1,
        })),
      },
    },
    select: { id: true },
  })
  created.push(e.id)
  await db.intakeBatch.create({
    data: { source: 'mail', mailMessageId: msg.id, status: 'confirmed', enquiryId: e.id },
  })

  const out = join(process.cwd(), 'test-results', 'ack-email')
  mkdirSync(out, { recursive: true })
  const req = join(out, `${tag}-request.json`)
  writeFileSync(
    req,
    JSON.stringify({
      actionKey: 'ack_email',
      subjectType: 'enquiry',
      subjectId: e.id,
      enquiryId: e.id,
      trigger: 'enquiry.created',
      origin: 'live',
      sourceVersion: ref,
    })
  )
  const run = runStep('action', req)
  expect(run).toMatchObject({ state: 'proposed' })

  await signedInAs('owner')
  await page.goto(`/review?group=flat&record=enquiry:${e.id}&card=${String(run.ref)}`)
  const card = page.locator(`#proposal-${String(run.ref)}`)
  await expect(card).toBeVisible({ timeout: 90_000 })
  await expect(
    card.getByText(`Acknowledge Sample Client LLC ${tag}: ${ref}, revert by 26 Sep`)
  ).toBeVisible()
  await expect(card.getByText(/We will revert by 26 September\./)).toBeVisible()
  const why = page.getByRole('region', { name: 'Why 26 Sep' })
  await expect(why).toBeVisible()
  await expect(why.getByText('Client closing date:')).toBeVisible()
  const axe = await new AxeBuilder({ page }).include(`#proposal-${String(run.ref)}`).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await card.locator('[data-verb="approve"]').click()
  const toasts = page.locator('[data-part="toast-region"]')
  await expect(toasts.getByRole('button', { name: /Undo/ })).toBeVisible({ timeout: 30_000 })
  const queued = await db.outboundEmail.findFirstOrThrow({
    where: { enquiryId: e.id, kind: 'client_acknowledgement' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, mailboxId: true, threadId: true, undoUntil: true },
  })
  expect(queued).toMatchObject({ status: 'scheduled', mailboxId: sales.id, threadId: thread.id })
  expect((queued.undoUntil!.getTime() - Date.now()) / 60_000).toBeGreaterThan(4)
  expect(
    (await db.enquiry.findUniqueOrThrow({ where: { id: e.id } })).revertBy?.toISOString()
  ).toBe('2025-09-26T14:00:00.000Z')

  await toasts.getByRole('button', { name: /Undo/ }).click()
  await expect
    .poll(
      async () => (await db.outboundEmail.findUniqueOrThrow({ where: { id: queued.id } })).status,
      { timeout: 30_000 }
    )
    .toBe('cancelled')
  await expect
    .poll(async () => (await db.enquiry.findUniqueOrThrow({ where: { id: e.id } })).revertBy, {
      timeout: 30_000,
    })
    .toBeNull()

  // The card is back in Review (a new ref); approving it again queues the acknowledgement again.
  const back = await db.assistantAction.findFirstOrThrow({
    where: { actionKey: 'ack_email', subjectId: e.id, state: 'proposed' },
    orderBy: { createdAt: 'desc' },
    select: { ref: true },
  })
  await page.goto(`/review?group=flat&record=enquiry:${e.id}&card=${back.ref}`)
  await page.locator(`#proposal-${back.ref}`).locator('[data-verb="approve"]').click()
  await expect
    .poll(
      async () =>
        db.outboundEmail.count({
          where: { enquiryId: e.id, kind: 'client_acknowledgement', status: 'scheduled' },
        }),
      { timeout: 30_000 }
    )
    .toBe(1)
  await expect
    .poll(async () => (await db.enquiry.findUniqueOrThrow({ where: { id: e.id } })).revertBy, {
      timeout: 30_000,
    })
    .not.toBeNull()
})
