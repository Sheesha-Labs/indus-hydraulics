import { opsDb as db } from '@indus/ops-db'
import {
  archiveClients,
  seedClients,
  type ClientsSeed,
} from '../../src/server/directory/testing/clients-seed'
import {
  archiveSuppliers,
  seedSuppliers,
  type SuppliersSeed,
} from '../../src/server/directory/testing/suppliers-seed'
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
let suppliers: SuppliersSeed

test.beforeAll(async () => {
  clients = await seedClients(db, tag)
  suppliers = await seedSuppliers(db, tag)
})

test.afterAll(async () => {
  await archiveClients(db, clients)
  await archiveSuppliers(db, suppliers)
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

test('board-128 suppliers', async ({ page }) => {
  await page.goto(`/suppliers?trade=${suppliers.parityTradeId}`)
  await expect(page.getByRole('heading', { name: /^Suppliers · \d+$/, level: 1 })).toBeVisible()
  await frame(
    page,
    '128',
    0.1,
    'neutral names; no saved views seeded (All, Proposed); "Save view" control; no search text'
  )
})

test('board-129 supplier profile', async ({ page }) => {
  await page.goto(`/suppliers/${suppliers.profileId}`)
  await expect(
    page.getByRole('heading', { name: 'Sample Instruments Ltd', level: 1 })
  ).toBeVisible()
  await frame(
    page,
    '129',
    0.1,
    'Recent is empty (no quotes seeded); Bank card below Documents; Line card and History tabs'
  )
})
