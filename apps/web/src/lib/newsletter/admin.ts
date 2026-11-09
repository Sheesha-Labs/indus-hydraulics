import 'server-only'
import { db, Prisma } from '@indus/db'
import { renderNewsletterConfirmation, sendEmailBatch, type SendEmailInput } from '@indus/email'
import { BASE_URL } from '../seo'
import { newsletterConfirmUrl } from './links'
import { LIST_IMPORT_MAX, PAIR_MAPPING, contactsFromRows, isValidListEmail, normaliseListEmail, toCsv } from './lists'
import { newsletterBranding, newsletterSender } from './service'
import { generateNewsletterToken, hashNewsletterToken, newsletterEmailHash } from './tokens'

/**
 * What the admin does to newsletter data — subscribers, lists, imports,
 * exports. The server actions are thin wrappers: they check the role, call
 * one of these, revalidate. Nothing here checks a session.
 *
 * Addresses never go to a log.
 */

// ── Subscribers ────────────────────────────────────────────────────────

export const SUBSCRIBER_STATUSES = ['pending', 'confirmed', 'unsubscribed', 'bounced'] as const
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number]

export type SubscriberFilters = {
  status?: SubscriberStatus | null
  q?: string | null
  /** Inclusive, `YYYY-MM-DD`, on the signup date (UTC). */
  from?: string | null
  to?: string | null
}

const DAY = /^\d{4}-\d{2}-\d{2}$/

/** Filters → a Prisma where. Anything malformed is ignored, not trusted. */
export function subscriberWhere(f: SubscriberFilters, opts: { withStatus?: boolean } = {}): Prisma.NewsletterSubscriberWhereInput {
  const where: Prisma.NewsletterSubscriberWhereInput = {}
  if (opts.withStatus !== false && f.status && (SUBSCRIBER_STATUSES as readonly string[]).includes(f.status)) {
    where.status = f.status
  }
  const q = f.q?.trim()
  if (q) where.email = { contains: q.toLowerCase(), mode: 'insensitive' }
  const createdAt: Prisma.DateTimeFilter = {}
  if (f.from && DAY.test(f.from)) createdAt.gte = new Date(`${f.from}T00:00:00.000Z`)
  if (f.to && DAY.test(f.to)) createdAt.lt = new Date(new Date(`${f.to}T00:00:00.000Z`).getTime() + 86_400_000)
  if (createdAt.gte || createdAt.lt) where.createdAt = createdAt
  return where
}

/** Counts per status under the other filters, for the tabs. */
export async function subscriberCounts(f: SubscriberFilters): Promise<Record<SubscriberStatus | 'all', number>> {
  const groups = await db.newsletterSubscriber.groupBy({
    by: ['status'],
    where: subscriberWhere(f, { withStatus: false }),
    _count: { _all: true },
  })
  const out = { all: 0, pending: 0, confirmed: 0, unsubscribed: 0, bounced: 0 }
  for (const g of groups) {
    out[g.status as SubscriberStatus] = g._count._all
    out.all += g._count._all
  }
  return out
}

const EXPORT_PAGE = 2_000

/** The filtered subscribers as CSV. Paged reads, so a big list never loads in one query. */
export async function exportSubscribersCsv(f: SubscriberFilters): Promise<{ csv: string; rows: number }> {
  const where = subscriberWhere(f)
  const rows: string[][] = []
  let cursor: string | undefined
  for (;;) {
    const page = await db.newsletterSubscriber.findMany({
      where,
      orderBy: { id: 'asc' },
      take: EXPORT_PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: { id: true, email: true, status: true, source: true, createdAt: true, confirmedAt: true, unsubscribedAt: true, consentVersion: true },
    })
    for (const r of page) {
      rows.push([
        r.email,
        r.status,
        r.source ?? '',
        r.createdAt.toISOString(),
        r.confirmedAt?.toISOString() ?? '',
        r.unsubscribedAt?.toISOString() ?? '',
        r.consentVersion ?? '',
      ])
    }
    if (page.length < EXPORT_PAGE) break
    cursor = page[page.length - 1]!.id
  }
  return {
    csv: toCsv(['email', 'status', 'source', 'signed_up', 'confirmed', 'unsubscribed', 'consent_version'], rows),
    rows: rows.length,
  }
}

