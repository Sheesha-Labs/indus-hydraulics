import AxeBuilder from '@axe-core/playwright'
import { opsDb as db } from '@indus/ops-db'
import { expect, test } from '../signed-in'

/**
 * S11-T08 · board 214. The Owner sees every series with its pattern, next number and continuity; INDUS/Q is
 * unseeded until the cutover batch and cannot be seeded here; the Owner seeds (or moves) the order
 * acknowledgement series with its evidence; a pattern naming a counterparty is refused in the form. The Helper
 * reads the page without the buttons.
 */
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

test('board-214 · the series, INDUS/Q waiting for the cutover, and seeding the OA series', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('owner')
  await page.goto('/settings/numbering')
  const table = page.getByRole('table', { name: 'Number series' })
  await expect(table.getByRole('row', { name: /Quotation INDUS\/Q\{n\}/ })).toContainText(
    'Unseeded · cutover batch'
  )
  await expect(table.getByRole('row', { name: /Order acknowledgement/ })).toBeVisible()

  // INDUS/Q: no seed form, only the explanation.
  await page.goto('/settings/numbering?key=quotation')
  await expect(
    page
      .getByRole('region', { name: 'Quotation' })
      .getByText(/INDUS\/Q is seeded in the cutover batch from the highest number/)
  ).toBeVisible()
  await expect(page.getByRole('form', { name: 'Seed Quotation' })).toHaveCount(0)

  // The OA series: seed or move it to the proposed next number.
  await page.goto('/settings/numbering?key=order_ack')
  const seed = page.getByRole('form', { name: 'Seed Order acknowledgement' })
  await expect(seed).toBeVisible()
  const proposed = Number(await seed.getByRole('spinbutton').inputValue())
  expect(proposed).toBeGreaterThan(0)
  await seed.getByRole('button', { name: /Seed this series|Set next number/ }).click()
  await expect
    .poll(
      async () =>
        (await db.numberSequence.findUniqueOrThrow({ where: { key: 'order_ack' } })).seededAt
    )
    .not.toBeNull()
  await expect(table.getByRole('row', { name: /Order acknowledgement/ })).toContainText(
    `INDUS/OA${proposed}`
  )

  // A pattern that names a counterparty is refused before it is sent.
  const pattern = page.getByRole('form', { name: 'Pattern of Order acknowledgement' })
  await pattern.getByRole('textbox', { name: 'Pattern' }).fill('INDUS/OA{n}-{client}')
  await expect(pattern.getByText(/counterparty/)).toBeVisible()
  await expect(pattern.getByRole('button', { name: 'Save pattern' })).toBeDisabled()

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  expect(axe.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')).toEqual(
    []
  )
})

test('board-214 · the Helper reads the series without the buttons', async ({
  page,
  signedInAs,
}) => {
  await signedInAs('helper')
  await page.goto('/settings/numbering?key=order_ack')
  await expect(page.getByRole('table', { name: 'Number series' })).toBeVisible()
  await expect(page.getByRole('form', { name: 'Seed Order acknowledgement' })).toHaveCount(0)
  await expect(page.getByRole('form', { name: 'Pattern of Order acknowledgement' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Confirm numbering style' })).toHaveCount(0)
})
