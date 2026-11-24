'use client'

import { ProposalCard, type LaterUntil } from '@indus/ops-ui/assistant'
import { useRouter } from 'next/navigation'
import { useMemo, type ReactNode } from 'react'
import {
  approveProposalAction,
  laterProposalAction,
  rejectProposalAction,
  undoApprovalAction,
} from '../../actions/proposal/decide'
import type { ReviewCard } from '../../data/review'
import EmailEditor from './EmailEditor'
import StaleBanner from './StaleBanner'

/**
 * One Review card, expanded (board 103): the kit ProposalCard with the four verbs bound to the action id and
 * version. Approve is optimistic with the server's undo countdown; Undo returns the card; Edit opens the inline
 * editor (?edit=1). The kit card owns its keys while focused: ⌘↵ approves (never a locked one), E, R, L.
 */
function laterValue(until: LaterUntil): string {
  return until instanceof Date ? until.toISOString() : until
}

export default function ReviewCardClient({
  card,
  editHref,
  closeEditHref,
  editing,
  aside,
}: {
  card: ReviewCard
  editHref: string
  closeEditHref: string
  editing: boolean
  aside?: ReactNode
}) {
  const router = useRouter()
  const refreshAfter = useMemo(
    () =>
      async <T extends { success: boolean }>(p: Promise<T>): Promise<T> => {
        const r = await p
        // On success the card leaves; on 'stale' or 'changed' the server has the new state to show (board 110).
        router.refresh()
        return r
      },
    [router]
  )
  const id = card.id
  const v = card.version
  const blocked = !!card.stale || !!card.invalid

  if (card.stale) return <StaleBanner card={card} />

  const preview = card.email
    ? {
        title: `Preview · email`,
        lines: [
          {
            key: 'to',
            text: `To ${card.email.to.join(', ')}${card.email.cc.length ? ` · Cc ${card.email.cc.join(', ')}` : ''}`,
            kind: 'muted' as const,
          },
          { key: 'subject', text: card.email.subject, kind: 'bold' as const },
          { key: 'body', text: card.email.body },
        ],
      }
    : undefined

  if (editing && card.email) {
    return <EmailEditor card={card} email={card.email} cancelHref={closeEditHref} />
  }

  return (
    <ProposalCard
      id={card.ref}
      type={card.type}
      level={card.level}
      createdAt={new Date(card.createdAt)}
      headline={card.headline}
      why={card.why.map((w) => ({
        text: w.text,
        evidence: { label: 'Why?', evidenceId: w.evidenceId },
      }))}
      {...(preview ? { preview } : {})}
      checks={card.checks}
      {...(card.confidence ? { confidence: card.confidence } : {})}
      {...(card.onApproveText ? { onApproveText: { text: card.onApproveText } } : {})}
      {...(card.options && card.options.length > 1
        ? {
            options: {
              legend: 'Choose',
              items: card.options.map((o, i) => ({ ...o, suggested: i === 0 })),
            },
          }
        : {})}
      {...(aside ? { aside } : {})}
      {...(card.edited
        ? { note: `Edited by ${card.edited.by ?? 'you'} · ${card.edited.fields.join(', ')}` }
        : {})}
      state={card.state}
      raised
      batchable={card.batchable}
      readOnly={card.readOnly || blocked}
      actions={{
        approve: (i) =>
          refreshAfter(
            approveProposalAction({
              actionId: id,
              version: v,
              ...(i.optionValue ? { optionValue: i.optionValue } : {}),
            })
          ),
        ...(card.email && card.editable.length ? { edit: { href: editHref } } : {}),
        reject: async (i) => {
          const r = await refreshAfter(
            rejectProposalAction({
              actionId: id,
              version: v,
              reason: i.reason,
              ...(i.chip ? { chip: i.chip } : {}),
              redraft: false,
            })
          )
          return r.success ? { success: true, data: undefined } : r
        },
        later: async (i) => {
          const r = await refreshAfter(
            laterProposalAction({ actionId: id, version: v, until: laterValue(i.until) as never })
          )
          return r.success ? { success: true, data: undefined } : r
        },
        undo: async () => {
          const r = await refreshAfter(undoApprovalAction({ actionId: id }))
          return r.success ? { success: true, data: undefined } : r
        },
      }}
    />
  )
}
