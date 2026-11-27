import 'server-only'
import { lapsedCategories, reinstatedCategories, reinstateTo } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { z } from 'zod'
import type { OpsUser } from '../../lib/access-core'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { raiseNotification } from '../notify/raise'
import { recordSupplierFile, supplierFilePrefix, verifySupplierObject } from './document-files'

/**
 * Line card and commercial terms (S10-T06, board 52). Each save of the line card is versioned (version + 1 on every
 * row the save touches) with an activity diff; a supplier on trial gets trial line cards. Terms pre-fill every RFQ
 * and PO. Activation needs the Owner's decision (T05) and at least one active or trial line card. A lapsed covering
 * certificate suspends the categories it covers, and a valid replacement reinstates them (ops.reminders.documents).
 */
type Tx = Prisma.TransactionClient

export const lineCardEntrySchema = z.object({
  tradeId: z.uuid(),
  brand: z.string().trim().max(80).optional(),
  carried: z.boolean(),
  authorised: z.boolean().default(false),
  evidenceUrl: z.url().max(500).optional(),
  specNote: z.string().trim().max(300).optional(),
  coveredByDocumentIds: z.array(z.uuid()).max(10).default([]),
})
export type LineCardEntry = z.infer<typeof lineCardEntrySchema>

export async function saveLineCard(
  tx: Tx,
  supplierId: string,
  entries: readonly LineCardEntry[],
  user: Pick<OpsUser, 'id'>
): Promise<{ version: number }> {
  const profile = await tx.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { tier: true, onboardingStatus: true },
  })
  if (!profile) throw new SafeError('That supplier is no longer here.')
  const existing = await tx.supplierLineCard.findMany({
    where: { supplierId },
    select: {
      id: true,
      tradeId: true,
      brand: true,
      status: true,
      specNote: true,
      authorised: true,
      evidenceUrl: true,
      version: true,
      coveredByDocumentIds: true,
    },
  })
  const version = Math.max(0, ...existing.map((e) => e.version)) + 1
  const carriedStatus =
    profile.tier === 'trial' || profile.onboardingStatus === 'approved_trial'
      ? 'trial'
      : profile.onboardingStatus &&
          !['approved', 'approved_trial'].includes(profile.onboardingStatus)
        ? 'proposed'
        : 'active'
  const diff: Array<{ trade: string; before: unknown; after: unknown }> = []
  for (const e of entries) {
    const brand = e.brand || null
    const row = existing.find((x) => x.tradeId === e.tradeId && (x.brand ?? null) === brand)
    const status = e.carried
      ? row?.status === 'suspended'
        ? 'suspended'
        : carriedStatus
      : 'not_carried'
    const data = {
      status,
      authorised: e.authorised,
      evidenceUrl: e.evidenceUrl ?? null,
      ...(e.authorised && e.evidenceUrl && e.evidenceUrl !== row?.evidenceUrl
        ? { verifiedAt: new Date() }
        : {}),
      specNote: e.specNote || null,
      coveredByDocumentIds: e.coveredByDocumentIds,
      version,
    }
    if (row) {
      const before = {
        status: row.status,
        specNote: row.specNote,
        authorised: row.authorised,
        evidenceUrl: row.evidenceUrl,
      }
      const after = {
        status,
        specNote: data.specNote,
        authorised: data.authorised,
        evidenceUrl: data.evidenceUrl,
      }
      if (JSON.stringify(before) !== JSON.stringify(after))
        diff.push({ trade: e.tradeId, before, after })
      await tx.supplierLineCard.update({ where: { id: row.id }, data })
    } else {
      diff.push({ trade: e.tradeId, before: null, after: { status, brand } })
      await tx.supplierLineCard.create({ data: { supplierId, tradeId: e.tradeId, brand, ...data } })
    }
  }
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [
        {
          field: 'lineCard',
          before: { version: version - 1 },
          after: { version, changes: diff },
          kind: 'supplier',
        },
      ],
      note: `Line card version ${version}`,
    },
    async () => undefined
  )
  return { version }
}

