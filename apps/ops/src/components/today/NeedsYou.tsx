'use client'

import { ButtonLink, Button } from '@indus/ops-ui/controls'
import { Card, NeedsRow } from '@indus/ops-ui/card'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { approveProposalAction } from '../../actions/proposal/decide'
import { undoApprovalAction } from '../../actions/proposal/undo'
import type { TodayModel } from '../../data/today'

/**
 * Today's "Needs you" (S07-T06, board 178): the top three cards with Approve inline (the S06 action, optimistic,
 * an undo toast with the server's window) or Review; "See all n" opens Review. Only the first card's Approve is
 * primary (one primary per view). Above ten it reads "Needs you · n. Top 3 first" with the rest grouped by
 * record (board 182 "On fire").
 */
export default function NeedsYou({ needs }: { needs: TodayModel['needs'] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [gone, setGone] = useState<string[]>([])
  const onFire = needs.total > 10
  const shown = needs.items.filter((i) => !gone.includes(i.id))
  const firstApprovable = shown.find((i) => i.approvable)?.id

  async function approve(id: string, version: number, title: string) {
    setGone((g) => [...g, id])
    const res = await approveProposalAction({ actionId: id, version })
    if (!res.success) {
      setGone((g) => g.filter((x) => x !== id))
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({
      kind: 'success',
      title: `Approved: ${title}`,
      ...(res.data.undoRemainingMs
        ? {
            undo: {
              remainingMs: res.data.undoRemainingMs,
              onUndo: async () => {
                const u = await undoApprovalAction({ actionId: id })
                router.refresh()
                return u.success
                  ? { success: true as const, data: undefined }
                  : { success: false as const, error: u.error }
              },
            },
          }
        : {}),
    })
    router.refresh()
  }

  return (
    <Card
      eyebrow={onFire ? `Needs you · ${needs.total}. Top 3 first` : `Needs you · ${needs.total}`}
      link={{ label: `See all ${needs.total}`, href: '/review' }}
    >
      <div data-part="needs-you" className="flex flex-col gap-2.5">
        {shown.map((i) => (
          <NeedsRow
            key={i.id}
            action={i.tag}
            title={i.title}
            sub={i.sub}
            href={i.href}
            actions={
              i.approvable ? (
                <>
                  <Button
                    size="sm"
                    variant={i.id === firstApprovable ? 'primary' : 'secondary'}
                    onClick={() => void approve(i.id, i.version, i.title)}
                  >
                    Approve
                  </Button>
                  <ButtonLink size="sm" href={i.href}>
                    Open
                  </ButtonLink>
                </>
              ) : (
                <ButtonLink size="sm" href={i.href}>
                  Review
                </ButtonLink>
              )
            }
          />
        ))}
        {onFire ? (
          <p className="text-io-ink-3 m-0 text-[12.5px]">
            Then {needs.total - shown.length} more, grouped by record.
          </p>
        ) : null}
      </div>
    </Card>
  )
}
