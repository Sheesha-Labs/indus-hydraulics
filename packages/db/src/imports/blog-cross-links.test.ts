import { describe, expect, it } from 'vitest'
import { BLOG_CROSS_LINKS } from './blog-cross-links'

/**
 * Shape checks only. Whether a slug names a real article, product or page is a
 * database question and is enforced by the importer and the apply script; this
 * catches the mistakes that are visible without one.
 */
describe('BLOG_CROSS_LINKS', () => {
  const entries = Object.entries(BLOG_CROSS_LINKS)

  /**
   * One entry per published article. The number moves with a content wave and
   * is asserted rather than derived on purpose: a wave that adds articles and
   * forgets their links would otherwise ship a cluster with no edges, which is
   * the exact failure this file was written after.
   *
   * 93 after the hose programme; 103 after the GCC supplier sprint's first
   * wave; 113, 123 and 133 across the Africa fittings sprint's three waves
   * (2026-09-01).
   */
  it('covers the whole blog', () => {
    expect(entries.length).toBe(133)
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
   * true a small number of times. Raising this number is how the blog would
   * drift into the doorway-page shape the teardown criticises — see
   * `market-reach.test.ts` for what keeps the generated section out of it.
   *
   * RAISED FROM 12 TO 18 ON 2026-09-01, by the founder, for the Africa fittings
   * sprint's sector wave. Eight of those ten articles genuinely are about a
   * place: the lane, the resupply distance and the imported fleet mix are the
   * subject of the piece rather than an added link. Two of the ten carry no
   * card for exactly that reason — a crusher is a crusher anywhere.
   *
   * The cap is a budget, not a target. Anything that would push past 18 needs
   * the same test applied by hand first: is this article ABOUT that country, or
   * is it an article with a country bolted onto it?
   */
  it('keeps market linking sparse — this is not a doorway-page programme', () => {
    const withMarkets = entries.filter((e) => e[1].pages?.some((p) => p.kind === 'market'))
    expect(withMarkets.length).toBeLessThanOrEqual(18)
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
