import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * axe on the kit specimens (CLAUDE.md §13.5): critical and serious findings fail. A kit joins this list
 * in the task that builds it; pending pages are only a placeholder line. Scope is the spec card (the
 * kit's own parts); the section head is the Shell kit's SectionHead, checked when S02 builds it.
 * Hydration finishes first, so client parts are scanned as users meet them.
 */
const BUILT_KITS = ['controls', 'status', 'overlay', 'table', 'card'] as const

for (const kit of BUILT_KITS) {
  test(`axe-kit ${kit}: no critical or serious findings`, async ({ page }) => {
    await page.goto(`/_kit/${kit}`, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const { violations } = await new AxeBuilder({ page })
      .include(`[data-kit-section="${kit}"] [data-kit-part="spec"]`)
      .analyze()
    const blocking = violations
      .filter((v) => v.impact === 'critical' || v.impact === 'serious')
      .map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    expect(blocking).toEqual([])
  })
}
