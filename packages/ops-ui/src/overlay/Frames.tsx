import type { ReactNode } from 'react'
import { LabelWithCount } from '../controls/Count'
import { tabItem, tabList } from '../controls/styles'
import { cn } from '../lib/cn'
import type { MenuEntry } from './Menu'
import {
  closeButton,
  drawerBody,
  drawerFoot,
  drawerHead,
  drawerPanel,
  drawerTitle,
  menuGroup,
  menuItem,
  menuPanel,
  menuSeparator,
  menuShortcut,
  modalBody,
  modalPanel,
  modalTitle,
  popoverPanel,
  popoverTitle,
  toastAction,
  toastClose,
  tooltipBubble,
  type DrawerWidth,
  type MenuWidth,
  type ModalWidth,
  type PopoverWidth,
  type ToastKind,
} from './styles'
import { CloseIcon, Consequences, ModalSections, ToastView } from './surfaces'

// Still frames of the overlays: the same markup and recipes as the live parts, drawn in place with no
// portal, no focus trap and no behaviour. For the /_kit specimen (L1 k10), Help pages and empty-state
// pictures. Shared (no directive). Nothing in a frame is interactive except buttons the caller passes in.

const glyphClose = (
  <span aria-hidden="true" className={closeButton}>
    <CloseIcon />
  </span>
)

export interface ModalFrameProps {
  title: string
  children?: ReactNode
  consequences?: readonly string[]
  note?: ReactNode
  actions: ReactNode
  tone?: 'danger'
  width?: ModalWidth
}

/** A Modal (or ConfirmDialog) as it looks open, without the dialog behaviour. */
export function ModalFrame({
  title,
  children,
  consequences = [],
  note,
  actions,
  tone,
  width = 520,
}: ModalFrameProps) {
  return (
    <div data-frame="modal" data-tone={tone ?? 'neutral'} className={modalPanel({ width })}>
      <ModalSections
        title={<b className={modalTitle({ tone: tone ?? 'neutral' })}>{title}</b>}
        close={glyphClose}
        body={
          children != null || consequences.length > 0 ? (
            <div className={modalBody}>
              {children}
              <Consequences items={consequences} />
            </div>
          ) : null
        }
        note={note}
        actions={actions}
      />
    </div>
  )
}

export interface DrawerFrameProps {
  eyebrow?: string
  title: string
  /** Tab labels; the first is drawn active. */
  tabs?: readonly { label: string; count?: number }[]
  children: ReactNode
  footer?: ReactNode
  width?: DrawerWidth
  className?: string
}

/** A Drawer as it looks open. */
export function DrawerFrame({
  eyebrow,
  title,
  tabs,
  children,
  footer,
  width = 460,
  className,
}: DrawerFrameProps) {
  return (
    <div data-frame="drawer" className={cn(drawerPanel({ width }), className)}>
      <div className={drawerHead}>
        <div className="flex flex-1 flex-col gap-[3px]">
          {eyebrow ? <span className="io-eyebrow">{eyebrow}</span> : null}
          <b className={drawerTitle}>{title}</b>
        </div>
        {glyphClose}
      </div>
      {tabs?.length ? (
        <div className={cn(tabList({ tabsStyle: 'pane' }), 'px-3')}>
          {tabs.map((t, i) => (
            <span
              key={t.label}
              data-state={i === 0 ? 'active' : 'inactive'}
              className={cn(tabItem({ tabsStyle: 'pane' }), 'cursor-default px-2.5')}
            >
              <LabelWithCount label={t.label} count={t.count} onAccent={i === 0} />
            </span>
          ))}
        </div>
      ) : null}
      <div className={drawerBody}>{children}</div>
      {footer ? (
        <div className={drawerFoot}>
          {footer}
          <span className="flex-1" />
        </div>
      ) : null}
    </div>
  )
}

/** A toast as it looks in the region. `action` is drawn as text ("Undo", "Retry"). */
export function ToastFrame({
  kind,
  title,
  action,
}: {
  kind: ToastKind
  title: string
  action?: string
}) {
  return (
    <ToastView
      kind={kind}
      title={title}
      action={action ? <span className={toastAction}>{action}</span> : null}
      close={
        <span aria-hidden="true" className={cn(toastClose, 'cursor-default')}>
          <CloseIcon size={14} />
        </span>
      }
    />
  )
}

/** A Menu as it looks open. Entries are the live Menu's. */
export function MenuFrame({
  items,
  width = 240,
}: {
  items: readonly MenuEntry[]
  width?: MenuWidth
}) {
  return (
    <div data-frame="menu" className={menuPanel({ width })}>
      {items.map((e, i) => {
        // Entries are a fixed list; the position is the identity.
        const key = `${i}`
        if (e.type === 'separator') return <div key={key} className={menuSeparator} />
        if (e.type === 'group')
          return (
            <div key={key} className={menuGroup}>
              {e.label}
            </div>
          )
        return (
          <div
            key={key}
            {...(e.disabled ? { 'data-disabled': '', 'aria-disabled': true } : {})}
            className={cn(menuItem({ danger: e.danger ?? false }), 'cursor-default')}
          >
            <span>{e.label}</span>
            {e.shortcut ? <span className={menuShortcut}>{e.shortcut}</span> : null}
          </div>
        )
      })}
    </div>
  )
}

/** A Popover as it looks open, arrow at the top-left like a popover below its trigger. */
export function PopoverFrame({
  title,
  children,
  action,
  width = 320,
}: {
  title?: string
  children: ReactNode
  action?: string
  width?: PopoverWidth
}) {
  return (
    <div data-frame="popover" className={popoverPanel({ width })}>
      <span
        aria-hidden="true"
        className="border-io-line bg-io-card absolute -top-1.5 left-[22px] size-2.5 rotate-45 border-t border-l"
      />
      {title ? <b className={popoverTitle}>{title}</b> : null}
      {children}
      {action ? (
        <span className="text-io-accent font-medium">
          {action} <span aria-hidden="true">→</span>
        </span>
      ) : null}
    </div>
  )
}

/** A Tooltip bubble. */
export function TooltipFrame({ content }: { content: string }) {
  return (
    <span data-frame="tooltip" className={tooltipBubble}>
      {content}
    </span>
  )
}
