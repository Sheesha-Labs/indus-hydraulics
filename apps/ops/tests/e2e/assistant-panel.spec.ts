import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import type { Page } from '@playwright/test'
import { DEMO_EMAILS, expect, test } from '../signed-in'

/**
 * S06-T08 · assistant-panel: on the demo enquiry ENQ-2026-0001, the docked panel lists this record's items;
 * an instruction is sent (⌘↵) and shows "Drafting a proposal…" while the record stays unchanged; its card
 * (written here as the runner would) waits under Waiting on you and in Review; approving it holds the line;
 * Undo puts it back. Escape closes the panel and returns focus. The Inngest stub accepts the event; nothing
 * runs a model.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const REF = 'ENQ-2026-0001'
const stamp = Date.now().toString(36).toUpperCase()
const ids: Record<string, string> = {}

/** Opens the panel from the record's Assistant control (the ASSISTANT tag on the record's strip). */
async function openPanel(page: Page) {
  await page.getByRole('button', { name: 'Assistant panel' }).click()
  const panel = page.getByRole('complementary', { name: `On ${REF}` })
  await expect(panel).toBeVisible()
  return panel
}

const lineStatus = async () =>
  (await db.enquiryLine.findFirstOrThrow({ where: { enquiryId: ids.enquiry!, no: 4 } })).status

test.beforeAll(async () => {
  const e = await db.enquiry.upsert({
    where: { ref: REF },
    create: {
      ref: REF,
      title: 'Plant turnaround spares',
      receivedVia: 'email',
      receivedAt: new Date(Date.now() - 10 * 86_400_000),
    },
    update: {},
    select: { id: true },
  })
  ids.enquiry = e.id
  for (const [no, description] of [
    [1, 'Deep groove ball bearing'],
    [4, 'Limit switch, roller lever'],
  ] as const) {
    const l = await db.enquiryLine.findFirst({ where: { enquiryId: e.id, no } })
    if (!l) await db.enquiryLine.create({ data: { enquiryId: e.id, no, description, qty: 1 } })
    else
      await db.enquiryLine.update({
        where: { id: l.id },
        data: { status: 'open', heldReason: null },
      })
  }
})

test.afterAll(async () => {
  await db.assistantAction.updateMany({
    where: { ref: { startsWith: `A-E2E-S06P-` }, state: { in: ['proposed', 'later'] } },
    data: { state: 'cancelled' },
  })
})