export const termsSchema = z.object({
  usualIncoterm: z
    .enum(['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'])
    .optional(),
  usualIncotermPlace: z.string().trim().max(80).optional(),
  quotesCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  defaultPaymentTerms: z.string().trim().max(160).optional(),
  validityDays: z.number().int().min(1).max(365).optional(),
  leadTimeText: z.string().trim().max(80).optional(),
  moqText: z.string().trim().max(120).optional(),
  documentsWithPo: z.array(z.string().trim().min(1).max(60)).max(12).optional(),
  expectedReplyDays: z.number().int().min(1).max(60).optional(),
})
export type Terms = z.infer<typeof termsSchema>

export async function saveSupplierTerms(
  tx: Tx,
  supplierId: string,
  t: Terms,
  user: Pick<OpsUser, 'id'>
): Promise<void> {
  const before = await tx.supplierProfile.findUnique({ where: { companyId: supplierId } })
  if (!before) throw new SafeError('That supplier is no longer here.')
  const data = {
    usualIncoterm: t.usualIncoterm ?? null,
    usualIncotermPlace: t.usualIncotermPlace || null,
    quotesCurrency: t.quotesCurrency ?? before.quotesCurrency,
    defaultPaymentTerms: t.defaultPaymentTerms || null,
    validityDays: t.validityDays ?? null,
    leadTimeText: t.leadTimeText || null,
    moqText: t.moqText || null,
    documentsWithPo: t.documentsWithPo ?? [],
    expectedReplyDays: t.expectedReplyDays ?? null,
  }
  const b = before as unknown as Record<string, unknown>
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: Object.entries(data).map(([field, after]) => ({
        field: `terms.${field}`,
        before: b[field] ?? null,
        after,
        kind: 'terms' as const,
      })),
    },
    (x) =>
      x.supplierProfile.update({
        where: { companyId: supplierId },
        data: { ...data, version: { increment: 1 } },
      })
  )
}

/** Record an uploaded price list (verified like every supplier file; parsing it is a later sprint). */
export async function recordPriceList(
  supplierId: string,
  upload: { key: string; filename: string },
  user: Pick<OpsUser, 'id'>
) {
  const v = await verifySupplierObject(
    supplierFilePrefix(supplierId, 'price-list'),
    upload.key,
    upload.filename
  )
  return opsDb.$transaction(async (tx) => {
    const fileId = await recordSupplierFile(tx, v, upload.filename, 'upload', user.id)
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: user.id },
        subjectType: 'company',
        subjectId: supplierId,
        changes: [{ field: 'priceListFileId', before: null, after: fileId, kind: 'documents' }],
      },
      (t) =>
        t.supplierProfile.update({
          where: { companyId: supplierId },
          data: { priceListFileId: fileId },
        })
    )
    return { fileId }
  })
}

/** Board 52 "Activate supplier": after the Owner's decision and with at least one active or trial line card. */
export async function activateSupplier(
  tx: Tx,
  supplierId: string,
  user: Pick<OpsUser, 'id'>
): Promise<{ categories: number }> {
  const p = await tx.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { onboardingStatus: true, tier: true },
  })
  if (!p) throw new SafeError('That supplier is no longer here.')
  if (!['approved', 'approved_trial'].includes(p.onboardingStatus ?? ''))
    throw new SafeError('Krishan approves the supplier first (Vetting and approval).')
  const cards = await tx.supplierLineCard.findMany({
    where: { supplierId, status: { in: ['proposed', 'trial', 'active'] } },
    select: { id: true, status: true },
  })
  if (!cards.length) throw new SafeError('Tick at least one category the supplier carries.')
  const to = p.onboardingStatus === 'approved_trial' ? 'trial' : 'active'
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: supplierId,
      changes: [
        {
          field: 'lineCard.activated',
          before: null,
          after: { categories: cards.length, status: to },
          kind: 'supplier',
        },
      ],
      note: `Activated with ${cards.length} categor${cards.length === 1 ? 'y' : 'ies'}`,
    },
    (t) =>
      t.supplierLineCard.updateMany({
        where: { id: { in: cards.map((c) => c.id) }, status: 'proposed' },
        data: { status: to },
      })
  )
  return { categories: cards.length }
}

