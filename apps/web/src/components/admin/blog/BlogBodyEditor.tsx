'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Blocks,
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
  Type,
  Undo2,
} from 'lucide-react'
import type { BlogBlockInput, BlogBlocks } from '@indus/domain'
import {
  blocksToEditorHtml,
  editorDocToBlocks,
  type EditorNode,
} from '../../../lib/blog-editor-doc'
import type { Result } from '../../../lib/result'
import { FigureImage, LeadParagraph, SectionHeading, StructuredBlock } from './extensions'
import ImageInsertDialog, { type BodyMedia } from './ImageInsertDialog'
import { BLOCK_FORMS } from './block-fields'

type Props = {
  /** Stored body blocks. Parsed server-side, so already valid. */
  initialBlocks: BlogBlocks
  /** Called with the serialised blocks after every change. */
  onChange: (blocks: BlogBlockInput[]) => void
  media: BodyMedia[]
  uploadAction: (
    formData: FormData,
  ) => Promise<
    Result<{ mediaId: string; storagePath: string; alt: string | null; originalFilename: string }>
  >
}

/**
 * The article body surface.
 *
 * It looks like a rich-text editor and stores typed blocks. Those are not in
 * tension: prose is what an author writes most of, and `paragraph` / `prose` /
 * `section_head` / `figure` blocks cover it exactly. The structured blocks —
 * comparison tables, FAQ sets, product embeds — ride along as cards inside the
 * same document, so an article is one thing to scroll through rather than a
 * text box plus a list of blocks somewhere else.
 *
 * The editor is uncontrolled after mount: `initialBlocks` seeds it once, and
 * every subsequent change flows outward through `onChange`. Feeding state back
 * in on each keystroke would move the caret to the end of the document on
 * every character.
 */
export default function BlogBodyEditor({ initialBlocks, onChange, media, uploadAction }: Props) {
  const [library, setLibrary] = useState<BodyMedia[]>(media)
  const [imageOpen, setImageOpen] = useState(false)
  // Held in a ref so the editor's `onUpdate` closure never goes stale — it is
  // created once, and a state-captured callback would keep calling the first
  // render's version.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Levels 2 and 3 only: the article's own <h1> is the title, and an h4
        // in a 900-word piece is a structure problem, not a formatting one.
        heading: false,
        link: false,
        horizontalRule: false,
      }),
      SectionHeading.configure({ levels: [2, 3] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      LeadParagraph,
      FigureImage,
      StructuredBlock,
    ],
    content: blocksToEditorHtml(initialBlocks) || '<p></p>',
    editorProps: {
      attributes: {
        class: 'ih-editor min-h-[460px] px-5 py-4 text-[15px] leading-[1.7] focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      onChangeRef.current(editorDocToBlocks(editor.getJSON() as EditorNode))
    },
    // Required in the App Router: rendering the editor during SSR hydrates
    // against markup the server never produced.
    immediatelyRender: false,
  })

  // Publish the starting value once, so a save that touches nothing else does
  // not write an empty body.
  useEffect(() => {
    if (!editor) return
    onChangeRef.current(editorDocToBlocks(editor.getJSON() as EditorNode))
  }, [editor])

  const insertFigure = useCallback(
    (figure: {
      storagePath: string
      previewUrl: string
      caption: string
      captionPrefix: string | null
      aspectRatio: string
    }) => {
      editor
        ?.chain()
        .focus()
        .setFigureImage({
          storagePath: figure.storagePath,
          previewUrl: figure.previewUrl,
          captionPrefix: figure.captionPrefix,
          aspectRatio: figure.aspectRatio,
          caption: figure.caption,
        })
        .run()
    },
    [editor],
  )

  return (
    <div className="overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
      <Toolbar
        editor={editor}
        onInsertImage={() => setImageOpen(true)}
        onInsertBlock={(type) => {
          const spec = BLOCK_FORMS.find((f) => f.type === type)
          if (!spec) return
          editor?.chain().focus().setStructuredBlock(spec.template()).run()
        }}
      />
      <EditorContent editor={editor} />
      <ImageInsertDialog
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        media={library}
        uploadAction={uploadAction}
        onUploaded={(m) => setLibrary((cur) => [m, ...cur])}
        onInsert={insertFigure}
      />
    </div>
  )
}

