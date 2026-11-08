import { describe, expect, it } from 'vitest'
import { pickBlogMix } from './home-blog-mix'

const post = (id: string, categoryId: string | null) => ({ id, categoryId })

describe('pickBlogMix', () => {
  it('takes the newest article from each topic first', () => {
    const posts = [post('a1', 'anchor'), post('a2', 'anchor'), post('h1', 'hoses'), post('a3', 'anchor'), post('l1', 'lifting')]
    expect(pickBlogMix(posts, 3).map((p) => p.id)).toEqual(['a1', 'h1', 'l1'])
  })

  it('fills remaining slots with the next-newest when topics run out', () => {
    const posts = [post('a1', 'anchor'), post('a2', 'anchor'), post('h1', 'hoses'), post('a3', 'anchor')]
    expect(pickBlogMix(posts, 4).map((p) => p.id)).toEqual(['a1', 'a2', 'h1', 'a3'])
  })

  it('keeps newest-first order so the lead is the most recent', () => {
    const posts = [post('x', 'one'), post('y', 'one'), post('z', 'two')]
    expect(pickBlogMix(posts, 3)[0]!.id).toBe('x')
  })

  it('treats uncategorised posts as their own topic each', () => {
    const posts = [post('n1', null), post('n2', null), post('c1', 'c')]
    expect(pickBlogMix(posts, 3).map((p) => p.id)).toEqual(['n1', 'n2', 'c1'])
  })

  it('never returns more than asked, or duplicates', () => {
    const posts = Array.from({ length: 20 }, (_, i) => post(`p${i}`, `c${i % 3}`))
    const out = pickBlogMix(posts, 9)
    expect(out).toHaveLength(9)
    expect(new Set(out.map((p) => p.id)).size).toBe(9)
  })
})
