// SERVER-ONLY. This module constructs the Ops PrismaClient (role ops_app, schema ops). It must
// never be imported by a client component: it would ship the engine and the datasource URL
// handling to the browser bundle. Import it from server components, server actions, route
// handlers and Inngest functions only.
//
// The client is generated into packages/ops-db/generated/client (git-ignored), never the
// default @prisma/client path that packages/db uses — see src/client-path.test.ts. It is
// imported through the package's own `#ops-client` subpath import (package.json "imports"),
// because the generated folder is a package of its own and may not be imported by path.
import { Prisma, PrismaClient } from '#ops-client'
import { buildDatasourceUrl } from './datasource-url'
import { pinQueryEngine } from './query-engine'

export const OPS_DB = '@indus/ops-db' as const

const globalForOpsDb = globalThis as unknown as { opsDb?: PrismaClient }

const datasourceUrl = buildDatasourceUrl()

// On Vercel the bundled client cannot find its engine on its own (src/query-engine.ts).
pinQueryEngine()

export const opsDb: PrismaClient =
  globalForOpsDb.opsDb ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForOpsDb.opsDb = opsDb

// PrismaClient as a value for scripts that need their own connection (e.g. create-owner over DIRECT_URL).
export { Prisma, PrismaClient }
export { buildDatasourceUrl, OPS_CONNECTION_LIMIT, OPS_POOL_TIMEOUT } from './datasource-url'
// Every generated model and enum type. Enum VALUES are under `$Enums` (e.g.
// `$Enums.UserRole.owner`): the linter cannot see a CommonJS module's names through `export *`.
export type * from '#ops-client'
export { $Enums } from '#ops-client'
export { maintDatasourceUrl, maintDb } from './maint-client'
