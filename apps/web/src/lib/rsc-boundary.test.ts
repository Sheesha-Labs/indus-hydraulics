import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * Guards the Server/Client boundary.
 *
 * A Client Component cannot receive a function prop from a Server Component.
 * Functions are not serializable across the RSC boundary and Next throws at
 * render time:
 *
 *   Functions cannot be passed directly to Client Components unless you
 *   explicitly expose it by marking it with "use server".
 *
 * This shipped and took down /admin/media and /admin/products. `Pagination`
 * was a plain server-side helper inside the products page; promoting it to
 * `packages/ui` added `'use client'` out of habit, and both callers pass it
 * `buildUrl` and `linkComponent`.
 *
 * Nothing existing caught it, and that is the point of this file. It
 * type-checks — the prop types are correct on both sides. It lints. `turbo
 * build` succeeds, because the affected pages are dynamic and are never
 * prerendered. Unit tests pass, because they render the component directly
 * rather than through the boundary that fails. It is only reachable by
 * actually serving the page.
 *
 * The rule: if a component is a Client Component, no Server Component may pass
 * it a prop whose value is a function.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url))
const WEB_SRC = path.resolve(HERE, '..')
const UI_SRC = path.resolve(HERE, '../../../../packages/ui/src')

function isClientModule(file: string): boolean {
  try {
    return /^\s*['"]use client['"]/.test(readFileSync(file, 'utf8').slice(0, 200))
  } catch {
    return false
  }
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) acc.push(full)
  }
  return acc
}

/** Client components exported from packages/ui, by component name. */
function clientUiComponents(): Map<string, string> {
  const out = new Map<string, string>()
  for (const entry of readdirSync(UI_SRC)) {
    if (!entry.endsWith('.tsx') || entry.endsWith('.test.tsx')) continue
    const full = path.join(UI_SRC, entry)
    if (!isClientModule(full)) continue
    const src = readFileSync(full, 'utf8')
    // `export function X` / `export const X`, and the trailing `export { A, B }`
    // list several primitives use (Dialog re-exports Radix roots that way).
    for (const m of src.matchAll(/export (?:function|const) (\w+)/g)) {
      const name = m[1]
      if (name && /^[A-Z]/.test(name)) out.set(name, entry)
    }
    for (const block of src.matchAll(/export \{([^}]+)\}/g)) {
      for (const raw of (block[1] ?? '').split(',')) {
        const name = raw.trim().split(/\s+as\s+/).pop()?.trim()
        if (name && /^[A-Z]\w*$/.test(name)) out.set(name, entry)
      }
    }
  }
  return out
}

/**
 * Props passed as a function in a JSX element: `prop={(x) => …}`,
 * `prop={someFn}` is not detectable without types, so this catches the arrow
 * and the bare-identifier cases that matter in practice.
 */
function functionPropsPassedTo(component: string, source: string): string[] {
  const out: string[] = []
  const open = new RegExp(`<${component}[\\s>]`, 'g')

  for (const m of source.matchAll(open)) {
    const start = m.index ?? 0
    // Find this element's real closing `>`, tracking brace depth. Bounding the
    // scan with the first `>` instead silently truncates the tag at the arrow
    // in `buildUrl={(n) => …}` — which is precisely the prop this test exists
    // to catch, so the check passed while missing the live bug.
    let depth = 0
    let end = -1
    for (let i = start; i < source.length; i++) {
      const ch = source[i]
      if (ch === '{') depth++
      else if (ch === '}') depth--
      else if (ch === '>' && depth === 0 && source[i - 1] !== '=') {
        end = i
        break
      }
    }
    const tag = source.slice(start, end === -1 ? source.length : end)

    for (const p of tag.matchAll(/(\w+)=\{([^]*?)\}(?=\s|$)/g)) {
      const name = p[1]
      const value = (p[2] ?? '').trim()
      if (!name) continue
      // The VALUE must itself be a function, not merely contain an arrow.
      // `rows={items.map((q) => …)}` passes an array — the arrow is an argument
      // to `.map`, and flagging it is a false positive that would train people
      // to ignore this test.
      const isFunctionLiteral =
        /^(async\s+)?\([^)]*\)\s*=>/.test(value) || // (a, b) => …
        /^(async\s+)?[\w$]+\s*=>/.test(value) ||      // a => …
        /^(async\s+)?function\b/.test(value)
      const isKnownFunctionRef = /^(buildUrl|linkComponent|render[A-Z]\w*|on[A-Z]\w*)$/.test(value)
      if (isFunctionLiteral) out.push(`${name}={(…) => …}`)
      else if (isKnownFunctionRef) out.push(`${name}={${value}}`)
    }
  }
  return out
}

describe('RSC boundary', () => {
  const clientComponents = clientUiComponents()

  test('the scan sees the shared client components', () => {
    // A regex matching nothing would make the assertion below vacuous.
    expect(clientComponents.size).toBeGreaterThan(3)
    expect(clientComponents.has('Dialog')).toBe(true)
    // Pagination must NOT be one — it is rendered from server pages.
    expect(clientComponents.has('Pagination')).toBe(false)
  })

  test('no server component passes a function to a shared client component', () => {
    const offenders: string[] = []
    for (const file of walk(WEB_SRC)) {
      if (isClientModule(file)) continue // client → client is fine
      const source = readFileSync(file, 'utf8')
      for (const [name] of clientComponents) {
        if (!source.includes(`<${name}`)) continue
        for (const prop of functionPropsPassedTo(name, source)) {
          offenders.push(`${path.relative(WEB_SRC, file)} → <${name} ${prop}>`)
        }
      }
    }
    expect(
      offenders,
      'These render a Client Component from a Server Component and pass it a function. ' +
        'Next throws at request time; the build and the tests will not tell you. Either drop ' +
        "the component's `use client` if it has no client-only behaviour, or pass the data " +
        'it needs instead of a callback that produces it.'
    ).toEqual([])
  })
})
