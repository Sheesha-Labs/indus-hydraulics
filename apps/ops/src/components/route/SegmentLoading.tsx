// The skeleton's own module, never the `@indus/ops-ui/table` barrel: Next renders a loading boundary's
// client chunks as SSR `<script src async>` tags WITHOUT the CSP nonce (Next 16.2,
// createComponentStylesAndScripts), and the barrel's DataTableClient would put one on every page.
// `loading-client-free.test.ts` keeps every loading.tsx free of client modules.
import TableSkeleton from '@indus/ops-ui/table/skeleton'

/**
 * Every console segment's loading.tsx (05 §6.4) re-exports this or `TabLoading`: a TableSkeleton with
 * aria-busy on the page gutter, so the shell stays put while the page streams in.
 */
export default function SegmentLoading() {
  return (
    <div data-boundary="loading" className="px-io-page-x py-6">
      <TableSkeleton rows={8} cols={5} label="Loading…" />
    </div>
  )
}

/**
 * A record tab's loading.tsx: the skeleton inside the T2 tab body (which already has the gutter), so the
 * record header, strip and rail never flash while a tab loads (05 §6.2).
 */
export function TabLoading() {
  return (
    <div data-boundary="loading" className="min-w-0">
      <TableSkeleton rows={6} cols={5} label="Loading…" />
    </div>
  )
}

/**
 * Loading for pages outside the console shell, which own their `<main>`: the client pages, first-run
 * setup and the sign-in card's pages (inside the card, T11 already owns main).
 */
export function StandaloneLoading() {
  return (
    <main
      id="content"
      data-boundary="loading"
      className="bg-io-card flex min-h-screen w-full flex-col px-4 py-8 lg:px-14"
    >
      <TableSkeleton rows={6} cols={4} label="Loading…" />
    </main>
  )
}

/** Loading inside the T11 sign-in card ((auth) pages): the card is already the page. */
export function CardLoading() {
  return (
    <div data-boundary="loading">
      <TableSkeleton rows={3} cols={2} label="Loading…" />
    </div>
  )
}