test('assistant-panel: instruction becomes proposal; approve changes the record; undo restores', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${REF}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 90_000 })
  const panel = await openPanel(page)
  const ask = panel.getByRole('textbox', { name: 'Ask or instruct the Assistant' })
  await expect(ask).toBeFocused()
  await expect(panel.getByRole('heading', { name: 'Waiting on you' })).toBeVisible({
    timeout: 20_000,
  })

  // Axe reads colours as painted: wait until the panel's open animation has finished.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running')
  )
  const { violations } = await new AxeBuilder({ page })
    .include('[data-part="drawer"], aside')
    .analyze()
  expect(
    violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => v.id)
  ).toEqual([])

  await ask.fill('hold line 4 until the client confirms the trim')
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(panel.locator('[data-part="drafting"]')).toHaveText('Drafting a proposal…')
  await expect(ask).toHaveValue('')
  expect(await lineStatus()).toBe('open')

  // The runner's card (no model runs here): an instruction proposal on this enquiry.
  ids.ref = `A-E2E-S06P-${stamp}`
  await db.assistantAction.create({
    data: {
      ref: ids.ref,
      actionKey: 'instruction',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      enquiryId: ids.enquiry,
      subjectType: 'enquiry',
      subjectId: ids.enquiry!,
      headline: 'Hold line 4 until the client confirms the trim',
      reasons: [{ text: `You wrote on ${REF}: “hold line 4 until the client confirms the trim”` }],
      checks: [{ label: 'Checked against the record', status: 'pass' }],
      confidence: 'likely',
      onApproveText: 'Sets line 4 to Held: until the client confirms the trim',
      output: {
        params: {
          intent: 'hold_line',
          lineNo: 4,
          until: 'answer',
          note: 'until the client confirms the trim',
        },
        reasons: [],
        text: 'hold line 4 until the client confirms the trim',
        targetLabel: null,
        requestedById: null,
      },
      inputs: {
        request: {
          actionKey: 'instruction',
          subjectType: 'enquiry',
          subjectId: ids.enquiry,
          enquiryId: ids.enquiry,
          trigger: 'panel',
          origin: 'live',
          sourceVersion: `instruction:${stamp}`,
        },
      },
      state: 'proposed',
      surface: 'review',
    },
  })

  // Escape closes the docked panel; reopening reads it again and shows the card.
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  const again = await openPanel(page)
  // Earlier today may list an earlier run's undone card with the same words: look under Waiting on you.
  const row = again
    .getByRole('region', { name: 'Waiting on you' })
    .getByText('Hold line 4 until the client confirms the trim')
  await expect(row).toBeVisible({ timeout: 20_000 })
  await expect(again.locator('[data-part="drafting"]')).toHaveCount(0)
  expect(await lineStatus()).toBe('open')

  await again
    .getByRole('region', { name: 'Waiting on you' })
    .locator('[data-part="needs-row"], li, div', {
      hasText: 'Hold line 4 until the client confirms the trim',
    })
    .getByRole('link', { name: 'Decide' })
    .first()
    .click()
  await expect(page).toHaveURL(new RegExp(`/review\\?card=${ids.ref}`))
  const card = page.locator(`#proposal-${ids.ref}`)
  await expect(card).toBeVisible({ timeout: 60_000 })
  await card.locator('[data-verb="approve"]').click()
  await expect.poll(lineStatus).toBe('held')

  const toasts = page.locator('[data-part="toast-region"]')
  await toasts.getByRole('button', { name: /^Undo/ }).click()
  await expect.poll(lineStatus).toBe('open')
})

test('assistant-panel: the record’s Assistant control opens it; Escape returns focus there; ⌘K too', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries/${REF}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 90_000 })
  const control = page.getByRole('button', { name: 'Assistant panel' })
  await expect(control).toHaveAttribute('aria-expanded', 'false')
  const panel = await openPanel(page)
  await expect(control).toHaveAttribute('aria-expanded', 'true')
  await expect(panel.getByRole('textbox', { name: 'Ask or instruct the Assistant' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(control).toBeFocused()

  // The command bar opens the same panel.
  await page
    .locator('[data-part="sidebar"]')
    .getByRole('button', { name: /^Search/ })
    .click()
  await expect(
    page.getByRole('dialog', { name: 'Command bar' }).getByRole('combobox')
  ).toBeFocused()
  await page.keyboard.type('assistant panel')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('complementary', { name: `On ${REF}` })).toBeVisible()
})

test('assistant-panel: paused, the box is off with the reason', async ({ page, signedInAs }) => {
  const owner = await db.user.findUniqueOrThrow({
    where: { email: DEMO_EMAILS.owner },
    select: { id: true },
  })
  await db.assistantState.update({
    where: { id: 1 },
    data: { pausedAt: new Date(), pausedById: owner.id },
  })
  try {
    await signedInAs('owner')
    await page.goto(`/enquiries/${REF}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 90_000 })
    // The server caches the pause state for 15 s: wait it out, then open the panel.
    await page.waitForTimeout(16_000)
    await page.reload()
    const panel = await openPanel(page)
    await expect(
      panel.getByText(/Assistant paused by you at \d{2}:\d{2}\. Instructions wait/)
    ).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      panel.getByRole('textbox', { name: 'Ask or instruct the Assistant' })
    ).toBeDisabled()
  } finally {
    await db.assistantState.update({ where: { id: 1 }, data: { pausedAt: null, pausedById: null } })
  }
})
