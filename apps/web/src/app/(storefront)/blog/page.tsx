import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { mediaUrl } from '../../../lib/media'
import HomeNewsletterForm from '../../../components/HomeNewsletterForm'

export const metadata: Metadata = { title: 'Blog' }

const TOPICS = [
  'All topics', 'Sizing & Selection', 'Teardowns', 'Failure Analysis',
  'Standards & Specs', 'Industry — Marine', 'Industry — Mining', 'Procurement', 'Maintenance',
]

const EDITOR_PICKS = [
  { num: '/01', title: 'The complete glossary of hydraulic symbols (printable PDF).', meta: 'REFERENCE · 18 MIN · 24K READS' },
  { num: '/02', title: 'How we audit a hydraulic system in 90 minutes — full checklist.', meta: 'MAINTENANCE · 14 MIN · 19K READS' },
  { num: '/03', title: 'ISO 4406 cleanliness codes explained without jargon.', meta: 'STANDARDS · 9 MIN · 16K READS' },
  { num: '/04', title: 'Reading a pump nameplate: a worked example.', meta: 'SPECIFICATION · 6 MIN · 14K READS' },
  { num: '/05', title: 'Why your cylinder is leaking — a flowchart.', meta: 'FAILURE ANALYSIS · 8 MIN · 12K READS' },
]

const TOPIC_COUNTS = [
  ['Sizing & Selection', 42], ['Teardowns', 18], ['Failure Analysis', 23],
  ['Standards & Specs', 14], ['Industry — Marine', 11], ['Industry — Mining', 9],
  ['Procurement', 17], ['Maintenance', 13],
]

