import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { sanitizeDiagramSvg } from './diagram-svg'

/**
 * Every `diagram` block shipped in an import must survive the sanitiser with
 * nothing meaningful removed.
 *
 * The failure this guards against is silent and expensive: an attribute the
 * allow-list forgot is stripped, the SVG still renders, and the chart is
 * simply wrong — an axis unlabelled, a series unfilled, a viewBox missing so
 * the figure overflows its column. Nothing throws and no test fails unless one
 * is written to look.
 */
const IMPORTS = join(__dirname, '../../../../packages/db/src/imports')

function seedFiles(dir: string): string[] {
  const out: string[] = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...seedFiles(p))
    else if (e.name.endsWith('.ts')) out.push(p)
  }
  return out
}

const svgs: Array<{ file: string; svg: string }> = []
for (const f of seedFiles(IMPORTS)) {
  const src = readFileSync(f, 'utf8')
  // The generated seeds write object keys unquoted, so the key may or may not
  // carry quotes depending on how the file was produced.
  for (const m of src.matchAll(/"?svg"?:\s*"((?:[^"\\]|\\.)*)"/g)) {
    svgs.push({ file: f.split('/imports/')[1] ?? f, svg: JSON.parse(`"${m[1]}"`) as string })
  }
}

describe('shipped diagram blocks survive sanitisation', () => {
  it('finds the diagrams to check', () => {
    expect(svgs.length).toBeGreaterThan(0)
  })

  for (const { file, svg } of svgs) {
    const label = `${file} (${svg.slice(0, 40)}…)`

    it(`keeps the root and viewBox — ${label}`, () => {
      const out = sanitizeDiagramSvg(svg)
      expect(out).not.toBe('')
      // A dropped viewBox fails silently: the figure renders at raw pixel size.
      if (svg.includes('viewBox')) expect(out).toContain('viewBox')
    })

    it(`keeps every text label — ${label}`, () => {
      const out = sanitizeDiagramSvg(svg)
      const texts = [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1] ?? '')
      for (const t of texts) {
        if (t.trim()) expect(out).toContain(t)
      }
    })

    it(`loses no drawing elements — ${label}`, () => {
      const out = sanitizeDiagramSvg(svg)
      for (const tag of ['rect', 'circle', 'line', 'path', 'text', 'g']) {
        const before = (svg.match(new RegExp(`<${tag}[\\s/>]`, 'g')) ?? []).length
        const after = (out.match(new RegExp(`<${tag}[\\s/>]`, 'g')) ?? []).length
        expect(after, `${tag} count`).toBe(before)
      }
    })
  }
})
