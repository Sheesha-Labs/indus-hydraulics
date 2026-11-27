import 'server-only'
import {
  onChooseText,
  pathCards,
  QUALIFY_PATHS,
  type PathCard,
  type QualifyPath,
  type ReadConfidence,
} from '@indus/ops-core'
import type { StoredQualification, QualifySignalRow } from '../server/enquiry/qualify'

/**
 * Board 167 and 171b states 1–3 (S09-T06): what the Overview shows while the path is open. Built from the read the
 * qualify_enquiry action stored on the enquiry (legitimacyNotes / fitNotes / effortNotes) and the state of its
 * latest run, inside the Overview's own enquiry query (no extra round trip).
 */

export type QualificationView =
  | { state: 'reading' }
  | { state: 'failed'; reason: string; cards: PathCard[]; onChoose: Record<QualifyPath, string>; lineNos: number[] }
  | {
      state: 'read'
      readAt: string
      afterEmail: string | null
      chips: Array<{ label: string; tone: 'ok' | 'acc' | 'warn' | 'bad' | 'n' }>
      legitimacy: SignalView[]
      fit: SignalView[]
      effort: SignalView[]
      reasons: string[]
      cards: PathCard[]
      onChoose: Record<QualifyPath, string>
      suggested: QualifyPath
      realBuyerQuestion: boolean
      /** Line numbers each path posts by default: the regret list and the question list. */
      defaults: { regret: number[]; ask: number[] }
      lineNos: number[]
      /** 171b state 2: the paragraph above "Is this a real buyer?". */
      buyerText: string | null
    }
  | { state: 'spam_filed'; text: string; reason: string | null; undoUntil: string }

export interface SignalView extends QualifySignalRow {
  link: { label: string; href: string; external: boolean } | null
}

export interface QualificationRow {
  ref: string
  stage: string
  receivedAt: Date
  createdAt: Date
  deadline: Date | null
  chosenPath: string | null
  suggestedPath: string | null
  pathChosenAt: Date | null
  legitimacyNotes: unknown
  fitNotes: unknown
  effortNotes: unknown
  lineNos: number[]
  sourceThreadId: string | null
  /** The latest qualify_enquiry run: its state and failure reason. */
  read: { state: string; failureReason: string | null; createdAt: Date } | null
  domain: string | null
}

const CONF: Record<ReadConfidence, string> = { sure: 'Sure', likely: 'Likely', unsure: 'Unsure' }
const LEGIT = { legitimate: 'Legitimate', suspicious: 'Suspicious', spam: 'Spam' } as const
const TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const DAY = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short' })

const LINK_LABEL: Record<string, string> = {
  domain: 'Domain record',
  website: 'Website',
  mail: 'Mail search',
  email: 'Email',
  quotes: 'Past quotes',
  lines: 'Lines',
  groups: 'Groups',
  prices: 'Price history',
}

function linkFor(
  evidence: string | undefined,
  r: Pick<QualificationRow, 'ref' | 'domain' | 'sourceThreadId'>
): SignalView['link'] {
  if (!evidence || !LINK_LABEL[evidence]) return null
  const label = evidence === 'email' && r.sourceThreadId ? 'Email' : LINK_LABEL[evidence]!
  switch (evidence) {
    case 'domain':
      return r.domain ? { label, href: `https://rdap.org/domain/${r.domain}`, external: true } : null
    case 'website':
      return r.domain ? { label, href: `https://${r.domain}`, external: true } : null
    case 'mail':
      return { label, href: `/mail/clients?record=${r.ref}`, external: false }
    case 'email':
      return r.sourceThreadId
        ? { label: 'Email', href: `/mail/clients/${r.sourceThreadId}`, external: false }
        : null
    default:
      return { label, href: `/enquiries/${r.ref}/lines`, external: false }
  }
}

/** A new enquiry waits this long for its read before the card offers the paths without one. */
const READ_GRACE_MS = 15 * 60_000

const isPath = (p: unknown): p is QualifyPath => QUALIFY_PATHS.includes(p as QualifyPath)

