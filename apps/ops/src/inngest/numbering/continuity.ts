import { CONTINUITY_CHECKERS } from '../../server/numbering/enquiry-seed'
import { defineOpsFunction } from '../define'

/**
 * ops.numbering.continuity (S08-T06, 10-architecture §4.8): 02:45 Dubai, read-only. Compares each outside
 * allocator with the Ops counter for the current year — for now the website admin's ENQ refs (C5) — and raises
 * "approaching the block" within 200, or flags the sequence out of step once it is reached. One checker per
 * sequence key; S11 adds its own sources beside this one.
 */
export const numberingContinuity = defineOpsFunction(
  { id: 'ops.numbering.continuity', lane: 'house', retries: 1, pause: 'exempt' },
  { cron: 'TZ=Asia/Dubai 45 2 * * *' },
  async ({ step }) => {
    const year = Number(
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric' }).format(
        new Date()
      )
    )
    const out: Record<string, string> = {}
    for (const [key, check] of Object.entries(CONTINUITY_CHECKERS)) {
      const r = await step.run(`check-${key}`, () => check(year))
      out[key] = r.status
    }
    return out
  }
)
