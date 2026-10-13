import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { BlogBlock } from '@indus/domain'
import type { ResolvedBlogArticle } from '../../lib/blog-article'
import BlogTopicHub from './BlogTopicHub'
import type { BlogPostCardData } from './BlogPostCard'

/**
 * Pins what the hub layout does with its inputs: the quick answer moves to the
 * header and is not repeated, catalogue links and the CTA leave the guide,
 * every article is a real link in the server HTML, and the one-article and
 * no-article topics degrade the way the handoff specifies.
 */

function post(n: number, iso: string, minutes = 4): BlogPostCardData {
  return {
    slug: `post-${n}`,
    title: `Post ${n}`,
    excerpt: `Excerpt ${n}`,
    publishedAt: new Date(iso),
    readingMinutes: minutes,
    heroPath: null,
    heroAlt: null,
    categoryName: 'Thread & fitting identification',
    categorySlug: 'fitting-identification',
    authorName: 'An Engineer',
  }
}

// Newest first, as listBlogPosts returns them.
const POSTS = [
  post(4, '2026-10-06T08:00:00Z', 6),
  post(3, '2026-09-01T08:00:00Z', 3),
  post(2, '2026-09-01T08:00:00Z', 5),
  post(1, '2026-08-17T08:00:00Z', 5),
]

const blocks = [
  { type: 'direct_answer', question: 'How do you identify a fitting?', answer: 'By thread, seat and gender.' },
  { type: 'paragraph', html: 'Guide body.' },
  { type: 'category_link', slug: 'adapters', label: 'Adapters by family' },
  { type: 'direct_answer', question: 'A second question?', answer: 'Rendered inline.' },
  { type: 'cta_block', heading: 'Send a photograph of the end face.', body: 'We will identify it.' },
] as unknown as BlogBlock[]

function body(over: Partial<ResolvedBlogArticle> = {}): ResolvedBlogArticle {
  return {
    blocks,
    toc: [],
    faqs: [],
    productsBySku: new Map(),
    categoriesBySlug: new Map([['adapters', { slug: 'adapters', name: 'Adapters', shortDescription: null }]]),
    articlesBySlug: new Map(),
    livePageLinks: new Set(),
    figuresById: new Map(),
    dropped: [],
    ...over,
  }
}

function render(props: Partial<Parameters<typeof BlogTopicHub>[0]> = {}) {
  return renderToStaticMarkup(
    <BlogTopicHub
      category={{ name: 'Thread & fitting identification', slug: 'fitting-identification', lede: 'Six families.' }}
      posts={POSTS}
      body={body()}
      topics={[
        { slug: 'fitting-identification', name: 'Thread & fitting identification', count: 4 },
        { slug: 'safety', name: 'Safety & HSE', count: 3 },
      ]}
      contact={{ whatsappUrl: null, emailUrl: 'mailto:sales@example.com', phone: null }}
      {...props}
    />,
  )
}

const count = (html: string, needle: string) => html.split(needle).length - 1

describe('BlogTopicHub', () => {
  it('links every article exactly once, with the oldest as Start here', () => {
    const html = render()
    for (const p of POSTS) expect(count(html, `href="/blog/${p.slug}"`)).toBe(1)
    const start = html.indexOf('Start here')
    expect(html.indexOf('href="/blog/post-1"')).toBeGreaterThan(start)
    expect(html.indexOf('href="/blog/post-1"')).toBeLessThan(html.indexOf('All 4 articles'))
  })

  it('groups the list by month, newest first, in the server HTML', () => {
    const html = render()
    expect(html.indexOf('October 2026')).toBeLessThan(html.indexOf('September 2026'))
    expect(html).not.toContain('August 2026') // the only August post is Start here
    expect(html).toContain('1 Sep 2026')
  })

  it('moves the first quick answer to the header and does not repeat it', () => {
    const html = render()
    expect(count(html, 'How do you identify a fitting?')).toBe(1)
    expect(html.indexOf('How do you identify a fitting?')).toBeLessThan(html.indexOf('Start here'))
    // A second direct answer stays in the guide.
    expect(html.indexOf('A second question?')).toBeGreaterThan(html.indexOf('The short version'))
  })

  it('puts catalogue links in Parts and the CTA at the end, not in the guide', () => {
    const html = render()
    const guide = html.slice(html.indexOf('id="hub-guide"'), html.indexOf('id="hub-parts"'))
    expect(guide).not.toContain('Adapters by family')
    expect(guide).not.toContain('Send a photograph')
    expect(html.indexOf('Adapters by family')).toBeGreaterThan(html.indexOf('id="hub-parts"'))
    expect(html.indexOf('Send a photograph')).toBeGreaterThan(html.indexOf('Adapters by family'))
    expect(html).toContain('href="#hub-parts"')
  })

  it('states the stats from the posts', () => {
    const html = render()
    expect(html).toContain('>19 min<') // 6 + 3 + 5 + 5
    expect(html).toContain('6 Oct 2026')
  })

  it('shows Start here alone, with no list head, for a one-article topic', () => {
    const html = render({ posts: [POSTS[3]!] })
    expect(html).toContain('Start here')
    expect(html).not.toContain('All 1 articles')
    expect(html).not.toContain('Sort articles')
  })

  it('shows the empty state and no Articles pill with no articles', () => {
    const html = render({ posts: [] })
    expect(html).toContain('No articles in this topic yet.')
    expect(html).not.toContain('href="#hub-articles"')
    expect(html).not.toContain('Start here')
  })

  it('hides the guide and its pill when no guide blocks remain', () => {
    const thin = body({
      blocks: [blocks[0]!, blocks[4]!],
    })
    const html = render({ body: thin })
    expect(html).not.toContain('The short version')
    expect(html).not.toContain('href="#hub-guide"')
  })

  it('marks the current topic in the topics bar', () => {
    expect(render()).toMatch(/aria-current="page"[^>]*href="\/blog\/c\/fitting-identification"|href="\/blog\/c\/fitting-identification"[^>]*aria-current="page"/)
  })
})
