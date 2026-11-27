import { opsDb as db } from '@indus/ops-db'
import {
  archiveClients,
  seedClients,
  type ClientsSeed,
} from '../../src/server/directory/testing/clients-seed'
import { expect, test } from '../signed-in'
import { settle } from '../visual/helpers'
import { compareToBoardPng, recordParity } from './compare'
import { hasReference } from './reference'

/**
 * S10 directory design parity (local only): full frames at 1440 × 940 against the board PNGs. Data is seeded here
 * with neutral names in the boards' states; board 11 is isolated with `?ccy=BHD` (the seed's quoting currency).
 * Each LIMIT is the measured ratio rounded up, with what differs.
 */
test.skip(!hasReference(), 'design reference not available ($OPS_DESIGN_REF_DIR)')
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const tag = `p10${Date.now()}`
let clients: ClientsSeed

test.beforeAll(async () => {
  clients = await seedClients(db, tag)
})

test.afterAll(async () => {
  await archiveClients(db, clients)
})

test.beforeEach(async ({ signedInAs }) => {
  await signedInAs('owner')
})

async function frame(
  page: import('@playwright/test').Page,
  board: string,
  limit: number,
  note: string
) {
  await settle(page)
  await page.waitForLoadState('networkidle')
  const { ratio, size } = await compareToBoardPng(page, `${board}.png`, { name: `board-${board}` })
  recordParity({
    board: `${board} screen`,
    group: 'P10 boards',
    ratio,
    area: `full frame ${size}`,
    limit,
    note,
  })
  console.log(`board-${board}: ${ratio.toFixed(4)}`)
  expect(ratio).toBeLessThanOrEqual(limit)
}

test('board-11 clients', async ({ page }) => {
  await page.goto('/clients?ccy=BHD')
  await expect(page.getByRole('heading', { name: 'Clients', level: 1 })).toBeVisible()
  await frame(
    page,
    '11',
    0.1,
    'values in AED (the board shows $); neutral names; RFQs = enquiries by document'
  )
})

test('board-12 client profile', async ({ page }) => {
  await page.goto(`/clients/${clients.clientIds[0]}`)
  await expect(
    page.getByRole('heading', { name: 'Sample Petrochem Services', level: 1 })
  ).toBeVisible()
  await frame(
    page,
    '12',
    0.1,
    'AED figures; Overview/History sub-nav under the header; profile sections below'
  )
})
