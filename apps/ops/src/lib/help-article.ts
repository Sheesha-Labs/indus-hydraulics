/**
 * The plain body format help articles use (S04-T08): the first paragraph is the intro, lines "1. …" are numbered
 * points, and a line starting "Later:" is a not-in-this-release note. Pure, so the panel and its test share it.
 */
export type ParsedArticle = { intro: string; points: string[]; later: string | null }

export function parseArticle(body: string): ParsedArticle {
  const blocks = body.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const intro = (blocks[0] ?? '').trim()
  const points: string[] = []
  let later: string | null = null
  for (const line of blocks.slice(1).join('\n').split('\n')) {
    const t = line.trim()
    const numbered = /^\d+\.\s+(.*)$/.exec(t)
    if (numbered) points.push(numbered[1]!)
    else if (t.toLowerCase().startsWith('later:')) later = t.slice(6).trim()
  }
  return { intro, points, later }
}
