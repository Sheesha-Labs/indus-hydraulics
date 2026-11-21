import { Inngest } from 'inngest'

/**
 * The Indus Operations Inngest app. Separate from the website's
 * 'indus-hydraulics-admin' app: its own id, its own event key, function ids
 * 'ops.*' and events 'ops/*' (registry-overlap.test.ts).
 */
export const inngest = new Inngest({ id: 'indus-operations' })
