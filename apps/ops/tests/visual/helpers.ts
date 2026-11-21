import type { Locator, Page } from '@playwright/test'

/** The fixed moment every visual test runs at. */
export const FROZEN_AT = new Date('2026-11-20T06:00:00Z')

/** Freeze the clock and wait for fonts. Nothing is injected into the page. */
export async function prepare(page: Page): Promise<void> {
  await page.clock.setFixedTime(FROZEN_AT)
}

export async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
}

export function section(page: Page, id: string): Locator {
  return page.locator(`[data-kit-section="${id}"]`)
}

/** True while a kit section still renders its "pending" placeholder. */
export async function isPending(page: Page, id: string): Promise<boolean> {
  return (await section(page, id).getAttribute('data-kit-status')) === 'pending'
}
