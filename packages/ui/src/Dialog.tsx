'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from './lib/utils'

/**
 * Design language v2 — modal dialog.
 *
 * CLAUDE.md §10.5 requires every overlay to own its focus trap, `role`/
 * `aria-modal`, Escape handling and focus restoration. This one discharges
 * that by delegating to `@radix-ui/react-dialog`, which was already a declared
 * dependency of this package and had simply never been imported. A
 * hand-rolled trap is where accessibility regressions live — sentinel
 * ordering, restoring focus to a trigger that has since unmounted, and
 * `aria-hidden` on the rest of the tree are each easy to get subtly wrong and
 * impossible to catch without a screen reader.
 *
 * Three things worth knowing before editing:
 *
 *  - Exit animations only work because Radix's Presence keeps the node mounted
 *    until the CSS animation on `[data-state='closed']` finishes. Removing the
 *    `-out` animation does not merely drop the transition; it changes when the
 *    node unmounts. Keep both halves or neither.
 *  - `DialogContent` renders into a portal at `document.body`, which sits
 *    OUTSIDE `[data-surface='admin']`. Admin's 13px root size is scoped to that
 *    attribute (globals.css), so a portalled dialog silently reverts to the
 *    storefront's 14px. `contentClassName` therefore pins `text-[13px]` itself
 *    rather than inheriting it.
 *  - The overlay is a scroll container, not the content. A tall dialog scrolls
 *    the page behind it if the content owns the overflow.
 */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 grid place-items-start justify-items-center overflow-y-auto',
      'bg-ih-ink/25 p-4 sm:p-8',
      'data-[state=open]:animate-[ih-fade-in_120ms_ease-out]',
      'data-[state=closed]:animate-[ih-fade-out_100ms_ease-in]',
      'motion-reduce:animate-none',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Hides the built-in top-right close button. The dialog still closes on Escape. */
  hideClose?: boolean
  /** Applied to the overlay rather than the panel — use to change the backdrop. */
  overlayClassName?: string
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideClose = false, overlayClassName, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className={overlayClassName}>
      <DialogPrimitive.Content
        ref={ref}
        // Radix does NOT set aria-modal. It makes outside content inert the
        // other way the APG allows — every sibling of the portal gets
        // aria-hidden="true" while the dialog is open, verified in jsdom
        // against a real <main> behind it. That is the better-supported half of
        // the pattern, but CLAUDE.md §10.5 names the attribute, and a reviewer
        // checking the rule will look for it. Setting both is what most
        // libraries do and costs nothing.
        aria-modal="true"
        className={cn(
          // Cards are 10px in v2 (CLAUDE.md §2.3). shadow-2 is the true-overlay
          // shadow; everything resting in this language is a 1px border.
          'relative my-auto w-full max-w-lg rounded-lg border border-ih-border bg-ih-surface shadow-2',
          // See the docblock: the portal escapes [data-surface='admin'].
          'font-sans text-[13px] text-ih-ink',
          'focus:outline-none',
          'data-[state=open]:animate-[ih-dialog-in_140ms_cubic-bezier(0.32,0.72,0,1)]',
          'data-[state=closed]:animate-[ih-dialog-out_100ms_ease-in]',
          'motion-reduce:animate-none',
          className
        )}
        {...props}
      >
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close
            className={cn(
              'absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-sm',
              'text-ih-muted transition-colors hover:bg-ih-surface-2 hover:text-ih-ink',
              'outline-none focus-visible:border-ih-accent focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft'
            )}
          >
            <X size={14} strokeWidth={1.8} aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogOverlay>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-ih-border px-5 py-4 pr-12', className)}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 border-t border-ih-border px-5 py-4 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[15px] font-medium tracking-[-0.01em] text-ih-ink', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-[12.5px] leading-[1.5] text-ih-muted', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
