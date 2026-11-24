import type { CostPageData } from '../../data/ai-cost'

/**
 * Board 101 "Month to date" (S07-T04): USD spent of the budget, day x of y (Asia/Dubai), the projection at the
 * current pace and a marker where a straight-line budget would be today. Data-driven geometry is SVG.
 */
export default function SpendMeter({ cost }: { cost: CostPageData }) {
  const fill = Math.round(cost.spentShare * 1000) / 10
  const marker = Math.round(cost.markerShare * 1000) / 10
  return (
    <section
      data-part="spend-meter"
      aria-labelledby="mtd-title"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-5"
    >
      <h2 id="mtd-title" className="io-eyebrow m-0 font-normal">
        Month to date · {cost.monthLabel}
      </h2>
      <p className="m-0 flex items-baseline gap-3">
        <span className="text-[32px] leading-none font-medium tracking-[-0.02em] tabular-nums">
          USD {Number(cost.mtdUsd) >= 100 ? Math.round(Number(cost.mtdUsd)) : cost.mtdUsd}
        </span>
        <span className="text-io-ink-3 text-[13px]">
          of USD {cost.limitUsd.toLocaleString('en-US')} budget · day {cost.day} of {cost.days}
        </span>
      </p>
      <svg
        role="img"
        aria-label={`${fill}% of the budget used; a straight line would be at ${marker}% today`}
        viewBox="0 0 100 4"
        preserveAspectRatio="none"
        className="h-2 w-full"
      >
        <rect x="0" y="0" width="100" height="4" rx="2" className="fill-io-fill" />
        <rect x="0" y="0" width={fill} height="4" rx="2" className="fill-io-accent" />
        <rect
          x={Math.max(0, marker - 0.15)}
          y="0"
          width="0.3"
          height="4"
          className="fill-io-ink-2"
        />
      </svg>
      <p className="text-io-ink-3 m-0 text-[12.5px]">
        On pace for about USD {Math.round(Number(cost.projectionUsd))} this month. The marker shows
        a straight-line budget to date.
      </p>
    </section>
  )
}

/** Board 101 "Most expensive runs": the ten actions that cost the most this month. */
export function TopRuns({ runs }: { runs: CostPageData['topRuns'] }) {
  return (
    <section
      data-part="top-runs"
      aria-labelledby="top-title"
      className="rounded-io-card border-io-line bg-io-card flex flex-col border px-[18px] py-5"
    >
      <h2 id="top-title" className="io-eyebrow m-0 mb-2 font-normal">
        Most expensive runs
      </h2>
      {runs.length === 0 ? (
        <p className="text-io-ink-3 m-0 text-[12.5px]">No model calls this month yet.</p>
      ) : (
        <table className="w-full border-collapse text-[12.5px]">
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} className="border-io-line border-b last:border-b-0">
                <td className="text-io-ink-3 w-[140px] py-2.5">{r.purpose}</td>
                <td className="max-w-0 truncate py-2.5">
                  {r.title}
                  {r.ref ? ` · ${r.ref}` : ''}
                </td>
                <td className="py-2.5 text-right font-medium tabular-nums">USD {r.usd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
