// The action result the overlays await is the shared Result<T> from @indus/ops-core (CLAUDE.md §6.2), so a
// defineAction result is assignable as it is. ActionResult stays as the overlays' name for it.
import type { Result } from '@indus/ops-core'

export type { Result } from '@indus/ops-core'
export type ActionResult<T = unknown> = Result<T>

/** The message shown when an awaited action throws instead of returning a result. */
export const UNEXPECTED_ERROR = 'That didn’t go through. Try again.'

/** Await an action and never reject: a throw becomes a failed result with a safe message. */
export async function settle<T>(run: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await run()
  } catch {
    return { success: false, error: UNEXPECTED_ERROR }
  }
}
