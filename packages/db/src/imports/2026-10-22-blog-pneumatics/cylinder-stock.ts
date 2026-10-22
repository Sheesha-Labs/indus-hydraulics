import type { BlogArticleSeed } from './shared'
import { stockList } from './products'

/**
 * The full `pneumatic-cylinders` shelf as prose blocks.
 *
 * `stockList(['pneumatic-cylinders'])` is about 35,000 characters (207 listings), and a `prose` block is capped at
 * 20,000 by ProseBlockSchema — one block would fail validation at import. So the list is taken from `stockList`
 * unchanged, split into its `<li>` items, grouped by maker series under an `<h3>`, and chunked so no block passes the
 * cap. A guard throws if any listing is dropped or duplicated, so every listing on the shelf is still linked.
 */
type Block = BlogArticleSeed['bodyBlocks'][number]

const PROSE_MAX = 19_500

const GROUPS: { heading: string; test: (title: string) => boolean }[] = [
  { heading: 'Parker 4MA NFPA tie-rod cylinders', test: (t) => /^Parker 4MA /.test(t) && !/1P Part Numbers/.test(t) },
  { heading: 'Parker 4MA NFPA tie-rod cylinders, 1P part numbers', test: (t) => /^Parker 4MA /.test(t) && /1P Part Numbers/.test(t) },
  { heading: 'Parker 2MNR non-rotating tie-rod cylinders', test: (t) => /^Parker 2MNR /.test(t) },
  { heading: 'Parker P1D and P1F ISO 15552 cylinders', test: (t) => /^Parker P1[DF] /.test(t) },
  { heading: 'Parker round-body cylinders: SR family, S Series and P1A', test: (t) => /^Parker (SR|SRD|SRDM|SRG|SRGM|SRM|S|P1A) Series/.test(t) },
  { heading: 'Parker compact and guided cylinders: LP, LPM, HB and P5E', test: (t) => /^Parker (LP|LPM|HB|P5E) Series/.test(t) },
  { heading: 'Destaco cylinders', test: (t) => /^Destaco /.test(t) },
]

const titleOf = (li: string) =>
  (li.match(/<a [^>]*>([^<]*)<\/a>/)?.[1] ?? '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

/** Prose blocks linking every listing on the cylinder shelf; `intro` is HTML placed at the top of the first block. */
export function cylinderStockBlocks(intro: string): Block[] {
  const items = stockList(['pneumatic-cylinders']).match(/<li>.*?<\/li>/g) ?? []
  const blocks: Block[] = []
  let used = 0
  let html = intro
  const flush = () => {
    if (html) blocks.push({ type: 'prose', html })
    html = ''
  }
  for (const group of GROUPS) {
    const mine = items.filter((li) => group.test(titleOf(li)))
    if (mine.length === 0) continue
    used += mine.length
    const head = `<h3>${group.heading}</h3><p>${mine.length} listing${mine.length === 1 ? '' : 's'}.</p>`
    let list = ''
    const close = () => {
      if (list) html += `<ul>${list}</ul>`
      list = ''
    }
    if (html.length + head.length + 200 > PROSE_MAX) flush()
    html += head
    for (const li of mine) {
      if (html.length + list.length + li.length + 10 > PROSE_MAX) {
        close()
        flush()
        html = `<h3>${group.heading} (continued)</h3>`
      }
      list += li
    }
    close()
  }
  flush()
  if (used !== items.length) {
    throw new Error(`cylinderStockBlocks: ${items.length} listings on the shelf but ${used} grouped — update GROUPS`)
  }
  return blocks
}
