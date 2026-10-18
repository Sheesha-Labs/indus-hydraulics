import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { getMasterPage, resolveSections } from '@indus/domain'
import type { PageContent } from '../../lib/page-content'
import type { BlogPostCardData } from './BlogPostCard'

// The view only needs the page size from the loader module; the module itself
// opens a database client on import.
vi.mock('../../lib/blog-index', () => ({ BLOG_PAGE_SIZE: 12 }))
vi.mock('../../actions/newsletter', () => ({ subscribeToNewsletter: async () => ({ success: true }) }))

const { default: BlogIndexView } = await import('./BlogIndexView')

/**
 * Presentation is checked by eye; these pin the behaviour the handoff makes
 * conditional — what shows with no articles, what changes after page one, and
 * how the Pages & Blocks toggles and order map onto the layout.
 */

function content(opts: { off?: string[]; order?: string[] } = {}): PageContent {
  const sections = resolveSections(getMasterPage('blog')!, null)
  const byKey = new Map(sections.map((s) => [s.key, s]))
  const off = new Set(opts.off ?? [])
  return {
    sections,
    values: (key) => byKey.get(key)?.values ?? {},
    isOn: (key) => !off.has(key),
    order: (opts.order ?? sections.map((s) => s.key)).filter((k) => !off.has(k)),
    usingDefaults: true,
  }
}

function post(n: number): BlogPostCardData {
  return {
    slug: `post-${n}`,
    title: `Post ${n}`,
    excerpt: `Excerpt ${n}`,
    publishedAt: new Date('2026-10-06T08:00:00Z'),
    readingMinutes: 4,
    heroPath: null,
    heroAlt: null,
    categoryName: 'Industrial hose',
    categorySlug: 'industrial-hose',
    authorName: 'An Engineer',
  }
}

const TOPICS = [
  { slug: 'industrial-hose', name: 'Industrial hose', count: 34 },
  { slug: 'safety-hse', name: 'Safety & HSE', count: 1 },
]

function render(props: Partial<Parameters<typeof BlogIndexView>[0]> = {}) {
  return renderToStaticMarkup(
    <BlogIndexView
      posts={Array.from({ length: 12 }, (_, i) => post(i + 1))}
      topics={TOPICS}
      totalPosts={232}
      page={1}
      totalPages={20}
      content={content()}
      {...props}
    />,
  )
}

describe('BlogIndexView', () => {
  it('renders search, topic tiles, the grid and a pager on page one', () => {
    const html = render()
    expect(html).toContain('action="/search"')
    expect(html).toContain('232 articles · 2 topics · page 1 of 20')
    expect(html).toContain('href="/blog/c/industrial-hose"')
    expect(html).toContain('>article</span>') // singular unit on a one-article topic
    expect(html).toContain('Latest articles')
    expect(html).toContain('1–12 of 232 · newest first')
    expect(html).toContain('aria-label="Article pages"')
    expect(html).not.toContain('href="/blog/page/1"')
  })

  it('italicises the clause after the last em dash of the heading', () => {
    expect(render()).toContain('— <em class="italic">written by engineers, for engineers.</em>')
  })

  it('names later pages "Earlier articles" with the right range', () => {
    const html = render({ page: 3, posts: [post(25), post(26)] })
    expect(html).toContain('Earlier articles')
    expect(html).toContain('25–26 of 232 · newest first')
    expect(html).toContain('href="/blog/page/2"')
    expect(html).toContain('rel="prev"')
  })

  it('shows the empty state with no search, topics, count or pager', () => {
    const html = render({ posts: [], topics: [], totalPosts: 0, totalPages: 1 })
    expect(html).toContain('role="status"')
    expect(html).toContain('No articles have been published yet.')
    expect(html).not.toContain('role="search"')
    expect(html).not.toContain('Browse by topic')
    expect(html).not.toContain('newest first')
    expect(html).not.toContain('Article pages')
    // The navy band still shows.
    expect(html).toContain('Never miss a teardown.')
  })

  it('hides the topic index and its count when topics are switched off', () => {
    const html = render({ content: content({ off: ['topics'] }) })
    expect(html).not.toContain('Browse by topic')
    expect(html).toContain('232 articles · page 1 of 20')
  })

  it('renders the band panels in the editor order, ignoring topics_card', () => {
    const html = render({
      content: content({ order: ['hero', 'help_card', 'topics_card', 'newsletter_card', 'topics', 'articles'] }),
    })
    expect(html.indexOf('Have a question?')).toBeLessThan(html.indexOf('Never miss a teardown.'))
  })

  it('drops a band panel the editor switched off', () => {
    const html = render({ content: content({ off: ['help_card'] }) })
    expect(html).not.toContain('Have a question?')
    expect(html).toContain('Never miss a teardown.')
  })
})
