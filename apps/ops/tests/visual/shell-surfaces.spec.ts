import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'
import { prepare, settle } from './helpers'

/**
 * Committed baselines of the shell surfaces (S02-T06), each open over the Today placeholder for the Owner at
 * 1440 × 940: command bar with a recognised reference, notifications, the Assistant panel, the Why? drawer
 * (neutral fixture evidence), help, and the banner strip (fixture banners). The people come from the
 * database, so the sidebar's identity line, the avatar row and the placeholder's "Signed in as" line are
 * masked, as in appshell.spec.ts.
 */

async function ready(page: Page) {
  await prepare(page)
  await page.goto('/today')
  await expect(page.locator('main#content h1')).toBeVisible()
  await page.waitForFunction(() => {
    const t = document.querySelector('[data-part="sidebar-toggle"]')
    return t !== null && Object.keys(t).some((k) => k.startsWith('__reactProps'))
  })
  await settle(page)
}

async function shot(page: Page, name: string) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))
  const sidebar = page.locator('[data-part="sidebar"]')
  await expect(page).toHaveScreenshot(`shell-surfaces-${name}.png`, {
    mask: [
      sidebar.getByText(/^Signed in as /),
      sidebar.locator('[data-part="profile-trigger"]'),
      page.locator('#content').getByText(/^Signed in as /),
    ],
  })
}

/**
 * Press `key` until `target` shows: the window's hotkey listener is bound in an effect just after
 * hydration, so a key pressed in that instant is not seen.
 */
async function pressUntil(page: Page, key: string, target: ReturnType<Page['locator']>) {
  await expect(async () => {
    if (!(await target.isVisible())) await page.keyboard.press(key)
    await expect(target).toBeVisible({ timeout: 1000 })
  }).toPass()
}

async function command(page: Page, text: string) {
  await pressUntil(page, 'ControlOrMeta+k', page.getByRole('combobox'))
  await page.getByRole('combobox').fill(text)
}

test('shell-surfaces command bar', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await ready(page)
  await command(page, 'INDUS/Q10001-R2')
  await expect(page.getByRole('group', { name: 'Recognised reference' })).toBeVisible()
  await shot(page, 'command-bar')
})

test('shell-surfaces notifications', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await ready(page)
  await command(page, 'notifications')
  await page.keyboard.press('Enter')
  await expect(page.getByText('No notifications yet', { exact: false })).toBeVisible({
    timeout: 15_000,
  })
  await shot(page, 'notifications')
})

test('shell-surfaces assistant panel', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await ready(page)
  await command(page, 'assistant panel')
  await page.keyboard.press('Enter')
  await expect(page.getByText('Nothing yet today.')).toBeVisible({ timeout: 15_000 })
  await shot(page, 'assistant-panel')
})

test('shell-surfaces why drawer', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await ready(page)
  await page.evaluate(() => {
    ;(window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push(
      '/why/00000000-0000-7000-8000-00000000e001'
    )
  })
  await expect(page.getByRole('dialog', { name: /Line 1/ })).toBeVisible({ timeout: 20_000 })
  await shot(page, 'why-drawer')
})

test('shell-surfaces help', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await ready(page)
  await page.locator('#content').focus()
  await pressUntil(page, '?', page.getByRole('complementary', { name: 'Help' }))
  await expect(page.getByText('No articles for this page yet.')).toBeVisible({ timeout: 15_000 })
  await shot(page, 'help')
})

test('shell-surfaces banners', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.context().addCookies([
    {
      name: 'ops_fixture_banners',
      value: '1',
      domain: new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100').hostname,
      path: '/',
    },
  ])
  await ready(page)
  await expect(page.getByRole('button', { name: '+2 more' })).toBeVisible()
  await shot(page, 'banners')
})
