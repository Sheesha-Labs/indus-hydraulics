'use client'

import { Button, ButtonLink, Checkbox, Select } from '@indus/ops-ui/controls'
import { Note } from '@indus/ops-ui/card'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  continueFromMapAction,
  updateSheetMapAction,
} from '../../../app/(console)/enquiries/intake/[batchId]/actions/map'
import type { MapModel, MapRow } from '../../../data/intake-map'

/**
 * Board 35 · Map spreadsheet columns (S08-T05). Left: the sheet as received, the mapped fields over their columns,
 * the header row tinted, title and total rows hatched as skipped, a line with no part number in warn. Right: what
 * was detected, the column mapping, the units normalised, "Remember this mapping" and the flags. Every change
 * rewrites the lines from the cells.
 */
const TINT: Record<MapRow['tint'], string> = {
  header: 'bg-io-accent-tint font-medium',
  skipped: 'io-hatch text-io-ink-3',
  missing_part: 'bg-io-warn-tint',
  line: '',
  none: '',
}

export default function MapWorkspace({ model }: { model: MapModel }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const m = model

  async function change(c: Parameters<typeof updateSheetMapAction>[0]['change']) {
    setBusy(true)
    const r = await updateSheetMapAction({ batchId: m.batchId, fileId: m.file.id, change: c })
    setBusy(false)
    if (!r.success) toast({ kind: 'error', title: r.error })
    router.refresh()
  }
  async function next() {
    setBusy(true)
    const r = await continueFromMapAction({ batchId: m.batchId, fileId: m.file.id })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    router.push(`/enquiries/intake/${m.batchId}` as Route)
  }

  const flags = m.missingPart
  const flagText = flags.length
    ? flags.length === 1
      ? `Line ${flags[0]} has no part number. It goes to review with the description only.`
      : `Lines ${flags.slice(0, -1).join(', ')} and ${flags.at(-1)} have no part number. They go to review with the description only.`
    : null

  return (
    <div data-built="intake-map" className="grid min-h-0 flex-1 grid-cols-[640px_minmax(0,1fr)]">
      <section aria-label="Spreadsheet" className="bg-io-well flex min-h-0 min-w-0 flex-col">
        <p className="text-io-ink-2 m-0 flex flex-none items-center justify-between px-5 py-3 text-[12px]">
          <span>
            Sheet {m.sheetIndex} of {m.sheets.length} · {m.rowCount} rows · {m.colCount} columns
          </span>
          <span>Header row {m.headerRow}</span>
        </p>
        <div
          tabIndex={0}
          aria-label="Sheet preview"
          className="io-focus min-h-0 flex-1 overflow-auto px-5 pb-5"
        >
          <SheetPreview
            model={m}
            busy={busy}
            onSheet={(sheet) => void change({ kind: 'sheet', sheet })}
          />
          <ul
            aria-label="Legend"
            className="text-io-ink-2 m-0 mt-4 flex list-none gap-5 p-0 text-[12px]"
          >
            <li className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="rounded-io-tag border-io-accent bg-io-accent-tint size-3 border"
              />
              Header row
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="rounded-io-tag io-hatch size-3" />
              Skipped: title rows, total row
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden="true" className="rounded-io-tag bg-io-warn-tint size-3" />
              Missing part no.
            </li>
          </ul>
        </div>
      </section>

      <section aria-label="Mapping" className="bg-io-paper flex min-h-0 min-w-0 flex-col">
        <div
          tabIndex={0}
          aria-label="Detected and mapped"
          className="io-focus min-h-0 flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="flex flex-col gap-4">
            <section
              aria-label="Detected"
              className="rounded-io-card border-io-line bg-io-card border px-5 py-4"
            >
              <h2 className="text-io-ink-3 m-0 mb-2 text-[10.5px] font-medium tracking-[0.12em] uppercase">
                Detected
              </h2>
              <dl className="m-0 grid grid-cols-[134px_170px_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 text-[13px]">
                <dt className="text-io-ink-2">Sheet</dt>
                <dd className="m-0">
                  <Select
                    aria-label="Sheet"
                    className="w-full [&>select]:w-full [&>select]:min-w-0 [&>select]:truncate"
                    value={m.sheet}
                    disabled={busy}
                    options={m.sheets.map((s) => ({ value: s.name, label: s.name }))}
                    onChange={(e) => void change({ kind: 'sheet', sheet: e.target.value })}
                  />
                </dd>
                <dd className="text-io-ink-3 m-0 text-[12px] leading-[1.4]">
                  {m.others.map((o) => `${o.sheet} also has a table · ${o.rows} rows`).join('; ')}
                </dd>
                <dt className="text-io-ink-2">Header row</dt>
                <dd className="m-0">
                  <Select
                    aria-label="Header row"
                    className="w-full [&>select]:w-full [&>select]:min-w-0 [&>select]:truncate"
                    value={String(m.headerRow)}
                    disabled={busy}
                    options={m.headerOptions}
                    onChange={(e) => void change({ kind: 'header', row: Number(e.target.value) })}
                  />
                </dd>
                <dd className="text-io-ink-3 m-0 text-[12px]">{m.titleNote}</dd>
                <dt className="text-io-ink-2">Data rows</dt>
                <dd className="col-span-2 m-0">
                  <DataNote text={m.dataNote} />
                </dd>
                <dt className="text-io-ink-2">Client</dt>
                <dd className="col-span-2 m-0">
                  {m.client ? (
                    <>
                      <span className="font-medium">{m.client.name}</span>
                      <span className="text-io-ink-2"> · {m.client.how}</span>
                    </>
                  ) : (
                    <span className="text-io-ink-2">Not known yet · matched after review</span>
                  )}
                </dd>
              </dl>
            </section>

            <section
              aria-label="Columns"
              className="rounded-io-card border-io-line bg-io-card overflow-hidden border"
            >
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-io-line text-io-ink-3 border-b text-left text-[10.5px] tracking-[0.12em] uppercase">
                    <th scope="col" className="w-[54px] py-3 pl-5 font-medium">
                      Col
                    </th>
                    <th scope="col" className="w-[120px] py-3 font-medium">
                      In the file
                    </th>
                    <th scope="col" className="w-[170px] py-3 font-medium">
                      Maps to
                    </th>
                    <th scope="col" className="py-3 pl-3 font-medium">
                      Sample
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {m.mapping.map((c) => (
                    <tr key={c.c} className="border-io-line border-b last:border-b-0">
                      <td className="text-io-ink-3 py-2.5 pl-5">{c.c}</td>
                      <td className="py-2.5">{c.header}</td>
                      <td className="py-2.5">
                        <Select
                          aria-label={`Column ${c.c}, ${c.header}, maps to`}
                          className="w-[150px]"
                          value={c.target}
                          disabled={busy}
                          options={m.targetOptions}
                          onChange={(e) =>
                            void change({ kind: 'column', c: c.c, target: e.target.value })
                          }
                        />
                      </td>
                      <td className="max-w-0 py-2.5 pr-5 pl-3">
                        <span className="block truncate">{sampleOf(c, m)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section
              aria-label="Units normalised"
              className="rounded-io-card border-io-line bg-io-card border px-5 py-4"
            >
              <h2 className="text-io-ink-3 m-0 mb-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
                Units normalised
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {m.units.map((u) =>
                  u.code ? (
                    <li
                      key={u.raw}
                      className="rounded-io-pill bg-io-fill text-io-ink-2 px-2.5 py-1 text-[12px]"
                    >
                      {u.raw === u.code ? u.code : `${u.raw} → ${u.code}`} · {u.count}
                    </li>
                  ) : (
                    <li
                      key={u.raw}
                      className="rounded-io-pill bg-io-warn-tint text-io-warn px-2.5 py-1 text-[12px]"
                    >
                      {u.raw} · kept, check
                    </li>
                  )
                )}
                {m.units.length ? null : (
                  <li className="text-io-ink-3 text-[12.5px]">No unit column: EA is assumed.</li>
                )}
              </ul>
            </section>

            <Checkbox
              checked={m.remember && !!m.client}
              disabled={busy || !m.client}
              onChange={(e) => void change({ kind: 'remember', on: e.currentTarget.checked })}
              label={
                m.client
                  ? `Remember this mapping for ${m.client.name}`
                  : 'Remember this mapping for the client (once the client is known)'
              }
              {...(m.remembered ? { sub: 'Applied from the last sheet this client sent.' } : {})}
            />
            {flagText ? <Note tone="warn">{flagText}</Note> : null}
          </div>
        </div>
        <footer className="border-io-line bg-io-card flex flex-none items-center justify-between gap-3 border-t px-5 py-3.5">
          <span className="text-[13px]">
            {m.lines} line{m.lines === 1 ? '' : 's'} ready · {m.toCheck} to check
          </span>
          <span className="flex gap-2">
            <ButtonLink variant="secondary" href={`/enquiries/new?batch=${m.batchId}` as Route}>
              Back
            </ButtonLink>
            <Button variant="primary" disabled={busy || !m.lines} onClick={() => void next()}>
              Continue to review
            </Button>
          </span>
        </footer>
      </section>
    </div>
  )
}

/** "5–16 · 12 lines · row 18 is a total and is skipped": the range and count in ink, the rest ink-2. */
function DataNote({ text }: { text: string }) {
  const [range, count, ...rest] = text.split(' · ')
  return (
    <>
      <span className="font-medium">
        {range} · {count}
      </span>
      {rest.length ? <span className="text-io-ink-2"> · {rest.join(' · ')}</span> : null}
    </>
  )
}

function sampleOf(c: MapModel['mapping'][number], m: MapModel): string {
  if (c.target !== 'uom') return c.sample
  const u = m.units.find((x) => x.raw === c.sample.toUpperCase())
  return u?.code && u.code !== u.raw ? `${c.sample} → ${u.code}` : c.sample
}

function SheetPreview({
  model: m,
  busy,
  onSheet,
}: {
  model: MapModel
  busy: boolean
  onSheet: (name: string) => void
}) {
  const strip = new Map(m.strip.map((s) => [s.c, s.label]))
  return (
    <div className="rounded-io-card border-io-line bg-io-card overflow-hidden border">
      <div className="border-io-line flex items-center justify-between gap-3 border-b px-3 py-2.5">
        <span className="flex items-center gap-2 text-[13px] font-medium">
          <span
            aria-hidden="true"
            className="rounded-io-tag bg-io-ok-solid grid size-[18px] place-items-center text-[10px] font-semibold text-white"
          >
            X
          </span>
          {m.file.name}
        </span>
        {m.formulaCells ? (
          <span className="text-io-ink-3 text-[12px]">
            fx · {m.formulaCells} formula cell{m.formulaCells === 1 ? '' : 's'}, values as saved
          </span>
        ) : null}
      </div>
      <table className="w-full table-fixed border-collapse text-[12px] leading-[17px]">
        <colgroup>
          <col className="w-[22px]" />
          {m.columns.map((c) => (
            <col key={c} className={m.widths[c] ?? ''} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="bg-io-fill border-io-sheet-line w-[22px] border-r" />
            {m.columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="bg-io-fill border-io-sheet-line border-r px-1 py-1 font-normal"
              >
                {strip.get(c) ? (
                  <span className="rounded-io-tag bg-io-accent block px-1.5 py-1 text-[10.5px] font-medium text-white">
                    {strip.get(c)}
                  </span>
                ) : null}
              </th>
            ))}
          </tr>
          <tr>
            <th
              scope="col"
              className="bg-io-fill text-io-ink-2 border-io-sheet-line border px-1 py-1 font-normal"
            >
              <span className="sr-only">Row</span>
            </th>
            {m.columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="bg-io-fill text-io-ink-2 border-io-sheet-line border px-1.5 py-1 font-normal"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {m.rows.map((r) => (
            <tr key={r.r} data-tint={r.tint} className={TINT[r.tint]}>
              <th
                scope="row"
                className="bg-io-fill text-io-ink-2 border-io-sheet-line border px-1 py-[3px] text-right font-normal"
              >
                {r.r}
              </th>
              {m.columns.map((c) => {
                const cell = r.cells.find((x) => x.c === c)
                const numeric = !!cell && /^[\d.,\s]+$/.test(cell.v.trim())
                return (
                  <td
                    key={c}
                    className={`border-io-sheet-line border px-1.5 py-[3px] ${numeric ? 'text-right' : ''} ${r.tint === 'header' ? 'border-io-accent' : ''}`}
                  >
                    <span className="block truncate">{cell?.v ?? ''}</span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div role="tablist" aria-label="Sheets" className="border-io-line flex border-t">
        {m.sheets.map((s) => (
          <button
            key={s.name}
            type="button"
            role="tab"
            aria-selected={s.name === m.sheet}
            disabled={busy}
            onClick={() => (s.name === m.sheet ? undefined : onSheet(s.name))}
            className={
              s.name === m.sheet
                ? 'border-io-accent text-io-accent io-focus border-b-2 px-4 py-2.5 text-[12.5px] font-medium'
                : 'border-io-line text-io-ink-2 io-focus border-r px-4 py-2.5 text-[12.5px]'
            }
          >
            {s.name}
            {s.hidden ? ' (hidden)' : ''}
          </button>
        ))}
      </div>
    </div>
  )
}
