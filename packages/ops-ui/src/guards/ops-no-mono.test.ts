import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { code, REPO, sources } from './scan'

/**
 * No monospace anywhere in Ops (CLAUDE.md §4.5). Ported from apps/web admin-no-mono.test.ts.
 * Roots are named so a moved folder cannot drop out of the scan (coverage gap G11).
 */
const ROOTS = [
  'apps/ops/src', // every route group, including app/(client)/** and app/(auth)/**
  'packages/ops-ui/src',
  'packages/ops-pdf/src',
] as const
/** Raised to 150 by S01-T10 once the kits exist. */
const MIN_FILES = 5
/** The recipient's view of an outbound email; its family comes from --io-mail-font (Arial). */
const FONT_EXEMPT = 'packages/ops-ui/src/mail/Email.tsx'
const THEME = 'packages/ops-ui/src/styles/theme.css'

const BANNED: { name: string; re: RegExp }[] = [
  { name: 'font-mono utility', re: /(?<![\w-])font-mono(?![\w-])/ },
  { name: 'monospace family', re: /\bmonospace\b|ui-monospace|JetBrains/ },
]

describe('Ops has no monospace', () => {
  const perRoot = ROOTS.map((root) => ({
    root,
    exists: existsSync(join(REPO, root)),
    files: sources([root], /\.(tsx?|css)$/, { includeExempt: true }).filter(
      (f) =>
        !f.path.startsWith('packages/ops-ui/src/guards/') &&
        !f.path.startsWith('packages/ops-ui/src/build/')
    ),
  }))
  const files = perRoot.flatMap((r) => r.files)

  it('scans every root that exists, and enough files', () => {
    for (const r of perRoot)
      if (r.exists) expect(r.files.length, `${r.root} scanned no files`).toBeGreaterThan(0)
    expect(files.length).toBeGreaterThanOrEqual(MIN_FILES)
  })

  it('no source names a mono font', () => {
    const hits: string[] = []
    for (const f of files) {
      code(f.text)
        .split('\n')
        .forEach((line, i) => {
          const where = `${f.path}:${i + 1}`
          for (const { name, re } of BANNED) if (re.test(line)) hits.push(`${where} ${name}`)
          if (f.path !== THEME && /--font-mono/.test(line))
            hits.push(`${where} --font-mono outside theme.css`)
          for (const m of line.matchAll(/(["'`])((?:(?!\1).)*)\1/g)) {
            const body = m[2]
            if (/(^|\s)mono(\s|$)/.test(body ?? '')) hits.push(`${where} bare mono class`)
          }
          if (f.path.startsWith('packages/ops-pdf/') && /fontFamily\s*:\s*['"`]Courier/.test(line))
            hits.push(`${where} Courier in @react-pdf`)
          if (
            f.path.startsWith('packages/ops-pdf/') &&
            /family\s*:\s*['"`](?!Geist|Instrument Serif)/.test(line) &&
            /Font\.register/.test(f.text)
          )
            hits.push(`${where} @react-pdf may register only Geist and Instrument Serif`)
          if (
            f.path !== FONT_EXEMPT &&
            /--io-mail-font/.test(line) &&
            !f.path.endsWith('.css') &&
            !f.path.endsWith('tokens.generated.ts')
          )
            hits.push(`${where} --io-mail-font outside mail/Email.tsx`)
        })
    }
    expect(hits, `Geist + tabular-nums, never mono:\n${hits.join('\n')}`).toEqual([])
  })

  it('theme.css maps --font-mono to Geist', () => {
    expect(readFileSync(join(REPO, THEME), 'utf8')).toMatch(/--font-mono:\s*var\(--io-sans\);/)
  })
})
