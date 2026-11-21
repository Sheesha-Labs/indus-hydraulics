import { serve } from 'inngest/next'
import { inngest } from '../../../inngest/client'
import { opsFunctions } from '../../../inngest/functions'

export const maxDuration = 300

// Serves the Indus Operations Inngest app. Inngest signs every call
// (INNGEST_SIGNING_KEY); the proxy lets this path through for that reason.
export const { GET, POST, PUT } = serve({ client: inngest, functions: opsFunctions })
