import 'server-only'
import {
  parseProposal,
  type EmailEdit,
  type EmailPreview,
  type StoredCheck,
} from '@indus/ops-core'
import type { $Enums } from '@indus/ops-db'
import type { OpsUser } from '../lib/access-core'

/**
 * A stored action → plain data for the ProposalCard (S06-T01). Plain JSON (no ReactNode, no functions): the
 * Review page binds the verbs. It applies a person's edit (effectivePayload) over the immutable proposal, turns
 * reasons into Why? links (`/why/<ref>~r<i>`), names the level as the card says it, and removes money (cost,
 * margin, landed, sell, or a check marked sensitive) for a Helper without "can see margins".
 */
export interface ActionRowForCard {
  id: string
  ref: string
  actionKey: string
  surface: string
  state: $Enums.ActionState
  levelAtTime: $Enums.AutopilotLevel
  /** S07-T01: the resolver's reasons; "Asked because: …" entries name the guardrail that asked. */
  levelReasons?: unknown
  headline: string
  reasons: unknown
  preview: unknown
  checks: unknown
  confidence: $Enums.Confidence | null
  unsureAbout: string | null
  options: unknown
  onApproveText: string | null
  effectivePayload: unknown
  editDiff: unknown
  staleAt: Date | null
  staleReason: string | null
  rejectReason: string | null
  chosenOption: string | null
  decidedAt: Date | null
  undoUntil: Date | null
  version: number
  createdAt: Date
  subjectType: string | null
  subjectId: string | null
  def: { label: string; lockedLevel: $Enums.AutopilotLevel | null }
  decidedBy: { initials: string; name: string } | null
}

export interface CardCheck {
  key: string
  mark: 'ok' | 'warn' | 'bad' | 'n'
  text: string
  right?: string
}
export interface CardEmail {
  mailbox: string | null
  to: string[]
  cc: string[]
  subject: string
  /** Plain text of the body, for the preview and the editor. */
  body: string
  /** Sanitised HTML when the proposal carried it (manual_reply). */
  html: string | null
}
export interface ProposalCardData {
  id: string
  ref: string
  actionKey: string
  kind: string
  type: string
  level: { label: string; locked: boolean }
  createdAt: string
  headline: string
  why: Array<{ text: string; evidenceId: string }>
  checks: CardCheck[]
  confidence: { level: 'Sure' | 'Likely' | 'Unsure'; reason?: string } | null
  unsureAbout: string | null
  options: Array<{ value: string; title: string; sub?: string }> | null
  onApproveText: string | null
  email: CardEmail | null
  editable: readonly string[]
  edited: { by: string | null; fields: string[] } | null
  state: 'open' | 'approved' | 'rejected' | 'collapsed'
  rawState: $Enums.ActionState
  decided: { by: string; at: string; note?: string; undoRemainingMs?: number } | null
  stale: { reason: string } | null
  version: number
  /** The proposal did not fit its schema: shown as a failure, never approvable. */
  invalid: string | null
  /** S07-T01: what sent the card to Review ("Value above AED 200,000"). */
  askedBecause: string[]
  readOnly: boolean
}

export const LEVEL_LABEL: Readonly<Record<$Enums.AutopilotLevel, string>> = {
  off: 'Off',
  never: 'Never',
  suggest: 'Suggests',
  draft_and_ask: 'Asks you',
  do_and_tell: 'Does it, tells you',
  do_quietly: 'Does it quietly',
}

const MONEY = /\b(cost|margin|landed|sell|selling|price)\b/i

function isSensitive(c: StoredCheck): boolean {
  return c.sensitive === true || MONEY.test(c.label) || MONEY.test(c.detail ?? '')
}

const MARK: Record<StoredCheck['status'], CardCheck['mark']> = { pass: 'ok', warn: 'warn', fail: 'bad' }

function textOfHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function cardState(s: $Enums.ActionState): ProposalCardData['state'] {
  if (s === 'proposed' || s === 'later') return 'open'
  if (s === 'rejected' || s === 'undone' || s === 'cancelled' || s === 'reverted') return 'rejected'
  if (s === 'failed') return 'collapsed'
  return 'approved'
}

const ASKED = 'Asked because: '

