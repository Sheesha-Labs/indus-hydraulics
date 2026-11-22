import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * The template specimens (S02-T04), /_kit/templates/<t>, each inside the real AppShell for the Owner:
 * landmarks (the shell's main and sidebar nav, plus each template's own regions), axe (critical and serious
 * fail), one page-level primary action, and the sign-in gate.
 */
const SPECIMENS: readonly {
  t: string
  template: string
  regions: readonly (readonly ['complementary' | 'navigation' | 'region', string | RegExp])[]
}[] = [
  { t: 't1a', template: 'T1', regions: [] },
  { t: 't1b', template: 'T1', regions: [['complementary', /^Preview/]] },
  { t: 't2a', template: 'T2', regions: [['complementary', 'Record facts']] },
  { t: 't2b', template: 'T2', regions: [['complementary', 'Record facts']] },
  {
    t: 't3a',
    template: 'T3',
    regions: [
      ['navigation', 'Mail folders'],
      ['region', 'Threads'],
      ['region', 'Reading pane'],
    ],
  },
  {
    t: 't4a',
    template: 'T4',
    regions: [
      ['region', 'Review queue'],
      ['region', 'Proposal'],
    ],
  },
  { t: 't5a', template: 'T5', regions: [['region', 'Checks and cover email']] },
  { t: 't6a', template: 'T6', regions: [['complementary', 'Scenarios']] },
  { t: 't7a', template: 'T7', regions: [['navigation', 'Settings sections']] },
  {
    t: 't8a',
    template: 'T8',
    regions: [
      ['region', 'Needs you'],
      ['complementary', 'At a glance'],
    ],
  },
  { t: 't8a-first-run', template: 'T8', regions: [['complementary', 'At a glance']] },
  { t: 't10a', template: 'T10', regions: [] },
  {
    t: 'x1',
    template: 'X1',
    regions: [
      ['region', 'Decision'],
      ['complementary', 'Drafted emails'],
    ],
  },
] as const

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

async function blockingViolations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(WCAG_21_AA)
    .exclude('iframe[sandbox]')
    // A4 pages drawn at board scale are pictures of the printed page (axe-kit.spec.ts DOC_FRAME).
    .exclude('[data-doc-frame]')
    .analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

/**
 * Primary buttons outside the decision cards. A ProposalCard's Approve and a Composer's Send are the kits'
 * own primaries inside one decision (the boards draw them so); everything else on a view is secondary but
 * one (CLAUDE.md §4.9).
 */
const PAGE_PRIMARIES =
  '[data-variant="primary"]:not([data-part="proposal"] *):not([data-part="composer"] *):not([data-part="drafted-email"] *)'

for (const s of SPECIMENS) {
  test(`templates/${s.t}: landmarks, axe and one primary`, async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await page.goto(`/_kit/templates/${s.t}`)
    await expect(page.locator(`[data-template="${s.template}"]`).first()).toBeVisible()
    await page.waitForFunction(() => {
      const toggle = document.querySelector('[data-part="sidebar-toggle"]')
      return toggle !== null && Object.keys(toggle).some((k) => k.startsWith('__reactProps'))
    })

    // The shell's landmarks: exactly one main (the shell's), the sidebar's navigation.
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.locator('[data-part="sidebar"] nav').first()).toBeVisible()
    for (const [role, name] of s.regions)
      await expect(page.getByRole(role, { name, exact: typeof name === 'string' })).toBeVisible()

    expect(await page.locator(PAGE_PRIMARIES).count()).toBeLessThanOrEqual(1)

    const blocking = await blockingViolations(page)
    expect(blocking, blocking.join('\n')).toEqual([])
  })
}

test('templates: the sidebar marks the row each board draws', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto('/_kit/templates/t3a')
  await expect(
    page.locator('[data-part="sidebar"] [data-nav="mail"][aria-current="page"]')
  ).toHaveCount(1)
})

