import 'server-only'
import {
  contactRefusal,
  isSendableContact,
  pickSendableContact,
  type ContactRefusal,
} from '@indus/ops-core'
import type { $Enums } from '@indus/ops-db'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import type { Actor, Tx } from './company'

/**
 * Contacts (S10-T01). At most one live contact per address per company (partial unique index); a contact found only
 * in a directory (`directory_only`) is kept for reference and never receives mail (send gate, ADR-07).
 */
export { contactRefusal, isSendableContact, pickSendableContact, type ContactRefusal }

export interface UpsertContactInput {
  companyId: string
  email?: string | null
  name?: string | null
  phone?: string | null
  role?: string | null
  salutation?: string | null
  sourceKind: $Enums.ContactSourceKind
  sourceUrl?: string | null
  isPreferred?: boolean
}

const SELECT = {
  id: true,
  name: true,
  firstName: true,
  email: true,
  phone: true,
  role: true,
  salutation: true,
  sourceKind: true,
  sourceUrl: true,
  isPreferred: true,
} as const

/** A stronger source replaces a weaker one; a directory listing never downgrades a verified contact. */
const SOURCE_RANK: Record<$Enums.ContactSourceKind, number> = {
  directory_only: 0,
  website_form: 1,
  history_import: 2,
  email_signature: 3,
  email_header: 4,
  verified_on_page: 5,
  manual: 6,
}

export async function upsertContact(
  tx: Tx,
  i: UpsertContactInput,
  actor: Actor
): Promise<{ id: string; created: boolean }> {
  const email = i.email?.trim().toLowerCase() || null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new SafeError('That email address does not look right.')
  if (!email && !i.name?.trim() && !i.phone?.trim())
    throw new SafeError('Give the contact a name, an email or a phone number.')
  if (i.sourceKind === 'verified_on_page' && !i.sourceUrl)
    throw new SafeError('A contact verified on a page needs the page address.')

  const existing = email
    ? await tx.contact.findFirst({
        where: {
          companyId: i.companyId,
          email: { equals: email, mode: 'insensitive' },
          archivedAt: null,
        },
        select: SELECT,
      })
    : null
  const name = i.name?.trim() || null
  const firstName = name ? (name.split(/\s+/)[0] ?? null) : null

  if (!existing) {
    const created = await tx.contact.create({
      data: {
        companyId: i.companyId,
        email,
        name,
        firstName,
        phone: i.phone?.trim() || null,
        role: i.role?.trim() || null,
        salutation: i.salutation?.trim() || null,
        sourceKind: i.sourceKind,
        sourceUrl: i.sourceUrl ?? null,
        verifiedAt: i.sourceKind === 'verified_on_page' ? new Date() : null,
        isPreferred: !!i.isPreferred,
      },
      select: { id: true },
    })
    await writeTracked(
      tx,
      {
        actor: { kind: actor.kind, id: actor.id ?? null },
        actionId: actor.actionId ?? null,
        subjectType: 'company',
        subjectId: i.companyId,
        changes: [
          {
            field: 'contact',
            before: null,
            after: { id: created.id, email, name },
            kind: 'contact',
          },
        ],
        note: 'Contact added',
      },
      async () => undefined
    )
    if (i.isPreferred) await setPreferred(tx, created.id, actor)
    return { id: created.id, created: true }
  }

  const stronger = SOURCE_RANK[i.sourceKind] >= SOURCE_RANK[existing.sourceKind]
  const data = {
    ...(name && name !== existing.name ? { name, firstName } : {}),
    ...(i.phone?.trim() && i.phone.trim() !== existing.phone ? { phone: i.phone.trim() } : {}),
    ...(i.role?.trim() && i.role.trim() !== existing.role ? { role: i.role.trim() } : {}),
    ...(i.salutation?.trim() && i.salutation.trim() !== existing.salutation
      ? { salutation: i.salutation.trim() }
      : {}),
    ...(stronger && i.sourceKind !== existing.sourceKind
      ? {
          sourceKind: i.sourceKind,
          sourceUrl: i.sourceUrl ?? existing.sourceUrl,
          ...(i.sourceKind === 'verified_on_page' ? { verifiedAt: new Date() } : {}),
        }
      : {}),
  }
  const ex = existing as unknown as Record<string, unknown>
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      actionId: actor.actionId ?? null,
      subjectType: 'contact',
      subjectId: existing.id,
      changes: Object.entries(data)
        .filter(([k]) => k !== 'firstName' && k !== 'verifiedAt')
        .map(([field, after]) => ({
          field,
          before: ex[field] ?? null,
          after,
          kind: 'contact' as const,
        })),
    },
    (t) =>
      Object.keys(data).length
        ? t.contact.update({ where: { id: existing.id }, data })
        : Promise.resolve(null)
  )
  if (i.isPreferred && !existing.isPreferred) await setPreferred(tx, existing.id, actor)
  return { id: existing.id, created: false }
}

