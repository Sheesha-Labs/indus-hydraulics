import 'server-only'
import {
  descriptionSimilarity,
  enquiryRefOf,
  extractableSegments,
  parsePrintedDate,
  segmentEmail,
  workingDaysBetween,
  type WeekendTable,
} from '@indus/ops-core'
import { resolveSpan, type SourceSpanDraft } from '@indus/ops-ai'
import { opsDb, type Prisma } from '@indus/ops-db'
import { createEnquiryFromBatch } from '../../enquiry/from-batch'
import { bumpIntake } from '../../intake/live'
import { saveSpans } from '../../intake/spans'
import { holidaysFor } from '../../mail-send/slot'
import { getSetting } from '../../settings/get'
import {
  PROMPT_VERSION,
  SYSTEM_PARTS,
  TERM_LABELS,
  createEnquirySchema,
  createEnquiryUser,
  type CreateEnquiryOutput,
} from '../prompts/create-enquiry.v1'
import { actionDefinition, registerAction } from '../registry'
import { actionRequestEvent } from '../request'
import { writeTracked } from '../write-tracked'
import type { ActionDefinition, Check, EffectEvent, ProposalReason } from '../types'

/**
 * Action #4 Create enquiry (S08-T06, board 92). A live client enquiry in sales@ or purchase@ has already been read
 * into an intake batch (body + attachments, extract_lines per file); once every file is settled, this action
 * unpacks the email — the real client behind a forward, the client's reference, the dates and terms in the cover
 * email — and proposes "Create enquiry ENQ-… for <client>". Careful: it asks (Draft and ask). Nothing is created
 * until a person approves; then one transaction allocates the ENQ number, writes the enquiry and its Sure and
 * Likely lines, links the thread, and the follow-ups go out: labels, ops/enquiry.created, the acknowledgement
 * (#6) and one question card per Unsure line. Instead of a new enquiry the card can say Revision (the client
 * reference matches an open enquiry) or Duplicate (same reference, or most lines match one received inside the
 * duplicate window), with the choice on the card.
 *
 * Imported and backfilled mail never reaches here (the router acts on live mail only).
 */
interface Line {
  id: string
  description: string
  qty: string | null
  confidence: 'sure' | 'likely' | 'unsure'
  file: string | null
}

export interface CreateEnquiryInput {
  messageId: string
  batchId: string
  batchVersion: number
  mailbox: string
  threadId: string
  from: string
  fromAddress: string
  to: string
  subject: string
  body: string
  textHash: string | null
  sentAt: string
  attachments: string[]
  sender: {
    companyId: string
    companyName: string
    contactId: string | null
    how: 'contact' | 'domain'
  } | null
  lines: Line[]
  nextRef: string | null
  open: Array<{
    enquiryId: string
    ref: string
    clientRef: string | null
    clientId: string | null
    receivedAt: string
    lines: string[]
  }>
  windowDays: number
  today: string
  /**
   * S09-T06 (171b state 5): the client replied in the thread of an enquiry we regretted, naming new lines. The new
   * enquiry is linked to it (relatedEnquiryId); the regretted one stays Regretted.
   */
  related: { enquiryId: string; ref: string } | null
}

export interface Variant {
  kind: 'revision' | 'duplicate'
  enquiryId: string
  ref: string
  reason: string
}

export interface CreateEnquiryOut {
  batchId: string
  unpack: CreateEnquiryOutput
  client: {
    companyId: string | null
    contactId: string | null
    name: string
    how: 'contact' | 'domain' | 'forward' | 'new'
  }
  clientRef: string | null
  deadline: string | null
  deadlineQuote: string | null
  workingDays: number | null
  terms: Array<{
    key: keyof typeof TERM_LABELS
    label: string
    value: string
    spanId: string | null
  }>
  spans: { forward: string | null; clientRef: string | null; deadline: string | null }
  variant: Variant | null
  lineCount: number
  unsure: number
  sure: number
  file: string | null
  received: string
}

const BODY_LIMIT = 30_000