test('templates: signed out, a specimen sends you to sign in', async ({ page }) => {
  await page.goto('/_kit/templates/t1a')
  await expect(page).toHaveURL(/\/sign-in\?next=%2F_kit%2Ftemplates%2Ft1a/)
})

test('templates/x1: one primary per drafted email, none in the header; the columns are 705 · 420', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  // The board's page box (1440 less its 1px frame line), as the parity specs render it.
  await page.setViewportSize({ width: 1438, height: 938 })
  await page.goto('/_kit/templates/x1')
  await expect(page.locator('[data-template="X1"]')).toBeVisible()
  await expect(page.locator('[data-part="page-header"] [data-variant="primary"]')).toHaveCount(0)
  const drafts = page.locator('[data-part="drafted-email"]')
  expect(await drafts.count()).toBeGreaterThanOrEqual(2)
  for (const d of await drafts.all())
    await expect(d.locator('[data-variant="primary"]')).toHaveCount(1)
  const width = async (slot: string) =>
    Math.round(
      (await page.locator(`[data-template="X1"] [data-slot="${slot}"]`).boundingBox())!.width
    )
  expect(Math.abs((await width('main')) - 705)).toBeLessThanOrEqual(1)
  expect(await width('side')).toBe(420)
})

/**
 * The templates drawn without the shell (S02-T05): T9 centred wizard in (kit), T11 in the (auth) layout,
 * T12 in (client). No session, no sidebar, one main, axe, at most one primary.
 */
const BARE = [
  { t: 't9a', template: 'T9', primaries: 1 },
  { t: 't11a', template: 'T11', primaries: 1 },
  { t: 't12a', template: 'T12', primaries: 0 },
] as const

for (const b of BARE) {
  test(`templates/${b.t}: outside the shell, no session, axe and one primary`, async ({ page }) => {
    await page.goto(`/_kit/templates/${b.t}`)
    await expect(page.locator(`[data-template="${b.template}"]`)).toBeVisible()
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.locator('[data-part="sidebar"]')).toHaveCount(0)
    await expect(page.locator('[data-variant="primary"]')).toHaveCount(b.primaries)
    const blocking = await blockingViolations(page)
    expect(blocking, blocking.join('\n')).toEqual([])
  })
}

test('templates/t11a: the sign-in card is the (auth) layout, and /sign-in still renders in it', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await expect(page.locator('main#content[data-template="T11"]')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible()
})

test('templates/t12a: one column with a sticky action bar on a phone, no sideways scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/_kit/templates/t12a')
  const body = page.locator('[data-template="T12"] [data-slot="body"]')
  await expect(body).toBeVisible()
  // One track under 1024.
  const tracks = await body.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' '))
  expect(tracks).toHaveLength(1)
  // Nothing wider than the screen: the lines scroll inside their own box.
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  // The actions stay on screen at the top of the page and at the bottom, 44 high.
  const actions = page.locator('[data-slot="actions"]')
  const atTop = (await actions.boundingBox())!
  expect(atTop.y + atTop.height).toBeLessThanOrEqual(844 + 1)
  expect(atTop.y + atTop.height).toBeGreaterThan(844 - 4)
  for (const b of await actions.getByRole('button').all())
    expect(Math.round((await b.boundingBox())!.height)).toBe(44)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  const atEnd = (await actions.boundingBox())!
  expect(atEnd.y + atEnd.height).toBeLessThanOrEqual(844 + 1)

  // Axe at phone width too: the sideways-scrolling lines box must be reachable by keyboard.
  const blocking = await blockingViolations(page)
  expect(blocking, blocking.join('\n')).toEqual([])

  // At 1024 and wider: 1fr · 340, the actions static in the right column.
  await page.setViewportSize({ width: 1024, height: 800 })
  const wide = await body.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' '))
  expect(wide).toHaveLength(2)
  expect(wide[1]).toBe('340px')
  expect(await actions.evaluate((el) => getComputedStyle(el).position)).toBe('static')
})
