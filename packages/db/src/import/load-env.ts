/**
 * Side-effect module: loads .env files into process.env BEFORE any Prisma
 * client initialisation. The Prisma runtime (as opposed to the Prisma CLI)
 * does NOT auto-load .env files — without this, `new PrismaClient()` throws
 * "Environment variable not found: DATABASE_URL" when invoked from a tsx-
 * launched script.
 *
 * Loads, in priority order (later wins for unset keys):
 *   1. <repo-root>/.env             (root env, has root-level secrets)
 *   2. <repo-root>/packages/db/.env (DB-specific overrides — usually has the
 *                                   active DATABASE_URL pointing at Supabase)
 *
 * Existing process.env values are preserved (so CI / shell env wins).
 *
 * Import this BEFORE any module that depends on env vars (i.e. before
 * `import { db } from '@indus/db'`). In ESM, side-effect imports run in
 * declaration order, so a top-of-file `import './load-env'` is sufficient.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Parse a .env file content into key→value pairs. Handles single/double
 *  quoted values and skips comments / blank lines. */
function parseEnvFile(content: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    // Strip surrounding quotes — both ' and "
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

function loadEnvFile(path: string) {
  if (!existsSync(path)) return
  const parsed = parseEnvFile(readFileSync(path, 'utf8'))
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value
    }
  }
}

// Resolve relative to this file: src/import/load-env.ts
// → packages/db/.env       = ../../.env
// → repo root /.env        = ../../../../.env
const dbEnv = resolve(__dirname, '../../.env')
const rootEnv = resolve(__dirname, '../../../../.env')

// Load DB-package .env first (its DATABASE_URL is canonical for our use case),
// then root .env for any keys not set by the DB env.
loadEnvFile(dbEnv)
loadEnvFile(rootEnv)
