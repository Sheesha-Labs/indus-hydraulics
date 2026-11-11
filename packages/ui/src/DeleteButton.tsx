'use client'

import * as React from 'react'
import { Trash2 } from 'lucide-react'
import { cn } from './lib/utils'

/**
 * The admin's delete / remove trigger: a trash icon, not the word "Delete".
 *
 * Row actions used to be a mono "Delete" string, which read as a label rather
 * than a control and sat at the same weight as the data beside it. The icon is
 * neutral at rest and turns danger on hover, so a column of them does not
 * shout; the weight belongs on the confirmation that follows.
 *
 * `label` is required. It is the accessible name (an icon has none of its
 * own) and the hover tooltip, so write what it deletes — "Delete template
 * Axial Piston Pump", not "Delete". Pass `title` to give the tooltip a
 * different text, e.g. why the button is disabled.
 *
 * `showLabel` puts the label beside the icon. Use it for page-level actions
 * that stand alone among labelled buttons (delete this product); keep row and
 * list-item actions icon-only.
 */
export interface DeleteButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  label: string
  /** Swaps the icon for a spinner and disables the button. */
  pending?: boolean
  /** `sm` 28px for dense rows, `md` 32px (default). */
  size?: 'sm' | 'md'
  showLabel?: boolean
}

const Spinner = ({ className }: { className: string }) => (
  <svg className={cn('animate-spin motion-reduce:animate-none', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
)

const DeleteButton = React.forwardRef<HTMLButtonElement, DeleteButtonProps>(function DeleteButton(
  { label, pending = false, size = 'md', showLabel = false, className, title, disabled, type = 'button', ...props },
  ref
) {
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md text-ih-muted',
        'transition-[background-color,color] duration-150 ease-[ease]',
        'hover:bg-ih-danger-soft hover:text-ih-danger-ink',
        'outline-none focus-visible:text-ih-danger-ink focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft',
        'disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ih-muted',
        size === 'sm' ? 'h-7' : 'h-8',
        showLabel ? 'px-2.5 text-[12.5px] font-medium' : size === 'sm' ? 'w-7' : 'w-8',
        className
      )}
      {...props}
    >
      {pending ? <Spinner className={iconClass} /> : <Trash2 className={iconClass} strokeWidth={1.75} aria-hidden="true" />}
      {showLabel ? <span aria-hidden="true">{label}</span> : null}
    </button>
  )
})

export { DeleteButton }
