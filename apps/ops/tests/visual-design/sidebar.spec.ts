import { readFileSync } from 'node:fs'
import { expect, test, type Locator } from '@playwright/test'
import { PNG } from 'pngjs'
import { prepare, settle } from '../visual/helpers'
import { compareToReference, type Mask } from './compare'
import {
  boardPngPath,
  captureElement,
  closeReference,
  hasReference,
  openReference,
} from './reference'

/**
 * Sidebar design parity (S02-T01): the four sidebars of the L1 k00 row, one by one, and the Owner sidebar of
 * board 74 against its crop of screens/png/74.png.
 *
 * Two decided differences are taken out before comparing, on both sides:
 * - Money (C10) is a row the handoff never drew. Its band (the item plus the 2px / 4px flex gap after it) is
 *   cut out of our screenshot, which then has the reference's height.
 * - The logo: nothing is copied from the handoff, so the slot ([data-shell-logo]) is masked.
 * What remains is neutral text ("Owner Sample" for the handoff's names), the ⌘ glyph (Playwright's desktop
 * profile reports Windows, so Kbd prints Ctrl+K) and self-hosted variable Geist against the sheet's static
 * Google instances. Per sidebar 0.03 (the Helper's two-line identity rounds a pixel differently), 0.02 for
 * the row and for board 74.
 */

/** Board 74: the Owner sidebar sits inside the board's frame border at x 34, y 137, 236 × 778. */
const BOARD_74_CROP = { x: 34, y: 137, w: 236, h: 778 }

interface Shot {
  png: Buffer
  masks: Mask[]
}

/**
 * Screenshot one sidebar, cut Money's band out and return the logo mask (relative to the sidebar).
 * `element` captures as Playwright captures the sheet's elements (the box rounded outwards); `board` clips
 * at the box rounded to whole pixels, as the board PNG is cropped.
 */
async function sidebarShot(sidebar: Locator, capture: 'element' | 'board'): Promise<Shot> {
  const geo = await sidebar.evaluate((el) => {
    const box = el.getBoundingClientRect()
    const money = el.querySelector('[data-nav="money"]')!.getBoundingClientRect()
    const gap = parseFloat(getComputedStyle(el).rowGap) || 0
    const logo = el.querySelector('[data-shell-logo]')?.getBoundingClientRect()
    return {
      clip: { x: box.x + scrollX, y: box.y + scrollY, width: box.width, height: box.height },
      top: money.top - box.top,
      bottom: money.bottom - box.top + gap,
      logo: logo && { x: logo.x - box.x, y: logo.y - box.y, w: logo.width, h: logo.height },
    }
  })
  const c = geo.clip
  const opts = { animations: 'disabled', caret: 'hide' } as const
  const raw =
    capture === 'element'
      ? await sidebar.screenshot(opts)
      : await sidebar.page().screenshot({
          ...opts,
          fullPage: true,
          clip: {
            x: Math.round(c.x),
            y: Math.round(c.y),
            width: Math.round(c.width),
            height: Math.round(c.height),
          },
        })
  const shot = PNG.sync.read(raw)
  const y0 = Math.round(geo.top)
  const y1 = Math.round(geo.bottom)
  const out = new PNG({ width: shot.width, height: shot.height - (y1 - y0) })
  PNG.bitblt(shot, out, 0, 0, shot.width, y0, 0, 0)
  PNG.bitblt(shot, out, 0, y1, shot.width, shot.height - y1, 0, y0)
  const masks: Mask[] = geo.logo
    ? [
        {
          x: Math.floor(geo.logo.x),
          y: Math.floor(geo.logo.y),
          w: Math.ceil(geo.logo.w) + 1,
          h: Math.ceil(geo.logo.h) + 1,
        },
      ]
    : []
  return { png: PNG.sync.write(out), masks }
}

function cropPng(file: string, r: typeof BOARD_74_CROP): Buffer {
  const src = PNG.sync.read(readFileSync(file))
  const out = new PNG({ width: r.w, height: r.h })
  PNG.bitblt(src, out, r.x, r.y, r.w, r.h, 0, 0)
  return PNG.sync.write(out)
}

test.describe('Sidebar design parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')
  test.afterAll(closeReference)

  test('L1 k00 sidebar', async ({ page, context }) => {
    await prepare(page)
    await page.goto('/_kit/l1')
    await settle(page)
    await captureElement(page, '[data-kit-section="k00"] [data-kit-part="spec"]')
    const ours = page.locator(
      '[data-kit-section="k00"] [data-kit-row="Sidebar"] [data-part="sidebar"]'
    )
    await expect(ours).toHaveCount(4)
    const shots: Shot[] = []
    for (let i = 0; i < 4; i++) shots.push(await sidebarShot(ours.nth(i), 'element'))

    const refPage = await context.newPage()
    await openReference(refPage, 'L1 Component Sheet.dc.html')
    const refs: Buffer[] = []
    for (let i = 1; i <= 4; i++)
      refs.push(
        await captureElement(
          refPage,
          `#k00 > .cv-spec > .cv-sr:first-child .cv-rw > :nth-child(${i})`
        )
      )
    await refPage.close()

    const names = ['owner', 'helper-paused', 'collapsed-tip', 'owner-menu']
    let changed = 0
    let total = 0
    for (let i = 0; i < 4; i++) {
      const { ratio, size } = compareToReference(shots[i]!.png, refs[i]!, {
        name: `l1-k00-sidebar-${names[i]}`,
        masks: shots[i]!.masks,
      })
      const { width, height } = PNG.sync.read(refs[i]!)
      changed += ratio * width * height
      total += width * height
      console.log(`L1 k00 sidebar ${names[i]}: diff ${ratio.toFixed(4)} (${size})`)
      expect(ratio, names[i]).toBeLessThanOrEqual(0.03)
    }
    console.log(`L1 k00 sidebar row: diff ${(changed / total).toFixed(4)}`)
    expect(changed / total).toBeLessThanOrEqual(0.02)
  })

  test('board 74 sidebar', async ({ page }) => {
    await prepare(page)
    await page.goto('/_kit/shell')
    await settle(page)
    await captureElement(page, '[data-kit-section="shell"] [data-kit-part="spec"]')
    // The board was drawn with its frame 0.11px above the pixel grid (its borders and rows snap a pixel
    // higher than an aligned render would): the same sub-pixel offset is given to ours before capturing.
    const frame = page.locator('[data-board-74="owner"]')
    await frame.evaluate((el: HTMLElement) => {
      el.style.translate = `0 ${-0.11 - (el.getBoundingClientRect().y % 1)}px`
    })
    const shot = await sidebarShot(frame.locator('[data-part="sidebar"]'), 'board')
    const ref = cropPng(boardPngPath('74.png'), BOARD_74_CROP)
    const { ratio, size } = compareToReference(shot.png, ref, {
      name: 'board-74-sidebar-owner',
      masks: shot.masks,
    })
    console.log(
      `board 74 sidebar (crop x${BOARD_74_CROP.x} y${BOARD_74_CROP.y} ${BOARD_74_CROP.w}×${BOARD_74_CROP.h}): diff ${ratio.toFixed(4)} (${size})`
    )
    expect(ratio).toBeLessThanOrEqual(0.02)
  })
})
