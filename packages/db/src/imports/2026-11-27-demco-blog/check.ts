/**
 * Offline check for one or more article files: schema, lengths and link targets.
 * No database. Link targets are checked against a JSON list passed with --known=<path>
 * ({ products: string[], categories: string[], posts: string[], skus: string[] }).
 *
 *   pnpm --filter @indus/db exec tsx src/imports/2026-11-27-demco-blog/check.ts --known=/abs/known.json articles/a.ts ...
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { BlogBlocksSchema } from '@indus/domain'

import type { BlogArticleSeed } from './shared'

const known = JSON.parse(
  readFileSync(process.argv.find((a) => a.startsWith('--known='))!.slice('--known='.length), 'utf8')
) as { products: string[]; categories: string[]; posts: string[]; skus: string[] }
const P = new Set(known.products)
const C = new Set(known.categories)
const B = new Set(known.posts)
const S = new Set(known.skus)

async function main(): Promise<void> {
  let bad = 0
  for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
    const a = ((await import(resolve(__dirname, f))) as { default: BlogArticleSeed }).default
    const errs: string[] = []
    const r = BlogBlocksSchema.safeParse(a.bodyBlocks)
    if (!r.success) for (const i of r.error.issues) errs.push(`bodyBlocks.${i.path.join('.')}: ${i.message}`)
    if ((a.seoTitle ?? '').length > 60) errs.push(`seoTitle ${a.seoTitle!.length} > 60`)
    if ((a.seoDescription ?? '').length > 155) errs.push(`seoDescription ${a.seoDescription!.length} > 155`)
    if (a.excerpt.length > 320) errs.push(`excerpt ${a.excerpt.length} > 320`)
    const text = JSON.stringify(a.bodyBlocks)
    for (const m of text.matchAll(/href=\\"\/(p|c|blog)\/([^"\\#?]+)/g)) {
      const [, kind, slug] = m
      if (kind === 'p' && !P.has(slug!)) errs.push(`unknown product link /p/${slug}`)
      if (kind === 'c' && !C.has(slug!)) errs.push(`unknown category link /c/${slug}`)
      if (kind === 'blog' && !B.has(slug!) && !slug!.startsWith('c/')) errs.push(`unknown article link /blog/${slug}`)
    }
    for (const b of a.bodyBlocks as Array<Record<string, unknown>>) {
      if (b.type === 'product_embed') for (const s of b.skus as string[]) if (!S.has(s)) errs.push(`unknown SKU ${s}`)
      if (b.type === 'category_link' && !C.has(b.slug as string)) errs.push(`unknown category_link ${String(b.slug)}`)
      if (b.type === 'related_articles') for (const s of b.slugs as string[]) if (!B.has(s)) errs.push(`unknown related ${s}`)
    }
    console.log(`${errs.length ? '✗' : '✓'} ${a.slug}${errs.length ? '' : ` (${text.length} chars)`}`)
    for (const e of errs) console.log(`    ${e}`)
    bad += errs.length
  }
  process.exitCode = bad ? 1 : 0
}

void main()
