import type { BlogBlockInput, BlogBlocks } from '@indus/domain'
import { mediaUrl } from './media'

/**
 * Translation between stored `bodyBlocks` and the editor's document.
 *
 * Two directions, two representations, on purpose:
 *
 *   blocks → HTML   TipTap parses HTML natively through each node's
 *                   `parseHTML`, using the browser's own DOM. Handing it a
 *                   string is therefore far less code than assembling a
 *                   ProseMirror JSON tree, and it means `prose` blocks — which
 *                   are already HTML — pass straight through.
 *
 *   JSON → blocks   Going the other way, `editor.getJSON()` is a typed tree
 *                   and walking it is exact. Parsing the editor's HTML output
 *                   back into blocks would need an HTML parser on the server
 *                   and would re-derive information the tree already states.
 *
 * Both functions are pure so they can be unit-tested without a DOM, which
 * matters more here than usual: a bug in either direction silently rewrites an
 * author's article on save.
 */

// ── Minimal ProseMirror JSON types ────────────────────────────────────────
// Structural only. The editor's own types would drag @tiptap/core into the
// server bundle for the sake of three field names.

export type EditorMark = {
  type: string
  attrs?: Record<string, unknown> | null
}

export type EditorNode = {
  type?: string
  text?: string
  marks?: EditorMark[] | null
  attrs?: Record<string, unknown> | null
  content?: EditorNode[] | null
}

/** Node names that are structured blocks in disguise, not prose. */
const FIGURE_NODE = 'figureImage'
const STRUCTURED_NODE = 'structuredBlock'
const LEAD_NODE = 'leadParagraph'

// ── blocks → editor HTML ──────────────────────────────────────────────────

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** Escape text destined for element content or an attribute value. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c)
}

export function blocksToEditorHtml(blocks: BlogBlocks): string {
  return blocks.map(blockToHtml).join('\n')
}

function blockToHtml(block: BlogBlocks[number]): string {
  switch (block.type) {
    case 'section_head':
      // The anchor rides along so an existing heading keeps the URL fragment
      // it was published with. Re-deriving it from the title on every save
      // would break every inbound deep link the moment a typo is fixed.
      return `<h2 data-anchor="${escapeHtml(block.anchor)}">${escapeHtml(block.title)}</h2>`
    case 'lead':
      return `<p data-lead="">${block.html}</p>`
    case 'paragraph':
      return `<p>${block.html}</p>`
    case 'prose':
      return block.html
    case 'figure':
      return [
        `<figure data-figure-image`,
        block.imageId ? ` data-storage-path="${escapeHtml(block.imageId)}"` : '',
        block.captionPrefix ? ` data-caption-prefix="${escapeHtml(block.captionPrefix)}"` : '',
        block.placeholderLabel
          ? ` data-placeholder-label="${escapeHtml(block.placeholderLabel)}"`
          : '',
        ` data-aspect-ratio="${escapeHtml(block.aspectRatio ?? '16/9')}"`,
        '>',
        // The `<img>` is the editor's preview and the source of the node's
        // `previewUrl` attribute. The durable value is the storage path on the
        // <figure>; this is rebuilt from it every time the editor opens, so a
        // change of bucket host cannot leave a body full of dead images.
        block.imageId ? `<img src="${escapeHtml(mediaUrl(block.imageId))}" alt="">` : '',
        `<figcaption>${escapeHtml(block.caption)}</figcaption></figure>`,
      ].join('')
    default:
      // Every other block type is carried verbatim inside an atom node. The
      // editor renders a card for it and cannot edit its fields yet, but the
      // data survives a round trip — which is the part that matters, because
      // the alternative is that opening an article in the editor and pressing
      // save deletes its comparison tables.
      return `<div data-blog-block="${escapeHtml(block.type)}" data-json="${escapeHtml(
        JSON.stringify(block),
      )}"></div>`
  }
}

// ── editor JSON → blocks ──────────────────────────────────────────────────

export function editorDocToBlocks(doc: EditorNode | null | undefined): BlogBlockInput[] {
  const out: BlogBlockInput[] = []
  /** Consecutive non-paragraph prose nodes — lists, sub-headings, quotes. */
  let proseRun: EditorNode[] = []
  let sectionNumber = 0
  const usedAnchors = new Set<string>()

  /**
   * A paragraph on its own stays a `paragraph` block; anything else joins the
   * `prose` block beside it.
   *
   * The split matters because every article written before this editor existed
   * is a list of `paragraph` blocks. Folding runs of them into one `prose`
   * block would rewrite the whole body the first time someone opened an
   * article — a diff nobody asked for, on rows that were fine.
   */
  const flushProse = () => {
    if (proseRun.length === 0) return
    const nodes = proseRun
    proseRun = []
    const html = nodes.map(blockNodeToHtml).filter(Boolean).join('')
    if (!html || isBlankFragment(html)) return
    out.push({ type: 'prose', html })
  }

  for (const node of doc?.content ?? []) {
    if (node.type === LEAD_NODE) {
      flushProse()
      const html = inlineToHtml(node.content ?? [])
      if (html.trim()) out.push({ type: 'lead', html })
      continue
    }

    if (node.type === 'heading' && Number(node.attrs?.level) === 2) {
      flushProse()
      const title = plainText(node.content ?? []).trim()
      if (!title) continue
      sectionNumber += 1
      out.push({
        type: 'section_head',
        number: `/${String(sectionNumber).padStart(2, '0')}`,
        title,
        anchor: uniqueAnchor(
          typeof node.attrs?.anchor === 'string' && node.attrs.anchor
            ? node.attrs.anchor
            : slugifyAnchor(title),
          usedAnchors,
        ),
      })
      continue
    }

    if (node.type === FIGURE_NODE) {
      flushProse()
      const caption = plainText(node.content ?? []).trim()
      // `caption` is required by the schema, and a figure with neither an
      // image nor a caption is an empty box — drop it rather than let the
      // server reject the whole save.
      if (!caption) continue
      out.push({
        type: 'figure',
        imageId: stringAttr(node, 'storagePath'),
        caption,
        captionPrefix: stringAttr(node, 'captionPrefix'),
        placeholderLabel: stringAttr(node, 'placeholderLabel'),
        aspectRatio: (stringAttr(node, 'aspectRatio') ?? '16/9') as '16/9' | '21/9' | '4/3' | '1/1',
      })
      continue
    }

    if (node.type === STRUCTURED_NODE) {
      flushProse()
      const data = node.attrs?.data
      if (data && typeof data === 'object') out.push(data as BlogBlockInput)
      continue
    }

    if (node.type === 'paragraph') {
      flushProse()
      const html = inlineToHtml(node.content ?? [])
      if (html.trim() && !isBlankFragment(html)) out.push({ type: 'paragraph', html })
      continue
    }

    proseRun.push(node)
  }

  flushProse()
  return out
}

