// Shared file walker for the Ops UI guard tests. Not a test itself.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

export const REPO = join(import.meta.dirname, '..', '..', '..', '..')

/** Roots every token guard scans (S01-T01). */
export const UI_ROOTS = ['packages/ops-ui/src', 'apps/ops/src'] as const

/** Generated or build-only files: they legitimately hold literals and token names. */
const EXEMPT = [
  'packages/ops-ui/src/tokens.generated.ts',
  'packages/ops-ui/src/tokens.pdf.ts',
  'packages/ops-ui/src/styles/tokens.css',
  'packages/ops-ui/src/styles/theme.css',
]
const EXEMPT_DIRS = ['packages/ops-ui/src/build/', 'packages/ops-ui/src/guards/']

export interface SourceFile {
  /** Repo-relative path with forward slashes. */
  path: string
  text: string
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else out.push(full)
  }
}

export function sources(
  roots: readonly string[],
  ext: RegExp,
  opts: { includeTests?: boolean; includeExempt?: boolean } = {}
): SourceFile[] {
  const files: SourceFile[] = []
  for (const root of roots) {
    const abs = join(REPO, root)
    if (!existsSync(abs)) continue
    const all: string[] = []
    walk(abs, all)
    for (const full of all) {
      const path = relative(REPO, full).split(sep).join('/')
      if (!ext.test(path)) continue
      if (!opts.includeTests && /\.test\.tsx?$/.test(path)) continue
      if (
        !opts.includeExempt &&
        (EXEMPT.includes(path) || EXEMPT_DIRS.some((d) => path.startsWith(d)))
      )
        continue
      files.push({ path, text: readFileSync(full, 'utf8') })
    }
  }
  return files
}

/** Strip // and block comments, keeping newlines so line numbers hold. */
export function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ''))
    .replace(/(^|[^:\\])\/\/.*$/gm, '$1')
}

export function lineOf(text: string, index: number): number {
  return text.slice(0, index).split('\n').length
}
