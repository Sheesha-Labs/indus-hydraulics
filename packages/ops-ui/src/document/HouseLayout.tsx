import {
  housePageLabel,
  type DocBlock,
  type DocCell,
  type DocTableBlock,
  type DocTableRow,
  type HouseDocument,
  type Letterhead,
} from '@indus/ops-core'
import { Fragment } from 'react'
import { cn } from '../lib/cn'
import Stamp, { type DocStamp } from './Stamp'

interface HouseLayoutProps {
  data: HouseDocument
  letterhead: Letterhead
  /** The compact spacing the kit uses at scale m (boards and the viewer well). */
  dense?: boolean
  stamp?: DocStamp
  /** 1-based rows of the items table to highlight (Why?, PO check). */
  highlightRows?: readonly number[]
  page?: number
  pageCount?: number
  /** False on a continuation page of paginate(): a running header replaces the letterhead block. */
  first?: boolean
  className?: string
}

/** The eyebrow on paper: 9px, +.16em, accent. */
const K = 'text-[9px] font-medium tracking-[.16em] uppercase text-io-accent'

/**
 * The house A4 layout: everything Indus issues except the client quotation (RFQ, OA, PI, PO, PL, DN,
 * tax invoice, credit note). 794 × 1123, white, padding 44 × 48 × 30 (40 × 46 × 26 dense).
 */
