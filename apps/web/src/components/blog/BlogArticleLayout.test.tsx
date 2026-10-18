import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { BlogBlock } from '@indus/domain'
import type { ResolvedBlogArticle } from '../../lib/blog-article'
import BlogArticleLayout, { type BlogArticleLayoutProps } from './BlogArticleLayout'

/**
 * Presentation is checked by eye; these pin the rules the layout applies to
 * the resolver's output — what moves to the top, what gathers at the foot, how
 * the "What next" steps number themselves, and what must never be lost (the
 * section anchors, the open FAQ answers).
 */

const blocks = [
  { type: 'lead', html: 'The <strong>lead</strong> paragraph.' },
  { type: 'direct_answer', question: 'Will BSP thread into NPT?', answer: 'It will start and not seal.' },
  { type: 'key_takeaways', heading: 'Key takeaways', items: ['First point.', 'Second point.'] },
  { type: 'section_head', number: '/01', title: 'Start with the seat.', anchor: 'seat' },
  { type: 'paragraph', html: 'Body copy with a <a href="/blog/x">link</a>.' },
  { type: 'category_link', slug: 'gone-category', label: 'Unpublished shelf' },
  { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Checked against the standards.' },
  { type: 'section_head', number: '/02', title: 'Measure.', anchor: 'measure' },
  { type: 'faq_block', heading: 'Common questions', items: [{ question: 'Is BSPP BSPT?', answer: 'No — one is parallel.' }] },
  { type: 'related_articles', slugs: ['read-me'] },
  {
    type: 'market_reach',
    heading: 'Where we send it',
    body: 'Small parcels ship daily.',
    groups: [{ region: 'GCC', markets: [{ slug: 'saudi-arabia', name: 'Saudi Arabia' }, { slug: 'gone', name: 'Gone' }] }],
  },
] as unknown as BlogBlock[]

function article(over: Partial<ResolvedBlogArticle> = {}): ResolvedBlogArticle {
  return {
    blocks,
    toc: [],
    faqs: [],
    productsBySku: new Map(),
    categoriesBySlug: new Map(),
    articlesBySlug: new Map([
      ['read-me', { slug: 'read-me', title: 'Read me next', excerpt: null, readingMinutes: 4, categoryName: null, categorySlug: null }],
    ]),
    livePageLinks: new Set(['market:saudi-arabia']),
    figuresById: new Map(),
    dropped: [],
    ...over,
  }
}

function render(over: Partial<BlogArticleLayoutProps> = {}) {
  return renderToStaticMarkup(
    <BlogArticleLayout
      title="How to identify any hydraulic fitting"
      excerpt="Four thread families."
      category={{ name: 'Thread & fitting identification', slug: 'thread-fitting' }}
      byline={{ name: 'Ayush Bhatia', href: '/blog/author/ayush', jobTitle: 'Director' }}
      reviewer={null}
      reviewedAt={null}
      publishedAt={new Date('2026-08-17T08:00:00Z')}
      updatedAt={null}
      readingMinutes={5}
      hero={null}
      heroCaption={null}
      url="https://indushydraulics.com/blog/identify"
      article={article()}
      legacyBody=""
      contact={{ whatsappUrl: null, emailUrl: 'mailto:sales@example.com', phone: null }}
      moreFromTopic={[]}
      {...over}
    />,
  )
}

describe('BlogArticleLayout', () => {
  it('keeps every section anchor', () => {
    const html = render()
    expect(html).toContain('id="seat"')
    expect(html).toContain('id="measure"')
    expect(html).toContain('href="#seat"')
  })

  it('lifts the takeaways above the lead, with the stamp inside the panel', () => {
    const html = render()
    const panel = html.indexOf('At a glance')
    expect(panel).toBeGreaterThan(-1)
    expect(panel).toBeLessThan(html.indexOf('paragraph.'))
    const stamp = html.indexOf('Figures verified')
    expect(stamp).toBeGreaterThan(panel)
    expect(stamp).toBeLessThan(html.indexOf('paragraph.'))
  })

  it('renders the FAQ fully open, answers in the HTML', () => {
    expect(render()).toContain('No — one is parallel.')
  })

  it('skips a step whose links do not resolve, and renumbers the rest', () => {
    const html = render()
    const next = html.slice(html.indexOf('What next'))
    // The only category link is unpublished, so "Find the part" is skipped.
    expect(next).not.toContain('Find the part')
    expect(html).not.toContain('Unpublished shelf')
    expect(next).toMatch(/>01<[\s\S]*Read next[\s\S]*>02<[\s\S]*Where we send it/)
    expect(next).not.toContain('>03<')
    // The dead market is dropped from its row; the live one links.
    expect(next).toContain('href="/markets/saudi-arabia"')
    expect(next).not.toContain('/markets/gone')
  })

  it('has no enquiry panel when the post carries no cta_block', () => {
    expect(render()).not.toContain('Request a quote')
  })

  it('omits the Updated cell unless given a date, and adds a reviewer cell when there is one', () => {
    const plain = render()
    expect(plain).not.toContain('>Updated<')
    expect(plain).not.toContain('Reviewed by')
    const full = render({
      updatedAt: new Date('2026-10-06T08:00:00Z'),
      reviewer: { name: 'A Reviewer', href: null, jobTitle: 'Engineer' },
    })
    expect(full).toContain('>Updated<')
    expect(full).toContain('6 October 2026')
    expect(full).toContain('Reviewed by')
    expect(full).toContain('A Reviewer')
  })

  it('counts sections in the reading cell', () => {
    expect(render()).toContain('5 min · 2 sections')
  })

  it('falls back to the legacy body when there are no blocks', () => {
    const html = render({ article: null, legacyBody: '<p>Old post body.</p>' })
    expect(html).toContain('ih-rich-text')
    expect(html).toContain('Old post body.')
    expect(html).not.toContain('What next')
  })
})
