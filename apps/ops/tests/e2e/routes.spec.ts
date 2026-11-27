import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test, type DemoUser } from '../signed-in'
import { CONSOLE, ENQ, SO } from './route-table'

/**
 * The route skeleton (S02-T07): every console route opens inside AppShell, as the Owner and as the Helper,
 * under its template, with the right sidebar item active, one h1, at most one page-level primary and no
 * console errors. Record pages use the S02 fixtures (ENQ-2026-0001, SO-0001, the tender path); `[` and `]`
 * move between record tabs. First-run setup and the client pages render without the shell.
 * Needs the seeded demo users (SEED_DEMO=1 bun run --filter @indus/ops-db db:seed).
 */

/** Primary buttons outside the decision cards (CLAUDE.md §4.9; templates.spec.ts). */
const PAGE_PRIMARIES =
  '[data-variant="primary"]:not([data-part="proposal"] *):not([data-part="composer"] *):not([data-part="drafted-email"] *)'

/**
 * Known CSP reports, not page errors: under `next dev`, Radix parts rendered on the server and Next's dev
 * overlay write `style` attributes the Ops CSP drops (S02 brief, wave 1); a production build reports none
 * (csp.spec.ts). The un-nonced `<script>` Next used to stream for loading.tsx chunks is fixed (S02-T09) and
 * fails here again if it comes back. Anything else the console logs as an error fails the test.
 */
const KNOWN_CSP = [
  /^Applying inline style violates the following Content Security Policy directive 'style-src /,
]

/** Collects console errors and uncaught page errors for one test. */
function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !KNOWN_CSP.some((re) => re.test(msg.text())))
      errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  return errors
}

/** axe, WCAG 2.1 AA: the critical and serious findings (templates.spec.ts does the same). */
async function blockingViolations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

/** The client islands hydrated: the sidebar toggle and the skip link have their handlers. */
async function hydrated(page: Page) {
  await page.waitForFunction(() =>
    ['[data-part="sidebar-toggle"]', '[data-part="skip-link"]'].every((sel) => {
      const el = document.querySelector(sel)
      return el !== null && Object.keys(el).some((k) => k.startsWith('__reactProps'))
    })
  )
}

/** The sidebar link marked current (the groups, or Settings in the foot), or null. */
async function activeNav(page: Page): Promise<string | null> {
  const current = page.locator('[data-part="sidebar"] a[aria-current="page"]')
  if ((await current.count()) === 0) return null
  return (await current.first().innerText()).trim().split('\n')[0]!.trim()
}

for (const who of ['owner', 'helper'] as const satisfies readonly DemoUser[]) {
  test.describe(`routes · ${who}`, () => {
    test.describe.configure({ mode: 'parallel' })
    for (const [path, nav, template] of CONSOLE) {
      test(`routes: ${path} opens under ${template} inside AppShell (${who})`, async ({
        page,
        signedInAs,
      }) => {
        const errors = watchErrors(page)
        await signedInAs(who)
        const res = await page.goto(path)
        expect(res?.status()).toBe(200)
        const main = page.locator('main#content')
        await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
        await expect(page.locator('main')).toHaveCount(1)
        await expect(main.locator(`[data-template="${template}"]`).first()).toBeVisible()
        await expect(main.locator('h1')).toHaveCount(1)
        // A skeleton marks itself [data-arrives]; a finished page [data-built].
        await expect(main.locator(':is([data-arrives], [data-built])').first()).toBeVisible()
        await hydrated(page)
        if (nav === null) {
          await expect.poll(() => activeNav(page)).toBeNull()
        } else {
          await expect.poll(() => activeNav(page)).toBe(nav)
        }
        expect(await page.locator(PAGE_PRIMARIES).count()).toBeLessThanOrEqual(1)
        // axe on every route once (the Owner's run): critical and serious findings fail (CLAUDE.md §13.5).
        if (who === 'owner') expect(await blockingViolations(page)).toEqual([])
        expect(errors).toEqual([])
      })
    }
  })
}

