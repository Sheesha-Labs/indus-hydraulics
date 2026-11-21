import { useId, type ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * Supplier plan (kit K-08 Gantt, template T10). The label column and the axis head are HTML; each row's
 * track is an SVG whose geometry lives in presentation attributes (x/width in % of the track), so there
 * is no inline style and no chart library. Colours are io- classes on the SVG elements.
 *
 * The slip bar's hatching is an SVG <pattern> (9-unit tile rotated 45°: 5 units warn-tint, 4 white),
 * the kit's repeating-linear-gradient(135deg) drawn with token classes.
 *
 * The whole chart is role="img" with a summary label and is followed by a visually hidden table of every
 * bar and milestone, so a screen reader gets the data and colour is never the only signal: slip and late
 * bars always print a text label.
 */

export type GanttBarKind = 'plan' | 'done' | 'slip' | 'late'
export type GanttMilestoneKind = 'due' | 'warn' | 'open'

/** start/end are axis units (column indexes), fractional allowed. */
export interface GanttBar {
  start: number
  end: number
  kind: GanttBarKind
  label?: string
}
export interface GanttMilestone {
  at: number
  kind: GanttMilestoneKind
  label: string
}
export interface GanttRow {
  key: string
  title: ReactNode
  /** Plain-text name for the hidden table when `title` is not a string. */
  titleText?: string
  sub?: ReactNode
  bars: readonly GanttBar[]
  milestones?: readonly GanttMilestone[]
}

/**
 * Tailwind only builds classes it can read in source, so the label column width is a closed set
 * (decision: the plan's free `labelWidth: number` cannot be honoured without inline style).
 */
export type GanttLabelWidth = 200 | 220 | 250 | 260 | 300

export interface GanttProps {
  /** Column labels: ["16 Sep", "23", …]. 1–16 columns. */
  axis: readonly string[]
  /** Fractional axis position of today; its column label turns accent. */
  today?: number
  /** Default "Supplier". */
  labelHeader?: string
  /** Default 250. */
  labelWidth?: GanttLabelWidth
  rows: readonly GanttRow[]
  /** What the chart shows, for its accessible summary and the hidden table caption. */
  caption: string
  className?: string
}

const COLS: Record<GanttLabelWidth, string> = {
  200: 'grid-cols-[200px_minmax(0,1fr)]',
  220: 'grid-cols-[220px_minmax(0,1fr)]',
  250: 'grid-cols-[250px_minmax(0,1fr)]',
  260: 'grid-cols-[260px_minmax(0,1fr)]',
  300: 'grid-cols-[300px_minmax(0,1fr)]',
}

const AXIS_COLS = [
  'grid-cols-1',
  'grid-cols-2',
  'grid-cols-3',
  'grid-cols-4',
  'grid-cols-5',
  'grid-cols-6',
  'grid-cols-7',
  'grid-cols-8',
  'grid-cols-9',
  'grid-cols-10',
  'grid-cols-11',
  'grid-cols-12',
  'grid-cols-13',
  'grid-cols-14',
  'grid-cols-15',
  'grid-cols-16',
] as const

const BAR: Record<GanttBarKind, string> = {
  plan: 'fill-io-accent-tint stroke-io-accent-line',
  done: 'fill-io-accent stroke-io-accent',
  slip: 'stroke-io-warn-solid',
  late: 'fill-io-bad-tint stroke-io-bad-solid',
}

const MILESTONE: Record<GanttMilestoneKind, string> = {
  due: 'fill-io-accent',
  warn: 'fill-io-warn-solid',
  open: 'fill-io-card stroke-io-accent',
}

export const GANTT_STATE_TEXT: Record<GanttBarKind | GanttMilestoneKind, string> = {
  plan: 'Planned',
  done: 'Done',
  slip: 'Slipped',
  late: 'Late',
  due: 'Milestone',
  warn: 'Milestone at risk',
  open: 'Milestone, open',
}

/** Slip and late bars always carry words, so colour is not the only signal. */
export function barLabel(bar: GanttBar): string | undefined {
  if (bar.label) return bar.label
  if (bar.kind === 'slip' || bar.kind === 'late') return GANTT_STATE_TEXT[bar.kind]
  return undefined
}

const pct = (x: number, n: number) => `${+((x / n) * 100).toFixed(4)}%`

function rowName(r: GanttRow): string {
  return r.titleText ?? (typeof r.title === 'string' ? r.title : r.key)
}

export function ganttSummary({ axis, today, rows, caption }: GanttProps): string {
  const bars = rows.flatMap((r) => r.bars)
  const count = (k: GanttBarKind) => bars.filter((b) => b.kind === k).length
  const parts = [
    `${caption}: ${rows.length} ${rows.length === 1 ? 'row' : 'rows'}, ${axis[0]} to ${axis.at(-1)}`,
  ]
  const flags = [
    count('slip') ? `${count('slip')} slipped` : '',
    count('late') ? `${count('late')} late` : '',
  ].filter(Boolean)
  if (flags.length) parts.push(flags.join(', '))
  if (today !== undefined) parts.push(`today in the week of ${axisLabel(axis, today)}`)
  return `${parts.join('; ')}. Details in the table that follows.`
}

function axisLabel(axis: readonly string[], x: number): string {
  return axis[Math.max(0, Math.min(axis.length - 1, Math.floor(x)))] ?? ''
}

export default function Gantt(props: GanttProps) {
  const {
    axis,
    today,
    labelHeader = 'Supplier',
    labelWidth = 250,
    rows,
    caption,
    className,
  } = props
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const n = Math.max(1, Math.min(axis.length, AXIS_COLS.length))
  const cols = COLS[labelWidth]
  const todayCol = today === undefined ? -1 : Math.floor(today)

  return (
    <div className={cn('w-full', className)}>
      <div
        role="img"
        aria-label={ganttSummary(props)}
        className="rounded-io-card border-io-line bg-io-card w-full overflow-hidden border"
      >
        <div className={cn('border-io-line bg-io-paper grid border-b', cols)}>
          <div className="io-eyebrow px-3.5 py-2">{labelHeader}</div>
          <div className={cn('grid text-[10.5px]', AXIS_COLS[n - 1])}>
            {axis.slice(0, n).map((a, i) => (
              <span
                key={`${a}-${i}`}
                className={cn(
                  'border-io-line text-io-ink-3 border-l px-1.5 py-2',
                  i === todayCol && 'text-io-accent font-medium'
                )}
              >
                {a}
              </span>
            ))}
          </div>
        </div>
        {rows.map((r, ri) => {
          const patternId = `${uid}-slip-${ri}`
          const hasSlip = r.bars.some((b) => b.kind === 'slip')
          return (
            <div
              key={r.key}
              className={cn('border-io-line grid min-h-[62px] border-b last:border-b-0', cols)}
            >
              <div className="border-io-line flex flex-col gap-[3px] border-r px-3.5 py-2.5 text-[12.5px]">
                <span>{r.title}</span>
                {r.sub ? <small className="text-io-ink-3 text-[11.5px]">{r.sub}</small> : null}
              </div>
              <div className="relative">
                <svg className="absolute inset-0 block size-full overflow-visible">
                  {hasSlip ? (
                    <defs>
                      <pattern
                        id={patternId}
                        width="9"
                        height="9"
                        patternUnits="userSpaceOnUse"
                        patternTransform="rotate(45)"
                      >
                        <rect width="5" height="9" className="fill-io-warn-tint" />
                        <rect x="5" width="4" height="9" className="fill-io-card" />
                      </pattern>
                    </defs>
                  ) : null}
                  {Array.from({ length: n }, (_, k) => (
                    <line
                      key={k}
                      x1={pct(k + 1, n)}
                      x2={pct(k + 1, n)}
                      y1="0"
                      y2="100%"
                      transform="translate(-0.5 0)"
                      strokeWidth="1"
                      className="stroke-io-line-2"
                    />
                  ))}
                  {r.bars.map((b, bi) => {
                    const label = barLabel(b)
                    return (
                      <g key={bi} data-kind={b.kind}>
                        {/* Nested viewport: the 1px border sits inside the bar, as in the kit. */}
                        <svg
                          x={pct(b.start, n)}
                          y="26"
                          width={pct(b.end - b.start, n)}
                          height="12"
                          className="overflow-visible"
                        >
                          <rect
                            x="0.5"
                            y="0.5"
                            height="11"
                            rx="2.5"
                            strokeWidth="1"
                            className={cn('[width:calc(100%_-_1px)]', BAR[b.kind])}
                            {...(b.kind === 'slip' ? { fill: `url(#${patternId})` } : {})}
                          />
                        </svg>
                        {label ? (
                          <text x={pct(b.start, n)} y="18" className="fill-io-ink-2 text-[10px]">
                            {label}
                          </text>
                        ) : null}
                      </g>
                    )
                  })}
                  {(r.milestones ?? []).map((m, mi) => (
                    <svg
                      key={mi}
                      x={pct(m.at, n)}
                      y="32"
                      className="overflow-visible"
                      data-kind={m.kind}
                    >
                      {m.kind === 'open' ? (
                        <rect
                          x="-4.25"
                          y="-4.25"
                          width="8.5"
                          height="8.5"
                          strokeWidth="1.5"
                          transform="rotate(45)"
                          className={MILESTONE.open}
                        />
                      ) : (
                        <rect
                          x="-5"
                          y="-5"
                          width="10"
                          height="10"
                          transform="rotate(45)"
                          className={MILESTONE[m.kind]}
                        />
                      )}
                    </svg>
                  ))}
                  {today !== undefined ? (
                    <rect
                      x={pct(today, n)}
                      y="0"
                      width="1.5"
                      height="100%"
                      className="fill-io-bad-solid"
                    />
                  ) : null}
                </svg>
              </div>
            </div>
          )
        })}
      </div>
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{labelHeader}</th>
            <th scope="col">Phase</th>
            <th scope="col">Start</th>
            <th scope="col">End</th>
            <th scope="col">State</th>
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((r) => [
            ...r.bars.map((b, bi) => (
              <tr key={`${r.key}-b${bi}`}>
                <th scope="row">{rowName(r)}</th>
                <td>{barLabel(b) ?? GANTT_STATE_TEXT[b.kind]}</td>
                <td>{axisLabel(axis, b.start)}</td>
                <td>{axisLabel(axis, b.end)}</td>
                <td>{GANTT_STATE_TEXT[b.kind]}</td>
              </tr>
            )),
            ...(r.milestones ?? []).map((m, mi) => (
              <tr key={`${r.key}-m${mi}`}>
                <th scope="row">{rowName(r)}</th>
                <td>{m.label}</td>
                <td>{axisLabel(axis, m.at)}</td>
                <td>{axisLabel(axis, m.at)}</td>
                <td>{GANTT_STATE_TEXT[m.kind]}</td>
              </tr>
            )),
          ])}
        </tbody>
      </table>
    </div>
  )
}
