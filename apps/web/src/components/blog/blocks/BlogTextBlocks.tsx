import type { LeadBlock, ParagraphBlock, ProseBlock, SectionHeadBlock } from '@indus/domain'

/*
  The blog's text blocks. `section_head`, `lead` and `paragraph` share their
  schema with the service case studies, but not their views any more: the
  article redesign sets body copy at 18px with a serif section title, and
  restyling the shared views would have moved every case study with it.

  Stored HTML cannot carry utility classes, so links, emphasis and (in prose)
  sub-headings and lists inside it are styled by `.ih-article-html` in
  globals.css. Size, leading and colour of the block itself stay here.
*/

/**
 * `id={anchor}` is load-bearing: other articles link to `/blog/x#anchor`, about
 * 730 in-text links in all. The scroll margin clears the 107px sticky site header, and
 * on desktop the sticky contents bar under it as well.
 */
export function BlogSectionHeadView({ block }: { block: SectionHeadBlock }) {
  return (
    <h2
      id={block.anchor}
      className="mt-5 flex scroll-mt-[124px] flex-col gap-2.5 border-t border-ih-border pt-6 min-[761px]:mt-8 min-[761px]:scroll-mt-[184px] min-[761px]:pt-7"
    >
      <span className="font-mono text-[12px] font-medium tracking-[0.08em] text-ih-accent">{block.number}</span>
      <span className="text-balance font-serif text-[28px] font-normal leading-[1.08] tracking-[-0.01em] text-ih-ink min-[761px]:text-[38px]">
        {block.title}
      </span>
    </h2>
  )
}

export function BlogLeadView({ block }: { block: LeadBlock }) {
  return (
    <p
      className="ih-article-html text-pretty text-[18px] leading-[1.6] text-ih-ink min-[761px]:text-[21px]"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  )
}

export function BlogParagraphView({ block }: { block: ParagraphBlock }) {
  return (
    <p
      className="ih-article-html text-pretty text-[16px] leading-[1.7] text-ih-ink-2 min-[761px]:text-[18px]"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  )
}

/**
 * A run of formatted writing — paragraphs, sub-headings, lists, quotes.
 *
 * A `<div>` rather than the `<p>` that `paragraph` uses, because this block
 * legitimately contains block-level markup: a `<ul>` inside a `<p>` is invalid
 * and the browser hoists it out, which is how a bulleted list ends up rendering
 * outside the paragraph it was written in.
 *
 * The HTML is sanitised on the way IN (`sanitizeBlogProseHtml`, on save), not
 * here.
 */
export function BlogProseView({ block }: { block: ProseBlock }) {
  return (
    <div
      className="ih-article-html text-pretty text-[16px] leading-[1.7] text-ih-ink-2 min-[761px]:text-[18px]"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  )
}
