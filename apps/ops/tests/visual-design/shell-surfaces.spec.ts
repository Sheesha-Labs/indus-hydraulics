import { readFileSync } from 'node:fs'
import type { Locator, Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToReference, type Mask } from './compare'
import { boardPngPath, hasReference } from './reference'

/**
 * Shell surfaces design parity (S02-T06): each L3 board in shell/png against the surface opened in the
 * console. The boards draw their surfaces over pages later sprints build (Today S07, the enquiry cockpit
 * S09, Mail S05, Review S06), so what is compared is the sidebar and the surface frame; everything that
 * comes from data or from those pages is masked, and each mask is named here.
 *
 * Geometry: the boards draw a 1px frame round a 1438 × 938 page, so ours is rendered at 1438 × 938 and
 * placed at (1, 1) inside the board's own frame before comparing.
 *
 * Masks used by every board (the sidebar):
 * - the logo slot (nothing is copied from the handoff), the "Signed in as" line, the avatar row and the
 *   three badge pills (people and counts come from the database);
 * - the rows from Money (C10, a row the boards never drew) to the flex spacer, which sit one row lower in
 *   ours for that reason.
 * Per board, below: the page under the surface (not built in S02) and the surface's data rows.
 */

const W = 1438
const H = 938

interface SidebarGeometry {
  collapsed: boolean
  masks: Mask[]
}

/** Sidebar masks in board coordinates (ours + 1). */
async function sidebarMasks(page: Page): Promise<SidebarGeometry> {
  return page.locator('[data-part="sidebar"]').evaluate((el) => {
    const r = (b: DOMRect, pad = 1) => ({
      x: Math.floor(b.x) + 1 - pad,
      y: Math.floor(b.y) + 1 - pad,
      w: Math.ceil(b.width) + 2 * pad,
      h: Math.ceil(b.height) + 2 * pad,
    })
    const q = (s: string) => el.querySelector(s)?.getBoundingClientRect()
    const collapsed = el.hasAttribute('data-collapsed')
    const box = el.getBoundingClientRect()
    const out: Array<{ x: number; y: number; w: number; h: number }> = []
    const logo = q('[data-shell-logo]')
    if (logo) out.push(r(logo))
    const profile = q('[data-part="profile-trigger"]')
    if (profile) out.push(r(profile))
    const identity = [...el.querySelectorAll('span')].find((s) =>
      s.textContent?.startsWith('Signed in as')
    )
    if (identity) out.push(r(identity.getBoundingClientRect()))
    for (const k of ['today', 'review', 'mail']) {
      const row = q(`[data-nav="${k}"]`)
      if (row) out.push({ x: Math.floor(row.right) + 1 - 36, y: Math.floor(row.y), w: 38, h: 34 })
    }
    const money = q('[data-nav="money"]')
    const spacer = el.querySelector(':scope > [aria-hidden="true"].flex-1')?.getBoundingClientRect()
    if (money && spacer)
      out.push({
        x: 0,
        y: Math.floor(money.top),
        w: Math.ceil(box.width) + 2,
        h: Math.ceil(spacer.top - money.top) + 2,
      })
    return { collapsed, masks: out }
  })
}

/** The page column right of the sidebar, minus the rectangles that stay compared. */
function pageMasks(sidebarW: number, keep: Mask[]): Mask[] {
  // Horizontal bands between kept rectangles; each band masks the page column except the kept columns.
  const x0 = sidebarW + 1
  const x1 = 1440
  const ys = new Set<number>([0, 940])
  for (const k of keep) {
    ys.add(k.y)
    ys.add(k.y + k.h)
  }
  const edges = [...ys].sort((a, b) => a - b)
  const out: Mask[] = []
  for (let i = 0; i < edges.length - 1; i++) {
    const y = edges[i]!
    const h = edges[i + 1]! - y
    if (h <= 0) continue
    const cols = keep
      .filter((k) => k.y <= y && k.y + k.h >= y + h)
      .map((k) => [Math.max(x0, k.x), Math.min(x1, k.x + k.w)] as const)
      .sort((a, b) => a[0] - b[0])
    let x = x0
    for (const [a, b] of cols) {
      if (a > x) out.push({ x, y, w: a - x, h })
      x = Math.max(x, b)
    }
    if (x < x1) out.push({ x, y, w: x1 - x, h })
  }
  return out
}

/** Ours (1438 × 938) inside the board's own 1px frame. */
async function framed(page: Page, board: PNG): Promise<Buffer> {
  const ours = PNG.sync.read(await page.screenshot({ animations: 'disabled', caret: 'hide' }))
  const out = new PNG({ width: board.width, height: board.height })
  PNG.bitblt(board, out, 0, 0, board.width, board.height, 0, 0)
  PNG.bitblt(ours, out, 0, 0, W, H, 1, 1)
  return PNG.sync.write(out)
}

