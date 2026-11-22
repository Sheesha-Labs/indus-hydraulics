import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
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
      out.push({ x: 0, y: Math.floor(money.top), w: Math.ceil(box.width) + 2, h: Math.ceil(spacer.top - money.top) + 2 })
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

async function open(page: Page, signedInAs: (w: 'owner' | 'helper') => Promise<void>, who: 'owner' | 'helper' = 'owner') {
  await signedInAs(who)
  await page.setViewportSize({ width: W, height: H })
  await prepare(page)
  await page.goto('/today')
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
  return page.evaluate((keys) => {
    return keys.map((k) => {
      const b = document.querySelector(`[data-nav="${k}"]`)!.getBoundingClientRect()
      return { x: Math.floor(b.x), y: Math.floor(b.y), w: Math.ceil(b.width) + 2, h: Math.ceil(b.height) + 2 }
    })
  }, ['today', boardActive])
}

async function measure(
  page: Page,
  boardFile: string,
  keep: Mask[],
  extra: Mask[] = [],
  boardActive?: string
): Promise<number> {
  await still(page)
  if (boardActive) extra = [...extra, ...(await activeRows(page, boardActive))]
  const board = PNG.sync.read(readFileSync(boardPngPath(boardFile)))
  const side = await sidebarMasks(page)
  const sidebarW = side.collapsed ? 64 : 236
  const masks = [...side.masks, ...pageMasks(sidebarW, keep), ...extra]
  const { ratio, size } = compareToReference(await framed(page, board), PNG.sync.write(board), {
    name: `shell-${boardFile.replace(/\.png$/, '')}`,
    masks,
  })
  const compared = 1 - maskedShare(masks, board.width, board.height)
  const line = `${boardFile}: diff ${ratio.toFixed(4)} of the frame; ${(ratio / compared).toFixed(4)} of the ${(compared * 100).toFixed(0)}% compared (${size})`
  results.push(line)
  console.log(line)
  return ratio
}

const cmdK = (page: Page) => page.keyboard.press('ControlOrMeta+k')

test.describe('Shell surfaces design parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')

  test('S01A command bar, reference typed', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.getByRole('combobox').fill('Q10001')
    await expect(page.getByRole('group', { name: 'Recognised reference' })).toBeVisible()
    // Kept: the panel's input row and its top edge. Masked: the result rows and footer (data; the
    // board's list is 450 high with records that arrive in S31).
    const r = await measure(page, 'S01A.png', [{ x: 497, y: 70, w: 683, h: 58 }])
    expect(r).toBeLessThanOrEqual(0.03)
  })

  test('S01B command bar, question typed', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.getByRole('combobox').fill('who quoted 6205-C3 last')
    await expect(page.getByRole('group', { name: 'Ask the Assistant' })).toBeVisible()
    // Kept: the input row (the typed question is masked: neutral part number). Masked: the answer (S31).
    const r = await measure(page, 'S01B.png', [{ x: 497, y: 70, w: 683, h: 58 }], [
      { x: 530, y: 86, w: 230, h: 28 },
    ])
    expect(r).toBeLessThanOrEqual(0.03)
  })

  test('S02A notifications', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.keyboard.type('notifications')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible()
    // Kept: the drawer head and tabs (the board's "Needs you 3" count is masked) and its foot. Masked:
    // the rows (S30).
    const r = await measure(
      page,
      'S02A.png',
      [
        { x: 1019, y: 0, w: 421, h: 105 },
        { x: 1019, y: 893, w: 421, h: 47 },
      ],
      [{ x: 1170, y: 72, w: 30, h: 24 }]
    )
    expect(r).toBeLessThanOrEqual(0.03)
  })

  test('S03A Assistant panel docked', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.keyboard.type('assistant panel')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: 'Waiting on you' })).toBeVisible()
    await page.locator('#content').focus()
    // Kept: the panel's frame, head and ask box. Masked: the head's record ref ("On ENQ-…" vs
    // "Everywhere" on a page without a record) and the three sections' rows (S06-T08).
    const r = await measure(
      page,
      'S03A.png',
      [
        { x: 1039, y: 0, w: 401, h: 80 },
        { x: 1039, y: 805, w: 401, h: 135 },
      ],
      [{ x: 1140, y: 14, w: 160, h: 48 }],
      'enquiries'
    )
    expect(r).toBeLessThanOrEqual(0.03)
  })

  test('S04A Why? drawer', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await page.evaluate(() => {
      ;(window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push(
        '/why/00000000-0000-7000-8000-00000000e001'
      )
    })
    await expect(page.getByRole('dialog', { name: /Line 1/ })).toBeVisible()
    // Kept: the whole drawer. Neutral fixture words differ from the board's (title, reasons, source).
    const r = await measure(page, 'S04A.png', [{ x: 979, y: 0, w: 461, h: 940 }], [], 'enquiries')
    expect(r).toBeLessThanOrEqual(0.03)
  })

  test('S05A profile menu', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await page.getByRole('button', { name: /account menu/ }).click()
    await expect(page.getByRole('menu')).toBeVisible()
    // Kept: the sidebar and its menu. Masked: the page (Today, S07) and the paused strip (S05 pause).
    const r = await measure(page, 'S05A.png', [])
    expect(r).toBeLessThanOrEqual(0.03)
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
    const r = await measure(page, 'S05B.png', [{ x: 60, y: 190, w: 50, h: 40 }], [
      { x: 0, y: 105, w: 66, h: 125 },
    ])
    expect(r).toBeLessThanOrEqual(0.03)
  })

  test('S06A help panel', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await page.locator('#content').focus()
    await page.keyboard.press('?')
    await expect(page.getByRole('heading', { name: 'On this page' })).toBeVisible()
    await expect(page.getByText('No articles for this page yet.')).toBeVisible()
    await page.locator('#content').focus()
    // Kept: the head, the search field and the foot. Masked: the articles, ask box and shortcut list
    // (S35 content; the board shows the record page's articles).
    const r = await measure(
      page,
      'S06A.png',
      [
        { x: 1039, y: 0, w: 401, h: 118 },
        { x: 1039, y: 876, w: 401, h: 64 },
      ],
      [],
      'enquiries'
    )
    expect(r).toBeLessThanOrEqual(0.03)
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
    const board = PNG.sync.read(readFileSync(boardPngPath('S07A.png')))
    const b = PNG.sync.read(ours)
    const crop = new PNG({ width: b.width, height: b.height })
    PNG.bitblt(board, crop, 578, 327, b.width, Math.min(b.height, board.height - 327), 0, 0)
    const { ratio, size } = compareToReference(ours, PNG.sync.write(crop), { name: 'shell-S07A-dialog' })
    const line = `S07A.png dialog: diff ${ratio.toFixed(4)} (${size})`
    results.push(line)
    console.log(line)
    expect(ratio).toBeLessThanOrEqual(0.06)
  })

  test('S07B toast', async ({ page, signedInAs }) => {
    await open(page, signedInAs)
    await cmdK(page)
    await page.keyboard.type('pause')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-part="toast-region"] li')).toHaveCount(1)
    // Kept: the toast region (one info toast here; the board shows an undo toast above a running one).
    const r = await measure(page, 'S07B.png', [{ x: 255, y: 820, w: 360, h: 110 }], [], 'review')
    expect(r).toBeLessThanOrEqual(0.03)
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
