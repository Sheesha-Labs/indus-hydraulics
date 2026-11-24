import { PageHeader } from '@indus/ops-ui/shell'
import { EmptyState } from '@indus/ops-ui/states'
import { T3Mail } from '@indus/ops-ui/templates'
import type { MailFolderKey } from '@indus/ops-core'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import {
  folderCounts,
  getThread,
  listThreads,
  mailboxAddresses,
  notBusinessToday,
} from '../../data/mail'
import type { OpsUser } from '../../lib/access-core'
import { mailQuery, type MailSearch } from '../../lib/mail-params'
import { resolveSendEnvelope } from '../../server/mail-send/envelope'
import { replyPermission } from '../../server/mail/reply'
import AssistantPane from './AssistantPane'
import LinkToModal from './LinkToModal'
import MailRail from './MailRail'
import ThreadList from './ThreadList'
import ThreadReading from './ThreadReading'

/**
 * Board 91 (T3 three-pane mail, plus the Assistant pane): rendered by the folder page and the thread page so
 * both read the search params (a layout cannot). The folder rail and the list come from the same reads on
 * both; the thread page adds the conversation.
 */
function linkQuery(search: MailSearch): string {
  const qs = mailQuery(search, { cursor: undefined })
  return `${qs}${qs ? '&' : '?'}link=1`
}

function defaultUseAsFor(
  cls: string
): 'client_reply' | 'supplier_quote' | 'document' | 'just_keep' {
  if (cls.startsWith('client_')) return 'client_reply'
  if (cls === 'supplier_quote') return 'supplier_quote'
  if (cls === 'supplier_documents' || cls === 'supplier_price_list') return 'document'
  return 'just_keep'
}

export default async function MailScreen({
  user,
  folder,
  search,
  threadId,
  children,
}: {
  user: OpsUser
  folder: MailFolderKey
  search: MailSearch
  threadId?: string
  /** Overlays on the page (S05-T06's Link to… modal). */
  children?: React.ReactNode
}) {
  const [counts, page, mailboxes, thread, nonce] = await Promise.all([
    folderCounts(),
    listThreads(folder, search),
    mailboxAddresses(),
    threadId ? getThread(threadId, user, undefined, { all: search.all }) : Promise.resolve(null),
    headers().then((h) => h.get('x-nonce') ?? undefined),
  ])
  if (threadId && !thread) notFound()

  let reading: React.ReactNode
  if (thread) {
    const mailbox = thread.mailbox.role === 'client' ? 'sales' : 'purchase'
    const permission = replyPermission(user, thread.mailbox.role)
    const cls = thread.latest.classification
    const [envelope, notBusiness] = await Promise.all([
      resolveSendEnvelope('other', { mailboxId: thread.mailbox.id }),
      cls === 'not_business' || cls === 'phishing' ? notBusinessToday() : Promise.resolve(null),
    ])
    const env = envelope.ok ? envelope.envelope : null
    const line = [
      `From ${thread.mailbox.address}`,
      ...(env?.cc.length ? [`Cc ${env.cc.join(', ')}`] : []),
      env?.signature ? 'your signature' : 'no signature',
    ].join(' · ')
    reading = (
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_300px] gap-4">
        <ThreadReading
          thread={thread}
          nonce={nonce}
          notBusiness={notBusiness}
          allHref={`/mail/${folder}/${thread.id}${mailQuery(search, { cursor: search.cursor })}${
            mailQuery(search, { cursor: search.cursor }) ? '&' : '?'
          }all=1`}
          reply={{
            mailbox,
            mailboxes: { sales: mailboxes.sales, purchase: mailboxes.purchase },
            permission,
            envelope: line,
            cc: env?.cc ?? [],
          }}
        />
        <AssistantPane
          thread={thread}
          linkHref={`/mail/${folder}/${thread.id}${linkQuery(search)}`}
        />
      </div>
    )
  } else {
    reading = (
      <EmptyState
        mark="ML"
        title="Pick a thread"
        text="The Assistant’s note comes first, then the conversation. J and K move through the list."
        align="left"
      />
    )
  }

  const meta = `${mailboxes.sales} and ${mailboxes.purchase} · ${counts.today} today · ${counts.unsure} unsure`
  return (
    <>
      <T3Mail
        header={
          // data-built: the route checks (routes.spec, one-primary) find a built page by it.
          <div data-built="mail">
            <PageHeader crumb="Workspace" title="Mail" meta={meta} />
          </div>
        }
        folders={<MailRail folder={folder} search={search} counts={counts} mailboxes={mailboxes} />}
        list={
          <ThreadList
            folder={folder}
            search={search}
            page={page}
            selectedId={thread?.id}
            caughtUp={
              counts.status.needsYou === 0 && counts.unsure === 0 ? { today: counts.today } : null
            }
          />
        }
        reading={reading}
      />
      {thread && search.link ? (
        <LinkToModal
          messageId={thread.latest.id}
          title={`“${thread.subject}” from ${thread.latest.from.name ?? thread.latest.from.address}`}
          defaultUseAs={defaultUseAsFor(thread.latest.classification)}
        />
      ) : null}
      {children}
    </>
  )
}