function Toolbar({
  editor,
  onInsertImage,
  onInsertBlock,
}: {
  editor: Editor | null
  onInsertImage: () => void
  onInsertBlock: (type: string) => void
}) {
  if (!editor) {
    return <div className="h-9 border-b border-ih-border bg-ih-bg" aria-hidden />
  }

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

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-ih-border bg-ih-bg px-2 py-1.5">
      <Btn
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={13} strokeWidth={1.9} />
      </Btn>
      <Btn
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={13} strokeWidth={1.9} />
      </Btn>
      <Divider />
      <Btn
        label="Section heading"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={13} strokeWidth={1.9} />
      </Btn>
      <Btn
        label="Sub-heading"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={13} strokeWidth={1.9} />
      </Btn>
      <Btn
        label="Opening paragraph (drop cap)"
        active={editor.isActive('leadParagraph')}
        onClick={() =>
          editor
            .chain()
            .focus()
            .setNode(editor.isActive('leadParagraph') ? 'paragraph' : 'leadParagraph')
            .run()
        }
      >
        <Type size={13} strokeWidth={1.9} />
      </Btn>
      <Btn
        label="Body paragraph"
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <Pilcrow size={13} strokeWidth={1.9} />
      </Btn>
      <Divider />
      <Btn
        label="Bulleted list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={13} strokeWidth={1.9} />
      </Btn>
      <Btn
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={13} strokeWidth={1.9} />
      </Btn>
      <Btn
        label="Quote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={13} strokeWidth={1.9} />
      </Btn>
      <Divider />
      <Btn label="Add link" active={editor.isActive('link')} onClick={setLink}>
        <LinkIcon size={13} strokeWidth={1.9} />
      </Btn>
      <Btn label="Insert image" onClick={onInsertImage}>
        <ImageIcon size={13} strokeWidth={1.9} />
      </Btn>
      <InsertBlockMenu onInsert={onInsertBlock} />
      <div className="ml-auto flex gap-0.5">
        <Btn
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 size={13} strokeWidth={1.9} />
        </Btn>
        <Btn
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 size={13} strokeWidth={1.9} />
        </Btn>
      </div>
    </div>
  )
}

/**
 * The block palette.
 *
 * A `<details>` rather than a hand-rolled dropdown: it opens on click, closes
 * on Escape and on a click outside, and is keyboard-navigable, all natively —
 * and this codebase has no dropdown primitive, so the alternative is another
 * overlay owning its own focus handling for a list of thirteen links.
 */
function InsertBlockMenu({ onInsert }: { onInsert: (type: string) => void }) {
  return (
    <details className="relative">
      <summary
        className="flex h-7 cursor-pointer list-none items-center gap-1.5 rounded-md px-2 text-[12px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2"
        title="Insert a block"
      >
        <Blocks size={13} strokeWidth={1.9} />
        Block
      </summary>
      <div className="absolute left-0 top-8 z-20 max-h-[320px] w-[260px] overflow-y-auto rounded-md border border-ih-border bg-ih-surface py-1 shadow-lg">
        {BLOCK_FORMS.map((spec) => (
          <button
            key={spec.type}
            type="button"
            onMouseDown={(e) => {
              // The click closes the <details>, which would otherwise blur the
              // editor and drop the selection before the insert runs.
              e.preventDefault()
              onInsert(spec.type)
              ;(e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute(
                'open',
              )
            }}
            className="block w-full px-3 py-1.5 text-left text-[12.5px] text-ih-ink-2 transition-colors hover:bg-ih-surface-2 hover:text-ih-ink"
          >
            {spec.label}
          </button>
        ))}
      </div>
    </details>
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
