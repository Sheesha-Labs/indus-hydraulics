import { ImageResponse } from 'next/og'
import { db } from '@indus/db'

/**
 * Per-article Open Graph card.
 *
 * The site-wide card at app/opengraph-image.tsx is generic, so every shared
 * article looked identical in a LinkedIn or WhatsApp preview — the single
 * place a technical audience actually shares this content. Rendering the
 * headline makes the link worth clicking.
 *
 * Node runtime, not edge: this reads the post title from Postgres via Prisma,
 * which does not run on the edge runtime the root card uses.
 *
 * An uploaded ogImageMediaId still wins — generateMetadata sets openGraph.images
 * explicitly and that overrides this file-convention image.
 */

export const alt = 'Indus Hydraulics article'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function BlogPostOgImage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await db.blogPost.findUnique({
    where: { slug: params.slug, isPublished: true },
    select: {
      title: true,
      category: { select: { name: true, isPublished: true } },
      blogAuthor: { select: { name: true, jobTitle: true } },
      author: { select: { name: true } },
    },
  })

  const title = post?.title ?? 'Indus Hydraulics'
  const category = post?.category?.isPublished ? post.category.name : 'Field notes'
  const byline = post?.blogAuthor?.name ?? post?.author?.name ?? 'Indus Hydraulics'
  const role = post?.blogAuthor?.jobTitle ?? null

  // Long headlines shrink rather than overflow — Satori does not reflow out of
  // a fixed box, it just clips, and a clipped headline is worse than a smaller
  // one.
  const fontSize = title.length > 90 ? 46 : title.length > 60 ? 56 : 66

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 18,
            letterSpacing: 4,
            color: '#888888',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#E85A0C',
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            IH
          </div>
          <span>{category}</span>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            color: '#FFFFFF',
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 18,
            color: '#888888',
            borderTop: '1px solid #2A2A2A',
            paddingTop: 28,
          }}
        >
          <span>{role ? `${byline} · ${role}` : byline}</span>
          <span style={{ letterSpacing: 2 }}>INDUSHYDRAULICS.COM</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
