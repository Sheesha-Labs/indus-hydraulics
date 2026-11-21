import Tag from '../status/Tag'
import type { AssistantNoteProps } from './types'

/**
 * Mail kit `km-an`: what the Assistant did with this email. p 10×12, r 8, accent wash, 12.5/1.5 ink-2; the
 * ASSISTANT tag (Status `Tag kind="assistant"`), the note, and an optional "… →" link in accent 500.
 */
export default function AssistantNote({ children, link }: AssistantNoteProps) {
  return (
    <div
      data-part="assistant-note"
      className="rounded-io-8 bg-io-accent-wash text-io-ink-2 flex w-full items-start gap-2.5 px-3 py-2.5 text-[12.5px] leading-[1.5]"
    >
      <Tag kind="assistant">Assistant</Tag>
      <span className="flex-1">{children}</span>
      {link ? (
        <a
          href={link.href}
          {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-io-accent hover:text-io-accent-hover io-focus rounded-io-tag font-medium whitespace-nowrap"
        >
          {link.label} <span aria-hidden="true">→</span>
        </a>
      ) : null}
    </div>
  )
}
