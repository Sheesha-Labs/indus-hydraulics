import { expect, test } from '@playwright/test'
import { isPending, prepare, settle } from '../visual/helpers'
import { compareToReference } from './compare'
import { captureElement, closeReference, hasReference, renderReference } from './reference'

/**
 * L1 Component Sheet parity, k01–k12 (k00 Shell is S02). A section still showing its "pending"
 * placeholder is skipped as fixme, so a kit is checked from the commit that builds it. Allowed ratios
 * above 0.02 are explained in the S01 PR body (neutral fixtures in place of the handoff's data).
 */
const SECTIONS: { id: string; max?: number }[] = [
  { id: 'k01' },
  { id: 'k02' },
  { id: 'k03', max: 0.06 },
  { id: 'k04', max: 0.06 },
  { id: 'k05', max: 0.06 },
  { id: 'k06', max: 0.06 },
  { id: 'k07', max: 0.08 },
  { id: 'k08', max: 0.06 },
  { id: 'k09', max: 0.04 },
  { id: 'k10', max: 0.04 },
  { id: 'k11', max: 0.04 },
  { id: 'k12', max: 0.06 },
]

test.describe('L1 Component Sheet parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')
  test.afterAll(closeReference)

  for (const s of SECTIONS) {
    test(`L1 ${s.id}`, async ({ page, context }) => {
      await prepare(page)
      await page.goto('/_kit/l1')
      await settle(page)
      test.fixme(await isPending(page, s.id), `${s.id} is not built yet`)
      const ours = await captureElement(page, `[data-kit-section="${s.id}"] [data-kit-part="spec"]`)
      const refPage = await context.newPage()
      const ref = await renderReference(refPage, 'L1 Component Sheet.dc.html', s.id)
      await refPage.close()
      const { ratio, size } = compareToReference(ours, ref, { name: `l1-${s.id}` })
      console.log(`L1 ${s.id}: diff ${ratio.toFixed(4)} (${size})`)
      expect(ratio).toBeLessThanOrEqual(s.max ?? 0.02)
    })
  }
})
