import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S10-T07 · boards 130–132. 130: the checklist and the promotion asked for Review. 131: the effects listed, the
 * block applied, the profile shows Blocked; the Helper cannot unblock. 132: a pending bank change (as the alert
 * leaves it): the banner, the numbers in the email marked "do not use", the Owner's genuine call-back, then the
 * cooling-off on the payment gate.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const tag = `e2etr${Date.now()}`
let supplierId = ''
let accountId = ''

test.beforeAll(async () => {
  supplierId = (
    await db.company.create({
      data: {
        name: `Example Valvole ${tag}`,
        isSupplier: true,
        primaryDomain: `${tag}.example`,
        domains: [`${tag}.example`],
        supplierProfile: { create: { tier: 'contact_only', registryPhone: '+39 030 000 2140' } },
      },
      select: { id: true },
    })
  ).id
  const mailbox = await db.mailbox.findFirstOrThrow({ select: { id: true } })
  const thread = await db.mailThread.create({
    data: { mailboxId: mailbox.id, gmailThreadId: `${tag}-t` },
    select: { id: true },
  })
  const msg = await db.mailMessage.create({
    data: {
      mailboxId: mailbox.id,
      threadId: thread.id,
      gmailMessageId: `${tag}-m`,
      direction: 'inbound',
      origin: 'live',
      fromAddress: `accounts@${tag}-spa.example`,
      toAddresses: ['purchase@example.test'],
      subject: 'New bank details',
      bodyText:
        'Please note our bank has changed. Kindly remit the balance now. Call +39 351 000 8812.',
      sentAt: new Date(),
      receivedAt: new Date(),
    },
    select: { id: true },
  })
  accountId = (
    await db.supplierBankAccount.create({
      data: {
        supplierId,
        bankName: 'Requested by email',
        accountName: 'Example Valvole',
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
          domain: `${tag}-spa.example`,
        },
      },
      select: { id: true },
    })
  ).id
})
test.afterAll(async () => {
  await db.company.update({ where: { id: supplierId }, data: { archivedAt: new Date() } })
})

const axeClean = async (page: import('@playwright/test').Page, scope: string) => {
  const axe = await new AxeBuilder({ page }).include(scope).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
}

test('board-132: banner, do-not-use numbers, genuine call-back and the cooling-off', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/suppliers/${supplierId}/bank-change/${accountId}`)
  await expect(page.locator('[data-built="bank-change"]')).toBeVisible({ timeout: 90_000 })
  await expect(
    page.getByRole('alert').filter({ hasText: 'Bank change requested' }).first()
  ).toContainText('payments to Example Valvole')
  await expect(page.getByText('do not use')).toBeVisible()
  await expect(page.locator('[data-part="payment-gate"]')).toContainText('bank change pending')
  await axeClean(page, '[data-built="bank-change"]')
  const cb = page.locator('[data-part="bank-change-callback"]')
  await cb.getByLabel('Spoke to (name and role)').fill('Giulia Example, Accounts')
  await cb.getByRole('button', { name: 'Save call-back' }).click()
  await expect(page.locator('[data-state="verified"]')).toContainText('cooling-off until')
  await expect(page.locator('[data-part="payment-gate"]')).toContainText('cooling off')
})

test('board-130: the checklist, and a promotion asked for Review', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto(`/suppliers/${supplierId}/promote`)
  await expect(page.locator('[data-built="supplier-promote"]')).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('region', { name: 'Promotion checklist' })).toContainText(
    'Bank details verified by call-back'
  )
  await page.getByRole('button', { name: /Promote .* to Trial/ }).click()
  await expect(page.getByText('The card is in Review for Krishan')).toBeVisible()
})

test('board-131: block lists its effects and applies them; the Helper cannot unblock', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('helper')
  await page.goto(`/suppliers/${supplierId}/block`)
  await expect(page.locator('[data-built="supplier-block"]')).toBeVisible({ timeout: 90_000 })
  await expect(page.locator('[data-part="block-effects"]')).toContainText(
    'Nothing is sent to the supplier.'
  )
  await axeClean(page, '[data-built="supplier-block"]')
  await page.getByText('Counterfeit', { exact: true }).click()
  await page.getByRole('button', { name: `Block Example Valvole ${tag}` }).click()
  await page.waitForURL(new RegExp(`/suppliers/${supplierId}$`))
  await expect(page.locator('[data-state="blocked"]')).toContainText('counterfeit')
  expect(
    (await db.supplierProfile.findUniqueOrThrow({ where: { companyId: supplierId } })).tier
  ).toBe('blocked')
  await page.goto(`/suppliers/${supplierId}/block?unblock=1`)
  await expect(page.getByText('Only Krishan lifts a block.')).toBeVisible()
})
