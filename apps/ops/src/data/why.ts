import 'server-only'
import { cache } from 'react'
import { opsDb, type $Enums } from '@indus/ops-db'
import {
  encodeEvidenceId,
  parseEvidenceId,
  parseProposal,
  sourceWindow,
  type EvidenceRef,
  type StoredCheck,
} from '@indus/ops-core'
import type { OpsUser } from '../lib/access-core'
import { env } from '../lib/env'
import { evidenceFixture } from './why-fixture'
import { correctableFor, type CorrectionChoice } from '../server/assistant/actions/override-value'
import { LEVEL_LABEL } from './proposal-mapper'
import '../server/assistant/actions'

/**
 * The Why? read (S06-T05, board 112, ADR-12): what an action decided, its reasons with the exact source text
 * highlighted, the alternatives and why they lost, the code checks, the confidence, the value's history, and
 * what a person may change it to.
 *
 * Two round trips: the action (or the history row and its action), then in parallel its spans, the source
 * message, the subject's history and the team's initials. (decision) That is more than the two queries of
 * CLAUDE.md §6.1, which counts round trips for list pages; a drawer that names its sources needs the sources.
 *
 * A Helper without "can see margins" gets sensitive history rows as "Hidden" and no cost line: masked here,
 * never sent.
 */
export type WhyTab = 'reasons' | 'sources' | 'history'
export type SourceFileType = 'MAIL' | 'PDF' | 'XLS' | 'DOC' | 'IMG'

export interface WhySpan {
  key: string
  /** The reason this span backs, when known. */
  reasonIndex: number | null
  sourceKind: string
  fileType: SourceFileType
  doc: string
  meta: string
  text: string
  match: string
  matchAt?: number
  location: string
  openHref: string
  /** The source text no longer hashes to what was read: the offsets may be off. */
  changed: boolean
  /** A scanned page with no text layer: the page frame only. */
  pageOnly: boolean
}

export interface WhyHistoryRow {
  key: string
  time: string
  who: string
  field: string
  before: string
  after: string
  note: string | null
  /** This row's own evidence id (ae_<id>), or the action's when the Assistant made it. */
  evidenceId: string
}

export interface WhyCorrection {
  /** The action ref the correction is made against. */
  actionRef: string
  label: string
  valueType: 'class' | 'option' | 'text'
  current: string | null
  choices: CorrectionChoice[]
  consequence: string
  /** The value can also be searched for (a linked record: Link to…'s search for this message). */
  search: { kind: 'link'; messageId: string } | null
}

export interface WhyView {
  id: string
  /** "Why? · Mail". */
  eyebrow: string
  /** The decision statement. */
  title: string
  initialTab: WhyTab
  /** The span the link pointed at (a reason's), highlighted as active. */
  activeSpan: string | null
  reasons: Array<{ text: string; evidence?: { label: string; evidenceId: string } }>
  alternatives: Array<{ key: string; label: string; why: string }>
  checks: Array<{ key: string; mark: 'ok' | 'warn' | 'bad'; text: string; right: string }>
  confidence: { level: 'Sure' | 'Likely' | 'Unsure'; reason?: string } | null
  /** "Do quietly · claude-haiku-5-5 · classify-mail.v1 · $0.0012" (cost for the Owner only). */
  footnote: string | null
  spans: WhySpan[]
  /** When there is nothing to highlight, why ("Found by the mail checks; no quoted text"). */
  noQuote: string | null
  history: WhyHistoryRow[]
  correction: WhyCorrection | null
  /** The action was reverted or corrected later. */
  overridden: string | null
}

type Viewer = Pick<OpsUser, 'role' | 'canSeeMargins'>

const AREA: Record<string, string> = {
  mail: 'Mail',
  classify_mail: 'Mail',
  link_mail: 'Mail',
  ooo_facts: 'Mail',
}

const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })
const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
/** "24 Sep 10:02" (Dubai). */
const TIME = { format: (d: Date) => `${DAY.format(d)} ${CLOCK.format(d)}` }

const MARK: Record<StoredCheck['status'], 'ok' | 'warn' | 'bad'> = {
  pass: 'ok',
  warn: 'warn',
  fail: 'bad',
}

