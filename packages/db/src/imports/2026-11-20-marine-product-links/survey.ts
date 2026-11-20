import '../2026-05-11-service-cases-launch/load-env-stub'
import { db } from '../../index'
import { writeFileSync } from 'node:fs'
async function main() {
  const cats = await db.category.findMany({ select: { id: true, slug: true, parentId: true } })
  const root = cats.find((c) => c.slug === 'marine-equipment-uae')!
  const ids = new Set([root.id]); let grew = true
  while (grew) { grew = false; for (const c of cats) if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) { ids.add(c.id); grew = true } }
  const slugOf = new Map(cats.map((c) => [c.id, c.slug]))
  const prods = await db.product.findMany({ where: { status: 'active', categoryId: { in: [...ids] } }, select: { sku: true, slug: true, title: true, categoryId: true, robotsIndex: true } })
  const posts = await db.blogPost.findMany({ where: { isPublished: true, deletedAt: null }, select: { slug: true, title: true, bodyBlocks: true } })
  const linked = new Set<string>(); const skus = new Set<string>()
  const embeds: Record<string, string[][]> = {}
  for (const p of posts) {
    const s = JSON.stringify(p.bodyBlocks)
    for (const m of s.matchAll(/href=\\"\/p\/([a-z0-9-]+)/g)) linked.add(m[1]!)
    for (const b of (p.bodyBlocks as any[]) ?? []) if (b?.type === 'product_embed') { for (const k of b.skus) skus.add(k); (embeds[p.slug] ??= []).push(b.skus) }
  }
  const unl = prods.filter((p) => !linked.has(p.slug) && !skus.has(p.sku)).map((p) => ({ ...p, cat: slugOf.get(p.categoryId!) }))
  const marinePosts = posts.filter((p) => /anchor|chain|moor|fender|bollard|shackle|swivel|buoy|marine|offshore|towing|winch/i.test(p.slug))
  writeFileSync(process.argv[2]!, JSON.stringify({ total: prods.length, unl, posts: marinePosts.map((p) => ({ slug: p.slug, title: p.title, embeds: embeds[p.slug] ?? [], text: (p.bodyBlocks as any[]).filter((b) => b.html).map((b) => `[${b.type}] ` + b.html.replace(/<[^>]+>/g, '')).join('\n') })) }, null, 1))
  console.log(prods.length, 'active marine;', unl.length, 'unlinked;', marinePosts.length, 'candidate posts')
}
main().finally(() => db.$disconnect())
