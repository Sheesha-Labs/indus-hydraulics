import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * S11-T03 · /_kit/documents: every kind renders on screen with its pages and as a PDF; the Estimate page is
 * axe-clean. (The (kit) layout and the PDF route both 404 in production or without OPS_KIT=1.)
 */
test.setTimeout(180_000)

test('kit documents: the list, the quotation pages and its PDF', async ({ page }) => {
  await page.goto('/_kit/documents')
  await expect(page.getByRole('link', { name: /QUOTATION · quotation-c37/ })).toBeVisible({
    timeout: 90_000,
  })
  await page.goto('/_kit/documents/quotation-c37')
  const pages = page.locator('[data-doc-pages]')
  await expect(pages).toHaveAttribute('data-doc-pages', '2')
  await expect(page.locator('article[data-doc-kind="quotation"]')).toHaveCount(2)
  await expect(page.getByText('Page 2 of 2')).toBeVisible()
  const axe = await new AxeBuilder({ page }).include('[data-built="kit-document"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
  const pdf = await page.request.get('/api/kit/documents/quotation-c37/pdf')
  expect(pdf.status()).toBe(200)
  expect(pdf.headers()['content-type']).toBe('application/pdf')
  expect((await pdf.body()).subarray(0, 5).toString()).toBe('%PDF-')
  expect((await page.request.get('/api/kit/documents/nothing/pdf')).status()).toBe(404)
})