const CONFIDENCE: Record<$Enums.Confidence, 'Sure' | 'Likely' | 'Unsure'> = {
  sure: 'Sure',
  likely: 'Likely',
  unsure: 'Unsure',
}

function shown(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'string') return v.replace(/_/g, ' ')
  return JSON.stringify(v)
}

/** A quoted phrase inside a reason's text: “…”. */
function quoteIn(text: string): string | null {
  const m = /“([^”]{2,})”/.exec(text)
  return m?.[1] ?? null
}

const ACTION_SELECT = {
  id: true,
  ref: true,
  actionKey: true,
  surface: true,
  state: true,
  levelAtTime: true,
  headline: true,
  reasons: true,
  preview: true,
  checks: true,
  confidence: true,
  unsureAbout: true,
  options: true,
  onApproveText: true,
  subjectType: true,
  subjectId: true,
  model: true,
  promptVersion: true,
  costUsd: true,
  createdAt: true,
  def: { select: { label: true, group: true } },
} as const

async function loadAction(e: EvidenceRef) {
  if (e.kind === 'event') {
    const ev = await opsDb.activityEvent.findUnique({ where: { id: e.eventId } })
    if (!ev) return null
    const action = ev.actionId
      ? await opsDb.assistantAction.findUnique({ where: { id: ev.actionId }, select: ACTION_SELECT })
      : null
    return { action, event: ev }
  }
  if (e.kind === 'fixture') return null
  const action = await opsDb.assistantAction.findUnique({
    where: { ref: e.ref },
    select: ACTION_SELECT,
  })
  return action ? { action, event: null } : null
}

type LoadedAction = NonNullable<NonNullable<Awaited<ReturnType<typeof loadAction>>>['action']>
type LoadedEvent = NonNullable<Awaited<ReturnType<typeof loadAction>>>['event']

function historyRows(
  rows: Array<{
    id: string
    at: Date
    actorKind: $Enums.ActorKind
    actorId: string | null
    actionId: string | null
    field: string | null
    before: unknown
    after: unknown
    note: string | null
    sensitive: boolean
  }>,
  initials: Map<string, string>,
  refs: Map<string, string>,
  masked: boolean
): WhyHistoryRow[] {
  return rows.map((r) => {
    const hide = masked && r.sensitive
    const ref = r.actionId ? refs.get(r.actionId) : undefined
    return {
      key: r.id,
      time: TIME.format(r.at),
      who:
        r.actorKind === 'assistant'
          ? `Assistant${ref ? ` · ${ref}` : ''}`
          : r.actorKind === 'user'
            ? (initials.get(r.actorId ?? '') ?? 'Someone')
            : 'System',
      field: r.field ?? '—',
      before: hide ? 'Hidden' : shown(r.before),
      after: hide ? 'Hidden' : shown(r.after),
      note: r.note,
      evidenceId:
        r.actorKind === 'assistant' && ref
          ? encodeEvidenceId({ kind: 'field', ref, field: r.field ?? 'value' })
          : encodeEvidenceId({ kind: 'event', eventId: r.id }),
    }
  })
}

