import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../../lib/media'
import { ArrowRightIcon } from '../designed/icons'
import type { BlogPostCardData } from './BlogPostCard'

/**
 * "Keep reading — More on {topic}" at the foot of an article: up to three
 * newer posts from the same topic, so no article ends in a dead end.
 *
 * Wide: three 16:9 cards. 760px and below: one row each, text left and an 88px
 * square thumbnail right, excerpt hidden. The title link's ::after covers the
 * card, so the whole card is one link with no nested anchors. Alt text is
 * `heroAlt ?? title`; `Media.caption` is never rendered.
 */
export default function MoreOnTopic({
  articles,
  topic,
}: {
  articles: BlogPostCardData[]
  topic: { name: string; slug: string }
}) {
  if (articles.length === 0) return null

  return (
    <section aria-labelledby="more-on-topic" className="mt-12 min-[761px]:mt-[72px]">
      <div className="mb-1 flex flex-col items-start gap-1 border-b border-ih-border pb-4 min-[761px]:mb-7 min-[761px]:flex-row min-[761px]:items-end min-[761px]:justify-between min-[761px]:gap-6">
        <div>
          <p className="eyebrow">Keep reading</p>
          <h2
            id="more-on-topic"
            className="mt-2 font-serif text-[26px] font-normal leading-[1.08] tracking-[-0.01em] text-ih-ink min-[761px]:text-[34px]"
          >
            More on {topic.name}
          </h2>
        </div>
        <Link
          href={`/blog/c/${topic.slug}`}
          className="inline-flex min-h-10 shrink-0 items-center gap-2 text-[13.5px] font-medium text-ih-accent hover:text-ih-accent-hover"
        >
          All articles in this topic
          <ArrowRightIcon />
        </Link>
      </div>
      <div className="grid grid-cols-1 min-[761px]:grid-cols-3 min-[761px]:gap-6">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="group relative grid min-w-0 grid-cols-[minmax(0,1fr)_88px] items-start gap-x-3.5 gap-y-1.5 border-b border-ih-border py-4 min-[761px]:flex min-[761px]:flex-col min-[761px]:items-stretch min-[761px]:gap-2 min-[761px]:border-b-0 min-[761px]:py-0"
          >
            <div className="relative col-start-2 row-span-2 row-start-1 aspect-square overflow-hidden rounded-md bg-ih-surface-3 min-[761px]:mb-2 min-[761px]:aspect-video min-[761px]:rounded-lg">
              {article.heroPath ? (
                <Image
                  src={mediaUrl(article.heroPath)}
                  alt={article.heroAlt ?? article.title}
                  fill
                  sizes="(max-width: 760px) 88px, (max-width: 1096px) calc((100vw - 112px) / 3), 318px"
                  className="object-cover transition-opacity duration-150 group-hover:opacity-90 motion-reduce:transition-none"
                />
              ) : null}
            </div>
            <h3 className="col-start-1 row-start-1 text-[15px] font-medium leading-[1.32] tracking-[-0.015em] text-ih-ink min-[761px]:text-[17px]">
              <Link
                href={`/blog/${article.slug}`}
                className="transition-colors duration-150 after:absolute after:inset-0 after:content-[''] group-hover:text-ih-accent motion-reduce:transition-none"
              >
                {article.title}
              </Link>
            </h3>
            {article.excerpt && (
              <p className="hidden text-[13.5px] leading-[1.55] text-ih-ink-2 min-[761px]:line-clamp-3">
                {article.excerpt}
              </p>
            )}
            {article.readingMinutes ? (
              <p className="col-start-1 row-start-2 font-mono text-[11px] text-ih-muted">
                {article.readingMinutes} min read
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
