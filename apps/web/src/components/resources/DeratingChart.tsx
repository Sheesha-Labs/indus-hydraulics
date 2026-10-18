import { RATING_ROWS, ratingConnection, type RatingConnectionId } from '@indus/domain'
import { columnPath, ticks } from './chart-geometry'

/**
 * How each connection's rating falls with size — small multiples on ONE scale.
 *
 * Small multiples rather than one chart with six coloured series: the site has
 * one loud colour, six categorical hues would fight it, and six lines crossing
 * at the small sizes would be unreadable anyway. Each panel is a single series
 * in the accent, so no legend is needed — the panel title names it — and every
 * panel shares the same y scale and the same x categories, so a column in one
 * panel can be compared with the column in the same place in the next.
 *
 * Server-rendered SVG. Hovering a column shows its value; the
 * native <title> carries the same text for touch and assistive technology, and
 * the full figures are in the table above the chart.
 */

const SIZES = [4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 32] as const
const MAX = 7000
const STEP = 2000

const W = 320
const H = 188
const PAD = { top: 22, right: 8, bottom: 26, left: 40 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

const y = (psi: number) => PAD.top + PLOT_H - (psi / MAX) * PLOT_H
const slot = PLOT_W / SIZES.length
const barWidth = Math.min(24, slot - 6)

const fmt = (n: number) => n.toLocaleString('en-GB')

function Panel({ id }: { id: RatingConnectionId }) {
  const conn = ratingConnection(id)
  const values = SIZES.map((dash) => ({ dash, psi: RATING_ROWS.find((r) => r.dash === dash)?.psi[id] }))
  const rated = values.filter((v): v is { dash: (typeof SIZES)[number]; psi: number } => v.psi !== undefined)
  const first = rated[0]
  const last = rated[rated.length - 1]
  const summary = `${conn.name}: ${rated.map((v) => `-${v.dash} ${fmt(v.psi)} psi`).join(', ')}.`

  return (
    <figure className="rounded-lg border border-ih-border bg-ih-surface px-4 pb-3 pt-4">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-medium tracking-[-0.01em] text-ih-ink">{conn.short}</span>
        <span className="mono text-[10px] text-ih-muted">
          {first && last ? `${fmt(first.psi)} → ${fmt(last.psi)} psi` : null}
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 h-auto w-full overflow-visible" role="img" aria-label={summary}>
        {ticks(MAX - 1000, STEP).map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-ih-border" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" className="fill-ih-muted font-mono text-[9px]">
              {t === 0 ? '0' : `${t / 1000}k`}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const x = PAD.left + i * slot + (slot - barWidth) / 2
          const cx = PAD.left + i * slot + slot / 2
          return (
            <g key={v.dash} className="group">
              {v.psi !== undefined ? (
                <>
                  <title>{`-${v.dash}: ${fmt(v.psi)} psi`}</title>
                  {/* Hit target wider and taller than the mark. */}
                  <rect x={PAD.left + i * slot} y={PAD.top} width={slot} height={PLOT_H} className="fill-transparent" />
                  <path
                    d={columnPath(x, y(0), barWidth, y(0) - y(v.psi))}
                    className="fill-ih-accent transition-[fill] duration-150 group-hover:fill-ih-accent-hover"
                  />
                  <text
                    x={cx}
                    y={y(v.psi) - 5}
                    textAnchor="middle"
                    className="pointer-events-none fill-ih-ink font-mono text-[9.5px] opacity-0 group-hover:opacity-100"
                  >
                    {fmt(v.psi)}
                  </text>
                </>
              ) : (
                <line x1={cx - 3} x2={cx + 3} y1={y(0) - 2} y2={y(0) - 2} className="stroke-ih-muted-2" strokeWidth="1" />
              )}
              <text x={cx} y={H - 10} textAnchor="middle" className="fill-ih-muted font-mono text-[8.5px]">
                {v.dash}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mono -mt-0.5 text-right text-[9px] uppercase tracking-[0.1em] text-ih-muted-2">Dash size</p>
    </figure>
  )
}

export default function DeratingChart({ connections }: { connections: readonly RatingConnectionId[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {connections.map((id) => (
        <Panel key={id} id={id} />
      ))}
    </div>
  )
}
