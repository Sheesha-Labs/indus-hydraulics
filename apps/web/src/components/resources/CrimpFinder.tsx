'use client'

import { useMemo, useState } from 'react'
import { Button, Select } from '@indus/ui'
import {
  CRIMP_DIE_POSITIONS,
  CRIMP_HOSES,
  CRIMP_SERIES,
  CRIMP_SPECS,
  type CrimpHoseCode,
  type CrimpSeriesCode,
} from '@indus/domain'
import { RefTable, TD, TD_NUM, TD_ROW_HEAD, TH, TH_NUM, TR } from './RefTable'

/**
 * Three selects over the crimp table.
 *
 * Starts on "all", so the server render IS the complete table — every one of
 * the rows is in the HTML before any script runs, and the filters only narrow
 * what is already there. A crawler, a reader with scripts off and a reader
 * printing the page all get the full chart.
 *
 * Options only offer combinations that exist: picking a hose narrows the series
 * list to the series published for that hose, and the sizes to the sizes
 * published for both. A filter that can produce "no results" from its own
 * dropdowns is a filter that has not done its job.
 */

const ALL = 'all'

export default function CrimpFinder() {
  const [hose, setHose] = useState<CrimpHoseCode | typeof ALL>(ALL)
  const [series, setSeries] = useState<CrimpSeriesCode | typeof ALL>(ALL)
  const [dash, setDash] = useState<number | typeof ALL>(ALL)

  const byHose = useMemo(() => CRIMP_SPECS.filter((r) => hose === ALL || r.hose === hose), [hose])
  const seriesOptions = useMemo(
    () => CRIMP_SERIES.filter((s) => byHose.some((r) => r.series === s.code)),
    [byHose],
  )
  const bySeries = useMemo(() => byHose.filter((r) => series === ALL || r.series === series), [byHose, series])
  const dashOptions = useMemo(() => [...new Set(bySeries.map((r) => r.dash))].sort((a, b) => a - b), [bySeries])
  const rows = useMemo(() => bySeries.filter((r) => dash === ALL || r.dash === dash), [bySeries, dash])

  const hoseName = new Map(CRIMP_HOSES.map((h) => [h.code, h.name]))
  const seriesName = new Map(CRIMP_SERIES.map((s) => [s.code, s.name]))
  const filtered = hose !== ALL || series !== ALL || dash !== ALL

  return (
    <div className="flex flex-col gap-5">
      <form
        role="search"
        aria-label="Filter crimp settings"
        onSubmit={(event) => event.preventDefault()}
        className="grid grid-cols-1 items-end gap-3 rounded-lg border border-ih-border bg-ih-surface p-4 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
      >
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">Hose</span>
          <Select
            id="crimp-hose"
            className="h-10 text-[13.5px]"
            value={hose}
            onChange={(event) => {
              setHose(event.target.value as CrimpHoseCode | typeof ALL)
              setSeries(ALL)
              setDash(ALL)
            }}
          >
            <option value={ALL}>All hose types</option>
            {CRIMP_HOSES.map((h) => (
              <option key={h.code} value={h.code}>
                {h.name} — {h.construction}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">Fitting series</span>
          <Select
            id="crimp-series"
            className="h-10 text-[13.5px]"
            value={series}
            onChange={(event) => {
              setSeries(event.target.value as CrimpSeriesCode | typeof ALL)
              setDash(ALL)
            }}
          >
            <option value={ALL}>All series</option>
            {seriesOptions.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="mono text-[10px] uppercase tracking-[0.12em] text-ih-muted">Size</span>
          <Select
            id="crimp-size"
            className="h-10 text-[13.5px]"
            value={String(dash)}
            onChange={(event) => setDash(event.target.value === ALL ? ALL : Number(event.target.value))}
          >
            <option value={ALL}>All sizes</option>
            {dashOptions.map((d) => (
              <option key={d} value={d}>
                -{d}
              </option>
            ))}
          </Select>
        </label>
        <Button
          type="button"
          kind="ghost"
          disabled={!filtered}
          onClick={() => {
            setHose(ALL)
            setSeries(ALL)
            setDash(ALL)
          }}
        >
          Clear
        </Button>
      </form>

      {/* Announced politely so a screen-reader user hears the count change. */}
      <p aria-live="polite" className="mono text-[11px] uppercase tracking-[0.08em] text-ih-muted">
        {rows.length === CRIMP_SPECS.length
          ? `All ${rows.length} crimp settings`
          : `${rows.length} of ${CRIMP_SPECS.length} crimp settings`}
      </p>

      <RefTable
        caption="Finished crimp diameter by hose, size and fitting series"
        captionHidden
        minWidthClass="min-w-[760px]"
        head={
          <tr>
            <th scope="col" className={TH}>
              Hose
            </th>
            <th scope="col" className={TH}>
              Size
            </th>
            <th scope="col" className={TH}>
              Bore
            </th>
            <th scope="col" className={TH}>
              Fitting series
            </th>
            <th scope="col" className={TH_NUM}>
              Crimp Ø <span className="text-ih-muted-2">in</span>
            </th>
            <th scope="col" className={TH_NUM}>
              Crimp Ø <span className="text-ih-muted-2">mm</span>
            </th>
            <th scope="col" className={TH}>
              Die position
            </th>
          </tr>
        }
      >
        {rows.map((row) => (
          <tr key={`${row.hose}-${row.dash}-${row.series}`} className={TR}>
            <th scope="row" className={TD_ROW_HEAD}>
              {hoseName.get(row.hose)}
            </th>
            <td className={TD}>-{row.dash}</td>
            <td className={TD}>{row.bore}</td>
            <td className={TD}>{seriesName.get(row.series)}</td>
            <td className={`${TD_NUM} text-[14px] font-medium text-ih-ink`}>{row.crimpIn.toFixed(2)}</td>
            <td className={TD_NUM}>{row.crimpMm.toFixed(2)}</td>
            <td className={`${TD} font-sans text-[12.5px]`}>{CRIMP_DIE_POSITIONS[row.die].label}</td>
          </tr>
        ))}
      </RefTable>
    </div>
  )
}
