import { expect, test, type Page } from '@playwright/test'

/**
 * Keyboard sweep (S01-T10, CLAUDE.md §4.8): Tab through every stop on /_kit/controls and check each one shows
 * a visible focus ring. A ring is a computed box-shadow (io-focus, io-focus-field) or outline on the focused
 * element, or on the control frame that draws it for the element (io-focus-field on :focus-within, or a
 * `peer` sibling for a visually hidden native input), and it must carry the accent or accent-tint colour.
 */

interface Stop {
  /** Tag, role and accessible-ish name of the focused element. */
  name: string
  /** The computed ring that was found, or '' for none. */
  ring: string
  /** Inside the controls spec card. */
  inSpec: boolean
  /** A stable identity, to notice when focus wraps around. */
  key: string
}

async function focused(page: Page): Promise<Stop | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return null
    const ringOf = (n: Element | null): string => {
      if (!n) return ''
      const cs = getComputedStyle(n)
      if (cs.boxShadow && cs.boxShadow !== 'none') return `box-shadow ${cs.boxShadow}`
      if (cs.outlineStyle !== 'none' && Number.parseFloat(cs.outlineWidth) > 0)
        return `outline ${cs.outlineWidth} ${cs.outlineStyle}`
      return ''
    }
    // The frame that draws the ring for this element: itself, a :focus-within frame up to three levels up,
    // or the next sibling (a peer-focus-visible box beside a visually hidden input).
    let ring = ringOf(el)
    for (let n = el.parentElement, i = 0; !ring && n && i < 3; n = n.parentElement, i++)
      if (n.matches(':focus-within')) ring = ringOf(n)
    if (!ring) ring = ringOf(el.nextElementSibling)
    const label =
      el.getAttribute('aria-label') ??
      el.getAttribute('title') ??
      (el.textContent ?? '').trim().slice(0, 40) ??
      ''
    const all = [...document.querySelectorAll('*')]
    return {
      name: `${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[role=${el.getAttribute('role')}]` : ''} "${label}"`,
      ring,
      inSpec: Boolean(el.closest('[data-kit-section="controls"] [data-kit-part="spec"]')),
      key: String(all.indexOf(el)),
    }
  })
}

test('keyboard-kit controls: every Tab stop shows a visible focus ring', async ({ page }) => {
  test.setTimeout(120_000)
  await page.goto('/_kit/controls', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const stops: Stop[] = []
  const seen = new Set<string>()
  for (let i = 0; i < 250; i++) {
    await page.keyboard.press('Tab')
    const stop = await focused(page)
    if (!stop) {
      if (stops.length > 0) break // focus left the document after the last stop
      continue
    }
    if (seen.has(stop.key)) break // wrapped around
    seen.add(stop.key)
    stops.push(stop)
  }

  const inSpec = stops.filter((s) => s.inSpec)
  // The controls specimen has buttons, segmented radios, tabs, toggles, checkboxes, radios, selects,
  // filter chips and the search parts: far more than 20 stops.
  expect(inSpec.length).toBeGreaterThan(20)
  expect(inSpec.filter((s) => !s.ring).map((s) => s.name)).toEqual([])
  // …and every ring is the focus ring, in the accent or accent-tint, not a resting shadow.
  const focusColours = await page.evaluate(() =>
    ['--io-accent', '--io-accent-tint'].map((token) => {
      const probe = document.createElement('i')
      probe.className = 'block'
      probe.style.setProperty('box-shadow', `0 0 0 1px var(${token})`)
      document.body.append(probe)
      const colour = getComputedStyle(probe).boxShadow.replace(/ 0px 0px 0px 1px$/, '')
      probe.remove()
      return colour
    })
  )
  expect(
    inSpec.filter((s) => !focusColours.some((c) => s.ring.includes(c))).map((s) => s.ring)
  ).toEqual([])
})
