import '../../server/assistant/actions/remind-supplier-documents'
import {
  dubaiToday,
  indusReminders,
  markExpired,
  rescreenDue,
  supplierReminders,
  suspendLapsed,
  workingToday,
} from '../../server/directory/document-reminders'
import { defineOpsFunction } from '../define'

/**
 * ops.reminders.documents (S10-T06/T08, C18): daily at 08:00 Dubai, one function with one step per job, each
 * idempotent (per document and threshold; per supplier while a reminder waits in Review). House lane; skipped while
 * paused (it runs again the next morning).
 */
export const remindersDocuments = defineOpsFunction(
  { id: 'ops.reminders.documents', lane: 'house', retries: 2, pause: 'skip' },
  { cron: 'TZ=Asia/Dubai 0 8 * * *' },
  async ({ step }) => {
    const today = new Date(await step.run('today', () => dubaiToday().toISOString()))
    const working = await step.run('working-day', () => workingToday(today))
    const expired = await step.run('mark-expired', () => markExpired(today))
    const lapsed = await step.run('suspend-lapsed', () => suspendLapsed(today))
    const suppliers = await step.run('supplier-reminders', () => supplierReminders(today, working))
    const indus = await step.run('indus-reminders', () => indusReminders(today, working))
    const rescreen = await step.run('rescreen-due', () => rescreenDue(today))
    return { working, expired, ...lapsed, reminders: suppliers.requested, indus, rescreen }
  }
)
