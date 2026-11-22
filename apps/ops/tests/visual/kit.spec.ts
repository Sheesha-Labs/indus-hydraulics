import { expect, test } from '@playwright/test'
import { isPending, prepare, section, settle } from './helpers'

/**
 * Committed regression baselines: one per /_kit/<kit> page plus /_kit/l0. Neutral fixtures only. Every kit
 * is built (S01-T10), so a section showing its placeholder fails instead of being skipped.
 */
const KITS = [
  'shell',
  'controls',
  'status',
  'table',
  'card',
  'form',
  'states',
  'overlay',
  'timeline',
  'chart',
  'mail',
  'assistant',
  'document',
] as const

test('kit l0', async ({ page }) => {
  await prepare(page)
  await page.goto('/_kit/l0')
  await settle(page)
  await expect(page.locator('main')).toHaveScreenshot('l0.png', { fullPage: true })
})

for (const kit of KITS) {
  test(`kit ${kit}`, async ({ page }) => {
    await prepare(page)
    await page.goto(`/_kit/${kit}`)
    await settle(page)
    expect(await isPending(page, kit), `${kit} renders its placeholder`).toBe(false)
    await expect(section(page, kit)).toHaveScreenshot(`${kit}.png`)
  })
}

test('kit is 404 for an unknown kit', async ({ page }) => {
  const res = await page.goto('/_kit/nope')
  expect(res?.status()).toBe(404)
})
