import Image from 'next/image'
import type { FigureBlock } from '@indus/domain'
import { mediaUrl } from '../../../lib/media'
import type { EmbeddedFigure } from '../../../lib/blog-article'
import FigureCaption from './FigureCaption'

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
 * matching every other link and embed block on an article. The caption is the
 * block's own — never `Media.caption`, which holds provenance notes.
 */
const ASPECT: Record<string, string> = {
  '16/9': 'aspect-video',
  '21/9': 'aspect-[21/9]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
}

export default function BlogFigureBlockView({
  block,
  figuresById,
}: {
  block: FigureBlock
  figuresById: Map<string, EmbeddedFigure>
}) {
  const figure = block.imageId ? figuresById.get(block.imageId) : undefined
  if (!figure) return null

  return (
    <figure className="my-2 min-w-0">
      <div
        className={`relative overflow-hidden rounded-lg bg-ih-surface-3 ${
          ASPECT[block.aspectRatio ?? '16/9'] ?? 'aspect-video'
        }`}
      >
        <Image
          src={mediaUrl(figure.storagePath)}
          // The caption says why the picture is here; the alt says what is in
          // it. A screen reader that gets the caption twice learns nothing.
          alt={figure.alt ?? block.caption}
          fill
          className="object-cover"
          sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1096px) calc(100vw - 64px), 1000px"
        />
      </div>
      <FigureCaption prefix={block.captionPrefix} caption={block.caption} />
    </figure>
  )
}
