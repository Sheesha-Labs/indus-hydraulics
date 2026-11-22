'use client'

import {
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from 'react'
import Button from '../controls/Button'
import ButtonLink from '../controls/ButtonLink'
import Choices from '../controls/Choices'
import Field from '../form/Field'
import { useUndoCountdown } from '../lib/use-undo-countdown'
import { cn } from '../lib/cn'
import Menu, { type MenuEntry } from '../overlay/Menu'
import Popover from '../overlay/Popover'
import { settle } from '../overlay/result'
import { useToast } from '../overlay/ToastProvider'
import { formatLaterUntil } from './age'
import type { LaterUntil, ProposalCardProps, ProposalState, Result } from './types'

/**
 * The reject reason chips (board 103). A reason line is still required: rejections feed learned
 * preferences. TODO(S05): read the wording from settings (default, signoff awaiting).
 */
export const REJECT_REASONS = [
  { value: 'wrong-supplier', label: 'Wrong supplier' },
  { value: 'wrong-price', label: 'Wrong price' },
  { value: 'wrong-client', label: 'Wrong client' },
  { value: 'not-needed', label: 'Not needed' },
  { value: 'other', label: 'Other' },
] as const

/** Later ▾ presets, in menu order; "Pick a time…" opens an inline date-time field. */
export const LATER_PRESETS: readonly { until: Exclude<LaterUntil, Date>; label: string }[] = [
  { until: 'in-1h', label: 'In 1 hour' },
  { until: 'tomorrow-0900', label: 'Tomorrow 09:00' },
  { until: 'monday-0900', label: 'Monday 09:00' },
]

interface Shown {
  state: ProposalState
  /** Rejected: the reason. Approved: the decided note. */
  note?: string | undefined
}

/** True for the states that still take a verb. */
export function isActionable(state: ProposalState): boolean {
  return state === 'open' || state === 'collapsed'
}

/**
 * ⌘/Ctrl+↵ may approve only an actionable, unlocked, editable card. A locked level (send quotation,
 * supplier POs, payments) is approved by a click on the button and never from the keyboard (05 §7.7).
 */
export function canApproveFromKeyboard(
  card: Pick<ProposalCardProps, 'level' | 'readOnly'>,
  state: ProposalState
): boolean {
  return isActionable(state) && card.level?.locked !== true && card.readOnly !== true
}

export interface ProposalController {
  /** The state on screen: optimistic while a verb is in flight. */
  state: ProposalState
  note: string | undefined
  /** The server-owned undo window left on an approval, or null when there is none. */
  undoMs: number | null
  pending: boolean
  /** "Back in Review tomorrow at 09:00" after a successful Later. */
  laterLabel: string | null
  optionValue: string | undefined
  setOptionValue: (v: string) => void
  toggleOn: boolean
  setToggleOn: (v: boolean) => void
  chip: string | undefined
  setChip: (v: string) => void
  approve: () => void
  reject: (reason: string, chip?: string) => void
  later: (until: LaterUntil) => void
  undo: () => Promise<Result<void>>
  reopen: () => void
  expireUndo: () => void
}

/**
 * The optimistic pattern of 05 §7.3 for one proposal: useOptimistic + useTransition. Approve flips the
 * card at once; a failed result reverts it (useOptimistic falls back when the transition ends) and raises
 * an error toast; a success commits the state and, when the server returns `undoRemainingMs`, opens the
 * undo toast with that figure. Undo and Reopen are optimistic the same way. The card never sends anything
 * itself: it only calls the actions it is given. Needs a ToastProvider above it (AppShell mounts one).
 */
export function useProposalActions(card: ProposalCardProps): ProposalController {
  const { toast, dismiss } = useToast()
  const [pending, start] = useTransition()

  // The committed state follows the server's prop whenever the page re-renders with a new one.
  const [committed, setCommitted] = useState<Shown>({
    state: card.state,
    note: card.decided?.note,
  })
  const [seen, setSeen] = useState(card.state)
  if (card.state !== seen) {
    setSeen(card.state)
    setCommitted({ state: card.state, note: card.decided?.note })
  }
  const [shown, setShown] = useOptimistic(committed, (_s, next: Shown) => next)

  const [undoMs, setUndoMs] = useState<number | null>(card.decided?.undoRemainingMs ?? null)
  const [laterLabel, setLaterLabel] = useState<string | null>(null)
  const [optionValue, setOptionValue] = useState(
    card.options?.value ?? card.options?.items.find((o) => o.suggested)?.value
  )
  const [toggleOn, setToggleOn] = useState(card.toggle?.defaultOn ?? false)
  const [chip, setChip] = useState(card.reasonChips?.value)
  const undoToast = useRef<number | null>(null)

  const { actions, headline } = card

  const undo = useCallback(
    (): Promise<Result<void>> =>
      new Promise((resolve) => {
        const run = actions.undo
        if (!run) {
          resolve({ success: false, error: 'Undo is not available for this action.' })
          return
        }
        start(async () => {
          setShown({ state: 'open' })
          const res = await settle(run)
          if (res.success) {
            setCommitted({ state: 'open' })
            setUndoMs(null)
            if (undoToast.current != null) dismiss(undoToast.current)
            undoToast.current = null
          }
          resolve(res)
        })
      }),
    [actions, dismiss, setShown]
  )

  const approve = () => {
    if (!isActionable(shown.state) || card.readOnly) return
    const input = {
      ...(optionValue === undefined ? {} : { optionValue }),
      ...(card.toggle ? { toggle: toggleOn } : {}),
      ...(chip === undefined ? {} : { chip }),
    }
    start(async () => {
      setShown({ state: 'approved' })
      const res = await settle(() => actions.approve(input))
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      setCommitted({ state: 'approved' })
      const ms = res.data.undoRemainingMs
      if (ms && ms > 0 && actions.undo) {
        setUndoMs(ms)
        undoToast.current = toast({
          kind: 'success',
          title: headline,
          undo: { remainingMs: ms, onUndo: undo },
        })
      } else {
        toast({ kind: 'success', title: headline })
      }
    })
  }

  const reject = (reason: string, rejectChip?: string) => {
    const text = reason.trim()
    if (!text || !isActionable(shown.state) || card.readOnly) return
    start(async () => {
      setShown({ state: 'rejected', note: text })
      const res = await settle(() =>
        actions.reject({ reason: text, ...(rejectChip ? { chip: rejectChip } : {}) })
      )
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      setCommitted({ state: 'rejected', note: text })
    })
  }

  const reopen = () => {
    const run = actions.reopen
    if (!run || shown.state !== 'rejected' || card.readOnly) return
    start(async () => {
      setShown({ state: 'open' })
      const res = await settle(run)
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      setCommitted({ state: 'open' })
    })
  }

  const later = (until: LaterUntil) => {
    if (!isActionable(shown.state) || card.readOnly) return
    start(async () => {
      const res = await settle(() => actions.later({ until }))
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      const label = `Back in Review ${formatLaterUntil(until)}`
      setLaterLabel(label)
      toast({ kind: 'info', title: label })
    })
  }

  return {
    state: shown.state,
    note: shown.note,
    undoMs,
    pending,
    laterLabel,
    optionValue,
    setOptionValue,
    toggleOn,
    setToggleOn,
    chip,
    setChip,
    approve,
    reject,
    later,
    undo,
    reopen,
    expireUndo: () => setUndoMs(null),
  }
}

export interface ProposalActionsProps {
  card: ProposalCardProps
  controller: ProposalController
  /** Controlled Reject popover, so the card's R key can open it. */
  rejectOpen: boolean
  onRejectOpenChange: (open: boolean) => void
  className?: string
}

/**
 * The proposal's actions row (`ka-pc .a`): 12×18 under a line rule. Open: Approve (primary, lg 40;
 * compact sm 32), Edit (a link), Reject (Popover: reason chips + a required one-line reason), Later ▾
 * (Menu), the note on the right. Collapsed: the primary verb and Later only. Approved: "✓ Approved by …",
 * the note and a ghost Undo while the server's window is open. Rejected: "Rejected · reason" and Reopen.
 * Read-only (the Helper on money and quotation cards): no verbs at all.
 */
export default function ProposalActions({
  card,
  controller: c,
  rejectOpen,
  onRejectOpenChange,
  className,
}: ProposalActionsProps) {
  const size = card.compact ? 'sm' : 'lg'
  const [picking, setPicking] = useState(false)
  const row = cn(
    'border-io-line flex flex-wrap items-center gap-2 border-t px-[18px] py-3',
    className
  )
  const statusText = 'text-io-ink-3 text-[12px]'

  if (c.state === 'approved') {
    const by = card.decided?.by
    return (
      <div data-part="actions" className={row}>
        <span className="text-io-ok text-[12.5px] font-medium">
          <span aria-hidden="true">✓ </span>
          {by ? `Approved by ${by}` : 'Approved'}
        </span>
        <span className="flex-1" />
        {c.note ? <span className={statusText}>{c.note}</span> : null}
        {c.undoMs && card.actions.undo && !card.readOnly ? (
          <UndoGhost remainingMs={c.undoMs} size={size} controller={c} />
        ) : null}
      </div>
    )
  }

  if (c.state === 'rejected') {
    return (
      <div data-part="actions" className={row}>
        <span className="text-io-bad text-[12.5px] font-medium">
          Rejected{c.note ? ` · ${c.note}` : ''}
        </span>
        <span className="flex-1" />
        {card.actions.reopen && !card.readOnly ? (
          <Button variant="ghost" size={size} onClick={c.reopen}>
            Reopen
          </Button>
        ) : null}
      </div>
    )
  }

  const note = c.laterLabel ?? card.note
  if (card.readOnly) {
    if (!note) return null
    return (
      <div data-part="actions" className={row}>
        <span className="flex-1" />
        <span className={statusText}>{note}</span>
      </div>
    )
  }

  const collapsed = c.state === 'collapsed'
  const laterItems: MenuEntry[] = [
    ...LATER_PRESETS.map((p): MenuEntry => ({
      type: 'item',
      label: p.label,
      onSelect: () => c.later(p.until),
    })),
    { type: 'separator' },
    { type: 'item', label: 'Pick a time…', onSelect: () => setPicking(true) },
  ]

  return (
    <div data-part="actions" className={row}>
      <Button variant="primary" size={size} onClick={c.approve} data-verb="approve">
        {card.approveLabel ?? 'Approve'}
      </Button>
      {!collapsed && card.actions.edit ? (
        <ButtonLink href={card.actions.edit.href} size={size} data-verb="edit">
          Edit
        </ButtonLink>
      ) : null}
      {!collapsed ? (
        <RejectPopover
          size={size}
          open={rejectOpen}
          onOpenChange={onRejectOpenChange}
          onReject={c.reject}
        />
      ) : null}
      {picking ? (
        <PickTime
          onCancel={() => setPicking(false)}
          onPick={(d) => {
            setPicking(false)
            c.later(d)
          }}
        />
      ) : (
        <Menu
          width={200}
          items={laterItems}
          trigger={
            <Button
              variant={collapsed ? 'secondary' : 'ghost'}
              size={size}
              data-verb="later"
              aria-label="Later"
            >
              {/* One text run (no flex gap before the glyph); the name stays "Later". */}
              {collapsed ? 'Later' : 'Later ▾'}
            </Button>
          }
        />
      )}
      <span className="flex-1" />
      {note ? <span className={statusText}>{note}</span> : null}
    </div>
  )
}

/** Ghost Undo on an approved card while the server's window is open; gone when it closes. */
function UndoGhost({
  remainingMs,
  size,
  controller,
}: {
  remainingMs: number
  size: 'sm' | 'lg'
  controller: ProposalController
}) {
  const { toast } = useToast()
  const { label, expired } = useUndoCountdown(remainingMs, controller.expireUndo)
  if (expired) return null
  return (
    <Button
      variant="ghost"
      size={size}
      busy={controller.pending}
      onClick={async () => {
        const res = await controller.undo()
        if (!res.success) toast({ kind: 'error', title: res.error })
      }}
    >
      Undo
      {/* The countdown is read, not shown: the toast carries the visible one. */}
      <span className="sr-only"> ({label} left)</span>
    </Button>
  )
}

/** Reject ▸ Popover: optional reason chip, a required one-line reason, then Reject. */
function RejectPopover({
  size,
  open,
  onOpenChange,
  onReject,
}: {
  size: 'sm' | 'lg'
  open: boolean
  onOpenChange: (open: boolean) => void
  onReject: (reason: string, chip?: string) => void
}) {
  const [chip, setChip] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  // The reason is the Form kit's uncontrolled Field (no ActionForm: the verb is a callback, not a form
  // action), read from FormData on submit. The popover unmounts its content on close, which resets it.
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const value = new FormData(form).get('reason')
    const reason = typeof value === 'string' ? value : ''
    if (!reason.trim()) {
      setError('Add a one-line reason. It teaches the Assistant what to change.')
      // The error is the field's description, so focusing the field reads it.
      const input = form.elements.namedItem('reason')
      if (input instanceof HTMLInputElement) input.focus()
      return
    }
    onReject(reason, chip)
    onOpenChange(false)
    setChip(undefined)
    setError(null)
  }

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      title="Reject this proposal"
      width={320}
      trigger={
        <Button size={size} data-verb="reject">
          Reject
        </Button>
      }
    >
      <form
        noValidate
        onSubmit={submit}
        onChange={() => {
          if (error) setError(null)
        }}
        className="flex flex-col gap-2.5"
      >
        <Choices
          aria-label="Reason"
          size="sm"
          options={[...REJECT_REASONS]}
          value={chip ?? ''}
          onValueChange={setChip}
        />
        <Field
          type="text"
          name="reason"
          label="Why not? (one line)"
          required
          placeholder="e.g. Use the datasheet answer instead"
          {...(error ? { error } : {})}
        />
        <div className="flex justify-end">
          <Button type="submit" variant="danger" size="sm">
            Reject
          </Button>
        </div>
      </form>
    </Popover>
  )
}

/** "Pick a time…": an inline date-time field in the actions row (no nested overlay). */
function PickTime({ onPick, onCancel }: { onPick: (d: Date) => void; onCancel: () => void }) {
  const [value, setValue] = useState('')
  const input = useRef<HTMLInputElement>(null)
  // The Later menu returns focus to its trigger as it closes; take it once that has happened.
  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [])
  return (
    <form
      noValidate
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault()
        const d = new Date(value)
        if (value && !Number.isNaN(d.getTime())) onPick(d)
      }}
    >
      <input
        ref={input}
        type="datetime-local"
        aria-label="Back in Review at"
        value={value}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
        onChange={(e) => setValue(e.target.value)}
        className="h-io-btn-sm border-io-stroke rounded-io-ctl bg-io-card io-focus-field border px-2 text-[12.5px]"
      />
      <Button type="submit" size="sm" disabled={!value}>
        Set
      </Button>
      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  )
}
