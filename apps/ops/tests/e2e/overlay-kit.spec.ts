import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * The Overlay kit's live parts in a real browser (/_kit/overlay "Live" row): keyboard journeys for focus
 * trapping, Escape on the top-most layer and focus return, then axe with each overlay open (05 §9.4).
 * Scans are scoped to the open overlay: while a modal is open Radix hides the rest of the page.
 */

async function open(page: Page) {
  await page.goto('/_kit/overlay', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
}

async function blocking(page: Page, selector: string): Promise<string[]> {
  // Let the slide and fade finish first: mid-animation opacity reads as low contrast.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity)
  )
  const { violations } = await new AxeBuilder({ page }).include(selector).analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => `${n.target.join(' ')} ${n.failureSummary ?? ''}`).join(', ')}`
    )
}

const focusedText = (page: Page) => page.evaluate(() => document.activeElement?.textContent ?? '')

test('overlay-kit: modal traps Tab, Escape closes it and focus returns to the trigger', async ({
  page,
}) => {
  await open(page)
  const trigger = page.getByRole('button', { name: 'Open modal' })
  await trigger.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Link to an enquiry' })
  await expect(dialog).toBeVisible()
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab')
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('overlay-kit: confirm opens on Cancel, Escape cancels, failure stays open', async ({
  page,
}) => {
  await open(page)
  const trigger = page.getByRole('button', { name: 'Block supplier…' })
  await trigger.click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await dialog.getByRole('button', { name: 'Block supplier' }).click()
  await expect(dialog.getByRole('alert')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test('overlay-kit: Escape closes only the modal opened from a drawer', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Why?' }).click()
  const drawer = page.getByRole('dialog', { name: 'Why this supplier for line 5' })
  await expect(drawer).toBeVisible()
  const change = drawer.getByRole('button', { name: 'Change supplier…' })
  await change.click()
  await expect(page.getByRole('dialog', { name: 'Change supplier for line 5' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Change supplier for line 5' })).toBeHidden()
  await expect(drawer).toBeVisible()
  await expect(change).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(drawer).toBeHidden()
  await expect(page.getByRole('button', { name: 'Why?' })).toBeFocused()
})

test('overlay-kit: menu by keyboard, F6 into the toasts', async ({ page }) => {
  await open(page)
  const menuButton = page.getByRole('button', { name: 'Row menu' })
  await menuButton.focus()
  await page.keyboard.press('Enter')
  // Radix moves focus a task after the keydown, so each step waits for it.
  await expect(page.getByRole('menuitem', { name: 'Open', exact: true })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitem', { name: /^Open in new tab/ })).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('menuitem', { name: 'Link to enquiry…' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(menuButton).toBeFocused()

  await page.getByRole('button', { name: 'Toast with undo' }).click()
  await expect(page.getByRole('button', { name: /^Undo \d:\d\d$/ })).toBeVisible()
  await page.keyboard.press('F6')
  expect(await focusedText(page)).toMatch(/^Undo \d:\d\d$/)
})

test('overlay-kit axe: toasts, modal and confirm dialog open have no critical or serious findings', async ({
  page,
}) => {
  await open(page)
  await page.getByRole('button', { name: 'Toast with undo' }).click()
  await page.getByRole('button', { name: 'Error toast' }).click()
  await expect(page.locator('[data-part="toast-errors"] li')).toHaveCount(1)
  expect(await blocking(page, '[data-part="toast-region"]')).toEqual([])

  await page.getByRole('button', { name: 'Open modal' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await blocking(page, '[role="dialog"]')).toEqual([])
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Block supplier…' }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  expect(await blocking(page, '[role="alertdialog"]')).toEqual([])
  await page.keyboard.press('Escape')

  await page.getByRole('button', { name: 'Why?' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await blocking(page, '[role="dialog"]')).toEqual([])
})
