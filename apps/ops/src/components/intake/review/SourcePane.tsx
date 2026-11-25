'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { ReviewFile, ReviewLine, SourcePaneData } from '../../../data/intake-review'
import PageSvg, { type BoxTone, type PageBox } from '../PageSvg'

/**
 * Board 15's left pane (S08-T04): the original next to the extracted lines. A PDF is drawn from its text layer
 * with numbered boxes in the line's tone; a sheet highlights each line's cell; an email or Word text marks the
 * quote and greys earlier replies; an image is shown as received. Hovering a box highlights its row and clicking
 * it scrolls the row into view; hovering a row highlights its box.
 */
const MARK: Record<ReviewLine['tone'], string> = {
  ok: 'bg-io-ok-tint',
  warn: 'bg-io-warn-tint',
  bad: 'bg-io-bad-tint',
  info: 'bg-io-info-tint',
}
const CELL: Record<ReviewLine['tone'], string> = {
  ok: 'bg-io-ok-tint border-io-ok',
  warn: 'bg-io-warn-tint border-io-warn',
  bad: 'bg-io-bad-tint border-io-bad',
  info: 'bg-io-info-tint border-io-info',
}

export default function SourcePane({
  batchId,
  files,
  activeId,
  source,
  lines,
  hover,
  onHover,
  onPick,
}: {
  batchId: string
  files: readonly ReviewFile[]
  activeId: string | null
  source: SourcePaneData
  lines: readonly ReviewLine[]
  hover: number | null
  onHover: (ord: number | null) => void
  onPick: (ord: number) => void
}) {
  const mine = lines.filter(
    (l) => !activeId || l.fileId === activeId || (!l.fileId && files.length <= 1)
  )
  return (
    <div data-part="source-pane" className="bg-io-well flex min-h-0 min-w-0 flex-col">
      {files.length > 1 ? (
        <nav
          aria-label="Files in this intake"
          className="border-io-line flex flex-none gap-1 overflow-x-auto border-b px-4 py-2"
        >
          {files.map((f) => (
            <Link
              key={f.id}
              href={`/enquiries/intake/${batchId}?file=${f.id}` as Route}
              aria-current={f.id === activeId ? 'page' : undefined}
              className={
                f.id === activeId
                  ? 'rounded-io-tag bg-io-navy text-io-card io-focus px-2 py-1 text-[12px] whitespace-nowrap'
                  : 'rounded-io-tag border-io-line bg-io-card io-focus border px-2 py-1 text-[12px] whitespace-nowrap'
              }
            >
              {f.name}
            </Link>
          ))}
        </nav>
      ) : null}
      {source.kind === 'pdf' ? (
        <PdfPages source={source} lines={mine} hover={hover} onHover={onHover} onPick={onPick} />
      ) : source.kind === 'sheet' ? (
        <SheetView source={source} lines={mine} hover={hover} onHover={onHover} onPick={onPick} />
      ) : source.kind === 'text' ? (
        <TextView source={source} lines={mine} hover={hover} onHover={onHover} onPick={onPick} />
      ) : source.kind === 'image' ? (
        <div
          tabIndex={0}
          aria-label="Original"
          className="io-focus min-h-0 flex-1 overflow-y-auto p-5"
        >
          <p className="text-io-ink-2 m-0 mb-2 text-[10.5px] tracking-[0.12em] uppercase">
            Original as received
          </p>
          {/* A photo or scan, shown as it came: there are no coordinates to mark on it. */}
          <img
            src={source.url}
            alt={`${source.name}, as received`}
            className="rounded-io-paper block h-auto w-full"
          />
        </div>
      ) : (
        <p className="text-io-ink-2 m-0 p-5 text-[13px]">{source.note}</p>
      )}
    </div>
  )
}

type PaneProps<S> = {
  source: S
  lines: readonly ReviewLine[]
  hover: number | null
  onHover: (ord: number | null) => void
  onPick: (ord: number) => void
}

