import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S07-T03 · board-100. The Owner sees both sections, the fixed rules (not controls), counts per row and the
 * holiday editor; a saved margin floor is signed off and audited. The Helper reads only.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

let saved: unknown = null
test.beforeAll(async () => {
  saved = (await db.guardrail.findUniqueOrThrow({ where: { key: 'margin_floor' } })).params
})
test.afterAll(async () => {
  await db.guardrail.update({
    where: { key: 'margin_floor' },
    data: {
      params: saved as never,
      signoffStatus: 'awaiting',
      signedOffById: null,
      signedOffAt: null,
    },
  })
})

test('board-100: guardrails, fixed rules and the holiday editor', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/assistant/guardrails')
  await expect(page.getByRole('heading', { name: 'Guardrails', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Value and counterparty' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Time and volume' })).toBeVisible()
  const fixed = page.locator('[data-guardrail="fixed_no_money"]')
  await expect(fixed).toContainText('The Assistant never moves money')
  await expect(fixed).toContainText('Fixed')
  await expect(fixed.getByRole('textbox')).toHaveCount(0)
  await expect(page.locator('[data-guardrail="first_contact"]')).toContainText('this month')
  await expect(page.getByRole('heading', { name: 'How guardrails work' })).toBeVisible()
  await page.getByRole('button', { name: 'Holiday calendar: UAE, edit' }).click()
  await expect(page.getByRole('dialog', { name: 'Holiday calendar · UAE' })).toBeVisible()
  await page.keyboard.press('Escape')

  const floor = page.getByRole('textbox', { name: 'Below the margin floor asks' })
  await floor.fill('13')
  await floor.press('Enter')
  await expect(page.getByText('Below the margin floor asks: saved')).toBeVisible()
  const row = await db.guardrail.findUniqueOrThrow({ where: { key: 'margin_floor' } })
  expect((row.params as { floorPct: number }).floorPct).toBe(13)
  expect(row.signoffStatus).toBe('signed_off')
  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('board-100: the Helper reads only', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/assistant/guardrails')
  await expect(page.getByRole('textbox', { name: 'Below the margin floor asks' })).toBeDisabled()
  await expect(page.getByRole('switch', { name: 'First email to anyone new asks' })).toBeDisabled()
})
