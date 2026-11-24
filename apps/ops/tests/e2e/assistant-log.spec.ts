import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S06-T04 · board-111 Assistant log: the day's summary, an Assistant row expanding to what it wrote and the
 * values it changed, Export CSV for the Owner only, costs hidden from the Helper.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const stamp = Date.now().toString(36).toUpperCase()
const ref = `A-E2E-S06C-${stamp}`

test.beforeAll(async () => {
  const a = await db.assistantAction.create({
    data: {
      ref,
      actionKey: 'ask_open_copy',
      levelAtTime: 'draft_and_ask',
      guardrails: [],
      headline: `Asked Example Sender for an open copy (${stamp})`,
      reasons: [],
      preview: {
        mailbox: 'purchase@example.test',
        to: ['sender@example-valve.test'],
        subject: 'Re: drawings',
        text: 'Could you send a copy without a password?',
      },
      state: 'done',
      surface: 'hint',
      costUsd: '0.0200',
    },
    select: { id: true },
  })
  await db.activityEvent.create({
    data: {
      actorKind: 'assistant',
      actionId: a.id,
      subjectType: 'mail_message',
      subjectId: a.id,
      kind: 'status',
      field: 'handledState',
      before: 'needs_you',
      after: 'handled',
    },
  })
})

test('board-111: the log, an expanded entry, Export for the Owner only', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/assistant/log')
  await expect(page.getByRole('heading', { name: /^Today: \d+ actions?$/ })).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByText('Append-only · entries cannot be deleted')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Export CSV' })).toBeVisible()
  const row = page.getByRole('row', { name: new RegExp(stamp) })
  await expect(row).toBeVisible()
  await expect(row.getByText('$0.02')).toBeVisible()
  await row.getByRole('button', { name: /Open the entry/ }).click()
  await expect(page.getByText('Could you send a copy without a password?')).toBeVisible({
    timeout: 30_000,
  })
  await expect(page.getByText(`Entry #${ref} · append-only`)).toBeVisible()
  await expect(page.getByText('handledState')).toBeVisible()
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(
    violations.filter((v) => v.impact === 'critical' || v.impact === 'serious').map((v) => v.id)
  ).toEqual([])

  await signedInAs('helper')
  await page.goto('/assistant/log')
  await expect(page.getByRole('heading', { name: /^Today: \d+ actions?$/ })).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByRole('link', { name: 'Export CSV' })).toHaveCount(0)
  const helperRow = page.getByRole('row', { name: new RegExp(stamp) })
  await expect(helperRow).toBeVisible()
  await expect(helperRow.getByText('$0.02')).toHaveCount(0)
  expect((await page.request.get('/api/assistant/log/export')).status()).toBe(403)
})
