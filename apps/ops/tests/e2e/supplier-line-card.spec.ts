import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S10-T06 · board 52. A supplier approved on trial: add two categories (one authorised with its locator), save the
 * line card (version 1), save the terms, Activate: the profile opens and its line cards are Trial.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2elc${Date.now()}`
let supplierId = ''

test.beforeAll(async () => {
  supplierId = (
    await db.company.create({
      data: {
        name: `Example Hose Co ${tag}`,
        isSupplier: true,
        country: 'TR',
        supplierProfile: {
          create: { onboardingStatus: 'approved_trial', tier: 'trial', proposedAt: new Date() },
        },
      },
      select: { id: true },
    })
  ).id
})
test.afterAll(async () => {
  await db.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
})

test('board-52: line card, terms and activation', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/suppliers/new/${supplierId}/line-card`)
  await expect(page.locator('[data-built="supplier-line-card"]')).toBeVisible({ timeout: 90_000 })
  const add = page.getByRole('combobox', { name: 'Add a category' })
  await add.selectOption({ label: 'Hydraulics · Hydraulic hose' })
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await add.selectOption({ label: 'Hydraulics · Quick couplings' })
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await page
    .getByRole('textbox', { name: 'Hydraulic hose spec note' })
    .fill('EN 853 1SN/2SN, EN 856 4SP/4SH')
  await page.getByRole('button', { name: 'Hydraulic hose details' }).click()
  await page.getByRole('checkbox', { name: 'Hydraulic hose authorised' }).check()
  await page
    .getByRole('textbox', { name: 'Hydraulic hose evidence link' })
    .fill('https://maker.example/locator')
  await page.getByRole('button', { name: 'Save line card' }).click()
  await expect(page.getByText('Line card version 1')).toBeVisible()
  await expect(page.locator('[data-trade="Hydraulic hose"]')).toContainText('Trial')

  await page.getByRole('combobox', { name: 'Incoterm', exact: true }).selectOption('FCA')
  await page.getByRole('textbox', { name: 'Incoterm place' }).fill('Istanbul')
  await page.getByRole('textbox', { name: 'Payment' }).fill('30% advance, 70% before shipment')
  await page.getByRole('button', { name: 'Save terms' }).click()
  await expect
    .poll(
      async () =>
        (await db.supplierProfile.findUniqueOrThrow({ where: { companyId: supplierId } }))
          .usualIncotermPlace
    )
    .toBe('Istanbul')
  const axe = await new AxeBuilder({ page }).include('[data-built="supplier-line-card"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  await page.getByRole('button', { name: 'Activate supplier' }).click()
  await page.waitForURL(new RegExp(`/suppliers/${supplierId}$`))
  await expect(
    page.getByRole('heading', { level: 1, name: `Example Hose Co ${tag}` })
  ).toBeVisible()
  const cards = await db.supplierLineCard.findMany({ where: { supplierId } })
  expect(cards.map((c) => c.status).sort()).toEqual(['trial', 'trial'])
})
