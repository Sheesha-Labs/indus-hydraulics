'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Banner } from '@indus/ops-ui/status'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { redraftProposalAction } from '../../actions/proposal/decide'
import type { ReviewCard } from '../../data/review'

/**
 * A stale card (board 103 "Stale", board 110): the record changed after drafting, so approving is blocked.
 * Redraft cancels this card and asks the Assistant for a fresh one.
 */
export default function StaleBanner({ card }: { card: ReviewCard }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  async function go() {
    setBusy(true)
    try {
      const r = await redraftProposalAction({ actionId: card.id })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: 'Redrafting: the new card arrives in Review shortly' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      aria-label={card.headline}
      data-part="proposal-card"
      data-state="stale"
      className="bg-io-card border-io-line rounded-io-card flex flex-col gap-3 border px-5 py-4"
    >
      <p className="text-io-ink-3 text-[12px]">
        <span className="bg-io-accent-tint text-io-accent rounded-io-tag mr-2 px-1.5 py-0.5 text-[11.5px]">
          {card.type}
        </span>
        {card.ref} · {card.age}
      </p>
      <h3 className="text-[16px] leading-[1.35] font-medium">{card.headline}</h3>
      <Banner
        tone="warn"
        icon="warn"
        title={card.stale?.reason ?? 'The record changed since this was drafted.'}
      >
        Approving is blocked until it is redrafted.
      </Banner>
      <div className="flex gap-2">
        <Button variant="primary" busy={busy} onClick={() => void go()}>
          Redraft
        </Button>
      </div>
    </section>
  )
}
