import { expect, test } from '@playwright/test'

test('Geist 400/500/600 and Instrument Serif 400 are loaded', async ({ page }) => {
  await page.goto('/_kit/l0')
  await page.evaluate(() => document.fonts.ready)
  const faces = await page.evaluate(() =>
    [...document.fonts].map((f) => `${f.family.replace(/['"]/g, '')}|${f.weight}|${f.status}`)
  )
  const loaded = (family: RegExp, weight: string) =>
    faces.some((f) => {
      const [fam, w] = f.split('|')
      return family.test(fam ?? '') && (w === weight || (w ?? '').includes(' '))
    })
  for (const w of ['400', '500', '600']) expect(loaded(/Geist/, w), `Geist ${w}`).toBe(true)
  expect(loaded(/Instrument Serif/, '400'), 'Instrument Serif 400').toBe(true)
})
