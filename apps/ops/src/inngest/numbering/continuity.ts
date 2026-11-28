import { opsDb } from '@indus/ops-db'
import { CONTINUITY_CHECKERS } from '../../server/numbering/enquiry-seed'
import { NUMBERING_CHECK_REQUESTED, runContinuity } from '../../server/numbering/sequences'
import { defineOpsFunction } from '../define'

/**
 * ops.numbering.continuity (S08-T06, extended S11-T08; 10-architecture §4.8): 02:45 Dubai, read-only. For the ENQ
 * series, the website admin's block check of S08 (approaching within 200, out of step once reached). Then, for
 * every seeded sequence (the structural assistant_action one aside), the S11 evidence run: Sent mail on sales@
 * and purchase@, the website admin, then the continuity check written to the sequence, with a notification when
 * it is out of step. "Check now" sends the event for one key.
 */
export const numberingContinuity = defineOpsFunction(
  { id: 'ops.numbering.continuity', lane: 'house', retries: 1, pause: 'exempt' },
  [{ cron: 'TZ=Asia/Dubai 45 2 * * *' }, { event: NUMBERING_CHECK_REQUESTED }],
  async ({ event, step }) => {
    const only = (event?.data as { key?: string } | undefined)?.key ?? null
    const out: Record<string, string> = {}
    if (!only) {
      const year = Number(
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
          new Date()
        )
      )
      for (const [key, check] of Object.entries(CONTINUITY_CHECKERS)) {
        const r = await step.run(`check-${key}`, () => check(year))
        out[key] = r.status
      }
    }
    const keys = await step.run('sequences', async () =>
      (
        await opsDb.numberSequence.findMany({
          where: { key: only ? only : { not: 'assistant_action' } },
          select: { key: true },
          orderBy: { key: 'asc' },
        })
      ).map((s) => s.key)
    )
    for (const key of keys) {
      const r = await step.run(`continuity-${key}`, () => runContinuity(key))
      out[`${key}:continuity`] = r.status
    }
    return out
  }
)
