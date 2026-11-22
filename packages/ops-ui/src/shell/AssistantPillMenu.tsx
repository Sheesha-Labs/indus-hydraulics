'use client'

import { cn } from '../lib/cn'
import Menu, { type MenuEntry } from '../overlay/Menu'
import { ASSISTANT_PILL } from '../status'
import type { AssistantStatus } from '../types'
import { AUTOPILOT_HREF } from './nav'

export interface AssistantPillMenuProps {
  /** Already the worst current state (`worstAssistantStatus`). */
  status: AssistantStatus
  /** Who is signed in: only the Owner may pause. */
  who: 'owner' | 'helper'
  collapsed: boolean
  /** Owner only: "Pause everything" (the action is wired in S05). */
  onPause?: (() => void | Promise<void>) | undefined
  className?: string
}

/** The collapsed dot's 4px halo: the pill's own background (literal classes so Tailwind emits them). */
const HALO: Record<AssistantStatus, string> = {
  running: 'ring-io-pill-ok-bg',
  paused: 'ring-io-warn-tint',
  disconnected: 'ring-io-bad-tint',
  unsure: 'ring-io-warn-tint',
  off: 'ring-io-fill',
}

/**
 * The sidebar's Assistant status pill (h 32, "Autopilot →") or, collapsed, its 12px dot with a 4px halo. It
 * is a button: it opens a menu with "Pause everything" (Owner only) and a link to Autopilot (board 98).
 */
export default function AssistantPillMenu({
  status,
  who,
  collapsed,
  onPause,
  className,
}: AssistantPillMenuProps) {
  const pill = ASSISTANT_PILL[status]
  const items: MenuEntry[] = []
  if (who === 'owner' && onPause)
    items.push(
      {
        type: 'item',
        label: 'Pause everything',
        onSelect: () => {
          void onPause()
        },
      },
      { type: 'separator' }
    )
  items.push({ type: 'item', label: 'Autopilot →', href: AUTOPILOT_HREF })
  const name = `${pill.label}: Assistant menu`
  const trigger = collapsed ? (
    <button
      type="button"
      aria-label={name}
      data-part="assistant-pill"
      data-status={status}
      className={cn(
        // The dot is 12px; the ::after widens the hit area without moving anything.
        "io-focus rounded-io-pill relative mb-3 size-3 flex-none cursor-pointer ring-4 after:absolute after:-inset-2.5 after:content-['']",
        pill.dot,
        HALO[status],
        className
      )}
    />
  ) : (
    <button
      type="button"
      aria-label={name}
      data-part="assistant-pill"
      data-status={status}
      className={cn(
        'io-focus rounded-io-pill mb-2 flex h-8 cursor-pointer items-center gap-2 px-2.5 text-left text-[12px] font-medium',
        pill.bg,
        pill.ink,
        className
      )}
    >
      <span aria-hidden="true" className={cn('rounded-io-pill size-[7px] flex-none', pill.dot)} />
      {/* The status word always shows in full; the "Autopilot →" hint gives way when it is long. */}
      <span className="flex-1 whitespace-nowrap">{pill.label}</span>
      <span aria-hidden="true" className="min-w-0 truncate font-normal opacity-80">
        Autopilot →
      </span>
    </button>
  )
  return <Menu trigger={trigger} items={items} width={200} />
}
