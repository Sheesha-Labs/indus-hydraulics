import { describe, expect, it } from 'vitest'
import {
  BlogBlockSchema,
  blogFaqPairs,
  blogReferencedArticleSlugs,
  blogReferencedCategorySlugs,
  blogReferencedPageLinks,
  estimateReadingMinutes,
  blogReferencedSkus,
  blogTocEntries,
  pageLinkHref,
  parseBlogBlocks,
  type BlogBlocks,
} from './blog-blocks'

const sectionHead = {
  type: 'section_head',
  number: '/01',
  title: 'Pressure ratings',
  anchor: 'pressure-ratings',
}
const paragraph = { type: 'paragraph', html: 'Working pressure is not burst pressure.' }

describe('reused ServiceCase blocks', () => {
  it('accepts a section_head in the blog union', () => {
    expect(BlogBlockSchema.safeParse(sectionHead).success).toBe(true)
  })

  it('still enforces the kebab-case anchor rule', () => {
    expect(BlogBlockSchema.safeParse({ ...sectionHead, anchor: 'Pressure Ratings' }).success).toBe(
      false
    )
  })
})

describe('key_takeaways', () => {
  it('accepts two to six items', () => {
    expect(BlogBlockSchema.safeParse({ type: 'key_takeaways', items: ['a', 'b'] }).success).toBe(
      true
    )
  })

  it('rejects a single item — a one-item summary is a sentence, not a summary', () => {
    expect(BlogBlockSchema.safeParse({ type: 'key_takeaways', items: ['a'] }).success).toBe(false)
  })

  it('rejects more than six', () => {
    const items = Array.from({ length: 7 }, (_, i) => `item ${i}`)
    expect(BlogBlockSchema.safeParse({ type: 'key_takeaways', items }).success).toBe(false)
  })
})

