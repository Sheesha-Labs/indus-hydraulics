/**
 * Database-side fixes from the 2026-10-05 SEO audit. No deploy: every change
 * here is content the storefront already reads.
 *
 *   slug     — retire the "compostie" product URL with a 301 (slug-and-order.ts)
 *   order    — lead the homepage with the hose shelves and lifting (slug-and-order.ts)
 *   links    — catalogue links in the 26 articles that had none, plus three
 *              duplicated lead sentences (post-links.ts)
 *   copy     — guidance, standards and FAQ for 22 hose shelves (category-copy.ts)
 *   copy2    — the second batch: 60 more hose shelves (category-copy-batch-2.ts)
 *   shortfix — two category blurbs that stated something wrong (category-copy-batch-2.ts)
 *   merge    — eight single-product shelves folded into their parents (merge-and-asme.ts)
 *   asme     — five flange products citing ASTM B16.5 for ASME B16.5 (merge-and-asme.ts)
 *   reorder  — the 43 lifting shelf documents were stored with only their
 *              written sections, and stored sections render first, so their
 *              guidance, standards and FAQ appeared ABOVE the page heading and
 *              the products. They are rewritten in template order, content
 *              unchanged.
 *
 * Everything is validated before anything is written: every SKU and category
 * exists and is live, every phrase is found, every block parses, every shelf
 * document passes the Pages & Blocks field limits. Then each step writes in
 * its own transaction.
 *
 * Caches are not purged — no script can reach the Next runtime, and a mass
 * purge would cold every page at once, which is the cost the batch-deploy rule
 * exists to avoid. Changes go live as caches expire: the redirect within a
 * minute, the homepage within about two hours, articles within an hour, shelf
 * pages within a day.
 *
 * Run with (DATABASE_URL inline when the worktree has no .env):
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-seo-content-fixes/run.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-10-06-seo-content-fixes/run.ts
 *   … --only=links,copy   to run a subset
 *
 * Each step refuses to overwrite work it finds already done, so a full re-run
 * fails validation once a step has been applied; run later steps with --only.
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import {
  BlogBlocksSchema,
  CATEGORY_SECTIONS,
  categoryPageDef,
  subPageContentKey,
  validateSections,
  type BlogBlocks,
  type BlogBlockInput,
  type StoredSection,
} from '@indus/domain'
import type { Prisma } from '@prisma/client'

import { db } from '../../index'
import { syncBlogPostLinks } from '../../blog-links'
import { CATEGORY_COPY, type CategoryCopy } from './category-copy'
import { CATEGORY_COPY_BATCH_2, SHORT_DESCRIPTION_FIXES } from './category-copy-batch-2'
import { linkFirstOccurrence, linksTo } from './link-html'
import { DEDUPES, POST_LINK_PLANS } from './post-links'
import { applySlugFix, applyTopLevelOrder } from './slug-and-order'
import { applyAsme, applyMerges, checkAsme, checkMerges } from './merge-and-asme'

const DRY_RUN = process.argv.includes('--dry-run')
const ONLY = (() => {
  const arg = process.argv.find((a) => a.startsWith('--only='))
  return arg ? new Set(arg.slice('--only='.length).split(',')) : null
})()
const runs = (step: string) => !ONLY || ONLY.has(step)

const log = (line: string) => console.log(line)

// ── links ────────────────────────────────────────────────────────────────────

type PlannedPost = { id: string; slug: string; blocks: BlogBlocks; body: string | null; changes: string[] }

async function planPostLinks(errors: string[]): Promise<PlannedPost[]> {
  const slugs = [...new Set([...Object.keys(POST_LINK_PLANS), ...Object.keys(DEDUPES)])]
  const posts = await db.blogPost.findMany({
    where: { slug: { in: slugs }, isPublished: true, deletedAt: null },
    select: { id: true, slug: true, bodyBlocks: true, body: true },
  })
  const bySlug = new Map(posts.map((p) => [p.slug, p]))
  for (const slug of slugs) if (!bySlug.has(slug)) errors.push(`links: post ${slug} not found or not live`)

  // Every reference the plans make, checked against the live tables.
  const skus = [...new Set(Object.values(POST_LINK_PLANS).flatMap((p) => p.embed?.skus ?? []))]
  const categorySlugs = new Set<string>()
  const articleSlugs = new Set<string>()
  for (const plan of Object.values(POST_LINK_PLANS)) {
    for (const c of plan.categories) categorySlugs.add(c.slug)
    for (const link of plan.inline) {
      if (link.href.startsWith('/c/')) categorySlugs.add(link.href.slice(3))
      else if (link.href.startsWith('/blog/')) articleSlugs.add(link.href.slice(6))
      else errors.push(`links: unsupported href ${link.href}`)
    }
  }
  const [liveProducts, liveCategories, liveArticles] = await Promise.all([
    db.product.findMany({ where: { sku: { in: skus }, status: 'active' }, select: { sku: true } }),
    db.category.findMany({ where: { slug: { in: [...categorySlugs] }, isPublished: true }, select: { slug: true } }),
    db.blogPost.findMany({ where: { slug: { in: [...articleSlugs] }, isPublished: true }, select: { slug: true } }),
  ])
  const okSku = new Set(liveProducts.map((p) => p.sku))
  const okCat = new Set(liveCategories.map((c) => c.slug))
  const okArticle = new Set(liveArticles.map((a) => a.slug))
  for (const sku of skus) if (!okSku.has(sku)) errors.push(`links: SKU ${sku} not active`)
  for (const slug of categorySlugs) if (!okCat.has(slug)) errors.push(`links: category ${slug} not published`)
  for (const slug of articleSlugs) if (!okArticle.has(slug)) errors.push(`links: article ${slug} not published`)

  const planned: PlannedPost[] = []
  for (const slug of slugs) {
    const post = bySlug.get(slug)
    if (!post) continue
    const blocks = (Array.isArray(post.bodyBlocks) ? post.bodyBlocks : []) as BlogBlockInput[]
    let next: BlogBlockInput[] = blocks.map((b) => ({ ...b }) as BlogBlockInput)
    let body = post.body
    const changes: string[] = []

    const dedupe = DEDUPES[slug]
    if (dedupe) {
      const index = next.findIndex((b) => b.type === dedupe.blockType)
      const block = next[index] as { html?: string } | undefined
      if (!block?.html) {
        errors.push(`links: ${slug} has no ${dedupe.blockType} block`)
      } else if (dedupe.remove) {
        if (!block.html.includes(dedupe.remove)) errors.push(`links: ${slug} lead does not contain the duplicate`)
        else {
          ;(next[index] as { html: string }).html = block.html.replace(dedupe.remove, '')
          if (body?.includes(dedupe.remove)) body = body.replace(dedupe.remove, '')
          changes.push('lead: duplicate sentence removed')
        }
      } else if (dedupe.replace) {
        const [from, to] = dedupe.replace
        if (!block.html.includes(from)) errors.push(`links: ${slug} lead does not contain the passage to replace`)
        else {
          ;(next[index] as { html: string }).html = block.html.replace(from, to)
          if (body?.includes(from)) body = body.replace(from, to)
          changes.push('lead: repeated clause removed')
        }
      }
    }

    const plan = POST_LINK_PLANS[slug]
    if (plan) {
      if (next.some((b) => b.type === 'product_embed' || b.type === 'category_link')) {
        errors.push(`links: ${slug} already carries catalogue blocks — refusing to add a second set`)
        continue
      }
      // Inline links, in paragraph blocks only, first occurrence in page order.
      for (const link of plan.inline) {
        let done = false
        for (let i = 0; i < next.length && !done; i++) {
          const b = next[i] as { type: string; html?: string }
          if (b.type !== 'paragraph' || !b.html || linksTo(b.html, link.href)) continue
          const result = linkFirstOccurrence(b.html, link.phrase, link.href)
          if (result.linked) {
            ;(next[i] as { html: string }).html = result.html
            done = true
          }
        }
        if (done) changes.push(`inline: "${link.phrase}" → ${link.href}`)
        else errors.push(`links: ${slug} — phrase not found in a paragraph: "${link.phrase}"`)
      }

      // product_embed immediately before the FAQ; category links after it —
      // the placement the rest of the blog uses.
      const faqIndex = next.findIndex((b) => b.type === 'faq_block')
      if (faqIndex === -1) {
        errors.push(`links: ${slug} has no faq_block to anchor the catalogue blocks`)
        continue
      }
      const categoryBlocks: BlogBlockInput[] = plan.categories.map(
        (c) => ({ type: 'category_link', slug: c.slug, label: c.label, blurb: c.blurb }) as BlogBlockInput,
      )
      const embedBlocks: BlogBlockInput[] = plan.embed
        ? [
            {
              type: 'product_embed',
              heading: plan.embed.heading,
              skus: plan.embed.skus,
              ...(plan.embed.note ? { note: plan.embed.note } : {}),
            } as BlogBlockInput,
          ]
        : []
      next = [
        ...next.slice(0, faqIndex),
        ...embedBlocks,
        next[faqIndex]!,
        ...categoryBlocks,
        ...next.slice(faqIndex + 1),
      ]
      if (plan.embed) changes.push(`embed: ${plan.embed.skus.join(', ')}`)
      changes.push(`categories: ${plan.categories.map((c) => c.slug).join(', ')}`)
    }

    const parsed = BlogBlocksSchema.safeParse(next)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors.push(`links: ${slug} ${issue.path.join('.')}: ${issue.message}`)
      continue
    }
    planned.push({ id: post.id, slug, blocks: parsed.data, body, changes })
  }
  return planned
}

// ── copy + reorder ───────────────────────────────────────────────────────────

/** A full shelf document in template order, from the copy for one category. */
function documentFromCopy(copy: CategoryCopy): StoredSection[] {
  return CATEGORY_SECTIONS.map((def) => {
    const values: Record<string, unknown> = {}
    if (def.key === 'guidance' && copy.guidance) Object.assign(values, copy.guidance)
    if (def.key === 'standards' && copy.standards) Object.assign(values, copy.standards)
    if (def.key === 'service' && copy.service) Object.assign(values, copy.service)
    if (def.key === 'faq' && copy.faq) values.items = copy.faq
    return { key: def.key, enabled: true, values } as StoredSection
  })
}

