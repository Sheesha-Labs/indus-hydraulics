import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import { allFunctions } from '../../../inngest/functions'

/**
 * Inngest webhook handler. Registers all server functions so Inngest
 * can trigger them on cron schedules or via `inngest.send(...)` events.
 *
 * To run locally:
 *   npx inngest-cli@latest dev
 * The dev server connects to this endpoint at http://localhost:3001/api/inngest
 * and surfaces a UI for triggering functions manually.
 */
export const { GET, POST, PUT } = serve({ client: inngest, functions: allFunctions })
