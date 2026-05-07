/**
 * Pure helpers for the search pagination URL contract.
 *
 * - `parsePageParam` clamps untrusted user input into a safe integer page
 *   number. Returns 1 for missing / non-numeric / non-positive / overflow.
 * - `buildPageNumbers` produces the visible numeric strip with ellipses
 *   that the page renders, given the current page and total page count.
 *
 * Decoupled from React so they're trivially unit-tested.
 */

export const MAX_PAGES = 25
export const PAGE_SIZE = 24

export function parsePageParam(raw: string | undefined | null): number {
  if (!raw) return 1
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return 1
  if (n > MAX_PAGES) return MAX_PAGES
  return n
}

export type PageNumbersToken = number | 'ellipsis'

/**
 * Generates the visible page-number strip with ellipses. Designed so the
 * total slot count stays small (≤ 7 tokens) regardless of `totalPages`,
 * keeping the layout stable.
 *
 * Rules:
 *   - ≤ 7 pages → render every page.
 *   - currentPage near the start → 1, 2, 3, 4, 5, …, totalPages
 *   - currentPage near the end   → 1, …, totalPages-4..totalPages
 *   - currentPage in the middle  → 1, …, current-1, current, current+1, …, totalPages
 */
export function buildPageNumbers(
  currentPage: number,
  totalPages: number,
): PageNumbersToken[] {
  if (totalPages <= 0) return []
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const tokens: PageNumbersToken[] = []
  const current = Math.min(Math.max(currentPage, 1), totalPages)

  if (current <= 4) {
    tokens.push(1, 2, 3, 4, 5, 'ellipsis', totalPages)
  } else if (current >= totalPages - 3) {
    tokens.push(
      1,
      'ellipsis',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    )
  } else {
    tokens.push(1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', totalPages)
  }
  return tokens
}

export function totalPageCount(totalResults: number, pageSize: number = PAGE_SIZE): number {
  if (totalResults <= 0 || pageSize <= 0) return 0
  return Math.min(MAX_PAGES, Math.ceil(totalResults / pageSize))
}