/** An existing document's sections, padded and put in template order. */
function documentInTemplateOrder(stored: StoredSection[]): StoredSection[] {
  const byKey = new Map(stored.map((s) => [s.key, s]))
  return CATEGORY_SECTIONS.map(
    (def) => byKey.get(def.key) ?? ({ key: def.key, enabled: true, values: {} } as StoredSection),
  )
}

function isInTemplateOrder(stored: StoredSection[]): boolean {
  const keys = stored.map((s) => s.key)
  const template = CATEGORY_SECTIONS.map((d) => d.key)
  return keys.length === template.length && keys.every((k, i) => k === template[i])
}

type PlannedDoc = { key: string; slug: string; sections: StoredSection[]; mode: 'create' | 'reorder' }

async function planCategoryDocs(
  errors: string[],
  step: 'copy' | 'copy2' | 'reorder',
): Promise<PlannedDoc[]> {
  const planned: PlannedDoc[] = []
  if (step === 'copy' || step === 'copy2') {
    const copyMap = step === 'copy' ? CATEGORY_COPY : CATEGORY_COPY_BATCH_2
    const slugs = Object.keys(copyMap)
    const [categories, existing] = await Promise.all([
      db.category.findMany({ where: { slug: { in: slugs }, isPublished: true }, select: { slug: true, name: true } }),
      db.pageContent.findMany({
        where: { key: { in: slugs.map((s) => subPageContentKey('category', s)) } },
        select: { key: true },
      }),
    ])
    const bySlug = new Map(categories.map((c) => [c.slug, c]))
    const taken = new Set(existing.map((e) => e.key))
    for (const slug of slugs) {
      const category = bySlug.get(slug)
      if (!category) {
        errors.push(`${step}: category ${slug} not published`)
        continue
      }
      const key = subPageContentKey('category', slug)
      if (taken.has(key)) {
        // Somebody has written this shelf since the audit; their words win.
        errors.push(`${step}: ${key} already has a document — not overwriting it`)
        continue
      }
      const result = validateSections(categoryPageDef(category), documentFromCopy(copyMap[slug]!))
      if (!result.ok) {
        for (const issue of result.issues) errors.push(`${step}: ${slug} — ${issue.section} · ${issue.field}: ${issue.message}`)
        continue
      }
      planned.push({ key, slug, sections: result.sections, mode: 'create' })
    }
  } else {
    const docs = await db.pageContent.findMany({
      where: { kind: 'category', updatedById: null },
      select: { key: true, sections: true },
    })
    for (const doc of docs) {
      const stored = (Array.isArray(doc.sections) ? doc.sections : []) as StoredSection[]
      if (isInTemplateOrder(stored)) continue
      const slug = doc.key.slice('category/'.length)
      planned.push({ key: doc.key, slug, sections: documentInTemplateOrder(stored), mode: 'reorder' })
    }
  }
  return planned
}

