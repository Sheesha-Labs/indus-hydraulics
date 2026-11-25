import { describe, expect, it, vi } from 'vitest'

vi.mock('@indus/ops-db', () => ({ opsDb: {} }))

const { opsFunctions } = await import('./functions')
const { PAUSE_BEHAVIOUR, applyPause } = await import('./define')

/**
 * "Pause everything" (S05-T08, C22): what each function does while the Assistant is paused. One row per
 * registered function: a new function without a row here fails, so its pause behaviour is a decision.
 */
const EXPECTED: Record<string, 'exempt' | 'skip' | 'record_only' | 'wait'> = {
  // Reports only, or an explicit Owner request.
  'ops.system.heartbeat': 'exempt',
  'ops.gmail.health': 'exempt',
  'ops.gmail.watch.renew': 'exempt',
  'ops.mail.send.reconcile': 'exempt',
  'ops.mailbox.purge': 'exempt',
  'ops.mailbox.on-connected': 'exempt',
  // The send gate holds queued sends and re-gates them on resume.
  'ops.mail.send': 'exempt',
  // Runs because the pause ended.
  'ops.assistant.on-resumed': 'exempt',
  // Records the notification, keeps the cursor: resume reads the gap in order.
  'ops.gmail.sync': 'record_only',
  // A cron that runs again in ten minutes.
  'ops.gmail.poll': 'skip',
  'ops.clocks.tick': 'skip',
  'ops.autopilot.suggestions': 'skip',
  'ops.budget.rollover': 'exempt',
  'ops.budget.reservation.sweep': 'exempt',
  'ops.budget.thresholds': 'exempt',
  'ops.preferences.learn': 'skip',
  'ops.preferences.batch.poll': 'skip',
  'ops.capture.document': 'wait',
  // Everything that reads, drafts, labels or acts waits for ops/assistant.resumed.
  'ops.gmail.message.fetch': 'wait',
  'ops.gmail.message.fetch.backfill': 'wait',
  'ops.gmail.backfill': 'wait',
  'ops.gmail.labels.apply': 'wait',
  'ops.assistant.run': 'wait',
  'ops.mail.route': 'wait',
  'ops.mail.bounce.soft': 'wait',
  'ops.assistant.backlog': 'wait',
}

const ids = opsFunctions.map((fn) => (fn as unknown as { opts: { id: string } }).opts.id)

describe('pause behaviour per function', () => {
  it('every registered function has a row, and no row is stale', () => {
    expect(ids.filter((id) => !(id in EXPECTED))).toEqual([])
    expect(Object.keys(EXPECTED).filter((id) => !ids.includes(id))).toEqual([])
  })

  it.each(Object.entries(EXPECTED))('%s is %s', (id, behaviour) => {
    expect(PAUSE_BEHAVIOUR.get(id)).toBe(behaviour)
  })
})

describe('applyPause', () => {
  function fakeStep() {
    const waited: string[] = []
    return {
      waited,
      step: {
        run: async (_id: string, fn: () => unknown) => fn(),
        waitForEvent: async (_id: string, opts: { event: string }) => {
          waited.push(opts.event)
          return null
        },
      } as never,
    }
  }

  it('exempt never reads the pause; running is a no-op for the others', async () => {
    const paused = vi.fn(async () => true)
    expect(await applyPause('exempt', fakeStep().step, paused)).toEqual({
      skip: false,
      recordOnly: false,
    })
    expect(paused).not.toHaveBeenCalled()
    for (const b of ['skip', 'wait', 'record_only'] as const) {
      expect(await applyPause(b, fakeStep().step, async () => false)).toEqual({
        skip: false,
        recordOnly: false,
      })
    }
  })

  it('while paused: skip returns, wait waits for ops/assistant.resumed, record_only records', async () => {
    const on = async () => true
    expect(await applyPause('skip', fakeStep().step, on)).toEqual({ skip: true, recordOnly: false })
    const w = fakeStep()
    expect(await applyPause('wait', w.step, on)).toEqual({ skip: false, recordOnly: false })
    expect(w.waited).toEqual(['ops/assistant.resumed'])
    expect(await applyPause('record_only', fakeStep().step, on)).toEqual({
      skip: false,
      recordOnly: true,
    })
  })
})
