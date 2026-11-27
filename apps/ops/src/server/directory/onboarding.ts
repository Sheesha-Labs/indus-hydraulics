import 'server-only'
import {
  isSelectableSupplier,
  NOT_SELECTABLE,
  REQUIRED_DOC_KINDS,
  requiredDocuments,
  type RequiredRow,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { z } from 'zod'
import type { OpsUser } from '../../lib/access-core'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { cleanDomains, createCompany, type Tx } from './company'
import { upsertContact } from './contact'
import { recordSupplierFile, supplierFilePrefix, verifySupplierObject } from './document-files'

/**
 * New-supplier onboarding (S10-T04, board 50): a company with the supplier role and onboardingStatus 'draft', the
 * company step, contacts (Sales, Accounts, Quality), the nine documents, and the one predicate every RFQ, research
 * and PO selector uses. Until approval a draft is visible in the Proposed view only and cannot be selected.
 */

export { isSelectableSupplier }

/** The Prisma filter for "may be chosen": S12 (RFQ recipients), S13 (research shortlists), S24 (POs) use it. */
export const SELECTABLE_SUPPLIER_WHERE: Prisma.CompanyWhereInput = {
  isSupplier: true,
  archivedAt: null,
  mergedIntoId: null,
  supplierProfile: {
    tier: { not: 'blocked' },
    OR: [{ onboardingStatus: null }, { onboardingStatus: { notIn: [...NOT_SELECTABLE] } }],
  },
}

/** Throws a safe sentence when this supplier may not be chosen (a selector's last check). */
export async function assertSelectableSupplier(
  supplierId: string,
  db: Pick<Prisma.TransactionClient, 'supplierProfile'> = opsDb
): Promise<void> {
  const p = await db.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { tier: true, onboardingStatus: true, company: { select: { name: true } } },
  })
  if (!p) throw new SafeError('That supplier is no longer here.')
  if (!isSelectableSupplier(p))
    throw new SafeError(
      p.tier === 'blocked'
        ? `${p.company.name} is blocked and cannot be chosen.`
        : `${p.company.name} is still being set up and cannot be chosen until it is approved.`
    )
}

export const companyStepSchema = z.object({
  legalName: z.string().trim().min(1, 'Write the legal name.').max(200),
  country: z.string().regex(/^[A-Za-z]{2}$/, 'Use a two-letter country code, e.g. TR.'),
  address: z.string().trim().max(400).optional(),
  website: z.string().trim().max(200).optional(),
  registryNo: z.string().trim().max(80).optional(),
  taxId: z.string().trim().max(80).optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
  staffCount: z.number().int().min(0).max(10_000_000).optional(),
  introducedBy: z.string().trim().max(120).optional(),
  quoteCurrencies: z
    .array(z.string().regex(/^[A-Z]{3}$/))
    .max(6)
    .optional(),
  type: z
    .enum([
      'manufacturer',
      'principal',
      'oem',
      'distributor',
      'stockist',
      'trader',
      'local_shop',
      'marketplace',
    ])
    .optional(),
})
export type CompanyStep = z.infer<typeof companyStepSchema>

export const contactStepSchema = z.object({
  role: z.enum(['Sales', 'Accounts', 'Quality']),
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(40).optional(),
})

/** Board 50 · Save draft on the company step for a new supplier: the company and its draft profile. */
export async function createSupplierDraft(
  tx: Tx,
  step: CompanyStep,
  user: Pick<OpsUser, 'id'>
): Promise<{ id: string }> {
  const c = await createCompany(
    tx,
    {
      name: step.legalName,
      legalName: step.legalName,
      roles: { supplier: true },
      country: step.country,
      website: step.website ?? null,
      domains: step.website ? [step.website] : [],
      source: 'manual',
      ...(step.type ? { supplierType: step.type } : {}),
    },
    { kind: 'user', id: user.id }
  )
  await tx.supplierProfile.update({
    where: { companyId: c.id },
    data: {
      onboardingStatus: 'draft',
      proposedById: user.id,
      proposedAt: new Date(),
      address: step.address || null,
      registryNo: step.registryNo || null,
      taxId: step.taxId || null,
      foundedYear: step.foundedYear ?? null,
      staffCount: step.staffCount ?? null,
      introducedBy: step.introducedBy || null,
      quoteCurrencies: step.quoteCurrencies ?? [],
      quotesCurrency: step.quoteCurrencies?.[0] ?? null,
    },
  })
  return c
}

async function draftProfile(tx: Tx, id: string) {
  const p = await tx.supplierProfile.findUnique({
    where: { companyId: id },
    select: { onboardingStatus: true, version: true },
  })
  if (!p) throw new SafeError('That supplier is no longer here.')
  return p
}

