import { cn } from '../lib/cn'
import type { HighlightProps } from './types'

/**
 * Assistant kit `ka-hv`: the matched text in a <mark> (mark ground, radius 2, 1px mark-line outline);
 * active (the span a Why? link opened) = highlight-on ground with a 2px accent outline. Only the first
 * occurrence of `match` (or the one at `at`) is marked, with a visually hidden "matched text" label; a match that is not in the text renders the text unmarked. Shared.
 */
export default function Highlight({ text, match, active = false, at: given }: HighlightProps) {
  const at =
    given !== undefined && match && text.slice(given, given + match.length) === match
      ? given
      : match
        ? text.indexOf(match)
        : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark
        data-part="highlight"
        data-state={active ? 'on' : 'off'}
        className={cn(
          // The accessible label "matched text" is generated content: read by screen readers, not part of the
          // text a person copies.
          "rounded-io-paper px-0.5 text-inherit before:sr-only before:content-['matched_text:_']",
          active
            ? 'bg-io-highlight-on outline-io-accent outline-2'
            : 'bg-io-mark outline-io-mark-line outline-1'
        )}
      >
        {match}
      </mark>
      {text.slice(at + match.length)}
    </>
  )
}
