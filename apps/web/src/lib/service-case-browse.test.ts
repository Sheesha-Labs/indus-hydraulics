import { describe, expect, it } from 'vitest'
import { filterServiceCases, sortServiceCases } from './service-case-browse'
import type { ServiceCaseListItem } from './service-cases'

/**
 * The /services chips and sort control run in the browser so the page can be
 * cached — it used to read `searchParams` on the server, which made the route
 * dynamic and meant it was never cached at all.
 *
 * That moved the ordering out of Postgres and into these functions, so the two
 * can now disagree. `SORT_ORDER` in service-cases.ts is the thing being
 * mirrored:
 *
 *   recent:  publishedAt desc, caseNumber desc
 *   savings: savingsAmount desc nulls last, publishedAt desc
 *   tat:     durationDays asc nulls last, publishedAt desc
 *
 * The nulls-last cases are the ones worth guarding. Prisma is told explicitly
 * where nulls go; JavaScript's default comparator has no opinion, and a case
 * with no recorded saving would otherwise sort as if it saved nothing —
 * putting it above real ones under a descending sort.
 */

function makeCase(over: Partial<ServiceCaseListItem>): ServiceCaseListItem {
  return {
    id: over.id ?? 'id',
    caseNumber: over.caseNumber ?? '01',
    category: over.category ?? 'hoses',
    durationDays: over.durationDays ?? null,
    savingsAmount: over.savingsAmount ?? null,
    publishedAt: over.publishedAt ?? new Date('2026-01-01'),
    ...over,
  } as ServiceCaseListItem
}

const ids = (rows: ServiceCaseListItem[]) => rows.map((r) => r.id)

describe('filterServiceCases', () => {
  const cases = [
    makeCase({ id: 'hose', category: 'hoses' }),
    makeCase({ id: 'pump', category: 'pumps' }),
  ]

  it('returns everything when no category is selected', () => {
    expect(ids(filterServiceCases(cases, null))).toEqual(['hose', 'pump'])
  })

  it('keeps only the selected category', () => {
    expect(ids(filterServiceCases(cases, 'pumps'))).toEqual(['pump'])
  })
})

describe('sortServiceCases', () => {
  it('orders recent by publishedAt desc, then caseNumber desc', () => {
    const rows = [
      makeCase({ id: 'old', publishedAt: new Date('2026-01-01') }),
      makeCase({ id: 'new', publishedAt: new Date('2026-06-01') }),
      makeCase({ id: 'same-lower', publishedAt: new Date('2026-06-01'), caseNumber: '02' }),
    ]
    // 'new' and 'same-lower' share a date, so caseNumber breaks the tie: 02 above 01.
    expect(ids(sortServiceCases(rows, 'recent'))).toEqual(['same-lower', 'new', 'old'])
  })

  it('orders savings desc and puts cases with no recorded saving last', () => {
    const rows = [
      makeCase({ id: 'none', savingsAmount: null }),
      makeCase({ id: 'small', savingsAmount: 1_000 }),
      makeCase({ id: 'big', savingsAmount: 90_000 }),
    ]
    expect(ids(sortServiceCases(rows, 'savings'))).toEqual(['big', 'small', 'none'])
  })

  it('orders tat ascending and puts cases with no duration last', () => {
    const rows = [
      makeCase({ id: 'none', durationDays: null }),
      makeCase({ id: 'slow', durationDays: 30 }),
      makeCase({ id: 'fast', durationDays: 3 }),
    ]
    expect(ids(sortServiceCases(rows, 'tat'))).toEqual(['fast', 'slow', 'none'])
  })

  it('does not mutate the array it is given', () => {
    const rows = [
      makeCase({ id: 'a', savingsAmount: 1 }),
      makeCase({ id: 'b', savingsAmount: 2 }),
    ]
    sortServiceCases(rows, 'savings')
    expect(ids(rows)).toEqual(['a', 'b'])
  })
})
