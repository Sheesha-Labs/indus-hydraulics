/**
 * Page numbers for the blog index pager.
 *
 * First and last are always kept, plus `back` pages before the current one
 * and `ahead` after it; a jump of more than one page becomes a gap. The window
 * is lopsided on purpose — readers on /blog are paging back through older
 * articles, so the pages ahead of them are the ones worth a direct link.
 *
 *   pagerPages(1, 20, 2, 4)  → [1, 2, 3, 4, 5, 'gap', 20]
 *   pagerPages(10, 20, 1, 1) → [1, 'gap', 9, 10, 11, 'gap', 20]
 */
export type PagerItem = number | 'gap'

export function pagerPages(page: number, total: number, back: number, ahead: number): PagerItem[] {
  const set = new Set<number>([1, total])
  for (let n = page - back; n <= page + ahead; n++) {
    if (n >= 1 && n <= total) set.add(n)
  }
  const nums = [...set].sort((a, b) => a - b)
  const out: PagerItem[] = []
  nums.forEach((n, i) => {
    const prev = nums[i - 1]
    if (prev !== undefined && n - prev > 1) out.push('gap')
    out.push(n)
  })
  return out
}

/** Page 1 is /blog itself — /blog/page/1 404s on purpose, so it is never linked. */
export function blogPageHref(n: number): string {
  return n === 1 ? '/blog' : `/blog/page/${n}`
}
