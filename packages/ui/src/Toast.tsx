'use client'

import * as React from 'react'
import { AlertTriangle, Check, Info, X } from 'lucide-react'
import { cn } from './lib/utils'

/**
 * Design language v2 — transient feedback.
 *
 * Hand-rolled rather than Radix-backed, unlike Dialog / DropdownMenu /
 * Tooltip: there is no `@radix-ui/react-toast` in this package's dependencies,
 * and a toast is a live region rather than a focus trap. The hard parts here
 * are timer bookkeeping and announcement politeness, neither of which a
 * primitive library would solve for us.
 *
 * Behaviour worth preserving:
 *
 *  - **Politeness is tone-dependent.** Successes are `polite` and never
 *    interrupt; failures are `assertive` because the user is about to act on a
 *    wrong assumption. Announcing every "Saved" assertively is how screen
 *    reader users end up muting an app.
 *  - **Failures last longer and never auto-dismiss on their own if the user is
 *    reading.** Hovering or focusing anywhere in the region pauses every
 *    timer and resumes with the remaining time, not a fresh full duration —
 *    otherwise a mouse resting nearby keeps a stale toast alive indefinitely.
 *  - **Ids come from a ref counter, not `Math.random()` or `Date.now()`.**
 *    Those differ between the server and client render and produce hydration
 *    mismatches that only appear under load.
 *
 * Mount `ToastProvider` once, above anything that calls `useToast`. It renders
 * its own region, so there is no separate `<Toaster />` to forget.
 */

export type ToastTone = 'default' | 'success' | 'danger'

export interface ToastOptions {
  title: string
  /** Optional second line. Keep it to what the user should do next. */
  description?: string
  tone?: ToastTone
  /** ms. Defaults: 5000, or 8000 for `danger`. Pass `null` to require dismissal. */
  duration?: number | null
}

interface ToastRecord extends ToastOptions {
  id: number
  tone: ToastTone
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number
  dismiss: (id: number) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

/** Beyond this the stack is unreadable; the oldest is dropped. */
const MAX_VISIBLE = 4

const DEFAULT_DURATION: Record<ToastTone, number> = {
  default: 5000,
  success: 5000,
  danger: 8000,
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used inside a <ToastProvider>. Mount one above this component.')
  }
  return ctx
}

interface TimerRecord {
  handle: ReturnType<typeof setTimeout> | null
  remaining: number
  startedAt: number
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([])
  const nextId = React.useRef(1)
  const timers = React.useRef(new Map<number, TimerRecord>())

  const dismiss = React.useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer?.handle) clearTimeout(timer.handle)
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++
      const tone = options.tone ?? 'default'
      const record: ToastRecord = { ...options, id, tone }

      setToasts((prev) => {
        const next = [...prev, record]
        // Drop from the head so the newest — the one that describes what just
        // happened — always survives.
        const overflow = next.slice(0, Math.max(0, next.length - MAX_VISIBLE))
        for (const dropped of overflow) {
          const timer = timers.current.get(dropped.id)
          if (timer?.handle) clearTimeout(timer.handle)
          timers.current.delete(dropped.id)
        }
        return next.slice(-MAX_VISIBLE)
      })

      const duration = options.duration === undefined ? DEFAULT_DURATION[tone] : options.duration
      if (duration !== null) {
        timers.current.set(id, {
          handle: setTimeout(() => dismiss(id), duration),
          remaining: duration,
          startedAt: Date.now(),
        })
      }
      return id
    },
    [dismiss]
  )

  // Pause every live timer, banking how long each had left.
  const pause = React.useCallback(() => {
    const now = Date.now()
    for (const timer of timers.current.values()) {
      if (!timer.handle) continue
      clearTimeout(timer.handle)
      timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt))
      timer.handle = null
    }
  }, [])

  const resume = React.useCallback(() => {
    const now = Date.now()
    for (const [id, timer] of timers.current.entries()) {
      if (timer.handle) continue
      timer.startedAt = now
      timer.handle = setTimeout(() => dismiss(id), timer.remaining)
    }
  }, [dismiss])

  // Clearing on unmount matters in the App Router: a navigation can unmount the
  // provider while timers are still pending, and a fired callback would then
  // call setState on a dead component.
  React.useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) if (timer.handle) clearTimeout(timer.handle)
      pending.clear()
    }
  }, [])

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismiss} onPause={pause} onResume={resume} />
    </ToastContext.Provider>
  )
}

const TONE_STYLES: Record<ToastTone, { border: string; icon: string; Icon: typeof Check }> = {
  default: { border: 'border-l-ih-steel', icon: 'text-ih-steel', Icon: Info },
  success: { border: 'border-l-ih-success', icon: 'text-ih-success', Icon: Check },
  danger: { border: 'border-l-ih-danger', icon: 'text-ih-danger', Icon: AlertTriangle },
}

function ToastRegion({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: {
  toasts: ToastRecord[]
  onDismiss: (id: number) => void
  onPause: () => void
  onResume: () => void
}) {
  return (
    <div
      // `pointer-events-none` on the region and `auto` on each toast keeps the
      // empty column from swallowing clicks on whatever sits beneath it.
      className="pointer-events-none fixed bottom-0 right-0 z-[60] flex w-full max-w-[380px] flex-col gap-2 p-4"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      onFocusCapture={onPause}
      onBlurCapture={onResume}
    >
      {toasts.map((t) => {
        const tone = TONE_STYLES[t.tone]
        const Icon = tone.Icon
        return (
          <div
            key={t.id}
            role={t.tone === 'danger' ? 'alert' : 'status'}
            aria-live={t.tone === 'danger' ? 'assertive' : 'polite'}
            className={cn(
              'pointer-events-auto flex items-start gap-2.5 rounded-md border border-ih-border border-l-2 bg-ih-surface p-3 shadow-2',
              'font-sans text-[13px] text-ih-ink',
              'animate-[ih-toast-in_160ms_cubic-bezier(0.32,0.72,0,1)] motion-reduce:animate-none',
              tone.border
            )}
          >
            <Icon size={14} strokeWidth={2} aria-hidden="true" className={cn('mt-0.5 shrink-0', tone.icon)} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-medium leading-[1.4]">{t.title}</span>
              {t.description ? (
                <span className="text-[12.5px] leading-[1.45] text-ih-muted">{t.description}</span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className={cn(
                'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-ih-muted',
                'transition-colors hover:bg-ih-surface-2 hover:text-ih-ink',
                'outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft'
              )}
            >
              <X size={12} strokeWidth={1.8} aria-hidden="true" />
              <span className="sr-only">Dismiss</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
