'use client'

import { useTransition } from 'react'
import { markAllRead } from './actions'

type Props = {
  hasUnread: boolean
}

export default function NotificationActions({ hasUnread }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await markAllRead()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasUnread || isPending}
      className="h-9 px-4 border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {isPending ? 'Marking…' : 'Mark all as read'}
    </button>
  )
}
