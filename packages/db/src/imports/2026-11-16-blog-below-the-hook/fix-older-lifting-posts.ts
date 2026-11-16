/**
 * Two older lifting posts written before the Below-the-Hook Lifting group existed:
 *
 * - `lifting-chillers-and-rooftop-plant` said "Our range does not include spreader beams". It now links
 *   the spreader beam and frame shelves and the new AHU lifting-bar article.
 * - `sling-angle-chart` ended its inward-force section with "Spreader beams exist to take this force out
 *   of the load." It now links the new compression article.
 *
 * Both also gain the new articles in `related_articles`. Edits the stored bodies (later fill-ins live
 * there, not in the seeds). Idempotent: each edit checks for its own result first. Validates with
 * BlogBlocksSchema and resyncs the link table. Run after ./run.ts --publish, so the links resolve.
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-16-blog-below-the-hook/fix-older-lifting-posts.ts --dry-run
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-16-blog-below-the-hook/fix-older-lifting-posts.ts
 */
import '../2026-05-11-service-cases-launch/load-env-stub'

import { Prisma } from '@prisma/client'
import { BlogBlocksSchema, estimateReadingMinutes } from '@indus/domain'

import { db } from '../../index'
import { syncBlogPostLinks } from '../../blog-links'

type Block = Record<string, unknown> & { type: string }

const DRY_RUN = process.argv.includes('--dry-run')

const EDITS: Record<string, { text: [string, string][]; related: string[] }> = {
  'lifting-chillers-and-rooftop-plant': {
    text: [
      [
        'Our range does not include spreader beams, but covers the rest:',
        'For the beam itself we list <a href="/c/spreader-beams">spreader beams</a> and <a href="/c/spreader-frames-h-frames">spreader frames</a>; for units lifted through holes in the base frame, see <a href="/blog/lifting-bars-for-air-handling-units">lifting bars for air handling units</a>. The rest of the rig:',
      ],
    ],
    related: ['lifting-bars-for-air-handling-units', 'spreader-beam-vs-lifting-beam'],
  },
  'sling-angle-chart': {
    text: [
      [
        'Spreader beams exist to take this force out of the load.',
        'Spreader beams exist to take this force out of the load — how much it is, and where it goes, is in <a href="/blog/sling-angle-compression-force">sling angle compression force</a>.',
      ],
    ],
    related: ['sling-angle-compression-force', 'spreader-beam-vs-lifting-beam'],
  },
}

function applyText(blocks: Block[], pairs: [string, string][]): Block[] {
  let s = JSON.stringify(blocks)
  for (const [from, to] of pairs) {
    const f = JSON.stringify(from).slice(1, -1)
    const t = JSON.stringify(to).slice(1, -1)
    if (s.includes(t)) continue
    if (s.includes(f)) s = s.split(f).join(t)
    else console.warn(`  ! text not found, edit skipped: ${from.slice(0, 70)}…`)
  }
  return JSON.parse(s) as Block[]
}

function applyRelated(blocks: Block[], add: string[]): Block[] {
  return blocks.map((b) => {
    if (b.type !== 'related_articles') return b
    const slugs = (b.slugs as string[]) ?? []
    const merged = [...add.filter((s) => !slugs.includes(s)), ...slugs].slice(0, 6)
    return { ...b, slugs: merged }
  })
}

async function main(): Promise<void> {
  const targets = await db.blogPost.findMany({
    where: { slug: { in: Object.keys(EDITS) } },
    select: { id: true, slug: true, bodyBlocks: true },
  })
  const needed = [...new Set(Object.values(EDITS).flatMap((e) => e.related))]
  const live = await db.blogPost.findMany({ where: { slug: { in: needed }, status: 'published' }, select: { slug: true } })
  if (live.length !== needed.length && !DRY_RUN) {
    console.error('Refusing to run: publish the new articles first (./run.ts --publish).')
    process.exitCode = 1
    return
  }

  for (const post of targets) {
    const edit = EDITS[post.slug]!
    const before = post.bodyBlocks as unknown as Block[]
    const after = applyRelated(applyText(before, edit.text), edit.related)
    const parsed = BlogBlocksSchema.safeParse(after)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) console.error(`[${post.slug}] ${issue.path.join('.')}: ${issue.message}`)
      process.exitCode = 1
      return
    }
    const changed = JSON.stringify(parsed.data) !== JSON.stringify(BlogBlocksSchema.parse(before))
    console.log(`${DRY_RUN ? '[dry-run] ' : ''}${post.slug}: ${changed ? 'changed' : 'already up to date'}`)
    if (DRY_RUN || !changed) continue
    await db.blogPost.update({
      where: { id: post.id },
      data: {
        bodyBlocks: JSON.parse(JSON.stringify(parsed.data)) as Prisma.InputJsonValue,
        readingMinutes: estimateReadingMinutes(parsed.data),
      },
    })
    await syncBlogPostLinks(post.id, parsed.data)
    console.log(`  ✓ /blog/${post.slug}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
