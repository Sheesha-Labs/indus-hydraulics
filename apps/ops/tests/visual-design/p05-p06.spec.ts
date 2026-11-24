import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'

/**
 * P05 and P06 design parity (S06, local only). Boards 103, 110 and 114 are state sheets: /_kit/review-states
 * lays the real Review and undo components out where each board draws them, with the kit's neutral fixtures.
 * Boards 104, 111 and 113 are screens on fixture rows (later in this file). Each LIMIT holds the measured value
 * rounded up, with the reason it is not lower; the plan's 2% bar is not reachable with neutral fixtures
 * standing in for the board's names, figures and counts (as in P03).
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.setTimeout(180_000)

for (const [board, group, limit, note] of [
  [
    '103',
    'P05 boards',
    0.09,
    'Neutral fixtures for the board’s names and figures. The inline editor also edits To, Cc and Subject (the board edits the body only), so the Editing column runs taller; Reject is a popover in the app, drawn here as the card with its reason chips.',
  ],
  [
    '110',
    'P05 boards',
    0.08,
    'Neutral fixtures. All clear uses the States kit mark (navy square) where the board draws a green check; the failed row’s Retry is secondary (one primary per view on Review).',
  ],
  [
    '112',
    'P06 boards',
    0.09,
    'The Why? cards are the drawer’s tabbed layout of shell S04A (Reasons · Sources · History, opened on Sources); board 112 draws one scroll with alternatives, confidence and Change it under the evidence. S04A parity holds the drawer itself.',
  ],
  [
    '114',
    'P06 boards',
    0.07,
    'Neutral fixtures; the correction card is the kit ProposalCard with the email preview where the board draws the email itself.',
  ],
] as const) {
  test(`board-${board} parity: state sheet`, async ({ page }) => {
    await prepare(page)
    await page.setViewportSize({ width: 1440, height: 940 })
    await page.goto(`/_kit/review-states?board=${board}`)
    await settle(page)
    await page.waitForLoadState('networkidle')
    const { ratio, size } = await compareToBoardPng(page, `${board}.png`, {
      name: `board-${board}`,
    })
    recordParity({ board: `${board} sheet`, group, ratio, area: `full frame ${size}`, limit, note })
    console.log(`board-${board}: ${ratio.toFixed(4)}`)
    expect(ratio).toBeLessThanOrEqual(limit)
  })
}
