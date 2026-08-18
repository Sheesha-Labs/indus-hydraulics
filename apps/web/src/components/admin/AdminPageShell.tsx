import type { ReactNode } from 'react'

/**
 * The v2 console page frame: a 60px bar carrying the page's title, an optional
 * subtitle, and its actions — then the page body beneath it.
 *
 * Spec, from design-source/tokens.css and ui.jsx `AdminShell`:
 *   .ih-admin__top    60px · padding 0 26px · flex · gap 14px · border-bottom · surface
 *   .ih-admin__title  18px · weight 500 · tracking -0.015em
 *   sub               11.5px · muted · margin-top 1px
 *   actions           margin-left auto · flex · gap 8px
 *
 * ─── Why the PAGE renders this, not the layout ───
 *
 * The bar used to live in `(shell)/layout.tsx` so no page could forget it. v2
 * puts page-specific content in it, and the page is the only node where all
 * three inputs already exist together: the fetched row that names the title,
 * the `<form>` a submit button belongs to, and the client state a toggle reads.
 * Every layout-owned alternative has to reconstruct one of those from outside:
 *
 *   - a client Context server-renders an EMPTY bar on every page and fills it
 *     in an effect — a blank flash on each navigation, plus a transition race
 *     where the outgoing page's cleanup clears the title the incoming one just
 *     set, leaving the bar permanently empty with no error anywhere;
 *   - a pathname-keyed config map cannot produce the 12 dynamic titles or the
 *     9 counts, and would degrade every editor to a generic "Edit product" —
 *     the exact regression v2 is reversing;
 *   - an `@topbar` parallel slot needs a `default.tsx` at every nesting level,
 *     and a missing one renders fine on soft navigation but 404s the whole
 *     route on refresh in production.
 *
 * The "no page can forget it" guarantee is restored mechanically instead, by
 * `admin-page-shell.test.ts`. That is a stronger guarantee than the old one:
 * it fails in CI rather than relying on someone noticing a missing bar.
 *
 * ─── Notes for future work ───
 *
 * `title`, `sub` and `actions` are ReactNode, never string. Two subtitles carry
 * inline markup and two carry the page's ONLY link back to its parent, so a
 * `string` prop would silently delete an exit route.
 *
 * `actions` may be a client island — server-to-client JSX as a prop is legal,
 * and the island keeps its own state because it IS a client component.
 *
 * Submit buttons bound to a `<form action={serverAction}>` in the body have
 * NOT been hoisted. Moving a `<button type="submit">` out of its form breaks
 * the association with no compile error, no lint failure and no runtime error
 * — the click simply does nothing. Doing that needs `<form id>` + `button
 * form="…"` plus a pending-state channel, per page, and is deliberately left
 * out of the header move.
 *
 * If a `loading.tsx` is ever added under `/admin`, it must render this shell
 * too, or the skeleton paints with no bar at all.
 */
export default function AdminPageShell({
  title,
  breadcrumbs,
  sub,
  actions,
  children,
  bodyClassName,
}: {
  title: ReactNode
  /**
   * The location line, ABOVE the title — "Content · Blog", or a link back to
   * the parent record. Bazar puts it here rather than below because a reader
   * scanning down hits "where am I" before "what is this", which is the order
   * they actually want it in.
   */
  breadcrumbs?: ReactNode
  /** @deprecated Use `breadcrumbs`. Rendered in the same slot while pages migrate. */
  sub?: ReactNode
  actions?: ReactNode
  children: ReactNode
  /** Extra classes on `<main>` — a width cap, normally. The gutter is fixed. */
  bodyClassName?: string
}) {
  return (
    <>
      {/*
        Not sticky. The shell layout pins this column to the viewport with
        `md:overflow-hidden`, so the bar stays put because <main> beneath it is
        the thing that scrolls. A sticky bar here would be redundant AND would
        open a stacking context every later overlay has to out-rank.

        px-7 matches <main>'s p-7 exactly: that is what puts the page title's
        left edge over the first content element below it, which is the single
        most visible alignment in the console.
      */}
      <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-ih-border bg-ih-surface px-7">
        <div className="min-w-0 flex-1">
          {breadcrumbs ?? sub ? (
            <div className="mb-0.5 truncate text-[11.5px] text-ih-muted">{breadcrumbs ?? sub}</div>
          ) : null}
          <h1 className="truncate text-[18px] font-medium tracking-tight text-ih-ink">{title}</h1>
        </div>
        {/* Rendered only when there are actions — an empty flex box would still
            eat the gap and shift the title's optical centre. */}
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <main className={`flex-1 overflow-auto p-4 md:p-7 ${bodyClassName ?? ''}`}>{children}</main>
    </>
  )
}