/** The company step again on an existing draft (version-checked); facts are logged field by field. */
export async function updateSupplierDraft(
  tx: Tx,
  id: string,
  step: CompanyStep,
  user: Pick<OpsUser, 'id'>,
  expectedVersion?: number
): Promise<void> {
  const p = await draftProfile(tx, id)
  if (expectedVersion !== undefined && p.version !== expectedVersion)
    throw new SafeError('Someone changed this supplier a moment ago. Reload to see the latest.')
  const before = await tx.company.findUniqueOrThrow({
    where: { id },
    select: {
      name: true,
      legalName: true,
      country: true,
      website: true,
      domains: true,
      primaryDomain: true,
    },
  })
  const domains = cleanDomains([...before.domains, step.website])
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: id,
      changes: [
        { field: 'legalName', before: before.legalName, after: step.legalName, kind: 'contact' },
        {
          field: 'country',
          before: before.country,
          after: step.country.toUpperCase(),
          kind: 'contact',
        },
        { field: 'website', before: before.website, after: step.website || null, kind: 'contact' },
      ],
    },
    async (t) => {
      await t.company.update({
        where: { id },
        data: {
          legalName: step.legalName,
          name: before.name || step.legalName,
          country: step.country.toUpperCase(),
          website: step.website || null,
          domains,
          primaryDomain: before.primaryDomain ?? domains[0] ?? null,
        },
      })
      await t.supplierProfile.update({
        where: { companyId: id },
        data: {
          address: step.address || null,
          registryNo: step.registryNo || null,
          taxId: step.taxId || null,
          foundedYear: step.foundedYear ?? null,
          staffCount: step.staffCount ?? null,
          introducedBy: step.introducedBy || null,
          quoteCurrencies: step.quoteCurrencies ?? [],
          quotesCurrency: step.quoteCurrencies?.[0] ?? null,
          ...(step.type ? { type: step.type } : {}),
          version: { increment: 1 },
        },
      })
    }
  )
}

/** A Sales, Accounts or Quality contact on the company step (one per role is the usual; more are allowed). */
export async function upsertSupplierContact(
  tx: Tx,
  supplierId: string,
  c: z.infer<typeof contactStepSchema>,
  user: Pick<OpsUser, 'id'>
): Promise<{ id: string }> {
  if (!c.email && !c.name) throw new SafeError(`Give the ${c.role} contact a name or an email.`)
  return upsertContact(
    tx,
    {
      companyId: supplierId,
      email: c.email || null,
      name: c.name || null,
      phone: c.phone || null,
      role: c.role,
      sourceKind: 'manual',
      isPreferred: c.role === 'Sales',
    },
    { kind: 'user', id: user.id }
  )
}

export const documentRecordSchema = z.object({
  kind: z.enum(REQUIRED_DOC_KINDS as [string, ...string[]]),
  status: z.enum(['requested', 'received', 'awaiting_signature', 'signed', 'missing']),
  title: z.string().trim().max(160).optional(),
  number: z.string().trim().max(80).optional(),
  issuer: z.string().trim().max(160).optional(),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  note: z.string().trim().max(300).optional(),
  upload: z.object({ key: z.string().max(300), filename: z.string().max(200) }).optional(),
})
export type DocumentRecord = z.infer<typeof documentRecordSchema>

/**
 * Board 50's document row: mark a document received (with its number, issuer and expiry) or as asked for, and
 * attach the uploaded file. A file is verified before the transaction (read back, magic bytes, size).
 */
export async function recordSupplierDocument(
  supplierId: string,
  d: DocumentRecord,
  user: Pick<OpsUser, 'id'>
): Promise<{ id: string }> {
  const verified = d.upload
    ? await verifySupplierObject(
        supplierFilePrefix(supplierId, 'documents'),
        d.upload.key,
        d.upload.filename
      )
    : null
  return opsDb.$transaction(async (tx) => {
    const fileId = verified
      ? await recordSupplierFile(tx, verified, d.upload!.filename, 'upload', user.id)
      : null
    const existing = await tx.complianceDocument.findFirst({
      where: { companyId: supplierId, kind: d.kind as never, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true, expiresAt: true, fileId: true },
    })
    const data = {
      status: d.status,
      title: d.title || documentTitle(d.kind),
      number: d.number || null,
      issuer: d.issuer || null,
      expiresAt: d.expiresAt ? new Date(`${d.expiresAt}T00:00:00.000Z`) : null,
      note: d.note || null,
      ...(fileId ? { fileId } : {}),
    }
    const row = existing
      ? await tx.complianceDocument.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await tx.complianceDocument.create({
          data: { companyId: supplierId, kind: d.kind as never, ...data },
          select: { id: true },
        })
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: user.id },
        subjectType: 'company',
        subjectId: supplierId,
        changes: [
          {
            field: `document.${d.kind}`,
            before: existing ? { status: existing.status } : null,
            after: {
              status: d.status,
              expiresAt: d.expiresAt ?? null,
              file: !!fileId || !!existing?.fileId,
            },
            kind: 'documents',
          },
        ],
      },
      async () => undefined
    )
    return row
  })
}

function documentTitle(kind: string): string {
  return (
    (
      {
        trade_licence: 'Trade registry / licence',
        vat_certificate: 'Tax certificate',
        iso_certificate: 'ISO 9001 certificate',
        approval: 'Product approvals',
        bank_letter: 'Bank letter',
        company_profile: 'Company profile & plant list',
        code_of_conduct: 'Supplier code of conduct',
        nda: 'Mutual NDA',
        ownership_declaration: 'Ownership declaration',
      } as Record<string, string>
    )[kind] ?? kind
  )
}

/** The nine rows for board 50, from the supplier's documents and whether its line card has trades. */
export async function supplierRequiredDocuments(
  supplierId: string,
  db: Pick<Prisma.TransactionClient, 'complianceDocument' | 'supplierLineCard'> = opsDb
): Promise<{ rows: RequiredRow[]; inCount: number; of: number }> {
  const [docs, trades] = await Promise.all([
    db.complianceDocument.findMany({
      where: { companyId: supplierId },
      orderBy: { createdAt: 'desc' },
      select: { kind: true, status: true, expiresAt: true, archivedAt: true },
    }),
    db.supplierLineCard.count({
      where: { supplierId, tradeId: { not: null }, status: { not: 'not_carried' } },
    }),
  ])
  const now = new Date()
  return requiredDocuments(docs, {
    hasTrades: trades > 0,
    today: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
  })
}