function versionsOf(input: CreateEnquiryInput): Record<string, string | number> {
  return {
    batch: input.batchVersion,
    lines: input.lines.length,
    open: input.open.map((e) => e.ref).join(',') || 'none',
  }
}

function dubaiToday(now = new Date()) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' })
    .format(now)
    .split('-')
    .map(Number)
  return { year: y!, month: m!, day: d! }
}

const isoOf = (d: { year: number; month: number; day: number }) =>
  `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`

export async function gatherCreateEnquiry(
  messageId: string,
  batchId: string
): Promise<CreateEnquiryInput> {
  const m = await opsDb.mailMessage.findUniqueOrThrow({
    where: { id: messageId },
    select: {
      id: true,
      threadId: true,
      thread: { select: { enquiry: { select: { id: true, ref: true, stage: true } } } },
      fromAddress: true,
      fromName: true,
      toAddresses: true,
      subject: true,
      bodyText: true,
      bodyTextHash: true,
      isForward: true,
      sentAt: true,
      mailbox: { select: { address: true } },
      attachments: { select: { filename: true } },
    },
  })
  const b = await opsDb.intakeBatch.findUniqueOrThrow({
    where: { id: batchId },
    select: {
      id: true,
      version: true,
      clientCompanyId: true,
      clientRef: true,
      candidates: {
        where: { decision: { notIn: ['removed', 'merged'] }, duplicateOfId: null },
        orderBy: { ord: 'asc' },
        select: {
          id: true,
          description: true,
          qty: true,
          confidence: true,
          file: { select: { filename: true, kind: true } },
        },
      },
    },
  })
  const from = m.fromAddress.toLowerCase()
  const contact = await opsDb.contact.findFirst({
    where: { email: { equals: from, mode: 'insensitive' } },
    select: { id: true, company: { select: { id: true, name: true } } },
  })
  const domainCo = contact
    ? null
    : await opsDb.company.findFirst({
        where: { domains: { has: from.split('@')[1] ?? '' } },
        select: { id: true, name: true },
      })
  const settings = await getSetting('intake')
  const windowDays = settings.duplicateWindowDays
  const since = new Date(Date.now() - Math.max(windowDays, 30) * 86_400_000)
  const companyId = contact?.company.id ?? domainCo?.id ?? b.clientCompanyId
  const open = await opsDb.enquiry.findMany({
    where: {
      closedAt: null,
      // A regretted enquiry is not a duplicate target: a reply to it is a new enquiry linked to it (171b state 5).
      stage: { not: 'regretted' },
      receivedAt: { gte: since },
      OR: [
        ...(companyId ? [{ clientId: companyId }] : []),
        ...(b.clientRef ? [{ clientRef: b.clientRef }] : []),
      ],
    },
    orderBy: { receivedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      ref: true,
      clientRef: true,
      clientId: true,
      receivedAt: true,
      lines: { select: { description: true }, take: 200 },
    },
  })
  const year = dubaiToday().year
  const counter = await opsDb.numberCounter.findUnique({
    where: { sequenceKey_scope: { sequenceKey: 'enquiry', scope: String(year) } },
    select: { nextValue: true },
  })
  const text = m.bodyText ?? ''
  // The readable part: fresh text and forwarded blocks; quoted earlier replies and signatures stay out.
  const readable = extractableSegments(segmentEmail(text, { isForward: m.isForward }))
    .map((s) => text.slice(s.start, s.end))
    .join('\n')
  return {
    messageId: m.id,
    batchId: b.id,
    batchVersion: b.version,
    mailbox: m.mailbox.address,
    threadId: m.threadId,
    from: m.fromName ? `${m.fromName} <${m.fromAddress}>` : m.fromAddress,
    fromAddress: m.fromAddress,
    to: m.toAddresses.join(', '),
    subject: m.subject ?? '',
    body: (readable || text).slice(0, BODY_LIMIT),
    textHash: m.bodyTextHash,
    sentAt: m.sentAt.toISOString(),
    attachments: m.attachments.map((a) => a.filename),
    sender: contact
      ? {
          companyId: contact.company.id,
          companyName: contact.company.name,
          contactId: contact.id,
          how: 'contact',
        }
      : domainCo
        ? { companyId: domainCo.id, companyName: domainCo.name, contactId: null, how: 'domain' }
        : null,
    lines: b.candidates.map((c) => ({
      id: c.id,
      description: c.description,
      qty: c.qty?.toString() ?? null,
      confidence: c.confidence,
      file: c.file && c.file.kind !== 'email' ? c.file.filename : null,
    })),
    nextRef: counter ? enquiryRefOf(year, Number(counter.nextValue)) : null,
    open: open.map((e) => ({
      enquiryId: e.id,
      ref: e.ref,
      clientRef: e.clientRef,
      clientId: e.clientId,
      receivedAt: e.receivedAt.toISOString(),
      lines: e.lines.map((l) => l.description),
    })),
    windowDays,
    today: new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', dateStyle: 'full' }).format(
      new Date()
    ),
    related:
      m.thread.enquiry?.stage === 'regretted'
        ? { enquiryId: m.thread.enquiry.id, ref: m.thread.enquiry.ref }
        : null,
  }
}