/**
 * ops.reminders.documents step "suspend-lapsed" (and the reverse): one page of suppliers with usable or suspended
 * line cards, the documents those cards name, then suspend what lapsed and reinstate what a valid document covers.
 */
export async function suspendLapsedPage(cursor: string, today: Date, limit = 500) {
  const cards = await opsDb.supplierLineCard.findMany({
    where: {
      coveredByDocumentIds: { isEmpty: false },
      status: { in: ['active', 'trial', 'suspended'] },
      ...(cursor ? { id: { gt: cursor } } : {}),
    },
    orderBy: { id: 'asc' },
    take: limit,
    select: {
      id: true,
      supplierId: true,
      tradeId: true,
      brand: true,
      status: true,
      coveredByDocumentIds: true,
      trade: { select: { name: true } },
      supplier: { select: { name: true, supplierProfile: { select: { tier: true } } } },
    },
  })
  const docIds = [...new Set(cards.flatMap((c) => c.coveredByDocumentIds))]
  const docs = await opsDb.complianceDocument.findMany({
    where: { id: { in: docIds } },
    select: { id: true, expiresAt: true, archivedAt: true, title: true },
  })
  const lapsed = lapsedCategories(cards, docs, today)
  const back = reinstatedCategories(cards, docs, today)
  for (const c of lapsed) {
    const card = cards.find((x) => x.id === c.id)!
    const doc = docs.find((d) => card.coveredByDocumentIds.includes(d.id))
    const reason = `Suspended: ${doc?.title ?? 'certificate'} expired ${doc?.expiresAt?.toISOString().slice(0, 10) ?? ''}`
    await opsDb.$transaction((tx) =>
      writeTracked(
        tx,
        {
          actor: { kind: 'system' },
          subjectType: 'company',
          subjectId: card.supplierId,
          changes: [
            {
              field: `lineCard.${card.trade?.name ?? card.brand}`,
              before: card.status,
              after: 'suspended',
              kind: 'supplier',
            },
          ],
          note: reason,
        },
        (t) =>
          t.supplierLineCard.update({
            where: { id: card.id },
            data: { status: 'suspended', suspendedReason: reason },
          })
      )
    )
    await raiseNotification({
      event: 'document_expiring',
      severity: 'warning',
      title: `${card.supplier.name}: ${card.trade?.name ?? card.brand} suspended`,
      body: reason,
      dedupeKey: `line-card-suspended:${card.id}:${doc?.id ?? ''}`,
      subjectType: 'company',
      subjectId: card.supplierId,
      audience: 'all',
    })
  }
  for (const c of back) {
    const card = cards.find((x) => x.id === c.id)!
    const to = reinstateTo(card.supplier.supplierProfile?.tier ?? 'approved')
    await opsDb.$transaction((tx) =>
      writeTracked(
        tx,
        {
          actor: { kind: 'system' },
          subjectType: 'company',
          subjectId: card.supplierId,
          changes: [
            {
              field: `lineCard.${card.trade?.name ?? card.brand}`,
              before: 'suspended',
              after: to,
              kind: 'supplier',
            },
          ],
          note: 'Reinstated: a valid certificate covers it again',
        },
        (t) =>
          t.supplierLineCard.update({
            where: { id: card.id },
            data: { status: to, suspendedReason: null },
          })
      )
    )
  }
  return {
    suspended: lapsed.length,
    reinstated: back.length,
    nextCursor: cards.length === limit ? cards[cards.length - 1]!.id : null,
  }
}
