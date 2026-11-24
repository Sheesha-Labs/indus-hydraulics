'use client'

import { useState } from 'react'
import Button from '../controls/Button'
import { cn } from '../lib/cn'
import Popover from '../overlay/Popover'
import { ASSISTANT_PILL } from '../status'
import type { AssistantStatus } from '../types'
import { AUTOPILOT_HREF } from './nav'

export interface AssistantPillMenuProps {
  /** Already the worst current state (`worstAssistantStatus`). */
  status: AssistantStatus
  /** Who is signed in: only the Owner may pause. */
  who: 'owner' | 'helper'
  collapsed: boolean
  /** Owner only: "Pause everything" (S05-T08). */
  onPause?: (() => void | Promise<void>) | undefined
  /** Owner only, while paused: "Resume" (S05-T08). */
  onResume?: (() => void | Promise<void>) | undefined
  /** The popover's line under the title, e.g. "37 actions this week · last 2 min ago". */
  summary?: string | undefined
  /** Overrides the status word, e.g. "sales@ disconnected" naming the mailbox (S04-T09). */
  label?: string | undefined
  className?: string
}

/** The collapsed dot's 4px halo: the pill's own background (literal classes so Tailwind emits them). */
const HALO: Record<AssistantStatus, string> = {
  running: 'ring-io-pill-ok-bg',
  paused: 'ring-io-warn-tint',
  disconnected: 'ring-io-bad-tint',
  behind: 'ring-io-warn-tint',
  unsure: 'ring-io-warn-tint',
  off: 'ring-io-fill',
}

const TITLE: Record<AssistantStatus, string> = {
  running: 'Assistant running',
  paused: 'Assistant paused',
  disconnected: 'A mailbox is disconnected',
  behind: 'Mail is behind',
  unsure: 'Some items are unsure',
  off: 'Assistant off',
}

/**
 * The sidebar's Assistant status pill (h 32, "Autopilot →") or, collapsed, its 12px dot with a 4px halo. One
 * click opens a popover (S05A, board 102 state 1): the state, a summary line, then for the Owner "Pause
 * everything" (or "Resume" while paused) and "Open Autopilot". The Helper sees the state only.
 */
export default function AssistantPillMenu({
  status,
  who,
  collapsed,
  onPause,
  onResume,
  summary,
  label,
  className,
}: AssistantPillMenuProps) {
  const base = ASSISTANT_PILL[status]
  const pill = label ? { ...base, label } : base
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const paused = status === 'paused'
  const act = paused ? onResume : onPause
  async function run() {
    if (!act) return
    setBusy(true)
    try {
      await act()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }
  const trigger = collapsed ? (
    <button
      type="button"
      aria-label={pill.label}
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
      {/* The hint is 80% ink, except on the disconnected red, where that falls under 4.5:1. */}
      <span
        aria-hidden="true"
        className={cn('min-w-0 truncate font-normal', status !== 'disconnected' && 'opacity-80')}
      >
        Autopilot →
      </span>
    </button>
  )
  return (
    <Popover
      trigger={trigger}
      title={TITLE[status]}
      width={280}
      side="top"
      open={open}
      onOpenChange={setOpen}
      action={{ label: 'Open Autopilot', href: AUTOPILOT_HREF }}
    >
      <div className="flex flex-col gap-2.5">
        {summary ? <p className="text-io-ink-3 m-0 text-[12.5px]">{summary}</p> : null}
        {who === 'owner' && act ? (
          <Button
            variant={paused ? 'secondary' : 'danger'}
            size="sm"
            busy={busy}
            onClick={() => void run()}
            className="w-full justify-center"
          >
            {paused ? 'Resume' : 'Pause everything'}
          </Button>
        ) : who === 'helper' ? (
          <p className="text-io-ink-3 m-0 text-[12px]">
            Only the Owner can pause or resume the Assistant.
          </p>
        ) : null}
      </div>
    </Popover>
  )
}
