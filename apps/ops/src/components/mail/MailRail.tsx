import { MailFolder } from '@indus/ops-ui/mail'
import { MAIL_TYPE_SLUGS, MAIL_TYPES, type MailFolderKey, type MailTypeSlug } from '@indus/ops-core'
import type { Route } from 'next'
import type { FolderCounts } from '../../data/mail'
import { mailQuery, type MailSearch } from '../../lib/mail-params'

/**
 * Board 91's folder pane: Mailbox (All, sales@, purchase@), Status (Unsure in the warn style, Not linked,
 * Needs you, Handled by Assistant) and Type. Counts are today's live mail; the open-work statuses count every
 * open item. Server-rendered: a folder is a link, the current one marked.
 */
export default function MailRail({
  folder,
  search,
  counts,
  mailboxes,
}: {
  folder: MailFolderKey
  search: MailSearch
  counts: FolderCounts
  mailboxes: { sales: string; purchase: string }
}) {
  const keep = { q: search.q, past: search.past }
  const href = (f: MailFolderKey, type?: MailTypeSlug) =>
    `/mail/${f}${mailQuery(keep, type ? { type } : {})}` as Route
  const mailbox: Array<[MailFolderKey, string, number]> = [
    ['all', 'All', counts.mailbox.all],
    ['sales', mailboxes.sales, counts.mailbox.sales],
    ['purchase', mailboxes.purchase, counts.mailbox.purchase],
  ]
  const status: Array<[MailFolderKey, string, number, boolean]> = [
    ['unsure', 'Unsure', counts.status.unsure, counts.status.unsure > 0],
    ['not-linked', 'Not linked', counts.status.notLinked, false],
    ['needs-you', 'Needs you', counts.status.needsYou, false],
    ['handled', 'Handled by Assistant', counts.status.handled, false],
  ]
  return (
    <>
      <div className="flex flex-col gap-0.5 pb-2.5">
        <p className="io-eyebrow px-2.5 pt-1.5 pb-1">Mailbox</p>
        {mailbox.map(([key, label, count]) => (
          <MailFolder
            key={key}
            label={label}
            count={count}
            href={href(key)}
            active={folder === key && !search.type}
          />
        ))}
      </div>
      <div className="flex flex-col gap-0.5 pb-2.5">
        <p className="io-eyebrow px-2.5 pt-1.5 pb-1">Status</p>
        {status.map(([key, label, count, warn]) => (
          <MailFolder
            key={key}
            label={label}
            count={count}
            warn={warn}
            href={href(key)}
            active={folder === key}
          />
        ))}
      </div>
      <div className="flex flex-col gap-0.5 pb-2.5">
        <p className="io-eyebrow px-2.5 pt-1.5 pb-1">Type</p>
        {MAIL_TYPE_SLUGS.map((slug) => (
          <MailFolder
            key={slug}
            label={MAIL_TYPES[slug].label}
            count={counts.type[slug]}
            href={href('all', slug)}
            active={folder === 'all' && search.type === slug}
          />
        ))}
      </div>
    </>
  )
}