async function open(
  page: Page,
  signedInAs: (w: 'owner' | 'helper') => Promise<void>,
  who: 'owner' | 'helper' = 'owner',
  path = '/today'
) {
  await signedInAs(who)
  await page.setViewportSize({ width: W, height: H })
  await prepare(page)
  await page.goto(path)
  await expect(page.locator('main#content h1')).toBeVisible()
  await page.waitForFunction(() => {
    const t = document.querySelector('[data-part="sidebar-toggle"]')
    return t !== null && Object.keys(t).some((k) => k.startsWith('__reactProps'))
  })
  await settle(page)
}

async function still(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))
}

const results: string[] = []

/** The share of the frame the masks cover (overlaps counted once). */
function maskedShare(masks: Mask[], w: number, h: number): number {
  const hit = new Uint8Array(w * h)
  for (const m of masks)
    for (let y = Math.max(0, m.y); y < Math.min(h, m.y + m.h); y++)
      for (let x = Math.max(0, m.x); x < Math.min(w, m.x + m.w); x++) hit[y * w + x] = 1
  let n = 0
  for (const v of hit) n += v
  return n / (w * h)
}

/**
 * The two nav rows whose active state differs when the board is drawn on another page (an enquiry, Review):
 * ours is on Today. Both rows are masked.
 */
async function activeRows(page: Page, boardActive: string): Promise<Mask[]> {
  return page.evaluate(
    (keys) => {
      return keys.map((k) => {
        const b = document.querySelector(`[data-nav="${k}"]`)!.getBoundingClientRect()
        return {
          x: Math.floor(b.x),
          y: Math.floor(b.y),
          w: Math.ceil(b.width) + 2,
          h: Math.ceil(b.height) + 2,
        }
      })
    },
    ['today', boardActive]
  )
}

async function measure(
  page: Page,
  boardFile: string,
  keep: Mask[],
  extraMasks: Mask[] = [],
  boardActive?: string
): Promise<number> {
  await still(page)
  const extra = boardActive ? [...extraMasks, ...(await activeRows(page, boardActive))] : extraMasks
  const board = PNG.sync.read(readFileSync(boardPngPath(boardFile)))
  const side = await sidebarMasks(page)
  const sidebarW = side.collapsed ? 64 : 236
  const masks = [...side.masks, ...pageMasks(sidebarW, keep), ...extra]
  const { ratio, size } = compareToReference(await framed(page, board), PNG.sync.write(board), {
    name: `shell-${boardFile.replace(/\.png$/, '')}`,
    masks,
  })
  const compared = 1 - maskedShare(masks, board.width, board.height)
  const inArea = ratio / compared
  const line = `${boardFile}: diff ${ratio.toFixed(4)} of the frame; ${inArea.toFixed(4)} of the ${(compared * 100).toFixed(0)}% compared (${size})`
  results.push(line)
  console.log(line)
  return inArea
}

/** Every board is held to 0.02 of the area it compares (masks named per test). */
const LIMIT = 0.02

/** Text glyphs, from the element's own text box (ours, in board coordinates), padded by 2. */
async function textBox(page: Page, selector: string): Promise<Mask> {
  return textBoxOf(page.locator(selector).first())
}

async function textBoxOf(locator: Locator): Promise<Mask> {
  return locator.evaluate((el) => {
    const range = document.createRange()
    range.selectNodeContents(el)
    const b = range.getBoundingClientRect()
    return {
      x: Math.floor(b.x) - 1,
      y: Math.floor(b.y) - 1,
      w: Math.ceil(b.width) + 4,
      h: Math.ceil(b.height) + 4,
    }
  })
}

/**
 * Put an overlay at rest as the board draws it: a click on its title (not a control) moves focus to the
 * panel itself with the pointer, so the control Radix focused on open loses its keyboard focus ring.
 */
async function atRest(page: Page, title: string) {
  await page.getByText(title, { exact: true }).first().click()
  await expect(page.locator(':focus-visible')).toHaveCount(0)
}

/** ⌘K until the bar shows: the hotkey listener is bound in an effect just after hydration. */
async function cmdK(page: Page) {
  const bar = page.getByRole('combobox')
  await expect(async () => {
    if (!(await bar.isVisible())) await page.keyboard.press('ControlOrMeta+k')
    await expect(bar).toBeVisible({ timeout: 1000 })
  }).toPass()
}

