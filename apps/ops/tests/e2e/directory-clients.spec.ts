import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import {
  archiveClients,
  seedClients,
  type ClientsSeed,
} from '../../src/server/directory/testing/clients-seed'
import { expect, test } from '../signed-in'

/**
 * S10-T02 · clients. Board 11: the KPI row and ranked rows from the view, "New client" creates a client and opens
 * its profile. Board 12: the header figures, a contact added, the acknowledgement toggle saved (the same flag the
 * acknowledgement email reads), and the credit section is the Owner's: read-only for the Helper.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2ecl${Date.now()}`
let seed: ClientsSeed
const created: string[] = []

test.beforeAll(async () => {
  await db.$executeRaw`UPDATE ops.company c SET "archivedAt" = now() FROM ops.client_profile p
    WHERE p."companyId" = c.id AND p."quotingCurrency" = 'BHD' AND c."archivedAt" IS NULL`
  seed = await seedClients(db, tag)
})

test.afterAll(async () => {
  await archiveClients(db, seed)
  await db.company.updateMany({ where: { id: { in: created } }, data: { archivedAt: new Date() } })
})

const axeClean = async (page: import('@playwright/test').Page, scope: string) => {
  const axe = await new AxeBuilder({ page }).include(scope).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
}

test('board-11: KPIs, ranked rows and a new client', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/clients?ccy=BHD')
  await expect(page.locator('[data-built="clients"]')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByText('Active clients')).toBeVisible()
  const rows = page.getByRole('table', { name: 'Clients' }).getByRole('row')
  await expect(rows).toHaveCount(7)
  await expect(rows.nth(1)).toContainText('Sample Petrochem Services')
  await axeClean(page, '[data-built="clients"]')

  await page.getByRole('button', { name: 'New client' }).click()
  const dialog = page.getByRole('dialog', { name: 'New client' })
  await dialog.getByLabel('Company name').fill(`Sample Client LLC ${tag}`)
  await dialog.getByLabel('Country (two letters)').fill('ae')
  await dialog.getByRole('button', { name: 'Add client' }).click()
  await page.waitForURL(/\/clients\/[0-9a-f-]{36}$/)
  await expect(
    page.getByRole('heading', { level: 1, name: `Sample Client LLC ${tag}` })
  ).toBeVisible()
  const c = await db.company.findFirstOrThrow({
    where: { name: `Sample Client LLC ${tag}` },
    select: { id: true, country: true, clientProfile: { select: { companyId: true } } },
  })
  created.push(c.id)
  expect(c.country).toBe('AE')
  expect(c.clientProfile).not.toBeNull()
})

test('board-12: figures, add a contact, acknowledgement toggle', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  const id = seed.clientIds[0]!
  await page.goto(`/clients/${id}`)
  await expect(page.locator('[data-built="client-profile"]')).toBeVisible({ timeout: 90_000 })
  const figures = page
    .getByRole('list', { name: 'Figures' })
    .or(page.locator('dl[aria-label="Figures"]'))
  await expect(figures).toContainText('Avg margin won')
  await expect(page.getByRole('region', { name: /Enquiries/ })).toContainText('Lost · price')
  await axeClean(page, '[data-built="client-profile"]')

  const contacts = page.getByRole('region', { name: 'Contacts' })
  await contacts.getByRole('button', { name: 'Edit' }).click()
  await contacts.getByLabel('Name').fill('Nadia Example')
  await contacts.getByLabel('Email').fill(`nadia.${tag}@sample-petrochem.example`)
  await contacts.getByRole('button', { name: 'Save contact' }).click()
  await expect(contacts).toContainText('Nadia Example')

  await page.getByRole('switch', { name: 'Acknowledge new enquiries' }).click()
  await expect
    .poll(
      async () =>
        (await db.clientProfile.findUniqueOrThrow({ where: { companyId: id } }))
          .acknowledgeEnquiries
    )
    .toBe(false)
})

test('board-12: the credit section is read-only for the Helper', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto(`/clients/${seed.clientIds[1]}`)
  await expect(page.locator('[data-built="client-profile"]')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('switch', { name: 'Credit hold' })).toBeDisabled()
  await expect(page.getByText('Only Krishan changes a credit hold.')).toBeVisible()
  await expect(page.locator('dl[aria-label="Figures"]')).not.toContainText('Avg margin won')
})
