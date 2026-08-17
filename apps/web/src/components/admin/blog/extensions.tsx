import { Node, mergeAttributes } from '@tiptap/core'
import Heading from '@tiptap/extension-heading'
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, Trash2 } from 'lucide-react'
import type { BlogBlockInput } from '@indus/domain'
import { describeBlogBlock } from './block-summary'
import { blockForm } from './block-fields'
import BlockFormDialog from './BlockFormDialog'

/**
 * The three node types the article body needs beyond StarterKit's prose.
 *
 * Each one exists so a stored block survives a round trip through the editor.
 * The rule they all follow: whatever `blocksToEditorHtml` writes, this node's
 * `parseHTML` must read back, and `renderHTML` must write the same shape again
 * — otherwise opening an article and saving it, without touching anything,
 * changes it.
 */

// ── section heading (h2) ──────────────────────────────────────────────────

/**
 * StarterKit's Heading plus an `anchor` attribute on level 2.
 *
 * A `section_head` block's anchor is a published URL fragment: the sticky
 * table of contents links to it, and so does anything outside the site that
 * has deep-linked into the article. Re-deriving it from the heading text on
 * every save would break those links the first time someone fixes a typo, so
 * the anchor travels with the node and is only derived when there isn't one.
 */
export const SectionHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      anchor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-anchor'),
        renderHTML: (attributes: Record<string, unknown>) =>
          attributes.anchor ? { 'data-anchor': attributes.anchor as string } : {},
      },
    }
  },
})

// ── lead paragraph ────────────────────────────────────────────────────────

/**
 * The opening paragraph, which the article renders at 22px with a drop cap.
 *
 * It is a distinct node rather than a mark or a class because it is a distinct
 * block type in storage. Modelling it as "the first paragraph" instead would
 * mean an author could not open with a section heading, and moving a paragraph
 * would silently change its typography.
 */
export const LeadParagraph = Node.create({
  name: 'leadParagraph',
  group: 'block',
  content: 'inline*',
  // Above StarterKit's paragraph (50). Both match a `<p>`, and at equal
  // priority the plain paragraph wins — which quietly turned every stored
  // `lead` block into a `paragraph` on the way in, and back out again on save.
  priority: 1100,
  parseHTML() {
    return [{ tag: 'p[data-lead]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes, { 'data-lead': '', class: 'ih-editor-lead' }), 0]
  },
})

// ── figure ────────────────────────────────────────────────────────────────

export type FigureAttributes = {
  storagePath: string | null
  /** Resolved preview URL, for the editor's own `<img>`. Not persisted. */
  previewUrl: string | null
  captionPrefix: string | null
  placeholderLabel: string | null
  aspectRatio: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figureImage: {
      setFigureImage: (attrs: Partial<FigureAttributes> & { caption?: string }) => ReturnType
    }
    structuredBlock: {
      setStructuredBlock: (data: BlogBlockInput) => ReturnType
    }
  }
}

/**
 * An image with a caption.
 *
 * The caption is the node's *content* (`inline*`) rather than an attribute, so
 * ProseMirror edits it natively — no node view, and the caret behaves the way
 * it does everywhere else in the document.
 *
 * What is stored is the media asset's `storagePath`, never a resolved URL. The
 * URL is rebuilt from the path at render time (`mediaUrl`), so it survives the
 * bucket host changing; a stored URL would not.
 */
export const FigureImage = Node.create({
  name: 'figureImage',
  group: 'block',
  content: 'inline*',
  draggable: true,
  // Stops a backspace at the start of a caption from merging the figure into
  // the paragraph above it, and keeps a selection from spanning in or out.
  isolating: true,

  addAttributes() {
    return {
      storagePath: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-storage-path'),
        renderHTML: (attributes) =>
          attributes.storagePath ? { 'data-storage-path': attributes.storagePath as string } : {},
      },
      captionPrefix: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-caption-prefix'),
        renderHTML: (attributes) =>
          attributes.captionPrefix
            ? { 'data-caption-prefix': attributes.captionPrefix as string }
            : {},
      },
      placeholderLabel: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-placeholder-label'),
        renderHTML: (attributes) =>
          attributes.placeholderLabel
            ? { 'data-placeholder-label': attributes.placeholderLabel as string }
            : {},
      },
      aspectRatio: {
        default: '16/9',
        parseHTML: (element) => element.getAttribute('data-aspect-ratio') ?? '16/9',
        renderHTML: (attributes) => ({ 'data-aspect-ratio': attributes.aspectRatio as string }),
      },
      /**
       * Resolved preview URL. Rendered as the `<img src>` inside the editor so
       * the author sees the picture, and deliberately NOT part of what the
       * serialiser reads — `storagePath` is the durable identity.
       */
      previewUrl: {
        default: null,
        parseHTML: (element) => element.querySelector('img')?.getAttribute('src') ?? null,
        renderHTML: () => ({}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-figure-image]', contentElement: 'figcaption' }]
  },

  renderHTML({ HTMLAttributes, node }) {
    const src = node.attrs.previewUrl as string | null
    return [
      'figure',
      mergeAttributes(HTMLAttributes, { 'data-figure-image': '', class: 'ih-editor-figure' }),
      src
        ? ['img', { src, alt: '', draggable: 'false', contenteditable: 'false' }]
        : ['div', { class: 'ih-editor-figure__empty', contenteditable: 'false' }, 'No image'],
      ['figcaption', 0],
    ]
  },

  addCommands() {
    return {
      setFigureImage:
        ({ caption, ...attrs }) =>
        ({ state, commands }) => {
          // Insert AT a position rather than into the selection. A plain
          // `insertContent` replaces whatever is selected, and when the
          // article opens with a structured block the editor's default
          // selection is that node — so inserting an image silently deleted
          // the article's key takeaways. `selection.to` is the point after a
          // selected node, and the caret position when nothing is selected.
          const { selection } = state
          const at = selection.empty ? selection.from : selection.to
          return commands.insertContentAt(at, {
            type: this.name,
            attrs,
            content: caption ? [{ type: 'text', text: caption }] : undefined,
          })
        },
    }
  },
})

