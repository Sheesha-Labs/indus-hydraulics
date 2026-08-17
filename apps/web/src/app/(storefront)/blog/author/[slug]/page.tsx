import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@indus/db'
import { buildBreadcrumbLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import BlogPostCard from '../../../../../components/blog/BlogPostCard'
import { listBlogPosts } from '../../../../../lib/blog-posts'
import { mediaUrl } from '../../../../../lib/media'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../../../lib/seo'

type Props = { params: Promise<{ slug: string }> }

/**
 * Author profile.
 *
 * Identifiable expert authorship is one of the strongest trust signals
 * available to a technical publisher, and it is worth almost nothing without
 * a resolvable page behind the byline. `Person` schema with `jobTitle` and
 * `hasCredential` is what turns "written by an engineer" from a claim into
 * something a machine can check.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [author, seoSetting] = await Promise.all([
    db.blogAuthor.findUnique({ where: { slug, isPublished: true } }),
    db.seoSetting.findFirst({
      select: { defaultMetaTitleTemplate: true, defaultMetaDescription: true },
    }),
  ])
  if (!author) return {}

  return pageMetadata({
    title: author.seoTitle ?? `${author.name}${author.jobTitle ? ` — ${author.jobTitle}` : ''}`,
    description: author.seoDescription ?? author.bio ?? null,
    path: `/blog/author/${author.slug}`,
    canonicalUrl: author.canonicalUrl,
    robots: { index: author.robotsIndex, follow: author.robotsFollow },
    titleTemplate: seoSetting?.defaultMetaTitleTemplate ?? null,
    defaultDescription: seoSetting?.defaultMetaDescription ?? null,
  })
}

export default async function BlogAuthorPage({ params }: Props) {
  const { slug } = await params

  const author = await db.blogAuthor.findUnique({
    where: { slug, isPublished: true },
    include: { avatar: { select: { storagePath: true, alt: true } } },
  })
  if (!author) notFound()

  const posts = await listBlogPosts({ blogAuthorId: author.id })
  const profileUrl = urlFor(`/blog/author/${author.slug}`)

  // ProfilePage wrapping a Person, rather than a bare Person node: it tells a
  // consumer this page IS about that person, which a standalone Person on a
  // listing page does not.
  const profileLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': profileUrl,
    url: profileUrl,
    mainEntity: {
      '@type': 'Person',
      name: author.name,
      url: profileUrl,
      ...(author.jobTitle ? { jobTitle: author.jobTitle } : {}),
      ...(author.bio ? { description: author.bio } : {}),
      ...(author.avatar ? { image: mediaUrl(author.avatar.storagePath) } : {}),
      ...(author.linkedinUrl ? { sameAs: [author.linkedinUrl] } : {}),
      ...(author.credentials
        ? { hasCredential: { '@type': 'EducationalOccupationalCredential', name: author.credentials } }
        : {}),
      worksFor: { '@type': 'Organization', '@id': ORG_ID, name: SITE_NAME },
    },
  }

  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Blog', url: urlFor('/blog') },
      { name: author.name, url: profileUrl },
    ],
  })

  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
      <JsonLd data={[profileLd, breadcrumbLd]} />

      <nav className="mono flex items-center gap-2 pt-8 text-[12px] text-ih-muted">
        <Link href="/" className="hover:text-ih-ink">
          Home
        </Link>
        <span className="opacity-40">/</span>
        <Link href="/blog" className="hover:text-ih-ink">
          Blog
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">{author.name}</span>
      </nav>

      <header className="flex max-w-[760px] flex-col gap-5 border-b border-ih-border py-8 sm:flex-row sm:items-start">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-ih-border bg-ih-surface-2">
          {author.avatar ? (
            <Image
              src={mediaUrl(author.avatar.storagePath)}
              alt={author.avatar.alt ?? author.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="mono absolute inset-0 grid place-items-center text-[20px] text-ih-muted">
              {author.name.charAt(0)}
            </span>
          )}
        </div>
        <div>
          <h1 className="mb-1 font-serif text-[clamp(26px,3.5vw,36px)] font-normal leading-[1.1] tracking-[-0.02em]">
            {author.name}
          </h1>
          <div className="mono mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] uppercase tracking-[0.1em] text-ih-muted">
            {author.jobTitle && <span>{author.jobTitle}</span>}
            {author.yearsExperience && (
              <>
                <span className="opacity-40">·</span>
                <span>{author.yearsExperience} yrs</span>
              </>
            )}
            {author.credentials && (
              <>
                <span className="opacity-40">·</span>
                <span>{author.credentials}</span>
              </>
            )}
          </div>
          {author.bio && (
            <p className="max-w-[560px] text-[15px] leading-[1.6] text-ih-ink-2">{author.bio}</p>
          )}
          {author.linkedinUrl && (
            <a
              href={author.linkedinUrl}
              target="_blank"
              rel="noopener"
              className="mono mt-3 inline-block text-[11.5px] text-ih-accent hover:underline"
            >
              LinkedIn ↗
            </a>
          )}
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="my-12 border border-dashed border-ih-border py-16 text-center">
          <p className="text-ih-muted">No published articles yet.</p>
        </div>
      ) : (
        <>
          <p className="mono py-6 text-[12px] text-ih-muted">
            <b className="text-ih-ink">{posts.length}</b>{' '}
            {posts.length === 1 ? 'article' : 'articles'}
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
