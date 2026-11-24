import { ThreadRow } from '@indus/ops-ui/mail'
import { EmptyState } from '@indus/ops-ui/states'
import type { MailFolderKey } from '@indus/ops-core'
import type { Route } from 'next'
import Link from 'next/link'
import type { ThreadPage } from '../../data/mail'
import { mailQuery, type MailSearch } from '../../lib/mail-params'
import CaughtUp from './CaughtUp'
import ThreadKeys from './ThreadKeys'

/**
 * Board 91's thread list: search, then one ThreadRow per thread (sender, role, company, time, subject, type
 * and record chips, the Assistant's one line), newest first, 50 a page. J / K move through it.
 */
export default function ThreadList({
  folder,
  search,
  page,
  selectedId,
  caughtUp = null,
}: {
  folder: MailFolderKey
  search: MailSearch
  page: ThreadPage
  selectedId?: string | undefined
  /** Board 97 (1): nothing needs a person and nothing is unsure today. */
  caughtUp?: { today: number } | null
}) {
  const keep = { type: search.type, q: search.q, past: search.past }
  const qs = mailQuery(keep)
  const hrefOf = (id: string) => `/mail/${folder}/${id}${qs}`
  const hrefs = page.rows.map((r) => hrefOf(r.id))
  return (
    <ThreadKeys hrefs={hrefs}>
      <form
        role="search"
        action={`/mail/${folder}`}
        className="border-io-line bg-io-card sticky top-0 z-[1] flex items-center gap-2 border-b px-3.5 py-2.5"
      >
        {search.type ? <input type="hidden" name="type" value={search.type} /> : null}
        {search.past ? <input type="hidden" name="past" value="1" /> : null}
        <label className="sr-only" htmlFor="mail-search">
          Search mail
        </label>
        <input
          id="mail-search"
          name="q"
          type="search"
          defaultValue={search.q ?? ''}
          placeholder="Search mail"
          className="io-focus-field border-io-stroke rounded-io-ctl h-io-btn bg-io-card text-io-ink placeholder:text-io-ink-3 w-full min-w-0 border px-2.5 text-[13px]"
        />
        <Link
          href={`/mail/${folder}${mailQuery({ ...keep, past: !search.past })}` as Route}
          className="text-io-ink-2 io-focus rounded-io-tag flex-none text-[12px] whitespace-nowrap hover:underline"
        >
          {search.past ? 'Live only' : 'Today'}
        </Link>
      </form>
      {page.rows.length === 0 && caughtUp && !search.q && !search.past ? (
        <CaughtUp today={caughtUp.today} />
      ) : page.rows.length === 0 ? (
        <div className="p-4">
          <EmptyState
            mark="ML"
            title={search.q ? 'Nothing matches that search' : 'Nothing here'}
            text={
              search.past
                ? 'No mail in this folder, past mail included.'
                : 'No live mail in this folder. Past mail is hidden; show it from “Today”.'
            }
            align="left"
          />
        </div>
      ) : (
        <div role="list" aria-label="Threads" aria-describedby="mail-keys">
          <p id="mail-keys" className="sr-only">
            J and K move to the next and previous thread.
          </p>
          {page.rows.map((r) => (
            <div role="listitem" key={r.id} id={`thread-${r.id}`}>
              <ThreadRow
                href={hrefOf(r.id)}
                from={r.from}
                senderRole={r.senderRole}
                {...(r.company ? { company: r.company } : {})}
                time={r.time}
                subject={r.subject}
                {...(r.type ? { type: r.type } : {})}
                {...(r.recordRef ? { recordRef: r.recordRef } : {})}
                {...(r.assistantNote ? { assistantNote: r.assistantNote } : {})}
                selected={r.id === selectedId}
              />
            </div>
          ))}
          {page.nextCursor ? (
            <div className="px-3.5 py-3">
              <Link
                href={`/mail/${folder}${mailQuery(keep, { cursor: page.nextCursor })}` as Route}
                className="text-io-accent io-focus rounded-io-tag text-[12.5px] hover:underline"
              >
                Older threads
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </ThreadKeys>
  )
}
