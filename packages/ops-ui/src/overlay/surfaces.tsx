import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import {
  consequenceItem,
  consequencesBox,
  modalFoot,
  modalHead,
  modalNote,
  TOAST_GLYPH,
  TOAST_KIND_LABEL,
  toastBox,
  toastGlyph,
  type ToastKind,
} from './styles'

// Shared building blocks of the Overlay kit. No hooks and no directive: the live Radix parts compose
// them inside their primitives (Dialog.Title, Dialog.Close …), and the still frames in Frames.tsx compose
// them with plain elements, so both draw the same markup from the same recipes.

/** The ✕ glyph of `ko-x` and the toast close, as an icon (decorative: the button carries the name). */
export function CloseIcon({ size = 16 }: { size?: 14 | 16 }) {
  return <X aria-hidden="true" strokeWidth={1.75} className={size === 16 ? 'size-4' : 'size-3.5'} />
}

/** `ko-cons`: what happens, as a list, always before a destructive action's buttons. */
export function Consequences({ items, label }: { items: readonly string[]; label?: string }) {
  if (items.length === 0) return null
  return (
    <ul
      className={consequencesBox}
      {...(label ? { 'aria-label': label } : {})}
      data-part="consequences"
    >
      {items.map((c) => (
        <li key={c} className={consequenceItem}>
          <span aria-hidden="true" className="text-io-ink-3">
            →
          </span>
          <span>{c}</span>
        </li>
      ))}
    </ul>
  )
}

/** Modal head (title + close), the caller's body, and the foot (note left, actions right). */
export function ModalSections({
  title,
  close,
  body,
  note,
  actions,
}: {
  title: ReactNode
  close: ReactNode
  body: ReactNode
  note?: ReactNode
  actions: ReactNode
}) {
  return (
    <>
      <div className={modalHead}>
        {title}
        {close}
      </div>
      {body}
      <div className={modalFoot}>
        {note ? <span className={modalNote}>{note}</span> : null}
        <span className="flex-1" />
        {actions}
      </div>
    </>
  )
}

/** One titled block in a drawer body (`ko-dw .bd` eyebrow + text): "Lowest landed cost" + reason. */
export function DrawerSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="io-eyebrow m-0">{heading}</h3>
      <div className="[&>p]:m-0">{children}</div>
    </section>
  )
}

/**
 * `ko-ts`: glyph, title, optional action and close. The kind is read out before the title (visually
 * hidden), so it never rests on the glyph's colour alone.
 */
export function ToastView({
  kind,
  title,
  action,
  close,
  className,
}: {
  kind: ToastKind
  title: string
  action?: ReactNode
  close?: ReactNode
  className?: string
}) {
  return (
    <div className={cn(toastBox, className)} data-kind={kind}>
      <i aria-hidden="true" className={toastGlyph({ kind })}>
        {TOAST_GLYPH[kind]}
      </i>
      <span className="min-w-0 flex-1">
        <span className="sr-only">{TOAST_KIND_LABEL[kind]} </span>
        {title}
      </span>
      {action}
      {close}
    </div>
  )
}
