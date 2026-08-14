import { ZodError } from 'zod'
import { AuthorizationError, ForbiddenError } from './rbac'

/**
 * Server-action result envelope. CLAUDE.md §7.2 mandates that server actions
 * return typed result objects rather than throwing — this lets clients render
 * structured errors without parsing `error.message` strings.
 *
 * Codes mirror common REST error families. Add new codes as needed but keep
 * them ALL_CAPS_SNAKE_CASE.
 */
export type Result<T = void> =
  | { success: true; data: T }
  | { success: false; code: ResultErrorCode; message: string; fieldErrors?: Record<string, string[]> }

export type ResultErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PRECONDITION_FAILED'
  | 'INTERNAL'

export function ok<T>(data: T): Result<T> {
  return { success: true, data }
}

export function fail(
  code: ResultErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>
): Result<never> {
  return fieldErrors
    ? { success: false, code, message, fieldErrors }
    : { success: false, code, message }
}

/**
 * Catch the common errors thrown inside server actions (auth/role/validation/
 * unique-constraint) and convert to `Result<never>`. Anything unrecognized
 * re-throws so it surfaces as a 500.
 */
export function failFromError(err: unknown): Result<never> {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of err.issues) {
      const path = issue.path.join('.') || '_'
      fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message]
    }
    return fail('VALIDATION', 'Invalid input', fieldErrors)
  }
  if (err instanceof AuthorizationError) {
    return fail('UNAUTHORIZED', err.message)
  }
  if (err instanceof ForbiddenError) {
    return fail('FORBIDDEN', err.message)
  }
  // Prisma unique constraint
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2002') {
    return fail('CONFLICT', 'A record with these values already exists')
  }
  // Prisma not found
  if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'P2025') {
    return fail('NOT_FOUND', 'Record not found')
  }
  throw err
}
