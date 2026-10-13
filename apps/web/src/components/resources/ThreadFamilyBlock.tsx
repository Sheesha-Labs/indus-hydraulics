import Link from 'next/link'
import { convertLength, type ThreadChartFamily } from '@indus/domain'
import { ArrowRightIcon } from '../designed/icons'
import { ANCHOR_OFFSET } from './ResourceLayout'
import { Dual, RefTable, TD, TD_NUM, TD_ROW_HEAD, TH, TH_NUM, TR } from './RefTable'

/**
 * One connection family on the thread chart: what it is, where it seals, the
 * one thing that tells it apart, and its table.
 *
 * Inch families show inches first with millimetres beside them; metric
 * families the other way round. Either way both units are on every row — a
 * reader with metric calipers and an inch thread should not need a converter.
 */

const inch = (v: number) => v.toFixed(3)
const mm = (v: number) => v.toFixed(2)

/**
 * A dimension in both units. `approx` drops the inch figure to two places: the
 * female diameters are approximate, and three places would claim a precision
 * the figure does not have.
 */
function both(value: number, unit: 'in' | 'mm', approx = false) {
  const c = convertLength(value, unit)
  return unit === 'in' ? (
    <Dual inches={approx ? c.inches.toFixed(2) : inch(c.inches)} millimetres={approx ? c.millimetres.toFixed(1) : mm(c.millimetres)} />
  ) : (
    <>
      {mm(c.millimetres)}
      <span className="ml-2 text-ih-muted">{inch(c.inches)}</span>
    </>
  )
}

export default function ThreadFamilyBlock({ family }: { family: ThreadChartFamily }) {
  const headingId = `${family.id}-name`
  return (
    <article id={family.id} aria-labelledby={headingId} className={`${ANCHOR_OFFSET} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h3 id={headingId} className="text-[21px] font-medium tracking-[-0.02em] sm:text-[23px]">
          {family.name}
        </h3>
        <span className="mono text-[10.5px] tracking-[0.06em] text-ih-steel">{family.standard}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-8">
        <p className="text-[14px] leading-[1.65] text-ih-ink-2">{family.seal}</p>
        {family.note ? (
          <p className="border-l-2 border-ih-accent pl-4 text-[13px] leading-[1.6] text-ih-muted">{family.note}</p>
        ) : null}
      </div>

      {family.kind === 'thread' ? (
        <RefTable
          caption={`${family.name} — thread dimensions. Female I.D. is approximate, for identification only.`}
          minWidthClass="min-w-[720px]"
          head={
            <tr>
              <th scope="col" className={TH}>
                Dash
              </th>
              <th scope="col" className={TH}>
                Nominal
              </th>
              <th scope="col" className={TH}>
                Thread
              </th>
              <th scope="col" className={TH_NUM}>
                {family.unit === 'in' ? 'TPI' : 'Pitch'}
              </th>
              <th scope="col" className={TH_NUM}>
                Male thread O.D. <span className="text-ih-muted-2">{family.unit === 'in' ? 'in · mm' : 'mm · in'}</span>
              </th>
              <th scope="col" className={TH_NUM}>
                Female thread I.D. <span className="text-ih-muted-2">≈ {family.unit === 'in' ? 'in · mm' : 'mm · in'}</span>
              </th>
            </tr>
          }
        >
          {family.rows.map((row) => (
            <tr key={row.thread} className={TR}>
              <th scope="row" className={TD_ROW_HEAD}>
                {row.dash ? `-${row.dash}` : '—'}
              </th>
              <td className={TD}>{row.nominal}</td>
              <td className={`${TD} text-ih-ink`}>{row.thread}</td>
              <td className={TD_NUM}>{row.pitch}</td>
              <td className={TD_NUM}>{both(row.maleOd, family.unit)}</td>
              <td className={TD_NUM}>{row.femaleId === null ? '—' : both(row.femaleId, family.unit, true)}</td>
            </tr>
          ))}
        </RefTable>
      ) : null}

      {family.kind === 'flange' ? (
        <RefTable
          caption={`${family.name} — bolt spacing on the long side and flange head O.D.`}
          minWidthClass="min-w-[760px]"
          head={
            <tr>
              <th scope="col" className={TH}>
                Dash
              </th>
              <th scope="col" className={TH}>
                Nominal
              </th>
              <th scope="col" className={TH_NUM}>
                Code 61 bolt spacing <span className="text-ih-muted-2">in · mm</span>
              </th>
              <th scope="col" className={TH_NUM}>
                Code 61 head O.D.
              </th>
              <th scope="col" className={TH_NUM}>
                Code 62 bolt spacing
              </th>
              <th scope="col" className={TH_NUM}>
                Code 62 head O.D.
              </th>
            </tr>
          }
        >
          {family.rows.map((row) => (
            <tr key={row.dash} className={TR}>
              <th scope="row" className={TD_ROW_HEAD}>
                -{row.dash}
              </th>
              <td className={TD}>{row.nominal}</td>
              <td className={TD_NUM}>{both(row.code61Spacing, 'in')}</td>
              <td className={TD_NUM}>{both(row.code61Od, 'in')}</td>
              <td className={TD_NUM}>{row.code62Spacing === null ? 'Not made' : both(row.code62Spacing, 'in')}</td>
              <td className={TD_NUM}>{row.code62Od === null ? 'Not made' : both(row.code62Od, 'in')}</td>
            </tr>
          ))}
        </RefTable>
      ) : null}

      {family.kind === 'cone' ? (
        <RefTable
          caption={`${family.name} — thread by tube O.D. and series`}
          minWidthClass="min-w-[520px]"
          head={
            <tr>
              <th scope="col" className={TH}>
                Tube O.D. <span className="text-ih-muted-2">mm</span>
              </th>
              <th scope="col" className={TH}>
                LL · extra light
              </th>
              <th scope="col" className={TH}>
                L · light
              </th>
              <th scope="col" className={TH}>
                S · heavy
              </th>
            </tr>
          }
        >
          {family.rows.map((row) => (
            <tr key={row.tubeOd} className={TR}>
              <th scope="row" className={TD_ROW_HEAD}>
                {row.tubeOd}
              </th>
              <td className={TD}>{row.ll ?? <span className="text-ih-muted-2">—</span>}</td>
              <td className={TD}>{row.l ?? <span className="text-ih-muted-2">—</span>}</td>
              <td className={TD}>{row.s ?? <span className="text-ih-muted-2">—</span>}</td>
            </tr>
          ))}
        </RefTable>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono text-[10.5px] uppercase tracking-[0.08em] text-ih-muted">
          Identifies: {family.covers.join(' · ')}
        </p>
        {family.shopHref ? (
          <Link
            href={family.shopHref}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ih-accent hover:text-ih-accent-hover"
          >
            {family.shopLabel ?? 'Shop this family'}
            <ArrowRightIcon size={14} />
          </Link>
        ) : null}
      </div>
    </article>
  )
}
