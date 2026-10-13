import { describe, expect, it } from 'vitest'
import { linkFirstOccurrence, linksTo } from './link-html'

describe('linkFirstOccurrence', () => {
  it('wraps the first occurrence only', () => {
    const { html, linked } = linkFirstOccurrence(
      'a pallet of hose and another pallet of hose',
      'pallet of hose',
      '/c/hydraulic-hoses',
    )
    expect(linked).toBe(true)
    expect(html).toBe('a <a href="/c/hydraulic-hoses">pallet of hose</a> and another pallet of hose')
  })

  it('matches inside formatting tags, not across them', () => {
    const { html } = linkFirstOccurrence(
      'specify <strong>material certificates</strong> on parts',
      'material certificates',
      '/blog/x',
    )
    expect(html).toBe('specify <strong><a href="/blog/x">material certificates</a></strong> on parts')
  })

  it('never matches inside an attribute or an existing link', () => {
    const src = '<a href="/blog/adapters">adapters</a> and <span title="adapters">x</span> adapters'
    const { html } = linkFirstOccurrence(src, 'adapters', '/c/hydraulic-adapters')
    expect(html).toBe(
      '<a href="/blog/adapters">adapters</a> and <span title="adapters">x</span> <a href="/c/hydraulic-adapters">adapters</a>',
    )
  })

  it('reports a miss rather than guessing', () => {
    const { html, linked } = linkFirstOccurrence('Adapters are useful', 'adapters', '/c/x')
    expect(linked).toBe(false)
    expect(html).toBe('Adapters are useful')
  })
})

describe('linksTo', () => {
  it('detects an existing link to the same place', () => {
    expect(linksTo('<a href="/c/x">y</a>', '/c/x')).toBe(true)
    expect(linksTo('<a href="/c/xy">y</a>', '/c/x')).toBe(false)
  })
})
