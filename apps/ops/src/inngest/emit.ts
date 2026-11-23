import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { env } from '../lib/env'
import { inngest } from './client'

/**
 * Send one Ops event (ADR-22). Events are `ops/*`; `id` deduplicates retries and redeliveries (Inngest keeps an
 * event id for 24 h). Returns false instead of throwing when Inngest is unreachable, for callers that must not
 * fail a person's request because background work could not be queued (the work is picked up again by the
 * cron that owns it). Callers that cannot continue without the event use `emitEventOrThrow`.
 */
export type OpsEvent = { name: `ops/${string}`; data: Record<string, unknown>; id?: string }

export async function emitEventOrThrow(event: OpsEvent): Promise<void> {
  await inngest.send({ name: event.name, data: event.data, ...(event.id ? { id: event.id } : {}) })
}

export async function emitEvent(event: OpsEvent): Promise<boolean> {
  try {
    await emitEventOrThrow(event)
    return true
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag('event', event.name)
      Sentry.captureException(error)
    })
    if (env().APP_ENV === 'local') console.error(`[ops event ${event.name}] not sent`, error)
    return false
  }
}
