import { AccessError } from './access-core'

/**
 * What a person sees when an action fails (CLAUDE.md §6.3, apps/ops/CLAUDE.md §6.6). Every message
 * is a plain sentence written here: never a Prisma code, a driver message, a stack trace, a
 * provider error or model output. The real error goes to Sentry with the request id.
 *
 * Pure (no Prisma import): a Prisma error is recognised by its `code` / `errorCode` shape, which
 * also holds across the generated client's module copies, where `instanceof` would not.
 */

export const SAFE_MESSAGES = {
  generic: 'Something went wrong. Try again in a moment.',
  conflict: 'Someone changed this a moment ago. Reload and try again.',
  gone: 'This was changed or removed a moment ago. Reload and try again.',
  duplicate: 'That already exists. Reload to see it.',
  missingReference: 'Something this refers to no longer exists. Reload and try again.',
  busy: 'The database is busy right now. Try again in a moment.',
  forbidden: "You don't have access to do that.",
  signedOut: 'Your session has ended. Sign in again.',
  readOnly: 'This copy of Indus Operations is read-only. Nothing was changed.',
  invalid: 'Check the highlighted fields.',
} as const

export type SafeMessage = (typeof SAFE_MESSAGES)[keyof typeof SAFE_MESSAGES]

/**
 * An error whose message is written for the person, e.g. "This quotation has already been sent."
 * A handler throws it to refuse with a reason; `safeMessage` passes its text through unchanged
 * and `defineAction` does not report it to Sentry as a fault. Never wrap another error's message.
 */
export class SafeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SafeError'
  }
}

/** Prisma codes with a sentence of their own. Anything else is `generic`. */
const PRISMA_MESSAGES: Readonly<Record<string, SafeMessage>> = {
  P2002: SAFE_MESSAGES.duplicate, // unique constraint
  P2003: SAFE_MESSAGES.missingReference, // foreign key
  P2025: SAFE_MESSAGES.gone, // record to update or delete not found (incl. a version-guarded update)
  P2034: SAFE_MESSAGES.conflict, // write conflict or deadlock: retry the transaction
  P2024: SAFE_MESSAGES.busy, // timed out waiting for a pooled connection
  P2028: SAFE_MESSAGES.busy, // transaction API error (e.g. it timed out)
  P1001: SAFE_MESSAGES.busy, // cannot reach the database server
  P1002: SAFE_MESSAGES.busy, // database server timed out
  P1008: SAFE_MESSAGES.busy, // operation timed out
  P1017: SAFE_MESSAGES.busy, // server closed the connection
}

/** The Prisma error code an error carries, if it is one (P1xxx initialisation, P2xxx request). */
export function prismaErrorCode(e: unknown): string | undefined {
  if (typeof e !== 'object' || e === null) return undefined
  const { code, errorCode } = e as { code?: unknown; errorCode?: unknown }
  for (const candidate of [code, errorCode]) {
    if (typeof candidate === 'string' && /^P\d{4}$/.test(candidate)) return candidate
  }
  return undefined
}

/** The sentence to show for an error. Total: every input maps to one of the messages above or a SafeError's text. */
export function safeMessage(e: unknown): string {
  if (e instanceof SafeError) return e.message
  if (e instanceof AccessError) {
    return e.code === 'unauthenticated' ? SAFE_MESSAGES.signedOut : SAFE_MESSAGES.forbidden
  }
  const code = prismaErrorCode(e)
  if (code) return PRISMA_MESSAGES[code] ?? SAFE_MESSAGES.generic
  return SAFE_MESSAGES.generic
}

/** Errors a person caused or can fix (refusals, access): not faults, so not reported to Sentry. */
export function isExpectedRefusal(e: unknown): boolean {
  return e instanceof SafeError || e instanceof AccessError
}
