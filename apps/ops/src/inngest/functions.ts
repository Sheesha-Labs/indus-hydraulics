import { assistantBacklog } from './assistant/backlog'
import { autopilotSuggestions } from './autopilot/suggestions'
import { budgetReservationSweep } from './budget/reservation-sweep'
import { budgetRollover } from './budget/rollover'
import { budgetThresholdsFn } from './budget/thresholds'
import { preferencesBatchPoll } from './preferences/batch-poll'
import { preferencesLearn } from './preferences/learn'
import { clocksTick } from './clocks/tick'
import { assistantOnResumed } from './assistant/on-resumed'
import { assistantRun } from './assistant/run'
import { captureDocument } from './intake/capture-document'
import { numberingContinuity } from './numbering/continuity'
import { remindersDocuments } from './directory/reminders-documents'
import { supplierStats } from './directory/supplier-stats'
import { gmailBackfill } from './gmail/backfill'
import { gmailHealth } from './gmail/health'
import { gmailBackfillFetch, gmailMessageFetch } from './gmail/message-fetch'
import { gmailOnConnected } from './gmail/on-connected'
import { gmailPoll } from './gmail/poll'
import { gmailSync } from './gmail/sync'
import { gmailWatchRenew } from './gmail/watch-renew'
import { heartbeat } from './heartbeat'
import { gmailLabelsApply } from './mail/labels-apply'
import { mailboxPurge } from './mail/purge'
import { mailSendReconcile } from './mail/reconcile'
import { mailRoute } from './mail/route'
import { mailBounceSoft } from './mail/soft-bounce'
import { mailSend } from './mail/send'

/** Every Indus Operations Inngest function. concurrency.test.ts checks this list. */
export const opsFunctions = [
  heartbeat,
  gmailOnConnected,
  gmailSync,
  gmailPoll,
  gmailWatchRenew,
  gmailMessageFetch,
  gmailBackfillFetch,
  gmailBackfill,
  gmailHealth,
  mailSend,
  mailSendReconcile,
  mailboxPurge,
  assistantRun,
  assistantOnResumed,
  assistantBacklog,
  clocksTick,
  mailRoute,
  mailBounceSoft,
  gmailLabelsApply,
  autopilotSuggestions,
  budgetRollover,
  budgetReservationSweep,
  budgetThresholdsFn,
  preferencesLearn,
  preferencesBatchPoll,
  captureDocument,
  numberingContinuity,
  supplierStats,
  remindersDocuments,
]
