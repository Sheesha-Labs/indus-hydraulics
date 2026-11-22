// The result every Ops server action returns (apps/ops/CLAUDE.md §6.2, 05 §7.2). Actions never throw to
// the browser: a failure carries a safe message and, for a validation failure, one message per field name.

/** One safe message per form field name, e.g. { unitPrice: 'Enter a price or mark the line Regret' }. */
export type FieldErrors = Record<string, string>

export type Result<T = void> =
  { success: true; data: T } | { success: false; error: string; fieldErrors?: FieldErrors }

/** A failed result. `never` data, so it is assignable to a Result of any T. */
export type Failure = Extract<Result<never>, { success: false }>

/** A successful result carrying `data`; `ok()` for an action with nothing to return. */
export function ok(): Result<void>
export function ok<T>(data: T): Result<T>
export function ok<T>(data?: T): Result<T | undefined> {
  return { success: true, data }
}

/**
 * A failed result. `error` is shown to the person as it is, so it must already be safe: never a Prisma
 * code, stack trace, provider error or model output (CLAUDE.md §6.6). Empty field errors are dropped.
 */
export function err(error: string, fieldErrors?: FieldErrors): Failure {
  return fieldErrors && Object.keys(fieldErrors).length > 0
    ? { success: false, error, fieldErrors }
    : { success: false, error }
}

/** True for a successful result; narrows to its data. */
export function isOk<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success
}
