'use client'

import * as RadixPopover from '@radix-ui/react-popover'
import type { Route } from 'next'
import Link from 'next/link'
import { useId, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import type { LinkSpec } from '../types'
import {
  LAYER,
  popoverAction,
  popoverArrow,
  popoverPanel,
  popoverTitle,
  type PopoverWidth,
} from './styles'

export type PopoverAction = LinkSpec | { label: string; onClick: () => void }

export interface PopoverProps {
  /** The control that opens it (Popover.Trigger asChild). It must have a name of its own. */
  trigger: ReactNode
  title?: string
  children: ReactNode
  /** "Open landed-cost breakdown →": a link, or a button that also closes the popover. */
  action?: PopoverAction
  /** Default 320. */
  width?: PopoverWidth
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  /** Controlled use (e.g. BannerSlot's "+n more"); omit both for a self-managed popover. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

/**
 * Overlay kit `Popover` on Radix Popover: collision-aware, outside click and Escape close, focus moves in
 * on open and back to the trigger on close. Title 13.5/500, 12.5 ink-2 body, an action link "… →" and a
 * 10px arrow. Named by its title when it has one.
 */
export default function Popover({
  trigger,
  title,
  children,
  action,
  width = 320,
  side = 'bottom',
  align = 'start',
  open,
  onOpenChange,
  className,
}: PopoverProps) {
  const titleId = useId()
  return (
    <RadixPopover.Root
      {...(open === undefined ? {} : { open })}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side={side}
          align={align}
          sideOffset={8}
          alignOffset={-6}
          collisionPadding={12}
          {...(title ? { 'aria-labelledby': titleId } : {})}
          className={cn(popoverPanel({ width }), LAYER.float, className)}
        >
          {title ? (
            <b id={titleId} className={popoverTitle}>
              {title}
            </b>
          ) : null}
          {children}
          {action ? <ActionLink action={action} /> : null}
          <RadixPopover.Arrow asChild width={10} height={5}>
            <span className={popoverArrow} />
          </RadixPopover.Arrow>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}

function ActionLink({ action }: { action: PopoverAction }) {
  const label = (
    <>
      {action.label} <span aria-hidden="true">→</span>
    </>
  )
  if ('href' in action)
    return (
      <Link
        href={action.href as Route}
        className={popoverAction}
        {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {label}
      </Link>
    )
  return (
    <RadixPopover.Close asChild>
      <button type="button" className={cn(popoverAction, 'text-left')} onClick={action.onClick}>
        {label}
      </button>
    </RadixPopover.Close>
  )
}
