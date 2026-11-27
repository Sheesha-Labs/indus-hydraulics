import 'server-only'
import { createHmac, randomUUID } from 'node:crypto'
import { documentLabel, REQUIRED_DOC_KINDS } from '@indus/ops-core'
import { opsDb, type Prisma } from '@indus/ops-db'
import { keyRingFromEnv, sha256Hex } from '../../lib/crypto'
import { env } from '../../lib/env'
import { SafeError } from '../../lib/safe-message'
import type { OpsUser } from '../../lib/access-core'
import { hit } from '../access/rate-limit'
import { ipHash } from '../auth/session-store'
import { requestActionQuietly } from '../assistant/request'
import { writeTracked } from '../assistant/write-tracked'
import { raiseNotification } from '../notify/raise'
import { getSetting } from '../settings/get'
import {
  createSupplierUpload,
  recordSupplierFile,
  supplierFilePrefix,
  verifySupplierObject,
} from './document-files'

/**
 * The supplier document request (S10-T04, board 50, C28): a secure link to /u/<token> where a new supplier uploads
 * the documents asked for. The token is derived from the request id with an HMAC (the request row stores only its
 * SHA-256; the proposal card shows a placeholder; the link exists only in the email that leaves). It expires after
 * the configured days (14) and the supplier is reminded every 4 days until complete. The public page reads no
 * session; it is rate-limited per link and per address.
 */
export type RequestState = 'open' | 'completed' | 'expired' | 'revoked'

function linkKey(): string {
  const e = env()
  if (e.OPS_AUTH_SECRET) return e.OPS_AUTH_SECRET
  const ring = keyRingFromEnv()
  return ring.keys[ring.active]!
}

/** The /u token for a request: 32 bytes of HMAC, base64url (43 characters). */
export function tokenFor(requestId: string): string {
  return createHmac('sha256', linkKey()).update(`supplier-docs:${requestId}`).digest('base64url')
}

export const tokenHashOf = (token: string) => sha256Hex(token)

/** The link from NEXT_PUBLIC_OPS_BASE_URL (never the Host header). */
export function uploadLinkFor(requestId: string): string {
  const base = (env().NEXT_PUBLIC_OPS_BASE_URL ?? 'https://operations.indushydraulics.com').replace(
    /\/+$/,
    ''
  )
  return `${base}/u/${tokenFor(requestId)}`
}

type Tx = Prisma.TransactionClient

/** Open a request for these kinds and ask the Assistant to draft the email (Draft and ask, from purchase@). */
export async function createDocumentRequest(
  i: { supplierId: string; contactId?: string | null; kinds: string[]; remindersOn?: boolean },
  user: Pick<OpsUser, 'id'> | null
): Promise<{ requestId: string }> {
  const kinds = [...new Set(i.kinds)].filter((k) =>
    (REQUIRED_DOC_KINDS as readonly string[]).includes(k)
  )
  if (!kinds.length) throw new SafeError('Choose at least one document to ask for.')
  const s = await getSetting('supplier_docs.request')
  const id = randomUUID()
  const now = Date.now()
  await opsDb.$transaction(async (tx) => {
    // One open link per supplier: a new request replaces the open one.
    await tx.supplierDocumentRequest.updateMany({
      where: { supplierId: i.supplierId, status: 'open' },
      data: { status: 'revoked', revokedAt: new Date() },
    })
    await tx.supplierDocumentRequest.create({
      data: {
        id,
        supplierId: i.supplierId,
        contactId: i.contactId ?? null,
        tokenHash: tokenHashOf(tokenFor(id)),
        requestedKinds: kinds,
        expiresAt: new Date(now + s.expiryDays * 86_400_000),
        nextReminderAt:
          i.remindersOn === false ? null : new Date(now + s.reminderEveryDays * 86_400_000),
        remindersOn: i.remindersOn !== false,
        createdById: user?.id ?? null,
      },
    })
    await tx.complianceDocument.updateMany({
      where: { companyId: i.supplierId, kind: { in: kinds as never[] }, status: 'missing' },
      data: { status: 'requested' },
    })
    await writeTracked(
      tx,
      {
        actor: user ? { kind: 'user', id: user.id } : { kind: 'system' },
        subjectType: 'company',
        subjectId: i.supplierId,
        changes: [
          { field: 'documentRequest', before: null, after: { id, kinds }, kind: 'documents' },
        ],
        note: 'Document request opened',
      },
      async () => undefined
    )
  })
  await requestActionQuietly({
    actionKey: 'request_supplier_documents',
    subjectType: 'company',
    subjectId: i.supplierId,
    trigger: 'person',
    origin: 'live',
    sourceVersion: id,
    ...(user ? { requestedById: user.id } : {}),
  })
  return { requestId: id }
}