test.describe('routes · redirects and records', () => {
  // Several navigations per test against `next dev`, each of which may compile its route first.
  test.describe.configure({ timeout: 120_000 })
  test('routes: /mail, /reports and /orders/SO-0001 open their first child', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    for (const [from, to] of [
      ['/mail', /\/mail\/all$/],
      ['/reports', /\/reports\/overdue$/],
      [SO, /\/orders\/SO-0001\/confirmation$/],
    ] as const) {
      await page.goto(from)
      await expect(page).toHaveURL(to)
    }
  })

  test('routes: every sidebar destination opens its skeleton, Money included (C10)', async ({
    page,
    signedInAs,
  }) => {
    const errors = watchErrors(page)
    await signedInAs('owner')
    await page.goto('/today')
    await hydrated(page)
    const nav = page.getByRole('navigation', { name: 'Main' })
    const labels = [
      'Today',
      'Review',
      'Mail',
      'Enquiries',
      'Quotations',
      'Orders',
      'Money',
      'Suppliers',
      'Clients',
      'Parts',
      'Reports',
      'Autopilot',
      'Assistant log',
    ]
    for (const label of labels) {
      const link = nav.getByRole('link', { name: label })
      const href = (await link.getAttribute('href'))!
      // The page already open (Today) is not clicked: a same-URL click starts a navigation that the URL
      // check below cannot wait for (the URL already matches), and the next click lands while it is still in
      // flight and is dropped (S02-T09: intermittent under load). Its row must already be current.
      if (new URL(page.url()).pathname === href) {
        await expect(link).toHaveAttribute('aria-current', 'page')
        continue
      }
      // A soft navigation: under `next dev` the first visit compiles the route, so allow for it.
      await link.click()
      await expect(page).toHaveURL((url) => url.pathname.startsWith(href), { timeout: 30_000 })
      await expect(link).toHaveAttribute('aria-current', 'page')
      // A skeleton (data-arrives) or a page its sprint has built (data-built, Mail since S05).
      await expect(
        page.locator('main#content :is([data-arrives], [data-built])').first()
      ).toBeVisible()
    }
    await page.locator('[data-part="sidebar"]').getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.locator('main#content [data-arrives]').first()).toBeVisible()
    expect(errors).toEqual([])
  })

  for (const [start, tabs, label] of [
    [ENQ, 11, 'Enquiry sections'],
    [`${SO}/confirmation`, 9, 'Order sections'],
    [`${ENQ}/tender/timeline`, 12, 'Tender sections'],
  ] as const) {
    test(`routes: [ and ] move between the record tabs of ${start}`, async ({
      page,
      signedInAs,
    }) => {
      await signedInAs('owner')
      await page.goto(start)
      await hydrated(page)
      const nav = page.getByRole('navigation', { name: label })
      await expect(nav.getByRole('link')).toHaveCount(tabs)
      const hrefs = await nav
        .getByRole('link')
        .evaluateAll((links) => links.map((a) => a.getAttribute('href')!))
      await page.locator('#content').focus()
      await page.keyboard.press(']')
      await expect(page).toHaveURL(new RegExp(`${hrefs[1]!.replace(/[/]/g, '\\/')}$`))
      await expect(nav.getByRole('link').nth(1)).toHaveAttribute('aria-current', 'page')
      await page.locator('#content').focus()
      await page.keyboard.press('[')
      await expect(page).toHaveURL(new RegExp(`${hrefs[0]!.replace(/[/]/g, '\\/')}$`))
      await expect(nav.getByRole('link').first()).toHaveAttribute('aria-current', 'page')
    })
  }

  test('routes: unknown and malformed references show the "not imported" state', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    for (const path of [
      '/enquiries/ENQ-2026-9999',
      '/enquiries/ENQ-26-1/lines',
      '/orders/SO-9999/freight',
      '/quotations/Q10001-R2',
      `/clients/not-a-uuid`,
    ]) {
      await page.goto(path)
      const content = page.locator('main#content')
      await expect(content.locator('[data-not-imported]')).toBeVisible()
      await expect(content.getByRole('link', { name: 'Search history import' })).toBeVisible()
      await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
    }
    // An enquiry that is not a tender has no tender sections; a bad section is not found either.
    await page.goto(`${ENQ}/tender/nothing`)
    await expect(page.locator('main#content [data-boundary="not-found"]')).toBeVisible()
  })
})

test.describe('routes · outside the shell', () => {
  // Several navigations per test against `next dev`, each of which may compile its route first.
  test.describe.configure({ timeout: 120_000 })
  test('routes: welcome and setup render without AppShell, one main', async ({
    page,
    signedInAs,
  }) => {
    const errors = watchErrors(page)
    await signedInAs('owner')
    await page.goto('/welcome')
    await expect(page.locator('[data-template="T11"]')).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Start setup' }).click()
    // A server action then a redirect into a route the dev server may compile on first use.
    await expect(page).toHaveURL(/\/setup\/company$/, { timeout: 30_000 })
    await expect(page.locator('[data-template="T9"][data-layout="rail"]')).toBeVisible()
    await expect(page.locator('main')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveCount(1)
    await page.getByRole('link', { name: /^Next: mailboxes/ }).click()
    await expect(page).toHaveURL(/\/setup\/mailboxes$/, { timeout: 30_000 })
    await page.goto('/setup/nothing')
    await expect(page.locator('[data-boundary="not-found"]')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('routes: client pages are T12, need no session and are noindex', async ({ page }) => {
    const token = 'abcdefghijklmnopqrstuv'
    for (const path of [
      `/q/${token}`,
      `/q/${token}/accept`,
      `/q/${token}/changes`,
      '/q/legacy/Q-2026-ABCD',
      `/d/${token}`,
      `/s/${token}`,
      `/u/${token}`,
    ]) {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      expect(res?.headers()['x-robots-tag']).toContain('noindex')
      await expect(page.locator('[data-template="T12"]')).toBeVisible()
      await expect(page.locator('main')).toHaveCount(1)
      await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0)
    }
    await page.goto('/q/short')
    await expect(page.getByRole('heading', { name: 'This link does not work' })).toBeVisible()
  })

  test('routes: the sign-in pages render in the T11 card without a session', async ({ page }) => {
    for (const path of [
      '/sign-in/forgot',
      '/sign-in/reset/abcdefghijklmnopqrstuv',
      '/sign-in/invite/abcdefghijklmnopqrstuv',
      '/sign-in/two-factor',
      '/sign-in/two-factor/setup',
    ]) {
      const res = await page.goto(path)
      expect(res?.status()).toBe(200)
      await expect(page.locator('[data-template="T11"] h1')).toHaveCount(1)
    }
  })

  test('routes: signed out, a console route goes to sign-in with next=', async ({ page }) => {
    await page.goto(`${ENQ}/lines`)
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fenquiries%2FENQ-2026-0001%2Flines$/)
  })
})
