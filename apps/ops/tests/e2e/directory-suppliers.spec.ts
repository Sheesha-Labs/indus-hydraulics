import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import {
  archiveSuppliers,
  seedSuppliers,
  type SuppliersSeed,
} from '../../src/server/directory/testing/suppliers-seed'
import { expect, test } from '../signed-in'

/**
 * S10-T03 · suppliers. Board 128: the category filter (through sub-trades), the tier counts, a search by name, the
 * preview pane, a saved view. Board 129: header and tabs, the rail (tier, contacts with the bouncing one, the
 * expiring certificate), the reliability paragraph, and sections as real segments.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2esp${Date.now()}`
let seed: SuppliersSeed

test.beforeAll(async () => {
  seed = await seedSuppliers(db, tag)
})
test.afterAll(async () => {
  await archiveSuppliers(db, seed)
  await db.savedSearch.deleteMany({ where: { name: `Bearings ${tag}` } })
})

const axeClean = async (page: import('@playwright/test').Page, scope: string) => {
  const axe = await new AxeBuilder({ page }).include(scope).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
}

test('board-128: filter, search, preview and a saved view', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/suppliers?trade=${seed.parityTradeId}`)
  await expect(page.locator('[data-built="suppliers"]')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('heading', { level: 1, name: 'Suppliers · 14' })).toBeVisible()
  await expect(page.getByText('Blocked 1')).toBeVisible()
  await axeClean(page, '[data-built="suppliers"]')

  await page.getByRole('searchbox', { name: /Search suppliers/ }).fill('Sample Bearings')
  await page.getByRole('searchbox', { name: /Search suppliers/ }).press('Enter')
  await expect(page.getByRole('table', { name: 'Suppliers' }).getByRole('row')).toHaveCount(2)

  await page.getByRole('link', { name: 'Sample Bearings LLC' }).click()
  const preview = page.locator('[data-part="supplier-preview"]')
  await expect(preview).toContainText('Sample Bearings LLC')
  await expect(preview).toContainText('Ball bearings')

  await page.getByRole('button', { name: 'Save view' }).click()
  await page
    .getByRole('dialog', { name: 'Save this view' })
    .getByLabel('Name')
    .fill(`Bearings ${tag}`)
  await page
    .getByRole('dialog', { name: 'Save this view' })
    .getByRole('button', { name: 'Save view' })
    .click()
  await expect(
    page
      .getByRole('navigation', { name: 'Saved views' })
      .getByRole('link', { name: `Bearings ${tag}` })
  ).toBeVisible()
})

test('board-129: header, rail, reliability and sections', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/suppliers/${seed.profileId}`)
  await expect(page.locator('[data-built="supplier-overview"]')).toBeVisible({ timeout: 90_000 })
  await expect(
    page.getByRole('heading', { level: 1, name: 'Sample Instruments Ltd' })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send RFQ' })).toBeDisabled()
  await expect(page.locator('[data-part="reliability"]')).toContainText('From 29 RFQs')
  await expect(page.getByRole('region', { name: 'Contacts' })).toContainText(
    'Bouncing · removed from RFQs'
  )
  await expect(page.getByRole('region', { name: 'Documents' })).toContainText('17 days')
  await expect(page.getByRole('region', { name: 'Authorised for' })).toContainText(
    'claims authorisation'
  )
  await axeClean(page, '[data-built="supplier-profile"]')

  const tabs = page.getByRole('navigation', { name: 'Supplier sections' })
  await tabs.getByRole('link', { name: 'Contacts', exact: true }).click()
  await page.waitForURL(/\/contacts$/)
  await expect(page.locator('[data-built="supplier-contacts"]')).toBeVisible()
  await tabs.getByRole('link', { name: 'Orders' }).click()
  await expect(page.getByText('No purchase orders yet')).toBeVisible()
})

test('board-133: the Helper sees no bank number, and a new supplier without history has no paragraph', async ({
  page,
  signedInAs,
}) => {
  await db.supplierBankAccount.create({
    data: {
      supplierId: seed.profileId,
      bankName: 'TEST BANK',
      accountName: 'x',
      ibanEnc: Buffer.from('x'),
      ibanLast4: '5432',
      status: 'verified',
    },
  })
  await signedInAs('helper')
  await page.goto(`/suppliers/${seed.profileId}`)
  await expect(page.locator('[data-built="supplier-overview"]')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('region', { name: 'Bank' })).toContainText('Verified')
  await expect(page.getByRole('region', { name: 'Bank' })).not.toContainText('5432')
  await page.goto(`/suppliers/${seed.supplierIds[10]}`)
  await expect(page.locator('[data-state="no-history"]')).toContainText('Not enough history')
  await db.supplierBankAccount.deleteMany({ where: { supplierId: seed.profileId } })
})
