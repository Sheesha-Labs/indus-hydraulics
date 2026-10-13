import { youtubeVideoId, type VideoBlock } from '@indus/domain'
import YouTubePlayer from './YouTubePlayer'

/**
 * A YouTube video in an article.
 *
 * The title and caption are server-rendered text under the frame, so the page
 * says what the video shows whether or not anyone plays it — and the same
 * block is read back by the article page for its VideoObject JSON-LD, so the
 * markup cannot describe a video the page does not carry.
 */
export default function VideoBlockView({ block }: { block: VideoBlock }) {
  const videoId = youtubeVideoId(block.url)
  // The schema refuses anything else; a row hand-edited past it renders
  // nothing rather than a broken frame.
  if (!videoId) return null

  return (
    <figure className="my-8">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-ih-border bg-ih-ink">
        <YouTubePlayer videoId={videoId} title={block.title} />
      </div>
      <figcaption className="mt-2.5 font-sans text-[13px] leading-[1.5] text-ih-muted">
        <strong className="font-medium text-ih-ink">{block.title}</strong>
        {block.caption ? <> — {block.caption}</> : null}
      </figcaption>
    </figure>
  )
}
