import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '../signed-in'

/**
 * The template specimens (S02-T04), /_kit/templates/<t>, each inside the real AppShell for the Owner:
 * landmarks (the shell's main and sidebar nav, plus each template's own regions), axe (critical and serious
 * fail), one page-level primary action, and the sign-in gate.
 */
const SPECIMENS = [
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
] as const

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/**
 * Primary buttons outside the decision cards. A ProposalCard's Approve and a Composer's Send are the kits'
 * own primaries inside one decision (the boards draw them so); everything else on a view is secondary but
 * one (CLAUDE.md §4.9).
 */
const PAGE_PRIMARIES =
  '[data-variant="primary"]:not([data-part="proposal"] *):not([data-part="composer"] *)'

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
    for (const [role, name] of s.regions) await expect(page.getByRole(role, { name })).toBeVisible()

    expect(await page.locator(PAGE_PRIMARIES).count()).toBeLessThanOrEqual(1)

    const { violations } = await new AxeBuilder({ page })
      .withTags(WCAG_21_AA)
      .exclude('iframe[sandbox]')
      // A4 pages drawn at board scale are pictures of the printed page (axe-kit.spec.ts DOC_FRAME).
      .exclude('[data-doc-frame]')
      .analyze()
    const blocking = violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
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
