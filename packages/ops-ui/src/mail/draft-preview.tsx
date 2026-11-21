import { createElement, type ReactNode } from 'react'

// A read-only rendering of the Composer's initial HTML for the moment before the editor mounts (server render
// and first paint), so the composer has its real height from the start. It builds React elements from the
// editor's own tag set (p, br, strong/b, em/i, ul, li, a) and drops every other tag, keeping its text. Text is
// React text (escaped), attributes other than a safe href are never copied, and nothing is set as innerHTML.

const TAGS: Record<string, string> = {
  p: 'p',
  br: 'br',
  strong: 'strong',
  b: 'strong',
  em: 'em',
  i: 'em',
  ul: 'ul',
  li: 'li',
  a: 'a',
}
const VOID = new Set(['br'])

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: String.fromCharCode(160),
}

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code =
        e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })
}

/** http(s) and mailto only, as the editor's link extension allows. */
function safeHref(attrs: string): string | undefined {
  const m = /\bhref\s*=\s*("([^"]*)"|'([^']*)')/i.exec(attrs)
  const href = decode((m?.[2] ?? m?.[3] ?? '').trim())
  return /^(https?:|mailto:)/i.test(href) ? href : undefined
}

interface Node {
  tag: string
  href?: string | undefined
  children: ReactNode[]
}

export function draftPreview(html: string): ReactNode[] {
  const root: Node = { tag: '#root', children: [] }
  const stack: Node[] = [root]
  const top = () => stack[stack.length - 1]!
  let key = 0
  const close = (node: Node) =>
    createElement(
      node.tag,
      { key: key++, ...(node.tag === 'a' && node.href ? { href: node.href } : {}) },
      ...node.children
    )
  const re = /<(\/?)([a-z][a-z0-9]*)\b([^>]*)>|<!--[\s\S]*?-->/gi
  let last = 0
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (m.index > last) top().children.push(decode(html.slice(last, m.index)))
    last = re.lastIndex
    const [, slash, rawName = '', attrs = ''] = m
    if (!slash && /^(script|style|title|template)$/i.test(rawName)) {
      // Raw-text elements: their content is not text to show.
      const end = html.toLowerCase().indexOf(`</${rawName.toLowerCase()}`, last)
      const gt = end < 0 ? -1 : html.indexOf('>', end)
      last = re.lastIndex = gt < 0 ? html.length : gt + 1
      continue
    }
    const tag = TAGS[rawName.toLowerCase()]
    if (!rawName || !tag) continue
    if (VOID.has(tag)) {
      if (!slash) top().children.push(createElement(tag, { key: key++ }))
      continue
    }
    if (!slash) {
      stack.push({ tag, ...(tag === 'a' ? { href: safeHref(attrs) } : {}), children: [] })
      continue
    }
    const at = stack.map((n) => n.tag).lastIndexOf(tag)
    if (at <= 0) continue
    while (stack.length > at) {
      const node = stack.pop()!
      top().children.push(close(node))
    }
  }
  if (last < html.length) top().children.push(decode(html.slice(last)))
  while (stack.length > 1) {
    const node = stack.pop()!
    top().children.push(close(node))
  }
  return root.children
}
