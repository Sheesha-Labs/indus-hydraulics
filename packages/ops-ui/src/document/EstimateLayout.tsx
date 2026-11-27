import {
  documentNumber,
  estimatePageLabel,
  revisionLabel,
  type DocCell,
  type DocTableRow,
  type EstimateDocument,
  type Letterhead,
} from '@indus/ops-core'
import { Fragment } from 'react'
import { cn } from '../lib/cn'
import Stamp, { type DocStamp } from './Stamp'

interface EstimateLayoutProps {
  data: EstimateDocument
  letterhead: Letterhead
  stamp?: DocStamp
  /** 1-based item rows to highlight (Why?, PO check). */
  highlightRows?: readonly number[]
  page?: number
  pageCount?: number
  /** False on a continuation page of paginate(): a running header replaces the letterhead block. */
  first?: boolean
  className?: string
}

/**
 * The client quotation in the Zoho Estimate look clients already receive (P13, ADR-14): logo and company
 * block with the TRN, title and "# number" (a revision renders "-R2"), bill-to and meta, items, totals
 * box, notes, signer and stamp strip, footer. 794 × 1123, padding 44 × 48 × 0.
 */
export default function EstimateLayout({
  data,
  letterhead,
  stamp,
  highlightRows = [],
  page = 1,
  pageCount = 1,
  first = true,
  className,
}: EstimateLayoutProps) {
  const no = documentNumber(data.no, data.revision)
  const rev = revisionLabel(data.revision)
  const desc = data.items.descCol ?? 1
  const address = letterhead.addressLines
  return (
    <article
      aria-label={`${data.title} ${no}`}
      data-doc-kind={data.kind}
      data-doc-layout="estimate"
      className={cn(
        'bg-io-card text-io-est-ink relative flex h-[1123px] w-[794px] flex-none flex-col overflow-hidden px-12 pt-11 text-[11.5px] leading-[1.45]',
        className
      )}
    >
      <div data-doc-content className="flex min-h-0 flex-1 flex-col">
        {first ? (
          <>
            <div data-doc-region="letterhead" className="flex items-start justify-between">
              <div>
                {letterhead.logo.src ? (
                  <>
                    {/* eslint-disable-next-line nextjs/no-img-element -- framework-free kit: the logo is a signed Storage URL or data URI drawn at a fixed size, as the PDF draws it */}
                    <img
                      src={letterhead.logo.src}
                      width={letterhead.logo.width}
                      height={letterhead.logo.height}
                      alt={letterhead.legalName}
                      className="block h-[58px] w-auto"
                    />
                  </>
                ) : null}
                <div className="text-io-est-co mt-1.5 text-[10.5px] leading-[1.6]">
                  <b className="text-io-est-strong block text-[13px]">{letterhead.legalName}</b>
                  {address.map((line, i) => (
                    <span key={line} className="block whitespace-nowrap">
                      {line}
                      {i === address.length - 1 ? ` · TRN ${letterhead.trn}` : ''}
                    </span>
                  ))}
                  <span className="block whitespace-nowrap">
                    {letterhead.mailbox} · {letterhead.phone}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="m-0 text-right text-[30px] font-medium tracking-[.02em]">
                  {data.title}
                </h1>
                <div className="mt-0.5 text-right text-[12px]"># {no}</div>
              </div>
            </div>

            {rev ? (
              <div className="bg-io-est-rev mt-2.5 px-2.5 py-1.5 text-[11px]">{rev}</div>
            ) : null}

            <div className="mt-[22px] grid grid-cols-2 gap-6">
              <div>
                <span className="text-io-est-meta block">{data.billTo.label}</span>
                <b className="block">{data.billTo.name}</b>
                {data.billTo.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </div>
              <dl className="m-0 grid grid-cols-[auto_auto] gap-x-4 gap-y-[3px] justify-self-end">
                {data.meta.map((m) => (
                  <Fragment key={m.label}>
                    <dt className="text-io-est-meta">{m.label}</dt>
                    <dd className="m-0 text-right">{m.value}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          </>
        ) : (
          <div
            data-doc-region="running-header"
            className="text-io-est-meta text-right text-[9.5px]"
          >
            {data.title} # {no}
          </div>
        )}

        {data.items.rows.length ? (
          <table className={cn('w-full border-collapse', first ? 'mt-[18px]' : 'mt-5')}>
            <thead>
              <tr>
                {data.items.cols.map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={cn(
                      'bg-io-navy px-2 py-[7px] text-right text-[10.5px] font-medium text-white',
                      (i === 0 || i === desc) && 'text-left'
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.rows.map((row, ri) => (
                <EstimateRow
                  key={ri}
                  row={row}
                  n={ri + 1}
                  desc={desc}
                  highlighted={row.flag === 'highlight' || highlightRows.includes(ri + 1)}
                />
              ))}
            </tbody>
          </table>
        ) : null}

        {data.totals.length ? (
          <div className="mt-3 ml-auto flex w-[290px] flex-col">
            {data.totals.map((t) => (
              <div
                key={t.label}
                data-doc-total={t.grand ? 'grand' : undefined}
                className={cn(
                  'flex justify-between px-2 py-1',
                  t.grand && 'bg-io-est-total p-2 text-[12.5px] font-semibold'
                )}
              >
                <span>{t.label}</span>
                <span>{t.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        {data.notes.length ? (
          <div className="text-io-est-ink-2 mt-4 text-[10.5px] leading-[1.55]">
            {data.notes.map((n) => (
              <Fragment key={n.label}>
                <b className="text-io-est-strong mt-2 mb-0.5 block text-[11px]">{n.label}</b>
                {n.text}
              </Fragment>
            ))}
          </div>
        ) : null}

        {data.signer ? (
          <div className="mt-3.5 flex justify-between text-[10.5px]">
            <div className="border-io-est-line text-io-est-sign w-[200px] border-t pt-1">
              <span className="block">For {letterhead.legalName}</span>
              <span className="block">{data.signer}</span>
            </div>
            <div className="border-io-est-line text-io-est-sign w-[200px] border-t pt-1">
              Company stamp
            </div>
          </div>
        ) : null}

        <div className="border-io-est-foot text-io-est-meta mt-auto flex justify-between border-t pt-2.5 pb-[18px] text-[10px]">
          <span>
            {letterhead.legalName} · {no}
          </span>
          <span>{estimatePageLabel(page, pageCount)}</span>
        </div>
      </div>
      {stamp ? <Stamp stamp={stamp} /> : null}
    </article>
  )
}

interface EstimateRowProps {
  row: DocTableRow
  n: number
  desc: number
  highlighted: boolean
}

function EstimateRow({ row, n, desc, highlighted }: EstimateRowProps) {
  return (
    <tr data-row={n} data-flag={row.flag} data-highlighted={highlighted ? 'true' : undefined}>
      {row.cells.map((cell, ci) => (
        <EstimateCell
          key={ci}
          cell={cell}
          left={ci === 0 || ci === desc}
          note={(cell.span ?? 1) > 1 ? row.flag : undefined}
          highlighted={highlighted}
        />
      ))}
    </tr>
  )
}

interface EstimateCellProps {
  cell: DocCell
  left: boolean
  /** The row flag on a spanning cell: "Price to follow" (amber, italic) or a gap row ("Lines 5–11"). */
  note: DocTableRow['flag']
  highlighted: boolean
}

function EstimateCell({ cell, left, note, highlighted }: EstimateCellProps) {
  return (
    <td
      colSpan={cell.span && cell.span > 1 ? cell.span : undefined}
      className={cn(
        'border-io-est-rule border-b px-2 py-[7px] text-right align-top',
        left && 'text-left',
        note === 'to-follow' && 'text-io-est-tf text-left italic',
        note === 'gap' && 'text-io-est-sub text-left',
        cell.muted && 'text-io-est-sub',
        highlighted && 'bg-io-mark'
      )}
    >
      {cell.bold ? <b className="block font-semibold">{cell.bold}</b> : null}
      {cell.v}
      {cell.sub ? (
        <i className="text-io-est-sub block text-[10.5px] not-italic">{cell.sub}</i>
      ) : null}
    </td>
  )
}
