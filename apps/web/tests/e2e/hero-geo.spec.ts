import { expect, test } from '@playwright/test'

/**
 * The homepage headline opens with the visitor's country. None of that is
 * visible to a unit test: the country arrives as a request header Vercel sets
 * on the edge, and the page reads it while rendering. The only way to know it
 * works is to ask for the page and read the heading.
 *
 * These also stand guard over the assumption the feature rests on: that `/`
 * renders per request. It does today — production serves it with
 * `cache-control: no-store` — but the file still carries `revalidate = 60`. If
 * the page is ever made genuinely cacheable, one rendered copy would be handed
 * to every country and these tests are what fails.
 *
 * `?geo=` stands in for the header — the page accepts either, and the query
 * form is what a human uses to review the wording without leaving the country.
 * The header form is covered too, since that is what production uses.
 */

const LEAD = {
  AE: "The UAE's premier supplier of",
  SA: "Saudi Arabia's premier supplier of",
  OM: "Oman's premier supplier of",
  QA: "Qatar's premier supplier of",
  BH: "Bahrain's premier supplier of",
  KW: "Kuwait's premier supplier of",
} as const

const FALLBACK_LEAD = "Dubai's premier supplier of"

test.describe('homepage geo headline', () => {
  for (const [code, lead] of Object.entries(LEAD)) {
    test(`a visitor in ${code} sees "${lead}"`, async ({ page }) => {
      await page.goto(`/?geo=${code}`)
      await expect(page.locator('h1')).toContainText(lead)
      expect(new URL(page.url()).pathname).toBe('/')
    })
  }

  test('reads the real Vercel header, not just the query override', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-vercel-ip-country': 'SA' },
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('h1')).toContainText(LEAD.SA)
    await context.close()
  })

  test('falls back to Dubai for a country with no wording', async ({ browser }) => {
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-vercel-ip-country': 'US' },
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('h1')).toContainText(FALLBACK_LEAD)
    await context.close()
  })

  test('falls back when no country header is present at all', async ({ page }) => {
    // Local development, any non-Vercel host, and every request the edge
    // cannot place. Must never render a headline with a hole in it.
    await page.goto('/')
    await expect(page.locator('h1')).toContainText(FALLBACK_LEAD)
  })

  test('keeps one canonical whatever the visitor sees', async ({ page }) => {
    // Every country gets the same URL and the same canonical, so the variants
    // can never read as near-duplicate pages.
    await page.goto('/?geo=SA')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical!).pathname).toBe('/')
  })

  test('serves two countries different headlines on the same URL', async ({ browser }) => {
    // The regression that would matter most: if `/` ever became a single
    // cached copy, whichever country warmed the cache would be served to
    // everyone. Two requests, two countries, one URL — they must differ.
    const read = async (country: string) => {
      const context = await browser.newContext({
        extraHTTPHeaders: { 'x-vercel-ip-country': country },
      })
      const page = await context.newPage()
      await page.goto('/')
      const text = await page.locator('h1').innerText()
      await context.close()
      return text
    }
    const [saudi, kuwait] = await Promise.all([read('SA'), read('KW')])
    expect(saudi).toContain(LEAD.SA)
    expect(kuwait).toContain(LEAD.KW)
  })
})

test.describe('homepage rotating term', () => {
  test('server-renders the lead term, so a crawler reads a complete heading', async ({ request }) => {
    // Fetched without a browser: this is the HTML before any JavaScript runs,
    // which is what Googlebot indexes. An empty slot here would mean shipping
    // a homepage whose <h1> names no product at all.
    const html = await (await request.get('/')).text()
    expect(html).toContain('hydraulic hoses')
  })

  test('ships exactly one term in the markup, not all six', async ({ request }) => {
    // All six present with five hidden reads as keyword stuffing.
    const html = await (await request.get('/')).text()
    const inHeading = html.slice(html.indexOf('<h1'), html.indexOf('</h1>'))
    expect(inHeading).toContain('hydraulic hoses')
    for (const other of ['industrial hoses', 'oil &amp; gas hoses', 'Molykote lubricants']) {
      expect(inHeading, `${other} should not be in the <h1>`).not.toContain(other)
    }
  })

  test('links every rotating term to its category page', async ({ page }) => {
    // A moving word is a poor click target, so the terms are mirrored as a
    // static row. Without it the hero passes ranking strength to nothing.
    await page.goto('/')
    for (const href of [
      '/c/hydraulic-hoses',
      '/c/industrial-hose-suppliers-uae',
      '/c/hydraulic-hose-fittings-suppliers-uae',
      '/c/oil-gas-hoses',
      '/c/metallic-hose-suppliers-uae',
      '/c/industrial-lubricant-suppliers-uae',
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
  })
})
