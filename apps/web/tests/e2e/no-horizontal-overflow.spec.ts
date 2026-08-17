import { expect, test } from '@playwright/test'

/**
 * No storefront page may scroll sideways.
 *
 * This class of bug is invisible to everything else we run. A screenshot is as
 * wide as the document, so a page that scrolls horizontally looks perfectly
 * fine in one; typecheck, lint and unit tests never lay anything out. The only
 * honest check is `scrollWidth === clientWidth`, measured at several widths —
 * a bleed routinely appears at one breakpoint and not its neighbours.
 *
 * A sweep on 2026-08-17 found 45 of these across the storefront. One of them —
 * an inline `minWidth` on the header search — made EVERY page scroll sideways
 * at ~1024px, and had been live for the whole of the v2 migration without
 * anyone noticing.
 *
 * The three causes worth checking first when this fails:
 *   1. an inline `style` (minWidth, gridTemplateColumns) beats every responsive
 *      class — it is banned outside packages/pdf and packages/email for this;
 *   2. a `grid` with no UNPREFIXED grid-template-columns gets one implicit
 *      column sized max-content, so it grows to its widest child rather than
 *      the viewport — `grid-cols-1` is `repeat(1, minmax(0,1fr))`;
 *   3. grid and flex items default to `min-width: auto` and refuse to shrink
 *      below their content, which also stops any inner `overflow-x-auto` from
 *      ever clipping — `min-w-0` on the item is the fix.
 */

const ROUTES = [
  '/',
  '/services',
  '/c',
  '/brands',
  '/industries',
  '/blog',
  '/blog/c/specification-standards',
  '/blog/author/anjali-krishnan',
  // The article template is the widest layout on the storefront — three
  // columns, a comparison table and an SOP table — so it is the one most
  // likely to bleed. /blog/page/[n] still needs a second page of posts.
  '/blog/identify-any-hydraulic-fitting',
  '/about',
  '/contact',
  '/quote',
  '/search?q=valve&sort=price_asc',
  '/compare',
  '/replacement',
  '/sign-in',
  '/sign-up',
  '/terms',
  '/privacy',
  '/returns',
  '/shipping',
  '/warranty',
]

/** 320 is an iPhone SE; 1024 is where the header bug lived. */
const WIDTHS = [1440, 1280, 1024, 834, 768, 430, 390, 360, 320]

test.describe('storefront never scrolls sideways', () => {
  for (const route of ROUTES) {
    test(`${route} fits every width`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
      expect(response?.status(), `${route} did not load`).toBeLessThan(400)

      const failures: string[] = []

      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 })
        // Let container queries and any resize listeners settle.
        await page.waitForTimeout(150)

        const result = await page.evaluate(() => {
          const de = document.documentElement
          const overflow = de.scrollWidth - de.clientWidth
          if (overflow <= 1) return null

          // Name the widest offender that is NOT inside a scroll container —
          // a child of an overflow-x-auto element exceeding it is correct.
          const inScroller = (el: Element): boolean => {
            let p = el.parentElement
            while (p && p !== document.body) {
              const ox = getComputedStyle(p).overflowX
              if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true
              p = p.parentElement
            }
            return false
          }

          let worst = ''
          let worstRight = 0
          for (const el of Array.from(document.querySelectorAll('*'))) {
            const b = el.getBoundingClientRect()
            if (b.width > 0 && b.right > de.clientWidth + 1 && !inScroller(el)) {
              if (b.right > worstRight) {
                worstRight = b.right
                worst = `${el.tagName}.${(el.className || '').toString().split(/\s+/).slice(0, 3).join('.')}`
              }
            }
          }
          return { overflow, worst }
        })

        if (result) {
          failures.push(`@${width}px: +${result.overflow}px — ${result.worst || '(no single element; check for an unconstrained grid track)'}`)
        }
      }

      expect(failures, `${route} scrolls horizontally:\n  ${failures.join('\n  ')}`).toEqual([])
    })
  }
})
