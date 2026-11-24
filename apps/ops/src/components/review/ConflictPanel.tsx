'use client'

import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Tag } from '@indus/ops-ui/status'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { Fragment, useState } from 'react'
import { keepMyVersionAction } from '../../actions/proposal/resolve-conflict'
import type { ReviewConflict } from '../../data/review'

/**
 * Board 110 "Changed by <them> while you were reviewing": the approve was refused because someone saved an
 * edit after this person opened the card. Their change is shown; Approve stays off until one of the two is
 * chosen. Review his change reloads the card with their version; Keep mine puts this person's back and tells
 * them. Both versions stay in the trail.
 */
export default function ConflictPanel({
  conflict,
  reviewHref,
}: {
  conflict: ReviewConflict
  /** The card without ?seen=: their version, approvable. */
  reviewHref: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  async function keepMine() {
    setBusy(true)
    try {
      const r = await keepMyVersionAction({
        actionId: conflict.actionId,
        version: conflict.version,
        seen: conflict.seen,
      })
      if (!r.success) {
        toast({ kind: 'error', title: r.error })
        return
      }
      toast({ kind: 'success', title: `Your version is back · ${conflict.by} was told` })
      router.replace(reviewHref as Route)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const what = conflict.changes.length
    ? conflict.changes.map((c) => c.field).join(' and ')
    : 'this card'
  return (
    <section
      aria-label={`Changed by ${conflict.by} while you were reviewing`}
      data-part="conflict"
      className="flex flex-col gap-3"
    >
      <div
        role="status"
        className="bg-io-info-tint text-io-info rounded-io-card flex items-start gap-3 px-4 py-3 text-[13px] leading-[1.5]"
      >
        <Tag kind="count">{conflict.by}</Tag>
        <p className="m-0">
          {conflict.by} changed {what} on {conflict.ref} at {conflict.at}
          {conflict.changes.some((c) => c.added.length || c.removed.length) ? ': ' : '. '}
          {conflict.changes.map((c) => (
            <Fragment key={c.field}>
              {c.added.map((x) => (
                <ins
                  key={`+${x}`}
                  className="bg-io-ok-tint text-io-ok rounded-io-3 mr-1 px-[3px] no-underline"
                >
                  + {x}
                </ins>
              ))}
              {c.removed.map((x) => (
                <del
                  key={`-${x}`}
                  className="bg-io-bad-tint text-io-bad rounded-io-3 mr-1 px-[3px]"
                >
                  {x}
                </del>
              ))}
            </Fragment>
          ))}
          {conflict.changes.some((c) => c.added.length || c.removed.length) ? '. ' : ''}
          Approving now would send {conflict.by}’s version.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ButtonLink href={reviewHref} variant="primary">
          Review {conflict.by}’s change
        </ButtonLink>
        <Button variant="secondary" busy={busy} onClick={() => void keepMine()}>
          Keep mine and tell {conflict.by}
        </Button>
      </div>
      <p className="text-io-ink-3 m-0 text-[12.5px]">
        Approve stays disabled until one is chosen. Both versions are kept in the Assistant log.
      </p>
    </section>
  )
}
