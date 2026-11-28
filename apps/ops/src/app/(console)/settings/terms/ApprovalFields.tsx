'use client'

import type { ApprovalRule } from '@indus/ops-core'
import { Select } from '@indus/ops-ui/controls'
import { useState } from 'react'

type Kind = 'none' | ApprovalRule['kind']

/** The approval rule as a form: none, always, payment over n days, advance below n %. Posts `approval` + `n`. */
export default function ApprovalFields({ rule }: { rule: ApprovalRule | null }) {
  const [kind, setKind] = useState<Kind>(rule?.kind ?? 'none')
  const n =
    rule?.kind === 'payment_days_over'
      ? rule.days
      : rule?.kind === 'advance_pct_below'
        ? rule.pct
        : ''
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-io-ink-2 text-[12px] font-medium">Approval</span>
        <Select<Kind>
          size="md"
          name="approval"
          aria-label="Approval"
          value={kind}
          onChange={(e) => setKind(e.currentTarget.value as Kind)}
          options={[
            { value: 'none', label: 'No approval' },
            { value: 'always', label: 'Approval always' },
            { value: 'payment_days_over', label: 'Approval above n days' },
            { value: 'advance_pct_below', label: 'Approval below n % advance' },
          ]}
        />
      </label>
      {kind === 'payment_days_over' || kind === 'advance_pct_below' ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-io-ink-2 text-[12px] font-medium">
            {kind === 'payment_days_over' ? 'Days' : 'Advance %'}
          </span>
          <input
            name="n"
            type="number"
            min={1}
            max={kind === 'payment_days_over' ? 365 : 100}
            defaultValue={n || (kind === 'payment_days_over' ? 60 : 30)}
            required
            className="border-io-stroke rounded-io-ctl io-focus-field h-io-field bg-io-card border px-3 text-[13px]"
          />
        </label>
      ) : null}
    </div>
  )
}

export function approvalFromForm(f: FormData): ApprovalRule | null {
  const kind = String(f.get('approval') ?? 'none')
  const n = Number(f.get('n'))
  if (kind === 'always') return { kind: 'always' }
  if (kind === 'payment_days_over') return { kind, days: n }
  if (kind === 'advance_pct_below') return { kind, pct: n }
  return null
}