/** Don't re-send a confirmation sooner than this after the last one. */
export const RESEND_CONFIRMATION_COOLDOWN_MS = 24 * 60 * 60 * 1000
/**
 * At most this many confirmations per click. Resend's free plan allows 100
 * emails a day in all — a bigger "re-send to everyone pending" would stop
 * quote mail for the rest of the day.
 */
export const RESEND_CONFIRMATION_MAX = 50

export type ResendOutcome = { sent: number; skipped: number; failed: number }

/**
 * Send a fresh confirmation to pending subscribers — the ones listed, or (no
 * ids) the longest-waiting pending ones — skipping anyone mailed inside the
 * cooldown and any hard-suppressed address. Each gets a new one-time token;
 * the old link stops working. Sent through the batch API, one call per 100.
 */
export async function resendConfirmations(ids: string[] | null, now = new Date()): Promise<ResendOutcome> {
  const cutoff = new Date(now.getTime() - RESEND_CONFIRMATION_COOLDOWN_MS)
  const due = await db.newsletterSubscriber.findMany({
    where: {
      status: 'pending',
      ...(ids ? { id: { in: ids.slice(0, RESEND_CONFIRMATION_MAX) } } : {}),
      OR: [{ confirmationSentAt: null }, { confirmationSentAt: { lt: cutoff } }],
    },
    orderBy: { confirmationSentAt: 'asc' },
    take: RESEND_CONFIRMATION_MAX,
    select: { id: true, email: true },
  })
  const requested = ids ? Math.min(ids.length, RESEND_CONFIRMATION_MAX) : due.length

  const hashes = due.map((d) => newsletterEmailHash(d.email))
  const blocked = new Set(
    (
      await db.newsletterSuppression.findMany({
        where: { emailHash: { in: hashes }, reason: { in: ['bounced', 'complained'] } },
        select: { emailHash: true },
      })
    ).map((s) => s.emailHash),
  )
  const targets = due.filter((d) => !blocked.has(newsletterEmailHash(d.email)))
  if (targets.length === 0) return { sent: 0, skipped: requested, failed: 0 }

  const { branding, replyTo } = await newsletterBranding()
  const sender = newsletterSender()
  const inputs: SendEmailInput[] = []
  for (const t of targets) {
    const token = generateNewsletterToken()
    // Conditional on still pending: someone who confirmed a moment ago is not
    // knocked back to pending by a stale admin click.
    const claimed = await db.newsletterSubscriber.updateMany({
      where: { id: t.id, status: 'pending' },
      data: { confirmationTokenHash: hashNewsletterToken(token), confirmationSentAt: now },
    })
    if (claimed.count === 0) continue
    inputs.push({
      kind: 'newsletter_confirmation',
      to: [t.email],
      ...sender,
      ...(replyTo ? { replyTo } : {}),
      ...renderNewsletterConfirmation({ confirmUrl: newsletterConfirmUrl(BASE_URL, token), validityWindow: '14 days', branding }),
    })
  }

  let sent = 0
  let failed = 0
  for (let i = 0; i < inputs.length; i += 100) {
    const chunk = inputs.slice(i, i + 100)
    const result = await sendEmailBatch(chunk, { idempotencyKey: `newsletter-resend-${now.getTime()}-${i}` })
    if (result.ok) sent += chunk.length
    else {
      failed += chunk.length
      console.error('[newsletter] resend confirmations failed', result.error)
    }
  }
  return { sent, skipped: requested - sent - failed, failed }
}

/** Staff unsubscribing someone who asked by other means (a phone call, a reply). */
export async function unsubscribeSubscriber(id: string, now = new Date()): Promise<boolean> {
  const r = await db.newsletterSubscriber.updateMany({
    where: { id, status: { in: ['pending', 'confirmed'] } },
    data: { status: 'unsubscribed', unsubscribedAt: now, confirmationTokenHash: null },
  })
  return r.count > 0
}

// ── Lists ──────────────────────────────────────────────────────────────

export type ListSummary = { id: string; name: string; description: string; active: number; total: number; updatedAt: Date }

export async function listSummaries(): Promise<ListSummary[]> {
  const [lists, counts] = await Promise.all([
    db.newsletterList.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, description: true, updatedAt: true } }),
    db.newsletterListContact.groupBy({ by: ['listId', 'status'], _count: { _all: true } }),
  ])
  return lists.map((l) => {
    const mine = counts.filter((c) => c.listId === l.id)
    return {
      ...l,
      active: mine.filter((c) => c.status === 'active').reduce((n, c) => n + c._count._all, 0),
      total: mine.reduce((n, c) => n + c._count._all, 0),
    }
  })
}

