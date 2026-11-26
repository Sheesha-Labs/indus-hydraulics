// Class recipes for the Overlay kit (`ko-`), shared by the live Radix parts and the still frames the
// specimen draws. Kept out of the 'use client' files: a value imported from a client module into a server
// component is a reference, not the value.
import { cva } from 'class-variance-authority'

export type ModalWidth = 480 | 520 | 560 | 720
/** 600: the Autopilot action drawer (board 99) draws a wider panel for the level cards and rules. */
export type DrawerWidth = 420 | 460 | 480 | 600
export type MenuWidth = 200 | 240 | 280
export type PopoverWidth = 280 | 320 | 360
export type ToastKind = 'success' | 'info' | 'warning' | 'error' | 'running'

/**
 * Layers (05 §1.7, ext z tokens): drawer 40, modal 50, command 60, toast 70, tooltip 80. Menus and
 * popovers open from inside drawers, modals and the command bar, so they sit on the command layer; the
 * later portal wins a tie, which is always the one opened last.
 */
export const LAYER = {
  drawer: 'z-io-drawer',
  modal: 'z-io-modal',
  float: 'z-io-command',
  toast: 'z-io-toast',
  tooltip: 'z-io-tooltip',
} as const

/**
 * `ko-scr`: the scrim. Fades in; reduced motion keeps the 100ms fade (base.css). Inside the console shell it
 * dims the page, not the sidebar, as every L3 board draws it (S01–S07): it starts at the sidebar's edge,
 * whichever width the sidebar has.
 */
export const SCRIM = [
  'bg-io-scrim data-[state=open]:animate-[io-fade_120ms_ease-out]',
  'in-[body:has([data-part=app-shell]_[data-part=sidebar])]:left-[var(--io-sidebar)]',
  'in-[body:has([data-part=app-shell]_[data-part=sidebar][data-collapsed])]:left-[var(--io-sidebar-collapsed)]',
].join(' ')

/** `ko-md`: 14px radius, e4, white. Width 480–560, default 520. */
export const modalPanel = cva(
  'bg-io-card rounded-io-dialog shadow-io-e4 text-io-ink flex max-w-full flex-col overflow-hidden text-[13px] outline-none',
  {
    variants: { width: { 480: 'w-[480px]', 520: 'w-[520px]', 560: 'w-[560px]', 720: 'w-[720px]' } },
    defaultVariants: { width: 520 },
  }
)
/** The sheet variant (boards 16, 23): eyebrow over a serif title, a ruled head, a white foot. */
export const sheetHead = 'border-io-line flex flex-col gap-1 border-b px-[26px] pt-[22px] pb-4'
export const sheetTitle = 'io-display m-0 text-[28px] leading-[1.1]'
export const sheetBody = 'text-io-ink flex flex-col gap-4 px-[26px] py-5 text-[13px] leading-[1.5]'
export const sheetFoot =
  'border-io-line flex items-center justify-between gap-2 border-t px-[26px] py-3.5'
export const modalHead = 'flex items-start gap-3 px-[22px] pt-5 pb-2'
/** 17/500; `danger` colours it bad. */
export const modalTitle = cva('flex-1 text-[17px] leading-[1.3] font-medium tracking-[-0.01em]', {
  variants: { tone: { neutral: 'text-io-ink', danger: 'text-io-bad' } },
  defaultVariants: { tone: 'neutral' },
})
export const modalBody =
  'text-io-ink-2 flex flex-col gap-3 px-[22px] pt-1 pb-[18px] text-[13px] leading-[1.55]'
export const modalFoot =
  'border-io-line bg-io-row-hover flex items-center gap-2 border-t px-[22px] py-3.5'
export const modalNote = 'text-io-ink-3 text-[12px]'

/** `ko-x`: 28px, radius 6, ink-3, fill on hover. */
export const closeButton =
  'rounded-io-ctl text-io-ink-3 hover:bg-io-fill io-focus grid size-7 flex-none cursor-pointer place-items-center'

/** `ko-cons`: paper, line, radius 8, 12.5px; "→" bullets. */
export const consequencesBox =
  'border-io-line rounded-io-8 bg-io-paper flex flex-col gap-1.5 border px-3 py-2.5 text-[12.5px]'
export const consequenceItem = 'grid grid-cols-[14px_minmax(0,1fr)] gap-2'

/** `ko-dw`: right side, e-drawer, left border. Width 420–480, default 460. */
export const drawerPanel = cva(
  'bg-io-card shadow-io-e-drawer border-io-line text-io-ink flex h-full max-w-full flex-col border-l text-[13px] outline-none',
  {
    variants: { width: { 420: 'w-[420px]', 460: 'w-[460px]', 480: 'w-[480px]', 600: 'w-[600px]' } },
    defaultVariants: { width: 460 },
  }
)
export const drawerHead = 'border-io-line flex items-start gap-2.5 border-b px-5 pt-[18px] pb-3'
/**
 * The L3 shell screens' panel head (`cv-asd .cv-hd`, boards S02a–S06a): 16px all round, items centred, so a
 * 32px head button or a status pill sits on the title's centre line.
 */
