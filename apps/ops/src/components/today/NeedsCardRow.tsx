'use client'

import { NeedsRow } from '@indus/ops-ui/card'
import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { approveProposalAction } from '../../actions/proposal/decide'
import type { ReviewCard } from '../../data/review'
import { useServerUndo } from '../undo/UndoToast'

/**
 * One Needs-you row on Today (S07-T06, board 178): the action tag, the headline, one line of context and the
 * verbs. A plain open card approves inline (the server's undo countdown in the toast, ⌘Z while it runs); a
 * locked card (a quotation, a PO), a choice between options, or a read-only or invalid card opens in Review,
 * which is the primary then. Open always goes to the card in Review.
 */
export function approvableInline(card: ReviewCard): boolean {
  return (
    card.state === 'open' &&
    !card.level.locked &&
    !card.readOnly &&
    !card.stale &&
    !card.invalid &&
    !(card.options && card.options.length > 1)
  )
}

export default function NeedsCardRow({ card }: { card: ReviewCard }) {
  const router = useRouter()
  const { toast } = useToast()
  const { showUndoable } = useServerUndo()
  const [busy, setBusy] = useState(false)
  const reviewHref = `/review?card=${encodeURIComponent(card.ref)}`
  const inline = approvableInline(card)

  async function approve() {
    setBusy(true)
    const r = await approveProposalAction({ actionId: card.id, version: card.version })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      router.refresh()
      return
    }
    if (r.data.undoRemainingMs)
      showUndoable({
        title: `Approved · ${card.headline}`,
        actionId: card.id,
        remainingMs: r.data.undoRemainingMs,
      })
    else toast({ kind: 'success', title: `Approved · ${card.headline}` })
    router.refresh()
  }

  return (
    <article aria-label={card.headline}>
      <NeedsRow
        action={card.type}
        title={card.headline}
        sub={card.sub || `${card.ref} · ${card.age}`}
        actions={
          inline ? (
            <>
              <Button size="sm" onClick={approve} disabled={busy}>
                Approve
              </Button>
              <ButtonLink size="sm" variant="secondary" href={reviewHref}>
                Open
              </ButtonLink>
            </>
          ) : (
            <ButtonLink size="sm" href={reviewHref}>
              {card.level.locked ? 'Review' : 'Decide'}
            </ButtonLink>
          )
        }
      />
    </article>
  )
}
