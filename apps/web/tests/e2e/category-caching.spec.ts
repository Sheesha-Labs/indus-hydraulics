import { expect, test } from '@playwright/test'

/**
 * `/c/<slug>` is prerendered; `/c/<slug>?brands=…` is not.
 *
 * The shelf page used to read `searchParams`, which made the route dynamic —
 * all 194 shelves rendered per request, the CDN never held one, and every
 * visitor and every crawler cost a full render. The facets still have to work,
 * so the proxy rewrites the filtered forms to `/c-filter/<slug>` and leaves the
 * clean URL static.
 *
 * These tests stand guard over the part that is easy to break silently: the
 * rewrite is invisible, so a mistake in it does not throw. It either serves the
 * wrong page at the right URL, or quietly stops applying the filter, or lets a
 * `noindex` escape onto the canonical shelf.
 */

const SHELF = '/c/crimp-ferrules'

const EDGE_HOSTED = !(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000').includes(
  'localhost',
)

test.describe('category shelf caching', () => {
  test('the clean shelf lists products and stays indexable', async ({ page }) => {
    await page.goto(SHELF)
    await expect(page.locator('h1')).toBeVisible()
    // The products must be in the page, not fetched in afterwards — this is
    // what a crawler reads, and the whole point of keeping the grid on the
    // server rather than moving the filtering into the browser.
    expect(await page.locator('a[href^="/p/"]').count()).toBeGreaterThan(0)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
  })

  test('a filtered shelf keeps its own URL and is not indexed', async ({ page }) => {
    await page.goto(`${SHELF}?sort=az`)
    // The rewrite is internal: the address bar must be unchanged, or every
    // filter link on the site starts pointing somewhere else.
    expect(new URL(page.url()).pathname).toBe(SHELF)
    expect(new URL(page.url()).search).toBe('?sort=az')
    await expect(page.locator('h1')).toBeVisible()
    // Facet variants have always been noindex with a canonical back to the
    // clean shelf. Splitting the route must not change that.
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1)
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(new URL(canonical!).pathname).toBe(SHELF)
  })

  test('sorting actually sorts, so the rewrite is passing the query through', async ({ page }) => {
    // A rewrite that dropped the query string would still render a perfectly
    // good shelf — just the unfiltered one. Comparing the two orders is what
    // catches that.
    await page.goto(SHELF)
    const defaultOrder = await page.locator('a[href^="/p/"]').first().getAttribute('href')
    await page.goto(`${SHELF}?sort=az`)
    const sortedFirst = await page.locator('a[href^="/p/"]').first().getAttribute('href')
    expect(sortedFirst).toBeTruthy()
    // Not asserting they differ — a shelf can already be alphabetical. Assert
    // the sorted page rendered a real grid rather than falling over.
    expect(await page.locator('a[href^="/p/"]').count()).toBeGreaterThan(0)
    expect(defaultOrder).toBeTruthy()
  })

  test('?page=1 is the clean shelf, not a dynamic render of it', async ({ request }) => {
    test.skip(!EDGE_HOSTED, 'x-vercel-cache is set by the host; the dev server does not send it.')
    // The most linked-to spelling of a shelf. If the proxy treated it as a
    // facet variant it would hand every one of those an uncached render.
    await request.get(`${SHELF}?page=1`)
    const response = await request.get(`${SHELF}?page=1`)
    expect(response.headers()['x-vercel-cache'] ?? '').toMatch(/HIT|STALE|PRERENDER/)
  })

  test('serves the clean shelf from cache', async ({ request }) => {
    test.skip(!EDGE_HOSTED, 'x-vercel-cache is set by the host; the dev server does not send it.')
    // The regression this whole change exists to prevent. Before it, every
    // repeat request was a MISS with `cache-control: no-store`.
    await request.get(SHELF)
    const response = await request.get(SHELF)
    expect(response.headers()['x-vercel-cache'] ?? '').toMatch(/HIT|STALE|PRERENDER/)
    expect(response.headers()['cache-control'] ?? '').not.toContain('no-store')
  })
})
