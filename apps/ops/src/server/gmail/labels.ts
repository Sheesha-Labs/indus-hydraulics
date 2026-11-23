import 'server-only'
import { opsDb } from '@indus/ops-db'
import { getSetting } from '../settings/get'
import type { MailLabelKey, MailLabelNames } from '../settings/registry'
import type { GmailApi } from './client'
import { httpStatusOf } from './errors'

/**
 * The `Indus/*` labels in each connected mailbox (S04-T02, 08-map-integrations §1.8). Names come from the
 * setting `mail.label_names` (awaiting sign-off). A label that already exists in Gmail with the same name is
 * adopted, never duplicated; ids are cached in gmail_label. Ops never touches any other label.
 */
export type EnsureLabelsResult = { created: string[]; adopted: string[] }

export async function ensureIndusLabels(
  mailboxId: string,
  client: GmailApi,
  names?: MailLabelNames
): Promise<EnsureLabelsResult> {
  const wanted = Object.values(names ?? (await getSetting('mail.label_names')))
  const existing = await client.labels.list()
  const byName = new Map(
    existing.filter((l) => l.name && l.id).map((l) => [l.name as string, l.id as string])
  )
  const created: string[] = []
  const adopted: string[] = []
  for (const name of wanted) {
    let id = byName.get(name)
    if (id) {
      adopted.push(name)
    } else {
      try {
        const label = await client.labels.create({ name })
        id = label.id ?? undefined
        created.push(name)
      } catch (error) {
        // Created by someone else between list and create: adopt it.
        if (httpStatusOf(error) !== 409) throw error
        const again = await client.labels.list()
        id = again.find((l) => l.name === name)?.id ?? undefined
        adopted.push(name)
      }
    }
    if (!id) continue
    await opsDb.gmailLabel.upsert({
      where: { mailboxId_name: { mailboxId, name } },
      create: { mailboxId, name, gmailLabelId: id },
      update: { gmailLabelId: id },
    })
  }
  return { created, adopted }
}

/** The Gmail label id for a label kind in a mailbox, or null if it was never provisioned. */
export async function labelIdFor(mailboxId: string, kind: MailLabelKey): Promise<string | null> {
  const names = await getSetting('mail.label_names')
  const row = await opsDb.gmailLabel.findUnique({
    where: { mailboxId_name: { mailboxId, name: names[kind] } },
    select: { gmailLabelId: true },
  })
  return row?.gmailLabelId ?? null
}
