import { readFileSync } from 'node:fs'
import { expect, test, type Locator } from '@playwright/test'
import { PNG } from 'pngjs'
import { prepare, settle } from '../visual/helpers'
import { compareToReference, recordParity, type Mask } from './compare'
import { boardPngPath, captureElement, closeReference, hasReference } from './reference'

/**
 * Record header design parity (S02-T02): the two cards of board 75 and the header region of templates T2A
 * and T2B, each against its crop of the board PNG. Ours are the /_kit/shell rows "Board 75" and
 * "T2A · T2B header", rendered with neutral words picked to set within a few pixels of the handoff's
 * (fixtures.ts HEADERS); what differs is those words and self-hosted variable Geist (latin subset: its →
 * and ↗ fall back to a system face) against the boards' static instances.
 *
 * Board 75: each card's inside (its 1px border excluded), the header and the Assistant strip under it.
 * T2A / T2B: the main column right of the 236 sidebar and its rule, inside the board's frame line, from
 * the top to the strip's rule. The T2 boards set the header without the console's line height (207 high
 * against board 75's 210, the same parts); the specimen frame recreates that. They are allowed 0.03, not
 * 0.02: the template boards also place the serif title a row higher and the meta row a row lower than
 * board 75 does inside the same 207, which no setting of the shared part reproduces without breaking
 * board 75 (the acceptance board). The rows are listed in the S02-T02 report.
 */
interface Crop {
  name: string
  board: string
  /** Inside the board PNG. */
  rect: { x: number; y: number; w: number; h: number }
  /** Our element; `inset` px of its own border are left out. */
  ours: string
  inset: number
  max: number
  /**
   * The fraction of a pixel by which our element's top is placed below the pixel grid before capturing
   * (a layout offset, so text snaps as it does on the board), found per crop by aligning the text rows.
   * The board lays its cards out at fractional positions (its reference page puts them at y 75.6 and
   * 406.4), so its rows round differently from a render aligned to whole pixels.
   */
  frac: number
  /** Rows left out on both sides, each with its reason in CROPS. */
  masks?: Mask[]
}

const CROPS: Crop[] = [
  {
    name: 'board-75-enquiry',
    board: '75.png',
    rect: { x: 34, y: 77, w: 1044, h: 250 },
    ours: '[data-board-75="enquiry"]',
    inset: 1,
    max: 0.02,
    frac: 0.6,
  },
  {
    name: 'board-75-order',
    board: '75.png',
    rect: { x: 34, y: 408, w: 1044, h: 251 },
    ours: '[data-board-75="order"]',
    inset: 1,
    max: 0.02,
    frac: 0.9,
    // The board draws this card one row taller than the enquiry card above it (211 rows from its top
    // border to the tab rule against 210) although both are the same component: its own sub-pixel rounding
    // puts the tab rule and the strip's bottom rule a row lower than any whole-pixel render can while the
    // text rows still align. Those two full-width rules (rows 209–210 and 249–250) are left out on both
    // sides; everything else in the card is compared.
    masks: [
      { x: 0, y: 209, w: 1044, h: 2 },
      { x: 0, y: 249, w: 1044, h: 2 },
    ],
  },
  {
    name: 'T2A-header',
    board: 'T2A.png',
    rect: { x: 237, y: 1, w: 1202, h: 247 },
    ours: '[data-template-header="T2A"]',
    inset: 0,
    max: 0.03,
    frac: 0.6,
  },
  {
    name: 'T2B-header',
    board: 'T2B.png',
    rect: { x: 237, y: 1, w: 1202, h: 247 },
    ours: '[data-template-header="T2B"]',
    inset: 0,
    max: 0.03,
    frac: 0.6,
  },
]

function cropPng(file: string, r: Crop['rect']): Buffer {
  const src = PNG.sync.read(readFileSync(file))
  const out = new PNG({ width: r.w, height: r.h })
  PNG.bitblt(src, out, r.x, r.y, r.w, r.h, 0, 0)
  return PNG.sync.write(out)
}

/** Screenshot `w` × `h` from the first whole pixel inside the element's `inset` border. */
async function shot(el: Locator, inset: number, w: number, h: number): Promise<Buffer> {
  const box = await el.evaluate((node, i) => {
    const r = node.getBoundingClientRect()
    return { x: r.x + scrollX + i, y: r.y + scrollY + i }
  }, inset)
  return el.page().screenshot({
    animations: 'disabled',
    caret: 'hide',
    fullPage: true,
    clip: { x: Math.ceil(box.x - 0.01), y: Math.ceil(box.y - 0.01), width: w, height: h },
  })
}

test.describe('Record header design parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')
  test.afterAll(closeReference)

  for (const c of CROPS) {
    test(`header ${c.name}`, async ({ page }) => {
      await prepare(page)
      await page.goto('/_kit/shell')
      await settle(page)
      // Sizes the viewport to the whole page first, so the capture does not re-lay it out.
      await captureElement(page, '[data-kit-section="shell"] [data-kit-part="spec"]')
      const el = page.locator(c.ours)
      await el.evaluate((node: HTMLElement, frac: number) => {
        const y = node.getBoundingClientRect().y + scrollY
        node.style.marginTop = `${(((frac - (y % 1)) % 1) + 1) % 1}px`
      }, c.frac)
      // The board's size is captured: a box a row shorter or taller than the board's shows as a diff.
      const ours = await shot(el, c.inset, c.rect.w, c.rect.h)
      const ref = cropPng(boardPngPath(c.board), c.rect)
      const { ratio, size } = compareToReference(ours, ref, {
        name: c.name,
        ...(c.masks ? { masks: c.masks } : {}),
      })
      const r = c.rect
      console.log(
        `${c.name} (crop x${r.x} y${r.y} ${r.w}×${r.h}): diff ${ratio.toFixed(4)} (${size})`
      )
      recordParity({
        board: c.name.startsWith('board-75') ? `75 ${c.name.slice(9)} header card` : c.name,
        group: c.name.startsWith('board-75') ? 'Boards 74/75' : 'Templates',
        ratio,
        area: `crop x${r.x} y${r.y} ${r.w}×${r.h}`,
        limit: c.max,
        note: c.name.startsWith('board-75')
          ? `Neutral words chosen to set within a few px of the board's; self-hosted variable Geist vs static.${c.masks ? ' Masked: the tab rule and strip rule rows the board draws one row lower (its sub-pixel rounding).' : ''}`
          : 'Header crop of the T2 board (the full frame is the Templates row). 0.03: the template boards place the serif title a row higher and the meta row a row lower than board 75 inside the same 207 (S02-T02); board 75 is the acceptance board.',
      })
      expect(ratio).toBeLessThanOrEqual(c.max)
    })
  }
})
