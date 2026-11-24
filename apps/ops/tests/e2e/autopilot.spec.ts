import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S07-T02 · board-98 and board-99. The Owner sees the master card, the week, the legend and every group; a
 * locked row is not a control; one change turns the mode to Custom and is logged; the action drawer shows the
 * level cards, the chaser rules, the template and the history, and raising a level asks first. The Helper
 * reads only. No mention of WhatsApp anywhere.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const saved: { key: string; level: string; version: number }[] = []
let savedMode: unknown = null

test.beforeAll(async () => {
  for (const key of ['extract_lines', 'chase_suppliers']) {
    const s = await db.autopilotSetting.findUniqueOrThrow({ where: { actionKey: key } })
    saved.push({ key, level: s.level, version: s.version })
  }
  savedMode = (await db.settingsEntry.findUnique({ where: { key: 'assistant.mode' } }))?.value
})

test.afterAll(async () => {
  for (const s of saved)
    await db.autopilotSetting.update({
      where: { actionKey: s.key },
      data: { level: s.level as never },
    })
  if (savedMode)
    await db.settingsEntry.update({
      where: { key: 'assistant.mode' },
      data: { value: savedMode as never },
    })
})

test('board-98: the Owner sees Autopilot, locked rows are not controls, no WhatsApp', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/assistant/autopilot')
  await expect(page.getByRole('heading', { name: 'Autopilot', level: 1 })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Assistant' })).toContainText(
    /Assistant (running|paused)/
  )
  await expect(page.getByRole('radiogroup', { name: 'Autopilot mode' })).toBeVisible()
  await expect(page.getByText(/^This week · /)).toBeVisible()
  await expect(page.getByText('An estimate, not a measurement', { exact: false })).toBeVisible()
  for (const g of ['Mail', 'Enquiries', 'Sourcing', 'Quotes', 'After sending', 'Orders', 'Money'])
    await expect(page.getByRole('heading', { name: new RegExp(`^${g}\\b`) })).toBeVisible()
  await expect(page.getByRole('radiogroup', { name: 'Classify incoming mail level' })).toBeVisible()
  const quotation = page.locator('[data-action="send_quotation"]')
  await expect(quotation).toContainText('Locked · you send')
  await expect(quotation.getByRole('radiogroup')).toHaveCount(0)
  await page.getByText('System actions').click()
  await expect(page.locator('[data-action="supplier_payments"]')).toContainText('Never')
  expect((await page.content()).toLowerCase()).not.toContain('whatsapp')
  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('board-98: one change turns the mode to Custom and is logged', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/assistant/autopilot')
  const group = page.getByRole('radiogroup', { name: 'Extract lines level' })
  const current = await group.getByRole('radio', { checked: true }).textContent()
  const next = current === 'Suggest' ? 'Off' : 'Suggest'
  await group.getByRole('radio', { name: next }).click()
  await expect(page.getByText(new RegExp(`Extract lines: .+ → ${next}`))).toBeVisible()
  await expect(
    page.getByRole('radiogroup', { name: 'Autopilot mode' }).getByRole('radio', { name: 'Custom' })
  ).toHaveAttribute('aria-checked', 'true')
  const log = await db.activityEvent.findFirst({
    where: { field: 'autopilot.extract_lines.level' },
    orderBy: { at: 'desc' },
  })
  expect(log?.note).toMatch(/changed Extract lines: .+ → (Suggest|Off)/)
})

test('board-99: the action drawer, its rules, template, history and the confirmation', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/assistant/autopilot?action=chase_suppliers')
  const drawer = page.getByRole('dialog', { name: 'Chase suppliers' })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText('Level', { exact: true })).toBeVisible()
  await expect(
    drawer.getByText('No chasers. Late suppliers show in Waiting on others only.')
  ).toBeVisible()
  await expect(drawer.getByLabel('First chase after reply-by')).toBeVisible()
  await expect(drawer.getByText('RE: RFQ IH-RFQ-2611-P04 — reminder')).toBeVisible()
  await expect(drawer.getByRole('heading', { name: 'History · last 10 runs' })).toBeVisible()
  const tell = drawer.getByRole('radio', { name: /Do and tell/ })
  const raise = (await tell.isChecked()) ? drawer.getByRole('radio', { name: /Do quietly/ }) : tell
  await raise.check()
  await drawer.getByRole('button', { name: 'Save' }).click()
  const confirm = page.getByRole('dialog', {
    name: 'Let the Assistant chase suppliers without asking?',
  })
  await expect(confirm).toBeVisible()
  await expect(confirm).toContainText('Still asks you for new suppliers')
  await confirm.getByRole('button', { name: 'Cancel' }).click()
  await expect(confirm).toBeHidden()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/\/assistant\/autopilot$/)
})

test('board-98: the Helper reads only', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/assistant/autopilot')
  await expect(
    page.getByText('You can see Autopilot but not change it.', { exact: false })
  ).toBeVisible()
  await expect(page.getByRole('radiogroup', { name: 'Autopilot mode' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Pause everything' })).toHaveCount(0)
  await expect(page.locator('[data-action="extract_lines"]')).toContainText('read only')
})

test('S07-T07: Compare modes and Settings home list the defaults awaiting sign-off', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/assistant/autopilot')
  await page.getByRole('link', { name: 'Compare modes' }).click()
  const help = page.getByRole('dialog', { name: 'Compare the Autopilot modes' })
  await expect(help).toBeVisible()
  await expect(help.getByText(/Send quotation: locked at Draft and ask/)).toBeVisible()
  await page.keyboard.press('Escape')
  await page.goto('/settings')
  const list = page.locator('[data-part="awaiting-signoff"]')
  await expect(list).toContainText('Default · awaiting sign-off')
  for (const area of [
    'Autopilot levels',
    'Guardrail values',
    'Minutes saved per task',
    'Email wording',
  ])
    await expect(list).toContainText(area)
  await list.getByRole('link', { name: 'Supplier chaser' }).click()
  await expect(page.getByRole('dialog', { name: 'Chase suppliers' })).toBeVisible()
})
