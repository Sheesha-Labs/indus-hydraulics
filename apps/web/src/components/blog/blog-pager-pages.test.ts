import { describe, expect, it } from 'vitest'
import { blogPageHref, pagerPages } from './blog-pager-pages'

describe('pagerPages', () => {
  it('shows 2 back and 4 ahead on the wide pager', () => {
    expect(pagerPages(1, 20, 2, 4)).toEqual([1, 2, 3, 4, 5, 'gap', 20])
    expect(pagerPages(10, 20, 2, 4)).toEqual([1, 'gap', 8, 9, 10, 11, 12, 13, 14, 'gap', 20])
    expect(pagerPages(20, 20, 2, 4)).toEqual([1, 'gap', 18, 19, 20])
  })

  it('shows 1 either side on the narrow pager', () => {
    expect(pagerPages(1, 20, 1, 1)).toEqual([1, 2, 'gap', 20])
    expect(pagerPages(10, 20, 1, 1)).toEqual([1, 'gap', 9, 10, 11, 'gap', 20])
    expect(pagerPages(20, 20, 1, 1)).toEqual([1, 'gap', 19, 20])
  })

  it('never marks a gap between adjacent pages', () => {
    expect(pagerPages(3, 20, 1, 1)).toEqual([1, 2, 3, 4, 'gap', 20])
    expect(pagerPages(4, 6, 2, 4)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('never repeats a page', () => {
    expect(pagerPages(1, 2, 2, 4)).toEqual([1, 2])
    expect(pagerPages(2, 2, 1, 1)).toEqual([1, 2])
    for (let total = 2; total <= 25; total++) {
      for (let page = 1; page <= total; page++) {
        const nums = pagerPages(page, total, 2, 4).filter((x) => x !== 'gap')
        expect(new Set(nums).size).toBe(nums.length)
        expect(nums).toContain(page)
        expect(nums[0]).toBe(1)
        expect(nums.at(-1)).toBe(total)
      }
    }
  })
})

describe('blogPageHref', () => {
  it('links page 1 as /blog, never /blog/page/1', () => {
    expect(blogPageHref(1)).toBe('/blog')
    expect(blogPageHref(2)).toBe('/blog/page/2')
    expect(blogPageHref(20)).toBe('/blog/page/20')
  })
})
