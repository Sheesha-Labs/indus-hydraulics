import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S09-T02 · board-04 Enquiries pipeline. A dedicated owner (initials from the run) keeps the board to this
 * test's enquiries (?owner=). Drags are requests to the stage machine: a refused one snaps back with the
 * reason; Won goes to the quotation's PO check; an allowed one moves the card. "Move to…" lists only the
 * columns the machine allows. The table keeps sort, filter and page in the URL.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)

const tag = `e2epl${Date.now()}`
const initials = `Q${String.fromCharCode(65 + (Date.now() % 26))}${String.fromCharCode(65 + ((Date.now() >> 5) % 26))}`
const owner = initials.toLowerCase()
let userId = ''
const ids: string[] = []
const refs: Record<string, string> = {}

test.beforeAll(async () => {
  userId = (
    await db.user.create({
      data: {
        email: `${tag}@example.test`,
        name: 'Pipeline E2E',
        initials,
        role: 'helper',
        status: 'active',
      },
      select: { id: true },
    })
  ).id
  const mk = async (key: string, stage: string, n: number, extra: Record<string, unknown> = {}) => {
    const ref = `ENQ-2096-${String(Date.now()).slice(-6)}${n}`
    const e = await db.enquiry.create({
      data: {
        ref,
        title: `${key} ${tag}`,
        receivedVia: 'email',
        receivedAt: new Date(),
        deadline: new Date(Date.now() + (5 + n) * 86_400_000),
        ownerId: userId,
        stage: stage as never,
        estValueMax: '86000',
        estCurrency: 'USD',
        lines: { create: [{ no: 1, description: 'Gate valve', qty: 2 }] },
        ...extra,
      },
      select: { id: true },
    })
    ids.push(e.id)
    refs[key] = ref
  }
  await mk('Fresh', 'new', 1)
  await mk('Chosen', 'qualifying', 2, { chosenPath: 'quote_fully' })
  await mk('Offered', 'quoted', 3)
  // Enough rows for a second table page.
  await db.enquiry.createMany({
    data: Array.from({ length: 50 }, (_, i) => ({
      ref: `ENQ-2096-${String(Date.now()).slice(-5)}${String(i).padStart(2, '0')}9`,
      title: `Filler ${i} ${tag}`,
      receivedVia: 'email' as const,
      receivedAt: new Date(Date.now() - i * 60_000),
      deadline: new Date(Date.now() + (40 + i) * 86_400_000),
      ownerId: userId,
      stage: 'won' as const,
    })),
  })
  ids.push(
    ...(
      await db.enquiry.findMany({
        where: { ownerId: userId, title: { startsWith: 'Filler' } },
        select: { id: true },
      })
    ).map((e) => e.id)
  )
})

test.afterAll(async () => {
  await db.enquiry.updateMany({
    where: { id: { in: ids } },
    data: { closedAt: new Date(), ownerId: null },
  })
  await db.user.update({ where: { id: userId }, data: { status: 'removed' } })
})

const card = (page: import('@playwright/test').Page, key: string) =>
  page.locator(`[data-part="pipeline-card"][data-ref="${refs[key]}"]`)
const column = (page: import('@playwright/test').Page, key: string) =>
  page.locator(`section[data-column="${key}"]`)

test('board-04: drags ask the machine; refused cards snap back with the reason', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto(`/enquiries?owner=${owner}`)
  await expect(page.locator('[data-built="pipeline-board"][data-ready]')).toBeVisible()
  await expect(column(page, 'enquiry').getByRole('heading')).toContainText('Enquiry')
  await expect(column(page, 'enquiry').locator('[data-part="pipeline-card"]')).toHaveCount(2)
  await expect(card(page, 'Fresh')).toContainText('0 / 1 sent')
  await expect(card(page, 'Fresh')).toContainText('$86K')
  const axe = await new AxeBuilder({ page }).include('[data-built="pipeline-board"]').analyze()
  expect(axe.violations.filter((v) => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([])

  // No path chosen: Sourcing refuses.
  await card(page, 'Fresh').dragTo(column(page, 'sourcing'))
  await expect(page.locator('[data-part="toast-region"]')).toContainText(
    'Choose a path on the qualification card first'
  )
  await expect(column(page, 'enquiry').locator(`[data-ref="${refs.Fresh}"]`)).toHaveCount(1)

  // A path chosen: the card moves and stays after a reload.
  await card(page, 'Chosen').dragTo(column(page, 'sourcing'))
  await expect(column(page, 'sourcing').locator(`[data-ref="${refs.Chosen}"]`)).toHaveCount(1)
  await expect
    .poll(async () => (await db.enquiry.findFirstOrThrow({ where: { ref: refs.Chosen } })).stage)
    .toBe('sourcing')
  await page.reload()
  await expect(page.locator('[data-built="pipeline-board"][data-ready]')).toBeVisible()
  await expect(column(page, 'sourcing').locator(`[data-ref="${refs.Chosen}"]`)).toHaveCount(1)

  // Won is never a drag: the PO check on the quotation.
  await card(page, 'Offered').dragTo(column(page, 'won'))
  await expect(page.locator('[data-part="toast-region"]')).toContainText(
    'Record the client PO to mark it Won'
  )
  await page.waitForURL(`**/enquiries/${refs.Offered}/quotation?po=check`)
  expect((await db.enquiry.findFirstOrThrow({ where: { ref: refs.Offered } })).stage).toBe('quoted')
})

test('board-04: "Move to…" lists only the allowed columns', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/enquiries?owner=${owner}`)
  await expect(page.locator('[data-built="pipeline-board"][data-ready]')).toBeVisible()
  await page.getByRole('button', { name: `Move ${refs.Offered} to…` }).focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu.getByRole('menuitem')).toHaveText([
    'Move to Negotiation',
    'Won · record the client PO',
    'Lost…',
  ])
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: `Move ${refs.Fresh} to…` }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('menu').getByRole('menuitem')).toHaveText([
    'No move from here: open the enquiry',
  ])
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: `Move ${refs.Offered} to…` }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('menuitem', { name: 'Move to Negotiation' }).click()
  await expect(column(page, 'negotiation').locator(`[data-ref="${refs.Offered}"]`)).toHaveCount(1)
  await expect
    .poll(async () => (await db.enquiry.findFirstOrThrow({ where: { ref: refs.Offered } })).stage)
    .toBe('negotiation')
})

test('board-04: the table keeps filter, sort and page in the URL', async ({ page, signedInAs }) => {
  await signedInAs('owner')
  await page.goto(`/enquiries?owner=${owner}`)
  await page.getByRole('navigation', { name: 'View' }).getByRole('link', { name: 'Table' }).click()
  await page.waitForURL(`**/enquiries?view=table&owner=${owner}`)
  const rows = page.locator('[role="row"][data-kind="item"]')
  await expect(
    page.getByRole('navigation', { name: 'Stage' }).getByRole('link', { name: /All/ })
  ).toContainText('53')
  await page.getByRole('link', { name: 'Next 50' }).click()
  await expect(page).toHaveURL(/cursor=/)
  await page.reload()
  await expect(page.getByRole('link', { name: 'First page' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Stage' }).getByRole('link', { name: /Won/ }).click()
  await expect(page).toHaveURL(/stage=won/)
  await expect(page).not.toHaveURL(/cursor=/)
  await page.getByRole('link', { name: /Deadline/ }).click()
  await expect(page).toHaveURL(/dir=desc/)
  await page.reload()
  await expect(page).toHaveURL(/stage=won/)
  await expect(rows.first()).toBeVisible()
})
