import type { ServiceCaseCategory } from '@indus/db'
import type { ServiceCaseListItem, ServiceCaseSort } from './service-cases'

/**
 * Filtering and sorting for the /services grid, as pure functions.
 *
 * These exist so the browser can do the work the database used to. /services
 * read `category` and `sort` from `searchParams`, which made the route dynamic
 * — it rendered per request and was never cached, at ~47 KB of origin transfer
 * a time. There are twenty published cases and the unfiltered page already
 * shipped all of them, so the filtering never needed a round trip.
 *
 * Deliberately in its own file, importing `@indus/db` for TYPES ONLY. The
 * client component that calls these must not pull the Prisma client into the
 * browser bundle, and a value import here would do exactly that.
 *
 * `sortServiceCases` mirrors `SORT_ORDER` in service-cases.ts. The two must
 * agree — service-case-browse.test.ts is what holds them together.
 */

export function filterServiceCases(
  cases: ServiceCaseListItem[],
  category: ServiceCaseCategory | null,
): ServiceCaseListItem[] {
  return category ? cases.filter((c) => c.category === category) : cases
}

/** Ascending comparator for a value that sorts last when absent. */
function nullsLast(a: number | null, b: number | null, direction: 1 | -1): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return (a - b) * direction
}

function publishedAtMs(c: ServiceCaseListItem): number {
  return c.publishedAt ? new Date(c.publishedAt).getTime() : 0
}

export function sortServiceCases(
  cases: ServiceCaseListItem[],
  sort: ServiceCaseSort,
): ServiceCaseListItem[] {
  const rows = [...cases]
  switch (sort) {
    case 'savings':
      // savingsAmount desc, nulls last; publishedAt desc as the tiebreak.
      return rows.sort(
        (a, b) =>
          nullsLast(a.savingsAmount, b.savingsAmount, -1) || publishedAtMs(b) - publishedAtMs(a),
      )
    case 'tat':
      // durationDays asc, nulls last; publishedAt desc as the tiebreak.
      return rows.sort(
        (a, b) =>
          nullsLast(a.durationDays, b.durationDays, 1) || publishedAtMs(b) - publishedAtMs(a),
      )
    case 'recent':
    default:
      // publishedAt desc, then caseNumber desc. `caseNumber` is a String
      // ("07"), so this compares as text — the same ordering Postgres applies
      // to the column, and the values are zero-padded so it reads numerically.
      return rows.sort(
        (a, b) =>
          publishedAtMs(b) - publishedAtMs(a) || (b.caseNumber ?? '').localeCompare(a.caseNumber ?? ''),
      )
  }
}
