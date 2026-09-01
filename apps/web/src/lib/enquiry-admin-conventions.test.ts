import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Mechanical guards for the enquiry admin screens.
 *
 * Every rule here corresponds to a bug that actually shipped and was reported
 * by the founder using the product. None of them fails typecheck, lint or any
 * other test — which is exactly why they need a scan.
 */

const ROOTS = [
  path.join(process.cwd(), 'src/app/admin/(shell)/enquiries'),
  path.join(process.cwd(), 'src/app/admin/(shell)/suppliers'),
]

function walk(dir: string): string[] {
  let out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out = out.concat(walk(full))
    else if (/\.tsx?$/.test(full)) out.push(full)
  }
  return out
}

const FILES = ROOTS.flatMap((r) => {
  try {
    return walk(r)
  } catch {
    return []
  }
}).map((f) => ({ file: path.relative(process.cwd(), f), src: readFileSync(f, 'utf8') }))

describe('enquiry admin screens exist', () => {
  it('finds the screens to scan', () => {
    expect(FILES.length).toBeGreaterThan(5)
  })
})

describe('FE-6 — controls come from the shared primitives', () => {
  /**
   * The founder's words were "archaic font" and "bland". The cause was raw
   * <input>/<textarea>/<select> with hand-written geometry, so none of them
   * carried the focus ring, radius or height every other admin control has.
   * packages/ui/src/Field.tsx exports Input / Textarea / Select — use them.
   */
  it('declares no visible raw form control', () => {
    const offenders: string[] = []
    for (const { file, src } of FILES) {
      // A hidden input carries no geometry and is the correct primitive-free case.
      const visible = src.replace(/<input\s+type="hidden"[^>]*\/>/g, '')
      if (/<(input|textarea|select)\b/.test(visible)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})

describe('CLAUDE.md §2.3 — radius ladder', () => {
  it('uses no off-ladder rounded-[6px] on cards or insets', () => {
    const offenders = FILES.filter((f) => f.src.includes('rounded-[6px]')).map((f) => f.file)
    expect(offenders).toEqual([])
  })
})

describe('PF-10 — the detail grid cannot bleed sideways', () => {
  /**
   * Reported as "the page is bleeding out into the right hand side".
   *
   * A `1fr` grid track sizes to its content's min-content width by default, so
   * a wide table inside it blows the track out and pushes the rail off screen.
   * `min-w-0` is the fix and the spec calls it load-bearing.
   */
  it('every 1fr_320px grid pairs with min-w-0 and items-start', () => {
    const offenders: string[] = []
    for (const { file, src } of FILES) {
      if (!src.includes('lg:grid-cols-[1fr_320px]')) continue
      if (!src.includes('min-w-0')) offenders.push(`${file} (no min-w-0)`)
      if (!src.includes('items-start')) offenders.push(`${file} (no items-start)`)
    }
    expect(offenders).toEqual([])
  })
})

describe('long unbroken strings cannot force a horizontal scrollbar', () => {
  /**
   * A pasted procurement email is one long unbroken token often enough that
   * `whitespace-pre-wrap` alone is not sufficient — it wraps at whitespace, and
   * a 400-character bid reference has none.
   */
  it('every pre with pre-wrap also sets break-words', () => {
    const offenders: string[] = []
    for (const { file, src } of FILES) {
      for (const m of src.matchAll(/className="([^"]*whitespace-pre-wrap[^"]*)"/g)) {
        if (!m[1]!.includes('break-words')) offenders.push(file)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('research cannot silently queue forever', () => {
  /**
   * Inngest is a documented no-op without INNGEST_EVENT_KEY: it accepts the
   * send and drops it. The first version fired into that void, left the run
   * `queued`, and its own "already running" guard then disabled the button
   * permanently. The trigger must decide the mode explicitly.
   */
  const actions = FILES.find((f) => f.file.endsWith('enquiries/actions.ts'))

  it('checks for a background-job key before relying on one', () => {
    expect(actions?.src).toContain('INNGEST_EVENT_KEY')
  })

  it('has an inline fallback path', () => {
    expect(actions?.src).toContain('runResearchInline')
  })

  it('recovers a run that never started instead of blocking forever', () => {
    expect(actions?.src).toMatch(/STALE_AFTER_MS|startedAt: null/)
  })
})