/** The "Asked because: …" reasons the resolver stored, without the prefix (money masked for a Helper). */
export function askedBecauseOf(levelReasons: unknown, masked = false): string[] {
  if (!Array.isArray(levelReasons)) return []
  return levelReasons
    .filter((r): r is string => typeof r === 'string' && r.startsWith(ASKED))
    .map((r) => r.slice(ASKED.length))
    .filter((r) => !(masked && /margin|AED|USD/i.test(r)))
}

export function toProposalCardData(
  row: ActionRowForCard,
  user: Pick<OpsUser, 'role' | 'canSeeMargins'>,
  now = new Date()
): ProposalCardData {
  const parsed = parseProposal(row.actionKey, {
    headline: row.headline,
    reasons: (row.reasons as never) ?? [],
    checks: (row.checks as never) ?? [],
    confidence: row.confidence,
    unsureAbout: row.unsureAbout,
    options: (row.options as never) ?? null,
    onApproveText: row.onApproveText,
    preview: row.preview,
    surface: row.surface,
  })
  const masked = user.role !== 'owner' && !user.canSeeMargins
  const p = parsed.ok ? parsed.proposal : null
  const checks = (p?.checks ?? [])
    .filter((c) => !(masked && isSensitive(c)))
    .map((c, i) => ({
      key: `c${i}`,
      mark: MARK[c.status],
      text: c.label,
      ...(c.detail ? { right: c.detail } : {}),
    }))

  let email: CardEmail | null = null
  if (p && p.kind === 'email') {
    const e: EmailPreview = p.email
    const edit = (row.effectivePayload as EmailEdit | null) ?? {}
    email = {
      mailbox: e.mailbox,
      to: edit.to ?? e.to,
      cc: edit.cc ?? e.cc ?? [],
      subject: edit.subject ?? e.subject,
      body: edit.body ?? (e.text ?? textOfHtml(e.html ?? '')),
      html: edit.body === undefined ? (e.html ?? null) : null,
    }
  }

  const diff = row.editDiff as { by?: string; fields?: string[] } | null
  const undoRemainingMs = row.undoUntil ? Math.max(0, row.undoUntil.getTime() - now.getTime()) : 0
  const state = cardState(row.state)
  const locked = row.def.lockedLevel !== null && row.def.lockedLevel !== 'never'
  return {
    id: row.id,
    ref: row.ref,
    actionKey: row.actionKey,
    kind: parsed.kind,
    type: row.def.label,
    level: {
      label: locked ? 'Locked · you send' : LEVEL_LABEL[row.levelAtTime],
      locked,
    },
    createdAt: row.createdAt.toISOString(),
    headline: row.headline,
    why: (p?.reasons ?? []).map((r, i) => ({ text: r.text, evidenceId: `${row.ref}~r${i}` })),
    checks,
    confidence: row.confidence
      ? {
          level: row.confidence === 'sure' ? 'Sure' : row.confidence === 'likely' ? 'Likely' : 'Unsure',
          ...(row.confidence !== 'sure' && row.unsureAbout ? { reason: row.unsureAbout } : {}),
        }
      : null,
    unsureAbout: row.unsureAbout,
    options:
      (p?.options ?? null)?.map((o) => ({
        value: o.key,
        title: o.label,
        ...(o.consequence ? { sub: o.consequence } : {}),
      })) ?? null,
    onApproveText: row.onApproveText,
    email,
    editable: parsed.ok ? parsed.editable : [],
    edited: diff?.fields?.length ? { by: diff.by ?? null, fields: diff.fields } : null,
    state,
    rawState: row.state,
    decided:
      row.decidedAt && row.decidedBy
        ? {
            by: row.decidedBy.initials,
            at: row.decidedAt.toISOString(),
            ...(row.rejectReason ? { note: row.rejectReason } : {}),
            ...(undoRemainingMs > 0 ? { undoRemainingMs } : {}),
          }
        : null,
    stale: row.staleAt ? { reason: row.staleReason ?? 'The record changed since this was drafted.' } : null,
    version: row.version,
    invalid: parsed.ok ? null : parsed.error,
    askedBecause: askedBecauseOf(row.levelReasons, masked),
    // A Helper never approves a locked action (#20 quotation, #28 supplier POs) or a client-mailbox reply.
    readOnly:
      (user.role !== 'owner' && (locked || row.actionKey === 'manual_reply')) ||
      // S06-T08: an instruction the Assistant could not turn into an action has nothing to approve.
      (row.actionKey === 'instruction' && row.onApproveText === null),
  }
}
