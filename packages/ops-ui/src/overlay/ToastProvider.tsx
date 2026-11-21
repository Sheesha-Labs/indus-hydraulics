'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '../lib/cn'
import { LAYER } from './styles'
import Toast, { type ToastInput, type ToastRecord } from './Toast'

export interface ToastApi {
  /** Show a toast; returns its id. */
  toast: (input: ToastInput) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** The toast API. Throws outside a ToastProvider, so a missing provider fails loudly in development. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast() needs a <ToastProvider> above it')
  return api
}

export interface ToastProviderProps {
  children?: ReactNode
  /** Where the stack sits. Default bottom-left of the viewport; the shell (S02) clears the sidebar. */
  className?: string
}

/**
 * Overlay kit toasts: our own live regions, not Radix Toast, because they carry the server-owned undo
 * countdown (ADR-11). One `aria-live="polite"` list for everything and an `assertive` one for errors.
 * Toasts never take focus; their timers pause while the pointer or focus is inside the region; F6 moves
 * focus to the newest toast's first button (and Tab from there walks the stack). Ids come from a counter,
 * never Math.random or Date.now, so server and client renders agree.
 *
 * aria-relevant="additions": a toast is announced once when it appears; the undo countdown ticking
 * inside it is not re-read every second.
 */
export default function ToastProvider({ children, className }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const [hover, setHover] = useState(false)
  const [focusIn, setFocusIn] = useState(false)
  const nextId = useRef(1)
  const region = useRef<HTMLElement>(null)

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id))
    // A focused toast that goes away takes focus with it, and not every browser fires focusout for a
    // removed node: re-check after the removal, so the other toasts' timers never hold forever.
    setTimeout(() => {
      if (!region.current?.contains(document.activeElement)) setFocusIn(false)
    }, 0)
  }, [])

  const toast = useCallback((input: ToastInput) => {
    const id = nextId.current++
    setToasts((all) => [...all, { ...input, id }])
    return id
  }, [])

  const onUndoFailed = useCallback(
    (message: string) => {
      toast({ kind: 'error', title: message })
    },
    [toast]
  )

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  // F6: into the toast region (listed with the shortcuts in Help, S06).
  const hasToasts = toasts.length > 0
  useEffect(() => {
    if (!hasToasts) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'F6' || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const el = region.current
      if (!el || el.contains(document.activeElement)) return
      const newest = [...el.querySelectorAll('li')].at(-1)
      const target = newest?.querySelector<HTMLElement>('button:not([disabled])') ?? el
      e.preventDefault()
      target.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [hasToasts])

  // Pause while the pointer or focus is in the region. Listeners, not JSX handlers: the region is a
  // landmark, not a control.
  useEffect(() => {
    const el = region.current
    if (!el) return
    const enter = () => setHover(true)
    const leave = () => setHover(false)
    const focusin = () => setFocusIn(true)
    const focusout = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node | null)) setFocusIn(false)
    }
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    el.addEventListener('focusin', focusin)
    el.addEventListener('focusout', focusout)
    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('focusin', focusin)
      el.removeEventListener('focusout', focusout)
    }
  }, [])

  const paused = hover || focusIn

  const polite = toasts.filter((t) => t.kind !== 'error')
  const assertive = toasts.filter((t) => t.kind === 'error')
  const item = (t: ToastRecord) => (
    <li key={t.id} className="io-anim-slide pointer-events-auto flex">
      <Toast toast={t} paused={paused} onDismiss={dismiss} onUndoFailed={onUndoFailed} />
    </li>
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        ref={region}
        aria-label="Notifications"
        tabIndex={-1}
        data-part="toast-region"
        className={cn(
          'pointer-events-none fixed bottom-5 left-6 flex flex-col items-start outline-none',
          LAYER.toast,
          className
        )}
      >
        <ol
          aria-live="polite"
          aria-relevant="additions"
          data-part="toast-polite"
          className="m-0 flex list-none flex-col items-start gap-2.5 p-0"
        >
          {polite.map(item)}
        </ol>
        <ol
          aria-live="assertive"
          aria-relevant="additions"
          data-part="toast-errors"
          className={cn(
            'm-0 flex list-none flex-col items-start gap-2.5 p-0',
            polite.length > 0 && assertive.length > 0 && 'mt-2.5'
          )}
        >
          {assertive.map(item)}
        </ol>
      </section>
    </ToastContext.Provider>
  )
}
