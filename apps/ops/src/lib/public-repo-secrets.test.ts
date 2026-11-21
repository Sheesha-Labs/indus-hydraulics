import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The repository is public. Nothing bank-, tax- or key-shaped may be committed in
 * Ops code. Bank and supplier NAMES are not listed here (that would publish
 * them); they live in the SUPPLIER_DENYLIST secret that repo-leak-guard checks.
 */
const REPO = join(import.meta.dirname, '../../../..')
const ROOTS = ['apps/ops', 'packages/intake', ...opsPackages()]
const SKIP = new Set(['node_modules', '.next', 'generated', 'test-results', 'playwright-report'])
const IBAN = /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}\b/g
const FAKE_IBAN = 'AE00 0000 0000 0000 0000 000'
const TRN = /\b100\d{12}\b/g
const PEM = /-----BEGIN [A-Z ]*PRIVATE KEY-----/

function opsPackages(): string[] {
  return readdirSync(join(REPO, 'packages'))
    .filter((d) => d.startsWith('ops-'))
    .map((d) => `packages/${d}`)
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    if (SKIP.has(entry)) return []
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(ts|tsx|mjs|cjs|js|json|sql|prisma|md|toml|ya?ml|sh|css)$/.test(entry) ? [full] : []
  })
}

describe('no secrets in public Ops code', () => {
  const files = ROOTS.flatMap((r) => walk(join(REPO, r)))
  const self = relative(REPO, import.meta.path)

  it('scans more than 20 files', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it('has no IBAN, UAE TRN or private key', () => {
    const found: string[] = []
    for (const file of files) {
      const rel = relative(REPO, file)
      if (rel === self) continue
      const text = readFileSync(file, 'utf8')
      for (const m of text.matchAll(IBAN)) {
        if (m[0] !== FAKE_IBAN.replace(/ /g, '') && m[0] !== FAKE_IBAN)
          found.push(`${rel}: IBAN-shaped`)
      }
      for (const m of text.matchAll(TRN)) {
        if (m[0] !== '000000000000000') found.push(`${rel}: TRN-shaped`)
      }
      if (PEM.test(text)) found.push(`${rel}: private key`)
    }
    expect(found).toEqual([])
  })
})
