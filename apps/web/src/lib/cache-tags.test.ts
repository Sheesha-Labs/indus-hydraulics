import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { STOREFRONT_TAGS } from './cache-tags'

/**
 * Keeps the tag map honest against the storefront that actually registers them.
 *
 * A cache tag is a bare string on both sides, so a rename on one side alone
 * fails completely silently — the purge just misses, and the page looks like a
 * cache that has not expired yet. That is exactly how `updateTag('navigation')`
 * survived in the admin for months while the storefront tagged its navigation
 * caches `nav-menu` / `nav-brands` / `nav-industries`.
 *
 * This scans the storefront source for the tags it really registers and
 * asserts the map covers them.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IGNORED = new Set(['node_modules', '.next', 'dist', '.turbo', 'admin'])

function storefrontFiles(): string[] {
  const out: string[] = []
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      if (IGNORED.has(entry)) continue
      const full = path.join(dir, entry)
      if (statSync(full).isDirectory()) walk(full)
      else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full)
    }
  }
  walk(SRC)
  return out
}

/** Tags passed to `unstable_cache(..., { tags: [...] })` anywhere in the storefront. */
function registeredTags(): Set<string> {
  const found = new Set<string>()
  for (const file of storefrontFiles()) {
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(/tags:\s*\[([^\]]*)\]/g)) {
      for (const t of m[1]!.matchAll(/['"`]([^'"`]+)['"`]/g)) found.add(t[1]!)
    }
  }
  return found
}

describe('storefront cache tags', () => {
  test('every tag the storefront registers is named in STOREFRONT_TAGS', () => {
    const mapped = new Set<string>(Object.values(STOREFRONT_TAGS))
    const missing = [...registeredTags()].filter((t) => !mapped.has(t)).sort()
    expect(missing.join(', ')).toBe('')
  })

  test('every tag in STOREFRONT_TAGS is actually registered somewhere', () => {
    // Catches the reverse rot: a tag left in the map after the cache that used
    // it was deleted, so invalidating it silently does nothing.
    const registered = registeredTags()
    const orphans = Object.entries(STOREFRONT_TAGS)
      .filter(([, tag]) => !registered.has(tag))
      .map(([key, tag]) => `${key} -> '${tag}'`)
    expect(orphans.join(', ')).toBe('')
  })

  test('the map has no duplicate tag strings', () => {
    const values = Object.values(STOREFRONT_TAGS)
    expect(values.length).toBe(new Set(values).size)
  })

  test("the dead 'navigation' tag is not reintroduced", () => {
    expect(Object.values(STOREFRONT_TAGS as Record<string, string>)).not.toContain('navigation')
  })
})
