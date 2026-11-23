import type { ReactNode } from 'react'

export interface T11AuthProps {
  /** The card's content: the product mark, the serif heading, the form. On 'split', the right column. */
  children: ReactNode
  /** Under the form, inside the card: "Only … accounts. Trouble signing in? …". */
  footer?: ReactNode
  /**
   * 'split' (board 78, the first-run welcome): two equal columns, a navy panel at the left (`hero`) and
   * the content on paper at the right, 64 padding each. Default 'card' (L2 t11a).
   */
  layout?: 'card' | 'split'
  /**
   * The left column of the split layout, filling its height: on board 78 the caller's navy panel (logo,
   * greeting, title, promises, the fixed rule at the foot). Layout only here: the panel brings its colour.
   */
  hero?: ReactNode
}

/**
 * Template T11 · Sign-in card (L2 t11a): a 400 card centred on paper, with no sidebar and no console
 * session. The `(auth)` layout renders it, so it owns the page's `<main id="content">`. The card is the
 * dialog surface of the handoff (radius 14, e1 shadow, 32 padding, 16 between its parts).
 *
 * The 'split' layout is the two-column variant board 78 draws for the Owner's first-run welcome (signed
 * in, still without the console shell).
 */
export default function T11Auth({ children, footer, layout = 'card', hero }: T11AuthProps) {
  if (layout === 'split') {
    return (
      <main
        id="content"
        data-template="T11"
        data-layout="split"
        className="bg-io-paper grid min-h-screen w-full grid-cols-2"
      >
        <div data-slot="hero" className="flex min-w-0 flex-col">
          {hero}
        </div>
        <div data-slot="content" className="flex min-w-0 flex-col gap-4 p-16">
          {children}
          {footer ? <div data-slot="footer">{footer}</div> : null}
        </div>
      </main>
    )
  }
  return (
    <main
      id="content"
      data-template="T11"
      className="bg-io-paper flex min-h-screen w-full items-center justify-center px-4 py-8"
    >
      <div
        data-slot="card"
        className="bg-io-card border-io-line rounded-io-dialog shadow-io-e1 w-io-auth flex max-w-full flex-col gap-4 border p-8"
      >
        {children}
        {footer ? <div data-slot="footer">{footer}</div> : null}
      </div>
    </main>
  )
}
