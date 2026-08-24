import Link from 'next/link'
import { pageLinkHref, type PageLinkBlock } from '@indus/domain'

const KIND_LABEL: Record<PageLinkBlock['kind'], string> = {
  market: 'Export market',
  service: 'Service',
  industry: 'Industry',
}

/**
 * Link from an article out to a market, service or industry page.
 *
 * The URL is derived from `kind` by `pageLinkHref` rather than stored, so a
 * route change is one edit rather than a search-and-replace across every
 * article body.
 *
 * `livePageLinks` carries the targets that actually exist, checked when the
 * page resolved the article. An unpublished service or a renamed market yields
 * nothing here — same rule as every other link block: a gap, never a 404.
 */
export default function PageLinkBlockView({
  block,
  livePageLinks,
}: {
  block: PageLinkBlock
  livePageLinks: Set<string>
}) {
  if (!livePageLinks.has(`${block.kind}:${block.slug}`)) return null

  return (
    <Link
      href={pageLinkHref(block)}
      className="border-ih-border bg-ih-surface-2 hover:border-ih-accent group my-6 flex items-center justify-between gap-4 rounded-lg border px-5 py-4 transition-colors"
    >
      <div className="min-w-0">
        <p className="mono text-ih-muted mb-1 text-[10.5px] uppercase tracking-[0.12em]">
          {KIND_LABEL[block.kind]}
        </p>
        <p className="text-ih-ink group-hover:text-ih-accent text-[15px] font-medium">
          {block.label}
        </p>
        {block.blurb && (
          <p className="text-ih-muted mt-0.5 text-[13.5px] leading-[1.5]">{block.blurb}</p>
        )}
      </div>
      <span aria-hidden="true" className="mono text-ih-accent shrink-0 text-[14px]">
        →
      </span>
    </Link>
  )
}
