'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Button from '../controls/Button'
import StateBox, { STATE_LINK, STATE_PRIMARY, type HeadingLevel } from './StateBox'

export interface ErrorStateProps {
  title?: string
  text?: ReactNode
  /** The error digest (error.digest in error.tsx). Shown as "Error ID e-<digest>". */
  errorId?: string
  /**
   * The error error.tsx received. Only its digest is read: the message and stack are never rendered or
   * copied (they can carry a provider error, a Prisma code or record data).
   */
  error?: { digest?: string | undefined } | undefined
  /** "Try again": reset() in error.tsx. */
  onRetry?: () => void
  align?: 'left' | 'center'
  bare?: boolean
  headingLevel?: HeadingLevel
  className?: string
}

export const ERROR_DEFAULT = {
  title: 'Couldn’t load this page',
  text: 'The server didn’t answer. Nothing was lost.',
} as const

/**
 * What "Copy error details" puts on the clipboard: the error id, the route and the time. Nothing else,
 * ever: no message, no stack, no query string (it can carry a signed token).
 */
export function errorDetails(digest: string | undefined, route: string, at: Date): string {
  return [
    `Error ID: ${digest ? `e-${digest}` : 'none'}`,
    `Route: ${route}`,
    `Time: ${at.toISOString()}`,
  ].join('\n')
}

type CopyState = 'idle' | 'copied' | 'failed'
const COPY_LABEL: Record<CopyState, string> = {
  idle: 'Copy error details',
  copied: 'Copied',
  failed: 'Couldn’t copy',
}

/**
 * States kit Error: the body of every error.tsx (05 §6.4). A `!` mark on bad-tint, a title that says what
 * failed, text that says what was kept, "Try again" and "Copy error details", and the error id. Client:
 * the buttons have handlers and the copy reads the current route.
 */
export default function ErrorState({
  title = ERROR_DEFAULT.title,
  text = ERROR_DEFAULT.text,
  errorId,
  error,
  onRetry,
  align,
  bare,
  headingLevel,
  className,
}: ErrorStateProps) {
  const digest = errorId ?? error?.digest
  const [copy, setCopy] = useState<CopyState>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copyDetails() {
    const details = errorDetails(digest, window.location.pathname, new Date())
    let next: CopyState = 'copied'
    try {
      await navigator.clipboard.writeText(details)
    } catch {
      next = 'failed'
    }
    setCopy(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopy('idle'), 2500)
  }

  return (
    <StateBox
      tone="error"
      mark="!"
      title={title}
      text={text}
      actions={
        <>
          {onRetry ? (
            <Button variant="primary" size="sm" className={STATE_PRIMARY} onClick={onRetry}>
              Try again
            </Button>
          ) : null}
          <Button variant="link" size="sm" className={STATE_LINK} onClick={copyDetails}>
            {COPY_LABEL[copy]}
          </Button>
          <span role="status" className="sr-only">
            {copy === 'idle' ? '' : COPY_LABEL[copy]}
          </span>
        </>
      }
      foot={digest ? `Error ID e-${digest}` : undefined}
      {...(align ? { align } : {})}
      {...(bare === undefined ? {} : { bare })}
      {...(headingLevel ? { headingLevel } : {})}
      {...(className ? { className } : {})}
    />
  )
}