function PdfPages({
  source,
  lines,
  hover,
  onHover,
  onPick,
}: PaneProps<Extract<SourcePaneData, { kind: 'pdf' }>>) {
  const [fit, setFit] = useState(true)
  // The pane opens at the first page with something to check, and the page buttons follow the scroll.
  const first =
    lines.find((l) => l.tone !== 'ok' && l.page)?.page ??
    lines.find((l) => l.page)?.page ??
    source.pages[0]?.page ??
    1
  const [current, setCurrent] = useState(first)
  const scroller = useRef<HTMLDivElement>(null)
  const pageTop = (n: number) => {
    const box = scroller.current
    const el = box?.querySelector<HTMLElement>(`[data-page="${n}"]`)
    return box && el ? el.offsetTop : null
  }
  function go(n: number) {
    const top = pageTop(n)
    if (top === null || !scroller.current) return
    scroller.current.scrollTop = top
    setCurrent(n)
  }
  useEffect(() => {
    const top = pageTop(first)
    if (top !== null && scroller.current) scroller.current.scrollTop = top
    // Only on arrival: later refreshes keep where the person scrolled.
  }, [])
  function onScroll() {
    const box = scroller.current
    if (!box) return
    let at = source.pages[0]?.page ?? 1
    for (const p of source.pages) {
      const top = pageTop(p.page)
      if (top !== null && top <= box.scrollTop + 40) at = p.page
    }
    if (at !== current) setCurrent(at)
  }
  return (
    <>
      <div className="flex flex-none items-center justify-between gap-3 px-5 py-3">
        <span className="truncate text-[12.5px]">{source.name}</span>
        <span className="flex gap-1">
          {source.pages.map((p) => (
            <button
              key={p.page}
              type="button"
              onClick={() => go(p.page)}
              aria-label={`Page ${p.page}`}
              aria-current={p.page === current ? 'page' : undefined}
              className={
                p.page === current
                  ? 'rounded-io-tag border-io-navy bg-io-navy text-io-card io-focus inline-flex h-6 min-w-6 items-center justify-center border px-1.5 text-[12px]'
                  : 'rounded-io-tag border-io-stroke bg-io-card io-focus inline-flex h-6 min-w-6 items-center justify-center border px-1.5 text-[12px]'
              }
            >
              {p.page}
            </button>
          ))}
        </span>
        <button
          type="button"
          onClick={() => setFit((f) => !f)}
          className="text-io-ink-2 io-focus rounded-io-tag text-[12px] whitespace-nowrap"
        >
          A4 · {fit ? 'fit width' : '100 %'}
        </button>
      </div>
      <div
        ref={scroller}
        tabIndex={0}
        aria-label={`Pages of ${source.name}`}
        onScroll={onScroll}
        className="io-focus relative min-h-0 flex-1 overflow-y-auto px-5 pb-6"
      >
        {source.pages.map((p) => {
          const boxes: PageBox[] = lines
            .filter((l) => l.page === p.page && l.box)
            .filter((l) => l.tone !== 'ok' || l.ord === hover)
            .map((l) => ({
              key: l.id,
              ord: l.ord,
              box: l.box!,
              tone: l.tone as BoxTone,
              active: l.ord === hover,
              pin: l.tone !== 'ok',
            }))
          return (
            <section
              key={p.page}
              id={`page-${p.page}`}
              data-page={p.page}
              aria-label={`Page ${p.page}`}
              className="mb-5"
            >
              <p className="text-io-ink-2 m-0 mb-2 text-[10.5px] tracking-[0.12em] uppercase">
                Page {p.page}
                {source.scanned ? ' · scanned' : ''}
              </p>
              <div className={fit ? 'w-full' : 'w-[595px] max-w-none'}>
                <PageSvg
                  page={p}
                  boxes={boxes}
                  label={`Page ${p.page} of ${source.name}`}
                  onHover={onHover}
                  onBox={onPick}
                />
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

function SheetView({
  source,
  lines,
  hover,
  onHover,
  onPick,
}: PaneProps<Extract<SourcePaneData, { kind: 'sheet' }>>) {
  const [tab, setTab] = useState(
    source.sheets.find((s) => !s.hidden)?.name ?? source.sheets[0]?.name ?? ''
  )
  const sheet = source.sheets.find((s) => s.name === tab) ?? source.sheets[0]
  if (!sheet) return null
  const cols = [...new Set(sheet.rows.flatMap((r) => r.cells.map((c) => c.c)))].sort(
    (a, b) => a.length - b.length || a.localeCompare(b)
  )
  const byRow = new Map(
    lines
      .filter((l) => (l.sheet ?? sheet.name) === sheet.name && l.cellRef)
      .map((l) => [Number(l.cellRef!.replace(/^[A-Z]+/, '')), l])
  )
  return (
    <>
      <div role="tablist" aria-label="Sheets" className="flex flex-none gap-1 px-5 py-3">
        {source.sheets.map((s) => (
          <button
            key={s.name}
            type="button"
            role="tab"
            aria-selected={s.name === tab}
            onClick={() => setTab(s.name)}
            className={
              s.name === tab
                ? 'rounded-io-tag bg-io-navy text-io-card io-focus px-2 py-1 text-[12px]'
                : 'rounded-io-tag border-io-line bg-io-card io-focus border px-2 py-1 text-[12px]'
            }
          >
            {s.name}
            {s.hidden ? ' (hidden)' : ''}
          </button>
        ))}
      </div>
      <div
        tabIndex={0}
        aria-label={`Sheet ${sheet.name}`}
        className="io-focus min-h-0 flex-1 overflow-auto px-5 pb-6"
      >
        <table className="bg-io-card border-io-sheet-line w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th
                scope="col"
                className="bg-io-fill text-io-ink-2 border-io-sheet-line border px-1.5 py-1 font-normal"
              />
              {cols.map((c) => (
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
            {sheet.rows.map((r) => {
              const line = byRow.get(r.r)
              return (
                <tr
                  key={r.r}
                  data-ord={line?.ord}
                  onMouseEnter={line ? () => onHover(line.ord) : undefined}
                  onMouseLeave={line ? () => onHover(null) : undefined}
                  onClick={line ? () => onPick(line.ord) : undefined}
                  className={line ? 'cursor-pointer' : undefined}
                >
                  <th
                    scope="row"
                    className="bg-io-fill text-io-ink-2 border-io-sheet-line border px-1.5 py-1 font-normal"
                  >
                    {r.r}
                  </th>
                  {cols.map((c) => {
                    const v = r.cells.find((x) => x.c === c)
                    const on = line && (line.ord === hover || line.tone !== 'ok')
                    return (
                      <td
                        key={c}
                        className={
                          on
                            ? `border px-1.5 py-1 ${CELL[line.tone]}`
                            : 'border-io-sheet-line border px-1.5 py-1'
                        }
                      >
                        {v?.formula ? (
                          <span className="text-io-ink-3 mr-1 text-[10.5px]">fx</span>
                        ) : null}
                        {v?.v ?? ''}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

function TextView({
  source,
  lines,
  hover,
  onHover,
  onPick,
}: PaneProps<Extract<SourcePaneData, { kind: 'text' }>>) {
  // Cut the text at every mark boundary; each piece is plain, a line's quote, or an ignored reply.
  const cuts = new Set<number>([0, source.text.length])
  const marks = lines.filter((l) => l.charRange)
  for (const l of marks) for (const n of l.charRange!) cuts.add(n)
  for (const g of source.ignored) {
    cuts.add(g.start)
    cuts.add(g.end)
  }
  const points = [...cuts].sort((a, b) => a - b)
  return (
    <div tabIndex={0} aria-label="Original" className="io-focus min-h-0 flex-1 overflow-y-auto p-5">
      <p className="text-io-ink-2 m-0 mb-2 text-[10.5px] tracking-[0.12em] uppercase">
        {source.name}
      </p>
      <div className="bg-io-card rounded-io-paper border-io-line border p-5 text-[13px] leading-[1.6] whitespace-pre-wrap">
        {points.slice(0, -1).map((at, i) => {
          const to = points[i + 1]!
          const piece = source.text.slice(at, to)
          const line = marks.find((l) => l.charRange![0] <= at && l.charRange![1] >= to)
          const ignored = source.ignored.find((g) => g.start <= at && g.end >= to)
          if (line)
            return (
              <mark
                key={at}
                data-ord={line.ord}
                onMouseEnter={() => onHover(line.ord)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onPick(line.ord)}
                className={`${MARK[line.tone]} rounded-io-tag cursor-pointer ${line.ord === hover ? 'outline-io-accent outline-2' : ''}`}
              >
                {piece}
              </mark>
            )
          if (ignored)
            return (
              <span key={at} className="text-io-ink-4" title={ignored.label}>
                {piece}
              </span>
            )
          return <span key={at}>{piece}</span>
        })}
      </div>
      {source.ignored.length ? (
        <p className="text-io-ink-2 mt-2 text-[12px]">
          Greyed: {source.ignored[0]!.label.toLowerCase()} — never read for lines.
        </p>
      ) : null}
    </div>
  )
}
