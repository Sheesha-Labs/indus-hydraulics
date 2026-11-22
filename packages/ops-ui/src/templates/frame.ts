// Shared layout classes for the console templates (05 §5). Layout only: flex and grid tracks, gaps, the
// page gutter and min-h-0 scroll regions. The only colours are the two grounds (bg-io-card panes on
// bg-io-paper), and there are no type styles: every slot brings its own kit parts.

/**
 * A template fills the main column at the viewport's height so its regions scroll on their own (05 §5:
 * "100vh, min-h-0 children scroll independently"). The header stays put; the body region scrolls.
 */
export const TEMPLATE_ROOT = 'flex h-screen min-h-0 min-w-0 flex-col overflow-hidden'

/** The fixed top of a template: page or record header, strip, banner. */
export const TEMPLATE_TOP = 'flex flex-none flex-col'

/**
 * The reference's `.cv-body`: 16px above and below, the 28px page gutter, 16px between columns. A grid,
 * so every template states its tracks with the width tokens (`--io-w-*`).
 */
export const TEMPLATE_BODY =
  'grid min-h-0 flex-1 content-start items-start gap-4 overflow-y-auto px-io-page-x py-4'

/** The reference's `.cv-col`: a column of kit mounts 14px apart. */
export const TEMPLATE_COLUMN = 'flex min-w-0 flex-col gap-3.5'
