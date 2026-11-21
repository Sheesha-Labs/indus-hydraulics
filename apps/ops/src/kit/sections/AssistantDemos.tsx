'use client'

import {
  ProposalCard,
  UnsureRow,
  type ProposalActionsInput,
  type ProposalCardProps,
} from '@indus/ops-ui/assistant'
import { ToastProvider, useToast } from '@indus/ops-ui/overlay'
import { useState, type ReactNode } from 'react'
import { ASSISTANT, PEOPLE } from '../fixtures'

// Client islands for the Assistant specimen. ProposalCard takes its verbs as functions (server actions
// in the app), which a server component cannot pass, so every card here is built on the client with
// invented actions that wait a moment and succeed, except the "fails" card, whose approve reverts.

const UNDO_WINDOW_MS = 5 * 60 * 1000
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** One toast region for the whole specimen (AppShell mounts it in the console from S02). */
export function AssistantToasts({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}

function demoActions(
  id: string,
  opts: { fail?: boolean; edit?: boolean } = {}
): ProposalActionsInput {
  return {
    approve: async () => {
      await wait(400)
      return opts.fail
        ? { success: false, error: 'Couldn’t reach purchase@. Nothing was sent.' }
        : { success: true, data: { undoRemainingMs: UNDO_WINDOW_MS } }
    },
    ...(opts.edit === false ? {} : { edit: { href: `#proposal-${id}` } }),
    reject: async () => {
      await wait(300)
      return { success: true, data: undefined }
    },
    later: async () => {
      await wait(300)
      return { success: true, data: undefined }
    },
    undo: async () => {
      await wait(300)
      return { success: true, data: undefined }
    },
    reopen: async () => {
      await wait(300)
      return { success: true, data: undefined }
    },
  }
}

const RFQ = ASSISTANT.rfq

/** The default card's body (the sheet repeats it on every ProposalCard it does not override). */
const RFQ_BODY = {
  why: RFQ.why.map((w) => ({ text: w.text, evidence: { ...w.evidence } })),
  preview: { title: RFQ.preview.title, lines: RFQ.preview.lines.map((l) => ({ ...l })) },
  checks: RFQ.checks.map((c) => ({ ...c })),
  confidence: { ...RFQ.confidence },
  onApproveText: { text: RFQ.onApprove },
} satisfies Partial<ProposalCardProps>

export type DemoVariant =
  | 'default'
  | 'approved'
  | 'rejected'
  | 'collapsed'
  | 'judgement'
  | 'qualify'
  | 'regret'
  | 'raised'
  | 'compact'
  | 'locked'
  | 'readonly'
  | 'fails'
  | 'batch'

type CardConfig = Omit<ProposalCardProps, 'createdAt' | 'actions'> & {
  minutesAgo: number
  fail?: boolean
  edit?: boolean
}

const rec = (label: string) => ({ label, href: `#${label.replace(/[^A-Za-z0-9-]+/g, '-')}` })

const CONFIG: Record<DemoVariant, CardConfig> = {
  default: {
    id: RFQ.id,
    type: RFQ.type,
    record: rec(RFQ.record),
    level: { label: RFQ.level },
    headline: RFQ.headline,
    ...RFQ_BODY,
    state: 'open',
    minutesAgo: 12,
  },
  approved: {
    id: ASSISTANT.chase.id,
    type: ASSISTANT.chase.type,
    record: rec(ASSISTANT.chase.record),
    level: { label: ASSISTANT.chase.level },
    headline: ASSISTANT.chase.headline,
    ...RFQ_BODY,
    state: 'approved',
    decided: {
      by: PEOPLE.owner.name,
      at: new Date('2026-11-20T06:05:00Z'),
      note: ASSISTANT.chase.note,
      undoRemainingMs: UNDO_WINDOW_MS,
    },
    compact: true,
    minutesAgo: 12,
  },
  rejected: {
    id: ASSISTANT.relay.id,
    type: ASSISTANT.relay.type,
    record: rec(RFQ.record),
    headline: ASSISTANT.relay.headline,
    ...RFQ_BODY,
    state: 'rejected',
    decided: {
      by: PEOPLE.owner.name,
      at: new Date('2026-11-20T06:08:00Z'),
      note: ASSISTANT.relay.note,
    },
    compact: true,
    minutesAgo: 12,
  },
  collapsed: {
    id: ASSISTANT.quotation.id,
    type: ASSISTANT.quotation.type,
    record: rec(ASSISTANT.quotation.record),
    level: { label: ASSISTANT.quotation.level, locked: true },
    headline: ASSISTANT.quotation.headline,
    approveLabel: ASSISTANT.quotation.approveLabel,
    state: 'collapsed',
    compact: true,
    minutesAgo: 12,
  },
  judgement: {
    id: ASSISTANT.judgement.id,
    type: ASSISTANT.judgement.type,
    record: rec(ASSISTANT.judgement.record),
    level: { label: ASSISTANT.judgement.level },
    headline: ASSISTANT.judgement.headline,
    why: ASSISTANT.judgement.why.map((w) => ({
      text: w.text,
      ...('evidence' in w ? { evidence: { ...w.evidence } } : {}),
    })),
    options: {
      legend: ASSISTANT.judgement.legend,
      items: ASSISTANT.judgement.options.map((o) => ({ ...o })),
    },
    checks: ASSISTANT.judgement.checks.map((c) => ({ ...c })),
    confidence: { ...ASSISTANT.judgement.confidence },
    onApproveText: { text: ASSISTANT.judgement.onApprove },
    approveLabel: 'Approve option',
    batchable: false,
    state: 'open',
    minutesAgo: 34,
  },
  qualify: {
    id: ASSISTANT.qualify.id,
    type: ASSISTANT.qualify.type,
    record: rec(ASSISTANT.qualify.record),
    level: { label: ASSISTANT.qualify.level },
    headline: ASSISTANT.qualify.headline,
    signals: ASSISTANT.qualify.signals.map((s) => ({ ...s })),
    toggle: { ...ASSISTANT.qualify.toggle },
    aside: ASSISTANT.qualify.aside,
    confidence: { ...ASSISTANT.qualify.confidence },
    state: 'open',
    minutesAgo: 5,
    edit: false,
  },
  regret: {
    id: ASSISTANT.regret.id,
    type: ASSISTANT.regret.type,
    record: rec(ASSISTANT.regret.record),
    level: { label: ASSISTANT.regret.level },
    headline: ASSISTANT.regret.headline,
    reasonChips: {
      label: ASSISTANT.regret.chipsLabel,
      options: ASSISTANT.regret.chips.map((c) => ({ ...c })),
      value: ASSISTANT.regret.chip,
    },
    confidence: { ...ASSISTANT.regret.confidence },
    state: 'open',
    minutesAgo: 70,
  },
  raised: {
    id: 'A-26-11-20-0008',
    type: RFQ.type,
    record: rec(RFQ.record),
    level: { label: RFQ.level },
    headline: RFQ.headline,
    preview: RFQ_BODY.preview,
    raised: true,
    note: 'Arrived while you were reading',
    state: 'open',
    minutesAgo: 1,
  },
  compact: {
    id: 'A-26-11-20-0009',
    type: ASSISTANT.chase.type,
    record: rec(ASSISTANT.chase.record),
    level: { label: ASSISTANT.chase.level },
    headline: ASSISTANT.chase.headline,
    confidence: { level: 'Sure' },
    compact: true,
    batchable: true,
    state: 'open',
    minutesAgo: 130,
  },
  locked: {
    id: 'A-26-11-20-0010',
    type: ASSISTANT.quotation.type,
    record: rec(ASSISTANT.quotation.record),
    level: { label: ASSISTANT.quotation.level, locked: true },
    headline: ASSISTANT.quotation.headline,
    checks: [
      { key: 'names', mark: 'ok', text: 'No supplier names, costs or margins on the PDF or email' },
      {
        key: 'terms',
        mark: 'warn',
        text: 'Client asks 60 days; the quotation says 30',
        right: 'terms',
      },
    ],
    confidence: { level: 'Sure' },
    onApproveText: {
      text: 'Sends from sales@ in the client’s thread in 5 minutes. Never batched; ⌘↵ does not approve it.',
    },
    approveLabel: 'Approve and send',
    batchable: false,
    state: 'open',
    minutesAgo: 25,
  },
  readonly: {
    id: 'A-26-11-20-0011',
    type: ASSISTANT.quotation.type,
    record: rec(ASSISTANT.quotation.record),
    level: { label: ASSISTANT.quotation.level, locked: true },
    headline: ASSISTANT.quotation.headline,
    confidence: { level: 'Sure' },
    readOnly: true,
    note: 'Read only · the Owner approves client prices',
    state: 'open',
    minutesAgo: 25,
  },
  fails: {
    id: 'A-26-11-20-0012',
    type: ASSISTANT.chase.type,
    record: rec(ASSISTANT.chase.record),
    level: { label: ASSISTANT.chase.level },
    headline: ASSISTANT.chase.headline,
    confidence: { level: 'Unsure', reason: 'purchase@ has not synced for 40 minutes.' },
    note: 'Approve fails and reverts',
    state: 'open',
    minutesAgo: 3,
    fail: true,
  },
  batch: {
    id: 'A-26-11-20-0013',
    type: ASSISTANT.chase.type,
    record: rec(ASSISTANT.chase.record),
    level: { label: ASSISTANT.chase.level },
    headline: ASSISTANT.chase.headline,
    batchable: true,
    compact: true,
    state: 'collapsed',
    minutesAgo: 48,
  },
}

/** A ProposalCard from the sample set, with demo actions. */
export function DemoProposal({ variant, className }: { variant: DemoVariant; className?: string }) {
  const { minutesAgo, fail, edit, ...props } = CONFIG[variant]
  // Relative to this render's clock on each side (server now, frozen browser clock in visual tests), so
  // the header reads the same "12 min" on both.
  const [createdAt] = useState(() => new Date(Date.now() - minutesAgo * 60_000))
  const [actions] = useState(() =>
    demoActions(props.id, { ...(fail ? { fail } : {}), ...(edit === false ? { edit } : {}) })
  )
  return (
    <ProposalCard
      {...props}
      createdAt={createdAt}
      actions={actions}
      {...(className ? { className } : {})}
    />
  )
}

/** UnsureRow with its default Decide / Not now, wired to toasts. */
export function DemoUnsure() {
  const { toast } = useToast()
  return (
    <UnsureRow
      question={ASSISTANT.unsure.question}
      reason={ASSISTANT.unsure.reason}
      onDecide={() => toast({ kind: 'info', title: 'Decide opens the Unsure resolver (S05)' })}
      onNotNow={() => toast({ kind: 'info', title: 'It stays in Review as Unsure' })}
    />
  )
}