export async function revokeRequest(
  tx: Tx,
  requestId: string,
  user: Pick<OpsUser, 'id'>
): Promise<void> {
  const r = await tx.supplierDocumentRequest.findUnique({
    where: { id: requestId },
    select: { status: true, supplierId: true },
  })
  if (!r) throw new SafeError('That request is no longer here.')
  if (r.status !== 'open') return
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'company',
      subjectId: r.supplierId,
      changes: [
        { field: 'documentRequest.status', before: 'open', after: 'revoked', kind: 'documents' },
      ],
    },
    (t) =>
      t.supplierDocumentRequest.update({
        where: { id: requestId },
        data: { status: 'revoked', revokedAt: new Date() },
      })
  )
}

// ── The public page (/u/[token]) ─────────────────────────────────────────────────────────────────────────────

export interface PortalView {
  state: RequestState | 'invalid' | 'rate_limited'
  supplier?: string
  expires?: string
  kinds?: Array<{ kind: string; label: string; received: boolean }>
}

const DATE = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

async function limited(tokenHash: string, ip: string): Promise<boolean> {
  const { rateLimitPer10Min } = await getSetting('supplier_docs.request')
  const rule = { windowSeconds: 600, max: rateLimitPer10Min }
  const [a, b] = await Promise.all([
    hit(`supplier-docs:${tokenHash.slice(0, 32)}`, rule),
    hit(`supplier-docs-ip:${ipHash(ip)}`, rule),
  ])
  return !(a && b)
}

async function requestByToken(token: string) {
  const r = await opsDb.supplierDocumentRequest.findUnique({
    where: { tokenHash: tokenHashOf(token) },
    select: {
      id: true,
      supplierId: true,
      status: true,
      expiresAt: true,
      requestedKinds: true,
      uploads: { select: { kind: true } },
    },
  })
  if (!r) return null
  // An open request past its expiry reads as expired (the clock marks it too).
  const state: RequestState =
    r.status === 'open' && r.expiresAt < new Date() ? 'expired' : (r.status as RequestState)
  return { ...r, state }
}

/**
 * What the public page shows for a token: the supplier's own name, the expiry and the kinds asked for with what is
 * already in. Nothing else (no Indus internals, no client anything). Unknown tokens read as "invalid".
 */
export async function portalView(token: string, ip: string): Promise<PortalView> {
  const tokenHash = tokenHashOf(token)
  if (await limited(tokenHash, ip)) return { state: 'rate_limited' }
  const r = await requestByToken(token)
  if (!r) return { state: 'invalid' }
  if (r.state !== 'open') return { state: r.state }
  const c = await opsDb.company.findUnique({ where: { id: r.supplierId }, select: { name: true } })
  const got = new Set(r.uploads.map((u) => u.kind))
  return {
    state: 'open',
    supplier: c?.name ?? '',
    expires: DATE.format(r.expiresAt),
    kinds: r.requestedKinds.map((k) => ({
      kind: k,
      label: documentLabel(k),
      received: got.has(k),
    })),
  }
}

async function openRequest(token: string, ip: string) {
  if (await limited(tokenHashOf(token), ip))
    throw new SafeError('Too many attempts. Wait a few minutes and try again.')
  const r = await requestByToken(token)
  if (!r || r.state !== 'open')
    throw new SafeError('This link is no longer open. Ask Indus for a new one.')
  return r
}

