import type { Locator, Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToReference, type Mask } from './compare'
import { hasReference } from './reference'
import { bareFramed, FRAME, framed, TEMPLATE_NOTE } from './shell-frame'

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
      /** Extend the box downwards (a region the board draws taller). */
      down?: number
    }
  | { box: Mask }
)

interface Board {
  slug: string
  board: string
  note: boolean
  /** Rendered outside AppShell (T9 centred, T11, T12): no sidebar to align, no session needed. */
  bare?: boolean
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

/** The needs-you buttons on T8A: secondary here, as T4A's queue buttons (one primary per view). */
function needsYouButtons(page: Page): MaskSpec {
  return {
    why: 'one primary per view: the needs-you buttons are secondary (the board draws four primaries)',
    at: page.locator('[data-slot="needs-you"] [data-part="needs-row"] a'),
  }
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
  { slug: 't7a', board: 'T7A.png', note: true },
  { slug: 't8a', board: 'T8A.png', note: false, masks: (page) => [needsYouButtons(page)] },
  { slug: 't10a', board: 'T10A.png', note: true },
  {
    slug: 't9a',
    board: 'T9A.png',
    note: false,
    bare: true,
    masks: (page) => [{ why: 'logo slot: nothing is copied from the handoff', at: logo(page) }],
  },
  {
    slug: 't11a',
    board: 'T11A.png',
    note: false,
    bare: true,
    masks: (page) => [
      { why: 'logo slot: nothing is copied from the handoff', at: logo(page) },
      {
        why: 'neutral sample address in the Email field',
        at: page.locator('input[name="email"]'),
      },
      {
        why: 'neutral domain and person in the footer sentence',
        at: page.locator('[data-slot="card"] > p:last-child'),
      },
    ],
  },
  {
    slug: 't12a',
    board: 'T12A.png',
    note: false,
    bare: true,
    masks: (page) => [
      { why: 'logo slot: nothing is copied from the handoff', at: logo(page) },
      {
        why: 'neutral contact and client in "Prepared for …"',
        at: page.locator('[data-slot="brand-bar"] > span:last-child'),
      },
      { why: 'neutral reference and title', at: page.locator('[data-slot="document"] > h1') },
      {
        why: 'C36: the client columns differ from the board BY DESIGN (no Supplier, no State column; "Price to follow" on line 4). The whole lines table is masked, and 96 rows below it: without the supplier column the descriptions no longer wrap, so the board draws the same table 96 rows taller',
        at: page.locator('[data-part="client-lines"]'),
        down: 96,
      },
      {
        why: "the board's Stat prints the total as a plain row ('Total=USD …', its runtime splits the pair at the first '='); ours draws the kit's total row, 8 rows taller (cut below)",
        at: page.locator('[data-slot="summary"] dl'),
      },
      {
        why: 'neutral contact address in the note',
        at: page.locator('[data-slot="note"] p'),
      },
    ],
    cuts: [
      // The board draws a browser address bar (38 rows) above the page: a picture of the browser, not
      // the page. Taken out of the board so the brand bar and everything under it compare aligned.
      { side: 'board', why: 'browser address bar (board only)', x: 0, w: FRAME.w, y: 0, h: 38 },
      // The kit's total row (rule + 13/500) is 8 rows taller than the board's plain row: 8 rows of the
      // masked totals are taken out of our right column so the buttons and the note compare aligned.
      {
        side: 'ours',
        why: "kit total row taller than the board's plain row",
        x: 1040,
        w: 346,
        y: 150,
        h: 8,
      },
    ],
  },
]

/** The product mark's logo slot on the out-of-shell specimens (shared.tsx `ProductMark`). */
const logo = (page: Page) => page.locator('[data-logo]')

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
      h: Math.ceil(b.height) + 1 + (m.down ?? 0),
    })
  }
  return out
}

test.describe('Template design parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')

  for (const b of BOARDS) {
    test(`template ${b.board.replace('.png', '')}`, async ({ page, signedInAs }) => {
      if (!b.bare) await signedInAs('owner')
      await page.setViewportSize({ width: FRAME.w, height: FRAME.h })
      await prepare(page)
      await page.goto(`/_kit/templates/${b.slug}`)
      await page.locator('[data-template]').first().waitFor()
      await settle(page)
      const f = b.bare
        ? { ...(await bareFramed(page, b.board)), masks: [] }
        : await framed(page, b.board)
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

/**
 * X1 has no L2 board (it is ours). Its page header is compared with board 195's (Ex-Dubai collection, the
 * first exception board): the 1202 × 61 band right of the sidebar, inside the frame line. The crumb, the
 * title and the right-hand chip (board 195 carries an Incoterm tag there) are neutral or board-specific
 * words, so they are masked; the band's height, ground, gutter and bottom rule are compared.
 */
test.describe('X1 header parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')

  test('template X1 header vs 195', async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await page.setViewportSize({ width: FRAME.w, height: FRAME.h })
    await prepare(page)
    await page.goto('/_kit/templates/x1')
    await page.locator('[data-template="X1"]').waitFor()
    await settle(page)
    const header = page.locator('[data-template="X1"] [data-part="page-header"]')
    const band = (await header.boundingBox())!
    const BAND = { x: Math.round(band.x), y: 0, w: FRAME.w - Math.round(band.x), h: 61 }
    const f = await bareFramed(page, '195.png')
    const cropBand = (png: Buffer) => {
      const src = PNG.sync.read(png)
      const out = new PNG({ width: BAND.w, height: BAND.h })
      PNG.bitblt(src, out, BAND.x, BAND.y, BAND.w, BAND.h, 0, 0)
      return PNG.sync.write(out)
    }
    const inBand = (m: Mask): Mask => ({ ...m, x: m.x - BAND.x, y: m.y - BAND.y })
    const masks: Mask[] = []
    for (const m of [
      {
        why: 'neutral order crumb',
        at: header.locator('h1').locator('xpath=preceding-sibling::span'),
        right: 40,
      },
      { why: 'neutral exception title', at: header.locator('h1'), right: 40 },
    ] satisfies MaskSpec[])
      masks.push(...(await boxes(m)).map(inBand))
    // The right-hand status: our chip against board 195's Incoterm tag (different words and widths).
    masks.push({ x: BAND.w - 200, y: 10, w: 200, h: 42 })
    const { ratio, size } = compareToReference(cropBand(f.ours), cropBand(f.board), {
      name: 'template-x1-header',
      masks,
    })
    console.log(`X1 header vs 195.png: diff ${ratio.toFixed(4)} (${size}, ${masks.length} masks)`)
    expect(ratio).toBeLessThanOrEqual(0.02)
  })
})
