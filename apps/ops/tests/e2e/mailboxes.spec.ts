import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import type { Page } from '@playwright/test'
import { expect, test } from '../signed-in'

/**
 * S04 · Settings › Mailboxes (board 85), Settings › Sending (board 87), the system banners (board 89) and
 * Disconnect (board 90), as the Owner and the Helper. Fixture mailboxes on example.test are created here and
 * removed at the end; nothing talks to Google (Disconnect's revoke finds no token to revoke).
 *
 * Needs the seeded demo users (SEED_DEMO=1 bun run --filter @indus/ops-db db:seed) and the S04 migrations on the
 * dev database. Serial: it changes shared settings rows and puts them back.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const SALES = 'e2e-s04-sales@example.test'
const PURCHASE = 'e2e-s04-purchase@example.test'
const ACCOUNTS = 'e2e-s04-accounts@example.test'
const ids: Record<string, string> = {}
let ruleSnapshot: Awaited<ReturnType<typeof db.sendingRule.findMany>> = []

async function blocking(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

test.beforeAll(async () => {
  ruleSnapshot = await db.sendingRule.findMany()
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s04-' } } })
  const owner = await db.user.findFirstOrThrow({ where: { role: 'owner', status: 'active' } })
  const scopes = [
    'openid',
    'email',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.send',
  ]
  const now = Date.now()
  const sales = await db.mailbox.create({
    data: {
      address: SALES,
      displayName: 'Sales Example',
      role: 'client',
      status: 'live',
      canSend: true,
      canLabel: true,
      scopes,
      sendAsAliases: [SALES],
      ownerUserId: owner.id,
      signatureHtml: '<div>Best regards,<br><b>Owner Example</b><br>Example Trading LLC</div>',
      backfillMonths: 12,
      backfillTotal: 9412,
      syncState: {
        create: {
          lastSuccessfulSyncAt: new Date(now - 60_000),
          lastMessageAt: new Date(now - 120_000),
          watchExpiresAt: new Date(now + 6 * 86_400_000),
          backfillState: {
            phase: 'done',
            queued: 9000,
            skipped: 400,
            alreadyStored: 12,
            updatedAt: new Date(now).toISOString(),
          },
        },
      },
    },
  })
  const purchase = await db.mailbox.create({
    data: {
      address: PURCHASE,
      displayName: 'Purchase Example',
      role: 'supplier',
      status: 'behind',
      canSend: true,
      canLabel: true,
      scopes,
      sendAsAliases: [PURCHASE],
      backfillMonths: 12,
      backfillTotal: 8000,
      syncState: {
        create: {
          lastSuccessfulSyncAt: new Date(now - 2 * 3_600_000),
          lastMessageAt: new Date(now - 6 * 60_000),
          watchExpiresAt: new Date(now + 6 * 86_400_000),
          backfillState: { phase: 'fetching', queued: 5000, skipped: 120, etaMinutes: 40 },
        },
      },
    },
  })
  const accounts = await db.mailbox.create({
    data: {
      address: ACCOUNTS,
      displayName: 'Accounts Example',
      role: 'read_only',
      status: 'token_expired',
      scopes,
      syncState: { create: {} },
    },
  })
  Object.assign(ids, { sales: sales.id, purchase: purchase.id, accounts: accounts.id })
})

test.afterAll(async () => {
  for (const r of ruleSnapshot) {
    const { kind, updatedAt: _u, ...data } = r
    await db.sendingRule.update({ where: { kind }, data })
  }
  await db.outboundEmail.deleteMany({ where: { mailboxId: { in: Object.values(ids) } } })
  await db.mailbox.deleteMany({ where: { address: { startsWith: 'e2e-s04-' } } })
  await db.$disconnect()
})

test.describe('board-85 mailboxes', () => {
  test('the Owner sees every card with its health, role, permissions and labels', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await page.goto('/settings/mailboxes')
    await expect(page.getByRole('heading', { name: 'Mailboxes' })).toBeVisible()
    // The header action (the sub-nav has a "Sending rules" link too).
    await expect(
      page.locator('a[data-variant="secondary"]', { hasText: 'Sending rules' })
    ).toBeVisible()

    const sales = page.locator(`[data-mailbox="${SALES}"]`)
    await expect(sales.getByText(/Live · last message 2 min ago/)).toBeVisible()
    await expect(sales.getByText('Done · 9,412 messages', { exact: false })).toBeVisible()
    await expect(sales.getByRole('radio', { name: /Client/ })).toBeChecked()
    await expect(sales.getByRole('switch', { name: /Archive/ })).toBeDisabled()
    await expect(sales.getByText('Indus/Enquiry').first()).toBeVisible()

    const purchase = page.locator(`[data-mailbox="${PURCHASE}"]`)
    await expect(purchase.getByText(/64% · 5,120 of 8,000 · about 40 min left/)).toBeVisible()
    await expect(
      purchase.getByText(/RFQs, chasers and supplier POs, Cc e2e-s04-sales@/)
    ).toBeVisible()

    // The role saves at once; a Read-only role turns Send off.
    await purchase.getByText('Read-only', { exact: true }).click()
    await expect(
      page.getByText(`${PURCHASE} is now Read-only. Send is off: this role never sends.`)
    ).toBeVisible()
    expect((await db.mailbox.findUniqueOrThrow({ where: { id: ids.purchase! } })).canSend).toBe(
      false
    )
    await purchase.getByText('Supplier', { exact: true }).click()
    await expect(page.getByText(`${PURCHASE} is now Supplier.`)).toBeVisible()

    // "Send a test email…" is the Owner's, from the overflow.
    await sales.getByRole('button', { name: `More for ${SALES}` }).click()
    await expect(page.getByRole('menuitem', { name: 'Send a test email…' })).toBeVisible()
    await page.keyboard.press('Escape')

    expect(await blocking(page)).toEqual([])
  })

  test('the Helper reads the cards but changes nothing', async ({ page, signedInAs }) => {
    await signedInAs('helper')
    await page.goto('/settings/mailboxes')
    const sales = page.locator(`[data-mailbox="${SALES}"]`)
    await expect(sales).toBeVisible()
    await expect(sales.getByRole('radio', { name: /Client/ })).toBeDisabled()
    await expect(sales.getByRole('button', { name: 'Pause reading' })).toHaveCount(0)
    await expect(sales.getByRole('button', { name: `More for ${SALES}` })).toHaveCount(0)
    await expect(sales.getByRole('button', { name: 'Disconnect' })).toHaveCount(0)
  })
})

test.describe('board-87 sending rules', () => {
  test('rows show the default awaiting sign-off until saved; a saved row signs it off', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await page.goto('/settings/sending')
    await expect(page.getByText('Rules apply to every send, approved or automatic')).toBeVisible()
    const rows = page.locator('tr[data-rule]')
    await expect(rows).toHaveCount(11)
    const follow = page.locator('tr[data-rule="follow_up"]')
    await expect(follow.getByText('Default · awaiting sign-off')).toBeVisible()
    await follow.getByRole('combobox', { name: 'Follow-up: CC' }).selectOption('supplier')
    await expect(page.getByText('Follow-up: saved.')).toBeVisible()
    await expect(follow.getByText('Default · awaiting sign-off')).toHaveCount(0)
    expect((await db.sendingRule.findUniqueOrThrow({ where: { kind: 'follow_up' } })).ccRole).toBe(
      'supplier'
    )

    await expect(page.getByRole('switch', { name: /Copy drafts into Gmail Drafts/ })).toBeDisabled()
    await expect(page.getByText('INDUS-Q26941.pdf')).toBeVisible()
    expect(await blocking(page)).toEqual([])
  })

  test('the Helper sees the rules read-only', async ({ page, signedInAs }) => {
    await signedInAs('helper')
    await page.goto('/settings/sending')
    await expect(page.getByRole('combobox', { name: 'Supplier RFQ: from' })).toBeDisabled()
  })
})

test.describe('board-89 banners', () => {
  test('one banner, the most severe, with the rest behind "+n more"', async ({
    page,
    signedInAs,
  }) => {
    await signedInAs('owner')
    await page.goto('/settings/mailboxes')
    const strip = page.locator('[data-part="banner-slot"]').first()
    await expect(strip.getByText('e2e-s04-accounts@ disconnected', { exact: false })).toBeVisible()
    await expect(strip.getByRole('link', { name: 'Reconnect' })).toBeVisible()
    await strip.getByRole('button', { name: /^\+\d+ more$/ }).click()
    await expect(
      page.getByText('e2e-s04-purchase@ is 2 hours behind.', { exact: false })
    ).toBeVisible()
  })
})

test.describe('board-90 disconnect', () => {
  test('keep: typed confirmation, live counts, then the receipt', async ({ page, signedInAs }) => {
    await signedInAs('owner')
    await page.goto('/settings/mailboxes')
    const card = page.locator(`[data-mailbox="${PURCHASE}"]`)
    await card.getByRole('button', { name: 'Disconnect' }).click()
    const dialog = page.getByRole('dialog', { name: `Disconnect ${PURCHASE}?` })
    await expect(
      dialog.getByText('Supplier RFQs, chasers and supplier POs will wait', { exact: false })
    ).toBeVisible()
    await expect(dialog.getByText(/Removes 0 emails and 0 attachments/)).toBeVisible()
    const go = dialog.getByRole('button', { name: 'Disconnect' })
    await expect(go).toBeDisabled()
    await dialog.getByLabel(/to confirm/).fill('someone@example.test')
    await expect(go).toBeDisabled()
    await dialog.getByLabel(/to confirm/).fill(PURCHASE)
    await expect(go).toBeEnabled()
    expect(await blocking(page)).toEqual([])
    await go.click()
    await expect(page.getByText(`Disconnected ${PURCHASE} · kept imported data`)).toBeVisible()
    expect((await db.mailbox.findUniqueOrThrow({ where: { id: ids.purchase! } })).status).toBe(
      'disconnected'
    )
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(card.getByText('Disconnected').first()).toBeVisible()
  })
})
