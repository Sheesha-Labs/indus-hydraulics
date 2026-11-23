import { gmailBackfill } from './gmail/backfill'
import { gmailMessageFetch } from './gmail/message-fetch'
import { gmailOnConnected } from './gmail/on-connected'
import { gmailPoll } from './gmail/poll'
import { gmailSync } from './gmail/sync'
import { gmailWatchRenew } from './gmail/watch-renew'
import { heartbeat } from './heartbeat'

/** Every Indus Operations Inngest function. concurrency.test.ts checks this list. */
export const opsFunctions = [
  heartbeat,
  gmailOnConnected,
  gmailSync,
  gmailPoll,
  gmailWatchRenew,
  gmailMessageFetch,
  gmailBackfill,
]
