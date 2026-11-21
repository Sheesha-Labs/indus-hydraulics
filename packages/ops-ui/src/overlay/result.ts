// The action result the overlays await (CLAUDE.md §6.2). Structural, so a Result<T> from defineAction is
// assignable as it is. TODO(S01-T10): import Result from @indus/ops-core (S01-T06 adds
// packages/ops-core/src/result.ts) and delete this file; it was not in this task's base commit.
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> }

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
