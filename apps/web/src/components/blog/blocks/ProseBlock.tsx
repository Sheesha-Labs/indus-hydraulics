import type { ProseBlock } from '@indus/domain'

/**
 * A run of formatted writing — paragraphs, sub-headings, lists, quotes.
 *
 * A `<div>` rather than the `<p>` that `paragraph` uses, because this block
 * legitimately contains block-level markup: a `<ul>` inside a `<p>` is invalid
 * and the browser hoists it out, which is how a bulleted list ends up rendering
 * outside the paragraph it was written in.
 *
 * The HTML is sanitised on the way IN (`sanitizeBlogProseHtml`, on save), not
 * here. This block renders inside `.sc-article-body`, which already styles p,
 * ul, strong and a; the additional element styles it introduces are in
 * globals.css alongside those.
 */
export default function ProseBlockView({ block }: { block: ProseBlock }) {
  return <div dangerouslySetInnerHTML={{ __html: block.html }} />
}
