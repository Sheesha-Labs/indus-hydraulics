import { expect, test, type Page } from '@playwright/test'
import { isPending, prepare, settle } from '../visual/helpers'
import { compareToReference, type Mask } from './compare'
import { captureElement, closeReference, hasReference, renderReference } from './reference'

/**
 * L1 Component Sheet parity, k01–k12 (k00 Shell is S02). A section still showing its "pending"
 * placeholder is skipped as fixme, so a kit is checked from the commit that builds it. Allowed ratios
 * above 0.02 are explained in the S01 PR body (neutral fixtures in place of the handoff's data).
 */
const SECTIONS: { id: string; max?: number; mask?: string }[] = [
  { id: 'k01' },
  { id: 'k02' },
  { id: 'k03', max: 0.06 },
  { id: 'k04', max: 0.06 },
  { id: 'k05', max: 0.06 },
  { id: 'k06', max: 0.06 },
  // k07: the sheet prints the real letterhead and bank block; ours prints the neutral fixture. Both regions
  // are masked on both sides ([data-doc-region], widened to the page frame), not compared.
  { id: 'k07', max: 0.08, mask: '[data-doc-region]' },
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
      const spec = `[data-kit-section="${s.id}"] [data-kit-part="spec"]`
      const ours = await captureElement(page, spec)
      const masks = s.mask ? await maskRects(page, spec, s.mask) : []
      const refPage = await context.newPage()
      const ref = await renderReference(refPage, 'L1 Component Sheet.dc.html', s.id)
      await refPage.close()
      const { ratio, size } = compareToReference(ours, ref, { name: `l1-${s.id}`, masks })
      console.log(`L1 ${s.id}: diff ${ratio.toFixed(4)} (${size})`)
      expect(ratio).toBeLessThanOrEqual(s.max ?? 0.02)
    })
  }
})

/**
 * Rectangles of every `selector` match inside the spec card, relative to the card. A match inside a
 * scaled document frame ([data-doc-frame]) is widened to the frame, because the sheet's page lays the same
 * region out a little wider than ours.
 */
async function maskRects(page: Page, spec: string, selector: string): Promise<Mask[]> {
  return page.evaluate(
    ([specSel, sel]) => {
      const card = document.querySelector(specSel)!.getBoundingClientRect()
      return [...document.querySelectorAll(`${specSel} ${sel}`)].map((el) => {
        const r = el.getBoundingClientRect()
        const f = el.closest('[data-doc-frame]')?.getBoundingClientRect()
        const x = f ? f.x : r.x
        const w = f ? f.width : r.width
        return {
          x: Math.floor(x - card.x),
          y: Math.floor(r.y - card.y),
          w: Math.ceil(w),
          h: Math.ceil(r.height),
        }
      })
    },
    [spec, selector] as const
  )
}
