import type { ReactNode } from 'react'

/** Caption under a figure, diagram or video: optional "Fig. 1" prefix in mono, then the text. */
export default function FigureCaption({
  prefix,
  caption,
}: {
  prefix?: string | null | undefined
  caption: ReactNode
}) {
  return (
    <figcaption className="mt-2.5 flex gap-2.5 text-[13.5px] leading-[1.5] text-ih-muted">
      {prefix ? (
        <b className="whitespace-nowrap pt-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-ih-ink-2">
          {prefix}
        </b>
      ) : null}
      <span>{caption}</span>
    </figcaption>
  )
}
