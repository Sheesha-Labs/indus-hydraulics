'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import {
  Bold,
  Code,
  Columns3,
  FileCode2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Rows3,
  Table as TableIcon,
  Undo2,
} from 'lucide-react'

import { toEditorHtml, toStoredHtml } from '../../../lib/product-rich-text'
import { richTextExtensions } from './schema'

type Props = {
  /** The stored HTML, exactly as it sits in the database. */
  value: string
  /** Called with stored-shape HTML after every change. */
  onChange: (html: string) => void
  /** Soft ceiling shown in the footer; matches the server-side `max()`. */
  maxLength?: number
  minHeight?: number
  ariaLabel?: string
}

/**
 * The catalogue's rich-text surface — the admin's answer to editing HTML by
 * hand in a textarea.
 *
 * It is a WYSIWYG editor over HTML, not over Markdown: `descriptionLong` is
 * rendered into the product page with `dangerouslySetInnerHTML`, so HTML is
 * what the field has always held, whatever the old "Markdown supported" hint
 * claimed. `lib/product-rich-text.ts` documents the two shapes that need
 * moving in and out around the editor.
 *
 * The source view is not a debug affordance. A description can carry markup
 * this schema does not model, and the honest answer to that is to let someone
 * see and fix the markup rather than to silently rewrite it.
 */
/**
 * `useSyncExternalStore` as a hydration probe: the server snapshot is false and
 * the client snapshot is true, so the first client render matches the server
 * and the second one has a DOM. An effect that called `setState` would do the
 * same job, and is what the React compiler's lint rule exists to discourage.
 */
const subscribeToNothing = () => () => {}
const onClient = () => true
const onServer = () => false

export default function RichTextEditor(props: Props) {
  // The editor is browser-only twice over: ProseMirror needs a live document,
  // and `toEditorHtml` parses the stored markup with `DOMParser`, which does
  // not exist in the Next.js server runtime. Rendering the body only after
  // hydration is what makes the component safe to drop anywhere, rather than
  // depending on every call site remembering `dynamic(…, { ssr: false })`.
  const mounted = useSyncExternalStore(subscribeToNothing, onClient, onServer)

  if (!mounted) {
    return (
      <div
        className="animate-pulse rounded-lg border border-ih-border bg-ih-surface-2"
        style={{ height: (props.minHeight ?? 420) + 76 }}
        aria-hidden
      />
    )
  }
  return <Editable {...props} />
}

