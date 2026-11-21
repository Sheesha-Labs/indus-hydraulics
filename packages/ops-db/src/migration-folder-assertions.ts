import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Shared guards for a hand-written SQL migrations folder.
 *
 * Two copies of this file exist and must stay BYTE-IDENTICAL:
 *   packages/db/src/migration-folder-assertions.ts       (the website, schema public)
 *   packages/ops-db/src/migration-folder-assertions.ts   (Indus Operations, schema ops)
 * Our lint rules forbid importing across packages by relative path, so the file is copied
 * instead of shared, and packages/ops-db/src/migration-filenames.test.ts fails if the two drift.
 *
 * Why the rules exist: two branches once shipped a `014_` on the same day — one from each of
 * two parallel sessions — and neither noticed until the second PR could not be merged. A
 * sequence number is a shared counter that every open branch reads at the same moment and
 * increments independently, so the collision is structural: the branch that merges second is
 * always wrong, and nothing tells it so until GitHub refuses the merge.
 *
 * A timestamp is derived from when the file was written rather than from what is already on
 * main, so two authors cannot pick the same one unless they write in the same minute — and
 * these tests fail the build if they do.
 */

/** `YYYYMMDDHHMM_snake_case_name.sql` */
export const MIGRATION_FILENAME = /^(\d{12})_[a-z0-9]+(?:_[a-z0-9]+)*\.sql$/

export interface MigrationFolderOptions {
  /** Name shown in the test output, e.g. `packages/db/migrations`. */
  label: string
  /** Pattern every file must match. Defaults to {@link MIGRATION_FILENAME}. */
  filename?: RegExp
  /** Example name for the failure message, given a fresh stamp. */
  example?: (stamp: string) => string
}

/** The `.sql` files in a migrations folder, in apply (lexical) order. */
export function migrationFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
}

/** The 12-digit prefix of a migration file name. */
export function migrationPrefix(file: string): string {
  return file.slice(0, 12)
}

/** Registers the folder guards as a `describe` block. Call it from a test file. */
export function assertMigrationFolder(
  dir: string,
  readmePath: string,
  options: MigrationFolderOptions
): void {
  const pattern = options.filename ?? MIGRATION_FILENAME
  const example = options.example ?? ((s: string) => `${s}_add_thing.sql`)

  describe(`migration filenames (${options.label})`, () => {
    it('finds the migrations directory', () => {
      expect(migrationFiles(dir).length).toBeGreaterThan(0)
    })

    it(`every file matches ${pattern}`, () => {
      const bad = migrationFiles(dir).filter((f) => !pattern.test(f))
      expect(
        bad,
        `Rename these to a local timestamp prefix, e.g. ${example(stamp())} — run \`date +%Y%m%d%H%M\`.`
      ).toEqual([])
    })

    /**
     * The check the whole file exists for. Two files sharing a prefix means two branches
     * picked the same instant, and the apply order between them is undefined.
     */
    it('no two migrations share a timestamp prefix', () => {
      const seen = new Map<string, string[]>()
      for (const f of migrationFiles(dir)) {
        const prefix = migrationPrefix(f)
        seen.set(prefix, [...(seen.get(prefix) ?? []), f])
      }
      const collisions = [...seen.entries()].filter(([, files]) => files.length > 1)
      expect(
        collisions.map(([prefix, files]) => `${prefix}: ${files.join(', ')}`),
        'Bump one of them by a minute — the apply order between them is otherwise undefined.'
      ).toEqual([])
    })

    /**
     * Timestamps are only useful if they sort the way they ran. A 13-digit or 11-digit prefix
     * would sort into the wrong place silently, which the pattern already blocks — this asserts
     * the property the pattern protects, so a future loosening of it fails here too.
     */
    it('lexical order matches chronological order', () => {
      const stamps = migrationFiles(dir).map(migrationPrefix)
      expect(stamps).toEqual([...stamps].sort())
      expect(new Set(stamps.map((s) => s.length))).toEqual(new Set([12]))
    })

    it('every migration is listed in the README', () => {
      const readme = readFileSync(readmePath, 'utf8')
      const missing = migrationFiles(dir).filter((f) => !readme.includes(f))
      expect(
        missing,
        `Add a row to the table in ${options.label}/README.md, including the date it was applied to prod.`
      ).toEqual([])
    })
  })
}

/** A sample stamp for failure messages, so the fix is copy-pasteable. */
export function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`
}

/** Joins a folder and its README, for callers that keep the README beside the files. */
export function readmeIn(dir: string): string {
  return join(dir, 'README.md')
}
