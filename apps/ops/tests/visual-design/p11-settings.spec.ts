import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'
import { prepare, settle } from '../visual/helpers'
import { compareToBoardPng, recordParity, type Mask } from './compare'
import { hasReference } from './reference'

/**
 * S11 · settings boards (local design parity at 1440 × 940): 57 document templates, 39 offer terms, 213 company
 * documents, 214 numbering. Every settings page carries the board-212 sub-nav (C41), which these boards do not
 * draw; the sidebar is masked (signed-in names and counts differ from the boards').
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

async function boxesOf(page: Page, selectors: readonly string[]): Promise<Mask[]> {
  const out: Mask[] = []
  for (const s of selectors)
    for (const el of await page.locator(s).all()) {
      const b = await el.boundingBox()
      if (b)
        out.push({ x: Math.floor(b.x), y: Math.floor(b.y), w: Math.ceil(b.width), h: Math.ceil(b.height) })
    }
  return out
}

const FRAMES = [
  {
    board: '57',
    path: '/settings/document-templates/quotation',
    limit: 0.075,
    note: 'Sub-nav is board 212 (C41), so the document list is its own page and the editor sits where the board’s list and editor do; the preview is a real page of the sample document at scale s where the board draws a wireframe (masked); move buttons and the sign-off note are extra; sidebar masked',
    masks: ['[data-part="sidebar"]', '[data-doc-frame]'],
  },
  {
    board: '39',
    path: '/settings/terms?category=payment',
    limit: 0.1,
    note: 'Sub-nav is board 212 (C41), so the categories are chips above the clauses instead of a column; seeded clauses carry "Default · awaiting sign-off" and lock tags; preset client names differ (none assigned in the fixture); sidebar masked',
    masks: ['[data-part="sidebar"]'],
  },
  {
    board: '213',
    path: '/settings/documents',
    limit: 0.05,
    note: 'The board shows six documents; the local database has the test ones or none. Our page adds the bank block and letterhead sections below the board’s two cards, and an unconfirmed-bank note above the table (open item 1); sidebar and table body masked (data)',
    masks: ['[data-part="sidebar"]', '[role="table"] [role="rowgroup"]:last-child'],
  },
  {
    board: '214',
    path: '/settings/numbering',
    limit: 0.06,
    note: 'Thirteen series where the board lists eight (the internal ENQ, RFQ, SO, lead and tender-query series too); local next numbers and continuity differ from the board’s Zoho example (no out-of-step card unless one is); the header carries "Confirm numbering style" while C6 awaits sign-off; sidebar masked',
    masks: ['[data-part="sidebar"]'],
  },
] as const

for (const f of FRAMES) {
  test(`board-${f.board} · P11 settings parity`, async ({ page, signedInAs }) => {
    test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
    await signedInAs('owner')
    await prepare(page)
    await page.setViewportSize({ width: 1440, height: 940 })
    await page.goto(f.path)
    await settle(page)
    await page.waitForLoadState('networkidle')
    const masks = await boxesOf(page, f.masks)
    const { ratio, size } = await compareToBoardPng(page, `${f.board}.png`, {
      name: `p11-${f.board}`,
      masks,
    })
    recordParity({
      board: f.board,
      group: 'P11 settings',
      ratio,
      area: `full frame ${size}, ${masks.length} masks`,
      limit: f.limit,
      note: f.note,
    })
    console.log(`board-${f.board}: ${ratio.toFixed(4)}`)
    expect(ratio).toBeLessThanOrEqual(f.limit)
  })
}
