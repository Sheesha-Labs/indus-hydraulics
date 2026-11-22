import type { Locator, Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToReference, type Mask } from './compare'
import { hasReference } from './reference'
import { FRAME, framed, TEMPLATE_NOTE } from './shell-frame'

/**
 * Template design parity (S02-T04): each specimen /_kit/templates/<t> (inside AppShell, signed in as the
 * Owner) against templates/png/<T>.png, full frame inside the board's frame line (shell-frame.ts).
 *
 * Masks, each with its reason. Shared by every board: the sidebar's (shell-frame.ts) and, on the five
 * boards that carry it, the navy template note (canvas annotation). Per board, MASKS below lists the
 * areas whose content differs only because the fixtures are neutral, kept to the element that differs.
 */
type MaskSpec = { why: string } & (
  | {
      at: Locator
      /** Widen the box to the right (a neutral word shorter than the board's). */
      right?: number
    }
  | { box: Mask }
)

interface Board {
  slug: string
  board: string
  note: boolean
  /** Areas of ours to leave out, with the reason; each resolves to the boxes of a locator. */
  masks?: (page: Page) => MaskSpec[]
  /**
   * Rows taken out of one side in one column band: the rows below move up and the band's last row refills
   * the foot. For a decided difference that changes a height (board side), or to align a board whose
   * capture sets the page a row or two above the DOM it was drawn from (ours side, blank rows only).
   */
  cuts?: Cut[]
}

interface Cut {
  side: 'ours' | 'board'
  why: string
  x: number
  w: number
  y: number
  h: number
}

/** The main column of the frame, right of the 236 sidebar. */
const MAIN = { x: 236, w: 1202 }

/**
 * The record boards (T2A, T2B, T5A, T6A) are captured a row above the DOM they were drawn from (the L2
 * sheet's DOM, measured, puts every part where ours is; the PNG has the main column one row higher, as
 * S02-T02 found for its header crops). One blank row of our top padding, above the crumb row, is taken out
 * so the main column compares aligned (measured: 0.026 → 0.014 on T2A; a second row makes it worse).
 */
const RECORD_ALIGN: Cut[] = [
  {
    side: 'ours',
    why: 'record board captured a row high: blank row above the crumb',
    ...MAIN,
    y: 4,
    h: 1,
  },
]

/**
 * The record header and strip on T2A, T2B, T5A and T6A: the client and reference in the crumb, the serif
 * title, the meta values and the strip sentence are neutral words (fixtures.ts HEADERS) against the board's
 * names and figures. The header's structure (crumb row, buttons, stage track, tabs, strip) is compared.
 */
function recordMasks(page: Page): MaskSpec[] {
  const header = page.locator('[data-part="record-header"]')
  return [
    {
      why: 'neutral client and reference in the crumb',
      at: header.locator('nav[aria-label="Breadcrumb"] > :nth-child(n+3)'),
      right: 40,
    },
    { why: 'neutral record title', at: header.locator('h1') },
    { why: 'neutral meta values', at: header.locator('h1 + div') },
    { why: 'neutral strip sentence', at: page.locator('[data-part="assistant-strip-did"]') },
  ]
}

