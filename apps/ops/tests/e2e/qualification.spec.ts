import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import type { Page } from '@playwright/test'
import { seedQualify } from '../../src/server/enquiry/testing/qualify-seed'
import { expect, test } from '../signed-in'

/**
 * S09-T06 · board-167 quick read and path, 171b states 1–3, board-168 regret in Review.
 *   167: the read (chips, the three lists, the evidence links) replaces the line table; choosing "Quote what we
 *        can" with line 14 moves the enquiry to Sourcing, records the path, and the line table returns
 *   171b: reading (no read yet); "Is this a real buyer?" leads with Ask the client first and hides the rest behind
 *        "Something else"; a sign-in link reads Ignore (spam) · Sure, filing it shows the undo, Undo restores it
 *   168: the regret card with its reason chips and switch; approve queues the send with the undo; Undo returns it;
 *        an edit naming the supplier is refused with the term; approve again queues the regret with the reason
 * Needs the Inngest event stub (the drafts the path asks for are requested, not run).
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const SALES = 'e2e-s09q-sales@example.test'
const stamp = Date.now().toString(36)
const ids: Record<string, string> = {}
const seeds: Record<string, Awaited<ReturnType<typeof seedQualify>>> = {}
const ref = (n: number) => `ENQ-2094-${String(Date.now()).slice(-6)}${n}`

async function blocking(page: Page, scope: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).include(scope).analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.beforeAll(async () => {
  await db.mailbox.deleteMany({ where: { address: SALES } })
  ids.sales = (
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
  const base = { salesMailboxId: ids.sales, salesAddress: SALES }
  seeds.legit = await seedQualify(db, { ...base, tag: `q${stamp}a`, ref: ref(1), variant: 'legit' })
  seeds.suspicious = await seedQualify(db, {
    ...base,
    tag: `q${stamp}b`,
    ref: ref(2),
    variant: 'suspicious',
  })
  seeds.spam = await seedQualify(db, { ...base, tag: `q${stamp}c`, ref: ref(3), variant: 'spam' })
  seeds.reading = await seedQualify(db, {
    ...base,
    tag: `q${stamp}d`,
    ref: ref(4),
    variant: 'reading',
  })
  seeds.regret = await seedQualify(db, {
    ...base,
    tag: `q${stamp}e`,
    ref: ref(5),
    variant: 'legit',
    regretCard: true,
    rfqRef: `IH-RFQ-2094-P${String(Date.now()).slice(-5)}`,
  })
})

test.afterAll(async () => {
  const enquiryIds = Object.values(seeds).map((s) => s.enquiryId)
  // Cards left waiting would crowd other specs' Review queue.
  await db.assistantAction.updateMany({
    where: { enquiryId: { in: enquiryIds }, state: 'later' },
    data: { state: 'proposed' },
  })
  await db.assistantAction.updateMany({
    where: { enquiryId: { in: enquiryIds }, state: 'proposed' },
    data: { state: 'cancelled' },
  })
  await db.outboundEmail.deleteMany({ where: { mailboxId: ids.sales } })
  await db.enquiry.updateMany({
    where: { id: { in: enquiryIds }, closedAt: null },
    data: { closedAt: new Date() },
  })
  await db.mailThread.updateMany({ where: { mailboxId: ids.sales }, data: { enquiryId: null } })
  await db.intakeBatch.deleteMany({ where: { enquiryId: { in: enquiryIds } } })
  await db.mailThread.deleteMany({ where: { mailboxId: ids.sales } })
  await db.mailbox.deleteMany({ where: { address: SALES } })
})

test('board-167: the quick read replaces the line table; choose "Quote what we can" for line 14', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${seeds.legit!.ref}`)
  const read = page.getByRole('region', { name: 'Quick read' })
  await expect(read).toBeVisible({ timeout: 90_000 })
  await expect(page.locator('[data-part="line-table"]')).toHaveCount(0)
  await expect(read).toContainText('Legitimate · Sure')
  await expect(read).toContainText('Fit 13 of 14 · Likely')
  await expect(read.getByRole('region', { name: 'Legitimacy' })).toContainText(
    'registered 2015, matches the company name'
  )
  await expect(read.getByRole('region', { name: 'Fit' })).toContainText('2 proprietary OEM parts')
  await expect(read.getByRole('region', { name: 'Fit' })).toContainText('1 line outside our range')
  await expect(read.getByRole('region', { name: 'Effort and value' })).toContainText(
    'About AED 66,000–88,000 on 11 lines'
  )
  await expect(read.getByRole('link', { name: 'Domain record' })).toHaveAttribute(
    'target',
    '_blank'
  )

  const chooser = page.locator('[data-built="path-chooser"]')
  await expect(chooser.getByText('Suggested · Likely')).toBeVisible()
  await expect(chooser.getByRole('radio', { name: /Quote what we can/ })).toBeChecked()
  await expect(chooser).toContainText('Lines to regret: 14')
  await chooser.getByRole('button', { name: 'Change' }).click()
  await expect(chooser.getByRole('checkbox', { name: 'Line 14' })).toBeChecked()
  await expect(chooser).toContainText(
    'On choose · the Assistant drafts the regret for line 14 to Review'
  )
  // The header's one primary scrolls here.
  await expect(page.getByRole('link', { name: 'Choose path' })).toHaveAttribute(
    'href',
    /#qualification$/
  )
  expect(await blocking(page, '[data-built="enquiry-qualification"]')).toEqual([])

  await chooser.getByRole('button', { name: 'Choose this path' }).click()
  await expect
    .poll(
      async () =>
        (await db.enquiry.findUniqueOrThrow({ where: { id: seeds.legit!.enquiryId } })).stage
    )
    .toBe('sourcing')
  const e = await db.enquiry.findUniqueOrThrow({ where: { id: seeds.legit!.enquiryId } })
  expect(e.chosenPath).toBe('quote_partial')
  // The read is closed as the person's decision, the suggestion taken.
  expect(
    (
      await db.assistantAction.findFirstOrThrow({
        where: { enquiryId: e.id, actionKey: 'qualify_enquiry' },
      })
    ).state
  ).toBe('done')
  await expect(page.locator('[data-part="line-table"]')).toBeVisible({ timeout: 30_000 })
  await expect(page.getByRole('region', { name: 'Quick read' })).toHaveCount(0)
})

test('171b states 1–2: reading, then "Is this a real buyer?" with two paths and Something else', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${seeds.reading!.ref}`)
  const reading = page.getByRole('region', { name: 'Quick read' })
  await expect(reading).toHaveAttribute('aria-busy', 'true', { timeout: 90_000 })
  await expect(reading).toContainText('Reading the sender and the lines · usually under a minute')
  await expect(page.getByText('The paths appear when the read lands.')).toBeVisible()

  await page.goto(`/enquiries/${seeds.suspicious!.ref}`)
  const chooser = page.locator('[data-built="path-chooser"]')
  await expect(chooser.getByText('Is this a real buyer?')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('region', { name: 'Quick read' })).toContainText('Unsure')
  await expect(chooser.getByRole('radio')).toHaveCount(2)
  await expect(chooser.getByRole('radio', { name: /Ask the client first/ })).toBeChecked()
  await chooser.getByRole('button', { name: 'Something else' }).click()
  await expect(chooser.getByRole('radio')).toHaveCount(5)
  await expect(chooser.getByText(/^Suggested/)).toHaveCount(0)
})

test('171b state 3: a sign-in link is Ignore (spam) · Sure; filing it can be undone', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${seeds.spam!.ref}`)
  await expect(page.getByRole('region', { name: 'Quick read' })).toContainText(
    'Ignore (spam) · Sure',
    {
      timeout: 90_000,
    }
  )
  const chooser = page.locator('[data-built="path-chooser"]')
  await expect(chooser.getByRole('radio', { name: /Ignore \(spam\)/ })).toBeChecked()
  await chooser.getByRole('button', { name: 'Choose this path' }).click()
  const toasts = page.locator('[data-part="toast-region"]')
  await expect(toasts.getByRole('button', { name: /Undo/ })).toBeVisible({ timeout: 30_000 })
  await expect
    .poll(
      async () =>
        (await db.enquiry.findUniqueOrThrow({ where: { id: seeds.spam!.enquiryId } })).stage
    )
    .toBe('closed')
  expect(
    (await db.mailMessage.findUniqueOrThrow({ where: { id: seeds.spam!.messageId } }))
      .classification
  ).toBe('not_business')
  const filed = page.getByRole('region', { name: 'Filed as spam' })
  await expect(filed).toContainText('Filed as Not business. No reply, no record.')
  await expect(filed).toContainText('docs-share.example')
  await filed.getByRole('button', { name: 'Undo · treat as enquiry' }).click()
  await expect
    .poll(
      async () =>
        (await db.enquiry.findUniqueOrThrow({ where: { id: seeds.spam!.enquiryId } })).stage
    )
    .toBe('qualifying')
  expect(
    (await db.mailMessage.findUniqueOrThrow({ where: { id: seeds.spam!.messageId } }))
      .classification
  ).toBe('client_enquiry')
})

test('board-168: the regret card; approve and undo; a supplier name is refused; approve sends with the reason', async ({
  page,
  signedInAs,
}) => {
  const id = seeds.regret!.regretActionId!
  const a = await db.assistantAction.findUniqueOrThrow({ where: { id }, select: { ref: true } })
  const state = async () => (await db.assistantAction.findUniqueOrThrow({ where: { id } })).state
  await signedInAs('owner')
  await page.goto(`/review?card=${a.ref}`)
  const card = page.locator(`#proposal-${a.ref}`)
  await expect(card).toBeVisible({ timeout: 90_000 })
  await expect(card).toContainText('Send a regret to Sample Mining Services')
  await expect(card).toContainText('No supplier names, prices or margins in the email')
  await expect(card.getByRole('button', { name: 'Not our range', pressed: true })).toBeVisible()
  await expect(card.getByRole('switch', { name: /glad to quote on/ })).toBeChecked()
  await expect(card.getByText('We would be glad to quote on')).toBeVisible()
  expect(await blocking(page, `#proposal-${a.ref}`)).toEqual([])

  // Approve, then Undo inside the window: the card returns.
  await card.locator('[data-verb="approve"]').click()
  const toasts = page.locator('[data-part="toast-region"]')
  await expect(toasts.getByRole('button', { name: /Undo/ })).toBeVisible({ timeout: 30_000 })
  await expect.poll(state).toBe('queued')
  const out = await db.outboundEmail.findFirstOrThrow({ where: { actionId: id } })
  expect(out).toMatchObject({ kind: 'regret', status: 'scheduled' })
  await toasts.getByRole('button', { name: /Undo/ }).click()
  await expect.poll(state).toBe('undone')
  const back = await db.assistantAction.findFirstOrThrow({
    where: { retryOfId: id },
    select: { id: true, ref: true },
  })

  // An edit that names the supplier is refused with the term.
  await page.goto(`/review?card=${back.ref}&edit=1`)
  const body = page.getByLabel('Body')
  await expect(body).toBeVisible({ timeout: 90_000 })
  await body.fill(`Dear Sample,\n\nExample Gearbox Co q${stamp}e declined the gearbox.`)
  await page.getByRole('button', { name: 'Save and approve' }).click()
  await expect(page.getByText(/The email names a supplier/)).toBeVisible({ timeout: 30_000 })
  expect((await db.assistantAction.findUniqueOrThrow({ where: { id: back.id } })).state).toBe(
    'proposed'
  )

  // The drafted text, another reason chosen, approved: queued with that reason recorded.
  await page.goto(`/review?card=${back.ref}`)
  const again = page.locator(`#proposal-${back.ref}`)
  await expect(again).toBeVisible({ timeout: 90_000 })
  await again.getByRole('button', { name: 'No source found' }).click()
  await expect(again.getByRole('button', { name: 'No source found', pressed: true })).toBeVisible()
  await again.locator('[data-verb="approve"]').click()
  await expect
    .poll(
      async () => (await db.assistantAction.findUniqueOrThrow({ where: { id: back.id } })).state
    )
    .toBe('queued')
  expect(
    (await db.assistantAction.findUniqueOrThrow({ where: { id: back.id } })).chosenOption
  ).toBe('no_source_found')
})

test('171b: the P15 state sheet from the real parts', async ({ page }) => {
  await page.goto('/_kit/p15-states')
  await expect(page.getByRole('region', { name: 'Regret · Autopilot' })).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByRole('region', { name: 'Qualification · reading' })).toContainText(
    'Reading the sender and the lines · usually under a minute'
  )
  await expect(page.getByRole('region', { name: 'Qualification · phishing' })).toContainText(
    'Ignore (spam) · Sure'
  )
  await expect(page.getByRole('region', { name: 'Regret · client replies' })).toContainText(
    'Open ENQ-2026-0446, linked to the regretted 0427.'
  )
  // Do and tell is not offered for a regret.
  const auto = page.getByRole('region', { name: 'Regret · Autopilot' })
  await expect(auto.getByRole('radio', { name: 'Do and tell' })).toBeDisabled()
  await expect(auto.getByRole('radio', { name: 'Draft and ask' })).toBeChecked()
  expect(await blocking(page, 'main')).toEqual([])
})
