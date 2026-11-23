import { heartbeat } from './heartbeat'
import { mailboxConnected } from './mailbox-connected'

/** Every Indus Operations Inngest function. concurrency.test.ts checks this list. */
export const opsFunctions = [heartbeat, mailboxConnected]
