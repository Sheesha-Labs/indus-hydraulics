import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** The query engine Vercel Functions need (Amazon Linux 2023). */
export const VERCEL_ENGINE_FILE = 'libquery_engine-rhel-openssl-3.0.x.so.node'

/**
 * Where the traced Ops client can sit inside a Vercel Function. The function root
 * mirrors the repository (outputFileTracingRoot is the repo root) and the process
 * runs from the app folder or from the root, depending on the runtime.
 */
export function engineCandidates(cwd: string): string[] {
  return [
    join(cwd, '../../packages/ops-db/generated/client'),
    join(cwd, 'packages/ops-db/generated/client'),
    '/var/task/packages/ops-db/generated/client',
  ].map((dir) => join(dir, VERCEL_ENGINE_FILE))
}

/**
 * Point Prisma at the Ops query engine on Vercel, before the client is created.
 *
 * Next bundles the generated client, and a bundled Prisma client looks for its
 * engine relative to `process.cwd()` + the path `prisma generate` ran in
 * (`generated/client`), the runtime package, the BUILD machine's absolute output
 * path and `node_modules/.prisma/client` — none of which is where Vercel puts the
 * traced `packages/ops-db/generated/client`. The first Ops production deploy
 * (2026-11-22) failed every database request with "could not locate the Query
 * Engine for runtime rhel-openssl-3.0.x". Prisma reads PRISMA_QUERY_ENGINE_LIBRARY
 * before its own search, so this sets it to the traced file.
 *
 * Does nothing off Vercel (local dev and CI resolve the engine normally) or when
 * the variable is already set. Returns the path it chose, if any.
 */
export function pinQueryEngine(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
  exists: (path: string) => boolean = existsSync
): string | undefined {
  if (env.VERCEL !== '1' || env.PRISMA_QUERY_ENGINE_LIBRARY) return undefined
  const found = engineCandidates(cwd).find((path) => exists(path))
  if (found) env.PRISMA_QUERY_ENGINE_LIBRARY = found
  return found
}
