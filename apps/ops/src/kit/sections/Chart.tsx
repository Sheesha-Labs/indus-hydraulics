import { vatRows } from '@indus/ops-core'
import {
  BarList,
  FxTag,
  Heatmap,
  Money,
  StackedBar,
  TrendChart,
  VatBlock,
  vatBlockRows,
} from '@indus/ops-ui/chart'
import type { ReactNode } from 'react'
import { BARS, FX, MARGIN, MONEY, OUTCOMES, OVERDUE } from '../fixtures'

/** Set to 'built' when S01-T08 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/** One L1 sheet spec row (.cv-sr): 200px label column, then the parts. */
function SpecRow({
  name,
  code,
  note,
  children,
}: {
  name: string
  code: string
  note?: string
  children: ReactNode
}) {
  return (
    <div className="border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-[3px]">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      {children}
    </div>
  )
}

/** Neutral figures with the sheet's digit counts, so tabular numerals line up with it. */
const SUBTOTAL = '248600.00'
const LOCAL = '99440.00'
const pct = (v: number) => `${v.toFixed(1)}%`

/**
 * Chart kit specimen (L1 section k12): the sheet's rows, parts and widths, with neutral samples. VAT rows
 * come from vatRows() in ops-core. Beyond the sheet: a live FX tag and the mixed VAT block, in space the
 * sheet leaves empty.
 */
export default function ChartSpecimen() {
  return (
    <>
      <SpecRow
        name="Bars · Stacked"
        code={'part="Bars|Stacked"'}
        note="data label~value~display~tone~sub"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-[520px] flex-col gap-2.5">
            <BarList title="Awaiting decision by client" data={BARS} />
          </div>
          <div className="flex w-[520px] flex-col gap-2.5">
            <StackedBar title="Outcome · last 90 days" segments={OUTCOMES} />
          </div>
        </div>
      </SpecRow>
      <SpecRow
        name="Trend · Heatmap"
        code={'part="Trend|Heatmap"'}
        note="series label~tone~values[~dash]"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-[620px] flex-col gap-2.5">
            <TrendChart
              title="Margin by month"
              foot="Guardrail 12%"
              x={MARGIN.x}
              series={MARGIN.series}
              format={pct}
            />
          </div>
          <div className="flex w-[440px] flex-col gap-2.5">
            <Heatmap
              title="Overdue · who it waits on"
              columns={OVERDUE.columns}
              rows={OVERDUE.rows}
            />
          </div>
        </div>
      </SpecRow>
      <SpecRow
        name="Money · FX · VAT"
        code={'part="Money|FX|VAT"'}
        note="VAT per quotation: export zero-rated, local 5%, mixed"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Money ccy="USD" amount={SUBTOTAL} aed={{ rate: FX.USD }} />
          <Money ccy="EUR" amount="8420.00" aed={{ rate: FX.EUR }} />
          <Money ccy="AED" amount="-1283.00" size={20} />
          <FxTag
            state="locked"
            pair={`EUR → AED ${FX.EUR}`}
            lockedOn={new Date('2026-10-02T08:00:00Z')}
          />
          <FxTag state="stale" pair={`GBP → AED ${FX.GBP}`} ageDays={3} />
          <FxTag state="live" pair={`USD → AED ${FX.USD}`} />
          <div className="flex w-[300px] flex-col gap-2.5">
            <VatBlock
              rows={vatBlockRows(
                vatRows('zero_rated_export', SUBTOTAL, '0', FX.USD, MONEY.usd.ccy)
              )}
            />
          </div>
          <div className="flex w-[300px] flex-col gap-2.5">
            <VatBlock
              rows={vatBlockRows(vatRows('standard', SUBTOTAL, SUBTOTAL, FX.USD, MONEY.usd.ccy))}
            />
          </div>
          <div className="flex w-[300px] flex-col gap-2.5">
            <VatBlock
              rows={vatBlockRows(vatRows('mixed', SUBTOTAL, LOCAL, undefined, MONEY.usd.ccy))}
            />
          </div>
        </div>
      </SpecRow>
    </>
  )
}
