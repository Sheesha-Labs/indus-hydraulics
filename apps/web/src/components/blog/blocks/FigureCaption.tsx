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
    <figcaption className="text-ih-muted mt-2.5 flex gap-2.5 text-[13.5px] leading-[1.5]">
      {prefix ? (
        <b className="text-ih-ink-2 pt-0.5 font-mono text-[11px] font-medium tracking-[0.06em] whitespace-nowrap uppercase">
          {prefix}
        </b>
      ) : null}
      <span>{caption}</span>
    </figcaption>
  )
}
