import { expect, test, type Page } from '@playwright/test'
import { PNG } from 'pngjs'
import { isPending, prepare, settle } from '../visual/helpers'
import { compareToReference, recordParity, type Mask } from './compare'
import { captureElement, closeReference, hasReference, renderReference } from './reference'

/**
 * L1 Component Sheet parity, k00–k12. Every kit is built (S01-T10, the Shell in S02): a section showing its
 * placeholder fails. Allowed ratios above 0.02 are explained in the S01 PR body (neutral fixtures in place
 * of the handoff's data).
 */
interface Section {
  id: string
  max?: number
  mask?: string
  /**
   * Compare from this row down, on both sides: the card is cut just above `ours` (inside our card) and
   * `ref` (inside the sheet's card). For a row with its own parity spec whose height differs by decision.
   */
  from?: { ours: string; ref: string }
}

const SECTIONS: Section[] = [
  // k00: the Sidebar row is compared on its own in sidebar.spec.ts, with Money (C10, a row the handoff never
  // drew) cut out; here the card is compared from the Page header row down. The board frame's sidebar still
  // carries Money (its rows below it sit one item lower) and the logo slot is masked.
  {
    id: 'k00',
    mask: '[data-shell-logo]',
    from: {
      ours: '[data-kit-row="Page header"]',
      ref: '#k00 > .cv-spec > .cv-sr:nth-child(2)',
    },
  },
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
      expect(await isPending(page, s.id), `${s.id} renders its placeholder`).toBe(false)
      const spec = `[data-kit-section="${s.id}"] [data-kit-part="spec"]`
      let ours = await captureElement(page, spec)
      let masks = s.mask ? await maskRects(page, spec, s.mask) : []
      const refPage = await context.newPage()
      let ref = await renderReference(refPage, 'L1 Component Sheet.dc.html', s.id)
      if (s.from) {
        const oursTop = await offsetIn(page, spec, s.from.ours)
        const refTop = await offsetIn(refPage, `#${s.id} > .cv-spec`, s.from.ref)
        ours = cutAbove(ours, oursTop)
        ref = cutAbove(ref, refTop)
        masks = masks.map((m) => ({ ...m, y: m.y - oursTop })).filter((m) => m.y + m.h > 0)
      }
      await refPage.close()
      const { ratio, size } = compareToReference(ours, ref, { name: `l1-${s.id}`, masks })
      console.log(`L1 ${s.id}: diff ${ratio.toFixed(4)} (${size})`)
      recordParity({
        board: s.id === 'k00' ? 'k00 (Page header row down)' : s.id,
        group: s.id === 'k00' ? 'L1 k00' : 'L1 sheet',
        ratio,
        area: size,
        limit: s.max ?? 0.02,
        note: s.mask ? `Masked: ${s.mask}.` : '',
      })
      expect(ratio).toBeLessThanOrEqual(s.max ?? 0.02)
    })
  }
})

/** Whole-pixel offset of `row`'s top inside the card `card` (rounded as the element capture rounds). */
async function offsetIn(page: Page, card: string, row: string): Promise<number> {
  return page.evaluate(
    ([c, r]) =>
      Math.round(
        document.querySelector(r)!.getBoundingClientRect().top -
          document.querySelector(c)!.getBoundingClientRect().top
      ),
    [card, row] as const
  )
}

/** The PNG from row `y` down. */
function cutAbove(png: Buffer, y: number): Buffer {
  const src = PNG.sync.read(png)
  const out = new PNG({ width: src.width, height: src.height - y })
  PNG.bitblt(src, out, 0, y, src.width, src.height - y, 0, 0)
  return PNG.sync.write(out)
}

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
