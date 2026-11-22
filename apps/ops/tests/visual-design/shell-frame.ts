import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import { PNG } from 'pngjs'
import type { Mask } from './compare'
import { boardPngPath } from './reference'

/**
 * Full-frame parity for a console screen inside AppShell against a 1440 × 940 board PNG (S02-T04, reused by
 * every later screen). The board draws a 1px frame line round the page, so its page is the 1438 × 938 box
 * at (1, 1): ours is rendered in a 1438 × 938 viewport and compared with that crop, pixel for pixel.
 *
 * The sidebar has its own parity specs (sidebar.spec.ts, appshell.spec.ts); here it is aligned the same way
 * they align it, with the same decided differences taken out:
 * - Money (C10) is a row the boards never drew. Its band is cut out of our sidebar column and the rows
 *   below it moved up to the flex spacer, whose blank rows refill the gap: the foot stays pinned.
 * - The logo slot (nothing is copied from the handoff), the identity line and the avatar row (people come
 *   from the database) and the three badge pills (live counts are zero locally) are masked.
 */
export const FRAME = { x: 1, y: 1, w: 1438, h: 938 }

export interface Framed {
  /** Our screenshot with the sidebar aligned to the board's. */
  ours: Buffer
  /** The board's page crop. */
  board: Buffer
  /** Sidebar masks (logo, identity, badges, profile) in frame coordinates. */
  masks: Mask[]
}

interface SidebarGeometry {
  width: number
  moneyTop: number
  moneyBottom: number
  spacerTop: number
  logo: Mask
  identity: Mask
  badges: Mask[]
  profile: Mask
}

async function sidebarGeometry(page: Page): Promise<SidebarGeometry> {
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
      return { x: Math.floor(row.right - box.x - 34), y: Math.floor(row.y - box.y), w: 34, h: 32 }
    })
    return {
      width: Math.round(box.width),
      moneyTop: Math.round(money.top - box.top),
      moneyBottom: Math.round(money.bottom - box.top + gap),
      spacerTop: Math.round(spacer.top - box.top),
      logo: rel(q('[data-shell-logo]')),
      identity: rel(identity.getBoundingClientRect()),
      badges,
      profile: rel(q('[data-part="profile-trigger"]')),
    }
  })
}

/** Screenshot the page, align its sidebar to the board's and crop the board's page. */
export async function framed(page: Page, boardFile: string): Promise<Framed> {
  const g = await sidebarGeometry(page)
  const shot = PNG.sync.read(
    await page.screenshot({
      animations: 'disabled',
      caret: 'hide',
      clip: { x: 0, y: 0, width: FRAME.w, height: FRAME.h },
    })
  )
  // Cut Money's band out of the sidebar column; the rows up to the spacer move up by its height and the
  // spacer's first (blank) row fills the rows they leave.
  const band = g.moneyBottom - g.moneyTop
  const out = new PNG({ width: shot.width, height: shot.height })
  PNG.bitblt(shot, out, 0, 0, shot.width, shot.height, 0, 0)
  PNG.bitblt(shot, out, 0, g.moneyBottom, g.width, g.spacerTop - g.moneyBottom, 0, g.moneyTop)
  for (let y = g.spacerTop - band; y < g.spacerTop; y++)
    PNG.bitblt(shot, out, 0, g.spacerTop, g.width, 1, 0, y)

  const src = PNG.sync.read(readFileSync(boardPngPath(boardFile)))
  const board = new PNG({ width: FRAME.w, height: FRAME.h })
  PNG.bitblt(src, board, FRAME.x, FRAME.y, FRAME.w, FRAME.h, 0, 0)

  return {
    ours: PNG.sync.write(out),
    board: PNG.sync.write(board),
    masks: [g.logo, g.identity, ...g.badges, g.profile],
  }
}

/**
 * The navy note the L2 template boards pin to their bottom right ("T1 · Index list …"): canvas
 * annotation, not product. The box (1083, 852.3, 340 × 72.7 on the board) and its shadow, in frame
 * coordinates.
 */
export const TEMPLATE_NOTE: Mask = { x: 1066, y: 840, w: 372, h: 98 }
