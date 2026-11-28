import 'server-only'
import { createHash } from 'node:crypto'
import {
  KIND_SEQUENCE,
  parseTemplateDefinition,
  previewSample,
  TEMPLATE_KINDS,
  type DocKind,
  type TemplateDefinition,
} from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { revalidateTag, unstable_cache } from 'next/cache'
import { cache } from 'react'
import { opsTags } from '../../lib/ops-cache-tags'
import { SafeError } from '../../lib/safe-message'
import { settingSubjectId } from '../settings/subject-id'
import { RECORD_KIND } from './kinds'

/**
 * Document templates (S11-T05, board 57, ADR-14, ADR-27 point 7). Content, not code: the Owner edits a draft
 * in Settings › Document templates and publishes it; the next render uses it, with no deploy. Issued files
 * never change (they are stored once, S11-T04).
 *
 * Rows per kind (name 'default'): at most one `published` (isActive, a unique index), at most one `draft`
 * (the next version), and `archived` history. Publishing turns the draft into the published row and archives
 * the previous one in one transaction. The published template is cached under `ops:template:<kind>`, purged on
 * publish (and the 300 s safety net, as for settings).
 */
export const TEMPLATE_NAME = 'default'
export const TEMPLATE_CACHE_SECONDS = 300

export class MissingTemplateError extends Error {
  constructor(readonly kind: DocKind) {
    super(`No published ${kind} template; apply the s11 document templates seed migration`)
    this.name = 'MissingTemplateError'
  }
}

export interface ActiveTemplate {
  id: string
  kind: DocKind
  version: number
  definition: TemplateDefinition
  publishedAt: string | null
  publishedById: string | null
  signoffStatus: string
}

interface RawTemplate {
  id: string
  version: number
  definition: unknown
  pageSize: string
  publishedAt: string | null
  publishedById: string | null
  signoffStatus: string
}

/** The stored definition with the page size from its own column, validated for the kind. */
function definitionOf(kind: DocKind, row: { definition: unknown; pageSize: string }): TemplateDefinition {
  const stored = (row.definition ?? {}) as Record<string, unknown>
  const check = parseTemplateDefinition(kind, { ...stored, pageSize: row.pageSize })
  if (!check.ok) throw new Error(`document_template ${kind}: ${check.error}`)
  return check.definition
}

/** What is stored in `definition` (pageSize lives on its own column). */
function storedDefinition(d: TemplateDefinition): Prisma.InputJsonValue {
  const { pageSize: _pageSize, ...rest } = d
  return rest as unknown as Prisma.InputJsonValue
}

async function loadPublished(kind: DocKind): Promise<RawTemplate | null> {
  const row = await opsDb.documentTemplate.findFirst({
    where: { kind: RECORD_KIND[kind], status: 'published' },
    select: {
      id: true,
      version: true,
      definition: true,
      pageSize: true,
      publishedAt: true,
      publishedById: true,
      signoffStatus: true,
    },
  })
  return row
    ? {
        ...row,
        publishedAt: row.publishedAt?.toISOString() ?? null,
      }
    : null
}

/** The published template of a kind: cached across requests, parsed on every read. */
export const getActiveTemplate = cache(async (kind: DocKind): Promise<ActiveTemplate> => {
  const raw = await unstable_cache(() => loadPublished(kind), ['ops-template', kind], {
    tags: [opsTags.templates, opsTags.template(kind)],
    revalidate: TEMPLATE_CACHE_SECONDS,
  })()
  if (!raw) throw new MissingTemplateError(kind)
  return {
    id: raw.id,
    kind,
    version: raw.version,
    definition: definitionOf(kind, raw),
    publishedAt: raw.publishedAt,
    publishedById: raw.publishedById,
    signoffStatus: raw.signoffStatus,
  }
})

/** An opaque stamp of a draft's content, for the optimistic check on save and publish. */
export function draftStamp(row: { id: string; definition: unknown; pageSize: string } | null): string {
  if (!row) return 'none'
  return createHash('sha256')
    .update(`${row.id}:${JSON.stringify(row.definition)}:${row.pageSize}`)
    .digest('hex')
    .slice(0, 16)
}

