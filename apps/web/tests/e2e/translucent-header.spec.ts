import { expect, test } from '@playwright/test'

/**
 * The top bar is translucent, and translucency is a contrast problem.
 *
 * Nothing else we run can see any of this. Typecheck, lint and unit tests never
 * lay anything out; a screenshot review reads "looks frosted" and stops there.
 * The failure mode that matters is invisible in every static check: the bar's
 * text is rendered over whatever happens to be scrolled underneath it, so a
 * colour that clears AA on white can drop under it the moment a `bg-ih-navy`
 * band or a dark hero passes below. The storefront has several of those.
 *
 * So the check resolves colours by painting them and reading the pixel back.
 * Parsing the components of a computed `oklab()`/`lab()` string as though they
 * were RGB reports near-black for every token in this theme and passes
 * everything — it is a silent false pass, not a failure.
 */

const AA_SMALL_TEXT = 4.5

/** Painted into a canvas and read back, so `oklch()` tokens resolve honestly. */
const COLOUR_HELPERS = `
  window.__c = document.createElement('canvas')
  window.__c.width = window.__c.height = 4
  window.__x = window.__c.getContext('2d', { willReadFrequently: true })
  window.__paint = (cssColour) => {
    const probe = document.createElement('span')
    probe.style.color = cssColour
    document.body.appendChild(probe)
    const resolved = getComputedStyle(probe).color
    probe.remove()
    window.__x.clearRect(0, 0, 4, 4)
    window.__x.fillStyle = resolved
    window.__x.fillRect(0, 0, 4, 4)
    return [...window.__x.getImageData(1, 1, 1, 1).data].slice(0, 3)
  }
  window.__lum = (c) => {
    const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
  }
  window.__ratio = (a, b) => {
    const [hi, lo] = [window.__lum(a), window.__lum(b)].sort((p, q) => q - p)
    return (hi + 0.05) / (lo + 0.05)
  }
  /*
   * Composite a colour over black and read the pixel back. This is how the
   * bar's alpha is asserted: the computed value is an oklab() string whose
   * alpha component cannot be string-matched reliably, and 'is it opaque' is
   * exactly the question that matters.
   */
  window.__overBlack = (cssColour) => {
    window.__x.fillStyle = '#000'
    window.__x.fillRect(0, 0, 4, 4)
    window.__x.fillStyle = cssColour
    window.__x.fillRect(0, 0, 4, 4)
    return [...window.__x.getImageData(1, 1, 1, 1).data].slice(0, 3)
  }
`

const pane = 'header [aria-hidden]:not([hidden])'

