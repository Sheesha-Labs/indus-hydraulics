'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Button from '../controls/Button'
import { formatTime } from '../format'
import StateBox, { STATE_LINK, type HeadingLevel } from './StateBox'

export interface OfflineStateProps {
  /** When data last arrived; the foot reads "Last synced 10:41" (24-hour, Asia/Dubai). */
  lastSynced?: Date
  /** "Retry now", and called again by itself when the browser comes back online. */
  onRetry: () => void
  title?: string
  text?: ReactNode
  align?: 'left' | 'center'
  bare?: boolean
  headingLevel?: HeadingLevel
  className?: string
}

export const OFFLINE_DEFAULT = {
  title: 'You’re offline',
  text: 'You can read what was already loaded. Sending, approving and saving wait until you reconnect.',
} as const

/**
 * States kit Offline: a `–` mark on fill, what still works, "Retry now" and when data last arrived.
 * Client: it retries when the browser fires `online`.
 */
export default function OfflineState({
  lastSynced,
  onRetry,
  title = OFFLINE_DEFAULT.title,
  text = OFFLINE_DEFAULT.text,
  align,
  bare,
  headingLevel,
  className,
}: OfflineStateProps) {
  const retry = useRef(onRetry)
  useEffect(() => {
    retry.current = onRetry
  })
  useEffect(() => {
    const onOnline = () => retry.current()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  return (
    <StateBox
      tone="offline"
      mark="–"
      title={title}
      text={text}
      actions={
        <Button variant="link" size="sm" className={STATE_LINK} onClick={onRetry}>
          Retry now
        </Button>
      }
      foot={lastSynced ? `Last synced ${formatTime(lastSynced)}` : undefined}
      {...(align ? { align } : {})}
      {...(bare === undefined ? {} : { bare })}
      {...(headingLevel ? { headingLevel } : {})}
      {...(className ? { className } : {})}
    />
  )
}