function Editable({
  value,
  onChange,
  maxLength = 20000,
  minHeight = 420,
  ariaLabel = 'Rich text editor',
}: Props) {
  const [showSource, setShowSource] = useState(false)
  const [source, setSource] = useState(value)

  // Held in a ref so the editor's `onUpdate` closure never goes stale: the
  // editor is created once and would otherwise keep calling the first render's
  // callback.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Seeded once, never fed back in. Pushing `value` into the editor on every
  // keystroke would move the caret to the end of the document on every
  // character typed.
  const [initialContent] = useState(() => toEditorHtml(value) || '<p></p>')

  const editor = useEditor({
    extensions: richTextExtensions,
    content: initialContent,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        class: `ih-editor px-5 py-4 text-[15px] leading-[1.7] focus:outline-none`,
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate({ editor }) {
      onChangeRef.current(toStoredHtml(editor.getHTML()))
    },
    // Required in the App Router: rendering the editor during SSR hydrates
    // against markup the server never produced.
    immediatelyRender: false,
    // TipTap 3 defaults this to false. The toolbar reads `isActive` out of
    // render, so without it the buttons never light up and the table controls
    // never appear. A product description is a few thousand characters; the
    // re-render this costs per keystroke is not measurable here.
    shouldRerenderOnTransaction: true,
  })

  const openSource = useCallback(() => {
    if (editor) setSource(toStoredHtml(editor.getHTML()))
    setShowSource(true)
  }, [editor])

  const closeSource = useCallback(() => {
    setShowSource(false)
    if (!editor) return
    // `emitUpdate: false` — the round-trip through the schema is what decides
    // the stored value, and it is published explicitly on the next line so a
    // source edit that the schema normalises still reaches the form.
    editor.commands.setContent(toEditorHtml(source) || '<p></p>', { emitUpdate: false })
    onChangeRef.current(toStoredHtml(editor.getHTML()))
  }, [editor, source])

  const length = showSource ? source.length : value.length
  const over = length > maxLength

  return (
    <div className="overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
      <Toolbar
        editor={editor}
        showSource={showSource}
        onToggleSource={() => (showSource ? closeSource() : openSource())}
      />

      {showSource ? (
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          aria-label={`${ariaLabel} — HTML source`}
          className="w-full resize-y bg-ih-surface px-5 py-4 font-mono text-[12.5px] leading-relaxed text-ih-ink-2 focus:outline-none"
          style={{ minHeight }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      <div className="flex items-center justify-between gap-3 border-t border-ih-border bg-ih-bg px-3 py-1.5">
        <span className="text-[11px] text-ih-muted-2">
          {showSource
            ? 'Editing the HTML directly. Switch back to check it still reads right.'
            : 'Formatting is saved as HTML — what you see here is what the product page shows.'}
        </span>
        <span className={`font-mono text-[11px] ${over ? 'text-ih-danger' : 'text-ih-muted-2'}`}>
          {length.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

/**
 * Which buttons are lit, and whether the caret is in a table.
 *
 * Read fresh on every render, which only works because the editor is created
 * with `shouldRerenderOnTransaction: true`. TipTap 3 defaults that to FALSE —
 * a deliberate performance change from 2.x — and with the default nothing in
 * this toolbar ever lights up and the table controls never appear, because
 * moving the caret into a table is a transaction, not a React state change.
 */
function toolbarState(editor: Editor) {
  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    code: editor.isActive('code'),
    heading: editor.isActive('heading', { level: 2 }),
    subheading: editor.isActive('heading', { level: 3 }),
    paragraph: editor.isActive('paragraph', { variant: null }),
    sourceNote: editor.isActive('paragraph', { variant: 'source-note' }),
    bulletList: editor.isActive('bulletList'),
    orderedList: editor.isActive('orderedList'),
    blockquote: editor.isActive('blockquote'),
    link: editor.isActive('link'),
    inTable: editor.isActive('table'),
    caption: (editor.getAttributes('table').dataCaption as string | null) ?? '',
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  }
}

function Toolbar({
  editor,
  showSource,
  onToggleSource,
}: {
  editor: Editor | null
  showSource: boolean
  onToggleSource: () => void
}) {
  if (!editor) {
    return <div className="h-10 border-b border-ih-border bg-ih-bg" aria-hidden />
  }

  const state = toolbarState(editor)

  function setLink() {
    if (!editor) return
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link URL', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  function insertImage() {
    if (!editor) return
    const src = window.prompt('Image URL (https://…)')?.trim()
    if (!src) return
    const alt = window.prompt('Alt text — what the picture shows, for search and screen readers')
    editor
      .chain()
      .focus()
      .setImage({ src, alt: alt?.trim() || undefined })
      .run()
  }

  return (
    <div className="border-b border-ih-border bg-ih-bg">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <Btn
          label="Bold"
          disabled={showSource}
          active={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Italic"
          disabled={showSource}
          active={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Code"
          disabled={showSource}
          active={state.code}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code size={13} strokeWidth={1.9} />
        </Btn>
        <Divider />
        <Btn
          label="Heading"
          disabled={showSource}
          active={state.heading}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Sub-heading"
          disabled={showSource}
          active={state.subheading}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Body paragraph"
          disabled={showSource}
          active={state.paragraph}
          onClick={() =>
            editor.chain().focus().setParagraph().updateAttributes('paragraph', { variant: null }).run()
          }
        >
          <Pilcrow size={13} strokeWidth={1.9} />
        </Btn>
        <TextBtn
          label="Mark this paragraph as the source note"
          disabled={showSource}
          active={state.sourceNote}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setParagraph()
              .updateAttributes('paragraph', { variant: state.sourceNote ? null : 'source-note' })
              .run()
          }
        >
          Source
        </TextBtn>
        <Divider />
        <Btn
          label="Bulleted list"
          disabled={showSource}
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Numbered list"
          disabled={showSource}
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Quote"
          disabled={showSource}
          active={state.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={13} strokeWidth={1.9} />
        </Btn>
        <Divider />
        <Btn
          label="Add link"
          disabled={showSource}
          active={state.link}
          onClick={setLink}
        >
          <LinkIcon size={13} strokeWidth={1.9} />
        </Btn>
        <Btn label="Insert image" disabled={showSource} onClick={insertImage}>
          <ImageIcon size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Insert table"
          disabled={showSource}
          active={state.inTable}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <TableIcon size={13} strokeWidth={1.9} />
        </Btn>

        <div className="ml-auto flex items-center gap-0.5">
          <TextBtn label="Edit the HTML directly" active={showSource} onClick={onToggleSource}>
            <FileCode2 size={13} strokeWidth={1.9} />
            HTML
          </TextBtn>
          <Divider />
          <Btn
            label="Undo"
            disabled={showSource || !state.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 size={13} strokeWidth={1.9} />
          </Btn>
          <Btn
            label="Redo"
            disabled={showSource || !state.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 size={13} strokeWidth={1.9} />
          </Btn>
        </div>
      </div>

      {/* The table controls only exist while the caret is in a table. A
          permanent row of eight disabled buttons is nine tenths noise on a
          catalogue where thirteen descriptions out of 1,376 carry a table. */}
      {state.inTable && !showSource && <TableBar editor={editor} caption={state.caption} />}
    </div>
  )
}

function TableBar({ editor, caption }: { editor: Editor; caption: string }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-t border-ih-border bg-ih-surface-2 px-2 py-1.5">
      <span className="mr-1 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
        <TableIcon size={12} strokeWidth={1.9} />
        Table
      </span>
      <TextBtn label="Add a row below the caret" onClick={() => editor.chain().focus().addRowAfter().run()}>
        <Rows3 size={12} strokeWidth={1.9} />
        Add row
      </TextBtn>
      <TextBtn label="Delete the row the caret is in" onClick={() => editor.chain().focus().deleteRow().run()}>
        Delete row
      </TextBtn>
      <Divider />
      <TextBtn
        label="Add a column to the right of the caret"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <Columns3 size={12} strokeWidth={1.9} />
        Add column
      </TextBtn>
      <TextBtn
        label="Delete the column the caret is in"
        onClick={() => editor.chain().focus().deleteColumn().run()}
      >
        Delete column
      </TextBtn>
      <Divider />
      <TextBtn
        label="Turn the first row into headers, or back into ordinary cells"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        Header row
      </TextBtn>
      <TextBtn
        label="The line printed above the table"
        active={Boolean(caption)}
        onClick={() => {
          const next = window.prompt('Table caption — the line printed above the table', caption)
          if (next === null) return
          editor
            .chain()
            .focus()
            .updateAttributes('table', { dataCaption: next.trim() || null })
            .run()
        }}
      >
        {caption ? 'Edit caption' : 'Add caption'}
      </TextBtn>
      {/* The caption cannot be shown in the document itself: it lives as an
          attribute on the table until save, because TipTap's table content is
          `tableRow+` and a <caption> element has nowhere to sit. Showing it
          here is what stops it from being invisible while you work. */}
      {caption && (
        <span className="max-w-[280px] truncate text-[12px] italic text-ih-muted" title={caption}>
          “{caption}”
        </span>
      )}
      <div className="ml-auto">
        <TextBtn label="Delete the whole table" onClick={() => editor.chain().focus().deleteTable().run()}>
          Delete table
        </TextBtn>
      </div>
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-ih-border" aria-hidden />
}

function Btn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        active ? 'bg-ih-navy text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {children}
    </button>
  )
}

function TextBtn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={label}
      className={`flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] transition-colors ${
        active ? 'bg-ih-navy text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {children}
    </button>
  )
}