export const drawerHeadShell = 'border-io-line flex items-center gap-2.5 border-b px-5 py-4'
export const drawerTitle = 'text-[16px] leading-[1.3] font-medium tracking-[-0.01em]'
/** PaneTabs inside `ko-dw .tb`: the rule runs the drawer's width, tabs inset 12, items 9×10. */
export const drawerTabs = '[&_[role=tab]]:px-2.5 [&_[role=tablist]]:px-3'
/** The shell screens put Controls Tabs in a 12px-padded row: items 9×12, the rule inset 12 each side. */
export const drawerTabsShell = '[&_[role=tab]]:px-3 [&_[role=tablist]]:mx-3'
export const drawerBody =
  'text-io-ink-2 flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 py-4 text-[13px] leading-[1.55] [scrollbar-width:thin]'
export const drawerFoot = 'border-io-line flex gap-2 border-t px-5 py-3'

/** `ko-ts`: navy, radius 10, 13px, e-toast, max 520. */
export const toastBox =
  'rounded-io-card bg-io-navy shadow-io-e-toast inline-flex max-w-[520px] items-center gap-3 px-3.5 py-[11px] text-[13px] text-white'
/** `ko-ts i`: the 18px kind glyph. */
export const toastGlyph = cva(
  'rounded-io-pill grid size-[18px] flex-none place-items-center text-[10px] leading-none font-bold not-italic',
  {
    variants: {
      kind: {
        success: 'bg-io-ok-solid',
        info: 'bg-io-accent',
        warning: 'bg-io-warn-solid text-io-toast-warn-ink',
        error: 'bg-io-bad-solid',
        running: 'io-spin border-[1.5px] border-white border-r-transparent',
      },
    },
  }
)
export const toastAction =
  'text-io-toast-action io-focus rounded-io-tag cursor-pointer font-medium whitespace-nowrap disabled:cursor-default aria-busy:opacity-70'
export const toastClose =
  'io-focus rounded-io-tag grid flex-none cursor-pointer place-items-center opacity-60 hover:opacity-100'

/** `ko-mn`: radius 10, e3, padding 6. Width 240 by default. */
export const menuPanel = cva(
  'bg-io-card border-io-line rounded-io-card shadow-io-e3 text-io-ink flex flex-col border p-1.5 text-[13px] outline-none',
  {
    variants: { width: { 200: 'w-[200px]', 240: 'w-[240px]', 280: 'w-[280px]' } },
    defaultVariants: { width: 240 },
  }
)
/** `ko-mn .it`: 8×10, radius 6; highlighted = fill; danger bad; disabled ink-4. */
export const menuItem = cva(
  [
    'rounded-io-ctl flex cursor-pointer items-center justify-between gap-2.5 px-2.5 py-2 outline-none select-none',
    'data-[highlighted]:bg-io-fill data-[disabled]:text-io-ink-4 data-[disabled]:pointer-events-none data-[disabled]:cursor-default',
  ],
  {
    variants: { danger: { true: 'text-io-bad', false: '' } },
    defaultVariants: { danger: false },
  }
)
export const menuShortcut = 'text-io-ink-3 text-[11.5px]'
export const menuSeparator = 'bg-io-line mx-0.5 my-1 h-px'
export const menuGroup = 'io-eyebrow px-2.5 pt-2 pb-1'

/** `ko-po`: radius 10, e3, 14×16, 12.5 ink-2; title 13.5/500; action link in accent. */
export const popoverPanel = cva(
  'bg-io-card border-io-line rounded-io-card shadow-io-e3 text-io-ink-2 relative flex flex-col gap-2 border px-4 py-3.5 text-[12.5px] leading-[1.5] outline-none',
  {
    variants: { width: { 280: 'w-[280px]', 320: 'w-[320px]', 360: 'w-[360px]' } },
    defaultVariants: { width: 320 },
  }
)
export const popoverTitle = 'text-io-ink text-[13.5px] font-medium'
export const popoverAction =
  'text-io-accent hover:text-io-accent-hover io-focus rounded-io-tag cursor-pointer self-start font-medium'
/** `ko-po::before`: a 10px square turned 45°, drawn pointing down; Radix turns it for each side. */
export const popoverArrow =
  'border-io-line bg-io-card block size-2.5 -translate-y-[5px] rotate-45 border-r border-b'

/** `ko-tt`: navy, radius 6, 6×9, 12px, e-tip. */
export const tooltipBubble =
  'rounded-io-ctl bg-io-navy shadow-io-e-tip inline-block px-[9px] py-1.5 text-[12px] leading-[1.45] whitespace-nowrap text-white'

/** The kind glyph's text (`G` in the kit); running draws a ring instead. */
export const TOAST_GLYPH: Record<ToastKind, string> = {
  success: '✓',
  info: 'i',
  warning: '!',
  error: '✕',
  running: '',
}

/** Read before the title so the kind never rests on colour alone. */
export const TOAST_KIND_LABEL: Record<ToastKind, string> = {
  success: 'Done:',
  info: 'Note:',
  warning: 'Warning:',
  error: 'Error:',
  running: 'In progress:',
}
