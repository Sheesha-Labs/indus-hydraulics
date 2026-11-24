'use client'

import { Tag } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import { Fragment, useState } from 'react'
import { readLogEntry } from '../../actions/read/log-entry'
import type { LogDay, LogEntryDetail, LogRow } from '../../data/assistant-log'

/**
 * Board 111's table: Time · Actor · Action · Record · Level · Outcome · Cost, grouped by day; an Assistant row
 * expands (▾) to what it read, what it wrote and the values it changed, with its entry id. Read through a
 * read action when opened.
 */
const TONE: Record<LogRow['outcome']['tone'], string> = {
  ok: 'bg-io-ok-tint text-io-banner-ok-ink',
  info: 'bg-io-info-tint text-io-info',
  warn: 'bg-io-warn-tint text-io-banner-warn-ink',
  bad: 'bg-io-bad-tint text-io-banner-bad-ink',
  muted: 'bg-io-fill text-io-ink-2',
}

function Detail({ detail }: { detail: LogEntryDetail }) {
  return (
    <div className="grid grid-cols-3 gap-6 px-4 py-4 text-[12.5px] leading-[1.5]">
      <section aria-label="Inputs read">
        <h3 className="io-eyebrow mb-2">Inputs read</h3>
        {detail.inputs.length ? (
          <ul className="flex flex-col gap-1">
            {detail.inputs.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        ) : (
          <p className="text-io-ink-3">—</p>
        )}
      </section>
      <section aria-label="Output">
        <h3 className="io-eyebrow mb-2">
          {detail.output ? `Output · ${detail.output.title}` : 'Output'}
        </h3>
        {detail.output ? (
          <p className="bg-io-card border-io-line rounded-io-ctl border px-3 py-2 whitespace-pre-line">
            {detail.output.text}
          </p>
        ) : (
          <p className="text-io-ink-3">No email.</p>
        )}
        {detail.calls.length ? (
          <ul className="text-io-ink-3 mt-2 flex flex-col gap-0.5 text-[12px]">
            {detail.calls.map((c, i) => (
              <li key={i}>
                {c.model} · {c.tokens}
                {c.cost ? ` · ${c.cost}` : ''}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      <section aria-label="Values written">
        <h3 className="io-eyebrow mb-2">Values written</h3>
        {detail.values.length ? (
          <ul className="flex flex-col gap-1">
            {detail.values.map((v, i) => (
              <li key={i}>
                <span className="text-io-ink-3">{v.field}</span>{' '}
                <del className="bg-io-bad-tint rounded-io-tag px-0.5">{v.before}</del> →{' '}
                <ins className="bg-io-ok-tint rounded-io-tag px-0.5 no-underline">{v.after}</ins>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-io-ink-3">Nothing changed.</p>
        )}
        <p className="text-io-ink-3 mt-2 text-[12px]">Entry #{detail.ref} · append-only</p>
      </section>
    </div>
  )
}

export default function LogTable({
  days,
  initialOpen,
}: {
  days: LogDay[]
  initialOpen: string | null
}) {
  const [open, setOpen] = useState<string | null>(initialOpen)
  const [details, setDetails] = useState<
    Record<string, LogEntryDetail | null | 'loading' | 'error'>
  >({})

  async function toggle(row: LogRow) {
    if (!row.actionId) return
    if (open === row.id) {
      setOpen(null)
      return
    }
    setOpen(row.id)
    if (details[row.actionId] !== undefined) return
    setDetails((d) => ({ ...d, [row.actionId!]: 'loading' }))
    const r = await readLogEntry({ actionId: row.actionId })
    setDetails((d) => ({ ...d, [row.actionId!]: r.success ? r.data : 'error' }))
  }

  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="border-io-line text-io-ink-3 border-b text-left text-[10.5px] tracking-[0.08em] uppercase">
          <th scope="col" className="w-[72px] px-4 py-2.5 font-medium">
            Time
          </th>
          <th scope="col" className="w-[96px] px-2 py-2.5 font-medium">
            Actor
          </th>
          <th scope="col" className="px-2 py-2.5 font-medium">
            Action
          </th>
          <th scope="col" className="w-[150px] px-2 py-2.5 font-medium">
            Record
          </th>
          <th scope="col" className="w-[140px] px-2 py-2.5 font-medium">
            Level
          </th>
          <th scope="col" className="w-[150px] px-2 py-2.5 font-medium">
            Outcome
          </th>
          <th scope="col" className="w-[80px] px-4 py-2.5 text-right font-medium">
            Cost
          </th>
        </tr>
      </thead>
      <tbody>
        {days.map((d) => (
          <Fragment key={d.label}>
            {days.length > 1 ? (
              <tr>
                <th
                  colSpan={7}
                  scope="rowgroup"
                  className="bg-io-paper text-io-ink-3 px-4 py-1.5 text-left text-[12px] font-medium"
                >
                  {d.label}
                </th>
              </tr>
            ) : null}
            {d.rows.map((r) => {
              const expanded = open === r.id
              const detail = r.actionId ? details[r.actionId] : undefined
              return (
                <Fragment key={r.id}>
                  <tr
                    className={`border-io-line border-b ${expanded ? 'bg-io-accent-wash' : ''}`}
                    data-kind={r.kind}
                  >
                    <td className="text-io-ink-2 px-4 py-2.5 tabular-nums">{r.time}</td>
                    <td className="px-2 py-2.5">
                      {r.actor.assistant ? (
                        <Tag kind="assistant">Assistant</Tag>
                      ) : (
                        <span className="bg-io-info-tint text-io-info rounded-io-tag px-1.5 py-0.5 text-[11px] font-semibold">
                          {r.actor.initials}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">{r.headline}</td>
                    <td className="px-2 py-2.5">
                      {r.record ? (
                        <Link
                          href={r.record.href as Route}
                          className="text-io-accent io-focus rounded-io-tag hover:underline"
                        >
                          {r.record.label}
                        </Link>
                      ) : null}
                    </td>
                    <td className="px-2 py-2.5">
                      {r.level ? (
                        <span className="border-io-line rounded-io-tag border px-1.5 py-0.5 text-[11.5px]">
                          {r.level}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-2.5">
                      <span
                        className={`rounded-io-pill px-2 py-0.5 text-[11.5px] ${TONE[r.outcome.tone]}`}
                      >
                        {r.outcome.text}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      <span className="text-io-ink-2">{r.cost ?? '—'}</span>
                      {r.actionId ? (
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-label={`${expanded ? 'Close' : 'Open'} the entry: ${r.headline}`}
                          onClick={() => void toggle(r)}
                          className="io-focus rounded-io-tag text-io-ink-3 ml-2 px-1"
                        >
                          {expanded ? '▴' : '▾'}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="border-io-line bg-io-paper border-b">
                      <td colSpan={7}>
                        {detail === 'loading' || detail === undefined ? (
                          <p className="text-io-ink-3 px-4 py-4 text-[12.5px]">
                            Reading the entry…
                          </p>
                        ) : detail === 'error' || detail === null ? (
                          <p className="text-io-ink-3 px-4 py-4 text-[12.5px]">
                            This entry could not be read.
                          </p>
                        ) : (
                          <Detail detail={detail} />
                        )}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}