export type AddContactOutcome = 'added' | 'already_on_list' | 'suppressed' | 'invalid' | 'no_list'

/** One address typed in by hand. A suppressed address is refused, not added inactive. */
export async function addContact(
  listId: string,
  input: { email: string; name: string },
  staffId: string | null,
): Promise<AddContactOutcome> {
  const email = normaliseListEmail(input.email)
  if (!isValidListEmail(email)) return 'invalid'
  const list = await db.newsletterList.findUnique({ where: { id: listId }, select: { id: true } })
  if (!list) return 'no_list'
  const blocked = await db.newsletterSuppression.findUnique({ where: { emailHash: newsletterEmailHash(email) } })
  if (blocked) return 'suppressed'
  const r = await db.newsletterListContact.createMany({
    data: [{ listId, email, name: input.name.replace(/\s+/g, ' ').trim().slice(0, 120), source: 'manual', addedById: staffId }],
    skipDuplicates: true,
  })
  if (r.count === 0) return 'already_on_list'
  await db.newsletterList.update({ where: { id: listId }, data: { updatedAt: new Date() } })
  return 'added'
}

/**
 * The consent statement an uploader must tick (plan D6). Stored verbatim on
 * the import row, so a change to this wording does not rewrite history.
 */
export const LIST_IMPORT_CONSENT =
  'Everyone on this list agreed to receive email from Indus Hydraulics, and I can show how and when they agreed.'

export type ImportReport = {
  rows: number
  added: number
  alreadyOnList: number
  suppressed: number
  invalid: number
  duplicates: number
  truncated: number
}

export type ImportOutcome =
  | { status: 'ok'; importId: string; report: ImportReport }
  | { status: 'error'; message: string }

const SUPPRESSION_LOOKUP = 1_000
const INSERT_CHUNK = 1_000

/**
 * Add uploaded contacts to a list. `pairs` are [raw address, name] per data
 * row, as the import screen sends them; they are parsed again here — the
 * browser's preview is a courtesy, this count is the record.
 *
 * - every suppressed address (unsubscribed, bounced or complained, here or
 *   anywhere) is left out;
 * - an address already on the list is left exactly as it is, so an import
 *   never brings back someone who left (their row stays unsubscribed);
 * - the import row, with the consent wording, is written in the same
 *   transaction as the contacts it added.
 */
export async function importContacts(input: {
  listId: string
  pairs: unknown
  fileName: string
  consent: boolean
  staffId: string | null
}): Promise<ImportOutcome> {
  if (!input.consent) {
    return { status: 'error', message: 'Confirm that everyone on the list agreed to hear from Indus before importing it.' }
  }
  if (
    !Array.isArray(input.pairs) ||
    !input.pairs.every((p) => Array.isArray(p) && p.length === 2 && p.every((c) => typeof c === 'string' && c.length <= 1_000))
  ) {
    return { status: 'error', message: 'The upload could not be read. Choose the file again.' }
  }
  const pairs = input.pairs as [string, string][]
  if (pairs.length === 0) return { status: 'error', message: 'The file has no rows.' }
  if (pairs.length > LIST_IMPORT_MAX * 2) {
    return { status: 'error', message: `Keep a file under ${LIST_IMPORT_MAX.toLocaleString('en-US')} rows — split it in two.` }
  }

  const list = await db.newsletterList.findUnique({ where: { id: input.listId }, select: { id: true } })
  if (!list) return { status: 'error', message: 'That list no longer exists.' }

  const parsed = contactsFromRows(pairs, PAIR_MAPPING)
  if (parsed.contacts.length === 0) {
    return { status: 'error', message: 'No email addresses found in the column you picked.' }
  }

  const suppressed = new Set<string>()
  const hashes = parsed.contacts.map((c) => newsletterEmailHash(c.email))
  for (let i = 0; i < hashes.length; i += SUPPRESSION_LOOKUP) {
    const found = await db.newsletterSuppression.findMany({
      where: { emailHash: { in: hashes.slice(i, i + SUPPRESSION_LOOKUP) } },
      select: { emailHash: true },
    })
    for (const f of found) suppressed.add(f.emailHash)
  }
  const keep = parsed.contacts.filter((_, i) => !suppressed.has(hashes[i]!))

  const fileName = input.fileName.replace(/[^\w .()-]/g, '').slice(0, 200)
  const { importId, added } = await db.$transaction(
    async (tx) => {
      const imp = await tx.newsletterListImport.create({
        data: { listId: input.listId, fileName, consentText: LIST_IMPORT_CONSENT, importedById: input.staffId, rows: pairs.length },
        select: { id: true },
      })
      let n = 0
      for (let i = 0; i < keep.length; i += INSERT_CHUNK) {
        const r = await tx.newsletterListContact.createMany({
          data: keep.slice(i, i + INSERT_CHUNK).map((c) => ({
            listId: input.listId,
            email: c.email,
            name: c.name,
            source: 'upload',
            importId: imp.id,
            addedById: input.staffId,
          })),
          skipDuplicates: true,
        })
        n += r.count
      }
      return { importId: imp.id, added: n }
    },
    { timeout: 60_000 },
  )

  const report: ImportReport = {
    rows: pairs.length,
    added,
    alreadyOnList: keep.length - added,
    suppressed: parsed.contacts.length - keep.length,
    invalid: parsed.invalid.length,
    duplicates: parsed.duplicates,
    truncated: parsed.truncated,
  }
  await db.$transaction([
    db.newsletterListImport.update({ where: { id: importId }, data: { ...report } }),
    db.newsletterList.update({ where: { id: input.listId }, data: { updatedAt: new Date() } }),
  ])
  return { status: 'ok', importId, report }
}

