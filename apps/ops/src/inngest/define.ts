import type { GetStepTools } from 'inngest'
import { isAssistantPaused } from '../server/assistant/pause'
import { inngest } from './client'
import { laneConcurrency, type OpsLane } from './plan'

/**
 * Every Ops Inngest function is defined here (CLAUDE.md §7.5, §16; ADR-04, ADR-22). The wrapper makes the
 * connection-budget rules impossible to forget:
 *
 *   lane         required: the shared lane (live / bulk / house, plan.ts) the function queues in; the lanes
 *                together fit the account-wide plan cap (concurrency.test.ts)
 *   perKey       optional second limit inside the lane, e.g. one send at a time per mailbox
 *   retries      required (sends are 0: never resent automatically, ADR-07)
 *   pause        required: what the function does while "Pause everything" is on (§1.10)
 *                  exempt       runs as normal (heartbeat, health, purges)
 *                  skip         returns { skipped: 'paused' } (crons that will run again)
 *                  record_only  runs with `paused: true`; the handler records and stops (Gmail sync: the
 *                               notification's historyId is kept, nothing is processed)
 *                  wait         waits for ops/assistant.resumed (up to 7 days), then runs (sends)
 */
export type PauseBehaviour = 'exempt' | 'skip' | 'record_only' | 'wait'

type CreateArgs = Parameters<typeof inngest.createFunction>
type FunctionOptions = CreateArgs[0]
type Trigger = CreateArgs[1]

export type OpsFunctionOptions = Omit<FunctionOptions, 'concurrency' | 'retries' | 'id'> & {
  id: `ops.${string}`
  lane: OpsLane
  /** A per-key limit within the lane (Inngest allows two constraints: the lane and this one). */
  perKey?: { key: string; limit: number }
  retries: NonNullable<FunctionOptions['retries']>
  pause: PauseBehaviour
}

type Step = GetStepTools<typeof inngest>

export type OpsHandlerContext = {
  event: { name: string; data: Record<string, unknown>; id?: string; ts?: number }
  step: Step
  /** True only for pause: 'record_only' while paused. */
  paused: boolean
  runId: string
  attempt: number
}

/**
 * What a run does about "Pause everything" before its handler (S05-T08): exempt runs never look; skip returns;
 * wait sleeps on ops/assistant.resumed (7 days at most, then runs); record_only runs with `paused: true`.
 */
export async function applyPause(
  pause: PauseBehaviour,
  step: Pick<Step, 'run' | 'waitForEvent'>,
  isPaused: () => Promise<boolean> = isAssistantPaused
): Promise<{ skip: boolean; recordOnly: boolean }> {
  if (pause === 'exempt') return { skip: false, recordOnly: false }
  const paused = await step.run('pause-check', () => isPaused())
  if (!paused) return { skip: false, recordOnly: false }
  if (pause === 'skip') return { skip: true, recordOnly: false }
  if (pause === 'wait') {
    await step.waitForEvent('wait-for-resume', { event: 'ops/assistant.resumed', timeout: '7d' })
    return { skip: false, recordOnly: false }
  }
  return { skip: false, recordOnly: true }
}

/** Registry of pause behaviours by function id (concurrency.test.ts and the §16 table check it). */
export const PAUSE_BEHAVIOUR = new Map<string, PauseBehaviour>()

export function defineOpsFunction<T>(
  options: OpsFunctionOptions,
  trigger: Trigger,
  handler: (ctx: OpsHandlerContext) => Promise<T>
) {
  const { pause, lane, perKey, ...rest } = options
  PAUSE_BEHAVIOUR.set(options.id, pause)
  const concurrency = [laneConcurrency(lane), ...(perKey ? [perKey] : [])]
  return inngest.createFunction(
    { ...rest, concurrency } as FunctionOptions,
    trigger,
    async (ctx) => {
      const { event, step, runId, attempt } = ctx as unknown as OpsHandlerContext & {
        runId: string
        attempt: number
      }
      const gate = await applyPause(pause, step)
      if (gate.skip) return { skipped: 'paused' } as unknown as T
      return handler({ event, step, paused: gate.recordOnly, runId, attempt })
    }
  )
}
