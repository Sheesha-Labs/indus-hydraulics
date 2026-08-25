import Image from 'next/image'
import type { FigureBlock } from '@indus/domain'
import { mediaUrl } from '../../../lib/media'
import type { EmbeddedFigure } from '../../../lib/blog-article'

/**
 * An in-article photograph.
 *
 * Deliberately not the shared `FigureBlockView` from the service cases. That
 * one hands `block.imageId` to `PlaceholderImage` as a storage path, so it
 * would build a URL out of a Media id and render nothing — which is why no
 * figure has ever shown a picture anywhere on the site. Both existing figure
 * blocks in the database carry `imageId: null`, so the bug has been invisible.
 *
 * `imageId` is a Media id: that is what `collectMediaIdsFromBlocks` in
 * @indus/domain indexes, and therefore what stops the media library trashing a
 * photograph an article is using. Storing a URL here instead would render
 * fine and leave the picture looking unused — the exact failure the usage
 * index exists to prevent. So the id is resolved to a storage path upstream in
 * `resolveBlogArticle` and handed in as `figuresById`.
 *
 * An id that no longer resolves renders nothing rather than a broken frame,
 * matching every other link and embed block on an article.
 */
export default function BlogFigureBlockView({
  block,
  figuresById,
}: {
  block: FigureBlock
  figuresById: Map<string, EmbeddedFigure>
}) {
  const figure = block.imageId ? figuresById.get(block.imageId) : undefined
  if (!figure) return null

  const aspect: Record<string, string> = {
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  }

  return (
    <figure className="my-8">
      <div
        className={`relative overflow-hidden rounded-lg border border-ih-border bg-ih-surface-2 ${
          aspect[block.aspectRatio ?? '16/9'] ?? 'aspect-video'
        }`}
      >
        <Image
          src={mediaUrl(figure.storagePath)}
          // The caption says why the picture is here; the alt says what is in
          // it. A screen reader that gets the caption twice learns nothing.
          alt={figure.alt ?? block.caption}
          fill
          className="object-cover"
          sizes="(max-width: 1100px) 100vw, 1100px"
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
