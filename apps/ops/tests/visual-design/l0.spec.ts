import { expect, test } from '@playwright/test'
import { prepare, settle } from '../visual/helpers'
import { compareToReference } from './compare'
import { captureElement, closeReference, hasReference, renderReference } from './reference'

/**
 * L0 Foundations parity: each section's spec card in /_kit/l0 against the handoff sheet, at 1440,
 * DPR 1. Local only (needs $OPS_DESIGN_REF_DIR); diffs go to $OPS_EVIDENCE_DIR/visual/s01.
 *
 * Allowed ratios above 0.02 are explained exceptions, recorded in the S01 PR body:
 *  - FONT: the console self-hosts variable Geist through next/font; the sheet loads Google's static
 *    Geist instances. Identical layout still rasterises glyphs differently, a floor of about 0.01–0.03
 *    on cards that are mostly text.
 *  - NEUTRAL: neutral samples replace the handoff's names and figures (CLAUDE.md §12).
 */
const FONT = "self-hosted variable Geist vs the sheet's Google static Geist (glyph rasterisation)"
const SECTIONS: { id: string; max?: number; why?: string }[] = [
  // Measured 0.0248 (S01-T10).
  { id: 'f01', max: 0.03, why: `wordmark in place of the logo file; neutral people; ${FONT}` },
  // Measured 0.0212.
  { id: 'f02', max: 0.025, why: FONT },
  { id: 'f03' },
  { id: 'f04' },
  // Measured 0.0172: within the default once the Chart kit parts replaced the placeholder.
  { id: 'f05', max: 0.02, why: `neutral references and figures in every value cell; ${FONT}` },
  // Measured 0.0071.
  { id: 'f06', max: 0.02, why: FONT },
  // Measured 0.0270.
  { id: 'f07', max: 0.03, why: `one rule names roles instead of people; ${FONT}` },
]

test.describe('L0 Foundations parity', () => {
  test.skip(!hasReference(), 'OPS_DESIGN_REF_DIR is not set or not readable')
  test.afterAll(closeReference)

  for (const s of SECTIONS) {
    test(`L0 ${s.id}`, async ({ page, context }) => {
      await prepare(page)
      await page.goto('/_kit/l0')
      await settle(page)
      // Every kit part the sheet embeds is built (S01-T10): no placeholder may remain.
      const spec = page.locator(`[data-kit-section="${s.id}"] [data-kit-part="spec"]`)
      await expect(spec.getByText(/ lands in S\d+/)).toHaveCount(0)
      const ours = await captureElement(page, `[data-kit-section="${s.id}"] [data-kit-part="spec"]`)
      const refPage = await context.newPage()
      const ref = await renderReference(refPage, 'L0 Foundations.dc.html', s.id)
      await refPage.close()
      const { ratio, size } = compareToReference(ours, ref, { name: `l0-${s.id}` })
      console.log(
        `L0 ${s.id}: diff ${ratio.toFixed(4)} (${size})${s.why ? ` — allowed ${s.max}: ${s.why}` : ''}`
      )
      expect(ratio).toBeLessThanOrEqual(s.max ?? 0.02)
    })
  }
})
