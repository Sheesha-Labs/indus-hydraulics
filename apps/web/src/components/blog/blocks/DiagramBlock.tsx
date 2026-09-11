import type { DiagramBlock } from '@indus/domain'
import { sanitizeDiagramSvg } from '../../../lib/diagram-svg'

/**
 * An explanatory figure carried as inline SVG.
 *
 * Deliberately not `BlogFigureBlock`. That one resolves a Media id and renders
 * a photograph through next/image with `object-cover` inside a fixed aspect
 * box — it crops to fill, which is right for a photograph and destroys a chart.
 *
 * The SVG is injected rather than placed in an `<img>` so that its labels stay
 * real text in the document: selectable, searchable, screen-readable, and
 * quotable by a model summarising the page. That is the same reasoning
 * `comparison_table` uses to insist on real table markup, and for the same
 * reason — an answer engine cannot cite what it cannot parse.
 *
 * `sanitizeDiagramSvg` is the security boundary. See the long note there for
 * why an allow-list, and why this runs on render rather than on save.
 *
 * The wrapper scrolls horizontally rather than shrinking the figure below
 * legibility on a narrow viewport: a chart whose axis labels have become
 * unreadable is not a smaller chart, it is a missing one.
 */
export default function DiagramBlockView({ block }: { block: DiagramBlock }) {
  const svg = sanitizeDiagramSvg(block.svg)
  // Nothing survived sanitisation, so there is no figure — render nothing
  // rather than an empty bordered box with a caption underneath it.
  if (!svg) return null

  return (
    <figure className="my-8">
      <div className="overflow-x-auto rounded-lg border border-ih-border bg-ih-surface">
        {/*
          `role="img"` plus the label is what makes this one object to a screen
          reader. Without it the reader walks every `<text>` node in the chart
          and announces axis tick labels as a stream of loose words.
        */}
        <div
          role="img"
          aria-label={block.alt}
          className="[&>svg]:h-auto [&>svg]:w-full [&>svg]:min-w-[560px]"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      <figcaption className="mt-2.5 font-sans text-[13px] leading-[1.5] text-ih-muted">
        {block.captionPrefix ? (
          <strong className="mono mr-1.5 text-[11px] uppercase tracking-[0.1em] text-ih-ink">
            {block.captionPrefix}
          </strong>
        ) : null}
        {block.caption}
      </figcaption>
    </figure>
  )
}
