'use client'

import { MailFolder } from '@indus/ops-ui/mail'
import { to } from '../../lib/routes'
import { useSelectedLayoutSegment } from 'next/navigation'
import type { MailFolder as MailFolderKey } from '../../lib/route-params'

const FOLDERS: readonly { group: string; items: readonly [MailFolderKey, string][] }[] = [
  {
    group: 'Inbox',
    items: [
      ['all', 'All mail'],
      ['needs-you', 'Needs you'],
      ['unsure', 'Unsure'],
      ['not-linked', 'Not linked'],
    ],
  },
  {
    group: 'By sender',
    items: [
      ['suppliers', 'Suppliers'],
      ['clients', 'Clients'],
    ],
  },
  {
    group: 'Mailboxes',
    items: [
      ['sales', 'sales@'],
      ['purchase', 'purchase@'],
    ],
  },
  {
    group: 'Done',
    items: [
      ['sent', 'Sent'],
      ['handled', 'Handled'],
    ],
  },
]

const folderHref = (key: MailFolderKey) => to(`/mail/${key}`)

/**
 * The persistent mail folder rail (T3, boards 91 / 94): rendered once by mail/layout.tsx, the current
 * folder read from the selected segment so switching folders re-renders only the list and reading pane.
 * Counts arrive with S05.
 */
export default function MailFolders() {
  const current = useSelectedLayoutSegment()
  return (
    <>
      {FOLDERS.map((g) => (
        <div key={g.group} className="flex flex-col gap-0.5 pb-2.5">
          <p className="io-eyebrow px-2.5 pt-1.5 pb-1">{g.group}</p>
          {g.items.map(([key, label]) => (
            <MailFolder key={key} label={label} href={folderHref(key)} active={key === current} />
          ))}
        </div>
      ))}
    </>
  )
}
