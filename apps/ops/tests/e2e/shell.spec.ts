import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * The console shell (S02-T03): AppShell around every signed-in page, the skip link, the sidebar's
 * cookie-backed collapse, the Helper-only website-admin link, the hotkey registry and the live-counts poll.
 * Needs the seeded demo users (SEED_DEMO=1 bun run --filter @indus/ops-db db:seed).
 */

/** Client parts listen once hydrated: the sidebar's toggle has a handler only then. */
/**
 * Wait until the client parts a test drives have hydrated: the sidebar toggle AND the skip link. Islands
 * hydrate independently, so the toggle alone does not prove the skip link's handler is attached (the
 * skip-link test raced this: Enter followed the bare #content anchor before React took over).
 */
async function hydrated(page: Page) {
  await page.waitForFunction(() =>
    ['[data-part="sidebar-toggle"]', '[data-part="skip-link"]'].every((sel) => {
      const el = document.querySelector(sel)
      return el !== null && Object.keys(el).some((k) => k.startsWith('__reactProps'))
    })
  )
}

test('shell: the Owner gets the AppShell around Today', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/today')
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: 'Money' })).toBeVisible()
  await expect(page.locator('main#content')).toHaveCount(1)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.locator('main#content').getByRole('heading', { name: 'Today' })).toBeVisible()
  await hydrated(page)
  await page.getByRole('button', { name: /account menu/ }).click()
  const menu = page.getByRole('menu')
  await expect(menu.getByRole('menuitem', { name: 'Profile' })).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
  await expect(menu.getByRole('menuitem', { name: /Website admin/ })).toHaveCount(0)
})

test('shell: the Helper sees Website admin ↗ in the avatar menu', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/today')
  await hydrated(page)
  await page.getByRole('button', { name: /account menu/ }).click()
  const admin = page.getByRole('menuitem', { name: /Website admin/ })
  await expect(admin).toBeVisible()
  await expect(admin).toHaveAttribute('href', 'https://indushydraulics.com/admin')
  await expect(admin).toHaveAttribute('target', '_blank')
  // Review is listed for the Helper too (only its badge is the Owner's).
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Review' })
  ).toBeVisible()
})

test('skip-link: the first tab stop, and it moves focus to #content', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/today')
  await hydrated(page)
  // The page streams in behind (console)/loading.tsx: wait for its content, or the Tab after the skip
  // lands outside #content because nothing inside it is focusable yet.
  await expect(page.locator('main#content').getByRole('heading', { name: 'Today' })).toBeVisible()
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).not.toBeInViewport()
  await page.keyboard.press('Tab')
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  const box = await skip.boundingBox()
  expect(box!.x).toBeLessThan(40)
  expect(box!.y).toBeLessThan(40)
  await page.keyboard.press('Enter')
  await expect(page.locator('#content')).toBeFocused()
  await expect(page).toHaveURL(/\/today$/)
  // The next Tab continues inside the page, not back in the sidebar.
  await page.keyboard.press('Tab')
  expect(
    await page.evaluate(() => document.getElementById('content')!.contains(document.activeElement))
  ).toBe(true)
})

test('shell: a collapsed sidebar stays collapsed after a reload', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/today')
  await hydrated(page)
  const sidebar = page.locator('[data-part="sidebar"]')
  // The toast region sits 24px clear of the sidebar, whichever width it has.
  const toastLeft = () =>
    page.locator('[data-part="toast-region"]').evaluate((el) => el.getBoundingClientRect().left)
  await expect(sidebar).not.toHaveAttribute('data-collapsed')
  expect(await toastLeft()).toBe(236 + 24)
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  expect(await toastLeft()).toBe(64 + 24)
  await expect
    .poll(async () => (await page.context().cookies()).find((c) => c.name === 'ops_sidebar')?.value)
    .toBe('collapsed')
  await page.reload()
  // Rendered collapsed by the server (no width jump on load).
  await expect(sidebar).toHaveAttribute('data-collapsed', 'true')
  await expect(sidebar).toHaveClass(/w-io-sidebar-collapsed/)
})

test('shell: G R goes to Review from anywhere outside a field', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/today')
  await hydrated(page)
  await page.locator('#content').focus()
  await page.keyboard.press('g')
  await page.keyboard.press('r')
  await expect(page).toHaveURL(/\/review$/)
})

test('shell: live counts are read once on load, not in a loop', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  const actions: string[] = []
  page.on('request', (req) => {
    if (req.method() === 'POST' && req.headers()['next-action']) actions.push(req.url())
  })
  await page.goto('/today')
  await hydrated(page)
  await expect.poll(() => actions.length, { timeout: 10_000 }).toBeGreaterThanOrEqual(1)
  await page.waitForTimeout(2000)
  expect(actions).toHaveLength(1)
})

test('shell: axe finds nothing critical or serious on Today', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/today')
  await hydrated(page)
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const blocking = violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
  expect(blocking).toEqual([])
})

test('shell: an unknown path, signed in, is "We can’t find that" inside the shell', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/no-such-page')
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  const content = page.locator('main#content')
  await expect(content.getByRole('heading', { name: 'We can’t find that' })).toBeVisible()
  await expect(content.getByRole('link', { name: 'Go to Today' })).toHaveAttribute('href', '/today')
  await expect(content.getByRole('link', { name: 'Search' })).toHaveAttribute('href', '/search')
})
