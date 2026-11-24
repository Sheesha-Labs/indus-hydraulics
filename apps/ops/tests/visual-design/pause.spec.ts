import { readFileSync } from 'node:fs'
import { opsDb as db } from '@indus/ops-db'
import { PNG } from 'pngjs'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToReference, recordParity } from './compare'
import { boardPngPath, hasReference } from './reference'

/**
 * board-102-paused / S05A (S05-T08, local only): the paused strip over the page, Owner view, against the
 * strip at the top of S05A. Run on its own: the pause row is shared, and the server caches it 15 s.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const STRIP = { x: 237, y: 0, w: 1203, h: 41 }

function crop(file: string): Buffer {
  const src = PNG.sync.read(readFileSync(boardPngPath(file)))
  const out = new PNG({ width: STRIP.w, height: STRIP.h })
  PNG.bitblt(src, out, STRIP.x, STRIP.y, STRIP.w, STRIP.h, 0, 0)
  return PNG.sync.write(out)
}

async function unpause() {
  await db.assistantState.updateMany({
    where: { id: 1 },
    data: { pausedAt: null, pausedById: null, pauseNote: null },
  })
}

test.afterAll(unpause)

test('board-102-paused parity: the paused strip (S05A)', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await prepare(page)
  await page.setViewportSize({ width: 1440, height: 940 })
  await page.goto('/today')
  const pill = page.locator('[data-part="assistant-pill"]').first()
  await expect(pill).toBeVisible({ timeout: 90_000 })
  if ((await pill.getAttribute('data-status')) !== 'paused') {
    await pill.click()
    await page.getByRole('button', { name: 'Pause everything' }).click()
  }
  await expect(page.getByText(/^Assistant paused by you at/)).toBeVisible({ timeout: 30_000 })
  await page.mouse.move(700, 600)
  await settle(page)
  const clip = { x: STRIP.x, y: STRIP.y, width: STRIP.w, height: STRIP.h }
  const ours = await page.screenshot({ clip, animations: 'disabled', caret: 'hide' })
  const { ratio, size } = compareToReference(ours, crop('S05A.png'), { name: 'board-102-paused' })
  const limit = 0.11
  recordParity({
    board: '102 paused strip (S05A)',
    group: 'P03 boards',
    ratio,
    area: `strip ${size}`,
    limit,
    note: 'Copy from board 102 state 2 ("Nothing is read or sent until you resume. Mail keeps arriving in Gmail.") where S05A words it differently; the time differs.',
  })
  expect(ratio).toBeLessThanOrEqual(limit)
})
