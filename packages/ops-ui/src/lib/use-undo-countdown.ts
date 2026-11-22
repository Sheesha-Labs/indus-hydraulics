'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The undo window's countdown (ADR-11). The server owns the window (`undoUntil`) and sends how many
 * milliseconds are left; the browser only counts that figure down.
 *
 * Algorithm: on mount (and whenever the server sends a new figure) take one monotonic reading,
 * `deadline = performance.now() + remainingMs`. Every tick re-reads `performance.now()` and shows
 * `deadline - now`, so a throttled background tab or a late timer never drifts the figure: the next tick
 * simply shows the right number. Ticks land just after each whole-second boundary of the remaining time,
 * so "4:59" turns into "4:58" exactly one second later. Wall-clock time (Date.now) is never used: it jumps
 * with clock changes and differs between tabs and devices; only the server's figure and this tab's
 * monotonic clock count. At zero the hook reports expired once and stops.
 */
export function useUndoCountdown(
  remainingMs: number,
  onExpire?: () => void
): { remainingMs: number; label: string; expired: boolean } {
  const [left, setLeft] = useState(() => Math.max(0, remainingMs))
  const expireRef = useRef(onExpire)
  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    const deadline = performance.now() + Math.max(0, remainingMs)
    let timer: ReturnType<typeof setTimeout> | undefined
    const tick = () => {
      const now = Math.max(0, deadline - performance.now())
      setLeft(now)
      if (now <= 0) {
        expireRef.current?.()
        return
      }
      timer = setTimeout(tick, nextTickDelay(now))
    }
    tick()
    return () => clearTimeout(timer)
  }, [remainingMs])

  return { remainingMs: left, label: formatUndo(left), expired: left <= 0 }
}

/**
 * "m:ss" for the remaining window, rounding up: 299000 → "4:59", 298001 → "4:59", 298000 → "4:58",
 * 1 → "0:01", 0 → "0:00". Rounding up means the label never reads 0:00 while undo still works.
 */
export function formatUndo(ms: number): string {
  const s = Math.ceil(Math.max(0, ms) / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Milliseconds until the label next changes: the part of a second above the last whole second. */
export function nextTickDelay(ms: number): number {
  const rest = ms % 1000
  return rest === 0 ? 1000 : rest
}
