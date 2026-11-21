// Class recipes shared between a part's server half and its client half. Kept out of the 'use client'
// files on purpose: a value imported from a client module into a server component is a reference, not
// the value.
import { cva } from 'class-variance-authority'

/** Controls kit `kc-seg`: stroke border, radius 6, white; items divided by a line. */
export const segmentedGroup = cva(
  'border-io-stroke rounded-io-ctl bg-io-card inline-flex overflow-hidden border',
  {
    variants: { size: { md: 'text-[12.5px]', sm: 'text-[12px]' } },
    defaultVariants: { size: 'md' },
  }
)

/** `kc-seg > span`: 6×12 (sm 4×9); on = navy/white. State hangs off data-state. */
export const segmentedItem = cva(
  [
    'border-io-line io-focus inline-flex cursor-pointer items-center gap-1.5 border-r whitespace-nowrap last:border-r-0',
    'data-[state=off]:hover:bg-io-paper data-[state=on]:bg-io-navy data-[state=on]:text-white',
  ],
  {
    variants: { size: { md: 'px-3 py-1.5', sm: 'px-[9px] py-1' } },
    defaultVariants: { size: 'md' },
  }
)

/**
 * `kc-tabs`: pane (in cards and drawers) and record (under the record title). Every geometry class sits
 * in exactly one compound, so the raw strings never carry two values for the same property.
 */
export const tabList = cva('flex', {
  variants: {
    tabsStyle: { pane: '', record: '' },
    orientation: { horizontal: '', vertical: 'flex-col' },
  },
  compoundVariants: [
    { tabsStyle: 'pane', orientation: 'horizontal', class: 'border-io-line gap-0.5 border-b' },
    { tabsStyle: 'pane', orientation: 'vertical', class: 'border-io-line gap-0.5 border-l' },
    { tabsStyle: 'record', orientation: 'horizontal', class: 'gap-[22px]' },
    { tabsStyle: 'record', orientation: 'vertical', class: 'gap-1' },
  ],
  defaultVariants: { tabsStyle: 'pane', orientation: 'horizontal' },
})

/** `kc-tabs > span`: ink-3, 1.5px accent rule on the active tab. */
export const tabItem = cva(
  [
    'text-io-ink-3 hover:text-io-ink io-focus inline-flex cursor-pointer items-center gap-1.5 border-transparent whitespace-nowrap',
    'data-[state=active]:text-io-accent data-[state=active]:border-io-accent',
  ],
  {
    variants: {
      tabsStyle: { pane: 'text-[12.5px]', record: 'text-[13.5px]' },
      orientation: { horizontal: '-mb-px border-b-[1.5px]', vertical: '-ml-px border-l-[1.5px]' },
    },
    compoundVariants: [
      { tabsStyle: 'pane', orientation: 'horizontal', class: 'px-3 py-[9px]' },
      { tabsStyle: 'pane', orientation: 'vertical', class: 'px-3 py-2' },
      { tabsStyle: 'record', orientation: 'horizontal', class: 'px-0.5 py-2.5' },
      { tabsStyle: 'record', orientation: 'vertical', class: 'px-3 py-2' },
    ],
    defaultVariants: { tabsStyle: 'pane', orientation: 'horizontal' },
  }
)

/** `kc-chips`: filter pills h 32 (sm 26), px 12 (10); on = navy. */
export const choiceItem = cva(
  [
    'border-io-stroke rounded-io-pill bg-io-card io-focus inline-flex cursor-pointer items-center gap-1.5 border whitespace-nowrap',
    'data-[state=off]:hover:border-io-stroke-hover data-[state=on]:bg-io-navy data-[state=on]:border-io-navy data-[state=on]:text-white',
  ],
  {
    variants: {
      size: { md: 'h-io-btn-sm px-3 text-[12.5px]', sm: 'h-io-btn-xs px-2.5 text-[12px]' },
    },
    defaultVariants: { size: 'md' },
  }
)
