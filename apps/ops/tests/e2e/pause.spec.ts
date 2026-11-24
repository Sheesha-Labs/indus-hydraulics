import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S05-T08 · pause: the Owner pauses from the sidebar pill (board 102 state 1), the banner shows on every page
 * (state 2), the Helper sees the state and no Pause (state 6), and Resume on the banner ends it. The
 * pipeline's wait-then-run is covered by inngest/pause.test.ts and pause.db.test.ts (no Inngest dev server in
 * this suite). Serial: the pause row is shared.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

async function unpause() {
  await db.assistantState.updateMany({
    where: { id: 1 },
    data: { pausedAt: null, pausedById: null, pauseNote: null },
  })
}

test.beforeAll(unpause)
test.afterAll(unpause)

test('pause: the Owner pauses from the pill, the Helper cannot, Resume on the banner ends it', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  const pill = page.locator('[data-part="assistant-pill"]').first()
  // The server caches the pause row for 15 s: wait for it to read "running" after beforeAll.
  await expect
    .poll(
      async () => {
        await page.goto('/today')
        await expect(pill).toBeVisible({ timeout: 90_000 })
        return pill.getAttribute('data-status')
      },
      { timeout: 60_000, intervals: [2_000, 5_000] }
    )
    .toBe('running')
  await pill.click()
  const pop = page.getByRole('dialog', { name: 'Assistant running' })
  await expect(pop).toBeVisible()
  await expect(pop.getByText(/actions? this week/)).toBeVisible()
  await expect(pop.getByRole('link', { name: /Open Autopilot/ })).toHaveAttribute(
    'href',
    '/assistant/autopilot'
  )
  await pop.getByRole('button', { name: 'Pause everything' }).click()
  await expect(page.locator('[data-part="toast-region"]')).toContainText('Assistant paused')
  await expect(page.getByText(/^Assistant paused by you at \d{2}:\d{2}\./)).toBeVisible({
    timeout: 30_000,
  })
  await expect(
    page.getByText('Nothing is read or sent until you resume. Mail keeps arriving in Gmail.')
  ).toBeVisible()
  await expect(
    page.locator('[data-part="assistant-pill"][data-status="paused"]').first()
  ).toBeVisible()
  expect((await db.assistantState.findUniqueOrThrow({ where: { id: 1 } })).pausedAt).not.toBeNull()

  // The same banner on Mail.
  await page.goto('/mail')
  await expect(page).toHaveURL(/\/mail\/all$/, { timeout: 90_000 })
  await expect(page.getByText(/^Assistant paused by you at/)).toBeVisible({ timeout: 60_000 })

  // The Helper: the state, no Pause, no Resume.
  await signedInAs('helper')
  await page.goto('/today')
  await expect(page.getByText(/^Assistant paused by [A-Z]{2} at/)).toBeVisible({ timeout: 90_000 })
  await expect(page.getByRole('button', { name: 'Resume' })).toHaveCount(0)
  await page.locator('[data-part="assistant-pill"]').first().click()
  await expect(page.getByText('Only the Owner can pause or resume the Assistant.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Resume' })).toHaveCount(0)
  await page.keyboard.press('Escape')

  // The Owner resumes from the banner.
  await signedInAs('owner')
  await page.goto('/today')
  await page.getByRole('button', { name: 'Resume' }).first().click()
  await expect(page.locator('[data-part="toast-region"]')).toContainText('Assistant resumed')
  await expect(page.getByText(/^Assistant paused by/)).toHaveCount(0, { timeout: 30_000 })
  expect((await db.assistantState.findUniqueOrThrow({ where: { id: 1 } })).pausedAt).toBeNull()
})
