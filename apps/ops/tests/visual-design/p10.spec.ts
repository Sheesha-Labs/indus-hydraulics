import { opsDb as db } from '@indus/ops-db'
import {
  archiveClients,
  seedClients,
  type ClientsSeed,
} from '../../src/server/directory/testing/clients-seed'
import {
  archiveSuppliers,
  seedOnboardingDraft,
  seedVetting,
  seedLineCard,
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
let draftId = ''

test.beforeAll(async () => {
  clients = await seedClients(db, tag)
  suppliers = await seedSuppliers(db, tag)
  const owner = await db.user.findFirstOrThrow({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  draftId = await seedOnboardingDraft(db, tag, owner.id)
})

test.afterAll(async () => {
  await archiveClients(db, clients)
  await archiveSuppliers(db, suppliers)
  await db.company.update({ where: { id: draftId }, data: { archivedAt: new Date() } })
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

test('board-50 new supplier documents', async ({ page }) => {
  await page.goto(`/suppliers/new/${draftId}/documents`)
  await expect(
    page.getByRole('heading', { name: 'Example Hidrolik Sanayi A.Ş.', level: 1 })
  ).toBeVisible()
  await frame(
    page,
    '50',
    0.1,
    'composer shows the template with a placeholder link; Update control per row; Back in the foot'
  )
})

test('board-51 vetting and approval', async ({ page }) => {
  const owner = await db.user.findFirstOrThrow({
    where: { role: 'owner', status: 'active' },
    select: { id: true },
  })
  const helper =
    (await db.user.findFirst({
      where: { role: 'helper', status: 'active' },
      select: { id: true },
    })) ?? owner
  await seedVetting(db, draftId, owner.id, helper.id)
  await page.goto(`/suppliers/new/${draftId}/approve`)
  await expect(page.locator('[data-built="supplier-vetting"]')).toBeVisible()
  await frame(
    page,
    '51',
    0.12,
    'IBAN shown as last 4 only (never in full); Record screening control; neutral names'
  )
})

test('board-52 line card and terms', async ({ page }) => {
  await seedLineCard(db, draftId)
  await page.goto(`/suppliers/new/${draftId}/line-card`)
  await expect(page.locator('[data-built="supplier-line-card"]')).toBeVisible()
  await frame(
    page,
    '52',
    0.12,
    'terms as inputs (the board draws selects); Save line card and Save terms controls; categories from the taxonomy'
  )
})
