'use client'

import { Segmented } from '@indus/ops-ui/controls'
import { useState } from 'react'
import type { CostPageData, SpendLine } from '../../data/ai-cost'

/**
 * Board 101 "Breakdown" (S07-T04): this month's spend by purpose as the board names them (Reading mail =
 * read_mail + classify; Extraction; Supplier research; Drafting; Compare and Other when used), or by model,
 * with the volumes under it. Bars are SVG.
 */
export default function SpendBreakdown({ cost }: { cost: CostPageData }) {
  const [view, setView] = useState<'purpose' | 'model'>('purpose')
  const lines: SpendLine[] = view === 'purpose' ? cost.byPurpose : cost.byModel
  return (
    <section
      data-part="spend-breakdown"
      aria-labelledby="breakdown-title"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-5"
    >
      <div className="flex items-center justify-between">
        <h2 id="breakdown-title" className="io-eyebrow m-0 font-normal">
          Breakdown
        </h2>
        <Segmented<'purpose' | 'model'>
          size="sm"
          aria-label="Breakdown by"
          value={view}
          onValueChange={setView}
          options={[
            { value: 'purpose', label: 'By purpose' },
            { value: 'model', label: 'By model' },
          ]}
        />
      </div>
      {lines.length === 0 ? (
        <p className="text-io-ink-3 m-0 text-[12.5px]">No model calls this month yet.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {lines.map((l) => (
            <li
              key={l.key}
              className="grid grid-cols-[150px_minmax(0,1fr)_88px] items-center gap-3 text-[13px]"
            >
              <span className="truncate">{l.label}</span>
              <svg
                role="img"
                aria-label={`${Math.round(l.share * 100)}% of this month’s spend`}
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
                className="h-2 w-full"
              >
                <rect x="0" y="0" width="100" height="4" className="fill-io-fill" />
                <rect
                  x="0"
                  y="0"
                  width={Math.round(l.share * 1000) / 10}
                  height="4"
                  className="fill-io-accent"
                />
              </svg>
              <span className="text-right tabular-nums">USD {l.usd}</span>
            </li>
          ))}
        </ul>
      )}
      {view === 'purpose' && cost.volumes ? (
        <p className="text-io-ink-3 m-0 text-[12.5px]">{cost.volumes}</p>
      ) : null}
    </section>
  )
}