async function build(
  e: EvidenceRef,
  action: LoadedAction | null,
  event: LoadedEvent,
  viewer: Viewer
): Promise<WhyView | null> {
  const masked = viewer.role !== 'owner' && !viewer.canSeeMargins
  const subjectType = action?.subjectType ?? event?.subjectType ?? null
  const subjectId = action?.subjectId ?? event?.subjectId ?? null
  if (!action && !event) return null

  const parsed = action
    ? parseProposal(action.actionKey, {
        headline: action.headline,
        reasons: (action.reasons as never) ?? [],
        checks: (action.checks as never) ?? [],
        confidence: action.confidence,
        unsureAbout: action.unsureAbout,
        options: (action.options as never) ?? null,
        onApproveText: action.onApproveText,
        preview: action.preview,
        surface: action.surface,
      })
    : null
  const p = parsed?.ok ? parsed.proposal : null
  const reasons = p?.reasons ?? []
  const spanIds = reasons.flatMap((r) => r.spanIds ?? [])
  const isMail = subjectType === 'mail_message' && !!subjectId

  const [spans, message, history, team, revertedBy] = await Promise.all([
    action && (spanIds.length || isMail)
      ? opsDb.sourceSpan.findMany({
          where: {
            OR: [
              ...(spanIds.length ? [{ id: { in: spanIds } }] : []),
              ...(isMail ? [{ sourceKind: 'email', sourceId: subjectId! }] : []),
            ],
            resolved: { not: 'unresolved' },
          },
          orderBy: { createdAt: 'desc' },
          take: 40,
        })
      : Promise.resolve([]),
    isMail
      ? opsDb.mailMessage.findUnique({
          where: { id: subjectId! },
          select: {
            id: true,
            threadId: true,
            subject: true,
            bodyText: true,
            bodyTextHash: true,
            fromAddress: true,
            sentAt: true,
            classification: true,
          },
        })
      : Promise.resolve(null),
    subjectType && subjectId
      ? opsDb.activityEvent.findMany({
          where: {
            subjectType: subjectType as $Enums.RecordType,
            subjectId,
            ...(e.kind === 'field' ? { field: e.field } : {}),
            ...(event?.field ? { field: event.field } : {}),
          },
          orderBy: { at: 'desc' },
          take: 30,
        })
      : Promise.resolve([]),
    opsDb.user.findMany({ select: { id: true, initials: true } }),
    action
      ? opsDb.assistantAction.findMany({
          where: { revertOfId: action.id },
          select: { id: true, ref: true, headline: true },
          take: 1,
        })
      : Promise.resolve([]),
  ])

  const initials = new Map(team.map((u) => [u.id, u.initials]))
  const refs = new Map<string, string>(action ? [[action.id, action.ref]] : [])
  // An action's history: the fields it set (or the one the link named), newest first.
  const own = action ? correctableFor(action.actionKey)?.field : undefined
  const fields = new Set(
    own ? [own] : history.filter((h) => action && h.actionId === action.id).map((h) => h.field)
  )
  const relevant =
    e.kind === 'field' || event?.field || fields.size === 0
      ? history
      : history.filter((h) => fields.has(h.field))
  const historyView = historyRows(relevant, initials, refs, masked)

  // Spans: the stored ids first, else the subject's email spans matched to a reason by its quote.
  const sourceText = message ? `${message.subject ?? ''}\n${message.bodyText ?? ''}` : ''
  const byQuote = new Map<string, (typeof spans)[number]>()
  for (const s of spans) if (!byQuote.has(s.quote)) byQuote.set(s.quote, s)
  const picked: Array<{ span: (typeof spans)[number]; reasonIndex: number | null }> = []
  reasons.forEach((r, i) => {
    const ids = r.spanIds ?? []
    const stored = spans.filter((s) => ids.includes(s.id))
    if (stored.length) for (const s of stored) picked.push({ span: s, reasonIndex: i })
    else {
      const q = quoteIn(r.text)
      const s = q ? byQuote.get(q) : undefined
      if (s && !picked.some((x) => x.span.id === s.id)) picked.push({ span: s, reasonIndex: i })
    }
  })

  const spanViews = picked.flatMap(({ span, reasonIndex }): WhySpan[] => {
    if (span.sourceKind === 'email' && message) {
      const changed = !!span.textHash && span.textHash !== message.bodyTextHash
      const w =
        span.charStart !== null && span.charEnd !== null
          ? sourceWindow(sourceText, span.charStart, span.charEnd)
          : null
      const usable = w && !changed && w.match === span.quote ? w : null
      return [
        {
          key: span.id,
          reasonIndex,
          sourceKind: 'email',
          fileType: 'MAIL' as const,
          doc: message.subject || '(no subject)',
          meta: `Email · ${TIME.format(message.sentAt)} · ${message.fromAddress}`,
          text: usable ? usable.text : `“${span.quote}”`,
          match: usable ? usable.match : span.quote,
          ...(usable ? { matchAt: usable.matchAt } : {}),
          location: usable ? `Paragraph ${usable.paragraph}` : 'As quoted when it was read',
          openHref: `/mail/all/${message.threadId}`,
          changed,
          pageOnly: false,
        },
      ]
    }
    // S08 fills pdf / sheet / docx; until then a span of another kind shows its quote alone.
    return [
      {
        key: span.id,
        reasonIndex,
        sourceKind: span.sourceKind,
        fileType: span.sourceKind === 'sheet' ? 'XLS' : span.sourceKind === 'docx' ? 'DOC' : 'PDF',
        doc: span.sourceKind === 'image' ? 'Scanned page' : 'Document',
        meta: span.page ? `Page ${span.page}` : '',
        text: `“${span.quote}”`,
        match: span.quote,
        location: span.resolved === 'page_only' ? 'Read from a scanned page' : 'As quoted',
        openHref: `/api/files/${span.sourceId}`,
        changed: false,
        pageOnly: span.resolved === 'page_only',
      },
    ]
  })

  const focusReason = e.kind === 'reason' ? e.index : null
  const activeSpan =
    focusReason !== null ? (spanViews.find((s) => s.reasonIndex === focusReason)?.key ?? null) : null
  const initialTab: WhyTab =
    e.kind === 'reason' && activeSpan
      ? 'sources'
      : e.kind === 'field' || e.kind === 'event'
        ? 'history'
        : 'reasons'

  const correctable = action ? correctableFor(action.actionKey) : null
  const correction: WhyCorrection | null =
    action && correctable && action.state !== 'reverted' && !revertedBy.length
      ? {
          actionRef: action.ref,
          label: correctable.label,
          valueType: correctable.valueType,
          current:
            correctable.field === 'classification' ? (message?.classification ?? null) : null,
          choices: correctable
            .choices(action)
            .filter((c) =>
              correctable.field === 'classification' ? c.key !== message?.classification : true
            ),
          consequence: correctable.consequence,
          search: correctable.search?.(action) ?? null,
        }
      : null

  const alternatives = (p?.options ?? []).map((o) => ({
    key: o.key,
    label: o.label,
    why: o.consequence,
  }))
  const checks = (p?.checks ?? [])
    .filter((c) => !(masked && c.sensitive))
    .map((c, i) => ({ key: `c${i}`, mark: MARK[c.status], text: c.label, right: c.detail ?? '' }))

  const cost =
    action && viewer.role === 'owner' && Number(action.costUsd) > 0
      ? `$${Number(action.costUsd).toFixed(4)}`
      : null
  const footnote = action
    ? [LEVEL_LABEL[action.levelAtTime], action.model, action.promptVersion, cost]
        .filter(Boolean)
        .join(' · ')
    : null

  const area = action ? (AREA[action.actionKey] ?? action.def.label) : 'History'
  const title = action
    ? action.headline
    : `${event!.actorKind === 'user' ? (initials.get(event!.actorId ?? '') ?? 'Someone') : 'The system'} changed ${event!.field ?? 'this record'}`

  return {
    id: encodeEvidenceId(e),
    eyebrow: `Why? · ${area}`,
    title,
    initialTab,
    activeSpan,
    reasons: reasons.map((r, i) => {
      const span = spanViews.find((s) => s.reasonIndex === i)
      return {
        text: r.text,
        ...(action && span
          ? {
              evidence: {
                label: r.evidenceLabel ?? 'Source',
                evidenceId: encodeEvidenceId({ kind: 'reason', ref: action.ref, index: i }),
              },
            }
          : {}),
      }
    }),
    alternatives,
    checks,
    confidence: action?.confidence
      ? {
          level: CONFIDENCE[action.confidence],
          ...(action.unsureAbout ? { reason: action.unsureAbout } : {}),
        }
      : null,
    footnote,
    spans: spanViews,
    noQuote:
      action && spanViews.length === 0
        ? reasons.length
          ? 'No quoted text: these reasons come from code checks on the sender and the thread.'
          : 'Found by the mail checks; there is no quoted text.'
        : null,
    history: historyView,
    correction,
    overridden:
      action?.state === 'reverted' || revertedBy.length
        ? `Reverted${revertedBy[0] ? ` · ${revertedBy[0].headline}` : ''}`
        : null,
  }
}

/** Null for a malformed or unknown id: the drawer's not-found state. */
export const getWhy = cache(async (evidenceId: string, viewer: Viewer): Promise<WhyView | null> => {
  const e = parseEvidenceId(evidenceId)
  if (!e) return null
  if (e.kind === 'fixture') return evidenceFixture(e.id, env().APP_ENV)
  const loaded = await loadAction(e)
  if (!loaded) return null
  return build(e, loaded.action, loaded.event, viewer)
})