describe('comparison_table', () => {
  const columns = ['Grade', 'Working pressure', 'Construction']

  it('accepts a table whose rows match the column count', () => {
    const result = BlogBlockSchema.safeParse({
      type: 'comparison_table',
      columns,
      rows: [{ cells: ['SAE 100R2AT', '350 bar', 'Two-wire braid'] }],
    })
    expect(result.success).toBe(true)
  })

  it('REJECTS a ragged row — the refinement must survive the discriminated union', () => {
    // Zod 4 permits a refined object inside a discriminated union, but only if
    // the effect actually runs. If this ever passes, a misaligned pressure
    // table ships silently, so the assertion is deliberately load-bearing.
    const result = BlogBlockSchema.safeParse({
      type: 'comparison_table',
      columns,
      rows: [{ cells: ['SAE 100R2AT', '350 bar'] }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects a table with fewer than two columns', () => {
    expect(
      BlogBlockSchema.safeParse({
        type: 'comparison_table',
        columns: ['Grade'],
        rows: [{ cells: ['SAE 100R2AT'] }],
      }).success
    ).toBe(false)
  })
})

describe('standard_citation', () => {
  it('accepts a full citation', () => {
    expect(
      BlogBlockSchema.safeParse({
        type: 'standard_citation',
        standard: 'SAE J1273',
        publisher: 'SAE International',
        title: 'Recommended Practices for Hydraulic Hose Assemblies',
        clause: '§4.2',
        summary: 'Covers inspection and replacement practice, not shelf life.',
      }).success
    ).toBe(true)
  })

  it('requires the issuing body, so attribution cannot be left vague', () => {
    expect(
      BlogBlockSchema.safeParse({
        type: 'standard_citation',
        standard: 'SAE J1273',
        title: 'Recommended Practices for Hydraulic Hose Assemblies',
        summary: 'Covers inspection and replacement practice.',
      }).success
    ).toBe(false)
  })
})

describe('as_of_stamp', () => {
  it('accepts an ISO date', () => {
    expect(
      BlogBlockSchema.safeParse({ type: 'as_of_stamp', verifiedOn: '2026-08-17' }).success
    ).toBe(true)
  })

  it('rejects a free-text date', () => {
    expect(
      BlogBlockSchema.safeParse({ type: 'as_of_stamp', verifiedOn: '17 Aug 2026' }).success
    ).toBe(false)
  })
})

describe('callout', () => {
  it('defaults tone to note', () => {
    const parsed = BlogBlockSchema.parse({
      type: 'callout',
      title: 'Check the layline',
      body: 'Read the date code.',
    })
    expect(parsed).toMatchObject({ tone: 'note' })
  })

  it('rejects an unknown tone', () => {
    expect(
      BlogBlockSchema.safeParse({ type: 'callout', tone: 'critical', title: 'x', body: 'y' })
        .success
    ).toBe(false)
  })
})

describe('category_link', () => {
  it('requires a kebab-case slug so it resolves to a real /c/ route', () => {
    expect(
      BlogBlockSchema.safeParse({
        type: 'category_link',
        slug: 'hoses-fittings',
        label: 'Hoses & fittings',
      }).success
    ).toBe(true)
    expect(
      BlogBlockSchema.safeParse({
        type: 'category_link',
        slug: '/c/hoses-fittings',
        label: 'Hoses',
      }).success
    ).toBe(false)
  })
})

describe('parseBlogBlocks', () => {
  it('keeps valid blocks and drops only the broken one', () => {
    // The regression this exists to prevent: ArticleRenderer validates the
    // whole array and returns null on any failure, blanking a whole article
    // because of one bad block.
    const { blocks, dropped } = parseBlogBlocks([sectionHead, { type: 'paragraph' }, paragraph])
    expect(blocks).toHaveLength(2)
    expect(dropped).toHaveLength(1)
    expect(dropped[0]!.index).toBe(1)
  })

  it('preserves document order', () => {
    const { blocks } = parseBlogBlocks([sectionHead, paragraph])
    expect(blocks.map((b) => b.type)).toEqual(['section_head', 'paragraph'])
  })

  it('reports an unknown block type rather than throwing', () => {
    const { blocks, dropped } = parseBlogBlocks([{ type: 'carousel' }])
    expect(blocks).toHaveLength(0)
    expect(dropped).toHaveLength(1)
  })

  it('returns empty for null, and flags a non-array', () => {
    expect(parseBlogBlocks(null)).toEqual({ blocks: [], dropped: [] })
    expect(parseBlogBlocks({ type: 'paragraph' }).dropped).toHaveLength(1)
  })
})

describe('derived helpers', () => {
  const blocks = parseBlogBlocks([
    sectionHead,
    { type: 'product_embed', skus: ['R2AT-08', 'FER-08-2W'] },
    { type: 'faq_block', items: [{ question: 'Is 2SN the same as R2AT?', answer: 'No.' }] },
    { type: 'section_head', number: '/02', title: 'Fittings', anchor: 'fittings' },
    { type: 'product_embed', skus: ['R2AT-08', 'JIC-08-M'] },
  ]).blocks as BlogBlocks

  it('derives TOC entries from section heads in order', () => {
    expect(blogTocEntries(blocks)).toEqual([
      { anchor: 'pressure-ratings', title: 'Pressure ratings' },
      { anchor: 'fittings', title: 'Fittings' },
    ])
  })

  it('de-duplicates SKUs across blocks while preserving first-seen order', () => {
    expect(blogReferencedSkus(blocks)).toEqual(['R2AT-08', 'FER-08-2W', 'JIC-08-M'])
  })

  it('collects FAQ pairs for FAQPage JSON-LD', () => {
    expect(blogFaqPairs(blocks)).toEqual([{ question: 'Is 2SN the same as R2AT?', answer: 'No.' }])
  })
})

describe('estimateReadingMinutes', () => {
  const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ')

  it('never returns zero for a short article', () => {
    const { blocks } = parseBlogBlocks([{ type: 'paragraph', html: 'Three short words.' }])
    expect(estimateReadingMinutes(blocks)).toBe(1)
  })

  it('scales with prose length', () => {
    // Three blocks rather than one long string: ParagraphBlockSchema caps html
    // at 4000 characters, so a 660-word paragraph cannot exist as a single
    // block — it would be dropped as invalid and silently read as zero words.
    const { blocks } = parseBlogBlocks([
      { type: 'paragraph', html: words(220) },
      { type: 'paragraph', html: words(220) },
      { type: 'paragraph', html: words(220) },
    ])
    expect(blocks).toHaveLength(3)
    expect(estimateReadingMinutes(blocks)).toBe(3)
  })

  it('strips HTML tags rather than counting them as words', () => {
    const plain = parseBlogBlocks([{ type: 'paragraph', html: words(220) }]).blocks
    const tagged = parseBlogBlocks([
      { type: 'paragraph', html: `<strong>${words(220)}</strong>` },
    ]).blocks
    expect(estimateReadingMinutes(tagged)).toBe(estimateReadingMinutes(plain))
  })

  it('ignores anchors, SKUs and block discriminators', () => {
    // A spec-heavy article is quick to skim. Counting anchors and SKUs would
    // inflate the estimate on exactly the articles that read fastest.
    const { blocks } = parseBlogBlocks([
      { type: 'section_head', number: '/01', title: 'Grades', anchor: 'grades' },
      { type: 'product_embed', skus: ['R2AT-08', 'R2AT-12', 'R2AT-16'] },
      { type: 'as_of_stamp', verifiedOn: '2026-08-17' },
    ])
    // Only the two words of the section title count.
    expect(estimateReadingMinutes(blocks)).toBe(1)
  })

  it('counts FAQ questions and answers', () => {
    const { blocks } = parseBlogBlocks([
      { type: 'faq_block', items: [{ question: words(110), answer: words(110) }] },
    ])
    expect(estimateReadingMinutes(blocks)).toBe(1)
  })
})

describe('blogReferencedCategorySlugs', () => {
  it('de-duplicates and preserves first-seen order', () => {
    const { blocks } = parseBlogBlocks([
      { type: 'category_link', slug: 'hoses-fittings', label: 'Hoses' },
      { type: 'paragraph', html: 'text' },
      { type: 'category_link', slug: 'seals-accessories', label: 'Seals' },
      { type: 'category_link', slug: 'hoses-fittings', label: 'Hoses again' },
    ])
    expect(blogReferencedCategorySlugs(blocks)).toEqual(['hoses-fittings', 'seals-accessories'])
  })

  it('returns empty when an article links to no categories', () => {
    const { blocks } = parseBlogBlocks([{ type: 'paragraph', html: 'text' }])
    expect(blogReferencedCategorySlugs(blocks)).toEqual([])
  })
})

describe('related_articles', () => {
  const block = {
    type: 'related_articles',
    slugs: ['stopping-an-npt-thread-leak', 'where-jic-is-the-wrong-choice'],
  }

  it('accepts a list of slugs', () => {
    expect(BlogBlockSchema.safeParse(block).success).toBe(true)
  })

  it('rejects an empty list — an empty related list is a heading with nothing under it', () => {
    expect(BlogBlockSchema.safeParse({ type: 'related_articles', slugs: [] }).success).toBe(false)
  })

  it('rejects more than six', () => {
    const slugs = Array.from({ length: 7 }, (_, i) => `article-${i}`)
    expect(BlogBlockSchema.safeParse({ type: 'related_articles', slugs }).success).toBe(false)
  })

  it('rejects a slug that is not kebab-case, which is what a pasted URL looks like', () => {
    const parsed = BlogBlockSchema.safeParse({
      type: 'related_articles',
      slugs: ['/blog/stopping-an-npt-thread-leak'],
    })
    expect(parsed.success).toBe(false)
  })

  it('collects slugs across blocks, de-duplicated and in order', () => {
    const blocks = parseBlogBlocks([
      block,
      { type: 'related_articles', slugs: ['where-jic-is-the-wrong-choice', 'field-re-hosing-kit'] },
    ]).blocks
    expect(blogReferencedArticleSlugs(blocks)).toEqual([
      'stopping-an-npt-thread-leak',
      'where-jic-is-the-wrong-choice',
      'field-re-hosing-kit',
    ])
  })

  it('does not count towards reading time — a link list is not reading', () => {
    const blocks = parseBlogBlocks([block]).blocks
    expect(estimateReadingMinutes(blocks)).toBe(estimateReadingMinutes([]))
  })
})

describe('page_link', () => {
  const market = { type: 'page_link', kind: 'market', slug: 'saudi-arabia', label: 'Saudi Arabia' }

  it('accepts each of the three kinds', () => {
    for (const kind of ['market', 'service', 'industry']) {
      expect(BlogBlockSchema.safeParse({ ...market, kind }).success).toBe(true)
    }
  })

  it('rejects a kind outside the closed set', () => {
    expect(BlogBlockSchema.safeParse({ ...market, kind: 'brand' }).success).toBe(false)
  })

  it('derives the href from the kind rather than storing it', () => {
    expect(pageLinkHref({ kind: 'market', slug: 'saudi-arabia' })).toBe('/markets/saudi-arabia')
    expect(pageLinkHref({ kind: 'service', slug: 'hose-assembly' })).toBe('/services/hose-assembly')
    expect(pageLinkHref({ kind: 'industry', slug: 'manufacturing' })).toBe(
      '/industries/manufacturing'
    )
  })

  it('collects page links de-duplicated on kind and slug together', () => {
    const blocks = parseBlogBlocks([
      market,
      { ...market, label: 'Saudi Arabia again' },
      { type: 'page_link', kind: 'industry', slug: 'saudi-arabia', label: 'Different page' },
    ]).blocks
    expect(blogReferencedPageLinks(blocks)).toEqual([
      { kind: 'market', slug: 'saudi-arabia' },
      { kind: 'industry', slug: 'saudi-arabia' },
    ])
  })
})

describe('market_reach', () => {
  const reach = {
    type: 'market_reach',
    heading: 'Where we send the replacement',
    body: 'Assemblies are built in Dubai and dispatched with their test records.',
    groups: [
      {
        region: 'GCC & Middle East',
        markets: [
          { slug: 'saudi-arabia', name: 'Saudi Arabia' },
          { slug: 'oman', name: 'Oman' },
        ],
      },
    ],
    footnote: 'Everything above ships from the same Dubai warehouse.',
  }

  it('accepts a well-formed block', () => {
    expect(BlogBlockSchema.safeParse(reach).success).toBe(true)
  })

  it('rejects a market slug that is not kebab-case, so a pasted URL fails here', () => {
    const bad = {
      ...reach,
      groups: [{ region: 'GCC', markets: [{ slug: '/markets/oman', name: 'Oman' }] }],
    }
    expect(BlogBlockSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a region with no destinations in it', () => {
    expect(
      BlogBlockSchema.safeParse({ ...reach, groups: [{ region: 'GCC', markets: [] }] }).success
    ).toBe(false)
  })

  /**
   * The reason the block needs no resolution logic of its own: folding its
   * markets into the page-link list is what makes the importer validate them
   * and `resolveBlogArticle` gate them, for free.
   */
  it('reports its markets as page links, de-duplicated against page_link blocks', () => {
    const card = { type: 'page_link', kind: 'market', slug: 'saudi-arabia', label: 'Saudi Arabia' }
    const blocks = parseBlogBlocks([card, reach]).blocks
    expect(blogReferencedPageLinks(blocks)).toEqual([
      { kind: 'market', slug: 'saudi-arabia' },
      { kind: 'market', slug: 'oman' },
    ])
  })

  it('is not counted as reading time — it is furniture, not argument', () => {
    const blocks = parseBlogBlocks([reach]).blocks
    expect(estimateReadingMinutes(blocks)).toBe(estimateReadingMinutes([]))
  })
})
