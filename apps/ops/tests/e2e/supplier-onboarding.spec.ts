import AxeBuilder from '@axe-core/playwright'
import { createHmac } from 'node:crypto'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S10-T04 · board 50 and the upload portal. The wizard: company step with the Sales contact → documents step; one
 * document marked received; the document request opened (the link is derived from the request id with the same
 * HMAC the server uses). The /u page at 390 × 844: upload a PDF, the row turns Received, axe at 390 and 1440, the
 * expired state.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2eob${Date.now()}`
let supplierId = ''
let requestId = ''
const PDF = Buffer.from('%PDF-1.7\n%âãÏÓ\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n')

function tokenFor(id: string): string {
  const key = process.env.OPS_AUTH_SECRET
  if (!key) throw new Error('OPS_AUTH_SECRET is needed to derive the link in this test')
  return createHmac('sha256', key).update(`supplier-docs:${id}`).digest('base64url')
}

test.afterAll(async () => {
  if (supplierId)
    await db.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
})

const axeClean = async (page: import('@playwright/test').Page, scope: string) => {
  const axe = await new AxeBuilder({ page }).include(scope).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
}

test('board-50: company step, documents, and the request', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/suppliers/new')
  await expect(page.locator('[data-part="company-step"]')).toBeVisible({ timeout: 90_000 })
  await page.getByLabel('Legal name').fill(`Example Hidrolik ${tag}`)
  await page.getByLabel('Country (two letters)').fill('TR')
  await page.getByLabel('Registry no.').fill('482117')
  await page.getByLabel('Quote currencies').fill('EUR, USD')
  await page.getByLabel('Sales name').fill('Pat Example')
  await page.getByLabel('Sales email').fill(`sales.${tag}@example.test`)
  await page.getByRole('button', { name: 'Continue to documents' }).click()
  await page.waitForURL(/\/suppliers\/new\/[0-9a-f-]{36}\/documents$/)
  supplierId = page.url().split('/').at(-2)!
  await expect(page.locator('[data-part="documents-step"]')).toContainText('0 of 8 documents in')
  await axeClean(page, '[data-built="supplier-wizard-documents"]')

  const row = page.locator('[data-doc="trade_licence"]')
  await row.getByRole('button', { name: 'Update Trade registry / licence' }).click()
  await row.getByLabel('Number').fill('482117')
  await row
    .locator('input[type="file"]')
    .setInputFiles({ name: 'licence.pdf', mimeType: 'application/pdf', buffer: PDF })
  await row.getByRole('button', { name: 'Save' }).click()
  await expect(page.locator('[data-part="documents-step"]')).toContainText('1 of 8 documents in')

  await page.getByRole('button', { name: /^Ask for 7 documents$/ }).click()
  await expect(page.getByRole('region', { name: 'Document request' })).toContainText(
    'Waiting for approval in Review'
  )
  const r = await db.supplierDocumentRequest.findFirstOrThrow({
    where: { supplierId, status: 'open' },
  })
  requestId = r.id
  expect(r.requestedKinds).toHaveLength(7)
  expect(
    await db.supplierProfile.count({ where: { companyId: supplierId, onboardingStatus: 'draft' } })
  ).toBe(1)
})

test('upload-portal: a supplier uploads on a phone', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await ctx.newPage()
  const token = tokenFor(requestId)
  const res = await page.goto(`/u/${token}`)
  expect(res?.headers()['x-robots-tag']).toContain('noindex')
  expect(res?.headers()['referrer-policy']).toBe('no-referrer')
  // The proxy sets private, no-store (security-headers.test.ts); next dev rewrites it to no-cache, production to
  // private, no-cache, no-store. Never cacheable either way.
  expect(res?.headers()['cache-control']).toMatch(/no-store|no-cache/)
  await expect(page.getByRole('heading', { level: 1, name: 'Upload your documents' })).toBeVisible({
    timeout: 90_000,
  })
  await axeClean(page, 'body')
  const row = page.locator('[data-kind="company_profile"]')
  await row
    .locator('input[type="file"]')
    .setInputFiles({ name: 'profile.pdf', mimeType: 'application/pdf', buffer: PDF })
  await row.getByRole('button', { name: /^Upload / }).click()
  await expect(row.getByRole('status')).toHaveText('Received')
  await page.setViewportSize({ width: 1440, height: 940 })
  await axeClean(page, 'body')
  const doc = await db.complianceDocument.findFirstOrThrow({
    where: { companyId: supplierId, kind: 'company_profile' },
  })
  expect(doc.status).toBe('received')

  await db.supplierDocumentRequest.update({
    where: { id: requestId },
    data: { expiresAt: new Date(Date.now() - 1000) },
  })
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'This link has expired' })).toBeVisible()
  await expect(page.getByText('Documents already uploaded are safe')).toBeVisible()
  await ctx.close()
})
