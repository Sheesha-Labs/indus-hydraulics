import { expect, test } from '@playwright/test'

// Storefront smoke. Each test loads a key route and asserts a recognisable
// signal that the page rendered (HTTP status + a structural marker). They
// double as: (a) a structural guarantee for the post-i18n flatten, and
// (b) a regression net for the trust-gap + search fixes shipped 2026-05-04
// (PRs #34, #36, #38).
//
// Runs against PLAYWRIGHT_BASE_URL — set to a Vercel deployment URL in CI,
// defaults to http://localhost:3000 for local dev.

test.describe('storefront smoke', () => {
  test('home page loads at /', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1').first()).toContainText(/hydraulic|engineers|downtime|pump/i)
  })

  test('/api/health returns ok with a reachable database', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    const body = (await response.json()) as { status: string; db: string }
    expect(body.status).toBe('ok')
    expect(body.db).toBe('reachable')
  })

  test('/search returns product matches for a common query', async ({ page }) => {
    const response = await page.goto('/search?q=pump')
    expect(response?.status()).toBe(200)
    // At least one product card should link to /p/<sku>.
    const productLinkCount = await page.locator('a[href^="/p/"]').count()
    expect(productLinkCount).toBeGreaterThan(0)
  })

  test('/search handles a no-match query without crashing', async ({ page }) => {
    const response = await page.goto('/search?q=zzznotarealquery')
    expect(response?.status()).toBe(200)
  })

  test('category index /c loads', async ({ page }) => {
    const response = await page.goto('/c')
    // /c may 200 directly or 307-redirect to a default category — both fine.
    expect([200, 307, 308]).toContain(response?.status() ?? 0)
  })

  test('category page renders for hydraulic-pumps', async ({ page }) => {
    const response = await page.goto('/c/hydraulic-pumps')
    // 200 on success, 404 if seed data omits this slug — either is a valid
    // signal that routing works (no 500 crashes).
    expect([200, 404]).toContain(response?.status() ?? 0)
  })

  test('PDP renders for a real seeded product', async ({ page }) => {
    const response = await page.goto('/p/IH-AP71-D-R-V')
    expect(response?.status()).toBe(200)
    // Loose product-detail signal — title text varies by seed but a brand
    // name or pump-related word should always be present.
    await expect(page.locator('h1').first()).toContainText(/Parker|Bosch|Rexroth|Pump|Hose|Vane|Piston/i)
  })

  test('/brands page loads', async ({ page }) => {
    const response = await page.goto('/brands')
    expect(response?.status()).toBe(200)
  })

  test('sign-in page renders the form', async ({ page }) => {
    const response = await page.goto('/sign-in')
    expect(response?.status()).toBe(200)
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible()
  })

  test('protected /account redirects to sign-in', async ({ page }) => {
    await page.goto('/account')
    expect(page.url()).toContain('/sign-in')
  })

  test('/contact renders the wired form (PR #38)', async ({ page }) => {
    const response = await page.goto('/contact')
    expect(response?.status()).toBe(200)
    // Hidden inquiryType field proves the new client component is mounted.
    await expect(page.locator('input[name="inquiryType"]')).toHaveCount(1)
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="company"]')).toBeVisible()
  })

  test('/terms shows real copy, not the placeholder (PR #38)', async ({ page }) => {
    const response = await page.goto('/terms')
    expect(response?.status()).toBe(200)
    await expect(page.locator('body')).not.toContainText('currently being prepared')
    await expect(page.locator('body')).toContainText('Indus Hydraulic Power Trading LLC')
  })

  test('/privacy shows real copy, not the placeholder (PR #38)', async ({ page }) => {
    const response = await page.goto('/privacy')
    expect(response?.status()).toBe(200)
    await expect(page.locator('body')).not.toContainText('currently being prepared')
  })

  test('404 page renders for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist-xyz')
    expect(response?.status()).toBe(404)
    await expect(page.locator('body')).toContainText(/not found|404/i)
  })

  test('no /en/ or /ar/ locale paths leak into the home page', async ({ page }) => {
    await page.goto('/')
    const localeLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => /^\/(en|ar)(\/|$)/.test(h))
    })
    expect(localeLinks).toEqual([])
  })
})
