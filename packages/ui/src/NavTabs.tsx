import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './lib/utils'

/**
 * Design language v2 — the URL-driven tab bar (LT-16 a/b/c, LT-16a, CT-9).
 *
 * At least nine of these are hand-rolled across the admin in three mutually
 * incompatible treatments. The three the document actually sanctions are
 * variants of ONE thing — same items, same URL contract, same semantics; the
 * only difference is how the selected item is painted. So this is one
 * component with a `variant` prop rather than three exports: the shape is
 * chosen by CARDINALITY (LT-16 — underline for a status partition, chip for
 * scopes, tray for a 2–5-way view switch), which is a property that changes
 * as a list grows. With three components that change is a rewrite of the call
 * site; here it is one word, and the semantics and the count-chip pairing
 * cannot drift apart between the three because there is one of each.
 *
 * NO 'use client'. This renders markup and nothing else — no state, no
 * effects, no handlers. A client module's exports become client references,
 * and a Server Component calling one throws at request time; every admin list
 * page that renders this bar is a Server Component. That is also why there is
 * no `linkComponent` prop: a component is a function, functions do not cross
 * the RSC boundary, and a prop that works today only because this file has no
 * 'use client' is an invariant nobody will remember. Plain `<a>` costs a
 * document load instead of a soft navigation; a call site that genuinely
 * needs `next/link` prefetch builds its own anchors with the exported
 * `navTabItemVariants` / `navTabCountVariants` / `navTabsVariants` helpers and
 * still lands on identical classes.
 *
 * SEMANTICS: role="tablist" / role="tab" / aria-selected, per LT-16a and
 * A11Y-4, which reject `aria-current="page"` explicitly — these tabs partition
 * ONE page's list, so "this tab is selected" is the true statement and "this
 * is the current page" is not. The `href` still carries real link behaviour
 * (middle-click, copy-link, the back button), which is the whole point of
 * putting filter state in the URL. No `aria-controls`: the panel is the
 * server-rendered page body, not a node in this subtree, so pointing at an id
 * that does not exist would be worse than omitting it. No roving tabindex
 * either — each item is a real link and therefore a real tab stop, and the
 * APG arrow-key pattern would need client state and would REMOVE tab stops
 * from navigational links.
 *
 * Values not fixed by the document, chosen from the nearest primitive:
 *   - Focus takes FE-7's 3px accent-soft halo but not its `border-ih-accent`
 *     half — these items have no border to colour, and recolouring the
 *     underline variant's 2px rule would make a focused tab look selected.
 *   - LT-16(c) specifies no count chip for the chip row. It gets the tray's
 *     pairing (both are navy-active) at the 11px "tab count chip" step from
 *     the type scale rather than the tray's 10.5px, because the chip label is
 *     13px, not 12px.
 *   - `font-mono tabular-nums` rather than the `.mono` class (TY-4): `.mono`
 *     lives in the app's globals.css, and every primitive in this package
 *     (Table, Badge, Surface) writes the utility. `tabular-nums` reproduces
 *     the one thing `.mono` adds beyond the family, and counts are the case
 *     that needs it — the chip must not resize between 9 and 10.
 */

export type NavTabsVariant = 'underline' | 'chip' | 'tray'

const navTabsVariants = cva('', {
  variants: {
    variant: {
      /** Status partition of one list. Spacing is the nav's gap, never item padding. */
      underline: 'flex gap-5 border-b border-ih-border',
      /** Scopes. No border, no mono, no uppercase. */
      chip: 'flex gap-1',
      /** 2–5-way view switch. The tray sits on `bg` so its items can rise to `surface`-dark. */
      tray: 'inline-flex rounded-md border border-ih-border bg-ih-bg p-0.5',
    },
  },
  defaultVariants: { variant: 'underline' },
})

const navTabItemVariants = cva(
  cn(
    'inline-flex items-center whitespace-nowrap transition-colors',
    'outline-none focus-visible:ring-[3px] focus-visible:ring-ih-accent-soft'
  ),
  {
    variants: {
      variant: {
        underline: 'gap-2 -mb-px border-b-2 py-3 text-[13.5px]',
        chip: 'h-8 gap-1.5 rounded-md px-3 text-[13px]',
        tray: 'h-7 gap-1.5 rounded-sm px-2.5 text-[12px]',
      },
      active: { true: '', false: '' },
    },
    compoundVariants: [
      // The active underline label takes ACCENT, not ink (LT-16a): with ink the
      // only selected signal is a 2px rule, which is invisible at a glance.
      { variant: 'underline', active: true, class: 'border-ih-accent text-ih-accent' },
      { variant: 'underline', active: false, class: 'border-transparent text-ih-muted hover:text-ih-ink-2' },
      // Navy is the nav-active fill (CS-4) — chip and tray are nav, not signal.
      { variant: 'chip', active: true, class: 'bg-ih-navy text-ih-bg' },
      { variant: 'chip', active: false, class: 'text-ih-ink-2 hover:bg-ih-surface-2' },
      { variant: 'tray', active: true, class: 'bg-ih-navy font-medium text-ih-bg' },
      { variant: 'tray', active: false, class: 'text-ih-ink-2 hover:text-ih-ink' },
    ],
    defaultVariants: { variant: 'underline', active: false },
  }
)

const navTabCountVariants = cva('font-mono tabular-nums', {
  variants: {
    variant: {
      underline: 'rounded-sm px-1.5 text-[11px]',
      chip: 'text-[11px]',
      tray: 'text-[10.5px]',
    },
    active: { true: '', false: '' },
  },
  compoundVariants: [
    // Only the underline count is a filled chip — the other two sit inside a
    // fill already, and a chip inside a chip reads as two states.
    { variant: 'underline', active: true, class: 'bg-ih-accent text-ih-accent-fg' },
    { variant: 'underline', active: false, class: 'bg-ih-surface-2 text-ih-muted' },
    { variant: 'chip', active: true, class: 'text-ih-bg/80' },
    { variant: 'chip', active: false, class: 'text-ih-muted' },
    { variant: 'tray', active: true, class: 'text-ih-bg/80' },
    { variant: 'tray', active: false, class: 'text-ih-muted' },
  ],
  defaultVariants: { variant: 'underline', active: false },
})

export interface NavTabItem {
  /** Must be `/admin`-prefixed and must carry the filter in the URL (LT-16). */
  href: string
  label: React.ReactNode
  /** Rendered as a chip, never concatenated into the label string. 0 renders. */
  count?: number
  /**
   * Derived from the pathname + searchParams on the server, never from React
   * state — client state breaks deep links, the back button and first paint.
   */
  active: boolean
}

export interface NavTabsProps {
  items: readonly NavTabItem[]
  variant?: NavTabsVariant
  /**
   * Accessible name for the tablist. Required: a page routinely carries two of
   * these (a status partition and a view switch) and an unnamed one announces
   * as a bare "tab list".
   */
  label: string
  className?: string
}

export function NavTabs({ items, variant = 'underline', label, className }: NavTabsProps) {
  return (
    <nav role="tablist" aria-label={label} className={cn(navTabsVariants({ variant }), className)}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          role="tab"
          aria-selected={item.active}
          className={navTabItemVariants({ variant, active: item.active })}
        >
          {item.label}
          {item.count !== undefined ? (
            <span className={navTabCountVariants({ variant, active: item.active })}>{item.count}</span>
          ) : null}
        </a>
      ))}
    </nav>
  )
}

export { navTabsVariants, navTabItemVariants, navTabCountVariants }
