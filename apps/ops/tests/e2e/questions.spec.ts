import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { seedQuestions } from '../../src/server/enquiry/testing/questions-seed'
import { expect, test } from '../signed-in'

/**
 * S09-T07 · board-171 Questions tab: the held lines with their questions and the line quoted on its assumption;
 * the clock (sent → day-2 reminder → day-3 call → fallback → last day) and the KPIs; the day-2 reminder card drawn
 * inline; the client's answers card applies 2 of 3 answers (line 4 open with its spec, line 10 at 8 pcs) and line 12
 * keeps waiting; "Answer manually" answers the last one and the response clock resumes; "Add question" asks the
 * Assistant to draft. Needs the Inngest event stub.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const SALES = 'e2e-s09qs-sales@example.test'
const stamp = Date.now().toString(36)
let seed: Awaited<ReturnType<typeof seedQuestions>>
let salesId = ''

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: SALES } })
  salesId = (
    await db.mailbox.create({
      data: {
        address: SALES,
        displayName: 'Sales Example',
        role: 'client',
        status: 'live',
        scopes: ['openid', 'email', 'https://www.googleapis.com/auth/gmail.send'],
        canRead: true,
        canLabel: true,
        canSend: true,
      },
      select: { id: true },
    })
  ).id
  seed = await seedQuestions(db, {
    tag: `qs${stamp}`,
    ref: `ENQ-2095-${String(Date.now()).slice(-6)}1`,
    rfqPrefix: `95${String(Date.now()).slice(-2)}`,
    salesMailboxId: salesId,
    salesAddress: SALES,
    answers: true,
  })
})

test.afterAll(async () => {
  await db.outboundEmail.deleteMany({ where: { mailboxId: salesId } })
  // Cards left waiting would crowd other specs' Review queue.
  await db.assistantAction.updateMany({
    where: { enquiryId: seed.enquiryId, state: 'proposed' },
    data: { state: 'cancelled' },
  })
  await db.enquiry.update({ where: { id: seed.enquiryId }, data: { closedAt: new Date() } })
  await db.mailThread.updateMany({ where: { mailboxId: salesId }, data: { enquiryId: null } })
  await db.intakeBatch.deleteMany({ where: { enquiryId: seed.enquiryId } })
  await db.mailThread.deleteMany({ where: { mailboxId: salesId } })
  await db.mailbox.deleteMany({ where: { address: SALES } })
})

const line = async (no: number) =>
  db.enquiryLine.findFirstOrThrow({
    where: { enquiryId: seed.enquiryId, no },
    select: { status: true, qty: true, specNotes: true },
  })

test('board-171: held lines, the clock, the reminder card; answers applied; answer manually', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${seed.ref}/questions`)
  const list = page.locator('[data-part="client-questions"]')
  await expect(list).toBeVisible({ timeout: 90_000 })
  await expect(list).toContainText('Questions to Sample Petrochem Services')
  await expect(list).toContainText('Sent to Sample Buyer')
  await expect(list.locator('[data-question]')).toHaveCount(4)
  await expect(list.locator('[data-question="4"]')).toContainText('Line on hold')
  await expect(list.locator('[data-question="8"]')).toContainText(
    'Not sent. Assumption printed on the quotation: “Supplied with local LCD display.”'
  )
  // The header: waiting on the client, Add question as the one primary.
  await expect(page.getByText('Waiting on client · 3 lines')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add question' })).toBeVisible()

  const clock = page.locator('[data-part="question-clock"]')
  await expect(clock).toContainText('Lines on hold')
  await expect(clock).toContainText('3 · #4, #10, #12')
  await expect(clock).toContainText('Day 2 · reminder email')
  await expect(clock).toContainText('Proposal in Review now')
  await expect(clock).toContainText('Last day to send held lines to suppliers')
  await expect(page.locator('[data-part="fallback-chooser"]')).toContainText(
    'Quote on stated assumptions'
  )

  // The reminder card is drawn inline, as Review draws it.
  await expect(page.locator(`#proposal-${seed.reminderRef}`)).toContainText(
    'Remind Sample Buyer of the 3 open questions'
  )
  const axe = await new AxeBuilder({ page }).include('[data-built="enquiry-questions"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  // The client's answers: approve applies 2 of 3.
  const answers = page.locator(`#proposal-${seed.answersRef}`)
  await expect(answers).toContainText('Answers to 2 of 3 questions')
  await answers.locator('[data-verb="approve"]').click()
  await expect
    .poll(
      async () =>
        (await db.assistantAction.findUniqueOrThrow({ where: { ref: seed.answersRef! } })).state,
      {
        timeout: 30_000,
      }
    )
    .toBe('done')
  expect(await line(4)).toMatchObject({ status: 'open', specNotes: 'Stellite 6 faced trim' })
  const l10 = await line(10)
  expect([l10.status, l10.qty.toString()]).toEqual(['open', '8'])
  expect((await line(12)).status).toBe('held')
  expect(
    (await db.enquiry.findUniqueOrThrow({ where: { id: seed.enquiryId } })).responseClockPausedAt
  ).not.toBeNull()

  // The last one answered by phone: the line opens, the response clock resumes.
  await page.reload()
  const q12 = page.locator('[data-question="12"]')
  await q12.getByRole('button', { name: 'Answer manually' }).click()
  await q12.getByLabel('Answer for line 12').fill('2 in CL300 RF, confirmed by phone')
  await q12.getByRole('button', { name: 'Save answer' }).click()
  await expect.poll(async () => (await line(12)).status, { timeout: 30_000 }).toBe('open')
  expect(
    (await db.enquiry.findUniqueOrThrow({ where: { id: seed.enquiryId } })).responseClockPausedAt
  ).toBeNull()
  await expect(page.locator('[data-question="12"]')).toContainText('Answered')
})

test('board-171: Add question asks the Assistant to draft for the picked lines', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${seed.ref}/questions?add=1`)
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible({ timeout: 90_000 })
  // Lines 4 and 10 opened after the answers above: they can be asked about again.
  await sheet.getByRole('checkbox', { name: /#4/ }).check()
  await sheet.getByLabel('What to ask (optional)').fill('Confirm the trim hardness')
  await sheet.getByRole('button', { name: /Draft 1 question/ }).click()
  await expect(page.getByText('The Assistant is drafting the questions for Review')).toBeVisible({
    timeout: 30_000,
  })
  await expect(sheet).toBeHidden()
})