const BOARDS: Board[] = [
  { slug: 't1a', board: 'T1A.png', note: true },
  { slug: 't1b', board: 'T1B.png', note: false },
  { slug: 't2a', board: 'T2A.png', note: true, masks: recordMasks, cuts: RECORD_ALIGN },
  {
    slug: 't2b',
    board: 'T2B.png',
    note: false,
    masks: (page) => [
      ...recordMasks(page),
      {
        why: 'axis head: the board sets each week label on two lines (its runtime pads the label twice)',
        at: page.locator('[data-template="T2"] [role="img"] > div:first-child'),
      },
    ],
    cuts: [
      ...RECORD_ALIGN,
      // The Gantt axis head is 47 high on the board and 32 in ours (above): its second label line is
      // taken out of the board's tab column so the rows, the landed-cost table and its foot compare
      // aligned. In board rows (the board is not shifted).
      {
        side: 'board',
        why: 'Gantt axis head second line (board only)',
        x: 237,
        w: 836,
        y: 286,
        h: 15,
      },
    ],
  },
  {
    slug: 't3a',
    board: 'T3A.png',
    note: true,
    masks: (page) => [
      {
        why: 'neutral email body (fixtures/mail) inside the sandboxed frame',
        at: page.locator('[data-slot="reading"] iframe'),
      },
      {
        why: 'neutral sender, address and subject values in the message head',
        at: page.locator('[data-slot="reading"] dl dd'),
      },
    ],
  },
  {
    slug: 't4a',
    board: 'T4A.png',
    note: true,
    masks: (page) => [
      {
        why: 'one primary per view: the queue buttons are secondary (the board draws five primaries)',
        at: page.locator('[data-slot="queue"] [data-part="needs-row"] a'),
      },
    ],
  },
  {
    slug: 't5a',
    board: 'T5A.png',
    note: true,
    cuts: RECORD_ALIGN,
    masks: (page) => [
      ...recordMasks(page),
      {
        why: 'the board draws a classic scrollbar at the well edge; headless Chromium overlays it',
        box: { x: 786, y: 248, w: 12, h: 690 },
      },
      {
        why: "the A4 page: the board prints the company's own letterhead, address and bank details (never copied); ours is the neutral letterhead, whose height moves every line below it (the page itself is the Document kit's L1 parity)",
        at: page.locator('[data-slot="well"] [data-doc-frame]'),
      },
    ],
  },
  {
    slug: 't6a',
    board: 'T6A.png',
    note: false,
    cuts: RECORD_ALIGN,
    masks: (page) => [
      ...recordMasks(page),
      {
        why: "the board's Stat prints the total as a plain row ('Landed=AED …', its runtime splits the pair at the first '='); ours draws the kit's total row",
        at: page.locator('[data-slot="aside"] dl'),
      },
    ],
  },
]

/** Take `h` rows at `y` out of the band [x, x + w) and refill the band's foot with its last row. */
function cutRows(png: Buffer, c: Cut): Buffer {
  const src = PNG.sync.read(png)
  const out = PNG.sync.read(png)
  const below = src.height - (c.y + c.h)
  PNG.bitblt(src, out, c.x, c.y + c.h, c.w, below, c.x, c.y)
  for (let y = src.height - c.h; y < src.height; y++)
    PNG.bitblt(src, out, c.x, src.height - 1, c.w, 1, c.x, y)
  return PNG.sync.write(out)
}

async function boxes(m: MaskSpec): Promise<Mask[]> {
  if ('box' in m) return [m.box]
  const out: Mask[] = []
  for (const el of await m.at.all()) {
    const b = await el.boundingBox()
    if (!b) continue
    out.push({
      x: Math.floor(b.x),
      y: Math.floor(b.y),
      w: Math.ceil(b.width) + 1 + (m.right ?? 0),
      h: Math.ceil(b.height) + 1,
    })
  }
  return out
}

test.describe('Template design parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')

  for (const b of BOARDS) {
    test(`template ${b.board.replace('.png', '')}`, async ({ page, signedInAs }) => {
      await signedInAs('owner')
      await page.setViewportSize({ width: FRAME.w, height: FRAME.h })
      await prepare(page)
      await page.goto(`/_kit/templates/${b.slug}`)
      await page.locator('[data-template]').first().waitFor()
      await settle(page)
      const f = await framed(page, b.board)
      const extra: Mask[] = []
      for (const m of b.masks?.(page) ?? []) extra.push(...(await boxes(m)))
      const masks = [...f.masks, ...(b.note ? [TEMPLATE_NOTE] : []), ...extra]
      let { ours, board } = f
      // Bottom-most first, so each cut's y is in the side's original rows.
      for (const c of [...(b.cuts ?? [])].sort((p, q) => q.y - p.y)) {
        if (c.side === 'ours') ours = cutRows(ours, c)
        else board = cutRows(board, c)
      }
      const { ratio, size } = compareToReference(ours, board, {
        name: `template-${b.slug}`,
        masks,
      })
      console.log(
        `${b.board} full frame: diff ${ratio.toFixed(4)} (${size}, ${masks.length} masks)`
      )
      expect(ratio).toBeLessThanOrEqual(0.02)
    })
  }
})
