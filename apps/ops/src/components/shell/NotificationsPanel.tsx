'use client'

import { List, type ListItem } from '@indus/ops-ui/card'
import { Button } from '@indus/ops-ui/controls'
import { Drawer } from '@indus/ops-ui/overlay'
import { InlineState } from '@indus/ops-ui/states'
import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  getNotifications,
  type NotificationFeed,
  type NotificationTab,
} from '../../actions/read/shell-panels'
import { useShell } from './Providers'
import { useReturnFocus } from './use-return-focus'

/** Board 181: per-event settings; the two safety events cannot be turned off there. */
export const NOTIFICATION_SETTINGS_HREF = '/settings/notifications'

const TABS: ReadonlyArray<{ key: NotificationTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'needs-you', label: 'Needs you' },
  { key: 'done', label: 'Done for you' },
]

/** Which rows each tab shows: Needs you = bad and warn; Done for you = ok and notes. */
function inTab(tab: NotificationTab, tone: NotificationFeed['rows'][number]['tone']): boolean {
  if (tab === 'all') return true
  return tab === 'needs-you' ? tone === 'bad' || tone === 'warn' : tone === 'ok' || tone === 'n'
}

/**
 * S02 · Notifications (board S02a): the bell's modal Drawer (scrim, focus trapped, Escape closes, focus back
 * to the bell). Tabs All · Needs you · Done for you, "Mark all read", rows that open their record, and
 * "Notification settings →". Read through getNotifications(), empty until S30.
 */
export default function NotificationsPanel() {
  const shell = useShell()
  const open = shell.panels.notifications
  const opener = useReturnFocus(open)
  const [tab, setTab] = useState<NotificationTab>('all')
  const [feed, setFeed] = useState<NotificationFeed | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let live = true
    void getNotifications().then((r) => {
      if (!live) return
      if (r.success) {
        setFeed(r.data)
        setFailed(null)
      } else setFailed(r.error)
    })
    return () => {
      live = false
    }
  }, [open])

  const rows = (feed?.rows ?? []).filter((r) => inTab(tab, r.tone))
  const items: ListItem[] = rows.map((r) => ({
    key: r.id,
    mark: r.tone,
    title: (
      <Link
        href={r.href as Route}
        onClick={() => shell.close('notifications')}
        className="io-focus rounded-io-tag text-io-ink hover:underline"
      >
        {r.title}
      </Link>
    ),
    sub: r.sub,
    right: r.time,
  }))
  const needs = feed?.counts['needs-you'] ?? 0

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => (next ? shell.open('notifications') : shell.close('notifications'))}
      title="Notifications"
      width={420}
      returnFocusRef={opener}
      actions={
        <Button variant="ghost" size="sm" disabled={!feed || feed.rows.length === 0}>
          Mark all read
        </Button>
      }
      tabs={{
        items: TABS.map((t) =>
          t.key === 'needs-you' && needs > 0
            ? { ...t, count: needs, countTone: 'bad' as const }
            : { ...t }
        ),
        value: tab,
        onValueChange: (k) => setTab(k as NotificationTab),
      }}
      footer={
        <Link
          href={NOTIFICATION_SETTINGS_HREF as Route}
          onClick={() => shell.close('notifications')}
          className="io-focus rounded-io-tag text-io-accent hover:text-io-accent-hover text-[13px] font-medium"
        >
          Notification settings →
        </Link>
      }
    >
      {failed ? (
        <InlineState kind="error" text={failed} />
      ) : !feed ? (
        <InlineState kind="loading" />
      ) : items.length === 0 ? (
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          {tab === 'needs-you'
            ? 'Nothing needs you. A bank-detail change or a disconnected mailbox always shows here.'
            : 'No notifications yet. They resolve themselves when the thing is done.'}
        </p>
      ) : (
        <List items={items} />
      )}
    </Drawer>
  )
}