// ── shortfix ─────────────────────────────────────────────────────────────────

type PlannedBlurb = { slug: string; shortDescription: string }

async function planShortFixes(errors: string[]): Promise<PlannedBlurb[]> {
  const slugs = Object.keys(SHORT_DESCRIPTION_FIXES)
  const rows = await db.category.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, shortDescription: true },
  })
  const bySlug = new Map(rows.map((r) => [r.slug, r.shortDescription ?? '']))
  const planned: PlannedBlurb[] = []
  for (const slug of slugs) {
    const fix = SHORT_DESCRIPTION_FIXES[slug]!
    const current = bySlug.get(slug)
    if (current === undefined) errors.push(`shortfix: category ${slug} not found`)
    else if (current === fix.replaceWith) continue
    else if (!current.includes(fix.contains)) {
      errors.push(`shortfix: ${slug} no longer says "${fix.contains}" — edited since; leaving it`)
    } else planned.push({ slug, shortDescription: fix.replaceWith })
  }
  return planned
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const errors: string[] = []

  const posts = runs('links') ? await planPostLinks(errors) : []
  const copyDocs = [
    ...(runs('copy') ? await planCategoryDocs(errors, 'copy') : []),
    ...(runs('copy2') ? await planCategoryDocs(errors, 'copy2') : []),
  ]
  const blurbs = runs('shortfix') ? await planShortFixes(errors) : []
  const mergeCheck = runs('merge') ? await checkMerges(db) : { problems: [], summary: [] }
  const asmeCheck = runs('asme') ? await checkAsme(db) : { problems: [], summary: [] }
  errors.push(...mergeCheck.problems, ...asmeCheck.problems)
  for (const line of [...mergeCheck.summary, ...asmeCheck.summary]) log(line)
  const reorderDocs = runs('reorder') ? await planCategoryDocs(errors, 'reorder') : []

  for (const p of posts) log(`links: /blog/${p.slug}\n  ${p.changes.join('\n  ')}`)
  for (const d of copyDocs) log(`copy: ${d.key} (${d.sections.filter((s) => Object.keys(s.values).length).map((s) => s.key).join(', ')})`)
  log(`reorder: ${reorderDocs.length} shelf documents out of template order`)
  for (const b of blurbs) log(`shortfix: ${b.slug}`)

  if (errors.length > 0) {
    console.error(`\n${errors.length} problem(s) — nothing written:\n  ${errors.join('\n  ')}`)
    process.exit(1)
  }
  if (DRY_RUN) {
    log('\n--dry-run: validated, nothing written')
    return
  }

  if (runs('slug')) await db.$transaction((tx: Prisma.TransactionClient) => applySlugFix(tx, log))
  if (runs('order')) await db.$transaction((tx: Prisma.TransactionClient) => applyTopLevelOrder(tx, log))

  for (const p of posts) {
    await db.blogPost.update({
      where: { id: p.id },
      data: { bodyBlocks: p.blocks as unknown as Prisma.InputJsonValue, ...(p.body != null ? { body: p.body } : {}) },
    })
    await syncBlogPostLinks(p.id, p.blocks)
  }
  if (posts.length) log(`links: ${posts.length} articles written and their catalogue links synced`)

  for (const d of copyDocs) {
    await db.pageContent.create({
      data: { key: d.key, kind: 'category', sections: d.sections as unknown as Prisma.InputJsonValue },
    })
  }
  if (copyDocs.length) {
    // The shelf's sitemap <lastmod> is `contentUpdatedAt`, which the category
    // triggers maintain from the category row — a new Pages & Blocks document
    // does not reach it. These pages genuinely gained several hundred words,
    // so they are dated now, and the crawler is told to come back. The
    // reordered lifting documents are NOT re-dated: their words did not change.
    await db.category.updateMany({
      where: { slug: { in: copyDocs.map((d) => d.slug) } },
      data: { contentUpdatedAt: new Date() },
    })
    log(`copy: ${copyDocs.length} shelf documents created and their categories re-dated`)
  }

  if (runs('merge')) await applyMerges(db, log)
  if (runs('asme')) await applyAsme(db, log)

  for (const b of blurbs) {
    await db.category.update({ where: { slug: b.slug }, data: { shortDescription: b.shortDescription } })
  }
  if (blurbs.length) log(`shortfix: ${blurbs.length} category blurbs corrected`)

  for (const d of reorderDocs) {
    await db.pageContent.update({
      where: { key: d.key },
      data: { sections: d.sections as unknown as Prisma.InputJsonValue },
    })
  }
  if (reorderDocs.length) log(`reorder: ${reorderDocs.length} shelf documents rewritten in template order`)

  log('done')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
