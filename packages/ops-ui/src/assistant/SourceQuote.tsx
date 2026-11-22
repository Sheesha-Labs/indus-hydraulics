import type { Route } from 'next'
import Link from 'next/link'
import { cn } from '../lib/cn'
import type { FileType } from '../types'
import Highlight from './Highlight'
import type { SourceQuoteProps } from './types'

/** File-type label colours (kit `ka-ft`): PDF bad-solid, sheets ok, mail and documents accent. */
const FILE_TYPE: Record<FileType, string> = {
  PDF: 'text-io-bad-solid',
  XLS: 'text-io-ok',
  CSV: 'text-io-ok',
  DOC: 'text-io-accent',
  MAIL: 'text-io-accent',
  IMG: 'text-io-ink-3',
}

/**
 * Assistant kit `Source` (the Why? source): a card with the file type (9.5/700), document name (500,
 * truncated) and meta; the verbatim quote at 13/1.6 with the matched span highlighted (active); and a foot
 * with the location and "Open source ↗". Shared.
 */
export default function SourceQuote({
  fileType,
  doc,
  meta,
  text,
  match,
  location,
  openHref,
  className,
}: SourceQuoteProps) {
  return (
    <figure
      data-part="source"
      className={cn(
        'border-io-line rounded-io-card bg-io-card m-0 flex w-full flex-col overflow-hidden border',
        className
      )}
    >
      <figcaption className="border-io-line flex items-center gap-2.5 border-b px-3.5 py-2.5 text-[12.5px]">
        <span className={cn('flex-none text-[9.5px] font-bold', FILE_TYPE[fileType])}>
          {fileType}
        </span>
        <b className="min-w-0 flex-1 truncate font-medium">{doc}</b>
        {meta ? <span className="text-io-ink-3 text-[12px] whitespace-nowrap">{meta}</span> : null}
      </figcaption>
      <blockquote className="text-io-ink-2 m-0 px-4 py-3.5 text-[13px] leading-[1.6]">
        <Highlight text={text} match={match} active />
      </blockquote>
      <div className="border-io-line-2 text-io-ink-3 flex justify-between border-t px-3.5 py-2 text-[11.5px]">
        <span>{location}</span>
        <Link
          href={openHref as Route}
          className="text-io-accent io-focus rounded-io-tag text-[12px] whitespace-nowrap hover:underline"
        >
          Open source <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </figure>
  )
}
