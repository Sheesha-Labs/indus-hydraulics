import { join } from 'node:path'
import { assertMigrationFolder, readmeIn } from './migration-folder-assertions'

/**
 * Guards the naming convention in `packages/db/migrations/`: `YYYYMMDDHHMM_snake_case.sql`,
 * unique prefixes, lexical = chronological order, and a README row per file. The rules and
 * their history live in `./migration-folder-assertions.ts`, which packages/ops-db copies
 * byte for byte for its own folder (and which also checks prefixes across both folders).
 */
const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'migrations')

assertMigrationFolder(MIGRATIONS_DIR, readmeIn(MIGRATIONS_DIR), { label: 'packages/db/migrations' })
