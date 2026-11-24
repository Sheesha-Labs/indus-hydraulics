import 'server-only'
import { opsDb } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access-core'
import { emitEvent } from '../../inngest/emit'
import { emitEvents } from '../../inngest/emit-batch'
import { getSetting, getSettingEntry } from '../settings/get'
import { revalidateSettings, updateSetting } from '../settings/update'
import { actionRequestEvent } from './request'

/**
 * The mail pipeline switch (S05-T09): `assistant.mail_pipeline_enabled`. Off (the seed), new live mail is
 * stored and shown but #1 Classify is never requested, so nothing is linked or labelled. Turning it on (the
 * Owner, Settings › Mailboxes) sorts the unclassified backlog oldest first through ops.assistant.backlog,
 * BACKLOG_BATCH at a time with a pause between batches; turning it off stops new requests (runs already
 * queued finish).
 */
export const BACKLOG_BATCH = 200
export const PIPELINE_ENABLED_EVENT = 'ops/assistant.pipeline.enabled' as const

export async function isMailPipelineEnabled(): Promise<boolean> {
  return (await getSetting('assistant.mail_pipeline_enabled')).enabled
}

export async function setMailPipeline(
  enabled: boolean,
  user: OpsUser,
  defer: (work: () => Promise<void>) => void | Promise<void> = (w) => w()
): Promise<{ enabled: boolean; version: number }> {
  const entry = await getSettingEntry('assistant.mail_pipeline_enabled')
  const change = await updateSetting(
    'assistant.mail_pipeline_enabled',
    { enabled },
    entry.version,
    user
  )
  revalidateSettings(['assistant.mail_pipeline_enabled'])
  if (enabled && !entry.value.enabled) {
    await defer(async () => {
      await emitEvent({
        name: PIPELINE_ENABLED_EVENT,
        id: `pipeline-on:${change.version}`,
        data: { byId: user.id, version: change.version },
      })
    })
  }
  return { enabled, version: change.version }
}

export interface BacklogCursor {
  receivedAt: string
  id: string
}

/**
 * One backlog batch: the oldest unclassified live inbound messages (no classification started: confidence
 * null) after `cursor`, each requested for #1 with the same idempotency key the router would use.
 */
export async function requestBacklogBatch(
  cursor: BacklogCursor | null,
  deps: {
    emit?: typeof emitEvents
    enabled?: () => Promise<boolean>
    /** Test seams: a smaller batch, one mailbox. */
    size?: number
    mailboxId?: string
  } = {}
): Promise<{ requested: number; next: BacklogCursor | null; stopped?: 'off' }> {
  const size = deps.size ?? BACKLOG_BATCH
  if (!(await (deps.enabled ?? isMailPipelineEnabled)()))
    return { requested: 0, next: null, stopped: 'off' }
  const rows = await opsDb.mailMessage.findMany({
    where: {
      direction: 'inbound',
      origin: 'live',
      classification: 'unclassified',
      confidence: null,
      ...(deps.mailboxId ? { mailboxId: deps.mailboxId } : {}),
      ...(cursor
        ? {
            OR: [
              { receivedAt: { gt: new Date(cursor.receivedAt) } },
              { receivedAt: new Date(cursor.receivedAt), id: { gt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ receivedAt: 'asc' }, { id: 'asc' }],
    take: size,
    select: { id: true, receivedAt: true, bodyTextHash: true },
  })
  if (rows.length) {
    await (deps.emit ?? emitEvents)(
      rows.map((m) => {
        const ev = actionRequestEvent({
          actionKey: 'classify_mail',
          subjectType: 'mail_message',
          subjectId: m.id,
          trigger: 'pipeline.backlog',
          origin: 'live',
          sourceVersion: m.bodyTextHash ?? 1,
        })
        return { name: ev.name, id: ev.id, data: { ...ev.data } }
      })
    )
  }
  const last = rows.at(-1)
  return {
    requested: rows.length,
    next:
      rows.length === size && last
        ? { receivedAt: last.receivedAt.toISOString(), id: last.id }
        : null,
  }
}
