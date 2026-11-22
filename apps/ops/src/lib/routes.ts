import type { Route } from 'next'

/**
 * A typed href literal for an ops-ui prop (ops-ui parts take plain strings so they stay app-agnostic):
 * `href={to('/history-import')}`. typedRoutes checks the literal against the route tree whenever the
 * generated route types exist (`next dev`, `next build`, `next typegen`), so a link to a folder that does not
 * exist fails the type check in apps/ops (05 §6.1).
 */
export function to<T extends string>(href: Route<T>): Route<T> {
  return href
}
