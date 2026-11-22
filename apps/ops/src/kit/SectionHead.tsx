interface SectionHeadProps {
  crumb: string
  title: string
  text?: string
}

/**
 * The sheets' section head (Shell Kit `SectionHead`). The Shell kit is built in S02; the specimen keeps
 * this copy so the S01 sheets can be compared now. S02 replaces it with the kit part.
 */
export function SectionHead({ crumb, title, text }: SectionHeadProps) {
  return (
    <div className="flex max-w-[860px] flex-col gap-1.5">
      <span className="io-eyebrow">{crumb}</span>
      <h2 className="io-display text-io-section text-io-ink">{title}</h2>
      {text ? <p className="text-io-ink-2 text-[14px] leading-[1.55] text-pretty">{text}</p> : null}
    </div>
  )
}
