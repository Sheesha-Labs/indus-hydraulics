import 'server-only'
import { emitEvent, emitEventOrThrow } from '../../inngest/emit'
import { actionDefinition } from './registry'
import type { ActionRequest } from './types'

/**
 * Ask the Assistant to run an action (S05-T02). One event, `ops/action.requested`, whose id is the
 * idempotency key: the same subject at the same version is one action however often it is requested (Inngest
 * drops a repeated event id for 24 hours; the unique `assistant_action.idempotencyKey` catches the rest).
 */
export const ACTION_REQUESTED = 'ops/action.requested' as const

export interface ActionRequestedData extends ActionRequest {
  idempotencyKey: string
  group: string
  /** Runs for one record never overlap (the runner's per-key limit). */
  recordKey: string
}

export function idempotencyKeyOf(
  r: Pick<ActionRequest, 'actionKey' | 'subjectType' | 'subjectId' | 'sourceVersion'>
): string {
  return `${r.actionKey}:${r.subjectType}:${r.subjectId}:${r.sourceVersion}`
}

export function actionRequestEvent(request: ActionRequest): {
  name: typeof ACTION_REQUESTED
  id: string
  data: ActionRequestedData
} {
  const def = actionDefinition(request.actionKey)
  if (!def) throw new Error(`No action definition for "${request.actionKey}"`)
  const idempotencyKey = idempotencyKeyOf(request)
  return {
    name: ACTION_REQUESTED,
    id: idempotencyKey,
    data: {
      ...request,
      enquiryId: request.enquiryId ?? null,
      mailboxId: request.mailboxId ?? null,
      redraftOfId: request.redraftOfId ?? null,
      hint: request.hint ?? null,
      correctionOfId: request.correctionOfId ?? null,
      requestedById: request.requestedById ?? null,
      idempotencyKey,
      group: def.concurrencyGroup,
      recordKey: request.enquiryId ?? `${request.subjectType}:${request.subjectId}`,
    },
  }
}

/** Queue an action; throws when Inngest is unreachable (callers inside an Inngest step want the retry). */
export async function requestAction(request: ActionRequest): Promise<string> {
  const event = actionRequestEvent(request)
  await emitEventOrThrow({ name: event.name, id: event.id, data: { ...event.data } })
  return event.id
}

/** Queue an action without failing the caller (a person's request); false when it could not be queued. */
export async function requestActionQuietly(request: ActionRequest): Promise<boolean> {
  const event = actionRequestEvent(request)
  return emitEvent({ name: event.name, id: event.id, data: { ...event.data } })
}
