import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToReference, type Mask } from './compare'
import { boardPngPath, hasReference } from './reference'

/**
 * AppShell design parity (S02-T03): the sidebar column of templates/png/T8A.png against the console's own
 * sidebar around the Today placeholder. Today itself is S07, so only the column is compared.
 *
 * The board draws a 1px frame round the page, so its sidebar is the 236 × 938 box at (1, 1): ours is
 * rendered in a 938-high viewport so its flex column has the same height.
 *
 * Decided differences, taken out on both sides:
 * - Money (C10) is a row the board never drew. The column is compared in two parts, each aligned on its own
 *   anchor: the top (identity to Assistant log) with Money's band cut out of ours, and the foot (pill,
 *   Settings, avatar), which is pinned to the bottom. The flex spacer between them differs by Money's band.
 * - The logo slot: nothing is copied from the handoff ([data-shell-logo] is masked).
 * - People and counts come from the database: the identity line, the avatar row and the three badge
 *   pills (live counts are zero in S02, the board shows 6 / 14 / 3) are masked.
 */

const BOARD = { x: 1, y: 1, w: 236, h: 938 }

interface Geometry {
  width: number
  height: number
  moneyTop: number
  moneyBottom: number
  spacerTop: number
  footTop: number
  logo: Mask
  identity: Mask
  badges: Mask[]
  profile: Mask
}

async function geometry(page: Page): Promise<Geometry> {
  return page.locator('[data-part="sidebar"]').evaluate((el) => {
    const box = el.getBoundingClientRect()
    const rel = (r: DOMRect) => ({
      x: Math.floor(r.x - box.x),
      y: Math.floor(r.y - box.y),
      w: Math.ceil(r.width) + 1,
      h: Math.ceil(r.height) + 1,
    })
    const q = (s: string) => el.querySelector(s)!.getBoundingClientRect()
    const gap = parseFloat(getComputedStyle(el).rowGap) || 0
    const money = q('[data-nav="money"]')
    const spacer = el.querySelector(':scope > [aria-hidden="true"].flex-1')!.getBoundingClientRect()
    const identity = [...el.querySelectorAll('span')].find((s) =>
      s.textContent?.startsWith('Signed in as')
    )!
    const badges = ['today', 'review', 'mail'].map((k) => {
      const row = q(`[data-nav="${k}"]`)
      // The badge sits at the row's right end; the board's widest (14) is 24 wide.
      return { x: Math.floor(row.right - box.x - 34), y: Math.floor(row.y - box.y), w: 34, h: 32 }
    })
    return {
      width: Math.round(box.width),
      height: Math.round(box.height),
      moneyTop: Math.round(money.top - box.top),
      moneyBottom: Math.round(money.bottom - box.top + gap),
      spacerTop: Math.round(spacer.top - box.top),
      footTop: Math.round(spacer.bottom - box.top),
      logo: rel(q('[data-shell-logo]')),
      identity: rel(identity.getBoundingClientRect()),
      badges,
      profile: rel(q('[data-part="profile-trigger"]')),
    }
  })
}

/** Stack rows [y0, y1) of each source image into one PNG of the given width. */
function stack(width: number, parts: Array<{ png: PNG; x: number; y0: number; y1: number }>): PNG {
  const height = parts.reduce((h, p) => h + (p.y1 - p.y0), 0)
  const out = new PNG({ width, height })
  let y = 0
  for (const p of parts) {
    PNG.bitblt(p.png, out, p.x, p.y0, width, p.y1 - p.y0, 0, y)
    y += p.y1 - p.y0
  }
  return out
}

test.describe('AppShell design parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')

  test('T8A sidebar column', async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await page.setViewportSize({ width: 1440, height: BOARD.h })
    await prepare(page)
    await page.goto('/today')
    await settle(page)
    const g = await geometry(page)
    expect(g.height).toBe(BOARD.h)
    const ours = PNG.sync.read(
      await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
        clip: { x: 0, y: 0, width: g.width, height: g.height },
      })
    )
    const board = PNG.sync.read(readFileSync(boardPngPath('T8A.png')))
    const footH = g.height - g.footTop
    const topH = g.spacerTop - (g.moneyBottom - g.moneyTop)

    // Ours: top with Money cut out, then the foot. The board: the same heights from its top and bottom.
    const oursPng = stack(g.width, [
      { png: ours, x: 0, y0: 0, y1: g.moneyTop },
      { png: ours, x: 0, y0: g.moneyBottom, y1: g.spacerTop },
      { png: ours, x: 0, y0: g.footTop, y1: g.height },
    ])
    const boardPng = stack(BOARD.w, [
      { png: board, x: BOARD.x, y0: BOARD.y, y1: BOARD.y + topH },
      { png: board, x: BOARD.x, y0: BOARD.y + BOARD.h - footH, y1: BOARD.y + BOARD.h },
    ])

    // Masks in the stacked frame: everything above Money keeps its y; the foot moves up to topH.
    const footShift = topH - g.footTop
    const masks: Mask[] = [
      g.logo,
      g.identity,
      ...g.badges,
      { ...g.profile, y: g.profile.y + footShift },
    ]
    const { ratio, size } = compareToReference(PNG.sync.write(oursPng), PNG.sync.write(boardPng), {
      name: 'appshell-t8a-sidebar',
      masks,
    })
    console.log(
      `T8A sidebar column (board x${BOARD.x} y${BOARD.y} ${BOARD.w}×${BOARD.h}, top ${topH} + foot ${footH}): diff ${ratio.toFixed(4)} (${size})`
    )
    // 0.03, as the sidebar's own L1 parity: what remains is the board's rhythm between the search and the
    // first group (2px tighter on T8A than on board 74, which the sidebar matches at 0.02) and self-hosted
    // variable Geist against the board's static instances.
    expect(ratio).toBeLessThanOrEqual(0.03)
  })
})
