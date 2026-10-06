import { describe, it, expect } from 'vitest'
import { applyTitleTemplate, buildMetadata, stripTrailingSiteName } from './metadata'

describe('applyTitleTemplate', () => {
  it('returns title unchanged when template is empty', () => {
    expect(applyTitleTemplate('Foo', null)).toBe('Foo')
    expect(applyTitleTemplate('Foo', '')).toBe('Foo')
  })

  it('substitutes %s', () => {
    expect(applyTitleTemplate('Foo', '%s — Indus')).toBe('Foo — Indus')
  })

  it('falls back to plain title when template would push past max length', () => {
    const long = 'A'.repeat(60)
    const applied = applyTitleTemplate(long, '%s — Indus Hydraulics')
    // applied would be way past 60+10; should fall back to plain title.
    expect(applied).toBe(long)
  })

  it('returns template-without-%s when title is empty', () => {
    expect(applyTitleTemplate('', '%s — Indus')).toBe('— Indus')
  })
})

describe('buildMetadata', () => {
  it('falls back to default description when entity description is empty', () => {
    const md = buildMetadata({
      title: 'Hose Fittings',
      description: null,
      pageUrl: 'https://example.com/c/hose-fittings',
      defaultDescription: 'Indus Hydraulics catalogue.',
    })
    expect(md.description).toBe('Indus Hydraulics catalogue.')
  })

  it('canonical falls through pageUrl when override is missing', () => {
    const md = buildMetadata({
      title: 'Foo',
      description: 'Bar',
      pageUrl: 'https://example.com/p/foo',
    })
    expect(md.alternates.canonical).toBe('https://example.com/p/foo')
  })

  it('uses canonical override when supplied', () => {
    const md = buildMetadata({
      title: 'Foo',
      description: 'Bar',
      pageUrl: 'https://example.com/p/foo?utm=x',
      canonicalUrl: 'https://example.com/p/foo',
    })
    expect(md.alternates.canonical).toBe('https://example.com/p/foo')
  })

  it('emits noindex/nofollow when robots disables them', () => {
    const md = buildMetadata({
      title: 'Foo',
      description: 'Bar',
      pageUrl: 'https://example.com/p/foo',
      robots: { index: false, follow: false },
    })
    expect(md.robots).toEqual({ index: false, follow: false })
  })

  it('includes OG image array when configured', () => {
    const md = buildMetadata({
      title: 'Foo',
      description: 'Bar',
      pageUrl: 'https://example.com/p/foo',
      ogImageUrl: 'https://cdn/foo.jpg',
    })
    expect(md.openGraph.images).toEqual([{ url: 'https://cdn/foo.jpg' }])
    expect(md.twitter.images).toEqual(['https://cdn/foo.jpg'])
  })

  it('does not emit the site name twice when the stored title carries it', () => {
    const md = buildMetadata({
      title: 'Bauer Type Couplings | Indus Hydraulics',
      description: 'Bar',
      pageUrl: 'https://example.com/c/bauer',
      siteName: 'Indus Hydraulics',
    })
    // The storefront layout template appends the site name, so a copy stored
    // on the entity must be dropped or the page renders it twice.
    expect(md.title).toBe('Bauer Type Couplings')
    expect(md.openGraph.title).toBe('Bauer Type Couplings')
  })

  it('hands an already-templated title to Next as absolute, so the layout template is not applied twice', () => {
    const md = buildMetadata({
      title: 'Bauer Type Couplings',
      description: 'Bar',
      pageUrl: 'https://example.com/c/bauer',
      siteName: 'Indus Hydraulics',
      titleTemplate: '%s — Indus Hydraulics',
    })
    expect(md.title).toEqual({ absolute: 'Bauer Type Couplings — Indus Hydraulics' })
    expect(md.openGraph.title).toBe('Bauer Type Couplings — Indus Hydraulics')
  })

  it('leaves the title plain when no template applies', () => {
    const md = buildMetadata({
      title: 'Bauer Type Couplings',
      description: 'Bar',
      pageUrl: 'https://example.com/c/bauer',
      titleTemplate: '',
    })
    expect(md.title).toBe('Bauer Type Couplings')
  })

  it('is og:type website by default and article with dates for an article', () => {
    const plain = buildMetadata({ title: 'A', description: 'B', pageUrl: 'https://example.com/x' })
    expect(plain.openGraph.type).toBe('website')

    const md = buildMetadata({
      title: 'A',
      description: 'B',
      pageUrl: 'https://example.com/blog/a',
      article: {
        publishedTime: new Date('2026-08-24T00:00:00Z'),
        modifiedTime: new Date('2026-09-01T00:00:00Z'),
        section: 'Hose assembly',
        tags: ['2SN', ' '],
        authors: ['https://example.com/blog/author/a'],
      },
    })
    expect(md.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-08-24T00:00:00.000Z',
      modifiedTime: '2026-09-01T00:00:00.000Z',
      section: 'Hose assembly',
      tags: ['2SN'],
      authors: ['https://example.com/blog/author/a'],
    })
  })
})

describe('stripTrailingSiteName', () => {
  it('drops a suffix the stored title already carries', () => {
    expect(stripTrailingSiteName('Female Thread Cross | Indus Hydraulics', 'Indus Hydraulics')).toBe(
      'Female Thread Cross',
    )
  })

  it('drops it however many times it was appended', () => {
    expect(
      stripTrailingSiteName('Foo | Indus Hydraulics | Indus Hydraulics', 'Indus Hydraulics'),
    ).toBe('Foo')
  })

  it('is case-insensitive and tolerates spacing', () => {
    expect(stripTrailingSiteName('Foo  |  indus hydraulics', 'Indus Hydraulics')).toBe('Foo')
  })

  it('leaves a title that merely mentions the site name mid-string', () => {
    const t = 'Indus Hydraulics Ltd Catalogue'
    expect(stripTrailingSiteName(t, 'Indus Hydraulics')).toBe(t)
  })

  it('never strips the title down to nothing', () => {
    expect(stripTrailingSiteName('Indus Hydraulics', 'Indus Hydraulics')).toBe('Indus Hydraulics')
    expect(stripTrailingSiteName('| Indus Hydraulics', 'Indus Hydraulics')).toBe(
      '| Indus Hydraulics',
    )
  })

  it('no-ops without a site name', () => {
    expect(stripTrailingSiteName('Foo | Indus Hydraulics')).toBe('Foo | Indus Hydraulics')
  })

  it('drops a dash-separated suffix too — em, en or hyphen', () => {
    expect(
      stripTrailingSiteName('Replacements & cross-references — Indus Hydraulics', 'Indus Hydraulics'),
    ).toBe('Replacements & cross-references')
    expect(stripTrailingSiteName('Foo – Indus Hydraulics', 'Indus Hydraulics')).toBe('Foo')
    expect(stripTrailingSiteName('Foo - Indus Hydraulics', 'Indus Hydraulics')).toBe('Foo')
  })

  it('leaves a leading brand alone', () => {
    const t = 'Indus Hydraulics — Industrial Components'
    expect(stripTrailingSiteName(t, 'Indus Hydraulics')).toBe(t)
  })
})