const empty = (v: string | null | undefined) => !v || !v.trim()

/** Revision (an open enquiry with this client reference) or Duplicate (same reference, or ≥ 80 % line match). */
export function detectVariant(
  input: Pick<CreateEnquiryInput, 'open' | 'lines' | 'windowDays' | 'sentAt'>,
  clientRef: string | null,
  clientId: string | null,
  revision: CreateEnquiryOutput['revision']
): Variant | null {
  const sent = new Date(input.sentAt).getTime()
  const within = (iso: string) => sent - new Date(iso).getTime() <= input.windowDays * 86_400_000
  const norm = (s: string | null) => (s ?? '').replace(/[^A-Z0-9]/gi, '').toUpperCase()
  if (clientRef) {
    const same = input.open.find((e) => e.clientRef && norm(e.clientRef) === norm(clientRef))
    if (same) {
      const changed =
        !revision.isRevision && within(same.receivedAt) && lineShare(input.lines, same.lines) >= 0.8
      return changed
        ? {
            kind: 'duplicate',
            enquiryId: same.enquiryId,
            ref: same.ref,
            reason: `The same reference ${clientRef} came in ${dayWord(same.receivedAt, input.sentAt)}.`,
          }
        : {
            kind: 'revision',
            enquiryId: same.enquiryId,
            ref: same.ref,
            reason: `Client ref matches ${clientRef} on ${same.ref}.`,
          }
    }
  }
  if (revision.isRevision && !empty(revision.earlierRef)) {
    const earlier = input.open.find(
      (e) => e.clientRef && norm(e.clientRef) === norm(revision.earlierRef)
    )
    if (earlier)
      return {
        kind: 'revision',
        enquiryId: earlier.enquiryId,
        ref: earlier.ref,
        reason: `The email revises ${revision.earlierRef}, open as ${earlier.ref}.`,
      }
  }
  const dup = input.open.find(
    (e) =>
      (!clientId || e.clientId === clientId) &&
      within(e.receivedAt) &&
      lineShare(input.lines, e.lines) >= 0.8
  )
  return dup
    ? {
        kind: 'duplicate',
        enquiryId: dup.enquiryId,
        ref: dup.ref,
        reason: `Most lines match ${dup.ref}, received ${dayWord(dup.receivedAt, input.sentAt)}.`,
      }
    : null
}

function lineShare(lines: readonly Line[], other: readonly string[]): number {
  if (!lines.length || !other.length) return 0
  const hits = lines.filter((l) =>
    other.some((o) => descriptionSimilarity(l.description, o) >= 0.8)
  )
  return hits.length / lines.length
}

function dayWord(iso: string, nowIso: string): string {
  const days = Math.round((new Date(nowIso).getTime() - new Date(iso).getTime()) / 86_400_000)
  return days <= 0 ? 'earlier today' : days === 1 ? 'yesterday' : `${days} days ago`
}

