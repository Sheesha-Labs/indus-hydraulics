import type { FigureBlock } from '@indus/domain'
import PlaceholderImage from '../PlaceholderImage'

export default function FigureBlockView({ block }: { block: FigureBlock }) {
  const aspectClass: Record<string, string> = {
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  }
  return (
    <figure className="my-8">
      <PlaceholderImage
        storagePath={block.imageId ?? null}
        alt={block.caption}
        placeholderLabel={block.placeholderLabel ?? `"${block.caption}\\nfigure"`}
        className={`border border-[var(--color-border)] ${aspectClass[block.aspectRatio ?? '16/9'] ?? 'aspect-video'}`}
      />
      <figcaption className="mono mt-2.5 font-sans text-[11px] tracking-[0.04em] text-[var(--color-muted)]">
        {block.captionPrefix ? (
          <strong className="mr-1.5 text-[var(--color-primary)]">{block.captionPrefix}</strong>
        ) : null}
        {block.caption}
      </figcaption>
    </figure>
  )
}
