import 'server-only'
import { opsDb } from '@indus/ops-db'
import { parseArticle, type ParsedArticle } from '../lib/help-article'

/** One published help article, parsed (S04-T08 board 88). Null when it is missing or unpublished. */
export async function getHelpArticle(slug: string): Promise<(ParsedArticle & { title: string }) | null> {
  const row = await opsDb.helpArticle.findUnique({
    where: { slug },
    select: { title: true, body: true, published: true },
  })
  if (!row?.published) return null
  return { title: row.title, ...parseArticle(row.body) }
}
