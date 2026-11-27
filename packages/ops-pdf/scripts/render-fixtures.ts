// bun scripts/render-fixtures.ts <outDir>: every builder fixture to a PDF, for a look (never committed output).
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderFixtures } from '../src/__fixtures__/documents'
import { renderDocumentPdf } from '../src/render'

const out = process.argv[2]
if (!out) throw new Error('usage: bun scripts/render-fixtures.ts <outDir>')
mkdirSync(out, { recursive: true })
for (const f of renderFixtures()) {
  const t = performance.now()
  const bytes = await renderDocumentPdf(f.data, f.letterhead, {}, { draft: f.draft ?? false })
  writeFileSync(join(out, `${f.name}.pdf`), bytes)
  console.log(
    `${f.name}.pdf ${(bytes.length / 1024).toFixed(0)} KB ${(performance.now() - t).toFixed(0)} ms`
  )
}
