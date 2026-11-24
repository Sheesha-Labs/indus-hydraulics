import { ACTION_REQUESTED, type ActionRequestedData } from '../../server/assistant/request'
import {
  decideRun,
  definitionOf,
  effectRun,
  gatherRun,
  proposeRun,
  recordRun,
  resolveRun,
  verifyRun,
  type ResolveOutcome,
} from '../../server/assistant/runner'
import type { Json } from '../../server/assistant/types'
import { defineOpsFunction } from '../define'

// Action modules register themselves on import.
import '../../server/assistant/actions'

/**
 * ops.assistant.run (S05-T02, ADR-09, 10-architecture §4.8): one run per `ops/action.requested`.
 *
 *   resolve   the level (interim resolver); paused → wait for ops/assistant.resumed, then resolve again;
 *             blocked by origin, off, never or budget → no row, counted as skipped
 *   gather    the input and its versions (basisHash)
 *   propose   model calls only; no DB transaction is open across them (CLAUDE.md §7.4)
 *   verify    deterministic
 *   decide    insert the immutable action (replays return the existing one)
 *   effect    for running actions: def.effect in one transaction, then done (or failed with a reason)
 *   record    live counters
 *
 * (decision) The plan's concurrency [group ≤ 3, recordKey ≤ 1] does not fit the free plan's shared lanes
 * (2026-11-23): the run queues in the live lane with ONE per-key limit, one run per record at a time. The
 * idempotency key is both the event id and the function's idempotency expression, and the database's unique
 * key is the last word.
 */
export const assistantRun = defineOpsFunction(
  {
    id: 'ops.assistant.run',
    lane: 'live',
    perKey: { key: 'event.data.recordKey', limit: 1 },
    retries: 2,
    idempotency: 'event.data.idempotencyKey',
    pause: 'wait',
  },
  { event: ACTION_REQUESTED },
  async ({ event, step }) => {
    const data = event.data as unknown as ActionRequestedData

    let resolved: ResolveOutcome = await step.run('resolve', () => resolveRun(data))
    if (resolved.blocked === 'paused') {
      await step.waitForEvent('wait-for-resume', { event: 'ops/assistant.resumed', timeout: '7d' })
      resolved = await step.run('resolve-after-resume', () => resolveRun(data))
    }
    if (resolved.blocked) {
      await step.run('record-skipped', () => recordRun({ skipped: true }))
      return { skipped: resolved.blocked }
    }

    const gathered = await step.run('gather', () => gatherRun(data))
    const proposed = await step.run('propose', () => proposeRun(data, gathered.input as Json))
    const verified = proposed.ok
      ? await step.run('verify', () =>
          verifyRun(data, proposed.out as Json, gathered.input as Json)
        )
      : null

    const decided = await step.run('decide', () =>
      decideRun({
        data,
        resolved,
        basisHash: gathered.basisHash,
        input: gathered.input as Json,
        proposal:
          proposed.ok && verified
            ? {
                ok: true,
                verified: verified as never,
                costUsd: proposed.costUsd,
                model: proposed.model,
                promptVersion: proposed.promptVersion,
                callIds: proposed.callIds,
              }
            : {
                ok: false,
                reason: proposed.ok ? 'invalid' : proposed.reason,
                detail: proposed.ok ? 'Verification did not run' : proposed.detail,
                costUsd: proposed.costUsd,
                callIds: proposed.callIds,
              },
      })
    )

    const effect =
      decided.created && decided.state === 'running'
        ? await step.run('effect', () => effectRun(decided.actionId))
        : { state: 'skipped' as const }

    await step.run('record', () => recordRun({ surface: definitionOf(data.actionKey).surface }))
    return {
      actionId: decided.actionId,
      ref: decided.ref,
      state: decided.state,
      effect: effect.state,
    }
  }
)
