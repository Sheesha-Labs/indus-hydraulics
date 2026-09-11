/**
 * Re-export of the existing import-library env loader so runners that live
 * outside `src/import/` can pull it in via a stable path. Keeps the ordering
 * requirement — env must load before `db` is imported — explicit at the top of
 * each runner.
 *
 * MUST be a side-effect `import`, not `export {} from`.
 *
 * It was the latter until 2026-09-11. `export {} from 'mod'` re-exports no
 * bindings, so esbuild — which is what tsx runs — treats the whole declaration
 * as dead and elides it. The module never evaluates, the .env files never load,
 * and the runner dies on `Environment variable not found: DATABASE_URL` at its
 * first query. It went unnoticed because anyone with DATABASE_URL already
 * exported in their shell gets a working run and never learns the loader did
 * nothing; it surfaces on a fresh checkout or a git worktree, where the shell
 * is clean.
 *
 * The trailing `export {}` is what keeps this file a module rather than a
 * script under `isolatedModules`. It is not the import.
 */
import '../../import/load-env'

export {}
