import {
  CRIMP_DIE_POSITIONS,
  CRIMP_SPECS,
  RATING_ROWS,
  THREAD_FAMILIES,
  convertLength,
  crimpHose,
  crimpSeries,
  glossaryTerm,
  type ResourceKey,
} from '@indus/domain'
import { columnPath } from './chart-geometry'

/**
 * The specimen panel at the top of each reference card on `/resources`.
 *
 * Each one is a real slice of the page it advertises, drawn from the same data
 * — a card that shows four rows of the thread chart tells a technician more
 * than a sentence describing it, and it cannot drift from the page because it
 * IS the page's data. Decorative to a screen reader: the card's own text and
 * spec list carry the content, so every specimen is `aria-hidden`.
 */

function ThreadSpecimen() {
  const family = THREAD_FAMILIES.find((f) => f.id === 'unf-jic-orb-flareless')
  const rows =
    family && family.kind === 'thread'
      ? family.rows.filter((r) => [4, 6, 8, 12].includes(r.dash ?? 0))
      : []
  return (
    <table className="w-full font-mono text-[11.5px] tabular-nums">
      <thead>
        <tr className="text-ih-muted text-[9px] tracking-[0.1em] uppercase">
          <th className="pb-2 text-left font-medium">Dash</th>
          <th className="pb-2 text-left font-medium">Thread</th>
          <th className="pb-2 text-right font-medium">Male O.D.</th>
          <th className="pb-2 text-right font-medium">mm</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.thread} className="border-ih-border border-t">
            <td className="text-ih-ink py-1.5">-{row.dash}</td>
            <td className="text-ih-ink-2 py-1.5">{row.thread}</td>
            <td className="text-ih-ink-2 py-1.5 text-right">{row.maleOd.toFixed(3)}</td>
            <td className="text-ih-muted py-1.5 text-right">
              {convertLength(row.maleOd, 'in').millimetres.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CrimpSpecimen() {
  const row =
    CRIMP_SPECS.find((r) => r.hose === 'R2S' && r.dash === 8 && r.series === 'BW') ?? CRIMP_SPECS[0]
  if (!row) return null
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-wrap gap-1.5">
        {[crimpHose(row.hose).name, `-${row.dash} · ${row.bore}`, crimpSeries(row.series).name].map(
          (chip) => (
            <span
              key={chip}
              className="mono border-ih-border bg-ih-surface text-ih-ink-2 inline-flex h-6 items-center rounded-full border px-2.5 text-[10.5px]"
            >
              {chip}
            </span>
          )
        )}
      </div>
      <div>
        <p className="mono text-ih-muted text-[9px] tracking-[0.12em] uppercase">
          Finished crimp diameter
        </p>
        <p className="text-ih-ink mt-1.5 font-mono text-[34px] leading-none tracking-[-0.03em]">
          {row.crimpIn.toFixed(2)}
          <span className="text-ih-muted ml-1.5 text-[14px] tracking-normal">in</span>
          <span className="text-ih-ink-2 ml-4 text-[20px]">{row.crimpMm.toFixed(2)}</span>
          <span className="text-ih-muted ml-1 text-[12px] tracking-normal">mm</span>
        </p>
        <p className="mono text-ih-muted mt-2 text-[10.5px]">
          {CRIMP_DIE_POSITIONS[row.die].label}
        </p>
      </div>
    </div>
  )
}

/**
 * NPTF ratings across sizes, as columns on one scale. Single series, so no
 * legend; the caption beneath names it. Heights are proportional to psi against
 * a 6,000 psi ceiling.
 */
function PressureSpecimen() {
  const rows = RATING_ROWS.filter((r) => r.psi.nptf !== undefined)
  const ceiling = 6000
  const width = 300
  const plot = 104
  const slot = width / rows.length
  const bar = Math.min(18, slot - 6)
  return (
    <div className="flex h-full flex-col justify-between">
      <svg viewBox={`0 0 ${width} ${plot + 16}`} className="h-auto w-full" role="presentation">
        <line x1="0" x2={width} y1={plot} y2={plot} className="stroke-ih-border" strokeWidth="1" />
        {rows.map((row, i) => {
          const psi = row.psi.nptf ?? 0
          const x = i * slot + (slot - bar) / 2
          return (
            <g key={row.dash}>
              <path
                d={columnPath(x, plot, bar, (psi / ceiling) * plot)}
                className="fill-ih-accent"
              />
              <text
                x={i * slot + slot / 2}
                y={plot + 12}
                textAnchor="middle"
                className="fill-ih-muted font-mono text-[9px]"
              >
                -{row.dash}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mono text-ih-muted mt-2 text-[10.5px]">
        NPTF, carbon steel · {(rows[0]?.psi.nptf ?? 0).toLocaleString('en-GB')} →{' '}
        {(rows[rows.length - 1]?.psi.nptf ?? 0).toLocaleString('en-GB')} psi
      </p>
    </div>
  )
}

function GlossarySpecimen() {
  const term = glossaryTerm('drop-length')
  if (!term) return null
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="mono text-ih-muted text-[9px] tracking-[0.12em] uppercase">D · term</p>
      <p className="text-ih-ink mt-2 font-serif text-[30px] leading-none tracking-[-0.01em]">
        {term.term}
      </p>
      <p className="text-ih-ink-2 mt-3 line-clamp-3 text-[12.5px] leading-[1.55]">
        {term.definition}
      </p>
    </div>
  )
}

export default function ResourceSpecimen({ resource }: { resource: ResourceKey }) {
  return (
    <div
      aria-hidden="true"
      className="border-ih-border bg-ih-surface-2 h-[196px] border-b px-6 py-5"
    >
      {resource === 'thread-chart' ? <ThreadSpecimen /> : null}
      {resource === 'crimp-specifications' ? <CrimpSpecimen /> : null}
      {resource === 'fitting-pressure-ratings' ? <PressureSpecimen /> : null}
      {resource === 'hydraulic-glossary' ? <GlossarySpecimen /> : null}
    </div>
  )
}