test.describe('translucent site header', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(COLOUR_HELPERS)
  })

  test('is frosted at rest and opaque under an open menu', async ({ page }) => {
    await page.goto('/')

    const atTop = await page.evaluate((sel) => {
      const header = document.querySelector('header')!
      const layer = document.querySelector(sel)!
      const cs = getComputedStyle(layer)
      return {
        border: getComputedStyle(header).borderBottomColor,
        shadow: getComputedStyle(header).boxShadow,
        backdropFilter: cs.backdropFilter,
        backgroundOverBlack: window.__overBlack(cs.backgroundColor),
      }
    }, pane)

    // Nothing has slid under the bar yet, so there is nothing to separate from.
    expect(atTop.border).toBe('rgba(0, 0, 0, 0)')
    expect(atTop.shadow).toBe('none')
    expect(atTop.backdropFilter).toContain('blur')
    // Composited over black an opaque white bar is 255. Anything the page can
    // actually be seen through lands well below it; guard against the alpha
    // being dropped or quietly raised to something that is frosted in name only.
    expect(atTop.backgroundOverBlack[0]).toBeLessThan(240)

    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(300)

    const scrolled = await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('header')!)
      return { border: cs.borderBottomColor, shadow: cs.boxShadow }
    })
    expect(scrolled.border).not.toBe('rgba(0, 0, 0, 0)')
    expect(scrolled.shadow).not.toBe('none')

    // The megamenu paints solid `bg-ih-surface` and docks to the bar. A
    // see-through bar sitting on top of it reads as a seam, not as an effect.
    await page.locator('header nav a[aria-haspopup="true"]').first().hover()
    await expect(page.locator('header [role="menu"]')).toBeVisible()
    // The alpha is transitioned, so the computed value mid-flight is still the
    // frosted one. Read it after the 200ms transition has landed.
    await page.waitForTimeout(400)
    const open = await page.evaluate(
      (sel) => window.__overBlack(getComputedStyle(document.querySelector(sel)!).backgroundColor),
      pane
    )
    expect(open).toEqual([255, 255, 255])
  })

  test('every label on the bar clears AA over the darkest thing beneath it', async ({ page }) => {
    await page.goto('/')

    // Park the darkest full-bleed band on the page directly under the bar.
    const band = await page.evaluate(() => {
      let darkest: { lum: number; top: number; height: number } | null = null
      for (const node of document.querySelectorAll('section, div')) {
        const rect = node.getBoundingClientRect()
        if (rect.width < window.innerWidth * 0.95 || rect.height < 80) continue
        const bg = getComputedStyle(node).backgroundColor
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') continue
        const lum = window.__lum(window.__paint(bg))
        if (!darkest || lum < darkest.lum) {
          darkest = { lum, top: rect.top + window.scrollY, height: rect.height }
        }
      }
      return darkest
    })
    expect(
      band,
      'the home page should still have a dark full-bleed band to test against'
    ).toBeTruthy()

    await page.evaluate((b) => window.scrollTo(0, b!.top + b!.height / 2 - 60), band)
    await page.waitForTimeout(400)

    const shot = (await page.screenshot()).toString('base64')
    const measured = await page.evaluate(async (b64) => {
      const img = new Image()
      img.src = 'data:image/png;base64,' + b64
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(img, 0, 0)

      const bar = document.querySelector('header nav')!.getBoundingClientRect()
      // The left gutter of the bar: frosted pane only. Never a glyph, never a
      // control with its own background — so the pixel read there is exactly
      // the surface the bar's text is sitting on.
      let surface: number[] | null = null
      for (let x = 4; x < 40; x += 4) {
        for (let y = Math.round(bar.top); y < Math.round(bar.bottom); y += 4) {
          const p = [...ctx.getImageData(x, y, 1, 1).data].slice(0, 3)
          if (!surface || window.__lum(p) < window.__lum(surface)) surface = p
        }
      }

      // Every text colour actually rendered on that surface — anything sitting
      // on its own opaque background (the search field, the account button) is
      // not affected by the frost and is not this test's business.
      const labels: { text: string; ratio: number }[] = []
      const main = document.querySelector('header nav')!.closest('div')!
      for (const node of main.querySelectorAll<HTMLElement>('*')) {
        const ownText = [...node.childNodes].some(
          (n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim()
        )
        if (!ownText) continue
        let ancestor: HTMLElement | null = node
        let onOwnBackground = false
        while (ancestor && ancestor !== main) {
          const bg = getComputedStyle(ancestor).backgroundColor
          if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') onOwnBackground = true
          ancestor = ancestor.parentElement
        }
        if (onOwnBackground) continue
        labels.push({
          text: node.textContent!.trim().slice(0, 30),
          ratio: window.__ratio(window.__paint(getComputedStyle(node).color), surface!),
        })
      }
      return { surface, labels }
    }, shot)

    expect(
      measured.labels.length,
      'no bar labels were sampled — the selector has drifted'
    ).toBeGreaterThan(0)
    for (const label of measured.labels) {
      expect(
        label.ratio,
        `"${label.text}" is ${label.ratio.toFixed(2)}:1 against the frosted bar (${measured.surface})`
      ).toBeGreaterThanOrEqual(AA_SMALL_TEXT)
    }
  })
})
