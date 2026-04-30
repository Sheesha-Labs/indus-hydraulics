#!/usr/bin/env node
/**
 * Compare translation message files for key parity. Per CLAUDE.md §1.4, every
 * key in en.json must have a matching key in ar.json (and vice versa). Prints
 * any missing/extra keys and exits non-zero if there are any.
 *
 * Usage:
 *   node scripts/check-i18n.mjs
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const LOCALES = ['en', 'ar']
const MESSAGES_DIR = resolve(ROOT, 'packages/i18n/messages')

/**
 * Recursively flatten a nested object into dot-separated keys.
 * `{ a: { b: 'x' } }` → `['a.b']`.
 */
function flatten(obj, prefix = '') {
  const keys = []
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flatten(v, next))
    } else {
      keys.push(next)
    }
  }
  return keys
}

function loadKeys(locale) {
  const file = resolve(MESSAGES_DIR, `${locale}.json`)
  const json = JSON.parse(readFileSync(file, 'utf8'))
  return new Set(flatten(json))
}

const sets = Object.fromEntries(LOCALES.map((l) => [l, loadKeys(l)]))

let hasErrors = false
const REFERENCE = sets.en

for (const locale of LOCALES) {
  if (locale === 'en') continue
  const target = sets[locale]
  const missing = [...REFERENCE].filter((k) => !target.has(k)).sort()
  const extra = [...target].filter((k) => !REFERENCE.has(k)).sort()

  if (missing.length > 0) {
    hasErrors = true
    console.error(`\n[check-i18n] ${locale}.json is missing ${missing.length} key(s) found in en.json:`)
    for (const k of missing) console.error(`  - ${k}`)
  }
  if (extra.length > 0) {
    hasErrors = true
    console.error(`\n[check-i18n] ${locale}.json has ${extra.length} extra key(s) not in en.json:`)
    for (const k of extra) console.error(`  + ${k}`)
  }
}

if (hasErrors) {
  console.error('\n[check-i18n] FAIL — translation files are not in parity.')
  process.exit(1)
}

console.log(`[check-i18n] OK — ${REFERENCE.size} keys × ${LOCALES.length} locales aligned.`)
