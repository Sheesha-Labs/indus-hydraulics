import { cn } from '../lib/cn'
import type { HighlightProps } from './types'

/**
 * Assistant kit `ka-hv`: the matched text in a <mark> (mark ground, radius 2, 1px mark-line outline);
 * active (the span a Why? link opened) = highlight-on ground with a 2px accent outline. Only the first
 * occurrence of `match` is marked; a match that is not in the text renders the text unmarked. Shared.
 */
export default function Highlight({ text, match, active = false }: HighlightProps) {
  const at = match ? text.indexOf(match) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <mark
        data-part="highlight"
        data-state={active ? 'on' : 'off'}
        className={cn(
          'rounded-io-paper px-0.5 text-inherit',
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
