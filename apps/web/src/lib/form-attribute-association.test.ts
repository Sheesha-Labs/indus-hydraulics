import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

/**
 * A `<button form="x">` must have a `<form id="x">` to submit.
 *
 * v2 puts each page's primary action in the 60px topbar, which means the submit
 * button no longer sits inside its own `<form>`. The HTML `form` attribute is
 * what keeps it working from there.
 *
 * That association is the single most breakable thing in the whole topbar move.
 * Get the id wrong — a typo, a rename, a copy-paste between pages — and the
 * button is INERT: no compile error, no lint failure, no runtime error, no
 * console warning. The admin clicks "Create product" and nothing happens.
 * Nothing else we run can see it, which is precisely why it needs a test.
 *
 * This also catches the reverse: a form given an id for this purpose that no
 * button references any more, which means its primary action has gone missing.
 */

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function sourceFiles(dir = SRC, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (entry.endsWith('.tsx')) acc.push(path.relative(SRC, full))
  }
  return acc
}

type Ref = { file: string; line: number; id: string }

function scan(): { buttons: Ref[]; forms: Ref[] } {
  const buttons: Ref[] = []
  const forms: Ref[] = []

  for (const rel of sourceFiles()) {
    if (rel.endsWith('.test.tsx')) continue
    const raw = readFileSync(path.join(SRC, rel), 'utf8')
    // Strip comments first. Two files DISCUSS `form="…"` in prose explaining
    // this very mechanism, and a naive scan reported both as broken
    // associations — the same comment-blindness that made the admin-page-shell
    // guard pass on a layout that rendered nothing.
    // Blanked rather than removed, so line numbers stay true.
    const src = raw
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/^([ \t]*)\/\/.*$/gm, (m) => m.replace(/[^\n]/g, ' '))
    const at = (i: number) => src.slice(0, i).split('\n').length

    // form="literal" on a button/input — the association being asserted.
    for (const m of src.matchAll(/\bform="([^"{]+)"/g)) {
      buttons.push({ file: rel.split(path.sep).join('/'), line: at(m.index!), id: m[1]! })
    }
    // id="literal" on a <form> tag specifically.
    for (const m of src.matchAll(/<form\b[^>]*?\bid="([^"{]+)"/gs)) {
      forms.push({ file: rel.split(path.sep).join('/'), line: at(m.index!), id: m[1]! })
    }
  }
  return { buttons, forms }
}

const { buttons, forms } = scan()

describe('form attribute association', () => {
  test('every button form="x" has a matching form id="x" in the same file', () => {
    const orphans = buttons
      .filter((b) => !forms.some((f) => f.file === b.file && f.id === b.id))
      .map((b) => `${b.file}:${b.line}: form="${b.id}" — no <form id="${b.id}"> in this file`)
      .sort()

    expect(orphans).toEqual([])
  })

  test('a form id used for topbar submits is still referenced by a button', () => {
    // A form whose button disappeared has lost its primary action.
    const unreferenced = forms
      .filter((f) => f.id.endsWith('-form'))
      .filter((f) => !buttons.some((b) => b.file === f.file && b.id === f.id))
      .map((f) => `${f.file}:${f.line}: <form id="${f.id}"> — nothing submits it`)
      .sort()

    expect(unreferenced).toEqual([])
  })

  test('form ids are unique per file', () => {
    // Two forms sharing an id makes the button submit whichever the browser
    // resolves first — silently the wrong one.
    const dupes: string[] = []
    const byFile = new Map<string, Map<string, number[]>>()
    for (const f of forms) {
      if (!byFile.has(f.file)) byFile.set(f.file, new Map())
      const ids = byFile.get(f.file)!
      ids.set(f.id, [...(ids.get(f.id) ?? []), f.line])
    }
    for (const [file, ids] of byFile) {
      for (const [id, lines] of ids) {
        if (lines.length > 1) dupes.push(`${file}: <form id="${id}"> at lines ${lines.join(', ')}`)
      }
    }
    expect(dupes.sort()).toEqual([])
  })
})
