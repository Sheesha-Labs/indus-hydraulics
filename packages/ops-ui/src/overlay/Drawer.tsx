'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useId, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import type { TabItem } from '../controls/LinkTabs'
import PaneTabs from '../controls/PaneTabs'
import { cn } from '../lib/cn'
import {
  closeButton,
  drawerBody,
  drawerFoot,
  drawerHead,
  drawerHeadShell,
  drawerPanel,
  drawerTabs,
  drawerTabsShell,
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
  /** Before the title on its line, e.g. the Assistant Tag of the docked Assistant panel (S03a). */
  lead?: ReactNode
  title: string
  /** Head controls between the title and the close button ("Mark all read", a status chip). */
  actions?: ReactNode
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
  /**
   * Where focus goes when a modal drawer without a `trigger` closes (one opened by a route, a shortcut or
   * another surface). Without either, Radix sends focus nowhere. Docked panels restore focus themselves.
   */
  returnFocusRef?: RefObject<HTMLElement | null>
  /**
   * 'kit' (default): the Overlay kit sheet's drawer (`ko-dw`: head 18/12 top-aligned, pane tabs 9×10 with the
   * rule the full width). 'shell': the panels the L3 shell screens draw (`cv-asd`, S02a–S06a: head 16 all
   * round with its items centred, Controls Tabs 9×12 with the rule inset 12). Console surfaces use 'shell'.
   */
  variant?: 'kit' | 'shell'
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
  lead,
  title,
  actions,
  tabs,
  children,
  footer,
  width = 460,
  modal = true,
  trigger,
  returnFocusRef,
  variant = 'kit',
  className,
}: DrawerProps) {
  const shell = variant === 'shell'
  const titleId = useId()
  const body = tabs ? (
    <PaneTabs
      items={tabs.items}
      value={tabs.value}
      onValueChange={tabs.onValueChange}
      aria-label={`${title} sections`}
      className={cn(
        shell ? drawerTabsShell : drawerTabs,
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
      <div className={shell ? drawerHeadShell : drawerHead}>
        {lead ? <div className="flex flex-none items-center">{lead}</div> : null}
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          {/* 10.5px at Geist's normal line (14), as both sheets set it (`.ey`, `.cv-ey`), not the body's 1.45. */}
          {eyebrow ? <span className="io-eyebrow leading-[14px]">{eyebrow}</span> : null}
          {titleEl}
        </div>
        {actions ? <div className="flex flex-none items-center gap-2">{actions}</div> : null}
        {closeEl}
      </div>
      {body}
      {footer ? (
        // Left-aligned by default; a footer that wants a right-hand button puts its own flex-1 spacer in.
        <div className={drawerFoot}>{footer}</div>
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
          {...(trigger || !returnFocusRef
            ? {}
            : {
                onCloseAutoFocus: (e: Event) => {
                  const el = returnFocusRef.current
                  if (el?.isConnected) {
                    e.preventDefault()
                    el.focus()
                  }
                },
              })}
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