export default async function BlogIndexPage() {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    include: { hero: true, author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
  })

  const [featuredPost, secondPost, thirdPost, ...morePosts] = posts
  const totalPosts = posts.length

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="py-14 border-b border-ih-border">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-3">
          FROM THE WORKSHOP · INDUS BLOG
        </p>
        <h1 className="font-serif text-[clamp(40px,5vw,64px)] font-normal tracking-[-0.03em] leading-[1.05] max-w-[780px] mb-4">
          Field notes, sizing guides and component teardowns — written by engineers, for engineers.
        </h1>
        <p className="text-ih-muted max-w-[580px] leading-[1.55] text-[17px] mb-5">
          No SEO bait, no marketing fluff. Just practical writing about hydraulic systems from the people who specify, install and rebuild them every day.
        </p>
        <div className="flex gap-6 font-mono text-[12px] text-ih-muted">
          <span><b className="text-ih-ink">{totalPosts}</b> articles</span>
          <span><b className="text-ih-ink">Updated weekly</b> · Tuesday mornings GST</span>
        </div>
      </div>

      {/* ── Topic rail ──────────────────────────────────────── */}
      <div className="flex gap-2 py-6 border-b border-ih-border overflow-x-auto no-scrollbar">
        {TOPICS.map((topic, i) => (
          <button
            key={topic}
            className={`shrink-0 px-3.5 py-2 border text-[13px] font-medium whitespace-nowrap cursor-pointer ${
              i === 0
                ? 'bg-ih-navy text-white border-ih-ink'
                : 'bg-ih-surface border-ih-border text-ih-ink-2 hover:border-ih-accent'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* ── Featured posts ─────────────────────────────────── */}
      {posts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-ih-border my-12">
          <p className="text-ih-muted">No posts published yet.</p>
        </div>
      ) : (
        <div className="py-8">
          <div className="grid grid-cols-[1.4fr_1fr] gap-6 mb-12">
            {/* Lead card */}
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group border border-ih-border bg-ih-surface overflow-hidden flex flex-col hover:border-ih-accent transition-colors"
              >
                <div className="aspect-[4/3] bg-ih-surface-2 border-b border-ih-border relative overflow-hidden">
                  {featuredPost.hero ? (
                    <Image src={mediaUrl(featuredPost.hero.storagePath)} alt={featuredPost.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="60vw" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center font-mono text-[11px] text-ih-muted-2">Indus Hydraulics</div>
                  )}
                </div>
                <div className="p-8 flex flex-col gap-3 flex-1">
                  <div className="flex gap-3 items-center font-mono text-[11px] text-ih-muted tracking-[0.04em]">
                    {(featuredPost.tags as string[])[0] && (
                      <span className="bg-ih-navy text-white px-2 py-0.5 text-[10px] font-semibold tracking-wider">
                        {(featuredPost.tags as string[])[0]!.toUpperCase()}
                      </span>
                    )}
                    <span>·</span>
                    {featuredPost.publishedAt && (
                      <span>{new Date(featuredPost.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                    )}
                  </div>
                  <h2 className="text-[32px] font-semibold tracking-[-0.02em] leading-[1.1] group-hover:text-ih-accent transition-colors">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-ih-muted leading-[1.55] line-clamp-3">{featuredPost.excerpt}</p>
                  )}
                  {featuredPost.author && (
                    <div className="flex items-center gap-2.5 mt-auto pt-4 border-t border-ih-border text-[13px]">
                      <div className="w-7 h-7 rounded-full bg-ih-surface-2 flex items-center justify-center font-mono text-[10px] text-ih-muted">
                        {featuredPost.author.name?.charAt(0) ?? 'I'}
                      </div>
                      <div>
                        <b className="font-medium">{featuredPost.author.name}</b>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* Right stack */}
            <div className="grid grid-rows-2 gap-6">
              {[secondPost, thirdPost].filter(Boolean).map((post) => post && (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group border border-ih-border bg-ih-surface overflow-hidden flex flex-col hover:border-ih-accent transition-colors"
                >
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex gap-3 items-center font-mono text-[11px] text-ih-muted tracking-[0.04em]">
                      {(post.tags as string[])[0] && (
                        <span className="bg-ih-navy text-white px-2 py-0.5 text-[10px] font-semibold tracking-wider">
                          {(post.tags as string[])[0]!.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-[18px] font-semibold tracking-[-0.01em] leading-[1.2] group-hover:text-ih-accent transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-ih-muted text-[13px] leading-[1.55] line-clamp-2 flex-1">{post.excerpt}</p>
                    )}
                    {post.author && (
                      <div className="flex items-center gap-2.5 mt-auto pt-3 border-t border-ih-border text-[13px]">
                        <div className="w-7 h-7 rounded-full bg-ih-surface-2 flex items-center justify-center font-mono text-[10px] text-ih-muted">
                          {post.author.name?.charAt(0) ?? 'I'}
                        </div>
                        <b className="font-medium text-[13px]">{post.author.name}</b>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent posts — 3-col grid */}
          {morePosts.length > 0 && (
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1">RECENTLY PUBLISHED</p>
                  <h2 className="text-[32px] font-semibold tracking-[-0.02em]">More from the workshop</h2>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {morePosts.slice(0, 6).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group border border-ih-border bg-ih-surface overflow-hidden flex flex-col hover:border-ih-accent transition-colors"
                  >
                    {post.hero ? (
                      <div className="aspect-[16/10] relative border-b border-ih-border overflow-hidden bg-ih-surface-2">
                        <Image src={mediaUrl(post.hero.storagePath)} alt={post.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="33vw" />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-ih-surface-2 border-b border-ih-border grid place-items-center">
                        <span className="font-mono text-[10px] text-ih-muted-2">Indus Hydraulics</span>
                      </div>
                    )}
                    <div className="p-5 flex flex-col gap-2.5 flex-1">
                      <div className="flex gap-2 items-center font-mono text-[11px] text-ih-muted">
                        {(post.tags as string[])[0] && (
                          <span className="bg-ih-navy text-white px-2 py-0.5 text-[10px] font-semibold tracking-wider">
                            {(post.tags as string[])[0]!.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[16px] font-semibold leading-snug group-hover:text-ih-accent transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-[13px] text-ih-muted leading-[1.55] line-clamp-2 flex-1">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-ih-border">
                        <span className="font-mono text-[11px] text-ih-muted">{post.author?.name ?? 'Indus Hydraulics'}</span>
                        {post.publishedAt && (
                          <span className="font-mono text-[11px] text-ih-muted">
                            {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Editor's picks + Sidebar ──────────────────────── */}
      <div className="grid grid-cols-[1fr_320px] gap-14 py-16 border-t border-ih-border">
        {/* Editor's picks */}
        <div>
          <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">
            EDITOR&apos;S PICKS · ALL TIME
          </p>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-6">The articles engineers keep coming back to.</h2>
          <div className="flex flex-col">
            {EDITOR_PICKS.map((pick) => (
              <div key={pick.num} className="grid grid-cols-[80px_1fr_auto] gap-6 py-6 border-b border-ih-border items-center cursor-pointer group">
                <span className="font-mono text-[22px] text-ih-muted-2 tracking-[-0.02em]">{pick.num}</span>
                <div>
                  <h3 className="text-[18px] font-medium tracking-[-0.01em] leading-[1.3] mb-1 group-hover:text-ih-accent transition-colors">
                    {pick.title}
                  </h3>
                  <span className="font-mono text-[11px] text-ih-muted tracking-[0.04em]">{pick.meta}</span>
                </div>
                <span className="font-mono text-[12px] text-ih-accent shrink-0">Read →</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          {/* Newsletter */}
          <div className="bg-ih-navy p-6">
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-accent mb-2">
              NEWSLETTER · 2× A MONTH
            </p>
            <h4 className="text-[16px] font-semibold text-white mb-3">Never miss a teardown.</h4>
            <p className="text-[oklch(0.78_0_0)] text-[13px] leading-[1.5] mb-4">
              Engineers and procurement leads get our notes every other Tuesday.
            </p>
            <HomeNewsletterForm />
          </div>

          {/* Browse by topic */}
          <div className="border border-ih-border bg-ih-surface p-6">
            <h4 className="text-[16px] font-semibold mb-3">Browse by topic</h4>
            <div className="font-mono text-[12px]">
              {TOPIC_COUNTS.map(([topic, count]) => (
                <a key={topic as string} href="#" className="flex justify-between items-center py-2 border-b border-dashed border-ih-border last:border-0 text-ih-ink-2 hover:text-ih-accent transition-colors">
                  <span>{topic as string}</span>
                  <span className="text-ih-muted-2">{count as number}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Ask an engineer */}
          <div className="border border-ih-border bg-ih-surface p-6">
            <h4 className="text-[16px] font-semibold mb-2">Have a question?</h4>
            <p className="text-[13px] text-ih-muted leading-[1.5] mb-4">
              Send us a circuit, a failure photo or a bare SKU. Our applications engineers reply same business day, no charge.
            </p>
            <Link
              href={`/contact`}
              className="block w-full h-10 border border-ih-border flex items-center justify-center font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
            >
              Ask an engineer →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
