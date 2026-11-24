'use client'

import { Button } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import { useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { saveAiLimitsAction } from '../../app/(console)/assistant/cost/actions/save-ai-limits'
import type { CostPageData } from '../../data/ai-cost'

const MODES = [
  {
    value: 'warn_pause_research',
    title: 'Warn and pause research',
    text: 'Reading, extraction and drafting continue; research stops until next month or until you raise the budget.',
  },
  {
    value: 'hard_stop',
    title: 'Hard stop',
    text: 'Everything pauses, including reading mail. Use only if the cap is strict.',
  },
  {
    value: 'warn_only',
    title: 'Warn only',
    text: 'Nothing pauses; you get a notice at 80% and 100%.',
  },
] as const

/**
 * Board 101 "Limits" (S07-T04): the monthly budget (default USD 150, awaiting sign-off, with the full-volume
 * estimate beside it), the research cap per enquiry (C14) and what happens when the budget is reached. One
 * Save writes them together (aiLimits.save); the Helper reads.
 */
export default function BudgetModes({ cost }: { cost: CostPageData }) {
  const router = useRouter()
  const { toast } = useToast()
  const l = cost.limits
  const [budget, setBudget] = useState(String(l.monthlyBudgetUsd))
  const [cap, setCap] = useState(l.researchCapUsd.toFixed(2))
  const [mode, setMode] = useState<string>(l.mode)
  const [busy, setBusy] = useState(false)
  const changed =
    Number(budget) !== l.monthlyBudgetUsd || Number(cap) !== l.researchCapUsd || mode !== l.mode
  const edit = cost.isOwner

  async function save() {
    setBusy(true)
    const res = await saveAiLimitsAction({
      monthlyBudgetUsd: Number(budget),
      mode: mode as (typeof MODES)[number]['value'],
      researchCapUsd: Number(cap),
      budgetVersion: l.budgetVersion,
      researchVersion: l.researchVersion,
    })
    setBusy(false)
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({ kind: 'success', title: 'Limits saved' })
    router.refresh()
  }

  return (
    <section
      data-part="ai-limits"
      aria-labelledby="limits-title"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-5"
    >
      <h2 id="limits-title" className="io-eyebrow m-0 font-normal">
        Limits
      </h2>
      <Amount
        id="limit-budget"
        label="Monthly budget"
        value={budget}
        onChange={setBudget}
        disabled={!edit}
        note={
          l.budgetAwaiting
            ? 'Default · awaiting sign-off. At full volume the estimate is about USD 170–180 a month; 250 is recommended.'
            : null
        }
      />
      <Amount
        id="limit-research"
        label="Research cap per enquiry"
        value={cap}
        onChange={setCap}
        disabled={!edit}
        note={
          l.researchAwaiting
            ? 'Default · awaiting sign-off. Each trade group in an enquiry shares this cap.'
            : null
        }
      />
      <fieldset className="m-0 mt-1 flex flex-col gap-2.5 border-0 p-0" disabled={!edit}>
        <legend className="io-eyebrow mb-2.5">When the budget is reached</legend>
        {MODES.map((m) => {
          const on = mode === m.value
          return (
            <label
              key={m.value}
              className={cn(
                'rounded-io-card border-io-line flex cursor-pointer gap-3 border px-4 py-3',
                on && 'border-io-accent bg-io-accent-faint'
              )}
            >
              <input
                type="radio"
                name="budget-mode"
                value={m.value}
                checked={on}
                onChange={() => setMode(m.value)}
                className="io-focus mt-0.5 size-4 flex-none"
              />
              <span className="flex flex-col gap-1">
                <span className="text-[13.5px] font-medium">{m.title}</span>
                <span className="text-io-ink-3 text-[12.5px] leading-[1.45]">{m.text}</span>
              </span>
            </label>
          )
        })}
      </fieldset>
      {edit ? (
        <div className="flex justify-end">
          <Button variant="primary" disabled={!changed} busy={busy} onClick={() => void save()}>
            Save limits
          </Button>
        </div>
      ) : null}
    </section>
  )
}

function Amount({
  id,
  label,
  value,
  onChange,
  disabled,
  note,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  disabled: boolean
  note: string | null
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <label htmlFor={id}>{label}</label>
        <span className="rounded-io-ctl border-io-stroke focus-within:border-io-accent flex h-9 items-center gap-1 border px-2.5 tabular-nums">
          USD
          <input
            id={id}
            inputMode="decimal"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
            className="io-focus w-[64px] bg-transparent text-right outline-none"
          />
        </span>
      </div>
      {note ? <span className="text-io-warn text-[11.5px] leading-[1.45]">{note}</span> : null}
    </div>
  )
}
