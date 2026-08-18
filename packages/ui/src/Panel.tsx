import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * The admin card — docs/admin-design-language.md §5 (CP-1 · CP-2 · CP-3).
 *
 * NAMED `Panel`, not `Card`, because `Surface.tsx` already exports a `Card`:
 * the storefront's v2 card, which offers the `raised` shadow this one bans and
 * is used by /design and the admin dashboard. Two components exporting `Card`
 * through one barrel is a duplicate-export error, and renaming the storefront's
 * would be a storefront change nobody asked for. The intended end state is
 * still one card — retire `Surface`'s onto this when the dashboard moves in
 * Unit 8 — but that is a separate change with its own call sites.
 *
 * WHY THIS FILE EXISTS RATHER THAN A WRAPPER OVER `Surface.tsx`'s `Card`.
 * The audit found nine competing card treatments in the admin and the point of
 * this unit is to end with one, so reusing the existing `Card` was the first
 * thing tried. It does not survive three of CP-1's own rules:
 *
 *  1. `Surface.tsx` is `'use client'`. A card is markup — it has no state, no
 *     effect and no handler — and every export of a client module becomes a
 *     client reference. Delegating would put the whole admin's card layer
 *     behind a client boundary for nothing.
 *  2. It offers `raised`, a shadow. CP-1 is absolute: no shadow, ever, on a
 *     card. Admin elevation is border-only; `--shadow-2` is reserved for true
 *     overlays (CT-13). A wrapper cannot un-offer a prop on the thing it wraps.
 *  3. It is a `<div>` and nothing else. CP-3 and LT-20's clickable card must
 *     BE the `<a>` — a card that navigates and is not itself the link is a
 *     mouse target with no keyboard route into it. That needs a class string,
 *     not a component, which is why `panelVariants` is exported alongside.
 *
 * `Surface.tsx`'s `Card` is the storefront v2 card and should be retired onto
 * this one; that is a follow-up for whoever owns Surface, since this unit may
 * not edit it. **Until then the two collide**: both export `Card`, so the
 * barrel must re-export this one explicitly rather than star-export both.
 *
 * Deliberately no `'use client'`.
 */

const panelVariants = cva(
  // CP-1's string, in CP-1's order. Order is not cosmetic here — the document
  // asks for one written form so a grep for the card can be a literal one.
  'bg-ih-surface border border-ih-border rounded-lg',
  {
    variants: {
      /**
       * CP-2 maps a ROLE to a padding, never a size to a padding — the box is
       * padded by how much it holds. `p-8` is not on the ladder and there is
       * deliberately no way to reach it through this prop.
       */
      padding: {
        /** Form / section card. Internal stack `gap-5` (FE-3). */
        form: 'p-6',
        /** Right rail (CP-7), KPI tile (CP-5), stat card. Internal `gap-4`. */
        rail: 'p-5',
        /** List-row card, grid tile (LT-20). Internal `gap-1.5`–`gap-2`. */
        compact: 'p-4',
        /** Inline note / callout. */
        dense: 'p-3',
        /** Non-table empty state (FB-11) — 48px and centred, per CP-2. */
        empty: 'p-12 text-center',
        /**
         * Not a CP-2 role. It is the table shell (LT-5) and the divided list
         * (LT-20), where the rows own the padding and a card padding would
         * inset the hairlines off the card edge. Those two call sites add
         * `overflow-hidden` themselves — see the note below.
         */
        none: 'p-0',
      },
      /**
       * CP-3: a clickable card's affordance is a border darken, never a shadow
       * and never a fill. The admin has almost no shadows, so hover-raise has
       * to be spoken in the one line weight the page already owns.
       */
      hover: {
        none: '',
        strong: 'transition-[border-color] duration-150 ease-[ease] hover:border-ih-border-strong',
        accent: 'transition-[border-color] duration-150 ease-[ease] hover:border-ih-accent',
      },
    },
    defaultVariants: { padding: 'form', hover: 'none' },
  }
)

export interface PanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof panelVariants>, 'padding'> {
  /** Clickable card: CP-3's border darken on hover. */
  interactive?: boolean
  /** An "add a new X" tile. Accent hover, and implies `interactive`. */
  create?: boolean
}

/**
 * Overflow is deliberately not set. `Surface.tsx`'s card pins
 * `overflow-hidden`, which silently disables `position: sticky` on every
 * descendant — the same failure PF-10 calls out for `items-start`, and one a
 * screenshot cannot show. The two call sites that genuinely clip to the radius
 * (table shell, divided list) say `overflow-hidden` at the call site.
 *
 * `transition-[border-color]` rather than CP-3's shorthand `transition-colors`
 * for the same reason `Button.tsx` names its properties: `transition-colors`
 * also animates `color`, so a card whose title goes accent on hover would
 * inherit a fade nobody asked for. 150ms/`ease` is the house hover curve.
 */
export function Panel({ className, padding, interactive, create, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        panelVariants({ padding, hover: create ? 'accent' : interactive ? 'strong' : 'none' }),
        className
      )}
      {...props}
    />
  )
}

export { panelVariants }