export default function HouseLayout({
  data,
  letterhead,
  dense = false,
  stamp,
  highlightRows = [],
  page = 1,
  pageCount = 1,
  first = true,
  className,
}: HouseLayoutProps) {
  const sp = (normal: string, compact: string) => (dense ? compact : normal)
  return (
    <article
      aria-label={`${data.title} ${data.no}`}
      data-doc-kind={data.kind}
      data-doc-layout="house"
      className={cn(
        'rounded-io-paper bg-io-card text-io-ink relative flex h-[1123px] w-[794px] flex-none flex-col overflow-hidden text-[12px]',
        sp('px-12 pt-11 pb-[30px]', 'px-[46px] pt-10 pb-[26px]'),
        className
      )}
    >
      <div data-doc-content className="flex min-h-0 flex-1 flex-col">
        {first ? (
          <>
            <header
              data-doc-region="letterhead"
              className={cn(
                'border-io-ink flex items-end justify-between gap-6 border-b',
                sp('pb-4', 'pb-3')
              )}
            >
              {letterhead.logo.src ? (
                <>
                  {/* eslint-disable-next-line nextjs/no-img-element -- framework-free kit: the logo is a signed Storage URL or data URI drawn at a fixed size, as the PDF draws it */}
                  <img
                    src={letterhead.logo.src}
                    width={letterhead.logo.width}
                    height={letterhead.logo.height}
                    alt={letterhead.legalName}
                    className={cn(
                      '-ml-[3px] block w-auto max-w-none flex-none',
                      sp('h-[60px]', 'h-[50px]')
                    )}
                  />
                </>
              ) : (
                <span />
              )}
              <div className="text-io-ink-2 flex flex-col items-end text-right text-[10px] leading-[1.8] tracking-[.03em]">
                <b className="text-io-ink mb-1 text-[14px] leading-[1.2] font-medium tracking-[-.01em]">
                  {letterhead.legalName}
                </b>
                <span>TRN {letterhead.trn}</span>
                {letterhead.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <span>{letterhead.mailbox}</span>
              </div>
            </header>

            <div
              className={cn(
                'grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8',
                sp('mt-5', 'mt-3.5')
              )}
            >
              <div>
                <div className={K}>{data.eyebrow}</div>
                <h1
                  className={cn(
                    'io-display m-0 leading-none tracking-[-.02em]',
                    sp('mt-2.5 text-[48px]', 'mt-1.5 text-[40px]')
                  )}
                >
                  {data.title}
                </h1>
                <div className={cn('text-[13px]', sp('mt-2.5', 'mt-1.5'))}># {data.no}</div>
              </div>
              <dl
                className={cn('m-0 grid grid-cols-[auto_auto] gap-x-5', sp('gap-y-1.5', 'gap-y-1'))}
              >
                {data.meta.map((m) => (
                  <Fragment key={m.label}>
                    <dt className="text-io-ink-3 self-center text-[9px] tracking-[.14em] uppercase">
                      {m.label}
                    </dt>
                    <dd className="m-0 text-right text-[12px]">{m.value}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>

            {data.party.length > 0 ? (
              <div
                className={cn(
                  'border-io-ink grid grid-cols-2 gap-x-8 border-t',
                  sp('mt-[18px] pt-3.5', 'mt-3 pt-2.5')
                )}
              >
                {data.party.map((p) => (
                  <div key={p.label}>
                    <div className={K}>{p.label}</div>
                    <p className="text-io-ink-2 mt-1.5 mb-0 text-[12px] leading-[1.55]">
                      <b className="text-io-ink block text-[13px] font-medium">{p.name}</b>
                      {p.lines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {data.subject ? (
              <div
                className={cn(
                  'bg-io-fill-2 flex items-baseline gap-3 text-[12.5px]',
                  sp('mt-3.5 px-3.5 py-3', 'mt-2.5 px-3 py-[9px]')
                )}
              >
                {/* ink-2: ink-3 on the fill-2 band is 4.3:1, under AA at full scale. */}
                <span className={cn(K, 'text-io-ink-2')}>{data.subject.label ?? 'Subject'}</span>
                <b className="font-semibold tracking-[.01em]">{data.subject.text}</b>
              </div>
            ) : null}
          </>
        ) : (
          <div data-doc-region="running-header" className="text-io-ink-3 text-right text-[9.5px]">
            {data.title} # {data.no}
          </div>
        )}

        {data.blocks.map((block, i) => (
          <Block
            key={`${block.t}-${i}`}
            block={block}
            dense={dense}
            letterhead={letterhead}
            highlightRows={highlightRows}
          />
        ))}

        <div className="flex-1" />
        <div
          className={cn(
            'border-io-doc-rule text-io-ink-3 flex justify-between gap-4 border-t pt-2.5 text-[9.5px] tracking-[.06em]',
            sp('mt-7', 'mt-4')
          )}
        >
          <span className="whitespace-nowrap">
            <b className="text-io-ink font-medium">{letterhead.legalName}</b> — {data.eyebrow} #{' '}
            {data.no}
          </span>
          <span className="whitespace-nowrap">{data.footLabel}</span>
          <span className="whitespace-nowrap">{housePageLabel(page, pageCount)}</span>
        </div>
      </div>
      {stamp ? <Stamp stamp={stamp} blend /> : null}
    </article>
  )
}

interface BlockProps {
  block: DocBlock
  dense: boolean
  letterhead: Letterhead
  highlightRows: readonly number[]
}

function Block({ block, dense, letterhead, highlightRows }: BlockProps) {
  const sp = (normal: string, compact: string) => (dense ? compact : normal)
  switch (block.t) {
    case 'table':
      return <ItemsTable block={block} dense={dense} highlightRows={highlightRows} />
    case 'totals':
      return (
        <div className={cn('grid grid-cols-[minmax(0,1fr)_300px] gap-8', sp('mt-3.5', 'mt-2.5'))}>
          <p className="text-io-ink-2 m-0 text-[11.5px] leading-[1.55]">{block.words}</p>
          <dl className="m-0">
            {block.rows.map((r) => (
              <div
                key={r.label}
                data-doc-total={r.grand ? 'grand' : undefined}
                className={cn(
                  'border-io-doc-rule flex justify-between border-b',
                  sp('py-1.5', 'py-1'),
                  r.grand && cn('border-t-io-ink mt-1 border-t border-b-0', sp('pt-2.5', ''))
                )}
              >
                <dt className={cn('text-io-ink-2', r.grand && 'text-io-ink font-semibold')}>
                  {r.label}
                </dt>
                <dd className={cn('m-0', r.grand && 'text-[16px] font-medium')}>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )
    case 'section':
      return (
        <div className={cn('flex items-center gap-2.5', sp('mt-[18px]', 'mt-3'))}>
          <span className="rounded-io-paper bg-io-navy px-1.5 py-[3px] text-[9px] font-medium text-white">
            {block.n}
          </span>
          <h2 className="m-0 text-[13px] font-medium tracking-[-.01em]">{block.title}</h2>
        </div>
      )
    case 'terms':
      return (
        <dl className={cn('border-io-ink mb-0 border-t', sp('mt-2.5', 'mt-2'))}>
          {block.rows.map((r) => (
            <div
              key={r.label}
              className={cn(
                'border-io-doc-rule grid grid-cols-[130px_minmax(0,1fr)] gap-4 border-b',
                sp('py-1.5', 'py-1')
              )}
            >
              <dt className="text-io-ink-2 pt-0.5 text-[9px] font-medium tracking-[.14em] uppercase">
                {r.label}
              </dt>
              <dd className="m-0 text-[12px]">{r.value}</dd>
            </div>
          ))}
        </dl>
      )
    case 'bank': {
      const sign = block.side ? false : (block.sign ?? false)
      return (
        <div
          data-doc-region="bank"
          className={cn('grid grid-cols-[minmax(0,1fr)_230px] gap-7', sp('mt-4', 'mt-3'))}
        >
          <div>
            <div className="text-io-ink-2 text-[10.5px] leading-[1.75]">
              {block.showLabel !== false ? (
                <span className={cn(K, 'mb-1 block')}>Bank details</span>
              ) : null}
              {letterhead.bank.lines.length
                ? letterhead.bank.lines.map((line, i) => (
                    <Fragment key={line}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </Fragment>
                  ))
                : 'Bank details to follow'}
            </div>
            {block.disclaimer ? (
              <p
                className={cn(
                  'text-io-ink-3 mb-0 text-[10.5px] leading-[1.5]',
                  sp('mt-2.5', 'mt-1.5')
                )}
              >
                <b className="font-semibold">Disclaimer:</b> {block.disclaimer}
              </p>
            ) : null}
          </div>
          {sign ? (
            <div className="text-io-ink-2 flex flex-col justify-end text-[11.5px] leading-[1.5]">
              <p className="m-0">{sign.lead}</p>
              <div className={cn('border-io-doc-sign border-b', sp('h-[46px]', 'h-[34px]'))} />
              <p className="mt-2 mb-0">
                <b className="text-io-ink block text-[12.5px] font-medium">{sign.name}</b>
                {sign.role}
                <br />
                {letterhead.legalName}
              </p>
            </div>
          ) : null}
          {block.side ? (
            <div className="text-io-ink-2 text-[11.5px] leading-[1.55]">
              <b className="text-io-ink block font-medium">{block.side.label}</b>
              {block.side.text}
            </div>
          ) : null}
        </div>
      )
    }
    case 'sign':
      return (
        <div className="text-io-ink-2 mt-3.5 flex items-end justify-between text-[11px]">
          <span>{block.lead}</span>
          <span className="flex flex-col items-end gap-0.5">
            <span className="border-io-doc-sign h-[22px] w-[200px] border-b" />
            <b className="text-io-ink font-medium">{block.name}</b>
          </span>
        </div>
      )
    case 'slips':
      return (
        <div className="mt-3 grid grid-cols-2 gap-5">
          {block.boxes.map((box) => (
            <div
              key={box.title}
              className="border-io-doc-sign text-io-ink-2 flex flex-col gap-3.5 border px-3.5 py-3 text-[11px]"
            >
              <span className={cn(K, 'text-io-ink-3')}>{box.title}</span>
              <div className="grid grid-cols-[70px_1fr] items-end gap-x-2.5 gap-y-4">
                {box.fields.map((f) => (
                  <Fragment key={f}>
                    <span>{f}</span>
                    <span
                      className={cn(
                        'border-io-doc-sign h-4 border-b',
                        /^sign/i.test(f) && 'h-7',
                        /^stamp/i.test(f) && 'h-[54px] border border-dashed'
                      )}
                    />
                  </Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    case 'remark':
      return (
        <div className="border-io-doc-sign text-io-ink-3 mt-3.5 h-16 border px-3.5 py-2.5 text-[11px]">
          {block.text}
        </div>
      )
  }
}

interface ItemsTableProps {
  block: DocTableBlock
  dense: boolean
  highlightRows: readonly number[]
}

function ItemsTable({ block, dense, highlightRows }: ItemsTableProps) {
  const desc = block.descCol ?? 1
  return (
    <table className={cn('w-full border-collapse', dense ? 'mt-3' : 'mt-4')}>
      <thead>
        <tr>
          {block.cols.map((h, i) => (
            <th
              key={h}
              scope="col"
              className={cn(
                'bg-io-navy text-right text-[9px] font-medium tracking-[.14em] text-white uppercase',
                (i === 0 || i === desc) && 'text-left',
                dense ? 'px-[9px] py-[7px]' : 'px-2.5 py-[9px]'
              )}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {block.rows.map((row, ri) => (
          <HouseRow
            key={ri}
            row={row}
            n={ri + 1}
            desc={desc}
            dense={dense}
            highlighted={row.flag === 'highlight' || highlightRows.includes(ri + 1)}
          />
        ))}
      </tbody>
    </table>
  )
}

interface HouseRowProps {
  row: DocTableRow
  n: number
  desc: number
  dense: boolean
  highlighted: boolean
}

function HouseRow({ row, n, desc, dense, highlighted }: HouseRowProps) {
  const quiet = row.flag === 'to-follow' || row.flag === 'gap'
  return (
    <tr
      data-row={n}
      data-flag={row.flag}
      data-highlighted={highlighted ? 'true' : undefined}
      className={cn(highlighted && 'bg-io-mark outline-io-mark-line outline-1 outline-solid')}
    >
      {row.cells.map((cell, ci) => (
        <HouseCell
          key={ci}
          cell={cell}
          first={ci === 0}
          isDesc={ci === desc}
          quiet={quiet}
          dense={dense}
        />
      ))}
    </tr>
  )
}

interface HouseCellProps {
  cell: DocCell
  first: boolean
  isDesc: boolean
  quiet: boolean
  dense: boolean
}

function HouseCell({ cell, first, isDesc, quiet, dense }: HouseCellProps) {
  return (
    <td
      colSpan={cell.span && cell.span > 1 ? cell.span : undefined}
      className={cn(
        'border-io-doc-rule border-b text-right align-top text-[11.5px] whitespace-nowrap',
        dense ? 'px-[9px] py-1.5' : 'px-2.5 py-2',
        first && 'text-io-ink-3 w-7 text-left',
        isDesc &&
          cn(
            'text-left text-[12px] whitespace-normal',
            dense ? 'leading-[1.35]' : 'leading-[1.45]'
          ),
        quiet && 'text-io-ink-3',
        cell.muted && 'text-io-ink-4'
      )}
    >
      {cell.bold ? <b className="block font-medium">{cell.bold}</b> : null}
      {cell.v}
      {cell.sub ? (
        <i className="text-io-ink-3 mt-0.5 block text-[10px] not-italic">{cell.sub}</i>
      ) : null}
    </td>
  )
}