export function qualificationView(r: QualificationRow, undoMinutes = 5, now = new Date()): QualificationView | null {
  // 171b state 3: filed as spam, still inside the undo window.
  if (r.stage === 'closed' && r.chosenPath === 'ignore_spam' && r.pathChosenAt) {
    const until = new Date(r.pathChosenAt.getTime() + undoMinutes * 60_000)
    if (until <= now) return null
    const bad = ((r.legitimacyNotes as StoredQualification['legitimacy'] | null)?.signals ?? []).find(
      (x) => x.mark === 'bad'
    )
    return {
      state: 'spam_filed',
      text: 'Filed as Not business. No reply, no record.',
      reason: bad ? `${bad.text}${bad.sub ? ` · ${bad.sub}` : ''}` : null,
      undoUntil: until.toISOString(),
    }
  }
  if (r.chosenPath || !['new', 'qualifying'].includes(r.stage)) return null

  const legit = r.legitimacyNotes as StoredQualification['legitimacy'] | null
  const fit = r.fitNotes as StoredQualification['fit'] | null
  const effort = r.effortNotes as StoredQualification['effort'] | null
  const deadline = r.deadline ? DAY.format(r.deadline).replace('Sept', 'Sep') : null

  if (!legit?.signals || !fit || !effort) {
    // While the run is in flight (no row yet, or queued/running) the card reads; a run that ended without a read,
    // or an enquiry older than the read itself (made before S09), asks the person without a suggestion.
    const asked = (r.legitimacyNotes as { askedAt?: string } | null)?.askedAt
    const askedAt = asked ? new Date(asked).getTime() : null
    // Asked again after the last run ended: in flight until that run lands (or the grace passes).
    const askedSince = askedAt !== null && (!r.read || r.read.createdAt.getTime() < askedAt)
    const inFlight =
      (askedSince && now.getTime() - askedAt < READ_GRACE_MS) ||
      (!askedSince && r.read
        ? ['queued', 'running', 'approved', 'edited_approved'].includes(r.read.state)
        : !askedSince && now.getTime() - r.createdAt.getTime() < READ_GRACE_MS)
    if (!inFlight) {
      const facts = {
        lineNos: r.lineNos,
        regretLineNos: [],
        askLineNos: [],
        proprietaryNos: [],
        outsideNos: [],
        deadline,
        suggested: 'quote_fully' as const,
        pathConfidence: 'unsure' as const,
        realBuyerQuestion: false,
      }
      return {
        state: 'failed',
        reason: r.read ? failWord(r.read.failureReason) : 'There is no quick read on this enquiry',
        cards: pathCards(facts).map((c) => ({ ...c, tag: null })),
        onChoose: onChooseAll(facts),
        lineNos: r.lineNos,
      }
    }
    return { state: 'reading' }
  }

  const facts = {
    lineNos: r.lineNos,
    regretLineNos: fit.regretLineNos,
    askLineNos: fit.askLineNos,
    proprietaryNos: fit.proprietaryNos ?? [],
    outsideNos: fit.outsideNos ?? [],
    deadline,
    suggested: isPath(r.suggestedPath) ? r.suggestedPath : ('quote_fully' as const),
    pathConfidence: effort.pathConfidence,
    realBuyerQuestion: effort.realBuyerQuestion,
  }
  const at = new Date(effort.readAt)
  const mins = Math.max(0, Math.round((at.getTime() - r.receivedAt.getTime()) / 60_000))
  const mark = (rows: QualifySignalRow[]) => rows.map((s) => ({ ...s, link: linkFor(s.evidence, r) }))
  const spam = legit.verdict === 'spam'
  return {
    state: 'read',
    readAt: TIME.format(at),
    afterEmail: mins <= 120 ? `${mins === 0 ? 'under a minute' : `${mins} minute${mins === 1 ? '' : 's'}`} after the email` : null,
    chips: [
      spam
        ? { label: 'Ignore (spam) · Sure', tone: 'n' }
        : effort.realBuyerQuestion
          ? { label: 'Unsure', tone: 'warn' }
          : {
              label: `${LEGIT[legit.verdict]} · ${CONF[legit.confidence]}`,
              tone: legit.verdict === 'legitimate' ? 'ok' : 'warn',
            },
      ...(spam ? [] : [{ label: `Fit ${fit.fit} of ${fit.of} · ${CONF[fit.confidence]}`, tone: 'acc' as const }]),
    ],
    legitimacy: mark(legit.signals),
    fit: mark(fit.signals),
    effort: mark(effort.signals),
    reasons: effort.reasons,
    cards: pathCards(facts),
    onChoose: onChooseAll(facts),
    suggested: facts.suggested,
    realBuyerQuestion: effort.realBuyerQuestion,
    defaults: { regret: fit.regretLineNos.length ? fit.regretLineNos : (fit.outsideNos ?? []), ask: fit.askLineNos },
    lineNos: r.lineNos,
    buyerText: effort.realBuyerQuestion
      ? legit.signals
          .filter((s) => s.mark === 'bad' || s.mark === 'warn')
          .map((s) => s.text)
          .join('; ') + '.'
      : null,
  }
}

function onChooseAll(f: { regretLineNos: readonly number[]; askLineNos: readonly number[] }): Record<QualifyPath, string> {
  return Object.fromEntries(QUALIFY_PATHS.map((p) => [p, onChooseText(p, f)])) as Record<QualifyPath, string>
}

function failWord(reason: string | null): string {
  if (!reason) return 'The quick read could not run'
  if (/budget/i.test(reason)) return 'The quick read was not run: the Assistant budget is used up'
  if (/paus/i.test(reason)) return 'The quick read waits: the Assistant is paused'
  return 'The quick read could not run'
}
