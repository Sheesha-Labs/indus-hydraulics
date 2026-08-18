import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react'
import { cn } from './lib/utils'

/**
 * The inline banner — FB-10's advisory band, generalised to five tones.
 *
 * This exists because the admin currently draws the same box eight-plus times
 * by hand (unsaved-changes notices, "this record is archived" advisories,
 * scraper failures, publish-blocked explanations), each with its own padding,
 * its own radius and its own raw `oklch()` pair. One primitive with a `tone`
 * prop is the same fix CS-8 applied to status pills: the band's geometry is
 * fixed here and a call site chooses only meaning.
 *
 * NOT a toast and NOT a dialog. A toast reports something that just finished
 * (FB-1); this reports a condition that is *true right now* and stays on the
 * page while it is. It is also not the field-error channel — FE-17 is explicit
 * that a field's error renders at the field, never in a banner.
 *
 * No `'use client'`. This is markup with no state, no effects and no handlers;
 * marking it client would turn every export in the module into a client
 * reference and any Server Component rendering one would throw at request
 * time. The `action` slot is where interactivity goes, and it arrives already
 * rendered from a caller that owns its own boundary.
 *
 * Two values the design document does not pin, resolved to the nearest
 * neighbour and recorded here:
 *
 *  - **Border opacity.** FB-10 fixes the warning band at `border-ih-warning/40`
 *    but names no value for the other tones (its `/35` is for a *different*
 *    container — the danger box on plain surface, which needs a stronger edge
 *    because it has no tint to sit on). All four tinted tones take `/40` so a
 *    row of callouts reads as one component.
 *  - **Type sizes.** FB-10 says only `text-[12px]`, which is the row-action
 *    step and too quiet for a banner that carries a heading. The title takes
 *    13px (TY-6's body step, the same as a dialog body) at `font-medium`, and
 *    the body takes 12.5px — the counts-line step — so the body sits *under*
 *    its title exactly as LT-3 sits under a table.
 *
 * Padding is FB-10's `px-3 py-2`, not CP-2's `p-3` for an "inline note": a
 * band is wider than it is tall and the symmetric 12px reads as a small card.
 *
 * Colour never carries the state (CS-9) — the title, or the body when there is
 * no title, always says in words what the tone says in hue.
 *
 * @example Title only
 *   <Callout tone="warning" icon={AlertTriangle} title="This product is archived." />
 * @example Title + body + action
 *   <Callout tone="danger" icon={XCircle} title="Import failed." action={<Button size="dense-xs">Retry</Button>}>
 *     Rows 12–18 name a category that does not exist.
 *   </Callout>
 * @example Body only
 *   <Callout tone="note">Prices are shown ex-VAT and in AED.</Callout>
 */
const calloutVariants = cva('flex items-start gap-2 rounded-md border px-3 py-2', {
  variants: {
    tone: {
      /** No semantics — a neutral aside. The default, so an unthought-through
       *  call site cannot accidentally cry wolf. */
      note: 'border-ih-border bg-ih-surface-2 text-ih-ink-2',
      /** Steel, not accent: accent-soft is the bulk-action bar's fill (LT-19)
       *  and a page should not have two different things wearing it. */
      info: 'border-ih-steel/40 bg-ih-steel-soft text-ih-info-ink',
      success: 'border-ih-success/40 bg-ih-success-soft text-ih-success-ink',
      warning: 'border-ih-warning/40 bg-ih-warning-soft text-ih-warning-ink',
      danger: 'border-ih-danger/40 bg-ih-danger-soft text-ih-danger-ink',
    },
  },
  defaultVariants: { tone: 'note' },
})

export interface CalloutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof calloutVariants> {
  /**
   * A lucide icon COMPONENT, not an element — `icon={AlertTriangle}` — so the
   * primitive pins the 14px size and 1.8 stroke rather than trusting 30 call
   * sites to. Decorative: it is hidden from assistive tech, and the sentence
   * carries the meaning.
   */
  icon?: LucideIcon
  /** ReactNode, never `string` — several banners carry an inline link or a
   *  `.mono` reference inside the heading line. */
  title?: React.ReactNode
  /** The body. Omit it for a title-only band; omit `title` for a body-only one. */
  children?: React.ReactNode
  /** Right-hand slot for one control — Retry, Dismiss, "Open settings". */
  action?: React.ReactNode
}

export function Callout({ className, tone, icon: Icon, title, action, children, ...props }: CalloutProps) {
  return (
    <div className={cn(calloutVariants({ tone }), className)} {...props}>
      {Icon ? (
        // 2px down optically centres a 14px glyph on the 17.5px first line box
        // of a 13px/1.35 title; `shrink-0` keeps it from squashing when the
        // body wraps.
        <Icon size={14} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0" />
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? <p className="text-[13px] font-medium leading-[1.35]">{title}</p> : null}
        {children ? (
          // Colour is inherited from the band, so a body-only callout and the
          // body under a title are the same ink — one tone per band.
          <div className={cn('text-[12.5px] leading-[1.5]', title && 'mt-1')}>{children}</div>
        ) : null}
      </div>
      {action ? (
        // Top-aligned, not centred: against a three-line body a vertically
        // centred button floats away from the sentence it acts on.
        <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-2">{action}</div>
      ) : null}
    </div>
  )
}

export { calloutVariants }
