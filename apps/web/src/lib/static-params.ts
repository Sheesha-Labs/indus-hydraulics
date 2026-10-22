/**
 * Run a route's `generateStaticParams` query without letting a busy database fail the build.
 *
 * `generateStaticParams` only decides which pages are built ahead. Every route that uses this keeps
 * `dynamicParams = true`, so a page left off the list still renders on its first request and is cached
 * from then on — an empty list costs a slower first hit per page, never a missing page. An empty list
 * also keeps the route on the incremental cache, which is why it must stay a list rather than throw.
 *
 * Without this, one refused connection while the build collects page data fails the production
 * deploy outright. It did on 2026-10-21 (`/llms.txt`) and on 2026-10-22, when the hotfix for that
 * day's database saturation could not deploy because its own build hit `(EMAXCONN) max client
 * connections reached` on `/blog/[slug]`.
 */
export async function staticParamsOrNone<T>(route: string, read: () => Promise<T[]>): Promise<T[]> {
  try {
    return await read()
  } catch (err) {
    console.warn(
      `[static-params] ${route}: building no pages ahead — they render on first request. ${String(
        (err as Error)?.message ?? err,
      )
        .split('\n')
        .filter(Boolean)
        .slice(-1)[0]}`,
    )
    return []
  }
}
