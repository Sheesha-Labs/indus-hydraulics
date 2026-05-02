import type { MetadataRoute } from 'next'
import { db } from '@indus/db'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://indushydraulics.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands, blogPosts] = await Promise.all([
    db.product.findMany({
      where: { status: 'active' },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      where: { isPublished: true },
      select: { slug: true },
    }),
    db.brand.findMany({
      where: { isPublished: true },
      select: { slug: true },
    }),
    db.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, publishedAt: true },
    }),
  ])

  const staticPages = ['', '/about', '/contact', '/blog', '/brands', '/search']

  const staticUrls: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1.0 : 0.7,
  }))

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/p/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/c/${c.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const brandUrls: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE}/brands/${b.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const blogUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.publishedAt ?? undefined,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticUrls, ...productUrls, ...categoryUrls, ...brandUrls, ...blogUrls]
}
