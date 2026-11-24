import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S06-T05 · board-112 Why?: opened from Mail's Assistant pane over the thread, a reason's source link switches
 * to Sources with the quote highlighted, History lists the value's changes, "This is wrong…" re-files the
 * email as "Overridden by", Esc closes and returns focus to the link, and a reload opens the full page.
 * Fixture mail on example.test only; removed at the end.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const SALES = 'e2e-s06w-sales@example.test'
const QUOTE = 'please find attached our updated price list'
const SUBJECT = 'Price list Q4 (why)'
const BODY = `Dear team,\n\n${QUOTE} for Q4. Stock on the 22-series is good.\n\nRegards`
const ids: Record<string, string> = {}

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: SALES } })
  const mb = await db.mailbox.create({
    data: {
      address: SALES,
      displayName: 'Sales Example',
      role: 'client',
      status: 'live',
      scopes: ['openid', 'email'],
      canRead: true,
      canLabel: true,
      canSend: false,
    },
    select: { id: true },
  })
  const t = await db.mailThread.create({
    data: {
      mailboxId: mb.id,
      gmailThreadId: 'e2e-s06w-t1',
      subject: SUBJECT,
      lastMessageAt: new Date(Date.now() - 3 * 60_000),
    },
    select: { id: true },
  })
  ids.thread = t.id
  const m = await db.mailMessage.create({
    data: {
      mailboxId: mb.id,
      threadId: t.id,
      gmailMessageId: 'e2e-s06w-m1',
      rfcMessageId: 'e2e-s06w-m1@example.test',
      direction: 'inbound',
      fromAddress: 'sales@bearings.example',
      fromName: 'Sales Team',
      toAddresses: [SALES],
      ccAddresses: [],
      subject: SUBJECT,
      bodyText: BODY,
      bodyTextHash: 'e2e-h1',
      sentAt: new Date(Date.now() - 3 * 60_000),
      labelsApplied: [],
      origin: 'live',
      classification: 'supplier_price_list',
      confidence: 'sure',
      handledState: 'not_linked',
      assistantNote: 'Supplier price list · Sure · from a known supplier',
    },
    select: { id: true },
  })
  ids.message = m.id
  ids.ref = `A-E2E-S06W-${Date.now().toString(36)}`
  const a = await db.assistantAction.create({
    data: {
      ref: ids.ref,
      actionKey: 'classify_mail',
      levelAtTime: 'do_quietly',
      guardrails: [],
      subjectType: 'mail_message',
      subjectId: m.id,
      headline: 'Classified as Supplier price list',
      reasons: [
        { text: `The sender sends a price list — “${QUOTE}”` },
        { text: 'No request to quote; the sender is a known supplier' },
      ],
      checks: [{ label: 'Quoted evidence', status: 'pass', detail: '1 of 1 quotes found' }],
      confidence: 'sure',
      state: 'done',
      surface: 'review',
    },
    select: { id: true },
  })
  const text = `${SUBJECT}\n${BODY}`
  const at = text.indexOf(QUOTE)
  await db.sourceSpan.create({
    data: {
      sourceKind: 'email',
      sourceId: m.id,
      textHash: 'e2e-h1',
      quote: QUOTE,
      resolved: 'exact',
      charStart: at,
      charEnd: at + QUOTE.length,
    },
  })
  await db.activityEvent.create({
    data: {
      actorKind: 'assistant',
      actionId: a.id,
      subjectType: 'mail_message',
      subjectId: m.id,
      kind: 'status',
      field: 'classification',
      before: 'unclassified',
      after: 'supplier_price_list',
    },
  })
})

test.afterAll(async () => {
  await db.mailThread.deleteMany({ where: { id: ids.thread } })
  await db.mailbox.deleteMany({ where: { address: SALES } })
})

test('board-112: Why? from Mail, sources highlighted, a correction, Esc returns focus', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/mail/all/${ids.thread}`)
  const pane = page.getByRole('complementary', { name: 'What the Assistant did' })
  const why = pane.getByRole('link', { name: 'Why?' }).first()
  await expect(why).toBeVisible({ timeout: 90_000 })
  await why.click()

  const drawer = page.getByRole('dialog', { name: 'Classified as Supplier price list' })
  await expect(drawer).toBeVisible({ timeout: 60_000 })
  await expect(page).toHaveURL(new RegExp(`/why/${ids.ref}$`))
  await expect(drawer.getByText('Why? · Mail')).toBeVisible()
  await expect(drawer.getByRole('tab', { name: /Reasons/ })).toHaveAttribute(
    'aria-selected',
    'true'
  )

  // A reason's source link switches to Sources at its span, without a navigation.
  await drawer
    .getByRole('link', { name: /Source/ })
    .first()
    .click()
  await expect(drawer.getByRole('tab', { name: /Sources/ })).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await expect(page).toHaveURL(new RegExp(`/why/${ids.ref}$`))
  const mark = drawer.locator('mark[data-part="highlight"]')
  await expect(mark).toHaveText(QUOTE)
  await expect(mark).toHaveAttribute('data-state', 'on')
  await expect(drawer.getByText('Paragraph 2')).toBeVisible()

  const { violations } = await new AxeBuilder({ page }).include('[role=dialog]').analyze()
  expect(
    violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => v.id)
  ).toEqual([])

  await drawer.getByRole('tab', { name: /History/ }).click()
  await expect(drawer.getByText(/supplier price list/).first()).toBeVisible()

  // This is wrong… → Client enquiry, with a reason.
  await drawer.getByRole('button', { name: 'This is wrong…' }).click()
  await drawer.getByRole('combobox', { name: 'Type' }).selectOption('client_enquiry')
  await drawer.getByLabel('Why is it wrong?').fill('They ask us to quote')
  await drawer.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Overridden: Type → Client enquiry')).toBeVisible()
  await expect(drawer.getByText(/Overridden by/).first()).toBeVisible()
  const row = await db.mailMessage.findUniqueOrThrow({ where: { id: ids.message } })
  expect(row.classification).toBe('client_enquiry')
  const original = await db.assistantAction.findUniqueOrThrow({ where: { ref: ids.ref } })
  expect(original.state).toBe('reverted')

  // Esc closes the drawer and returns focus to the link that opened it.
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(page).toHaveURL(new RegExp(`/mail/all/${ids.thread}$`))
  await expect(why).toBeFocused()

  // A reload of the evidence URL is the full page.
  await page.goto(`/why/${ids.ref}?returnTo=%2Fmail`)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Classified as Supplier price list' })
  ).toBeVisible()
  await expect(page.getByText(/Reverted/)).toBeVisible()
})
