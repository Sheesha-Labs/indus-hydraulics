// bun run --filter @indus/ops-ui tokens
// Writes src/styles/tokens.css, src/styles/theme.css, src/tokens.pdf.ts and src/tokens.generated.ts from
// tokens/tokens.json (the handoff, verbatim) and tokens/tokens.ext.json (values the kits use that the handoff
// does not name, each awaiting design sign-off). guards/tokens.drift.test.ts fails if the committed copies differ.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateAll, type CoreTokens, type ExtTokens } from '../src/build/generate-tokens'

const PKG = join(import.meta.dirname, '..')
const core = JSON.parse(readFileSync(join(PKG, 'tokens/tokens.json'), 'utf8')) as CoreTokens
const ext = JSON.parse(readFileSync(join(PKG, 'tokens/tokens.ext.json'), 'utf8')) as ExtTokens

for (const [file, content] of Object.entries(generateAll(core, ext))) {
  writeFileSync(join(PKG, file), content)
  console.log(`wrote ${file}`)
}
