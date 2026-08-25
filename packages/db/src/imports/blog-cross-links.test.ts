import { describe, expect, it } from 'vitest'
import { BLOG_CROSS_LINKS } from './blog-cross-links'

/**
 * Shape checks only. Whether a slug names a real article, product or page is a
 * database question and is enforced by the importer and the apply script; this
 * catches the mistakes that are visible without one.
 */
describe('BLOG_CROSS_LINKS', () => {
  const entries = Object.entries(BLOG_CROSS_LINKS)

  it('covers the whole blog', () => {
    expect(entries.length).toBe(93)
  })

  it('never links an article to itself', () => {
    for (const [slug, links] of entries) {
      expect(links.related ?? [], `${slug} links to itself`).not.toContain(slug)
    }
  })

  it('keeps related lists within what the block schema accepts', () => {
    for (const [slug, links] of entries) {
      const related = links.related ?? []
      expect(related.length, `${slug} has ${related.length} related`).toBeLessThanOrEqual(6)
      expect(new Set(related).size, `${slug} repeats a related slug`).toBe(related.length)
    }
  })

  it('gives every article at least one outbound article link', () => {
    for (const [slug, links] of entries) {
      expect(links.related?.length ?? 0, `${slug} has no related articles`).toBeGreaterThan(0)
    }
  })

  /**
   * The cap survives the delivery-reach section rather than being replaced by
   * it. `market_reach` puts a shipping note on every article; a `page_link`
   * card claims the article is *about* that country, and that claim is only
   * true a dozen times. Raising this number is how the blog would drift into
   * the doorway-page shape the teardown criticises — see `market-reach.test.ts`
   * for what keeps the generated section out of it.
   */
  it('keeps market linking sparse — this is not a doorway-page programme', () => {
    const withMarkets = entries.filter((e) => e[1].pages?.some((p) => p.kind === 'market'))
    expect(withMarkets.length).toBeLessThanOrEqual(12)
  })

  it('uses only kebab-case slugs, so a pasted URL fails here rather than at import', () => {
    const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    for (const [slug, links] of entries) {
      expect(slug).toMatch(kebab)
      for (const target of links.related ?? []) expect(target).toMatch(kebab)
      for (const page of links.pages ?? []) expect(page.slug).toMatch(kebab)
    }
  })

  it('never leaves a page link without a label', () => {
    for (const [slug, links] of entries) {
      for (const page of links.pages ?? []) {
        expect(page.label.trim().length, `${slug} has an unlabelled page link`).toBeGreaterThan(0)
      }
    }
  })
})