const definition: ActionDefinition<CreateEnquiryInput, CreateEnquiryOut> = {
  key: 'create_enquiry',
  group: 'enquiries',
  aiPurpose: 'extract',
  external: false,
  concurrencyGroup: 'intake',
  surface: 'review',

  estimate: (input) => ({ chars: input.body.length + 2_000, maxTokens: 2_500 }),

  async gather({ request }) {
    const input = await gatherCreateEnquiry(request.subjectId, String(request.sourceVersion))
    return { input, versions: versionsOf(input) }
  },

  // The same keys as gather: the batch (a person edited its lines), its line count, the open enquiries it was
  // compared with. Any change makes the card stale until it is redrafted.
  async currentVersions(request) {
    const b = await opsDb.intakeBatch.findUnique({
      where: { id: String(request.sourceVersion) },
      select: { status: true },
    })
    if (b?.status !== 'open') return { batch: -1, lines: -1, open: 'closed' }
    return versionsOf(await gatherCreateEnquiry(request.subjectId, String(request.sourceVersion)))
  },

  async propose(input, ai) {
    const res = await ai.call({
      route: 'capture',
      system: SYSTEM_PARTS,
      user: createEnquiryUser({
        today: input.today,
        sentAt: input.sentAt,
        mailbox: input.mailbox,
        from: input.from,
        to: input.to,
        subject: input.subject,
        body: input.body,
        attachments: input.attachments,
      }),
      zod: createEnquirySchema,
      maxTokens: 2_500,
      promptVersion: PROMPT_VERSION,
    })
    if (!res.ok)
      return {
        ok: false,
        reason: res.reason,
        detail: res.detail,
        costUsd: res.costUsd,
        callIds: res.callIds,
      }
    return {
      ok: true,
      // Only the model's unpack here; verify adds everything code decides.
      out: { unpack: res.value } as unknown as CreateEnquiryOut,
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(raw, input) {
    // `propose` returns the model's unpack; everything below is decided in code.
    const unpack = createEnquirySchema.parse(raw.unpack)
    const src = {
      kind: 'email' as const,
      sourceId: input.messageId,
      text: input.body,
      textHash: input.textHash,
    }
    const drafts: Array<{ key: string; d: SourceSpanDraft }> = []
    const quote = (key: string, field: string, q: string) => {
      if (empty(q)) return
      const d = resolveSpan(src, { field, quote: q })
      if (d.resolved !== 'unresolved') drafts.push({ key, d })
    }
    quote('forward', 'client', unpack.realClient.quote)
    quote('clientRef', 'clientRef', unpack.clientRef.quote)
    quote('deadline', 'deadline', unpack.quoteDueBy.quote)
    for (const k of Object.keys(TERM_LABELS) as Array<keyof typeof TERM_LABELS>)
      quote(`term:${k}`, k, unpack.terms[k].quote)
    const ids = await saveSpans(drafts.map((x) => x.d))
    const spanOf = (key: string) => {
      const i = drafts.findIndex((x) => x.key === key)
      return i >= 0 ? (ids[i] ?? null) : null
    }

    // The real client: a forwarded original sender wins over the colleague who forwarded it.
    let client: CreateEnquiryOut['client'] = input.sender
      ? {
          companyId: input.sender.companyId,
          contactId: input.sender.contactId,
          name: input.sender.companyName,
          how: input.sender.how,
        }
      : {
          companyId: null,
          contactId: null,
          name: unpack.realClient.companyName || input.fromAddress,
          how: 'new',
        }
    const original = unpack.realClient.email.trim().toLowerCase()
    if (unpack.isForward && original && original !== input.fromAddress.toLowerCase()) {
      const c = await opsDb.contact.findFirst({
        where: { email: { equals: original, mode: 'insensitive' } },
        select: { id: true, company: { select: { id: true, name: true } } },
      })
      const co = c
        ? null
        : await opsDb.company.findFirst({
            where: { domains: { has: original.split('@')[1] ?? '' } },
            select: { id: true, name: true },
          })
      client = c
        ? { companyId: c.company.id, contactId: c.id, name: c.company.name, how: 'forward' }
        : co
          ? { companyId: co.id, contactId: null, name: co.name, how: 'forward' }
          : {
              companyId: null,
              contactId: null,
              name: unpack.realClient.companyName || original,
              how: 'new',
            }
    }

    const clientRef = empty(unpack.clientRef.value) ? null : unpack.clientRef.value.trim()
    const anchor = new Date(input.sentAt)
    const due = empty(unpack.quoteDueBy.value)
      ? null
      : parsePrintedDate(unpack.quoteDueBy.value, anchor)
    let workingDays: number | null = null
    if (due) {
      const [y, m, d] = due.date.split('-').map(Number)
      const weekends = (await getSetting('calendar.country_weekends')) as WeekendTable
      workingDays = workingDaysBetween(
        dubaiToday(),
        { year: y!, month: m!, day: d! },
        'AE',
        await holidaysFor(['AE'], new Date(), 60),
        weekends
      )
    }
    const terms = (Object.keys(TERM_LABELS) as Array<keyof typeof TERM_LABELS>)
      .filter((k) => !empty(unpack.terms[k].value))
      .map((k) => ({
        key: k,
        label: TERM_LABELS[k],
        value: unpack.terms[k].value.trim(),
        spanId: spanOf(`term:${k}`),
      }))
    const variant = detectVariant(input, clientRef, client.companyId, unpack.revision)
    const unsure = input.lines.filter((l) => l.confidence === 'unsure').length
    const sure = input.lines.filter((l) => l.confidence === 'sure').length
    const files = input.lines.flatMap((l) => (l.file ? [l.file] : []))
    const file = files.length
      ? [...files].sort(
          (a, b) => files.filter((x) => x === b).length - files.filter((x) => x === a).length
        )[0]!
      : null

    const out: CreateEnquiryOut = {
      batchId: input.batchId,
      unpack,
      client,
      clientRef,
      deadline: due?.date ?? null,
      deadlineQuote: empty(unpack.quoteDueBy.value) ? null : unpack.quoteDueBy.value,
      workingDays,
      terms,
      spans: {
        forward: spanOf('forward'),
        clientRef: spanOf('clientRef'),
        deadline: spanOf('deadline'),
      },
      variant,
      lineCount: input.lines.length,
      unsure,
      sure,
      file,
      received: input.sentAt,
    }
    const checks: Check[] = [
      {
        label: `${input.lines.length} line${input.lines.length === 1 ? '' : 's'} read from ${file ? 'the ' + (/\.pdf$/i.test(file) ? 'PDF' : 'file') : 'the email'}`,
        status: input.lines.length ? 'pass' : 'fail',
        detail: unsure ? `${unsure} Unsure` : 'none Unsure',
      },
      {
        label: 'Cover-email terms captured',
        status: 'pass',
        detail: `${terms.length} found`,
      },
      ...(workingDays !== null
        ? [
            {
              label: `Deadline in ${workingDays} working day${workingDays === 1 ? '' : 's'}`,
              status: workingDays < 5 ? ('warn' as const) : ('pass' as const),
              detail:
                workingDays < 5 ? 'under a week' : isoOf(dubaiToday()) === due?.date ? 'today' : '',
            },
          ]
        : [{ label: 'No deadline stated', status: 'warn' as const, detail: 'ask or assume' }]),
      {
        label: client.companyId ? `Client found: ${client.name}` : `New client: ${client.name}`,
        status: client.companyId ? 'pass' : 'warn',
      },
    ]
    const confidence = !input.lines.length
      ? 'unsure'
      : client.companyId && sure > 0
        ? 'sure'
        : 'likely'
    return {
      out,
      checks,
      confidence,
      ...(input.lines.length
        ? {}
        : { unsure: [{ field: 'lines', why: 'No lines were read from this email or its files' }] }),
    }
  },

  toProposal(v, input) {
    const o = v.out
    const date = o.deadline
      ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
          .format(new Date(`${o.deadline}T00:00:00Z`))
          .replace('Sept', 'Sep')
      : null
    const head = `Create enquiry ${input.nextRef ?? 'ENQ-…'} for ${o.client.name} from this email · ${o.lineCount} line${o.lineCount === 1 ? '' : 's'}${o.file ? ` from ${o.file}` : ''}${date ? ` · deadline ${date}` : ''}.`
    const reasons: ProposalReason[] = []
    if (o.unpack.isForward)
      reasons.push({
        text: `Forwarded by ${o.unpack.forwardedBy || 'a colleague'}; the original sender is ${o.unpack.realClient.contactName || o.unpack.realClient.email || o.client.name}${o.client.contactId ? ', an existing client contact' : o.client.companyId ? ` at ${o.client.name}` : ', not yet in the directory'}.`,
        ...(o.spans.forward ? { spanIds: [o.spans.forward] } : {}),
      })
    if (o.clientRef)
      reasons.push({
        text: o.variant
          ? o.variant.reason
          : `Client reference ${o.clientRef} has not been seen before.`,
        ...(o.spans.clientRef ? { spanIds: [o.spans.clientRef] } : {}),
      })
    if (o.terms.length)
      reasons.push({
        text: `Terms in the email: ${o.terms.map((t) => `${t.label.toLowerCase()} ${t.value}`).join('; ')}.`,
        spanIds: o.terms.flatMap((t) => (t.spanId ? [t.spanId] : [])),
      })
    const options =
      o.variant?.kind === 'duplicate'
        ? [
            {
              key: 'merge',
              label: `Merge into ${o.variant.ref}`,
              consequence: `Links this email to ${o.variant.ref}; no new enquiry.`,
            },
            { key: 'treat_new', label: 'Treat as new', consequence: 'Creates a separate enquiry.' },
          ]
        : o.variant?.kind === 'revision'
          ? [
              {
                key: 'treat_new',
                label: 'Treat as new',
                consequence: 'Creates a separate enquiry.',
              },
              {
                key: 'revision_impact',
                label: 'Open revision impact',
                consequence: 'Arrives with S23.',
              },
            ]
          : null
    if (input.related)
      reasons.unshift({
        text: `The client replied in the thread of ${input.related.ref}, which was regretted, and names new lines.`,
      })
    return {
      headline: input.related
        ? `Open ${input.nextRef ?? 'a new enquiry'}, linked to the regretted ${input.related.ref}. ${head}`
        : o.variant?.kind === 'duplicate'
          ? `Duplicate of ${o.variant.ref}? ${head}`
          : o.variant?.kind === 'revision'
            ? `Looks like a revision of ${o.variant.ref}. ${head}`
            : head,
      reasons,
      preview: {
        client: o.client.name,
        clientRef: o.clientRef,
        deadline: o.deadline,
        terms: o.terms.map((t) => ({ label: t.label, value: t.value })),
        lines: input.lines
          .slice(0, 30)
          .map((l) => ({ description: l.description, qty: l.qty, confidence: l.confidence })),
      } as Prisma.InputJsonValue,
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: o.unsure
        ? `${o.unsure} line${o.unsure === 1 ? '' : 's'} become questions after approval`
        : null,
      onApproveText: input.related
        ? `${input.related.ref} stays Regretted; the new enquiry gets its own quick read and acknowledgement.`
        : 'Creates the enquiry, links this thread, drafts the acknowledgement and starts grouping lines for supplier RFQs.',
      options,
    }
  },

  async effect(tx, v, ctx) {
    const o = v.out
    const batchId = String(ctx.request.sourceVersion)
    const messageId = ctx.request.subjectId
    if (ctx.chosenOption === 'revision_impact')
      throw new Error('Revision impact arrives with S23: choose Treat as new, or reject.')
    if (ctx.chosenOption === 'merge' && o.variant) {
      // Duplicate: this email joins the existing enquiry; no new number, no new lines.
      const variant = o.variant
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId: ctx.actionId,
          enquiryId: variant.enquiryId,
          subjectType: 'mail_message',
          subjectId: messageId,
          changes: [{ field: 'linked to', before: null, after: variant.ref, kind: 'status' }],
          note: `Merged as a duplicate into ${variant.ref}`,
        },
        async (t) => {
          await t.mailLink.upsert({
            where: {
              messageId_subjectType_subjectId: {
                messageId,
                subjectType: 'enquiry',
                subjectId: variant.enquiryId,
              },
            },
            create: {
              messageId,
              enquiryId: variant.enquiryId,
              subjectType: 'enquiry',
              subjectId: variant.enquiryId,
              linkedBy: 'assistant',
              confidence: 'sure',
              actionId: ctx.actionId,
            },
            update: {},
          })
          await t.intakeBatch.update({ where: { id: batchId }, data: { status: 'cancelled' } })
        }
      )
      await bumpIntake(batchId, tx)
      return {
        note: `Merged into ${variant.ref}`,
        emit: [labelEvent(messageId, ctx.actionId, variant.enquiryId)],
      }
    }
    // 171b state 5: read before the new enquiry takes the thread over.
    const regretted = await tx.mailMessage.findUnique({
      where: { id: messageId },
      select: { thread: { select: { enquiry: { select: { id: true, ref: true, stage: true } } } } },
    })
    const related =
      regretted?.thread.enquiry?.stage === 'regretted' ? regretted.thread.enquiry : null
    const made = await createEnquiryFromBatch(tx, {
      batchId,
      actor: { kind: 'assistant', actionId: ctx.actionId },
      receivedVia: o.unpack.isForward ? 'forwarded_email' : 'email',
      receivedAt: new Date(o.received),
      clientId: o.client.companyId,
      contactId: o.client.contactId,
      clientRef: o.clientRef,
      deadline: o.deadline ? new Date(`${o.deadline}T14:00:00.000Z`) : null,
      terms: {
        incoterm: o.terms.find((t) => t.key === 'incoterm')?.value ?? null,
        place: null,
        payment: o.terms.find((t) => t.key === 'payment')?.value ?? null,
        compliance: o.terms.find((t) => t.key === 'compliance')?.value ?? null,
      },
      includePendingConfident: true,
    })
    if (related)
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId: ctx.actionId,
          enquiryId: made.enquiryId,
          subjectType: 'enquiry',
          subjectId: made.enquiryId,
          changes: [{ field: 'relatedEnquiry', before: null, after: related.ref, kind: 'link' }],
          note: `Linked to the regretted ${related.ref}`,
        },
        (t) =>
          t.enquiry.update({
            where: { id: made.enquiryId },
            data: { relatedEnquiryId: related.id },
          })
      )
    const skip = await ackSkip(tx, o.client.companyId)
    if (skip)
      // Board 93 "Skipped · learned per client": no acknowledgement for this client, logged with the reason.
      await writeTracked(
        tx,
        {
          actor: { kind: 'assistant' },
          actionId: ctx.actionId,
          enquiryId: made.enquiryId,
          subjectType: 'enquiry',
          subjectId: made.enquiryId,
          changes: [{ field: 'acknowledgement', before: null, after: 'skipped', kind: 'status' }],
          note: skip,
        },
        async () => undefined
      )
    const emit: EffectEvent[] = [
      labelEvent(messageId, ctx.actionId, made.enquiryId),
      {
        name: 'ops/enquiry.created',
        id: `enquiry-created:${made.enquiryId}`,
        data: { enquiryId: made.enquiryId, ref: made.ref, actionId: ctx.actionId },
      },
      ...requestEvents('qualify_enquiry', made.enquiryId, [made.ref]),
      ...(skip ? [] : requestEvents('ack_email', made.enquiryId, [made.ref])),
      ...requestEvents('resolve_extracted_line', made.enquiryId, made.unsureIds),
    ]
    return {
      note: `Created ${made.ref} · ${made.lineCount} line${made.lineCount === 1 ? '' : 's'}${made.unsureIds.length ? ` · ${made.unsureIds.length} to answer` : ''}`,
      emit,
    }
  },

  /**
   * Inside the undo window, and only while no acknowledgement has left: the enquiry is closed (never deleted),
   * the thread unlinked and the intake reopened, so approving again makes a new enquiry. (decision) The ENQ
   * number stays on the closed enquiry rather than being released: the closed row keeps its unique ref, so a
   * released number would be handed out again and collide. The gap shows as an enquiry closed "undone".
   */
  async undo(tx, action) {
    const b = await tx.intakeBatch.findUnique({
      where: { id: action.output.batchId },
      select: { id: true, enquiryId: true },
    })
    const enquiryId = b?.enquiryId
    if (!b || !enquiryId) return
    const e = await tx.enquiry.findUniqueOrThrow({
      where: { id: enquiryId },
      select: { ref: true, stage: true },
    })
    const sent = await tx.outboundEmail.count({
      where: { enquiryId, status: { in: ['sending', 'sent', 'unknown'] } },
    })
    if (sent)
      throw new Error(
        'The acknowledgement has already gone to the client: close the enquiry instead.'
      )
    await writeTracked(
      tx,
      {
        actor: { kind: 'assistant' },
        actionId: action.id,
        enquiryId,
        subjectType: 'enquiry',
        subjectId: enquiryId,
        changes: [{ field: 'closed', before: null, after: 'undone', kind: 'status' }],
        note: `Undone: ${e.ref} closed, the email unlinked, its lines back in review`,
      },
      async (t) => {
        await t.enquiry.update({
          where: { id: enquiryId },
          data: { closedReason: 'other', closeNote: 'undone', closedAt: new Date() },
        })
        await t.mailLink.deleteMany({
          where: { enquiryId, subjectType: 'enquiry', subjectId: enquiryId },
        })
        await t.mailThread.updateMany({ where: { enquiryId }, data: { enquiryId: null } })
        await t.intakeBatch.update({
          where: { id: b.id },
          data: { status: 'open', enquiryId: null, confirmedAt: null, confirmedById: null },
        })
      }
    )
  },
}

