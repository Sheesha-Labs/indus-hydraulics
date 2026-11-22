import type { ReactNode } from 'react'

export interface T11AuthProps {
  /** The card's content: the product mark, the serif heading, the form. */
  children: ReactNode
  /** Under the form, inside the card: "Only … accounts. Trouble signing in? …". */
  footer?: ReactNode
}

/**
 * Template T11 · Sign-in card (L2 t11a): a 400 card centred on paper, with no sidebar and no console
 * session. The `(auth)` layout renders it, so it owns the page's `<main id="content">`. The card is the
 * dialog surface of the handoff (radius 14, e1 shadow, 32 padding, 16 between its parts).
 */
export default function T11Auth({ children, footer }: T11AuthProps) {
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
