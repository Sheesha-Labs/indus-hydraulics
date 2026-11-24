'use client'

import { Banner } from '@indus/ops-ui/status'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { saveAiLimitsAction } from '../../app/(console)/assistant/cost/actions/save-ai-limits'
import type { CostPageData } from '../../data/ai-cost'

/**
 * Board 101's banner once the month's budget is reached (S07-T04): what stopped, what continues, "Raise to USD
 * <limit + 50>" for the Owner (saves the limit) and "Research these anyway", shown disabled until supplier
 * research arrives (S13).
 */
export default function BudgetBanner({ cost }: { cost: CostPageData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  if (cost.state !== 'research_paused' && cost.state !== 'hard_stop') return null
  const raiseTo = Math.ceil((cost.limitUsd + 50) / 50) * 50
  const stop = cost.state === 'hard_stop'
  async function raise() {
    setBusy(true)
    const res = await saveAiLimitsAction({
      monthlyBudgetUsd: raiseTo,
      mode: cost.limits.mode,
      researchCapUsd: cost.limits.researchCapUsd,
      budgetVersion: cost.limits.budgetVersion,
      researchVersion: cost.limits.researchVersion,
    })
    setBusy(false)
    if (!res.success) toast({ kind: 'error', title: res.error })
    else toast({ kind: 'success', title: `Budget raised to USD ${raiseTo}` })
    router.refresh()
  }
  return (
    <Banner
      tone={stop ? 'bad' : 'warn'}
      actions={
        <>
          {cost.isOwner ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void raise()}
              className="io-focus rounded-io-tag font-medium underline underline-offset-2"
            >
              Raise to USD {raiseTo}
            </button>
          ) : null}
          {stop ? null : (
            <button
              type="button"
              disabled
              title="Arrives with supplier research"
              className="rounded-io-tag cursor-not-allowed font-medium underline underline-offset-2 opacity-60"
            >
              Research these anyway
            </button>
          )}
        </>
      }
    >
      {stop
        ? `Budget reached: everything paused, including reading mail. USD ${cost.mtdUsd} of ${cost.limitUsd} used.`
        : `Budget reached: research paused, reading continues. USD ${cost.mtdUsd} of ${cost.limitUsd} used.`}
    </Banner>
  )
}
