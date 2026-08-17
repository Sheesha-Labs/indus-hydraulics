import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guards the naming convention in `packages/db/migrations/`.
 *
 * This exists because two branches once shipped a `014_` on the same day —
 * one from each of two parallel sessions — and neither noticed until the
 * second PR could not be merged. A sequence number is a shared counter that
 * every open branch reads at the same moment and increments independently, so
 * the collision is structural: the branch that merges second is always wrong,
 * and nothing tells it so until GitHub refuses the merge.
 *
 * A timestamp is derived from when the file was written rather than from what
 * is already on main, so two authors cannot pick the same one unless they
 * write in the same minute — and this test fails the build if they do.
 */
const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'migrations')

/** `YYYYMMDDHHMM_snake_case_name.sql` */
const FILENAME = /^(\d{12})_[a-z0-9]+(?:_[a-z0-9]+)*\.sql$/

function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
}

describe('migration filenames', () => {
  it('finds the migrations directory', () => {
    expect(migrationFiles().length).toBeGreaterThan(0)
  })

  it('every file is YYYYMMDDHHMM_name.sql', () => {
    const bad = migrationFiles().filter((f) => !FILENAME.test(f))
    expect(
      bad,
      `Rename these to a UTC-agnostic local timestamp prefix, e.g. ` +
        `${stamp()}_add_thing.sql — run \`date +%Y%m%d%H%M\`.`,
    ).toEqual([])
  })

  /**
   * The check the whole file exists for. Two files sharing a prefix means two
   * branches picked the same instant, and the apply order between them is
   * undefined.
   */
  it('no two migrations share a timestamp prefix', () => {
    const seen = new Map<string, string[]>()
    for (const f of migrationFiles()) {
      const prefix = f.slice(0, 12)
      seen.set(prefix, [...(seen.get(prefix) ?? []), f])
    }
    const collisions = [...seen.entries()].filter(([, files]) => files.length > 1)
    expect(
      collisions.map(([prefix, files]) => `${prefix}: ${files.join(', ')}`),
      'Bump one of them by a minute — the apply order between them is otherwise undefined.',
    ).toEqual([])
  })

  /**
   * Timestamps are only useful if they sort the way they ran. A 13-digit or
   * 11-digit prefix would sort into the wrong place silently, which the
   * regex above already blocks — this asserts the property the regex is
   * protecting, so a future loosening of the pattern fails here too.
   */
  it('lexical order matches chronological order', () => {
    const files = migrationFiles()
    const stamps = files.map((f) => f.slice(0, 12))
    expect(stamps).toEqual([...stamps].sort())
    expect(new Set(stamps.map((s) => s.length))).toEqual(new Set([12]))
  })

  it('every migration is listed in the README', async () => {
    const { readFileSync } = await import('node:fs')
    const readme = readFileSync(join(MIGRATIONS_DIR, 'README.md'), 'utf8')
    const missing = migrationFiles().filter((f) => !readme.includes(f))
    expect(
      missing,
      'Add a row to the table in packages/db/migrations/README.md, ' +
        'including the date it was applied to prod.',
    ).toEqual([])
  })
})

/** A sample stamp for the failure message, so the fix is copy-pasteable. */
function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`
}
