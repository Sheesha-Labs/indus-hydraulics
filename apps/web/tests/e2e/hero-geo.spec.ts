import { expect, test } from '@playwright/test'

/**
 * The homepage headline opens with the visitor's country. None of that is
 * visible to a unit test: the country arrives as a request header Vercel sets
 * on the edge, and the page reads it while rendering. The only way to know it
 * works is to ask for the page and read the heading.
 *
 * These also stand guard over the assumption the feature rests on: that two
 * countries see two headlines at one URL. That used to rest on `/` rendering
 * per request, which cost a full render for every visitor and every crawler.
 * It now rests on the proxy resolving the country and rewriting to a cached
 * `/h/<cc>` — same URL in the address bar, same canonical, one cached copy per
 * country instead of none at all. If that rewrite ever breaks, every country
 * gets the Dubai fallback and these tests are what fails.
 *
 * `?geo=` stands in for the header — the page accepts either, and the query
 * form is what a human uses to review the wording without leaving the country.
 *
 * THE HEADER FORM CANNOT BE TESTED AGAINST A DEPLOYED SITE
 *
 * `x-vercel-ip-country` is set by Vercel's edge from the caller's IP, and it
 * OVERWRITES whatever the client sends. So a test that supplies the header and
 * asserts a country gets the country the runner happens to sit in — Saudi
 * wording expected, "The United States'" received from a US-hosted runner, and
 * "The UAE's" received from a machine in Dubai. Four tests here did exactly
 * that and failed for as long as the smoke suite has run against production.
 *
 * That the header cannot be spoofed is the platform behaving correctly; it is
 * what stops a visitor choosing their own country. So those tests are kept and
 * skipped when the target is edge-hosted, where they are unrunnable rather
 * than wrong — locally there is no edge in front, the header arrives as sent,
 * and they are the only thing covering that code path.
 *
 * Against a deployed site the same ground is covered differently: the fallback
 * through `?geo=`, the header path proving it yields a real country from
 * wherever the run happens, and the no-store header that is the actual
 * invariant behind "two countries, one URL".
 */

/**
 * True when the suite is pointed at a deployed site rather than a local dev
 * server. Read from the same environment variable the Playwright config reads,
 * so the two cannot disagree about what is being tested.
 */
const EDGE_HOSTED = !(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').includes(
  'localhost',
)

const EDGE_SKIP_REASON =
  'Vercel sets x-vercel-ip-country at the edge and overwrites the client value, so the header cannot be spoofed against a deployed site.'

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
    test.skip(EDGE_HOSTED, EDGE_SKIP_REASON)
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-vercel-ip-country': 'SA' },
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('h1')).toContainText(LEAD.SA)
    await context.close()
  })

  test('falls back to Dubai for a country with no wording (via header)', async ({ browser }) => {
    test.skip(EDGE_HOSTED, EDGE_SKIP_REASON)
    // China, not the US — every export market now has its own line, and the US
    // is one of them. This has to be a country we deliberately do not ship to.
    const context = await browser.newContext({
      extraHTTPHeaders: { 'x-vercel-ip-country': 'CN' },
    })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('h1')).toContainText(FALLBACK_LEAD)
    await context.close()
  })

  test('falls back when no country header is present at all', async ({ page }) => {
    test.skip(EDGE_HOSTED, EDGE_SKIP_REASON)
    // Local development, any non-Vercel host, and every request the edge
    // cannot place. Must never render a headline with a hole in it.
    await page.goto('/')
    await expect(page.locator('h1')).toContainText(FALLBACK_LEAD)
  })

  test('falls back to Dubai for a country with no wording', async ({ page }) => {
    // The same assertion the header version makes, reached through the query
    // form so it also runs against a deployed site. China, not the US — every
    // export market now has its own line and the US is one of them, so the
    // fallback has to be checked with a country we deliberately do not ship to.
    await page.goto('/?geo=CN')
    await expect(page.locator('h1')).toContainText(FALLBACK_LEAD)
  })

  test('the header path yields a real country, wherever the run happens', async ({ page }) => {
    // `/` with no query at all, so the headline comes from the edge header —
    // the production path. The country cannot be asserted, because it is
    // whichever one the runner sits in, but the SHAPE can: a real lead, not an
    // empty slot or a raw country code. This is what fails if the header
    // plumbing breaks, and it fails the same way from any country.
    await page.goto('/')
    const heading = await page.locator('h1').innerText()
    expect(heading).toMatch(/premier supplier of/)
    // Anything before "premier" must be a name, not a bare code or a hole.
    const lead = heading.split('premier supplier of')[0]!.trim()
    expect(lead.length).toBeGreaterThan(2)
    expect(lead).not.toMatch(/undefined|null|\{\{|%s/)
  })

  test('serves / from cache rather than rendering it per visitor', async ({ request }) => {
    // Only meaningful against a deployed site: caching is the hosting layer's
    // job and the dev server never reports a cache state.
    test.skip(!EDGE_HOSTED, 'x-vercel-cache is set by the host; the dev server does not send it.')

    // This is the inverse of the assertion that stood here before, and the
    // reason the rewrite exists. `/` used to be served `no-store`, so the CDN
    // held no copy and every visitor and every crawler cost a full render.
    // Two fetches: the second must come from cache.
    await request.get('/')
    const response = await request.get('/')
    const cache = response.headers()['x-vercel-cache'] ?? ''
    expect(cache).toMatch(/HIT|STALE|PRERENDER/)
    expect(response.headers()['cache-control'] ?? '').not.toContain('no-store')
  })

  test('caches each country separately, so one country is not served to all', async ({ request }) => {
    // What the `no-store` assertion used to protect, protected differently.
    // Caching per country is only safe because each one is cached on its own
    // path; if the rewrite collapsed them onto one entry, whichever country
    // warmed it would be served to everyone. Reached through `?geo=` so it
    // runs against a deployed site too.
    const [saudi, kuwait] = await Promise.all([
      request.get('/?geo=SA').then((r) => r.text()),
      request.get('/?geo=KW').then((r) => r.text()),
    ])
    expect(saudi).toContain(LEAD.SA)
    expect(saudi).not.toContain(LEAD.KW)
    expect(kuwait).toContain(LEAD.KW)
    expect(kuwait).not.toContain(LEAD.SA)
  })

  test('keeps one canonical whatever the visitor sees', async ({ page }) => {
    // Every country gets the same URL and the same canonical, so the variants
    // can never read as near-duplicate pages.
    await page.goto('/?geo=SA')
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical!).pathname).toBe('/')
  })

  test('serves two countries different headlines on the same URL', async ({ browser }) => {
    test.skip(EDGE_HOSTED, EDGE_SKIP_REASON)
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
    for (const other of ['hydraulic adapters', 'industrial hoses', 'oil &amp; gas hoses', 'Molykote lubricants']) {
      expect(inHeading, `${other} should not be in the <h1>`).not.toContain(other)
    }
  })

  test('links every rotating term to its category page', async ({ page }) => {
    // A moving word is a poor click target, so the terms are mirrored as a
    // static row. Without it the hero passes ranking strength to nothing.
    await page.goto('/')
    for (const href of [
      '/c/hydraulic-hoses',
      '/c/hydraulic-adapters',
      '/c/hydraulic-fittings',
      '/c/industrial-hose-suppliers-uae',
      '/c/oil-gas-hoses',
      '/c/metallic-hose-suppliers-uae',
      '/c/industrial-lubricant-suppliers-uae',
    ]) {
      await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible()
    }
  })
})
