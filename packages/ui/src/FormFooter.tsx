import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Admin design language — FE-11, the commit row that closes a form.
 *
 * About fifteen admin forms hand-roll `flex items-center justify-end gap-3`
 * with a readout span shoved left by `mr-auto`, and they disagree: the readout
 * lands at 11px, 11.5px or 12px, the gap at 2, 3 or 4, and the sticky variants
 * differ on whether anything separates the bar from the content sliding under
 * it. This takes that decision once. FE-11's geometry is the contract: 12px
 * gap between controls, the readout at 12px `text-ih-muted` (TY-6's
 * dirty-state row), and the primary submit last so it is the rightmost thing
 * on the page exactly as it is the rightmost thing in the topbar (NAV-10).
 *
 * NOT a client component, deliberately. This is markup with no state, effect
 * or handler of its own — the pending/dirty logic and the `<form>` binding
 * belong to the page that owns them (FE-11 wires Save with
 * `disabled={pending || !isDirty}`, FE-12 wires publish with `form=`+`name`).
 * A `'use client'` here would turn every export of this module into a client
 * reference, and a Server Component rendering one throws at request time.
 * That outage has already happened once in this admin.
 *
 * The buttons are NOT hard-coded. The label conjugates per form — "Save
 * product", "Create user", "Send estimate" — and the number of controls varies
 * (Cancel + Save, Save alone, Discard + Save draft + Publish). Callers pass
 * `<Button>`s as children; this owns only the row.
 *
 * `sticky` pins the row to the bottom of the scroller for a form long enough
 * that the submit would otherwise sit below the fold. FE-11's snippet reads
 * `sticky bottom-0 bg-ih-bg pt-3 pb-2`; the border-t and the `bg-ih-surface`
 * fill here are a deliberate addition, because a bar in the page-ground colour
 * with no rule has nothing to say where the scrolling content ends and the
 * pinned chrome begins — it reads as the bottom of the last card. `bg-ih-bg`
 * would also go visually transparent the moment a card scrolled behind it at
 * the same value. Surface + a 1px seam is CP-1's border-only elevation, which
 * is how this admin expresses layering everywhere else. Sticky save bars are
 * always at the BOTTOM (FE-11) — never a top-pinned action bar, which is
 * LT-19's job and would fight it for the same z-space.
 *
 * No z-index: as the last child of the body stack the row already paints over
 * its non-positioned siblings, and an unnecessary stacking context here is
 * precisely what PF-4 warns a sticky bulk bar then has to fight.
 */
const formFooterVariants = cva('flex items-center justify-end gap-3', {
  variants: {
    sticky: {
      true: 'sticky bottom-0 border-t border-ih-border bg-ih-surface pt-3 pb-2',
      false: '',
    },
  },
  defaultVariants: { sticky: false },
})

export interface FormFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFooterVariants> {
  /**
   * The left-hand readout — dirty state, last-saved time, the record
   * reference. Typography is applied here so fifteen forms cannot each pick a
   * size; pass the nodes, not the classes.
   */
  status?: React.ReactNode
  /** The commit controls, primary last. */
  children: React.ReactNode
}

export function FormFooter({ className, status, sticky, children, ...props }: FormFooterProps) {
  return (
    <div className={cn(formFooterVariants({ sticky }), className)} {...props}>
      {status ? (
        // `min-w-0` is load-bearing: without it a long readout ("Editing
        // RFQ-2026-0417 · unsaved changes") refuses to shrink and pushes the
        // submit button off the right edge of a capped form body.
        <span className="mr-auto min-w-0 text-[12px] text-ih-muted">{status}</span>
      ) : null}
      {children}
    </div>
  )
}

export { formFooterVariants }