/** Serialise one top-level prose node to HTML. */
function blockNodeToHtml(node: EditorNode): string {
  switch (node.type) {
    case 'paragraph': {
      const inner = inlineToHtml(node.content ?? [])
      return inner.trim() ? `<p>${inner}</p>` : ''
    }
    case 'heading': {
      const level = Number(node.attrs?.level) === 4 ? 4 : 3
      const inner = inlineToHtml(node.content ?? [])
      return inner.trim() ? `<h${level}>${inner}</h${level}>` : ''
    }
    case 'bulletList':
    case 'orderedList': {
      const tag = node.type === 'bulletList' ? 'ul' : 'ol'
      const items = (node.content ?? [])
        .map((li) => {
          // A listItem wraps its text in paragraphs; the `<p>` inside an `<li>`
          // adds a blank line on the article, so it is unwrapped here.
          const inner = (li.content ?? [])
            .map((child) =>
              child.type === 'paragraph' ? inlineToHtml(child.content ?? []) : blockNodeToHtml(child),
            )
            .join('')
          return inner.trim() ? `<li>${inner}</li>` : ''
        })
        .filter(Boolean)
        .join('')
      return items ? `<${tag}>${items}</${tag}>` : ''
    }
    case 'blockquote': {
      const inner = (node.content ?? []).map(blockNodeToHtml).join('')
      return inner.trim() ? `<blockquote>${inner}</blockquote>` : ''
    }
    case 'codeBlock': {
      const inner = escapeHtml(plainText(node.content ?? []))
      return inner.trim() ? `<pre><code>${inner}</code></pre>` : ''
    }
    case 'horizontalRule':
      // Not in the allow-list — a rule between sections is what section_head
      // already draws, and two of them stack.
      return ''
    default:
      return ''
  }
}

/** Serialise inline content — text with marks, and hard breaks. */
function inlineToHtml(nodes: EditorNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'hardBreak') return '<br>'
      if (typeof node.text !== 'string') return ''
      let html = escapeHtml(node.text)
      // Applied inside-out so the first mark ends up innermost, which keeps
      // `<a><strong>x</strong></a>` from becoming `<strong><a>x</a></strong>`
      // and back again on every save.
      for (const mark of node.marks ?? []) {
        switch (mark.type) {
          case 'bold':
            html = `<strong>${html}</strong>`
            break
          case 'italic':
            html = `<em>${html}</em>`
            break
          case 'strike':
            html = `<s>${html}</s>`
            break
          case 'code':
            html = `<code>${html}</code>`
            break
          case 'link': {
            const href = typeof mark.attrs?.href === 'string' ? mark.attrs.href : ''
            if (!href) break
            const external = /^https?:\/\//i.test(href) && !href.includes('indushydraulics.com')
            html = `<a href="${escapeHtml(href)}"${
              external ? ' target="_blank" rel="noopener noreferrer"' : ''
            }>${html}</a>`
            break
          }
          default:
            break
        }
      }
      return html
    })
    .join('')
}

function plainText(nodes: EditorNode[]): string {
  return nodes
    .map((n) => (typeof n.text === 'string' ? n.text : plainText(n.content ?? [])))
    .join('')
}

function stringAttr(node: EditorNode, key: string): string | null {
  const value = node.attrs?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isBlankFragment(html: string): boolean {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0
}

/** Kebab-case, matching the `anchor` pattern the block schema enforces. */
export function slugifyAnchor(title: string): string {
  const full = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  // Cut back to a word boundary rather than mid-word: an anchor is a URL
  // fragment a reader can see, and `…accounts-for-a-large-sha` reads as a
  // truncation bug even though it works.
  const cut = full.slice(0, 80)
  const slug = (full.length > 80 && cut.includes('-') ? cut.slice(0, cut.lastIndexOf('-')) : cut)
    .replace(/-+$/g, '')
  // The schema rejects an empty anchor, and two headings of pure punctuation
  // would both produce one. `section` is a valid fallback that stays unique
  // through `uniqueAnchor`.
  return slug || 'section'
}

/**
 * Anchors are `id`s and TOC link targets. A duplicate silently sends every
 * link to the first match, so the second occurrence is suffixed.
 */
function uniqueAnchor(base: string, used: Set<string>): string {
  const clean = slugifyAnchor(base)
  if (!used.has(clean)) {
    used.add(clean)
    return clean
  }
  let n = 2
  while (used.has(`${clean}-${n}`)) n += 1
  const next = `${clean}-${n}`
  used.add(next)
  return next
}
