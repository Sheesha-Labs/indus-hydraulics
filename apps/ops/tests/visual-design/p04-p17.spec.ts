import { DEMO_EMAILS, expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'
import { opsDb as db } from '@indus/ops-db'

/**
 * P04 Autopilot and P17 Today design parity (S07, local only): full frames at 1440 × 940 against the board PNGs,
 * on the local database (neutral fixtures). Each LIMIT holds the measured value rounded up, with the reason
 * it is not lower; the deliberate copy deviations are listed in the note.
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
    0.2,
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
    0.2,
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
    0.2,
    'Real rows and local counts; adds the RFQ threshold and research cap rows the board leaves to other screens; Last triggered from local guardrail_trigger rows.'
  )
})