/**
 * Why a client gets no acknowledgement, or null: their profile says so, or an active learned or manual
 * preference of kind acknowledgement_skip ("no need to acknowledge, just send the offer").
 */
export async function ackSkip(
  tx: Prisma.TransactionClient,
  companyId: string | null
): Promise<string | null> {
  if (!companyId) return null
  const [profile, pref] = await Promise.all([
    tx.clientProfile.findUnique({
      where: { companyId },
      select: { acknowledgeEnquiries: true, company: { select: { name: true } } },
    }),
    tx.preference.findFirst({
      where: { companyId, kind: 'acknowledgement_skip', active: true, disabledAt: null },
      orderBy: { createdAt: 'desc' },
      select: { id: true, description: true, createdAt: true, company: { select: { name: true } } },
    }),
  ])
  if (pref) {
    const day = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dubai',
      day: 'numeric',
      month: 'short',
    })
      .format(pref.createdAt)
      .replace('Sept', 'Sep')
    return `Not sent. ${pref.company?.name ?? 'The client'} asked on ${day}: “${pref.description}” · preference ${pref.id}`
  }
  if (profile && !profile.acknowledgeEnquiries)
    return `Not sent. ${profile.company.name} does not want acknowledgements (client profile)`
  return null
}

function labelEvent(messageId: string, actionId: string, enquiryId: string): EffectEvent {
  return {
    name: 'ops/mail.linked',
    id: `mail-linked:${messageId}:${actionId}`,
    data: { messageId, actionId, subjectType: 'enquiry', subjectId: enquiryId, enquiryId },
  }
}

/** Follow-up actions on the new enquiry, as the runner's own request events (idempotent per version). */
function requestEvents(
  actionKey: string,
  enquiryId: string,
  versions: readonly string[]
): EffectEvent[] {
  // An action not registered in this build (a later sprint's) is simply not requested.
  if (!actionDefinition(actionKey)) return []
  return versions.map((v) => {
    const e = actionRequestEvent({
      actionKey,
      subjectType: 'enquiry',
      subjectId: enquiryId,
      enquiryId,
      trigger: 'enquiry.created',
      origin: 'live',
      sourceVersion: v,
    })
    return { name: e.name, id: e.id, data: plain(e.data) }
  })
}

function plain(d: object): EffectEvent['data'] {
  return Object.fromEntries(
    Object.entries(d).filter(
      ([, v]) => v === null || ['string', 'number', 'boolean'].includes(typeof v)
    )
  ) as EffectEvent['data']
}

registerAction(definition)
export default definition
