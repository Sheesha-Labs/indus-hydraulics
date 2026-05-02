import { Inngest } from 'inngest'

/**
 * Inngest client. The handler at /api/inngest/route.ts registers all
 * functions; cron schedules + step retries + concurrency are managed
 * server-side by Inngest.
 *
 * In dev, the Inngest dev server (run `npx inngest-cli@latest dev`)
 * connects to the same /api/inngest endpoint and shows runs / triggers
 * crons manually for testing.
 */
export const inngest = new Inngest({ id: 'indus-hydraulics-admin' })
