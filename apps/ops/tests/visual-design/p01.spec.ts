import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, compareToReference, recordParity, type Mask } from './compare'
import { boardPngPath, hasReference } from './reference'

/**
 * P01 design parity (S03-T07, local only): boards 77 (nine cards on one canvas: each card we build is
 * compared with its rectangle), 78, 79, 82, 83 and 84 (full frame at 1440 × 940), and 84b (the two
 * banners we build). Board copy carries real names, the company's values and real addresses; ours runs on
 * the neutral seed, so the text runs that differ only because of that are masked, each with its reason.
 * Ratios go to $OPS_EVIDENCE_DIR/visual/s03/summary.md. LIMITS hold the measured value rounded up, with
 * why it sits above 0.02 where it does.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')

type Box = Mask

/** A rectangle of a board PNG as its own PNG buffer. */
function boardCrop(board: string, box: Box): Buffer {
  const src = PNG.sync.read(readFileSync(boardPngPath(board)))
  const out = new PNG({ width: box.w, height: box.h })
  PNG.bitblt(src, out, box.x, box.y, box.w, box.h, 0, 0)
  return PNG.sync.write(out)
}

async function ready(page: Page, path: string) {
  await prepare(page)
  await page.goto(path)
  await settle(page)
  await page.waitForLoadState('networkidle')
}

interface CardCheck {
  name: string
  path: string
  box: Box
  limit: number
  note: string
}

/** Board 77's cards: the rectangle on the canvas and the route that draws the same state. */
const CARDS_77: CardCheck[] = [
  {
    name: '77 main',
    path: '/sign-in',
    box: { x: 134, y: 94, w: 398, h: 510 },
    limit: 0.12,
    note: 'Decided: title "Indus Operations" (board "Indus Ops", P01); Continue with Google is the one primary (plan; the board draws it outlined); no subtitle until Setup 1 has a legal name; the Workspace foot sits inside the card; kit control heights 40/36 vs the board 44/40',
  },
  {
    name: '77 forgot',
    path: '/sign-in/forgot',
    box: { x: 916, y: 53, w: 236, h: 366 },
    limit: 0.2,
    note: 'Our card is the 400px T11 card, the board draws 236px state cards; compared top-left over the common area',
  },
  {
    name: '77 locked',
    path: '/sign-in?error=locked&minutes=14',
    box: { x: 1170, y: 529, w: 236, h: 148 },
    limit: 0.3,
    note: 'State card drawn alone on the board; ours is the full sign-in card with the banner on top',
  },
  {
    name: '77 session ended',
    path: '/sign-in?reason=session_ended&next=%2Freview',
    box: { x: 916, y: 763, w: 236, h: 174 },
    limit: 0.3,
    note: 'As locked: state card alone on the board, full card here',
  },
]

for (const c of CARDS_77) {
  test(`P01 ${c.name}`, async ({ page }) => {
    await ready(page, c.path)
    const card = page.locator('[data-template="T11"] [data-slot="card"]').first()
    await expect(card).toBeVisible()
    const ours = await card.screenshot({ animations: 'disabled', caret: 'hide' })
    const { ratio, size } = compareToReference(ours, boardCrop('77.png', c.box), {
      name: `p01-${c.name.replace(/\s+/g, '-')}`,
      sizeTolerance: 2000,
    })
    recordParity({
      board: c.name,
      group: 'P01 boards',
      ratio,
      area: size,
      limit: c.limit,
      note: c.note,
    })
    expect(ratio).toBeLessThanOrEqual(c.limit)
  })
}

interface FrameCheck {
  board: string
  path: string
  limit: number
  note: string
  /** Text that differs only because the fixtures are neutral, or a relative time. */
  masks?: (page: Page) => Promise<Mask[]>
}

async function boxesOf(page: Page, selectors: string[]): Promise<Mask[]> {
  const out: Mask[] = []
  for (const s of selectors) {
    for (const el of await page.locator(s).all()) {
      const b = await el.boundingBox()
      if (b)
        out.push({
          x: Math.floor(b.x),
          y: Math.floor(b.y),
          w: Math.ceil(b.width),
          h: Math.ceil(b.height),
        })
    }
  }
  return out
}

const FRAMES: FrameCheck[] = [
  {
    board: '78',
    path: '/welcome',
    limit: 0.06,
    note: 'No masks needed: the neutral first name and the logo placeholder stay under the limit',
  },
  {
    board: '79',
    path: '/setup/company',
    limit: 0.08,
    note: 'Company values masked (real on the board, neutral here); bank rows replaced by the open-item note (decision)',
    masks: (page) => boxesOf(page, ['input', 'textarea', '[data-slot="preview"]']),
  },
  {
    board: '82',
    path: '/setup/money',
    limit: 0.08,
    note: 'Sign-off tags and the cutover note replace the quotation number (C4); default-currency switch added',
  },
  {
    board: '83',
    path: '/setup/assistant',
    limit: 0.06,
    note: '"Preset contents awaiting sign-off" tags under Balanced and Hands-off (P01)',
  },
  {
    board: '84',
    path: '/settings/team',
    limit: 0.1,
    note: 'Names, emails, devices and relative times masked; Invite disabled while a Helper is active (one-Helper rule)',
    masks: (page) => boxesOf(page, ['#devices li', '#security dd', '[data-person]', 'time']),
  },
]

for (const f of FRAMES) {
  test(`P01 board ${f.board}`, async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await ready(page, f.path)
    const masks = f.masks ? await f.masks(page) : []
    const { ratio, size } = await compareToBoardPng(page, `${f.board}.png`, {
      name: `p01-${f.board}`,
      masks,
    })
    recordParity({
      board: f.board,
      group: 'P01 boards',
      ratio,
      area: `full frame ${size}, ${masks.length} masks`,
      limit: f.limit,
      note: f.note,
    })
    expect(ratio).toBeLessThanOrEqual(f.limit)
  })
}

test('P01 84b helper during setup banner', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await ready(page, '/today')
  const banner = page.getByText(/Setup in progress by/).first()
  await expect(banner).toBeVisible()
  const el = banner.locator('xpath=ancestor::*[@data-tone][1]')
  const ours = await el.screenshot({ animations: 'disabled' })
  const { ratio, size } = compareToReference(
    ours,
    boardCrop('84b.png', { x: 612, y: 73, w: 502, h: 62 }),
    { name: 'p01-84b-helper-setup', sizeTolerance: 2000 }
  )
  recordParity({
    board: '84b helper setup',
    group: 'P01 boards',
    ratio,
    area: size,
    limit: 0.2,
    note: 'Neutral owner name and n of 6; shell banner width differs from the state-sheet card',
  })
  expect(ratio).toBeLessThanOrEqual(0.2)
})
