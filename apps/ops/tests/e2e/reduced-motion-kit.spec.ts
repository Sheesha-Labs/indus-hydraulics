import { expect, test, type Page } from '@playwright/test'

/**
 * Reduced motion (S01-T10, CLAUDE.md §4.8): under prefers-reduced-motion: reduce nothing moves — no running
 * animation or transition touches transform, translate, rotate or scale — while fades may stay, and focus
 * rings are untouched. Checked on every kit page at rest, then with the overlays that animate open (drawer
 * slide, toasts), and against the same page without the preference to prove the check sees motion.
 */
const KITS = [
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

/** Running animations and transitions that change a transform property, described for the failure. */
async function moving(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === 'running')
      .flatMap((a) => {
        const effect = a.effect as KeyframeEffect | null
        if (!effect) return []
        const props = new Set(
          effect.getKeyframes().flatMap((k) => Object.keys(k).filter((p) => k[p] !== undefined))
        )
        if (a instanceof CSSTransition) props.add(a.transitionProperty)
        const motion = [...props].filter((p) => /^(transform|translate|rotate|scale)$/.test(p))
        if (motion.length === 0) return []
        const el = effect.target as Element | null
        const name = a instanceof CSSAnimation ? a.animationName : 'transition'
        return [`${name} on ${el?.tagName.toLowerCase()}.${el?.className}: ${motion.join(', ')}`]
      })
  )
}

test.describe('reduced-motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  for (const kit of KITS) {
    test(`reduced-motion ${kit}: nothing moves at rest`, async ({ page }) => {
      await page.goto(`/_kit/${kit}`, { waitUntil: 'networkidle' })
      expect(await moving(page)).toEqual([])
    })
  }

  test('reduced-motion overlay: the drawer and toasts fade instead of sliding', async ({
    page,
  }) => {
    await page.goto('/_kit/overlay', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Toast with undo' }).click()
    await page.getByRole('button', { name: 'Why?' }).click()
    await expect(page.getByRole('dialog', { name: 'Why this supplier for line 5' })).toBeVisible()
    expect(await moving(page)).toEqual([])
    // The fades are still there: reduced motion keeps 100ms opacity changes.
    const fades = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a instanceof CSSAnimation && a.animationName === 'io-fade').length
    )
    expect(fades).toBeGreaterThan(0)
  })

  test('reduced-motion controls: focus rings remain', async ({ page }) => {
    await page.goto('/_kit/controls', { waitUntil: 'networkidle' })
    const button = page
      .locator('[data-kit-section="controls"] [data-kit-part="spec"] button')
      .first()
    await button.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(button).toBeFocused()
    const ring = await button.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(ring).not.toBe('none')
    expect(ring).toMatch(/0px 0px 0px 4px/)
  })
})

test('reduced-motion control: without the preference the spinners do rotate', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/_kit/controls', { waitUntil: 'networkidle' })
  expect((await moving(page)).some((m) => m.startsWith('io-spin'))).toBe(true)
})
