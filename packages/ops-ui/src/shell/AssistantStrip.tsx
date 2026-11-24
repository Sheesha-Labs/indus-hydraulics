'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'
import Tooltip from '../overlay/Tooltip'
import Tag from '../status/Tag'
import { useShellLive } from './live'

export interface AssistantStripProps {
  /** The live counter for this record (`record:ENQ-2026-0001`, ADR-19). */
  recordKey: string
  /** What the Assistant did on the record: one deterministic sentence from its action rows. */
  did: string
  /** "1 thing needs you" → Review filtered by the record. */
  need?: { label: string; href: string }
  /**
   * Called when the record's live counter changes after mount: the text above came from the server and is
   * now stale. Defaults to the `ShellLiveProvider`'s `refresh` (S02-T03 wires `router.refresh()`).
   */
  onStale?: () => void
  /**
   * S06-T08: the record's Assistant control. Given, the ASSISTANT tag is a button that opens the docked
   * Assistant panel (S03a); Escape there returns focus to it.
   */
  onOpenPanel?: () => void
  /** Whether that panel is open (aria-expanded). */
  panelOpen?: boolean
  className?: string
}

/**
 * Shell kit `AssistantStrip` (board 75, 05 §3.13): one 40px line under the header: the ASSISTANT tag, what
 * it did (one line, ellipsis; the full sentence in a Tooltip when cut) and what needs a person. Client: it
 * watches the record's live key and asks for fresh server data when it moves.
 */
export default function AssistantStrip({
  recordKey,
  did,
  need,
  onStale,
  onOpenPanel,
  panelOpen = false,
  className,
}: AssistantStripProps) {
  const live = useShellLive()
  const value = live.live?.[recordKey]
  const seen = useRef(value)
  const stale = onStale ?? live.refresh

  useEffect(() => {
    if (value === undefined || value === seen.current) return
    const first = seen.current === undefined
    seen.current = value
    // The first live reading only establishes the baseline the server render was made against.
    if (!first) stale?.()
  }, [value, stale])

  const textRef = useRef<HTMLSpanElement>(null)
  const [cut, setCut] = useState(false)
  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return
    const check = () => setCut(el.scrollWidth > el.clientWidth)
    check()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [did])

  const text = (
    <span
      ref={textRef}
      data-part="assistant-strip-did"
      // Focusable only when the sentence is cut, so the Tooltip with the rest reaches keyboard users too.
      {...(cut ? { tabIndex: 0 } : {})}
      className={cn('min-w-0 flex-1 truncate', cut && 'io-focus rounded-io-tag')}
    >
      {did}
    </span>
  )

  return (
    <div
      data-part="assistant-strip"
      data-record={recordKey}
      className={cn(
        'h-io-strip bg-io-accent-wash border-io-line text-io-ink-2 flex w-full items-center gap-2.5 border-b px-7 text-[12.5px]',
        className
      )}
    >
      {onOpenPanel ? (
        <button
          type="button"
          data-part="assistant-control"
          aria-expanded={panelOpen}
          aria-label="Assistant panel"
          onClick={onOpenPanel}
          className="io-focus rounded-io-tag flex-none cursor-pointer"
        >
          <Tag kind="assistant">Assistant</Tag>
        </button>
      ) : (
        <Tag kind="assistant">Assistant</Tag>
      )}
      {cut ? <Tooltip content={did}>{text}</Tooltip> : text}
      {need ? (
        <Link
          href={need.href as Route}
          className="text-io-accent io-focus rounded-io-tag flex-none font-medium hover:underline"
        >
          {need.label} <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  )
}