test.describe('Shell surfaces design parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')

  test('S01A command bar, reference typed', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.getByRole('combobox').fill('Q10001')
    await expect(page.getByRole('group', { name: 'Recognised reference' })).toBeVisible()
    // Kept: the panel's input row and its top edge. Masked: the result rows and footer (data; the
    // board's list is 450 high with records that arrive in S31); the search glyph (ours is the lucide
    // icon, CLAUDE.md §4.10; the board types a ⌕ in a fallback face) and the typed reference (neutral
    // Q10001 for the board's number).
    const glyph = await page.locator('[data-part="command-bar"] svg').first().boundingBox()
    const typed = await page.getByRole('combobox').boundingBox()
    const r = await measure(
      page,
      'S01A.png',
      [{ x: 497, y: 70, w: 683, h: 58 }],
      [
        { x: Math.floor(glyph!.x) - 2, y: 84, w: Math.ceil(glyph!.width) + 6, h: 32 },
        { x: Math.floor(typed!.x) - 16, y: 84, w: 90, h: 32 },
      ]
    )
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S01B command bar, question typed', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.getByRole('combobox').fill('who quoted 6205-C3 last')
    await expect(page.getByRole('group', { name: 'Ask the Assistant' })).toBeVisible()
    // Kept: the input row (the typed question is masked: neutral part number; the glyph as in S01A).
    // Masked: the answer (S31).
    const glyph = await page.locator('[data-part="command-bar"] svg').first().boundingBox()
    const r = await measure(
      page,
      'S01B.png',
      [{ x: 497, y: 70, w: 683, h: 58 }],
      [
        { x: Math.floor(glyph!.x) - 2, y: 84, w: Math.ceil(glyph!.width) + 6, h: 32 },
        { x: 530, y: 86, w: 230, h: 28 },
      ]
    )
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S02A notifications', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.keyboard.type('notifications')
    await page.keyboard.press('Enter')
    const drawer = page.getByRole('dialog', { name: 'Notifications' })
    await expect(drawer).toBeVisible()
    await expect(drawer.getByText(/No notifications yet/)).toBeVisible()
    await atRest(page, 'Notifications')
    // Kept: the drawer head, the tab rule and the foot. Masked: the rows (S30); "Mark all read" (disabled
    // here because there is nothing to mark; the board has rows); the tab labels, whose widths carry the
    // board's counts (All 8, Needs you 3: data, S30).
    const mark = await drawer.getByRole('button', { name: 'Mark all read' }).boundingBox()
    const tabs = await drawer.getByRole('tablist').boundingBox()
    const r = await measure(
      page,
      'S02A.png',
      [
        { x: 1019, y: 0, w: 421, h: 105 },
        { x: 1019, y: 893, w: 421, h: 47 },
      ],
      [
        { x: Math.floor(mark!.x), y: Math.floor(mark!.y), w: Math.ceil(mark!.width) + 3, h: 34 },
        { x: Math.floor(tabs!.x), y: Math.floor(tabs!.y), w: Math.ceil(tabs!.width) + 2, h: 34 },
      ]
    )
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S03A Assistant panel docked', async ({ page, signedInAs }) => {
    // Docked on an enquiry, as the board (the S02 record fixture).
    await open(page, signedInAs, 'owner', '/enquiries/ENQ-2026-0001/lines')
    await cmdK(page)
    await page.keyboard.type('assistant panel')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Waiting on you' })).toBeVisible({
      timeout: 15_000,
    })
    await page.locator('#content').focus()
    // Kept: the panel's frame, head and ask box. Masked: the record number in the head (neutral 0001 for
    // the board's), the three sections' rows (S06-T08) and the ask box's text (neutral wording).
    const title = await textBox(page, 'aside h2')
    const r = await measure(
      page,
      'S03A.png',
      [
        { x: 1039, y: 0, w: 401, h: 80 },
        { x: 1039, y: 805, w: 401, h: 135 },
      ],
      [title, { x: 1060, y: 820, w: 360, h: 100 }]
    )
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S04A Why? drawer', async ({ page, signedInAs }) => {
    await open(page, signedInAs, 'owner', '/enquiries/ENQ-2026-0001/lines')
    await page.evaluate(() => {
      ;(window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push(
        '/why/00000000-0000-7000-8000-00000000e001'
      )
    })
    const drawer = page.getByRole('dialog', { name: /Line 1/ })
    await expect(drawer).toBeVisible({ timeout: 20_000 })
    await atRest(page, 'Why?')
    // Kept: the whole drawer. Masked: the neutral fixture words where they differ from the board's (the
    // title's supplier and figure, the source document, its quote and its line), and the file-type label:
    // ours is the Assistant kit's 9.5px coloured PDF badge (`.ka-ft`); on the board the sheet's
    // `.ka-src .sh span` rule out-ranks it and paints it grey 12px, which the kit never meant.
    const masks: Mask[] = []
    for (const sel of [
      '[role="dialog"] h2',
      '[data-part="source"] figcaption > *',
      '[data-part="source"] blockquote',
      '[data-part="source"] > div > span',
    ])
      for (const el of await page.locator(sel).all()) masks.push(await textBoxOf(el))
    const r = await measure(page, 'S04A.png', [{ x: 979, y: 0, w: 461, h: 940 }], masks)
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S05A profile menu', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await page.getByRole('button', { name: /account menu/ }).click()
    await expect(page.getByRole('menu')).toBeVisible()
    // Kept: the sidebar and its menu. Masked: the page (Today, S07) and the paused strip (S05 pause).
    const r = await measure(page, 'S05A.png', [])
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S05B collapsed sidebar, Helper, tooltip on Mail', async ({ page, signedInAs }) => {
    await page.context().addCookies([
      {
        name: 'ops_sidebar',
        value: 'collapsed',
        domain: new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100').hostname,
        path: '/',
      },
    ])
    await open(page, signedInAs, 'helper')
    await page.locator('[data-nav="mail"]').hover()
    await expect(page.getByRole('tooltip')).toBeVisible()
    // Kept: the collapsed rail and the tooltip. Masked: the Mail page (S05) and the Today and Mail rows,
    // whose active state differs (the board is on Mail).
    const r = await measure(
      page,
      'S05B.png',
      [{ x: 60, y: 190, w: 50, h: 40 }],
      [{ x: 0, y: 105, w: 66, h: 125 }]
    )
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S06A help panel', async ({ page, signedInAs }) => {
    // Open on Compare, as the board.
    await open(page, signedInAs, 'owner', '/enquiries/ENQ-2026-0001/compare')
    await page.locator('#content').focus()
    await expect(async () => {
      if (!(await page.getByRole('complementary', { name: 'Help' }).isVisible()))
        await page.keyboard.press('?')
      await expect(page.getByRole('heading', { name: 'On this page' })).toBeVisible({
        timeout: 1000,
      })
    }).toPass()
    await expect(page.getByText('No articles for this page yet.')).toBeVisible({ timeout: 15_000 })
    await page.locator('#content').focus()
    // Kept: the head, the search field and the foot. Masked: the articles, ask box and shortcut list
    // (S35 content; the board shows the record page's articles).
    const r = await measure(page, 'S06A.png', [
      { x: 1039, y: 0, w: 401, h: 118 },
      { x: 1039, y: 876, w: 401, h: 64 },
    ])
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S07A confirm (the kit frame ConfirmDialog renders)', async ({ page }) => {
    // No console page asks for a confirmation before S09 (block supplier), so the dialog is measured as the
    // Overlay kit's frame of it: ConfirmDialog renders the same panel recipe and sections (modalPanel,
    // ModalSections, Consequences). Neutral words differ from the board's.
    await page.setViewportSize({ width: 1440, height: 940 })
    await prepare(page)
    await page.goto('/_kit/overlay')
    await settle(page)
    const frame = page.locator('[data-frame="modal"][data-tone="danger"]').first()
    const ours = await frame.screenshot({ animations: 'disabled', caret: 'hide' })
    // Masked, relative to the frame: the neutral words where they differ from the board's (the supplier in
    // the title and the description, the references in the first two consequences) and the consequence
    // arrows, which our self-hosted Geist does not carry (latin subset, CLAUDE.md §4.6: they render in the
    // fallback face; the sheet's Google Geist draws its own).
    const masks = await frame.evaluate((el) => {
      const o = el.getBoundingClientRect()
      const box = (n: Element) => {
        const range = document.createRange()
        range.selectNodeContents(n)
        const b = range.getBoundingClientRect()
        return {
          x: Math.floor(b.x - o.x) - 1,
          y: Math.floor(b.y - o.y) - 1,
          w: Math.ceil(b.width) + 4,
          h: Math.ceil(b.height) + 4,
        }
      }
      const items = [...el.querySelectorAll('[data-part="consequences"] li')]
      return [
        box(el.querySelector('b')!),
        box(el.querySelector('p')!),
        ...items.map((li) => box(li.firstElementChild!)),
        ...items.slice(0, 2).map((li) => box(li.lastElementChild!)),
      ]
    })
    const board = PNG.sync.read(readFileSync(boardPngPath('S07A.png')))
    const b = PNG.sync.read(ours)
    const crop = new PNG({ width: b.width, height: b.height })
    PNG.bitblt(board, crop, 578, 327, b.width, Math.min(b.height, board.height - 327), 0, 0)
    const { ratio, size } = compareToReference(ours, PNG.sync.write(crop), {
      name: 'shell-S07A-dialog',
      masks,
    })
    const compared = 1 - maskedShare(masks, b.width, b.height)
    const inArea = ratio / compared
    const line = `S07A.png dialog: diff ${ratio.toFixed(4)} of the crop; ${inArea.toFixed(4)} of the ${(compared * 100).toFixed(0)}% compared (${size})`
    results.push(line)
    console.log(line)
    expect(inArea).toBeLessThanOrEqual(LIMIT)
  })

  test('S07B toast', async ({ page, signedInAs }) => {
    // The board's stack: an Undo toast after a send above a running toast, raised in the shell's own toast
    // region by the /_kit/surfaces/toasts specimen (useUndoToast + a running toast).
    await open(page, signedInAs, 'owner', '/_kit/surfaces/toasts')
    const toasts = page.locator('[data-part="toast-region"] li')
    await expect(toasts).toHaveCount(2)
    const geo = await toasts.evaluateAll((els) =>
      els.map((li) => {
        const box = li.firstElementChild!.getBoundingClientRect()
        const undo = [...li.querySelectorAll('button')].find((b) =>
          b.textContent?.startsWith('Undo')
        )!
        const glyph = li.querySelector('i')!.getBoundingClientRect()
        return { right: box.right, undo: undo.getBoundingClientRect(), glyph }
      })
    )
    // Kept: the toast region. Masked: (1) on the Undo toast, from the end of the word "Undo" to the toast's
    // right edge: ours counts the server's window down ("Undo 4:59", ADR-11) where the board draws "Undo",
    // so the countdown and the close button it pushes right differ by design; (2) on the running toast, the
    // neutral title and what it pushes (the board names a supplier); (3) the running glyph: parity renders
    // with prefers-reduced-motion, where the spinner is a still ring at .55 (base.css), while the board
    // draws it mid-spin.
    const [undoToast, running] = geo as [(typeof geo)[number], (typeof geo)[number]]
    const r = await measure(
      page,
      'S07B.png',
      [{ x: 255, y: 820, w: 360, h: 110 }],
      [
        {
          x: Math.floor(undoToast.undo.x) + 1 + 32,
          y: Math.floor(undoToast.undo.y) + 1 - 8,
          w: 80,
          h: Math.ceil(undoToast.undo.height) + 16,
        },
        {
          x: Math.floor(running.glyph.x),
          y: Math.floor(running.glyph.y),
          w: Math.ceil(running.glyph.width) + 3,
          h: Math.ceil(running.glyph.height) + 3,
        },
        {
          x: 300,
          y: Math.floor(running.undo.y) + 1 - 8,
          w: Math.ceil(running.right) - 300 + 40,
          h: Math.ceil(running.undo.height) + 16,
        },
      ],
      'review'
    )
    expect(r).toBeLessThanOrEqual(LIMIT)
  })

  test('S08A system banners', async ({ page, signedInAs }) => {
    await page.context().addCookies([
      {
        name: 'ops_fixture_banners',
        value: '1',
        domain: new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3100').hostname,
        path: '/',
      },
    ])
    await open(page, signedInAs)
    await expect(page.locator('[data-part="banner"]')).toHaveCount(1)
    // The board puts the strip under a 60px PageHeader (Mail, S05); Today has none yet, so the strip is
    // compared as a crop: ours at the top of the page column against the board's first strip. "+2 more"
    // (C23) is masked: the board stacks both banners instead.
    const board = PNG.sync.read(readFileSync(boardPngPath('S08A.png')))
    const ours = PNG.sync.read(await framed(page, board))
    const crop = (png: PNG, y: number) => {
      const out = new PNG({ width: 1202, height: 40 })
      PNG.bitblt(png, out, 237, y, 1202, 40, 0, 0)
      return PNG.sync.write(out)
    }
    const { ratio, size } = compareToReference(crop(ours, 1), crop(board, 62), {
      name: 'shell-S08A-strip',
      masks: [{ x: 1040, y: 0, w: 162, h: 40 }],
    })
    const line = `S08A.png strip: diff ${ratio.toFixed(4)} (${size})`
    results.push(line)
    console.log(line)
    expect(ratio).toBeLessThanOrEqual(0.03)
  })

  test.afterAll(() => {
    if (results.length) console.log(`\nShell surfaces parity\n${results.join('\n')}`)
  })
})
