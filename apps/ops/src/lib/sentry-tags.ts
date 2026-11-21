import * as Sentry from '@sentry/nextjs'

export type Actor = 'owner' | 'helper' | 'assistant' | 'system'

/** Who caused the work an event belongs to. */
export function tagActor(actor: Actor): void {
  Sentry.setTag('actor', actor)
}

/** Which background job an event came from. */
export function tagJob(id: string): void {
  Sentry.setTag('job', id)
}