/** A signed upload URL for one requested kind. */
export async function portalUploadSlot(
  token: string,
  kind: string,
  file: { name: string; size: number },
  ip: string
): Promise<{ key: string; uploadUrl: string }> {
  const r = await openRequest(token, ip)
  if (!r.requestedKinds.includes(kind)) throw new SafeError('That document was not asked for.')
  return createSupplierUpload(supplierFilePrefix(r.supplierId, 'request', r.id), file)
}

/** Record an uploaded document: verify the bytes, store it, mark the document received, complete when all are in. */
export async function portalConfirmUpload(
  token: string,
  input: { kind: string; key: string; filename: string; expiresAt?: string | null },
  meta: { ip: string; userAgent: string | null }
): Promise<{ complete: boolean }> {
  const r = await openRequest(token, meta.ip)
  if (!r.requestedKinds.includes(input.kind))
    throw new SafeError('That document was not asked for.')
  const verified = await verifySupplierObject(
    supplierFilePrefix(r.supplierId, 'request', r.id),
    input.key,
    input.filename
  )
  const expires =
    input.expiresAt && /^\d{4}-\d{2}-\d{2}$/.test(input.expiresAt)
      ? new Date(`${input.expiresAt}T00:00:00.000Z`)
      : null
  const out = await opsDb.$transaction(async (tx) => {
    const fileId = await recordSupplierFile(tx, verified, input.filename, 'client_portal', null)
    const existing = await tx.complianceDocument.findFirst({
      where: { companyId: r.supplierId, kind: input.kind as never, archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true },
    })
    const doc =
      existing && existing.status !== 'received'
        ? await tx.complianceDocument.update({
            where: { id: existing.id },
            data: { status: 'received', fileId, ...(expires ? { expiresAt: expires } : {}) },
            select: { id: true },
          })
        : await tx.complianceDocument.create({
            data: {
              companyId: r.supplierId,
              kind: input.kind as never,
              title: documentLabel(input.kind),
              status: 'received',
              fileId,
              expiresAt: expires,
            },
            select: { id: true },
          })
    await tx.supplierDocumentUpload.create({
      data: {
        requestId: r.id,
        storedFileId: fileId,
        kind: input.kind,
        complianceDocumentId: doc.id,
        ipHash: ipHash(meta.ip),
        userAgentClass: agentClass(meta.userAgent),
      },
    })
    const kindsIn = new Set([...r.uploads.map((u) => u.kind), input.kind])
    const complete = r.requestedKinds.every((k) => kindsIn.has(k))
    if (complete)
      await tx.supplierDocumentRequest.update({
        where: { id: r.id },
        data: { status: 'completed', completedAt: new Date(), nextReminderAt: null },
      })
    await writeTracked(
      tx,
      {
        actor: { kind: 'system' },
        subjectType: 'company',
        subjectId: r.supplierId,
        changes: [
          {
            field: `document.${input.kind}`,
            before: existing?.status ?? null,
            after: 'received',
            kind: 'documents',
          },
        ],
        note: 'Uploaded through the document link',
      },
      async () => undefined
    )
    return { complete }
  })
  const c = await opsDb.company.findUnique({ where: { id: r.supplierId }, select: { name: true } })
  await raiseNotification({
    event: 'other',
    severity: 'info',
    title: `${documentLabel(input.kind)} received from ${c?.name ?? 'a supplier'}`,
    body: out.complete ? 'Every document asked for is in.' : 'Uploaded through the secure link.',
    dedupeKey: `supplier-doc:${r.id}:${input.kind}`,
    subjectType: 'company',
    subjectId: r.supplierId,
    audience: 'all',
  })
  return out
}

function agentClass(ua: string | null): string | null {
  if (!ua) return null
  if (/mobile|iphone|android/i.test(ua)) return 'mobile'
  if (/bot|crawl|spider|curl|python|wget/i.test(ua)) return 'automated'
  return 'desktop'
}
