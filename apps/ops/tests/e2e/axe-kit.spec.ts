import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

/**
 * axe on the kit specimens (CLAUDE.md §13.5), WCAG 2.1 A and AA rules: critical and serious findings fail.
 * Every kit is built (S01-T10), so /_kit and all twelve /_kit/<kit> pages are scanned. Scope is the spec
 * cards (the kits' own parts) and, on /_kit, the section nav; the section heads are the Shell kit's
 * SectionHead, checked when S02 builds it. Hydration finishes first, so client parts are scanned as users
 * meet them.
 */
const KITS = [
  'controls',
  'status',
  'table',
  'card',
  'form',
  'states',
  'overlay',
  'timeline',
  'chart',
  'mail',
  'assistant',
  'document',
] as const

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/**
 * A4 pages drawn at board scale (Document kit frames: m .6, w .5542, thumb .189, z .7). They are pictures of
 * the printed document, with Download PDF beside them as the accessible equivalent, and they keep the PDF's
 * own greys and faded stamps: WCAG 1.4.3 exempts text that is part of a picture with significant other
 * visual content. Inside them every other rule still runs; only color-contrast is off.
 */
const DOC_FRAME = '[data-doc-frame]'

async function scan(
  page: Page,
  include: string[],
  opts: { exclude?: string; disable?: string[] }
): Promise<string[]> {
  let builder = new AxeBuilder({ page })
    .withTags(WCAG_21_AA)
    // Email bodies are sandboxed frames without scripts (Mail kit): axe cannot run inside them and waits
    // for them until the test times out. Their title and sandbox are asserted by SandboxedBody.test.tsx.
    .exclude('iframe[sandbox]')
  if (opts.exclude) builder = builder.exclude(opts.exclude)
  if (opts.disable) builder = builder.disableRules(opts.disable)
  for (const selector of include) builder = builder.include(selector)
  const { violations } = await builder.analyze()
  return violations
    .filter((v) => v.impact === 'critical' || v.impact === 'serious')
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.nodes.map((n) => `${n.target.join(' ')} ${n.failureSummary ?? ''}`).join(', ')}`
    )
}

/** Critical and serious findings in `include`: everything outside document frames, then inside them. */
async function blocking(page: Page, include: string[]): Promise<string[]> {
  const found = await scan(page, include, { exclude: DOC_FRAME })
  const frames = include.map((s) => `${s} ${DOC_FRAME}`)
  if ((await page.locator(frames.join(', ')).count()) > 0)
    found.push(...(await scan(page, frames, { disable: ['color-contrast'] })))
  return found
}

async function load(page: Page, path: string): Promise<void> {
  await page.goto(path, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
}

test('axe-kit index: /_kit has no critical or serious findings', async ({ page }) => {
  test.setTimeout(120_000)
  await load(page, '/_kit')
  await expect(page.locator('[data-kit-part="spec"]')).toHaveCount(7 + KITS.length)
  expect(
    await blocking(page, ['nav[aria-label="Kit sections"]', '[data-kit-part="spec"]'])
  ).toEqual([])
})

for (const kit of KITS) {
  test(`axe-kit ${kit}: no critical or serious findings`, async ({ page }) => {
    await load(page, `/_kit/${kit}`)
    await expect(page.locator(`[data-kit-section="${kit}"]`)).toHaveAttribute(
      'data-kit-status',
      'built'
    )
    expect(await blocking(page, [`[data-kit-section="${kit}"] [data-kit-part="spec"]`])).toEqual([])
  })
}
