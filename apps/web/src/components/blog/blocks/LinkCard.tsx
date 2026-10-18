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
      className="group relative flex max-w-[640px] flex-col gap-1.5 rounded-lg border border-ih-border bg-ih-surface py-5 pl-[22px] pr-[52px] transition-colors duration-150 hover:border-ih-accent motion-reduce:transition-none"
    >
      <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-ih-muted">{eyebrow}</span>
      <span className="text-[17px] font-semibold tracking-[-0.01em] text-ih-ink group-hover:text-ih-accent">{label}</span>
      {blurb && <span className="text-[14px] leading-[1.55] text-ih-ink-2">{blurb}</span>}
      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-ih-accent">
        <ArrowRightIcon />
      </span>
    </Link>
  )
}
