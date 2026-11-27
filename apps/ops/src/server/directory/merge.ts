import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access-core'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import type { Tx } from './company'

/**
 * Merge two companies (S10-T01, board 133 state 2 "Also known as … · combined <date>"). One transaction moves
 * everything that points at the merged company onto the survivor, unions domains and aliases, sets mergedIntoId, and
 * writes one activity row on each company with a JSON snapshot of every moved id (the S31 undo reads it).
 *
 * Rows that cannot move because the survivor already has the same unique key (the same RFQ recipient, the same
 * line card, the same supplier ref …) stay on the merged company and are listed in `kept`; the merged company stays
 * readable through mergedFrom. supplier_approval is insert-only and is never moved: decisions keep their company.
 * Bank accounts move as they are and are never verified by a merge.
 */

type Delegate = {
  findMany(args: unknown): Promise<Array<Record<string, unknown>>>
  updateMany(args: unknown): Promise<{ count: number }>
}

/** Simple moves: model delegate → the column that points at the company. */
const SIMPLE: ReadonlyArray<readonly [keyof Tx & string, string]> = [
  ['supplierBankAccount', 'supplierId'],
  ['complianceDocument', 'companyId'],
  ['screeningCheck', 'companyId'],
  ['lesson', 'companyId'],
  ['preference', 'companyId'],
  ['preferenceSignal', 'companyId'],
  ['lead', 'companyId'],
  ['enquiry', 'clientId'],
  ['researchCandidate', 'companyId'],
  ['freightRateCard', 'forwarderId'],
  ['quotation', 'clientId'],
  ['order', 'clientId'],
  ['supplierPo', 'supplierId'],
  ['freightQuote', 'forwarderId'],
  ['shipment', 'forwarderId'],
  ['claimParty', 'companyId'],
  ['clientInvoice', 'clientId'],
  ['paymentReceived', 'clientId'],
  ['supplierInvoice', 'supplierId'],
  ['supplierPayment', 'supplierId'],
  ['intakeBatch', 'clientCompanyId'],
  ['outboundEmail', 'companyId'],
  ['document', 'companyId'],
  ['tenderQuery', 'fromSupplierId'],
  ['supplierDocumentRequest', 'supplierId'],
]

/** Moves with a unique key that includes the company column: the other columns of that key. */
const UNIQUE: ReadonlyArray<readonly [keyof Tx & string, string, readonly string[]]> = [
  ['supplierRfqRecipient', 'supplierId', ['rfqId']],
  ['supplierQuote', 'supplierId', ['supplierRef', 'version']],
  ['approvedMake', 'buyerId', ['commodity', 'make']],
  ['clientColumnMapping', 'companyId', ['fileSignature']],
]

/** Every table a contact id is written to, with its column. */
const CONTACT_REFS: ReadonlyArray<readonly [keyof Tx & string, string]> = [
  ['enquiry', 'contactId'],
  ['lead', 'contactId'],
  ['supplierRfqRecipient', 'contactId'],
  ['quotation', 'attentionId'],
  ['order', 'contactId'],
  ['supplierPo', 'contactId'],
  ['outboundEmail', 'contactId'],
  ['intakeBatch', 'contactId'],
  ['supplierDocumentRequest', 'contactId'],
]

function delegate(tx: Tx, name: string): Delegate {
  return (tx as unknown as Record<string, Delegate>)[name]!
}

export interface MergeResult {
  survivorId: string
  mergedId: string
  moved: Record<string, string[]>
  kept: Record<string, string[]>
  contactsMerged: number
}

/** Who may merge: Owner or Helper; Owner only when either company has a verified bank account. */
export async function assertCanMerge(
  db: Pick<Tx, 'supplierBankAccount'>,
  ids: string[],
  user: Pick<OpsUser, 'role'>
): Promise<void> {
  if (user.role === 'owner') return
  const verified = await db.supplierBankAccount.count({
    where: { supplierId: { in: ids }, status: 'verified', supersededAt: null },
  })
  if (verified > 0)
    throw new SafeError('Only Krishan can merge a supplier with verified bank details.')
}