// ── structured block ──────────────────────────────────────────────────────

/**
 * An opaque carrier for every block type that is not prose — comparison
 * tables, FAQ sets, product embeds, callouts and the rest.
 *
 * It holds the block's JSON verbatim in an attribute and renders a summary
 * card. That is what makes the editor safe to open on an existing article: a
 * block the editor has no form for is preserved, moveable and deletable rather
 * than quietly dropped on the next save.
 */
export const StructuredBlock = Node.create({
  name: 'structuredBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      data: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-json')
          if (!raw) return null
          try {
            return JSON.parse(raw) as BlogBlockInput
          } catch {
            // A corrupt attribute means one card is lost, not the article.
            return null
          }
        },
        renderHTML: (attributes) =>
          attributes.data ? { 'data-json': JSON.stringify(attributes.data) } : {},
      },
      blockType: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-blog-block'),
        renderHTML: (attributes) =>
          attributes.blockType ? { 'data-blog-block': attributes.blockType as string } : {},
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-blog-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'ih-editor-block' })]
  },

  addCommands() {
    return {
      setStructuredBlock:
        (data) =>
        ({ state, commands }) => {
          // Inserted AT a position, never into the selection — the same
          // reasoning as the figure: with a card selected, a plain insert
          // replaces it.
          const { selection } = state
          const at = selection.empty ? selection.from : selection.to
          return commands.insertContentAt(at, {
            type: this.name,
            attrs: { data, blockType: data.type },
          })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(StructuredBlockCard)
  },
})

/**
 * The card an author actually sees in place of a structured block.
 *
 * It names the block and summarises its content — "Comparison table · 4
 * columns · 6 rows" — so the body reads as an article rather than a row of
 * anonymous grey boxes. Editing the fields is not wired up yet; the card is
 * still selectable, draggable and deletable, which is what keeps the block
 * under the author's control in the meantime.
 */
function StructuredBlockCard({ node, deleteNode, selected, updateAttributes }: NodeViewProps) {
  const [editing, setEditing] = useState(false)
  const data = node.attrs.data as BlogBlockInput | null
  const summary = describeBlogBlock(data)
  // A block with no form is carry-through only — see block-fields.ts for why
  // the service-case shapes deliberately have none.
  const spec = blockForm(data?.type)

  return (
    <NodeViewWrapper
      className={`my-4 flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
        selected ? 'border-ih-accent bg-ih-accent-soft' : 'border-ih-border bg-ih-surface-2'
      }`}
      data-drag-handle
    >
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ih-accent">
          {summary.label}
        </div>
        <div className="mt-1 truncate text-[13px] text-ih-ink-2">{summary.detail}</div>
        {!spec && (
          <div className="mt-1.5 text-[11px] text-ih-muted-2">
            This build has no form for a block of this type — it is carried through unchanged.
            Drag to move it, or delete it.
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {spec && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${summary.label} block`}
            title={`Edit ${summary.label} block`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ih-muted transition-colors hover:bg-ih-surface hover:text-ih-accent"
          >
            <Pencil size={14} strokeWidth={1.7} />
          </button>
        )}
        <button
          type="button"
          onClick={deleteNode}
          aria-label={`Delete ${summary.label} block`}
          title={`Delete ${summary.label} block`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ih-muted transition-colors hover:bg-ih-danger-soft hover:text-ih-danger"
        >
          <Trash2 size={14} strokeWidth={1.7} />
        </button>
      </div>

      {/*
        Portalled to the body, NOT rendered in place.

        This card lives inside the editor's contenteditable, and ProseMirror
        owns that DOM: a click inside the dialog moves the selection, the node
        view re-renders, and the dialog's React state goes with it — the form
        closed on the first click every time, discarding whatever had been
        typed. Outside the editable, ProseMirror never sees the events at all.
      */}
      {editing && spec && data
        ? createPortal(
            <BlockFormDialog
              spec={spec}
              value={data}
              onCancel={() => setEditing(false)}
              onSave={(next) => {
                // `blockType` rides alongside so the parse rule can name the
                // block before its JSON is read; the two stay in step.
                updateAttributes({ data: next, blockType: next.type })
                setEditing(false)
              }}
            />,
            document.body,
          )
        : null}
    </NodeViewWrapper>
  )
}
