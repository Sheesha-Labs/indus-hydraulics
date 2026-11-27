import AxeBuilder from '@axe-core/playwright'
import { ibanWithCheckDigits } from '@indus/ops-core'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S10-T05 · board 51. The Helper records the screening checklist and the bank details (the IBAN is never shown
 * again, only its last 4) and recommends; the Owner records the call-back to the registry number and approves on
 * trial: the supplier shows Trial and its onboarding is approved on trial.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2evt${Date.now()}`
let supplierId = ''
const IBAN = ibanWithCheckDigits('DE', '370400440532013000')

test.beforeAll(async () => {
  const c = await db.company.create({
    data: {
      name: `Example Hidrolik ${tag}`,
      isSupplier: true,
      country: 'TR',
      supplierProfile: {
        create: {
          onboardingStatus: 'draft',
          type: 'manufacturer',
          registryPhone: '+90 212 000 4400',
          proposedAt: new Date(),
        },
      },
    },
    select: { id: true },
  })
  supplierId = c.id
  for (const kind of [
    'trade_licence',
    'vat_certificate',
    'iso_certificate',
    'bank_letter',
    'company_profile',
    'nda',
  ])
    await db.complianceDocument.create({
      data: { companyId: supplierId, kind: kind as never, title: kind, status: 'received' },
    })
})
test.afterAll(async () => {
  await db.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
})

test('board-51: the Helper screens, enters the bank and recommends', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('helper')
  await page.goto(`/suppliers/new/${supplierId}/vetting`)
  await expect(page.locator('[data-built="supplier-vetting"]')).toBeVisible({ timeout: 90_000 })
  await page.getByRole('button', { name: 'Record screening' }).click()
  for (const row of await page.locator('[data-list]').all()) {
    await row.getByRole('combobox', { name: /result/ }).selectOption('clear')
    await row
      .getByRole('textbox', { name: /evidence link/ })
      .fill('https://example.test/search-result')
  }
  await page.getByRole('button', { name: 'Save screening' }).click()
  await expect(page.locator('[data-list="un"]')).toContainText('Clear')

  const bank = page.locator('[data-part="bank-verification"]')
  await bank
    .getByRole('textbox', { name: 'Account name', exact: true })
    .fill(`Example Hidrolik ${tag}`)
  await bank.getByRole('textbox', { name: 'Bank', exact: true }).fill('TEST BANK')
  await bank.getByRole('textbox', { name: 'IBAN', exact: true }).fill(IBAN)
  await bank.getByRole('textbox', { name: 'Currency', exact: true }).fill('EUR')
  await bank.getByRole('button', { name: 'Save bank details' }).click()
  await expect(bank).toContainText(`•••• ${IBAN.slice(-4)}`)
  await expect(page.locator('body')).not.toContainText(IBAN)
  await expect(bank).toContainText('Waiting for Krishan')
  await page.getByRole('button', { name: 'Recommend for approval' }).click()
  await expect(page.getByRole('button', { name: 'Waiting for Krishan' })).toBeDisabled()
  const axe = await new AxeBuilder({ page }).include('[data-built="supplier-vetting"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('board-51: the Owner records the call-back and approves on trial', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/suppliers/new/${supplierId}/approve`)
  await expect(page.locator('[data-built="supplier-vetting"]')).toBeVisible({ timeout: 90_000 })
  const form = page.locator('[data-part="callback-form"]')
  await form.getByLabel('Number source').selectOption('registry')
  await form.getByLabel('Number dialled').fill('+90 212 000 4400')
  await form.getByLabel('Spoke to').fill('Selin Example')
  await form.getByLabel('Their role').fill('Accounts')
  await form.getByRole('button', { name: 'Save call-back' }).click()
  await expect(page.locator('[data-state="callback-verified"]')).toContainText(
    'not a number from the email'
  )
  await expect(page.locator('[data-state="callback-verified"]')).toContainText('cooling-off')

  await page.getByRole('radio', { name: /Approve on trial/ }).check()
  await expect(page.locator('[data-part="blocking-note"]')).toContainText(
    'first PO blocked until code of conduct and ownership declaration are in'
  )
  await page
    .locator('[data-part="decision"]')
    .getByRole('button', { name: 'Approve on trial' })
    .click()
  await expect(page.locator('[data-part="decided"]')).toContainText('Approved · trial')
  const p = await db.supplierProfile.findUniqueOrThrow({ where: { companyId: supplierId } })
  expect(p).toMatchObject({ tier: 'trial', onboardingStatus: 'approved_trial', trialPoLimit: 3 })
})
