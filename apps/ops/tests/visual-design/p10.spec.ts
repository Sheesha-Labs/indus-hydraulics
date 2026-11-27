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

/** Boards 130–132: one contact-only supplier with a pending bank change, as the alert leaves it. */
async function seedTrust() {
  const t = `${tag}tr`
  const supplierId = (
    await db.company.create({
      data: {
        name: 'Example Valvole S.p.A.',
        isSupplier: true,
        primaryDomain: `${t}.example`,
        domains: [`${t}.example`],
        country: 'IT',
        supplierProfile: { create: { tier: 'contact_only', registryPhone: '+39 030 000 2140' } },
      },
      select: { id: true },
    })
  ).id
  const mailbox = await db.mailbox.findFirstOrThrow({ select: { id: true } })
  const thread = await db.mailThread.create({
    data: { mailboxId: mailbox.id, gmailThreadId: `${t}-t` },
    select: { id: true },
  })
  const msg = await db.mailMessage.create({
    data: {
      mailboxId: mailbox.id,
      threadId: thread.id,
      gmailMessageId: `${t}-m`,
      direction: 'inbound',
      origin: 'live',
      fromAddress: `accounts@${t}-spa.example`,
      toAddresses: ['purchase@example.test'],
      subject: 'Updated bank details',
      bodyText:
        'Dear purchase team, please note our bank details have changed. Kindly remit the balance now to the new account. For questions call +39 351 000 8812.',
      sentAt: new Date(),
      receivedAt: new Date(),
    },
    select: { id: true },
  })
  const accountId = (
    await db.supplierBankAccount.create({
      data: {
        supplierId,
        bankName: 'Requested by email',
        accountName: 'Example Valvole S.p.A.',
        ibanEnc: Buffer.from('sealed'),
        ibanLast4: '3456',
        status: 'pending_verification',
        requestedViaMessageId: msg.id,
        requestedAt: new Date(),
        riskFlags: {
          lookalikeDomain: true,
          firstEmailFromAddress: true,
          urgency: true,
          risk: 'high',
          domain: `${t}-spa.example`,
        },
      },
      select: { id: true },
    })
  ).id
  return { supplierId, accountId }
}

let trust: { supplierId: string; accountId: string } | null = null
const trustSeed = async () => (trust ??= await seedTrust())
test.afterAll(async () => {
  if (trust)
    await db.company.update({ where: { id: trust.supplierId }, data: { archivedAt: new Date() } })
})

test('board-130 promote to trial', async ({ page }) => {
  const s = await trustSeed()
  await page.goto(`/suppliers/${s.supplierId}/promote`)
  await expect(page.locator('[data-built="supplier-promote"]')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '130',
    0.06,
    'neutral names; the checklist reads the seed (no licence or screening recorded)'
  )
})

test('board-131 block', async ({ page }) => {
  const s = await trustSeed()
  await page.goto(`/suppliers/${s.supplierId}/block`)
  await expect(page.locator('[data-built="supplier-block"]')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '131',
    0.06,
    'rendered inside the profile frame, not over it; effects read the seed (none open)'
  )
})

test('board-132 bank change', async ({ page }) => {
  const s = await trustSeed()
  await page.goto(`/suppliers/${s.supplierId}/bank-change/${s.accountId}`)
  await expect(page.locator('[data-built="bank-change"]')).toBeVisible({ timeout: 90_000 })
  await frame(
    page,
    '132',
    0.08,
    'requested account as last 4 only; no account on file in the seed; neutral names'
  )
})

test('board-133 supplier states sheet', async ({ page }) => {
  await page.goto('/_kit/supplier-states')
  await expect(page.getByRole('region', { name: 'Trial limit reached' })).toBeVisible({
    timeout: 90_000,
  })
  await frame(page, '133', 0.035, 'the eight states in the directory’s own copy with neutral names')
})