export interface TemplateEditorState {
  kind: DocKind
  published: {
    id: string
    version: number
    definition: TemplateDefinition
    publishedAt: Date | null
    publishedByName: string | null
    signoffStatus: string
  }
  /** The unpublished draft, when one exists. */
  draft: { id: string; version: number; definition: TemplateDefinition } | null
  stamp: string
  /** Open documents rendered from the published version (quotations in draft: 0 until S17). */
  usedOnOpen: number
}

const TEMPLATE_SELECT = {
  id: true,
  kind: true,
  version: true,
  status: true,
  definition: true,
  pageSize: true,
  publishedAt: true,
  publishedById: true,
  signoffStatus: true,
} as const

/** Board 57's left list: each kind's published version line and number pattern. One read each. */
export async function listTemplates(): Promise<
  Array<{
    kind: DocKind
    version: number | null
    publishedAt: Date | null
    hasDraft: boolean
    pattern: string | null
    revisionPattern: string | null
  }>
> {
  const [rows, sequences] = await opsDb.$transaction([
    opsDb.documentTemplate.findMany({
      where: { name: TEMPLATE_NAME, status: { in: ['published', 'draft'] } },
      select: { kind: true, version: true, status: true, publishedAt: true },
    }),
    opsDb.numberSequence.findMany({
      where: { key: { in: Object.values(KIND_SEQUENCE) } },
      select: { key: true, pattern: true, revisionPattern: true },
    }),
  ])
  return TEMPLATE_KINDS.map((kind) => {
    const pub = rows.find((r) => r.kind === RECORD_KIND[kind] && r.status === 'published')
    const seq = sequences.find((s) => s.key === KIND_SEQUENCE[kind])
    return {
      kind,
      version: pub?.version ?? null,
      publishedAt: pub?.publishedAt ?? null,
      hasDraft: rows.some((r) => r.kind === RECORD_KIND[kind] && r.status === 'draft'),
      pattern: seq?.pattern ?? null,
      revisionPattern: seq?.revisionPattern ?? null,
    }
  })
}

/** The editor's state for one kind: published, draft, its stamp and the usage line. */
export async function getTemplateEditor(kind: DocKind): Promise<TemplateEditorState> {
  const rows = await opsDb.documentTemplate.findMany({
    where: { kind: RECORD_KIND[kind], name: TEMPLATE_NAME, status: { in: ['published', 'draft'] } },
    select: TEMPLATE_SELECT,
  })
  const pub = rows.find((r) => r.status === 'published')
  if (!pub) throw new MissingTemplateError(kind)
  const draft = rows.find((r) => r.status === 'draft') ?? null
  const [publisher, usedOnOpen] = await Promise.all([
    pub.publishedById
      ? opsDb.user.findUnique({ where: { id: pub.publishedById }, select: { name: true } })
      : Promise.resolve(null),
    openDocumentsUsing(pub.id),
  ])
  return {
    kind,
    published: {
      id: pub.id,
      version: pub.version,
      definition: definitionOf(kind, pub),
      publishedAt: pub.publishedAt,
      publishedByName: publisher?.name ?? null,
      signoffStatus: pub.signoffStatus,
    },
    draft: draft ? { id: draft.id, version: draft.version, definition: definitionOf(kind, draft) } : null,
    stamp: draftStamp(draft),
    usedOnOpen,
  }
}

/** Documents still open (draft) whose latest version was rendered from this template. */
async function openDocumentsUsing(templateId: string): Promise<number> {
  return opsDb.document.count({
    where: { status: 'draft', versions: { some: { templateId } } },
  })
}

type Tx = Prisma.TransactionClient

/**
 * Save the draft (create it as version published + 1, or update it), refusing a stale editor: `stamp` must be
 * the stamp the editor loaded. Returns the new stamp.
 */