export async function mergeCompanies(
  tx: Tx,
  survivorId: string,
  mergedId: string,
  user: Pick<OpsUser, 'id' | 'role'>
): Promise<MergeResult> {
  if (survivorId === mergedId) throw new SafeError('Choose two different companies.')
  const [survivor, merged] = await Promise.all(
    [survivorId, mergedId].map((id) =>
      tx.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          domains: true,
          aliases: true,
          primaryDomain: true,
          isClient: true,
          isSupplier: true,
          mergedIntoId: true,
          archivedAt: true,
          clientProfile: { select: { companyId: true } },
          supplierProfile: { select: { companyId: true, tier: true } },
        },
      })
    )
  )
  if (!survivor || !merged) throw new SafeError('One of the companies is no longer here.')
  if (survivor.mergedIntoId || merged.mergedIntoId)
    throw new SafeError('One of the companies was already merged into another.')
  await assertCanMerge(tx, [survivorId, mergedId], user)

  const moved: Record<string, string[]> = {}
  const kept: Record<string, string[]> = {}
  const add = (bag: Record<string, string[]>, k: string, ids: string[]) => {
    if (ids.length) bag[k] = [...(bag[k] ?? []), ...ids]
  }

  // 1 Contacts: a contact whose address the survivor already has is folded into the survivor's contact.
  const survivorContacts = await tx.contact.findMany({
    where: { companyId: survivorId, archivedAt: null, email: { not: null } },
    select: { id: true, email: true },
  })
  const byEmail = new Map(survivorContacts.map((c) => [c.email!.toLowerCase(), c.id]))
  const mergedContacts = await tx.contact.findMany({
    where: { companyId: mergedId },
    select: { id: true, email: true, archivedAt: true },
  })
  let contactsMerged = 0
  for (const c of mergedContacts) {
    const twin = c.email && !c.archivedAt ? byEmail.get(c.email.toLowerCase()) : undefined
    if (twin) {
      for (const [model, col] of CONTACT_REFS) {
        const d = delegate(tx, model)
        const rows = await d.findMany({ where: { [col]: c.id }, select: { id: true } })
        if (rows.length) {
          await d.updateMany({ where: { [col]: c.id }, data: { [col]: twin } })
          add(
            moved,
            `${model}.${col}`,
            rows.map((r) => String(r.id))
          )
        }
      }
      await tx.contact.update({
        where: { id: c.id },
        data: { archivedAt: new Date(), isPreferred: false },
      })
      add(moved, 'contact.foldedInto', [`${c.id}>${twin}`])
      contactsMerged++
    }
  }
  const movable = mergedContacts.filter(
    (c) => !moved['contact.foldedInto']?.some((x) => x.startsWith(c.id))
  )
  if (movable.length) {
    await tx.contact.updateMany({
      where: { id: { in: movable.map((c) => c.id) } },
      data: { companyId: survivorId },
    })
    add(
      moved,
      'contact.companyId',
      movable.map((c) => c.id)
    )
  }

  // 2 Simple moves.
  for (const [model, col] of SIMPLE) {
    const d = delegate(tx, model)
    const rows = await d.findMany({ where: { [col]: mergedId }, select: { id: true } })
    if (!rows.length) continue
    await d.updateMany({ where: { [col]: mergedId }, data: { [col]: survivorId } })
    add(
      moved,
      `${model}.${col}`,
      rows.map((r) => String(r.id))
    )
  }

  // 3 Moves with a unique key: a row the survivor already has stays.
  for (const [model, col, others] of UNIQUE) {
    const d = delegate(tx, model)
    const select = Object.fromEntries([['id', true], ...others.map((o) => [o, true])])
    const [mine, theirs] = await Promise.all([
      d.findMany({ where: { [col]: survivorId }, select }),
      d.findMany({ where: { [col]: mergedId }, select }),
    ])
    const key = (r: Record<string, unknown>) => others.map((o) => JSON.stringify(r[o] ?? null)).join('\u0001')
    const taken = new Set(mine.map(key))
    const ok = theirs.filter((r) => !taken.has(key(r)))
    const clash = theirs.filter((r) => taken.has(key(r)))
    if (ok.length) {
      await d.updateMany({
        where: { id: { in: ok.map((r) => r.id) } },
        data: { [col]: survivorId },
      })
      add(
        moved,
        `${model}.${col}`,
        ok.map((r) => String(r.id))
      )
    }
    add(
      kept,
      `${model}.${col}`,
      clash.map((r) => String(r.id))
    )
  }

  // 4 Line cards: union; a card the survivor has gains the evidence it lacked, the merged twin is removed.
  const [myCards, theirCards] = await Promise.all(
    [survivorId, mergedId].map((id) =>
      tx.supplierLineCard.findMany({
        where: { supplierId: id },
        select: {
          id: true,
          tradeId: true,
          brand: true,
          evidenceUrl: true,
          authorised: true,
          verifiedAt: true,
        },
      })
    )
  )
  const cardKey = (c: { tradeId: string | null; brand: string | null }) =>
    `${c.tradeId}|${(c.brand ?? '').toLowerCase()}`
  const mine = new Map(myCards!.map((c) => [cardKey(c), c]))
  for (const c of theirCards!) {
    const twin = mine.get(cardKey(c))
    if (!twin) {
      await tx.supplierLineCard.update({ where: { id: c.id }, data: { supplierId: survivorId } })
      add(moved, 'supplierLineCard.supplierId', [c.id])
      continue
    }
    if (!twin.evidenceUrl && c.evidenceUrl)
      await tx.supplierLineCard.update({
        where: { id: twin.id },
        data: {
          evidenceUrl: c.evidenceUrl,
          authorised: twin.authorised || c.authorised,
          verifiedAt: twin.verifiedAt ?? c.verifiedAt,
        },
      })
    await tx.supplierLineCard.delete({ where: { id: c.id } })
    add(moved, 'supplierLineCard.foldedInto', [`${c.id}>${twin.id}`])
  }

  // 5 Mail links on the company itself.
  const links = await tx.mailLink.findMany({
    where: { subjectType: 'company', subjectId: mergedId, removedAt: null },
    select: { id: true, messageId: true },
  })
  if (links.length) {
    const already = new Set(
      (
        await tx.mailLink.findMany({
          where: {
            subjectType: 'company',
            subjectId: survivorId,
            messageId: { in: links.map((l) => l.messageId) },
          },
          select: { messageId: true },
        })
      ).map((l) => l.messageId)
    )
    const ok = links.filter((l) => !already.has(l.messageId))
    if (ok.length) {
      await tx.mailLink.updateMany({
        where: { id: { in: ok.map((l) => l.id) } },
        data: { subjectId: survivorId },
      })
      add(
        moved,
        'mailLink.subjectId',
        ok.map((l) => l.id)
      )
    }
    add(
      kept,
      'mailLink.subjectId',
      links.filter((l) => already.has(l.messageId)).map((l) => l.id)
    )
  }

  // 6 Profiles: a role the survivor lacks takes the merged company's profile row.
  if (!survivor.clientProfile && merged.clientProfile) {
    await tx.clientProfile.update({
      where: { companyId: mergedId },
      data: { companyId: survivorId },
    })
    add(moved, 'clientProfile.companyId', [mergedId])
  }
  if (!survivor.supplierProfile && merged.supplierProfile) {
    await tx.supplierProfile.update({
      where: { companyId: mergedId },
      data: { companyId: survivorId },
    })
    add(moved, 'supplierProfile.companyId', [mergedId])
  }

  // 7 The company rows.
  const domains = [...new Set([...survivor.domains, ...merged.domains])]
  const aliases = [
    ...new Set(
      [...survivor.aliases, merged.name, ...merged.aliases].filter((a) => a && a !== survivor.name)
    ),
  ]
  const snapshot = {
    survivorBefore: {
      domains: survivor.domains,
      aliases: survivor.aliases,
      isClient: survivor.isClient,
      isSupplier: survivor.isSupplier,
    },
    moved,
    kept,
  } as unknown as Prisma.InputJsonValue
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: survivorId,
      changes: [
        {
          field: 'merge',
          before: snapshot,
          after: { mergedId, mergedName: merged.name },
          kind: 'link',
        },
        { field: 'domains', before: survivor.domains, after: domains, kind: 'contact' },
        { field: 'aliases', before: survivor.aliases, after: aliases, kind: 'contact' },
      ],
      note: `Combined with ${merged.name}`,
    },
    (t) =>
      t.company.update({
        where: { id: survivorId },
        data: {
          domains,
          aliases,
          primaryDomain: survivor.primaryDomain ?? merged.primaryDomain,
          isClient: survivor.isClient || merged.isClient,
          isSupplier: survivor.isSupplier || merged.isSupplier,
        },
      })
  )
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: mergedId,
      changes: [{ field: 'mergedIntoId', before: null, after: survivorId, kind: 'link' }],
      note: `Combined into ${survivor.name}`,
    },
    (t) =>
      t.company.update({
        where: { id: mergedId },
        data: { mergedIntoId: survivorId, domains: [], primaryDomain: null },
      })
  )
  return { survivorId, mergedId, moved, kept, contactsMerged }
}

export function mergeCompaniesNow(
  survivorId: string,
  mergedId: string,
  user: Pick<OpsUser, 'id' | 'role'>
) {
  return opsDb.$transaction((tx) => mergeCompanies(tx, survivorId, mergedId, user), {
    maxWait: 20_000,
    timeout: 30_000,
  })
}
