import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  assertMigrationFolder,
  migrationFiles,
  migrationPrefix,
  readmeIn,
} from './migration-folder-assertions'

/**
 * Guards `packages/ops-db/migrations/`.
 *
 *   * the shared folder rules (unique 12-digit prefixes, sort order, README row per file),
 *     from a byte-identical copy of packages/db's helper;
 *   * the Ops naming rule: `YYYYMMDDHHMM_ops_<snake_case>.sql`;
 *   * the cross-folder rule: no 12-digit prefix appears in BOTH packages/db/migrations and
 *     packages/ops-db/migrations. Both folders are applied to the same database, and
 *     scripts/new-migration.sh skips any minute already taken in either.
 */
const OPS_DIR = join(import.meta.dirname, '..', 'migrations')
const WEB_DIR = join(import.meta.dirname, '..', '..', 'db', 'migrations')

/** `YYYYMMDDHHMM_ops_snake_case.sql` */
const OPS_FILENAME = /^\d{12}_ops_[a-z0-9_]+\.sql$/

assertMigrationFolder(OPS_DIR, readmeIn(OPS_DIR), {
  label: 'packages/ops-db/migrations',
  filename: OPS_FILENAME,
  example: (s) => `${s}_ops_add_thing.sql`,
})

describe('ops migrations across both folders', () => {
  it('the assertion helper is byte-identical to the packages/db copy', () => {
    const ours = readFileSync(join(import.meta.dirname, 'migration-folder-assertions.ts'), 'utf8')
    const theirs = readFileSync(
      join(import.meta.dirname, '..', '..', 'db', 'src', 'migration-folder-assertions.ts'),
      'utf8'
    )
    expect(ours, 'Copy the changed file over the other one; the two must not drift.').toBe(theirs)
  })

  it('no 12-digit prefix is used in both packages/db and packages/ops-db', () => {
    const web = new Map(migrationFiles(WEB_DIR).map((f) => [migrationPrefix(f), f]))
    const clashes = migrationFiles(OPS_DIR)
      .filter((f) => web.has(migrationPrefix(f)))
      .map((f) => `${f} ↔ ${web.get(migrationPrefix(f))}`)
    expect(
      clashes,
      'Rename the Ops file with scripts/new-migration.sh, which skips minutes taken in either folder.'
    ).toEqual([])
  })

  it('the first eight migrations are the §11 outline, in order', () => {
    const names = migrationFiles(OPS_DIR)
      .slice(0, 8)
      .map((f) => f.slice(17, -4))
    expect(names).toEqual([
      'roles_and_schema',
      'extensions',
      'enums_and_tables',
      'constraints_indexes',
      'functions_triggers',
      'catalogue_views',
      'rls_and_grants',
      'reference_seed',
    ])
  })

  it('no migration sets a password (the repository is public)', () => {
    const offenders = migrationFiles(OPS_DIR).filter((f) =>
      /PASSWORD\s+'/i.test(readFileSync(join(OPS_DIR, f), 'utf8'))
    )
    expect(offenders).toEqual([])
  })
})
