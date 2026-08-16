/**
 * Shared shape and copy for the staff password-reset form.
 *
 * These live OUTSIDE actions.ts on purpose. A module carrying the top-level
 * `'use server'` directive may export nothing but async functions — every
 * other export makes the module throw
 * `A "use server" file can only export async functions, found string.`
 * the first time it is evaluated, which is on the first submit, not at build
 * time. Keeping the constant here means the client component can import it
 * without dragging the server module into an illegal shape.
 */

export type ForgotState = { done: true } | { error: string } | null

/**
 * One response for every outcome.
 *
 * "Sent", "no such staff account" and "account suspended" are indistinguishable
 * to the caller. Anything else turns this form into an oracle for which
 * addresses have admin access — a useful shopping list for whoever wants to
 * phish one.
 */
export const NEUTRAL = 'If that address belongs to a staff account, a reset link is on its way.'
