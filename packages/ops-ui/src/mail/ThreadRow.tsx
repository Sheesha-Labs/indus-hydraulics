import { cn } from '../lib/cn'
import { MAIL_ROLE_TONE, MAIL_TYPE_TONE, TONE_CLASS } from '../status'
import Chip from '../status/Chip'
import type { ThreadRowProps } from './types'

/**
 * Mail kit `km-tr`: one thread in a folder list. p 10×14, bottom rule, gap 4.
 *  1. sender 500 (unread 600) + role tag (18 h, 10.5, r 4) + company ink-3 + time 11.5 right;
 *  2. subject 12.5 (unread 500);
 *  3. type chip (20 h, tone from MAIL_TYPE_TONE) + record ref (line border, r 4, 11px);
 *  4. one line from the Assistant ("AS", 12px ink-2).
 * Selected = accent wash + a 3px inset accent bar, and aria-current on the link.
 *
 * The whole row is one stretched link (one tab stop): the subject is the anchor and its ::after covers the
 * row; the focus ring is drawn on that ::after so it outlines the row. The sender is read first.
 */
export default function ThreadRow({
  href,
  from,
  senderRole,
  company,
  time,
  subject,
  type,
  recordRef,
  assistantNote,
  unread = false,
  selected = false,
}: ThreadRowProps) {
  // Company and time are ink-3 as the kit draws them; on the selected row's accent wash ink-3 falls below AA
  // (axe), so they step up to ink-2 there.
  const meta = selected ? 'text-io-ink-2' : 'text-io-ink-3'
  return (
    <div
      data-part="thread-row"
      data-state={selected ? 'selected' : undefined}
      data-unread={unread ? '' : undefined}
      className={cn(
        'border-io-line relative flex w-full flex-col gap-1 border-b px-3.5 py-2.5',
        selected
          ? 'bg-io-accent-wash shadow-[inset_3px_0_0_var(--io-accent)]'
          : 'bg-io-card hover:bg-io-row-hover'
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
        <b className={cn('whitespace-nowrap', unread ? 'font-semibold' : 'font-medium')}>{from}</b>
        <span
          className={cn(
            'h-io-chip-sm rounded-io-tag inline-flex flex-none items-center px-1.5 text-[10.5px] font-medium',
            TONE_CLASS[MAIL_ROLE_TONE[senderRole]]
          )}
        >
          {senderRole}
        </span>
        {company ? <span className={cn('truncate', meta)}>{company}</span> : null}
        <span className={cn('ml-auto flex-none text-[11.5px]', meta)}>{time}</span>
      </div>
      <a
        href={href}
        {...(selected ? { 'aria-current': 'true' as const } : {})}
        className={cn(
          'truncate text-[12.5px] outline-none',
          'after:absolute after:inset-0 focus-visible:after:shadow-[inset_0_0_0_2px_var(--io-accent)]',
          unread && 'font-medium'
        )}
      >
        <span className="sr-only">
          {from}
          {unread ? ', unread' : ''}:{' '}
        </span>
        {subject}
      </a>
      {type || recordRef ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {type ? <Chip tone={MAIL_TYPE_TONE[type]} label={type} className="h-io-tag" /> : null}
          {recordRef ? (
            <span className="border-io-line text-io-ink-2 h-io-tag rounded-io-tag inline-flex items-center border px-1.5 text-[11px] whitespace-nowrap">
              {recordRef}
            </span>
          ) : null}
        </div>
      ) : null}
      {assistantNote ? (
        <span className="text-io-ink-2 flex items-baseline gap-1.5 text-[12px]">
          <i
            aria-hidden="true"
            className="text-io-navy text-[10px] font-semibold tracking-[0.06em] not-italic"
          >
            AS
          </i>
          <span className="sr-only">Assistant:</span>
          {assistantNote}
        </span>
      ) : null}
    </div>
  )
}