export async function saveTemplateDraft(
  tx: Tx,
  kind: DocKind,
  input: unknown,
  stamp: string
): Promise<{ stamp: string; version: number; before: TemplateDefinition }> {
  const check = parseTemplateDefinition(kind, input)
  if (!check.ok) throw new SafeError(check.error)
  const recordKind = RECORD_KIND[kind]
  // One editor at a time per kind: the lock is released at commit.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`ops.template:${kind}`}, 0))`
  const rows = await tx.documentTemplate.findMany({
    where: { kind: recordKind, name: TEMPLATE_NAME, status: { in: ['published', 'draft'] } },
    select: TEMPLATE_SELECT,
  })
  const pub = rows.find((r) => r.status === 'published')
  if (!pub) throw new MissingTemplateError(kind)
  const draft = rows.find((r) => r.status === 'draft') ?? null
  if (draftStamp(draft) !== stamp)
    throw new SafeError('Someone changed this template a moment ago. Open it again.')
  const before = draft ? definitionOf(kind, draft) : definitionOf(kind, pub)
  const data = { definition: storedDefinition(check.definition), pageSize: check.definition.pageSize }
  const saved = draft
    ? await tx.documentTemplate.update({ where: { id: draft.id }, data, select: TEMPLATE_SELECT })
    : await tx.documentTemplate.create({
        data: {
          kind: recordKind,
          name: TEMPLATE_NAME,
          version: pub.version + 1,
          layout: kind === 'quotation' ? 'estimate-v1' : 'house-v1',
          status: 'draft',
          isActive: false,
          ...data,
        },
        select: TEMPLATE_SELECT,
      })
  return { stamp: draftStamp(saved), version: saved.version, before }
}

/**
 * Publish the draft: it becomes the published row (version, publishedAt / By, isActive) and the previous one
 * is archived, in one transaction; then the kind's cache tag is purged. Owner only (the action checks the
 * role; this checks it again from the actor row it is given).
 */
export async function publishTemplate(
  tx: Tx,
  kind: DocKind,
  stamp: string,
  actor: { id: string; role: string }
): Promise<{ id: string; version: number; previousId: string; previousVersion: number }> {
  if (actor.role !== 'owner') throw new SafeError('Only the Owner can publish a template.')
  const recordKind = RECORD_KIND[kind]
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`ops.template:${kind}`}, 0))`
  const rows = await tx.documentTemplate.findMany({
    where: { kind: recordKind, name: TEMPLATE_NAME, status: { in: ['published', 'draft'] } },
    select: TEMPLATE_SELECT,
  })
  const pub = rows.find((r) => r.status === 'published')
  const draft = rows.find((r) => r.status === 'draft')
  if (!pub) throw new MissingTemplateError(kind)
  if (!draft) throw new SafeError('There are no changes to publish.')
  if (draftStamp(draft) !== stamp)
    throw new SafeError('Someone changed this template a moment ago. Open it again.')
  // Validate again: a draft written before a rule changed must not go live.
  definitionOf(kind, draft)
  // The previous one leaves first: one published row per kind (unique index).
  await tx.documentTemplate.update({
    where: { id: pub.id },
    data: { status: 'archived', isActive: false },
  })
  await tx.documentTemplate.update({
    where: { id: draft.id },
    data: {
      status: 'published',
      isActive: true,
      publishedAt: new Date(),
      publishedById: actor.id,
      // A published change is the Owner's own: it needs no further sign-off.
      signoffStatus: 'signed_off',
      signedOffById: actor.id,
      signedOffAt: new Date(),
    },
  })
  return { id: draft.id, version: draft.version, previousId: pub.id, previousVersion: pub.version }
}

/** Throw the draft away; the published template stays as it is. */
export async function discardTemplateDraft(tx: Tx, kind: DocKind, stamp: string): Promise<void> {
  const draft = await tx.documentTemplate.findFirst({
    where: { kind: RECORD_KIND[kind], name: TEMPLATE_NAME, status: 'draft' },
    select: TEMPLATE_SELECT,
  })
  if (!draft) return
  if (draftStamp(draft) !== stamp)
    throw new SafeError('Someone changed this template a moment ago. Open it again.')
  await tx.documentTemplate.delete({ where: { id: draft.id } })
}

/** Purge a kind's cached template (after the publishing transaction commits). */
export function purgeTemplate(kind: DocKind): void {
  revalidateTag(opsTags.template(kind), { expire: 0 })
}

/** The activity row's subject for a kind's template history. */
export const templateSubjectId = (kind: DocKind) => settingSubjectId(`document_template.${kind}`)

/** A kind's sample rendered through a template (see previewSample in ops-core). */
export const previewDocument = previewSample
