'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useId, type KeyboardEvent, type ReactNode } from 'react'
import type { TabItem } from '../controls/LinkTabs'
import PaneTabs from '../controls/PaneTabs'
import { cn } from '../lib/cn'
import {
  closeButton,
  drawerBody,
  drawerFoot,
  drawerHead,
  drawerPanel,
  drawerTabs,
  drawerTitle,
  LAYER,
  SCRIM,
  type DrawerWidth,
} from './styles'
import { CloseIcon } from './surfaces'

export interface DrawerTabs {
  items: TabItem[]
  value: string
  onValueChange: (key: string) => void
}

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 10.5px uppercase above the title: "Why?", "Record", "Setting". */
  eyebrow?: string
  title: string
  /** Optional PaneTabs under the head; `children` is the current tab's panel. */
  tabs?: DrawerTabs
  /** The scrolling body. DrawerSection gives the eyebrow + text blocks. */
  children: ReactNode
  /** Foot buttons, left-aligned. */
  footer?: ReactNode
  /** Default 460. */
  width?: DrawerWidth
  /**
   * true (default): a modal drawer from the right on a scrim, focus trapped (Why?, landed cost).
   * false: a docked panel (Assistant S03, Help S06) rendered where it is placed: no scrim, no trap, Tab
   * walks in and out of it like the rest of the page; Escape inside it closes it. The shell's layout slot
   * (S02) pushes the content aside for it.
   */
  modal?: boolean
  /** The control that opens a modal drawer (Dialog.Trigger asChild); focus returns here on close. */
  trigger?: ReactNode
  className?: string
}

/**
 * Overlay kit `Drawer`. Modal: Radix Dialog from the right (aria-modal, trap, Escape on the top-most
 * layer, focus back to the trigger). Docked: a complementary landmark named by its title. Slides in with
 * io-anim-slide (a fade under reduced motion). Head: eyebrow + 16/500 title + close; optional pane tabs;
 * scrolling body; foot buttons left.
 */
export default function Drawer({
  open,
  onOpenChange,
  eyebrow,
  title,
  tabs,
  children,
  footer,
  width = 460,
  modal = true,
  trigger,
  className,
}: DrawerProps) {
  const titleId = useId()
  const body = tabs ? (
    <PaneTabs
      items={tabs.items}
      value={tabs.value}
      onValueChange={tabs.onValueChange}
      aria-label={`${title} sections`}
      className={cn(
        drawerTabs,
        'flex min-h-0 flex-1 flex-col',
        '[&>[role=tabpanel]]:min-h-0 [&>[role=tabpanel]]:flex-1 [&>[role=tabpanel]]:flex-col [&>[role=tabpanel]:not([hidden])]:flex'
      )}
    >
      <div className={drawerBody}>{children}</div>
    </PaneTabs>
  ) : (
    <div className={drawerBody}>{children}</div>
  )

  const sections = (titleEl: ReactNode, closeEl: ReactNode) => (
    <>
      <div className={drawerHead}>
        <div className="flex flex-1 flex-col gap-[3px]">
          {eyebrow ? <span className="io-eyebrow">{eyebrow}</span> : null}
          {titleEl}
        </div>
        {closeEl}
      </div>
      {body}
      {footer ? (
        <div className={drawerFoot}>
          {footer}
          <span className="flex-1" />
        </div>
      ) : null}
    </>
  )
  const panelClass = cn(drawerPanel({ width }), 'io-anim-slide', className)

  if (!modal) {
    if (!open) return null
    const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
      // A Radix layer inside (a menu, a popover) handles its own Escape first and marks it handled.
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault()
        onOpenChange(false)
      }
    }
    return (
      // Escape inside the panel closes it; the landmark is not itself a control.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <aside
        aria-labelledby={titleId}
        data-modal="false"
        onKeyDown={onKeyDown}
        className={cn(panelClass, 'relative')}
      >
        {sections(
          <h2 id={titleId} className={cn('m-0', drawerTitle)}>
            {title}
          </h2>,
          <button
            type="button"
            aria-label="Close"
            className={closeButton}
            onClick={() => onOpenChange(false)}
          >
            <CloseIcon />
          </button>
        )}
      </aside>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className={cn('fixed inset-0', SCRIM, LAYER.drawer)} />
        <Dialog.Content
          aria-modal="true"
          aria-describedby={undefined}
          data-modal="true"
          className={cn(panelClass, 'fixed inset-y-0 right-0', LAYER.drawer)}
        >
          {sections(
            <Dialog.Title className={cn('m-0', drawerTitle)}>{title}</Dialog.Title>,
            <Dialog.Close aria-label="Close" className={closeButton}>
              <CloseIcon />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
