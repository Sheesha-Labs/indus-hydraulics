/**
 * The v2 palette as sRGB hex.
 *
 * The design contract is OKLCH and `01-design-language.md` §2 says to port it
 * verbatim and never convert to hex. That rule is for the CSS token layer,
 * where a modern browser resolves OKLCH itself.
 *
 * It cannot hold for the two surfaces that leave the browser:
 *
 *  - EMAIL. No mail client parses `oklch()`. Outlook renders through Word,
 *    Gmail rewrites what it does not recognise, and an unparsed colour is not
 *    a graceful fallback — it is a missing declaration, so the element takes
 *    whatever it inherits. A quote email is not a place to find out.
 *  - PDF. @react-pdf/renderer resolves colours itself and does not implement
 *    OKLCH either.
 *
 * So these are conversions, not approximations: each value was resolved
 * through the browser's own colour pipeline (canvas 2D fillStyle, which
 * performs the same OKLCH→sRGB transform the storefront gets) rather than
 * eyeballed or picked from a nearby brand blue.
 *
 * KEEP IN SYNC with the @theme block in apps/web/src/app/globals.css. If a
 * token changes there, re-derive here — do not hand-edit toward something
 * that looks close.
 */
export const BRAND = {
  /** page ground — cool paper */
  bg: '#f5f7fa',
  /** cards, table bodies */
  surface: '#ffffff',
  /** inset panels, hover rows, zebra striping */
  surface2: '#edf0f4',
  surface3: '#e3e8ed',
  /** the hairline — does the separating work */
  border: '#dbdfe4',
  borderStrong: '#bec5cc',

  /** headings, primary text — blue-black, never neutral grey */
  ink: '#10151c',
  /** body copy */
  ink2: '#30363e',
  /** secondary text, eyebrows */
  muted: '#6d7279',
  /** tertiary — non-essential only, fails AA at body size */
  muted2: '#959aa1',

  /** chrome, footers, dark bands */
  navy: '#122942',
  navy2: '#223d5b',
  /** THE signal — one primary action per view */
  accent: '#186099',
  accentHover: '#004a82',
  accentSoft: '#e0effe',
  /** secondary data blue */
  steel: '#6d9fc2',
  steelSoft: '#e6f2fb',

  success: '#3b834e',
  successSoft: '#d9f3dd',
  successInk: '#154f27',
  warning: '#ce9a43',
  warningSoft: '#ffedcb',
  warningInk: '#7f490c',
  danger: '#c13d34',
  dangerSoft: '#ffe8e3',
  dangerInk: '#93342c',

  /** body copy and secondary text ON a navy ground */
  onNavy: '#bbc5d1',
  onNavyMuted: '#8b9aab',
  white: '#ffffff',
} as const

/**
 * Font stacks for surfaces that cannot load the webfonts.
 *
 * Email clients will not fetch Geist or Instrument Serif, and @react-pdf
 * needs fonts registered as files. Both fall back to the same families the
 * contract itself names as fallbacks, so the shapes stay in family even when
 * the exact faces are unavailable.
 */
export const BRAND_FONT = {
  sans: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
  serif: "Georgia,'Times New Roman',serif",
  mono: "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace",
} as const
