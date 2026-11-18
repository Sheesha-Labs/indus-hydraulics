import type { FigureBlock } from '@indus/domain'
import PlaceholderImage from '../PlaceholderImage'

export default function FigureBlockView({
  block,
  media,
}: {
  block: FigureBlock
  /** The figure's Media row, resolved by the page; null keeps the placeholder. */
  media: { storagePath: string; alt: string | null } | null
}) {
  const aspectClass: Record<string, string> = {
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  }
  return (
    <figure className="my-8">
      <PlaceholderImage
        storagePath={media?.storagePath ?? null}
        // The Media alt describes the photo; the caption explains why it is
        // here (CLAUDE.md §13), so it is the fallback, not the first choice.
        alt={media?.alt ?? block.caption}
        sizes="(min-width: 1100px) 760px, 100vw"
        placeholderLabel={block.placeholderLabel ?? `"${block.caption}\\nfigure"`}
        className={`rounded-[var(--radius-lg)] border border-ih-border ${aspectClass[block.aspectRatio ?? '16/9'] ?? 'aspect-video'}`}
      />
      <figcaption className="mt-2.5 text-[13px] leading-[1.5] text-ih-muted">
        {block.captionPrefix ? (
          <strong className="mr-1.5 text-ih-ink">{block.captionPrefix}</strong>
        ) : null}
        {block.caption}
      </figcaption>
    </figure>
  )
}
