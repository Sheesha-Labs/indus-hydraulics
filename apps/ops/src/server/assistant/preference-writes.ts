import 'server-only'
import { lintPreferenceText } from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access-core'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'

/**
 * Board 115 writes (S07-T05, D18, D19). The Owner edits, switches off, removes and adds preferences and picks the
 * tone samples; every text is linted (never levels, approvals, checks, sending or money). The Helper may add and
 * remove phrases for purchase@ only (D19, flagged for sign-off). Each returns what the activity_event records.
 */
type Tx = Prisma.TransactionClient
type Who = Pick<OpsUser, 'id' | 'role'>

function owner(user: Who): void {
  if (user.role !== 'owner') throw new SafeError(SAFE_MESSAGES.forbidden)
}
function lint(text: string): void {
  const why = lintPreferenceText(text)
  if (why) throw new SafeError(why)
}

export async function editPreference(
  tx: Tx,
  input: { id: string; description: string },
  user: Who
) {
  owner(user)
  lint(input.description)
  const before = await tx.preference.findUnique({
    where: { id: input.id },
    select: { description: true },
  })
  if (!before) throw new SafeError(SAFE_MESSAGES.gone)
  await tx.preference.update({ where: { id: input.id }, data: { description: input.description } })
  return { id: input.id, before: before.description, after: input.description }
}

export async function togglePreference(
  tx: Tx,
  input: { id: string; enabled: boolean },
  user: Who,
  now = new Date()
) {
  owner(user)
  const row = await tx.preference.findUnique({
    where: { id: input.id },
    select: { description: true },
  })
  if (!row) throw new SafeError(SAFE_MESSAGES.gone)
  await tx.preference.update({
    where: { id: input.id },
    data: { disabledAt: input.enabled ? null : now },
  })
  return { id: input.id, description: row.description, enabled: input.enabled }
}

export async function removePreference(tx: Tx, input: { id: string }, user: Who) {
  const row = await tx.preference.findUnique({
    where: { id: input.id },
    select: { description: true, kind: true, mailboxId: true, value: true },
  })
  if (!row) throw new SafeError(SAFE_MESSAGES.gone)
  if (user.role !== 'owner') {
    // D19: the Helper removes only phrases scoped to purchase@.
    const purchase = await tx.mailbox.findFirst({
      where: { role: 'supplier' },
      select: { id: true },
    })
    const phrase = row.kind === 'phrase_use' || row.kind === 'phrase_avoid'
    if (!phrase || !purchase || row.mailboxId !== purchase.id)
      throw new SafeError(SAFE_MESSAGES.forbidden)
  }
  await tx.preference.delete({ where: { id: input.id } })
  return { id: input.id, description: row.description, value: row.value }
}

export async function addRule(
  tx: Tx,
  input: {
    description: string
    scope: 'global' | 'client' | 'supplier'
    companyId?: string | null | undefined
  },
  user: Who
) {
  owner(user)
  lint(input.description)
  if (input.scope !== 'global' && !input.companyId)
    throw new SafeError('Choose the client or supplier.')
  const row = await tx.preference.create({
    data: {
      scope: input.scope,
      kind: 'other',
      description: input.description,
      value: { note: input.description },
      source: 'manual',
      createdFrom: 'manual',
      strength: 1,
      companyId: input.scope === 'global' ? null : (input.companyId ?? null),
      createdById: user.id,
    },
    select: { id: true },
  })
  return { id: row.id, description: input.description }
}

export async function pickToneSamples(tx: Tx, input: { messageIds: string[] }, user: Who) {
  owner(user)
  if (input.messageIds.length > 3) throw new SafeError('Choose at most three messages.')
  const messages = await tx.mailMessage.findMany({
    where: { id: { in: input.messageIds }, direction: 'outbound' },
    select: { id: true, subject: true, toAddresses: true, sentAt: true, mailboxId: true },
  })
  if (messages.length !== input.messageIds.length) throw new SafeError(SAFE_MESSAGES.gone)
  await tx.preference.updateMany({
    where: { kind: 'tone_sample', active: true },
    data: { active: false },
  })
  for (const m of messages) {
    await tx.preference.create({
      data: {
        scope: 'mailbox',
        kind: 'tone_sample',
        mailboxId: m.mailboxId,
        description: `Tone sample: ${m.subject ?? '(no subject)'}`,
        value: {
          messageId: m.id,
          subject: m.subject ?? '(no subject)',
          to: m.toAddresses[0] ?? '',
          date: m.sentAt.toISOString().slice(0, 10),
        },
        source: 'manual',
        createdFrom: 'manual',
        createdById: user.id,
      },
    })
  }
  return { messageIds: messages.map((m) => m.id) }
}

export async function addPhrase(
  tx: Tx,
  input: { phrase: string; kind: 'phrase_use' | 'phrase_avoid' },
  user: Who
) {
  lint(input.phrase)
  let mailboxId: string | null = null
  if (user.role !== 'owner') {
    const purchase = await tx.mailbox.findFirst({
      where: { role: 'supplier' },
      select: { id: true },
    })
    if (!purchase) throw new SafeError(SAFE_MESSAGES.forbidden)
    mailboxId = purchase.id
  }
  const row = await tx.preference.create({
    data: {
      scope: mailboxId ? 'mailbox' : 'global',
      kind: input.kind,
      mailboxId,
      description: `${input.kind === 'phrase_use' ? 'Use' : 'Avoid'}: “${input.phrase}”`,
      value: { phrase: input.phrase },
      source: 'manual',
      createdFrom: 'manual',
      createdById: user.id,
    },
    select: { id: true },
  })
  return { id: row.id, phrase: input.phrase, kind: input.kind, mailboxId }
}