/** One report line, the way the import screen and the history table say it. */
export function describeImport(r: ImportReport): string {
  const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`
  return [
    plural(r.added, 'added', 'added'),
    r.alreadyOnList ? `${r.alreadyOnList.toLocaleString('en-US')} already on the list` : '',
    r.suppressed ? `${plural(r.suppressed, 'left out', 'left out')} — unsubscribed or bounced before` : '',
    r.invalid ? plural(r.invalid, "row wasn't an address", "rows weren't addresses") : '',
    r.duplicates ? plural(r.duplicates, 'duplicate', 'duplicates') : '',
    r.truncated ? `${r.truncated.toLocaleString('en-US')} past the ${LIST_IMPORT_MAX.toLocaleString('en-US')}-row limit` : '',
  ]
    .filter(Boolean)
    .join(', ')
}

/** Staff unsubscribing a list contact: suppresses the address everywhere (trigger). */
export async function unsubscribeContact(listId: string, contactId: string, now = new Date()): Promise<boolean> {
  const r = await db.newsletterListContact.updateMany({
    where: { id: contactId, listId, status: 'active' },
    data: { status: 'unsubscribed', unsubscribedAt: now },
  })
  return r.count > 0
}

/** Take an address off one list. It is not suppressed, and can be added back. */
export async function removeContact(listId: string, contactId: string): Promise<boolean> {
  const r = await db.newsletterListContact.deleteMany({ where: { id: contactId, listId } })
  return r.count > 0
}

/** A list as CSV. */
export async function exportListCsv(listId: string): Promise<{ csv: string; rows: number; name: string } | null> {
  const list = await db.newsletterList.findUnique({ where: { id: listId }, select: { name: true } })
  if (!list) return null
  const rows: string[][] = []
  let cursor: string | undefined
  for (;;) {
    const page = await db.newsletterListContact.findMany({
      where: { listId },
      orderBy: { id: 'asc' },
      take: EXPORT_PAGE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: { id: true, email: true, name: true, status: true, source: true, createdAt: true, unsubscribedAt: true },
    })
    for (const r of page) {
      rows.push([r.email, r.name, r.status, r.source, r.createdAt.toISOString(), r.unsubscribedAt?.toISOString() ?? ''])
    }
    if (page.length < EXPORT_PAGE) break
    cursor = page[page.length - 1]!.id
  }
  return { csv: toCsv(['email', 'name', 'status', 'source', 'added', 'unsubscribed'], rows), rows: rows.length, name: list.name }
}

/** A file name for a download: the slug of a title plus today's date. */
export function exportFileName(title: string, now = new Date()): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'export'
  return `${slug}-${now.toISOString().slice(0, 10)}.csv`
}

// ── Suppressions ───────────────────────────────────────────────────────

/** Whether one address is suppressed, and why — without storing or logging it. */
export async function suppressionFor(email: string): Promise<{ reason: string; createdAt: Date } | null> {
  const e = normaliseListEmail(email)
  if (!e) return null
  return db.newsletterSuppression.findUnique({
    where: { emailHash: newsletterEmailHash(e) },
    select: { reason: true, createdAt: true },
  })
}
