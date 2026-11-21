import Link from 'next/link'
import { ArrowRightIcon } from '../../designed/icons'

/**
 * The card both `category_link` and `page_link` render: an eyebrow naming
 * where the link goes, the author's label, an optional blurb, and an arrow.
 * One real <a href> — these blocks carry the article's internal-link structure.
 */
export default function LinkCard({
  href,
  eyebrow,
  label,
  blurb,
}: {
  href: string
  eyebrow: string
  label: string
  blurb?: string | null | undefined
}) {
  return (
    <Link
      href={href}
      className="group border-ih-border bg-ih-surface hover:border-ih-accent relative flex max-w-[640px] flex-col gap-1.5 rounded-lg border py-5 pr-[52px] pl-[22px] transition-colors duration-150 motion-reduce:transition-none"
    >
      <span className="text-ih-muted font-mono text-[10.5px] tracking-[0.12em] uppercase">
        {eyebrow}
      </span>
      <span className="text-ih-ink group-hover:text-ih-accent text-[17px] font-semibold tracking-[-0.01em]">
        {label}
      </span>
      {blurb && <span className="text-ih-ink-2 text-[14px] leading-[1.55]">{blurb}</span>}
      <span className="text-ih-accent absolute top-1/2 right-5 -translate-y-1/2">
        <ArrowRightIcon />
      </span>
    </Link>
  )
}
