import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guard against form labels that name nothing.
 *
 * A `<label>` associates with a control in exactly two ways: it carries an
 * `htmlFor` matching the control's `id`, or it WRAPS the control. A label that
 * does neither is a styled string. Clicking it focuses nothing, and a screen
 * reader announces the field with no name at all — the user hears "edit text"
 * and has to guess.
 *
 * Nothing catches this. It compiles, it renders, and it is invisible in a
 * screenshot: the caption sits above the input looking exactly like a working
 * label. That is how ~150 of them accumulated across the storefront and the
 * console while every visual review passed.
 *
 * The structural fix is the `Field` primitive in packages/ui, which generates
 * the id and wires the label, the hint and the error together so association
 * is the default rather than something each caller has to remember. This scan
 * is the backstop for markup that does not go through it.
 *
 * SCOPE: the customer-facing surface is held at zero. The console still has a
 * backlog, recorded in ALLOWED below — every entry there is a real defect, not
 * an exemption. Shrink the list; never add to it.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Console files with known-orphaned labels, pending conversion to the Field
 * primitive. Counts are exact so a file cannot quietly get worse: adding an
 * orphan to a listed file fails the test just as adding a new file does.
 */
const ALLOWED: Record<string, number> = {
  'components/admin/SettingsPageClient.tsx': 34,
  'components/admin/SendQuoteComposer.tsx': 9,
  'components/admin/seo/AiSuggestButton.tsx': 1,
  'app/admin/(shell)/customers/new/page.tsx': 9,
  'app/admin/(shell)/customers/[id]/page.tsx': 5,
  'app/admin/(shell)/cms/blog/[id]/BlogPostEditorClient.tsx': 7,
  'app/admin/(shell)/cms/pages/[id]/CmsPageEditorClient.tsx': 5,
  'app/admin/(shell)/rfqs/[code]/page.tsx': 4,
  'app/admin/(shell)/users/new/page.tsx': 4,
  'app/admin/(shell)/users/[id]/page.tsx': 4,
  'app/admin/(shell)/seo/search/boosts/BoostsClient.tsx': 3,
  'app/admin/(shell)/seo/redirects/RedirectsManager.tsx': 3,
  'app/admin/(shell)/seo/settings/SeoSettingsForm.tsx': 2,
  'app/admin/(shell)/seo/inspector/page.tsx': 2,
  'app/admin/(shell)/seo/search/synonyms/SynonymsClient.tsx': 2,
  'app/admin/(shell)/seo/search/redirects/SearchRedirectsClient.tsx': 2,
  'app/admin/(shell)/seo/robots/RobotsForm.tsx': 1,
  'app/admin/(shell)/products/[id]/edit/ProductEditorClient.tsx': 2,
  'app/admin/(shell)/products/new/page.tsx': 1,
  'app/admin/(shell)/scraper/new/StartScrapeForm.tsx': 1,
  'app/admin/(shell)/brands/BrandsClient.tsx': 1,
  'app/admin/(shell)/brands/[id]/edit/BrandContentEditor.tsx': 1,
  'app/admin/(shell)/industries/IndustriesClient.tsx': 1,
  'app/admin/(shell)/industries/[id]/edit/IndustryContentEditor.tsx': 1,
  'app/admin/(shell)/categories/CategoriesClient.tsx': 1,
  'app/admin/(shell)/navigation/[menuSlug]/ItemFormDialog.tsx': 1,
  'app/admin/(shell)/spec-templates/SpecTemplatesClient.tsx': 1,
  'app/admin/(shell)/spec-templates/[id]/TemplateEditorClient.tsx': 1,
}

/** Anything that puts a control inside the label satisfies the association. */
const CONTROL = /<(input|textarea|select|Input|Textarea|Select|Checkbox)\b/

function sourceFiles(dir = SRC, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (entry.endsWith('.tsx')) acc.push(path.relative(SRC, full))
  }
  return acc
}

function orphanedLabels(rel: string): number[] {
  const src = readFileSync(path.join(SRC, rel), 'utf8')
  const lines: number[] = []

  for (let i = src.indexOf('<label'); i !== -1; i = src.indexOf('<label', i + 1)) {
    const close = src.indexOf('</label>', i)
    if (close === -1) continue
    const body = src.slice(i, close)
    const headEnd = body.indexOf('>')
    const head = headEnd === -1 ? body : body.slice(0, headEnd + 1)

    if (head.includes('htmlFor')) continue
    if (CONTROL.test(body)) continue // wrapping label — implicitly associated
    lines.push(src.slice(0, i).split('\n').length)
  }
  return lines
}

describe('every form label names a control', () => {
  const counts = new Map<string, number[]>()
  for (const rel of sourceFiles()) {
    if (rel.endsWith('.test.tsx')) continue
    const hits = orphanedLabels(rel)
    if (hits.length > 0) counts.set(rel.split(path.sep).join('/'), hits)
  }

  test('no customer-facing label is orphaned', () => {
    const offenders = [...counts.entries()]
      .filter(([rel]) => !(rel in ALLOWED))
      .map(([rel, lines]) => `${rel}: ${lines.join(', ')}`)
      .sort()

    expect(offenders).toEqual([])
  })

  test('the console backlog only ever shrinks', () => {
    const regressions: string[] = []
    for (const [rel, expected] of Object.entries(ALLOWED)) {
      const actual = counts.get(rel)?.length ?? 0
      if (actual > expected) {
        regressions.push(`${rel}: ${actual} orphaned labels, was ${expected}`)
      }
    }
    expect(regressions).toEqual([])
  })

  test('a fixed file is removed from the backlog rather than left stale', () => {
    const stale = Object.entries(ALLOWED)
      .filter(([rel, expected]) => (counts.get(rel)?.length ?? 0) < expected)
      .map(([rel, expected]) => `${rel}: now ${counts.get(rel)?.length ?? 0}, listed as ${expected}`)

    expect(stale).toEqual([])
  })
})