async function one(tx: Tx, id: string) {
  const c = await tx.contact.findUnique({
    where: { id },
    select: {
      id: true,
      companyId: true,
      status: true,
      bouncedAt: true,
      outOfOfficeUntil: true,
      isPreferred: true,
      archivedAt: true,
      role: true,
    },
  })
  if (!c) throw new SafeError('That contact is no longer here.')
  return c
}

export async function markBounced(
  tx: Tx,
  id: string,
  actor: Actor,
  at = new Date()
): Promise<void> {
  const c = await one(tx, id)
  if (c.status === 'bouncing') return
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      actionId: actor.actionId ?? null,
      subjectType: 'contact',
      subjectId: id,
      changes: [{ field: 'status', before: c.status, after: 'bouncing', kind: 'contact' }],
      note: 'Bouncing: removed from RFQs',
    },
    (t) => t.contact.update({ where: { id }, data: { status: 'bouncing', bouncedAt: at } })
  )
}

export async function setOutOfOffice(
  tx: Tx,
  id: string,
  until: Date | null,
  actor: Actor
): Promise<void> {
  const c = await one(tx, id)
  const day = until ? until.toISOString().slice(0, 10) : null
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      actionId: actor.actionId ?? null,
      subjectType: 'contact',
      subjectId: id,
      changes: [
        {
          field: 'outOfOfficeUntil',
          before: c.outOfOfficeUntil ? c.outOfOfficeUntil.toISOString().slice(0, 10) : null,
          after: day,
          kind: 'contact',
        },
      ],
    },
    (t) => t.contact.update({ where: { id }, data: { outOfOfficeUntil: until } })
  )
}

/** One preferred contact per company and role: setting one clears the others in that role. */
export async function setPreferred(tx: Tx, id: string, actor: Actor): Promise<void> {
  const c = await one(tx, id)
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      subjectType: 'contact',
      subjectId: id,
      changes: [{ field: 'isPreferred', before: c.isPreferred, after: true, kind: 'contact' }],
    },
    async (t) => {
      await t.contact.updateMany({
        where: { companyId: c.companyId, role: c.role, id: { not: id }, isPreferred: true },
        data: { isPreferred: false },
      })
      await t.contact.update({ where: { id }, data: { isPreferred: true } })
    }
  )
}

export async function archiveContact(tx: Tx, id: string, actor: Actor): Promise<void> {
  const c = await one(tx, id)
  if (c.archivedAt) return
  await writeTracked(
    tx,
    {
      actor: { kind: actor.kind, id: actor.id ?? null },
      subjectType: 'contact',
      subjectId: id,
      changes: [
        { field: 'archivedAt', before: null, after: new Date().toISOString(), kind: 'contact' },
      ],
    },
    (t) => t.contact.update({ where: { id }, data: { archivedAt: new Date(), isPreferred: false } })
  )
}

/** The sendable contact of a company for these roles (Quality, then Sales …), or null. */
export async function sendableContactOf(
  tx: Pick<Tx, 'contact'>,
  companyId: string,
  roles: readonly string[] = []
) {
  const contacts = await tx.contact.findMany({
    where: { companyId, archivedAt: null },
    select: {
      id: true,
      name: true,
      firstName: true,
      salutation: true,
      email: true,
      role: true,
      isPreferred: true,
      sourceKind: true,
      status: true,
      archivedAt: true,
      bouncedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })
  return pickSendableContact(contacts, roles)
}
