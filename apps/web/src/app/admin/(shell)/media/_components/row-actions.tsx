'use client'

import { useState, useTransition } from 'react'
import { Info, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { canTrash, deriveMediaState, summariseUsage } from '@indus/domain'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Tooltip,
  cn,
  useToast,
} from '@indus/ui'

import { deleteMediaPermanently, restoreMedia, trashMedia } from '../actions'
import type { MediaDetail } from './types'

/**
 * Per-file actions.
 *
 * The delete affordance is deliberately loud on hover and quiet at rest. These
 * sit in a dense grid of 48 cards; a permanently red row of bins would read as
 * a page full of errors, and a control that only announces itself when the
 * pointer is on it is both calmer and clearer about what is about to happen.
 */

/**
 * Red text, red wash, a 1px ring and a soft 4px glow, as one string.
 *
 * Kept together so nothing can put a second `hover:text-*` on the same element
 * — with two, CSS source order decides, not JSX order, and the button silently
 * loses its danger colour. There is a test asserting the neutral hover is not
 * also present.
 */
const DANGER_HOVER = cn(
  'hover:bg-ih-danger-soft hover:text-ih-danger',
  'hover:ring-1 hover:ring-ih-danger/40',
  'hover:shadow-[0_0_0_4px_var(--color-ih-danger-soft)]'
)

const NEUTRAL_HOVER = 'hover:bg-ih-surface-2 hover:text-ih-ink'

function IconButton({
  label,
  hint,
  icon,
  onClick,
  disabled = false,
  danger = false,
  pending = false,
}: {
  /** Accessible name. Stays constant so the control does not rename itself. */
  label: string
  /** Why it is disabled, or what it does. Delivered by tooltip. */
  hint?: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  pending?: boolean
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      aria-label={label}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-sm text-ih-muted transition-all',
        'outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft',
        !disabled && !pending && (danger ? DANGER_HOVER : NEUTRAL_HOVER),
        (disabled || pending) && 'opacity-40'
      )}
    >
      {pending ? <Loader2 size={13} className="animate-spin motion-reduce:animate-none" /> : icon}
    </button>
  )

  // A disabled button gets `pointer-events-none`, which swallows its own
  // title — so the explanation has to hang on a wrapper that is not disabled.
  // This is the whole reason Tooltip has a `disabledChild` prop.
  if (disabled && hint) {
    return (
      <Tooltip label={hint} disabledChild>
        {button}
      </Tooltip>
    )
  }
  return hint ? <Tooltip label={hint}>{button}</Tooltip> : button
}

export function MediaRowActions({
  detail,
  indexPartial,
  canWrite,
  canDestroy,
  trashed,
  onOpenDetail,
  onChanged,
}: {
  detail: MediaDetail
  indexPartial: boolean
  canWrite: boolean
  canDestroy: boolean
  trashed: boolean
  onOpenDetail: () => void
  onChanged: () => void
}) {
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  const decision = canTrash({
    state: deriveMediaState(detail.usages),
    indexPartial,
    usages: detail.usages,
  })

  function run(fn: () => Promise<{ success: boolean; message?: string }>, success: string) {
    startTransition(async () => {
      const res = await fn()
      if (!res.success) {
        toast({ title: 'That did not work.', description: res.message, tone: 'danger' })
        return
      }
      toast({ title: success, tone: 'success' })
      onChanged()
    })
  }

  return (
    <span className="flex items-center gap-1">
      <IconButton
        label="Where is this used?"
        hint="Where is this used?"
        icon={<Info size={13} strokeWidth={1.7} />}
        onClick={onOpenDetail}
      />

      {trashed ? (
        <>
          {canWrite ? (
            <IconButton
              label="Restore"
              hint="Put this back in the library"
              icon={<RotateCcw size={13} strokeWidth={1.7} />}
              pending={pending}
              onClick={() => run(() => restoreMedia({ id: detail.id }), 'Restored.')}
            />
          ) : null}
          {canDestroy ? (
            <IconButton
              label="Delete permanently"
              hint="Delete permanently — this cannot be undone"
              icon={<Trash2 size={13} strokeWidth={1.7} />}
              danger
              pending={pending}
              onClick={() => setConfirming(true)}
            />
          ) : null}
        </>
      ) : canWrite ? (
        <IconButton
          label="Move to trash"
          // The button is disabled, so this line is the only explanation the
          // operator gets. It names what is holding the file.
          hint={decision.allowed ? 'Move to trash' : (decision.reason ?? 'In use')}
          icon={<Trash2 size={13} strokeWidth={1.7} />}
          danger
          disabled={!decision.allowed}
          pending={pending}
          onClick={() => run(() => trashMedia({ id: detail.id }), 'Moved to trash.')}
        />
      ) : null}

      <Dialog open={confirming} onOpenChange={setConfirming}>
        {confirming ? (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete this file permanently?</DialogTitle>
              <DialogDescription>This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-2 text-[13px] text-ih-ink-2">
              <p className="font-mono text-[12px] break-all">{detail.originalFilename}</p>
              <p>
                The file is removed from storage and its record is deleted. Nothing currently
                references it — {summariseUsage(detail.usages).toLowerCase()}.
              </p>
            </DialogBody>
            <DialogFooter>
              <Button kind="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
                Cancel
              </Button>
              <Button
                kind="primary"
                size="sm"
                loading={pending}
                className="bg-ih-danger hover:bg-ih-danger"
                onClick={() => {
                  setConfirming(false)
                  run(() => deleteMediaPermanently({ id: detail.id }), 'Deleted permanently.')
                }}
              >
                Delete permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </span>
  )
}

/**
 * The bulk bar. Appears only with a selection, so the toolbar does not occupy
 * space describing something that is not happening.
 */
export function MediaBulkBar({
  selectedCount,
  eligibleCount,
  pending,
  onClear,
  onTrash,
}: {
  selectedCount: number
  /** How many of the selection are actually deletable. */
  eligibleCount: number
  pending: boolean
  onClear: () => void
  onTrash: () => void
}) {
  if (selectedCount === 0) return null
  const blocked = selectedCount - eligibleCount

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-ih-accent bg-ih-accent-soft px-3 py-2 text-[12.5px]">
      <span className="font-medium text-ih-accent">
        <span className="tabular-nums">{selectedCount}</span> selected
      </span>
      {blocked > 0 ? (
        // Said before the click, not after — a bulk action that silently does
        // less than asked is worse than one that says so up front.
        <span className="text-ih-ink-2">
          <span className="tabular-nums">{blocked}</span> still in use and will be skipped
        </span>
      ) : null}
      <div className="ml-auto flex items-center gap-2">
        <Button kind="ghost" size="sm" onClick={onClear} disabled={pending}>
          Clear
        </Button>
        <Button
          kind="outline"
          size="sm"
          onClick={onTrash}
          loading={pending}
          disabled={eligibleCount === 0}
          icon={<Trash2 size={13} strokeWidth={1.7} />}
        >
          Move {eligibleCount === selectedCount ? '' : `${eligibleCount} `}to trash
        </Button>
      </div>
    </div>
  )
}
