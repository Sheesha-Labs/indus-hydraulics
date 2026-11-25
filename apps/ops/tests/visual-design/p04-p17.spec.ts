import { DEMO_EMAILS, expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'
import { opsDb as db } from '@indus/ops-db'

/**
 * P04 Autopilot and P17 Today design parity (S07, local only): full frames at 1440 × 940 against the board PNGs,
 * on the local database (neutral fixtures). Each LIMIT holds the measured value rounded up, with the reason
 * it is not lower (the screens show the local database's real rows where the boards show filled examples, so 2%
 * is unreachable); the deliberate copy deviations are listed in the note.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

test.beforeAll(async () => {
  await db.user.findFirstOrThrow({ where: { email: DEMO_EMAILS.owner }, select: { id: true } })
})

async function frame(
  page: import('@playwright/test').Page,
  board: string,
  limit: number,
  note: string,
  group: 'P04 boards' | 'P17 boards' = 'P04 boards'
) {
  await settle(page)
  await page.waitForLoadState('networkidle')
  const file = board.replace(/ .*/, '')
  const { ratio, size } = await compareToBoardPng(page, `${file}.png`, {
    name: `board-${board.replace(/\s+/g, '-')}`,
  })
  recordParity({ board: `${board} screen`, group, ratio, area: `full frame ${size}`, limit, note })
  console.log(`board-${board}: ${ratio.toFixed(4)}`)
  expect(ratio).toBeLessThanOrEqual(limit)
}

test('board-98 parity: Autopilot', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/assistant/autopilot')
  await expect(page.getByRole('heading', { name: 'Autopilot', level: 1 })).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '98',
    0.1,
    'Real catalogue rows and this week’s local counts; the KPI numerals are Geist (Q6), not the board’s serif; #4 reads "Website form and call-back too" (no WhatsApp, open item 4).'
  )
})

test('board-99 parity: one action (Chase suppliers)', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/assistant/autopilot?action=chase_suppliers')
  await expect(page.getByRole('dialog', { name: 'Chase suppliers' })).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '99',
    0.11,
    'Drawer over the live board 98; no earned suggestion on the local database.'
  )
})

test('board-100 parity: Guardrails', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/assistant/guardrails')
  await expect(page.getByRole('heading', { name: 'Guardrails', level: 1 })).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '100',
    0.07,
    'Real rows and local counts; adds the RFQ threshold and research cap rows the board leaves to other screens; Last triggered from local guardrail_trigger rows.'
  )
})

test('board-101 parity: Cost & limits', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/assistant/cost')
  await expect(page.getByRole('heading', { name: 'Cost & limits', level: 1 })).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '101',
    0.1,
    'Local month’s real ai_call totals (the board’s example banner shows only once the budget is reached); the month figure is Geist (Q6); research cap USD 5 (C14) where the board shows 2.'
  )
})

test('board-102 parity: Autopilot states sheet', async ({ page }) => {
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/_kit/autopilot-states')
  await expect(page.getByText('Let the Assistant chase suppliers without asking?')).toBeVisible({
    timeout: 90_000,
  })
  await frame(
    page,
    '102',
    0.08,
    'Neutral fixtures; the disconnected banner carries the S04 wording plus "purchase@ still runs"; the Helper line names the Owner setting as the board does.'
  )
})

test('board-115 parity: What the Assistant has learned', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/assistant/learned')
  await expect(
    page.getByRole('heading', { name: 'What the Assistant has learned', level: 1 })
  ).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '115',
    0.05,
    'Preferences on the local database (whatever earlier runs learned); each row adds the on/off switch the board leaves out; the header action is the primary.'
  )
})

test('board-178 parity: Today (Owner)', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/today')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '178',
    0.06,
    'Real local queue and mail; quotations, money and enquiries arrive with later sprints (the board shows them filled); the board’s "Views" card is a design note, not drawn.',
    'P17 boards'
  )
})

test('board-178-helper parity: Today (Helper)', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/today')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '178 helper',
    0.07,
    'Helper variant against the Owner board (the handoff draws one board 178).',
    'P17 boards'
  )
})

test('board-182 parity: Today states sheet', async ({ page }) => {
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/_kit/today-states')
  await expect(page.getByText('Shown once, above Needs you.')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '182',
    0.05,
    'Neutral fixtures for the names and figures; the setup card is the S03 FinishSetupBanner.',
    'P17 boards'
  )
})
