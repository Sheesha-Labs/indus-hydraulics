import { requestAction } from '../../server/assistant/request'
import { refreshSupplierStatsPage } from '../../server/directory/supplier-stats'
import { defineOpsFunction } from '../define'

/**
 * ops.supplier.stats (S10-T03): nightly at 01:30 Dubai, the reliability figures for every supplier in pages of 200,
 * one read and one update transaction per page, a short sleep between pages. A supplier whose figures moved
 * materially and has 3 or more replies gets a fresh internal paragraph (`supplier_reliability_summary`, Do quietly).
 * House lane (concurrency 1 with the other house jobs); skipped while paused, it runs again the next night.
 */
export const supplierStats = defineOpsFunction(
  { id: 'ops.supplier.stats', lane: 'house', retries: 2, pause: 'skip' },
  { cron: 'TZ=Asia/Dubai 30 1 * * *' },
  async ({ step }) => {
    let cursor = ''
    let pages = 0
    let processed = 0
    const day = new Date().toISOString().slice(0, 10)
    for (;;) {
      const page = await step.run(`page-${pages}`, () => refreshSupplierStatsPage(cursor))
      processed += page.processed
      if (page.summarise.length)
        await step.run(`summaries-${pages}`, async () => {
          for (const id of page.summarise)
            await requestAction({
              actionKey: 'supplier_reliability_summary',
              subjectType: 'company',
              subjectId: id,
              trigger: 'cron',
              origin: 'live',
              sourceVersion: day,
            })
          return page.summarise.length
        })
      pages++
      if (!page.nextCursor) break
      cursor = page.nextCursor
      await step.sleep(`gap-${pages}`, '2s')
    }
    return { pages, processed }
  }
)
