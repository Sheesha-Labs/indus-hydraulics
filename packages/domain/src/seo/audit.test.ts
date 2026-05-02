import { describe, it, expect } from 'vitest'
import { diffSnapshots, projectSeoFields } from './audit'

describe('diffSnapshots', () => {
  it('returns empty diff for identical snapshots', () => {
    expect(diffSnapshots({ seoTitle: 'A' }, { seoTitle: 'A' })).toEqual([])
  })

  it('reports changed fields', () => {
    const diff = diffSnapshots(
      { seoTitle: 'A', robotsIndex: true },
      { seoTitle: 'B', robotsIndex: true },
    )
    expect(diff).toEqual([{ field: 'seoTitle', before: 'A', after: 'B' }])
  })

  it('ignores bookkeeping fields', () => {
    const diff = diffSnapshots(
      { seoTitle: 'A', updatedAt: new Date('2026-01-01') },
      { seoTitle: 'A', updatedAt: new Date('2026-04-01') },
    )
    expect(diff).toEqual([])
  })

  it('treats null/undefined consistently', () => {
    const diff = diffSnapshots({ seoTitle: null }, { seoTitle: 'A' })
    expect(diff).toEqual([{ field: 'seoTitle', before: null, after: 'A' }])
  })

  it('detects nested object changes', () => {
    const diff = diffSnapshots(
      { jsonLdOverride: { description: 'old' } },
      { jsonLdOverride: { description: 'new' } },
    )
    expect(diff[0]?.field).toBe('jsonLdOverride')
  })
})

describe('projectSeoFields', () => {
  it('extracts only SEO-relevant fields', () => {
    const projected = projectSeoFields({
      id: 'p1',
      title: 'irrelevant',
      seoTitle: 'A',
      seoDescription: 'B',
      canonicalUrl: 'https://x',
      robotsIndex: true,
      jsonLdOverride: { foo: 'bar' },
      description: 'irrelevant',
    } as Record<string, unknown>)
    expect(Object.keys(projected).sort()).toEqual(
      ['canonicalUrl', 'jsonLdOverride', 'robotsIndex', 'seoDescription', 'seoTitle'].sort(),
    )
  })
})
