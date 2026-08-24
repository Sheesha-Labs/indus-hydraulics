/**
 * Applies BLOG_SEO to every article already live.
 *
 * Counterpart to the cross-links apply script, and for the same reason: the 93
 * articles predate the composer in `runBlogArticleImport`, and re-importing
 * them through the wave runners would not work — five of the seven carry their
 * own pre-extraction copy of the importer.
 *
 * Reports the audit before and after so the change is measurable rather than
 * asserted. Idempotent.
 *
 * Run with:
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-seo/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-08-25-blog-seo/run.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { db } from '../../index'
import { BLOG_SEO } from '../blog-seo'

const DRY_RUN = process.argv.includes('--dry-run')

const TITLE = { min: 30, max: 60 }
const DESCRIPTION = { min: 120, max: 160 }

type Row = {
  slug: string
  seoTitle: string | null
  seoDescription: string | null
  focusKeyword: string | null
}

/** The four checks `scoreEntity` applies to a blog post's SEO fields. */
function audit(rows: Row[]) {
  let titleOk = 0
  let descOk = 0
  let kwInTitle = 0
  let kwInUrl = 0
  for (const r of rows) {
    const t = r.seoTitle ?? ''
    const d = r.seoDescription ?? ''
    const k = (r.focusKeyword ?? '').toLowerCase()
    if (t.length >= TITLE.min && t.length <= TITLE.max) titleOk++
    if (d.length >= DESCRIPTION.min && d.length <= DESCRIPTION.max) descOk++
    if (k && t.toLowerCase().includes(k)) kwInTitle++
    if (k && r.slug.includes(k.replace(/\s+/g, '-'))) kwInUrl++
  }
  return { titleOk, descOk, kwInTitle, kwInUrl, total: rows.length }
}

function report(label: string, a: ReturnType<typeof audit>): void {
  console.log(
    `  ${label}: title ${a.titleOk}/${a.total} · description ${a.descOk}/${a.total} · ` +
      `keyword in title ${a.kwInTitle}/${a.total} · keyword in URL ${a.kwInUrl}/${a.total}`
  )
}

async function main(): Promise<void> {
  const posts = await db.blogPost.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, seoTitle: true, seoDescription: true, focusKeyword: true },
    orderBy: { slug: 'asc' },
  })

  const errors: string[] = []
  for (const slug of Object.keys(BLOG_SEO)) {
    if (!posts.some((p) => p.slug === slug))
      errors.push(`BLOG_SEO names an unknown article: ${slug}`)
  }
  for (const post of posts) {
    if (!BLOG_SEO[post.slug]) errors.push(`no SEO metadata defined for: ${post.slug}`)
  }
  if (errors.length) {
    console.error(`${errors.length} problem(s):`)
    for (const e of errors) console.error(`  ✗ ${e}`)
    process.exitCode = 1
    return
  }

  report('before', audit(posts))
  const after = posts.map((p) => ({ slug: p.slug, ...BLOG_SEO[p.slug]! }))
  report('after ', audit(after))

  const changed = posts.filter((p) => {
    const seo = BLOG_SEO[p.slug]!
    return (
      p.seoTitle !== seo.seoTitle ||
      p.seoDescription !== seo.seoDescription ||
      p.focusKeyword !== seo.focusKeyword
    )
  })
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}${changed.length} article(s) to update`)
  if (DRY_RUN) return

  for (const post of changed) {
    const seo = BLOG_SEO[post.slug]!
    await db.blogPost.update({
      where: { id: post.id },
      data: {
        seoTitle: seo.seoTitle,
        seoDescription: seo.seoDescription,
        focusKeyword: seo.focusKeyword,
        seoUpdatedAt: new Date(),
      },
    })
    console.log(`  ✓ /blog/${post.slug}`)
  }

  console.log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
