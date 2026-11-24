import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S07-T04 · board-101 and board-102. Cost & limits shows the month against the budget, the breakdown and the
 * limits; saving writes the setting and this month's ai_budget row in one go. When the budget is reached the
 * page and the shell say what stopped (board 102). The Helper reads only.
 */
/** The Asia/Dubai month's first day, as ops.ai_budget keys it. */
function monthKey(now: Date): string {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now)
  return `${p.find((x) => x.type === 'year')?.value}-${p.find((x) => x.type === 'month')?.value}-01`
}

test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const month = new Date(`${monthKey(new Date())}T00:00:00Z`)
let saved: { limitUsd: unknown; mode: string; spentUsd: unknown } | null = null
let savedSettings: { key: string; value: unknown }[] = []

test.beforeAll(async () => {
  await db.$executeRaw`SELECT ops.ai_budget_ensure_month(${monthKey(new Date())}::date)`
  const row = await db.aiBudget.findUniqueOrThrow({ where: { month } })
  saved = { limitUsd: row.limitUsd, mode: row.mode, spentUsd: row.spentUsd }
  savedSettings = await db.settingsEntry.findMany({
    where: { key: { in: ['assistant.budget', 'research.cap'] } },
    select: { key: true, value: true },
  })
})

test.afterAll(async () => {
  if (saved)
    await db.aiBudget.update({
      where: { month },
      data: {
        limitUsd: saved.limitUsd as never,
        mode: saved.mode,
        spentUsd: saved.spentUsd as never,
      },
    })
  for (const s of savedSettings)
    await db.settingsEntry.update({ where: { key: s.key }, data: { value: s.value as never } })
})

test('board-101: month to date, breakdown, limits; saving updates this month', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/assistant/cost')
  await expect(page.getByRole('heading', { name: 'Cost & limits', level: 1 })).toBeVisible()
  await expect(page.getByText(/^Month to date · /)).toBeVisible()
  await expect(page.getByText(/of USD [\d,]+ budget · day \d+ of \d+/)).toBeVisible()
  await expect(page.getByRole('radiogroup', { name: 'Breakdown by' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Most expensive runs' })).toBeVisible()
  await page.getByLabel('Monthly budget').fill('175')
  await page.getByRole('radio', { name: /Warn only/ }).check()
  await page.getByRole('button', { name: 'Save limits' }).click()
  await expect(page.getByText('Limits saved')).toBeVisible()
  const row = await db.aiBudget.findUniqueOrThrow({ where: { month } })
  expect(row.limitUsd.toNumber()).toBe(175)
  expect(row.mode).toBe('warn_only')
  // Settled: the form matches what was saved (Save is disabled again, not mid-save).
  await expect(page.getByRole('button', { name: 'Save limits' })).toBeDisabled()
  await page.waitForTimeout(400)
  const axe = await new AxeBuilder({ page }).analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])
})

test('board-102: a reached budget is said on the page and in the shell', async ({
  page,
  signedInAs,
}) => {
  await db.aiBudget.update({
    where: { month },
    data: { limitUsd: 150, mode: 'warn_pause_research', spentUsd: 150 },
  })
  await signedInAs('owner')
  await page.goto('/assistant/cost')
  await expect(
    page.getByText('Budget reached: research paused, reading continues.', { exact: false })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Raise to USD 200' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Research these anyway' })).toBeDisabled()
  // The shell strip shows the most severe banner; the rest sit behind "+n more" (mailboxes on the local
  // database may be disconnected, which ranks first).
  // The shell reads the budget state at most once a minute (displayBudgetState), so reload until it shows.
  const text = page.getByText('Research paused: the monthly AI budget is reached.')
  const more = page.getByRole('button', { name: /^\+\d+ more$/ })
  await expect(async () => {
    await page.goto('/review')
    if (await more.isVisible()) await more.click()
    await expect(text).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 90_000, intervals: [5_000] })
})

test('board-101: the Helper reads only', async ({ page, signedInAs }) => {
  await signedInAs('helper')
  await page.goto('/assistant/cost')
  await expect(page.getByLabel('Monthly budget')).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Save limits' })).toHaveCount(0)
})
