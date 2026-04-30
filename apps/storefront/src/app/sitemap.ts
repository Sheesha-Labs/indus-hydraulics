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

  const locales = ['en', 'ar']

  const staticPages = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/brands',
    '/search',
  ]

  const staticUrls: MetadataRoute.Sitemap = staticPages.flatMap((path) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}${path}`,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.7,
    }))
  )

  const productUrls: MetadataRoute.Sitemap = products.flatMap((p) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}/p/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  )

  const categoryUrls: MetadataRoute.Sitemap = categories.flatMap((c) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}/c/${c.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  const brandUrls: MetadataRoute.Sitemap = brands.flatMap((b) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}/brands/${b.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  )

  const blogUrls: MetadataRoute.Sitemap = blogPosts.flatMap((post) =>
    locales.map((locale) => ({
      url: `${BASE}/${locale}/blog/${post.slug}`,
      lastModified: post.publishedAt ?? undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  )

  return [...staticUrls, ...productUrls, ...categoryUrls, ...brandUrls, ...blogUrls]
}
