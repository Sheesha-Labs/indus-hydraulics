import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const SCAN_PATHS = [
  path.join(REPO_ROOT, 'apps/admin/src'),
  path.join(REPO_ROOT, 'apps/storefront/src'),
  path.join(REPO_ROOT, 'packages'),
]
const SCAN_EXTS = new Set(['.ts', '.tsx', '.json', '.prisma'])
const IGNORED_DIRS = new Set(['node_modules', '.next', 'generated', 'dist', '.turbo'])
const SELF = path.basename(fileURLToPath(import.meta.url)) // skip self-references

function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      yield* walk(full)
    } else if (SCAN_EXTS.has(path.extname(entry))) {
      yield full
    }
  }
}

function findMatches(pattern: RegExp): { file: string; line: number; text: string }[] {
  const hits: { file: string; line: number; text: string }[] = []
  for (const root of SCAN_PATHS) {
    for (const file of walk(root)) {
      if (path.basename(file) === SELF) continue
      const lines = readFileSync(file, 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (pattern.test(line)) {
          hits.push({ file: path.relative(REPO_ROOT, file), line: i + 1, text: line.trim() })
        }
      })
    }
  }
  return hits
}

function format(hits: ReturnType<typeof findMatches>): string {
  return hits.map((h) => `${h.file}:${h.line}: ${h.text}`).join('\n')
}

describe('i18n removal — static guards (none of these should ever come back)', () => {
  test('no next-intl imports remain', () => {
    expect(format(findMatches(/from ['"]next-intl/))).toBe('')
  })

  test('no @indus/i18n imports remain', () => {
    expect(format(findMatches(/@indus\/i18n/))).toBe('')
  })

  test('no useTranslations / getTranslations / useFormatter calls', () => {
    expect(format(findMatches(/(useTranslations|getTranslations|useFormatter)\s*\(/))).toBe('')
  })

  test('no [locale] route segments under apps/', () => {
    const hits: string[] = []
    for (const app of ['admin', 'storefront']) {
      const root = path.join(REPO_ROOT, 'apps', app, 'src')
      if (!existsSync(root)) continue
      for (const file of walk(root)) {
        if (file.includes('[locale]')) hits.push(path.relative(REPO_ROOT, file))
      }
    }
    expect(hits.join('\n')).toBe('')
  })

  test('no hardcoded /en/ or /ar/ link prefixes', () => {
    expect(format(findMatches(/['"`]\/(en|ar)\//))).toBe('')
  })

  test('no dir="rtl" anywhere', () => {
    expect(format(findMatches(/dir=["']rtl["']/))).toBe('')
  })

  test('no locale === "ar" / "en" string comparisons', () => {
    expect(format(findMatches(/locale\s*===\s*['"](ar|en)['"]/))).toBe('')
  })

  test('packages/i18n is deleted', () => {
    expect(existsSync(path.join(REPO_ROOT, 'packages/i18n'))).toBe(false)
  })

  test('next-intl and @indus/i18n are not declared as dependencies', () => {
    const pkgFiles = [
      'apps/admin/package.json',
      'apps/storefront/package.json',
      'packages/db/package.json',
      'packages/domain/package.json',
      'packages/ui/package.json',
    ]
    const offenders: string[] = []
    for (const f of pkgFiles) {
      const full = path.join(REPO_ROOT, f)
      if (!existsSync(full)) continue
      const content = readFileSync(full, 'utf8')
      if (/"next-intl"\s*:/.test(content)) offenders.push(`${f}: next-intl`)
      if (/"@indus\/i18n"\s*:/.test(content)) offenders.push(`${f}: @indus/i18n`)
    }
    expect(offenders.join('\n')).toBe('')
  })
})
