import { pageLinkHref, type PageLinkBlock } from '@indus/domain'
import LinkCard from './LinkCard'

const KIND_LABEL: Record<PageLinkBlock['kind'], string> = {
  market: 'Market',
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

  return <LinkCard href={pageLinkHref(block)} eyebrow={KIND_LABEL[block.kind]} label={block.label} blurb={block.blurb} />
}
