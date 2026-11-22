import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * axe on the sampled S02 pages and overlays (S02-T09, CLAUDE.md §13.5): WCAG 2.1 A and AA, critical and
 * serious findings fail. Pages: an index (T1), a record (T2), settings (T7), sign-in (T11) and the client
 * page specimen (T12). Overlays, scanned while open over a console page: the command bar, the Why? drawer
 * and a ConfirmDialog. (routes.spec.ts also runs axe on every console route as the Owner.)
 */

async function blocking(page: Page, include?: string): Promise<string[]> {
  // An overlay that is still sliding or fading in has its text at part opacity, which axe would score as
  // low contrast: wait until every animation has finished (the infinite spinners excepted).
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity)
  )
  let builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  if (include) builder = builder.include(include)
  const { violations } = await builder.analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

/** Hydrated: React has attached its fiber to <html>, and the fonts are in (contrast is measured on text). */
async function ready(page: Page) {
  await page.waitForFunction(() =>
    Object.keys(document.documentElement).some((k) => k.startsWith('__reactFiber'))
  )
  await page.evaluate(() => document.fonts.ready)
}

/** ⌘K until the bar shows: the hotkey listener is bound in an effect just after hydration. */
async function openCommandBar(page: Page) {
  const bar = page.getByRole('combobox')
  await expect(async () => {
    if (!(await bar.isVisible())) await page.keyboard.press('ControlOrMeta+k')
    await expect(bar).toBeVisible({ timeout: 1000 })
  }).toPass()
}

test.describe('axe · pages', () => {
  test.describe.configure({ mode: 'parallel' })

  for (const [name, path, template] of [
    ['index (T1)', '/enquiries', 'T1'],
    ['record (T2)', '/enquiries/ENQ-2026-0001/lines', 'T2'],
    ['settings (T7)', '/settings/team', 'T7'],
  ] as const) {
    test(`axe: ${name} ${path}`, async ({ page, signedInAs }) => {
      await signedInAs('owner')
      await page.goto(path)
      await expect(page.locator(`main#content [data-template="${template}"]`).first()).toBeVisible()
      await ready(page)
      expect(await blocking(page)).toEqual([])
    })
  }

  test('axe: sign-in (T11) /sign-in', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('[data-template="T11"]')).toBeVisible()
    await ready(page)
    expect(await blocking(page)).toEqual([])
  })

  test('axe: client page specimen (T12) /_kit/templates/t12a', async ({ page }) => {
    await page.goto('/_kit/templates/t12a')
    await expect(page.locator('[data-template="T12"]')).toBeVisible()
    await ready(page)
    expect(await blocking(page)).toEqual([])
  })
})

test.describe('axe · overlays', () => {
  test.describe.configure({ mode: 'parallel' })

  test('axe: command bar open over /today', async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await page.goto('/today')
    await ready(page)
    await openCommandBar(page)
    await page.getByRole('combobox').fill('Q10001')
    await expect(page.getByRole('group', { name: 'Recognised reference' })).toBeVisible()
    expect(await blocking(page)).toEqual([])
  })

  test('axe: Why? drawer open over a record', async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await page.goto('/enquiries/ENQ-2026-0001/lines')
    await ready(page)
    await page.evaluate(() => {
      ;(window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push(
        '/why/00000000-0000-7000-8000-00000000e001'
      )
    })
    const drawer = page.getByRole('dialog', { name: /Line 1/ })
    await expect(drawer).toBeVisible({ timeout: 20_000 })
    await expect(drawer.getByRole('tab', { name: /Reasons/ })).toBeVisible()
    expect(await blocking(page)).toEqual([])
  })

  test('axe: ConfirmDialog open (Overlay kit demo)', async ({ page }) => {
    // No console page asks for a confirmation before S09 (block supplier): the live ConfirmDialog on
    // /_kit/overlay is the one the console will open (useConfirm renders the same part).
    await page.goto('/_kit/overlay')
    await ready(page)
    await page.getByRole('button', { name: 'Block supplier…' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    // The dialog itself: under it is the kit page's canvas furniture (section heads), dimmed by the scrim
    // and inert while the modal is open; axe scores that dimmed text, which is not what is under test.
    expect(await blocking(page, '[role="alertdialog"]')).toEqual([])
  })
})
